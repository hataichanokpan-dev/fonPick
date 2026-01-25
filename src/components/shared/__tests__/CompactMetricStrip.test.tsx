/**
 * CompactMetricStrip Component Tests
 *
 * TDD Approach:
 * 1. RED - Write failing tests first
 * 2. GREEN - Implement component to pass tests
 * 3. REFACTOR - Clean up code while keeping tests passing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompactMetricStrip, type MetricItem } from '../CompactMetricStrip'

describe('CompactMetricStrip', () => {
  const defaultProps = {
    metrics: [
      { label: 'Volume', value: '1.5M', color: 'up' as const },
      { label: 'Change', value: '+2.5%', color: 'up' as const },
      { label: 'PE', value: '15.2', color: 'neutral' as const },
    ] satisfies MetricItem[],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // BASIC RENDERING
  // ==========================================================================

  describe('Basic Rendering', () => {
    it('should render all metric items', () => {
      render(<CompactMetricStrip {...defaultProps} />)

      expect(screen.getByText('Volume')).toBeInTheDocument()
      expect(screen.getByText('1.5M')).toBeInTheDocument()
      expect(screen.getByText('Change')).toBeInTheDocument()
      expect(screen.getByText('+2.5%')).toBeInTheDocument()
      expect(screen.getByText('PE')).toBeInTheDocument()
      expect(screen.getByText('15.2')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      const { container } = render(
        <CompactMetricStrip {...defaultProps} className="custom-class" />
      )

      const strip = container.firstChild as HTMLElement
      expect(strip).toHaveClass('custom-class')
    })

    it('should render with single metric', () => {
      const singleMetric = {
        metrics: [{ label: 'Price', value: '100.50', color: 'neutral' as const }] satisfies MetricItem[],
      }
      render(<CompactMetricStrip {...singleMetric} />)

      expect(screen.getByText('Price')).toBeInTheDocument()
      expect(screen.getByText('100.50')).toBeInTheDocument()
    })

    it('should render with no metrics (empty array)', () => {
      const { container } = render(<CompactMetricStrip metrics={[]} />)

      expect(container.firstChild).toBeInTheDocument()
      expect(container.firstChild?.childNodes.length).toBe(0)
    })
  })

  // ==========================================================================
  // COLOR VARIANTS
  // ==========================================================================

  describe('Color Variants', () => {
    it('should apply up color styling', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Gain', value: '+5.2', color: 'up' as const }]}
        />
      )

      const valueElement = screen.getByText('+5.2')
      expect(valueElement).toHaveClass('text-emerald-400')
    })

    it('should apply down color styling', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Loss', value: '-3.1', color: 'down' as const }]}
        />
      )

      const valueElement = screen.getByText('-3.1')
      expect(valueElement).toHaveClass('text-red-400')
    })

    it('should apply neutral color styling', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Price', value: '100', color: 'neutral' as const }]}
        />
      )

      const valueElement = screen.getByText('100')
      expect(valueElement).toHaveClass('text-gray-400')
    })

    it('should default to neutral color when not specified', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Price', value: '100' }]}
        />
      )

      const valueElement = screen.getByText('100')
      expect(valueElement).toHaveClass('text-gray-400')
    })
  })

  // ==========================================================================
  // SEPARATOR FUNCTIONALITY
  // ==========================================================================

  describe('Separator Functionality', () => {
    it('should show separators when separator prop is true', () => {
      const { container } = render(
        <CompactMetricStrip metrics={defaultProps.metrics as MetricItem[]} separator={true} />
      )

      const separators = container.querySelectorAll('[data-testid="metric-separator"]')
      // 3 metrics = 2 separators
      expect(separators.length).toBe(2)
    })

    it('should not show separators when separator prop is false', () => {
      const { container } = render(
        <CompactMetricStrip metrics={defaultProps.metrics as MetricItem[]} separator={false} />
      )

      const separators = container.querySelectorAll('[data-testid="metric-separator"]')
      expect(separators.length).toBe(0)
    })

    it('should default to showing separators', () => {
      const { container } = render(
        <CompactMetricStrip metrics={defaultProps.metrics as MetricItem[]} />
      )

      const separators = container.querySelectorAll('[data-testid="metric-separator"]')
      expect(separators.length).toBeGreaterThan(0)
    })

    it('should not show separator for single metric', () => {
      const { container } = render(
        <CompactMetricStrip
          metrics={[{ label: 'Price', value: '100' }]}
          separator={true}
        />
      )

      const separators = container.querySelectorAll('[data-testid="metric-separator"]')
      expect(separators.length).toBe(0)
    })
  })

  // ==========================================================================
  // VALUE TYPES
  // ==========================================================================

  describe('Value Types', () => {
    it('should render string values', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Status', value: 'Active' }]}
        />
      )

      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should render number values', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Count', value: 42 }]}
        />
      )

      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should render negative numbers', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Change', value: -15.5 }]}
        />
      )

      expect(screen.getByText('-15.5')).toBeInTheDocument()
    })

    it('should render zero', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Change', value: 0 }]}
        />
      )

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should render decimal numbers', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'PE', value: 15.25 }]}
        />
      )

      expect(screen.getByText('15.25')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // TREND INDICATOR
  // ==========================================================================

  describe('Trend Indicator', () => {
    it('should display trend when provided', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Volume', value: '1.5M', trend: '▲ 10%' }]}
        />
      )

      expect(screen.getByText('▲ 10%')).toBeInTheDocument()
    })

    it('should not display trend when not provided', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Volume', value: '1.5M' }]}
        />
      )

      // Should only render label and value
      const { container } = render(
        <CompactMetricStrip
          metrics={[{ label: 'Volume', value: '1.5M' }]}
        />
      )
      expect(container.textContent).toContain('Volume')
      expect(container.textContent).toContain('1.5M')
    })

    it('should display trend with arrow icon', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Price', value: '100', trend: '▲' }]}
        />
      )

      expect(screen.getByText('▲')).toBeInTheDocument()
    })

    it('should display trend with percentage', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Change', value: '+2.5%', trend: '+5.2% vs yesterday' }]}
        />
      )

      expect(screen.getByText('+5.2% vs yesterday')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // LAYOUT AND STYLING
  // ==========================================================================

  describe('Layout and Styling', () => {
    it('should have horizontal flex layout', () => {
      const { container } = render(<CompactMetricStrip metrics={defaultProps.metrics as MetricItem[]} />)

      const strip = container.firstChild as HTMLElement
      expect(strip).toHaveClass('flex')
      expect(strip).toHaveClass('flex-row')
    })

    it('should have compact height (48px max)', () => {
      const { container } = render(<CompactMetricStrip metrics={defaultProps.metrics as MetricItem[]} />)

      const strip = container.firstChild as HTMLElement
      expect(strip).toHaveClass('h-12')
    })

    it('should have small gap between metrics', () => {
      const { container } = render(<CompactMetricStrip metrics={defaultProps.metrics as MetricItem[]} />)

      const strip = container.firstChild as HTMLElement
      expect(strip).toHaveClass('gap-3')
    })

    it('should align items center', () => {
      const { container } = render(<CompactMetricStrip metrics={defaultProps.metrics as MetricItem[]} />)

      const strip = container.firstChild as HTMLElement
      expect(strip).toHaveClass('items-center')
    })
  })

  // ==========================================================================
  // ACCESSIBILITY
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      const { container } = render(<CompactMetricStrip metrics={defaultProps.metrics as MetricItem[]} />)

      const strip = container.firstChild as HTMLElement
      expect(strip).toHaveAttribute('role', 'group')
    })

    it('should have accessible label for each metric', () => {
      render(<CompactMetricStrip metrics={defaultProps.metrics as MetricItem[]} />)

      const labels = screen.getAllByText(/Volume|Change|PE/)
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle null values gracefully', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Price', value: null as any }]}
        />
      )

      // Should render label even if value is null
      expect(screen.getByText('Price')).toBeInTheDocument()
    })

    it('should handle undefined values gracefully', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Price', value: undefined as any }]}
        />
      )

      // Should render label even if value is undefined
      expect(screen.getByText('Price')).toBeInTheDocument()
    })

    it('should handle very long metric labels', () => {
      const longLabel = 'Very Long Metric Label Name'
      render(
        <CompactMetricStrip
          metrics={[{ label: longLabel, value: '100' }]}
        />
      )

      expect(screen.getByText(longLabel)).toBeInTheDocument()
    })

    it('should handle very long values', () => {
      const longValue = '1,234,567,890.123456789'
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Market Cap', value: longValue }]}
        />
      )

      expect(screen.getByText(longValue)).toBeInTheDocument()
    })

    it('should handle many metrics (performance)', () => {
      const manyMetrics = Array.from({ length: 10 }, (_, i) => ({
        label: `Metric ${i + 1}`,
        value: `${i}`,
      }))

      render(
        <CompactMetricStrip metrics={manyMetrics} />
      )

      // All metrics should be rendered
      for (let i = 0; i < 10; i++) {
        expect(screen.getByText(`Metric ${i + 1}`)).toBeInTheDocument()
        expect(screen.getByText(`${i}`)).toBeInTheDocument()
      }
    })

    it('should handle special characters in values', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Change', value: '+1,234.56%' }]}
        />
      )

      expect(screen.getByText('+1,234.56%')).toBeInTheDocument()
    })

    it('should handle empty string label', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: '', value: '100' }]}
        />
      )

      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should handle empty string value', () => {
      render(
        <CompactMetricStrip
          metrics={[{ label: 'Price', value: '' }]}
        />
      )

      expect(screen.getByText('Price')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // INTEGRATION WITH OTHER COMPONENTS
  // ==========================================================================

  describe('Integration', () => {
    it('should work with mixed color types', () => {
      render(
        <CompactMetricStrip
          metrics={[
            { label: 'Gain', value: '+5.2', color: 'up' as const },
            { label: 'Loss', value: '-3.1', color: 'down' as const },
            { label: 'Neutral', value: '0', color: 'neutral' as const },
          ]}
        />
      )

      expect(screen.getByText('+5.2')).toBeInTheDocument()
      expect(screen.getByText('-3.1')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should work with mixed data types', () => {
      render(
        <CompactMetricStrip
          metrics={[
            { label: 'Volume', value: '1.5M' },
            { label: 'Price', value: 100.5 },
            { label: 'Change', value: '+2.5%' },
          ]}
        />
      )

      expect(screen.getByText('1.5M')).toBeInTheDocument()
      expect(screen.getByText('100.5')).toBeInTheDocument()
      expect(screen.getByText('+2.5%')).toBeInTheDocument()
    })
  })
})
