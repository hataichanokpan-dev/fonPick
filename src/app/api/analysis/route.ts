/**
 * Combined Analysis API Route
 *
 * GET /api/analysis
 * Returns complete market analysis combining all services.
 * This is the main entry point for Phase 2 integration.
 *
 * This endpoint orchestrates all analysis services and provides
 * a complete market picture in a single API call.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getCompleteMarketAnalysis,
  getQuickMarketSnapshot,
  getSectorFocus,
} from '@/services/integration/combined-analysis'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/analysis
 * Query parameters:
 * - date: Optional date in YYYY-MM-DD format (defaults to today)
 * - type: Analysis type - 'full', 'snapshot', or 'sector' (default: 'full')
 * - historicalDays: Number of historical days to include (default: 5)
 * - includeRankings: Include rankings cross-analysis (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestedDate = searchParams.get('date') || undefined
    const analysisType = searchParams.get('type') || 'full'
    const historicalDays = searchParams.get('historicalDays')
      ? parseInt(searchParams.get('historicalDays')!, 10)
      : 5
    const includeRankings = searchParams.get('includeRankings') !== 'false'

    // Determine which analysis to perform
    if (analysisType === 'snapshot') {
      // Quick snapshot with minimal data
      const snapshot = await getQuickMarketSnapshot(requestedDate)

      return NextResponse.json(
        {
          success: true,
          type: 'snapshot',
          data: snapshot,
          meta: {
            date: requestedDate || new Date().toISOString().split('T')[0],
            timestamp: Date.now(),
          },
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        }
      )
    }

    if (analysisType === 'sector') {
      // Sector-focused analysis
      const sectorData = await getSectorFocus(requestedDate)

      return NextResponse.json(
        {
          success: true,
          type: 'sector',
          data: sectorData,
          meta: {
            date: requestedDate || new Date().toISOString().split('T')[0],
            timestamp: Date.now(),
          },
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        }
      )
    }

    // Default: Full complete analysis
    const analysis = await getCompleteMarketAnalysis({
      date: requestedDate,
      historicalDays,
      includeRankings,
      measurePerformance: true,
    })

    return NextResponse.json(
      {
        success: true,
        type: 'full',
        data: analysis,
        meta: {
          date: requestedDate || new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
          performanceMs: analysis.meta.duration,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (error) {
    console.error('Error in analysis API:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform market analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
