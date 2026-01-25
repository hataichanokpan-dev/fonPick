/**
 * Q&A Engine
 *
 * Answers the 6 investment questions.
 * Part of Phase 4: Insights Generation (P0 - Critical)
 */

import type {
  InvestmentAnswers,
  QuestionAnswer,
  InsightInputs,
} from '@/types/insights'
import { InvestmentQuestion, ANSWER_TEMPLATES } from '@/types/insights'
import type { SectorRotationAnalysis } from '@/types/sector-rotation'

// ============================================================================
// QUESTION 1: MARKET VOLATILITY
// ============================================================================

/**
 * Answer Question 1: "How about market now? Aggressive vol or not?"
 * @param inputs Analysis inputs
 * @returns Question 1 answer
 */
export function answerQuestion1_Volatility(inputs: InsightInputs): QuestionAnswer {
  const template = ANSWER_TEMPLATES[InvestmentQuestion.MarketVolatility]

  // Get key data with null safety
  const volatility = inputs.breadth?.volatility || 'Moderate'
  const breadthStatus = inputs.breadth?.status || 'Neutral'
  const adRatio = inputs.breadth?.metrics?.adRatio || 1

  // Generate summary
  const summary = template.summaryTemplate
    .replace('{volatility}', volatility)
    .replace('{breadthStatus}', breadthStatus.toLowerCase())
    .replace('{adRatio}', adRatio.toFixed(2))

  // Generate explanation
  const explanation = `Market volatility is ${volatility.toLowerCase()}. ` +
    `Breadth status is ${breadthStatus.toLowerCase()} with an A/D ratio of ${adRatio.toFixed(2)}. ` +
    `This indicates ${volatility === 'Aggressive' ? 'high' : volatility === 'Calm' ? 'low' : 'moderate'} ` +
    `market participation and volatility.`

  // Generate evidence
  const evidence: string[] = []
  if (inputs.breadth?.metrics) {
    evidence.push(`${inputs.breadth.metrics.advancePercent.toFixed(0)}% of stocks advancing`)
    evidence.push(`${inputs.breadth.metrics.declinePercent.toFixed(0)}% of stocks declining`)
    if ((inputs.breadth.metrics.newHighs || 0) > (inputs.breadth.metrics.newLows || 0)) {
      evidence.push(`New highs (${inputs.breadth.metrics.newHighs || 0}) exceed new lows (${inputs.breadth.metrics.newLows || 0})`)
    }
  }

  // Generate recommendation
  const recommendation = generateVolatilityRecommendation(volatility, breadthStatus)

  return {
    question: InvestmentQuestion.MarketVolatility,
    title: template.title,
    summary,
    explanation,
    evidence,
    confidence: inputs.breadth?.confidence || 50,
    recommendation,
    dataPoints: {
      volatility,
      breadthStatus,
      adRatio,
    },
    timestamp: Date.now(),
  }
}

/**
 * Generate volatility-based recommendation
 * @param volatility Volatility level
 * @param breadthStatus Breadth status
 * @returns Recommendation
 */
function generateVolatilityRecommendation(
  volatility: string,
  breadthStatus: string
): string {
  if (volatility === 'Aggressive') {
    return breadthStatus.includes('Bullish')
      ? 'Strong breadth but high volatility - consider smaller position sizes'
      : 'Weak breadth with high volatility - reduce exposure'
  }
  if (volatility === 'Calm') {
    return breadthStatus.includes('Bullish')
      ? 'Favorable conditions - established positions supported by breadth'
      : 'Calm but weak breadth - wait for confirmation'
  }
  return 'Moderate volatility - normal market conditions'
}

// ============================================================================
// QUESTION 2: SECTOR LEADERSHIP
// ============================================================================

/**
 * Answer Question 2: "What sector is heavy market up or down because xxx sector?"
 * @param inputs Analysis inputs
 * @returns Question 2 answer
 */
