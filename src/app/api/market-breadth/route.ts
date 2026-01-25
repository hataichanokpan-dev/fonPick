/**
 * Market Breadth API Route
 *
 * GET /api/market-breadth
 * Returns market breadth analysis including A/D ratio, volatility assessment,
 * and breadth status. Answers Question #1: "How about market now?"
 */

import { NextRequest, NextResponse } from 'next/server'
import { rtdbGet, fetchWithFallback } from '@/lib/rtdb/client'
import { RTDB_PATHS, getDateDaysAgo } from '@/lib/rtdb/paths'
import { analyzeMarketBreadth } from '@/services/market-breadth/analyzer'
import type { MarketBreadthAnalysis } from '@/types/market-breadth'
import type { RTDBMarketOverview } from '@/types/rtdb'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/market-breadth
 * Query parameters:
 * - date: Optional date in YYYY-MM-DD format (defaults to today)
 * - includeHistorical: Include historical data for trend analysis (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestedDate = searchParams.get('date')
    const includeHistorical = searchParams.get('includeHistorical') !== 'false'

    // Determine target date
    const targetDate = requestedDate || new Date().toISOString().split('T')[0]

    // Fetch current market overview data
    const currentPath = RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(targetDate)
    const currentData = await fetchWithFallback<RTDBMarketOverview>(
      currentPath,
      RTDB_PATHS.MARKET_OVERVIEW_PREVIOUS
    )

    if (!currentData) {
      // Return default values instead of 404 to allow UI to render with zeros
      const defaultData = {
        adRatio: 1.0,
        advances: 0,
        declines: 0,
        newHighs: 0,
        newLows: 0,
        status: 'Neutral' as const,
        volatility: 'Moderate' as const,
        trend: 'Stable' as const,
        confidence: 0,
        observations: ['Market data not currently available'],
        timestamp: Date.now(),
      }
      return NextResponse.json(defaultData, { status: 200 })
    }

    // Fetch historical data for trend analysis
    let historicalData: RTDBMarketOverview[] = []
    if (includeHistorical) {
      // Fetch up to 5 days of historical data
      const historicalPromises = Array.from({ length: 5 }, (_, i) => {
        const date = getDateDaysAgo(i + 1)
        return rtdbGet<RTDBMarketOverview>(
          RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(date)
        )
      })

      const historicalResults = await Promise.all(historicalPromises)
      historicalData = historicalResults.filter(
        (data): data is RTDBMarketOverview => data !== null
      )
    }

    // Perform market breadth analysis
    const analysis: MarketBreadthAnalysis = analyzeMarketBreadth({
      current: currentData,
      historical: historicalData.length > 0 ? historicalData : undefined,
    })

    // Transform to module-friendly format with null safety
    const moduleData = {
      adRatio: analysis.metrics?.adRatio || 0,
      advances: analysis.metrics?.advances || 0,
      declines: analysis.metrics?.declines || 0,
      newHighs: analysis.metrics?.newHighs || 0,
      newLows: analysis.metrics?.newLows || 0,
      status: analysis.status || 'Neutral',
      volatility: analysis.volatility || 'Moderate',
      trend: analysis.trend || 'Stable',
      confidence: analysis.confidence || 50,
      observations: analysis.observations || [],
      timestamp: analysis.timestamp || Date.now(),
    }

    // Return response
    return NextResponse.json(moduleData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Error in market-breadth API:', error)

    return NextResponse.json(
      {
        error: 'Failed to analyze market breadth',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
