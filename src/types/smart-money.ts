/**
 * Smart Money Types
 *
 * Smart money analysis tracks foreign and institutional investor flows.
 * These investors are considered "smart money" due to their research capabilities
 * and market impact.
 * Answers Question #3: "Risk on because Foreign Investor is strong buy
 * or Prop trade reduce they sell vol?"
 */

import type { RTDBInvestorType } from './rtdb'

// ============================================================================
// INVESTOR TYPES
// ============================================================================

/**
 * Investor categories for smart money analysis
 */
export type InvestorType = 'foreign' | 'institution' | 'retail' | 'prop'

/**
 * Smart money investor types (foreign + institution)
 */
export type SmartMoneyInvestor = 'foreign' | 'institution' | 'retail' | 'prop'

// ============================================================================
// SIGNAL CLASSIFICATION
// ============================================================================

/**
 * Individual investor signal strength
 */
export type SignalStrength =
  | 'Strong Buy'   // Very positive flow
  | 'Buy'          // Positive flow
  | 'Neutral'      // No clear direction
  | 'Sell'         // Negative flow
  | 'Strong Sell'  // Very negative flow

/**
 * Combined smart money signal
 */
export type CombinedSignal =
  | 'Strong Buy'   // Both foreign and institution strongly buying
  | 'Buy'          // Net positive from smart money
  | 'Neutral'      // Mixed signals
  | 'Sell'         // Net negative from smart money
  | 'Strong Sell'  // Both foreign and institution strongly selling

/**
 * Risk-On/Off signal derived from smart money
 */
export type RiskSignal =
  | 'Risk-On'      // Smart money aggressively buying
  | 'Risk-On Mild' // Smart money moderately buying
  | 'Neutral'      // No clear risk signal
  | 'Risk-Off Mild'// Smart money moderately selling
  | 'Risk-Off'     // Smart money aggressively selling

// ============================================================================
// INVESTOR ANALYSIS DATA
// ============================================================================

/**
 * Individual investor analysis
 */
export interface InvestorAnalysis {
  /** Investor type */
  investor: SmartMoneyInvestor

  /** Today's net flow (millions THB) */
  todayNet: number

  /** Flow strength classification */
  strength: SignalStrength

  /** Trend direction */
  trend: FlowTrend

  /** Confidence in signal (0-100) */
  confidence: number

  /** 5-day cumulative net flow */
  trend5Day: number

  /** 5-day average net flow */
  avg5Day: number

  /** Comparison to today */
  vsAverage: number
}

/**
 * Flow trend direction
 */
export type FlowTrend =
  | 'Accelerating Buy'   // Increasing buy volume
  | 'Stable Buy'         // Consistent buying
  | 'Decreasing Buy'     // Buy volume tapering
  | 'Neutral'            // No clear trend
  | 'Decreasing Sell'    // Sell volume tapering
  | 'Stable Sell'        // Consistent selling
  | 'Accelerating Sell'  // Increasing sell volume

// ============================================================================
// SMART MONEY ANALYSIS RESULT
// ============================================================================

/**
 * Complete smart money analysis result
 * Answers Question #3: "Risk on because Foreign Investor is strong buy
 * or Prop trade reduce they sell vol?"
 */
export interface SmartMoneyAnalysis {
  /** Individual investor analyses */
  investors: {
    foreign: InvestorAnalysis
    institution: InvestorAnalysis
    retail: InvestorAnalysis
    prop: InvestorAnalysis
  }

  /** Combined smart money signal */
  combinedSignal: CombinedSignal

  /** Risk-On/Off signal */
  riskSignal: RiskSignal

  /** Overall smart money score (0-100, >60 bullish, <40 bearish) */
  score: number

  /** Confidence in assessment (0-100) */
  confidence: number

  /** Key observations */
  observations: string[]

  /** Primary driver (which investor is driving the signal) */
  primaryDriver?: 'foreign' | 'institution' | 'retail' | 'prop' | 'both' | 'none'

  /** Risk-On confirmation (does smart money confirm risk-on?) */
  riskOnConfirmed: boolean

  /** Risk-Off confirmation (does smart money confirm risk-off?) */
  riskOffConfirmed: boolean

