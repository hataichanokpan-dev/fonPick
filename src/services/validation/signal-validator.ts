/**
 * Signal Validator
 *
 * Validates generated signals for accuracy and consistency.
 * Ensures signals are logical, consistent with input data, and reliable.
 */

import type {
  SmartMoneyAnalysis,
  SectorRotationAnalysis,
  RankingsVsSectorAnalysis,
  RankingsImpactAnalysis,
  CorrelationInput,
  SmartMoneyInput,
  SectorRotationInput,
} from '@/types'

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface SignalValidationResult {
  valid: boolean
  confidence: number // 0-100
  errors: string[]
  warnings: string[]
  metrics: ValidationMetrics
}

export interface ValidationMetrics {
  dataQuality: number // 0-100
  signalConsistency: number // 0-100
  historicalAlignment: number // 0-100
  crossValidation: number // 0-100
}

// ============================================================================
// SMART MONEY SIGNAL VALIDATION
// ============================================================================

/**
 * Validate smart money analysis result
 * @param analysis Generated smart money analysis
 * @param input Original input data
 * @returns Validation result
 */
export function validateSmartMoneySignal(
  analysis: SmartMoneyAnalysis,
  input: SmartMoneyInput
): SignalValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Data quality check
  const dataQuality = checkSmartMoneyDataQuality(input)

  // Signal consistency check
  const signalConsistency = checkSmartMoneyConsistency(analysis)

  // Historical alignment check
  const historicalAlignment = checkHistoricalAlignment(analysis, input)

  // Cross-validation check
  const crossValidation = checkSmartMoneyCrossValidation(analysis, input)

  // Overall validation
  const avgQuality = (dataQuality + signalConsistency + historicalAlignment + crossValidation) / 4
  const valid = errors.length === 0 && avgQuality >= 50

  return {
    valid,
    confidence: Math.round(avgQuality),
    errors,
    warnings,
    metrics: {
      dataQuality,
      signalConsistency,
      historicalAlignment,
      crossValidation,
    },
  }
}

/**
 * Check smart money data quality
 */
function checkSmartMoneyDataQuality(input: SmartMoneyInput): number {
  let score = 100

  // Check data freshness
  const age = Date.now() - input.current.timestamp
  if (age > 24 * 60 * 60 * 1000) score -= 30
  else if (age > 12 * 60 * 60 * 1000) score -= 15
  else if (age > 6 * 60 * 60 * 1000) score -= 5

  // Check for zero activity
  if (input.current.foreign.buy === 0 && input.current.foreign.sell === 0) {
    score -= 20
  }

  // Check for abnormal values
  const totalFlow = Math.abs(input.current.foreign.net) + Math.abs(input.current.institution.net)
  if (totalFlow === 0) score -= 20
  if (totalFlow > 10000) score -= 10 // > 10 billion THB is unusual

  // Check historical data availability
  if (!input.historical || input.historical.length === 0) {
    score -= 15
  } else if (input.historical.length < 3) {
    score -= 5
  }

  return Math.max(0, score)
}

/**
 * Check smart money signal consistency
 */
function checkSmartMoneyConsistency(analysis: SmartMoneyAnalysis): number {
  let score = 100

  // Check if combined signal matches individual signals
  const { foreign, institution } = analysis.investors

  // Both bullish should result in bullish combined signal
  if (
    (foreign.strength.includes('Buy') && institution.strength.includes('Buy')) &&
    !analysis.combinedSignal.includes('Buy')
  ) {
    score -= 30
  }

  // Both bearish should result in bearish combined signal
  if (
    (foreign.strength.includes('Sell') && institution.strength.includes('Sell')) &&
    !analysis.combinedSignal.includes('Sell')
  ) {
    score -= 30
  }

  // Check if risk signal aligns with combined signal
  if (analysis.combinedSignal.includes('Buy') && analysis.riskSignal.includes('Risk-Off')) {
    score -= 20
  }

  if (analysis.combinedSignal.includes('Sell') && analysis.riskSignal.includes('Risk-On')) {
    score -= 20
  }

  // Check if confidence is reasonable (0-100)
  if (analysis.confidence < 0 || analysis.confidence > 100) {
    score -= 20
  }

  // Check if score aligns with combined signal
  if (analysis.combinedSignal.includes('Buy') && analysis.score < 40) {
    score -= 15
  }

  if (analysis.combinedSignal.includes('Sell') && analysis.score > 60) {
    score -= 15
  }

  return Math.max(0, score)
}

