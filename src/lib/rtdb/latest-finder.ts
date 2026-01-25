/**
 * Latest Date Finder
 *
 * Standalone utility to find the latest date with available data
 * Avoids circular dependency with client.ts/historical.ts
 *
 * This is used for weekend/holiday fallback:
 * - When today has no data (e.g., Sunday), automatically finds the latest trading day
 * - Checks up to maxDaysBack days for any data
 * - Returns the latest date with data, or null if no data found
 */

import { rtdbGet } from './client'
import { getDateDaysAgo } from './paths'
import type { RTDBMarketOverview } from '@/types/rtdb'

/**
 * Find the latest date with available RTDB data
 * @param maxDaysBack Maximum days to look back (default: 7)
 * @returns Latest date with data (YYYY-MM-DD format), or null if no data found
 */
export async function findLatestDateWithData(
  maxDaysBack: number = 7
): Promise<string | null> {
  // Check each day from 0 (today) to maxDaysBack-1
  for (let i = 0; i < maxDaysBack; i++) {
    const date = getDateDaysAgo(i)

    // Check if market overview data exists for this date
    // We use market overview as the indicator since it's the core data
    const path = `/settrade/marketOverview/byDate/${date}`
    const data = await rtdbGet<RTDBMarketOverview>(path)

    // If any data exists, this is our latest date
    if (data) {
      return date
    }
  }

  // No data found in lookback period
  return null
}
