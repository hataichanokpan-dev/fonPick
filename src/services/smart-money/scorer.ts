/**
 * Smart Money Scorer
 *
 * Scores investor signals to determine smart money positioning.
 * Part of Phase 3: Smart Money & Rotation (P0 - Critical)
 */

import type {
  InvestorAnalysis,
  SignalStrength,
  FlowTrend,
  SmartMoneyInvestor,
  SmartMoneyScoreComponents,
  ThaiMarketContext,
} from '@/types/smart-money'
import type { RTDBInvestorFlow } from '@/types/rtdb'
import { DEFAULT_THAI_CONTEXT } from '@/types/smart-money'

// ============================================================================
// SCORING THRESHOLDS
// ============================================================================

const SCORING_THRESHOLDS = {
  // Signal strength thresholds (Million THB)
  STRONG_BUY: 500,
  BUY: 100,
  STRONG_SELL: -500,
  SELL: -100,

  // Scoring weights (max 50 per investor for smart money)
  MAX_SCORE_PER_INVESTOR: 50,
  BASE_SCORE: 25,

  // Context investor weights (lower than smart money)
  CONTEXT_INVESTOR_WEIGHT: 0.25, // 25% of smart money weight

  // Thai market adjustments
  FOREIGN_WEIGHT_MULTIPLIER: 1.2, // Foreign flows have 1.2x weight in Thai market
  PROP_TRADING_WEIGHT: 0.3, // Prop trading has lower weight
} as const

// ============================================================================
// SIGNAL STRENGTH CLASSIFICATION
// ============================================================================

/**
 * Classify signal strength from net flow
 * @param netFlow Net flow in million THB
 * @returns Signal strength
 */
export function classifySignalStrength(netFlow: number): SignalStrength {
  if (netFlow >= SCORING_THRESHOLDS.STRONG_BUY) {
    return 'Strong Buy'
  }
  if (netFlow >= SCORING_THRESHOLDS.BUY) {
    return 'Buy'
  }
  if (netFlow <= SCORING_THRESHOLDS.STRONG_SELL) {
    return 'Strong Sell'
  }
  if (netFlow <= SCORING_THRESHOLDS.SELL) {
    return 'Sell'
  }
  return 'Neutral'
}

// ============================================================================
// FLOW TREND DETECTION
// ============================================================================

/**
 * Detect flow trend from historical data
 * @param currentNet Current net flow
 * @param historicalNets Historical net flows (most recent first)
 * @returns Flow trend
 */
export function detectFlowTrend(
  currentNet: number,
  historicalNets?: number[]
): FlowTrend {
  if (!historicalNets || historicalNets.length === 0) {
    // Classify based on current value only
    if (currentNet > SCORING_THRESHOLDS.BUY) return 'Stable Buy'
    if (currentNet < SCORING_THRESHOLDS.SELL) return 'Stable Sell'
    return 'Neutral'
  }

  // Calculate average of recent flows
  const avgFlow = historicalNets.reduce((sum, n) => sum + n, 0) / historicalNets.length

  // Calculate change from average to current
  const change = currentNet - avgFlow

  // Determine trend
  if (currentNet > SCORING_THRESHOLDS.BUY) {
    if (change > 100) return 'Accelerating Buy'
    if (change > 20) return 'Stable Buy'
    return 'Decreasing Buy'
  }

  if (currentNet < SCORING_THRESHOLDS.SELL) {
    if (change < -100) return 'Accelerating Sell'
    if (change < -20) return 'Stable Sell'
    return 'Decreasing Sell'
  }

  // Near neutral
  if (change > 50) return 'Decreasing Sell'
  if (change < -50) return 'Decreasing Buy'

  return 'Neutral'
}

// ============================================================================
// INVESTOR SCORING
// ============================================================================

/**
 * Score individual investor signal
 * @param investor Investor type
 * @param flow Investor flow data
 * @param historicalFlow Historical flow data (optional)
 * @returns Investor analysis with score
 */
