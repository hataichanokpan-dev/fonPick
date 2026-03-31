/**
 * Historical Trend Analyzer
 *
 * Main service for analyzing historical trends in swing trading context
 * Aggregates MA, trend duration, momentum, and S/R analysis
 */

import type { PriceHistoryPoint } from '@/types/stock-price-api'
import type {
  HistoricalTrendAnalysis,
  DataQualityMetrics,
  TrendPeriod,
} from '@/types/swing-trading'
import { fetchPriceHistory } from '@/lib/api/stock-api'
import { calculateMovingAverages } from './moving-average'
import { analyzeTrendDuration } from './trend-duration'
import { analyzeMomentum } from './momentum'
import { detectSupportResistanceLevels } from './support-resistance'

// ============================================================================
// DATA QUALITY CHECKS
// ============================================================================

/**
 * Check data completeness
 *
 * @param priceHistory - Historical price data
 * @param requiredDays - Minimum days required
 * @returns Data quality metrics
 */
function checkDataQuality(
  priceHistory: PriceHistoryPoint[],
  requiredDays: number = 60
): DataQualityMetrics {
  const actualDays = priceHistory.length
  const completeness = Math.min(100, Math.round((actualDays / requiredDays) * 100))
  const hasEnoughData = actualDays >= requiredDays

  // Check for missing dates (gaps in data)
  const missingDates: string[] = []
  if (priceHistory.length > 1) {
    const startDate = new Date(priceHistory[0].date)
    const endDate = new Date(priceHistory[priceHistory.length - 1].date)

    // Generate expected dates and check for gaps
    const expectedDates = new Set<string>()
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      expectedDates.add(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Find missing dates (excluding weekends)
    for (const point of priceHistory) {
      expectedDates.delete(point.date)
    }

    // Add missing dates (max 20 to avoid huge output)
    let count = 0
    for (const date of expectedDates) {
      const dayOfWeek = new Date(date).getDay()
      // Skip weekends (Saturday=6, Sunday=0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        missingDates.push(date)
        count++
        if (count >= 20) break
      }
    }
  }

  return {
    completeness,
    hasEnoughData,
    missingDates,
  }
}

/**
 * Calculate analysis period
 *
 * @param priceHistory - Historical price data
 * @param requestedDays - Requested number of days
 * @returns Period information
 */
