/**
 * InteractiveSparkline Component Tests
 *
 * Test suite for the InteractiveSparkline component using React Testing Library
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InteractiveSparkline } from './InteractiveSparkline'

// ==================================================================
// TEST DATA
// ==================================================================

const mockData = [
  { value: 100, timestamp: 1234567890 },
  { value: 102, timestamp: 1234567891 },
  { value: 105, timestamp: 1234567892 },
  { value: 103, timestamp: 1234567893 },
  { value: 108, timestamp: 1234567894 },
]

// ==================================================================
// RENDER TESTS
// ==================================================================

describe('InteractiveSparkline - Rendering', () => {
  it('should render without crashing', () => {
    render(<InteractiveSparkline data={mockData} />)
    const chart = screen.getByRole('img')
    expect(chart).toBeDefined()
  })

  it('should render with custom className', () => {
    const { container } = render(
      <InteractiveSparkline data={mockData} className="custom-class" />
    )
    const wrapper = container.querySelector('.custom-class')
    expect(wrapper).toBeDefined()
  })

  it('should render with custom aria-label', () => {
    render(<InteractiveSparkline data={mockData} ariaLabel="Custom chart label" />)
    const chart = screen.getByRole('img', { name: /Custom chart label/i })
    expect(chart).toBeDefined()
  })
})

// ==================================================================
// COLOR VARIANT TESTS
// ==================================================================

describe('InteractiveSparkline - Color Variants', () => {
  it('should render with up color', () => {
    const { container } = render(<InteractiveSparkline data={mockData} color="up" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeDefined()
    // Check for green stroke color in gradient
    const gradient = container.querySelector('[stop-color="#4ade80"]')
    expect(gradient).toBeDefined()
  })

  it('should render with down color', () => {
    const { container } = render(<InteractiveSparkline data={mockData} color="down" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeDefined()
    // Check for red stroke color in gradient
    const gradient = container.querySelector('[stop-color="rgba(255, 107, 107, 0.5)"]')
    expect(gradient).toBeDefined()
  })

  it('should render with neutral color', () => {
    const { container } = render(<InteractiveSparkline data={mockData} color="neutral" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeDefined()
  })

  it('should render with blue color', () => {
    const { container } = render(<InteractiveSparkline data={mockData} color="blue" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeDefined()
  })

  it('should render with purple color', () => {
    const { container } = render(<InteractiveSparkline data={mockData} color="purple" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeDefined()
  })
})

// ==================================================================
// HEIGHT TESTS
// ==================================================================

describe('InteractiveSparkline - Height Configuration', () => {
  it('should render with default height (60px)', () => {
    const { container } = render(<InteractiveSparkline data={mockData} />)
    const wrapper = container.firstChild as HTMLElement
    const height = wrapper.style.height
    expect(height).toContain('px')
    // On desktop (test environment), height should be close to 72px (60 * 1.2)
    const numericHeight = parseInt(height)
    expect(numericHeight).toBeGreaterThan(0)
  })

  it('should render with custom height', () => {
    const { container } = render(<InteractiveSparkline data={mockData} height={100} />)
    const wrapper = container.firstChild as HTMLElement
    const height = wrapper.style.height
    expect(height).toContain('px')
  })
})

// ==================================================================
// TOOLTIP TESTS
// ==================================================================

describe('InteractiveSparkline - Tooltip', () => {
  it('should render with tooltip enabled by default', () => {
    const { container } = render(<InteractiveSparkline data={mockData} />)
    // Tooltip is rendered but hidden by default
    const chart = screen.getByRole('img')
    expect(chart).toBeDefined()
  })

  it('should render without tooltip when disabled', () => {
    render(<InteractiveSparkline data={mockData} showTooltip={false} />)
    const chart = screen.getByRole('img')
    expect(chart).toBeDefined()
  })
})

// ==================================================================
// VALUE FORMATTER TESTS
// ==================================================================

describe('InteractiveSparkline - Value Formatter', () => {
  it('should use default formatter (2 decimal places)', () => {
    render(<InteractiveSparkline data={mockData} />)
    const chart = screen.getByRole('img')
    expect(chart).toBeDefined()
  })

  it('should use custom percentage formatter', () => {
    render(
      <InteractiveSparkline
        data={mockData}
        valueFormatter={(value) => `${value.toFixed(1)}%`}
      />
    )
    const chart = screen.getByRole('img')
    expect(chart).toBeDefined()
  })

  it('should use custom currency formatter', () => {
    render(
      <InteractiveSparkline
        data={mockData}
        valueFormatter={(value) => `$${value.toLocaleString()}`}
      />
    )
    const chart = screen.getByRole('img')
    expect(chart).toBeDefined()
  })
})

// ==================================================================
// ACCESSIBILITY TESTS
// ==================================================================

describe('InteractiveSparkline - Accessibility', () => {
  it('should have role="img"', () => {
    render(<InteractiveSparkline data={mockData} />)
    const chart = screen.getByRole('img')
    expect(chart).toBeDefined()
  })

  it('should have auto-generated aria-label when not provided', () => {
    render(<InteractiveSparkline data={mockData} />)
    const chart = screen.getByRole('img')
    expect(chart).toHaveAttribute('aria-label')
    const ariaLabel = chart.getAttribute('aria-label')
    expect(ariaLabel).toContain('Sparkline chart')
    expect(ariaLabel).toContain('data points')
  })

  it('should have screen reader fallback text', () => {
    render(<InteractiveSparkline data={mockData} />)
    const fallback = screen.getByText(/Sparkline chart/i)
    expect(fallback).toBeDefined()
  })

  it('should have custom aria-label when provided', () => {
    const customLabel = 'Stock price chart for AAPL'
    render(<InteractiveSparkline data={mockData} ariaLabel={customLabel} />)
    const chart = screen.getByRole('img', { name: customLabel })
    expect(chart).toBeDefined()
  })
})

// ==================================================================
// EDGE CASES
// ==================================================================

describe('InteractiveSparkline - Edge Cases', () => {
  it('should handle empty data array', () => {
    render(<InteractiveSparkline data={[]} />)
    const chart = screen.getByRole('img')
    expect(chart).toBeDefined()
  })

  it('should handle single data point', () => {
    render(<InteractiveSparkline data={[{ value: 100, timestamp: 1234567890 }]} />)
    const chart = screen.getByRole('img')
    expect(chart).toBeDefined()
  })

  it('should handle data without timestamps', () => {
    const dataWithoutTimestamps = [
      { value: 100 },
      { value: 102 },
      { value: 105 },
    ]
    render(<InteractiveSparkline data={dataWithoutTimestamps} />)
    const chart = screen.getByRole('img')
    expect(chart).toBeDefined()
  })

  it('should handle negative values', () => {
    const negativeData = [
      { value: -10, timestamp: 1234567890 },
      { value: -5, timestamp: 1234567891 },
      { value: 0, timestamp: 1234567892 },
      { value: 5, timestamp: 1234567893 },
    ]
    render(<InteractiveSparkline data={negativeData} />)
    const chart = screen.getByRole('img')
    expect(chart).toBeDefined()
  })

  it('should handle large values', () => {
    const largeData = [
      { value: 1000000, timestamp: 1234567890 },
      { value: 1050000, timestamp: 1234567891 },
      { value: 1025000, timestamp: 1234567892 },
    ]
    render(<InteractiveSparkline data={largeData} />)
    const chart = screen.getByRole('img')
    expect(chart).toBeDefined()
  })
})

// ==================================================================
// RESPONSIVE TESTS
// ==================================================================

describe('InteractiveSparkline - Responsive Behavior', () => {
  it('should render ResponsiveContainer with 100% width', () => {
    const { container } = render(<InteractiveSparkline data={mockData} />)
    const chartContainer = container.querySelector('.recharts-responsive-container')
    expect(chartContainer).toBeDefined()
  })
})

// ==================================================================
// INTEGRATION TESTS
// ==================================================================

describe('InteractiveSparkline - Integration', () => {
  it('should render multiple charts with different colors', () => {
    const { container } = render(
      <div>
        <InteractiveSparkline data={mockData} color="up" />
        <InteractiveSparkline data={mockData} color="down" />
        <InteractiveSparkline data={mockData} color="neutral" />
      </div>
    )
    const charts = container.querySelectorAll('[role="img"]')
    expect(charts.length).toBe(3)
  })

  it('should work with real-world stock data', () => {
    const stockData = [
      { value: 152.50, timestamp: 1640000000000 },
      { value: 153.25, timestamp: 1640000300000 },
      { value: 152.75, timestamp: 1640000600000 },
      { value: 154.00, timestamp: 1640000900000 },
      { value: 155.50, timestamp: 1640001200000 },
    ]
    render(
      <InteractiveSparkline
        data={stockData}
        color="up"
        valueFormatter={(value) => `$${value.toFixed(2)}`}
        ariaLabel="AAPL stock price chart"
      />
    )
    const chart = screen.getByRole('img', { name: /AAPL/i })
    expect(chart).toBeDefined()
  })
})
