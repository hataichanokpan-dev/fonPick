/**
 * ShareSheet Component Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Component renders correctly
 * - Web Share API integration (mobile)
 * - Copy link fallback (desktop)
 * - Share image preview card
 * - Social media icons (Facebook, Twitter, Line)
 * - Open in new tab functionality
 * - Analytics tracking for shares
 * - Accessibility support (ARIA labels)
 * - Responsive design
 * - Edge cases (missing data, unsupported browsers)
 * - Toast notification on successful share
 * - Error handling for share failures
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShareSheet } from './ShareSheet'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock navigator.share for Web Share API
const mockShare = vi.fn()
Object.defineProperty(navigator, 'share', {
  writable: true,
  value: mockShare,
})

// Mock navigator.clipboard for copy link
const mockWriteText = vi.fn()
Object.defineProperty(navigator.clipboard, 'writeText', {
  writable: true,
  value: mockWriteText,
})

describe('ShareSheet Component', () => {
  const defaultProps = {
    symbol: 'PTT',
    name: 'PTT Public Company Limited',
    currentPrice: 34.75,
    change: 0.5,
    changePercent: 1.46,
  }

  beforeEach(() => {
    mockShare.mockReset()
    mockWriteText.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render share sheet component', () => {
      render(<ShareSheet {...defaultProps} />)

      const sheet = screen.getByTestId('share-sheet')
      expect(sheet).toBeInTheDocument()
    })

    it('should render share button', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      expect(shareButton).toBeInTheDocument()
    })

    it('should render share icon', () => {
      const { container } = render(<ShareSheet {...defaultProps} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should open sheet on button click', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const sheet = screen.getByTestId('share-sheet-content')
      expect(sheet).toBeInTheDocument()
    })

    it('should close sheet when clicking outside', async () => {
      render(<ShareSheet {...defaultProps} />)

      // Open sheet
      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      // Click outside
      const overlay = screen.getByTestId('share-sheet-overlay')
      fireEvent.click(overlay)

      await waitFor(() => {
        const sheet = screen.queryByTestId('share-sheet-content')
        expect(sheet).not.toBeInTheDocument()
      })
    })
  })

  describe('Web Share API', () => {
    it('should use Web Share API when available (mobile)', async () => {
      mockShare.mockResolvedValueOnce(undefined)

      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: 'PTT Public Company Limited',
          text: 'PTT: 34.75 (+1.46%)',
          url: expect.stringContaining('PTT'),
        })
      })
    })

    it('should show toast on successful share', async () => {
      mockShare.mockResolvedValueOnce(undefined)

      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      await waitFor(() => {
        const toast = screen.queryByTestId('share-success-toast')
        expect(toast).toBeInTheDocument()
      })
    })

    it('should handle share API errors gracefully', async () => {
      mockShare.mockRejectedValueOnce(new Error('Share failed'))

      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      await waitFor(() => {
        const fallback = screen.queryByTestId('share-fallback')
        expect(fallback).toBeInTheDocument()
      })
    })

    it('should show fallback when share API is not available', () => {
      // Temporarily remove navigator.share
      const originalShare = navigator.share
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: undefined,
      })

      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const fallback = screen.getByTestId('share-fallback')
      expect(fallback).toBeInTheDocument()

      // Restore navigator.share
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: originalShare,
      })
    })
  })

  describe('Copy Link Fallback', () => {
    it('should copy link to clipboard when copy button clicked', async () => {
      // Remove navigator.share to force fallback
      const originalShare = navigator.share
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: undefined,
      })

      mockWriteText.mockResolvedValueOnce(undefined)

      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const copyButton = screen.getByTestId('copy-link-button')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          expect.stringContaining('PTT')
        )
      })

      // Restore navigator.share
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: originalShare,
      })
    })

    it('should show success message after copying', async () => {
      const originalShare = navigator.share
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: undefined,
      })

      mockWriteText.mockResolvedValueOnce(undefined)

      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const copyButton = screen.getByTestId('copy-link-button')
      fireEvent.click(copyButton)

      await waitFor(() => {
        const successMessage = screen.getByText(/link copied/i)
        expect(successMessage).toBeInTheDocument()
      })

      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: originalShare,
      })
    })
  })

  describe('Social Media Sharing', () => {
    it('should render Facebook share button', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const facebookButton = screen.getByTestId('share-facebook')
      expect(facebookButton).toBeInTheDocument()
    })

    it('should render Twitter share button', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const twitterButton = screen.getByTestId('share-twitter')
      expect(twitterButton).toBeInTheDocument()
    })

    it('should render Line share button', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const lineButton = screen.getByTestId('share-line')
      expect(lineButton).toBeInTheDocument()
    })

    it('should open Facebook in new tab', () => {
      const openSpy = vi.fn()
      global.open = openSpy

      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const facebookButton = screen.getByTestId('share-facebook')
      fireEvent.click(facebookButton)

      expect(openSpy).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com'),
        expect.anything()
      )
    })

    it('should open Twitter in new tab', () => {
      const openSpy = vi.fn()
      global.open = openSpy

      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const twitterButton = screen.getByTestId('share-twitter')
      fireEvent.click(twitterButton)

      expect(openSpy).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com'),
        expect.anything()
      )
    })

    it('should open Line in new tab', () => {
      const openSpy = vi.fn()
      global.open = openSpy

      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const lineButton = screen.getByTestId('share-line')
      fireEvent.click(lineButton)

      expect(openSpy).toHaveBeenCalledWith(
        expect.stringContaining('line.me'),
        expect.anything()
      )
    })
  })

  describe('Share Preview Card', () => {
    it('should display stock symbol in preview', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const symbol = screen.getByTestId('share-preview-symbol')
      expect(symbol).toHaveTextContent('PTT')
    })

    it('should display current price in preview', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const price = screen.getByTestId('share-preview-price')
      expect(price).toHaveTextContent('34.75')
    })

    it('should display price change in preview', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const change = screen.getByTestId('share-preview-change')
      expect(change).toHaveTextContent('+1.46%')
    })

    it('should show green color for positive change', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const change = screen.getByTestId('share-preview-change')
      expect(change).toHaveClass('text-up-primary')
    })

    it('should show red color for negative change', () => {
      const negativeProps = {
        ...defaultProps,
        change: -0.5,
        changePercent: -1.46,
      }

      render(<ShareSheet {...negativeProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const change = screen.getByTestId('share-preview-change')
      expect(change).toHaveClass('text-down-primary')
    })
  })

  describe('Analytics Tracking', () => {
    it('should track share event when Web Share API used', async () => {
      const trackEvent = vi.fn()
      mockShare.mockResolvedValueOnce(undefined)

      render(<ShareSheet {...defaultProps} onShare={trackEvent} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith({
          type: 'share',
          symbol: 'PTT',
          method: 'web-share-api',
        })
      })
    })

    it('should track copy link event', async () => {
      const trackEvent = vi.fn()
      const originalShare = navigator.share
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: undefined,
      })

      mockWriteText.mockResolvedValueOnce(undefined)

      render(<ShareSheet {...defaultProps} onShare={trackEvent} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const copyButton = screen.getByTestId('copy-link-button')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith({
          type: 'share',
          symbol: 'PTT',
          method: 'copy-link',
        })
      })

      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: originalShare,
      })
    })

    it('should track social media share event', () => {
      const trackEvent = vi.fn()
      const openSpy = vi.fn()
      global.open = openSpy

      render(<ShareSheet {...defaultProps} onShare={trackEvent} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const twitterButton = screen.getByTestId('share-twitter')
      fireEvent.click(twitterButton)

      expect(trackEvent).toHaveBeenCalledWith({
        type: 'share',
        symbol: 'PTT',
        method: 'twitter',
      })
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on share button', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      expect(shareButton).toHaveAttribute('aria-label', 'Share stock')
    })

    it('should have aria-label on social media buttons', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const facebookButton = screen.getByTestId('share-facebook')
      expect(facebookButton).toHaveAttribute('aria-label', 'Share on Facebook')

      const twitterButton = screen.getByTestId('share-twitter')
      expect(twitterButton).toHaveAttribute('aria-label', 'Share on Twitter')

      const lineButton = screen.getByTestId('share-line')
      expect(lineButton).toHaveAttribute('aria-label', 'Share on Line')
    })

    it('should have role="dialog" on sheet', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const sheet = screen.getByTestId('share-sheet-content')
      expect(sheet).toHaveAttribute('role', 'dialog')
    })

    it('should trap focus within sheet when open', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const sheet = screen.getByTestId('share-sheet-content')
      expect(sheet).toHaveFocus()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive width classes', () => {
      const { container } = render(<ShareSheet {...defaultProps} />)

      const sheet = screen.getByTestId('share-sheet-content')
      expect(sheet).toHaveClass('w-full')
      expect(sheet).toHaveClass('sm:w-96')
    })

    it('should adapt to mobile screens', () => {
      const { container } = render(<ShareSheet {...defaultProps} />)

      const sheet = screen.getByTestId('share-sheet-content')
      expect(sheet).toHaveClass('bottom-0')
      expect(sheet).toHaveClass('sm:bottom-auto')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing stock name', () => {
      const props = {
        ...defaultProps,
        name: '',
      }

      render(<ShareSheet {...props} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const name = screen.getByTestId('share-preview-name')
      expect(name).toHaveTextContent('N/A')
    })

    it('should handle zero price', () => {
      const props = {
        ...defaultProps,
        currentPrice: 0,
      }

      render(<ShareSheet {...props} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const price = screen.getByTestId('share-preview-price')
      expect(price).toHaveTextContent('0.00')
    })

    it('should handle clipboard write errors', async () => {
      const originalShare = navigator.share
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: undefined,
      })

      mockWriteText.mockRejectedValueOnce(new Error('Copy failed'))

      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const copyButton = screen.getByTestId('copy-link-button')
      fireEvent.click(copyButton)

      await waitFor(() => {
        const errorMessage = screen.getByText(/failed to copy/i)
        expect(errorMessage).toBeInTheDocument()
      })

      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: originalShare,
      })
    })

    it('should handle missing onShare callback', async () => {
      mockShare.mockResolvedValueOnce(undefined)

      const { rerender } = render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      // Should not throw error
      await waitFor(() => {
        expect(mockShare).toHaveBeenCalled()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should close sheet on Escape key', async () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        const sheet = screen.queryByTestId('share-sheet-content')
        expect(sheet).not.toBeInTheDocument()
      })
    })

    it('should focus close button on open', () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const closeButton = screen.getByTestId('share-sheet-close')
      expect(closeButton).toHaveFocus()
    })
  })

  describe('Animation', () => {
    it('should have entrance animation', () => {
      const { container } = render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const sheet = screen.getByTestId('share-sheet-content')
      expect(sheet).toHaveClass('animate-in')
    })

    it('should have exit animation', async () => {
      render(<ShareSheet {...defaultProps} />)

      const shareButton = screen.getByTestId('share-button')
      fireEvent.click(shareButton)

      const closeButton = screen.getByTestId('share-sheet-close')
      fireEvent.click(closeButton)

      await waitFor(() => {
        const sheet = screen.queryByTestId('share-sheet-content')
        expect(sheet).not.toBeInTheDocument()
      })
    })
  })
})
