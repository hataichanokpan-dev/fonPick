/**
 * Top Rankings Data Fetcher
 *
 * Fetches top gainers, losers, and volume rankings from RTDB
 *
 * NOTE: The example data doesn't include a dedicated rankings endpoint.
 * Rankings would typically be derived from stock data or provided separately.
 * This file provides a structure for when that data becomes available.
 *
 * RTDB Structure (when available):
 * /settrade/rankings/byDate/{YYYY-MM-DD}/
 *   ├── data: { topGainers, topLosers, topVolume, topValue }
 *   └── meta: { capturedAt, schemaVersion, source }
 */

import type { RTDBTopRankings, RTDBTopStock } from '@/types/rtdb'

/**
 * Fetch top rankings data
 * @returns Top rankings or null if unavailable
 */
export async function fetchTopRankings(): Promise<RTDBTopRankings | null> {
  // For now, return empty rankings as we don't have this data source yet
  // TODO: Implement when stock data source is available
  return {
    topGainers: [],
    topLosers: [],
    topVolume: [],
    topValue: [],
    timestamp: Date.now(),
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
