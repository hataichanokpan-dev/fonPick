/**
 * Position Sizer
 *
 * Calculates position size based on risk management rules for swing trading
 */

import type {
  PositionSizeCalculatorInput,
  PositionSizeCalculatorOutput,
} from '@/types/swing-trading'

// ============================================================================
// POSITION SIZING CALCULATION
// ============================================================================

/**
 * Calculate position size based on risk per trade
 *
 * Formula:
 * Position Size = Risk Amount / Stop Loss Percentage
 * - Risk Amount = Account Value × Risk Per Trade (default: 2%)
 * - Stop Loss Percentage = |Entry Price - Stop Loss| / Entry Price
 * - Capped at 10% of portfolio to prevent over-concentration
 *
 * @param input - Calculator input parameters
 * @returns Position sizing recommendation
 */
export function calculatePositionSize(
  input: PositionSizeCalculatorInput
): PositionSizeCalculatorOutput {
  const { entryPrice, stopLoss, riskPerTrade = 0.02, accountValue = 100000 } = input

  // Default to 2% risk if not specified
  const riskPercent = Math.max(0.005, Math.min(0.05, riskPerTrade)) // 0.5% - 5% range

  // Calculate risk amount
  const riskAmount = accountValue * riskPercent

  // Calculate stop loss percentage
  const stopLossPercent = Math.abs(entryPrice - stopLoss) / entryPrice

  // Handle edge case: stop loss at or above entry price
  if (stopLossPercent <= 0) {
    return {
      percentage: 0,
      shares: 0,
      riskAmount: Number(riskAmount.toFixed(2)),
      rationale: 'Invalid stop-loss level (must be below entry price)',
    }
  }

  // Calculate position size based on risk
  const positionSize = riskAmount / stopLossPercent

  // Cap position size at 10% of portfolio (risk management rule)
  const maxPosition = accountValue * 0.10
  const finalPositionSize = Math.min(positionSize, maxPosition)

  // Calculate position percentage
  const positionPercent = (finalPositionSize / accountValue) * 100

  // Calculate number of shares
  const shares = Math.floor(finalPositionSize / entryPrice)

  // Generate rationale
  let rationale = ''

  if (positionSize >= maxPosition) {
    rationale = `Position capped at 10% portfolio ($${finalPositionSize.toFixed(0)}) - Stop loss too wide for 2% risk`
  } else {
    rationale = `Base position size (${positionPercent.toFixed(1)}% of portfolio) with ${riskPercent * 100}% risk`
  }

  // Add stop loss context
  const slPercent = (stopLossPercent * 100).toFixed(1)
  rationale += `. SL: ${slPercent}% below entry`

  return {
    percentage: Number(positionPercent.toFixed(2)),
    shares,
    riskAmount: Number(riskAmount.toFixed(2)),
    rationale,
  }
}

/**
 * Get position size recommendation based on conviction
 *
 * @param baseSize - Base calculated position size (%)
 * @param conviction - Conviction level (1-10)
 * @returns Recommended position size (%)
 */
export function adjustPositionByConviction(
  baseSize: number,
  conviction: number
): number {
  // Conviction 1-10 scale
  // 5-7 = normal (use base size)
  // 8-10 = high conviction (increase up to 1.5x)
  // 1-4 = low conviction (decrease to 0.5x)

  let multiplier = 1.0

  if (conviction >= 8) {
    // High conviction: Increase up to 1.5x
    multiplier = 1.0 + (conviction - 7) * 0.15 // 8→1.15x, 9→1.3x, 10→1.45x
  } else if (conviction >= 5) {
    // Normal conviction: Use base size
    multiplier = 1.0
  } else {
    // Low conviction: Decrease to 0.5x-1x
    multiplier = 0.5 + (conviction / 8) // 1→0.625x, 2→0.75x, 3→0.875x, 4→1x
  }

  // Cap at 15% maximum position size
  const adjustedSize = baseSize * multiplier
  return Math.min(15, adjustedSize)
}

/**
 * Validate if position size is appropriate
 *
 * @param input - Calculator input
 * @returns Validation result
 */