export function answerQuestion2_SectorLeadership(inputs: InsightInputs): QuestionAnswer {
  const template = ANSWER_TEMPLATES[InvestmentQuestion.SectorLeadership]

  // Get key data with null safety
  const leaders = (inputs.sectorRotation?.leadership?.leaders || [])
    .slice(0, 3)
    .map(s => s.sector?.name || 'Unknown')
    .join(', ') || 'None'
  const pattern = inputs.sectorRotation?.pattern || 'Mixed/No Clear Pattern'

  // Generate summary
  const summary = template.summaryTemplate
    .replace('{leaders}', leaders || 'No clear leaders')
    .replace('{pattern}', pattern)

  // Generate explanation
  let explanation = `Sector rotation pattern is ${pattern.toLowerCase()}. `

  if (inputs.sectorRotation?.leadership?.marketDriver?.sector) {
    const driver = inputs.sectorRotation.leadership.marketDriver
    explanation += `${driver.sector.name} is the primary market driver with ${(driver.vsMarket || 0).toFixed(1)}% vs market. `
  }

  if (inputs.sectorRotation?.regimeContext?.regime) {
    explanation += `Regime is ${inputs.sectorRotation.regimeContext.regime} ` +
      `(${inputs.sectorRotation.regimeContext.confirmed ? 'confirmed' : 'not confirmed'} by sectors).`
  }

  // Generate evidence
  const evidence: string[] = []
  if (inputs.sectorRotation?.leadership?.leaders && inputs.sectorRotation?.leadership?.laggards) {
    const topLeaders = inputs.sectorRotation.leadership.leaders.slice(0, 3)
    topLeaders.forEach(leader => {
      if (leader.sector?.name) {
        evidence.push(`${leader.sector.name}: ${(leader.sector.changePercent || 0).toFixed(1)}% (${leader.momentum || 'Neutral'})`)
      }
    })

    const topLaggards = inputs.sectorRotation.leadership.laggards.slice(0, 2)
    topLaggards.forEach(laggard => {
      if (laggard.sector?.name) {
        evidence.push(`${laggard.sector.name}: ${(laggard.sector.changePercent || 0).toFixed(1)}% (${laggard.momentum || 'Neutral'})`)
      }
    })
  }

  // Generate recommendation
  const recommendation = generateSectorRecommendation(inputs.sectorRotation)

  return {
    question: InvestmentQuestion.SectorLeadership,
    title: template.title,
    summary,
    explanation,
    evidence,
    confidence: inputs.sectorRotation ? 75 : 50,
    recommendation,
    dataPoints: {
      leaders,
      pattern,
    },
    timestamp: Date.now(),
  }
}

/**
 * Generate sector-based recommendation
 * @param rotation Sector rotation analysis
 * @returns Recommendation
 */
function generateSectorRecommendation(rotation?: SectorRotationAnalysis): string {
  if (!rotation) {
    return 'Insufficient sector data for recommendation'
  }

  const focusSectors = (rotation.focusSectors || []).slice(0, 3).join(', ')
  const avoidSectors = (rotation.avoidSectors || []).slice(0, 2).join(', ')
  return focusSectors ? `Focus on: ${focusSectors}.${avoidSectors ? ` Avoid: ${avoidSectors}` : ''}` : 'No clear sector focus'
}

// ============================================================================
// QUESTION 3: RISK-ON/OFF
// ============================================================================

/**
 * Answer Question 3: "Risk on because Foreign Investor is strong buy or Prop reduce they sell vol?"
 * @param inputs Analysis inputs
 * @returns Question 3 answer
 */
