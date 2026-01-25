/**
 * Insights Generator
 *
 * Generates actionable insights from market analyses.
 * Part of Phase 4: Insights Generation (P0 - Critical)
 */

import type {
  ActionableInsights,
  InsightInputs,
  TradingRecommendation,
  SectorFocus,
  InsightsSummary,
  DetailedInsights,
  MarketVerdict,
  MarketVerdictType,
} from '@/types/insights'

// ============================================================================
// MARKET VERDICT GENERATOR
// ============================================================================

/**
 * Generate overall market verdict
 * @param inputs Analysis inputs
 * @returns Market verdict
 */
export function generateMarketVerdict(inputs: InsightInputs): MarketVerdict {
  const bullishFactors: string[] = []
  const bearishFactors: string[] = []
  const neutralFactors: string[] = []

  let bullishScore = 0
  let bearishScore = 0

  // Market breadth factors
  if (inputs.breadth) {
    const breadth = inputs.breadth
    if (breadth.status === 'Strongly Bullish' || breadth.status === 'Bullish') {
      bullishFactors.push(`Strong breadth: ${breadth.metrics.advancePercent.toFixed(0)}% advancers`)
      bullishScore += 2
    } else if (breadth.status === 'Strongly Bearish' || breadth.status === 'Bearish') {
      bearishFactors.push(`Weak breadth: ${breadth.metrics.declinePercent.toFixed(0)}% decliners`)
      bearishScore += 2
    } else {
      neutralFactors.push('Mixed breadth signals')
    }
  }

  // Smart money factors
  if (inputs.smartMoney) {
    const { combinedSignal, riskSignal, score: _score } = inputs.smartMoney
    if (combinedSignal === 'Strong Buy' || combinedSignal === 'Buy') {
      bullishFactors.push(`Smart money ${combinedSignal}`)
      bullishScore += 2
    } else if (combinedSignal === 'Strong Sell' || combinedSignal === 'Sell') {
      bearishFactors.push(`Smart money ${combinedSignal}`)
      bearishScore += 2
    }

    if (riskSignal === 'Risk-On') {
      bullishFactors.push('Risk-On mode confirmed')
      bullishScore += 1
    } else if (riskSignal === 'Risk-Off') {
      bearishFactors.push('Risk-Off mode confirmed')
      bearishScore += 1
    }
  }

  // Sector rotation factors
  if (inputs.sectorRotation) {
    const { pattern, regimeContext } = inputs.sectorRotation
    if (pattern === 'Risk-On Rotation' || pattern === 'Broad-Based Advance') {
      bullishFactors.push(`${pattern} pattern`)
      bullishScore += 1
    } else if (pattern === 'Risk-Off Rotation' || pattern === 'Broad-Based Decline') {
      bearishFactors.push(`${pattern} pattern`)
      bearishScore += 1
    }

    if (regimeContext.regime === 'Risk-On' && regimeContext.confirmed) {
      bullishFactors.push('Sectors confirming Risk-On')
      bullishScore += 1
    } else if (regimeContext.regime === 'Risk-Off' && regimeContext.confirmed) {
      bearishFactors.push('Sectors confirming Risk-Off')
      bearishScore += 1
    }
  }

  // Rankings concentration factors
  if (inputs.rankingsMap) {
    const { concentrationScore, anomalies } = inputs.rankingsMap
    if (concentrationScore > 60) {
      bearishFactors.push('High rankings concentration - narrow participation')
      bearishScore += 1
    } else if (concentrationScore < 30) {
      bullishFactors.push('Low rankings concentration - broad participation')
      bullishScore += 1
    }

    if (anomalies.length > 2) {
      bearishFactors.push('Multiple sector anomalies detected')
      bearishScore += 1
    }
  }

  // Determine verdict
  let verdict: MarketVerdictType
  let confidence: number

  const scoreDiff = bullishScore - bearishScore

  if (scoreDiff >= 4) {
    verdict = 'Strong Buy'
    confidence = Math.min(95, 70 + scoreDiff * 5)
  } else if (scoreDiff >= 2) {
    verdict = 'Buy'
    confidence = Math.min(85, 60 + scoreDiff * 5)
  } else if (scoreDiff <= -4) {
    verdict = 'Strong Sell'
    confidence = Math.min(95, 70 + Math.abs(scoreDiff) * 5)
  } else if (scoreDiff <= -2) {
    verdict = 'Reduce'
    confidence = Math.min(85, 60 + Math.abs(scoreDiff) * 5)
  } else {
    verdict = 'Hold'
    confidence = 50
  }

  // Generate rationale
  const rationale = generateVerdictRationale(verdict, bullishFactors, bearishFactors, neutralFactors)

  return {
    verdict,
    confidence,
    bullishFactors,
    bearishFactors,
    neutralFactors,
    rationale,
  }
}

