/**
 * DecisionBadge Component Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Component renders correctly
 * - Display badge label (BUY/WATCH/AVOID)
 * - Display score (0-100) with animation
 * - Display type indicator (bullish/bearish/neutral)
 * - Color coding for each type
 * - Animated score counter
 * - Pulsing effect for high scores
 * - Accessibility support (ARIA labels)
 * - Responsive sizing
 * - Tooltip on hover with details
 * - Edge cases (missing data, zero values)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { DecisionBadge } from './DecisionBadge'
import type { DecisionBadge as DecisionBadgeType } from '@/types/stock-api'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('DecisionBadge Component', () => {
  const mockBadge: DecisionBadgeType = {
    label: 'BUY',
    score: 85,
    type: 'bullish',
  }

  describe('Rendering', () => {
    it('should render decision badge component', () => {
      render(<DecisionBadge badge={mockBadge} />)

      const badge = screen.getByTestId('decision-badge')
      expect(badge).toBeInTheDocument()
    })

    it('should display badge label correctly', () => {
      render(<DecisionBadge badge={mockBadge} />)

      const label = screen.getByTestId('decision-badge-label')
      expect(label).toHaveTextContent('BUY')
    })

    it('should display score', () => {
      render(<DecisionBadge badge={mockBadge} />)

      const score = screen.getByTestId('decision-badge-score')
      expect(score).toBeInTheDocument()
    })

    it('should display type indicator', () => {
      render(<DecisionBadge badge={mockBadge} />)

      const type = screen.getByTestId('decision-badge-type')
      expect(type).toHaveTextContent('bullish')
    })
  })

  describe('Color Coding', () => {
    it('should apply green gradient for BUY/bullish', () => {
      const bullishBadge: DecisionBadgeType = {
        label: 'BUY',
        score: 75,
        type: 'bullish',
      }

      const { container } = render(<DecisionBadge badge={bullishBadge} />)

      const badge = screen.getByTestId('decision-badge')
      expect(badge).toHaveClass('from-green-500')
      expect(badge).toHaveClass('to-green-600')
    })

    it('should apply yellow/orange gradient for WATCH/neutral', () => {
      const neutralBadge: DecisionBadgeType = {
        label: 'WATCH',
        score: 50,
        type: 'neutral',
      }

      const { container } = render(<DecisionBadge badge={neutralBadge} />)

      const badge = screen.getByTestId('decision-badge')
      expect(badge).toHaveClass('from-yellow-500')
      expect(badge).toHaveClass('to-orange-500')
    })

    it('should apply red gradient for AVOID/bearish', () => {
      const bearishBadge: DecisionBadgeType = {
        label: 'AVOID',
        score: 25,
        type: 'bearish',
      }

      const { container } = render(<DecisionBadge badge={bearishBadge} />)

      const badge = screen.getByTestId('decision-badge')
      expect(badge).toHaveClass('from-red-500')
      expect(badge).toHaveClass('to-red-600')
    })
  })

  describe('Score Display', () => {
    it('should display score with animation', async () => {
      render(<DecisionBadge badge={mockBadge} />)

      const score = screen.getByTestId('decision-badge-score')

      // Score should animate from 0 to target
      await waitFor(() => {
        expect(score).toHaveTextContent('85')
      })
    })

    it('should display high score (80+)', () => {
      const highScoreBadge: DecisionBadgeType = {
        label: 'BUY',
        score: 90,
        type: 'bullish',
      }

      render(<DecisionBadge badge={highScoreBadge} />)

      const score = screen.getByTestId('decision-badge-score')
      expect(score).toHaveTextContent('90')
    })

    it('should display medium score (40-79)', () => {
      const mediumScoreBadge: DecisionBadgeType = {
        label: 'WATCH',
        score: 60,
        type: 'neutral',
      }

      render(<DecisionBadge badge={mediumScoreBadge} />)

      const score = screen.getByTestId('decision-badge-score')
      expect(score).toHaveTextContent('60')
    })

    it('should display low score (<40)', () => {
      const lowScoreBadge: DecisionBadgeType = {
        label: 'AVOID',
        score: 20,
        type: 'bearish',
      })

      render(<DecisionBadge badge={lowScoreBadge} />)

      const score = screen.getByTestId('decision-badge-score')
      expect(score).toHaveTextContent('20')
    })

    it('should handle zero score', () => {
      const zeroScoreBadge: DecisionBadgeType = {
        label: 'WATCH',
        score: 0,
        type: 'neutral',
      }

      render(<DecisionBadge badge={zeroScoreBadge} />)

      const score = screen.getByTestId('decision-badge-score')
      expect(score).toHaveTextContent('0')
    })

    it('should handle perfect score', () => {
      const perfectScoreBadge: DecisionBadgeType = {
        label: 'BUY',
        score: 100,
        type: 'bullish',
      }

      render(<DecisionBadge badge={perfectScoreBadge} />)

      const score = screen.getByTestId('decision-badge-score')
      expect(score).toHaveTextContent('100')
    })
  })

  describe('Pulsing Effect', () => {
    it('should have pulsing effect for high scores (>=80)', () => {
      const highScoreBadge: DecisionBadgeType = {
        label: 'BUY',
        score: 85,
        type: 'bullish',
      }

      const { container } = render(<DecisionBadge badge={highScoreBadge} />)

      const pulseElement = container.querySelector('.animate-pulse')
      expect(pulseElement).toBeInTheDocument()
    })

    it('should not have pulsing effect for low scores (<80)', () => {
      const lowScoreBadge: DecisionBadgeType = {
        label: 'WATCH',
        score: 60,
        type: 'neutral',
      }

      const { container } = render(<DecisionBadge badge={lowScoreBadge} />)

      const pulseElement = container.querySelector('.animate-pulse')
      expect(pulseElement).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for badge', () => {
      render(<DecisionBadge badge={mockBadge} />)

      const badge = screen.getByTestId('decision-badge')
      expect(badge).toHaveAttribute('aria-label', 'Decision: BUY with score 85')
    })

    it('should have role="status" for accessibility', () => {
      render(<DecisionBadge badge={mockBadge} />)

      const badge = screen.getByTestId('decision-badge')
      expect(badge).toHaveAttribute('role', 'status')
    })

    it('should have aria-live for score updates', () => {
      render(<DecisionBadge badge={mockBadge} />)

      const score = screen.getByTestId('decision-badge-score')
      expect(score).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Responsive Sizing', () => {
    it('should have responsive classes for mobile', () => {
      const { container } = render(<DecisionBadge badge={mockBadge} />)

      const badge = screen.getByTestId('decision-badge')
      expect(badge).toHaveClass('text-2xl')
      expect(badge).toHaveClass('md:text-3xl')
      expect(badge).toHaveClass('lg:text-4xl')
    })

    it('should scale appropriately on larger screens', () => {
      const { container } = render(<DecisionBadge badge={mockBadge} />)

      const score = screen.getByTestId('decision-badge-score')
      expect(score).toHaveClass('text-5xl')
      expect(score).toHaveClass('md:text-6xl')
    })
  })

  describe('Tooltip', () => {
    it('should show tooltip on hover with details', async () => {
      render(<DecisionBadge badge={mockBadge} />)

      const badge = screen.getByTestId('decision-badge')

      // Tooltip should be present in DOM
      const tooltip = screen.getByTestId('decision-badge-tooltip')
      expect(tooltip).toBeInTheDocument()
      expect(tooltip).toHaveTextContent('Score: 85')
    })

    it('should include type in tooltip', () => {
      render(<DecisionBadge badge={mockBadge} />)

      const tooltip = screen.getByTestId('decision-badge-tooltip')
      expect(tooltip).toHaveTextContent('bullish')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing label gracefully', () => {
      const invalidBadge: DecisionBadgeType = {
        label: '',
        score: 50,
        type: 'neutral',
      }

      render(<DecisionBadge badge={invalidBadge} />)

      const badge = screen.getByTestId('decision-badge')
      expect(badge).toBeInTheDocument()
    })

    it('should handle negative scores', () => {
      const invalidBadge: DecisionBadgeType = {
        label: 'WATCH',
        score: -10,
        type: 'neutral',
      }

      render(<DecisionBadge badge={invalidBadge} />)

      const score = screen.getByTestId('decision-badge-score')
      expect(score).toHaveTextContent('0') // Should clamp to 0
    })

    it('should handle scores above 100', () => {
      const invalidBadge: DecisionBadgeType = {
        label: 'BUY',
        score: 150,
        type: 'bullish',
      }

      render(<DecisionBadge badge={invalidBadge} />)

      const score = screen.getByTestId('decision-badge-score')
      expect(score).toHaveTextContent('100') // Should clamp to 100
    })
  })

  describe('Badge Types', () => {
    it('should render BUY badge', () => {
      const buyBadge: DecisionBadgeType = {
        label: 'BUY',
        score: 75,
        type: 'bullish',
      }

      render(<DecisionBadge badge={buyBadge} />)

      const label = screen.getByTestId('decision-badge-label')
      expect(label).toHaveTextContent('BUY')
    })

    it('should render WATCH badge', () => {
      const watchBadge: DecisionBadgeType = {
        label: 'WATCH',
        score: 50,
        type: 'neutral',
      }

      render(<DecisionBadge badge={watchBadge} />)

      const label = screen.getByTestId('decision-badge-label')
      expect(label).toHaveTextContent('WATCH')
    })

    it('should render AVOID badge', () => {
      const avoidBadge: DecisionBadgeType = {
        label: 'AVOID',
        score: 25,
        type: 'bearish',
      }

      render(<DecisionBadge badge={avoidBadge} />)

      const label = screen.getByTestId('decision-badge-label')
      expect(label).toHaveTextContent('AVOID')
    })
  })

  describe('Layout Structure', () => {
    it('should render all elements in correct order', () => {
      const { container } = render(<DecisionBadge badge={mockBadge} />)

      const badge = screen.getByTestId('decision-badge')
      const label = screen.getByTestId('decision-badge-label')
      const score = screen.getByTestId('decision-badge-score')
      const type = screen.getByTestId('decision-badge-type')

      // Verify all elements are present
      expect(badge).toBeInTheDocument()
      expect(label).toBeInTheDocument()
      expect(score).toBeInTheDocument()
      expect(type).toBeInTheDocument()
    })

    it('should have proper spacing between elements', () => {
      const { container } = render(<DecisionBadge badge={mockBadge} />)

      // Check for spacing classes
      const spacedElements = container.querySelectorAll('.gap-2, .gap-4')
      expect(spacedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Visual Consistency', () => {
    it('should use gradient backgrounds', () => {
      const { container } = render(<DecisionBadge badge={mockBadge} />)

      const badge = screen.getByTestId('decision-badge')
      expect(badge).toHaveClass('bg-gradient-to-r')
    })

    it('should have rounded corners', () => {
      const { container } = render(<DecisionBadge badge={mockBadge} />)

      const badge = screen.getByTestId('decision-badge')
      expect(badge).toHaveClass('rounded-xl')
    })

    it('should have shadow for depth', () => {
      const { container } = render(<DecisionBadge badge={mockBadge} />)

      const badge = screen.getByTestId('decision-badge')
      expect(badge).toHaveClass('shadow-lg')
    })
  })
})
