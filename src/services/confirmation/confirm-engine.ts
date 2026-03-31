/**
 * Confirmation Engine
 *
 * Main service for Phase 3: Confirmation
 * Combines signals from multiple sources to generate overall confirmation:
 * - Multi-day smart money confirmation
 * - Sector rotation confirmation
 * - Trend maturity confirmation
 */

import type {
  ConfirmationAnalysis,
  SignalConfirmation,
  ConfirmationSource,
  MultiDaySmartMoneyAnalysis,
  HistoricalTrendAnalysis,
} from '@/types/swing-trading'
import type { SectorRotationAnalysis } from '@/types/sector-rotation'
import {
  confirmSectorRotation,
  getSectorRotationWeight,
} from './sector-confirmator'

// ============================================================================
// CONFIRMATION WEIGHTS
// ============================================================================

/**
 * Default weights for each confirmation source
 */
const DEFAULT_WEIGHTS: Record<ConfirmationSource, number> = {
  'smart-money': 0.35,
  'sector-rotation': 0.30,
  'trend-maturity': 0.25,
  volume: 0.10,
}

/**
 * Weight adjustments based on pattern type
 */
const WEIGHT_ADJUSTMENTS: Record<string, Partial<Record<ConfirmationSource, number>>> = {
  accumulation: {
    'smart-money': 0.35, // Strong accumulation weight
  },
  distribution: {
    'smart-money': 0.40, // Higher weight for distribution (avoid signal)
  },
  'Risk-On Rotation': {
    'sector-rotation': 0.30, // Entry signal weight
  },
  'Risk-Off Rotation': {
    'sector-rotation': 0.35, // Exit signal weight
  },
  early: {
    'trend-maturity': 0.25, // Early phase weight
  },
  exhausted: {
    'trend-maturity': 0.20, // Exhausted phase weight (lower)
  },
}

// ============================================================================
// SMART MONEY CONFIRMATION
// ============================================================================

/**
 * Confirm smart money signal from multi-day analysis
 *
 * @param analysis - Multi-day smart money analysis
 * @returns Signal confirmation
 */
function confirmSmartMoney(
  analysis: MultiDaySmartMoneyAnalysis | null | undefined
): SignalConfirmation {
  // No analysis available
  if (!analysis) {
    return {
      source: 'smart-money',
      isConfirmed: false,
      confidence: 0,
      weight: DEFAULT_WEIGHTS['smart-money'],
      rationale: 'No smart money analysis available',
    }
  }

  const { pattern, confirmation } = analysis

  // Get weight adjustment for this pattern
  const weightAdjustment = WEIGHT_ADJUSTMENTS[pattern.type]?.['smart-money']
  const weight = weightAdjustment ?? DEFAULT_WEIGHTS['smart-money']

  // Accumulation = Entry signal
  if (pattern.type === 'accumulation' && confirmation.isConfirmed) {
    return {
      source: 'smart-money',
      isConfirmed: true,
      confidence: confirmation.confidence,
      weight,
      rationale: `Accumulation confirmed (${pattern.consecutiveDays} days, ${pattern.totalFlow}M total flow)`,
    }
  }

  // Distribution = Avoid entry signal
  if (pattern.type === 'distribution' && confirmation.isConfirmed) {
    return {
      source: 'smart-money',
      isConfirmed: false,
      confidence: confirmation.confidence,
      weight,
      rationale: `Distribution detected (${pattern.consecutiveDays} days, ${pattern.totalFlow}M total outflow) - Avoid entry`,
    }
  }

  // Divergence = Mixed signal
  if (pattern.type === 'divergence') {
    return {
      source: 'smart-money',
      isConfirmed: false,
      confidence: 30,
      weight,
      rationale: 'Foreign and institutional flows diverging - Mixed signals',
    }
  }

  // Neutral = No clear signal
  return {
    source: 'smart-money',
    isConfirmed: false,
    confidence: 0,
    weight,
    rationale: 'No clear smart money pattern detected',
  }
}

// ============================================================================
// SECTOR ROTATION CONFIRMATION
// ============================================================================

/**
 * Confirm sector rotation signal
 *
 * @param params - Sector confirmation parameters
 * @returns Signal confirmation
 */
function confirmSector(params: {
  symbol: string
  sectorId: string
  analysis: SectorRotationAnalysis | null | undefined
}): SignalConfirmation {
  const { symbol, sectorId, analysis } = params

  // No analysis available
  if (!analysis) {
    return {
      source: 'sector-rotation',
      isConfirmed: false,
      confidence: 0,
      weight: DEFAULT_WEIGHTS['sector-rotation'],
      rationale: 'No sector rotation analysis available',
    }
  }

  const weight = getSectorRotationWeight(analysis)

  // Use sector-confirmator service
  const result = confirmSectorRotation({
    symbol,
    sectorId,
    sectorAnalysis: analysis,
  })

  return {
    source: 'sector-rotation',
    isConfirmed: result.isConfirmed,
    confidence: result.confidence,
    weight,
    rationale: result.rationale,
  }
}

