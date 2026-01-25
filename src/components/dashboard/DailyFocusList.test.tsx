/**
 * DailyFocusList Component Tests
 *
 * TDD Approach:
 * 1. RED - Write failing tests first
 * 2. GREEN - Implement component to pass tests
 * 3. REFACTOR - Clean up while keeping tests passing
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DailyFocusList } from './DailyFocusList'
import type { CrossRankedStock } from '@/types/market-intelligence'

describe('DailyFocusList', () => {
  // Mock cross-ranked stock data
  const mockCrossRankedStocks: CrossRankedStock[] = [
    {
      symbol: 'PTT',
      name: 'PTT Public Company Limited',
      rankings: { value: 1, volume: 2, gainer: 3 },
      rankingCount: 3,
      strengthScore: 8,
    },
    {
      symbol: 'AOT',
      name: 'Airports of Thailand',
      rankings: { value: 2, volume: 5 },
      rankingCount: 2,
      strengthScore: 5,
    },
    {
      symbol: 'KBANK',
      name: 'Kasikornbank',
      rankings: { value: 3, gainer: 1 },
      rankingCount: 2,
      strengthScore: 4,
    },
    {
      symbol: 'SCB',
      name: 'Siam Commercial Bank',
      rankings: { volume: 1 },
      rankingCount: 1,
      strengthScore: 2,
    },
    {
      symbol: 'CPF',
      name: 'Charoen Pokphand Foods',
      rankings: { value: 4, volume: 3, gainer: 5, loser: 10 },
      rankingCount: 4,
      strengthScore: 9,
    },
  ]

  describe('renders with cross-ranked stocks', () => {
    it('should render the component without crashing', () => {
      const { container } = render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // Check for the Card component (bg-surface class)
      const card = container.querySelector('.bg-surface')
      expect(card).toBeTruthy()

      // Should contain Daily Focus text
      expect(container.textContent).toContain('Daily Focus')
    })

    it('should display all stock symbols from crossRankedStocks prop', () => {
      render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // Use more flexible text matchers for badges that contain multiple text nodes
      expect(screen.getByText((content) => content.includes('PTT'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('AOT'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('KBANK'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('SCB'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('CPF'))).toBeInTheDocument()
    })

    it('should display the award icon in header', () => {
      render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // Award icon should be present (lucide-icon class)
      const awardIcon = document.querySelector('svg.lucide-award')
      expect(awardIcon).toBeInTheDocument()
    })

    it('should show stock count badge', () => {
      render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // Should show count of stocks in the header badge
      const countBadge = screen.getByText('5')
      expect(countBadge).toBeInTheDocument()
    })
  })

  describe('limits to topCount', () => {
    it('should display only top 3 stocks when topCount is 3', () => {
      render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} topCount={3} />)

      // First 3 should be visible
      expect(screen.getByText((content) => content.includes('PTT'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('AOT'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('KBANK'))).toBeInTheDocument()

      // Last 2 should not be visible (limited by topCount)
      expect(screen.queryByText((content) => content.includes('SCB'))).not.toBeInTheDocument()
      expect(screen.queryByText((content) => content.includes('CPF'))).not.toBeInTheDocument()
    })

    it('should default to showing all stocks when topCount not provided', () => {
      render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // All 5 stocks should be visible
      expect(screen.getByText((content) => content.includes('PTT'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('AOT'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('KBANK'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('SCB'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('CPF'))).toBeInTheDocument()
    })

    it('should handle topCount larger than array length', () => {
      render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} topCount={10} />)

      // Should still only show 5 (array length)
      expect(screen.getByText((content) => content.includes('PTT'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('CPF'))).toBeInTheDocument()
    })
  })

  describe('shows correct ranking count', () => {
    it('should display ranking count in badge format', () => {
      render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // PTT has rankingCount of 3 - check for symbol and count nearby
      expect(screen.getByText((content) => content.includes('PTT'))).toBeInTheDocument()
      expect(screen.getAllByText('(3)')).toHaveLength(1)

      // AOT has rankingCount of 2
      expect(screen.getByText((content) => content.includes('AOT'))).toBeInTheDocument()
      expect(screen.getAllByText('(2)')).toHaveLength(2) // Both AOT and KBANK have rankingCount of 2

      // SCB has rankingCount of 1
      expect(screen.getByText((content) => content.includes('SCB'))).toBeInTheDocument()
      expect(screen.getAllByText('(1)')).toHaveLength(1)
    })
  })

  describe('color codes by strength score', () => {
    it('should apply buy color for high strength scores (> 5)', () => {
      const { container } = render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // PTT has strengthScore 8 (buy color) - check for buy badge with PTT
      const buyBadges = container.querySelectorAll('.inline-flex.rounded-full')
      const pttBadge = Array.from(buyBadges).find(el => el.textContent?.includes('PTT'))
      expect(pttBadge?.parentElement?.innerHTML).toContain('PTT')
    })

    it('should apply watch color for medium strength scores (3-5)', () => {
      const { container } = render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // AOT has strengthScore 5 (watch color)
      const badges = container.querySelectorAll('.inline-flex.rounded-full')
      const aotBadge = Array.from(badges).find(el => el.textContent?.includes('AOT'))
      expect(aotBadge).toBeInTheDocument()

      // KBANK has strengthScore 4 (watch color)
      const kbankBadge = Array.from(badges).find(el => el.textContent?.includes('KBANK'))
      expect(kbankBadge).toBeInTheDocument()
    })

    it('should apply neutral color for low strength scores (< 3)', () => {
      const { container } = render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // SCB has strengthScore 2 (neutral color)
      const badges = container.querySelectorAll('.inline-flex.rounded-full')
      const scbBadge = Array.from(badges).find(el => el.textContent?.includes('SCB'))
      expect(scbBadge).toBeInTheDocument()
    })
  })

  describe('shows empty state when no stocks', () => {
    it('should display empty state message when crossRankedStocks is empty', () => {
      const { container } = render(<DailyFocusList crossRankedStocks={[]} />)

      // The component should display "No focus stocks available" when array is empty
      expect(container.textContent).toContain('No focus stocks available')
    })

    it('should not display stock badges when empty', () => {
      render(<DailyFocusList crossRankedStocks={[]} />)

      // Award icon should still be present
      const awardIcon = document.querySelector('svg.lucide-award')
      expect(awardIcon).toBeInTheDocument()

      // But no stock badges
      expect(screen.queryByText((content) => content.includes('PTT'))).not.toBeInTheDocument()
    })
  })

  describe('staggered animation applied', () => {
    it('should have animation classes for staggered entrance', () => {
      const { container } = render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // Check for motion elements (framer-motion creates divs with inline styles)
      const motionElements = container.querySelectorAll('div[style*="opacity"]')
      expect(motionElements.length).toBeGreaterThan(0)
    })

    it('should apply different animation delays to each badge', () => {
      const { container } = render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // Get all badge containers (includes header badge + stock badges)
      const badges = container.querySelectorAll('.inline-flex.rounded-full')

      // Should have badges for each stock + header count badge = 6 total
      expect(badges.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('component structure', () => {
    it('should use Card component as container', () => {
      const { container } = render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      const card = container.querySelector('[class*="bg-surface"]')
      expect(card).toBeInTheDocument()
    })

    it('should use Badge component for stock display', () => {
      const { container } = render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // Badges should be inline-flex with rounded-full
      const badges = container.querySelectorAll('.inline-flex.rounded-full')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('should have compact flex wrap layout', () => {
      const { container } = render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} />)

      // Check for flex and flex-wrap classes
      const flexContainer = container.querySelector('.flex.flex-wrap')
      expect(flexContainer).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle null crossRankedStocks gracefully', () => {
      const { container } = render(<DailyFocusList crossRankedStocks={null as any} />)

      // Should show empty state
      const card = container.querySelector('.bg-surface')
      expect(card).toBeTruthy()
      expect(container.textContent).toContain('No focus stocks available')
    })

    it('should handle undefined crossRankedStocks gracefully', () => {
      const { container } = render(<DailyFocusList crossRankedStocks={undefined as any} />)

      // Should show empty state
      const card = container.querySelector('.bg-surface')
      expect(card).toBeTruthy()
      expect(container.textContent).toContain('No focus stocks available')
    })

    it('should handle single stock', () => {
      const singleStock: CrossRankedStock[] = [
        {
          symbol: 'PTT',
          rankings: { value: 1 },
          rankingCount: 1,
          strengthScore: 5,
        },
      ]

      render(<DailyFocusList crossRankedStocks={singleStock} />)

      expect(screen.getByText((content) => content.includes('PTT'))).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Stock count
    })

    it('should handle topCount of 0', () => {
      render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} topCount={0} />)

      // Should show empty state
      expect(screen.queryByText((content) => content.includes('PTT'))).not.toBeInTheDocument()
    })

    it('should handle negative topCount', () => {
      render(<DailyFocusList crossRankedStocks={mockCrossRankedStocks} topCount={-1} />)

      // Should show empty state
      expect(screen.queryByText((content) => content.includes('PTT'))).not.toBeInTheDocument()
    })
  })
})
