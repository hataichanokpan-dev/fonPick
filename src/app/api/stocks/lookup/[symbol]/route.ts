/**
 * Stock Lookup API Route
 *
 * GET /api/stocks/lookup/[symbol]
 *
 * API สำหรับค้นหาข้อมูลหุ้นด้วย Symbol โดยตรง
 *
 * Examples:
 * - /api/stocks/lookup/ADVANC
 * - /api/stocks/lookup/KBANK
 * - /api/stocks/lookup/unknown → 404
 */

import { NextRequest } from 'next/server'
import { findBySymbol } from '@/lib/stocks/metadata'
import { cachedJson, NO_CACHE } from '@/lib/api-cache'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/stocks/lookup/[symbol]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params

    if (!symbol) {
      return cachedJson(
        {
          success: false,
          error: 'Symbol is required',
        },
        NO_CACHE,
        400
      )
    }

    // Find stock by symbol
    const stock = findBySymbol(symbol)

    if (!stock) {
      return cachedJson(
        {
          success: false,
          error: 'Stock not found',
          symbol: symbol.toUpperCase(),
        },
        NO_CACHE,
        404
      )
    }

    return cachedJson(
      {
        success: true,
        data: stock,
      },
      NO_CACHE
    )
  } catch (error) {
    console.error('Error in stock lookup API:', error)

    return cachedJson(
      {
        success: false,
        error: 'Failed to lookup stock',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      NO_CACHE,
      500
    )
  }
}
