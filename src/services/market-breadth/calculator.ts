/**
 * Market Breadth Calculator
 *
 * Calculates A/D ratio and breadth metrics from market data.
 * Part of Phase 1: Foundation
 */

import type {
  MarketBreadthMetrics,
  BreadthStatus,
  VolatilityLevel,
} from '@/types/market-breadth'
import type { RTDBMarketOverview } from '@/types/rtdb'

// ============================================================================
// THRESHOLDS
// ============================================================================

const DEFAULT_THRESHOLDS = {
  // Breadth status thresholds
  STRONGLY_BULLISH_AD_RATIO: 2.5,
  STRONGLY_BULLISH_ADVANCE_PCT: 70,

  BULLISH_AD_RATIO: 1.5,
  BULLISH_ADVANCE_PCT: 55,

  STRONGLY_BEARISH_AD_RATIO: 0.5,
  STRONGLY_BEARISH_ADVANCE_PCT: 30,

  BEARISH_AD_RATIO: 0.8,
  BEARISH_ADVANCE_PCT: 45,

  // Volatility thresholds
  AGGRESSIVE_VOL_NEW_HIGH_LOW_SUM: 50,
  AGGRESSIVE_VOL_AD_SWING: 2.0, // AD ratio swings this much = aggressive

  CALM_VOL_NEW_HIGH_LOW_SUM: 10,
  CALM_VOL_AD_RATIO_RANGE: [0.8, 1.2] as [number, number],
} as const

// ============================================================================
// BREADTH METRICS CALCULATION
// ============================================================================

/**
 * Calculate breadth metrics from market overview data
 * @param marketOverview Market overview data from RTDB
 * @returns Breadth metrics
 */
export function calculateBreadthMetrics(
  marketOverview: RTDBMarketOverview
): MarketBreadthMetrics {
  const { advanceCount, declineCount, unchangedCount, newHighCount, newLowCount } = marketOverview

  // Calculate totals
  const totalTraded = advanceCount + declineCount + unchangedCount

  // Calculate A/D ratio (handle edge case where declines = 0)
  // Round to 2 decimal places to avoid floating-point precision issues
  const adRatioRaw = declineCount > 0 ? advanceCount / declineCount : advanceCount > 0 ? 999 : 0
  const adRatio = Math.round(adRatioRaw * 100) / 100

  // Calculate percentages (round to 2 decimal places)
  const advancePercentRaw = totalTraded > 0 ? (advanceCount / totalTraded) * 100 : 0
  const declinePercentRaw = totalTraded > 0 ? (declineCount / totalTraded) * 100 : 0
  const advancePercent = Math.round(advancePercentRaw * 100) / 100
  const declinePercent = Math.round(declinePercentRaw * 100) / 100

  // Net new highs
  const netNewHighs = newHighCount - newLowCount

  return {
    advances: advanceCount,
    declines: declineCount,
    unchanged: unchangedCount,
    totalTraded,
    adRatio,
    advancePercent,
    declinePercent,
    newHighs: newHighCount,
    newLows: newLowCount,
    netNewHighs,
  }
}

/**
 * Calculate breadth status from metrics
 * @param metrics Breadth metrics
 * @returns Breadth status classification
 */
export function calculateBreadthStatus(metrics: MarketBreadthMetrics): BreadthStatus {
  const { adRatio, advancePercent } = metrics

  // Check for strongly bullish first
  if (
    adRatio >= DEFAULT_THRESHOLDS.STRONGLY_BULLISH_AD_RATIO &&
    advancePercent >= DEFAULT_THRESHOLDS.STRONGLY_BULLISH_ADVANCE_PCT
  ) {
    return 'Strongly Bullish'
  }

  // Check for bullish
  if (
    adRatio >= DEFAULT_THRESHOLDS.BULLISH_AD_RATIO &&
    advancePercent >= DEFAULT_THRESHOLDS.BULLISH_ADVANCE_PCT
  ) {
    return 'Bullish'
  }

  // Check for neutral (between bullish and bearish)
  if (
    adRatio >= DEFAULT_THRESHOLDS.BEARISH_AD_RATIO &&
    advancePercent >= DEFAULT_THRESHOLDS.BEARISH_ADVANCE_PCT
  ) {
    return 'Neutral'
  }

  // Check for bearish
  if (
    adRatio >= DEFAULT_THRESHOLDS.STRONGLY_BEARISH_AD_RATIO ||
    advancePercent >= DEFAULT_THRESHOLDS.STRONGLY_BEARISH_ADVANCE_PCT
  ) {
    return 'Bearish'
  }

  // Otherwise strongly bearish
  return 'Strongly Bearish'
}

/**
 * Calculate volatility level from breadth metrics
 * @param metrics Breadth metrics
 * @returns Volatility level
 */
