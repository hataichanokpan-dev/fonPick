/**
 * Firebase RTDB Path Constants
 *
 * Centralized path definitions for all RTDB endpoints under /settrade
 *
 * RTDB Structure:
 * /settrade/
 *   ├── marketOverview/
 *   │   └── byDate/
 *   │       └── {YYYY-MM-DD}/
 *   │           ├── data: { setIndex, setIndexChg, ... }
 *   │           └── meta: { capturedAt, schemaVersion, source }
 *   ├── investorType/
 *   │   └── byDate/
 *   │       └── {YYYY-MM-DD}/
 *   │           ├── rows: { FOREIGN, LOCAL_INDIVIDUAL, LOCAL_INST, PROPRIETARY }
 *   │           └── meta: { capturedAt, schemaVersion, source }
 *   ├── industrySector/
 *   │   └── byDate/
 *   │       └── {YYYY-MM-DD}/
 *   │           ├── rows: { AGRI, AGRO, AUTO, BANK, ... }
 *   │           └── meta: { capturedAt, schemaVersion, source }
 *   ├── nvdr/
 *   │   └── byDate/
 *   │       └── {YYYY-MM-DD}/
 *   │           ├── data: { stocks: { symbol: { b, m, n, r, s, t } } }
 *   │           └── meta: { capturedAt, schemaVersion, source }
 *   └── topRankings/
 *       └── byDate/
 *           └── {YYYY-MM-DD}/
 *               ├── data: { topGainers, topLosers, topVolume, topValue }
 *               └── meta: { capturedAt, schemaVersion, source }
 */

/**
 * Base path for all settrade data
 */
export const SETTRADE_BASE = '/settrade'

/**
 * Date helper - get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Date helper - get date string for N days ago
 */
export function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

/**
 * RTDB Path Constants
 */
export const RTDB_PATHS = {
  // Market data paths
  MARKET_OVERVIEW_BASE: `${SETTRADE_BASE}/marketOverview`,
  MARKET_OVERVIEW_BY_DATE: (date: string) => `${SETTRADE_BASE}/marketOverview/byDate/${date}`,
  MARKET_OVERVIEW_LATEST: `${SETTRADE_BASE}/marketOverview/byDate/${getTodayDate()}`,
  MARKET_OVERVIEW_PREVIOUS: `${SETTRADE_BASE}/marketOverview/byDate/${getDateDaysAgo(1)}`,

  // Investor flow paths
  INVESTOR_TYPE_BASE: `${SETTRADE_BASE}/investorType`,
  INVESTOR_TYPE_BY_DATE: (date: string) => `${SETTRADE_BASE}/investorType/byDate/${date}`,
  INVESTOR_TYPE_LATEST: `${SETTRADE_BASE}/investorType/byDate/${getTodayDate()}`,
  INVESTOR_TYPE_PREVIOUS: `${SETTRADE_BASE}/investorType/byDate/${getDateDaysAgo(1)}`,

  // Sector data paths
  INDUSTRY_SECTOR_BASE: `${SETTRADE_BASE}/industrySector`,
  INDUSTRY_SECTOR_BY_DATE: (date: string) => `${SETTRADE_BASE}/industrySector/byDate/${date}`,
  INDUSTRY_SECTOR_LATEST: `${SETTRADE_BASE}/industrySector/byDate/${getTodayDate()}`,
  INDUSTRY_SECTOR_PREVIOUS: `${SETTRADE_BASE}/industrySector/byDate/${getDateDaysAgo(1)}`,

  // NVDR data paths
  NVDR_BASE: `${SETTRADE_BASE}/nvdr`,
  NVDR_BY_DATE: (date: string) => `${SETTRADE_BASE}/nvdr/byDate/${date}`,
  NVDR_LATEST: `${SETTRADE_BASE}/nvdr/byDate/${getTodayDate()}`,
  NVDR_PREVIOUS: `${SETTRADE_BASE}/nvdr/byDate/${getDateDaysAgo(1)}`,

  // Stock data paths (note: stock data may be in a different location)
  STOCKS: `${SETTRADE_BASE}/stocks`,
  STOCK: (symbol: string) => `${SETTRADE_BASE}/stocks/${symbol.toUpperCase()}`,

  // Meta paths
  META: `${SETTRADE_BASE}/meta`,

  // Yahoo Finance SET Index History paths
  SET_INDEX_BASE: `${SETTRADE_BASE}/setIndex`,
  SET_INDEX_BY_DATE: (date: string) => `${SETTRADE_BASE}/setIndex/byDate/${date}`,
  SET_INDEX_LATEST: `${SETTRADE_BASE}/setIndex/byDate/${getTodayDate()}`,
  SET_INDEX_DATES: `${SETTRADE_BASE}/setIndex/_dates`,
  SET_INDEX_META: `${SETTRADE_BASE}/setIndex/_meta`,

  // Top Rankings paths (when available)
  RANKINGS_BASE: `${SETTRADE_BASE}/topRankings`,
  RANKINGS_BY_DATE: (date: string) => `${SETTRADE_BASE}/topRankings/byDate/${date}`,
  RANKINGS_LATEST: `${SETTRADE_BASE}/topRankings/byDate/${getTodayDate()}`,
  RANKINGS_PREVIOUS: `${SETTRADE_BASE}/topRankings/byDate/${getDateDaysAgo(1)}`,
} as const

/**
 * Path type helper
 */
export type RtdbPath = typeof RTDB_PATHS[keyof typeof RTDB_PATHS]

/**
 * Helper function to build a dynamic stock path
 * @param symbol Stock symbol
 * @returns RTDB path for the stock
 */
export function getStockPath(symbol: string): string {
  const sanitized = symbol.toUpperCase().trim()
  if (!sanitized) {
    throw new Error('Stock symbol cannot be empty')
  }
  return RTDB_PATHS.STOCK(sanitized)
}

/**
 * Get fallback path for a given primary path
 * Used for error handling and data fallback strategies
 * @param path Primary RTDB path
 * @returns Fallback path or undefined
 */
export function getFallbackPath(path: string): string | undefined {
  const today = getTodayDate()
  const yesterday = getDateDaysAgo(1)

  if (path.includes(today)) {
    return path.replace(today, yesterday)
  }
  if (path.includes('latest')) {
    return path.replace('/latest', `/byDate/${yesterday}`)
  }
  return undefined
}

/**
 * Get all available dates for a data type
 * This would typically be queried from the index in RTDB
 * @param dataType 'marketOverview' | 'investorType' | 'industrySector' | 'nvdr'
 * @returns Array of available dates
 */
export async function getAvailableDates(
  _dataType: 'marketOverview' | 'investorType' | 'industrySector' | 'nvdr'
): Promise<string[]> {
  // This would query the RTDB index to get available dates
  // For now, return empty array - to be implemented with actual RTDB client
  return []
}
