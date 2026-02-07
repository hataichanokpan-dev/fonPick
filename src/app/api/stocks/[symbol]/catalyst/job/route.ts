/**
 * Catalyst Job API Route
 *
 * POST /api/stocks/[symbol]/catalyst/job
 *
 * Creates a background job for catalyst analysis.
 * Returns immediately with a job ID instead of waiting for the full 2-minute process.
 *
 * This solves the Next.js 60-second timeout issue by:
 * 1. Creating a job in the queue
 * 2. Starting background processing
 * 3. Returning job ID immediately
 * 4. Client polls GET /api/jobs/{id} for status
 */

import { NextRequest, NextResponse } from 'next/server'
import { CatalystJobQueue } from '@/lib/jobs/catalyst-job-queue'
import type { CreateJobResponse } from '@/types/job'

// ============================================================================
// ROUTE HANDLER
// ============================================================================

/**
 * POST /api/stocks/[symbol]/catalyst/job
 *
 * Creates a new background job for catalyst analysis.
 *
 * @param _request - Next.js request object
 * @param params - Route parameters containing symbol
 * @returns Job creation response with job ID
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params

  // Validate symbol
  if (!symbol || symbol.length > 10) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid symbol',
        message: 'Symbol must be 1-10 characters',
      },
      { status: 400 }
    )
  }

  const uppercaseSymbol = symbol.toUpperCase()

  try {
    // Create job and start background processing
    const jobId = CatalystJobQueue.createJob(uppercaseSymbol)

    const response: CreateJobResponse = {
      success: true,
      data: {
        jobId,
        symbol: uppercaseSymbol,
        status: 'queued',
      },
    }

    // Return immediately with 201 Created
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error(`[CatalystJob] Error creating job for ${uppercaseSymbol}:`, error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create catalyst job',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// ROUTE CONFIG
// ============================================================================

/**
 * Force dynamic rendering - job creation should not be cached
 */
export const dynamic = 'force-dynamic'

/**
 * Use Node.js runtime for job processing
 */
export const runtime = 'nodejs'

/**
 * Disable fetch cache
 */
export const fetchCache = 'force-no-store'
