/**
 * Sector Rotation Detector
 *
 * Detects rotation patterns and signals between sectors.
 * Part of Phase 2: Cross-Analysis (P0 - Critical)
 */

import type {
  SectorPerformance,
  SectorMomentum,
  RotationSignal,
  RotationPattern,
  SectorRotationAnalysis,
  SectorRotationInput,
  RegimeContext,
} from '@/types/sector-rotation'
import type { RTDBSector } from '@/types/rtdb'
import { SECTOR_DEFINITIONS } from '@/types/sector-rotation'

// ============================================================================
// ROTATION DETECTION CONSTANTS
// ============================================================================

const ROTATION_THRESHOLDS = {
  // Sector performance vs market
  STRONG_OUTPERFORM: 1.5, // % points above market
  OUTPERFORM: 0.5,
  UNDERPERFORM: -0.5,
  SIGNIFICANT_LAG: -1.5,

  // Value ratio thresholds (vs 30-day avg)
  HIGH_VALUE_RATIO: 1.5,
  NORMAL_VALUE_RANGE: [0.8, 1.2] as [number, number],
  LOW_VALUE_RATIO: 0.7,

  // Rotation signal confidence thresholds
  ENTRY_CONFIDENCE: 70,
  EXIT_CONFIDENCE: 70,
} as const

// ============================================================================
// SECTOR MOMENTUM CLASSIFICATION
// ============================================================================

/**
 * Classify sector momentum based on performance vs market
 * @param vsMarket Performance vs SET index (percentage points)
 * @returns Momentum classification
 */
export function classifySectorMomentum(vsMarket: number): SectorMomentum {
  if (vsMarket >= ROTATION_THRESHOLDS.STRONG_OUTPERFORM) {
    return 'Strong Outperform'
  }
  if (vsMarket >= ROTATION_THRESHOLDS.OUTPERFORM) {
    return 'Outperform'
  }
  if (vsMarket >= ROTATION_THRESHOLDS.UNDERPERFORM) {
    return 'In-line'
  }
  if (vsMarket >= ROTATION_THRESHOLDS.SIGNIFICANT_LAG) {
    return 'Underperform'
  }
  return 'Significant Lag'
}

// ============================================================================
// ROTATION SIGNAL DETECTION
// ============================================================================

/**
 * Detect rotation signal for a sector
 * @param sector Sector data
 * @param marketChange SET index change %
 * @param historicalChange Historical sector change (optional, for trend)
 * @returns Rotation signal and confidence
 */
export function detectRotationSignal(
  sector: RTDBSector,
  marketChange: number,
  historicalChange?: number
): { signal: RotationSignal; confidence: number } {
  const vsMarket = sector.changePercent - marketChange
  const momentum = classifySectorMomentum(vsMarket)

  // Default signal
  let signal: RotationSignal = 'Hold'
  let confidence = 50

  // Entry signal (money flowing in)
  if (momentum === 'Strong Outperform' || momentum === 'Outperform') {
    if (historicalChange !== undefined) {
      // Check if this is new momentum (improvement)
      const improvement = sector.changePercent - (historicalChange || 0)
      if (improvement > 0.5) {
        signal = 'Entry'
        confidence = Math.min(85, 60 + Math.abs(vsMarket) * 10)
      } else {
        signal = 'Accumulate'
        confidence = Math.min(75, 55 + Math.abs(vsMarket) * 8)
      }
    } else {
      signal = 'Accumulate'
      confidence = Math.min(70, 50 + Math.abs(vsMarket) * 8)
    }
  }

  // Exit signal (money flowing out)
  if (momentum === 'Underperform' || momentum === 'Significant Lag') {
    if (historicalChange !== undefined) {
      // Check if this is deteriorating momentum
      const deterioration = (historicalChange || 0) - sector.changePercent
      if (deterioration > 0.5) {
        signal = 'Exit'
        confidence = Math.min(85, 60 + Math.abs(vsMarket) * 10)
      } else {
        signal = 'Distribute'
        confidence = Math.min(75, 55 + Math.abs(vsMarket) * 8)
      }
    } else {
      signal = 'Distribute'
      confidence = Math.min(70, 50 + Math.abs(vsMarket) * 8)
    }
  }

  return { signal, confidence }
}

