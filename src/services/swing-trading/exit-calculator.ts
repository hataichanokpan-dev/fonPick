/**
 * Exit Calculator
 *
 * Calculates stop-loss and take-profit levels for swing trading
 */

import type {
  ExitCalculatorInput,
  ExitCalculatorOutput,
  TakeProfitLevel,
} from '@/types/swing-trading'

// ============================================================================
// STOP LOSS CALCULATION
// ============================================================================

/**
 * Calculate stop-loss level
 *
 * Priority:
 * 1. ATR-based stop (if ATR available)
 * 2. Support-based stop (if support available)
 * 3. Percentage-based stop (fallback)
 *
 * @param entryPrice - Entry price
 * @param input - Calculator input
 * @returns Stop-loss price and rationale
 */
function calculateStopLoss(
  entryPrice: number,
  input: ExitCalculatorInput
): { price: number; percentFromEntry: number; rationale: string } {
  const { atr, supportLevel } = input

  // Method 1: ATR-based stop (preferred)
  if (atr && atr > 0) {
    const atrMultiplier = 2 // 2x ATR for swing trading
    const slPrice = entryPrice - atr * atrMultiplier
    const slPercent = ((entryPrice - slPrice) / entryPrice) * 100

    return {
      price: Number(slPrice.toFixed(2)),
      percentFromEntry: Number((-slPercent).toFixed(2)),
      rationale: `ATR-based stop loss (2x ATR = ${atr.toFixed(2)})`,
    }
  }

  // Method 2: Support-based stop
  if (supportLevel && supportLevel < entryPrice) {
    const slPrice = supportLevel * 0.98 // 2% below support
    const slPercent = ((entryPrice - slPrice) / entryPrice) * 100

    return {
      price: Number(slPrice.toFixed(2)),
      percentFromEntry: Number((-slPercent).toFixed(2)),
      rationale: `Support-based stop loss (2% below support at ${supportLevel.toFixed(2)})`,
    }
  }

  // Method 3: Percentage-based fallback (8% stop)
  const slPercent = 8
  const slPrice = entryPrice * (1 - slPercent / 100)

  return {
    price: Number(slPrice.toFixed(2)),
    percentFromEntry: Number(-slPercent),
    rationale: 'Percentage-based stop loss (8% below entry)',
  }
}

// ============================================================================
// TAKE PROFIT CALCULATION
// ============================================================================

/**
 * Calculate take-profit levels based on risk-reward ratios
 *
 * Targets:
 * - TP1: 1.5x risk (conservative)
 * - TP2: 2.5x risk (target - matches 20%+ goal)
 * - TP3: 4x risk (optimistic)
 *
 * @param entryPrice - Entry price
 * @param stopLoss - Stop-loss price
 * @param targetReturn - Target return (e.g., 0.20 for 20%)
 * @returns Take-profit levels
 */
function calculateTakeProfitLevels(
  entryPrice: number,
  stopLoss: number,
  targetReturn: number
): TakeProfitLevel[] {
  const risk = entryPrice - stopLoss

  // Calculate percentage-based targets
  const tp1Pct = Math.min(targetReturn * 0.75, 0.15) // 15% conservative
  const tp2Pct = targetReturn // 20% target
  const tp3Pct = Math.max(targetReturn * 1.25, 0.25) // 25% optimistic

  // Also calculate R:R based targets
  const tp1RR = 1.5 // Conservative
  const tp2RR = 2.5 // Target
  const tp3RR = 4.0 // Optimistic

  // Use whichever is higher for each level
  const tp1Price = Math.max(
    entryPrice * (1 + tp1Pct),
    entryPrice + risk * tp1RR
  )
  const tp2Price = Math.max(
    entryPrice * (1 + tp2Pct),
    entryPrice + risk * tp2RR
  )
  const tp3Price = Math.max(
    entryPrice * (1 + tp3Pct),
    entryPrice + risk * tp3RR
  )

  return [
    {
      level: 1,
      price: Number(tp1Price.toFixed(2)),
      percentFromEntry: Number(((tp1Price - entryPrice) / entryPrice * 100).toFixed(2)),
    },
    {
      level: 2,
      price: Number(tp2Price.toFixed(2)),
      percentFromEntry: Number(((tp2Price - entryPrice) / entryPrice * 100).toFixed(2)),
    },
    {
      level: 3,
      price: Number(tp3Price.toFixed(2)),
      percentFromEntry: Number(((tp3Price - entryPrice) / entryPrice * 100).toFixed(2)),
    },
  ]
}

