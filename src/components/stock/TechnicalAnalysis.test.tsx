/**
 * TechnicalAnalysis Component Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Component renders correctly
 * - Price Performance section display
 * - Trading Statistics section display
 * - Price Range section display
 * - Bar chart for performance
 * - Range slider visualization
 * - Color coding (green for positive, red for negative)
 * - Responsive layout
 * - Collapsible sections
 * - Empty states
 * - Edge cases (missing data, zero values)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TechnicalAnalysis } from './TechnicalAnalysis'
import type { StockStatisticsData } from '@/types/stock-api'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('TechnicalAnalysis Component', () => {
  const mockStockData: StockStatisticsData = {
    symbol: 'PTT',
    financial: {
      revenue: 1500000000000,
      netProfit: 85000000000,
      totalAssets: 2500000000000,
      totalEquity: 800000000000,
      eps: 12.5,
      roe: 15.5,
      roa: 3.4,
      debtToEquity: 0.8,
      currentRatio: 1.5,
      quickRatio: 1.2,
    },
    valuation: {
      pe: 12.5,
      pbv: 1.2,
      ev: 1200000000000,
      evEbitda: 8.5,
      priceToSales: 0.8,
      pegRatio: 1.2,
      dividendYield: 3.5,
      payoutRatio: 45.0,
    },
    performance: {
      w1d: 1.5,
      w1m: 3.2,
      w3m: 8.5,
      w6m: 12.3,
      ytd: 15.7,
      y1: 22.5,
    },
    trading: {
      avgVolume1m: 15000000,
      avgVolume3m: 12000000,
      avgVolume1y: 10000000,
      turnover: 500000000,
      volatility: 0.85,
    },
    analyst: {
      rating: 'BUY',
      targetPrice: 42.0,
      recommendation: 'Strong Buy',
      strongBuy: 5,
      buy: 8,
      hold: 2,
      sell: 0,
      strongSell: 0,
    },
    lastUpdate: '2024-01-15T14:30:00Z',
  }

  describe('Rendering', () => {
    it('should render technical analysis component', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const component = screen.getByTestId('technical-analysis')
      expect(component).toBeInTheDocument()
    })

    it('should display Price Performance section', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const section = screen.getByTestId('price-performance-section')
      expect(section).toBeInTheDocument()
    })

    it('should display Trading Statistics section', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const section = screen.getByTestId('trading-statistics-section')
      expect(section).toBeInTheDocument()
    })

    it('should display Price Range section', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const section = screen.getByTestId('price-range-section')
      expect(section).toBeInTheDocument()
    })
  })

  describe('Price Performance', () => {
    it('should display 1 Day performance', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const w1d = screen.getByTestId('performance-w1d')
      expect(w1d).toBeInTheDocument()
      expect(w1d).toHaveTextContent('+1.50%')
    })

    it('should display 1 Week performance', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const w1m = screen.getByTestId('performance-w1m')
      expect(w1m).toBeInTheDocument()
      expect(w1m).toHaveTextContent('+3.20%')
    })

    it('should display 3 Month performance', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const w3m = screen.getByTestId('performance-w3m')
      expect(w3m).toBeInTheDocument()
      expect(w3m).toHaveTextContent('+8.50%')
    })

    it('should display 6 Month performance', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const w6m = screen.getByTestId('performance-w6m')
      expect(w6m).toBeInTheDocument()
      expect(w6m).toHaveTextContent('+12.30%')
    })

    it('should display YTD performance', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const ytd = screen.getByTestId('performance-ytd')
      expect(ytd).toBeInTheDocument()
      expect(ytd).toHaveTextContent('+15.70%')
    })

    it('should display 1 Year performance', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const y1 = screen.getByTestId('performance-y1')
      expect(y1).toBeInTheDocument()
      expect(y1).toHaveTextContent('+22.50%')
    })

    it('should display Thai label for Price Performance', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const thaiLabel = screen.getByTestId('price-performance-thai-label')
      expect(thaiLabel).toBeInTheDocument()
      expect(thaiLabel).toHaveTextContent('ผลการดำเนินงาน')
    })

    it('should display English subtitle for Price Performance', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const englishLabel = screen.getByTestId('price-performance-english-label')
      expect(englishLabel).toBeInTheDocument()
      expect(englishLabel).toHaveTextContent('Price Performance')
    })
  })

  describe('Trading Statistics', () => {
    it('should display average volume 1M', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const avgVolume1m = screen.getByTestId('trading-avg-volume-1m')
      expect(avgVolume1m).toBeInTheDocument()
      expect(avgVolume1m).toHaveTextContent('15.00M')
    })

    it('should display average volume 3M', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const avgVolume3m = screen.getByTestId('trading-avg-volume-3m')
      expect(avgVolume3m).toBeInTheDocument()
      expect(avgVolume3m).toHaveTextContent('12.00M')
    })

    it('should display average volume 1Y', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const avgVolume1y = screen.getByTestId('trading-avg-volume-1y')
      expect(avgVolume1y).toBeInTheDocument()
      expect(avgVolume1y).toHaveTextContent('10.00M')
    })

    it('should display turnover', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const turnover = screen.getByTestId('trading-turnover')
      expect(turnover).toBeInTheDocument()
      expect(turnover).toHaveTextContent('500.00M')
    })

    it('should display volatility (beta)', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const volatility = screen.getByTestId('trading-volatility')
      expect(volatility).toBeInTheDocument()
      expect(volatility).toHaveTextContent('0.85')
    })

    it('should display Thai label for Trading Statistics', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const thaiLabel = screen.getByTestId('trading-statistics-thai-label')
      expect(thaiLabel).toBeInTheDocument()
      expect(thaiLabel).toHaveTextContent('สถิติการซื้อขาย')
    })

    it('should display English subtitle for Trading Statistics', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const englishLabel = screen.getByTestId('trading-statistics-english-label')
      expect(englishLabel).toBeInTheDocument()
      expect(englishLabel).toHaveTextContent('Trading Statistics')
    })
  })

  describe('Price Range', () => {
    it('should display 52-week high', () => {
      const dataWithRange: StockStatisticsData = {
        ...mockStockData,
      } as any

      render(<TechnicalAnalysis data={dataWithRange} week52High={40.0} week52Low={30.0} />)

      const high = screen.getByTestId('price-range-high')
      expect(high).toBeInTheDocument()
      expect(high).toHaveTextContent('40.00')
    })

    it('should display 52-week low', () => {
      const dataWithRange: StockStatisticsData = {
        ...mockStockData,
      } as any

      render(<TechnicalAnalysis data={dataWithRange} week52High={40.0} week52Low={30.0} />)

      const low = screen.getByTestId('price-range-low')
      expect(low).toBeInTheDocument()
      expect(low).toHaveTextContent('30.00')
    })

    it('should display current price position in range', () => {
      const dataWithRange: StockStatisticsData = {
        ...mockStockData,
      } as any

      render(
        <TechnicalAnalysis
          data={dataWithRange}
          week52High={40.0}
          week52Low={30.0}
          currentPrice={35.0}
        />
      )

      const position = screen.getByTestId('price-range-position')
      expect(position).toBeInTheDocument()
    })

    it('should display visual range indicator', () => {
      const dataWithRange: StockStatisticsData = {
        ...mockStockData,
      } as any

      render(<TechnicalAnalysis data={dataWithRange} week52High={40.0} week52Low={30.0} />)

      const indicator = screen.getByTestId('price-range-indicator')
      expect(indicator).toBeInTheDocument()
    })

    it('should display Thai label for Price Range', () => {
      const dataWithRange: StockStatisticsData = {
        ...mockStockData,
      } as any

      render(<TechnicalAnalysis data={dataWithRange} week52High={40.0} week52Low={30.0} />)

      const thaiLabel = screen.getByTestId('price-range-thai-label')
      expect(thaiLabel).toBeInTheDocument()
      expect(thaiLabel).toHaveTextContent('ช่วงราคา')
    })

    it('should display English subtitle for Price Range', () => {
      const dataWithRange: StockStatisticsData = {
        ...mockStockData,
      } as any

      render(<TechnicalAnalysis data={dataWithRange} week52High={40.0} week52Low={30.0} />)

      const englishLabel = screen.getByTestId('price-range-english-label')
      expect(englishLabel).toBeInTheDocument()
      expect(englishLabel).toHaveTextContent('Price Range')
    })
  })

  describe('Color Coding', () => {
    it('should show green color for positive performance', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const w1d = screen.getByTestId('performance-w1d')
      expect(w1d).toHaveClass('text-green-500')
    })

    it('should show red color for negative performance', () => {
      const negativeData: StockStatisticsData = {
        ...mockStockData,
        performance: {
          w1d: -1.5,
          w1m: -3.2,
          w3m: -8.5,
          w6m: -12.3,
          ytd: -15.7,
          y1: -22.5,
        },
      }

      render(<TechnicalAnalysis data={negativeData} />)

      const w1d = screen.getByTestId('performance-w1d')
      expect(w1d).toHaveClass('text-red-500')
    })

    it('should show gray color for neutral performance (0%)', () => {
      const neutralData: StockStatisticsData = {
        ...mockStockData,
        performance: {
          w1d: 0,
          w1m: 0,
          w3m: 0,
          w6m: 0,
          ytd: 0,
          y1: 0,
        },
      }

      render(<TechnicalAnalysis data={neutralData} />)

      const w1d = screen.getByTestId('performance-w1d')
      expect(w1d).toHaveClass('text-gray-500')
    })

    it('should show color for volatility (beta)', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const volatility = screen.getByTestId('trading-volatility')
      expect(volatility).toBeInTheDocument()
    })
  })

  describe('Collapsible Sections', () => {
    it('should be expanded by default', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const performanceContent = screen.getByTestId('price-performance-content')
      expect(performanceContent).toBeVisible()
    })

    it('should toggle Price Performance section when clicked', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const header = screen.getByTestId('price-performance-header')
      const content = screen.getByTestId('price-performance-content')

      fireEvent.click(header)
      expect(content).not.toBeVisible()

      fireEvent.click(header)
      expect(content).toBeVisible()
    })

    it('should toggle Trading Statistics section when clicked', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const header = screen.getByTestId('trading-statistics-header')
      const content = screen.getByTestId('trading-statistics-content')

      fireEvent.click(header)
      expect(content).not.toBeVisible()

      fireEvent.click(header)
      expect(content).toBeVisible()
    })

    it('should toggle Price Range section when clicked', () => {
      const dataWithRange: StockStatisticsData = {
        ...mockStockData,
      } as any

      render(<TechnicalAnalysis data={dataWithRange} week52High={40.0} week52Low={30.0} />)

      const header = screen.getByTestId('price-range-header')
      const content = screen.getByTestId('price-range-content')

      fireEvent.click(header)
      expect(content).not.toBeVisible()

      fireEvent.click(header)
      expect(content).toBeVisible()
    })
  })

  describe('Bar Chart Visualization', () => {
    it('should display bar chart for performance', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const chart = screen.getByTestId('performance-bar-chart')
      expect(chart).toBeInTheDocument()
    })

    it('should have bars for all time periods', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      expect(screen.getByTestId('performance-bar-w1d')).toBeInTheDocument()
      expect(screen.getByTestId('performance-bar-w1m')).toBeInTheDocument()
      expect(screen.getByTestId('performance-bar-w3m')).toBeInTheDocument()
      expect(screen.getByTestId('performance-bar-w6m')).toBeInTheDocument()
      expect(screen.getByTestId('performance-bar-ytd')).toBeInTheDocument()
      expect(screen.getByTestId('performance-bar-y1')).toBeInTheDocument()
    })

    it('should color bars based on performance', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const bar1d = screen.getByTestId('performance-bar-w1d')
      expect(bar1d).toHaveClass('bg-green-500')
    })
  })

  describe('Responsive Layout', () => {
    it('should use responsive grid layout', () => {
      const { container } = render(<TechnicalAnalysis data={mockStockData} />)

      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('should have responsive columns', () => {
      const { container } = render(<TechnicalAnalysis data={mockStockData} />)

      const grid = container.querySelector('.grid-cols-1')
      expect(grid).toBeInTheDocument() // Mobile
    })
  })

  describe('Empty States', () => {
    it('should handle missing price range gracefully', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const rangeSection = screen.queryByTestId('price-range-section')
      expect(rangeSection).not.toBeInTheDocument()
    })

    it('should handle missing performance data', () => {
      const emptyData: StockStatisticsData = {
        ...mockStockData,
        performance: {
          w1d: 0,
          w1m: 0,
          w3m: 0,
          w6m: 0,
          ytd: 0,
          y1: 0,
        },
      }

      render(<TechnicalAnalysis data={emptyData} />)

      const component = screen.getByTestId('technical-analysis')
      expect(component).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero volume', () => {
      const zeroVolumeData: StockStatisticsData = {
        ...mockStockData,
        trading: {
          ...mockStockData.trading,
          avgVolume1m: 0,
        },
      }

      render(<TechnicalAnalysis data={zeroVolumeData} />)

      const avgVolume1m = screen.getByTestId('trading-avg-volume-1m')
      expect(avgVolume1m).toBeInTheDocument()
    })

    it('should handle very high volatility', () => {
      const highVolatilityData: StockStatisticsData = {
        ...mockStockData,
        trading: {
          ...mockStockData.trading,
          volatility: 2.5,
        },
      }

      render(<TechnicalAnalysis data={highVolatilityData} />)

      const volatility = screen.getByTestId('trading-volatility')
      expect(volatility).toBeInTheDocument()
      expect(volatility).toHaveClass('text-red-500')
    })

    it('should handle equal high and low range', () => {
      const dataWithRange: StockStatisticsData = {
        ...mockStockData,
      } as any

      render(<TechnicalAnalysis data={dataWithRange} week52High={35.0} week52Low={35.0} />)

      const indicator = screen.getByTestId('price-range-indicator')
      expect(indicator).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for sections', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const performanceHeader = screen.getByTestId('price-performance-header')
      expect(performanceHeader).toHaveAttribute('aria-expanded')
    })

    it('should be keyboard navigable', () => {
      render(<TechnicalAnalysis data={mockStockData} />)

      const header = screen.getByTestId('price-performance-header')
      expect(header).toHaveClass('cursor-pointer')
    })
  })
})
