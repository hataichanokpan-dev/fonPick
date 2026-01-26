/**
 * SwipeableCard Component
 *
 * A swipeable card component with gesture support using Framer Motion.
 * Supports left/right swipe actions with visual feedback.
 *
 * Features:
 * - Horizontal swipe gestures with drag constraints
 * - Left swipe action (delete/sell) - reveals red background
 * - Right swipe action (add/buy) - reveals green background
 * - Visual feedback during swipe (background reveals)
 * - Threshold-based actions (default: 100px)
 * - Spring animation for snap back or complete action
 * - Haptic feedback on mobile (optional)
 * - Disabled state to prevent dragging
 * - Subtle rotation effect during drag
 * - Full accessibility support with ARIA labels
 *
 * Based on: docs/design_rules.md
 */

'use client'

import { motion, useMotionValue, useTransform, PanInfo, animate } from 'framer-motion'
import { Trash, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SwipeableCardProps } from '@/types'

/**
 * SwipeableCard - A card with swipe gesture support
 *
 * @example
 * ```tsx
 * <SwipeableCard
 *   onSwipeLeft={() => console.log('Deleted')}
 *   onSwipeRight={() => console.log('Saved')}
 *   leftAction={{ label: 'Delete' }}
 *   rightAction={{ label: 'Save' }}
 * >
 *   <div>Your card content here</div>
 * </SwipeableCard>
 * ```
 */
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  className,
  disabled = false,
  hapticFeedback = false,
}: SwipeableCardProps) {
  // Motion value for horizontal position
  const x = useMotionValue(0)

  // Opacity transforms based on drag position
  // Fade out action indicators as drag increases
  const leftOpacity = useTransform(x, [-threshold * 2, -threshold, 0], [1, 1, 0])
  const rightOpacity = useTransform(x, [0, threshold, threshold * 2], [0, 1, 1])

  // Subtle rotation for visual feedback
  const rotateZ = useTransform(x, [-200, 200], [-10, 10])

  // Scale effect during drag
  const scale = useTransform(x, [-threshold * 2, 0, threshold * 2], [0.95, 1, 0.95])

  /**
   * Handle drag end - determine if swipe action should trigger
   */
  const handleDragEnd = (_: any, info: PanInfo) => {
    // Don't trigger if disabled
    if (disabled) return

    const { offset } = info

    // Right swipe (positive offset)
    if (offset.x > threshold && onSwipeRight) {
      // Haptic feedback
      triggerHapticFeedback(hapticFeedback)

      // Animate card out to the right
      animate(x, 300, {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }).then(() => {
        // Trigger callback
        onSwipeRight()
        // Reset position
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 })
      })
    }
    // Left swipe (negative offset)
    else if (offset.x < -threshold && onSwipeLeft) {
      // Haptic feedback
      triggerHapticFeedback(hapticFeedback)

      // Animate card out to the left
      animate(x, -300, {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }).then(() => {
        // Trigger callback
        onSwipeLeft()
        // Reset position
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 })
      })
    }
    // Snap back to center if threshold not met
    else {
      animate(x, 0, {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      })
    }
  }

  /**
   * Trigger haptic feedback on supported devices
   */
  const triggerHapticFeedback = (enabled: boolean) => {
    if (enabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10) // Short 10ms vibration
    }
  }

  // Default action configurations
  const defaultLeftAction = {
    icon: leftAction?.icon || <Trash className="w-5 h-5" />,
    label: leftAction?.label || 'Delete',
    color: leftAction?.color || 'bg-down-primary',
  }

  const defaultRightAction = {
    icon: rightAction?.icon || <Star className="w-5 h-5" />,
    label: rightAction?.label || 'Save',
    color: rightAction?.color || 'bg-up-primary',
  }

  const activeLeftAction = leftAction ? defaultLeftAction : null
  const activeRightAction = rightAction ? defaultRightAction : null

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      {/* Left Action Background (revealed on swipe right) */}
      {activeRightAction && (
        <motion.div
          className="absolute inset-y-0 right-0 flex items-center justify-end gap-2 px-4 text-white rounded-xl"
          style={{
            opacity: rightOpacity,
            backgroundColor: activeRightAction.color === 'bg-up-primary' ? '#4ade80' : activeRightAction.color,
          }}
        >
          <span className="font-medium">{activeRightAction.label}</span>
          {activeRightAction.icon}
        </motion.div>
      )}

      {/* Right Action Background (revealed on swipe left) */}
      {activeLeftAction && (
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center justify-start gap-2 px-4 text-white rounded-xl"
          style={{
            opacity: leftOpacity,
            backgroundColor: activeLeftAction.color === 'bg-down-primary' ? '#ff6b6b' : activeLeftAction.color,
          }}
        >
          {activeLeftAction.icon}
          <span className="font-medium">{activeLeftAction.label}</span>
        </motion.div>
      )}

      {/* Main Card Content */}
      <motion.div
        style={{
          x,
          rotateZ,
          scale,
        }}
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className={cn(
          'relative z-10',
          'bg-surface rounded-xl border border-border-subtle',
          'cursor-grab active:cursor-grabbing',
          'transition-shadow duration-200',
          !disabled && 'hover:shadow-lg',
          disabled && 'cursor-not-allowed opacity-60'
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={
          activeLeftAction || activeRightAction
            ? `Swipeable card. Swipe ${activeLeftAction ? 'left to ' + activeLeftAction.label.toLowerCase() : ''}${activeLeftAction && activeRightAction ? ' or ' : ''}${activeRightAction ? 'right to ' + activeRightAction.label.toLowerCase() : ''}`
            : undefined
        }
        aria-disabled={disabled}
      >
        {children}
      </motion.div>
    </div>
  )
}

/**
 * Default export for convenience
 */
export default SwipeableCard
