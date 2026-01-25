/**
 * Market Breadth Analyzer
 *
 * Generates breadth insights and analysis.
 * Part of Phase 1: Foundation
 */

import type {
  MarketBreadthAnalysis,
  MarketBreadthInput,
  MarketBreadthInsights,
  BreadthInsight,
  BreadthStatus,
  BreadthTrend,
  VolatilityLevel,
} from '@/types/market-breadth'
import type { RTDBMarketOverview } from '@/types/rtdb'
import {
  calculateBreadth,
  calculateBreadthMetrics,
  getBreadthStatusColor,
  getVolatilityColor,
} from './calculator'

// ============================================================================
// MAIN ANALYZER
// ============================================================================

/**
 * Analyze market breadth from input data
 * @param input Market breadth input
 * @returns Complete breadth analysis
 */
export function analyzeMarketBreadth(input: MarketBreadthInput): MarketBreadthAnalysis {
  const { current, historical, options: _options } = input

  // Calculate breadth data
  const breadthData = calculateBreadth(current, historical)

  // Generate explanation
  const explanation = generateBreadthExplanation(
    breadthData.status,
    breadthData.volatility,
    breadthData.trend,
    breadthData.metrics
  )

  // Generate observations
  const observations = generateBreadthObservations(
    breadthData.status,
    breadthData.volatility,
    breadthData.trend,
    breadthData.metrics
  )

  return {
    metrics: breadthData.metrics,
    status: breadthData.status,
    trend: breadthData.trend,
    volatility: breadthData.volatility,
    confidence: breadthData.confidence,
    explanation,
    observations,
    timestamp: current.timestamp,
  }
}

// ============================================================================
// EXPLANATION GENERATION
// ============================================================================

/**
 * Generate human-readable explanation of breadth status
 * @param status Breadth status
 * @param volatility Volatility level
 * @param trend Breadth trend
 * @param metrics Breadth metrics
 * @returns Explanation string
 */
function generateBreadthExplanation(
  status: BreadthStatus,
  volatility: VolatilityLevel,
  trend: BreadthTrend,
  metrics: { adRatio: number; advancePercent: number }
): string {
  const statusText = status.toLowerCase()
  const volatilityText = volatility.toLowerCase()
  const trendText = trend === 'Improving' ? 'improving' : trend === 'Deteriorating' ? 'deteriorating' : 'stable'

  return `Market breadth is ${statusText} with A/D ratio of ${metrics.adRatio.toFixed(2)} ` +
    `(${metrics.advancePercent.toFixed(0)}% advancers). Volatility is ${volatilityText} ` +
    `and breadth trend is ${trendText}.`
}

/**
 * Generate key observations from breadth analysis
 * @param status Breadth status
 * @param volatility Volatility level
 * @param trend Breadth trend
 * @param metrics Breadth metrics
 * @returns Array of observation strings
 */
function generateBreadthObservations(
  status: BreadthStatus,
  volatility: VolatilityLevel,
  trend: BreadthTrend,
  metrics: {
    adRatio: number
    advancePercent: number
    newHighs: number
    newLows: number
    netNewHighs: number
  }
): string[] {
  const observations: string[] = []

  // Status observation
  if (status === 'Strongly Bullish') {
    observations.push('Extremely strong breadth with broad participation')
  } else if (status === 'Bullish') {
    observations.push('Healthy breadth indicating broad-based buying')
  } else if (status === 'Neutral') {
    observations.push('Mixed breadth with no clear directional bias')
  } else if (status === 'Bearish') {
    observations.push('Weak breadth indicating selling pressure')
  } else if (status === 'Strongly Bearish') {
    observations.push('Very weak breadth with broad-based selling')
  }

  // Volatility observation
  if (volatility === 'Aggressive') {
    observations.push('High volatility with significant swings')
  } else if (volatility === 'Calm') {
    observations.push('Low volatility, relatively calm market')
  }

  // Trend observation
  if (trend === 'Improving') {
    observations.push('Breadth improving over recent sessions')
  } else if (trend === 'Deteriorating') {
    observations.push('Breadth deteriorating over recent sessions')
  }

  // New highs/lows observation
  if (metrics.newHighs > metrics.newLows * 2) {
    observations.push(`${metrics.newHighs} new highs vs ${metrics.newLows} new lows - bullish`)
  } else if (metrics.newLows > metrics.newHighs * 2) {
    observations.push(`${metrics.newLows} new lows vs ${metrics.newHighs} new highs - bearish`)
  }

  return observations.slice(0, 4) // Max 4 observations
}

// ============================================================================
// BREADTH INSIGHTS GENERATOR
// ============================================================================

/**
 * Generate breadth insights for UI display
 * @param analysis Breadth analysis result
 * @returns Formatted insights
 */
export function generateBreadthInsights(analysis: MarketBreadthAnalysis): MarketBreadthInsights {
  // Generate primary insight
  const primary = generatePrimaryInsight(analysis)

  // Generate secondary insights
  const secondary = generateSecondaryInsights(analysis)

  // Generate recommendation
  const recommendation = generateBreadthRecommendation(analysis)

  return {
    primary,
    secondary,
    recommendation,
  }
}

/**
 * Generate primary (most important) insight
 * @param analysis Breadth analysis
 * @returns Primary insight
 */