// ============================================================================
// TREND MATURITY CONFIRMATION
// ============================================================================

/**
 * Confirm trend maturity for entry timing
 *
 * @param analysis - Historical trend analysis
 * @returns Signal confirmation
 */
function confirmTrendMaturity(
  analysis: HistoricalTrendAnalysis | null | undefined
): SignalConfirmation {
  // No analysis available
  if (!analysis) {
    return {
      source: 'trend-maturity',
      isConfirmed: false,
      confidence: 0,
      weight: DEFAULT_WEIGHTS['trend-maturity'],
      rationale: 'No trend analysis available',
    }
  }

  const { trend, momentum, dataQuality } = analysis

  // Check data quality
  if (dataQuality.completeness < 60) {
    return {
      source: 'trend-maturity',
      isConfirmed: false,
      confidence: 0,
      weight: DEFAULT_WEIGHTS['trend-maturity'],
      rationale: `Insufficient data quality (${dataQuality.completeness}%)`,
    }
  }

  // Get weight adjustment for trend phase
  const weightAdjustment = WEIGHT_ADJUSTMENTS[trend.phase]?.['trend-maturity']
  const weight = weightAdjustment ?? DEFAULT_WEIGHTS['trend-maturity']

  // Early phase uptrend = Best for entry
  if (trend.direction === 'uptrend' && trend.phase === 'early') {
    const confidence = Math.min(95, 60 + trend.strength * 0.3 + momentum.sustainabilityScore * 0.1)

    return {
      source: 'trend-maturity',
      isConfirmed: true,
      confidence: Math.round(confidence),
      weight,
      rationale: `Early uptrend (${trend.duration} days, ${trend.strength} strength) - Optimal entry window`,
    }
  }

  // Mature phase uptrend = Good for entry on pullback
  if (trend.direction === 'uptrend' && trend.phase === 'mature') {
    const confidence = Math.min(85, 50 + trend.strength * 0.25 + momentum.sustainabilityScore * 0.25)

    return {
      source: 'trend-maturity',
      isConfirmed: true,
      confidence: Math.round(confidence),
      weight,
      rationale: `Mature uptrend (${trend.duration} days) - Good for entry on pullback`,
    }
  }

  // Exhausted phase = Wait for reversal or new trend
  if (trend.phase === 'exhausted') {
    return {
      source: 'trend-maturity',
      isConfirmed: false,
      confidence: 40,
      weight,
      rationale: `Trend exhausted (${trend.duration} days) - Late entry risk`,
    }
  }

  // Downtrend = Avoid entry
  if (trend.direction === 'downtrend') {
    return {
      source: 'trend-maturity',
      isConfirmed: false,
      confidence: 20,
      weight,
      rationale: `Downtrend detected (${trend.duration} days) - Avoid entry`,
    }
  }

  // Sideways = Neutral
  return {
    source: 'trend-maturity',
    isConfirmed: false,
    confidence: 30,
    weight,
    rationale: 'Sideways trend - Wait for directional move',
  }
}

// ============================================================================
// OVERALL CONFIRMATION CALCULATION
// ============================================================================

/**
 * Calculate overall confirmation from individual signals
 *
 * @param confirmations - Array of signal confirmations
 * @returns Overall confirmation result
 */
function calculateOverallConfirmation(
  confirmations: SignalConfirmation[]
): {
  isConfirmed: boolean
  overallConfidence: number
  recommendation: 'Strong Entry' | 'Entry' | 'Wait' | 'Avoid Entry'
} {
  // Guard against empty array
  if (confirmations.length === 0) {
    return {
      isConfirmed: false,
      overallConfidence: 0,
      recommendation: 'Wait',
    }
  }

  // Filter out sources with zero weight
  const validConfirmations = confirmations.filter((c) => c.weight > 0)

  if (validConfirmations.length === 0) {
    return {
      isConfirmed: false,
      overallConfidence: 0,
      recommendation: 'Wait',
    }
  }

  // Count confirmed sources
  const confirmedCount = validConfirmations.filter((c) => c.isConfirmed).length

  // Calculate weighted confidence
  let totalWeight = 0
  let weightedSum = 0

  for (const confirmation of validConfirmations) {
    const adjustedConfidence = confirmation.isConfirmed ? confirmation.confidence : 0

    totalWeight += confirmation.weight
    weightedSum += adjustedConfidence * confirmation.weight
  }

  // Guard against division by zero
  const overallConfidence =
    totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0

  // Determine recommendation based on confirmed count and confidence
  if (confirmedCount >= 3 && overallConfidence >= 70) {
    return {
      isConfirmed: true,
      overallConfidence,
      recommendation: 'Strong Entry',
    }
  }

  if (confirmedCount >= 2 && overallConfidence >= 60) {
    return {
      isConfirmed: true,
      overallConfidence,
      recommendation: 'Entry',
    }
  }

  if (confirmedCount === 1 || overallConfidence >= 40) {
    return {
      isConfirmed: false,
      overallConfidence,
      recommendation: 'Wait',
    }
  }

  // Check for distribution pattern (strong avoid signal)
  const hasDistribution = validConfirmations.some(
    (c) => c.rationale.toLowerCase().includes('distribution')
  )

  if (hasDistribution || confirmedCount === 0) {
    return {
      isConfirmed: false,
      overallConfidence,
      recommendation: 'Avoid Entry',
    }
  }

  return {
    isConfirmed: false,
    overallConfidence,
    recommendation: 'Wait',
  }
}