export function scoreInvestorSignal(
  investor: SmartMoneyInvestor,
  flow: RTDBInvestorFlow,
  historicalFlow?: RTDBInvestorFlow[]
): InvestorAnalysis {
  const todayNet = flow.net

  // Classify signal strength
  const strength = classifySignalStrength(todayNet)

  // Detect trend
  const historicalNets = historicalFlow?.map(f => f.net)
  const trend = detectFlowTrend(todayNet, historicalNets)

  // Calculate 5-day cumulative
  const trend5Day = historicalFlow?.slice(0, 5).reduce((sum, f) => sum + f.net, 0) || 0
  const avg5Day = historicalFlow?.slice(0, 5).reduce((sum, f, _, arr) => sum + f.net / arr.length, 0) || 0

  const vsAverage = historicalFlow && historicalFlow.length > 0
    ? todayNet - avg5Day
    : 0

  // Calculate confidence
  const confidence = calculateInvestorConfidence(strength, trend, todayNet)

  return {
    investor,
    todayNet,
    strength,
    trend,
    confidence,
    trend5Day,
    avg5Day,
    vsAverage,
  }
}

/**
 * Calculate investor signal confidence
 * @param strength Signal strength
 * @param trend Flow trend
 * @param netFlow Net flow value
 * @returns Confidence score (0-100)
 */
function calculateInvestorConfidence(
  strength: SignalStrength,
  trend: FlowTrend,
  netFlow: number
): number {
  let confidence = 50 // Base confidence

  // Strong signals get higher confidence
  if (strength === 'Strong Buy' || strength === 'Strong Sell') {
    confidence += 25
  } else if (strength === 'Buy' || strength === 'Sell') {
    confidence += 15
  }

  // Accelerating trends increase confidence
  if (trend.includes('Accelerating')) {
    confidence += 15
  } else if (trend.includes('Stable')) {
    confidence += 10
  }

  // Large flows increase confidence
  const absFlow = Math.abs(netFlow)
  if (absFlow > 1000) {
    confidence += 10
  } else if (absFlow > 500) {
    confidence += 5
  }

  return Math.min(100, confidence)
}

// ============================================================================
// SMART MONEY SCORING
// ============================================================================

/**
 * Calculate combined smart money score
 * @param foreign Foreign investor analysis
 * @param institution Institution investor analysis
 * @param retail Retail investor analysis (optional)
 * @param prop Prop investor analysis (optional)
 * @returns Smart money score components
 */
export function calculateSmartMoneyScore(
  foreign: InvestorAnalysis,
  institution: InvestorAnalysis,
  retail?: InvestorAnalysis,
  prop?: InvestorAnalysis
): SmartMoneyScoreComponents {
  // Calculate foreign score (0-50)
  const foreignScore = calculateIndividualScore(foreign) * SCORING_THRESHOLDS.FOREIGN_WEIGHT_MULTIPLIER

  // Calculate institution score (0-50)
  const institutionScore = calculateIndividualScore(institution)

  // Calculate context investor scores (0-25 each)
  const retailScore = retail ? calculateIndividualScore(retail) * SCORING_THRESHOLDS.CONTEXT_INVESTOR_WEIGHT : 0
  const propScore = prop ? calculateIndividualScore(prop) * SCORING_THRESHOLDS.CONTEXT_INVESTOR_WEIGHT : 0

  // Total score (0-100, weighted towards smart money)
  const smartMoneyTotal = Math.min(100, foreignScore + institutionScore)
  const contextTotal = retailScore + propScore
  const totalScore = Math.min(100, smartMoneyTotal * 0.8 + contextTotal * 0.2)

  return {
    foreignScore: Math.min(50, foreignScore),
    institutionScore: Math.min(50, institutionScore),
    retailScore: Math.min(25, retailScore),
    propScore: Math.min(25, propScore),
    totalScore,
  }
}

/**
 * Calculate individual investor score (0-50)
 * @param analysis Investor analysis
 * @returns Score (0-50)
 */
