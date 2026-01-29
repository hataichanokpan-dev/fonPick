/**
 * FundamentalAnalysis Component Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Component renders correctly
 * - Financial Health section display
 * - Valuation Metrics section display
 * - Grid layout for metrics
 * - Color coding for good/bad values
 * - Comparison with sector averages
 * - Collapsible sections
 * - Thai labels with English subtitles
 * - Responsive layout
 * - Empty states
 * - Edge cases (missing data, zero values, negative values)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FundamentalAnalysis } from './FundamentalAnalysis'
import type { StockStatisticsData } from '@/types/stock-api'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('FundamentalAnalysis Component', () => {
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
    it('should render fundamental analysis component', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const component = screen.getByTestId('fundamental-analysis')
      expect(component).toBeInTheDocument()
    })

    it('should display Financial Health section', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const section = screen.getByTestId('financial-health-section')
      expect(section).toBeInTheDocument()
    })

    it('should display Valuation Metrics section', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const section = screen.getByTestId('valuation-metrics-section')
      expect(section).toBeInTheDocument()
    })
  })

  describe('Financial Health Metrics', () => {
    it('should display revenue', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const revenue = screen.getByTestId('financial-revenue')
      expect(revenue).toBeInTheDocument()
      expect(revenue).toHaveTextContent('1.50T') // Formatted
    })

    it('should display net profit', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const netProfit = screen.getByTestId('financial-net-profit')
      expect(netProfit).toBeInTheDocument()
      expect(netProfit).toHaveTextContent('85.00B') // Formatted
    })

    it('should display EPS', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const eps = screen.getByTestId('financial-eps')
      expect(eps).toBeInTheDocument()
      expect(eps).toHaveTextContent('12.50')
    })

    it('should display ROE', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const roe = screen.getByTestId('financial-roe')
      expect(roe).toBeInTheDocument()
      expect(roe).toHaveTextContent('15.50%')
    })

    it('should display ROA', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const roa = screen.getByTestId('financial-roa')
      expect(roa).toBeInTheDocument()
      expect(roa).toHaveTextContent('3.40%')
    })

    it('should display debt-to-equity ratio', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const debtToEquity = screen.getByTestId('financial-debt-to-equity')
      expect(debtToEquity).toBeInTheDocument()
      expect(debtToEquity).toHaveTextContent('0.80')
    })

    it('should display current ratio', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const currentRatio = screen.getByTestId('financial-current-ratio')
      expect(currentRatio).toBeInTheDocument()
      expect(currentRatio).toHaveTextContent('1.50')
    })

    it('should display quick ratio', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const quickRatio = screen.getByTestId('financial-quick-ratio')
      expect(quickRatio).toBeInTheDocument()
      expect(quickRatio).toHaveTextContent('1.20')
    })

    it('should display total assets', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const totalAssets = screen.getByTestId('financial-total-assets')
      expect(totalAssets).toBeInTheDocument()
      expect(totalAssets).toHaveTextContent('2.50T')
    })

    it('should display total equity', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const totalEquity = screen.getByTestId('financial-total-equity')
      expect(totalEquity).toBeInTheDocument()
      expect(totalEquity).toHaveTextContent('800.00B')
    })
  })

  describe('Valuation Metrics', () => {
    it('should display P/E ratio', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const pe = screen.getByTestId('valuation-pe')
      expect(pe).toBeInTheDocument()
      expect(pe).toHaveTextContent('12.50')
    })

    it('should display P/BV ratio', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const pbv = screen.getByTestId('valuation-pbv')
      expect(pbv).toBeInTheDocument()
      expect(pbv).toHaveTextContent('1.20')
    })

    it('should display EV/EBITDA', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const evEbitda = screen.getByTestId('valuation-ev-ebitda')
      expect(evEbitda).toBeInTheDocument()
      expect(evEbitda).toHaveTextContent('8.50')
    })

    it('should display Price-to-Sales', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const priceToSales = screen.getByTestId('valuation-price-to-sales')
      expect(priceToSales).toBeInTheDocument()
      expect(priceToSales).toHaveTextContent('0.80')
    })

    it('should display PEG Ratio', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const pegRatio = screen.getByTestId('valuation-peg-ratio')
      expect(pegRatio).toBeInTheDocument()
      expect(pegRatio).toHaveTextContent('1.20')
    })

    it('should display Dividend Yield', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const dividendYield = screen.getByTestId('valuation-dividend-yield')
      expect(dividendYield).toBeInTheDocument()
      expect(dividendYield).toHaveTextContent('3.50%')
    })

    it('should display Payout Ratio', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const payoutRatio = screen.getByTestId('valuation-payout-ratio')
      expect(payoutRatio).toBeInTheDocument()
      expect(payoutRatio).toHaveTextContent('45.00%')
    })

    it('should display EV', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const ev = screen.getByTestId('valuation-ev')
      expect(ev).toBeInTheDocument()
      expect(ev).toHaveTextContent('1.20T')
    })
  })

  describe('Color Coding', () => {
    it('should show green color for good ROE (>15%)', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const roe = screen.getByTestId('financial-roe')
      expect(roe).toHaveClass('text-green-500')
    })

    it('should show red color for poor ROE (<5%)', () => {
      const poorData: StockStatisticsData = {
        ...mockStockData,
        financial: {
          ...mockStockData.financial,
          roe: 3.5,
        },
      }

      render(<FundamentalAnalysis data={poorData} />)

      const roe = screen.getByTestId('financial-roe')
      expect(roe).toHaveClass('text-red-500')
    })

    it('should show green color for good current ratio (>1.5)', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const currentRatio = screen.getByTestId('financial-current-ratio')
      expect(currentRatio).toHaveClass('text-green-500')
    })

    it('should show red color for low current ratio (<1)', () => {
      const poorData: StockStatisticsData = {
        ...mockStockData,
        financial: {
          ...mockStockData.financial,
          currentRatio: 0.8,
        },
      }

      render(<FundamentalAnalysis data={poorData} />)

      const currentRatio = screen.getByTestId('financial-current-ratio')
      expect(currentRatio).toHaveClass('text-red-500')
    })

    it('should show green color for low debt-to-equity (<1)', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const debtToEquity = screen.getByTestId('financial-debt-to-equity')
      expect(debtToEquity).toHaveClass('text-green-500')
    })

    it('should show red color for high debt-to-equity (>2)', () => {
      const poorData: StockStatisticsData = {
        ...mockStockData,
        financial: {
          ...mockStockData.financial,
          debtToEquity: 2.5,
        },
      }

      render(<FundamentalAnalysis data={poorData} />)

      const debtToEquity = screen.getByTestId('financial-debt-to-equity')
      expect(debtToEquity).toHaveClass('text-red-500')
    })
  })

  describe('Thai Labels', () => {
    it('should display Thai label for Financial Health', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const thaiLabel = screen.getByTestId('financial-health-thai-label')
      expect(thaiLabel).toBeInTheDocument()
      expect(thaiLabel).toHaveTextContent('สุขภาพการเงิน')
    })

    it('should display English subtitle for Financial Health', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const englishLabel = screen.getByTestId('financial-health-english-label')
      expect(englishLabel).toBeInTheDocument()
      expect(englishLabel).toHaveTextContent('Financial Health')
    })

    it('should display Thai label for Valuation Metrics', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const thaiLabel = screen.getByTestId('valuation-metrics-thai-label')
      expect(thaiLabel).toBeInTheDocument()
      expect(thaiLabel).toHaveTextContent('มูลค่าการประเมิน')
    })

    it('should display English subtitle for Valuation Metrics', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const englishLabel = screen.getByTestId('valuation-metrics-english-label')
      expect(englishLabel).toBeInTheDocument()
      expect(englishLabel).toHaveTextContent('Valuation Metrics')
    })
  })

  describe('Collapsible Sections', () => {
    it('should be expanded by default', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const financialSection = screen.getByTestId('financial-health-content')
      expect(financialSection).toBeVisible()
    })

    it('should toggle Financial Health section when clicked', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const header = screen.getByTestId('financial-health-header')
      const content = screen.getByTestId('financial-health-content')

      fireEvent.click(header)
      expect(content).not.toBeVisible()

      fireEvent.click(header)
      expect(content).toBeVisible()
    })

    it('should toggle Valuation Metrics section when clicked', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const header = screen.getByTestId('valuation-metrics-header')
      const content = screen.getByTestId('valuation-metrics-content')

      fireEvent.click(header)
      expect(content).not.toBeVisible()

      fireEvent.click(header)
      expect(content).toBeVisible()
    })
  })

  describe('Sector Comparison', () => {
    it('should display comparison with sector average when provided', () => {
      render(
        <FundamentalAnalysis
          data={mockStockData}
          sectorAverages={{ pe: 15.0, pbv: 1.5 }}
        />
      )

      const comparison = screen.getByTestId('pe-sector-comparison')
      expect(comparison).toBeInTheDocument()
      expect(comparison).toHaveTextContent('15.00')
    })

    it('should highlight when stock is better than sector average', () => {
      render(
        <FundamentalAnalysis
          data={mockStockData}
          sectorAverages={{ pe: 15.0, pbv: 1.5 }}
        />
      )

      const peValue = screen.getByTestId('valuation-pe')
      expect(peValue).toHaveClass('text-green-500') // Lower PE is better
    })

    it('should not display comparison when sector averages not provided', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const comparison = screen.queryByTestId('pe-sector-comparison')
      expect(comparison).not.toBeInTheDocument()
    })
  })

  describe('Responsive Layout', () => {
    it('should use grid layout for metrics', () => {
      const { container } = render(<FundamentalAnalysis data={mockStockData} />)

      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('should have responsive grid columns', () => {
      const { container } = render(<FundamentalAnalysis data={mockStockData} />)

      const grid = container.querySelector('.grid-cols-1')
      expect(grid).toBeInTheDocument() // Mobile
    })
  })

  describe('Empty States', () => {
    it('should handle missing financial data gracefully', () => {
      const emptyData: StockStatisticsData = {
        ...mockStockData,
        financial: {
          revenue: 0,
          netProfit: 0,
          totalAssets: 0,
          totalEquity: 0,
          eps: 0,
          roe: 0,
          roa: 0,
          debtToEquity: 0,
          currentRatio: 0,
          quickRatio: 0,
        },
      }

      render(<FundamentalAnalysis data={emptyData} />)

      const component = screen.getByTestId('fundamental-analysis')
      expect(component).toBeInTheDocument()
    })

    it('should display N/A for missing values', () => {
      const partialData: StockStatisticsData = {
        ...mockStockData,
        financial: {
          ...mockStockData.financial,
          eps: 0,
        },
      }

      render(<FundamentalAnalysis data={partialData} />)

      const eps = screen.getByTestId('financial-eps')
      expect(eps).toHaveTextContent('N/A')
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative net profit', () => {
      const negativeProfitData: StockStatisticsData = {
        ...mockStockData,
        financial: {
          ...mockStockData.financial,
          netProfit: -5000000000,
        },
      }

      render(<FundamentalAnalysis data={negativeProfitData} />)

      const netProfit = screen.getByTestId('financial-net-profit')
      expect(netProfit).toBeInTheDocument()
      expect(netProfit).toHaveClass('text-red-500')
    })

    it('should handle zero values', () => {
      const zeroData: StockStatisticsData = {
        ...mockStockData,
        financial: {
          ...mockStockData.financial,
          revenue: 0,
        },
      }

      render(<FundamentalAnalysis data={zeroData} />)

      const revenue = screen.getByTestId('financial-revenue')
      expect(revenue).toBeInTheDocument()
    })

    it('should handle very large numbers', () => {
      const largeData: StockStatisticsData = {
        ...mockStockData,
        financial: {
          ...mockStockData.financial,
          revenue: 9999999999999,
        },
      }

      render(<FundamentalAnalysis data={largeData} />)

      const revenue = screen.getByTestId('financial-revenue')
      expect(revenue).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for sections', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const financialHeader = screen.getByTestId('financial-health-header')
      expect(financialHeader).toHaveAttribute('aria-expanded')
    })

    it('should be keyboard navigable', () => {
      render(<FundamentalAnalysis data={mockStockData} />)

      const header = screen.getByTestId('financial-health-header')
      expect(header).toHaveClass('cursor-pointer')
    })
  })
})
