/**
 * AnalysisSection Component Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Component renders correctly
 * - Collapsible header with title
 * - Loading state
 * - Error state
 * - Children content display
 * - Default expanded/collapsed state
 * - Toggle functionality
 * - Accessibility (ARIA attributes)
 * - Responsive layout
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AnalysisSection } from './AnalysisSection'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('AnalysisSection Component', () => {
  describe('Rendering', () => {
    it('should render analysis section component', () => {
      render(
        <AnalysisSection title="Test Section">
          <div>Test Content</div>
        </AnalysisSection>
      )

      const section = screen.getByTestId('analysis-section')
      expect(section).toBeInTheDocument()
    })

    it('should display title', () => {
      render(
        <AnalysisSection title="Fundamental Analysis">
          <div>Content</div>
        </AnalysisSection>
      )

      const title = screen.getByTestId('analysis-section-title')
      expect(title).toHaveTextContent('Fundamental Analysis')
    })

    it('should display children content', () => {
      render(
        <AnalysisSection title="Test Section">
          <div data-testid="test-content">Test Content</div>
        </AnalysisSection>
      )

      const content = screen.getByTestId('test-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveTextContent('Test Content')
    })
  })

  describe('Loading State', () => {
    it('should show loading state when isLoading is true', () => {
      render(
        <AnalysisSection title="Test Section" isLoading>
          <div>Content</div>
        </AnalysisSection>
      )

      const loading = screen.getByTestId('analysis-section-loading')
      expect(loading).toBeInTheDocument()
    })

    it('should hide content when loading', () => {
      render(
        <AnalysisSection title="Test Section" isLoading>
          <div data-testid="test-content">Content</div>
        </AnalysisSection>
      )

      const content = screen.queryByTestId('test-content')
      expect(content).not.toBeInTheDocument()
    })

    it('should display loading spinner', () => {
      render(
        <AnalysisSection title="Test Section" isLoading>
          <div>Content</div>
        </AnalysisSection>
      )

      const spinner = screen.getByTestId('analysis-section-spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error state when error is provided', () => {
      const errorMessage = 'Failed to load data'

      render(
        <AnalysisSection title="Test Section" error={errorMessage}>
          <div>Content</div>
        </AnalysisSection>
      )

      const error = screen.getByTestId('analysis-section-error')
      expect(error).toBeInTheDocument()
      expect(error).toHaveTextContent(errorMessage)
    })

    it('should hide content when error exists', () => {
      render(
        <AnalysisSection title="Test Section" error="Error message">
          <div data-testid="test-content">Content</div>
        </AnalysisSection>
      )

      const content = screen.queryByTestId('test-content')
      expect(content).not.toBeInTheDocument()
    })

    it('should display error icon', () => {
      render(
        <AnalysisSection title="Test Section" error="Error message">
          <div>Content</div>
        </AnalysisSection>
      )

      const errorIcon = screen.getByTestId('analysis-section-error-icon')
      expect(errorIcon).toBeInTheDocument()
    })
  })

  describe('Collapsible Behavior', () => {
    it('should be expanded by default', () => {
      render(
        <AnalysisSection title="Test Section">
          <div data-testid="test-content">Content</div>
        </AnalysisSection>
      )

      const content = screen.getByTestId('test-content')
      expect(content).toBeVisible()
    })

    it('should be collapsed when defaultCollapsed is true', () => {
      render(
        <AnalysisSection title="Test Section" defaultCollapsed>
          <div data-testid="test-content">Content</div>
        </AnalysisSection>
      )

      const content = screen.queryByTestId('test-content')
      expect(content).not.toBeInTheDocument()
    })

    it('should toggle content visibility when header is clicked', () => {
      render(
        <AnalysisSection title="Test Section">
          <div data-testid="test-content">Content</div>
        </AnalysisSection>
      )

      const header = screen.getByTestId('analysis-section-header')
      const content = screen.getByTestId('test-content')

      // Click to collapse
      fireEvent.click(header)
      expect(content).not.toBeVisible()

      // Click to expand
      fireEvent.click(header)
      expect(content).toBeVisible()
    })

    it('should display chevron icon that rotates on toggle', () => {
      render(
        <AnalysisSection title="Test Section">
          <div>Content</div>
        </AnalysisSection>
      )

      const chevron = screen.getByTestId('analysis-section-chevron')
      expect(chevron).toBeInTheDocument()

      const header = screen.getByTestId('analysis-section-header')
      fireEvent.click(header)

      // After clicking, chevron should still be present
      expect(chevron).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for collapsible section', () => {
      render(
        <AnalysisSection title="Test Section">
          <div>Content</div>
        </AnalysisSection>
      )

      const header = screen.getByTestId('analysis-section-header')
      expect(header).toHaveAttribute('aria-expanded', 'true')
    })

    it('should update aria-expanded when toggled', () => {
      render(
        <AnalysisSection title="Test Section">
          <div>Content</div>
        </AnalysisSection>
      )

      const header = screen.getByTestId('analysis-section-header')

      expect(header).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(header)
      expect(header).toHaveAttribute('aria-expanded', 'false')
    })

    it('should have proper heading level', () => {
      render(
        <AnalysisSection title="Test Section">
          <div>Content</div>
        </AnalysisSection>
      )

      const heading = screen.getByRole('button', { name: /Test Section/ })
      expect(heading).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive padding classes', () => {
      const { container } = render(
        <AnalysisSection title="Test Section">
          <div>Content</div>
        </AnalysisSection>
      )

      const section = screen.getByTestId('analysis-section')
      expect(section).toHaveClass('p-4') // Mobile default
    })

    it('should maintain layout on different screen sizes', () => {
      render(
        <AnalysisSection title="Test Section">
          <div>Content</div>
        </AnalysisSection>
      )

      const section = screen.getByTestId('analysis-section')
      expect(section).toHaveClass('w-full')
    })
  })

  describe('Visual Styling', () => {
    it('should have proper card styling', () => {
      const { container } = render(
        <AnalysisSection title="Test Section">
          <div>Content</div>
        </AnalysisSection>
      )

      const section = screen.getByTestId('analysis-section')
      expect(section).toHaveClass('rounded-lg')
      expect(section).toHaveClass('border')
    })

    it('should have consistent header styling', () => {
      render(
        <AnalysisSection title="Test Section">
          <div>Content</div>
        </AnalysisSection>
      )

      const header = screen.getByTestId('analysis-section-header')
      expect(header).toHaveClass('cursor-pointer')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(
        <AnalysisSection title="">
          <div>Content</div>
        </AnalysisSection>
      )

      const section = screen.getByTestId('analysis-section')
      expect(section).toBeInTheDocument()
    })

    it('should handle null children', () => {
      render(
        <AnalysisSection title="Test Section">
          {null}
        </AnalysisSection>
      )

      const section = screen.getByTestId('analysis-section')
      expect(section).toBeInTheDocument()
    })

    it('should prioritize loading over error state', () => {
      render(
        <AnalysisSection title="Test Section" isLoading error="Error message">
          <div>Content</div>
        </AnalysisSection>
      )

      const loading = screen.getByTestId('analysis-section-loading')
      expect(loading).toBeInTheDocument()

      const error = screen.queryByTestId('analysis-section-error')
      expect(error).not.toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      render(
        <AnalysisSection title="Test Section">
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </AnalysisSection>
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('child-3')).toBeInTheDocument()
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(
        <AnalysisSection title="Test Section" className="custom-class">
          <div>Content</div>
        </AnalysisSection>
      )

      const section = screen.getByTestId('analysis-section')
      expect(section).toHaveClass('custom-class')
    })

    it('should merge custom classes with default classes', () => {
      render(
        <AnalysisSection title="Test Section" className="custom-class">
          <div>Content</div>
        </AnalysisSection>
      )

      const section = screen.getByTestId('analysis-section')
      expect(section).toHaveClass('custom-class')
      expect(section).toHaveClass('rounded-lg')
    })
  })
})