// ============================================================================
// SECTOR PERFORMANCE ANALYSIS
// ============================================================================

/**
 * Analyze sector performance
 * @param sector Sector data
 * @param marketChange SET index change %
 * @param allSectors All sectors for ranking
 * @param rankingsCount Number of stocks in top rankings (optional)
 * @returns Sector performance analysis
 */
export function analyzeSectorPerformance(
  sector: RTDBSector,
  marketChange: number,
  allSectors: RTDBSector[],
  rankingsCount?: number
): SectorPerformance {
  // Calculate vs market
  const vsMarket = sector.changePercent - marketChange

  // Classify momentum
  const momentum = classifySectorMomentum(vsMarket)

  // Calculate rank (1 = best)
  const rank = allSectors.findIndex(s => s.id === sector.id) + 1

  // Detect rotation signal
  const { signal, confidence } = detectRotationSignal(sector, marketChange)

  // Value ratio (would need historical data, placeholder for now)
  const valueRatio = 1.0 // TODO: Implement with historical data

  return {
    sector,
    vsMarket,
    rank,
    momentum,
    value: sector.volume || 0, // Using volume as value proxy
    valueRatio,
    signal,
    confidence,
    topRankingsCount: rankingsCount || 0,
  }
}

// ============================================================================
// PERCENTILE-BASED SELECTION (Phase 1.2 Fix)
// ============================================================================

/**
 * Select sectors by percentile ranking
 * Replaces absolute threshold filtering with dynamic percentile-based selection
 * Ensures leaders and laggards always have minimum 3 sectors
 *
 * @param sectors Array of sectors with changePercent
 * @param bottomPercentile Percentile threshold for top/bottom selection (default: 30)
 * @returns Leaders and laggards by percentile
 */
export function selectSectorsByPercentile(
  sectors: RTDBSector[],
  bottomPercentile: number = 30
): {
  leaders: RTDBSector[]
  laggards: RTDBSector[]
} {
  if (!sectors || sectors.length === 0) {
    return { leaders: [], laggards: [] }
  }

  // Sort by changePercent descending
  const sorted = [...sectors].sort((a, b) => b.changePercent - a.changePercent)
  const total = sorted.length

  // Top 30% = leaders (minimum 3, maximum 6)
  const topCount = Math.min(6, Math.max(3, Math.ceil((bottomPercentile / 100) * total)))
  const leaders = sorted.slice(0, topCount)

  // Bottom 30% = laggards (minimum 3, maximum 6)
  const bottomCount = Math.min(6, Math.max(3, Math.ceil((bottomPercentile / 100) * total)))
  const laggards = sorted.slice(-bottomCount).reverse()

  return { leaders, laggards }
}

/**
 * Calculate sector percentile rank
 * @param sector The sector to rank
 * @param allSectors All sectors for comparison
 * @returns Percentile rank (0-100)
 */
export function calculateSectorPercentileRank(
  sector: RTDBSector,
  allSectors: RTDBSector[]
): number {
  if (!allSectors || allSectors.length === 0) {
    return 50
  }

  // Count sectors with lower performance
  const worseCount = allSectors.filter(s => s.changePercent < sector.changePercent).length

  // Calculate percentile
  const percentile = (worseCount / allSectors.length) * 100
  return Math.round(percentile)
}

// ============================================================================
// ROTATION PATTERN DETECTION
// ============================================================================

/**
 * Detect overall rotation pattern
 * @param sectors Sector performance analyses
 * @returns Rotation pattern
 */