export function answerQuestion3_RiskOnOff(inputs: InsightInputs): QuestionAnswer {
  const template = ANSWER_TEMPLATES[InvestmentQuestion.RiskOnOff]

  // Get key data with null safety
  const riskSignal = inputs.smartMoney?.riskSignal || 'Neutral'
  const primaryDriver = inputs.smartMoney?.primaryDriver || 'none'

  // Generate summary
  const summary = template.summaryTemplate
    .replace('{riskSignal}', riskSignal)
    .replace('{primaryDriver}', primaryDriver === 'foreign' ? 'Foreign investors' :
              primaryDriver === 'institution' ? 'Institutions' :
              primaryDriver === 'both' ? 'Both foreign and institutions' : 'No clear driver')

  // Generate explanation
  let explanation = `Smart money signal is ${riskSignal}. `

  if (inputs.smartMoney?.investors) {
    const { foreign, institution } = inputs.smartMoney.investors
    const combinedSignal = inputs.smartMoney.combinedSignal || 'Neutral'

    explanation += `Foreign investors: ${foreign?.strength || 'Neutral'} (${(foreign?.todayNet || 0) >= 0 ? '+' : ''}${(foreign?.todayNet || 0).toFixed(0)}M). ` +
      `Institutions: ${institution?.strength || 'Neutral'} (${(institution?.todayNet || 0) >= 0 ? '+' : ''}${(institution?.todayNet || 0).toFixed(0)}M). `

    if (primaryDriver === 'foreign') {
      explanation += 'Foreign investors are the primary driver of this signal.'
    } else if (primaryDriver === 'institution') {
      explanation += 'Institutions are the primary driver of this signal.'
    } else if (primaryDriver === 'both') {
      explanation += 'Both foreign and institutions are aligned in this move.'
    }

    explanation += ` Combined signal: ${combinedSignal}.`
  }

  // Generate evidence
  const evidence: string[] = []
  if (inputs.smartMoney) {
    evidence.push(`Smart money score: ${(inputs.smartMoney.score || 0).toFixed(0)}/100`)
    if (inputs.smartMoney.investors?.foreign) {
      evidence.push(`Foreign 5-day trend: ${(inputs.smartMoney.investors.foreign.trend5Day || 0) >= 0 ? '+' : ''}${(inputs.smartMoney.investors.foreign.trend5Day || 0).toFixed(0)}M`)
    }
    if (inputs.smartMoney.investors?.institution) {
      evidence.push(`Institution 5-day trend: ${(inputs.smartMoney.investors.institution.trend5Day || 0) >= 0 ? '+' : ''}${(inputs.smartMoney.investors.institution.trend5Day || 0).toFixed(0)}M`)
    }
  }

  // Generate recommendation
  const recommendation = generateRiskSignalRecommendation(riskSignal)

  return {
    question: InvestmentQuestion.RiskOnOff,
    title: template.title,
    summary,
    explanation,
    evidence,
    confidence: inputs.smartMoney?.confidence || 50,
    recommendation,
    dataPoints: {
      riskSignal,
      primaryDriver,
    },
    timestamp: Date.now(),
  }
}

/**
 * Generate risk signal recommendation
 * @param riskSignal Risk signal
 * @returns Recommendation
 */
function generateRiskSignalRecommendation(riskSignal: string): string {
  switch (riskSignal) {
    case 'Risk-On':
      return 'Risk-On confirmed - favorable for cyclical and growth sectors'
    case 'Risk-On Mild':
      return 'Mild Risk-On - selective opportunities in cyclicals'
    case 'Risk-Off':
      return 'Risk-Off confirmed - focus on defensive sectors and cash'
    case 'Risk-Off Mild':
      return 'Mild Risk-Off - increase defensives, reduce risk'
    default:
      return 'Neutral risk posture - balanced approach recommended'
  }
}

// ============================================================================
// QUESTION 4: TRADING FOCUS
// ============================================================================

/**
 * Answer Question 4: "What current trade and what sector need to focus?"
 * @param inputs Analysis inputs
 * @returns Question 4 answer
 */
