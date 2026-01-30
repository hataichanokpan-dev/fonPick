/**
 * MarketIntelligenceContext Tests
 *
 * TDD Approach:
 * 1. RED - Write failing tests first
 * 2. GREEN - Implement Context to pass tests
 * 3. REFACTOR - Clean up while keeping tests passing
 *
 * Coverage targets:
 * - Unit tests: Context creation, state management, fetch function
 * - Integration: Provider usage, hook integration
 * - Edge cases: Empty states, error states, null data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { MarketIntelligenceProvider, useMarketIntelligenceContext } from './MarketIntelligenceContext'
import type { MarketIntelligenceData } from '@/types/market-intelligence'

// ==================================================================
// MOCKS
// ==================================================================

global.fetch = vi.fn()

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// ==================================================================
// TEST DATA
// ==================================================================

const mockMarketIntelligenceData: MarketIntelligenceData = {
  regime: {
    regime: 'Risk-On',
    confidence: 'High',
    reasons: ['Strong foreign inflow', 'Sector strength'],
    focus: 'Accumulate quality stocks',
    caution: 'Monitor global risks',
  },
  smartMoney: {
    foreignFlow: { net: 1500000000, trend: 'Inflow' as const },
    institutionalFlow: { net: 500000000, trend: 'Inflow' as const },
    retailFlow: { net: -200000000, trend: 'Outflow' as const },
    propFlow: { net: 300000000, trend: 'Inflow' as const },
    overallSentiment: 'Bullish',
    keySignals: ['Strong foreign buying'],
    recommendations: ['Follow smart money'],
  },
  sectorRotation: {
    topSectors: [
      { sector: 'ENERGY', changePercent: 2.5, strength: 'Strong' as const },
      { sector: 'FIN', changePercent: 1.8, strength: 'Moderate' as const },
    ],
    bottomSectors: [
      { sector: 'TECH', changePercent: -1.2, strength: 'Weak' as const },
    ],
    rotationSignal: 'Energy leading',
    overallTrend: 'Bullish rotation',
  },
  activeStocks: {
    topByValue: [],
    topByVolume: [],
    crossRanked: [],
    metrics: {
      top10ValueConcentration: 45.5,
      top5StockConcentration: 32.8,
      crossRankedCount: 5,
      hhi: 850,
      interpretation: 'Moderately Concentrated',
      totalValue: 15000000000,
    },
    observations: ['Market concentrated in top 5'],
    timestamp: Date.now(),
  },
  timestamp: Date.now(),
  freshness: {
    isFresh: true,
    maxAgeMinutes: 60,
    sources: {
      market: 5,
      investor: 5,
      sector: 5,
      rankings: 5,
    },
  },
}

// ==================================================================
// TEST UTILITIES
// ==================================================================

function mockSuccessfulFetch() {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      success: true,
      data: mockMarketIntelligenceData,
    }),
  } as Response)
}

function mockFailedFetch() {
  vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))
}

function mockFetchWithErrorResponse() {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      success: false,
      error: 'Server error',
    }),
  } as Response)
}

function createTestComponent() {
  function TestComponent() {
    const context = useMarketIntelligenceContext()

    return (
      <div>
        <div data-testid="loading-state">{context.isLoading ? 'loading' : 'loaded'}</div>
        <div data-testid="data-state">{context.data ? 'has-data' : 'no-data'}</div>
        <div data-testid="error-state">{context.error ? context.error.message : 'no-error'}</div>
        <button onClick={() => context.refetch()}>Refetch</button>
      </div>
    )
  }

  return TestComponent
}

// ==================================================================
// TEST SUITES
// ==================================================================

describe('MarketIntelligenceContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Provider initialization', () => {
    it('should render children without crashing', () => {
      mockSuccessfulFetch()

      render(
        <MarketIntelligenceProvider>
          <div>Test Child</div>
        </MarketIntelligenceProvider>
      )

      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should provide context to consumers', () => {
      mockSuccessfulFetch()

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
    })
  })

  describe('Data fetching', () => {
    it('should fetch data on mount', async () => {
      mockSuccessfulFetch()

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/market-intelligence?includeP0=true&includeP1=true&includeP2=true'
      )
    })

    it('should set loading to true initially', () => {
      mockSuccessfulFetch()

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
    })

    it('should set data after successful fetch', async () => {
      mockSuccessfulFetch()

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('data-state')).toHaveTextContent('has-data')
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded')
      })
    })

    it('should set error after failed fetch', async () => {
      mockFailedFetch()

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('Network error')
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded')
      })
    })

    it('should handle API response with success: false', async () => {
      mockFetchWithErrorResponse()

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded')
      })

      // Should still set data even with success: false (data is null)
      await waitFor(() => {
        expect(screen.getByTestId('data-state')).toHaveTextContent('no-data')
      })
    })
  })

  describe('Refetch functionality', () => {
    it('should refetch data when refetch is called', async () => {
      // First fetch succeeds
      mockSuccessfulFetch()

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      // Wait for initial fetch
      await waitFor(() => {
        expect(screen.getByTestId('data-state')).toHaveTextContent('has-data')
      })

      // Clear mocks and set up new mock for refetch
      vi.clearAllMocks()
      mockSuccessfulFetch()

      // Click refetch button
      await act(async () => {
        screen.getByText('Refetch').click()
      })

      // Verify fetch was called again
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('State management', () => {
    it('should set loading back to false after fetch completes', async () => {
      mockSuccessfulFetch()

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      // Initially loading
      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')

      // After fetch completes
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded')
      })
    })

    it('should preserve data between renders', async () => {
      mockSuccessfulFetch()

      const TestComponent = createTestComponent()

      const { rerender } = render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('data-state')).toHaveTextContent('has-data')
      })

      // Rerender to test state preservation
      rerender(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      // Data should still be there
      expect(screen.getByTestId('data-state')).toHaveTextContent('has-data')
    })
  })

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFailedFetch()

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('Network error')
      })

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded')
    })

    it('should clear error on successful refetch', async () => {
      // First fetch fails
      mockFailedFetch()

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('Network error')
      })

      // Refetch succeeds
      vi.clearAllMocks()
      mockSuccessfulFetch()

      await act(async () => {
        screen.getByText('Refetch').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('no-error')
      })
    })
  })

  describe('Context validation', () => {
    it('should throw error when useMarketIntelligenceContext is used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error
      console.error = vi.fn()

      function TestComponent() {
        const context = useMarketIntelligenceContext()
        return <div>{context.data ? 'has-data' : 'no-data'}</div>
      }

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useMarketIntelligenceContext must be used within MarketIntelligenceProvider')

      console.error = originalError
    })

    it('should provide correct context value structure', async () => {
      mockSuccessfulFetch()

      let capturedContext: any = null

      function TestComponent() {
        const context = useMarketIntelligenceContext()
        capturedContext = context

        return <div>Test</div>
      }

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      await waitFor(() => {
        expect(capturedContext).toBeDefined()
      })

      expect(capturedContext).toHaveProperty('data')
      expect(capturedContext).toHaveProperty('isLoading')
      expect(capturedContext).toHaveProperty('error')
      expect(capturedContext).toHaveProperty('refetch')
      expect(typeof capturedContext.refetch).toBe('function')
    })
  })

  describe('Fetch parameters', () => {
    it('should include all required query parameters', async () => {
      mockSuccessfulFetch()

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const url = fetchCall[0] as string

      expect(url).toContain('includeP0=true')
      expect(url).toContain('includeP1=true')
      expect(url).toContain('includeP2=true')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty data response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: null,
        }),
      } as Response)

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('data-state')).toHaveTextContent('no-data')
      })

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded')
    })

    it('should handle malformed response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          invalid: 'response',
        }),
      } as Response)

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded')
      })

      // Should handle gracefully - data will be undefined
      expect(screen.getByTestId('data-state')).toHaveTextContent('no-data')
    })

    it('should handle non-OK response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response)

      const TestComponent = createTestComponent()

      render(
        <MarketIntelligenceProvider>
          <TestComponent />
        </MarketIntelligenceProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to fetch market intelligence data')
      })
    })
  })

  describe('Multiple components sharing context', () => {
    it('should share data across multiple consumers', async () => {
      mockSuccessfulFetch()

      function ComponentA() {
        const context = useMarketIntelligenceContext()
        return <div data-testid="comp-a">{context.data ? 'loaded' : 'loading'}</div>
      }

      function ComponentB() {
        const context = useMarketIntelligenceContext()
        return <div data-testid="comp-b">{context.data ? 'loaded' : 'loading'}</div>
      }

      render(
        <MarketIntelligenceProvider>
          <ComponentA />
          <ComponentB />
        </MarketIntelligenceProvider>
      )

      // Both should load from the same fetch
      await waitFor(() => {
        expect(screen.getByTestId('comp-a')).toHaveTextContent('loaded')
        expect(screen.getByTestId('comp-b')).toHaveTextContent('loaded')
      })

      // Only one fetch should have been made
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})