export function detectRotationPattern(
  sectors: SectorPerformance[]
): RotationPattern {
  // Count leaders and laggards
  const leaders = sectors.filter(s => s.momentum === 'Outperform' || s.momentum === 'Strong Outperform')
  const laggards = sectors.filter(s => s.momentum === 'Underperform' || s.momentum === 'Significant Lag')
  // Calculate sector changes
  const avgChange = sectors.reduce((sum, s) => sum + s.sector.changePercent, 0) / sectors.length

  // Determine pattern
  if (leaders.length >= sectors.length * 0.6 && avgChange > 0) {
    return 'Broad-Based Advance'
  }
  if (laggards.length >= sectors.length * 0.6 && avgChange < 0) {
    return 'Broad-Based Decline'
  }

  // Check for risk-on/off rotation
  const defensiveSectors = sectors.filter(s => {
    const def = SECTOR_DEFINITIONS[s.sector.id]
    return def?.group === 'Defensive'
  })

  const cyclicalSectors = sectors.filter(s => {
    const def = SECTOR_DEFINITIONS[s.sector.id]
    return def?.group === 'Cyclical' || def?.group === 'Growth'
  })

  const avgDefensiveChange = defensiveSectors.length > 0
    ? defensiveSectors.reduce((sum, s) => sum + s.sector.changePercent, 0) / defensiveSectors.length
    : 0

  const avgCyclicalChange = cyclicalSectors.length > 0
    ? cyclicalSectors.reduce((sum, s) => sum + s.sector.changePercent, 0) / cyclicalSectors.length
    : 0

  if (avgCyclicalChange > avgDefensiveChange + 1) {
    return 'Risk-On Rotation'
  }
  if (avgDefensiveChange > avgCyclicalChange + 1) {
    return 'Risk-Off Rotation'
  }

  // Check for sector-specific move
  if (leaders.length <= 3 && laggards.length <= 3) {
    return 'Sector-Specific'
  }

  return 'Mixed/No Clear Pattern'
}

// ============================================================================
// REGIME CONTEXT ANALYSIS
// ============================================================================

/**
 * Analyze regime context for sector behavior
 * @param sectors Sector performance analyses
 * @returns Regime context
 */
export function analyzeRegimeContext(sectors: SectorPerformance[]): RegimeContext {
  // Get defensive and cyclical sectors
  const defensiveSectors = sectors.filter(s => {
    const def = SECTOR_DEFINITIONS[s.sector.id]
    return def?.group === 'Defensive'
  })

  const cyclicalSectors = sectors.filter(s => {
    const def = SECTOR_DEFINITIONS[s.sector.id]
    return def?.group === 'Cyclical' || def?.group === 'Growth'
  })

  // Calculate average changes
  const defensivesAvg = defensiveSectors.length > 0
    ? defensiveSectors.reduce((sum, s) => sum + s.sector.changePercent, 0) / defensiveSectors.length
    : 0

  const cyclicalsAvg = cyclicalSectors.length > 0
    ? cyclicalSectors.reduce((sum, s) => sum + s.sector.changePercent, 0) / cyclicalSectors.length
    : 0

  // Determine regime
  let regime: 'Risk-On' | 'Neutral' | 'Risk-Off'
  if (cyclicalsAvg > defensivesAvg + 0.5) {
    regime = 'Risk-On'
  } else if (defensivesAvg > cyclicalsAvg + 0.5) {
    regime = 'Risk-Off'
  } else {
    regime = 'Neutral'
  }

  // Check confirmation
  const confirmed = Math.abs(cyclicalsAvg - defensivesAvg) > 0.5

  return {
    regime,
    defensives: {
      averageChange: defensivesAvg,
      vsMarket: defensivesAvg, // Simplified
    },
    cyclicals: {
      averageChange: cyclicalsAvg,
      vsMarket: cyclicalsAvg, // Simplified
    },
    confirmed,
  }
}

// ============================================================================
// MAIN DETECTOR FUNCTION
// ============================================================================

/**
 * Detect sector rotation from input data
 * Phase 1.2 Fix: Now uses percentile-based selection instead of absolute thresholds
 *
 * @param input Sector rotation input
 * @returns Complete sector rotation analysis
 */