function generatePrimaryInsight(analysis: MarketBreadthAnalysis): BreadthInsight {
  const { status, volatility: _volatility, metrics } = analysis

  let category: 'strength' | 'weakness' | 'neutral' | 'warning'
  let message: string
  let value: number
  let comparison: 'above' | 'below' | 'at'

  // Determine primary insight based on status and volatility
  if (status === 'Strongly Bullish' || status === 'Bullish') {
    category = 'strength'
    message = `Strong breadth with ${metrics.advancePercent.toFixed(0)}% advancers`
    value = metrics.advancePercent
    comparison = 'above'
  } else if (status === 'Strongly Bearish' || status === 'Bearish') {
    category = 'weakness'
    message = `Weak breadth with ${metrics.declinePercent.toFixed(0)}% decliners`
    value = metrics.declinePercent
    comparison = 'above'
  } else {
    category = 'neutral'
    message = `Balanced breadth at ${metrics.adRatio.toFixed(2)} A/D ratio`
    value = metrics.adRatio
    comparison = 'at'
  }

  return {
    category,
    message,
    value,
    comparison,
  }
}

/**
 * Generate secondary insights
 * @param analysis Breadth analysis
 * @returns Array of secondary insights
 */
function generateSecondaryInsights(analysis: MarketBreadthAnalysis): BreadthInsight[] {
  const insights: BreadthInsight[] = []
  const { volatility, trend, metrics } = analysis

  // Volatility insight
  if (volatility === 'Aggressive') {
    insights.push({
      category: 'warning',
      message: `${metrics.newHighs + metrics.newLows} stocks hitting new extremes`,
      value: metrics.newHighs + metrics.newLows,
      comparison: 'above',
    })
  }

  // Trend insight
  if (trend === 'Improving') {
    insights.push({
      category: 'strength',
      message: 'Breadth trend improving',
    })
  } else if (trend === 'Deteriorating') {
    insights.push({
      category: 'weakness',
      message: 'Breadth trend deteriorating',
    })
  }

  // Net new highs insight
  if (metrics.netNewHighs > 10) {
    insights.push({
      category: 'strength',
      message: `Net new highs: +${metrics.netNewHighs}`,
      value: metrics.netNewHighs,
      comparison: 'above',
    })
  } else if (metrics.netNewHighs < -10) {
    insights.push({
      category: 'weakness',
      message: `Net new highs: ${metrics.netNewHighs}`,
      value: metrics.netNewHighs,
      comparison: 'below',
    })
  }

  return insights.slice(0, 3) // Max 3 secondary insights
}

/**
 * Generate actionable recommendation based on breadth
 * @param analysis Breadth analysis
 * @returns Recommendation string
 */
function generateBreadthRecommendation(analysis: MarketBreadthAnalysis): string {
  const { status, volatility } = analysis

  if (status === 'Strongly Bullish' || status === 'Bullish') {
    if (volatility === 'Aggressive') {
      return 'Breadth strong but volatility high - consider position sizing'
    }
    return 'Strong breadth supports long positions - focus on quality leaders'
  }

  if (status === 'Strongly Bearish' || status === 'Bearish') {
    if (volatility === 'Aggressive') {
      return 'Weak breadth with high volatility - reduce exposure, preserve capital'
    }
    return 'Weak breadth - defensive posture recommended, wait for improvement'
  }

  // Neutral
  if (volatility === 'Aggressive') {
    return 'Mixed breadth with high volatility - stay selective, avoid chasing'
  }
  return 'Mixed breadth - wait for clearer directional signal'
}

// ============================================================================
// BREADTH TREND DETECTION
// ============================================================================

/**
 * Detect breadth trend from historical data
 * @param historical Historical market overview data
 * @returns Trend analysis
 */
export function detectBreadthTrend(historical: RTDBMarketOverview[]): {
  direction: 'Improving' | 'Stable' | 'Deteriorating'
  strength: 'Strong' | 'Moderate' | 'Weak'
  description: string
} {
  if (historical.length < 2) {
    return {
      direction: 'Stable',
      strength: 'Weak',
      description: 'Insufficient historical data for trend analysis',
    }
  }

  // Calculate A/D ratios for historical data
  const adRatios = historical
    .slice(0, 5) // Use up to 5 most recent
    .map(calculateBreadthMetrics)
    .map(m => m.adRatio)

  // Calculate trend
  const first = adRatios[0]
  const last = adRatios[adRatios.length - 1]
  const change = last - first

  // Determine direction
  let direction: 'Improving' | 'Stable' | 'Deteriorating'
  if (change > 0.3) {
    direction = 'Improving'
  } else if (change < -0.3) {
    direction = 'Deteriorating'
  } else {
    direction = 'Stable'
  }

  // Determine strength
  const avgChange = Math.abs(change) / adRatios.length
  let strength: 'Strong' | 'Moderate' | 'Weak'
  if (avgChange > 0.2) {
    strength = 'Strong'
  } else if (avgChange > 0.1) {
    strength = 'Moderate'
  } else {
    strength = 'Weak'
  }

  // Generate description
  const description = `Breadth ${direction.toLowerCase()} over ${adRatios.length} periods (${strength.toLowerCase()} strength)`

  return {
    direction,
    strength,
    description,
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { calculateBreadth, calculateBreadthMetrics, getBreadthStatusColor, getVolatilityColor }