/**
 * Generate verdict rationale
 * @param verdict Market verdict
 * @param bullishFactors Bullish factors
 * @param bearishFactors Bearish factors
 * @param neutralFactors Neutral factors
 * @returns Rationale string
 */
function generateVerdictRationale(
  verdict: MarketVerdictType,
  bullishFactors: string[],
  bearishFactors: string[],
  neutralFactors: string[]
): string {
  switch (verdict) {
    case 'Strong Buy':
      return `Strong bullish signals from ${bullishFactors.length} key factors. Market conditions favorable.`
    case 'Buy':
      return `Bullish signals present. ${bullishFactors.length} positive factors vs ${bearishFactors.length} negative.`
    case 'Hold':
      return `Mixed signals with ${neutralFactors.length} neutral factors. Wait for clearer direction.`
    case 'Reduce':
      return `Bearish signals emerging. ${bearishFactors.length} negative factors vs ${bullishFactors.length} positive.`
    case 'Strong Sell':
      return `Strong bearish signals from ${bearishFactors.length} key factors. Caution advised.`
    default:
      return 'Market analysis complete. Review all factors before making decisions.'
  }
}

// ============================================================================
// TRADING RECOMMENDATION GENERATOR
// ============================================================================

/**
 * Generate trading recommendation
 * @param inputs Analysis inputs
 * @param verdict Market verdict
 * @returns Trading recommendation
 */
export function generateTradingRecommendation(
  inputs: InsightInputs,
  verdict: MarketVerdict
): TradingRecommendation {
  let action: 'Buy' | 'Sell' | 'Hold' | 'Wait'
  let positionSize: 'Full' | 'Partial' | 'Light' | 'None'
  let timeframe: 'Day' | 'Week' | 'Month'

  // Determine action based on verdict
  switch (verdict.verdict) {
    case 'Strong Buy':
      action = 'Buy'
      positionSize = verdict.confidence > 80 ? 'Full' : 'Partial'
      timeframe = 'Week'
      break
    case 'Buy':
      action = 'Buy'
      positionSize = 'Partial'
      timeframe = 'Week'
      break
    case 'Hold':
      action = 'Hold'
      positionSize = 'Light'
      timeframe = 'Day'
      break
    case 'Reduce':
      action = 'Sell'
      positionSize = 'Light'
      timeframe = 'Week'
      break
    case 'Strong Sell':
      action = 'Sell'
      positionSize = verdict.confidence > 80 ? 'None' : 'Light'
      timeframe = 'Month'
      break
    default:
      action = 'Hold'
      positionSize = 'Light'
      timeframe = 'Day'
      break
  }

  // Get focus sectors
  const sectors = inputs.sectorRotation?.focusSectors || []

  // Adjust position size based on volatility
  if (inputs.breadth?.volatility === 'Aggressive' && action === 'Buy') {
    positionSize = positionSize === 'Full' ? 'Partial' : 'Light'
  }

  // Generate rationale
  const rationale = generateTradingRationale(action, verdict, sectors)

  return {
    action,
    sectors,
    positionSize,
    timeframe,
    rationale,
  }
}

