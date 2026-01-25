/**
 * Market Breadth Types
 *
 * Market breadth measures the degree of participation in a market move.
 * High breadth = broad participation (healthy trend)
 * Low breadth = narrow participation (fragile trend)
 */

import type { RTDBMarketOverview } from './rtdb'

// ============================================================================
// MARKET BREADTH DATA
// ============================================================================

/**
 * Advance/Decline ratio and related breadth metrics
 */
export interface MarketBreadthMetrics {
  /** Number of stocks advancing */
  advances: number
  /** Number of stocks declining */
  declines: number
  /** Number of stocks unchanged */
  unchanged: number
  /** Total traded stocks */
  totalTraded: number
  /** Advance/Decline ratio (advances / declines) */
  adRatio: number
  /** Percentage of advancing stocks (advances / total * 100) */
  advancePercent: number
  /** Percentage of declining stocks (declines / total * 100) */
  declinePercent: number
  /** New 52-week highs count */
  newHighs: number
  /** New 52-week lows count */
  newLows: number
  /** Net new highs (newHighs - newLows) */
  netNewHighs: number
}

/**
 * Breadth status classification
 */
export type BreadthStatus =
  | 'Strongly Bullish'  // AD ratio > 2.5, 70%+ advances
  | 'Bullish'           // AD ratio 1.5-2.5, 55-70% advances
  | 'Neutral'           // AD ratio 0.8-1.5, 45-55% advances
  | 'Bearish'           // AD ratio 0.5-0.8, 30-45% advances
  | 'Strongly Bearish'  // AD ratio < 0.5, <30% advances

/**
 * Breadth trend direction
 */
export type BreadthTrend =
  | 'Improving'    // AD ratio increasing over time
  | 'Stable'       // AD ratio stable
  | 'Deteriorating' // AD ratio decreasing over time

/**
 * Volatility classification based on breadth
 */
export type VolatilityLevel =
  | 'Aggressive'  // High volatility, wide swings
  | 'Moderate'    // Normal volatility
  | 'Calm'        // Low volatility

// ============================================================================
// MARKET BREADTH ANALYSIS RESULT
// ============================================================================

/**
 * Complete market breadth analysis result
 * Answers Question #1: "How about market now? Aggressive vol or not?"
 */
export interface MarketBreadthAnalysis {
  /** Raw breadth metrics */
  metrics: MarketBreadthMetrics

  /** Current breadth status */
  status: BreadthStatus

  /** Breadth trend over recent periods */
  trend: BreadthTrend

  /** Volatility assessment */
  volatility: VolatilityLevel

  /** Confidence in the assessment (0-100) */
  confidence: number

  /** Human-readable explanation */
  explanation: string

  /** Key observations driving the assessment */
  observations: string[]

  /** Timestamp of analysis */
  timestamp: number
}

// ============================================================================
// MARKET BREADTH INPUT
// ============================================================================

/**
 * Input data required for breadth analysis
 */
export interface MarketBreadthInput {
  /** Current market overview data */
  current: RTDBMarketOverview

  /** Historical data for trend analysis (optional but recommended) */
  historical?: RTDBMarketOverview[]

  /** Analysis options */
  options?: MarketBreadthOptions
}

/**
 * Options for breadth analysis
 */
export interface MarketBreadthOptions {
  /** Custom threshold for strong bullish AD ratio (default: 2.5) */
  strongBullishThreshold?: number
  /** Custom threshold for strong bearish AD ratio (default: 0.5) */
  strongBearishThreshold?: number
  /** Number of historical periods to consider for trend (default: 5) */
  trendPeriods?: number
  /** Include volatility assessment (default: true) */
  includeVolatility?: boolean
}

// ============================================================================
// MARKET BREADTH INSIGHTS
// ============================================================================

/**
 * Breadth insight for UI display
 */
export interface BreadthInsight {
  /** Insight category */
  category: 'strength' | 'weakness' | 'neutral' | 'warning'
  /** Insight message */
  message: string
  /** Supporting data value */
  value?: number
  /** Comparison to threshold */
  comparison?: 'above' | 'below' | 'at'
}

/**
 * Aggregated breadth insights
 */
export interface MarketBreadthInsights {
  /** Primary insight (most important) */
  primary: BreadthInsight
  /** Secondary insights */
  secondary: BreadthInsight[]
  /** Actionable recommendation based on breadth */
  recommendation?: string
}
