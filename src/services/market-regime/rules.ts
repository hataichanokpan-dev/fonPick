/**
 * Market Regime Detection Rules
 *
 * Deterministic rules for classifying market regime
 * Based on SET index, investor flows, sector behavior, and liquidity
 */

import type { RegimeInput, MarketRegime, RegimeConfidence } from './types'

/**
 * Default threshold values for regime detection
 */
const DEFAULT_THRESHOLDS = {
  SET_CHANGE_STRONG: 0.5, // % change considered strong
  SET_CHANGE_WEAK: -0.5, // % change considered weak
  STRONG_FLOW: 100, // Strong net flow in million THB
  WEAK_FLOW: -100, // Weak net flow in million THB
  HIGH_LIQUIDITY: 1.2, // Above average volume
  LOW_LIQUIDITY: 0.8, // Below average volume
} as const

/**
 * Calculate Risk-On score based on input parameters
 * @param input Regime detection input
 * @returns Risk-On score (0-10)
 */
export function calculateRiskOnScore(input: RegimeInput): number {
  let score = 0

  // Rule 1: SET Direction (max 2 points)
  if (input.setChange > DEFAULT_THRESHOLDS.SET_CHANGE_STRONG) {
    score += 2
  } else if (input.setChange > 0) {
    score += 1
  }

  // Rule 2: Smart Money Flow - Foreign (max 2 points)
  if (input.investorFlow.foreignNet > DEFAULT_THRESHOLDS.STRONG_FLOW) {
    score += 2
  } else if (input.investorFlow.foreignNet > 0) {
    score += 1
  }

  // Rule 3: Smart Money Flow - Institution (max 2 points)
  if (input.investorFlow.institutionNet > DEFAULT_THRESHOLDS.STRONG_FLOW) {
    score += 2
  } else if (input.investorFlow.institutionNet > 0) {
    score += 1
  }

  // Rule 4: Sector Behavior (max 2 points)
  const cyclicalsOutperforming =
    input.sectors.overallPerformance > input.sectors.defensivePerformance

  if (cyclicalsOutperforming && input.setChange > 0) {
    score += 2
  } else if (input.sectors.overallPerformance > 0) {
    score += 1
  }

  // Rule 5: Liquidity (max 2 points)
  if (input.liquidity > DEFAULT_THRESHOLDS.HIGH_LIQUIDITY) {
    score += 2
  } else if (input.liquidity > 1) {
    score += 1
  }

  return score
}

/**
 * Calculate Risk-Off score based on input parameters
 * @param input Regime detection input
 * @returns Risk-Off score (0-10)
 */
export function calculateRiskOffScore(input: RegimeInput): number {
  let score = 0

  // Rule 1: SET Direction (max 2 points)
  if (input.setChange < DEFAULT_THRESHOLDS.SET_CHANGE_WEAK) {
    score += 2
  } else if (input.setChange < 0) {
    score += 1
  }

  // Rule 2: Smart Money Flow - Foreign (max 2 points)
  if (input.investorFlow.foreignNet < DEFAULT_THRESHOLDS.WEAK_FLOW) {
    score += 2
  } else if (input.investorFlow.foreignNet < 0) {
    score += 1
  }

  // Rule 3: Smart Money Flow - Institution (max 2 points)
  if (input.investorFlow.institutionNet < DEFAULT_THRESHOLDS.WEAK_FLOW) {
    score += 2
  } else if (input.investorFlow.institutionNet < 0) {
    score += 1
  }

  // Rule 4: Sector Behavior (max 2 points)
  const defensivesOutperforming =
    input.sectors.defensivePerformance > input.sectors.overallPerformance

  if (defensivesOutperforming && input.setChange < 0) {
    score += 2 // Strong confirmation of Risk-Off
  } else if (defensivesOutperforming) {
    score += 1
  }

  // Rule 5: Liquidity (max 2 points)
  if (input.liquidity < DEFAULT_THRESHOLDS.LOW_LIQUIDITY) {
    score += 2
  } else if (input.liquidity < 1) {
    score += 1
  }

  return score
}

/**
 * Determine market regime from scores
 * @param riskOnScore Risk-On score (0-10)
 * @param riskOffScore Risk-Off score (0-10)
 * @returns Market regime and confidence
 */
export function determineRegime(
  riskOnScore: number,
  riskOffScore: number
): { regime: MarketRegime; confidence: RegimeConfidence } {
  const scoreDiff = riskOnScore - riskOffScore

  if (scoreDiff >= 2) {
    // Risk-On
    const confidence: RegimeConfidence = riskOnScore >= 7 ? 'High' : 'Medium'
    return { regime: 'Risk-On', confidence }
  } else if (scoreDiff <= -2) {
    // Risk-Off
    const confidence: RegimeConfidence = riskOffScore >= 7 ? 'High' : 'Medium'
    return { regime: 'Risk-Off', confidence }
  } else {
    // Neutral - close scores
    const totalScore = riskOnScore + riskOffScore
    const confidence: RegimeConfidence = totalScore >= 10 ? 'Medium' : 'Low'
    return { regime: 'Neutral', confidence }
  }
}

/**
 * Generate regime-specific focus guidance
 * @param regime Market regime
 * @returns Focus guidance text
 */
export function generateFocusGuidance(regime: MarketRegime): string {
  const focusMap: Record<MarketRegime, string> = {
    'Risk-On': 'Focus on cyclical sectors and growth stocks. Market favors risk-taking.',
    'Neutral': 'Market lacks clear direction. Stay selective, focus on quality names.',
    'Risk-Off': 'Focus on defensive sectors and cash preservation. Caution advised.',
  }

  return focusMap[regime]
}

/**
 * Generate regime-specific caution guidance
 * @param regime Market regime
 * @returns Caution guidance text
 */
export function generateCautionGuidance(regime: MarketRegime): string {
  const cautionMap: Record<MarketRegime, string> = {
    'Risk-On': 'Watch for reversal signals. Don\'t chase overextended names.',
    'Neutral': 'Wait for clear market direction before taking large positions.',
    'Risk-Off': 'Avoid catching falling knives. Preserve capital for better opportunities.',
  }

  return cautionMap[regime]
}
