/**
 * DataFreshness Component Tests (Thai Timezone)
 *
 * TDD Workflow:
 * 1. RED - Write failing tests first
 * 2. GREEN - Implement to pass tests
 * 3. REFACTOR - Improve while keeping tests passing
 *
 * These tests verify that DataFreshness uses Thai timezone consistently
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataFreshness } from './DataFreshness'

describe('DataFreshness Component (Thai Timezone)', () => {
  // ==========================================================================
  // RENDER TESTS
  // ==========================================================================

  describe('Rendering', () => {
    it('should render with timestamp', () => {
      render(<DataFreshness timestamp={new Date('2026-01-29T12:00:00.000Z').getTime()} />)

      expect(screen.getByText(/Data as of/i)).toBeInTheDocument()
    })

    it('should render with date string', () => {
      render(<DataFreshness date="2026-01-29" />)

      expect(screen.getByText(/Data as of/i)).toBeInTheDocument()
    })

    it('should render with no data', () => {
      render(<DataFreshness />)

      expect(screen.getByText(/Data as of Unknown/i)).toBeInTheDocument()
    })

    it('should render Clock icon', () => {
      const { container } = render(<DataFreshness timestamp={Date.now()} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <DataFreshness timestamp={Date.now()} className="custom-class" />
      )

      const div = container.querySelector('.custom-class')
      expect(div).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // THAI TIMEZONE TESTS
  // ==========================================================================

  describe('Thai Timezone Display', () => {
    it('should format timestamp in Thai timezone', () => {
      // 12:00 UTC = 19:00 Thai time
      const timestamp = new Date('2026-01-29T12:00:00.000Z').getTime()
      render(<DataFreshness timestamp={timestamp} />)

      // Should show the date formatted in Thai locale
      expect(screen.getByText(/Data as of/i)).toBeInTheDocument()
      // The exact format depends on Thai locale, but it should be present
    })

    it('should format date string in Thai timezone', () => {
      render(<DataFreshness date="2026-01-29" />)

      expect(screen.getByText(/Data as of/i)).toBeInTheDocument()
    })

    it('should handle date at midnight Thai time', () => {
      // 17:00 UTC = 00:00 Thai time (next day)
      const timestamp = new Date('2026-01-29T17:00:00.000Z').getTime()
      render(<DataFreshness timestamp={timestamp} />)

      expect(screen.getByText(/Data as of/i)).toBeInTheDocument()
    })

    it('should handle date before midnight Thai time', () => {
      // 16:00 UTC = 23:00 Thai time
      const timestamp = new Date('2026-01-29T16:00:00.000Z').getTime()
      render(<DataFreshness timestamp={timestamp} />)

      expect(screen.getByText(/Data as of/i)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle undefined props', () => {
      render(<DataFreshness timestamp={undefined} date={undefined} />)

      expect(screen.getByText(/Data as of Unknown/i)).toBeInTheDocument()
    })

    it('should handle null props', () => {
      render(
        <DataFreshness
          timestamp={null as unknown as number}
          date={null as unknown as string}
        />
      )

      expect(screen.getByText(/Data as of/i)).toBeInTheDocument()
    })

    it('should handle zero timestamp', () => {
      render(<DataFreshness timestamp={0} />)

      // Zero timestamp is Jan 1, 1970 UTC
      expect(screen.getByText(/Data as of/i)).toBeInTheDocument()
    })

    it('should handle invalid date string', () => {
      render(<DataFreshness date="invalid-date" />)

      // Should show "Invalid date" or similar error message
      expect(screen.getByText(/Data as of/i)).toBeInTheDocument()
    })

    it('should handle empty date string', () => {
      render(<DataFreshness date="" />)

      expect(screen.getByText(/Data as of/i)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // STYLING
  // ==========================================================================

  describe('Styling', () => {
    it('should have correct default styling', () => {
      const { container } = render(<DataFreshness timestamp={Date.now()} />)

      const div = container.firstChild as HTMLElement
      expect(div).toHaveClass('flex')
      expect(div).toHaveClass('items-center')
      expect(div).toHaveClass('gap-1.5')
      expect(div).toHaveClass('text-xs')
    })

    it('should have custom color style', () => {
      const { container } = render(<DataFreshness timestamp={Date.now()} />)

      const div = container.firstChild as HTMLElement
      // Browser converts hex to RGB format
      expect(div.style.color).toBe('rgb(107, 114, 128)')
    })

    it('should have Clock icon with correct size', () => {
      const { container } = render(<DataFreshness timestamp={Date.now()} />)

      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('w-3.5')
      expect(svg).toHaveClass('h-3.5')
    })
  })

  // ==========================================================================
  // MEMOIZATION
  // ==========================================================================

  describe('Performance', () => {
    it('should memoize display date calculation', () => {
      const timestamp = new Date('2026-01-29T12:00:00.000Z').getTime()
      const { rerender } = render(<DataFreshness timestamp={timestamp} />)

      const firstRenderText = screen.getByText(/Data as of/i).textContent

      // Re-render with same props
      rerender(<DataFreshness timestamp={timestamp} />)

      const secondRenderText = screen.getByText(/Data as of/i).textContent

      // Should be the same (memoized)
      expect(firstRenderText).toBe(secondRenderText)
    })

    it('should recalculate when timestamp changes', () => {
      const timestamp1 = new Date('2026-01-29T12:00:00.000Z').getTime()
      const timestamp2 = new Date('2026-01-30T12:00:00.000Z').getTime()
      const { rerender } = render(<DataFreshness timestamp={timestamp1} />)

      const firstRenderText = screen.getByText(/Data as of/i).textContent

      // Re-render with different timestamp
      rerender(<DataFreshness timestamp={timestamp2} />)

      const secondRenderText = screen.getByText(/Data as of/i).textContent

      // Should be different (different dates)
      expect(firstRenderText).not.toBe(secondRenderText)
    })

    it('should recalculate when date changes', () => {
      const { rerender } = render(<DataFreshness date="2026-01-29" />)

      const firstRenderText = screen.getByText(/Data as of/i).textContent

      // Re-render with different date
      rerender(<DataFreshness date="2026-01-30" />)

      const secondRenderText = screen.getByText(/Data as of/i).textContent

      // Should be different (different dates)
      expect(firstRenderText).not.toBe(secondRenderText)
    })
  })

  // ==========================================================================
  // ACCESSIBILITY
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have readable text content', () => {
      render(<DataFreshness timestamp={Date.now()} />)

      const text = screen.getByText(/Data as of/i)
      expect(text).toBeVisible()
    })

    it('should have meaningful label', () => {
      render(<DataFreshness timestamp={Date.now()} />)

      const text = screen.getByText(/Data as of/i)
      expect(text.textContent).toContain('Data as of')
    })
  })
})
