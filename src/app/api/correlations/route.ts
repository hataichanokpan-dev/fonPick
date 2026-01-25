/**
 * Correlations API Route
 *
 * GET /api/correlations
 * Returns correlation analysis between Top Rankings and Sector performance.
 * Answers Questions #5 and #6: Rankings impact and Rankings vs Sector comparison.
 *
 * Phase 2 Fix: Adds "Other" category for unmapped stocks and coverage metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  fetchIndustrySectorByDate,
  fetchIndustrySector,
  fetchTopRankingsByDate,
  fetchTopRankings,
} from '@/lib/rtdb'
import {
  analyzeRankingsSectorCorrelation,
  analyzeRankingsImpact,
} from '@/services/correlations/analyzer'
import type { RankingsVsSectorAnalysis, RankingsImpactAnalysis } from '@/types/correlation'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * Map rankings by sector (Phase 2 Fix: Adds "Other" category)
 *
 * @param rankings Rankings data with stocks
 * @param sectors Sectors data
 * @returns Array of sector mappings including "Other"
 */
function mapRankingsBySector(
  rankings: Parameters<typeof analyzeRankingsImpact>[0]['rankings'],
  sectors: Parameters<typeof analyzeRankingsImpact>[0]['sectors']
) {
  // Initialize sector map with "OTHER" entry
  const sectorMap: Record<string, {
    sectorId: string
    sectorName: string
    sectorChange: number
    rankingsCount: number
    gainers: number
    losers: number
  }> = {
    'OTHER': {
      sectorId: 'OTHER',
      sectorName: 'Other',
      sectorChange: 0,
      rankingsCount: 0,
      gainers: 0,
      losers: 0,
    }
  }

  // Initialize with all sectors
  sectors.sectors.forEach(sector => {
    sectorMap[sector.id] = {
      sectorId: sector.id,
      sectorName: sector.name,
      sectorChange: sector.changePercent,
      rankingsCount: 0,
      gainers: 0,
      losers: 0,
    }
  })

  /**
   * Find stock's sector (Phase 2 Fix: Returns 'OTHER' as default)
   * @param symbol Stock symbol
   * @returns Sector ID or 'OTHER' if not found
   */
  const findStockSector = (symbol: string): string => {
    const stockSectorMap: Record<string, string> = {
      // Financial
      'KBANK': 'FIN', 'SCB': 'FIN', 'BBL': 'FIN', 'KTB': 'FIN', 'TISCO': 'FIN',
      'CIMBT': 'FIN', 'LHFG': 'FIN', 'MFC': 'FIN', 'TFIN': 'FIN', 'GSB': 'FIN',

      // Energy
      'PTT': 'ENERGY', 'PTTEP': 'ENERGY', 'TOP': 'ENERGY', 'PTTGC': 'ENERGY',
      'IRPC': 'ENERGY', 'SPRC': 'ENERGY',

      // Technology
      'ADVANC': 'TECH', 'INTUCH': 'TECH', 'TRUE': 'TECH', 'DTAC': 'TECH',
      'SAMART': 'TECH', 'JAS': 'TECH', 'GF': 'TECH',

      // Agribusiness
      'CPF': 'AGRI', 'TA': 'AGRI', 'UF': 'AGRI',

      // Property
      'AP': 'PROP', 'LAND': 'PROP', 'LH': 'PROP', 'QH': 'PROP',
      'SPALI': 'PROP', 'RL': 'PROP', 'MKA': 'PROP',

      // Automotive
      'TM': 'AUTO', 'STA': 'AUTO', 'TPIPL': 'AUTO', 'RATCH': 'AUTO',

      // Construction
      'ITD': 'CONS', 'CK': 'CONS', 'TTW': 'CONS', 'TKC': 'CONS',

      // Healthcare
      'BDMS': 'HEALTH', 'BH': 'HEALTH', 'PRIN': 'HEALTH', 'ROS': 'HEALTH',

      // Retail
      'CPALL': 'COMM', 'HMPRO': 'COMM', 'BJC': 'COMM', 'OCSI': 'COMM',

      // Transportation
      'AOT': 'TRANS', 'COSPH': 'TRANS',
    }
    return stockSectorMap[symbol.toUpperCase()] || 'OTHER'
  }

  // Track all stocks for coverage calculation
  let totalStocksCount = 0
  let mappedStocksCount = 0

  /**
   * Count rankings by sector
   * @param stocks Array of stocks
   * @param type 'gainers' or 'losers' or 'neutral'
   */
  const countRankings = (
    stocks: Parameters<typeof analyzeRankingsImpact>[0]['rankings']['topGainers'],
    type: 'gainers' | 'losers' | 'neutral'
  ) => {
    stocks.forEach(stock => {
      totalStocksCount++
      const sectorId = findStockSector(stock.symbol)

      if (sectorMap[sectorId]) {
        sectorMap[sectorId].rankingsCount++
        if (type === 'gainers') {
          sectorMap[sectorId].gainers++
        } else if (type === 'losers') {
          sectorMap[sectorId].losers++
        }

        // Track mapped stocks (excluding 'OTHER')
        if (sectorId !== 'OTHER') {
          mappedStocksCount++
        }
      }
    })
  }

  countRankings(rankings.topGainers, 'gainers')
  countRankings(rankings.topLosers, 'losers')
  countRankings(rankings.topVolume, 'neutral')
  countRankings(rankings.topValue, 'neutral')

  // Calculate coverage percentage
  const coveragePercent = totalStocksCount > 0
    ? Math.round((mappedStocksCount / totalStocksCount) * 100)
    : 0

  return {
    sectors: Object.values(sectorMap).filter(s => s.rankingsCount > 0),
    totalStocks: totalStocksCount,
    mappedStocks: mappedStocksCount,
    coveragePercent,
  }
}