  /** Timestamp of analysis */
  timestamp: number
}

// ============================================================================
// SMART MONEY SCORING
// ============================================================================

/**
 * Smart money score components
 */
export interface SmartMoneyScoreComponents {
  /** Foreign investor score (0-50) */
  foreignScore: number

  /** Institution investor score (0-50) */
  institutionScore: number

  /** Retail investor score (0-25) */
  retailScore: number

  /** Prop investor score (0-25) */
  propScore: number

  /** Total score (0-100) */
  totalScore: number
}

/**
 * Smart money signal with scoring details
 */
export interface SmartMoneySignal {
  /** Combined signal */
  signal: CombinedSignal

  /** Risk signal */
  riskSignal: RiskSignal

  /** Score components */
  scores: SmartMoneyScoreComponents

  /** Signal confidence */
  confidence: number

  /** Supporting evidence */
  evidence: string[]
}

// ============================================================================
// SMART MONEY INPUT
// ============================================================================

/**
 * Input data required for smart money analysis
 */
export interface SmartMoneyInput {
  /** Current investor type data */
  current: RTDBInvestorType

  /** Historical investor data (optional, for trend analysis) */
  historical?: RTDBInvestorType[]

  /** Analysis options */
  options?: SmartMoneyOptions
}

/**
 * Options for smart money analysis
 */
export interface SmartMoneyOptions {
  /** Threshold for strong buy/sell (default: 500M) */
  strongFlowThreshold?: number

  /** Threshold for buy/sell (default: 100M) */
  flowThreshold?: number

  /** Periods to consider for trend (default: 5) */
  trendPeriods?: number

  /** Include prop trading in analysis (default: true) */
  includePropTrading?: boolean
}

// ============================================================================
// THAI MARKET SPECIFIC
// ============================================================================

/**
 * Thai market specific smart money context
 * Foreign investors dominate ~35-40% of SET market cap
 */
export interface ThaiMarketContext {
  /** Foreign market cap percentage */
  foreignMarketCapPercent: number

  /** Foreign impact factor (higher = more impact) */
  foreignImpactFactor: number

  /** Prop trading significance (highly active in Thai market) */
  propTradingSignificance: 'high' | 'medium' | 'low'

  /** Typical foreign flow patterns */
  typicalPatterns: {
    /** Foreign net buy range (million THB) */
    strongBuyRange: [number, number]
    /** Foreign net sell range (million THB) */
    strongSellRange: [number, number]
  }
}

/**
 * Default Thai market context
 */
export const DEFAULT_THAI_CONTEXT: ThaiMarketContext = {
  foreignMarketCapPercent: 38,
  foreignImpactFactor: 1.5, // Foreign flows have 1.5x impact
  propTradingSignificance: 'high',
  typicalPatterns: {
    strongBuyRange: [500, 2000],
    strongSellRange: [-2000, -500],
  },
}

// ============================================================================
// PROP TRADING ANALYSIS
// ============================================================================

/**
 * Prop trading analysis (Thai market specific)
 * Prop firms can amplify volatility through program trading
 */
export interface PropTradingAnalysis {
  /** Prop trading net flow */
  netFlow: number

  /** Prop trading activity level */
  activity: 'High' | 'Normal' | 'Low'

  /** Prop trading impact (amplifying or reducing volatility) */
  impact: 'Amplifying Risk' | 'Reducing Risk' | 'Neutral'

  /** Prop trading signal */
  signal: string

  /** Is prop trading reducing sell volume? (bullish when true) */
  reducingSellVolume: boolean
}

// ============================================================================
// TREND ANALYSIS TYPES
// ============================================================================

/**
 * Time period options for trend analysis
 */
export type TrendPeriod = 5 | 10 | 30 | 60 | 90

/**
 * Investor types for trend filtering
 */
export type TrendInvestorFilter = 'foreign' | 'institution' | 'retail' | 'prop' | 'all'

/**
 * Aggregation granularity
 */
export type TrendGranularity = 'daily' | 'weekly'

/**
 * Trend direction classification
 */
export type TrendDirection = 'up' | 'down' | 'sideways'

/**
 * Daily trend data point for a single investor type
 */
