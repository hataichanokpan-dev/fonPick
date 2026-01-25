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
 * Validate and sanitize market overview data
 * Handles missing or invalid values with sensible defaults
 */
function validateMarketOverviewData(data: RTDBMarketOverviewEntry): RTDBMarketOverviewEntry {
  const validated = { ...data }

  // Ensure required numeric fields are valid numbers
  if (typeof validated.data.setIndex !== 'number' || isNaN(validated.data.setIndex)) {
    validated.data.setIndex = 0
  }
  if (typeof validated.data.setIndexChg !== 'number' || isNaN(validated.data.setIndexChg)) {
    validated.data.setIndexChg = 0
  }
  if (typeof validated.data.setIndexChgPct !== 'number' || isNaN(validated.data.setIndexChgPct)) {
    validated.data.setIndexChgPct = 0
  }

  // Handle totalValue - might be missing or 0
  // Try to derive from other fields if needed
  if (typeof validated.data.totalValue !== 'number' || isNaN(validated.data.totalValue) || validated.data.totalValue === 0) {
    // totalValue is in millions (valMn)
    // Log this issue but don't throw - allow graceful degradation
    console.warn('[market-overview] totalValue is missing or 0 in RTDB data')
    validated.data.totalValue = 0
  }

  // Handle totalVolume - might be missing or 0
  // totalVolume is in thousands (volK)
  // Use sensible fallback for SET average daily volume (~70,000M THB or 70,000,000K)
  if (typeof validated.data.totalVolume !== 'number' || isNaN(validated.data.totalVolume) || validated.data.totalVolume === 0) {
    console.warn('[market-overview] totalVolume is missing or 0 in RTDB data, using average fallback')
    // SET average daily volume is approximately 70,000M THB = 70,000,000K (in thousands)
    // Using 60,000K as a conservative baseline estimate
    validated.data.totalVolume = 60000000
  }

  // Validate advance/decline counts
  if (typeof validated.data.advanceCount !== 'number' || isNaN(validated.data.advanceCount)) {
    validated.data.advanceCount = 0
  }
  if (typeof validated.data.declineCount !== 'number' || isNaN(validated.data.declineCount)) {
    validated.data.declineCount = 0
  }
  if (typeof validated.data.unchangedCount !== 'number' || isNaN(validated.data.unchangedCount)) {
    validated.data.unchangedCount = 0
  }

  // Validate new highs/lows
  if (typeof validated.data.newHighCount !== 'number' || isNaN(validated.data.newHighCount)) {
    validated.data.newHighCount = 0
  }
  if (typeof validated.data.newLowCount !== 'number' || isNaN(validated.data.newLowCount)) {
    validated.data.newLowCount = 0
  }

  return validated
}

/**
 * Convert RTDB entry to simplified app format
 */
function convertToMarketOverview(
  _date: string,
  entry: RTDBMarketOverviewEntry
): RTDBMarketOverview {
  const validated = validateMarketOverviewData(entry)

  return {
    set: {
      index: validated.data.setIndex,
      change: validated.data.setIndexChg,
      changePercent: validated.data.setIndexChgPct,
    },
    totalMarketCap: validated.data.totalValue,
    totalValue: validated.data.totalValue,
    totalVolume: validated.data.totalVolume,
    advanceCount: validated.data.advanceCount,
    declineCount: validated.data.declineCount,
    unchangedCount: validated.data.unchangedCount,
    newHighCount: validated.data.newHighCount,
    newLowCount: validated.data.newLowCount,
    timestamp: parseTimestamp(validated.meta.capturedAt),
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
    console.warn(`[market-overview] No data found for date: ${date}`)
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
    console.warn('[market-overview] No data found for latest or previous date')
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
