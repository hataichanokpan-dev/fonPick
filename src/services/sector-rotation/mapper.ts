/**
 * Sector-Rankings Mapper
 *
 * Maps top rankings to sectors for cross-analysis.
 * Part of Phase 2: Cross-Analysis (P0 - Critical)
 */

import type {
  RankingsBySector,
  RankingsSectorMap,
  SectorGroup,
} from '@/types/sector-rotation'
import type { RTDBTopRankings, RTDBTopStock } from '@/types/rtdb'
import { SECTOR_DEFINITIONS } from '@/types/sector-rotation'

// ============================================================================
// STOCK-TO-SECTOR MAPPING
// ============================================================================

/**
 * Map a stock symbol to its sector
 * This is a simplified version - in production, would use a comprehensive mapping
 */
export function mapStockToSector(symbol: string): string {
  const sectorMap: Record<string, string> = {
    // Banking (FIN)
    'KBANK': 'FIN', 'SCB': 'FIN', 'BBL': 'FIN', 'KTB': 'FIN', 'TMB': 'FIN',
    'TISCO': 'FIN', 'CIMBT': 'FIN', 'BAFS': 'FIN', 'MFC': 'FIN',
    // Energy (ENERGY)
    'PTT': 'ENERGY', 'PTTEP': 'ENERGY', 'TOP': 'ENERGY', 'PTTGC': 'ENERGY',
    'IRPC': 'ENERGY', 'SSP': 'ENERGY', 'THANI': 'ENERGY',
    // Agribusiness (AGRI)
    'CPF': 'AGRI', 'TA': 'AGRI', 'MILLS': 'AGRI', 'TFM': 'AGRI',
    // Food (FOOD)
    'MCP': 'FOOD', 'ASF': 'FOOD', 'SFP': 'FOOD', 'TFG': 'FOOD',
    // Technology (TECH)
    'ADVANC': 'TECH', 'INTUCH': 'TECH', 'TRUE': 'TECH', 'HMPRO': 'TECH',
    'SAMART': 'TECH', 'GIT': 'TECH',
    // Property (PROP)
    'AP': 'PROP', 'LAND': 'PROP', 'LH': 'PROP', 'QH': 'PROP', 'PS': 'PROP',
    'SPALI': 'PROP', 'MFEC': 'PROP',
  }
  return sectorMap[symbol] || 'Unknown'
}

/**
 * Get sector group from sector code
 */
export function getSectorGroup(sectorCode: string): SectorGroup {
  const def = SECTOR_DEFINITIONS[sectorCode]
  return def?.group || 'Unknown'
}

// ============================================================================
// RANKINGS-TO-SECTOR MAPPING
// ============================================================================

/**
 * Map rankings to sectors
 */
export function mapRankingsToSectors(
  rankings: RTDBTopRankings,
  sectorData?: { sectors: Array<{ id: string; name: string; changePercent: number }> }
): RankingsSectorMap {
  const sectorMap: Record<string, RankingsBySector> = {}

  // Initialize with known sectors
  Object.keys(SECTOR_DEFINITIONS).forEach(sectorId => {
    const def = SECTOR_DEFINITIONS[sectorId]
    sectorMap[sectorId] = {
      sectorId,
      sectorName: def.name,
      topGainers: 0,
      topLosers: 0,
      topVolume: 0,
      topValue: 0,
      totalRankings: 0,
      sectorChange: 0,
      isAnomaly: false,
    }
  })

  // Process top gainers
  rankings.topGainers.forEach(stock => processStock(stock, sectorMap, 'topGainers'))

  // Process top losers
  rankings.topLosers.forEach(stock => processStock(stock, sectorMap, 'topLosers'))

  // Process top volume
  rankings.topVolume.forEach(stock => processStock(stock, sectorMap, 'topVolume'))

  // Process top value
  rankings.topValue.forEach(stock => processStock(stock, sectorMap, 'topValue'))

  // Add sector change data if available
  if (sectorData) {
    Object.values(sectorMap).forEach(mapping => {
      const sector = sectorData.sectors.find(s => s.id === mapping.sectorId)
      if (sector) {
        mapping.sectorChange = sector.changePercent
      }
    })
  }

  // Convert to array
  const bySector = Object.values(sectorMap).filter(s => s.totalRankings > 0)

  // Detect anomalies
  const anomalies = detectSectorAnomalies(bySector)
  anomalies.forEach(anomaly => {
    const mapping = bySector.find(s => s.sectorId === anomaly.sectorId)
    if (mapping) {
      mapping.isAnomaly = true
      mapping.anomalyReason = anomaly.anomalyReason
    }
  })

  // Find dominant sectors (top 3 by total rankings)
  const dominantSectors = bySector
    .sort((a, b) => b.totalRankings - a.totalRankings)
    .slice(0, 3)
    .map(s => s.sectorName)

  // Calculate concentration score
  const concentrationScore = calculateConcentration(bySector)

  return {
    bySector,
    dominantSectors,
    concentrationScore,
    anomalies,
  }
}

