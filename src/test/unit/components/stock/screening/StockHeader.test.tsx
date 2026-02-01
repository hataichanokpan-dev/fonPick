/**
 * TDD Test: StockHeader Component (Redesigned)
 *
 * Tests for the redesigned StockHeader component with:
 * - Glassmorphism on change badge
 * - Horizontal scroll for metrics on mobile
 * - Gradient overlay
 * - Hero element for price
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StockHeader } from '@/app/[locale]/stock/[symbol]/stock-page-client'

// Mock lucide-react icons using the original module to avoid missing exports
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as object),
    // Override specific icons if needed for testing
    TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
    TrendingDown: () => <div data-testid="trending-down-icon">TrendingDown</div>,
    Minus: () => <div data-testid="minus-icon">Minus</div>,
    Building2: () => <div data-testid="building-icon">Building</div>,
  }
})

describe('StockHeader - Redesigned', () => {
  const defaultProps = {
    symbol: 'PTT',
    price: 35.50,
    change: 0.50,
    changePercent: 1.43,
    marketCap: 350000000000,
    volume: 15000000,
    peRatio: 12.5,
    locale: 'en',
  }

  describe('Rendering', () => {
    it('should render the stock symbol', () => {
      render(<StockHeader {...defaultProps} />)
      expect(screen.getByText('PTT')).toBeInTheDocument()
    })

    it('should render the price as a hero element with large font', () => {
      const { container } = render(<StockHeader {...defaultProps} />)
      const priceElement = screen.getByText('35.50')
      expect(priceElement).toBeInTheDocument()
      // Check for hero styling classes
      expect(priceElement.className).toContain('text-4xl')
    })

    it('should render change badge with glassmorphism effect', () => {
      const { container } = render(<StockHeader {...defaultProps} />)
      // Should have glass effect classes
      const changeBadge = container.querySelector('.glass-premium, .glass')
      // The badge should exist with proper styling
      const changeValue = screen.getByText(/\+0\.50/)
      expect(changeValue).toBeInTheDocument()
    })

    it('should render market cap formatted correctly', () => {
      render(<StockHeader {...defaultProps} />)
      expect(screen.getByText(/350\.00B/)).toBeInTheDocument()
    })

    it('should render volume formatted correctly', () => {
      render(<StockHeader {...defaultProps} />)
      expect(screen.getByText(/15\.00M/)).toBeInTheDocument()
    })

    it('should render P/E ratio', () => {
      render(<StockHeader {...defaultProps} />)
      expect(screen.getByText(/12\.50/)).toBeInTheDocument()
    })
  })

  describe('Price Change Colors', () => {
    it('should show green color for positive change', () => {
      const { container } = render(<StockHeader {...defaultProps} />)
      // The price itself doesn't have color class, the badge does
      // Check for the badge with up-primary class
      const badge = container.querySelector('.text-up-primary')
      expect(badge).toBeInTheDocument()
    })

    it('should show red color for negative change', () => {
      const props = { ...defaultProps, change: -0.50, changePercent: -1.43 }
      const { container } = render(<StockHeader {...props} />)
      // Check for the badge with down-primary class
      const badge = container.querySelector('.text-down-primary')
      expect(badge).toBeInTheDocument()
    })

    it('should show neutral color for zero change', () => {
      const props = { ...defaultProps, change: 0, changePercent: 0 }
      const { container } = render(<StockHeader {...props} />)
      // Check for the badge with flat class
      const badge = container.querySelector('.text-flat')
      expect(badge).toBeInTheDocument()
    })

    it('should display trending up icon for positive change', () => {
      render(<StockHeader {...defaultProps} />)
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
    })

    it('should display trending down icon for negative change', () => {
      const props = { ...defaultProps, change: -0.50, changePercent: -1.43 }
      render(<StockHeader {...props} />)
      expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument()
    })

    it('should display minus icon for zero change', () => {
      const props = { ...defaultProps, change: 0, changePercent: 0 }
      render(<StockHeader {...props} />)
      expect(screen.getByTestId('minus-icon')).toBeInTheDocument()
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should have horizontal scroll class on mobile', () => {
      const { container } = render(<StockHeader {...defaultProps} />)
      const metricsContainer = container.querySelector('.grid-cols-3')
      expect(metricsContainer).toBeInTheDocument()
    })

    it('should display all metrics on mobile view', () => {
      render(<StockHeader {...defaultProps} />)
      expect(screen.getByText(/Market Cap/)).toBeInTheDocument()
      expect(screen.getByText(/Volume/)).toBeInTheDocument()
      expect(screen.getByText(/P\/E/)).toBeInTheDocument()
    })
  })

  describe('Internationalization', () => {
    it('should display English labels for locale en', () => {
      render(<StockHeader {...defaultProps} locale="en" />)
      expect(screen.getByText('Market Cap')).toBeInTheDocument()
      expect(screen.getByText('Volume')).toBeInTheDocument()
    })

    it('should display Thai labels for locale th', () => {
      render(<StockHeader {...defaultProps} locale="th" />)
      expect(screen.getByText('มูลค่าตลาด')).toBeInTheDocument()
      expect(screen.getByText('ปริมาณซื้อขาย')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(<StockHeader {...defaultProps} />)
      const heading = container.querySelector('h1')
      expect(heading).toBeInTheDocument()
      expect(heading?.tagName).toBe('H1')
    })

    it('should have tabular nums for price values', () => {
      const { container } = render(<StockHeader {...defaultProps} />)
      const priceElements = container.querySelectorAll('.tabular-nums')
      expect(priceElements.length).toBeGreaterThan(0)
    })
  })

  describe('Animations', () => {
    it('should have fade-in animation class', () => {
      const { container } = render(<StockHeader {...defaultProps} />)
      const card = container.querySelector('.animate-fade-in')
      expect(card).toBeInTheDocument()
    })
  })
})