function calculateIndividualScore(analysis: InvestorAnalysis): number {
  let score = SCORING_THRESHOLDS.BASE_SCORE // Start at 25

  // Adjust based on signal strength
  switch (analysis.strength) {
    case 'Strong Buy':
      score += 20
      break
    case 'Buy':
      score += 10
      break
    case 'Strong Sell':
      score -= 20
      break
    case 'Sell':
      score -= 10
      break
    default:
      // Neutral - no adjustment
      break
  }

  // Adjust based on trend
  if (analysis.trend === 'Accelerating Buy') {
    score += 5
  } else if (analysis.trend === 'Accelerating Sell') {
    score -= 5
  }

  // Adjust based on 5-day trend
  if (analysis.trend5Day > 200) {
    score += 3
  } else if (analysis.trend5Day < -200) {
    score -= 3
  }

  return Math.max(0, Math.min(50, score))
}

// ============================================================================
// CONFIDENCE CALCULATION
// ============================================================================

/**
 * Calculate overall smart money confidence
 * @param foreign Foreign investor analysis
 * @param institution Institution investor analysis
 * @param retail Retail investor analysis (optional)
 * @param prop Prop investor analysis (optional)
 * @returns Overall confidence (0-100)
 */
export function calculateOverallConfidence(
  foreign: InvestorAnalysis,
  institution: InvestorAnalysis,
  _retail?: InvestorAnalysis,
  _prop?: InvestorAnalysis
): number {
  // Average of smart money investor confidences
  const smartMoneyConfidence = (foreign.confidence + institution.confidence) / 2

  // Boost if both agree
  const bothBullish = (foreign.strength === 'Buy' || foreign.strength === 'Strong Buy') &&
                      (institution.strength === 'Buy' || institution.strength === 'Strong Buy')
  const bothBearish = (foreign.strength === 'Sell' || foreign.strength === 'Strong Sell') &&
                      (institution.strength === 'Sell' || institution.strength === 'Strong Sell')

  if (bothBullish || bothBearish) {
    return Math.min(100, smartMoneyConfidence + 10)
  }

  // Reduce if they disagree
  const disagreeing = (foreign.strength.includes('Buy') && institution.strength.includes('Sell')) ||
                      (foreign.strength.includes('Sell') && institution.strength.includes('Buy'))

  if (disagreeing) {
    return Math.max(0, smartMoneyConfidence - 15)
  }

  return smartMoneyConfidence
}

// ============================================================================
// THAI MARKET SPECIFIC
// ============================================================================

/**
 * Apply Thai market context to scoring
 * @param score Base score
 * @param foreignNet Foreign net flow
 * @param context Thai market context
 * @returns Adjusted score
 */
export function applyThaiMarketContext(
  score: number,
  foreignNet: number,
  context: ThaiMarketContext = DEFAULT_THAI_CONTEXT
): number {
  let adjustedScore = score

  // Foreign flows have amplified impact in Thai market
  if (foreignNet > 0) {
    adjustedScore *= context.foreignImpactFactor
  }

  return Math.min(100, Math.max(0, adjustedScore))
}

// ============================================================================
// TREND STRENGTH CALCULATION
// ============================================================================

/**
 * Calculate trend strength from historical data
 * @param historicalFlows Historical flow data
 * @returns Trend strength (0-100)
 */
export function calculateTrendStrength(historicalFlows: number[]): number {
  if (historicalFlows.length < 2) {
    return 50 // Neutral if insufficient data
  }

  // Calculate linear regression slope
  const n = historicalFlows.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += historicalFlows[i]
    sumXY += i * historicalFlows[i]
    sumX2 += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

  // Convert slope to strength score
  const avgFlow = sumY / n
  const relativeSlope = Math.abs(slope / (Math.abs(avgFlow) + 1))

  // Scale to 0-100 (0.5 slope = 100 strength)
  return Math.min(100, relativeSlope * 200)
}

// ============================================================================
// EXPORTS
// ============================================================================