export function calculateVolatilityLevel(metrics: MarketBreadthMetrics): VolatilityLevel {
  const { adRatio, newHighs, newLows } = metrics

  // Calculate new highs + new lows (volatility indicator)
  const newHighLowSum = newHighs + newLows

  // If no new highs/lows data available, assess volatility based on A/D ratio only
  // This handles the case where RTDB doesn't provide newHighs/newLows data
  if (newHighLowSum === 0) {
    // Use A/D ratio as the sole volatility indicator
    if (adRatio >= DEFAULT_THRESHOLDS.AGGRESSIVE_VOL_AD_SWING) {
      return 'Aggressive'
    }
    if (
      adRatio >= DEFAULT_THRESHOLDS.CALM_VOL_AD_RATIO_RANGE[0] &&
      adRatio <= DEFAULT_THRESHOLDS.CALM_VOL_AD_RATIO_RANGE[1]
    ) {
      return 'Calm'
    }
    return 'Moderate'
  }

  // Check for aggressive volatility
  if (
    newHighLowSum >= DEFAULT_THRESHOLDS.AGGRESSIVE_VOL_NEW_HIGH_LOW_SUM ||
    adRatio >= DEFAULT_THRESHOLDS.AGGRESSIVE_VOL_AD_SWING ||
    adRatio <= 1 / DEFAULT_THRESHOLDS.AGGRESSIVE_VOL_AD_SWING
  ) {
    return 'Aggressive'
  }

  // Check for calm
  if (
    newHighLowSum <= DEFAULT_THRESHOLDS.CALM_VOL_NEW_HIGH_LOW_SUM &&
    adRatio >= DEFAULT_THRESHOLDS.CALM_VOL_AD_RATIO_RANGE[0] &&
    adRatio <= DEFAULT_THRESHOLDS.CALM_VOL_AD_RATIO_RANGE[1]
  ) {
    return 'Calm'
  }

  // Default to moderate
  return 'Moderate'
}

/**
 * Calculate breadth confidence based on data quality
 * @param metrics Breadth metrics
 * @returns Confidence score (0-100)
 */
export function calculateBreadthConfidence(metrics: MarketBreadthMetrics): number {
  let confidence = 50 // Base confidence

  const { totalTraded, adRatio, newHighs, newLows } = metrics

  // Higher confidence with more traded stocks
  if (totalTraded > 500) {
    confidence += 20
  } else if (totalTraded > 300) {
    confidence += 10
  }

  // Higher confidence with extreme A/D ratios (clearer signal)
  if (adRatio > 3 || adRatio < 0.33) {
    confidence += 15
  } else if (adRatio > 2 || adRatio < 0.5) {
    confidence += 10
  }

  // Higher confidence with new highs/lows data
  if (newHighs > 0 || newLows > 0) {
    confidence += 10
  }

  // Cap at 100
  return Math.min(confidence, 100)
}

/**
 * Calculate breadth trend from historical data
 * @param current Current breadth metrics
 * @param historical Historical breadth metrics
 * @returns Trend direction
 */
export function calculateBreadthTrend(
  current: MarketBreadthMetrics,
  historical?: MarketBreadthMetrics[]
): 'Improving' | 'Stable' | 'Deteriorating' {
  if (!historical || historical.length === 0) {
    return 'Stable'
  }

  // Get the most recent historical data point
  const previous = historical[0]

  // Compare A/D ratios
  const currentRatio = current.adRatio
  const previousRatio = previous.adRatio

  // Calculate change
  const change = currentRatio - previousRatio

  // Determine trend
  if (change > 0.2) {
    return 'Improving'
  } else if (change < -0.2) {
    return 'Deteriorating'
  }

  return 'Stable'
}

// ============================================================================
// AGGREGATED CALCULATION
// ============================================================================

/**
 * Calculate all breadth metrics at once
 * @param marketOverview Market overview data
 * @param historical Historical data (optional)
 * @returns Complete breadth metrics with status, volatility, and trend
 */
export function calculateBreadth(
  marketOverview: RTDBMarketOverview,
  historical?: RTDBMarketOverview[]
): {
  metrics: MarketBreadthMetrics
  status: BreadthStatus
  volatility: VolatilityLevel
  confidence: number
  trend: 'Improving' | 'Stable' | 'Deteriorating'
} {
  // Calculate current metrics
  const metrics = calculateBreadthMetrics(marketOverview)

  // Calculate derived values
  const status = calculateBreadthStatus(metrics)
  const volatility = calculateVolatilityLevel(metrics)
  const confidence = calculateBreadthConfidence(metrics)

  // Calculate historical metrics for trend
  const historicalMetrics = historical?.map(calculateBreadthMetrics)
  const trend = calculateBreadthTrend(metrics, historicalMetrics)

  return {
    metrics,
    status,
    volatility,
    confidence,
    trend,
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get color for breadth status
 * @param status Breadth status
 * @returns Color token name
 */
export function getBreadthStatusColor(status: BreadthStatus): string {
  switch (status) {
    case 'Strongly Bullish':
    case 'Bullish':
      return 'up'
    case 'Strongly Bearish':
    case 'Bearish':
      return 'down'
    default:
      return 'flat'
  }
}

/**
 * Get color for volatility level
 * @param volatility Volatility level
 * @returns Color token name
 */
export function getVolatilityColor(volatility: VolatilityLevel): string {
  switch (volatility) {
    case 'Aggressive':
      return 'risk'  // Red
    case 'Moderate':
      return 'warn'  // Yellow
    case 'Calm':
      return 'info'  // Blue
  }
}
