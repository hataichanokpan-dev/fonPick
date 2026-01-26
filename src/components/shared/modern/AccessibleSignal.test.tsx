/**
 * AccessibleSignal Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AccessibleSignal } from './AccessibleSignal'

describe('AccessibleSignal', () => {
  describe('Rendering', () => {
    it('renders up signal correctly', () => {
      const { container } = render(
        <AccessibleSignal type="up" label="Change" value="+2.5%" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('aria-label', 'up: Change: +2.5%')
    })

    it('renders down signal correctly', () => {
      const { container } = render(
        <AccessibleSignal type="down" label="Change" value="-1.2%" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('aria-label', 'down: Change: -1.2%')
    })

    it('renders neutral signal correctly', () => {
      const { container } = render(
        <AccessibleSignal type="neutral" label="Price" value="125.50" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('aria-label', 'neutral: Price: 125.50')
    })

    it('renders without label when not provided', () => {
      const { container } = render(
        <AccessibleSignal type="up" value="+2.5%" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toHaveAttribute('aria-label', 'up: +2.5%')
    })

    it('renders without value when not provided', () => {
      const { container } = render(
        <AccessibleSignal type="up" label="Trending Up" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toHaveAttribute('aria-label', 'up: Trending Up')
    })

    it('renders icon only when showIcon is true and no label/value', () => {
      const { container } = render(
        <AccessibleSignal type="up" showIcon />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toHaveAttribute('aria-label', 'up')
    })
  })

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      const { container } = render(
        <AccessibleSignal type="up" value="+2.5%" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toBeInTheDocument()
    })

    it('generates proper ARIA labels', () => {
      const { container } = render(
        <AccessibleSignal type="down" label="Volume" value="-1.2M" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toHaveAttribute('aria-label', 'down: Volume: -1.2M')
    })

    it('includes pattern overlay with aria-hidden by default', () => {
      const { container } = render(
        <AccessibleSignal type="up" value="+2.5%" showPattern />
      )
      const svg = container.querySelector('svg[aria-hidden="true"]')
      expect(svg).toBeInTheDocument()
    })

    it('hides pattern when showPattern is false', () => {
      const { container } = render(
        <AccessibleSignal type="up" value="+2.5%" showPattern={false} />
      )
      const svg = container.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies correct background class for up signal', () => {
      const { container } = render(
        <AccessibleSignal type="up" value="+2.5%" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toHaveClass('bg-up-soft')
    })

    it('applies correct background class for down signal', () => {
      const { container } = render(
        <AccessibleSignal type="down" value="-1.2%" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toHaveClass('bg-down-soft')
    })

    it('applies correct background class for neutral signal', () => {
      const { container } = render(
        <AccessibleSignal type="neutral" value="0%" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toHaveClass('bg-surface-2')
    })

    it('applies custom className when provided', () => {
      const { container } = render(
        <AccessibleSignal type="up" value="+2.5%" className="custom-class" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toHaveClass('custom-class')
    })
  })

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      const { container } = render(
        <AccessibleSignal type="up" value="+2.5%" size="sm" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toHaveClass('px-2', 'py-1')
    })

    it('renders medium size correctly', () => {
      const { container } = render(
        <AccessibleSignal type="up" value="+2.5%" size="md" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toHaveClass('px-3', 'py-1.5')
    })

    it('renders large size correctly', () => {
      const { container } = render(
        <AccessibleSignal type="up" value="+2.5%" size="lg" />
      )
      const element = container.querySelector('[role="status"]')
      expect(element).toHaveClass('px-4', 'py-2')
    })
  })

  describe('Icons', () => {
    it('shows icon by default', () => {
      const { container } = render(
        <AccessibleSignal type="up" value="+2.5%" />
      )
      const svg = container.querySelector('svg.lucide')
      expect(svg).toBeInTheDocument()
    })

    it('hides icon when showIcon is false', () => {
      const { container } = render(
        <AccessibleSignal type="up" value="+2.5%" showIcon={false} />
      )
      const iconSvg = container.querySelector('.lucide')
      expect(iconSvg).not.toBeInTheDocument()
    })
  })

  describe('Patterns', () => {
    it('shows diagonal stripe pattern for up signal', () => {
      const { container } = render(
        <AccessibleSignal type="up" value="+2.5%" showPattern />
      )
      const patternId = container.querySelector('pattern[id*="diagonal-stripe-up"]')
      expect(patternId).toBeInTheDocument()
    })

    it('shows diagonal stripe pattern for down signal', () => {
      const { container } = render(
        <AccessibleSignal type="down" value="-1.2%" showPattern />
      )
      const patternId = container.querySelector('pattern[id*="diagonal-stripe-down"]')
      expect(patternId).toBeInTheDocument()
    })

    it('shows dot pattern for neutral signal', () => {
      const { container } = render(
        <AccessibleSignal type="neutral" value="0%" showPattern />
      )
      const circle = container.querySelector('circle')
      expect(circle).toBeInTheDocument()
    })
  })

  describe('Values', () => {
    it('displays string values correctly', () => {
      render(<AccessibleSignal type="up" value="+2.5%" />)
      expect(screen.getByText('+2.5%')).toBeInTheDocument()
    })

    it('displays number values correctly', () => {
      render(<AccessibleSignal type="up" value={2.5} />)
      expect(screen.getByText('2.5')).toBeInTheDocument()
    })

    it('displays label and value with separator', () => {
      render(<AccessibleSignal type="up" label="Change" value="+2.5%" />)
      expect(screen.getByText('Change')).toBeInTheDocument()
      expect(screen.getByText('+2.5%')).toBeInTheDocument()
    })
  })
})
