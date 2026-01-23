/**
 * Market Overview Data Fetcher
 *
 * Fetches SET index and market overview data from RTDB under /settrade/marketOverview/byDate/{date}
 *
 * RTDB Structure:
 * /settrade/marketOverview/byDate/{YYYY-MM-DD}/
 *   ├── data: { setIndex, setIndexChg, setIndexChgPct, totalValue, totalVolume, ... }
 *   └── meta: { capturedAt, schemaVersion, source }
 */

import { fetchWithFallback } from './client'
import { RTDB_PATHS, getTodayDate } from './paths'
import type {
  RTDBMarketOverview,
  RTDBMarketOverviewEntry,
} from '@/types/rtdb'

/**
 * Parse capturedAt timestamp to unix timestamp
 */
function parseTimestamp(capturedAt: string): number {
  return new Date(capturedAt).getTime()
}

/**
 * Convert RTDB entry to simplified app format
 */
function convertToMarketOverview(
  _date: string,
  entry: RTDBMarketOverviewEntry
): RTDBMarketOverview {
  return {
    set: {
      index: entry.data.setIndex,
      change: entry.data.setIndexChg,
      changePercent: entry.data.setIndexChgPct,
    },
    totalMarketCap: entry.data.totalValue,
    totalValue: entry.data.totalValue,
    totalVolume: entry.data.totalVolume,
    advanceCount: entry.data.advanceCount,
    declineCount: entry.data.declineCount,
    unchangedCount: entry.data.unchangedCount,
    timestamp: parseTimestamp(entry.meta.capturedAt),
  }
}

/**
 * Fetch market overview data for a specific date
 * @param date Date string in YYYY-MM-DD format
 * @returns Market overview data or null if unavailable
 */
export async function fetchMarketOverviewByDate(
  date: string
): Promise<RTDBMarketOverview | null> {
  const path = RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(date)

  const entry = await fetchWithFallback<RTDBMarketOverviewEntry>(
    path,
    RTDB_PATHS.MARKET_OVERVIEW_PREVIOUS
  )

  if (!entry) {
    return null
  }

  return convertToMarketOverview(date, entry)
}

/**
 * Fetch latest market overview data
 * @returns Market overview data or null if unavailable
 */
export async function fetchMarketOverview(): Promise<RTDBMarketOverview | null> {
  const today = getTodayDate()

  const entry = await fetchWithFallback<RTDBMarketOverviewEntry>(
    RTDB_PATHS.MARKET_OVERVIEW_LATEST,
    RTDB_PATHS.MARKET_OVERVIEW_PREVIOUS
  )

  if (!entry) {
    return null
  }

  return convertToMarketOverview(today, entry)
}

/**
 * Fetch SET index data only
 * @returns SET index data or null if unavailable
 */
export async function fetchSetIndex(): Promise<{
  index: number
  change: number
  changePercent: number
} | null> {
  const overview = await fetchMarketOverview()

  if (!overview) {
    return null
  }

  return {
    index: overview.set.index,
    change: overview.set.change,
    changePercent: overview.set.changePercent,
  }
}

/**
 * Fetch total market value
 * @returns Total market value in millions or null if unavailable
 */
export async function fetchTotalMarketValue(): Promise<number | null> {
  const overview = await fetchMarketOverview()
  return overview?.totalValue ?? null
}

/**
 * Fetch total market volume
 * @returns Total volume in thousands or null if unavailable
 */
export async function fetchTotalVolume(): Promise<number | null> {
  const overview = await fetchMarketOverview()
  return overview?.totalVolume ?? null
}

/**
 * Fetch advance/decline counts
 * @returns Advance/decline data or null if unavailable
 */
export async function fetchAdvanceDecline(): Promise<{
  advance: number
  decline: number
  unchanged: number
} | null> {
  const overview = await fetchMarketOverview()

  if (!overview) {
    return null
  }

  return {
    advance: overview.advanceCount,
    decline: overview.declineCount,
    unchanged: overview.unchangedCount,
  }
}

/**
 * Check if market overview data is fresh
 * @param maxAge Maximum age in milliseconds (default: 1 hour)
 * @returns true if fresh, false otherwise
 */
export function isMarketOverviewFresh(
  overview: RTDBMarketOverview | null,
  maxAge: number = 60 * 60 * 1000
): boolean {
  if (!overview) {
    return false
  }

  const now = Date.now()
  const age = now - overview.timestamp
  return age < maxAge
}

/**
 * Get market status description
 * @returns Human-readable market status
 */
export function getMarketStatus(overview: RTDBMarketOverview | null): string {
  if (!overview) {
    return 'Data unavailable'
  }

  const { set } = overview

  if (set.changePercent > 1) {
    return 'Strong bullish'
  } else if (set.changePercent > 0) {
    return 'Bullish'
  } else if (set.changePercent < -1) {
    return 'Bearish'
  } else if (set.changePercent < 0) {
    return 'Weak bearish'
  } else {
    return 'Flat'
  }
}

/**
 * Get market color for UI (green for up, red for down)
 * @returns Tailwind color class
 */
export function getMarketColor(overview: RTDBMarketOverview | null): string {
  if (!overview) {
    return 'gray'
  }

  return overview.set.changePercent >= 0 ? 'green' : 'red'
}
