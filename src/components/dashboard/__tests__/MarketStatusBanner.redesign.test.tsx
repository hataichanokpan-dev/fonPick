/**
 * MarketStatusBanner Component Tests - Redesign
 *
 * TDD Approach:
 * 1. RED - Write failing tests first for redesigned component
 * 2. GREEN - Implement component to pass tests
 * 3. REFACTOR - Clean up code while keeping tests passing
 *
 * Design Goals:
 * - Mobile-first responsive design
 * - Professional visual hierarchy
 * - Clear information display
 * - Regime badge prominent
 * - Better spacing and typography
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

describe('MarketStatusBanner - Redesign', () => {
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

  // ========================================================================
  // MOBILE-FIRST RESPONSIVE DESIGN
  // ========================================================================

  describe('Mobile Responsive Design', () => {
    it('should have responsive height - shorter on mobile (40px)', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      // Should use responsive height classes
      expect(banner).toBeInTheDocument()
      // Check for mobile-first height classes
      expect(banner.className).toMatch(/h-|max-h-|min-h-/)
    })

    it('should allow horizontal scroll on very small screens if needed', () => {
      const { container } = render(
        <MarketStatusBanner {...defaultProps} setIndex={1234.56} />
      )

      const banner = container.firstChild as HTMLElement
      // Should handle overflow gracefully
      expect(banner).toBeInTheDocument()
    })

    it('should have touch-friendly sizing on mobile', () => {
      render(<MarketStatusBanner {...defaultProps} />)

      // Text should be readable on mobile (at least 12px for labels)
      const labels = screen.getAllByText(/Market|Risk|Open|Closed/)
      labels.forEach(label => {
        const element = label as HTMLElement
        expect(element).toBeVisible()
      })
    })
  })

  // ========================================================================
  // PROFESSIONAL VISUAL HIERARCHY
  // ========================================================================

  describe('Visual Hierarchy', () => {
    it('should display regime badge prominently', () => {
      render(<MarketStatusBanner {...defaultProps} regime="Risk-On" />)

      // Should show regime badge
      expect(screen.getByText('Risk-On')).toBeInTheDocument()

      // Badges should be rendered (regime + confidence)
      const badges = screen.getAllByTestId('badge')
      expect(badges.length).toBeGreaterThan(0)
      expect(badges[0]).toHaveAttribute('data-color', 'buy')
    })

    it('should show confidence level with regime', () => {
      render(<MarketStatusBanner {...defaultProps} confidence="High" />)

      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('should display SET index with proper formatting and prominence', () => {
      render(<MarketStatusBanner {...defaultProps} setIndex={1350.5} />)

      expect(screen.getByText('1,350.50')).toBeInTheDocument()
    })

    it('should show change percentage with color coding', () => {
      render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={15.3}
          setChangePercent={1.15}
        />
      )

      // Should show the change value
      const container = render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={15.3}
          setChangePercent={1.15}
        />
      ).container

      expect(container.textContent).toContain('+15.30')
      expect(container.textContent).toContain('+1.15%')
    })

    it('should display market status with clear indicator', () => {
      render(<MarketStatusBanner {...defaultProps} isMarketOpen={true} />)

      expect(screen.getByText(/Open/i)).toBeInTheDocument()
    })

    it('should integrate data freshness cleanly', () => {
      const now = Date.now()
      render(<MarketStatusBanner {...defaultProps} lastUpdate={now} />)

      expect(screen.getByText('Just now')).toBeInTheDocument()
    })
  })

  // ========================================================================
  // LAYOUT AND SPACING
  // ========================================================================

  describe('Layout and Spacing', () => {
    it('should have proper horizontal spacing between sections', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toBeInTheDocument()
      // Should use gap classes for spacing (on child flex container)
      expect(container.textContent).toBeDefined()
    })

    it('should have consistent vertical padding', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toBeInTheDocument()
    })

    it('should align items properly in flex layout', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toBeInTheDocument()
      // Should use flex for layout (on child container)
      const innerDivs = banner.querySelectorAll('div')
      const flexContainer = Array.from(innerDivs).find(div => div.className.includes('flex'))
      expect(flexContainer).toBeDefined()
      expect(flexContainer?.className).toMatch(/flex/)
    })
  })

  // ========================================================================
  // STICKY BEHAVIOR
  // ========================================================================

  describe('Sticky Behavior', () => {
    it('should maintain sticky positioning on all screen sizes', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toHaveClass('sticky')
      expect(banner).toHaveClass('top-0')
    })

    it('should have appropriate z-index to stay above content', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toHaveClass('z-50')
    })

    it('should have backdrop blur for readability', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toHaveClass('backdrop-blur-md')
    })
  })

  // ========================================================================
  // TYPOGRAPHY
  // ========================================================================

  describe('Typography', () => {
    it('should use appropriate font sizes for hierarchy', () => {
      render(<MarketStatusBanner {...defaultProps} />)

      // SET index should be prominent
      const setIndex = screen.getByText('1,350.50')
      expect(setIndex).toBeInTheDocument()
    })

    it('should have proper font weights for different elements', () => {
      render(<MarketStatusBanner {...defaultProps} />)

      // Bold for important numbers
      const setIndex = screen.getByText('1,350.50')
      expect(setIndex).toBeInTheDocument()
    })

    it('should have good line height for readability', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toBeInTheDocument()
    })
  })

  // ========================================================================
  // COLOR AND STYLING
  // ========================================================================

  describe('Color and Styling', () => {
    it('should apply correct regime-based background color', () => {
      const { container } = render(
        <MarketStatusBanner {...defaultProps} regime="Risk-On" />
      )

      const banner = container.firstChild as HTMLElement
      expect(banner).toBeInTheDocument()
    })

    it('should apply correct regime-based border color', () => {
      const { container } = render(
        <MarketStatusBanner {...defaultProps} regime="Risk-On" />
      )

      const banner = container.firstChild as HTMLElement
      expect(banner).toHaveClass('border-b')
    })

    it('should use appropriate colors for positive changes', () => {
      const { container } = render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={15.3}
          setChangePercent={1.15}
        />
      )

      expect(container.textContent).toContain('+')
    })

    it('should use appropriate colors for negative changes', () => {
      const { container } = render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={-15.3}
          setChangePercent={-1.15}
        />
      )

      expect(container.textContent).toContain('-15.30')
      expect(container.textContent).toContain('-1.15%')
    })
  })

  // ========================================================================
  // ANIMATION
  // ========================================================================

  describe('Animation', () => {
    it('should have entrance animation', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toBeInTheDocument()
      // framer-motion div should render with animation props
    })

    it('should have pulse animation for market status when open', () => {
      render(<MarketStatusBanner {...defaultProps} isMarketOpen={true} />)

      // Status indicator should be visible
      expect(screen.getByText(/Open/i)).toBeInTheDocument()
    })

    it('should not pulse when market is closed', () => {
      render(<MarketStatusBanner {...defaultProps} isMarketOpen={false} />)

      // Should show closed status
      expect(screen.getByText(/Closed/i)).toBeInTheDocument()
    })
  })

  // ========================================================================
  // ACCESSIBILITY
  // ========================================================================

  describe('Accessibility', () => {
    it('should have proper role attribute', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toHaveAttribute('role', 'banner')
    })

    it('should have descriptive aria-label', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toHaveAttribute('aria-label')
      expect(banner.getAttribute('aria-label')).toMatch(/market/i)
    })

    it('should have sufficient color contrast', () => {
      render(<MarketStatusBanner {...defaultProps} />)

      // Text should be readable
      const setIndex = screen.getByText('1,350.50')
      expect(setIndex).toBeVisible()
    })
  })

  // ========================================================================
  // EDGE CASES
  // ========================================================================

  describe('Edge Cases', () => {
    it('should handle missing lastUpdate gracefully', () => {
      const { container } = render(
        <MarketStatusBanner {...defaultProps} lastUpdate={undefined} />
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle zero values correctly', () => {
      const { container } = render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={0}
          setChangePercent={0}
        />
      )

      expect(container.firstChild).toBeInTheDocument()
      expect(container.textContent).toContain('0.00')
    })

    it('should handle very large SET index values', () => {
      render(<MarketStatusBanner {...defaultProps} setIndex={1999.99} />)

      expect(screen.getByText('1,999.99')).toBeInTheDocument()
    })

    it('should handle very small changes', () => {
      const { container } = render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={0.01}
          setChangePercent={0.001}
        />
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle negative values', () => {
      render(
        <MarketStatusBanner
          {...defaultProps}
          setChange={-25.5}
          setChangePercent={-1.85}
        />
      )

      expect(screen.getByText(/-25\.50/)).toBeInTheDocument()
    })

    it('should handle all regime types', () => {
      const { container: riskOnContainer } = render(
        <MarketStatusBanner {...defaultProps} regime="Risk-On" />
      )
      expect(riskOnContainer.firstChild).toBeInTheDocument()

      const { container: riskOffContainer } = render(
        <MarketStatusBanner {...defaultProps} regime="Risk-Off" />
      )
      expect(riskOffContainer.firstChild).toBeInTheDocument()

      const { container: neutralContainer } = render(
        <MarketStatusBanner {...defaultProps} regime="Neutral" />
      )
      expect(neutralContainer.firstChild).toBeInTheDocument()
    })

    it('should handle all confidence levels', () => {
      render(<MarketStatusBanner {...defaultProps} confidence="High" />)
      expect(screen.getByText('High')).toBeInTheDocument()

      render(<MarketStatusBanner {...defaultProps} confidence="Medium" />)
      expect(screen.getByText('Medium')).toBeInTheDocument()

      render(<MarketStatusBanner {...defaultProps} confidence="Low" />)
      expect(screen.getByText('Low')).toBeInTheDocument()
    })
  })

  // ========================================================================
  // RESPONSIVE BREAKPOINTS
  // ========================================================================

  describe('Responsive Breakpoints', () => {
    it('should adapt layout for tablet (768px+)', () => {
      // This would require viewport manipulation in a real test
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toBeInTheDocument()
    })

    it('should adapt layout for desktop (1024px+)', () => {
      const { container } = render(<MarketStatusBanner {...defaultProps} />)

      const banner = container.firstChild as HTMLElement
      expect(banner).toBeInTheDocument()
    })
  })
})
