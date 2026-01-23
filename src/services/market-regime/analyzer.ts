/**
 * Market Regime Analyzer
 *
 * Main analyzer that combines rules and generates final regime result
 */

import type { RegimeInput, RegimeResult, MarketDataForRegime, RegimeAnalysisOptions } from './types'
import {
  calculateRiskOnScore,
  calculateRiskOffScore,
  determineRegime,
  generateFocusGuidance,
  generateCautionGuidance,
} from './rules'

/**
 * Analyze market regime from input data
 * @param input Regime detection input
 * @returns Regime analysis result
 */
export function analyzeRegime(input: RegimeInput): RegimeResult {
  // Calculate scores
  const riskOnScore = calculateRiskOnScore(input)
  const riskOffScore = calculateRiskOffScore(input)

  // Determine regime
  const { regime, confidence } = determineRegime(riskOnScore, riskOffScore)

  // Generate reasons based on scores
  const reasons = generateRegimeReasons(input, riskOnScore, riskOffScore, regime)

  // Generate guidance
  const focus = generateFocusGuidance(regime)
  const caution = generateCautionGuidance(regime)

  return {
    regime,
    confidence,
    reasons,
    focus,
    caution,
    scores: {
      riskOn: riskOnScore,
      riskOff: riskOffScore,
    },
  }
}

/**
 * Generate regime explanation reasons
 * @param input Regime input data
 * @param riskOnScore Risk-On score
 * @param riskOffScore Risk-Off score
 * @param regime Determined regime
 * @returns Array of reason strings
 */
function generateRegimeReasons(
  input: RegimeInput,
  _riskOnScore: number,
  _riskOffScore: number,
  _regime: 'Risk-On' | 'Neutral' | 'Risk-Off'
): string[] {
  const reasons: string[] = []

  // SET Index direction
  if (input.setChange > 0.5) {
    reasons.push('SET index showing strong positive momentum')
  } else if (input.setChange > 0) {
    reasons.push('SET index modestly positive')
  } else if (input.setChange < -0.5) {
    reasons.push('SET index under significant pressure')
  } else if (input.setChange < 0) {
    reasons.push('SET index slightly negative')
  }

  // Smart money flow
  const totalSmartFlow = input.investorFlow.foreignNet + input.investorFlow.institutionNet

  if (totalSmartFlow > 200) {
    reasons.push('Strong buying from smart money (foreign + institution)')
  } else if (totalSmartFlow > 0) {
    reasons.push('Modest net buying from smart money')
  } else if (totalSmartFlow < -200) {
    reasons.push('Heavy selling from smart money')
  } else if (totalSmartFlow < 0) {
    reasons.push('Modest net selling from smart money')
  }

  // Sector behavior
  const defensivesLeading = input.sectors.defensivePerformance > input.sectors.overallPerformance

  if (defensivesLeading && input.setChange < 0) {
    reasons.push('Defensive sectors outperforming - classic risk-off pattern')
  } else if (!defensivesLeading && input.setChange > 0) {
    reasons.push('Cyclical sectors leading - risk-on behavior')
  } else if (input.sectors.overallPerformance > 0) {
    reasons.push('Broad sector participation in positive territory')
  }

  // Liquidity
  if (input.liquidity > 1.2) {
    reasons.push('Above-average trading volume supports market move')
  } else if (input.liquidity < 0.8) {
    reasons.push('Below-average volume suggests weak conviction')
  }

  // Limit to 3 most important reasons
  return reasons.slice(0, 3)
}

/**
 * Build regime input from market data
 * @param marketData Market data from RTDB
 * @returns Regime input or null if data insufficient
 */
export function buildRegimeInput(
  marketData: MarketDataForRegime
): RegimeInput | null {
  if (!marketData.overview) {
    return null
  }

  const setChange = marketData.overview.set.changePercent

  // Get investor flow data
  let foreignNet = 0
  let institutionNet = 0

  if (marketData.investor) {
    foreignNet = marketData.investor.foreign.net
    institutionNet = marketData.investor.institution.net
  }

  // Get sector data (simplified - would need sector analysis)
  let defensivePerformance = 0
  let overallPerformance = 0

  if (marketData.sector && marketData.sector.sectors.length > 0) {
    const allSectors = marketData.sector.sectors
    overallPerformance =
      allSectors.reduce((sum, s) => sum + s.changePercent, 0) / allSectors.length

    // Define defensive sectors
    const defensiveKeywords = ['food', 'health', 'utility', 'telecom', 'property']
    const defensiveSectors = allSectors.filter((s) =>
      defensiveKeywords.some((keyword) => s.name.toLowerCase().includes(keyword))
    )

    if (defensiveSectors.length > 0) {
      defensivePerformance =
        defensiveSectors.reduce((sum, s) => sum + s.changePercent, 0) /
        defensiveSectors.length
    }
  }

  // Liquidity indicator (simplified - using 1.0 as baseline)
  // In real implementation, would compare to historical average volume
  const liquidity = 1.0

  return {
    setChange,
    investorFlow: {
      foreignNet,
      institutionNet,
    },
    sectors: {
      defensivePerformance,
      overallPerformance,
    },
    liquidity,
  }
}

/**
 * Analyze regime with options
 * @param marketData Market data from RTDB
 * @param options Analysis options
 * @returns Regime analysis result or null if data insufficient
 */
export function analyzeMarketRegime(
  marketData: MarketDataForRegime,
  _options?: RegimeAnalysisOptions
): RegimeResult | null {
  const input = buildRegimeInput(marketData)

  if (!input) {
    return null
  }

  return analyzeRegime(input)
}
