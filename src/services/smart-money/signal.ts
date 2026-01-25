/**
 * Smart Money Signal Generator
 *
 * Generates combined signals and risk-on/off indicators.
 * Part of Phase 3: Smart Money & Rotation (P0 - Critical)
 */

import type {
  SmartMoneyAnalysis,
  SmartMoneyInput,
  CombinedSignal,
  RiskSignal,
  SmartMoneyScoreComponents,
  SmartMoneySignal,
  InvestorAnalysis,
} from '@/types/smart-money'
import type { RTDBInvestorFlow } from '@/types/rtdb'
import { scoreInvestorSignal, calculateSmartMoneyScore, calculateOverallConfidence } from './scorer'

// ============================================================================
// SIGNAL GENERATION
// ============================================================================

/**
 * Generate combined smart money signal
 * @param foreign Foreign investor analysis
 * @param institution Institution investor analysis
 * @returns Combined signal
 */
export function generateCombinedSignal(
  foreign: { strength: string; todayNet: number },
  institution: { strength: string; todayNet: number }
): CombinedSignal {
  // Calculate total net flow
  const totalNet = foreign.todayNet + institution.todayNet

  // Determine combined signal
  if (totalNet >= 600) {
    return 'Strong Buy'
  }
  if (totalNet >= 100) {
    return 'Buy'
  }
  if (totalNet <= -600) {
    return 'Strong Sell'
  }
  if (totalNet <= -100) {
    return 'Sell'
  }

  // Check individual signals
  const foreignBullish = foreign.strength === 'Buy' || foreign.strength === 'Strong Buy'
  const institutionBullish = institution.strength === 'Buy' || institution.strength === 'Strong Buy'
  const foreignBearish = foreign.strength === 'Sell' || foreign.strength === 'Strong Sell'
  const institutionBearish = institution.strength === 'Sell' || institution.strength === 'Strong Sell'

  if (foreignBullish && institutionBullish) {
    return 'Buy'
  }
  if (foreignBearish && institutionBearish) {
    return 'Sell'
  }

  return 'Neutral'
}

/**
 * Generate risk-on/off signal
 * @param combinedSignal Combined smart money signal
 * @param foreign Foreign investor analysis
 * @param scores Smart money scores
 * @returns Risk signal
 */
export function generateRiskOnOffSignal(
  combinedSignal: CombinedSignal,
  _foreign: { todayNet: number; trend5Day: number },
  scores: SmartMoneyScoreComponents
): RiskSignal {
  const { totalScore } = scores

  // High score = Risk-On, Low score = Risk-Off
  if (totalScore >= 70 && combinedSignal === 'Strong Buy') {
    return 'Risk-On'
  }
  if (totalScore >= 60 && combinedSignal === 'Buy') {
    return 'Risk-On Mild'
  }
  if (totalScore <= 30 && combinedSignal === 'Strong Sell') {
    return 'Risk-Off'
  }
  if (totalScore <= 40 && combinedSignal === 'Sell') {
    return 'Risk-Off Mild'
  }

  return 'Neutral'
}

/**
 * Generate smart money signal with full analysis
 * @param scores Smart money scores
 * @param confidence Overall confidence
 * @returns Smart money signal
 */
export function generateSmartMoneySignal(
  scores: SmartMoneyScoreComponents,
  confidence: number
): SmartMoneySignal {
  // Determine signal based on total score
  let signal: CombinedSignal
  if (scores.totalScore >= 70) {
    signal = 'Strong Buy'
  } else if (scores.totalScore >= 55) {
    signal = 'Buy'
  } else if (scores.totalScore <= 30) {
    signal = 'Strong Sell'
  } else if (scores.totalScore <= 45) {
    signal = 'Sell'
  } else {
    signal = 'Neutral'
  }

  // Generate risk signal
  let riskSignal: RiskSignal
  if (scores.totalScore >= 70) {
    riskSignal = 'Risk-On'
  } else if (scores.totalScore >= 55) {
    riskSignal = 'Risk-On Mild'
  } else if (scores.totalScore <= 30) {
    riskSignal = 'Risk-Off'
  } else if (scores.totalScore <= 45) {
    riskSignal = 'Risk-Off Mild'
  } else {
    riskSignal = 'Neutral'
  }

  // Generate evidence
  const evidence = generateSignalEvidence(scores)

  return {
    signal,
    riskSignal,
    scores,
    confidence,
    evidence,
  }
}

/**
 * Generate signal evidence
 * @param scores Smart money scores
 * @returns Evidence strings
 */
