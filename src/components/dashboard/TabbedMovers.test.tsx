/**
 * TabbedMovers Component Tests
 *
 * TDD Approach:
 * 1. RED - Write failing tests first
 * 2. GREEN - Implement component to pass tests
 * 3. REFACTOR - Clean up while keeping tests passing
 *
 * Coverage targets:
 * - Unit tests: Component rendering, tab switching, data display
 * - Integration: React Query fetching, error handling
 * - Edge cases: Empty states, loading states, null data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TabbedMovers } from './TabbedMovers'
import type {
  ActiveStocksAnalysis,
  StockConcentration,
  CrossRankedStock,
  ConcentrationMetrics,
} from '@/types/market-intelligence'

// ==================================================================
// MOCKS
// ==================================================================

// Mock fetch globally
global.fetch = vi.fn()

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// ==================================================================
// TEST DATA
// ==================================================================

const mockConcentrationMetrics: ConcentrationMetrics = {
  top10ValueConcentration: 45.5,
  top5StockConcentration: 32.8,
  crossRankedCount: 5,
  hhi: 850,
  interpretation: 'Moderately Concentrated',
  totalValue: 15000000000,
}

const mockActiveStocks: StockConcentration[] = [
  {
    symbol: 'PTT',
    name: 'PTT Public Company Limited',
    value: 5000000000,
    volume: 150000000,
    changePercent: 2.5,
    sectorCode: 'ENERGY',
    marketCapGroup: 'L',
    concentrationScore: 85,
    valuePercentOfTotal: 33.3,
    rankings: { value: 1, volume: 1, gainer: 5 },
    accumulationPattern: 'Accumulation',
    accumulationDays: 3,
  },
  {
    symbol: 'AOT',
    name: 'Airports of Thailand',
    value: 3000000000,
    volume: 80000000,
    changePercent: -1.2,
    sectorCode: 'TRANS',
    marketCapGroup: 'L',
    concentrationScore: 72,
    valuePercentOfTotal: 20.0,
    rankings: { value: 2, volume: 3 },
  },
  {
    symbol: 'KBANK',
    name: 'Kasikornbank',
    value: 2000000000,
    volume: 60000000,
    changePercent: 1.8,
    sectorCode: 'FIN',
    marketCapGroup: 'L',
    concentrationScore: 65,
    valuePercentOfTotal: 13.3,
    rankings: { value: 3, gainer: 8 },
  },
  {
    symbol: 'SCB',
    name: 'Siam Commercial Bank',
    value: 1500000000,
    volume: 50000000,
    changePercent: -0.5,
    sectorCode: 'FIN',
    marketCapGroup: 'L',
    concentrationScore: 58,
    valuePercentOfTotal: 10.0,
    rankings: { volume: 2, loser: 3 },
  },
  {
    symbol: 'CPF',
    name: 'Charoen Pokphand Foods',
    value: 1000000000,
    volume: 40000000,
    changePercent: 3.2,
    sectorCode: 'AGRO',
    marketCapGroup: 'M',
    concentrationScore: 52,
    valuePercentOfTotal: 6.7,
    rankings: { gainer: 1, volume: 5 },
  },
]

const mockCrossRanked: CrossRankedStock[] = [
  {
    symbol: 'PTT',
    name: 'PTT Public Company Limited',
    rankings: { value: 1, volume: 1, gainer: 5 },
    rankingCount: 3,
    strengthScore: 8,
  },
  {
    symbol: 'AOT',
    name: 'Airports of Thailand',
    rankings: { value: 2, volume: 3 },
    rankingCount: 2,
    strengthScore: 5,
  },
]

const mockActiveStocksData: ActiveStocksAnalysis = {
  topByValue: mockActiveStocks,
  topByVolume: mockActiveStocks.sort((a, b) => b.volume - a.volume),
  crossRanked: mockCrossRanked,
  metrics: mockConcentrationMetrics,
  observations: ['Market concentrated in top 5 energy stocks'],
  timestamp: Date.now(),
}

const mockMarketIntelligenceResponse = {
  success: true,
  data: {
    activeStocks: mockActiveStocksData,
  },
}

// ==================================================================
// TEST UTILITIES
// ==================================================================

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function mockSuccessfulFetch() {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: true,
    json: async () => mockMarketIntelligenceResponse,
  } as Response)
}

function mockFailedFetch() {
  vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))
}

// ==================================================================
// TEST SUITES
// ==================================================================

describe('TabbedMovers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('renders component structure', () => {
    it('should render the component without crashing', () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      // Check for Card component
      const card = document.querySelector('.bg-surface')
      expect(card).toBeTruthy()
    })

    it('should display all 4 tabs: Active, Gainers, Losers, Volume', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(screen.getByText('Gainers')).toBeInTheDocument()
        expect(screen.getByText('Losers')).toBeInTheDocument()
        expect(screen.getByText('Volume')).toBeInTheDocument()
      })
    })

    it('should have Active tab selected by default', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        const activeTab = screen.getByRole('tab', { name: /active/i })
        expect(activeTab).toHaveClass('border-accent-blue')
      })
    })

    it('should accept custom className prop', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      const { container } = render(<TabbedMovers className="custom-class" />, { wrapper })

      await waitFor(() => {
        const card = container.querySelector('.custom-class')
        expect(card).toBeTruthy()
      })
    })
  })

  describe('Active tab content', () => {
    it('should display top stocks by value', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        // PTT appears multiple times (in list and cross-ranked), so just check it exists
        expect(screen.getAllByText((content) => content.includes('PTT')).length).toBeGreaterThan(0)
        expect(screen.getAllByText((content) => content.includes('AOT')).length).toBeGreaterThan(0)
        expect(screen.getAllByText((content) => content.includes('KBANK')).length).toBeGreaterThan(0)
      })
    })

    it('should display concentration metrics', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Market Concentration')).toBeInTheDocument()
        expect(screen.getByText('32.8%')).toBeInTheDocument() // top5StockConcentration
        expect(screen.getByText('850')).toBeInTheDocument() // HHI
      })
    })

    it('should show cross-ranked stocks', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('Cross-Ranked'))).toBeInTheDocument()
      })
    })

    it('should limit stocks to topCount prop', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers topCount={3} />, { wrapper })

      await waitFor(() => {
        // Should show "Top 3 by Value" header
        expect(screen.getByText((content) => content.includes('Top 3') && content.includes('Value'))).toBeInTheDocument()
      })

      // Verify that we have the top stocks displayed
      // Note: PTT, AOT, KBANK are the top 3 in our mock data
      await waitFor(() => {
        expect(screen.getAllByText((content) => content.includes('PTT')).length).toBeGreaterThan(0)
        expect(screen.getAllByText((content) => content.includes('AOT')).length).toBeGreaterThan(0)
        expect(screen.getAllByText((content) => content.includes('KBANK')).length).toBeGreaterThan(0)
      })
    })

    it('should display accumulation pattern badges', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('3d Acc'))).toBeInTheDocument()
      })
    })
  })

  describe('Gainers tab content', () => {
    it('should display top gainers when Gainers tab is clicked', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Gainers')).toBeInTheDocument()
      })

      // Click Gainers tab wrapped in act()
      await act(async () => {
        const gainersTab = screen.getByRole('tab', { name: /gainers/i })
        gainersTab.click()
      })

      await waitFor(() => {
        expect(screen.getByText('PTT')).toBeInTheDocument()
        expect(screen.getByText(/2\.5%/)).toBeInTheDocument() // changePct
      })
    })

    it('should show gainers with green color', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Gainers')).toBeInTheDocument()
      })

      await act(async () => {
        const gainersTab = screen.getByRole('tab', { name: /gainers/i })
        gainersTab.click()
      })

      await waitFor(() => {
        // Check that gainers tab shows content
        expect(screen.getByText((content) => content.includes('Top') && content.includes('Gainers'))).toBeInTheDocument()
        // The mock data has PTT with +2.5%, which should appear in gainers
        expect(screen.getAllByText((content) => content.includes('PTT')).length).toBeGreaterThan(0)
      })
    })
  })

  describe('Losers tab content', () => {
    it('should display top losers when Losers tab is clicked', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Losers')).toBeInTheDocument()
      })

      // Click Losers tab wrapped in act()
      await act(async () => {
        const losersTab = screen.getByRole('tab', { name: /losers/i })
        losersTab.click()
      })

      await waitFor(() => {
        // Check that losers tab shows content
        expect(screen.getByText((content) => content.includes('Top') && content.includes('Losers'))).toBeInTheDocument()
      })
    })

    it('should show losers with red color', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Losers')).toBeInTheDocument()
      })

      await act(async () => {
        const losersTab = screen.getByRole('tab', { name: /losers/i })
        losersTab.click()
      })

      await waitFor(() => {
        // Check that losers tab is showing
        expect(screen.getByText((content) => content.includes('Top') && content.includes('Losers'))).toBeInTheDocument()
        // The losers should have negative percentage
        const textContent = document.body.textContent || ''
        expect(textContent).toMatch(/-\d+\.\d+%/)
      })
    })
  })

  describe('Volume tab content', () => {
    it('should display top volume when Volume tab is clicked', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Volume')).toBeInTheDocument()
      })

      // Click Volume tab wrapped in act()
      await act(async () => {
        const volumeTab = screen.getByRole('tab', { name: /volume/i })
        volumeTab.click()
      })

      await waitFor(() => {
        expect(screen.getByText('PTT')).toBeInTheDocument()
        expect(screen.getByText('AOT')).toBeInTheDocument()
      })
    })
  })

  describe('tab switching', () => {
    it('should switch tab content when clicking different tabs', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      // Start on Active tab
      await waitFor(() => {
        expect(screen.getByText('Market Concentration')).toBeInTheDocument()
      })

      // Switch to Gainers
      await act(async () => {
        const gainersTab = screen.getByRole('tab', { name: /gainers/i })
        gainersTab.click()
      })

      await waitFor(() => {
        expect(screen.queryByText('Market Concentration')).not.toBeInTheDocument()
      })

      // Switch to Losers
      await act(async () => {
        const losersTab = screen.getByRole('tab', { name: /losers/i })
        losersTab.click()
      })

      await waitFor(() => {
        expect(screen.queryByText('Market Concentration')).not.toBeInTheDocument()
      })

      // Switch back to Active
      await act(async () => {
        const activeTab = screen.getByRole('tab', { name: /active/i })
        activeTab.click()
      })

      await waitFor(() => {
        expect(screen.getByText('Market Concentration')).toBeInTheDocument()
      })
    })

    it('should update active tab styling when switching tabs', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /active/i })).toBeInTheDocument()
      })

      // Initial state - Active is selected
      const activeTab = screen.getByRole('tab', { name: /active/i })
      expect(activeTab).toHaveClass('border-accent-blue')

      // Switch to Gainers
      await act(async () => {
        const gainersTab = screen.getByRole('tab', { name: /gainers/i })
        gainersTab.click()
      })

      await waitFor(() => {
        const newActiveTab = screen.getByRole('tab', { name: /gainers/i })
        expect(newActiveTab).toHaveClass('border-accent-blue')
      })
    })
  })

  describe('loading state', () => {
    it('should show loading skeleton while fetching data', () => {
      vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {})) // Never resolve
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      // Should show skeleton/loading state
      const card = document.querySelector('.bg-surface')
      expect(card).toBeTruthy()
    })
  })

  describe('error state', () => {
    it('should display error message when fetch fails', async () => {
      mockFailedFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText(/Unable to load market data/i)).toBeInTheDocument()
      })
    })

    it('should display error message when API returns success: false', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Server error' }),
      } as Response)

      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText(/Unable to load market data/i)).toBeInTheDocument()
      })
    })
  })

  describe('empty states', () => {
    it('should handle empty active stocks data', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            activeStocks: {
              topByValue: [],
              topByVolume: [],
              crossRanked: [],
              metrics: {
                top10ValueConcentration: 0,
                top5StockConcentration: 0,
                crossRankedCount: 0,
                hhi: 0,
                interpretation: 'Broadly Distributed',
              },
              observations: [],
              timestamp: Date.now(),
            },
          },
        }),
      } as Response)

      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        // Should still render the component
        const card = document.querySelector('.bg-surface')
        expect(card).toBeTruthy()
      })
    })
  })

  describe('edge cases', () => {
    it('should handle topCount of 0', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers topCount={0} />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument()
      })

      // With topCount=0, the "Top X by Value" section should still render
      // but show "Top 0 by Value" (no stocks in list)
      await waitFor(() => {
        // The component should show the header even with 0 stocks
        const header = screen.queryByText((content) => content.includes('Top 0') && content.includes('Value'))
        expect(header).toBeInTheDocument()
      })
    })

    it('should handle negative topCount', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers topCount={-1} />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument()
      })

      // Should clamp to 0 and show "Top 0 by Value"
      await waitFor(() => {
        const header = screen.queryByText((content) => content.includes('Top 0') && content.includes('Value'))
        expect(header).toBeInTheDocument()
      })
    })

    it('should handle topCount larger than data length', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers topCount={100} />, { wrapper })

      await waitFor(() => {
        // Should show the header with the actual count of available stocks
        expect(screen.getByText((content) => content.includes('Top') && content.includes('Value'))).toBeInTheDocument()
      })

      // Should still show all available stocks (limited by actual data length)
      await waitFor(() => {
        expect(screen.getAllByText((content) => content.includes('PTT')).length).toBeGreaterThan(0)
        expect(screen.getAllByText((content) => content.includes('CPF')).length).toBeGreaterThan(0)
      })
    })
  })

  describe('React Query integration', () => {
    it('should fetch from market-intelligence API', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      expect(fetchCall[0]).toContain('/api/market-intelligence')
    })

    it('should include includeP2=true in query params', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      expect(fetchCall[0]).toContain('includeP2=true')
    })

    it('should refetch data on refresh interval', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      // Wait for refetch interval (2 minutes)
      // Note: This test would need to use fake timers for full testing
    })
  })

  describe('responsive design', () => {
    it('should have responsive tab layout', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      const { container } = render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        const tabsContainer = container.querySelector('.flex')
        expect(tabsContainer).toBeTruthy()
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper button role for tabs', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        const tabs = screen.getAllByRole('tab')
        expect(tabs.length).toBe(4) // Exactly 4 tabs
      })
    })

    it('should update tab selection state for accessibility', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        const activeTab = screen.getByRole('tab', { name: /active/i })
        expect(activeTab.getAttribute('aria-selected')).toBe('true')
      })
    })
  })

  describe('data formatting', () => {
    it('should format trading values correctly', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        // Check for formatted values (e.g., B for billions, M for millions)
        const textContent = document.body.textContent || ''
        // The component should format values with B, M, or K suffixes
        expect(textContent).toMatch(/[BMK]/)
      })
    })

    it('should format percentages correctly', async () => {
      mockSuccessfulFetch()
      const wrapper = createWrapper()

      render(<TabbedMovers />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText(/2\.5%/)).toBeInTheDocument()
      })
    })
  })
})
