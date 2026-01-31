/**
 * Stock Statistics API Route
 *
 * GET /api/stocks/[symbol]/statistics
 * Proxies requests to external stock API and caches responses.
 *
 * Part of Stock Data API implementation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cachedJson, MARKET_DATA_CACHE, NO_CACHE } from '@/lib/api-cache'
import {
  BoundedCache,
  getCorsHeaders,
  validateSymbol,
  StockApiError,
  getClientIdentifier,
  checkRateLimit,
} from '@/lib/api/stock-api-utils'

// ============================================================================
// TYPES
// ============================================================================

/**
 * External API response structure
 */
interface ExternalStockStatistics {
  success: boolean
  data: StockStatisticsData
  cached: boolean
}

/**
 * Stock statistics data from external API
 */
export interface StockStatisticsData {
  // Market Data
  marketCap: number
  enterpriseValue: number
  earningsDate: string
  exDividendDate: string
  sharesOutstanding: number
  sharesChangeYoY: number | null
  sharesChangeQoQ: number | null
  ownedByInstitutions: number | null

  // Valuation Ratios
  peRatio: number
  forwardPERatio: number
  psRatio: number
  pbRatio: number
  ptbvRatio: number
  pfcfRatio: number
  pocfRatio: number
  pegRatio: number | null
  evEarnings: number
  evSales: number
  evEbitda: number
  evEbit: number
  evFcf: number

  // Financial Health
  currentRatio: number
  quickRatio: number
  debtToEquity: number
  debtToEbitda: number
  debtToFcf: number
  interestCoverage: number

  // Profitability
  returnOnEquity: number
  returnOnAssets: number
  returnOnInvestedCapital: number
  returnOnCapitalEmployed: number

  // Trading Data
  beta5Y: number
  priceChange52W: number
  movingAverage50D: number
  movingAverage200D: number
  rsi: number
  averageVolume20D: number

  // Income Statement
  revenue: number
  grossProfit: number
  operatingIncome: number
  pretaxIncome: number
  netIncome: number
  ebitda: number
  ebit: number
  eps: number

  // Balance Sheet
  cash: number
  totalDebt: number
  netCash: number
  netCashPerShare: number
  bookValue: number
  bookValuePerShare: number
  workingCapital: number

  // Cash Flow
  operatingCashFlow: number
  capitalExpenditures: number
  freeCashFlow: number
  freeCashFlowPerShare: number

  // Margins
  grossMargin: number
  operatingMargin: number
  pretaxMargin: number
  profitMargin: number
  ebitdaMargin: number
  ebitMargin: number
  fcfMargin: number

  // Dividends
  dividendPerShare: number
  dividendYield: number
  dividendGrowth: number
  payoutRatio: number
  buybackYield: number
  shareholderYield: number
  earningsYield: number
  fcfYield: number

  // Scores
  altmanZScore: number
  piotroskiFScore: number
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * External API configuration
 */
const EXTERNAL_API_CONFIG = {
  baseUrl: 'https://my-fon-stock-api.vercel.app/api',
  timeout: 10000, // 10 seconds
  maxRetries: 2,
  retryDelay: 500, // milliseconds
} as const

/**
 * Bounded cache for stock statistics data (max 100 entries, 5 min TTL)
 */
const stockCache = new BoundedCache<ExternalStockStatistics>(100, 5 * 60 * 1000)

// ============================================================================
// LOGGING
// ============================================================================

/**
 * Log error with context
 */
function logError(symbol: string, message: string, error: unknown): void {
  const errorMsg = error instanceof Error ? error.message : String(error)
  // In production, use proper logging service (e.g., Sentry, CloudWatch)
  if (process.env.NODE_ENV === 'production') {
    // Production logging - could send to external service
    console.error(`[StockAPI] ${symbol}: ${message}`, errorMsg)
  } else {
    console.error(`[StockAPI] ${symbol}: ${message}`, error)
  }
}

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

/**
 * Fetch stock statistics from external API
 *
 * @param symbol Stock symbol
 * @returns Stock statistics data
 * @throws StockApiError if fetch fails
 */
async function fetchStockStatistics(symbol: string): Promise<ExternalStockStatistics> {
  const url = `${EXTERNAL_API_CONFIG.baseUrl}/th/stocks/${symbol}/statistics`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_API_CONFIG.timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FonPick/1.0',
      },
      // Next.js caching options
      next: { revalidate: 300 }, // 5 minutes
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new StockApiError(
        response.status,
        symbol,
        `External API returned ${response.status}`
      )
    }

    const data = (await response.json()) as ExternalStockStatistics

    if (!data.success || !data.data) {
      throw new StockApiError(
        502,
        symbol,
        'External API returned unsuccessful response'
      )
    }

    return data
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof StockApiError) {
      throw error
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new StockApiError(504, symbol, 'External API request timeout')
    }

    throw new StockApiError(502, symbol, 'Failed to fetch from external API')
  }
}

