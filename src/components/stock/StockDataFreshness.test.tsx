/**
 * StockDataFreshness Component Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Display last update time (Thai timezone)
 * - Show stale data warning (>5 minutes)
 * - Auto-refresh indicator
 * - Manual refresh button with loading state
 * - Live indicator for recent data (<1 minute)
 * - Relative time display ("2 minutes ago")
 * - Accessibility support (ARIA labels)
 * - Responsive design
 * - Edge cases (missing data, future dates)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StockDataFreshness } from './StockDataFreshness'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('StockDataFreshness Component', () => {
  const mockOnRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock current time
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-01-29T12:00:00.000Z').getTime())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render data freshness component', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" />)

      const freshness = screen.getByTestId('data-freshness')
      expect(freshness).toBeInTheDocument()
    })

    it('should display clock icon', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" />)

      const { container } = render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should display last update time', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" />)

      const time = screen.getByTestId('last-update-time')
      expect(time).toBeInTheDocument()
    })

    it('should display relative time', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:58:00.000Z" />)

      const relative = screen.getByTestId('relative-time')
      expect(relative).toHaveTextContent('2m ago')
    })

    it('should apply custom className', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" className="custom-class" />)

      const freshness = screen.getByTestId('data-freshness')
      expect(freshness).toHaveClass('custom-class')
    })
  })

  describe('Thai Timezone', () => {
    it('should display time in Thai timezone (UTC+7)', () => {
      // 12:00 UTC = 19:00 Thai time
      render(<StockDataFreshness lastUpdate="2026-01-29T12:00:00.000Z" />)

      const time = screen.getByTestId('last-update-time')
      expect(time).toHaveTextContent('19:00')
    })

    it('should handle Thai midnight correctly', () => {
      // 17:00 UTC = 00:00 Thai time (next day)
      render(<StockDataFreshness lastUpdate="2026-01-29T17:00:00.000Z" />)

      const time = screen.getByTestId('last-update-time')
      expect(time).toHaveTextContent('00:00')
    })

    it('should handle date change in Thai timezone', () => {
      // 16:00 UTC = 23:00 Thai time on 29th
      // 17:00 UTC = 00:00 Thai time on 30th
      render(<StockDataFreshness lastUpdate="2026-01-29T16:30:00.000Z" />)

      const date = screen.getByTestId('last-update-date')
      expect(date).toHaveTextContent('29')
    })
  })

  describe('Relative Time Display', () => {
    it('should show "Just now" for <1 minute', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:59:30.000Z" />)

      const relative = screen.getByTestId('relative-time')
      expect(relative).toHaveTextContent('Just now')
    })

    it('should show "Xm ago" for <1 hour', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" />)

      const relative = screen.getByTestId('relative-time')
      expect(relative).toHaveTextContent('5m ago')
    })

    it('should show "Xh ago" for <24 hours', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T09:00:00.000Z" />)

      const relative = screen.getByTestId('relative-time')
      expect(relative).toHaveTextContent('3h ago')
    })

    it('should show "Xd ago" for >=24 hours', () => {
      render(<StockDataFreshness lastUpdate="2026-01-27T12:00:00.000Z" />)

      const relative = screen.getByTestId('relative-time')
      expect(relative).toHaveTextContent('2d ago')
    })

    it('should update relative time over time', async () => {
      const { rerender } = render(<StockDataFreshness lastUpdate="2026-01-29T11:59:00.000Z" />)

      let relative = screen.getByTestId('relative-time')
      expect(relative).toHaveTextContent('1m ago')

      // Advance time by 2 minutes
      vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-01-29T12:02:00.000Z').getTime())
      rerender(<StockDataFreshness lastUpdate="2026-01-29T11:59:00.000Z" />)

      relative = screen.getByTestId('relative-time')
      expect(relative).toHaveTextContent('3m ago')
    })
  })

  describe('Stale Data Warning', () => {
    it('should show warning for stale data (>5 minutes)', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:50:00.000Z" />)

      const warning = screen.getByTestId('stale-warning')
      expect(warning).toBeInTheDocument()
      expect(warning).toHaveTextContent(/stale/i)
    })

    it('should not show warning for fresh data (<5 minutes)', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:58:00.000Z" />)

      const warning = screen.queryByTestId('stale-warning')
      expect(warning).not.toBeInTheDocument()
    })

    it('should show warning at exactly 5 minutes', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" />)

      const warning = screen.getByTestId('stale-warning')
      expect(warning).toBeInTheDocument()
    })

    it('should have warning color for stale data', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:50:00.000Z" />)

      const warning = screen.getByTestId('stale-warning')
      expect(warning).toHaveClass('text-yellow-600')
    })
  })

  describe('Live Indicator', () => {
    it('should show live indicator for recent data (<1 minute)', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:59:30.000Z" />)

      const live = screen.getByTestId('live-indicator')
      expect(live).toBeInTheDocument()
      expect(live).toHaveTextContent('LIVE')
    })

    it('should not show live indicator for older data (>=1 minute)', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:58:00.000Z" />)

      const live = screen.queryByTestId('live-indicator')
      expect(live).not.toBeInTheDocument()
    })

    it('should have pulsing animation for live indicator', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:59:30.000Z" />)

      const live = screen.getByTestId('live-indicator')
      expect(live).toHaveClass('animate-pulse')
    })

    it('should have green color for live indicator', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:59:30.000Z" />)

      const live = screen.getByTestId('live-indicator')
      expect(live).toHaveClass('bg-up-primary')
    })
  })

  describe('Refresh Button', () => {
    it('should not show refresh button by default', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" />)

      const refreshButton = screen.queryByTestId('refresh-button')
      expect(refreshButton).not.toBeInTheDocument()
    })

    it('should show refresh button when onRefresh provided', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" onRefresh={mockOnRefresh} />)

      const refreshButton = screen.getByTestId('refresh-button')
      expect(refreshButton).toBeInTheDocument()
    })

    it('should call onRefresh when clicked', async () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" onRefresh={mockOnRefresh} />)

      const refreshButton = screen.getByTestId('refresh-button')
      fireEvent.click(refreshButton)

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalledTimes(1)
      })
    })

    it('should show loading state when refreshing', () => {
      const { rerender } = render(
        <StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" onRefresh={mockOnRefresh} isRefreshing />
      )

      const refreshButton = screen.getByTestId('refresh-button')
      expect(refreshButton).toBeDisabled()
      expect(refreshButton).toHaveAttribute('aria-busy', 'true')
    })

    it('should show spinner icon when refreshing', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" onRefresh={mockOnRefresh} isRefreshing />)

      const { container } = render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" onRefresh={mockOnRefresh} isRefreshing />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Auto-Refresh Indicator', () => {
    it('should show auto-refresh indicator when enabled', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" autoRefreshInterval={60000} />)

      const autoRefresh = screen.getByTestId('auto-refresh-indicator')
      expect(autoRefresh).toBeInTheDocument()
    })

    it('should not show auto-refresh indicator when disabled', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" />)

      const autoRefresh = screen.queryByTestId('auto-refresh-indicator')
      expect(autoRefresh).not.toBeInTheDocument()
    })

    it('should display auto-refresh interval', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" autoRefreshInterval={60000} />)

      const autoRefresh = screen.getByTestId('auto-refresh-indicator')
      expect(autoRefresh).toHaveTextContent(/1m/)
    })

    it('should format interval correctly (minutes)', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" autoRefreshInterval={300000} />)

      const autoRefresh = screen.getByTestId('auto-refresh-indicator')
      expect(autoRefresh).toHaveTextContent(/5m/)
    })

    it('should format interval correctly (seconds)', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" autoRefreshInterval={30000} />)

      const autoRefresh = screen.getByTestId('auto-refresh-indicator')
      expect(autoRefresh).toHaveTextContent(/30s/)
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for component', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" />)

      const freshness = screen.getByTestId('data-freshness')
      expect(freshness).toHaveAttribute('aria-label')
    })

    it('should have aria-live for live updates', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:59:30.000Z" />)

      const live = screen.getByTestId('live-indicator')
      expect(live).toHaveAttribute('aria-live', 'polite')
    })

    it('should have aria-label for refresh button', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" onRefresh={mockOnRefresh} />)

      const refreshButton = screen.getByTestId('refresh-button')
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh data')
    })

    it('should have aria-busy when refreshing', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" onRefresh={mockOnRefresh} isRefreshing />)

      const refreshButton = screen.getByTestId('refresh-button')
      expect(refreshButton).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive classes', () => {
      const { container } = render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" />)

      const freshness = screen.getByTestId('data-freshness')
      expect(freshness).toHaveClass('text-xs')
      expect(freshness).toHaveClass('sm:text-sm')
    })

    it('should hide relative time on mobile when space is limited', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" compact />)

      const relative = screen.queryByTestId('relative-time')
      expect(relative).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing lastUpdate', () => {
      render(<StockDataFreshness />)

      const freshness = screen.getByTestId('data-freshness')
      expect(freshness).toBeInTheDocument()
      expect(freshness).toHaveTextContent(/unknown/i)
    })

    it('should handle invalid date format', () => {
      render(<StockDataFreshness lastUpdate="invalid-date" />)

      const freshness = screen.getByTestId('data-freshness')
      expect(freshness).toBeInTheDocument()
    })

    it('should handle future date', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T13:00:00.000Z" />)

      const relative = screen.getByTestId('relative-time')
      expect(relative).toHaveTextContent('Just now')
    })

    it('should handle very old date', () => {
      render(<StockDataFreshness lastUpdate="2026-01-01T12:00:00.000Z" />)

      const relative = screen.getByTestId('relative-time')
      expect(relative).toHaveTextContent(/\d+d ago/)
    })

    it('should handle zero timestamp', () => {
      render(<StockDataFreshness lastUpdate={new Date(0).toISOString()} />)

      const freshness = screen.getByTestId('data-freshness')
      expect(freshness).toBeInTheDocument()
    })

    it('should handle negative auto-refresh interval', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" autoRefreshInterval={-1} />)

      const autoRefresh = screen.queryByTestId('auto-refresh-indicator')
      expect(autoRefresh).not.toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should be keyboard accessible', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" onRefresh={mockOnRefresh} />)

      const refreshButton = screen.getByTestId('refresh-button')
      refreshButton.focus()

      expect(refreshButton).toHaveFocus()

      fireEvent.keyDown(refreshButton, { key: 'Enter' })

      waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalledTimes(1)
      })
    })

    it('should trigger refresh on Space key', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" onRefresh={mockOnRefresh} />)

      const refreshButton = screen.getByTestId('refresh-button')
      fireEvent.keyDown(refreshButton, { key: ' ' })

      waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Compact Mode', () => {
    it('should show only essential info in compact mode', () => {
      render(<StockDataFreshness lastUpdate="2026-01-29T11:59:30.000Z" compact />)

      const live = screen.queryByTestId('live-indicator')
      expect(live).toBeInTheDocument()

      const relative = screen.queryByTestId('relative-time')
      expect(relative).not.toBeInTheDocument()
    })

    it('should have smaller text in compact mode', () => {
      const { container } = render(<StockDataFreshness lastUpdate="2026-01-29T11:55:00.000Z" compact />)

      const freshness = screen.getByTestId('data-freshness')
      expect(freshness).toHaveClass('text-xs')
    })
  })
})
