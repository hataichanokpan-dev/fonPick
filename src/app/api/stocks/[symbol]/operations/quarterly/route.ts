/**
 * Stock Quarterly Operations API Route
 *
 * GET /api/stocks/[symbol]/operations/quarterly
 * Proxies requests to external stock API and caches responses.
 *
 * External API: https://my-fon-stock-api.vercel.app/api/th/stocks/{symbol}/operations/quarterly
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
import type { QuarterlyOperationsResponse } from '@/types/stock-price-api'

// ============================================================================
// CONFIGURATION
// ============================================================================

const EXTERNAL_API_CONFIG = {
  baseUrl: 'https://my-fon-stock-api.vercel.app/api',
  timeout: 10000,
  maxRetries: 2,
  retryDelay: 500,
} as const

// Bounded cache for quarterly operations data (100 entries, 20 min TTL)
const quarterlyCache = new BoundedCache<QuarterlyOperationsResponse>(100, 20 * 60 * 1000)

// ============================================================================
// LOGGING
// ============================================================================

function logError(symbol: string, message: string, error: unknown): void {
  const errorMsg = error instanceof Error ? error.message : String(error)
  if (process.env.NODE_ENV === 'production') {
    console.error(`[StockAPI] QuarterlyOperations ${symbol}: ${message}`, errorMsg)
  } else {
    console.error(`[StockAPI] QuarterlyOperations ${symbol}: ${message}`, error)
  }
}

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

async function fetchQuarterlyOperations(symbol: string): Promise<QuarterlyOperationsResponse> {
  const url = `${EXTERNAL_API_CONFIG.baseUrl}/th/stocks/${symbol}/operations/quarterly`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_API_CONFIG.timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FonPick/1.0',
      },
      next: { revalidate: 1200 }, // 20 minutes
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new StockApiError(
        response.status,
        symbol,
        `External API returned ${response.status}`
      )
    }

    const data = (await response.json()) as QuarterlyOperationsResponse

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

async function fetchWithRetry(symbol: string): Promise<QuarterlyOperationsResponse> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= EXTERNAL_API_CONFIG.maxRetries; attempt++) {
    try {
      return await fetchQuarterlyOperations(symbol)
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
      const cached = quarterlyCache.get(uppercaseSymbol)
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
    const externalData = await fetchWithRetry(uppercaseSymbol)

    // Cache the result
    quarterlyCache.set(uppercaseSymbol, externalData)

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
        error: 'Failed to fetch quarterly operations',
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