/**
 * Check historical alignment
 */
function checkHistoricalAlignment(
  analysis: SmartMoneyAnalysis,
  input: SmartMoneyInput
): number {
  let score = 100

  if (!input.historical || input.historical.length === 0) {
    return 70 // Neutral score when no historical data
  }

  const { foreign, institution: _institution } = analysis.investors

  // Check if trend aligns with historical data
  const recentForeignAvg = input.historical.slice(0, 3).reduce((sum, h) => sum + h.foreign.net, 0) / 3
  const foreignChange = foreign.todayNet - recentForeignAvg

  // If today is significantly different from recent average, trend should reflect it
  if (Math.abs(foreignChange) > 100) {
    if (foreignChange > 0 && !foreign.trend.includes('Buy')) {
      score -= 15
    }
    if (foreignChange < 0 && !foreign.trend.includes('Sell')) {
      score -= 15
    }
  }

  return Math.max(0, score)
}

/**
 * Check smart money cross-validation
 */
function checkSmartMoneyCrossValidation(
  analysis: SmartMoneyAnalysis,
  _input: SmartMoneyInput
): number {
  let score = 100

  // Foreign vs institution alignment
  const { foreign, institution } = analysis.investors
  const bothAgree =
    (foreign.strength.includes('Buy') && institution.strength.includes('Buy')) ||
    (foreign.strength.includes('Sell') && institution.strength.includes('Sell'))

  if (bothAgree) {
    // When they agree, confidence should be higher
    if (analysis.confidence < 70) {
      score -= 15
    }
  } else {
    // When they disagree, confidence should be lower
    if (analysis.confidence > 80) {
      score -= 15
    }
  }

  // Check observations are provided
  if (!analysis.observations || analysis.observations.length === 0) {
    score -= 10
  }

  // Check primary driver is set
  if (!analysis.primaryDriver) {
    score -= 5
  }

  return Math.max(0, score)
}

// ============================================================================
// SECTOR ROTATION SIGNAL VALIDATION
// ============================================================================

/**
 * Validate sector rotation analysis result
 * @param analysis Generated sector rotation analysis
 * @param input Original input data
 * @returns Validation result
 */
export function validateSectorRotationSignal(
  analysis: SectorRotationAnalysis,
  input: SectorRotationInput
): SignalValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const dataQuality = checkSectorRotationDataQuality(input)
  const signalConsistency = checkSectorRotationConsistency(analysis)
  const historicalAlignment = checkSectorHistoricalAlignment(analysis, input)
  const crossValidation = checkSectorCrossValidation(analysis, input)

  const avgQuality = (dataQuality + signalConsistency + historicalAlignment + crossValidation) / 4
  const valid = errors.length === 0 && avgQuality >= 50

  return {
    valid,
    confidence: Math.round(avgQuality),
    errors,
    warnings,
    metrics: {
      dataQuality,
      signalConsistency,
      historicalAlignment,
      crossValidation,
    },
  }
}

/**
 * Check sector rotation data quality
 */
function checkSectorRotationDataQuality(input: SectorRotationInput): number {
  let score = 100

  // Check data freshness
  const age = Date.now() - input.sectors.timestamp
  if (age > 24 * 60 * 60 * 1000) score -= 30
  else if (age > 12 * 60 * 60 * 1000) score -= 15

  // Check sector count
  if (input.sectors.sectors.length < 5) score -= 20
  else if (input.sectors.sectors.length < 10) score -= 10

  // Check for zero volume sectors
  const zeroVolumeCount = input.sectors.sectors.filter(s => s.volume === 0).length
  if (zeroVolumeCount > input.sectors.sectors.length * 0.3) {
    score -= 15
  }

  return Math.max(0, score)
}

