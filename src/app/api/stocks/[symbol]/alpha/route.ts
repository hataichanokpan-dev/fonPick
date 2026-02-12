/**
 * Alpha API Proxy Route
 *
 * Proxy for https://my-fon-stock-api.vercel.app/api/th/stocks/{symbol}/alpha
 * Returns intrinsic value, forecasts, and DCF values.
 *
 * @version 2.0 - Now returns enhanced V2 format with quality metadata
 * @see ADR-003-alpha-api-enhancement.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { transformToValuationTargetsV2 } from '@/lib/entry-plan/valuation/transformer'
import type { ValuationTargetsV2 } from '@/lib/entry-plan/valuation/transformer'

const ALPHA_API_BASE = 'https://my-fon-stock-api.vercel.app/api'
const CACHE_MAX_AGE = 5 * 60 * 1000 // 5 minutes

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()

/**
 * External Alpha API response format
 */
interface ExternalAlphaAPIResponse {
  success: boolean
  data?: {
    IntrinsicValue: number
    LowForecast: number
    AvgForecast: number
    HighForecast: number
    DCFValue: number
    RelativeValue: number
  }
  cached?: boolean
}

/**
 * Enhanced API response with V2 support
 */
interface EnhancedAlphaAPIResponse {
  success: boolean
  data?: {
    IntrinsicValue: number
    LowForecast: number
    AvgForecast: number
    HighForecast: number
    DCFValue: number
    RelativeValue: number
  }
  v2?: ValuationTargetsV2  // Enhanced V2 format with quality metadata
  cached?: boolean
  currentPrice?: number  // For fallback calculations
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const searchParams = request.nextUrl.searchParams
  const locale = searchParams.get('locale') || 'th'
  const currentPriceParam = searchParams.get('currentPrice')
  const currentPrice = currentPriceParam ? parseFloat(currentPriceParam) : undefined

  // Validate symbol
  if (!symbol || symbol.length > 10) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid symbol',
      },
      { status: 400 }
    )
  }

  try {
    // Check cache (include currentPrice in cache key since it affects V2 transform)
    const cacheKey = `alpha:${symbol}:${currentPrice || 'no-price'}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_MAX_AGE) {
      return NextResponse.json({
        ...cached.data,
        cached: true,
      })
    }

    // Fetch from Alpha API
    const apiUrl = `${ALPHA_API_BASE}/${locale}/stocks/${symbol}/alpha`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'fonPick/1.0',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Alpha API returned ${response.status}`)
    }

    const externalData: ExternalAlphaAPIResponse = await response.json()

    // Transform to V2 format with quality metadata
    const v2 = transformToValuationTargetsV2(externalData, currentPrice)

    // Build enhanced response
    const enhancedResponse: EnhancedAlphaAPIResponse = {
      success: externalData.success,
      data: externalData.data,
      v2,
      cached: false,
      currentPrice,
    }

    // Cache the response
    if (externalData.success) {
      cache.set(cacheKey, {
        data: enhancedResponse,
        timestamp: Date.now(),
      })

      // Clean old cache entries
      if (cache.size > 100) {
        const oldestKey = Array.from(cache.keys())[0]
        cache.delete(oldestKey)
      }
    }

    return NextResponse.json(enhancedResponse)
  } catch (error) {
    console.error(`Error fetching Alpha data for ${symbol}:`, error)

    // Return error response with empty V2
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Alpha data',
        v2: transformToValuationTargetsV2(null, currentPrice),
      },
      { status: 500 }
    )
  }
}
