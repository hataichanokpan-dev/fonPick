/**
 * Sector Rotation API Route
 *
 * GET /api/sector-rotation
 * Returns sector rotation analysis including leadership, rotation patterns,
 * and regime context. Answers Question #2: "What sector is heavy market up or down?"
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchIndustrySectorByDate, fetchIndustrySector } from '@/lib/rtdb/industry-sector'
import { fetchTopRankingsByDate } from '@/lib/rtdb/top-rankings'
import { getDateDaysAgo } from '@/lib/rtdb/paths'
import { analyzeSectorRotation } from '@/services/sector-rotation/analyzer'
import type { SectorRotationAnalysis } from '@/types/sector-rotation'
import type { RTDBIndustrySector, RTDBTopRankings } from '@/types/rtdb'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/sector-rotation
 * Query parameters:
 * - date: Optional date in YYYY-MM-DD format (defaults to today)
 * - includeRankings: Include rankings cross-analysis (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestedDate = searchParams.get('date')
    const includeRankings = searchParams.get('includeRankings') !== 'false'

    // Determine target date
    const targetDate = requestedDate || new Date().toISOString().split('T')[0]

    // Fetch current sector data using the proper fetcher that converts to RTDBIndustrySector
    let currentSectorData = await fetchIndustrySectorByDate(targetDate)

    if (!currentSectorData) {
      // Try fetching latest as fallback
      currentSectorData = await fetchIndustrySector()
    }

    if (!currentSectorData) {
      // Return unavailable data structure instead of 404
      const unavailableData = {
        leaders: [],
        laggards: [],
        pattern: 'Mixed/No Clear Pattern' as const,
        marketDriver: undefined,
        concentration: 0,
        observations: ['Sector data not currently available'],
        timestamp: Date.now(),
      }
      return NextResponse.json(unavailableData, { status: 200 })
    }

    // Validate sector data structure
    if (!currentSectorData?.sectors || !Array.isArray(currentSectorData.sectors)) {
      console.error('Invalid sector data structure:', currentSectorData)
      return NextResponse.json(
        {
          error: 'Invalid sector data',
          message: 'Sector data is not in expected format',
        },
        { status: 500 }
      )
    }

    // Create a map for quick sector lookup
    const sectorMap = new Map(
      currentSectorData.sectors.map(s => [s.id, s])
    )

    // Fetch rankings data for cross-analysis (if requested)
    let rankingsData: RTDBTopRankings | undefined
    if (includeRankings) {
      rankingsData = await fetchTopRankingsByDate(targetDate) || undefined
    }

    // Fetch historical sector data for trend detection
    const historicalPromises = Array.from({ length: 5 }, (_, i) => {
      const date = getDateDaysAgo(i + 1)
      return fetchIndustrySectorByDate(date)
    })

    const historicalResults = await Promise.all(historicalPromises)
    const historicalData = historicalResults.filter(
      (data): data is RTDBIndustrySector => data !== null
    )

    // Perform sector rotation analysis
    const analysis: SectorRotationAnalysis = analyzeSectorRotation({
      sectors: currentSectorData,
      rankings: rankingsData,
      historical: historicalData.length > 0 ? historicalData : undefined,
    })

    // Transform to module-friendly format with proper sector change data
    const moduleData = {
      leaders: (analysis.leadership?.leaders || []).map(s => {
        const sectorInfo = sectorMap.get(s.sector?.id || '')
        return {
          sector: s.sector?.id || '',
          name: sectorInfo?.name || s.sector?.name || 'Unknown',
          change: sectorInfo?.changePercent || 0,
          signal: s.signal,
          rank: s.rank,
          value: s.value,
        }
      }),
      laggards: (analysis.leadership?.laggards || []).map(s => {
        const sectorInfo = sectorMap.get(s.sector?.id || '')
        return {
          sector: s.sector?.id || '',
          name: sectorInfo?.name || s.sector?.name || 'Unknown',
          change: sectorInfo?.changePercent || 0,
          signal: s.signal,
          rank: s.rank,
          value: s.value,
        }
      }),
      pattern: analysis.pattern || 'Mixed/No Clear Pattern',
      marketDriver: analysis.leadership?.marketDriver ? {
        sector: analysis.leadership.marketDriver.sector?.id || '',
        name: sectorMap.get(analysis.leadership.marketDriver.sector?.id || '')?.name || analysis.leadership.marketDriver.sector?.name || 'Unknown',
        change: sectorMap.get(analysis.leadership.marketDriver.sector?.id || '')?.changePercent || 0,
        signal: analysis.leadership.marketDriver.signal,
        rank: analysis.leadership.marketDriver.rank,
      } : undefined,
      concentration: analysis.leadership?.concentration || 0,
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
    console.error('Error in sector-rotation API:', error)

    return NextResponse.json(
      {
        error: 'Failed to analyze sector rotation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
