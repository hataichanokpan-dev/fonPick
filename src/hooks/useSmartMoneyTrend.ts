/**
 * useSmartMoneyTrend Hook
 *
 * Fetches and manages trend analysis data for smart money flows.
 * Handles caching, loading states, and error handling.
 *
 * Phase 2: Frontend Core
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  TrendAnalysisResponse,
  TrendPeriod,
  TrendInvestorFilter,
} from '@/types/smart-money'

// ============================================================================
// HOOK OPTIONS
// ============================================================================

/**
 * Options for useSmartMoneyTrend hook
 */
export interface UseSmartMoneyTrendOptions {
  /** Period in days (default: 30) */
  period?: TrendPeriod

  /** Investor types to include (default: all) */
  investors?: TrendInvestorFilter[]

  /** Enable/disable fetching (default: true) */
  enabled?: boolean

  /** Refresh interval in milliseconds (default: disabled) */
  refetchInterval?: number

  /** Callback on successful fetch */
  onSuccess?: (data: TrendAnalysisResponse['data']) => void

  /** Callback on error */
  onError?: (error: Error) => void
}

// ============================================================================
// HOOK RESULT
// ============================================================================

/**
 * Return type for useSmartMoneyTrend hook
 */
export interface UseSmartMoneyTrendResult {
  /** Trend analysis data */
  data: TrendAnalysisResponse['data'] | null

  /** Loading state */
  isLoading: boolean

  /** Error if any */
  error: Error | null

  /** Whether data is being refetched */
  isRefetching: boolean

  /** Current period */
  period: TrendPeriod

  /** Refetch data */
  refetch: () => Promise<void>

  /** Change period and refetch */
  setPeriod: (period: TrendPeriod) => Promise<void>

  /** Timestamp of last successful fetch */
  lastFetchedAt: number | null

  /** Time since last fetch (seconds) */
  lastFetchedSecondsAgo: number | null
}

// ============================================================================
// BUILD QUERY URL
// ============================================================================

/**
 * Build query URL for trend API
 */
function buildTrendUrl(options: UseSmartMoneyTrendOptions): string {
  const params = new URLSearchParams()

  if (options.period) params.set('period', options.period.toString())

  if (options.investors && options.investors.length > 0) {
    // Filter out 'all' and join
    const filtered = options.investors.filter((i) => i !== 'all')
    if (filtered.length > 0) {
      params.set('investors', filtered.join(','))
    }
  }

  const queryString = params.toString()
  return queryString ? `/api/smart-money/trend?${queryString}` : '/api/smart-money/trend'
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook for fetching smart money trend analysis
 *
 * @example
 * const { data, isLoading, error, setPeriod } = useSmartMoneyTrend({
 *   period: 30,
 *   refetchInterval: 60000, // Refetch every minute
 * })
 *
 * @example
 * // Manual refetch control
 * const { data, refetch, setPeriod } = useSmartMoneyTrend({
 *   period: 10,
 *   enabled: false, // Don't fetch immediately
 * })
 * // Later...
 * await refetch()
 */
export function useSmartMoneyTrend(
  options: UseSmartMoneyTrendOptions = {}
): UseSmartMoneyTrendResult {
  const {
    period: initialPeriod = 30,
    investors = ['all'],
    enabled = true,
    refetchInterval,
    onSuccess,
    onError,
  } = options

  // State
  const [data, setData] = useState<TrendAnalysisResponse['data'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefetching, setIsRefetching] = useState(false)
  const [period, setPeriodState] = useState<TrendPeriod>(initialPeriod)
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null)

  // Refs for stable callbacks
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Update refs when callbacks change
  useEffect(() => {
    onSuccessRef.current = onSuccess
    onErrorRef.current = onError
  }, [onSuccess, onError])

  // Fetch function
  const fetchData = useCallback(
    async (isRefetch = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      try {
        if (isRefetch) {
          setIsRefetching(true)
        } else {
          setIsLoading(true)
        }
        setError(null)

        const url = buildTrendUrl({ ...options, period })
        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        const json: TrendAnalysisResponse = await response.json()

        if (!json.success) {
          throw new Error(json.error || 'Failed to fetch trend data')
        }

        if (json.data) {
          setData(json.data)
          setLastFetchedAt(Date.now())

          if (onSuccessRef.current) {
            onSuccessRef.current(json.data)
          }
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        const errorObj = err instanceof Error ? err : new Error('Unknown error')
        setError(errorObj)

        if (onErrorRef.current) {
          onErrorRef.current(errorObj)
        }
      } finally {
        setIsLoading(false)
        setIsRefetching(false)
      }
    },
    [period, options]
  )

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  // Set period and refetch
  const setPeriod = useCallback(
    async (newPeriod: TrendPeriod) => {
      setPeriodState(newPeriod)
      // Will refetch automatically due to useEffect
    },
    []
  )

  // Fetch on mount and when dependencies change
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    fetchData()

    return () => {
      // Cleanup: abort request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [enabled, period, investors, fetchData])

  // Auto-refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) {
      return
    }

    const interval = setInterval(() => {
      refetch()
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [refetchInterval, enabled, refetch])

  // Calculate time since last fetch
  const lastFetchedSecondsAgo =
    lastFetchedAt !== null ? Math.floor((Date.now() - lastFetchedAt) / 1000) : null

  return {
    data,
    isLoading,
    error,
    isRefetching,
    period,
    refetch,
    setPeriod,
    lastFetchedAt,
    lastFetchedSecondsAgo,
  }
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for short-term trend (5 days)
 * Useful for detecting recent reversals
 */
export function useSmartMoneyTrendShort(options?: Omit<UseSmartMoneyTrendOptions, 'period'>) {
  return useSmartMoneyTrend({ ...options, period: 5 })
}

/**
 * Hook for medium-term trend (30 days)
 * Default for general trend analysis
 */
export function useSmartMoneyTrendMedium(options?: Omit<UseSmartMoneyTrendOptions, 'period'>) {
  return useSmartMoneyTrend({ ...options, period: 30 })
}

/**
 * Hook for long-term trend (90 days)
 * Useful for identifying major trends
 */
export function useSmartMoneyTrendLong(options?: Omit<UseSmartMoneyTrendOptions, 'period'>) {
  return useSmartMoneyTrend({ ...options, period: 90 })
}
