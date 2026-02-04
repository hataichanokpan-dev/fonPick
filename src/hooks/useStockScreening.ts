'use client'

/**
 * useStockScreening Hook
 *
 * Custom hook for fetching stock screening data.
 * Combines multiple data sources and calculates screening scores.
 */

import { useQuery } from '@tanstack/react-query'
import { calculateScreeningScore, type ScreeningInputData } from '@/components/stock/screening/utils/score-calculator'
import { fetchStockData } from '@/lib/api/stock-api'
import type { StockOverviewData, StockStatisticsData } from '@/types/stock-proxy-api'
import type { AlphaAPIResponse } from '@/components/stock/screening/types'

/**
 * Screening data result
 */
export interface StockScreeningData {
  overview: StockOverviewData | null
  statistics: StockStatisticsData | null
  alpha: AlphaAPIResponse['data'] | null
  screening: ReturnType<typeof calculateScreeningScore> | null
}

/**
 * Query key factory for screening data
 */
export const screeningQueryKeys = {
  all: ['stockScreening'] as const,
  detail: (symbol: string) => ['stockScreening', symbol] as const,
}

/**
 * Stale time for screening data (5 minutes)
 */
const STALE_TIME = 5 * 60 * 1000

/**
 * Custom error class for screening data failures
 */
export class ScreeningDataError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ScreeningDataError'
  }
}

/**
 * Fetch Alpha API data
 */
async function fetchScreeningAlphaData(symbol: string): Promise<AlphaAPIResponse['data'] | null> {
  try {
    const response = await fetch(`/api/stocks/${symbol}/alpha`)
    if (!response.ok) {
      return null
    }
    const data: AlphaAPIResponse = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error(`Failed to fetch Alpha data for ${symbol}:`, error)
    return null
  }
}

/**
 * Custom hook for fetching stock screening data
 */
export function useStockScreening(symbol: string) {
  return useQuery({
    queryKey: screeningQueryKeys.detail(symbol),
    queryFn: async (): Promise<StockScreeningData> => {
      // Fetch base stock data
      const stockResult = await fetchStockData(symbol)

      // Check if we have at least some data
      if (!stockResult.overview.success && !stockResult.statistics.success) {
        throw new ScreeningDataError(
          'Failed to fetch stock data',
          'FETCH_FAILED'
        )
      }

      const overview: StockOverviewData | null = stockResult.overview.success ? stockResult.overview.data ?? null : null
      const statistics: StockStatisticsData | null = stockResult.statistics.success ? stockResult.statistics.data ?? null : null

      // Fetch Alpha data
      const alpha = await fetchScreeningAlphaData(symbol)

      // Calculate screening score if we have enough data
      let screening = null
      if (statistics) {
        const screeningInput: ScreeningInputData = {
          // Layer 1: Universe
          marketCap: statistics.marketCap || 0,
          volume: statistics.averageVolume20D || overview?.volume || 0,

          // Layer 2: Quality
          pegRatio: statistics.pegRatio || null,
          profitMargin: statistics.profitMargin || 0,
          returnOnEquity: statistics.returnOnEquity || 0,
          returnOnInvestedCapital: statistics.returnOnInvestedCapital || 0,
          debtToEquity: statistics.debtToEquity || 0,
          fcfYield: statistics.fcfYield || 0,
          operatingCashFlow: statistics.operatingCashFlow || 0,
          netIncome: statistics.netIncome || 0,

          // Layer 3: Value + Growth
          peRatio: statistics.peRatio || overview?.peRatio || 0,
          pbRatio: statistics.pbRatio || 0,
          dividendYield: statistics.dividendYield || 0,
          pfcfRatio: statistics.pfcfRatio || 0,
          epsGrowthYoY: 0.05, // TODO: Calculate from yearly data
          epsAcceleration: 0.02, // TODO: Calculate from quarterly data

          // Layer 4: Technical + Catalyst
          currentPrice: overview?.price || 0,
          ma50: statistics.movingAverage50D || null,
          rsi: statistics.rsi || null,
          macdPositive: null, // TODO: From API
          supportLevel: null, // TODO: Calculate from price history
          aiScore: null, // TODO: From AI API
        }

        screening = calculateScreeningScore(screeningInput)
      }

      return {
        overview,
        statistics,
        alpha,
        screening,
      }
    },
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) => {
      if (error instanceof ScreeningDataError) {
        if (error.code === 'VALIDATION_ERROR') {
          return false
        }
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook for screening score only (lighter version)
 */
export function useScreeningScore(symbol: string) {
  const { data, ...rest } = useStockScreening(symbol)

  return {
    ...rest,
    data: data?.screening || null,
  }
}
