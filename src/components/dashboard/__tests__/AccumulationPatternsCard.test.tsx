/**
 * AccumulationPatternsCard Component Tests
 *
 * TDD: Tests written BEFORE implementation
 * Test Coverage: Unit tests for component behavior
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AccumulationPatternsCard } from '../AccumulationPatternsCard'
import type { AccumulationPattern } from '../AccumulationPatternsCard'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: {
      success: true,
      data: { accumulationPatterns: mockPatterns },
    },
    isLoading: false,
    error: null,
  })),
}))

// Mock test data
const mockPatterns: AccumulationPattern[] = [
  {
    symbol: 'PTT',
    name: 'PTT Public Company Limited',
    pattern: 'Strong Accumulation',
    days: 3,
    avgNetFlow: 150000000,
    totalNetFlow: 450000000,
    score: 95,
  },
  {
    symbol: 'AOT',
    name: 'Airports of Thailand',
    pattern: 'Accumulation',
    days: 3,
    avgNetFlow: 50000000,
    totalNetFlow: 150000000,
    score: 85,
  },
  {
    symbol: 'BDMS',
    name: 'Bangkok Dusit Medical Services',
    pattern: 'Distribution',
    days: 3,
    avgNetFlow: -30000000,
    totalNetFlow: -90000000,
    score: -75,
  },
  {
    symbol: 'CPF',
    name: 'Charoen Pokphand Foods',
    pattern: 'Strong Distribution',
    days: 3,
    avgNetFlow: -80000000,
    totalNetFlow: -240000000,
    score: -90,
  },
  {
    symbol: 'KBANK',
    name: 'Kasikornbank',
    pattern: 'Strong Accumulation',
    days: 3,
    avgNetFlow: 200000000,
    totalNetFlow: 600000000,
    score: 98,
  },
]

describe('AccumulationPatternsCard', () => {
  describe('Rendering', () => {
    it('renders card with patterns', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      expect(screen.getByText('Accumulation Patterns')).toBeInTheDocument()
      expect(screen.getByText('3-Day Flow Analysis')).toBeInTheDocument()
    })

    it('renders stock symbols from patterns', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      expect(screen.getByText('PTT')).toBeInTheDocument()
      expect(screen.getByText('AOT')).toBeInTheDocument()
      expect(screen.getByText('BDMS')).toBeInTheDocument()
    })

    it('renders stock names when available', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      expect(screen.getByText('PTT Public Company Limited')).toBeInTheDocument()
      expect(screen.getByText('Airports of Thailand')).toBeInTheDocument()
    })

    it('limits patterns to topCount prop', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} topCount={3} />)

      // Top 3 by score: KBANK(98), PTT(95), AOT(85)
      expect(screen.getByText('KBANK')).toBeInTheDocument()
      expect(screen.getByText('PTT')).toBeInTheDocument()
      expect(screen.getByText('AOT')).toBeInTheDocument()

      // BDMS(score -75) and CPF(score -90) should NOT be visible
      expect(screen.queryByText('BDMS')).not.toBeInTheDocument()
      expect(screen.queryByText('CPF')).not.toBeInTheDocument()
    })

    it('defaults to showing all patterns when topCount not specified', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      expect(screen.getByText('KBANK')).toBeInTheDocument()
    })

    it('renders empty state when no patterns', () => {
      render(<AccumulationPatternsCard patterns={[]} />)

      expect(screen.getByText(/no accumulation patterns/i)).toBeInTheDocument()
    })
  })

  describe('Sorting', () => {
    it('sorts patterns by score in descending order', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      const rows = screen.getAllByTestId(/pattern-row/)
      const firstRow = rows[0]
      const lastRow = rows[rows.length - 1]

      // KBANK has score 98, should be first
      expect(firstRow).toHaveTextContent('KBANK')

      // CPF has score -90, should be last
      expect(lastRow).toHaveTextContent('CPF')
    })

    it('maintains score order when patterns are unsorted', () => {
      const unsortedPatterns: AccumulationPattern[] = [
        mockPatterns[2], // BDMS, score -75
        mockPatterns[0], // PTT, score 95
        mockPatterns[4], // KBANK, score 98
      ]

      render(<AccumulationPatternsCard patterns={unsortedPatterns} />)

      const rows = screen.getAllByTestId(/pattern-row/)
      expect(rows[0]).toHaveTextContent('KBANK') // 98
      expect(rows[1]).toHaveTextContent('PTT') // 95
      expect(rows[2]).toHaveTextContent('BDMS') // -75
    })
  })

  describe('Pattern Badges', () => {
    it('shows Strong Accumulation badge for strong accumulation patterns', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      // Both KBANK and PTT are "Strong Accumulation"
      const badges = screen.getAllByText('Strong Accumulation')
      expect(badges.length).toBe(2)
    })

    it('shows Accumulation badge for accumulation patterns', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      // AOT is "Accumulation" (not strong)
      const badges = screen.getAllByText('Accumulation')
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })

    it('shows Distribution badge for distribution patterns', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      // BDMS is "Distribution"
      expect(screen.getByText('Distribution')).toBeInTheDocument()
    })

    it('shows Strong Distribution badge for strong distribution patterns', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      // CPF is "Strong Distribution"
      expect(screen.getByText('Strong Distribution')).toBeInTheDocument()
    })
  })

  describe('Color Coding', () => {
    it('applies green color for accumulation patterns', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      const pttRow = screen.getByTestId('pattern-row-PTT')
      expect(pttRow).toHaveClass(/accumulation/i)
    })

    it('applies red color for distribution patterns', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      const bdmsRow = screen.getByTestId('pattern-row-BDMS')
      expect(bdmsRow).toHaveClass(/distribution/i)
    })

    it('distinguishes between strong and regular patterns visually', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      // Should have different styling for strong vs regular
      const strongAccumulationBadges = screen.getAllByText('Strong Accumulation')
      const accumulationBadges = screen.getAllByText('Accumulation')

      // Strong patterns should have font-semibold class
      expect(strongAccumulationBadges.length).toBe(2)
      expect(accumulationBadges.length).toBeGreaterThanOrEqual(1)

      // Check that strong badges have the font-semibold class
      strongAccumulationBadges.forEach(badge => {
        expect(badge).toHaveClass('font-semibold')
      })
    })
  })

  describe('Data Display', () => {
    it('displays average net flow values', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      // Should show formatted values like "+150M" or "-80M"
      expect(screen.getByText(/\+150M/i)).toBeInTheDocument()
      expect(screen.getByText(/-80M/i)).toBeInTheDocument()
    })

    it('displays days count', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      // All patterns have 3 days, so there should be multiple "3d" elements
      const daysElements = screen.getAllByText('3d')
      expect(daysElements.length).toBe(mockPatterns.length)
    })

    it('shows rank numbers for each pattern', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      expect(screen.getByText('#1')).toBeInTheDocument()
      expect(screen.getByText('#2')).toBeInTheDocument()
      expect(screen.getByText('#3')).toBeInTheDocument()
    })
  })

  describe('Animation', () => {
    it('applies staggered entrance animation to rows', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      const rows = screen.getAllByTestId(/pattern-row/)

      rows.forEach((row, index) => {
        expect(row).toHaveAttribute('data-index', String(index))
      })
    })
  })

  describe('Styling', () => {
    it('uses Activity icon in header', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns} />)

      // Icon should be present
      const header = screen.getByText('Accumulation Patterns').parentElement
      expect(header).toBeInTheDocument()
    })

    it('uses sm padding for card', () => {
      const { container } = render(<AccumulationPatternsCard patterns={mockPatterns} />)

      const card = container.querySelector('[class*="p-3"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles patterns without name', () => {
      const patternsWithoutName: AccumulationPattern[] = [
        {
          symbol: 'TEST',
          pattern: 'Accumulation',
          days: 3,
          avgNetFlow: 1000000,
          totalNetFlow: 3000000,
          score: 50,
        },
      ]

      render(<AccumulationPatternsCard patterns={patternsWithoutName} />)

      expect(screen.getByText('TEST')).toBeInTheDocument()
    })

    it('handles zero net flow values', () => {
      const zeroFlowPattern: AccumulationPattern[] = [
        {
          symbol: 'ZERO',
          pattern: 'Accumulation',
          days: 3,
          avgNetFlow: 0,
          totalNetFlow: 0,
          score: 0,
        },
      ]

      render(<AccumulationPatternsCard patterns={zeroFlowPattern} />)

      expect(screen.getByText('ZERO')).toBeInTheDocument()
    })

    it('handles very large net flow values', () => {
      const largeFlowPattern: AccumulationPattern[] = [
        {
          symbol: 'BIG',
          pattern: 'Strong Accumulation',
          days: 3,
          avgNetFlow: 9999999999,
          totalNetFlow: 29999999997,
          score: 100,
        },
      ]

      render(<AccumulationPatternsCard patterns={largeFlowPattern} />)

      expect(screen.getByText('BIG')).toBeInTheDocument()
    })

    it('handles topCount larger than patterns length', () => {
      render(<AccumulationPatternsCard patterns={mockPatterns.slice(0, 2)} topCount={10} />)

      expect(screen.getByText('PTT')).toBeInTheDocument()
      expect(screen.getByText('AOT')).toBeInTheDocument()
    })
  })

  describe('Immutability', () => {
    it('does not mutate original patterns array', () => {
      const originalPatterns = [...mockPatterns]
      const originalFirst = originalPatterns[0]

      render(<AccumulationPatternsCard patterns={originalPatterns} />)

      expect(originalPatterns[0]).toEqual(originalFirst)
      expect(originalPatterns).toHaveLength(mockPatterns.length)
    })

    it('sorts a copy, not the original array', () => {
      const originalPatterns = [...mockPatterns]
      const originalOrder = originalPatterns.map((p) => p.symbol)

      render(<AccumulationPatternsCard patterns={originalPatterns} />)

      const currentOrder = originalPatterns.map((p) => p.symbol)
      expect(currentOrder).toEqual(originalOrder)
    })
  })
})