/**
 * Generate trading rationale
 * @param action Trading action
 * @param verdict Market verdict
 * @param sectors Focus sectors
 * @returns Rationale string
 */
function generateTradingRationale(
  action: 'Buy' | 'Sell' | 'Hold' | 'Wait',
  verdict: MarketVerdict,
  sectors: string[]
): string {
  const sectorText = sectors.length > 0 ? ` Focus on: ${sectors.join(', ')}.` : ''

  switch (action) {
    case 'Buy':
      return `${verdict.verdict} verdict with ${verdict.confidence}% confidence.${sectorText}`
    case 'Sell':
      return `Reducing exposure based on ${verdict.verdict} verdict. ${verdict.confidence}% confidence.`
    case 'Hold':
      return `Waiting for clearer signals. Current confidence: ${verdict.confidence}%.`
    case 'Wait':
      return `Insufficient clarity. Wait for directional confirmation.`
  }
}

// ============================================================================
// SECTOR FOCUS GENERATION
// ============================================================================

/**
 * Generate sector focus list
 * @param inputs Analysis inputs
 * @param verdict Market verdict
 * @returns Sector focus recommendations
 */
export function generateSectorFocus(
  inputs: InsightInputs,
  _verdict: MarketVerdict
): SectorFocus[] {
  const focusList: SectorFocus[] = []

  // Get sector rotation data
  const focusSectors = inputs.sectorRotation?.focusSectors || []
  const avoidSectors = inputs.sectorRotation?.avoidSectors || []
  const entrySignals = inputs.sectorRotation?.entrySignals || []
  const exitSignals = inputs.sectorRotation?.exitSignals || []

  // Add focus sectors
  focusSectors.forEach(sectorName => {
    const signal = entrySignals.find(s => s.sector.name === sectorName)
    focusList.push({
      sector: sectorName,
      level: signal?.signal === 'Entry' ? 'High' : 'Medium',
      reason: signal
        ? `${signal.signal} signal, ${signal.confidence}% confidence`
        : 'Leading sector performance',
      action: signal?.signal === 'Entry' ? 'Accumulate' : 'Hold',
    })
  })

  // Add avoid sectors
  avoidSectors.forEach(sectorName => {
    const signal = exitSignals.find(s => s.sector.name === sectorName)
    focusList.push({
      sector: sectorName,
      level: 'Avoid',
      reason: signal
        ? `${signal.signal} signal, ${signal.confidence}% confidence`
        : 'Lagging sector performance',
      action: signal?.signal === 'Exit' ? 'Exit' : 'Reduce',
    })
  })

  return focusList
}

// ============================================================================
// ACTIONABLE INSIGHTS GENERATOR
// ============================================================================

/**
 * Generate actionable insights
 * @param inputs Analysis inputs
 * @returns Complete actionable insights
 */
export function generateActionableInsights(inputs: InsightInputs): ActionableInsights {
  // Generate market verdict
  const verdict = generateMarketVerdict(inputs)

  // Generate trading recommendation
  const trading = generateTradingRecommendation(inputs, verdict)

  // Generate sector focus
  const sectorFocus = generateSectorFocus(inputs, verdict)

  // Generate themes
  const themes = generateKeyThemes(inputs, verdict)

  // Generate warnings
  const warnings = generateRiskWarnings(inputs)

  // Calculate confidence breakdown
  const confidence = {
    overall: verdict.confidence,
    breakdown: {
      breadth: inputs.breadth?.confidence || 0,
      smartMoney: inputs.smartMoney?.confidence || 0,
      sectorRotation: 70, // Placeholder
    },
  }

  return {
    // Note: answers will be generated by qna-engine
    answers: null as any,
    trading,
    sectorFocus,
    themes,
    warnings,
    confidence,
    timestamp: Date.now(),
  }
}

