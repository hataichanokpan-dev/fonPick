/**
 * Job Status API Route
 *
 * GET /api/jobs/[id]
 *
 * Returns the current status of a background catalyst job.
 * Clients should poll this endpoint every 2-3 seconds until job completes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { CatalystJobQueue } from '@/lib/jobs/catalyst-job-queue'
import type { JobStatusResponse } from '@/types/job'

// ============================================================================
// ROUTE HANDLER
// ============================================================================

/**
 * GET /api/jobs/[id]
 *
 * Returns the current status of a catalyst job.
 *
 * Response formats:
 * - Processing: {success: true, data: {status, progress, currentStep}}
 * - Completed: {success: true, data: {result}}
 * - Failed: {success: false, data: {error}}
 * - Not Found: {success: false, error: 'Job not found'}
 *
 * @param _request - Next.js request object
 * @param params - Route parameters containing job ID
 * @returns Job status response
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Get job from queue
  const job = CatalystJobQueue.getJob(id)

  if (!job) {
    const response: JobStatusResponse = {
      success: false,
      error: 'Job not found or expired',
    }
    return NextResponse.json(response, { status: 404 })
  }

  // Return response based on job state
  if (job.state === 'completed') {
    const response: JobStatusResponse = {
      success: true,
      data: {
        jobId: job.id,
        symbol: job.symbol,
        status: job.state,
        progress: job.progress,
        currentStep: job.currentStep,
        result: job.result,
      },
    }
    return NextResponse.json(response)
  }

  if (job.state === 'failed') {
    const response: JobStatusResponse = {
      success: false,
      data: {
        jobId: job.id,
        symbol: job.symbol,
        status: job.state,
        progress: job.progress,
        currentStep: job.currentStep,
        error: job.error,
      },
    }
    return NextResponse.json(response)
  }

  // Queued or Processing
  const response: JobStatusResponse = {
    success: true,
    data: {
      jobId: job.id,
      symbol: job.symbol,
      status: job.state,
      progress: job.progress,
      currentStep: job.currentStep,
      result: null,
    },
  }
  return NextResponse.json(response)
}

// ============================================================================
// ROUTE CONFIG
// ============================================================================

/**
 * Force dynamic rendering - job status should not be cached
 */
export const dynamic = 'force-dynamic'

/**
 * Use Node.js runtime
 */
export const runtime = 'nodejs'

/**
 * Disable fetch cache
 */
export const fetchCache = 'force-no-store'
