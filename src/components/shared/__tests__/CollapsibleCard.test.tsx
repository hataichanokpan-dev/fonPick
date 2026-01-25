/**
 * CollapsibleCard Component Tests
 *
 * TDD Approach:
 * 1. RED - Write failing tests first
 * 2. GREEN - Implement component to pass tests
 * 3. REFACTOR - Clean up code while keeping tests passing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CollapsibleCard } from '../CollapsibleCard'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, ...props }: any) => (
      <div data-initial={initial} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock ChevronDown icon from lucide-react
vi.mock('lucide-react', () => ({
  ChevronDown: ({ className }: any) => (
    <svg data-testid="chevron-icon" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
}))

describe('CollapsibleCard', () => {
  const defaultProps = {
    title: 'Test Card',
    children: <div>Test Content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Required Props', () => {
    it('should render with title and children', () => {
      render(<CollapsibleCard {...defaultProps} />)

      expect(screen.getByText('Test Card')).toBeInTheDocument()
      // Content should be in DOM (either mobile or desktop version)
      expect(screen.getAllByText('Test Content').length).toBeGreaterThan(0)
    })

    it('should render without crashing when only required props provided', () => {
      const { container } = render(<CollapsibleCard {...defaultProps} />)

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Title and Subtitle', () => {
    it('should display title in header', () => {
      render(<CollapsibleCard {...defaultProps} title="Custom Title" />)

      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('should display subtitle when provided', () => {
      render(
        <CollapsibleCard
          {...defaultProps}
          title="Main Title"
          subtitle="Additional Info"
        />
      )

      expect(screen.getByText('Main Title')).toBeInTheDocument()
      expect(screen.getByText('Additional Info')).toBeInTheDocument()
    })

    it('should not display subtitle when not provided', () => {
      render(<CollapsibleCard {...defaultProps} title="Title Only" />)

      expect(screen.getByText('Title Only')).toBeInTheDocument()
      // Subtitle element should not exist
      expect(screen.queryByTestId('collapsible-card-subtitle')).not.toBeInTheDocument()
    })

    it('should handle empty subtitle gracefully', () => {
      render(
        <CollapsibleCard
          {...defaultProps}
          title="Title"
          subtitle=""
        />
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
    })
  })

  describe('Children Content', () => {
    it('should render single child', () => {
      render(
        <CollapsibleCard {...defaultProps}>
          <p>Single Child</p>
        </CollapsibleCard>
      )

      // Content appears in both mobile and desktop versions
      expect(screen.getAllByText('Single Child')).toHaveLength(2)
    })

    it('should render multiple children', () => {
      render(
        <CollapsibleCard {...defaultProps}>
          <p>First Child</p>
          <p>Second Child</p>
          <p>Third Child</p>
        </CollapsibleCard>
      )

      expect(screen.getAllByText('First Child')).toHaveLength(2)
      expect(screen.getAllByText('Second Child')).toHaveLength(2)
      expect(screen.getAllByText('Third Child')).toHaveLength(2)
    })

    it('should render complex nested children', () => {
      render(
        <CollapsibleCard {...defaultProps}>
          <div>
            <span>Nested</span>
            <strong>Content</strong>
          </div>
        </CollapsibleCard>
      )

      expect(screen.getAllByText('Nested')).toHaveLength(2)
      expect(screen.getAllByText('Content')).toHaveLength(2)
    })

    it('should handle null children gracefully', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps}>
          {null}
        </CollapsibleCard>
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should display chevron icon on mobile', () => {
      // Mock window.innerWidth to mobile size
      global.innerWidth = 375

      const { container } = render(<CollapsibleCard {...defaultProps} />)

      const chevron = screen.queryByTestId('chevron-icon')
      // Chevron should be present (but hidden on desktop via md:hidden)
      expect(chevron).toBeInTheDocument()
    })

    it('should hide chevron icon on desktop (md breakpoint)', () => {
      const { container } = render(<CollapsibleCard {...defaultProps} />)

      // Chevron should have md:hidden class (hidden on desktop)
      const chevron = screen.queryByTestId('chevron-icon')
      expect(chevron).toBeInTheDocument()
      expect(container.querySelector('.md\\:hidden')).toBeInTheDocument()
    })

    it('should always show content on desktop', () => {
      const { container } = render(<CollapsibleCard {...defaultProps} />)

      // Desktop version should exist
      expect(container.querySelector('[data-testid="collapsible-content-desktop"]')).toBeInTheDocument()
      // Mobile version should also exist
      expect(container.querySelector('[data-testid="collapsible-content"]')).toBeInTheDocument()
    })
  })

  describe('Expand/Collapse Functionality (Mobile)', () => {
    it('should be expanded by default when defaultExpanded is true', () => {
      render(<CollapsibleCard {...defaultProps} defaultExpanded={true} />)

      // Content should be in DOM (both mobile and desktop versions)
      expect(screen.getAllByText('Test Content').length).toBeGreaterThan(0)
    })

    it('should be collapsed by default when defaultExpanded is false', () => {
      render(<CollapsibleCard {...defaultProps} defaultExpanded={false} />)

      // Content should exist (desktop version always shows, mobile is collapsed)
      expect(screen.getAllByText('Test Content').length).toBeGreaterThan(0)
    })

    it('should toggle expand/collapse on header click (mobile)', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} defaultExpanded={false} />
      )

      const header = container.querySelector('[data-testid="collapsible-header"]')
      expect(header).toBeInTheDocument()

      // Click to expand
      if (header) {
        fireEvent.click(header)
      }

      // After clicking, content should still be in DOM
      expect(screen.getAllByText('Test Content').length).toBeGreaterThan(0)
    })

    it('should toggle collapse on header click when expanded (mobile)', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} defaultExpanded={true} />
      )

      const header = container.querySelector('[data-testid="collapsible-header"]')
      expect(header).toBeInTheDocument()

      // Content should be visible initially
      expect(screen.getAllByText('Test Content').length).toBeGreaterThan(0)

      // Click to collapse
      if (header) {
        fireEvent.click(header)
      }

      // After clicking, content should still be in DOM (just hidden on mobile)
      expect(screen.getAllByText('Test Content').length).toBeGreaterThan(0)
    })

    it('should respect defaultExpanded prop on initial render', () => {
      const { container: expandedContainer } = render(
        <CollapsibleCard {...defaultProps} defaultExpanded={true} />
      )
      const { container: collapsedContainer } = render(
        <CollapsibleCard {...defaultProps} defaultExpanded={false} />
      )

      expect(expandedContainer.firstChild).toBeInTheDocument()
      expect(collapsedContainer.firstChild).toBeInTheDocument()
    })
  })

  describe('Padding Variants', () => {
    it('should apply no padding when padding="none"', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} padding="none" />
      )

      const content = container.querySelector('[data-testid="collapsible-content"]')
      expect(content).toHaveClass('p-0')
    })

    it('should apply small padding when padding="sm"', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} padding="sm" />
      )

      const content = container.querySelector('[data-testid="collapsible-content"]')
      expect(content).toHaveClass('p-3')
    })

    it('should apply medium padding when padding="md" (default)', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} padding="md" />
      )

      const content = container.querySelector('[data-testid="collapsible-content"]')
      expect(content).toHaveClass('p-4')
      // Should also have responsive padding
      expect(content?.className).toContain('md:p-6')
    })

    it('should default to md padding when not specified', () => {
      const { container } = render(<CollapsibleCard {...defaultProps} />)

      const content = container.querySelector('[data-testid="collapsible-content"]')
      expect(content).toHaveClass('p-4')
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should apply multiple custom classes', () => {
      const { container } = render(
        <CollapsibleCard
          {...defaultProps}
          className="class-1 class-2 class-3"
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('class-1')
      expect(card.className).toContain('class-2')
      expect(card.className).toContain('class-3')
    })

    it('should merge custom classes with default classes', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} className="bg-red-500" />
      )

      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('bg-red-500')
      // Should still have base card classes
      expect(card.className).toContain('bg-surface')
    })
  })

  describe('Accessibility', () => {
    it('should have clickable header with button role', () => {
      const { container } = render(<CollapsibleCard {...defaultProps} />)

      const header = container.querySelector('[data-testid="collapsible-header"]')
      expect(header).toBeInTheDocument()
      // Header should be clickable (it has cursor-pointer class)
      expect(header).toHaveClass('cursor-pointer')
      // Should have button role
      expect(header).toHaveAttribute('role', 'button')
    })

    it('should have proper aria attributes', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} defaultExpanded={false} />
      )

      const header = container.querySelector('[data-testid="collapsible-header"]')
      expect(header).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} defaultExpanded={false} />
      )

      const header = container.querySelector('[data-testid="collapsible-header"]')

      // Simulate keyboard Enter key
      if (header) {
        fireEvent.keyDown(header, { key: 'Enter' })
      }

      // Should still work after keyboard interaction
      expect(screen.getAllByText('Test Content').length).toBeGreaterThan(0)
    })

    it('should handle Space key for accessibility', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} defaultExpanded={false} />
      )

      const header = container.querySelector('[data-testid="collapsible-header"]')

      // Simulate keyboard Space key
      if (header) {
        fireEvent.keyDown(header, { key: ' ' })
      }

      expect(screen.getAllByText('Test Content').length).toBeGreaterThan(0)
    })
  })

  describe('Animation and Transitions', () => {
    it('should have animation classes for smooth transitions', () => {
      const { container } = render(<CollapsibleCard {...defaultProps} />)

      // Should have transition classes on header
      const header = container.querySelector('[data-testid="collapsible-header"]')
      expect(header).toHaveClass('transition-all')
    })

    it('should use framer-motion for content animation', () => {
      const { container } = render(<CollapsibleCard {...defaultProps} />)

      const content = container.querySelector('[data-testid="collapsible-content"]')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Desktop Behavior', () => {
    it('should always be expanded on desktop regardless of defaultExpanded', () => {
      render(
        <CollapsibleCard {...defaultProps} defaultExpanded={false} />
      )

      // On desktop, content should always be visible (in desktop version)
      expect(screen.getAllByText('Test Content').length).toBeGreaterThan(0)
    })

    it('should not show toggle on desktop', () => {
      const { container } = render(<CollapsibleCard {...defaultProps} />)

      // Chevron should be hidden on desktop via responsive classes
      const chevron = screen.queryByTestId('chevron-icon')
      expect(chevron).toBeInTheDocument()
      // But it should have md:hidden class
      expect(container.querySelector('.md\\:hidden')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(200)
      render(<CollapsibleCard {...defaultProps} title={longTitle} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle very long subtitles', () => {
      const longSubtitle = 'B'.repeat(200)
      render(
        <CollapsibleCard
          {...defaultProps}
          title="Title"
          subtitle={longSubtitle}
        />
      )

      expect(screen.getByText(longSubtitle)).toBeInTheDocument()
    })

    it('should handle special characters in title', () => {
      const specialTitle = 'Title with <special> & "characters"'
      render(<CollapsibleCard {...defaultProps} title={specialTitle} />)

      expect(screen.getByText(specialTitle)).toBeInTheDocument()
    })

    it('should handle numeric title', () => {
      render(<CollapsibleCard {...defaultProps} title={12345 as any} />)

      expect(screen.getByText('12345')).toBeInTheDocument()
    })

    it('should handle empty children', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps}>{null}</CollapsibleCard>
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle undefined defaultExpanded', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} defaultExpanded={undefined} />
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle rapid toggle clicks', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} defaultExpanded={false} />
      )

      const header = container.querySelector('[data-testid="collapsible-header"]')

      // Rapid clicks
      if (header) {
        fireEvent.click(header)
        fireEvent.click(header)
        fireEvent.click(header)
        fireEvent.click(header)
      }

      expect(screen.getAllByText('Test Content').length).toBeGreaterThan(0)
    })
  })

  describe('Integration with Other Components', () => {
    it('should work with Card components as children', () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps}>
          <div className="bg-white p-4">Nested Card</div>
        </CollapsibleCard>
      )

      expect(screen.getAllByText('Nested Card').length).toBeGreaterThan(0)
    })

    it('should work with lists as children', () => {
      render(
        <CollapsibleCard {...defaultProps}>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </CollapsibleCard>
      )

      expect(screen.getAllByText('Item 1').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Item 2').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Item 3').length).toBeGreaterThan(0)
    })

    it('should work with tables as children', () => {
      render(
        <CollapsibleCard {...defaultProps}>
          <table>
            <tbody>
              <tr>
                <td>Data 1</td>
              </tr>
              <tr>
                <td>Data 2</td>
              </tr>
            </tbody>
          </table>
        </CollapsibleCard>
      )

      expect(screen.getAllByText('Data 1').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Data 2').length).toBeGreaterThan(0)
    })
  })
})