/**
 * Process a single stock
 */
function processStock(
  stock: RTDBTopStock,
  sectorMap: Record<string, RankingsBySector>,
  category: 'topGainers' | 'topLosers' | 'topVolume' | 'topValue'
): void {
  const sectorId = mapStockToSector(stock.symbol)

  if (!sectorMap[sectorId]) {
    // Add unknown sector if not exists
    sectorMap[sectorId] = {
      sectorId,
      sectorName: sectorId,
      topGainers: 0,
      topLosers: 0,
      topVolume: 0,
      topValue: 0,
      totalRankings: 0,
      sectorChange: 0,
      isAnomaly: false,
    }
  }

  // Increment the appropriate counter
  sectorMap[sectorId][category]++
  sectorMap[sectorId].totalRankings++
}

/**
 * Detect sector anomalies
 */
function detectSectorAnomalies(bySector: RankingsBySector[]): RankingsBySector[] {
  const anomalies: RankingsBySector[] = []

  bySector.forEach(sector => {
    const { topGainers, topLosers, sectorChange } = sector

    // Anomaly 1: Sector up but no stocks in top gainers
    if (sectorChange > 1 && topGainers === 0) {
      anomalies.push({
        ...sector,
        isAnomaly: true,
        anomalyReason: `Sector up ${sectorChange.toFixed(1)}% but no stocks in top gainers`,
      })
    }

    // Anomaly 2: Sector down but many stocks in top gainers
    if (sectorChange < -1 && topGainers >= 2) {
      anomalies.push({
        ...sector,
        isAnomaly: true,
        anomalyReason: `Sector down ${sectorChange.toFixed(1)}% but ${topGainers} stocks in top gainers`,
      })
    }

    // Anomaly 3: Sector up but many stocks in top losers
    if (sectorChange > 1 && topLosers >= 2) {
      anomalies.push({
        ...sector,
        isAnomaly: true,
        anomalyReason: `Sector up ${sectorChange.toFixed(1)}% but ${topLosers} stocks in top losers`,
      })
    }
  })

  return anomalies
}

/**
 * Calculate concentration score
 */
function calculateConcentration(bySector: RankingsBySector[]): number {
  if (bySector.length === 0) return 0

  const totalRankings = bySector.reduce((sum, s) => sum + s.totalRankings, 0)
  if (totalRankings === 0) return 0

  // Calculate top 3 sector percentage
  const top3 = bySector
    .sort((a, b) => b.totalRankings - a.totalRankings)
    .slice(0, 3)
    .reduce((sum, s) => sum + s.totalRankings, 0)

  return Math.round((top3 / totalRankings) * 100)
}

// ============================================================================
// SECTOR MOMENTUM CALCULATION
// ============================================================================

/**
 * Calculate sector momentum score
 */
export function calculateSectorMomentum(
  sectorId: string,
  rankings: RankingsSectorMap,
  sectorChange: number
): number {
  const sectorData = rankings.bySector.find(s => s.sectorId === sectorId)

  if (!sectorData) {
    return 50 // Neutral if no data
  }

  let score = 50 // Base score

  // Factor 1: Rankings presence (max 30 points)
  const rankingsScore = Math.min(30, sectorData.totalRankings * 6)
  score += rankingsScore

  // Factor 2: Positive gainers (max 10 points)
  const gainersScore = sectorData.topGainers * 3
  score += gainersScore

  // Factor 3: Sector change (max 10 points)
  if (sectorChange > 0) {
    score += Math.min(10, sectorChange * 2)
  } else {
    score -= Math.min(10, Math.abs(sectorChange) * 2)
  }

  return Math.max(0, Math.min(100, score))
}
