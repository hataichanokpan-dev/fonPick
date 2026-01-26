/**
 * PullToRefresh Component
 *
 * A pull-to-refresh component for mobile with gesture support using Framer Motion.
 * Features:
 * - Vertical pull gesture with drag constraints
 * - Threshold-based refresh (default: 80px)
 * - Loading spinner emerges from top when pulling down
 * - Progressive opacity and scale based on pull distance
 * - Smooth snap-back animation with spring physics
 * - Glassmorphism loading indicator with blur effect
 * - Content opacity fade during refresh
 * - Disabled state to prevent pulling
 * - Full accessibility support with ARIA labels
 *
 * Based on: docs/design_rules.md
 * @example
 * ```tsx
 * <PullToRefresh
 *   onRefresh={async () => {
 *     await fetchData()
 *   }}
 *   threshold={80}
 * >
 *   <div>Your content here</div>
 * </PullToRefresh>
 * ```
 */

'use client'

import { motion, useMotionValue, useTransform, PanInfo, animate } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'
import type { PullToRefreshProps } from '@/types'

/**
 * PullToRefresh - Pull gesture enabled refresh component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PullToRefresh
 *   onRefresh={async () => {
 *     await fetchLatestData()
 *   }}
 * >
 *   <StockList />
 * </PullToRefresh>
 *
 * // With custom threshold and disabled state
 * <PullToRefresh
 *   onRefresh={handleRefresh}
 *   threshold={100}
 *   disabled={isLoading}
 * >
 *   <Dashboard />
 * </PullToRefresh>
 * ```
 */
export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className,
  disabled = false,
  ariaLabel,
  testId,
}: PullToRefreshProps) {
  // ==================================================================
  // STATE
  // ==================================================================

  const [refreshing, setRefreshing] = useState(false)

  // ==================================================================
  // MOTION VALUES
  // ==================================================================

  // Vertical position motion value
  const y = useMotionValue(0)

  // Opacity transform based on pull distance
  // Fades in as user pulls down
  const opacity = useTransform(y, [0, threshold], [0, 1])

  // Scale transform based on pull distance
  // Grows from 0.5 to full size as user pulls
  const scale = useTransform(y, [0, threshold], [0.5, 1])

  // ==================================================================
  // HANDLERS
  // ==================================================================

  /**
   * Handle drag end - determine if refresh should trigger
   */
  const handleDragEnd = useCallback(
    async (_: any, info: PanInfo) => {
      const currentPullDistance = Math.abs(info.offset.y)

      // Trigger refresh if threshold is met and not already refreshing
      if (currentPullDistance >= threshold && !refreshing && !disabled) {
        setRefreshing(true)

        try {
          await onRefresh()
        } catch (error) {
          // Log error but don't break the UI
          console.error('Refresh failed:', error)
        } finally {
          setRefreshing(false)
        }
      }

      // Always snap back to position 0
      animate(y, 0, {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      })
    },
    [threshold, refreshing, disabled, onRefresh, y]
  )

  // ==================================================================
  // RENDER
  // ==================================================================

  return (
    <div
      className={cn('relative', className)}
      aria-label={ariaLabel || 'Pull to refresh'}
      data-testid={testId}
      aria-busy={refreshing}
    >
      {/* Loading Indicator - emerges from top when pulling */}
      <div className="absolute -top-16 left-0 right-0 flex items-center justify-center pointer-events-none">
        <motion.div
          style={{
            opacity,
            scale,
          }}
          className={cn(
            // Glassmorphism effect
            'bg-surface/80',
            'backdrop-blur-md',
            'rounded-full',
            'p-3',
            'border border-border-subtle',
            'shadow-soft'
          )}
          aria-hidden="true"
        >
          <RefreshCw
            className={cn(
              'w-6 h-6 text-accent-blue',
              refreshing && 'animate-spin'
            )}
          />
        </motion.div>
      </div>

      {/* Motion Wrapper with drag gesture */}
      <motion.div
        drag={disabled ? false : 'y'}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className={cn(
          // Ensure touch action is properly handled
          'touch-pan-y',
          disabled && 'cursor-not-allowed'
        )}
        role="region"
        aria-live="polite"
        aria-label={refreshing ? 'Refreshing content' : 'Pull down to refresh'}
      >
        {/* Content with opacity fade during refresh */}
        <div
          className={cn(
            refreshing && 'opacity-50',
            'transition-opacity',
            'duration-200'
          )}
        >
          {children}
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Default export for convenience
 */
export default PullToRefresh