/**
 * GET /api/correlations
 * Query parameters:
 * - type: 'impact' or 'vs-sector' (default: 'vs-sector')
 * - date: Optional date in YYYY-MM-DD format (defaults to today)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestedType = searchParams.get('type') || 'vs-sector'
    const requestedDate = searchParams.get('date')

    // Determine target date
    const targetDate = requestedDate || new Date().toISOString().split('T')[0]

    // Fetch required data using proper fetchers that convert to app format
    const [sectorData, rankingsData] = await Promise.all([
      fetchIndustrySectorByDate(targetDate),
      fetchTopRankingsByDate(targetDate),
    ])

    // Try fallback to latest data if specific date not available
    const finalSectorData = sectorData || await fetchIndustrySector()
    const finalRankingsData = rankingsData || await fetchTopRankings()

    // Check if we have required data
    if (!finalSectorData) {
      return NextResponse.json(
        {
          error: 'Sector data not available',
          message: 'Unable to fetch sector data for correlation analysis',
        },
        { status: 404 }
      )
    }

    // Rankings are optional for some correlation analysis
    // If rankings are not available, return empty analysis rather than error
    if (!finalRankingsData) {
      // Return empty data for correlation (Phase 2: includes coverage metrics)
      const emptyModuleData = {
        overallCorrelation: 0,
        correlationScore: 50,
        sectors: [],
        anomalies: [],
        sectorCount: 0,
        aligned: false,
        insights: ['Rankings data not available for correlation analysis'],
        // Phase 2: Add coverage metrics
        totalStocks: 0,
        mappedStocks: 0,
        coveragePercent: 0,
        timestamp: Date.now(),
      }

      return NextResponse.json(emptyModuleData, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      })
    }

    // Validate sector data structure
    if (!finalSectorData?.sectors || !Array.isArray(finalSectorData.sectors)) {
      console.error('Invalid sector data structure:', finalSectorData)
      return NextResponse.json(
        {
          error: 'Invalid sector data',
          message: 'Sector data is not in expected format',
        },
        { status: 500 }
      )
    }

    // Map rankings by sector for use in both impact and vs-sector responses (Phase 2 fix)
    const bySectorResult = mapRankingsBySector(finalRankingsData, finalSectorData)
    const bySector = bySectorResult.sectors

    // Return based on request type
    if (requestedType === 'impact') {
      // Rankings Impact (Q5)
      const impactAnalysis: RankingsImpactAnalysis = analyzeRankingsImpact({
        rankings: finalRankingsData,
        sectors: finalSectorData,
      })

      // Map sector data to get counts and changes for distribution
      const sectorMap = new Map(
        finalSectorData.sectors.map(s => [s.id, s])
      )

      // Create a map of sector code to rankings count
      const sectorRankingsMap = new Map(
        bySector.map(s => [s.sectorId, s.rankingsCount])
      )

      // Calculate total rankings for percentage calculation (including 'OTHER')
      const totalRankings = bySector.reduce((sum, s) => sum + s.rankingsCount, 0)

      // Transform to module-friendly format with actual sector counts
      const moduleData = {
        impact: impactAnalysis.impact || 'Unknown',
        distribution: (impactAnalysis.dominance?.dominant || ['OTHER']).map(sectorCode => {
          const sectorInfo = sectorMap.get(sectorCode) || {
            id: sectorCode,
            name: sectorCode === 'OTHER' ? 'Other' : sectorCode,
            changePercent: 0,
          }
          // Get actual rankings count from bySector mapping
          const sectorRankingsCount = sectorRankingsMap.get(sectorCode) || 0

          // Calculate percentage based on actual rankings count
          const percentage = totalRankings > 0
            ? Math.round((sectorRankingsCount / totalRankings) * 100)
            : 0

          return {
            sector: sectorCode,
            name: sectorInfo.name,
            count: sectorRankingsCount,
            percentage,
            change: sectorInfo.changePercent || 0,
          }
        }),
        concentration: impactAnalysis.concentration?.score || 0,
        concentrationLevel: impactAnalysis.concentration?.level || 'Unknown',
        top3Percent: impactAnalysis.concentration?.top3Percent || 0,
        dominantSectors: impactAnalysis.dominance?.dominant || [],
        breadthStatus: impactAnalysis.breadthImpact?.rankingsBreadth || 'Unknown',
        observations: impactAnalysis.observations || [],
        timestamp: impactAnalysis.timestamp || Date.now(),
        // Phase 2: Add coverage metrics
        coverage: {
          totalStocks: bySectorResult.totalStocks,
          mappedStocks: bySectorResult.mappedStocks,
          coveragePercent: bySectorResult.coveragePercent,
        },
      }

      return NextResponse.json(moduleData, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      })
    }

    // Default: vs-sector (Q6)
    const correlationAnalysis: RankingsVsSectorAnalysis = analyzeRankingsSectorCorrelation({
      rankings: finalRankingsData,
      sectors: finalSectorData,
    })

    // Calculate total rankings from sector correlations for accurate percentages
    const totalRankingsInCorrelation = (correlationAnalysis.sectorCorrelations || [])
      .reduce((sum, s) => sum + (s.rankingsCount || 0), 0)

    // Transform to module-friendly format matching CorrelationModule expectations with null safety
    const moduleData = {
      overallCorrelation: correlationAnalysis.overallCorrelation ?? 'Neutral',
      correlationScore: correlationAnalysis.correlationScore ?? 50,
      sectors: (correlationAnalysis.sectorCorrelations || []).map(s => {
        const percentage = totalRankingsInCorrelation > 0
          ? Math.round((s.rankingsCount || 0) / totalRankingsInCorrelation * 100)
          : 0

        return {
          sector: s.sectorId || '',
          name: s.sectorName || 'Unknown',
          sectorChange: s.sectorChange ?? 0,
          rankingsCount: s.rankingsCount ?? 0,
          expectedCount: s.expectedCount ?? 0,
          correlation: s.correlation ?? 'Neutral',
          correlationScore: s.correlationScore ?? 50,
          isAnomaly: s.anomaly !== null,
          anomalyType: s.anomaly,
          count: s.rankingsCount ?? 0,
          percentage,
        }
      }),
      anomalies: (correlationAnalysis.anomalies || []).map(a => ({
        sector: a.sectorId || '',
        name: a.sectorName || 'Unknown',
        type: a.anomaly || 'Unknown',
        explanation: a.explanation || '',
      })),
      sectorCount: correlationAnalysis.sectorCorrelations?.length || 0,
      aligned: correlationAnalysis.aligned ?? false,
      insights: correlationAnalysis.insights || [],
      timestamp: correlationAnalysis.timestamp || Date.now(),
      // Phase 2: Add coverage metrics
      coverage: {
        totalStocks: bySectorResult.totalStocks,
        mappedStocks: bySectorResult.mappedStocks,
        coveragePercent: bySectorResult.coveragePercent,
      },
    }

    return NextResponse.json(moduleData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Error in correlations API:', error)

    return NextResponse.json(
      {
        error: 'Failed to analyze correlations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
