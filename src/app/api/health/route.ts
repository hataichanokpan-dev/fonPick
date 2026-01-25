/**
 * Health Check API Route
 *
 * GET /api/health
 * Returns system health status for monitoring and alerting.
 *
 * Part of Phase 4: Service health monitoring.
 */

import { NextRequest } from 'next/server'
import { performHealthCheck, quickHealthCheck, getHealthSummary } from '@/services/health-check'
import { cachedJson, NO_CACHE } from '@/lib/api-cache'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/health
 * Query parameters:
 * - quick: Set to 'true' for quick health check (data availability only)
 * - format: Response format (default: 'full', options: 'summary', 'json')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const quickCheck = searchParams.get('quick') === 'true'
    const format = searchParams.get('format') || 'full'

    if (quickCheck) {
      // Quick health check - only data availability
      const quickHealth = await quickHealthCheck()

      return cachedJson(
        {
          status: quickHealth.allDataAvailable ? 'healthy' : 'degraded',
          timestamp: quickHealth.timestamp,
          data: quickHealth,
        },
        NO_CACHE
      )
    }

    // Full health check
    const health = await performHealthCheck({
      maxDataAge: 4 * 60 * 60 * 1000, // 4 hours
      includeResponseTimes: true,
    })

    // Return based on requested format
    if (format === 'summary') {
      return cachedJson(
        {
          status: health.status,
          summary: getHealthSummary(health),
          timestamp: health.timestamp,
          metrics: health.metrics,
        },
        NO_CACHE
      )
    }

    // Full format (default)
    return cachedJson(health, NO_CACHE)
  } catch (error) {
    console.error('Error in health check API:', error)

    return cachedJson(
      {
        status: 'unhealthy',
        error: 'Failed to perform health check',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      },
      NO_CACHE,
      500
    )
  }
}
