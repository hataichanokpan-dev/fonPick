/**
 * Momentum Analyzer
 *
 * Analyzes momentum sustainability for swing trading
 */

import type { PriceHistoryPoint } from '@/types/stock-price-api'

// ============================================================================
// MOMENTUM ANALYSIS
// ============================================================================

/**
 * Calculate rate of change (ROC) over a period
 *
 * @param priceHistory - Historical price data
 * @param period - Period for ROC calculation
 * @returns ROC value as percentage
 */
function calculateROC(
  priceHistory: PriceHistoryPoint[],
  period: number
): number {
  if (priceHistory.length < period + 1) {
    return 0
  }

  const currentPrice = priceHistory[priceHistory.length - 1].close
  const pastPrice = priceHistory[priceHistory.length - 1 - period].close

  return ((currentPrice - pastPrice) / pastPrice) * 100
}

/**
 * Calculate momentum score based on price action
 *
 * @param priceHistory - Historical price data
 * @param trendDays - Days in current trend
 * @returns Momentum score (0-100)
 */
function calculateMomentumScore(
  priceHistory: PriceHistoryPoint[],
  trendDays: number
): number {
  if (priceHistory.length < 10) {
    return 50 // Neutral score for insufficient data
  }

  let score = 50 // Start at neutral

  // Recent 5-day performance
  const roc5 = calculateROC(priceHistory, 5)
  // Recent 10-day performance
  const roc10 = calculateROC(priceHistory, 10)
  // Recent 20-day performance
  const roc20 = calculateROC(priceHistory, 20)

  // Positive momentum: Recent performance > longer-term performance
  if (roc5 > roc10 && roc10 > roc20) {
    // Accelerating momentum
    score += 30
  } else if (roc5 > roc10) {
    // Recent strength
    score += 15
  } else if (roc5 < roc10 && roc10 < roc20) {
    // Decelerating momentum
    score -= 20
  }

  // Magnitude of recent move (but not too extreme)
  if (Math.abs(roc5) > 2 && Math.abs(roc5) < 8) {
    score += 15 // Healthy momentum
  } else if (Math.abs(roc5) >= 8) {
    score -= 10 // Too extended, might reverse
  }

  // Consistency: All ROCs pointing same direction
  const allPositive = roc5 > 0 && roc10 > 0 && roc20 > 0
  const allNegative = roc5 < 0 && roc10 < 0 && roc20 < 0

  if (allPositive || allNegative) {
    score += 20 // Consistent direction
  }

  // Trend duration factor
  if (trendDays <= 20) {
    score += 10 // Early trend, benefit of doubt
  } else if (trendDays > 60) {
    score -= 10 // Late trend, momentum fading
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Detect if momentum is accelerating
 *
 * @param priceHistory - Historical price data
 * @returns Whether momentum is accelerating
 */
function isMomentumAccelerating(priceHistory: PriceHistoryPoint[]): boolean {
  if (priceHistory.length < 15) {
    return false
  }

  // Compare recent 5-day rate to previous 5-day rate
  let recentGain = 0
  let previousGain = 0

  for (let i = 1; i <= 5; i++) {
    const idx = priceHistory.length - i
    const prevIdx = priceHistory.length - i - 1
    if (prevIdx >= 0) {
      recentGain += (priceHistory[idx].close - priceHistory[prevIdx].close) / priceHistory[prevIdx].close
    }
  }

  for (let i = 6; i <= 10; i++) {
    const idx = priceHistory.length - i
    const prevIdx = priceHistory.length - i - 1
    if (prevIdx >= 0) {
      previousGain += (priceHistory[idx].close - priceHistory[prevIdx].close) / priceHistory[prevIdx].close
    }
  }

  return recentGain > previousGain * 1.2 // 20% faster than previous period
}

/**
 * Detect if momentum is decelerating
 *
 * @param priceHistory - Historical price data
 * @returns Whether momentum is decelerating
 */
function isMomentumDecelerating(priceHistory: PriceHistoryPoint[]): boolean {
  if (priceHistory.length < 15) {
    return false
  }

  // Compare recent 5-day rate to previous 5-day rate
  let recentGain = 0
  let previousGain = 0

  for (let i = 1; i <= 5; i++) {
    const idx = priceHistory.length - i
    const prevIdx = priceHistory.length - i - 1
    if (prevIdx >= 0) {
      recentGain += (priceHistory[idx].close - priceHistory[prevIdx].close) / priceHistory[prevIdx].close
    }
  }

  for (let i = 6; i <= 10; i++) {
    const idx = priceHistory.length - i
    const prevIdx = priceHistory.length - i - 1
    if (prevIdx >= 0) {
      previousGain += (priceHistory[idx].close - priceHistory[prevIdx].close) / priceHistory[prevIdx].close
    }
  }

  return recentGain < previousGain * 0.8 // 20% slower than previous period
}

/**
 * Analyze momentum sustainability
 *
 * @param priceHistory - Historical price data
 * @param trendDays - Days in current trend
 * @returns Momentum analysis
 */
export function analyzeMomentum(
  priceHistory: PriceHistoryPoint[],
  trendDays: number
): {
  sustainabilityScore: number
  isAccelerating: boolean
  isDecelerating: boolean
} {
  // Calculate sustainability score
  const sustainabilityScore = calculateMomentumScore(priceHistory, trendDays)

  // Detect acceleration/deceleration
  const isAccelerating = isMomentumAccelerating(priceHistory)
  const isDecelerating = isMomentumDecelerating(priceHistory)

  return {
    sustainabilityScore,
    isAccelerating,
    isDecelerating,
  }
}

/**
 * Get momentum recommendation
 *
 * @param momentum - Momentum analysis
 * @returns Text recommendation
 */
export function getMomentumRecommendation(momentum: {
  sustainabilityScore: number
  isAccelerating: boolean
  isDecelerating: boolean
}): string {
  const { sustainabilityScore, isAccelerating, isDecelerating } = momentum

  if (sustainabilityScore >= 70) {
    if (isAccelerating) {
      return 'Strong accelerating momentum - favorable for entries'
    }
    return 'Strong sustainable momentum - favorable for entries'
  }

  if (sustainabilityScore >= 50) {
    if (isAccelerating) {
      return 'Momentum building - monitor for entry opportunity'
    }
    if (isDecelerating) {
      return 'Momentum fading - caution on new entries'
    }
    return 'Moderate momentum - selective entries'
  }

  if (sustainabilityScore >= 30) {
    if (isDecelerating) {
      return 'Weak momentum - avoid new entries'
    }
    return 'Momentum inconsistent - wait for confirmation'
  }

  return 'Poor momentum - avoid entries until improvement'
}
