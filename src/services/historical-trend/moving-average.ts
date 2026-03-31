/**
 * Moving Average Calculator
 *
 * Calculates Simple Moving Averages (SMA) for swing trading analysis
 * Reuses existing functions from technical-indicators.ts
 */

import type { PriceHistoryPoint } from '@/types/stock-price-api'
import type { MAData } from '@/types/technical-chart'
import { calculateSMA } from '@/lib/technical-indicators'

// ============================================================================
// MOVING AVERAGE CALCULATIONS
// ============================================================================

/**
 * Calculate all moving averages for swing trading
 *
 * @param priceHistory - Historical price data
 * @returns Object containing MA20, MA50, and MA200 data
 */
export function calculateMovingAverages(
  priceHistory: PriceHistoryPoint[]
): {
  ma20: MAData[]
  ma50: MAData[]
  ma200: MAData[]
} {
  // Calculate 20-day SMA (short-term trend)
  const ma20 = calculateSMA(priceHistory, 20)

  // Calculate 50-day SMA (medium-term trend)
  const ma50 = calculateSMA(priceHistory, 50)

  // Calculate 200-day SMA (long-term trend)
  const ma200 = calculateSMA(priceHistory, 200)

  return { ma20, ma50, ma200 }
}

/**
 * Calculate crossover signals between moving averages
 *
 * Golden Cross: MA50 crosses above MA200 (bullish signal)
 * Death Cross: MA50 crosses below MA200 (bearish signal)
 *
 * @param maData - Object containing MA50 and MA200 data
 * @returns Object with golden cross and death cross dates
 */
export function calculateCrossOverSignals(
  maData: { ma50: MAData[]; ma200: MAData[] }
): {
  goldenCross?: string // Date when MA50 crosses above MA200
  deathCross?: string // Date when MA50 crosses below MA200
} {
  const { ma50, ma200 } = maData
  const result: {
    goldenCross?: string
    deathCross?: string
  } = {}

  // Need at least 200 days of MA50 data to compare
  if (ma50.length < 200 || ma200.length < 200) {
    return result
  }

  // Find the most recent crossover
  let lastRelationship: 'above' | 'below' | 'equal' = 'equal'

  // Start from the most recent and go backwards
  for (let i = Math.min(ma50.length - 1, ma200.length - 1); i >= 0; i--) {
    const ma50Value = ma50[i].value
    const ma200Value = ma200[i].value

    if (ma50Value > ma200Value) {
      if (lastRelationship === 'below' || lastRelationship === 'equal') {
        // Found golden cross (crossed from below/equal to above)
        result.goldenCross = ma50[i].date
        break
      }
      lastRelationship = 'above'
    } else if (ma50Value < ma200Value) {
      if (lastRelationship === 'above' || lastRelationship === 'equal') {
        // Found death cross (crossed from above/equal to below)
        result.deathCross = ma50[i].date
        break
      }
      lastRelationship = 'below'
    } else {
      lastRelationship = 'equal'
    }
  }

  return result
}

/**
 * Get the most recent moving average values
 *
 * @param maData - Object containing moving average data
 * @returns Latest values or null if not available
 */
export function getLatestMAValues(
  maData: { ma20?: MAData[]; ma50?: MAData[]; ma200?: MAData[] }
): {
  ma20?: number
  ma50?: number
  ma200?: number
} {
  const result: {
    ma20?: number
    ma50?: number
    ma200?: number
  } = {}

  if (maData.ma20 && maData.ma20.length > 0) {
    result.ma20 = maData.ma20[maData.ma20.length - 1].value
  }

  if (maData.ma50 && maData.ma50.length > 0) {
    result.ma50 = maData.ma50[maData.ma50.length - 1].value
  }

  if (maData.ma200 && maData.ma200.length > 0) {
    result.ma200 = maData.ma200[maData.ma200.length - 1].value
  }

  return result
}

/**
 * Calculate MA alignment score (0-100)
 *
 * Higher score means MAs are aligned in a bullish direction
 *
 * @param maValues - Latest MA values
 * @param currentPrice - Current market price
 * @returns Alignment score (0-100)
 */
export function calculateMAAlignment(
  maValues: { ma20?: number; ma50?: number; ma200?: number },
  currentPrice: number
): number {
  let score = 0
  let maxScore = 0

  // Check bullish alignment: Price > MA20 > MA50 > MA200
  if (maValues.ma20 !== undefined) {
    maxScore += 33
    if (currentPrice > maValues.ma20) {
      score += 33
    }
  }

  if (maValues.ma20 !== undefined && maValues.ma50 !== undefined) {
    maxScore += 33
    if (maValues.ma20 > maValues.ma50) {
      score += 33
    }
  }

  if (maValues.ma50 !== undefined && maValues.ma200 !== undefined) {
    maxScore += 34
    if (maValues.ma50 > maValues.ma200) {
      score += 34
    }
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
}
