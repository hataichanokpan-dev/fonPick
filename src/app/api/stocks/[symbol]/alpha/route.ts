/**
 * Alpha API Proxy Route
 *
 * Proxy for https://my-fon-stock-api.vercel.app/api/th/stocks/{symbol}/alpha
 * Returns intrinsic value, forecasts, and DCF values.
 */

import { NextRequest, NextResponse } from 'next/server'

const ALPHA_API_BASE = 'https://my-fon-stock-api.vercel.app/api'
const CACHE_MAX_AGE = 5 * 60 * 1000 // 5 minutes

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()

interface AlphaAPIResponse {
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const searchParams = request.nextUrl.searchParams
  const locale = searchParams.get('locale') || 'th'

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
    // Check cache
    const cacheKey = `alpha:${symbol}`
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

    const data: AlphaAPIResponse = await response.json()

    // Cache the response
    if (data.success) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      })

      // Clean old cache entries
      if (cache.size > 100) {
        const oldestKey = Array.from(cache.keys())[0]
        cache.delete(oldestKey)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error fetching Alpha data for ${symbol}:`, error)

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Alpha data',
      },
      { status: 500 }
    )
  }
}
