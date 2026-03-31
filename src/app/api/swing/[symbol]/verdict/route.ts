/**
 * Swing Trading Verdict API Route
 *
 * GET /api/swing/[symbol]/verdict
 *
 * Returns swing trading verdict with entry/exit planning
 */

import { NextRequest, NextResponse } from 'next/server'
import type { SwingVerdictResponse } from '@/types/swing-trading'
import { generateSwingVerdict } from '@/services/swing-trading'
import { validateSymbol, getClientIdentifier, checkRateLimit } from '@/lib/api/stock-api-utils'

// ============================================================================
// HANDLER
// ============================================================================

/**
 * Handle GET requests for swing trading verdict
 *
 * Query parameters:
 * - horizon: Target holding period (30, 60, or 90) - default: 60
 * - confirmation: Include confirmation analysis (true/false) - default: false
 *
 * @param request - Next.js request object
 * @param params - Route parameters (symbol)
 * @returns JSON response with swing trading verdict
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
        } as SwingVerdictResponse,
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
        } as SwingVerdictResponse,
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
    const horizonParam = searchParams.get('horizon')
    const confirmationParam = searchParams.get('confirmation')

    // Validate and parse horizon parameter
    const validHorizons = [30, 60, 90]
    const horizon = horizonParam && validHorizons.includes(parseInt(horizonParam))
      ? (parseInt(horizonParam) as 30 | 60 | 90)
      : 60 // Default to 60 days

    // Parse confirmation parameter
    const includeConfirmation = confirmationParam === 'true'

    // Generate verdict
    const verdict = await generateSwingVerdict({
      symbol,
      horizon,
      includeConfirmation,
    })

    // Handle verdict generation failure
    if (!verdict) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate swing trading verdict. Please try again later.',
        } as SwingVerdictResponse,
        { status: 500 }
      )
    }

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: verdict,
        meta: {
          timestamp: Date.now(),
          processingTime: Date.now() - startTime,
          cacheStatus: 'miss', // TODO: Implement caching
        },
      } as SwingVerdictResponse,
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Swing verdict API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while processing your request.',
      } as SwingVerdictResponse,
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
