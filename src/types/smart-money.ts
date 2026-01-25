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
