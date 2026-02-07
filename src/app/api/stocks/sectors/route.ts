/**
 * Stock Sectors API Route
 *
 * GET /api/stocks/sectors
 *
 * API สำหรับดึงรายการ Sectors ทั้งหมด
 *
 * Examples:
 * - /api/stocks/sectors
 * - /api/stocks/sectors?sortBy=count (default: by count descending)
 * - /api/stocks/sectors?sortBy=name (sort by name)
 */

import { NextRequest } from 'next/server'
import { getAllSectors, getAllSubSectors } from '@/lib/stocks/metadata'
import { cachedJson, NO_CACHE } from '@/lib/api-cache'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/stocks/sectors
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sortBy = searchParams.get('sortBy') || 'count'
    const includeSubSectors = searchParams.get('includeSubSectors') === 'true'

    const sectors = getAllSectors()

    // Sort if requested
    if (sortBy === 'name') {
      sectors.sort((a, b) => a.name.localeCompare(b.name, 'th'))
    }

    const response: {
      sectors: typeof sectors
      subSectors?: ReturnType<typeof getAllSubSectors>
    } = {
      sectors: sectors,
    }

    if (includeSubSectors) {
      response.subSectors = getAllSubSectors()
    }

    return cachedJson(
      {
        success: true,
        data: response,
      },
      NO_CACHE
    )
  } catch (error) {
    console.error('Error in stock sectors API:', error)

    return cachedJson(
      {
        success: false,
        error: 'Failed to fetch sectors',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      NO_CACHE,
      500
    )
  }
}