export function answerQuestion4_WhatToTrade(inputs: InsightInputs): QuestionAnswer {
  const template = ANSWER_TEMPLATES[InvestmentQuestion.TradingFocus]

  // Get key data with null safety
  const focusSectors = (inputs.sectorRotation?.focusSectors || []).slice(0, 3).join(', ') || 'No clear focus'
  const action = inputs.smartMoney?.combinedSignal === 'Buy' || inputs.smartMoney?.combinedSignal === 'Strong Buy'
    ? 'Buy'
    : inputs.smartMoney?.combinedSignal === 'Sell' || inputs.smartMoney?.combinedSignal === 'Strong Sell'
    ? 'Sell'
    : 'Hold'

  // Generate summary
  const summary = template.summaryTemplate
    .replace('{focusSectors}', focusSectors)
    .replace('{action}', action)

  // Generate explanation
  let explanation = `Current trading focus: ${focusSectors}. `

  if (inputs.sectorRotation?.entrySignals && inputs.sectorRotation.entrySignals.length > 0) {
    const entrySignals = inputs.sectorRotation.entrySignals.slice(0, 2)
    if (entrySignals.length > 0) {
      explanation += `Entry signals: ${entrySignals.map(s => s.sector?.name || 'Unknown').join(', ')}. `
    }
  }

  explanation += `Recommended action: ${action}. `

  if (inputs.smartMoney?.riskSignal) {
    explanation += `Smart money ${inputs.smartMoney.riskSignal}.`
  }

  // Generate evidence
  const evidence: string[] = []
  if (inputs.sectorRotation?.focusSectors && inputs.sectorRotation?.entrySignals) {
    inputs.sectorRotation.focusSectors.slice(0, 3).forEach(sector => {
      const signal = inputs.sectorRotation?.entrySignals.find(s => s.sector?.name === sector)
      evidence.push(`${sector}: ${signal?.signal || 'Hold'} (${(signal?.confidence || 0).toFixed(0)}% confidence)`)
    })
  }

  // Generate recommendation
  const recommendation = `Focus on ${focusSectors}. ${action} recommended based on sector rotation and smart money signals.`

  return {
    question: InvestmentQuestion.TradingFocus,
    title: template.title,
    summary,
    explanation,
    evidence,
    confidence: inputs.sectorRotation ? 70 : 50,
    recommendation,
    dataPoints: {
      focusSectors,
      action,
    },
    timestamp: Date.now(),
  }
}

// ============================================================================
// QUESTION 5: RANKINGS IMPACT
// ============================================================================

/**
 * Answer Question 5: "How top ranking effect to market?"
 * @param inputs Analysis inputs
 * @returns Question 5 answer
 */
export function answerQuestion5_RankingsImpact(inputs: InsightInputs): QuestionAnswer {
  const template = ANSWER_TEMPLATES[InvestmentQuestion.RankingsImpact]

  // Get key data with null safety
  const dominantSectors = (inputs.rankingsMap?.dominantSectors || []).join(', ') || 'Broadly distributed'
  const concentration = inputs.rankingsMap?.concentrationScore || 0

  // Generate summary
  const summary = template.summaryTemplate
    .replace('{dominantSectors}', dominantSectors)
    .replace('{concentration}', concentration.toFixed(0))

  // Generate explanation
  let explanation = `Rankings concentration is ${concentration.toFixed(0)}%. `

  if (concentration > 60) {
    explanation += `High concentration - ${dominantSectors} dominating rankings. ` +
      `This indicates narrow market participation driven by specific sectors.`
  } else if (concentration < 30) {
    explanation += `Low concentration - rankings broadly distributed. ` +
      `This indicates healthy market breadth and broad participation.`
  } else {
    explanation += `Moderate concentration with balanced sector representation.`
  }

  if (inputs.rankingsMap?.anomalies && inputs.rankingsMap.anomalies.length > 0) {
    explanation += ` ${inputs.rankingsMap.anomalies.length} anomalies detected between rankings and sector performance.`
  }

  // Generate evidence
  const evidence: string[] = []
  if (inputs.rankingsMap?.bySector) {
    inputs.rankingsMap.bySector.slice(0, 5).forEach(sector => {
      evidence.push(`${sector.sectorName}: ${sector.totalRankings} stocks in rankings`)
    })

    if (inputs.rankingsMap.anomalies && inputs.rankingsMap.anomalies.length > 0) {
      evidence.push(`${inputs.rankingsMap.anomalies.length} sector-rankings anomalies`)
    }
  }

  // Generate recommendation
  const recommendation = concentration > 60
    ? 'High concentration - monitor for rotation out of dominant sectors'
    : concentration < 30
    ? 'Low concentration - broad market supports diversified approach'
    : 'Moderate concentration - balanced sector approach'

  return {
    question: InvestmentQuestion.RankingsImpact,
    title: template.title,
    summary,
    explanation,
    evidence,
    confidence: inputs.rankingsMap ? 70 : 50,
    recommendation,
    dataPoints: {
      dominantSectors,
      concentration,
    },
    timestamp: Date.now(),
  }
}

