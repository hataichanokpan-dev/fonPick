/**
 * ShareSheet Component
 *
 * Share stock information via Web Share API or fallback to copy link
 * with social media sharing options.
 *
 * Features:
 * - Web Share API integration (mobile)
 * - Copy link fallback (desktop)
 * - Share image preview card
 * - Analytics tracking for shares
 * - Social media icons (Facebook, Twitter, Line)
 * - Open in new tab
 * - Toast notification on success
 * - Keyboard navigation (Escape to close)
 * - Focus trap when open
 * - Responsive design (mobile sheet / desktop modal)
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Share2,
  X,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/shared'
import { cn } from '@/lib/utils'

interface ShareSheetProps {
  symbol: string
  name: string
  currentPrice: number
  change: number
  changePercent: number
  onShare?: (event: {
    type: 'share'
    symbol: string
    method: 'web-share-api' | 'copy-link' | 'facebook' | 'twitter' | 'line'
  }) => void
  className?: string
}

interface ShareEvent {
  type: 'share'
  symbol: string
  method: 'web-share-api' | 'copy-link' | 'facebook' | 'twitter' | 'line'
}

/**
 * ShareSheet component for sharing stock information
 */
export function ShareSheet({
  symbol,
  name,
  currentPrice,
  change,
  changePercent,
  onShare,
  className,
}: ShareSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get current URL for sharing
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  // Track share event
  const trackShare = useCallback(
    (method: ShareEvent['method']) => {
      onShare?.({
        type: 'share',
        symbol,
        method,
      })
    },
    [symbol, onShare]
  )

  // Show toast notification
  const showToastNotification = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)

    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    // Set new timeout
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  // Handle Web Share API
  const handleWebShare = useCallback(async () => {
    if (isSharing) return

    setIsSharing(true)

    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: `${symbol}: ${currentPrice.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`,
          url: shareUrl,
        })

        trackShare('web-share-api')
        showToastNotification('Shared successfully!')
        setIsOpen(false)
      } else {
        // Fallback to opening the sheet
        setIsOpen(true)
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share failed:', error)
        setIsOpen(true) // Show fallback sheet
      }
    } finally {
      setIsSharing(false)
    }
  }, [
    isSharing,
    name,
    symbol,
    currentPrice,
    changePercent,
    shareUrl,
    trackShare,
    showToastNotification,
  ])

  // Handle copy link
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      trackShare('copy-link')
      showToastNotification('Link copied to clipboard!')
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to copy link:', error)
      showToastNotification('Failed to copy link')
    }
  }, [shareUrl, trackShare, showToastNotification])

  // Handle social media share
  const handleSocialShare = useCallback(
    (platform: 'facebook' | 'twitter' | 'line') => {
      const encodedUrl = encodeURIComponent(shareUrl)
      const encodedText = encodeURIComponent(
        `${symbol}: ${currentPrice.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`
      )

      let platformShareUrl = ""

      switch (platform) {
        case 'facebook':
          platformShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
          break
        case 'twitter':
          platformShareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
          break
        case 'line':
          platformShareUrl = `https://line.me/R/msg/text/?${encodedText}${encodedUrl}`
          break
      }

      trackShare(platform)
      window.open(platformShareUrl, '_blank', 'noopener,noreferrer')
      setIsOpen(false)
    },
    [symbol, currentPrice, changePercent, shareUrl, trackShare]
  )

  // Handle keyboard close
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    },
    []
  )

  // Get color class for price change
  const getChangeColor = () => {
    if (change > 0) return 'text-up-primary'
    if (change < 0) return 'text-down-primary'
    return 'text-neutral'
  }

  return (
    <>
      {/* Share Button */}
      <Button
        variant="outline"
        size="md"
        onClick={handleWebShare}
        disabled={isSharing}
        className={className}
        data-testid="share-button"
        aria-label="Share stock"
      >
        {isSharing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Share</span>
      </Button>

      {/* Share Sheet Modal */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            data-testid="share-sheet-overlay"
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet Content */}
          <div
            data-testid="share-sheet-content"
            className={cn(
              'fixed z-50 bg-bg-surface-1 rounded-t-2xl shadow-2xl animate-slide-in-up',
              'bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
              'w-full sm:w-96 max-h-[90vh] overflow-hidden',
              'border border-border-subtle'
            )}
            role="dialog"
            aria-label="Share options"
            onKeyDown={handleKeyDown}
          >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                <h3 className="text-lg font-semibold text-text-primary">
                  Share Stock
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  data-testid="share-sheet-close"
                  aria-label="Close share sheet"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Preview Card */}
              <div className="p-4 border-b border-border-subtle bg-bg-surface-2">
                <div
                  className="flex items-center justify-between"
                  data-testid="share-preview"
                >
                  <div>
                    <p
                      className="text-sm text-text-secondary"
                      data-testid="share-preview-symbol"
                    >
                      {symbol || 'N/A'}
                    </p>
                    <p
                      className="text-xs text-text-tertiary"
                      data-testid="share-preview-name"
                    >
                      {name || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-xl font-semibold text-text-primary"
                      data-testid="share-preview-price"
                    >
                      {currentPrice.toFixed(2)}
                    </p>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        getChangeColor()
                      )}
                      data-testid="share-preview-change"
                    >
                      {changePercent >= 0 ? '+' : ''}
                      {changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Share Options */}
              <div className="p-4 space-y-2">
                {/* Copy Link */}
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleCopyLink}
                  className="w-full justify-start gap-3"
                  data-testid="copy-link-button"
                  aria-label="Copy link to clipboard"
                >
                  <LinkIcon className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium text-text-primary">
                      Copy Link
                    </p>
                    <p className="text-xs text-text-tertiary">
                      Copy link to clipboard
                    </p>
                  </div>
                </Button>

                {/* Social Media Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => handleSocialShare('facebook')}
                    className="flex flex-col gap-1 py-4 h-auto"
                    data-testid="share-facebook"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5 text-[#1877F2]" />
                    <span className="text-xs text-text-secondary">
                      Facebook
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => handleSocialShare('twitter')}
                    className="flex flex-col gap-1 py-4 h-auto"
                    data-testid="share-twitter"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                    <span className="text-xs text-text-secondary">Twitter</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => handleSocialShare('line')}
                    className="flex flex-col gap-1 py-4 h-auto"
                    data-testid="share-line"
                    aria-label="Share on Line"
                  >
                    <div className="w-5 h-5 bg-[#00B900] rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        LINE
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary">Line</span>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      )

      {/* Toast Notification */}
      {showToast && (
        <div
          data-testid="share-success-toast"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up"
        >
          <div className="bg-bg-surface-1 border border-border-subtle rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-up-primary" />
            <p className="text-sm text-text-primary">{toastMessage}</p>
          </div>
        </div>
      )}
    </>
  )
}
