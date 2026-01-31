/**
 * Stock Price History API Route
 *
 * GET /api/stocks/[symbol]/price/history
 * Proxies requests to external stock API and caches responses.
 *
 * External API: https://my-fon-stock-api.vercel.app/api/th/stocks/{symbol}/price
 * Query params: period1, period2, interval
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
import type { PriceHistoryResponse, PriceHistoryParams } from '@/types/stock-price-api'

// ============================================================================
// CONFIGURATION
// ============================================================================

const EXTERNAL_API_CONFIG = {
  baseUrl: 'https://my-fon-stock-api.vercel.app/api',
  timeout: 10000,
  maxRetries: 2,
  retryDelay: 500,
} as const

// Bounded cache for price history data (50 entries, 15 min TTL)
const historyCache = new BoundedCache<PriceHistoryResponse>(50, 15 * 60 * 1000)

// ============================================================================
// LOGGING
// ============================================================================

function logError(symbol: string, message: string, error: unknown): void {
  const errorMsg = error instanceof Error ? error.message : String(error)
  if (process.env.NODE_ENV === 'production') {
    console.error(`[StockAPI] PriceHistory ${symbol}: ${message}`, errorMsg)
  } else {
    console.error(`[StockAPI] PriceHistory ${symbol}: ${message}`, error)
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate date format (YYYY-MM-DD or Unix timestamp)
 */
function isValidDateParam(value: string | null): boolean {
  if (!value) return true // Optional parameter

  // Check if it's a Unix timestamp (number)
  const timestamp = Number(value)
  if (!isNaN(timestamp)) {
    return timestamp > 0 && timestamp < 4000000000 // Reasonable timestamp range
  }

  // Check if it's YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(value)) return false

  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * Validate interval parameter
 */
function isValidInterval(value: string | null): boolean {
  if (!value) return true // Optional parameter
  return ['1d', '1wk', '1mo'].includes(value)
}

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

/**
 * Build cache key from symbol and query parameters
 */
function buildCacheKey(symbol: string, params: PriceHistoryParams): string {
  const parts = [
    symbol,
    params.period1 || 'default',
    params.period2 || 'default',
    params.interval || '1d',
  ]
  return parts.join(':')
}

/**
 * Build query string for external API
 */
function buildQueryString(params: PriceHistoryParams): string {
  const queryParams = new URLSearchParams()

  if (params.period1) {
    queryParams.append('period1', String(params.period1))
  }
  if (params.period2) {
    queryParams.append('period2', String(params.period2))
  }
  if (params.interval) {
    queryParams.append('interval', params.interval)
  }

  const queryString = queryParams.toString()
  return queryString ? `?${queryString}` : ''
}

async function fetchPriceHistory(
  symbol: string,
  params: PriceHistoryParams
): Promise<PriceHistoryResponse> {
  const queryString = buildQueryString(params)
  const url = `${EXTERNAL_API_CONFIG.baseUrl}/th/stocks/${symbol}/price${queryString}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_API_CONFIG.timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FonPick/1.0',
      },
      next: { revalidate: 900 }, // 15 minutes
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new StockApiError(
        response.status,
        symbol,
        `External API returned ${response.status}`
      )
    }

    const data = (await response.json()) as PriceHistoryResponse

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
  params: PriceHistoryParams
): Promise<PriceHistoryResponse> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= EXTERNAL_API_CONFIG.maxRetries; attempt++) {
    try {
      return await fetchPriceHistory(symbol, params)
    } catch (error) {
      lastError = error as Error

      if (error instanceof StockApiError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error
      }

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

  // Parse query parameters
  const queryParams: PriceHistoryParams = {
    period1: searchParams.get('period1') || undefined,
    period2: searchParams.get('period2') || undefined,
    interval: (searchParams.get('interval') as '1d' | '1wk' | '1mo') || undefined,
  }

  // Validate query parameters
  if (!isValidDateParam(String(queryParams.period1 || ''))) {
    return cachedJson(
      {
        success: false,
        error: 'Invalid period1 format. Use YYYY-MM-DD or Unix timestamp.',
      },
      NO_CACHE,
      400
    )
  }

  if (!isValidDateParam(String(queryParams.period2 || ''))) {
    return cachedJson(
      {
        success: false,
        error: 'Invalid period2 format. Use YYYY-MM-DD or Unix timestamp.',
      },
      NO_CACHE,
      400
    )
  }

  if (!isValidInterval(queryParams.interval || null)) {
    return cachedJson(
      {
        success: false,
        error: 'Invalid interval. Use 1d, 1wk, or 1mo.',
      },
      NO_CACHE,
      400
    )
  }

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
    const cacheKey = buildCacheKey(uppercaseSymbol, queryParams)

    // Check cache first (unless bypass is requested)
    if (!bypassCache) {
      const cached = historyCache.get(cacheKey)
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

        const corsHeaders = getCorsHeaders(request)
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value)
        })

        return response
      }
    }

    // Fetch from external API with retry
    const externalData = await fetchWithRetry(uppercaseSymbol, queryParams)

    // Cache the result
    historyCache.set(cacheKey, externalData)

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
        error: 'Failed to fetch price history',
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