// ============================================================================
// QUESTION 6: RANKINGS VS SECTOR
// ============================================================================

/**
 * Answer Question 6: "What we see in top ranking compare with sector?"
 * @param inputs Analysis inputs
 * @returns Question 6 answer
 */
export function answerQuestion6_RankingsVsSector(inputs: InsightInputs): QuestionAnswer {
  const template = ANSWER_TEMPLATES[InvestmentQuestion.RankingsVsSector]

  // Get key data with null safety
  const anomalyCount = inputs.rankingsMap?.anomalies?.length || 0
  const correlation = calculateRankingsSectorCorrelation(inputs)

  // Generate summary
  const summary = template.summaryTemplate
    .replace('{anomalyCount}', anomalyCount.toString())
    .replace('{correlation}', correlation)

  // Generate explanation
  let explanation = `Rankings-to-sector correlation is ${correlation.toLowerCase()}. `

  if (anomalyCount > 0 && inputs.rankingsMap?.anomalies) {
    explanation += `${anomalyCount} anomalies detected. `
    inputs.rankingsMap.anomalies.slice(0, 2).forEach(anomaly => {
      explanation += `${anomaly.sectorName}: ${anomaly.anomalyReason}. `
    })
  } else {
    explanation += 'No significant anomalies detected - rankings align with sector performance.'
  }

  // Generate evidence
  const evidence: string[] = []
  if (inputs.rankingsMap?.bySector) {
    inputs.rankingsMap.bySector.slice(0, 4).forEach(sector => {
      evidence.push(`${sector.sectorName}: ${sector.totalRankings} rankings, sector ${(sector.sectorChange || 0).toFixed(1)}%`)
    })

    if (inputs.rankingsMap.anomalies && inputs.rankingsMap.anomalies.length > 0) {
      evidence.push(`Anomalies: ${inputs.rankingsMap.anomalies.map(a => a.sectorName).join(', ')}`)
    }
  }

  // Generate recommendation
  const recommendation = anomalyCount > 2
    ? 'Multiple anomalies - verify sector strength before trading'
    : anomalyCount > 0
    ? 'Some anomalies - check individual stock fundamentals'
    : 'Good alignment - rankings confirm sector trends'

  return {
    question: InvestmentQuestion.RankingsVsSector,
    title: template.title,
    summary,
    explanation,
    evidence,
    confidence: inputs.rankingsMap ? 70 : 50,
    recommendation,
    dataPoints: {
      anomalyCount,
      correlation,
    },
    timestamp: Date.now(),
  }
}

/**
 * Calculate rankings-sector correlation
 * @param inputs Analysis inputs
 * @returns Correlation description
 */
function calculateRankingsSectorCorrelation(inputs: InsightInputs): string {
  if (!inputs.rankingsMap) {
    return 'Unknown'
  }

  const anomalyCount = inputs.rankingsMap.anomalies?.length || 0

  if (anomalyCount === 0) {
    return 'Strong Positive'
  } else if (anomalyCount <= 2) {
    return 'Positive'
  } else if (anomalyCount <= 4) {
    return 'Neutral'
  } else {
    return 'Negative'
  }
}

