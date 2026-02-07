/**
 * Stock Sub-Sectors API Route
 *
 * GET /api/stocks/subsectors
 *
 * API สำหรับดึงรายการ Sub-Sectors ทั้งหมด
 *
 * Examples:
 * - /api/stocks/subsectors
 * - /api/stocks/subsectors?sortBy=count (default: by count descending)
 * - /api/stocks/subsectors?sortBy=name (sort by name)
 */

import { NextRequest } from 'next/server'
import { getAllSubSectors } from '@/lib/stocks/metadata'
import { cachedJson, NO_CACHE } from '@/lib/api-cache'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/stocks/subsectors
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sortBy = searchParams.get('sortBy') || 'count'

    const subSectors = getAllSubSectors()

    // Sort if requested
    if (sortBy === 'name') {
      subSectors.sort((a, b) => a.name.localeCompare(b.name, 'en'))
    }

    return cachedJson(
      {
        success: true,
        data: subSectors,
      },
      NO_CACHE
    )
  } catch (error) {
    console.error('Error in stock sub-sectors API:', error)

    return cachedJson(
      {
        success: false,
        error: 'Failed to fetch sub-sectors',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      NO_CACHE,
      500
    )
  }
}
