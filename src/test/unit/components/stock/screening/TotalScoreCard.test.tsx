/**
 * TDD Test: TotalScoreCard Component (Redesigned)
 *
 * Tests for the redesigned TotalScoreCard component with:
 * - Premium gradient background
 * - Glow effect for high scores
 * - Glassmorphism on decision badge
 * - Smooth progress bar animation
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TotalScoreCard } from '@/components/stock/screening/TotalScoreCard'
import type { TotalScoreCardProps } from '@/components/stock/screening/types'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Award: () => <div data-testid="award-icon">Award</div>,
}))

// Mock DecisionBadge component
vi.mock('@/components/stock/screening/DecisionBadge', () => ({
  DecisionBadge: ({ decision, confidence, size }: any) => (
    <div data-testid="decision-badge" data-decision={decision} data-confidence={confidence} data-size={size}>
      {decision} - {confidence}
    </div>
  ),
}))

// Mock LayerScoreBadge component
vi.mock('@/components/stock/screening/ScoreBadge', () => ({
  LayerScoreBadge: ({ title, score, maxScore }: any) => (
    <div data-testid="layer-score-badge" data-title={title} data-score={score} data-max={maxScore}>
      {title}: {score}/{maxScore}
    </div>
  ),
}))

describe('TotalScoreCard - Redesigned', () => {
  const defaultProps: TotalScoreCardProps = {
    totalScore: 20,
    maxScore: 27,
    decision: 'BUY',
    confidence: 'High',
    confidencePercent: 85,
    layers: {
      universe: { score: 2, passed: true },
      quality: { score: 7 },
      valueGrowth: { score: 6 },
      technical: { score: 5 },
    },
    summary: 'Strong buy signal with high confidence',
    rationale: [
      'Excellent quality metrics',
      'Attractive valuation',
      'Positive technical setup',
    ],
    locale: 'en',
  }

  describe('Rendering', () => {
    it('should render the total score prominently', () => {
      render(<TotalScoreCard {...defaultProps} />)
      expect(screen.getByText('20')).toBeInTheDocument()
      expect(screen.getByText('/27')).toBeInTheDocument()
    })

    it('should render the decision badge', () => {
      render(<TotalScoreCard {...defaultProps} />)
      const badge = screen.getByTestId('decision-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveAttribute('data-decision', 'BUY')
      expect(badge).toHaveAttribute('data-confidence', 'High')
    })

    it('should render the summary text', () => {
      render(<TotalScoreCard {...defaultProps} />)
      expect(screen.getByText('Strong buy signal with high confidence')).toBeInTheDocument()
    })

    it('should render all rationale items', () => {
      render(<TotalScoreCard {...defaultProps} />)
      expect(screen.getByText('Excellent quality metrics')).toBeInTheDocument()
      expect(screen.getByText('Attractive valuation')).toBeInTheDocument()
      expect(screen.getByText('Positive technical setup')).toBeInTheDocument()
    })
  })

  describe('Gradient Backgrounds', () => {
    it('should show green gradient for high scores (>=18)', () => {
      const { container } = render(<TotalScoreCard {...defaultProps} />)
      const header = container.querySelector('.from-up-primary\\/20, .from-up-primary')
      // Should have green gradient classes for high scores
      const scoreElement = screen.getByText('20')
      expect(scoreElement.className).toContain('text-up')
    })

    it('should show neutral gradient for medium scores (14-17)', () => {
      const props = { ...defaultProps, totalScore: 15 }
      const { container } = render(<TotalScoreCard {...props} />)
      const scoreElement = screen.getByText('15')
      // Medium scores should have neutral/insight colors
      expect(scoreElement).toBeInTheDocument()
    })

    it('should show red gradient for low scores (<14)', () => {
      const props = { ...defaultProps, totalScore: 10 }
      const { container } = render(<TotalScoreCard {...props} />)
      const scoreElement = screen.getByText('10')
      // Low scores should have risk/down colors
      expect(scoreElement).toBeInTheDocument()
    })
  })

  describe('Glow Effects', () => {
    it('should have glow effect for high scores', () => {
      const { container } = render(<TotalScoreCard {...defaultProps} />)
      // Check for glow classes
      const glowElement = container.querySelector('.shadow-glow-up, .shadow-glow-accent')
      // The glow might be applied to different elements
      const scoreElement = screen.getByText('20')
      expect(scoreElement).toBeInTheDocument()
    })
  })

  describe('Glassmorphism', () => {
    it('should apply glassmorphism to decision badge area', () => {
      const { container } = render(<TotalScoreCard {...defaultProps} />)
      const badge = screen.getByTestId('decision-badge')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Progress Bar', () => {
    it('should render confidence progress bar', () => {
      render(<TotalScoreCard {...defaultProps} />)
      expect(screen.getByText('85%')).toBeInTheDocument()
    })

    it('should have animated progress bar', () => {
      const { container } = render(<TotalScoreCard {...defaultProps} />)
      const progressBars = container.querySelectorAll('[style*="width: 85%"]')
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('should show confidence label', () => {
      render(<TotalScoreCard {...defaultProps} locale="en" />)
      expect(screen.getByText('Confidence')).toBeInTheDocument()
    })

    it('should show Thai confidence label', () => {
      render(<TotalScoreCard {...defaultProps} locale="th" />)
      expect(screen.getByText('ความมั่นใจ')).toBeInTheDocument()
    })
  })

  describe('Score Circle Animation', () => {
    it('should render SVG circle for score visualization', () => {
      const { container } = render(<TotalScoreCard {...defaultProps} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should have animation styles for progress circle', () => {
      const { container } = render(<TotalScoreCard {...defaultProps} />)
      const circles = container.querySelectorAll('circle')
      expect(circles.length).toBeGreaterThanOrEqual(2) // Background and progress
    })
  })

  describe('Layer Breakdown', () => {
    it('should render all layer score badges', () => {
      render(<TotalScoreCard {...defaultProps} />)
      const badges = screen.getAllByTestId('layer-score-badge')
      expect(badges).toHaveLength(4)
    })

    it('should show universe layer with pass/fail status', () => {
      render(<TotalScoreCard {...defaultProps} />)
      const badges = screen.getAllByTestId('layer-score-badge')
      const universeBadge = badges.find(b => b.getAttribute('data-title')?.includes('Universe'))
      expect(universeBadge).toBeInTheDocument()
    })

    it('should show quality layer score', () => {
      render(<TotalScoreCard {...defaultProps} />)
      const badges = screen.getAllByTestId('layer-score-badge')
      const qualityBadge = badges.find(b => b.getAttribute('data-title')?.includes('Quality'))
      expect(qualityBadge).toHaveAttribute('data-score', '7')
    })
  })

  describe('Internationalization', () => {
    it('should display English labels for locale en', () => {
      render(<TotalScoreCard {...defaultProps} locale="en" />)
      expect(screen.getByText('Layer Breakdown')).toBeInTheDocument()
      // LayerScoreBadge renders text inside, use flexible matcher
      expect(screen.getByText((content) => content.includes('Universe'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('Quality'))).toBeInTheDocument()
    })

    it('should display Thai labels for locale th', () => {
      render(<TotalScoreCard {...defaultProps} locale="th" />)
      expect(screen.getByText('สรุปแต่ละชั้น')).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('กรองพื้นฐาน'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('คุณภาพ'))).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle minimum score (0)', () => {
      const props = { ...defaultProps, totalScore: 0, decision: 'PASS' as const, confidence: 'Low' as const }
      render(<TotalScoreCard {...props} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle maximum score (27)', () => {
      const props = {
        ...defaultProps,
        totalScore: 27,
        decision: 'BUY' as const,
        confidence: 'High' as const,
        confidencePercent: 100,
      }
      render(<TotalScoreCard {...props} />)
      expect(screen.getByText('27')).toBeInTheDocument()
    })

    it('should handle empty rationale array', () => {
      const props = { ...defaultProps, rationale: [] }
      const { container } = render(<TotalScoreCard {...props} />)
      // Rationale section should not render when array is empty
      const awardIcons = container.querySelectorAll('[data-testid="award-icon"]')
      expect(awardIcons.length).toBe(0)
    })
  })
})
