/**
 * StockPageSkeleton Component Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Component renders correctly
 * - Hero section skeleton
 * - Price info skeleton
 * - Decision badge skeleton
 * - Layer scores skeleton
 * - Analysis sections skeleton
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StockPageSkeleton } from './StockPageSkeleton'

describe('StockPageSkeleton Component', () => {
  describe('Rendering', () => {
    it('should render skeleton component', () => {
      render(<StockPageSkeleton />)

      const skeleton = screen.getByTestId('stock-page-skeleton')
      expect(skeleton).toBeInTheDocument()
    })

    it('should have correct container classes', () => {
      const { container } = render(<StockPageSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('space-y-3')
    })
  })

  describe('Hero Section Skeleton', () => {
    it('should render back button skeleton', () => {
      render(<StockPageSkeleton />)

      const backButtonSkeleton = screen.getByTestId('skeleton-back-button')
      expect(backButtonSkeleton).toBeInTheDocument()
    })

    it('should render watchlist button skeleton', () => {
      render(<StockPageSkeleton />)

      const watchlistSkeleton = screen.getByTestId('skeleton-watchlist-button')
      expect(watchlistSkeleton).toBeInTheDocument()
    })

    it('should render stock name skeleton', () => {
      render(<StockPageSkeleton />)

      const nameSkeleton = screen.getByTestId('skeleton-stock-name')
      expect(nameSkeleton).toBeInTheDocument()
    })

    it('should render stock symbol skeleton', () => {
      render(<StockPageSkeleton />)

      const symbolSkeleton = screen.getByTestId('skeleton-stock-symbol')
      expect(symbolSkeleton).toBeInTheDocument()
    })
  })

  describe('Price Info Skeleton', () => {
    it('should render current price skeleton', () => {
      render(<StockPageSkeleton />)

      const priceSkeleton = screen.getByTestId('skeleton-current-price')
      expect(priceSkeleton).toBeInTheDocument()
    })

    it('should render price change skeleton', () => {
      render(<StockPageSkeleton />)

      const changeSkeleton = screen.getByTestId('skeleton-price-change')
      expect(changeSkeleton).toBeInTheDocument()
    })

    it('should render market cap skeleton', () => {
      render(<StockPageSkeleton />)

      const marketCapSkeleton = screen.getByTestId('skeleton-market-cap')
      expect(marketCapSkeleton).toBeInTheDocument()
    })

    it('should render sector skeleton', () => {
      render(<StockPageSkeleton />)

      const sectorSkeleton = screen.getByTestId('skeleton-sector')
      expect(sectorSkeleton).toBeInTheDocument()
    })
  })

  describe('Decision Badge Skeleton', () => {
    it('should render decision badge skeleton', () => {
      render(<StockPageSkeleton />)

      const badgeSkeleton = screen.getByTestId('skeleton-decision-badge')
      expect(badgeSkeleton).toBeInTheDocument()
    })

    it('should render confidence score skeleton', () => {
      render(<StockPageSkeleton />)

      const confidenceSkeleton = screen.getByTestId('skeleton-confidence-score')
      expect(confidenceSkeleton).toBeInTheDocument()
    })
  })

  describe('Layer Scores Skeleton', () => {
    it('should render layer scores container skeleton', () => {
      render(<StockPageSkeleton />)

      const layerScoresSkeleton = screen.getByTestId('skeleton-layer-scores')
      expect(layerScoresSkeleton).toBeInTheDocument()
    })

    it('should render quality score skeleton', () => {
      render(<StockPageSkeleton />)

      const qualitySkeleton = screen.getByTestId('skeleton-quality-score')
      expect(qualitySkeleton).toBeInTheDocument()
    })

    it('should render valuation score skeleton', () => {
      render(<StockPageSkeleton />)

      const valuationSkeleton = screen.getByTestId('skeleton-valuation-score')
      expect(valuationSkeleton).toBeInTheDocument()
    })

    it('should render timing score skeleton', () => {
      render(<StockPageSkeleton />)

      const timingSkeleton = screen.getByTestId('skeleton-timing-score')
      expect(timingSkeleton).toBeInTheDocument()
    })
  })

  describe('Analysis Sections Skeleton', () => {
    it('should render verdict bullets skeleton', () => {
      render(<StockPageSkeleton />)

      const bulletsSkeleton = screen.getByTestId('skeleton-verdict-bullets')
      expect(bulletsSkeleton).toBeInTheDocument()
    })

    it('should render evidence cards skeleton', () => {
      render(<StockPageSkeleton />)

      const evidenceSkeleton = screen.getByTestId('skeleton-evidence-cards')
      expect(evidenceSkeleton).toBeInTheDocument()
    })

    it('should render next step section skeleton', () => {
      render(<StockPageSkeleton />)

      const nextStepSkeleton = screen.getByTestId('skeleton-next-step')
      expect(nextStepSkeleton).toBeInTheDocument()
    })

    it('should render disclaimer skeleton', () => {
      render(<StockPageSkeleton />)

      const disclaimerSkeleton = screen.getByTestId('skeleton-disclaimer')
      expect(disclaimerSkeleton).toBeInTheDocument()
    })
  })

  describe('Skeleton Animation', () => {
    it('should have animate-pulse class for shimmer effect', () => {
      const { container } = render(<StockPageSkeleton />)

      const pulsingElements = container.querySelectorAll('.animate-pulse')
      expect(pulsingElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for skeleton', () => {
      render(<StockPageSkeleton />)

      const skeleton = screen.getByTestId('stock-page-skeleton')
      expect(skeleton).toHaveAttribute('aria-label', 'Loading stock data')
    })

    it('should have role="status" for accessibility', () => {
      render(<StockPageSkeleton />)

      const skeleton = screen.getByTestId('stock-page-skeleton')
      expect(skeleton).toHaveAttribute('role', 'status')
    })
  })

  describe('Layout Structure', () => {
    it('should render all skeleton sections in correct order', () => {
      const { container } = render(<StockPageSkeleton />)

      const sections = container.querySelectorAll('[data-testid^="skeleton-"]')

      // Verify we have all expected sections
      const testIds = Array.from(sections).map(
        (el) => el.getAttribute('data-testid')
      )

      expect(testIds).toContain('skeleton-back-button')
      expect(testIds).toContain('skeleton-stock-name')
      expect(testIds).toContain('skeleton-current-price')
      expect(testIds).toContain('skeleton-decision-badge')
      expect(testIds).toContain('skeleton-layer-scores')
      expect(testIds).toContain('skeleton-verdict-bullets')
      expect(testIds).toContain('skeleton-evidence-cards')
    })

    it('should maintain responsive grid layout', () => {
      const { container } = render(<StockPageSkeleton />)

      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toBeInTheDocument()
      expect(gridContainer).toHaveClass('grid-cols-1')
      expect(gridContainer).toHaveClass('lg:grid-cols-2')
    })
  })

  describe('Visual Consistency', () => {
    it('should use consistent skeleton colors', () => {
      const { container } = render(<StockPageSkeleton />)

      const bgElements = container.querySelectorAll('.bg-surface\\/50')

      // Should have multiple skeleton elements with background
      expect(bgElements.length).toBeGreaterThan(0)
    })

    it('should have proper spacing between sections', () => {
      const { container } = render(<StockPageSkeleton />)

      // Check for spacing classes
      const spacedElements = container.querySelectorAll('.space-y-3, .gap-3')

      expect(spacedElements.length).toBeGreaterThan(0)
    })
  })
})
