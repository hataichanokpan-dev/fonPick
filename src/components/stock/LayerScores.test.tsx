/**
 * LayerScores Component Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Component renders correctly with 4 layers
 * - Display all 4 layer scores (Quality, Value, Growth, Technical/Catalyst)
 * - Circular progress indicators with percentage
 * - Color coding by score range:
 *   - 80-100: Green (Excellent)
 *   - 60-79: Yellow-Green (Good)
 *   - 40-59: Yellow-Orange (Fair)
 *   - 0-39: Red (Poor)
 * - Animated progress fill
 * - Hover tooltips with detailed metrics
 * - Responsive grid layout
 * - Thai labels with English subtitles
 * - Backwards compatibility (3-layer data still works)
 * - Accessibility (ARIA labels, keyboard navigation)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LayerScores } from './LayerScores'
import type { LayerScore } from '@/types/stock-api'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('LayerScores Component', () => {
  const mockFourLayerScore: LayerScore = {
    quality: 85,
    valuation: 72,
    growth: 65,
    technical: 58,
  }

  const mockThreeLayerScore: LayerScore = {
    quality: 75,
    valuation: 60,
    timing: 45,
  }

  describe('Rendering', () => {
    it('should render layer scores component with 4 layers', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const container = screen.getByTestId('layer-scores')
      expect(container).toBeInTheDocument()
    })

    it('should render backwards compatible 3-layer data', () => {
      render(<LayerScores layerScore={mockThreeLayerScore} />)

      const container = screen.getByTestId('layer-scores')
      expect(container).toBeInTheDocument()
    })

    it('should display Quality layer', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const qualityLayer = screen.getByTestId('layer-quality')
      expect(qualityLayer).toBeInTheDocument()
      expect(qualityLayer).toHaveTextContent('คุณภาพ')
      expect(qualityLayer).toHaveTextContent('Quality')
    })

    it('should display Value layer', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const valueLayer = screen.getByTestId('layer-value')
      expect(valueLayer).toBeInTheDocument()
      expect(valueLayer).toHaveTextContent('มูลค่า')
      expect(valueLayer).toHaveTextContent('Value')
    })

    it('should display Growth layer', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const growthLayer = screen.getByTestId('layer-growth')
      expect(growthLayer).toBeInTheDocument()
      expect(growthLayer).toHaveTextContent('การเติบโต')
      expect(growthLayer).toHaveTextContent('Growth')
    })

    it('should display Technical/Catalyst layer', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const technicalLayer = screen.getByTestId('layer-technical')
      expect(technicalLayer).toBeInTheDocument()
      expect(technicalLayer).toHaveTextContent('จังหวะ')
      expect(technicalLayer).toHaveTextContent('Technical')
    })

    it('should display Timing layer for backwards compatibility', () => {
      render(<LayerScores layerScore={mockThreeLayerScore} />)

      const timingLayer = screen.getByTestId('layer-timing')
      expect(timingLayer).toBeInTheDocument()
      expect(timingLayer).toHaveTextContent('จังหวะ')
      expect(timingLayer).toHaveTextContent('Timing')
    })
  })

  describe('Score Display', () => {
    it('should display quality score correctly', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const qualityScore = screen.getByTestId('layer-quality-score')
      expect(qualityScore).toHaveTextContent('85')
    })

    it('should display valuation score correctly', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const valueScore = screen.getByTestId('layer-value-score')
      expect(valueScore).toHaveTextContent('72')
    })

    it('should display growth score correctly', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const growthScore = screen.getByTestId('layer-growth-score')
      expect(growthScore).toHaveTextContent('65')
    })

    it('should display technical score correctly', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const technicalScore = screen.getByTestId('layer-technical-score')
      expect(technicalScore).toHaveTextContent('58')
    })
  })

  describe('Color Coding', () => {
    it('should apply green color for excellent scores (80-100)', () => {
      const excellentScore: LayerScore = {
        quality: 85,
        valuation: 90,
        growth: 82,
        technical: 88,
      }

      render(<LayerScores layerScore={excellentScore} />)

      const qualityLayer = screen.getByTestId('layer-quality')
      expect(qualityLayer).toHaveClass('text-green-500')
    })

    it('should apply yellow-green color for good scores (60-79)', () => {
      const goodScore: LayerScore = {
        quality: 75,
        valuation: 68,
        growth: 72,
        technical: 65,
      }

      render(<LayerScores layerScore={goodScore} />)

      const valueLayer = screen.getByTestId('layer-value')
      expect(valueLayer).toHaveClass('text-lime-500')
    })

    it('should apply yellow-orange color for fair scores (40-59)', () => {
      const fairScore: LayerScore = {
        quality: 45,
        valuation: 55,
        growth: 42,
        technical: 50,
      }

      render(<LayerScores layerScore={fairScore} />)

      const growthLayer = screen.getByTestId('layer-growth')
      expect(growthLayer).toHaveClass('text-yellow-500')
    })

    it('should apply red color for poor scores (0-39)', () => {
      const poorScore: LayerScore = {
        quality: 25,
        valuation: 35,
        growth: 20,
        technical: 30,
      }

      render(<LayerScores layerScore={poorScore} />)

      const technicalLayer = screen.getByTestId('layer-technical')
      expect(technicalLayer).toHaveClass('text-red-500')
    })

    it('should handle edge case score of 80', () => {
      const edgeScore: LayerScore = {
        quality: 80,
        valuation: 70,
        growth: 60,
        technical: 50,
      }

      render(<LayerScores layerScore={edgeScore} />)

      const qualityLayer = screen.getByTestId('layer-quality')
      expect(qualityLayer).toHaveClass('text-green-500')
    })

    it('should handle edge case score of 60', () => {
      const edgeScore: LayerScore = {
        quality: 70,
        valuation: 60,
        growth: 50,
        technical: 40,
      }

      render(<LayerScores layerScore={edgeScore} />)

      const valueLayer = screen.getByTestId('layer-value')
      expect(valueLayer).toHaveClass('text-lime-500')
    })

    it('should handle edge case score of 40', () => {
      const edgeScore: LayerScore = {
        quality: 60,
        valuation: 50,
        growth: 40,
        technical: 30,
      }

      render(<LayerScores layerScore={edgeScore} />)

      const growthLayer = screen.getByTestId('layer-growth')
      expect(growthLayer).toHaveClass('text-yellow-500')
    })
  })

  describe('Circular Progress', () => {
    it('should render circular progress for each layer', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const qualityProgress = screen.getByTestId('layer-quality-progress')
      const valueProgress = screen.getByTestId('layer-value-progress')
      const growthProgress = screen.getByTestId('layer-growth-progress')
      const technicalProgress = screen.getByTestId('layer-technical-progress')

      expect(qualityProgress).toBeInTheDocument()
      expect(valueProgress).toBeInTheDocument()
      expect(growthProgress).toBeInTheDocument()
      expect(technicalProgress).toBeInTheDocument()
    })

    it('should calculate correct stroke-dashoffset for progress', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      // Quality score 85 should have specific offset
      const qualityProgress = screen.getByTestId('layer-quality-progress')
      const circumference = 2 * Math.PI * 40 // r=40
      const expectedOffset = circumference - (85 / 100) * circumference

      expect(qualityProgress).toHaveAttribute('stroke-dashoffset', expectedOffset.toFixed(2))
    })

    it('should handle 0 score correctly', () => {
      const zeroScore: LayerScore = {
        quality: 0,
        valuation: 50,
        growth: 50,
        technical: 50,
      }

      render(<LayerScores layerScore={zeroScore} />)

      const qualityProgress = screen.getByTestId('layer-quality-progress')
      const circumference = 2 * Math.PI * 40
      const expectedOffset = circumference // Full offset for 0%

      expect(qualityProgress).toHaveAttribute('stroke-dashoffset', expectedOffset.toFixed(2))
    })

    it('should handle 100 score correctly', () => {
      const perfectScore: LayerScore = {
        quality: 100,
        valuation: 50,
        growth: 50,
        technical: 50,
      }

      render(<LayerScores layerScore={perfectScore} />)

      const qualityProgress = screen.getByTestId('layer-quality-progress')
      const expectedOffset = 0 // No offset for 100%

      expect(qualityProgress).toHaveAttribute('stroke-dashoffset', expectedOffset.toFixed(2))
    })
  })

  describe('Responsive Layout', () => {
    it('should have mobile-first single column layout', () => {
      const { container } = render(<LayerScores layerScore={mockFourLayerScore} />)

      const grid = container.querySelector('.grid-cols-1')
      expect(grid).toBeInTheDocument()
    })

    it('should have 2x2 layout on tablet screens', () => {
      const { container } = render(<LayerScores layerScore={mockFourLayerScore} />)

      const grid = container.querySelector('.md\\:grid-cols-2')
      expect(grid).toBeInTheDocument()
    })

    it('should have 4x1 layout on desktop screens', () => {
      const { container } = render(<LayerScores layerScore={mockFourLayerScore} />)

      const grid = container.querySelector('.lg\\:grid-cols-4')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Tooltips', () => {
    it('should show tooltip with detailed metrics on hover', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const qualityTooltip = screen.getByTestId('layer-quality-tooltip')
      expect(qualityTooltip).toBeInTheDocument()
      expect(qualityTooltip).toHaveTextContent('PEG')
      expect(qualityTooltip).toHaveTextContent('NPM')
      expect(qualityTooltip).toHaveTextContent('ROE')
    })

    it('should include value metrics in tooltip', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const valueTooltip = screen.getByTestId('layer-value-tooltip')
      expect(valueTooltip).toHaveTextContent('PE Band')
      expect(valueTooltip).toHaveTextContent('PB vs ROE')
      expect(valueTooltip).toHaveTextContent('Dividend')
    })

    it('should include growth metrics in tooltip', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const growthTooltip = screen.getByTestId('layer-growth-tooltip')
      expect(growthTooltip).toHaveTextContent('Revenue growth')
      expect(growthTooltip).toHaveTextContent('EPS growth')
      expect(growthTooltip).toHaveTextContent('Expansion')
    })

    it('should include technical metrics in tooltip', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const technicalTooltip = screen.getByTestId('layer-technical-tooltip')
      expect(technicalTooltip).toHaveTextContent('MA')
      expect(technicalTooltip).toHaveTextContent('RSI')
      expect(technicalTooltip).toHaveTextContent('MACD')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for each layer', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const qualityLayer = screen.getByTestId('layer-quality')
      expect(qualityLayer).toHaveAttribute('aria-label', 'Quality score: 85')
    })

    it('should have role="img" for circular progress', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const qualityProgress = screen.getByTestId('layer-quality-progress')
      expect(qualityProgress).toHaveAttribute('role', 'img')
    })

    it('should be keyboard navigable', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const qualityLayer = screen.getByTestId('layer-quality')
      expect(qualityLayer).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Backwards Compatibility', () => {
    it('should render 3 layers when only quality, valuation, timing provided', () => {
      render(<LayerScores layerScore={mockThreeLayerScore} />)

      expect(screen.getByTestId('layer-quality')).toBeInTheDocument()
      expect(screen.getByTestId('layer-value')).toBeInTheDocument()
      expect(screen.getByTestId('layer-timing')).toBeInTheDocument()
    })

    it('should not render growth layer when not provided', () => {
      render(<LayerScores layerScore={mockThreeLayerScore} />)

      expect(screen.queryByTestId('layer-growth')).not.toBeInTheDocument()
    })

    it('should not render technical layer when not provided', () => {
      render(<LayerScores layerScore={mockThreeLayerScore} />)

      expect(screen.queryByTestId('layer-technical')).not.toBeInTheDocument()
    })

    it('should handle undefined growth/technical gracefully', () => {
      const partialScore: LayerScore = {
        quality: 75,
        valuation: 60,
        growth: undefined,
        technical: undefined,
      }

      render(<LayerScores layerScore={partialScore} />)

      expect(screen.getByTestId('layer-quality')).toBeInTheDocument()
      expect(screen.getByTestId('layer-value')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle all zero scores', () => {
      const zeroScore: LayerScore = {
        quality: 0,
        valuation: 0,
        growth: 0,
        technical: 0,
      }

      render(<LayerScores layerScore={zeroScore} />)

      expect(screen.getByTestId('layer-quality-score')).toHaveTextContent('0')
      expect(screen.getByTestId('layer-value-score')).toHaveTextContent('0')
    })

    it('should handle all perfect scores', () => {
      const perfectScore: LayerScore = {
        quality: 100,
        valuation: 100,
        growth: 100,
        technical: 100,
      }

      render(<LayerScores layerScore={perfectScore} />)

      expect(screen.getByTestId('layer-quality-score')).toHaveTextContent('100')
      expect(screen.getByTestId('layer-value-score')).toHaveTextContent('100')
    })

    it('should handle negative scores (clamp to 0)', () => {
      const negativeScore: LayerScore = {
        quality: -10,
        valuation: 50,
        growth: 50,
        technical: 50,
      }

      render(<LayerScores layerScore={negativeScore} />)

      expect(screen.getByTestId('layer-quality-score')).toHaveTextContent('0')
    })

    it('should handle scores above 100 (clamp to 100)', () => {
      const highScore: LayerScore = {
        quality: 150,
        valuation: 50,
        growth: 50,
        technical: 50,
      }

      render(<LayerScores layerScore={highScore} />)

      expect(screen.getByTestId('layer-quality-score')).toHaveTextContent('100')
    })
  })

  describe('Animation', () => {
    it('should have animation class for progress fill', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const qualityProgress = screen.getByTestId('layer-quality-progress')
      expect(qualityProgress).toHaveClass('transition-all')
    })
  })

  describe('Layout Structure', () => {
    it('should render all layers in correct order', () => {
      render(<LayerScores layerScore={mockFourLayerScore} />)

      const container = screen.getByTestId('layer-scores')
      const layers = container.querySelectorAll('[data-testid^="layer-"]')

      expect(layers).toHaveLength(4)
      expect(layers[0]).toHaveAttribute('data-testid', 'layer-quality')
      expect(layers[1]).toHaveAttribute('data-testid', 'layer-value')
      expect(layers[2]).toHaveAttribute('data-testid', 'layer-growth')
      expect(layers[3]).toHaveAttribute('data-testid', 'layer-technical')
    })

    it('should have consistent spacing between layers', () => {
      const { container } = render(<LayerScores layerScore={mockFourLayerScore} />)

      const spacedElements = container.querySelectorAll('.gap-4, .gap-6')
      expect(spacedElements.length).toBeGreaterThan(0)
    })
  })
})
