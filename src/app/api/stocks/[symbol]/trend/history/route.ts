/**
 * Historical Trend API Route
 *
 * GET /api/stocks/[symbol]/trend/history
 *
 * Returns historical trend analysis for swing trading
 */

import { NextRequest, NextResponse } from 'next/server'
import type { HistoricalTrendResponse } from '@/types/swing-trading'
import { analyzeHistoricalTrend } from '@/services/historical-trend'
import { validateSymbol, getClientIdentifier, checkRateLimit } from '@/lib/api/stock-api-utils'

// ============================================================================
// HANDLER
// ============================================================================

/**
 * Handle GET requests for historical trend analysis
 *
 * Query parameters:
 * - days: Number of days to analyze (5, 10, 30, 60, or 90) - default: 90
 *
 * @param request - Next.js request object
 * @param params - Route parameters (symbol)
 * @returns JSON response with historical trend data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse> {
  const startTime = Date.now()

  try {
    // Get route parameters
    const { symbol } = await params

    // Validate symbol format
    if (!validateSymbol(symbol)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid stock symbol format.',
        } as HistoricalTrendResponse,
        { status: 400 }
      )
    }

    // Check rate limit
    const clientId = getClientIdentifier(request, symbol.toUpperCase())
    const rateLimit = checkRateLimit(clientId)

    if (rateLimit.exceeded) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        } as HistoricalTrendResponse,
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetAt
              ? Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString()
              : '60',
          },
        }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const daysParam = searchParams.get('days')

    // Validate and parse days parameter
    const validDays = [5, 10, 30, 60, 90]
    const days = daysParam && validDays.includes(parseInt(daysParam))
      ? (parseInt(daysParam) as 5 | 10 | 30 | 60 | 90)
      : 90 // Default to 90 days

    // Perform analysis
    const analysis = await analyzeHistoricalTrend({ symbol, days })

    // Handle analysis failure
    if (!analysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to analyze historical trend. Please try again later.',
        } as HistoricalTrendResponse,
        { status: 500 }
      )
    }

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: analysis,
        meta: {
          timestamp: Date.now(),
          processingTime: Date.now() - startTime,
          cacheStatus: 'miss', // TODO: Implement caching
        },
      } as HistoricalTrendResponse,
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Historical trend API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while processing your request.',
      } as HistoricalTrendResponse,
      { status: 500 }
    )
  }
}

// ============================================================================
// CONFIG
// ============================================================================

/**
 * Route segment config
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
