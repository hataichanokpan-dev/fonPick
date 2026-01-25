/**
 * Insights Types
 *
 * Actionable insights generation and Q&A engine.
 * Combines all analyses to answer 6 investment questions.
 */

import type { MarketBreadthAnalysis } from './market-breadth'
import type { SectorRotationAnalysis } from './sector-rotation'
import type { SmartMoneyAnalysis } from './smart-money'
import type { RankingsSectorMap } from './sector-rotation'

// ============================================================================
// INVESTMENT QUESTIONS (6 QUESTIONS)
// ============================================================================

/**
 * The 6 investment questions that fonPick answers
 */
export enum InvestmentQuestion {
  /** Q1: How about market now? Aggressive vol or not? */
  MarketVolatility = 'Q1_MARKET_VOLATILITY',

  /** Q2: What sector is heavy market up or down because xxx sector? */
  SectorLeadership = 'Q2_SECTOR_LEADERSHIP',

  /** Q3: Risk on because Foreign Investor is strong buy or Prop reduce sell vol? */
  RiskOnOff = 'Q3_RISK_ON_OFF',

  /** Q4: What current trade and what sector need to focus? */
  TradingFocus = 'Q4_TRADING_FOCUS',

  /** Q5: How top ranking effect to market? */
  RankingsImpact = 'Q5_RANKINGS_IMPACT',

  /** Q6: What we see in top ranking compare with sector? */
  RankingsVsSector = 'Q6_RANKINGS_VS_SECTOR',
}

// ============================================================================
// QUESTION ANSWER STRUCTURE
// ============================================================================

/**
 * Single investment question answer
 */
export interface QuestionAnswer {
  /** Question enum */
  question: InvestmentQuestion

  /** Question title */
  title: string

  /** Answer summary (1-2 sentences) */
  summary: string

  /** Detailed explanation */
  explanation: string

  /** Supporting evidence points */
  evidence: string[]

  /** Confidence in answer (0-100) */
  confidence: number

  /** Actionable recommendation */
  recommendation?: string

  /** Related data points */
  dataPoints: Record<string, number | string>

  /** Answer timestamp */
  timestamp: number
}

/**
 * All 6 investment question answers
 */
export interface InvestmentAnswers {
  /** Q1: Market volatility answer */
  q1_volatility: QuestionAnswer

  /** Q2: Sector leadership answer */
  q2_sectorLeadership: QuestionAnswer

  /** Q3: Risk-On/Off answer */
  q3_riskOnOff: QuestionAnswer

  /** Q4: Trading focus answer */
  q4_tradingFocus: QuestionAnswer

  /** Q5: Rankings impact answer */
  q5_rankingsImpact: QuestionAnswer

  /** Q6: Rankings vs Sector answer */
  q6_rankingsVsSector: QuestionAnswer

  /** Overall market verdict */
  verdict: MarketVerdict

  /** Timestamp of answers */
  timestamp: number
}

// ============================================================================
// MARKET VERDICT
// ============================================================================

/**
 * Overall market verdict
 */
export type MarketVerdictType =
  | 'Strong Buy'    // Multiple bullish signals
  | 'Buy'           // Bullish signals dominate
  | 'Hold'          // Mixed signals
  | 'Sell'          // Bearish signals dominate (alias for Reduce)
  | 'Reduce'        // Bearish signals dominate (alias for Sell)
  | 'Strong Sell'   // Multiple bearish signals

/**
 * Market verdict with detailed breakdown
 */
export interface MarketVerdict {
  /** Verdict type */
  verdict: MarketVerdictType

  /** Overall confidence (0-100) */
  confidence: number

  /** Bullish factors */
  bullishFactors: string[]

  /** Bearish factors */
  bearishFactors: string[]

  /** Neutral factors */
  neutralFactors: string[]

  /** Verdict rationale */
  rationale: string
}

// ============================================================================
// ACTIONABLE INSIGHTS
// ============================================================================

/**
 * Trading recommendation
 */
export interface TradingRecommendation {
  /** Action to take */
  action: 'Buy' | 'Sell' | 'Hold' | 'Wait'

  /** Target sectors */
  sectors: string[]

  /** Position sizing recommendation */
  positionSize: 'Full' | 'Partial' | 'Light' | 'None'

  /** Timeframe */
  timeframe: 'Day' | 'Week' | 'Month'

  /** Rationale */
  rationale: string
}

/**
 * Sector focus recommendation
 */
export interface SectorFocus {
  /** Sector name */
  sector: string

  /** Focus level */
  level: 'High' | 'Medium' | 'Low' | 'Avoid'

  /** Reason for focus level */
  reason: string

  /** Suggested action */
  action: 'Accumulate' | 'Hold' | 'Reduce' | 'Exit'
}

/**
 * Complete actionable insights
 * Answers Question #4: "What current trade and what sector need to focus?"
 */
export interface ActionableInsights {
  /** All 6 question answers */
  answers: InvestmentAnswers

  /** Trading recommendation */
  trading: TradingRecommendation

  /** Sector focus list */
  sectorFocus: SectorFocus[]

