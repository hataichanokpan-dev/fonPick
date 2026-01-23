/**
 * Firebase RTDB Client Wrapper
 *
 * Provides error handling, caching, and fallback strategies
 * for all RTDB operations
 */

import { getDatabase, ref, get, DatabaseReference, DataSnapshot } from 'firebase/database'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../firebase/config'

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
 * Fetch with fallback strategy
 * Tries primary path, then falls back to secondary path if primary fails
 * @param primaryPath Primary RTDB path
 * @param fallbackPath Fallback RTDB path
 * @returns Data from primary or fallback, or null if both fail
 */
export async function fetchWithFallback<T>(
  primaryPath: string,
  fallbackPath?: string
): Promise<T | null> {
  try {
    const data = await rtdbGet<T>(primaryPath)

    // Check if data has content
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      return data
    }

    // Try fallback if available
    if (fallbackPath) {
      const fallback = await rtdbGet<T>(fallbackPath)
      if (fallback && typeof fallback === 'object' && Object.keys(fallback).length > 0) {
        return fallback
      }
    }

    return null
  } catch (error) {
    // Log error but don't throw - return null instead
    console.error(`RTDB fetch error for ${primaryPath}:`, error)

    // Try fallback as last resort
    if (fallbackPath) {
      try {
        const fallback = await rtdbGet<T>(fallbackPath)
        if (fallback && typeof fallback === 'object' && Object.keys(fallback).length > 0) {
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