/**
 * Generate key themes
 * @param inputs Analysis inputs
 * @param verdict Market verdict
 * @returns Array of themes
 */
function generateKeyThemes(inputs: InsightInputs, verdict: MarketVerdict): string[] {
  const themes: string[] = []

  // Verdict theme
  themes.push(`Market ${verdict.verdict} mode`)

  // Smart money theme
  if (inputs.smartMoney) {
    themes.push(inputs.smartMoney.riskSignal)
  }

  // Rotation theme
  if (inputs.sectorRotation) {
    themes.push(inputs.sectorRotation.pattern)
  }

  // Volatility theme
  if (inputs.breadth) {
    if (inputs.breadth.volatility === 'Aggressive') {
      themes.push('High volatility environment')
    }
  }

  return themes.slice(0, 4)
}

/**
 * Generate risk warnings
 * @param inputs Analysis inputs
 * @returns Array of warnings
 */
function generateRiskWarnings(inputs: InsightInputs): string[] {
  const warnings: string[] = []

  // Volatility warning
  if (inputs.breadth?.volatility === 'Aggressive') {
    warnings.push('High volatility - consider position sizing')
  }

  // Divergence warning
  if (inputs.smartMoney && inputs.sectorRotation) {
    const smartMoneyBullish = inputs.smartMoney.combinedSignal === 'Buy' || inputs.smartMoney.combinedSignal === 'Strong Buy'
    const sectorsBullish = inputs.sectorRotation.regimeContext.regime === 'Risk-On'

    if (smartMoneyBullish !== sectorsBullish) {
      warnings.push('Smart money and sectors showing divergence')
    }
  }

  // Concentration warning
  if (inputs.rankingsMap?.concentrationScore && inputs.rankingsMap.concentrationScore > 60) {
    warnings.push('High rankings concentration - narrow market participation')
  }

  // Anomaly warning
  if (inputs.rankingsMap?.anomalies && inputs.rankingsMap.anomalies.length > 2) {
    warnings.push(`${inputs.rankingsMap.anomalies.length} sector anomalies detected`)
  }

  return warnings
}

// ============================================================================
// SUMMARY GENERATORS
// ============================================================================

/**
 * Generate insights summary
 * @param insights Actionable insights
 * @returns Insights summary
 */
export function generateInsightsSummary(insights: ActionableInsights): InsightsSummary {
  // Risk level based on verdict and warnings
  let riskLevel: 'Low' | 'Medium' | 'High'
  if (insights.warnings.length >= 2 || insights.trading.action === 'Sell') {
    riskLevel = 'High'
  } else if (insights.warnings.length === 1 || insights.trading.action === 'Hold') {
    riskLevel = 'Medium'
  } else {
    riskLevel = 'Low'
  }

  return {
    verdict: insights.trading.action === 'Buy' ? 'Buy' : insights.trading.action === 'Sell' ? 'Sell' : 'Hold',
    takeaway: `${insights.trading.action} recommended. ${insights.trading.rationale}`,
    topSectors: insights.sectorFocus.slice(0, 3).map(s => s.sector),
    riskLevel,
    confidence: insights.confidence.overall,
  }
}

/**
 * Generate detailed insights
 * @param insights Actionable insights
 * @returns Detailed insights
 */
export function generateDetailedInsights(insights: ActionableInsights): DetailedInsights {
  const answers = insights.answers

  return {
    answers,
    recommendations: [insights.trading],
    sectorDetails: insights.sectorFocus,
    risks: insights.warnings,
    opportunities: insights.themes,
    actionItems: [
      insights.trading.action === 'Buy'
        ? `Accumulate positions in ${insights.trading.sectors.join(', ')}`
        : `Reduce exposure, focus on ${insights.trading.sectors.join(', ')}`,
    ],
  }
}
