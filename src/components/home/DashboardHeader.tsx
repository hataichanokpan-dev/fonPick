/**
 * DashboardHeader Component
 * fonPick - Thai Stock Market Application
 *
 * Displays last update timestamp, refresh button, and market status badge.
 * Compact design for above-the-fold homepage.
 *
 * Based on: docs/design_rules.md
 * Phase 6: Enhanced with new design system tokens
 */

'use client'

import { memo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// ==================================================================
// TYPES
// ==================================================================

export interface DashboardHeaderProps {
  /** Last update timestamp in milliseconds */
  lastUpdate?: number
  /** Market status */
  marketStatus?: 'open' | 'closed' | 'pre-market' | 'after-hours'
  /** Optional refresh callback */
  onRefresh?: () => void | Promise<void>
  /** Loading state for refresh */
  isRefreshing?: boolean
  /** Additional CSS classes */
  className?: string
}

// ==================================================================
// MARKET STATUS BADGE
// ==================================================================

interface MarketStatusBadgeProps {
  status: 'open' | 'closed' | 'pre-market' | 'after-hours'
}

function MarketStatusBadge({ status }: MarketStatusBadgeProps) {
  const statusConfig = {
    open: {
      label: 'Market Open',
      color: 'bg-up-soft',
      textColor: 'text-up-primary',
      dotColor: '#4ade80',
    },
    closed: {
      label: 'Market Closed',
      color: 'bg-surface-2',
      textColor: 'text-text-tertiary',
      dotColor: '#9ca3af',
    },
    'pre-market': {
      label: 'Pre-Market',
      color: 'bg-warning/20',
      textColor: 'text-warning',
      dotColor: '#f97316',
    },
    'after-hours': {
      label: 'After Hours',
      color: 'bg-accent-blue/20',
      textColor: 'text-accent-blue',
      dotColor: '#3b82f6',
    },
  } as const

  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: config.dotColor }}
        aria-hidden="true"
      />
      <span className={cn('text-xs font-medium', config.textColor)}>
        {config.label}
      </span>
    </div>
  )
}

// ==================================================================
// TIME DISPLAY
// ==================================================================

interface TimeDisplayProps {
  timestamp?: number
}

function TimeDisplay({ timestamp }: TimeDisplayProps) {
  if (!timestamp) {
    return (
      <span className="text-xs text-text-tertiary">
        No data available
      </span>
    )
  }

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  let timeString: string
  if (diffMins < 1) {
    timeString = 'Just now'
  } else if (diffMins < 60) {
    timeString = `${diffMins}m ago`
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60)
    timeString = `${hours}h ago`
  } else {
    const days = Math.floor(diffMins / 1440)
    timeString = `${days}d ago`
  }

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-secondary">
        {formattedTime}
      </span>
      <span className={cn(
        'text-xs font-medium',
        diffMins < 15 ? 'text-up-primary' : diffMins < 60 ? 'text-warning' : 'text-text-tertiary'
      )}>
        {timeString}
      </span>
    </div>
  )
}

// ==================================================================
// REFRESH BUTTON
// ==================================================================

interface RefreshButtonProps {
  onRefresh?: () => void | Promise<void>
  isRefreshing?: boolean
}

function RefreshButton({ onRefresh, isRefreshing = false }: RefreshButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    if (isLoading || isRefreshing) return

    setIsLoading(true)
    try {
      await onRefresh?.()
    } finally {
      setIsLoading(false)
    }
  }

  if (!onRefresh) {
    return null
  }

  const refreshing = isLoading || isRefreshing

  return (
    <button
      onClick={handleRefresh}
      disabled={refreshing}
      className={cn(
        'p-2 rounded-lg transition-all',
        'bg-bg-surface-2 hover:bg-bg-surface-3',
        'border border-border-subtle',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-up-primary'
      )}
      aria-label="Refresh data"
      type="button"
    >
      <RefreshCw
        className={cn(
          'w-4 h-4 text-text-secondary',
          refreshing && 'animate-spin'
        )}
      />
    </button>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

function DashboardHeader({
  lastUpdate,
  marketStatus = 'closed',
  onRefresh,
  isRefreshing = false,
  className,
}: DashboardHeaderProps) {
  // Auto-detect market status based on time if not provided
  const getAutoMarketStatus = (): 'open' | 'closed' | 'pre-market' | 'after-hours' => {
    if (marketStatus !== 'closed') return marketStatus

    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const timeMins = hours * 60 + minutes

    // Thai market hours: 10:00-12:30, 14:30-16:30
    // Morning session: 10:00 (600) - 12:30 (750)
    // Afternoon session: 14:30 (870) - 16:30 (990)
    // Pre-market: 09:30 (570) - 10:00 (600)
    // After-hours: 16:30 (990) - 17:00 (1020)

    if (timeMins >= 600 && timeMins < 750) return 'open'
    if (timeMins >= 870 && timeMins < 990) return 'open'
    if (timeMins >= 570 && timeMins < 600) return 'pre-market'
    if (timeMins >= 990 && timeMins < 1020) return 'after-hours'
    return 'closed'
  }

  const actualStatus = getAutoMarketStatus()

  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      {/* Left: Market status and last update */}
      <div className="flex items-center gap-4">
        <MarketStatusBadge status={actualStatus} />
        <TimeDisplay timestamp={lastUpdate} />
      </div>

      {/* Right: Refresh button */}
      <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
const MemoizedDashboardHeader = memo(DashboardHeader, (prevProps, nextProps) => {
  return (
    prevProps.lastUpdate === nextProps.lastUpdate &&
    prevProps.marketStatus === nextProps.marketStatus &&
    prevProps.isRefreshing === nextProps.isRefreshing
  )
})

// Named export for convenience
export { MemoizedDashboardHeader as DashboardHeader }

// Default export
export default MemoizedDashboardHeader
