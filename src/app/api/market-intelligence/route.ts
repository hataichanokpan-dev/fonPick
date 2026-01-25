/**
 * Market Intelligence API Endpoint
 *
 * Unified endpoint that aggregates market intelligence data from multiple sources:
 * - P0: Market regime detection and smart money analysis
 * - P1: Sector rotation detection
 * - P2: Active stocks concentration analysis
 *
 * Query Parameters:
 * - includeP0: Include P0 analysis (default: true)
 * - includeP1: Include P1 analysis (default: true)
 * - includeP2: Include P2 analysis (default: true)
 * - includeHistorical: Include historical data for trend analysis (default: false)
 *
 * Caching:
 * - Cache-Control: public, s-maxage=30, stale-while-revalidate=60
 * - CDN/Edge caches for 30 seconds, serves stale for 60 seconds during revalidation
 *
 * Error Handling:
 * - Always returns 200 status with valid structure
 * - Sets null for missing data sources
 * - Includes error field if critical failure occurs
 */

import { NextRequest, NextResponse } from 'next/server'
import { aggregateMarketIntelligence } from '@/services/market-intelligence'
import type { MarketIntelligenceData } from '@/types/market-intelligence'

// ============================================================================
// RTDB FETCHERS
// ============================================================================

import { fetchMarketOverview } from '@/lib/rtdb/market-overview'
import { fetchInvestorType } from '@/lib/rtdb/investor-type'
import { fetchIndustrySector } from '@/lib/rtdb/industry-sector'
import { fetchTopRankingsEnhanced } from '@/lib/rtdb/top-rankings'

// ============================================================================
// TYPES
// ============================================================================

interface MarketIntelligenceResponse {
  success: boolean
  data?: MarketIntelligenceData
  error?: string
  meta?: {
    timestamp: number
    processingTime: number
    sourcesFetched: {
      marketOverview: boolean
      investorType: boolean
      industrySector: boolean
      rankings: boolean
    }
  }
}

interface QueryParams {
  includeP0: boolean
  includeP1: boolean
  includeP2: boolean
  includeHistorical: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
  'CDN-Cache-Control': 'public, s-maxage=30',
  'Vary': 'Accept-Encoding',
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse query parameters with defaults
 */
function parseQueryParams(request: NextRequest): QueryParams {
  const searchParams = request.nextUrl.searchParams

  return {
    includeP0: searchParams.get('includeP0') !== 'false',
    includeP1: searchParams.get('includeP1') !== 'false',
    includeP2: searchParams.get('includeP2') !== 'false',
    includeHistorical: searchParams.get('includeHistorical') === 'true',
  }
}

/**
 * Build source tracking object
 */
interface SourceTracker {
  marketOverview: boolean
  investorType: boolean
  industrySector: boolean
  rankings: boolean
}

function createSourceTracker(): SourceTracker {
  return {
    marketOverview: false,
    investorType: false,
    industrySector: false,
    rankings: false,
  }
}

/**
 * Format error message for client
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  const params = parseQueryParams(request)
  const sourcesFetched = createSourceTracker()

  try {
    // Parallel fetch all RTDB data sources
    const [marketOverview, investorType, industrySector, rankings] =
      await Promise.allSettled([
        fetchMarketOverview(),
        fetchInvestorType(),
        fetchIndustrySector(),
        fetchTopRankingsEnhanced(),
      ])

    // Track which sources were successfully fetched
    sourcesFetched.marketOverview = marketOverview.status === 'fulfilled' && marketOverview.value !== null
    sourcesFetched.investorType = investorType.status === 'fulfilled' && investorType.value !== null
    sourcesFetched.industrySector = industrySector.status === 'fulfilled' && industrySector.value !== null
    sourcesFetched.rankings = rankings.status === 'fulfilled' && rankings.value !== null

    // Extract values or null
    const marketOverviewData =
      marketOverview.status === 'fulfilled' ? marketOverview.value : null
    const investorTypeData =
      investorType.status === 'fulfilled' ? investorType.value : null
    const industrySectorData =
      industrySector.status === 'fulfilled' ? industrySector.value : null
    const rankingsData =
      rankings.status === 'fulfilled' ? rankings.value : null

    // Build input for aggregator
    const input = {
      marketOverview: marketOverviewData
        ? {
            setIndex: marketOverviewData.set.index,
            setChange: marketOverviewData.set.change,
            setChangePercent: marketOverviewData.set.changePercent,
            totalValue: marketOverviewData.totalValue,
            totalVolume: marketOverviewData.totalVolume,
            timestamp: marketOverviewData.timestamp,
          }
        : null,
      investorType: investorTypeData
        ? {
            foreign: investorTypeData.foreign,
            institution: investorTypeData.institution,
            retail: investorTypeData.retail,
            prop: investorTypeData.prop,
            timestamp: investorTypeData.timestamp,
          }
        : null,
      industrySector: industrySectorData
        ? {
            sectors: industrySectorData.sectors,
            timestamp: industrySectorData.timestamp,
          }
        : null,
      rankings: rankingsData
        ? {
            topValue: rankingsData.topValue.map((s) => ({
              symbol: s.symbol,
              name: s.name,
              value: s.value,
              volume: s.volume,
              changePct: s.changePct,
              sectorCode: s.sectorCode,
              marketCapGroup: s.marketCapGroup,
            })),
            topVolume: rankingsData.topVolume.map((s) => ({
              symbol: s.symbol,
              name: s.name,
              value: s.value,
              volume: s.volume,
              changePct: s.changePct,
              sectorCode: s.sectorCode,
              marketCapGroup: s.marketCapGroup,
            })),
            topGainers: rankingsData.topGainers.map((s) => ({
              symbol: s.symbol,
              name: s.name,
              changePct: s.changePct,
              value: s.value,
            })),
            topLosers: rankingsData.topLosers.map((s) => ({
              symbol: s.symbol,
              name: s.name,
              changePct: s.changePct,
              value: s.value,
            })),
            timestamp: rankingsData.timestamp,
          }
        : null,
      historical: params.includeHistorical ? {} : undefined,
    }

    // Aggregate market intelligence
    const data = await aggregateMarketIntelligence(input, {
      includeP0: params.includeP0,
      includeP1: params.includeP1,
      includeP2: params.includeP2,
    })

    const processingTime = Date.now() - startTime

    const response: MarketIntelligenceResponse = {
      success: true,
      data,
      meta: {
        timestamp: Date.now(),
        processingTime,
        sourcesFetched,
      },
    }

    return NextResponse.json(response, {
      status: 200,
      headers: CACHE_HEADERS,
    })
  } catch (error) {
    // Log error for debugging
    console.error('[Market Intelligence API] Error:', error)

    const processingTime = Date.now() - startTime

    // Return error response with valid structure
    const response: MarketIntelligenceResponse = {
      success: false,
      error: formatError(error),
      meta: {
        timestamp: Date.now(),
        processingTime,
        sourcesFetched,
      },
    }

    return NextResponse.json(response, {
      status: 200, // Always return 200 with error field
      headers: CACHE_HEADERS,
    })
  }
}

// ============================================================================
// EDGE RUNTIME CONFIG
// ============================================================================

export const runtime = 'nodejs' // Use Node.js runtime for RTDB operations
export const dynamic = 'force-dynamic' // Force dynamic rendering
