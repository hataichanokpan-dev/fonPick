/**
 * NVDR (Net Voluntary Trading) Data Fetcher
 *
 * Fetches NVDR data from RTDB under /settrade/nvdr/byDate/{date}
 *
 * RTDB Structure:
 * /settrade/nvdr/byDate/{YYYY-MM-DD}/
 *   ├── data: { stocks: { symbol: { b, m, n, r, s, t } }, totalMarketK, totalNVDRK }
 *   └── meta: { capturedAt, schemaVersion, source }
 *
 * NVDR Stock Data:
 * - b: buy value (millions)
 * - m: market cap (billions)
 * - n: net value (millions)
 * - r: ratio (%)
 * - s: sell value (millions)
 * - t: total (millions)
 */

import { fetchWithFallback } from './client'
import { RTDB_PATHS } from './paths'
import type { RTDBNVDRDEntry, RTDBNVDRStock } from '@/types/rtdb'

/**
 * Parse capturedAt timestamp to unix timestamp
 */
function parseTimestamp(capturedAt: string): number {
  return new Date(capturedAt).getTime()
}

/**
 * Fetch NVDR data for a specific date
 * @param date Date string in YYYY-MM-DD format
 * @returns NVDR data or null if unavailable
 */
export async function fetchNVDRByDate(date: string): Promise<{
  stocks: Record<string, RTDBNVDRStock>
  timestamp: number
} | null> {
  const path = RTDB_PATHS.NVDR_BY_DATE(date)

  const entry = await fetchWithFallback<RTDBNVDRDEntry>(
    path,
    RTDB_PATHS.NVDR_PREVIOUS
  )

  if (!entry) {
    return null
  }

  return {
    stocks: entry.data.stocks,
    timestamp: parseTimestamp(entry.meta.capturedAt),
  }
}

/**
 * Fetch latest NVDR data
 * @returns NVDR data or null if unavailable
 */
export async function fetchNVDR(): Promise<{
  stocks: Record<string, RTDBNVDRStock>
  timestamp: number
} | null> {
  const entry = await fetchWithFallback<RTDBNVDRDEntry>(
    RTDB_PATHS.NVDR_LATEST,
    RTDB_PATHS.NVDR_PREVIOUS
  )

  if (!entry) {
    return null
  }

  return {
    stocks: entry.data.stocks,
    timestamp: parseTimestamp(entry.meta.capturedAt),
  }
}

/**
 * Fetch NVDR data for a specific stock
 * @param symbol Stock symbol
 * @param date Optional date string (defaults to today)
 * @returns NVDR data for the stock or null if unavailable
 */
export async function fetchStockNVDR(
  symbol: string,
  date?: string
): Promise<RTDBNVDRStock | null> {
  const nvdrData = date
    ? await fetchNVDRByDate(date)
    : await fetchNVDR()

  if (!nvdrData) {
    return null
  }

  const normalizedSymbol = symbol.toUpperCase()

  return nvdrData.stocks[normalizedSymbol] ?? null
}

/**
 * Get top NVDR stocks by buy value
 * @param limit Number of stocks to return (default: 10)
 * @returns Top NVDR stocks sorted by buy value
 */
export async function fetchTopNVDRByBuyValue(limit: number = 10): Promise<
  Array<{ symbol: string; nvdr: RTDBNVDRStock }>
> {
  const nvdrData = await fetchNVDR()

  if (!nvdrData || !nvdrData.stocks) {
    return []
  }

  return Object.entries(nvdrData.stocks)
    .map(([symbol, nvdr]) => ({ symbol, nvdr }))
    .sort((a, b) => b.nvdr.b - a.nvdr.b)
    .slice(0, limit)
}

/**
 * Get top NVDR stocks by net value
 * @param limit Number of stocks to return (default: 10)
 * @returns Top NVDR stocks sorted by net value
 */
export async function fetchTopNVDRByNetValue(limit: number = 10): Promise<
  Array<{ symbol: string; nvdr: RTDBNVDRStock }>
> {
  const nvdrData = await fetchNVDR()

  if (!nvdrData || !nvdrData.stocks) {
    return []
  }

  return Object.entries(nvdrData.stocks)
    .map(([symbol, nvdr]) => ({ symbol, nvdr }))
    .sort((a, b) => b.nvdr.n - a.nvdr.n)
    .slice(0, limit)
}

/**
 * Get top NVDR stocks by sell value
 * @param limit Number of stocks to return (default: 10)
 * @returns Top NVDR stocks sorted by sell value
 */
export async function fetchTopNVDRBySellValue(limit: number = 10): Promise<
  Array<{ symbol: string; nvdr: RTDBNVDRStock }>
> {
  const nvdrData = await fetchNVDR()

  if (!nvdrData || !nvdrData.stocks) {
    return []
  }

  return Object.entries(nvdrData.stocks)
    .map(([symbol, nvdr]) => ({ symbol, nvdr }))
    .sort((a, b) => b.nvdr.s - a.nvdr.s)
    .slice(0, limit)
}

/**
 * Check if stock has high foreign buying via NVDR
 * @param symbol Stock symbol
 * @returns true if foreign buying is significant (>20% of total)
 */
export async function hasHighForeignBuying(symbol: string): Promise<boolean> {
  const nvdr = await fetchStockNVDR(symbol)

  if (!nvdr) {
    return false
  }

  // Calculate buy ratio
  const buyRatio = nvdr.t > 0 ? nvdr.b / nvdr.t : 0

  return buyRatio > 0.2 // 20% threshold
}
