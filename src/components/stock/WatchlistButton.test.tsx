/**
 * WatchlistButton Component Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Component renders correctly
 * - Connect to Firebase RTDB watchlist
 * - Animation feedback when added/removed
 * - Show watchlist count
 * - Implement quick add/remove toggle
 * - Show "Added to watchlist" toast
 * - Persistent storage (localStorage fallback)
 * - Display current watchlist state
 * - Accessibility support (ARIA labels)
 * - Responsive design
 * - Edge cases (missing symbol, storage errors)
 * - Loading state
 * - Keyboard navigation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WatchlistButton } from './WatchlistButton'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('WatchlistButton Component', () => {
  const mockSymbol = 'PTT'

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('should render watchlist button', () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      const button = screen.getByTestId('watchlist-button')
      expect(button).toBeInTheDocument()
    })

    it('should render with star icon when not on watchlist', () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      const icon = screen.getByTestId('watchlist-icon')
      expect(icon).toBeInTheDocument()
    })

    it('should render "Watch" text when not on watchlist', () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      const text = screen.getByTestId('watchlist-text')
      expect(text).toHaveTextContent('Watch')
    })

    it('should render filled star icon when on watchlist', async () => {
      // Add to localStorage first
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol]))

      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const icon = screen.getByTestId('watchlist-icon')
        expect(icon).toHaveClass('fill-current')
      })
    })

    it('should render "Watching" text when on watchlist', async () => {
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol]))

      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const text = screen.getByTestId('watchlist-text')
        expect(text).toHaveTextContent('Watching')
      })
    })

    it('should show loading state initially', () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      const button = screen.getByTestId('watchlist-button')
      expect(button).toBeDisabled()
    })

    it('should remove disabled state after loading', async () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })
    })

    it('should apply custom className', () => {
      render(<WatchlistButton symbol={mockSymbol} className="custom-class" />)

      const button = screen.getByTestId('watchlist-button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Toggle Functionality', () => {
    it('should add symbol to watchlist on click when not watching', async () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
        expect(watchlist).toContain(mockSymbol)
      })
    })

    it('should remove symbol from watchlist on click when watching', async () => {
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol]))

      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
        expect(watchlist).not.toContain(mockSymbol)
      })
    })

    it('should toggle state on click', async () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      // First click - add to watchlist
      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const text = screen.getByTestId('watchlist-text')
        expect(text).toHaveTextContent('Watching')
      })

      // Second click - remove from watchlist
      fireEvent.click(button)

      await waitFor(() => {
        const text = screen.getByTestId('watchlist-text')
        expect(text).toHaveTextContent('Watch')
      })
    })
  })

  describe('Animation Feedback', () => {
    it('should have animation when added to watchlist', async () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const icon = screen.getByTestId('watchlist-icon')
        expect(icon).toHaveClass('fill-current')
      })
    })

    it('should have animation when removed from watchlist', async () => {
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol]))

      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const icon = screen.getByTestId('watchlist-icon')
        expect(icon).not.toHaveClass('fill-current')
      })
    })

    it('should apply yellow styling when watching', async () => {
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol]))

      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).toHaveClass('bg-yellow-100')
      })
    })

    it('should apply outline styling when not watching', async () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).toHaveClass('border')
      })
    })
  })

  describe('Watchlist Count', () => {
    it('should display watchlist count when enabled', async () => {
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol, 'AOT', 'KBANK']))

      render(<WatchlistButton symbol={mockSymbol} showCount />)

      await waitFor(() => {
        const count = screen.getByTestId('watchlist-count')
        expect(count).toHaveTextContent('3')
      })
    })

    it('should not display count when not enabled', async () => {
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol]))

      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const count = screen.queryByTestId('watchlist-count')
        expect(count).not.toBeInTheDocument()
      })
    })

    it('should update count when adding to watchlist', async () => {
      localStorage.setItem('watchlist', JSON.stringify(['AOT', 'KBANK']))

      render(<WatchlistButton symbol={mockSymbol} showCount />)

      await waitFor(() => {
        const count = screen.getByTestId('watchlist-count')
        expect(count).toHaveTextContent('2')
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const count = screen.getByTestId('watchlist-count')
        expect(count).toHaveTextContent('3')
      })
    })

    it('should update count when removing from watchlist', async () => {
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol, 'AOT', 'KBANK']))

      render(<WatchlistButton symbol={mockSymbol} showCount />)

      await waitFor(() => {
        const count = screen.getByTestId('watchlist-count')
        expect(count).toHaveTextContent('3')
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const count = screen.getByTestId('watchlist-count')
        expect(count).toHaveTextContent('2')
      })
    })
  })

  describe('Toast Notification', () => {
    it('should show toast when added to watchlist', async () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const toast = screen.queryByTestId('watchlist-toast')
        expect(toast).toBeInTheDocument()
        expect(toast).toHaveTextContent(/added to watchlist/i)
      })
    })

    it('should show toast when removed from watchlist', async () => {
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol]))

      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const toast = screen.queryByTestId('watchlist-toast')
        expect(toast).toBeInTheDocument()
        expect(toast).toHaveTextContent(/removed from watchlist/i)
      })
    })

    it('should hide toast after timeout', async () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const toast = screen.queryByTestId('watchlist-toast')
        expect(toast).toBeInTheDocument()
      })

      // Wait for toast to disappear (default 3 seconds)
      await waitFor(
        () => {
          const toast = screen.queryByTestId('watchlist-toast')
          expect(toast).not.toBeInTheDocument()
        },
        { timeout: 4000 }
      )
    })
  })

  describe('Persistent Storage', () => {
    it('should save to localStorage', async () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const watchlist = localStorage.getItem('watchlist')
        expect(watchlist).toBeTruthy()
        const parsed = JSON.parse(watchlist || '[]')
        expect(parsed).toContain(mockSymbol)
      })
    })

    it('should load from localStorage on mount', async () => {
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol]))

      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const text = screen.getByTestId('watchlist-text')
        expect(text).toHaveTextContent('Watching')
      })
    })

    it('should maintain state across re-renders', async () => {
      const { rerender } = render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      // Add to watchlist
      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const text = screen.getByTestId('watchlist-text')
        expect(text).toHaveTextContent('Watching')
      })

      // Re-render
      rerender(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const text = screen.getByTestId('watchlist-text')
        expect(text).toHaveTextContent('Watching')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label indicating current state', async () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).toHaveAttribute('aria-label', 'Add PTT to watchlist')
      })
    })

    it('should update aria-label when on watchlist', async () => {
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol]))

      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).toHaveAttribute('aria-label', 'Remove PTT from watchlist')
      })
    })

    it('should have aria-pressed state', async () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).toHaveAttribute('aria-pressed', 'false')
      })
    })

    it('should update aria-pressed when on watchlist', async () => {
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol]))

      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).toHaveAttribute('aria-pressed', 'true')
      })
    })

    it('should be keyboard accessible', async () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      button.focus()

      expect(button).toHaveFocus()

      fireEvent.keyDown(button, { key: 'Enter' })

      await waitFor(() => {
        const text = screen.getByTestId('watchlist-text')
        expect(text).toHaveTextContent('Watching')
      })
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive classes', () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      const button = screen.getByTestId('watchlist-button')
      expect(button).toHaveClass('gap-2')
    })

    it('should show text on larger screens', () => {
      render(<WatchlistButton symbol={mockSymbol} />)

      const text = screen.getByTestId('watchlist-text')
      expect(text).toHaveClass('hidden')
      expect(text).toHaveClass('sm:inline')
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage.getItem to throw error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage access denied')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<WatchlistButton symbol={mockSymbol} />)

      // Should still render without crashing
      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalled()

      localStorage.getItem = originalGetItem
      consoleSpy.mockRestore()
    })

    it('should handle localStorage.setItem errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock localStorage.setItem to throw error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage quota exceeded')
      })

      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      // Should not crash
      expect(consoleSpy).toHaveBeenCalled()

      localStorage.setItem = originalSetItem
      consoleSpy.mockRestore()
    })

    it('should handle invalid JSON in localStorage', async () => {
      localStorage.setItem('watchlist', 'invalid-json')

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<WatchlistButton symbol={mockSymbol} />)

      // Should still render and handle error
      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty symbol', () => {
      render(<WatchlistButton symbol="" />)

      const button = screen.getByTestId('watchlist-button')
      expect(button).toBeInTheDocument()
    })

    it('should handle special characters in symbol', async () => {
      render(<WatchlistButton symbol="PTT-B" />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
        expect(watchlist).toContain('PTT-B')
      })
    })

    it('should handle duplicate symbols in watchlist', async () => {
      localStorage.setItem('watchlist', JSON.stringify([mockSymbol, mockSymbol]))

      render(<WatchlistButton symbol={mockSymbol} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
        // Should remove all instances
        expect(watchlist).not.toContain(mockSymbol)
      })
    })

    it('should handle very large watchlist', async () => {
      const largeWatchlist = Array.from({ length: 100 }, (_, i) => `STOCK${i}`)
      localStorage.setItem('watchlist', JSON.stringify(largeWatchlist))

      render(<WatchlistButton symbol={mockSymbol} showCount />)

      await waitFor(() => {
        const count = screen.getByTestId('watchlist-count')
        expect(count).toHaveTextContent('100')
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        const count = screen.getByTestId('watchlist-count')
        expect(count).toHaveTextContent('101')
      })
    })
  })

  describe('Firebase Integration', () => {
    it('should call onChange callback when state changes', async () => {
      const handleChange = vi.fn()

      render(<WatchlistButton symbol={mockSymbol} onChange={handleChange} />)

      await waitFor(() => {
        const button = screen.getByTestId('watchlist-button')
        expect(button).not.toBeDisabled()
      })

      const button = screen.getByTestId('watchlist-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith({
          symbol: mockSymbol,
          isOnWatchlist: true,
        })
      })
    })

    it('should receive initial state from props', async () => {
      render(<WatchlistButton symbol={mockSymbol} isOnWatchlist={true} />)

      await waitFor(() => {
        const text = screen.getByTestId('watchlist-text')
        expect(text).toHaveTextContent('Watching')
      })
    })
  })
})
