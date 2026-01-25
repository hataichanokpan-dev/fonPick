/**
 * Volume Analysis API Route
 *
 * GET /api/volume
 * Returns comprehensive volume analysis including:
 * - Volume health score (today vs 5-day average)
 * - VWAD (Volume-Weighted Advance/Decline) conviction
 * - Concentration risk assessment
 * - Top volume leaders with relative volume
 *
 * Volume is the "fuel" that drives price movements - this endpoint
 * provides the conviction behind price action.
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchMarketOverview, fetchTopRankings } from '@/lib/rtdb'
import {
  calculateVolumeHealth,
  calculateVWAD,
  calculateConcentration,
  thousandsToMillions,
  averageFromHistoricalVolumes,
} from '@/services/volume/calculator'
import { fetch5DaySetIndexVolume } from '@/lib/rtdb/historical'
import { identifyVolumeLeaders, generateVolumeInsights } from '@/services/volume/analyzer'
import type { VolumeAnalysisData } from '@/types/volume'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/volume
 * Query parameters:
 * - includeInsights: Include generated insights (default: false)
 * - leadersCount: Number of volume leaders to return (default: 5)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeInsights = searchParams.get('includeInsights') === 'true'
    const leadersCount = parseInt(searchParams.get('leadersCount') || '5', 10)

    // Fetch historical volume data for dynamic baseline (Phase 1.1 fix)
    let dynamicAverageVolume: number | null = null
    try {
      const historicalVolumes = await fetch5DaySetIndexVolume(5)
      if (historicalVolumes.length > 0) {
        dynamicAverageVolume = averageFromHistoricalVolumes(historicalVolumes)
      }
    } catch (error) {
      console.warn('Failed to fetch historical volume data, using fallback:', error)
      // Will use fallback mock value
    }

    // Fetch market overview data for total volume
    const marketOverview = await fetchMarketOverview()

    if (!marketOverview) {
      // Return unavailable data structure instead of 404
      const unavailableData = {
        health: {
          currentVolume: 0,
          averageVolume: dynamicAverageVolume || 45000,
          healthScore: 0,
          healthStatus: 'Anemic' as const,
          trend: 'Neutral' as const,
        },
        vwad: {
          vwad: 0,
          conviction: 'Neutral' as const,
          upVolume: 0,
          downVolume: 0,
          totalVolume: 0,
        },
        concentration: {
          top5Volume: 0,
          totalVolume: 0,
          concentration: 0,
          concentrationLevel: 'Risky' as const,
        },
        volumeLeaders: [],
        timestamp: Date.now(),
      }
      return NextResponse.json(unavailableData, { status: 200 })
    }

    // Fetch top rankings for volume analysis
    const rankings = await fetchTopRankings()

    if (!rankings) {
      // Return unavailable data structure instead of 404
      const unavailableData = {
        health: {
          currentVolume: 0,
          averageVolume: dynamicAverageVolume || 45000,
          healthScore: 0,
          healthStatus: 'Anemic' as const,
          trend: 'Neutral' as const,
        },
        vwad: {
          vwad: 0,
          conviction: 'Neutral' as const,
          upVolume: 0,
          downVolume: 0,
          totalVolume: 0,
        },
        concentration: {
          top5Volume: 0,
          totalVolume: 0,
          concentration: 0,
          concentrationLevel: 'Risky' as const,
        },
        volumeLeaders: [],
        timestamp: Date.now(),
      }
      return NextResponse.json(unavailableData, { status: 200 })
    }

    // Get total volume (convert from thousands to millions)
    let currentVolume = thousandsToMillions(marketOverview.totalVolume || 0)

    // Fallback: if current volume is 0 or missing, try to estimate from top rankings
    if (currentVolume === 0 && rankings.topVolume.length > 0) {
      // Sum the top volume stocks as a baseline (this is partial data but better than 0)
      const topVolumeSum = rankings.topVolume.reduce((sum, s) => sum + (s.volume || 0), 0)
      // Top 10 typically represent ~30-40% of total volume, so we multiply by ~2.5-3
      const estimatedTotal = thousandsToMillions(topVolumeSum) * 3
      if (estimatedTotal > 0) {
        currentVolume = estimatedTotal
      }
    }

    // Calculate volume health with dynamic average (Phase 1.1 fix)
    const volumeHealth = calculateVolumeHealth(
      currentVolume,
      dynamicAverageVolume || undefined // Use undefined to trigger fallback
    )

    // Prepare VWAD input from rankings (combine gainers and losers)
    const vwadInput = [
      ...rankings.topGainers.map((s) => ({
        change: s.change || s.changePct || 0,
        volume: s.volume || 0,
      })),
      ...rankings.topLosers.map((s) => ({
        change: s.change || s.changePct || 0,
        volume: s.volume || 0,
      })),
    ]
    const vwadData = calculateVWAD(vwadInput)

    // Prepare concentration input from top volume rankings
    const concentrationInput = rankings.topVolume.map((s) => ({
      volume: s.volume || 0,
    }))
    const concentrationData = calculateConcentration(concentrationInput)

    // Identify volume leaders
    const leadersInput = rankings.topVolume.map((s) => ({
      symbol: s.symbol,
      volume: s.volume || 0,
      change: s.change || s.changePct || 0,
    }))
    const volumeLeaders = identifyVolumeLeaders(leadersInput).slice(0, leadersCount)

    // Build complete analysis
    const analysis: VolumeAnalysisData = {
      health: volumeHealth,
      vwad: vwadData,
      concentration: concentrationData,
      volumeLeaders,
      timestamp: Date.now(),
    }

    // Optionally include insights
    const responseData = includeInsights
      ? {
          ...analysis,
          insights: generateVolumeInsights(analysis),
        }
      : analysis

    // Return response
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Error in volume API:', error)

    return NextResponse.json(
      {
        error: 'Failed to analyze volume',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