export interface DailyTrendPoint {
  /** Date in YYYY-MM-DD format */
  date: string

  /** Unix timestamp */
  timestamp: number

  /** Buy value (millions THB) */
  buy: number

  /** Sell value (millions THB) */
  sell: number

  /** Net value (millions THB) */
  net: number

  /** Buy percentage */
  buyPct: number

  /** Sell percentage */
  sellPct: number
}

/**
 * Aggregated metrics for an investor type over a period
 */
export interface AggregatedMetrics {
  /** Total buy value (millions THB) */
  totalBuy: number

  /** Total sell value (millions THB) */
  totalSell: number

  /** Total net value (millions THB) */
  totalNet: number

  /** Average daily net flow (millions THB) */
  avgDaily: number

  /** Maximum buy day */
  maxBuy: { date: string; value: number }

  /** Maximum sell day */
  maxSell: { date: string; value: number }

  /** Trend direction */
  trend: TrendDirection

  /** Trend strength (0-100) */
  trendStrength: number

  /** Standard deviation of net flow */
  stdDev: number
}

/**
 * Trend data for a single investor type
 */
export interface InvestorTrendData {
  /** Investor type */
  investor: 'foreign' | 'institution' | 'retail' | 'prop'

  /** Thai name */
  name: string

  /** Daily trend points */
  daily: DailyTrendPoint[]

  /** Aggregated metrics */
  aggregated: AggregatedMetrics

  /** Moving averages */
  movingAverages: {
    ma3: number | null
    ma5: number | null
    ma10: number | null
  }
}

/**
 * Combined trend point (all investors)
 */
export interface CombinedTrendPoint {
  /** Date in YYYY-MM-DD format */
  date: string

  /** Unix timestamp */
  timestamp: number

  /** Smart money net (foreign + institution) */
  smartMoneyNet: number

  /** Retail net */
  retailNet: number

  /** Prop net */
  propNet: number

  /** Total net */
  totalNet: number

  /** Combined signal */
  signal: CombinedSignal

  /** Risk signal */
  riskSignal: RiskSignal
}

/**
 * Pattern detection result
 */
export interface DetectedPattern {
  /** Pattern type */
  type: 'Accumulation' | 'Distribution' | 'Divergence' | 'Reversal' | 'FOMO' | 'Panic'

  /** Pattern description */
  description: string

  /** Start date */
  startDate: string

  /** End date (if applicable) */
  endDate?: string

  /** Pattern strength (0-100) */
  strength: number

  /** Investors involved */
  investors: ('foreign' | 'institution' | 'retail' | 'prop')[]
}

/**
 * Trend analysis request parameters
 */
export interface TrendAnalysisParams {
  /** Period in days */
  period: TrendPeriod

  /** Investor filter */
  investors: TrendInvestorFilter[]

  /** Aggregation granularity */
  aggregate?: TrendGranularity

  /** Start date (optional, overrides period) */
  startDate?: string

  /** End date (optional, defaults to today) */
  endDate?: string
}

/**
 * Complete trend analysis response
 */
export interface TrendAnalysisResponse {
  success: boolean

  data?: {
    /** Period information */
    period: {
      start: string
      end: string
      days: number
    }

    /** Individual investor trends */
    investors: {
      foreign: InvestorTrendData
      institution: InvestorTrendData
      retail: InvestorTrendData
      prop: InvestorTrendData
    }

    /** Combined trend points */
    combined: CombinedTrendPoint[]

    /** Detected patterns */
    patterns: DetectedPattern[]

    /** Overall summary */
    summary: {
      /** Total smart money flow */
      totalSmartMoneyFlow: number

      /** Dominant trend */
      dominantTrend: TrendDirection

      /** Primary driver */
      primaryDriver: 'foreign' | 'institution' | 'retail' | 'prop' | 'none'

      /** Overall signal */
      signal: CombinedSignal

      /** Risk signal */
      riskSignal: RiskSignal
    }
  }

  meta?: {
    /** Response timestamp */
    timestamp: number

    /** Processing time (ms) */
    processingTime: number

    /** Cache status */
    cacheStatus: 'hit' | 'miss'
  }

  error?: string
}
