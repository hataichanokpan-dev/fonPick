/**
 * Industry Sector Data Fetcher
 *
 * Fetches sector performance data from RTDB under /settrade/industrySector/byDate/{date}
 *
 * RTDB Structure:
 * /settrade/industrySector/byDate/{YYYY-MM-DD}/
 *   ├── rows: { AGRI, AGRO, AUTO, BANK, ... }
 *   │   └── { chg, chgPct, last, name, valMn, volK }
 *   └── meta: { capturedAt, schemaVersion, source }
 */

import { fetchWithFallback, fetchLatestAvailable } from './client'
import { RTDB_PATHS } from './paths'
import type {
  RTDBIndustrySector,
  RTDBSector,
  RTDBIndustrySectorEntry,
  RTDBSectorRow,
} from '@/types/rtdb'

/**
 * Parse capturedAt timestamp to unix timestamp
 */
function parseTimestamp(capturedAt: string): number {
  return new Date(capturedAt).getTime()
}

/**
 * Convert RTDB sector row to app format
 */
function convertToSector(id: string, row: RTDBSectorRow): RTDBSector {
  return {
    id,
    name: row.name,
    index: row.last,
    change: row.chg,
    changePercent: row.chgPct,
    marketCap: row.valMn,
    volume: row.volK,
  }
}

/**
 * Convert RTDB entry to simplified app format
 */
function convertToIndustrySector(entry: RTDBIndustrySectorEntry): RTDBIndustrySector {
  const sectors = Object.entries(entry.rows).map(([id, row]) =>
    convertToSector(id, row)
  )

  return {
    sectors,
    timestamp: parseTimestamp(entry.meta.capturedAt),
  }
}

/**
 * Fetch industry sector data for a specific date
 * @param date Date string in YYYY-MM-DD format
 * @returns Industry sector data or null if unavailable
 */
export async function fetchIndustrySectorByDate(
  date: string
): Promise<RTDBIndustrySector | null> {
  const path = RTDB_PATHS.INDUSTRY_SECTOR_BY_DATE(date)

  const entry = await fetchWithFallback<RTDBIndustrySectorEntry>(
    path,
    RTDB_PATHS.INDUSTRY_SECTOR_PREVIOUS
  )

  if (!entry) {
    return null
  }

  return convertToIndustrySector(entry)
}

/**
 * Fetch latest industry sector data
 * Uses automatic weekend/holiday fallback to find latest trading day with data
 * @returns Industry sector data or null if unavailable
 */
export async function fetchIndustrySector(): Promise<RTDBIndustrySector | null> {
  const result = await fetchLatestAvailable<RTDBIndustrySectorEntry>(
    (date) => RTDB_PATHS.INDUSTRY_SECTOR_BY_DATE(date),
    7 // Look back up to 7 days
  )

  if (!result) {
    return null
  }

  return convertToIndustrySector(result.data)
}

/**
 * Get top performing sectors
 * @param limit Number of top sectors to return (default: 5)
 * @returns Top sectors sorted by change percent
 */
export async function fetchTopSectors(limit: number = 5): Promise<RTDBSector[]> {
  const sectorData = await fetchIndustrySector()

  if (!sectorData || !sectorData.sectors.length) {
    return []
  }

  return [...sectorData.sectors]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, limit)
}

/**
 * Get worst performing sectors
 * @param limit Number of worst sectors to return (default: 5)
 * @returns Worst sectors sorted by change percent
 */
export async function fetchWorstSectors(limit: number = 5): Promise<RTDBSector[]> {
  const sectorData = await fetchIndustrySector()

  if (!sectorData || !sectorData.sectors.length) {
    return []
  }

  return [...sectorData.sectors]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, limit)
}

/**
 * Get top sectors by market cap
 * @param limit Number of sectors to return (default: 5)
 * @returns Top sectors sorted by market cap
 */
