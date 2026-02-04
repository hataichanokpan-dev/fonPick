'use client'

/**
 * useYearlyOperations Hook
 *
 * Fetches yearly financial data including EPS history for stability analysis.
 * Data comes from /api/stocks/[symbol]/operations/yearly endpoint.
 */

import { useQuery } from '@tanstack/react-query'

export interface EPSHistoryData {
  year: number
  eps: number
}

export interface YearlyOperationsData {
  yearly: Record<string, any>
  epsHistory: EPSHistoryData[]
  currentEps: number | null
  epsCagr5Y: number | null
}

interface YearlyOperationsResponse {
  success: boolean
  data?: YearlyOperationsData
  error?: string
}

interface UseYearlyOperationsResult {
  data: YearlyOperationsData | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const STALE_TIME = 15 * 60 * 1000 // 15 minutes

/**
 * Query key factory for yearly operations data
 */
export const yearlyOperationsQueryKeys = {
  all: ['yearlyOperations'] as const,
  detail: (symbol: string) => ['yearlyOperations', symbol] as const,
}

/**
 * Custom hook for fetching yearly operations data
 */
export function useYearlyOperations(
  symbol: string,
  enabled: boolean = true
): UseYearlyOperationsResult {
  return useQuery({
    queryKey: yearlyOperationsQueryKeys.detail(symbol),
    queryFn: async (): Promise<YearlyOperationsData> => {
      const response = await fetch(`/api/stocks/${symbol}/operations/yearly`)
      if (!response.ok) {
        throw new Error(`Failed to fetch yearly operations: ${response.statusText}`)
      }

      const data: YearlyOperationsResponse = await response.json()

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch yearly operations')
      }

      return data.data
    },
    enabled: enabled && !!symbol,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
}

/**
 * Hook for EPS history only (lighter version)
 */
export function useEPSHistory(
  symbol: string,
  enabled: boolean = true
): {
  epsHistory: EPSHistoryData[] | null
  currentEps: number | null
  epsCagr5Y: number | null
  isLoading: boolean
  error: Error | null
} {
  const { data, isLoading, error } = useYearlyOperations(symbol, enabled)

  return {
    epsHistory: data?.epsHistory ?? null,
    currentEps: data?.currentEps ?? null,
    epsCagr5Y: data?.epsCagr5Y ?? null,
    isLoading,
    error,
  }
}