// ============================================================================
// MAIN Q&A ENGINE
// ============================================================================

/**
 * Answer all 6 investment questions
 * @param inputs Analysis inputs
 * @returns All 6 question answers
 */
export function answerInvestmentQuestions(inputs: InsightInputs): InvestmentAnswers {
  // Generate individual answers
  const q1_volatility = answerQuestion1_Volatility(inputs)
  const q2_sectorLeadership = answerQuestion2_SectorLeadership(inputs)
  const q3_riskOnOff = answerQuestion3_RiskOnOff(inputs)
  const q4_tradingFocus = answerQuestion4_WhatToTrade(inputs)
  const q5_rankingsImpact = answerQuestion5_RankingsImpact(inputs)
  const q6_rankingsVsSector = answerQuestion6_RankingsVsSector(inputs)

  // Generate overall verdict (simplified - would use full verdict generation)
  const verdict = generateQuickVerdict(inputs)

  return {
    q1_volatility,
    q2_sectorLeadership,
    q3_riskOnOff,
    q4_tradingFocus,
    q5_rankingsImpact,
    q6_rankingsVsSector,
    verdict,
    timestamp: Date.now(),
  }
}

/**
 * Generate quick market verdict from answers
 * @param inputs Analysis inputs
 * @returns Market verdict
 */
function generateQuickVerdict(inputs: InsightInputs): {
  verdict: 'Strong Buy' | 'Buy' | 'Hold' | 'Reduce' | 'Strong Sell'
  confidence: number
  bullishFactors: string[]
  bearishFactors: string[]
  neutralFactors: string[]
  rationale: string
} {
  const bullishFactors: string[] = []
  const bearishFactors: string[] = []
  const neutralFactors: string[] = []

  // Count bullish/bearish signals
  let bullishCount = 0
  let bearishCount = 0

  if (inputs.smartMoney?.combinedSignal === 'Buy' || inputs.smartMoney?.combinedSignal === 'Strong Buy') {
    bullishFactors.push('Smart money buying')
    bullishCount++
  } else if (inputs.smartMoney?.combinedSignal === 'Sell' || inputs.smartMoney?.combinedSignal === 'Strong Sell') {
    bearishFactors.push('Smart money selling')
    bearishCount++
  }

  if (inputs.breadth?.status === 'Bullish' || inputs.breadth?.status === 'Strongly Bullish') {
    bullishFactors.push('Strong breadth')
    bullishCount++
  } else if (inputs.breadth?.status === 'Bearish' || inputs.breadth?.status === 'Strongly Bearish') {
    bearishFactors.push('Weak breadth')
    bearishCount++
  }

  if (inputs.sectorRotation?.regimeContext?.regime === 'Risk-On') {
    bullishFactors.push('Sectors Risk-On')
    bullishCount++
  } else if (inputs.sectorRotation?.regimeContext?.regime === 'Risk-Off') {
    bearishFactors.push('Sectors Risk-Off')
    bearishCount++
  }

  // Determine verdict
  let verdict: 'Strong Buy' | 'Buy' | 'Hold' | 'Reduce' | 'Strong Sell'
  const scoreDiff = bullishCount - bearishCount

  if (scoreDiff >= 2) {
    verdict = bullishCount >= 3 ? 'Strong Buy' : 'Buy'
  } else if (scoreDiff <= -2) {
    verdict = bearishCount >= 3 ? 'Strong Sell' : 'Reduce'
  } else {
    verdict = 'Hold'
    neutralFactors.push('Mixed signals')
  }

  const confidence = 50 + Math.abs(scoreDiff) * 10

  return {
    verdict,
    confidence,
    bullishFactors,
    bearishFactors,
    neutralFactors,
    rationale: `${bullishCount} bullish factors vs ${bearishCount} bearish factors`,
  }
}
