/**
 * Top Rankings Data Fetcher
 *
 * Fetches top gainers, losers, and volume rankings from RTDB.
 * Provides both basic and enhanced rankings with cross-ranking detection.
 *
 * NOTE: The example data doesn't include a dedicated rankings endpoint.
 * Rankings would typically be derived from stock data or provided separately.
 * This file provides a structure for when that data becomes available.
 *
 * RTDB Structure (when available):
 * /settrade/rankings/byDate/{YYYY-MM-DD}/
 *   ├── data: { topGainers, topLosers, topVolume, topValue }
 *   └── meta: { capturedAt, schemaVersion, source }
 *
 * Enhanced Features:
 * - Cross-ranking detection: Identify stocks appearing in multiple categories
 * - Professional-grade data: Sector codes, market cap groups, volume ratios
 * - Ranking metadata: Each stock knows its rankings across all categories
 */

import type {
  RTDBTopRankings,
  RTDBTopStock,
  RTDBTopStockEnhanced,
  RTDBTopRankingsEnhanced,
} from '@/types/rtdb'
import { RTDB_PATHS } from './paths'
import { rtdbGet } from './client'

/**
 * Raw RTDB Rankings Response Structure
 * Matches the actual structure in Firebase RTDB at /settrade/topRankings/byDate/{YYYY-MM-DD}/
 * Note: RTDB uses topByValue and topByVolume, not topValue and topVolume
 */
interface RTDBRankingsResponseRaw {
  data?: {
    topByValue?: RawStockData[]
    topByVolume?: RawStockData[]
  }
  meta?: {
    capturedAt?: string
    schemaVersion?: number
    source?: string
  }
}

/**
 * Raw stock data from RTDB
 * Has different field names than RTDBTopStock
 */
interface RawStockData {
  symbol: string
  name?: string
  last?: number
  change?: number
  chgPct?: number
  volMillion?: number
  valMillion?: number
}

/**
 * Convert raw RTDB stock data to RTDBTopStock format
 */
function toRTDBTopStock(raw: RawStockData): RTDBTopStock {
  return {
    symbol: raw.symbol,
    name: raw.name,
    price: raw.last,
    change: raw.chgPct ?? raw.change ?? 0,
    changePct: raw.chgPct ?? 0,
    volume: raw.volMillion,
    value: raw.valMillion,
  }
}

/**
 * Fetch top rankings data from RTDB
 * @returns Top rankings with all categories derived from available data
 */
export async function fetchTopRankings(): Promise<RTDBTopRankings | null> {
  // Try to fetch from today's rankings
  const rawData = await rtdbGet<RTDBRankingsResponseRaw>(RTDB_PATHS.RANKINGS_LATEST)

  // Try fallback to yesterday's data if today's is unavailable
  if (!rawData || !rawData.data) {
    const yesterdayData = await rtdbGet<RTDBRankingsResponseRaw>(RTDB_PATHS.RANKINGS_PREVIOUS)
    if (yesterdayData && yesterdayData.data) {
      return transformRankingsData(yesterdayData)
    }
  }

  if (!rawData || !rawData.data) {
    // Return empty structure rather than null to allow rendering
    return {
      topGainers: [],
      topLosers: [],
      topVolume: [],
      topValue: [],
      timestamp: Date.now(),
    }
  }

  return transformRankingsData(rawData)
}

/**
 * Transform raw RTDB data to standard rankings format
 * Derives topGainers and topLosers from topByValue data
 */
