/**
 * StockDataFreshness Component
 *
 * Displays data freshness information with Thai timezone support.
 *
 * Features:
 * - Display last update time (Thai timezone)
 * - Show stale data warning (>5 minutes)
 * - Auto-refresh indicator
 * - Manual refresh button with loading state
 * - Live indicator for recent data (<1 minute)
 * - Relative time display ("2 minutes ago")
 * - Compact mode for mobile
 * - Keyboard accessible
 * - Responsive design
 */

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatThaiDateTime } from '@/lib/utils/date'

interface StockDataFreshnessProps {
  lastUpdate?: string
  onRefresh?: () => void | Promise<void>
  isRefreshing?: boolean
  autoRefreshInterval?: number // in milliseconds
  compact?: boolean
  className?: string
}

const STALE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes
const LIVE_THRESHOLD_MS = 60 * 1000 // 1 minute
const UPDATE_INTERVAL_MS = 60 * 1000 // Update relative time every minute

/**
 * StockDataFreshness component for displaying data freshness
 */
export function StockDataFreshness({
  lastUpdate,
  onRefresh,
  isRefreshing = false,
  autoRefreshInterval,
  compact = false,
  className,
}: StockDataFreshnessProps) {
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [isRefreshingInternal, setIsRefreshingInternal] = useState(false)

  // Use a ref to store the latest onRefresh function without triggering re-renders
  const onRefreshRef = useRef(onRefresh)

  // Update the ref whenever onRefresh changes
  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, UPDATE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [])

  // Auto-refresh logic - uses ref to avoid dependency on unstable onRefresh function
  useEffect(() => {
    if (!autoRefreshInterval || autoRefreshInterval <= 0 || !onRefreshRef.current) {
      return
    }

    const interval = setInterval(async () => {
      try {
        await onRefreshRef.current?.()
      } catch (error) {
        console.error('Auto-refresh failed:', error)
      }
    }, autoRefreshInterval)

    return () => clearInterval(interval)
  }, [autoRefreshInterval])  // Only depend on autoRefreshInterval, not onRefresh

  // Calculate time difference
  const timeDiff = useMemo(() => {
    if (!lastUpdate) return null
    const updateDate = new Date(lastUpdate)
    return currentTime - updateDate.getTime()
  }, [lastUpdate, currentTime])

  // Determine if data is stale
  const isStale = useMemo(() => {
    if (!timeDiff) return false
    return timeDiff > STALE_THRESHOLD_MS
  }, [timeDiff])

  // Determine if data is live
  const isLive = useMemo(() => {
    if (!timeDiff) return false
    return timeDiff < LIVE_THRESHOLD_MS
  }, [timeDiff])

  // Format relative time
  const relativeTime = useMemo(() => {
    if (!timeDiff) return 'Unknown'

    const seconds = Math.floor(timeDiff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }, [timeDiff])

  // Format absolute time in Thai timezone
  const absoluteTime = useMemo(() => {
    if (!lastUpdate) return '--:--'
    try {
      const date = new Date(lastUpdate)
      // Extract time from Thai datetime format
      const thaiDateTime = formatThaiDateTime(date)
      // Format is DD/MM/YYYY HH:MM:SS, extract time part
      const timeMatch = thaiDateTime.match(/(\d{2}:\d{2})/)
      return timeMatch ? timeMatch[1] : '--:--'
    } catch {
      return '--:--'
    }
  }, [lastUpdate])

  // Format auto-refresh interval
  const formatInterval = useCallback((ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes >= 1) {
      return `${minutes}m`
    }
    return `${seconds}s`
  }, [])

  // Handle refresh button click
  const handleRefresh = useCallback(async () => {
    if (isRefreshing || isRefreshingInternal || !onRefresh) return

    setIsRefreshingInternal(true)
    try {
      await onRefresh()
    } catch (error) {
      console.error('Manual refresh failed:', error)
    } finally {
      setIsRefreshingInternal(false)
    }
  }, [isRefreshing, isRefreshingInternal, onRefresh])

  const actuallyRefreshing = isRefreshing || isRefreshingInternal

  return (
    <div
      data-testid="data-freshness"
      className={cn(
        'flex items-center gap-2 text-text-tertiary',
        'text-xs sm:text-sm',
        className
      )}
      aria-label={`Last updated ${relativeTime}`}
    >
      {/* Clock Icon */}
      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />

      {/* Absolute Time */}
      <span data-testid="last-update-time" className="font-medium">
        {absoluteTime}
      </span>

      {/* Relative Time (hidden in compact mode) */}
      {!compact && (
        <span
          data-testid="relative-time"
          className="text-text-tertiary"
        >
          {relativeTime}
        </span>
      )}

      {/* Live Indicator */}
      {isLive && (
        <span
          data-testid="live-indicator"
          className="px-1.5 py-0.5 bg-up-primary/20 text-up-primary text-xs font-medium rounded-full animate-pulse-opacity"
          aria-live="polite"
        >
          LIVE
        </span>
      )}

      {/* Stale Warning */}
      {isStale && !compact && (
        <span
          data-testid="stale-warning"
          className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400"
          title="Data may be outdated"
        >
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">Stale</span>
        </span>
      )}

      {/* Auto-Refresh Indicator */}
      {autoRefreshInterval && autoRefreshInterval > 0 && !compact && (
        <span
          data-testid="auto-refresh-indicator"
          className="text-xs text-text-tertiary"
          title={`Auto-refreshes every ${formatInterval(autoRefreshInterval)}`}
        >
          {formatInterval(autoRefreshInterval)}
        </span>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <button
          data-testid="refresh-button"
          onClick={handleRefresh}
          disabled={actuallyRefreshing}
          aria-label="Refresh data"
          aria-busy={actuallyRefreshing}
          className={cn(
            'p-1 rounded transition-colors',
            'hover:bg-bg-surface-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            actuallyRefreshing && 'animate-spin'
          )}
        >
          <RefreshCw
            className={cn(
              'w-3.5 h-3.5 sm:w-4 sm:h-4',
              actuallyRefreshing && 'animate-spin'
            )}
          />
        </button>
      )}
    </div>
  )
}
