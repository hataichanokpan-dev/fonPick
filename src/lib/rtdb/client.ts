/**
 * Firebase RTDB Client Wrapper
 *
 * Provides error handling, caching, and fallback strategies
 * for all RTDB operations
 */

import { getDatabase, ref, get, DatabaseReference, DataSnapshot } from 'firebase/database'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../firebase/config'
import { findLatestDateWithData } from './latest-finder'

/**
 * Initialize Firebase app singleton
 */
let db: ReturnType<typeof getDatabase> | null = null

function getDatabaseInstance(): ReturnType<typeof getDatabase> {
  if (!db) {
    const app = initializeApp(firebaseConfig)
    db = getDatabase(app)
  }
  return db
}

/**
 * RTDB Error Types
 */
export class RTDBError extends Error {
  constructor(
    message: string,
    public code: string,
    public path?: string
  ) {
    super(message)
    this.name = 'RTDBError'
  }
}

/**
 * Generic RTDB get function with error handling
 * @param path RTDB path
 * @returns Data or null if not found/error
 */
export async function rtdbGet<T>(path: string): Promise<T | null> {
  try {
    const db = getDatabaseInstance()
    const dbRef: DatabaseReference = ref(db, path)

    const snapshot: DataSnapshot = await get(dbRef)

    if (snapshot.exists()) {
      return snapshot.val() as T
    }

    return null
  } catch (error) {
    // Handle permission denied errors gracefully - return null instead of throwing
    // This allows optional data sources (like rankings) to fail silently
    if (error instanceof Error) {
      const errorMessage = error.message || ''
      // Check for permission denied or unauthorized errors
      if (
        errorMessage.includes('Permission denied') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')
      ) {
        console.warn(`RTDB permission denied for path: ${path}`)
        return null
      }

      throw new RTDBError(
        `Failed to fetch from RTDB: ${error.message}`,
        'FETCH_ERROR',
        path
      )
    }
    throw new RTDBError(
      'Unknown error fetching from RTDB',
      'UNKNOWN_ERROR',
      path
    )
  }
}

/**
 * Check if data has meaningful content
 * Returns true if data is not null AND not empty (object/array)
 * @param data Data to check
 * @returns true if data has content, false otherwise
 */
function hasDataContent<T>(data: T | null): boolean {
  // null or undefined is no content
  if (data == null) {
    return false
  }

  // Empty object is no content
  if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0) {
    return false
  }

  // Empty array is no content
  if (Array.isArray(data) && data.length === 0) {
    return false
  }

  // All other values (including 0, false, '') are considered valid content
  return true
}

/**
 * Fetch with fallback strategy
 * Tries primary path, then falls back to secondary path if primary fails or returns empty data
 * @param primaryPath Primary RTDB path
 * @param fallbackPath Fallback RTDB path (typically previous day's data)
 * @returns Data from primary or fallback, or null if both fail
 */
export async function fetchWithFallback<T>(
  primaryPath: string,
  fallbackPath?: string
): Promise<T | null> {
  try {
    const data = await rtdbGet<T>(primaryPath)

    // Check if data has meaningful content (not null, not empty object/array)
    if (hasDataContent<T>(data)) {
      return data
    }

    // Primary has no content or is empty - try fallback
    if (fallbackPath) {
      const fallback = await rtdbGet<T>(fallbackPath)
      if (hasDataContent<T>(fallback)) {
        return fallback
      }
    }

    return null
  } catch (error) {
    // Log error but don't throw - try fallback
    console.error(`RTDB fetch error for ${primaryPath}:`, error)

    // Try fallback as last resort
    if (fallbackPath) {
      try {
        const fallback = await rtdbGet<T>(fallbackPath)
        if (hasDataContent<T>(fallback)) {
          return fallback
        }
      } catch {
        // Silently fail on fallback error
      }
    }

    return null
  }
}

/**
 * Check if data is fresh
 * @param timestamp Unix timestamp from data
 * @param maxAge Maximum age in milliseconds (default: 1 hour)
 * @returns true if data is fresh, false otherwise
 */
export function isDataFresh(timestamp: number, maxAge: number = 60 * 60 * 1000): boolean {
  const now = Date.now()
  const age = now - timestamp
  return age < maxAge
}

/**
 * Format timestamp for display
 * @param timestamp Unix timestamp
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get data age in human-readable format
 * @param timestamp Unix timestamp
 * @returns Human-readable age string
 */
export function getDataAge(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else {
    return `${days}d ago`
  }
}

/**
 * Fetch latest available data by date
 * Automatically finds the latest date with data (up to maxDaysBack) and fetches from it
 * This is useful for weekend/holiday fallback when today has no trading data
 *
 * @param pathBuilder Function that builds RTDB path for a given date (YYYY-MM-DD format)
 * @param maxDaysBack Maximum days to look back for data (default: 7)
 * @returns Object with date and data, or null if no data found
 *
 * @example
 * const result = await fetchLatestAvailable(
 *   (date) => `/settrade/marketOverview/byDate/${date}`
 * )
 * if (result) {
 *   console.log(`Data from ${result.date}:`, result.data)
 * }
 */
export async function fetchLatestAvailable<T>(
  pathBuilder: (date: string) => string,
  maxDaysBack: number = 7
): Promise<{ date: string; data: T } | null> {
  // Find the latest date with data
  const latestDate = await findLatestDateWithData(maxDaysBack)

  if (!latestDate) {
    return null
  }

  // Fetch data from the latest date
  const path = pathBuilder(latestDate)
  const data = await rtdbGet<T>(path)

  if (!data || !hasDataContent<T>(data)) {
    return null
  }

  return { date: latestDate, data }
}