export function detectSectorRotation(input: SectorRotationInput): SectorRotationAnalysis {
  const { sectors, historical: _historical, options: _options } = input

  // Calculate market change (SET proxy)
  const marketChange = sectors.sectors.reduce((sum, s) => sum + s.changePercent, 0) / sectors.sectors.length

  // Analyze all sectors
  const allPerformances = sectors.sectors.map(sector =>
    analyzeSectorPerformance(sector, marketChange, sectors.sectors)
  )

  // Detect rotation pattern
  const pattern = detectRotationPattern(allPerformances)

  // Analyze regime context
  const regimeContext = analyzeRegimeContext(allPerformances)

  // Get leaders and laggards using percentile selection (Phase 1.2 fix)
  const { leaders: leaderSectors, laggards: laggardSectors } = selectSectorsByPercentile(sectors.sectors)

  // Map sectors to performance data
  const performanceMap = new Map(allPerformances.map(p => [p.sector.id, p]))

  const leaders = leaderSectors
    .map(sector => performanceMap.get(sector.id))
    .filter((p): p is SectorPerformance => p !== undefined)

  const laggards = laggardSectors
    .map(sector => performanceMap.get(sector.id))
    .filter((p): p is SectorPerformance => p !== undefined)

  // Find market driver
  const marketDriver = leaders.length > 0 ? leaders[0] : undefined

  // Calculate concentration (how many sectors driving the market)
  const concentration = calculateConcentration(allPerformances)

  // Get entry and exit signals
  const entrySignals = allPerformances.filter(s => s.signal === 'Entry' || s.signal === 'Accumulate')
  const exitSignals = allPerformances.filter(s => s.signal === 'Exit' || s.signal === 'Distribute')

  // Generate observations
  const observations = generateRotationObservations(
    pattern,
    leaders,
    laggards,
    regimeContext
  )

  // Determine focus and avoid sectors
  const focusSectors = leaders.slice(0, 3).map(s => s.sector.name)
  const avoidSectors = laggards.slice(0, 3).map(s => s.sector.name)

  return {
    pattern,
    leadership: {
      leaders,
      laggards,
      marketDriver,
      concentration,
    },
    regimeContext,
    entrySignals,
    exitSignals,
    observations,
    focusSectors,
    avoidSectors,
    timestamp: sectors.timestamp,
  }
}

/**
 * Calculate sector concentration score
 * @param performances Sector performances
 * @returns Concentration score (0-100)
 */
function calculateConcentration(performances: SectorPerformance[]): number {
  // Calculate how many sectors are outperforming
  const outperformers = performances.filter(p => p.vsMarket > 0).length
  const total = performances.length

  if (total === 0) return 50

  // If few sectors driving, concentration is high
  const outperformPct = (outperformers / total) * 100

  // Invert: fewer outperformers = higher concentration
  return Math.max(0, Math.min(100, 100 - outperformPct))
}

/**
 * Generate rotation observations
 * @param pattern Rotation pattern
 * @param leaders Leading sectors
 * @param laggards Lagging sectors
 * @param regimeContext Regime context
 * @returns Array of observation strings
 */
function generateRotationObservations(
  pattern: RotationPattern,
  leaders: SectorPerformance[],
  laggards: SectorPerformance[],
  regimeContext: RegimeContext
): string[] {
  const observations: string[] = []

  // Pattern observation
  observations.push(`Rotation pattern: ${pattern}`)

  // Leaders observation
  if (leaders.length > 0) {
    const topLeaders = leaders.slice(0, 3).map(s => s.sector.name).join(', ')
    observations.push(`Leading sectors: ${topLeaders}`)
  }

  // Laggards observation
  if (laggards.length > 0) {
    const topLaggards = laggards.slice(0, 3).map(s => s.sector.name).join(', ')
    observations.push(`Lagging sectors: ${topLaggards}`)
  }

  // Regime context
  observations.push(`Regime: ${regimeContext.regime} (${regimeContext.confirmed ? 'confirmed' : 'not confirmed'})`)

  return observations
}
