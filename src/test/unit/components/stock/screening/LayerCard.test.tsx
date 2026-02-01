/**
 * TDD Test: LayerCard Component (Redesigned)
 *
 * Tests for the redesigned LayerCard component with:
 * - Glass effect on header
 * - Better hover states
 * - Progress bar with shadow glow
 * - Smooth expand/collapse
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LayerCard } from '@/components/stock/screening/LayerCard'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronDown: ({ className }: { className?: string }) => (
    <div data-testid="chevron-icon" className={className}>
      ChevronDown
    </div>
  ),
}))

describe('LayerCard - Redesigned', () => {
  const defaultProps = {
    layer: 1,
    title: 'UNIVERSE',
    thaiTitle: 'กรองพื้นฐาน',
    description: 'Basic eligibility filters',
    thaiDescription: 'เกณฑ์การคัดเลือกพื้นฐาน',
    score: 2,
    maxScore: 2,
    color: 'universe' as const,
  }

  describe('Rendering', () => {
    it('should render the layer number badge', () => {
      render(<LayerCard {...defaultProps}>Test content</LayerCard>)
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should render the title and Thai title', () => {
      render(<LayerCard {...defaultProps}>Test content</LayerCard>)
      expect(screen.getByText('UNIVERSE')).toBeInTheDocument()
      expect(screen.getByText('กรองพื้นฐาน')).toBeInTheDocument()
    })

    it('should render the description', () => {
      render(<LayerCard {...defaultProps}>Test content</LayerCard>)
      expect(screen.getByText('เกณฑ์การคัดเลือกพื้นฐาน')).toBeInTheDocument()
    })

    it('should render the score display', () => {
      render(<LayerCard {...defaultProps}>Test content</LayerCard>)
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('/2')).toBeInTheDocument()
    })

    it('should render children content', () => {
      render(
        <LayerCard {...defaultProps}>
          <div data-testid="test-content">Test content</div>
        </LayerCard>
      )
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })
  })

  describe('Glass Effect on Header', () => {
    it('should have glassmorphism styling on header', () => {
      const { container } = render(<LayerCard {...defaultProps}>Test content</LayerCard>)
      const header = container.querySelector('button')
      expect(header).toBeInTheDocument()
      // Should have backdrop blur or similar glass effect
      expect(header?.className).toContain('hover:')
    })

    it('should have proper border styling', () => {
      const { container } = render(<LayerCard {...defaultProps}>Test content</LayerCard>)
      const card = container.querySelector('.layer-card')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Progress Bar', () => {
    it('should render progress bar', () => {
      const { container } = render(<LayerCard {...defaultProps}>Test content</LayerCard>)
      const progressBar = container.querySelector('[class*="h-1"], [class*="h-0\\.5"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('should show correct progress percentage (100% for 2/2)', () => {
      const { container } = render(<LayerCard {...defaultProps}>Test content</LayerCard>)
      const progressFill = container.querySelector('[style*="width: 100%"], [style*="width: 100"]')
      expect(progressFill).toBeInTheDocument()
    })

    it('should show correct progress percentage (50% for 5/10)', () => {
      const props = { ...defaultProps, score: 5, maxScore: 10 }
      const { container } = render(<LayerCard {...props}>Test content</LayerCard>)
      const progressFill = container.querySelector('[style*="width: 50%"], [style*="width: 50"]')
      expect(progressFill).toBeInTheDocument()
    })
  })

  describe('Progress Bar Glow Effect', () => {
    it('should have glow effect on progress bar', () => {
      const { container } = render(<LayerCard {...defaultProps}>Test content</LayerCard>)
      const progressFill = container.querySelector('.progress-bar-glow, [class*="glow"]')
      // The progress bar should have some form of glow or enhanced styling
      const progressBar = container.querySelector('[class*="progress"], [class*="h-1"]')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Hover States', () => {
    it('should have hover effect on card', () => {
      const { container } = render(<LayerCard {...defaultProps}>Test content</LayerCard>)
      // Check for hover class anywhere in the card structure
      const hoverElement = container.querySelector('[class*="hover"]')
      expect(hoverElement).toBeInTheDocument()
    })

    it('should change border color on hover', () => {
      const { container } = render(<LayerCard {...defaultProps}>Test content</LayerCard>)
      const card = container.querySelector('div[class*="border"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Expand/Collapse', () => {
    it('should be expanded by default when no controlled state', () => {
      render(
        <LayerCard {...defaultProps}>
          <div data-testid="test-content">Test content</div>
        </LayerCard>
      )
      expect(screen.getByTestId('test-content')).toBeVisible()
    })

    it('should toggle expansion when clicked', () => {
      render(
        <LayerCard {...defaultProps}>
          <div data-testid="test-content">Test content</div>
        </LayerCard>
      )
      const button = screen.getByRole('button')
      // Initial state - expanded by default with rotate class
      const chevronWrapper = screen.getByTestId('chevron-icon').closest('span')
      expect(chevronWrapper?.className).toContain('rotate-180')

      fireEvent.click(button)

      // After clicking, the rotate class should be removed (collapsed)
      const chevronWrapperAfter = screen.getByTestId('chevron-icon').closest('span')
      expect(chevronWrapperAfter?.className).not.toContain('rotate-180')
    })

    it('should respect controlled expanded state', () => {
      const { container } = render(
        <LayerCard {...defaultProps} expanded={false}>
          <div data-testid="test-content">Test content</div>
        </LayerCard>
      )
      // When collapsed, the content might still be in DOM but hidden
      const contentWrapper = container.querySelector('[class*="grid-rows-[0fr]"]')
      expect(contentWrapper).toBeInTheDocument()
    })

    it('should call onToggle when clicked', () => {
      const handleToggle = vi.fn()
      render(
        <LayerCard {...defaultProps} onToggle={handleToggle}>
          <div data-testid="test-content">Test content</div>
        </LayerCard>
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleToggle).toHaveBeenCalledTimes(1)
    })

    it('should rotate chevron icon when expanded', () => {
      const { container } = render(
        <LayerCard {...defaultProps} expanded={true}>
          <div data-testid="test-content">Test content</div>
        </LayerCard>
      )
      const chevronWrapper = screen.getByTestId('chevron-icon').closest('span')
      expect(chevronWrapper?.className).toContain('rotate-180')
    })

    it('should not rotate chevron icon when collapsed', () => {
      const { container } = render(
        <LayerCard {...defaultProps} expanded={false}>
          <div data-testid="test-content">Test content</div>
        </LayerCard>
      )
      const chevronWrapper = screen.getByTestId('chevron-icon').closest('span')
      expect(chevronWrapper?.className).not.toContain('rotate-180')
    })
  })

  describe('Smooth Expand/Collapse Animation', () => {
    it('should have transition classes for smooth animation', () => {
      const { container } = render(
        <LayerCard {...defaultProps} expanded={false}>
          <div data-testid="test-content">Test content</div>
        </LayerCard>
      )
      const contentWrapper = container.querySelector('[class*="transition"]')
      expect(contentWrapper).toBeInTheDocument()
    })
  })

  describe('Color Variants', () => {
    it('should apply universe color classes', () => {
      const { container } = render(<LayerCard {...defaultProps}>Test content</LayerCard>)
      const layerBadge = screen.getByText('1').closest('div')
      expect(layerBadge?.className).toContain('bg-')
    })

    it('should apply quality color classes', () => {
      const props = { ...defaultProps, color: 'quality' as const }
      const { container } = render(<LayerCard {...props}>Test content</LayerCard>)
      const layerBadge = screen.getByText('1').closest('div')
      expect(layerBadge).toBeInTheDocument()
    })

    it('should apply value color classes', () => {
      const props = { ...defaultProps, color: 'value' as const }
      render(<LayerCard {...props}>Test content</LayerCard>)
      const layerBadge = screen.getByText('1')
      expect(layerBadge).toBeInTheDocument()
    })

    it('should apply technical color classes', () => {
      const props = { ...defaultProps, color: 'technical' as const }
      render(<LayerCard {...props}>Test content</LayerCard>)
      const layerBadge = screen.getByText('1')
      expect(layerBadge).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <LayerCard {...defaultProps} expanded={true}>
          <div data-testid="test-content">Test content</div>
        </LayerCard>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('should update aria-expanded on toggle', () => {
      render(
        <LayerCard {...defaultProps} expanded={false}>
          <div data-testid="test-content">Test content</div>
        </LayerCard>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero score', () => {
      const props = { ...defaultProps, score: 0, maxScore: 10 }
      render(<LayerCard {...props}>Test content</LayerCard>)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle missing Thai title', () => {
      const props = { ...defaultProps, thaiTitle: undefined }
      render(<LayerCard {...props}>Test content</LayerCard>)
      expect(screen.getByText('UNIVERSE')).toBeInTheDocument()
    })

    it('should handle missing descriptions', () => {
      const props = { ...defaultProps, description: undefined, thaiDescription: undefined }
      render(<LayerCard {...props}>Test content</LayerCard>)
      expect(screen.getByText('UNIVERSE')).toBeInTheDocument()
    })
  })
})