export async function fetchTopSectorsByMarketCap(limit: number = 5): Promise<RTDBSector[]> {
  const sectorData = await fetchIndustrySector()

  if (!sectorData || !sectorData.sectors.length) {
    return []
  }

  return [...sectorData.sectors]
    .sort((a, b) => b.marketCap - a.marketCap)
    .slice(0, limit)
}

/**
 * Get top sectors by volume
 * @param limit Number of sectors to return (default: 5)
 * @returns Top sectors sorted by volume
 */
export async function fetchTopSectorsByVolume(limit: number = 5): Promise<RTDBSector[]> {
  const sectorData = await fetchIndustrySector()

  if (!sectorData || !sectorData.sectors.length) {
    return []
  }

  return [...sectorData.sectors]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit)
}

/**
 * Get defensive sector performance
 * @returns Average performance of defensive sectors
 */
export async function fetchDefensiveSectorPerformance(): Promise<number | null> {
  const sectorData = await fetchIndustrySector()

  if (!sectorData || !sectorData.sectors.length) {
    return null
  }

  // Define defensive sectors by Thai market sector IDs
  const defensiveSectorIds = ['FOOD', 'HELTH', 'UTIL', 'PROP', 'PF']

  const defensiveSectorData = sectorData.sectors.filter((sector) =>
    defensiveSectorIds.includes(sector.id)
  )

  if (defensiveSectorData.length === 0) {
    return null
  }

  const avgPerformance =
    defensiveSectorData.reduce((sum, sector) => sum + sector.changePercent, 0) /
    defensiveSectorData.length

  return avgPerformance
}

/**
 * Get overall sector performance
 * @returns Average performance across all sectors
 */
export async function fetchOverallSectorPerformance(): Promise<number | null> {
  const sectorData = await fetchIndustrySector()

  if (!sectorData || !sectorData.sectors.length) {
    return null
  }

  const avgPerformance =
    sectorData.sectors.reduce((sum, sector) => sum + sector.changePercent, 0) /
    sectorData.sectors.length

  return avgPerformance
}

/**
 * Find sector by ID or name
 * @param identifier Sector ID or name to search for
 * @returns Sector data or null if not found
 */
export async function fetchSectorByIdentifier(
  identifier: string
): Promise<RTDBSector | null> {
  const sectorData = await fetchIndustrySector()

  if (!sectorData || !sectorData.sectors.length) {
    return null
  }

  return (
    sectorData.sectors.find(
      (sector) =>
        sector.id === identifier.toUpperCase() ||
        sector.name.toLowerCase().includes(identifier.toLowerCase())
    ) ?? null
  )
}

/**
 * Get sector heatmap data
 * @returns Sectors with heatmap visualization data
 */
export async function fetchSectorHeatmap(): Promise<
  Array<{
    id: string
    name: string
    changePercent: number
    marketCap: number
    intensity: number // 0-100 for heatmap intensity
  }>
> {
  const sectorData = await fetchIndustrySector()

  if (!sectorData || !sectorData.sectors.length) {
    return []
  }

  const maxChange = Math.max(
    ...sectorData.sectors.map((s) => Math.abs(s.changePercent))
  )

  return sectorData.sectors.map((sector) => ({
    id: sector.id,
    name: sector.name,
    changePercent: sector.changePercent,
    marketCap: sector.marketCap,
    intensity: maxChange > 0 ? (Math.abs(sector.changePercent) / maxChange) * 100 : 0,
  }))
}

/**
 * Get sectors grouped by performance
 * @returns Sectors grouped into positive, negative, and flat
 */
export async function fetchSectorsByPerformance(): Promise<{
  positive: RTDBSector[]
  negative: RTDBSector[]
  flat: RTDBSector[]
} | null> {
  const sectorData = await fetchIndustrySector()

  if (!sectorData || !sectorData.sectors.length) {
    return null
  }

  return {
    positive: sectorData.sectors.filter((s) => s.changePercent > 0),
    negative: sectorData.sectors.filter((s) => s.changePercent < 0),
    flat: sectorData.sectors.filter((s) => s.changePercent === 0),
  }
}