/**
 * Check sector rotation signal consistency
 */
function checkSectorRotationConsistency(analysis: SectorRotationAnalysis): number {
  let score = 100

  // Check pattern matches regime
  if (analysis.pattern === 'Risk-On Rotation' && analysis.regimeContext.regime !== 'Risk-On') {
    score -= 20
  }

  if (analysis.pattern === 'Risk-Off Rotation' && analysis.regimeContext.regime !== 'Risk-Off') {
    score -= 20
  }

  // Check focus and avoid sectors
  if (analysis.focusSectors.length === 0 && analysis.avoidSectors.length === 0) {
    score -= 15
  }

  // Check observations
  if (!analysis.observations || analysis.observations.length === 0) {
    score -= 10
  }

  // Check leaders and laggards exist
  if (analysis.leadership.leaders.length === 0 && analysis.leadership.laggards.length === 0) {
    score -= 20
  }

  return Math.max(0, score)
}

/**
 * Check sector historical alignment
 */
function checkSectorHistoricalAlignment(
  analysis: SectorRotationAnalysis,
  input: SectorRotationInput
): number {
  let score = 100

  if (!input.historical || input.historical.length === 0) {
    return 70
  }

  // Compare with previous sector performance
  const prevSectors = input.historical[0].sectors
  const currSectors = input.sectors.sectors

  // Check if leaders/losers make sense vs previous
  const prevAvg = prevSectors.reduce((sum, s) => sum + s.changePercent, 0) / prevSectors.length
  const currAvg = currSectors.reduce((sum, s) => sum + s.changePercent, 0) / currSectors.length

  // Pattern should match overall direction change
  const improving = currAvg > prevAvg + 0.5
  const declining = currAvg < prevAvg - 0.5

  if (improving && analysis.pattern === 'Broad-Based Decline') {
    score -= 15
  }

  if (declining && analysis.pattern === 'Broad-Based Advance') {
    score -= 15
  }

  return Math.max(0, score)
}

/**
 * Check sector cross-validation
 */
function checkSectorCrossValidation(
  analysis: SectorRotationAnalysis,
  _input: SectorRotationInput
): number {
  let score = 100

  // Check entry/exit signals match leaders/losers
  const leaderCount = analysis.leadership.leaders.length
  const laggardCount = analysis.leadership.laggards.length

  if (leaderCount > 0 && analysis.entrySignals.length === 0) {
    score -= 15
  }

  if (laggardCount > 0 && analysis.exitSignals.length === 0) {
    score -= 15
  }

  // Check regime confirmation
  if (analysis.regimeContext.regime === 'Risk-On' && !analysis.regimeContext.confirmed) {
    score -= 5
  }

  return Math.max(0, score)
}

// ============================================================================
// CORRELATION SIGNAL VALIDATION
// ============================================================================

/**
 * Validate correlation analysis result
 * @param correlation Generated correlation analysis
 * @param impact Generated impact analysis
 * @param input Original input data
 * @returns Validation result
 */
export function validateCorrelationSignal(
  correlation: RankingsVsSectorAnalysis,
  impact: RankingsImpactAnalysis,
  input: CorrelationInput
): SignalValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const dataQuality = checkCorrelationDataQuality(input)
  const signalConsistency = checkCorrelationConsistency(correlation, impact)
  const historicalAlignment = 70 // No historical check for now
  const crossValidation = checkCorrelationCrossValidation(correlation, impact)

  const avgQuality = (dataQuality + signalConsistency + historicalAlignment + crossValidation) / 4
  const valid = errors.length === 0 && avgQuality >= 50

  return {
    valid,
    confidence: Math.round(avgQuality),
    errors,
    warnings,
    metrics: {
      dataQuality,
      signalConsistency,
      historicalAlignment,
      crossValidation,
    },
  }
}

/**
 * Check correlation data quality
 */
