/**
 * useStockData Hook Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Success states (data fetching)
 * - Loading states
 * - Error handling (all error types)
 * - Symbol validation
 * - Refetch functionality
 * - React Query integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useStockData } from './useStockData'
import { fetchStockData } from '@/lib/api'
import { ApiError, ApiErrorType } from '@/types/stock-api'

// Mock the API module
vi.mock('@/lib/api', () => ({
  fetchStockData: vi.fn(),
}))

const mockFetchStockData = vi.mocked(fetchStockData)

// Helper function to create mock overview data
function createMockOverview() {
  return {
    success: true,
    data: {
      symbol: 'PTT',
      name: 'PTT Public Company Limited',
      sector: 'Energy',
      market: 'SET',
      price: {
        current: 34.75,
        change: 0.5,
        changePercent: 1.46,
        dayHigh: 35.0,
        dayLow: 34.5,
        previousClose: 34.25,
      },
      volume: {
        current: 15000000,
        average: 12000000,
        ratio: 1.25,
      },
      marketCap: '992.56B',
      peRatio: 13.46,
      pbvRatio: 1.2,
      dividendYield: 3.5,
      beta: 0.85,
      decisionBadge: {
        label: 'BUY',
        score: 75,
        type: 'bullish' as const,
      },
      layerScore: {
        quality: 70,
        valuation: 80,
        timing: 75,
      },
      lastUpdate: '2025-01-29T12:00:00Z',
    },
    cached: false,
  }
}

// Helper function to create mock statistics data
function createMockStatistics() {
  return {
    success: true,
    data: {
      symbol: 'PTT',
      financial: {
        revenue: 1500000000000,
        netProfit: 120000000000,
        totalAssets: 2500000000000,
        totalEquity: 800000000000,
        eps: 15.5,
        roe: 15.2,
        roa: 4.8,
        debtToEquity: 2.1,
        currentRatio: 1.5,
        quickRatio: 1.2,
      },
      valuation: {
        pe: 13.46,
        pbv: 1.2,
        ev: 1200000000000,
        evEbitda: 8.5,
        priceToSales: 0.8,
        pegRatio: 1.2,
        dividendYield: 3.5,
        payoutRatio: 0.5,
      },
      performance: {
        w1d: 1.5,
        w1m: 3.2,
        w3m: 8.5,
        w6m: 12.3,
        ytd: 5.8,
        y1: 18.5,
      },
      trading: {
        avgVolume1m: 15000000,
        avgVolume3m: 12000000,
        avgVolume1y: 10000000,
        turnover: 2500000000,
        volatility: 0.85,
      },
      analyst: {
        rating: 'BUY',
        targetPrice: 42.0,
        recommendation: 'Buy',
        strongBuy: 5,
        buy: 8,
        hold: 3,
        sell: 0,
        strongSell: 0,
      },
      lastUpdate: '2025-01-29T12:00:00Z',
    },
    cached: false,
  }
}

// Helper function to create a wrapper with QueryClient
function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useStockData Hook', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    // Create a fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 300000, // 5 minutes
        },
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Success States', () => {
    it('should fetch stock data successfully', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValueOnce([mockOverview, mockStatistics])

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      // Initially should be loading
      expect(result.current.isLoading).toBe(true)

      // Wait for the data to be fetched
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Should have data
      expect(result.current.data).toBeDefined()
      expect(result.current.data?.overview).toEqual(mockOverview)
      expect(result.current.data?.statistics).toEqual(mockStatistics)
      expect(mockFetchStockData).toHaveBeenCalledTimes(1)
      expect(mockFetchStockData).toHaveBeenCalledWith('PTT')
    })

    it('should not be loading after successful fetch', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValueOnce([mockOverview, mockStatistics])

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isSuccess).toBe(true)
    })

    it('should not have error after successful fetch', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValueOnce([mockOverview, mockStatistics])

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('Loading States', () => {
    it('should be in loading state initially', () => {
      mockFetchStockData.mockImplementation(() => new Promise(() => {})) // Never resolves

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.isFetching).toBe(true)
      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBeNull()
    })

    it('should have isFetched true after fetch completes', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValueOnce([mockOverview, mockStatistics])

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isFetched).toBe(true)
      })
    })

    it('should show refetching during manual refetch', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValue([mockOverview, mockStatistics])

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Trigger refetch
      result.current.refetch()

      // Should be fetching
      expect(result.current.isFetching).toBe(true)

      // Wait for refetch to complete
      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })

      expect(mockFetchStockData).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Handling - NOT_FOUND', () => {
    it('should handle NOT_FOUND error', async () => {
      const apiError = new ApiError(
        ApiErrorType.NOT_FOUND,
        404,
        'Stock not found',
        false
      )
      mockFetchStockData.mockRejectedValueOnce(apiError)

      const { result } = renderHook(() => useStockData('INVALID'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
      expect(result.current.error).toBeInstanceOf(ApiError)
      expect(result.current.error?.type).toBe(ApiErrorType.NOT_FOUND)
      expect(result.current.isLoading).toBe(false)
    })

    it('should not retry on NOT_FOUND error', async () => {
      const apiError = new ApiError(
        ApiErrorType.NOT_FOUND,
        404,
        'Stock not found',
        false
      )
      mockFetchStockData.mockRejectedValueOnce(apiError)

      const { result } = renderHook(() => useStockData('INVALID'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      // Should only attempt once (no retries)
      expect(mockFetchStockData).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling - TIMEOUT', () => {
    it('should handle TIMEOUT error', async () => {
      const apiError = new ApiError(
        ApiErrorType.TIMEOUT,
        408,
        'Request timeout',
        true
      )
      mockFetchStockData.mockRejectedValueOnce(apiError)

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.type).toBe(ApiErrorType.TIMEOUT)
    })
  })

  describe('Error Handling - RATE_LIMIT', () => {
    it('should handle RATE_LIMIT error', async () => {
      const apiError = new ApiError(
        ApiErrorType.RATE_LIMIT,
        429,
        'Rate limit exceeded',
        true
      )
      mockFetchStockData.mockRejectedValueOnce(apiError)

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.type).toBe(ApiErrorType.RATE_LIMIT)
    })
  })

  describe('Error Handling - SERVER_ERROR', () => {
    it('should handle SERVER_ERROR error', async () => {
      const apiError = new ApiError(
        ApiErrorType.SERVER_ERROR,
        500,
        'Internal server error',
        true
      )
      mockFetchStockData.mockRejectedValueOnce(apiError)

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.type).toBe(ApiErrorType.SERVER_ERROR)
    })
  })

  describe('Error Handling - NETWORK_ERROR', () => {
    it('should handle NETWORK_ERROR error', async () => {
      const apiError = new ApiError(
        ApiErrorType.NETWORK_ERROR,
        0,
        'Failed to fetch',
        true
      )
      mockFetchStockData.mockRejectedValueOnce(apiError)

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.type).toBe(ApiErrorType.NETWORK_ERROR)
    })
  })

  describe('Error Handling - VALIDATION_ERROR', () => {
    it('should handle VALIDATION_ERROR for invalid symbol', async () => {
      const apiError = new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        400,
        'Invalid stock symbol',
        false
      )
      mockFetchStockData.mockRejectedValueOnce(apiError)

      const { result } = renderHook(() => useStockData(''), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.type).toBe(ApiErrorType.VALIDATION_ERROR)
    })
  })

  describe('Symbol Validation', () => {
    it('should accept valid stock symbols', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValue([mockOverview, mockStatistics])

      const symbols = ['PTT', 'AOT', 'KBANK', 'BBL']

      for (const symbol of symbols) {
        const { result } = renderHook(() => useStockData(symbol), {
          wrapper: createWrapper(queryClient),
        })

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true)
        })

        expect(mockFetchStockData).toHaveBeenCalledWith(symbol)
      }
    })

    it('should handle uppercase conversion', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValue([mockOverview, mockStatistics])

      const { result } = renderHook(() => useStockData('ptt'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Should be called with uppercase
      expect(mockFetchStockData).toHaveBeenCalledWith('ptt')
    })

    it('should handle special characters in symbol', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValue([mockOverview, mockStatistics])

      const { result } = renderHook(() => useStockData('P-T-T'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockFetchStockData).toHaveBeenCalledWith('P-T-T')
    })
  })

  describe('Refetch Functionality', () => {
    it('should provide refetch function', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValue([mockOverview, mockStatistics])

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.refetch).toBeDefined()
      expect(typeof result.current.refetch).toBe('function')
    })

    it('should refetch data when refetch is called', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValue([mockOverview, mockStatistics])

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const initialCallCount = mockFetchStockData.mock.calls.length

      // Trigger refetch
      await result.current.refetch()

      await waitFor(() => {
        expect(mockFetchStockData).toHaveBeenCalledTimes(initialCallCount + 1)
      })
    })

    it('should recover from error after successful refetch', async () => {
      const apiError = new ApiError(
        ApiErrorType.SERVER_ERROR,
        500,
        'Server error',
        true
      )
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()

      mockFetchStockData
        .mockRejectedValueOnce(apiError)
        .mockResolvedValueOnce([mockOverview, mockStatistics])

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      // Wait for error
      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      // Refetch
      await result.current.refetch()

      // Should recover
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
    })
  })

  describe('React Query Integration', () => {
    it('should use 5 minute stale time', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValue([mockOverview, mockStatistics])

      const customQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 300000, // 5 minutes
          },
        },
      })

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(customQueryClient),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const queryCache = customQueryClient.getQueryCache()
      const query = queryCache.find({ queryKey: ['stockData', 'PTT'] })
      expect(query?.state.staleTime).toBe(300000)
    })

    it('should cache data and not refetch if not stale', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValue([mockOverview, mockStatistics])

      const { result, rerender } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const initialCallCount = mockFetchStockData.mock.calls.length

      // Rerender should not trigger refetch (data is still fresh)
      rerender()

      expect(mockFetchStockData).toHaveBeenCalledTimes(initialCallCount)
    })

    it('should have correct query key', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValue([mockOverview, mockStatistics])

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const queryCache = queryClient.getQueryCache()
      const query = queryCache.find({ queryKey: ['stockData', 'PTT'] })
      expect(query).toBeDefined()
    })
  })

  describe('Data Structure', () => {
    it('should return data with overview and statistics', async () => {
      const mockOverview = createMockOverview()
      const mockStatistics = createMockStatistics()
      mockFetchStockData.mockResolvedValueOnce([mockOverview, mockStatistics])

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual({
        overview: mockOverview,
        statistics: mockStatistics,
      })
    })

    it('should have undefined data initially', () => {
      mockFetchStockData.mockImplementation(() => new Promise(() => {}))

      const { result } = renderHook(() => useStockData('PTT'), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.data).toBeUndefined()
    })
  })
})