function calculatePeriod(
  priceHistory: PriceHistoryPoint[],
  requestedDays: number
): TrendPeriod {
  if (priceHistory.length === 0) {
    return {
      start: '',
      end: '',
      days: 0,
    }
  }

  const actualDays = Math.min(requestedDays, priceHistory.length)
  const endDate = priceHistory[priceHistory.length - 1].date
  const startDate = priceHistory[priceHistory.length - actualDays].date

  return {
    start: startDate,
    end: endDate,
    days: actualDays,
  }
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyze historical trend for swing trading
 *
 * This is the main entry point for historical trend analysis.
 * It fetches price history and runs all trend analysis components.
 *
 * @param params - Analysis parameters
 * @returns Complete historical trend analysis or null if failed
 *
 * @example
 * ```typescript
 * const analysis = await analyzeHistoricalTrend({
 *   symbol: 'PTT',
 *   days: 90
 * })
 * if (analysis) {
 *   console.log(`Trend: ${analysis.trend.direction}`)
 *   console.log(`Phase: ${analysis.trend.phase}`)
 * }
 * ```
 */
export async function analyzeHistoricalTrend(params: {
  symbol: string
  days: 5 | 10 | 30 | 60 | 90
}): Promise<HistoricalTrendAnalysis | null> {
  const { symbol, days } = params

  // Calculate date range for fetching historical data
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // Fetch price history from external API
  const historyResponse = await fetchPriceHistory(
    symbol,
    {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    },
    { bypassCache: false }
  )

  // Handle API errors
  if (!historyResponse.success || !historyResponse.data) {
    console.error(`Failed to fetch price history for ${symbol}:`, historyResponse.error)
    return null
  }

  const priceHistory = historyResponse.data

  // Check data quality
  const dataQuality = checkDataQuality(priceHistory, days)

  // If insufficient data, return early with quality info
  if (!dataQuality.hasEnoughData) {
    return {
      symbol,
      period: calculatePeriod(priceHistory, days),
      priceHistory,
      movingAverages: {
        ma20: [],
        ma50: [],
        ma200: [],
      },
      trend: {
        direction: 'sideways',
        duration: 0,
        phase: 'mature',
        strength: 0,
      },
      momentum: {
        sustainabilityScore: 0,
        isAccelerating: false,
        isDecelerating: false,
      },
      levels: {
        support: [],
        resistance: [],
      },
      dataQuality,
    }
  }

  // Calculate moving averages
  const movingAverages = calculateMovingAverages(priceHistory)

  // Analyze trend duration and phase
  const trendAnalysis = analyzeTrendDuration(priceHistory, {
    ma20: movingAverages.ma20,
    ma50: movingAverages.ma50,
  })

  // Analyze momentum
  const momentum = analyzeMomentum(priceHistory, trendAnalysis.trendDays)

  // Detect support/resistance levels
  const { support, resistance } = detectSupportResistanceLevels(
    priceHistory,
    5, // lookback
    0.02, // 2% price threshold
    2 // minimum 2 touches
  )

  // Return complete analysis
  return {
    symbol,
    period: calculatePeriod(priceHistory, days),
    priceHistory,
    movingAverages,
    trend: {
      direction: trendAnalysis.currentTrend,
      duration: trendAnalysis.trendDays,
      phase: trendAnalysis.trendPhase,
      strength: trendAnalysis.strength,
    },
    momentum,
    levels: {
      support,
      resistance,
    },
    dataQuality,
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get trend summary text
 *
 * @param analysis - Historical trend analysis
 * @returns Human-readable trend summary
 */
export function getTrendSummary(analysis: HistoricalTrendAnalysis): string {
  const { trend, momentum } = analysis

  const directionText = {
    uptrend: 'Uptrend',
    downtrend: 'Downtrend',
    sideways: 'Sideways',
  }[trend.direction]

  const phaseText = {
    early: 'Early stage',
    mature: 'Mature',
    exhausted: 'Late stage',
  }[trend.phase]

  let summary = `${directionText} (${phaseText})`

  if (momentum.isAccelerating) {
    summary += ', Accelerating'
  } else if (momentum.isDecelerating) {
    summary += ', Decelerating'
  }

  return summary
}

/**
 * Check if trend is favorable for swing trading (30-90 day)
 *
 * @param analysis - Historical trend analysis
 * @returns Whether trend is favorable
 */
export function isTrendFavorable(analysis: HistoricalTrendAnalysis): boolean {
  const { trend, momentum, dataQuality } = analysis

  // Must have good data quality
  if (dataQuality.completeness < 70) {
    return false
  }

  // Favorable conditions:
  // 1. Uptrend in early/mature phase with good momentum
  if (
    trend.direction === 'uptrend' &&
    (trend.phase === 'early' || trend.phase === 'mature') &&
    momentum.sustainabilityScore >= 50
  ) {
    return true
  }

  // 2. Sideways but near strong support (potential bounce)
  if (
    trend.direction === 'sideways' &&
    analysis.levels.support.length > 0 &&
    analysis.levels.support[0].strength === 'strong'
  ) {
    return true
  }

  return false
}

/**
 * Get entry recommendation based on trend analysis
 *
 * @param analysis - Historical trend analysis
 * @returns Entry recommendation
 */
export function getEntryRecommendation(analysis: HistoricalTrendAnalysis): {
  action: 'enter' | 'wait' | 'avoid'
  reason: string
} {
  if (!isTrendFavorable(analysis)) {
    return {
      action: 'avoid',
      reason: 'Trend not favorable for swing trading',
    }
  }

  const { trend, momentum } = analysis

  // Early stage uptrend with accelerating momentum = Enter now
  if (trend.phase === 'early' && momentum.isAccelerating) {
    return {
      action: 'enter',
      reason: 'Early uptrend with accelerating momentum',
    }
  }

  // Mature uptrend with good momentum = Enter on pullback
  if (trend.phase === 'mature' && momentum.sustainabilityScore >= 60) {
    return {
      action: 'enter',
      reason: 'Mature uptrend with sustainable momentum, enter on pullback',
    }
  }

  // Exhausted trend = Wait
  if (trend.phase === 'exhausted') {
    return {
      action: 'wait',
      reason: 'Trend in late stage, wait for confirmation',
    }
  }

  // Default: wait
  return {
    action: 'wait',
    reason: 'Monitor for clearer signals',
  }
}