function checkCorrelationDataQuality(input: CorrelationInput): number {
  let score = 100

  // Check rankings data
  const rankingsCount =
    input.rankings.topGainers.length +
    input.rankings.topLosers.length +
    input.rankings.topVolume.length +
    input.rankings.topValue.length

  if (rankingsCount === 0) score -= 30
  else if (rankingsCount < 10) score -= 15

  // Check sectors data
  if (input.sectors.sectors.length < 5) score -= 20

  // Check data freshness
  const age = Date.now() - Math.max(input.rankings.timestamp, input.sectors.timestamp)
  if (age > 24 * 60 * 60 * 1000) score -= 30

  return Math.max(0, score)
}

/**
 * Check correlation signal consistency
 */
function checkCorrelationConsistency(
  correlation: RankingsVsSectorAnalysis,
  impact: RankingsImpactAnalysis
): number {
  let score = 100

  // Aligned should match correlation strength
  if (correlation.aligned && correlation.overallCorrelation === 'Negative') {
    score -= 20
  }

  if (!correlation.aligned && correlation.overallCorrelation === 'Strong Positive') {
    score -= 20
  }

  // Impact level should match concentration
  if (impact.impact === 'High' && impact.concentration.level === 'Low') {
    score -= 15
  }

  if (impact.impact === 'Low' && impact.concentration.level === 'High') {
    score -= 15
  }

  return Math.max(0, score)
}

/**
 * Check correlation cross-validation
 */
function checkCorrelationCrossValidation(
  correlation: RankingsVsSectorAnalysis,
  impact: RankingsImpactAnalysis
): number {
  let score = 100

  // Insights should be provided
  if (correlation.insights.length === 0) score -= 10
  if (impact.observations.length === 0) score -= 10

  // If high anomalies, should be reflected in correlation
  if (correlation.anomalies.length > 3 && correlation.overallCorrelation === 'Strong Positive') {
    score -= 10
  }

  return Math.max(0, score)
}

// ============================================================================
// BATCH VALIDATION
// ============================================================================

/**
 * Validate all signals at once
 * @param signals All generated signals
 * @returns Combined validation result
 */
export function validateAllSignals(signals: {
  smartMoney?: { analysis: SmartMoneyAnalysis; input: SmartMoneyInput }
  sectorRotation?: { analysis: SectorRotationAnalysis; input: SectorRotationInput }
  correlation?: {
    correlation: RankingsVsSectorAnalysis
    impact: RankingsImpactAnalysis
    input: CorrelationInput
  }
}): {
  overallValid: boolean
  overallConfidence: number
  smartMoney?: SignalValidationResult
  sectorRotation?: SignalValidationResult
  correlation?: SignalValidationResult
} {
  const results: {
    overallValid: boolean
    overallConfidence: number
    smartMoney?: SignalValidationResult
    sectorRotation?: SignalValidationResult
    correlation?: SignalValidationResult
  } = {
    overallValid: true,
    overallConfidence: 0,
  }

  let totalConfidence = 0
  let count = 0

  if (signals.smartMoney) {
    results.smartMoney = validateSmartMoneySignal(
      signals.smartMoney.analysis,
      signals.smartMoney.input
    )
    if (!results.smartMoney.valid) results.overallValid = false
    totalConfidence += results.smartMoney.confidence
    count++
  }

  if (signals.sectorRotation) {
    results.sectorRotation = validateSectorRotationSignal(
      signals.sectorRotation.analysis,
      signals.sectorRotation.input
    )
    if (!results.sectorRotation.valid) results.overallValid = false
    totalConfidence += results.sectorRotation.confidence
    count++
  }

  if (signals.correlation) {
    results.correlation = validateCorrelationSignal(
      signals.correlation.correlation,
      signals.correlation.impact,
      signals.correlation.input
    )
    if (!results.correlation.valid) results.overallValid = false
    totalConfidence += results.correlation.confidence
    count++
  }

  results.overallConfidence = count > 0 ? Math.round(totalConfidence / count) : 0

  return results
}
