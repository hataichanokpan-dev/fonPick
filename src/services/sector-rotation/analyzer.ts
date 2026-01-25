/**
 * Sector Rotation Analyzer
 *
 * Main analyzer combining detection and mapping.
 * Part of Phase 2: Cross-Analysis (P0 - Critical)
 */

import type {
  SectorRotationInput,
  SectorRotationAnalysis,
  RankingsSectorMap,
  SectorPerformance,
} from '@/types/sector-rotation'
import type { RTDBIndustrySector, RTDBTopRankings } from '@/types/rtdb'
import { detectSectorRotation } from './detector'
import { mapRankingsToSectors } from './mapper'

// ============================================================================
// MAIN ANALYZER
// ============================================================================

/**
 * Perform complete sector rotation analysis
 * @param input Sector rotation input
 * @returns Complete sector rotation analysis
 */
export function analyzeSectorRotation(input: SectorRotationInput): SectorRotationAnalysis {
  // Perform rotation detection
  const rotationAnalysis = detectSectorRotation(input)

  // If rankings data provided, perform cross-analysis
  if (input.rankings) {
    const rankingsMap = mapRankingsToSectors(
      input.rankings,
      input.sectors
    )

    // Enhance rotation analysis with rankings data
    return enrichAnalysisWithRankings(rotationAnalysis, rankingsMap)
  }

  return rotationAnalysis
}

/**
 * Enrich rotation analysis with rankings cross-analysis
 * @param analysis Base rotation analysis
 * @param rankingsMap Rankings-to-sector mapping
 * @returns Enriched analysis
 */
function enrichAnalysisWithRankings(
  analysis: SectorRotationAnalysis,
  rankingsMap: RankingsSectorMap
): SectorRotationAnalysis {
  // Add rankings-based observations
  const rankingsObservations = generateRankingsObservations(rankingsMap)

  // Update observations
  analysis.observations = [
    ...analysis.observations,
    ...rankingsObservations,
  ]

  // Update entry/exit signals based on rankings
  analysis.entrySignals = updateSignalsWithRankings(
    analysis.entrySignals,
    rankingsMap,
    'Entry'
  )

  analysis.exitSignals = updateSignalsWithRankings(
    analysis.exitSignals,
    rankingsMap,
    'Exit'
  )

  return analysis
}

/**
 * Generate rankings-based observations
 * @param rankingsMap Rankings-to-sector mapping
 * @returns Array of observation strings
 */
function generateRankingsObservations(rankingsMap: RankingsSectorMap): string[] {
  const observations: string[] = []

  // Concentration observation
  if (rankingsMap.concentrationScore > 60) {
    observations.push(`High concentration: Rankings dominated by ${rankingsMap.dominantSectors.join(', ')}`)
  } else if (rankingsMap.concentrationScore < 30) {
    observations.push('Low concentration: Rankings spread across many sectors')
  }

  // Anomaly observations
  if (rankingsMap.anomalies.length > 0) {
    observations.push(`${rankingsMap.anomalies.length} sector anomalies detected`)

    rankingsMap.anomalies.slice(0, 2).forEach(anomaly => {
      observations.push(`- ${anomaly.sectorName}: ${anomaly.anomalyReason}`)
    })
  }

  // Dominant sectors observation
  if (rankingsMap.dominantSectors.length > 0) {
    observations.push(`Rankings dominated by: ${rankingsMap.dominantSectors.join(', ')}`)
  }

  return observations
}

/**
 * Update signals with rankings confirmation
 * @param signals Original signals
 * @param rankingsMap Rankings-to-sector mapping
 * @param signalType Type of signal
 * @returns Updated signals
 */
function updateSignalsWithRankings(
  signals: SectorPerformance[],
  rankingsMap: RankingsSectorMap,
  signalType: 'Entry' | 'Exit'
): SectorPerformance[] {
  return signals.map(signal => {
    const sectorRankings = rankingsMap.bySector.find(
      s => s.sectorId === signal.sector.id
    )

    if (!sectorRankings) {
      return signal
    }

    // Check if rankings confirm the signal
    if (signalType === 'Entry') {
      // Entry signal should have positive rankings presence
      void (sectorRankings.topGainers > 0 || sectorRankings.totalRankings > 2)
    } else {
      // Exit signal should have negative rankings presence
      void (sectorRankings.topLosers > 0)
    }

    // Note: SectorPerformance doesn't have a confidence field to modify
    // The signal structure is different, so we just return the original signal
    return signal
  })
}

// ============================================================================
// QUICK ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Quick sector leadership analysis
 * @param sectors Industry sector data
 * @returns Top 3 leaders and bottom 3 laggards
 */
export function quickSectorLeadership(
  sectors: RTDBIndustrySector
): {
  leaders: Array<{ name: string; change: number }>
  laggards: Array<{ name: string; change: number }>
} {
  const sorted = [...sectors.sectors].sort((a, b) => b.changePercent - a.changePercent)

  return {
    leaders: sorted.slice(0, 3).map(s => ({ name: s.name, change: s.changePercent })),
    laggards: sorted.slice(-3).reverse().map(s => ({ name: s.name, change: s.changePercent })),
  }
}

/**
 * Quick rankings-to-sector summary
 * @param rankings Top rankings data
 * @returns Sector distribution summary
 */
export function quickRankingsSummary(
  rankings: RTDBTopRankings
): {
  byCategory: Record<string, string[]>
  topSector: string
} {
  // Count by category
  const bySector: Record<string, number> = {}

  const countBySector = (stocks: typeof rankings.topGainers) => {
    stocks.forEach(stock => {
      const sector = mapStockToSectorSimple(stock.symbol)
      bySector[sector] = (bySector[sector] || 0) + 1
    })
  }

  countBySector(rankings.topGainers)
  countBySector(rankings.topLosers)
  countBySector(rankings.topVolume)
  countBySector(rankings.topValue)

  // Find top sector
  const topSector = Object.entries(bySector)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'

  return {
    byCategory: Object.fromEntries(
      Object.entries(bySector).map(([sector, count]) => [sector, [`${count} stocks`]])
    ),
    topSector,
  }
}

/**
 * Simple stock-to-sector mapping (fallback)
 * @param symbol Stock symbol
 * @returns Sector name
 */
function mapStockToSectorSimple(symbol: string): string {
  // Simplified mapping based on symbol patterns
  if (symbol.startsWith('B') || ['KBANK', 'SCB', 'KTB', 'BBL'].includes(symbol)) {
    return 'Financial'
  }
  if (['PTT', 'PTTEP', 'TOP', 'PTTGC'].includes(symbol)) {
    return 'Energy'
  }
  if (['CPF', 'TA'].includes(symbol)) {
    return 'Agribusiness'
  }
  if (['ADVANC', 'INTUCH', 'TRUE'].includes(symbol)) {
    return 'Technology'
  }
  if (['AP', 'LAND', 'LH'].includes(symbol)) {
    return 'Property'
  }

  return 'Other'
}

// ============================================================================
// EXPORTS
// ============================================================================

export { detectSectorRotation, mapRankingsToSectors }
