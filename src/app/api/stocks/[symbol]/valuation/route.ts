/**
 * Valuation Metrics API Route
 *
 * GET /api/stocks/[symbol]/valuation?years=5
 * Returns historical valuation metrics (PE, PBV, ROE) with statistical bands
 *
 * Features:
 * - Calculates time series data from yearly operations
 * - Computes statistical bands (-2SD, -1SD, Mean, +1SD, +2SD)
 * - Returns valuation interpretation
 */

import { NextRequest, NextResponse } from 'next/server'
import { cachedJson, MARKET_DATA_CACHE } from '@/lib/api-cache'
import {
  BoundedCache,
  getCorsHeaders,
  validateSymbol,
  StockApiError,
} from '@/lib/api/stock-api-utils'
import {
  calculateValuationBand,
  generateMockValuationSeries,
} from '@/lib/utils/valuation-band-calculator'
import type {
  ValuationMetricsData,
} from '@/types/valuation'

// ============================================================================
// TYPES
// ============================================================================

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Cache for valuation metrics data (max 50 entries, 1 hour TTL)
 * Valuation data doesn't change frequently
 */
const valuationCache = new BoundedCache<ValuationMetricsData>(50, 60 * 60 * 1000)

/**
 * Maximum years allowed for historical data
 */
const MAX_YEARS = 10

/**
 * Default years if not specified
 */
const DEFAULT_YEARS = 5

// ============================================================================
// VALUATION DATA CALCULATION
// ============================================================================

/**
 * Calculate valuation metrics from yearly operations data
 * This function would normally fetch from a database or external API
 * For now, it generates realistic mock data based on the symbol
 *
 * @param symbol Stock symbol
 * @param years Number of years of historical data
 * @returns Valuation metrics data
 */
async function calculateValuationMetricsFromYearlyData(
  symbol: string,
  years: number
): Promise<ValuationMetricsData> {
  // In production, this would:
  // 1. Fetch yearly financial data from database
  // 2. Calculate PE, PBV, ROE for each period
  // 3. Return time series data

  // For now, generate realistic mock data
  const peSeries = generateMockValuationSeries('PE', years, 15, 0.25)
  const pbvSeries = generateMockValuationSeries('PBV', years, 1.5, 0.15)
  const roeSeries = generateMockValuationSeries('ROE', years, 12, 0.1)

  // Get current values (last data point)
  const currentPE = peSeries[peSeries.length - 1]?.value ?? 15
  const currentPBV = pbvSeries[pbvSeries.length - 1]?.value ?? 1.5
  const currentROE = roeSeries[roeSeries.length - 1]?.value ?? 12

  // Calculate bands for each metric
  const peBand = calculateValuationBand(peSeries, 'PE', currentPE)
  const pbvBand = calculateValuationBand(pbvSeries, 'PBV', currentPBV)
  const roeBand = calculateValuationBand(roeSeries, 'ROE', currentROE)

  return {
    symbol,
    metrics: {
      pe: peSeries,
      pbv: pbvSeries,
      roe: roeSeries,
    },
    bands: {
      pe: peBand,
      pbv: pbvBand,
      roe: roeBand,
    },
    asOfDate: new Date().toISOString(),
    updatedAt: Date.now(),
  }
}

/**
 * Fetch or calculate valuation metrics with caching
 *
 * @param symbol Stock symbol
 * @param years Number of years
 * @returns Valuation metrics data
 */
async function fetchValuationMetrics(
  symbol: string,
  years: number
): Promise<ValuationMetricsData> {
  // Check cache first
  const cacheKey = `${symbol}-${years}`
  const cached = valuationCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Calculate metrics
  const data = await calculateValuationMetricsFromYearlyData(symbol, years)

  // Cache the result
  valuationCache.set(cacheKey, data)

  return data
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * GET /api/stocks/[symbol]/valuation?years=5
 *
 * Query parameters:
 * - years: Number of years (1-10, default: 5)
 * - mock: Use mock data (true/false, default: false)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const searchParams = request.nextUrl.searchParams

  // Parse query parameters
  const yearsParam = searchParams.get('years')

  // Validate symbol format
  if (!symbol || !validateSymbol(symbol)) {
    return cachedJson(
      {
        success: false,
        error: 'Invalid stock symbol format',
      },
      MARKET_DATA_CACHE,
      400
    )
  }

  const uppercaseSymbol = symbol.toUpperCase()

  // Parse and validate years parameter
  let years = DEFAULT_YEARS
  if (yearsParam) {
    const parsedYears = parseInt(yearsParam, 10)
    if (isNaN(parsedYears) || parsedYears < 1 || parsedYears > MAX_YEARS) {
      return cachedJson(
        {
          success: false,
          error: `Years must be between 1 and ${MAX_YEARS}`,
        },
        MARKET_DATA_CACHE,
        400
      )
    }
    years = parsedYears
  }

  try {
    // Fetch or calculate valuation metrics
    const data = await fetchValuationMetrics(uppercaseSymbol, years)

    // Build response
    const response = cachedJson(
      {
        success: true,
        data,
        meta: {
          symbol: uppercaseSymbol,
          years,
          fetchedAt: Date.now(),
        },
      },
      MARKET_DATA_CACHE
    )

    // Apply CORS headers
    const corsHeaders = getCorsHeaders(request)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error(`[ValuationAPI] ${uppercaseSymbol}: Fetch failed`, error)

    const statusCode = error instanceof StockApiError ? error.statusCode : 500
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return cachedJson(
      {
        success: false,
        error: 'Failed to fetch valuation metrics',
        message: errorMessage,
        meta: {
          symbol: uppercaseSymbol,
          years,
          fetchedAt: Date.now(),
        },
      },
      MARKET_DATA_CACHE,
      statusCode
    )
  }
}

/**
 * OPTIONS /api/stocks/[symbol]/valuation
 *
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request)

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

// ============================================================================
// ROUTE CONFIG
// ============================================================================

/**
 * Enable dynamic rendering for real-time data
 */
export const dynamic = 'force-dynamic'

/**
 * Runtime configuration
 */
export const runtime = 'nodejs'

/**
 * Segment config for cache behavior
 */
export const fetchCache = 'force-no-store'