function transformRankingsData(
  rawData: RTDBRankingsResponseRaw
): RTDBTopRankings {
  // Convert topByValue to topValue
  const topValue = (rawData.data?.topByValue || []).map(toRTDBTopStock)

  // Convert topByVolume to topVolume
  const topVolume = (rawData.data?.topByVolume || []).map(toRTDBTopStock)

  // Derive topGainers and topLosers by sorting combined data by chgPct
  // Use topByValue as the base (most active stocks)
  const allStocks = [...(rawData.data?.topByValue || [])]

  // Sort by chgPct descending for gainers
  const topGainers = allStocks
    .filter(s => s.chgPct !== undefined && s.chgPct > 0)
    .sort((a, b) => (b.chgPct || 0) - (a.chgPct || 0))
    .slice(0, 10)
    .map(toRTDBTopStock)

  // Sort by chgPct ascending for losers
  const topLosers = allStocks
    .filter(s => s.chgPct !== undefined && s.chgPct < 0)
    .sort((a, b) => (a.chgPct || 0) - (b.chgPct || 0))
    .slice(0, 10)
    .map(toRTDBTopStock)

  return {
    topGainers,
    topLosers,
    topVolume,
    topValue,
    timestamp: rawData.meta?.capturedAt
      ? new Date(rawData.meta.capturedAt).getTime()
      : Date.now(),
  }
}

/**
 * Fetch top gainers
 * @param limit Number of top gainers to return (default: 10)
 * @returns Top gainers sorted by change
 */
export async function fetchTopGainers(limit: number = 10): Promise<RTDBTopStock[]> {
  const rankings = await fetchTopRankings()

  if (!rankings || !rankings.topGainers.length) {
    return []
  }

  return rankings.topGainers.slice(0, limit)
}

/**
 * Fetch top losers
 * @param limit Number of top losers to return (default: 10)
 * @returns Top losers sorted by change
 */
export async function fetchTopLosers(limit: number = 10): Promise<RTDBTopStock[]> {
  const rankings = await fetchTopRankings()

  if (!rankings || !rankings.topLosers.length) {
    return []
  }

  return rankings.topLosers.slice(0, limit)
}

/**
 * Fetch top volume stocks
 * @param limit Number of top volume stocks to return (default: 10)
 * @returns Top volume stocks sorted by volume
 */
export async function fetchTopVolume(limit: number = 10): Promise<RTDBTopStock[]> {
  const rankings = await fetchTopRankings()

  if (!rankings || !rankings.topVolume.length) {
    return []
  }

  return rankings.topVolume.slice(0, limit)
}

/**
 * Fetch top value stocks
 * @param limit Number of top value stocks to return (default: 10)
 * @returns Top value stocks sorted by trading value
 */
export async function fetchTopValue(limit: number = 10): Promise<RTDBTopStock[]> {
  const rankings = await fetchTopRankings()

  if (!rankings || !rankings.topValue.length) {
    return []
  }

  return rankings.topValue.slice(0, limit)
}

/**
 * Fetch all top rankings data in a structured format
 * @returns Object with gainers, losers, volume, and value data
 */
export async function fetchAllRankings(): Promise<{
  gainers: RTDBTopStock[]
  losers: RTDBTopStock[]
  volume: RTDBTopStock[]
  value: RTDBTopStock[]
} | null> {
  const rankings = await fetchTopRankings()

  if (!rankings) {
    return null
  }

  return {
    gainers: rankings.topGainers,
    losers: rankings.topLosers,
    volume: rankings.topVolume,
    value: rankings.topValue,
  }
}

/**
 * Check if a stock is in top rankings
 * @param symbol Stock symbol to check
 * @returns Ranking status or null if not found
 */
export async function checkStockRanking(symbol: string): Promise<{
  isTopGainer: boolean
  isTopLoser: boolean
  isTopVolume: boolean
  isTopValue: boolean
  gainerRank?: number
  loserRank?: number
  volumeRank?: number
  valueRank?: number
} | null> {
  const rankings = await fetchTopRankings()

  if (!rankings) {
    return null
  }

  const normalizedSymbol = symbol.toUpperCase()

  const gainerRank = rankings.topGainers.findIndex(
    (s) => s.symbol.toUpperCase() === normalizedSymbol
  )

  const loserRank = rankings.topLosers.findIndex(
    (s) => s.symbol.toUpperCase() === normalizedSymbol
  )

  const volumeRank = rankings.topVolume.findIndex(
    (s) => s.symbol.toUpperCase() === normalizedSymbol
  )

  const valueRank = rankings.topValue.findIndex(
    (s) => s.symbol.toUpperCase() === normalizedSymbol
  )

  return {
    isTopGainer: gainerRank >= 0,
    isTopLoser: loserRank >= 0,
    isTopVolume: volumeRank >= 0,
    isTopValue: valueRank >= 0,
    gainerRank: gainerRank >= 0 ? gainerRank + 1 : undefined,
    loserRank: loserRank >= 0 ? loserRank + 1 : undefined,
    volumeRank: volumeRank >= 0 ? volumeRank + 1 : undefined,
    valueRank: valueRank >= 0 ? valueRank + 1 : undefined,
  }
}

