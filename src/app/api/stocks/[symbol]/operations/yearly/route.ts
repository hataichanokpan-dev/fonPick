/**
 * Yearly Operations API Proxy Route
 *
 * Proxy for https://my-fon-stock-api.vercel.app/api/th/stocks/{symbol}/operations/yearly
 * Returns yearly financial data including EPS history for stability analysis.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cachedJson, MARKET_DATA_CACHE } from '@/lib/api-cache'
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
 * Single year of financial data
 */
interface YearlyFinancialData {
  asset: string
  book_value_per_share: string
  cash: string
  cash_cycle: string
  close: string
  da: string
  debt_to_equity: string
  dividend_yield: string
  earning_per_share: string
  earning_per_share_yoy?: string
  end_of_year_date: string
  equity: string
  financing_activities: string
  fiscal: number
  gpm: string
  gross_profit: string
  mkt_cap: string
  net_profit: string
  net_profit_yoy?: string
  npm: string
  operating_activities: string
  price_book_value: string
  price_earning_ratio: string
  quarter: number
  revenue: string
  revenue_yoy?: string
  roa: string
  roe: string
  security_id: string
  sga: string
  sga_per_revenue: string
  total_debt: string
}

/**
 * External API response structure
 */
interface ExternalYearlyOperations {
  success: boolean
  data: Record<string, YearlyFinancialData>
  cached?: boolean
}

/**
 * Processed EPS history for stability analysis
 */
export interface EPSHistoryData {
  year: number
  eps: number
}

/**
 * Internal API response structure
 */
export interface YearlyOperationsResponse {
  success: boolean
  data?: {
    // Raw data by fiscal year
    yearly: Record<string, YearlyFinancialData>
    // EPS history for stability analysis (last 10 years)
    epsHistory: EPSHistoryData[]
    // Current year EPS
    currentEps: number | null
    // 5-year CAGR
    epsCagr5Y: number | null
  }
  cached?: boolean
  error?: string
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const EXTERNAL_API_CONFIG = {
  baseUrl: 'https://my-fon-stock-api.vercel.app/api',
  timeout: 10000,
  maxRetries: 2,
  retryDelay: 500,
} as const

const stockCache = new BoundedCache<ExternalYearlyOperations>(100, 5 * 60 * 1000)

// ============================================================================
// LOGGING
// ============================================================================

function logError(symbol: string, message: string, error: unknown): void {
  const errorMsg = error instanceof Error ? error.message : String(error)
  if (process.env.NODE_ENV === 'production') {
    console.error(`[YearlyOperationsAPI] ${symbol}: ${message}`, errorMsg)
  } else {
    console.error(`[YearlyOperationsAPI] ${symbol}: ${message}`, error)
  }
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

/**
 * Process yearly data and extract EPS history
 */
function processYearlyData(externalData: Record<string, YearlyFinancialData>) {
  // Convert to array and sort by fiscal year
  const years = Object.values(externalData).sort((a, b) => a.fiscal - b.fiscal)

  // Extract EPS history (last 5 years only)
  const epsHistory: EPSHistoryData[] = years
    .map((y) => ({
      year: y.fiscal,
      eps: parseFloat(y.earning_per_share) || 0,
    }))
    .sort((a, b) => a.year - b.year)
    .slice(-5) // Keep only the last 5 years

  // Get current year EPS (most recent)
  const currentEps = epsHistory.length > 0 ? epsHistory[epsHistory.length - 1].eps : null

  // Calculate 5-year CAGR if we have at least 5 years
  let epsCagr5Y: number | null = null
  if (epsHistory.length >= 5) {
    const recent5 = epsHistory.slice(-5)
    const oldest = recent5[0].eps
    const newest = recent5[4].eps

    if (oldest > 0) {
      epsCagr5Y = Math.pow(newest / oldest, 1 / 5) - 1
    }
  }

  return {
    yearly: externalData,
    epsHistory,
    currentEps,
    epsCagr5Y,
  }
}

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

async function fetchYearlyOperations(
  symbol: string,
  locale: string = 'th'
): Promise<ExternalYearlyOperations> {
  const url = `${EXTERNAL_API_CONFIG.baseUrl}/${locale}/stocks/${symbol}/operations/yearly`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_API_CONFIG.timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FonPick/1.0',
      },
      next: { revalidate: 300 },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new StockApiError(
        response.status,
        symbol,
        `External API returned ${response.status}`
      )
    }

    const data = (await response.json()) as ExternalYearlyOperations

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

async function fetchWithRetry(
  symbol: string,
  locale: string
): Promise<ExternalYearlyOperations> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= EXTERNAL_API_CONFIG.maxRetries; attempt++) {
    try {
      return await fetchYearlyOperations(symbol, locale)
    } catch (error) {
      lastError = error as Error

      if (error instanceof StockApiError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error
      }

      if (attempt < EXTERNAL_API_CONFIG.maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, EXTERNAL_API_CONFIG.retryDelay * (attempt + 1))
        )
      }
    }
  }

  throw lastError || new StockApiError(500, symbol, 'Max retries exceeded')
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const searchParams = request.nextUrl.searchParams
  const bypassCache = searchParams.get('nocache') === 'true'
  const locale = searchParams.get('locale') || 'th'

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
      MARKET_DATA_CACHE,
      429
    )
    response.headers.set('Retry-After', retryAfter.toString())
    return response
  }

  try {
    // Check cache first
    if (!bypassCache) {
      const cached = stockCache.get(uppercaseSymbol)
      if (cached) {
        const processed = processYearlyData(cached.data)
        const response = cachedJson(
          {
            success: true,
            data: processed,
            meta: {
              symbol: uppercaseSymbol,
              fetchedAt: Date.now(),
              cached: true,
            },
          },
          MARKET_DATA_CACHE
        )

        const corsHeaders = getCorsHeaders(request)
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value)
        })

        return response
      }
    }

    // Fetch from external API
    const externalData = await fetchWithRetry(uppercaseSymbol, locale)

    // Cache the result
    stockCache.set(uppercaseSymbol, externalData)

    // Process the data
    const processed = processYearlyData(externalData.data)

    // Build response with CORS headers
    const corsHeaders = getCorsHeaders(request)
    const response = cachedJson(
      {
        success: true,
        data: processed,
        meta: {
          symbol: uppercaseSymbol,
          fetchedAt: Date.now(),
          cached: false,
        },
      },
      MARKET_DATA_CACHE
    )

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
        error: 'Failed to fetch yearly operations',
        message: errorMessage,
        meta: {
          symbol: uppercaseSymbol,
          fetchedAt: Date.now(),
        },
      },
      MARKET_DATA_CACHE,
      statusCode
    )
  }
}

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

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
