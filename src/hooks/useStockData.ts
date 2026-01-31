/**
 * useStockData Hook
 *
 * Custom hook for fetching stock data using React Query.
 * Fetches both overview and statistics in parallel from internal proxy APIs.
 *
 * Features:
 * - Parallel data fetching with Promise.all
 * - Automatic retry for retryable errors
 * - 5-minute stale time for caching
 * - Symbol validation
 * - Type-safe error handling
 *
 * @example
 * ```tsx
 * function StockPage({ symbol }: { symbol: string }) {
 *   const { data, isLoading, error, refetch } = useStockData(symbol)
 *
 *   if (isLoading) return <StockPageSkeleton />
 *   if (error) return <StockPageErrorBoundary error={error} />
 *
 *   return <StockContent overview={data.overview} statistics={data.statistics} />
 * }
 * ```
 */

import { useQuery } from '@tanstack/react-query'
import { fetchStockData } from '@/lib/api/stock-api'
import type {
  ApiResponse,
  StockOverviewData,
  StockStatisticsData,
} from '@/types/stock-proxy-api'

/**
 * Combined stock data return type
 */
export interface StockDataResult {
  overview: ApiResponse<StockOverviewData>
  statistics: ApiResponse<StockStatisticsData>
}

/**
 * Query key factory for stock data
 */
export const stockQueryKeys = {
  all: ['stockData'] as const,
  detail: (symbol: string) => ['stockData', symbol] as const,
}

/**
 * Stale time for stock data (5 minutes)
 * Stock prices don't change that frequently
 */
const STALE_TIME = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Custom error class for stock data failures
 */
export class StockDataError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'StockDataError'
  }
}

/**
 * Custom hook for fetching stock data
 *
 * @param symbol - Stock symbol (e.g., 'PTT', 'AOT', 'KBANK')
 * @returns React Query result with data, loading state, error, and refetch function
 *
 * @throws StockDataError for various failure scenarios
 */
export function useStockData(symbol: string) {
  return useQuery({
    queryKey: stockQueryKeys.detail(symbol),
    queryFn: async (): Promise<StockDataResult> => {
      const result = await fetchStockData(symbol)

      // Check if both requests failed
      if (!result.overview.success && !result.statistics.success) {
        throw new StockDataError(
          result.overview.error || result.statistics.error || 'Failed to fetch stock data',
          'FETCH_FAILED'
        )
      }

      return result
    },
    staleTime: STALE_TIME,
    // Prevent refetch on window focus to avoid unwanted re-fetches
    refetchOnWindowFocus: false,
    // Prevent refetch on component remount
    refetchOnMount: false,
    // Prevent automatic refetch on reconnect
    refetchOnReconnect: false,
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error instanceof StockDataError) {
        if (error.code === 'VALIDATION_ERROR') {
          return false
        }
      }
      // Retry up to 2 times for retryable errors
      return failureCount < 2
    },
  })
}