function generateSignalEvidence(scores: SmartMoneyScoreComponents): string[] {
  const evidence: string[] = []

  const { foreignScore, institutionScore, totalScore } = scores

  // Foreign evidence
  if (foreignScore >= 35) {
    evidence.push('Foreign investors showing strong buying')
  } else if (foreignScore >= 25) {
    evidence.push('Foreign investors net buying')
  } else if (foreignScore <= 15) {
    evidence.push('Foreign investors showing strong selling')
  } else if (foreignScore <= 20) {
    evidence.push('Foreign investors net selling')
  }

  // Institution evidence
  if (institutionScore >= 35) {
    evidence.push('Institutions showing strong buying')
  } else if (institutionScore >= 25) {
    evidence.push('Institutions net buying')
  } else if (institutionScore <= 15) {
    evidence.push('Institutions showing strong selling')
  } else if (institutionScore <= 20) {
    evidence.push('Institutions net selling')
  }

  // Total evidence
  if (totalScore >= 70) {
    evidence.push('Smart money strongly bullish')
  } else if (totalScore >= 55) {
    evidence.push('Smart money moderately bullish')
  } else if (totalScore <= 30) {
    evidence.push('Smart money strongly bearish')
  } else if (totalScore <= 45) {
    evidence.push('Smart money moderately bearish')
  }

  return evidence.slice(0, 3)
}

// ============================================================================
// PRIMARY DRIVER DETECTION
// ============================================================================

/**
 * Detect which investor is driving the signal
 * @param foreign Foreign investor analysis
 * @param institution Institution investor analysis
 * @param retail Retail investor analysis (optional)
 * @param prop Prop investor analysis (optional)
 * @returns Primary driver
 */
export function detectPrimaryDriver(
  foreign: { todayNet: number; strength: string },
  institution: { todayNet: number; strength: string },
  retail?: { todayNet: number; strength: string },
  prop?: { todayNet: number; strength: string }
): 'foreign' | 'institution' | 'retail' | 'prop' | 'both' | 'none' {
  const absForeign = Math.abs(foreign.todayNet)
  const absInstitution = Math.abs(institution.todayNet)
  const absRetail = retail ? Math.abs(retail.todayNet) : 0
  const absProp = prop ? Math.abs(prop.todayNet) : 0

  // Check if both foreign and institution are strongly in same direction
  const bothStrong = (foreign.strength === 'Strong Buy' || foreign.strength === 'Strong Sell') &&
                     (institution.strength === 'Strong Buy' || institution.strength === 'Strong Sell')

  if (bothStrong && Math.sign(foreign.todayNet) === Math.sign(institution.todayNet)) {
    return 'both'
  }

  // Determine based on magnitude among all investors
  const maxFlow = Math.max(absForeign, absInstitution, absRetail, absProp)

  if (absProp === maxFlow && absProp > absInstitution * 1.5) {
    return 'prop'
  }
  if (absRetail === maxFlow && absRetail > absInstitution * 1.5) {
    return 'retail'
  }
  if (absForeign > absInstitution * 1.5) {
    return 'foreign'
  }
  if (absInstitution > absForeign * 1.5) {
    return 'institution'
  }

  return 'none'
}

// ============================================================================
// RISK CONFIRMATION
// ============================================================================

/**
 * Check if smart money confirms risk-on
 * @param scores Smart money scores
 * @returns True if risk-on confirmed
 */
export function confirmRiskOn(scores: SmartMoneyScoreComponents): boolean {
  return scores.totalScore >= 60
}

/**
 * Check if smart money confirms risk-off
 * @param scores Smart money scores
 * @returns True if risk-off confirmed
 */
export function confirmRiskOff(scores: SmartMoneyScoreComponents): boolean {
  return scores.totalScore <= 40
}

// ============================================================================
// OBSERVATION GENERATION
// ============================================================================

/**
 * Generate smart money observations
 * @param foreign Foreign investor analysis
 * @param institution Institution investor analysis
 * @param retail Retail investor analysis (optional)
 * @param prop Prop investor analysis (optional)
 * @param scores Smart money scores
 * @returns Array of observations
 */
export function generateSmartMoneyObservations(
  foreign: InvestorAnalysis,
  institution: InvestorAnalysis,
  retail?: InvestorAnalysis,
  prop?: InvestorAnalysis,
  _scores?: SmartMoneyScoreComponents
): string[] {
  const observations: string[] = []

  // Foreign observation
  if (foreign.strength === 'Strong Buy') {
    observations.push(`Foreign investors aggressive buying: +${foreign.todayNet.toFixed(0)}M`)
  } else if (foreign.strength === 'Strong Sell') {
    observations.push(`Foreign investors aggressive selling: ${foreign.todayNet.toFixed(0)}M`)
  } else if (foreign.todayNet !== 0) {
    observations.push(`Foreign flow: ${foreign.todayNet >= 0 ? '+' : ''}${foreign.todayNet.toFixed(0)}M`)
  }

  // Institution observation
  if (institution.strength === 'Strong Buy') {
    observations.push(`Institutions strong buying: +${institution.todayNet.toFixed(0)}M`)
  } else if (institution.strength === 'Strong Sell') {
    observations.push(`Institutions strong selling: ${institution.todayNet.toFixed(0)}M`)
  } else if (institution.todayNet !== 0) {
    observations.push(`Institution flow: ${institution.todayNet >= 0 ? '+' : ''}${institution.todayNet.toFixed(0)}M`)
  }

  // Combined observation
  const totalNet = foreign.todayNet + institution.todayNet
  if (totalNet > 500) {
    observations.push('Strong combined smart money buying')
  } else if (totalNet < -500) {
    observations.push('Strong combined smart money selling')
  }

  // Prop observation (Thai market specific)
  if (prop) {
    if (prop.strength === 'Strong Sell' && Math.abs(prop.todayNet) < 200) {
      observations.push('Prop firms reducing sell volume (bullish)')
    } else if (prop.strength === 'Strong Sell') {
      observations.push('Prop firms heavy selling (caution)')
    }
  }

  // Retail observation
  if (retail && retail.todayNet !== 0) {
    if (retail.todayNet > 500) {
      observations.push('Retail investors showing strong interest')
    } else if (retail.todayNet < -500) {
      observations.push('Retail investors exiting positions')
    }
  }

  // Trend observation
  if (foreign.trend.includes('Accelerating') || institution.trend.includes('Accelerating')) {
    observations.push('Smart money flow accelerating')
  }

  return observations.slice(0, 4)
}