// ============================================================================
// RISK-REWARD CALCULATION
// ============================================================================

/**
 * Calculate risk-reward ratio
 *
 * @param stopLoss - Stop-loss price
 * @param takeProfit2 - Second take-profit (target) price
 * @param entryPrice - Entry price
 * @returns Risk-reward ratio string
 */
function calculateRiskRewardRatio(
  stopLoss: number,
  takeProfit2: number,
  entryPrice: number
): string {
  const risk = Math.abs(entryPrice - stopLoss)
  const reward = takeProfit2 - entryPrice

  if (risk === 0) {
    return 'N/A'
  }

  const rr = reward / risk

  if (rr >= 3) {
    return `1:${rr.toFixed(1)} (Excellent)`
  } else if (rr >= 2.5) {
    return `1:${rr.toFixed(1)} (Very Good)`
  } else if (rr >= 2) {
    return `1:${rr.toFixed(1)} (Good)`
  } else if (rr >= 1.5) {
    return `1:${rr.toFixed(1)} (Acceptable)`
  } else {
    return `1:${rr.toFixed(1)} (Poor)`
  }
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate exit levels for swing trading
 *
 * This is the main entry point that calculates:
 * - Stop-loss level
 * - Take-profit targets (1, 2, 3)
 * - Risk-reward ratio
 *
 * @param input - Calculator input parameters
 * @returns Complete exit plan
 */
export function calculateExitLevels(input: ExitCalculatorInput): ExitCalculatorOutput {
  const { entryPrice, targetReturn } = input

  // Calculate stop-loss
  const stopLoss = calculateStopLoss(entryPrice, input)

  // Calculate take-profit levels
  const takeProfits = calculateTakeProfitLevels(entryPrice, stopLoss.price, targetReturn)

  // Calculate risk-reward ratio (using TP2 as target)
  const riskRewardRatio = calculateRiskRewardRatio(
    stopLoss.price,
    takeProfits[1].price, // TP2 is our main target
    entryPrice
  )

  // Add labels to take-profit levels
  const labeledTakeProfits = takeProfits.map((tp) => ({
    ...tp,
    label:
      tp.level === 1
        ? 'Conservative (15%)'
        : tp.level === 2
          ? `Target (${(targetReturn * 100).toFixed(0)}%)`
          : 'Optimistic (25%+)',
  }))

  return {
    stopLoss: {
      price: stopLoss.price,
      percentFromEntry: stopLoss.percentFromEntry,
      rationale: stopLoss.rationale,
    },
    takeProfits: labeledTakeProfits,
    riskRewardRatio,
  }
}

/**
 * Validate if exit setup is acceptable
 *
 * @param input - Calculator input
 * @returns Whether setup is valid and reason
 */
export function validateExitSetup(
  input: ExitCalculatorInput
): { isValid: boolean; reason?: string } {
  const { entryPrice, supportLevel, atr } = input

  // Check if stop-loss would be too wide
  if (atr) {
    const atrSL = entryPrice - atr * 2
    const slPercent = ((entryPrice - atrSL) / entryPrice) * 100

    if (slPercent > 15) {
      return {
        isValid: false,
        reason: `ATR-based stop loss too wide (${slPercent.toFixed(1)}%) - High risk trade`,
      }
    }
  }

  // Check if there's room for take-profit
  if (supportLevel && supportLevel >= entryPrice) {
    return {
      isValid: false,
      reason: 'Support level above entry price - invalid setup',
    }
  }

  return { isValid: true }
}

/**
 * Get trailing stop recommendation
 *
 * @param currentTrend - Current trend direction
 * @returns Trailing stop recommendation
 */
export function getTrailingStopRecommendation(currentTrend: 'uptrend' | 'downtrend' | 'sideways'): {
  method: string
  trigger: string
} {
  if (currentTrend === 'uptrend') {
    return {
      method: 'Trailing Stop',
      trigger: 'Use MA20 as trailing stop after price reaches TP1',
    }
  } else if (currentTrend === 'downtrend') {
    return {
      method: 'Fixed Stop Loss',
      trigger: 'Do not use trailing stop in downtrend',
    }
  } else {
    return {
      method: 'Fixed Stop Loss',
      trigger: 'Use fixed stop loss - sideways market',
    }
  }
}
