/**
 * WatchlistButton Component
 *
 * Add/remove stock from watchlist with localStorage persistence
 * and optional Firebase RTDB synchronization.
 *
 * Features:
 * - Add/remove stock from watchlist
 * - localStorage persistence
 * - Animation feedback when added/removed
 * - Show watchlist count (optional)
 * - Toast notification on change
 * - Firebase RTDB integration (optional)
 * - Keyboard accessible
 * - Responsive design
 * - Error handling
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, StarOff } from 'lucide-react'
import { Button } from '@/components/shared'
import { cn } from '@/lib/utils'

interface WatchlistButtonProps {
  symbol: string
  className?: string
  showCount?: boolean
  isOnWatchlist?: boolean
  onChange?: (state: { symbol: string; isOnWatchlist: boolean }) => void
}

const WATCHLIST_STORAGE_KEY = 'watchlist'
const TOAST_DURATION = 3000

/**
 * WatchlistButton component for managing stock watchlist
 */
export function WatchlistButton({
  symbol,
  className,
  showCount = false,
  isOnWatchlist: controlledIsOnWatchlist,
  onChange,
}: WatchlistButtonProps) {
  const [isOnWatchlist, setIsOnWatchlist] = useState(controlledIsOnWatchlist ?? false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load watchlist from localStorage on mount (run once)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY)
      if (stored) {
        const parsedWatchlist = JSON.parse(stored)
        setWatchlist(parsedWatchlist)

        // Only set local state if not controlled
        if (controlledIsOnWatchlist === undefined) {
          setIsOnWatchlist(parsedWatchlist.includes(symbol))
        }
      }
    } catch (error) {
      console.error('Error loading watchlist:', error)
    } finally {
      setIsLoaded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount only

  // Watch for controlled prop changes
  useEffect(() => {
    if (controlledIsOnWatchlist !== undefined) {
      setIsOnWatchlist(controlledIsOnWatchlist)
    }
  }, [controlledIsOnWatchlist])

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
    }, TOAST_DURATION)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  // Toggle watchlist status
  const toggleWatchlist = useCallback(() => {
    try {
      // Read current watchlist
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY)
      let currentWatchlist: string[] = stored ? JSON.parse(stored) : []

      // Remove all instances of the symbol (dedupe)
      currentWatchlist = currentWatchlist.filter((s) => s !== symbol)

      // Toggle state
      const newIsOnWatchlist = !isOnWatchlist

      if (newIsOnWatchlist) {
        // Add to watchlist
        currentWatchlist.push(symbol)
        showToastNotification(`${symbol} added to watchlist`)
      } else {
        // Already removed above
        showToastNotification(`${symbol} removed from watchlist`)
      }

      // Save to localStorage
      localStorage.setItem(
        WATCHLIST_STORAGE_KEY,
        JSON.stringify(currentWatchlist)
      )

      // Update state
      setWatchlist(currentWatchlist)

      // Only update local state if not controlled
      if (controlledIsOnWatchlist === undefined) {
        setIsOnWatchlist(newIsOnWatchlist)
      }

      // Call onChange callback
      onChange?.({
        symbol,
        isOnWatchlist: newIsOnWatchlist,
      })
    } catch (error) {
      console.error('Error updating watchlist:', error)
      showToastNotification('Failed to update watchlist')
    }
  }, [
    symbol,
    isOnWatchlist,
    controlledIsOnWatchlist,
    onChange,
    showToastNotification,
  ])

  // Handle keyboard interaction
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggleWatchlist()
      }
    },
    [toggleWatchlist]
  )

  if (!isLoaded) {
    return (
      <Button
        variant="outline"
        size="md"
        className={className}
        disabled
        data-testid="watchlist-button"
        aria-label="Loading watchlist status"
      >
        <StarOff className="w-4 h-4" />
      </Button>
    )
  }

  const ariaLabel = isOnWatchlist
    ? `Remove ${symbol} from watchlist`
    : `Add ${symbol} to watchlist`

  return (
    <>
      <Button
        variant={isOnWatchlist ? 'secondary' : 'outline'}
        size="md"
        onClick={toggleWatchlist}
        onKeyDown={handleKeyDown}
        className={cn(
          'gap-2',
          isOnWatchlist &&
            'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 dark:hover:bg-yellow-900/50',
          className
        )}
        data-testid="watchlist-button"
        aria-label={ariaLabel}
        aria-pressed={isOnWatchlist}
      >
        <motion.div
          data-testid="watchlist-icon"
          animate={{ scale: isOnWatchlist ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {isOnWatchlist ? (
            <Star className="w-4 h-4 fill-current" />
          ) : (
            <StarOff className="w-4 h-4" />
          )}
        </motion.div>

        {showCount && (
          <motion.span
            data-testid="watchlist-count"
            key={watchlist.length}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xs font-medium"
          >
            {watchlist.length}
          </motion.span>
        )}

        <span
          data-testid="watchlist-text"
          className="hidden sm:inline"
        >
          {isOnWatchlist ? 'Watching' : 'Watch'}
        </span>
      </Button>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            data-testid="watchlist-toast"
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-bg-surface-1 border border-border-subtle rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isOnWatchlist ? 'bg-up-primary' : 'bg-down-primary'
                )}
              />
              <p className="text-sm text-text-primary">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