// ============================================================================
// MAIN ANALYZER
// ============================================================================

/**
 * Perform complete smart money analysis
 * @param input Smart money input
 * @returns Complete smart money analysis
 */
export function analyzeSmartMoney(input: SmartMoneyInput): SmartMoneyAnalysis {
  const { current, historical, options: _options } = input

  // Analyze each investor
  const historicalForeign = historical?.map(h => h.foreign)
  const historicalInstitution = historical?.map(h => h.institution)
  const historicalRetail = historical?.map(h => h.retail)
  const historicalProp = historical?.map(h => h.prop)

  const foreign = scoreInvestorSignal('foreign', current.foreign, historicalForeign)
  const institution = scoreInvestorSignal('institution', current.institution, historicalInstitution)
  const retail = scoreInvestorSignal('retail', current.retail, historicalRetail)
  const prop = scoreInvestorSignal('prop', current.prop, historicalProp)

  // Calculate scores
  const scores = calculateSmartMoneyScore(foreign, institution, retail, prop)

  // Calculate overall confidence
  const confidence = calculateOverallConfidence(foreign, institution, retail, prop)

  // Generate signals
  const combinedSignal = generateCombinedSignal(foreign, institution)
  const riskSignal = generateRiskOnOffSignal(combinedSignal, foreign, scores)

  // Detect primary driver
  const primaryDriver = detectPrimaryDriver(foreign, institution, retail, prop)

  // Generate observations
  const observations = generateSmartMoneyObservations(foreign, institution, retail, prop, scores)

  // Check risk confirmations
  const riskOnConfirmed = confirmRiskOn(scores)
  const riskOffConfirmed = confirmRiskOff(scores)

  return {
    investors: {
      foreign,
      institution,
      retail,
      prop,
    },
    combinedSignal,
    riskSignal,
    score: scores.totalScore,
    confidence,
    observations,
    primaryDriver,
    riskOnConfirmed,
    riskOffConfirmed,
    timestamp: current.timestamp,
  }
}

// ============================================================================
// THAI MARKET SPECIFIC
// ============================================================================

/**
 * Analyze prop trading impact (Thai market specific)
 * @param propFlow Prop trading flow
 * @returns Prop trading analysis
 */
export function analyzePropTrading(propFlow: RTDBInvestorFlow): {
  netFlow: number
  activity: 'High' | 'Normal' | 'Low'
  impact: 'Amplifying Risk' | 'Reducing Risk' | 'Neutral'
  signal: string
  reducingSellVolume: boolean
} {
  const absFlow = Math.abs(propFlow.net)

  // Determine activity level
  let activity: 'High' | 'Normal' | 'Low'
  if (absFlow > 1000) {
    activity = 'High'
  } else if (absFlow > 300) {
    activity = 'Normal'
  } else {
    activity = 'Low'
  }

  // Determine impact
  let impact: 'Amplifying Risk' | 'Reducing Risk' | 'Neutral'
  let signal = ''
  let reducingSellVolume = false

  if (propFlow.net > 0) {
    // Prop buying - usually neutral or slightly bullish
    impact = 'Neutral'
    signal = 'Prop firms net buying'
  } else if (propFlow.net < 0) {
    // Prop selling
    if (absFlow < 200) {
      // Light selling by prop - might be reducing sell volume
      impact = 'Reducing Risk'
      signal = 'Prop firms reducing sell volume'
      reducingSellVolume = true
    } else {
      // Heavy selling by prop - amplifying risk
      impact = 'Amplifying Risk'
      signal = 'Prop firms heavy selling'
    }
  } else {
    impact = 'Neutral'
    signal = 'Prop firms flat'
  }

  return {
    netFlow: propFlow.net,
    activity,
    impact,
    signal,
    reducingSellVolume,
  }
}

// ============================================================================
// EXPORTS
// ============================================================================