  /** Key themes to watch */
  themes: string[]

  /** Risk warnings */
  warnings: string[]

  /** Confidence levels summary */
  confidence: {
    overall: number
    breakdown: Record<string, number>
  }

  /** Timestamp */
  timestamp: number
}

// ============================================================================
// INSIGHTS INPUT
// ============================================================================

/**
 * Input data for insights generation
 */
export interface InsightInputs {
  /** Market breadth analysis */
  breadth?: MarketBreadthAnalysis

  /** Sector rotation analysis */
  sectorRotation?: SectorRotationAnalysis

  /** Smart money analysis */
  smartMoney?: SmartMoneyAnalysis

  /** Rankings-sector mapping */
  rankingsMap?: RankingsSectorMap

  /** SET index data */
  setIndex?: {
    index: number
    change: number
    changePercent: number
  }

  /** Generation options */
  options?: InsightsOptions
}

/**
 * Options for insights generation
 */
export interface InsightsOptions {
  /** Include detailed explanations (default: true) */
  includeDetailed?: boolean

  /** Number of evidence points per question (default: 3) */
  evidenceCount?: number

  /** Minimum confidence threshold (default: 50) */
  minConfidence?: number

  /** Focus sectors to prioritize (default: auto-detect) */
  focusSectors?: string[]
}

// ============================================================================
// INSIGHT TEMPLATES
// ============================================================================

/**
 * Answer template for each question type
 */
export interface AnswerTemplate {
  /** Question enum */
  question: InvestmentQuestion

  /** Title template */
  title: string

  /** Summary template (with placeholders) */
  summaryTemplate: string

  /** Required data points */
  requiredData: string[]

  /** Confidence factors */
  confidenceFactors: string[]
}

/**
 * Default answer templates
 */
export const ANSWER_TEMPLATES: Record<InvestmentQuestion, AnswerTemplate> = {
  [InvestmentQuestion.MarketVolatility]: {
    question: InvestmentQuestion.MarketVolatility,
    title: 'Market Volatility',
    summaryTemplate: '{volatility} volatility detected. Breadth is {breadthStatus} with {adRatio} A/D ratio.',
    requiredData: ['volatility', 'breadthStatus', 'adRatio'],
    confidenceFactors: ['breadth confidence', 'historical consistency'],
  },

  [InvestmentQuestion.SectorLeadership]: {
    question: InvestmentQuestion.SectorLeadership,
    title: 'Sector Leadership',
    summaryTemplate: '{leaders} leading the market. {pattern} pattern detected.',
    requiredData: ['leaders', 'pattern'],
    confidenceFactors: ['sector concentration', 'volume confirmation'],
  },

  [InvestmentQuestion.RiskOnOff]: {
    question: InvestmentQuestion.RiskOnOff,
    title: 'Risk-On/Off Signal',
    summaryTemplate: '{riskSignal} mode. {primaryDriver} is the primary driver.',
    requiredData: ['riskSignal', 'primaryDriver'],
    confidenceFactors: ['smart money score', 'flow consistency'],
  },

  [InvestmentQuestion.TradingFocus]: {
    question: InvestmentQuestion.TradingFocus,
    title: 'Trading Focus',
    summaryTemplate: 'Focus on {focusSectors}. {action} recommended.',
    requiredData: ['focusSectors', 'action'],
    confidenceFactors: ['signal alignment', 'regime confirmation'],
  },

  [InvestmentQuestion.RankingsImpact]: {
    question: InvestmentQuestion.RankingsImpact,
    title: 'Top Rankings Impact',
    summaryTemplate: '{dominantSectors} dominating rankings. Concentration: {concentration}%',
    requiredData: ['dominantSectors', 'concentration'],
    confidenceFactors: ['ranking breadth', 'sector alignment'],
  },

  [InvestmentQuestion.RankingsVsSector]: {
    question: InvestmentQuestion.RankingsVsSector,
    title: 'Rankings vs Sector',
    summaryTemplate: '{anomalyCount} anomalies detected. {correlation} correlation.',
    requiredData: ['anomalyCount', 'correlation'],
    confidenceFactors: ['data alignment', 'anomaly significance'],
  },
}

// ============================================================================
// INSIGHT OUTPUT FORMATS
// ============================================================================

/**
 * Insights summary for quick viewing
 */
export interface InsightsSummary {
  /** Overall verdict */
  verdict: MarketVerdictType

  /** Key takeaway (1 sentence) */
  takeaway: string

  /** Top 3 focus sectors */
  topSectors: string[]

  /** Risk level */
  riskLevel: 'Low' | 'Medium' | 'High'

  /** Overall confidence */
  confidence: number
}

/**
 * Detailed insights for full report
 */
export interface DetailedInsights {
  /** All question answers */
  answers: InvestmentAnswers

  /** Trading recommendations */
  recommendations: TradingRecommendation[]

  /** Sector focus details */
  sectorDetails: SectorFocus[]

  /** Risk warnings */
  risks: string[]

  /** Opportunities */
  opportunities: string[]

  /** Action items */
  actionItems: string[]
}