/**
 * Fetch stock statistics with retry logic
 *
 * @param symbol Stock symbol
 * @returns Stock statistics data
 */
async function fetchWithRetry(symbol: string): Promise<ExternalStockStatistics> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= EXTERNAL_API_CONFIG.maxRetries; attempt++) {
    try {
      return await fetchStockStatistics(symbol)
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors (4xx)
      if (error instanceof StockApiError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error
      }

      // Wait before retry (except on last attempt)
      if (attempt < EXTERNAL_API_CONFIG.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, EXTERNAL_API_CONFIG.retryDelay * (attempt + 1)))
      }
    }
  }

  throw lastError || new StockApiError(500, symbol, 'Max retries exceeded')
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * GET /api/stocks/[symbol]/statistics
 *
 * Query parameters:
 * - nocache: Set to 'true' to bypass cache
 * - timeout: Custom timeout in milliseconds (max 30000)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const searchParams = request.nextUrl.searchParams
  const bypassCache = searchParams.get('nocache') === 'true'

  // Validate symbol format
  if (!symbol || !validateSymbol(symbol)) {
    return cachedJson(
      {
        success: false,
        error: 'Invalid stock symbol format',
      },
      NO_CACHE,
      400
    )
  }

  const uppercaseSymbol = symbol.toUpperCase()

  // Rate limiting check
  const clientId = getClientIdentifier(request, uppercaseSymbol)
  const rateLimit = checkRateLimit(clientId)
  if (rateLimit.exceeded) {
    const retryAfter = Math.ceil((rateLimit.resetAt! - Date.now()) / 1000)
    const response = cachedJson(
      {
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        meta: {
          symbol: uppercaseSymbol,
          fetchedAt: Date.now(),
        },
      },
      NO_CACHE,
      429
    )
    response.headers.set('Retry-After', retryAfter.toString())
    return response
  }

  try {
    // Check cache first (unless bypass is requested)
    if (!bypassCache) {
      const cached = stockCache.get(uppercaseSymbol)
      if (cached) {
        const response = cachedJson(
          {
            success: true,
            data: cached.data,
            meta: {
              symbol: uppercaseSymbol,
              fetchedAt: Date.now(),
              cached: true,
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
      }
    }

    // Fetch from external API with retry
    const externalData = await fetchWithRetry(uppercaseSymbol)

    // Cache the result
    stockCache.set(uppercaseSymbol, externalData)

    // Build response with CORS headers
    const corsHeaders = getCorsHeaders(request)
    const response = cachedJson(
      {
        success: true,
        data: externalData.data,
        meta: {
          symbol: uppercaseSymbol,
          fetchedAt: Date.now(),
          cached: false,
        },
      },
      MARKET_DATA_CACHE
    )

    // Apply CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    logError(uppercaseSymbol, 'Fetch failed', error)

    const statusCode = error instanceof StockApiError ? error.statusCode : 500
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return cachedJson(
      {
        success: false,
        error: 'Failed to fetch stock statistics',
        message: errorMessage,
        meta: {
          symbol: uppercaseSymbol,
          fetchedAt: Date.now(),
        },
      },
      NO_CACHE,
      statusCode
    )
  }
}

/**
 * OPTIONS /api/stocks/[symbol]/statistics
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
 * Runtime configuration (Edge for better performance)
 */
export const runtime = 'nodejs'

/**
 * Segment config for cache behavior
 */
export const fetchCache = 'force-no-store'
