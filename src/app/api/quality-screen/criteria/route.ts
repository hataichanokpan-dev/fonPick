/**
 * Quality Screen Criteria API Route
 *
 * GET /api/quality-screen/criteria
 *
 * API สำหรับดึงข้อมูลเกณฑ์การคัดเลือกหุ้น (Quality Screen Criteria)
 * ตาม Sub-sector หรือ Sector
 *
 * Query Parameters:
 * - subSector: ค้นหาด้วยชื่อ sub-sector (ภาษาอังกฤษ)
 * - sector: ค้นหาด้วยชื่อ sector (ภาษาอังกฤษ)
 * - search: ค้นหาด้วย keyword
 * - sectors: ดึงรายการ sectors ทั้งหมด (true)
 * - summary: ดึงข้อมูลสรุป (true)
 *
 * Examples:
 * - /api/quality-screen/criteria?subSector=Technology
 * - /api/quality-screen/criteria?sector=Technology
 * - /api/quality-screen/criteria?sectors=true
 * - /api/quality-screen/criteria?summary=true
 */

import { NextRequest } from 'next/server'
import {
  findBySubSector,
  findBySector,
  getAllSectors,
  getDatabaseSummary,
  searchSubSectors,
} from '@/lib/quality-screen/criteria'
import { cachedJson, NO_CACHE } from '@/lib/api-cache'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/quality-screen/criteria
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Special endpoints
    const sectors = searchParams.get('sectors') === 'true'
    const summary = searchParams.get('summary') === 'true'

    if (sectors) {
      // Return all sectors
      return cachedJson(
        {
          success: true,
          sectors: getAllSectors(),
        },
        NO_CACHE
      )
    }

    if (summary) {
      // Return database summary
      return cachedJson(
        {
          success: true,
          summary: getDatabaseSummary(),
        },
        NO_CACHE
      )
    }

    // Search parameters
    const subSector = searchParams.get('subSector')
    const sector = searchParams.get('sector')
    const search = searchParams.get('search')

    // Exact sub-sector match
    if (subSector) {
      const criteria = findBySubSector(subSector)
      if (!criteria) {
        return cachedJson(
          {
            success: false,
            error: 'Sub-sector not found',
            subSector: subSector,
          },
          NO_CACHE,
          404
        )
      }

      return cachedJson(
        {
          success: true,
          criteria: criteria,
        },
        NO_CACHE
      )
    }

    // Sector match
    if (sector) {
      const criteriaList = findBySector(sector)
      if (criteriaList.length === 0) {
        return cachedJson(
          {
            success: false,
            error: 'Sector not found',
            sector: sector,
          },
          NO_CACHE,
          404
        )
      }

      return cachedJson(
        {
          success: true,
          criteria: criteriaList,
          sector: sector,
        },
        NO_CACHE
      )
    }

    // Search by keyword
    if (search) {
      const results = searchSubSectors(search)
      return cachedJson(
        {
          success: true,
          criteria: results,
          keyword: search,
          total: results.length,
        },
        NO_CACHE
      )
    }

    // No parameters - return all
    return cachedJson(
      {
        success: false,
        error: 'Please specify subSector, sector, search, sectors=true, or summary=true',
      },
      NO_CACHE,
      400
    )
  } catch (error) {
    console.error('Error in quality screen criteria API:', error)

    return cachedJson(
      {
        success: false,
        error: 'Failed to fetch quality screen criteria',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      NO_CACHE,
      500
    )
  }
}