export function validatePositionSize(
  input: PositionSizeCalculatorInput
): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  const { entryPrice, stopLoss, accountValue = 100000, riskPerTrade = 0.02 } = input

  // Warning 1: Stop loss too wide (>12%)
  const slPercent = Math.abs(entryPrice - stopLoss) / entryPrice * 100
  if (slPercent > 12) {
    warnings.push(
      `Stop loss very wide (${slPercent.toFixed(1)}%) - Consider reducing position size or tightening stop`
    )
  }

  // Warning 2: Risk per trade too high (>3%)
  if (riskPerTrade > 0.03) {
    warnings.push(
      `Risk per trade (${riskPerTrade * 100}%) exceeds recommended 2-3% - Consider reducing`
    )
  }

  // Warning 3: Position would be very large (>20%)
  const riskAmount = accountValue * riskPerTrade
  const positionSize = riskAmount / (slPercent / 100)
  const positionPercent = (positionSize / accountValue) * 100

  if (positionPercent > 20) {
    warnings.push(
      `Position size (${positionPercent.toFixed(1)}% of portfolio) exceeds 20% - High concentration risk`
    )
  }

  // Warning 4: Very small position (<2%)
  if (positionPercent < 2 && slPercent <= 8) {
    warnings.push(
      `Position size (${positionPercent.toFixed(1)}% of portfolio) is very small - Consider higher conviction or tighter stop`
    )
  }

  return {
    isValid: warnings.filter((w) => w.includes('exceeds')).length === 0,
    warnings,
  }
}

/**
 * Calculate pyramiding strategy
 *
 * Pyramiding = Adding to position as trade moves in favor
 *
 * @param baseShares - Base position size (shares)
 * @param levels - Number of pyramid levels (1-3)
 * @returns Pyramiding schedule
 */
export function calculatePyramiding(
  baseShares: number,
  levels: number = 2
): {
  initial: number
  adds: Array<{ atGain: number; shares: number; percentOfBase: number }>
  total: number
} {
  if (levels < 1 || levels > 3) {
    levels = 2 // Default to 2 levels
  }

  const adds: Array<{ atGain: number; shares: number; percentOfBase: number }> = []

  if (levels === 1) {
    // Single add at 5% gain
    adds.push({
      atGain: 5,
      shares: Math.floor(baseShares * 0.5), // Add 50% more
      percentOfBase: 50,
    })
  } else if (levels === 2) {
    // Two adds: at 5% and 10% gains
    adds.push({
      atGain: 5,
      shares: Math.floor(baseShares * 0.3), // Add 30% more
      percentOfBase: 30,
    })
    adds.push({
      atGain: 10,
      shares: Math.floor(baseShares * 0.2), // Add 20% more
      percentOfBase: 20,
    })
  } else {
    // Three adds: at 3%, 6%, and 10% gains
    adds.push({
      atGain: 3,
      shares: Math.floor(baseShares * 0.2), // Add 20% more
      percentOfBase: 20,
    })
    adds.push({
      atGain: 6,
      shares: Math.floor(baseShares * 0.15), // Add 15% more
      percentOfBase: 15,
    })
    adds.push({
      atGain: 10,
      shares: Math.floor(baseShares * 0.1), // Add 10% more
      percentOfBase: 10,
    })
  }

  const totalAdds = adds.reduce((sum, add) => sum + add.shares, 0)
  const total = baseShares + totalAdds

  return {
    initial: baseShares,
    adds,
    total,
  }
}

/**
 * Get scaling-out strategy
 *
 * Scaling out = Taking partial profits at levels
 *
 * @param totalShares - Total shares held
 * @returns Scaling-out schedule
 */
export function calculateScalingOut(totalShares: number): {
  tp1: { shares: number; percent: number }
  tp2: { shares: number; percent: number }
  tp3: { shares: number; percent: number }
} {
  return {
    tp1: {
      shares: Math.floor(totalShares * 0.3), // Sell 30% at TP1
      percent: 30,
    },
    tp2: {
      shares: Math.floor(totalShares * 0.3), // Sell 30% at TP2
      percent: 30,
    },
    tp3: {
      shares: Math.floor(totalShares * 0.4), // Sell 40% at TP3
      percent: 40,
    },
  }
}

/**
 * Get position sizing recommendation summary
 *
 * @param input - Calculator input
 * @returns Human-readable recommendation
 */
export function getPositionSizingSummary(
  input: PositionSizeCalculatorInput
): string {
  const result = calculatePositionSize(input)
  const validation = validatePositionSize(input)

  let summary = `Position: ${result.percentage}% of portfolio (${result.shares} shares)\n`
  summary += `Risk: $${result.riskAmount}\n`
  summary += `Rationale: ${result.rationale}`

  if (validation.warnings.length > 0) {
    summary += '\n\nWarnings:\n' + validation.warnings.join('\n')
  }

  return summary
}
