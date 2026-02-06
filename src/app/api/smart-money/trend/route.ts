/**
 * Smart Money Trend API Route
 *
 * GET /api/smart-money/trend
 * Returns historical trend analysis for investor flows.
 *
 * Query parameters:
 * - period: Number of days (5, 10, 30, 60, 90) - default: 30
 * - investors: Comma-separated investor types (foreign,institution,retail,prop) - default: all
 * - aggregate: Aggregation granularity (daily, weekly) - default: daily
 * - startDate: Optional start date (YYYY-MM-DD) - overrides period
 * - endDate: Optional end date (YYYY-MM-DD) - default: today
 *
 * Phase 1: Backend Implementation
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchInvestorTypeRange } from '@/lib/rtdb/investor-type'
import {
  convertToInvestorTrend,
  generateCombinedTrend,
  detectPatterns,
  detectPrimaryDriver,
} from '@/services/smart-money/trend-analyzer'
import {
  getCachedTrendResponse,
  cacheTrendResponse,
  getSmartCacheTTL,
  getTrendCacheControl,
} from '@/lib/cache/trend-cache'
import type {
  TrendAnalysisResponse,
  TrendAnalysisParams,
  TrendPeriod,
  TrendInvestorFilter,
  TrendGranularity,
} from '@/types/smart-money'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * Parse query parameters
 */
function parseQueryParams(searchParams: URLSearchParams): TrendAnalysisParams {
  // Period
  const periodParam = searchParams.get('period')
  const period: TrendPeriod = [5, 10, 30, 60, 90].includes(Number(periodParam))
    ? Number(periodParam) as TrendPeriod
    : 30

  // Investors
  const investorsParam = searchParams.get('investors')
  const allInvestors: TrendInvestorFilter[] = ['foreign', 'institution', 'retail', 'prop']
  let investors: TrendInvestorFilter[] = allInvestors

  if (investorsParam) {
    const requested = investorsParam.split(',') as TrendInvestorFilter[]
    investors = requested.filter((i) => allInvestors.includes(i))
    if (investors.length === 0) investors = allInvestors
  }

  // Aggregate
  const aggregateParam = searchParams.get('aggregate')
  const aggregate: TrendGranularity | undefined =
    aggregateParam === 'daily' || aggregateParam === 'weekly'
      ? aggregateParam
      : undefined

  // Start/End date
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined

  return {
    period,
    investors,
    aggregate,
    startDate,
    endDate,
  }
}

/**
 * Count weekdays (Monday-Friday) between two dates (inclusive)
 */
function countWeekdays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let count = 0
  const current = new Date(start)

  while (current <= end) {
    const day = current.getDay()
    // Count only weekdays (Monday=1 to Friday=5)
    if (day >= 1 && day <= 5) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

/**
 * Get date range from params
 */
function getDateRange(params: TrendAnalysisParams): { start: string; end: string } {
  const end = params.endDate || new Date().toISOString().split('T')[0]
  const start = params.startDate || (() => {
    const date = new Date()
    date.setDate(date.getDate() - params.period + 1)
    return date.toISOString().split('T')[0]
  })()

  return { start, end }
}

/**
 * GET /api/smart-money/trend
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse query parameters
    const params = parseQueryParams(request.nextUrl.searchParams)

    // Check cache
    const cached = getCachedTrendResponse(params)
    if (cached) {
      return NextResponse.json(cached, {
        status: 200,
        headers: {
          'Cache-Control': getTrendCacheControl(),
          'X-Cache': 'HIT',
        },
      })
    }

    // Get date range
    const { start, end } = getDateRange(params)

    // Fetch data from RTDB
    const rangeData = await fetchInvestorTypeRange(start, end)

    if (rangeData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No data available for the specified period',
        },
        { status: 404 }
      )
    }

    // Check if data is partial (fewer days than requested)
    // Only count weekdays since weekends have no market data
    const requestedWeekdays = countWeekdays(start, end)
    const partialData = rangeData.length < requestedWeekdays - 2

    // Convert to trend data for each investor type
    const foreign = convertToInvestorTrend(rangeData, 'foreign')
    const institution = convertToInvestorTrend(rangeData, 'institution')
    const retail = convertToInvestorTrend(rangeData, 'retail')
    const prop = convertToInvestorTrend(rangeData, 'prop')

    // Generate combined trend
    const combined = generateCombinedTrend(rangeData)

    // Detect patterns
    const patterns = detectPatterns(foreign, institution, retail)

    // Calculate summary
    const totalSmartMoneyFlow = foreign.aggregated.totalNet + institution.aggregated.totalNet
    const primaryDriver = detectPrimaryDriver(
      foreign.aggregated,
      institution.aggregated,
      retail.aggregated,
      prop.aggregated
    )

    // Determine dominant trend
    const trendScores = {
      up: 0,
      down: 0,
      sideways: 0,
    }

    for (const inv of [foreign, institution, retail, prop]) {
      trendScores[inv.aggregated.trend]++
    }

    const dominantTrend: 'up' | 'down' | 'sideways' =
      trendScores.up >= 2 ? 'up' : trendScores.down >= 2 ? 'down' : 'sideways'

    // Get latest signal from combined trend
    const latestPoint = combined[combined.length - 1]

    // Build response
    const response: TrendAnalysisResponse = {
      success: true,
      data: {
        period: {
          start,
          end,
          days: rangeData.length,
          partialData,
        },
        investors: {
          foreign,
          institution,
          retail,
          prop,
        },
        combined,
        patterns,
        summary: {
          totalSmartMoneyFlow,
          dominantTrend,
          primaryDriver,
          signal: latestPoint.signal,
          riskSignal: latestPoint.riskSignal,
        },
      },
      meta: {
        timestamp: Date.now(),
        processingTime: Date.now() - startTime,
        cacheStatus: 'miss',
      },
    }

    // Cache response with dynamic TTL based on time of day
    const ttl = getSmartCacheTTL()
    cacheTrendResponse(params, response, ttl)

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': getTrendCacheControl(),
        'X-Cache': 'MISS',
        'X-Cache-TTL': `${ttl / 1000}s`,
      },
    })
  } catch (error) {
    console.error('Error in smart-money/trend API:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze trend data',
        meta: {
          timestamp: Date.now(),
          processingTime: Date.now() - startTime,
          cacheStatus: 'miss',
        },
      },
      { status: 500 }
    )
  }
}
