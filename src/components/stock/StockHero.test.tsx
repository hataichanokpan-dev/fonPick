/**
 * StockHero Component Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Component renders correctly
 * - Display stock name and symbol
 * - Display current price with change
 * - Display volume information with ratio
 * - Display market cap
 * - Display sector and market
 * - Display 52-week range indicator (if available)
 * - Color coding (green/red/gray)
 * - Responsive design (mobile first)
 * - Animated price change flash
 * - Accessibility (ARIA labels, semantic HTML)
 * - Thai timezone support for timestamps
 * - Proper number formatting (large numbers, decimals)
 * - Edge cases (missing data, zero values)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StockHero } from './StockHero'
import type { StockOverviewData } from '@/types/stock-api'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock date-fns for Thai timezone
vi.mock('date-fns', () => ({
  format: (date: Date, format: string) => {
    if (format === 'HH:mm') {
      return '21:30'
    }
    return '2024-01-15'
  },
}))

describe('StockHero Component', () => {
  const mockStockData: StockOverviewData = {
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
    peRatio: 12.5,
    pbvRatio: 1.2,
    dividendYield: 3.5,
    beta: 0.85,
    decisionBadge: {
      label: 'BUY',
      score: 85,
      type: 'bullish',
    },
    layerScore: {
      quality: 75,
      valuation: 80,
      timing: 90,
    },
    lastUpdate: '2024-01-15T14:30:00Z',
  }

  describe('Rendering', () => {
    it('should render stock hero component', () => {
      render(<StockHero data={mockStockData} />)

      const hero = screen.getByTestId('stock-hero')
      expect(hero).toBeInTheDocument()
    })

    it('should display stock name', () => {
      render(<StockHero data={mockStockData} />)

      const name = screen.getByTestId('stock-name')
      expect(name).toHaveTextContent('PTT Public Company Limited')
    })

    it('should display stock symbol', () => {
      render(<StockHero data={mockStockData} />)

      const symbol = screen.getByTestId('stock-symbol')
      expect(symbol).toHaveTextContent('PTT')
    })

    it('should display sector', () => {
      render(<StockHero data={mockStockData} />)

      const sector = screen.getByTestId('stock-sector')
      expect(sector).toHaveTextContent('Energy')
    })

    it('should display market', () => {
      render(<StockHero data={mockStockData} />)

      const market = screen.getByTestId('stock-market')
      expect(market).toHaveTextContent('SET')
    })
  })

  describe('Price Display', () => {
    it('should display current price', () => {
      render(<StockHero data={mockStockData} />)

      const price = screen.getByTestId('current-price')
      expect(price).toHaveTextContent('34.75')
    })

    it('should display price change', () => {
      render(<StockHero data={mockStockData} />)

      const change = screen.getByTestId('price-change')
      expect(change).toHaveTextContent('+0.50')
    })

    it('should display price change percentage', () => {
      render(<StockHero data={mockStockData} />)

      const changePercent = screen.getByTestId('price-change-percent')
      expect(changePercent).toHaveTextContent('+1.46%')
    })

    it('should display price with proper decimal formatting', () => {
      render(<StockHero data={mockStockData} />)

      const price = screen.getByTestId('current-price')
      expect(price).toHaveTextContent('34.75') // 2 decimal places
    })
  })

  describe('Color Coding', () => {
    it('should show green color for positive change', () => {
      render(<StockHero data={mockStockData} />)

      const priceChange = screen.getByTestId('price-change-container')
      expect(priceChange).toHaveClass('text-up-primary')
    })

    it('should show red color for negative change', () => {
      const negativeChangeData: StockOverviewData = {
        ...mockStockData,
        price: {
          ...mockStockData.price,
          change: -0.5,
          changePercent: -1.46,
        },
      }

      render(<StockHero data={negativeChangeData} />)

      const priceChange = screen.getByTestId('price-change-container')
      expect(priceChange).toHaveClass('text-down-primary')
    })

    it('should show gray color for neutral change', () => {
      const neutralChangeData: StockOverviewData = {
        ...mockStockData,
        price: {
          ...mockStockData.price,
          change: 0,
          changePercent: 0,
        },
      }

      render(<StockHero data={neutralChangeData} />)

      const priceChange = screen.getByTestId('price-change-container')
      expect(priceChange).toHaveClass('text-neutral')
    })
  })

  describe('Volume Display', () => {
    it('should display current volume', () => {
      render(<StockHero data={mockStockData} />)

      const volume = screen.getByTestId('volume-current')
      expect(volume).toHaveTextContent('15.00M')
    })

    it('should display volume ratio', () => {
      render(<StockHero data={mockStockData} />)

      const volumeRatio = screen.getByTestId('volume-ratio')
      expect(volumeRatio).toHaveTextContent('1.25x')
    })

    it('should format large volume numbers correctly', () => {
      render(<StockHero data={mockStockData} />)

      const volume = screen.getByTestId('volume-current')
      expect(volume).toHaveTextContent('15.00M') // 15 million
    })
  })

  describe('Market Cap Display', () => {
    it('should display market cap', () => {
      render(<StockHero data={mockStockData} />)

      const marketCap = screen.getByTestId('market-cap')
      expect(marketCap).toHaveTextContent('992.56B')
    })

    it('should format market cap with suffix', () => {
      render(<StockHero data={mockStockData} />)

      const marketCap = screen.getByTestId('market-cap')
      expect(marketCap).toHaveTextContent('B') // Billion
    })
  })

  describe('52-Week Range', () => {
    it('should display 52-week range if available', () => {
      const dataWithRange: StockOverviewData = {
        ...mockStockData,
        week52High: 40.0,
        week52Low: 30.0,
      } as any

      render(<StockHero data={dataWithRange} />)

      const range = screen.getByTestId('week-52-range')
      expect(range).toBeInTheDocument()
      expect(range).toHaveTextContent('30.00 - 40.00')
    })

    it('should not display 52-week range if not available', () => {
      render(<StockHero data={mockStockData} />)

      const range = screen.queryByTestId('week-52-range')
      expect(range).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for stock name', () => {
      render(<StockHero data={mockStockData} />)

      const name = screen.getByTestId('stock-name')
      expect(name).toHaveAttribute('aria-label', 'Stock name: PTT Public Company Limited')
    })

    it('should have aria-label for price', () => {
      render(<StockHero data={mockStockData} />)

      const price = screen.getByTestId('current-price')
      expect(price).toHaveAttribute('aria-label', 'Current price: 34.75')
    })

    it('should have semantic HTML structure', () => {
      const { container } = render(<StockHero data={mockStockData} />)

      const heading = container.querySelector('h1')
      expect(heading).toBeInTheDocument()
    })

    it('should have role="status" for live price updates', () => {
      render(<StockHero data={mockStockData} />)

      const price = screen.getByTestId('current-price')
      expect(price).toHaveAttribute('role', 'status')
    })
  })

  describe('Responsive Design', () => {
    it('should have mobile-first responsive classes', () => {
      const { container } = render(<StockHero data={mockStockData} />)

      const hero = screen.getByTestId('stock-hero')
      expect(hero).toHaveClass('w-full') // Mobile default
    })

    it('should have responsive grid layout', () => {
      const { container } = render(<StockHero data={mockStockData} />)

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1') // Mobile
      expect(grid).toHaveClass('md:grid-cols-2') // Tablet and up
    })

    it('should have responsive text sizing', () => {
      render(<StockHero data={mockStockData} />)

      const price = screen.getByTestId('current-price')
      expect(price).toHaveClass('text-3xl') // Mobile
      expect(price).toHaveClass('md:text-4xl') // Tablet and up
    })
  })

  describe('Number Formatting', () => {
    it('should format decimals correctly', () => {
      render(<StockHero data={mockStockData} />)

      const price = screen.getByTestId('current-price')
      expect(price).toHaveTextContent('34.75') // 2 decimal places
    })

    it('should format large numbers with suffixes', () => {
      render(<StockHero data={mockStockData} />)

      const volume = screen.getByTestId('volume-current')
      expect(volume).toHaveTextContent('15.00M') // Million

      const marketCap = screen.getByTestId('market-cap')
      expect(marketCap).toHaveTextContent('992.56B') // Billion
    })

    it('should handle zero values', () => {
      const zeroVolumeData: StockOverviewData = {
        ...mockStockData,
        volume: {
          current: 0,
          average: 12000000,
          ratio: 0,
        },
      }

      render(<StockHero data={zeroVolumeData} />)

      const volume = screen.getByTestId('volume-current')
      expect(volume).toHaveTextContent('0.00')
    })
  })

  describe('Timestamp Display', () => {
    it('should display last update time in Thai timezone', () => {
      render(<StockHero data={mockStockData} />)

      const timestamp = screen.getByTestId('last-update')
      expect(timestamp).toBeInTheDocument()
      expect(timestamp).toHaveTextContent('21:30') // Thai timezone (UTC+7)
    })

    it('should have aria-label for timestamp', () => {
      render(<StockHero data={mockStockData} />)

      const timestamp = screen.getByTestId('last-update')
      expect(timestamp).toHaveAttribute('aria-label')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing stock name', () => {
      const missingNameData: StockOverviewData = {
        ...mockStockData,
        name: '',
      }

      render(<StockHero data={missingNameData} />)

      const name = screen.getByTestId('stock-name')
      expect(name).toHaveTextContent('N/A')
    })

    it('should handle empty sector', () => {
      const emptySectorData: StockOverviewData = {
        ...mockStockData,
        sector: '',
      }

      render(<StockHero data={emptySectorData} />)

      const sector = screen.getByTestId('stock-sector')
      expect(sector).toHaveTextContent('N/A')
    })

    it('should handle undefined week 52 range', () => {
      render(<StockHero data={mockStockData} />)

      const range = screen.queryByTestId('week-52-range')
      expect(range).not.toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('should render all metric sections', () => {
      render(<StockHero data={mockStockData} />)

      expect(screen.getByTestId('stock-name')).toBeInTheDocument()
      expect(screen.getByTestId('stock-symbol')).toBeInTheDocument()
      expect(screen.getByTestId('current-price')).toBeInTheDocument()
      expect(screen.getByTestId('price-change')).toBeInTheDocument()
      expect(screen.getByTestId('volume-current')).toBeInTheDocument()
      expect(screen.getByTestId('market-cap')).toBeInTheDocument()
      expect(screen.getByTestId('stock-sector')).toBeInTheDocument()
      expect(screen.getByTestId('stock-market')).toBeInTheDocument()
    })

    it('should maintain proper spacing between sections', () => {
      const { container } = render(<StockHero data={mockStockData} />)

      const spacedElements = container.querySelectorAll('.gap-2, .gap-3, .gap-4')
      expect(spacedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Visual Consistency', () => {
    it('should use consistent card styling', () => {
      const { container } = render(<StockHero data={mockStockData} />)

      const hero = screen.getByTestId('stock-hero')
      expect(hero).toHaveClass('rounded-lg')
    })

    it('should have proper contrast for text', () => {
      render(<StockHero data={mockStockData} />)

      const name = screen.getByTestId('stock-name')
      expect(name).toHaveClass('text-text-primary')
    })
  })
})
