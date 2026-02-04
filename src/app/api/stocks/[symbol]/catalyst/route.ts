/**
 * Catalyst API Proxy Route
 *
 * GET /api/stocks/[symbol]/catalyst
 *
 * Proxies requests to the n8n Catalyst2Score webhook API.
 * Generates Thai month/year and returns parsed catalyst data.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  fetchAndParseCatalyst,
  CatalystAPIError,
} from '@/lib/api/catalyst-api'
import type { ParsedCatalystData } from '@/types/catalyst'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Success response format
 */
interface CatalystSuccessResponse {
  success: true
  data: ParsedCatalystData
  meta: {
    symbol: string
    fetchedAt: number
  }
}

/**
 * Error response format
 */
interface CatalystErrorResponse {
  success: false
  error: string
  message?: string
  meta: {
    symbol: string
    fetchedAt: number
  }
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

/**
 * GET /api/stocks/[symbol]/catalyst
 *
 * Fetches catalyst analysis from the n8n webhook API.
 *
 * @param _request - Next.js request object (unused)
 * @param params - Route parameters containing symbol
 * @returns Parsed catalyst data or error
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params

  // Validate symbol
  if (!symbol || symbol.length > 10) {
    const response: CatalystErrorResponse = {
      success: false,
      error: 'Invalid symbol',
      message: 'Symbol must be 1-10 characters',
      meta: {
        symbol: symbol || 'unknown',
        fetchedAt: Date.now(),
      },
    }
    return NextResponse.json(response, { status: 400 })
  }

  const uppercaseSymbol = symbol.toUpperCase()

  try {
    // Fetch and parse catalyst data
    const data = await fetchAndParseCatalyst(uppercaseSymbol)

    const response: CatalystSuccessResponse = {
      success: true,
      data,
      meta: {
        symbol: uppercaseSymbol,
        fetchedAt: Date.now(),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error(`[CatalystAPI] Error fetching for ${uppercaseSymbol}:`, error)

    const statusCode =
      error instanceof CatalystAPIError ? error.statusCode : 500
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred'

    const response: CatalystErrorResponse = {
      success: false,
      error: 'Failed to fetch catalyst analysis',
      message,
      meta: {
        symbol: uppercaseSymbol,
        fetchedAt: Date.now(),
      },
    }

    return NextResponse.json(response, { status: statusCode })
  }
}

// ============================================================================
// ROUTE CONFIG
// ============================================================================

/**
 * Force dynamic rendering - this is a slow API (~2 minutes)
 * so we don't want to cache the route response
 */
export const dynamic = 'force-dynamic'

/**
 * Use Node.js runtime (not Edge) for longer timeout support
 */
export const runtime = 'nodejs'

/**
 * Disable fetch cache - always fetch fresh data
 */
export const fetchCache = 'force-no-store'