// ============================================================================
// ENHANCED RANKINGS WITH CROSS-RANKING DETECTION
// ============================================================================

/**
 * Detect stocks appearing in multiple ranking categories
 * Returns array of stocks with cross-ranking badges
 *
 * @param data - Top rankings data from all categories
 * @returns Array of stocks that appear in 2+ ranking lists with their rankings
 *
 * @example
 * const crossRanked = detectCrossRankings(rankings)
 * // Returns: [{ symbol: 'PTT', rankings: { gainer: 3, volume: 1, value: 2 } }]
 */
export function detectCrossRankings(
  data: RTDBTopRankings
): RTDBTopStockEnhanced[] {
  const stockMap = new Map<string, RTDBTopStockEnhanced>()

  // Helper to add ranking info
  const addRanking = (
    stocks: RTDBTopStock[],
    category: keyof NonNullable<RTDBTopStockEnhanced['rankings']>
  ) => {
    stocks.forEach((stock, index) => {
      const key = stock.symbol.toUpperCase()
      const existing = stockMap.get(key)

      if (existing) {
        existing.rankings = existing.rankings || {}
        existing.rankings[category] = index + 1
      } else {
        const enhanced: RTDBTopStockEnhanced = {
          ...stock,
          rankings: { [category]: index + 1 },
        }
        stockMap.set(key, enhanced)
      }
    })
  }

  // Process all categories
  const rankings = data as RTDBTopRankings
  addRanking(rankings.topGainers, 'gainer')
  addRanking(rankings.topLosers, 'loser')
  addRanking(rankings.topVolume, 'volume')
  addRanking(rankings.topValue || [], 'value')

  // Filter stocks with 2+ rankings
  return Array.from(stockMap.values()).filter(
    (stock): stock is RTDBTopStockEnhanced & {
      rankings: NonNullable<RTDBTopStockEnhanced['rankings']>
    } =>
      stock.rankings !== undefined && Object.keys(stock.rankings).length >= 2
  )
}

/**
 * Fetch top rankings with enhanced data and cross-ranking detection
 *
 * This function extends the basic rankings with cross-ranking information,
 * allowing the frontend to display badges for stocks that appear in multiple
 * ranking categories (e.g., "Top Gainer #3" and "Top Volume #1").
 *
 * @returns Enhanced rankings with cross-ranking metadata, or null if unavailable
 *
 * @example
 * const enhanced = await fetchTopRankingsEnhanced()
 * if (enhanced) {
 *   enhanced.topGainers.forEach(stock => {
 *     if (stock.rankings?.volume) {
 *       console.log(`${stock.symbol} is also #${stock.rankings.volume} in volume`)
 *     }
 *   })
 * }
 */
export async function fetchTopRankingsEnhanced(): Promise<RTDBTopRankingsEnhanced | null> {
  const rankings = await fetchTopRankings()

  if (!rankings) return null

  // Detect cross-rankings and add rankings metadata
  const crossRanked = detectCrossRankings(rankings)

  // Helper to add rankings to stocks
  const addRankingsToStocks = (stocks: RTDBTopStock[]): RTDBTopStockEnhanced[] => {
    return stocks.map((stock) => {
      const crossInfo = crossRanked.find(
        (c) => c.symbol.toUpperCase() === stock.symbol.toUpperCase()
      )
      return crossInfo || stock
    })
  }

  return {
    topGainers: addRankingsToStocks(rankings.topGainers),
    topLosers: addRankingsToStocks(rankings.topLosers),
    topVolume: addRankingsToStocks(rankings.topVolume),
    topValue: addRankingsToStocks(rankings.topValue || []),
    timestamp: rankings.timestamp,
  }
}
