/**
 * Entry Calculator
 *
 * Calculates entry zones for swing trading based on support levels and moving averages
 */

import type {
  EntryCalculatorInput,
  EntryCalculatorOutput,
  TrendPhase,
} from '@/types/swing-trading'
import { getNearestSupport } from '@/services/historical-trend'

// ============================================================================
// ENTRY ZONE CALCULATION
// ============================================================================

/**
 * Calculate entry zone for swing trading
 *
 * Entry zone is determined by:
 * 1. Nearest support level (primary)
 * 2. Moving averages (secondary reference)
 * 3. Trend phase (adjusts entry aggressiveness)
 *
 * @param input - Calculator input parameters
 * @returns Entry zone with confidence and rationale
 */
export function calculateEntryZone(
  input: EntryCalculatorInput
): EntryCalculatorOutput {
  const { currentPrice, supportLevels, movingAverages, trendPhase } = input

  // Find nearest support level
  const nearestSupport = getNearestSupport(supportLevels, currentPrice)

  let entryMin: number
  let entryMax: number
  let confidence: number
  let rationale: string

  // Case 1: Strong support available
  if (nearestSupport && nearestSupport.strength === 'strong') {
    const supportPrice = nearestSupport.price

    // Entry zone: 0.5% below support to 1% above support
    entryMin = supportPrice * 0.995
    entryMax = supportPrice * 1.01

    confidence = 85
    rationale = `Buy near strong support at ${supportPrice.toFixed(2)}`
  }
  // Case 2: Moderate support available
  else if (nearestSupport && nearestSupport.strength === 'moderate') {
    const supportPrice = nearestSupport.price

    // Entry zone: At support to 0.5% above
    entryMin = supportPrice
    entryMax = supportPrice * 1.005

    confidence = 70
    rationale = `Buy near moderate support at ${supportPrice.toFixed(2)}`
  }
  // Case 3: Weak or no support - use MA
  else {
    const ma50 = movingAverages.ma50
    const ma20 = movingAverages.ma20

    if (ma50 && currentPrice > ma50) {
      // Uptrend with price above MA50: Enter at MA50
      entryMin = ma50 * 0.99
      entryMax = ma50 * 1.005

      confidence = 60
      rationale = `Buy near MA50 (${ma50.toFixed(2)})`
    } else if (ma20 && currentPrice > ma20) {
      // Short-term uptrend: Enter at MA20
      entryMin = ma20 * 0.99
      entryMax = ma20 * 1.005

      confidence = 50
      rationale = `Buy near MA20 (${ma20.toFixed(2)})`
    } else {
      // No clear support or MA: Enter at current price with small discount
      entryMin = currentPrice * 0.97
      entryMax = currentPrice * 0.99

      confidence = 30
      rationale = 'No clear support - enter with caution'
    }
  }

  // Adjust based on trend phase
  if (trendPhase === 'early') {
    // Early trend: Can be more aggressive, widen upper bound
    entryMax = Math.max(entryMax, entryMin * 1.02)
    confidence += 5
    rationale += ' (early trend)'
  } else if (trendPhase === 'exhausted') {
    // Exhausted trend: Be more conservative
    entryMin = Math.max(entryMin, currentPrice * 0.98)
    confidence -= 10
    rationale += ' (late trend, caution)'
  }

  // Calculate discount from current price
  const discountPercent = ((currentPrice - entryMax) / currentPrice) * 100

  // Clamp confidence
  confidence = Math.min(100, Math.max(0, confidence))

  return {
    entryZone: {
      min: Number(entryMin.toFixed(2)),
      max: Number(entryMax.toFixed(2)),
      current: Number(currentPrice.toFixed(2)),
    },
    discountPercent: Number(discountPercent.toFixed(2)),
    confidence,
    rationale,
  }
}

/**
 * Get entry urgency based on trend phase and price position
 *
 * @param currentPrice - Current market price
 * @param entryZone - Calculated entry zone
 * @param trendPhase - Current trend phase
 * @returns Urgency level (0-100)
 */
export function getEntryUrgency(
  currentPrice: number,
  entryZone: { min: number; max: number },
  trendPhase: TrendPhase
): number {
  let urgency = 50 // Base urgency

  // Price in entry zone = high urgency
  if (currentPrice >= entryZone.min && currentPrice <= entryZone.max) {
    urgency = 80
  }

  // Price below entry zone = very high urgency (opportunity)
  else if (currentPrice < entryZone.min) {
    const discount = ((entryZone.min - currentPrice) / currentPrice) * 100
    if (discount <= 2) {
      urgency = 95 // Slightly below zone
    } else if (discount <= 5) {
      urgency = 90 // Within reasonable discount
    } else {
      urgency = 70 // Larger discount, maybe waiting for better
    }
  }

  // Price above entry zone = low urgency (wait for pullback)
  else {
    const premium = ((currentPrice - entryZone.max) / currentPrice) * 100
    if (premium <= 2) {
      urgency = 40 // Slightly above, wait for pullback
    } else {
      urgency = 20 // Too extended, wait
    }
  }

  // Adjust based on trend phase
  if (trendPhase === 'early') {
    urgency += 10 // Early trend, don't wait too long
  } else if (trendPhase === 'exhausted') {
    urgency -= 15 // Late trend, be patient
  }

  return Math.min(100, Math.max(0, urgency))
}

/**
 * Get entry timing recommendation
 *
 * @param urgency - Entry urgency score (0-100)
 * @returns Timing recommendation text
 */
export function getEntryTiming(urgency: number): string {
  if (urgency >= 80) {
    return 'Enter within 1-2 trading days'
  } else if (urgency >= 60) {
    return 'Enter within 3-5 trading days'
  } else if (urgency >= 40) {
    return 'Wait for pullback to entry zone'
  } else {
    return 'Wait - current price not favorable'
  }
}

/**
 * Validate if entry setup is good
 *
 * @param input - Calculator input
 * @returns Whether entry setup is valid
 */
export function validateEntrySetup(
  input: EntryCalculatorInput
): { isValid: boolean; reason?: string } {
  const { currentPrice, supportLevels, movingAverages } = input

  // Check for uptrend
  const ma50 = movingAverages.ma50

  if (ma50 && currentPrice < ma50 * 0.95) {
    return {
      isValid: false,
      reason: 'Price too far below MA50 - downtrend, avoid entry',
    }
  }

  // Check for nearby support
  const nearestSupport = getNearestSupport(supportLevels, currentPrice)
  if (nearestSupport) {
    const distance = ((nearestSupport.price - currentPrice) / currentPrice) * 100

    if (distance < -10) {
      return {
        isValid: false,
        reason: 'Price too far below support - risky entry',
      }
    }
  }

  return { isValid: true }
}