// ============================================================================
// MAIN CONFIRMATION FUNCTION
// ============================================================================

/**
 * Generate confirmation analysis from multiple sources
 *
 * This is the main entry point for Phase 3: Confirmation
 * It combines signals from smart money, sector rotation, and trend maturity
 * to provide an overall confirmation recommendation.
 *
 * @param params - Confirmation parameters
 * @returns Complete confirmation analysis
 *
 * @example
 * ```typescript
 * const confirmation = await generateConfirmation({
 *   symbol: 'PTT',
 *   sectorId: 'ENERGY',
 *   smartMoneyAnalysis: smartMoneyResult,
 *   sectorRotation: sectorResult,
 *   historicalTrend: trendResult
 * })
 *
 * console.log(`Recommendation: ${confirmation.recommendation}`)
 * console.log(`Confidence: ${confirmation.overallConfidence}%`)
 * ```
 */
export async function generateConfirmation(params: {
  symbol: string
  sectorId?: string
  smartMoneyAnalysis?: MultiDaySmartMoneyAnalysis | null
  sectorRotation?: SectorRotationAnalysis | null
  historicalTrend: HistoricalTrendAnalysis | null
}): Promise<ConfirmationAnalysis> {
  const { symbol, sectorId = 'UNKNOWN', smartMoneyAnalysis, sectorRotation, historicalTrend } = params

  // Generate individual confirmations
  const confirmations: SignalConfirmation[] = [
    confirmSmartMoney(smartMoneyAnalysis),
    confirmSector({ symbol, sectorId, analysis: sectorRotation }),
    confirmTrendMaturity(historicalTrend),
  ]

  // Calculate overall confirmation
  const overallResult = calculateOverallConfirmation(confirmations)

  // Count confirmed sources
  const confirmedCount = confirmations.filter((c) => c.isConfirmed).length
  const totalSources = confirmations.length

  return {
    isConfirmed: overallResult.isConfirmed,
    overallConfidence: overallResult.overallConfidence,
    confirmations,
    confirmedCount,
    totalSources,
    recommendation: overallResult.recommendation,
    timestamp: Date.now(),
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get confirmation summary text
 *
 * @param analysis - Confirmation analysis
 * @returns Human-readable summary
 */
export function getConfirmationSummary(analysis: ConfirmationAnalysis): string {
  const { recommendation, overallConfidence, confirmedCount, totalSources } = analysis

  const confirmedSources = analysis.confirmations.filter((c) => c.isConfirmed)

  let summary = `${recommendation} (${overallConfidence}% confidence)`

  if (confirmedCount > 0) {
    const sourceNames = confirmedSources.map((c) => {
      const name = {
        'smart-money': 'Smart Money',
        'sector-rotation': 'Sector Rotation',
        'trend-maturity': 'Trend',
        volume: 'Volume',
      }[c.source]
      return name
    })

    summary += ` - Confirmed by: ${sourceNames.join(', ')}`
  }

  summary += ` (${confirmedCount}/${totalSources} sources)`

  return summary
}

/**
 * Check if confirmation meets minimum threshold
 *
 * @param analysis - Confirmation analysis
 * @param minConfidence - Minimum confidence required (default: 60)
 * @param minSources - Minimum confirmed sources required (default: 2)
 * @returns Whether confirmation meets threshold
 */
export function meetsConfirmationThreshold(
  analysis: ConfirmationAnalysis,
  minConfidence: number = 60,
  minSources: number = 2
): boolean {
  return (
    analysis.overallConfidence >= minConfidence && analysis.confirmedCount >= minSources
  )
}

/**
 * Get primary confirmation source
 *
 * @param analysis - Confirmation analysis
 * @returns Source with highest confidence
 */
export function getPrimaryConfirmationSource(
  analysis: ConfirmationAnalysis
): SignalConfirmation | null {
  const confirmed = analysis.confirmations.filter((c) => c.isConfirmed)

  if (confirmed.length === 0) {
    return null
  }

  // Sort by confidence * weight (impact score)
  const sorted = [...confirmed].sort((a, b) => {
    const impactA = a.confidence * a.weight
    const impactB = b.confidence * b.weight
    return impactB - impactA
  })

  return sorted[0]
}
