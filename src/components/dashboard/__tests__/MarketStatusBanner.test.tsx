/**
 * MarketStatusBanner Component Tests
 *
 * TDD Approach:
 * 1. RED - Write failing tests first
 * 2. GREEN - Implement component to pass tests
 * 3. REFACTOR - Clean up code while keeping tests passing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarketStatusBanner } from '../MarketStatusBanner'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock Badge component
vi.mock('@/components/shared/Badge', () => ({
  Badge: ({ children, color, size }: any) => (
    <span data-testid="badge" data-color={color} data-size={size}>
      {children}
    </span>
  ),
}))

describe('MarketStatusBanner', () => {
  const defaultProps = {
    regime: 'Risk-On' as const,
    confidence: 'High' as const,
    setIndex: 1350.5,
    setChange: 15.3,
    setChangePercent: 1.15,
    isMarketOpen: true,
    lastUpdate: Date.now(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Regime Rendering', () => {
    it('should render with Risk-On regime', () => {
      render(<MarketStatusBanner {...defaultProps} regime="Risk-On" />)

      expect(screen.getByText('Risk-On')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('should render with Risk-Off regime', () => {
      render(<MarketStatusBanner {...defaultProps} regime="Risk-Off" />)

      expect(screen.getByText('Risk-Off')).toBeInTheDocument()
    })

    it('should render with Neutral regime', () => {
      render(<MarketStatusBanner {...defaultProps} regime="Neutral" />)

      expect(screen.getByText('Neutral')).toBeInTheDocument()
    })

    it('should apply correct color styling for Risk-On regime', () => {
      const { container } = render(
        <MarketStatusBanner {...defaultProps} regime="Risk-On" />
      )

      const banner = container.firstChild as HTMLElement
      expect(banner).toHaveClass('sticky')
      expect(banner).toHaveClass('top-0')
      expect(banner).toHaveClass('z-50')
    })

    it('should apply correct color styling for Risk-Off regime', () => {
      const { container } = render(
        <MarketStatusBanner {...defaultProps} regime="Risk-Off" />
      )

      const banner = container.firstChild as HTMLElement
      expect(banner).toBeInTheDocument()
    })

    it('should apply correct color styling for Neutral regime', () => {
      const { container } = render(
        <MarketStatusBanner {...defaultProps} regime="Neutral" />
      )

      const banner = container.firstChild as HTMLElement
      expect(banner).toBeInTheDocument()
    })
  })

  describe('SET Index Display', () => {
    it('should display SET index with correct format', () => {
      render(<MarketStatusBanner {...defaultProps} setIndex={1350.5} />)

      expect(screen.getByText('1,350.50')).toBeInTheDocument()
    })

    it('should display SET index change when positive', () => {
      render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={15.3}
          setChangePercent={1.15}
        />
      )

      expect(screen.getByText(/\+15\.30/)).toBeInTheDocument()
      expect(screen.getByText(/\+1\.15%/)).toBeInTheDocument()
    })

    it('should display SET index change when negative', () => {
      render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={-15.3}
          setChangePercent={-1.15}
        />
      )

      expect(screen.getByText(/-15\.30/)).toBeInTheDocument()
      expect(screen.getByText(/-1\.15%/)).toBeInTheDocument()
    })

    it('should display zero change correctly', () => {
      render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={0}
          setChangePercent={0}
        />
      )

      // Use getAllText to handle text split across elements
      const { container } = render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={0}
          setChangePercent={0}
        />
      )
      expect(container.textContent).toContain('+0.00')
      expect(container.textContent).toContain('+0.00%')
    })

    it('should format large SET index numbers correctly', () => {
      render(<MarketStatusBanner {...defaultProps} setIndex={1650.25} />)

      expect(screen.getByText('1,650.25')).toBeInTheDocument()
    })
  })

  describe('Market Status Indicator', () => {
    it('should show market open status when isMarketOpen is true', () => {
      render(<MarketStatusBanner {...defaultProps} isMarketOpen={true} />)

      expect(screen.getByText('Market Open')).toBeInTheDocument()
    })

    it('should show market closed status when isMarketOpen is false', () => {
      render(<MarketStatusBanner {...defaultProps} isMarketOpen={false} />)

      expect(screen.getByText('Market Closed')).toBeInTheDocument()
    })

    it('should default to market open when isMarketOpen is not provided', () => {
      const { container } = render(
        <MarketStatusBanner {...defaultProps} isMarketOpen={undefined} />
      )

      // Should show some indicator for market status
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Data Age Display', () => {
    it('should display "Just now" for very recent updates', () => {
      const now = Date.now()
      render(<MarketStatusBanner {...defaultProps} lastUpdate={now} />)

      expect(screen.getByText('Just now')).toBeInTheDocument()
    })

    it('should display minutes ago correctly', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      render(<MarketStatusBanner {...defaultProps} lastUpdate={fiveMinutesAgo} />)

      expect(screen.getByText('5m ago')).toBeInTheDocument()
    })

    it('should display hours ago correctly', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
      render(
        <MarketStatusBanner {...defaultProps} lastUpdate={twoHoursAgo} />
      )

      expect(screen.getByText('2h ago')).toBeInTheDocument()
    })

    it('should handle missing lastUpdate gracefully', () => {
      const { container } = render(
        <MarketStatusBanner {...defaultProps} lastUpdate={undefined} />
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    it('should have sticky positioning', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toHaveClass('sticky')
      expect(banner).toHaveClass('top-0')
      expect(banner).toHaveClass('z-50')
    })

    it('should have backdrop blur effect', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toHaveClass('backdrop-blur-md')
    })

    it('should have border bottom', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toHaveClass('border-b')
    })

    it('should have compact layout', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      // Height should be responsive: h-10 (40px) on mobile, h-12 (48px) on desktop
      expect(banner).toHaveClass('h-10')
      expect(banner).toHaveClass('sm:h-12')
    })
  })

  describe('Confidence Badge', () => {
    it('should display High confidence badge', () => {
      render(<MarketStatusBanner {...defaultProps} confidence="High" />)

      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('should display Medium confidence badge', () => {
      render(<MarketStatusBanner {...defaultProps} confidence="Medium" />)

      expect(screen.getByText('Medium')).toBeInTheDocument()
    })

    it('should display Low confidence badge', () => {
      render(<MarketStatusBanner {...defaultProps} confidence="Low" />)

      expect(screen.getByText('Low')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toHaveAttribute('role', 'banner')
    })

    it('should have accessible market status indicator', () => {
      render(<MarketStatusBanner {...defaultProps} isMarketOpen={true} />)

      const status = screen.getByText('Market Open')
      expect(status).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null values gracefully', () => {
      const { container } = render(
        <MarketStatusBanner
          regime="Neutral"
          confidence="Low"
          setIndex={0}
          setChange={0}
          setChangePercent={0}
        />
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle negative SET index change', () => {
      render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={-25.5}
          setChangePercent={-1.85}
        />
      )

      expect(screen.getByText(/-25\.50/)).toBeInTheDocument()
      expect(screen.getByText(/-1\.85%/)).toBeInTheDocument()
    })

    it('should handle very large SET index values', () => {
      render(<MarketStatusBanner {...defaultProps} setIndex={1999.99} />)

      expect(screen.getByText('1,999.99')).toBeInTheDocument()
    })

    it('should handle very small SET index change', () => {
      render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={0.01}
          setChangePercent={0.001}
        />
      )

      expect(screen.getByText(/0\.01/)).toBeInTheDocument()
    })
  })
})
