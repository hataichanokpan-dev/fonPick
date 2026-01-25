/**
 * CompactSectionLabel Component Tests
 *
 * TDD Approach:
 * 1. RED - Write failing tests first
 * 2. GREEN - Implement component to pass tests
 * 3. REFACTOR - Clean up while keeping tests passing
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompactSectionLabel } from './CompactSectionLabel'

describe('CompactSectionLabel', () => {
  describe('renders basic structure', () => {
    it('should render the component without crashing', () => {
      const { container } = render(<CompactSectionLabel priority="P0" label="Test Label" />)

      // Component should be in the DOM
      expect(container.firstChild).toBeTruthy()
    })

    it('should display the priority text', () => {
      render(<CompactSectionLabel priority="P0" label="Test Label" />)

      expect(screen.getByText('P0')).toBeInTheDocument()
    })

    it('should display the label text', () => {
      render(<CompactSectionLabel priority="P1" label="Sector Analysis" />)

      expect(screen.getByText('Sector Analysis')).toBeInTheDocument()
    })

    it('should display separator between priority and label', () => {
      const { container } = render(<CompactSectionLabel priority="P2" label="Active Stocks" />)

      // Should contain the "/" separator
      expect(container.textContent).toContain('/')
    })
  })

  describe('applies correct color coding for priorities', () => {
    it('should apply teal/up-primary color for P0', () => {
      const { container } = render(<CompactSectionLabel priority="P0" label="Test" />)

      // Check for teal color classes (up-primary)
      const element = container.querySelector('.text-up-primary')
      expect(element).toBeInTheDocument()
    })

    it('should apply blue/accent-blue color for P1', () => {
      const { container } = render(<CompactSectionLabel priority="P1" label="Test" />)

      // Check for blue color classes (accent-blue)
      const element = container.querySelector('.text-accent-blue')
      expect(element).toBeInTheDocument()
    })

    it('should apply yellow/warn color for P2', () => {
      const { container } = render(<CompactSectionLabel priority="P2" label="Test" />)

      // Check for yellow color classes (warn)
      const element = container.querySelector('.text-warn')
      expect(element).toBeInTheDocument()
    })
  })

  describe('inline layout with small gap', () => {
    it('should apply inline-flex layout', () => {
      const { container } = render(<CompactSectionLabel priority="P0" label="Test" />)

      const flexContainer = container.querySelector('.inline-flex')
      expect(flexContainer).toBeInTheDocument()
    })

    it('should apply items-center alignment', () => {
      const { container } = render(<CompactSectionLabel priority="P0" label="Test" />)

      const element = container.querySelector('.items-center')
      expect(element).toBeInTheDocument()
    })

    it('should apply small gap', () => {
      const { container } = render(<CompactSectionLabel priority="P0" label="Test" />)

      const element = container.querySelector('.gap-1')
      expect(element).toBeInTheDocument()
    })
  })

  describe('priority styling', () => {
    it('should render priority in small font (10px)', () => {
      const { container } = render(<CompactSectionLabel priority="P0" label="Test" />)

      // Check for text-xs class (approximately 12px, closest Tailwind class)
      const element = container.querySelector('.text-xs')
      expect(element).toBeInTheDocument()
    })

    it('should apply opacity to priority text', () => {
      const { container } = render(<CompactSectionLabel priority="P0" label="Test" />)

      // Check for opacity class (70% opacity)
      const element = container.querySelector('.opacity-70')
      expect(element).toBeInTheDocument()
    })
  })

  describe('compact height', () => {
    it('should have compact height (16px)', () => {
      const { container } = render(<CompactSectionLabel priority="P0" label="Test" />)

      // The component should have height-related classes
      const element = container.firstChild as HTMLElement

      // Should be a compact element (no large padding or margin)
      expect(element).toBeTruthy()
      expect(element?.className).not.toContain('mb-3') // No large bottom margin like PrioritySectionLabel
    })
  })

  describe('custom className support', () => {
    it('should apply custom className when provided', () => {
      const { container } = render(
        <CompactSectionLabel priority="P0" label="Test" className="custom-class" />
      )

      const element = container.querySelector('.custom-class')
      expect(element).toBeInTheDocument()
    })

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <CompactSectionLabel priority="P0" label="Test" className="mt-4 custom-class" />
      )

      const element = container.firstChild as HTMLElement
      expect(element?.className).toContain('mt-4')
      expect(element?.className).toContain('custom-class')
      expect(element?.className).toContain('flex') // Default class should still be present
    })
  })

  describe('valid priority values', () => {
    it('should accept P0 as valid priority', () => {
      expect(() => render(<CompactSectionLabel priority="P0" label="Test" />)).not.toThrow()
    })

    it('should accept P1 as valid priority', () => {
      expect(() => render(<CompactSectionLabel priority="P1" label="Test" />)).not.toThrow()
    })

    it('should accept P2 as valid priority', () => {
      expect(() => render(<CompactSectionLabel priority="P2" label="Test" />)).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle empty label gracefully', () => {
      const { container } = render(<CompactSectionLabel priority="P0" label="" />)

      expect(container.firstChild).toBeTruthy()
      expect(screen.getByText('P0')).toBeInTheDocument()
    })

    it('should handle special characters in label', () => {
      render(<CompactSectionLabel priority="P0" label="Test & Analysis (2024)" />)

      expect(screen.getByText('Test & Analysis (2024)')).toBeInTheDocument()
    })

    it('should handle long label text', () => {
      const longLabel = 'This is a very long section label that might wrap on smaller screens'
      render(<CompactSectionLabel priority="P0" label={longLabel} />)

      expect(screen.getByText(longLabel)).toBeInTheDocument()
    })

    it('should handle unicode characters in label', () => {
      render(<CompactSectionLabel priority="P0" label="การวิเคราะห์ภาคส่วน" />)

      expect(screen.getByText('การวิเคราะห์ภาคส่วน')).toBeInTheDocument()
    })
  })

  describe('visual hierarchy', () => {
    it('should maintain inline layout without line breaks', () => {
      const { container } = render(<CompactSectionLabel priority="P0" label="Test Label" />)

      // Should have inline-flex to keep everything on one line
      const element = container.querySelector('.inline-flex')
      expect(element).toBeInTheDocument()
    })

    it('should have compact spacing (16px height vs 32px)', () => {
      const { container } = render(<CompactSectionLabel priority="P0" label="Test" />)

      // Should NOT have the taller padding of PrioritySectionLabel
      const element = container.firstChild as HTMLElement
      expect(element?.className).not.toContain('py-1')
      expect(element?.className).not.toContain('px-2')
    })
  })

  describe('accessibility', () => {
    it('should be readable by screen readers', () => {
      render(<CompactSectionLabel priority="P0" label="Market Overview" />)

      // Both priority and label should be in the document
      expect(screen.getByText('P0')).toBeInTheDocument()
      expect(screen.getByText('Market Overview')).toBeInTheDocument()
    })

    it('should have proper text contrast (priority with opacity)', () => {
      const { container } = render(<CompactSectionLabel priority="P0" label="Test" />)

      // Priority should have opacity class
      const priorityElement = container.querySelector('.text-up-primary.opacity-70')
      expect(priorityElement).toBeInTheDocument()
    })
  })
})
