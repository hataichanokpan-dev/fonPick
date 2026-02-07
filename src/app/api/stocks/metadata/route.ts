/**
 * Stock Metadata API Route
 *
 * GET /api/stocks/metadata
 *
 * API สำหรับค้นหาข้อมูลเมตาดาต้าของหุ้นไทย
 * เช่น ค้นหา symbol, sector, sub-sector, ฯลฯ
 *
 * Query Parameters:
 * - symbol: ค้นหาด้วยชื่อย่อหุ้น (exact match)
 * - name: ค้นหาด้วยชื่อบริษัท (partial match)
 * - market: ตลาดหลักทรัพย์ (SET, mai)
 * - sector: ค้นหาด้วย sector
 * - subSector: ค้นหาด้วย sub-sector (ภาษาอังกฤษ)
 * - industry: ค้นหาด้วย industry
 * - limit: จำกัดจำนวนผลลัพธ์ (default: 50)
 * - offset: ข้ามจำนวนผลลัพธ์ (สำหรับ pagination)
 * - sectors: ดึงรายการ sectors ทั้งหมด (true)
 * - subSectors: ดึงรายการ sub-sectors ทั้งหมด (true)
 * - summary: ดึงข้อมูลสรุป (true)
 *
 * Examples:
 * - /api/stocks/metadata?symbol=ADVANC
 * - /api/stocks/metadata?subSector=Technology
 * - /api/stocks/metadata?market=SET&limit=10
 * - /api/stocks/metadata?sectors=true
 * - /api/stocks/metadata?subSectors=true
 * - /api/stocks/metadata?summary=true
 */

import { NextRequest } from 'next/server'
import {
  findBySymbol,
  searchStocks,
  getAllSectors,
  getAllSubSectors,
  getDatabaseSummary,
} from '@/lib/stocks/metadata'
import { cachedJson, NO_CACHE } from '@/lib/api-cache'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/stocks/metadata
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Special endpoints
    const sectors = searchParams.get('sectors') === 'true'
    const subSectors = searchParams.get('subSectors') === 'true'
    const summary = searchParams.get('summary') === 'true'

    if (sectors) {
      // Return all sectors
      return cachedJson(
        {
          sectors: getAllSectors(),
        },
        NO_CACHE
      )
    }

    if (subSectors) {
      // Return all sub-sectors
      return cachedJson(
        {
          subSectors: getAllSubSectors(),
        },
        NO_CACHE
      )
    }

    if (summary) {
      // Return database summary
      return cachedJson(
        {
          summary: getDatabaseSummary(),
        },
        NO_CACHE
      )
    }

    // Search parameters
    const symbol = searchParams.get('symbol')
    const name = searchParams.get('name')
    const market = searchParams.get('market') as 'SET' | 'mai' | null
    const sector = searchParams.get('sector')
    const subSector = searchParams.get('subSector')
    const industry = searchParams.get('industry')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Exact symbol match (single stock)
    if (symbol) {
      const stock = findBySymbol(symbol)
      if (!stock) {
        return cachedJson(
          {
            success: false,
            error: 'Symbol not found',
            symbol: symbol,
          },
          NO_CACHE,
          404
        )
      }

      return cachedJson(
        {
          success: true,
          stock: stock,
        },
        NO_CACHE
      )
    }

    // Validate market parameter
    if (market && market !== 'SET' && market !== 'mai') {
      return cachedJson(
        {
          success: false,
          error: 'Invalid market parameter. Must be SET or mai.',
        },
        NO_CACHE,
        400
      )
    }

    // Build query
    const query = {
      name: name || undefined,
      market: market || undefined,
      sector: sector || undefined,
      subSector: subSector || undefined,
      industry: industry || undefined,
      limit: limit,
      offset: offset,
    }

    // Search stocks
    const result = searchStocks(query)

    return cachedJson(
      {
        success: true,
        data: result.stocks,
        meta: {
          total: result.total,
          limit: limit,
          offset: offset,
          hasMore: result.total > limit,
        },
      },
      NO_CACHE
    )
  } catch (error) {
    console.error('Error in stock metadata API:', error)

    return cachedJson(
      {
        success: false,
        error: 'Failed to fetch stock metadata',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      NO_CACHE,
      500
    )
  }
}
