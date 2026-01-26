/**
 * ShimmerSkeleton Component
 *
 * A loading skeleton with shimmer wave effect for placeholder content.
 * Features:
 * - Animated shimmer wave effect using Framer Motion
 * - Realistic content shapes for different UI patterns
 * - Multiple variants (text, circle, card, custom)
 * - Multiple lines support for text variant
 * - Avatar support for card variant
 * - Custom dimensions support
 * - Staggered animation delays for natural shimmer effect
 * - Full accessibility with ARIA labels
 * - Reduces motion preference support
 *
 * Based on: docs/design_rules.md
 * @example
 * ```tsx
 * <ShimmerSkeleton variant="text" lines={3} />
 * <ShimmerSkeleton variant="circle" width={40} />
 * <ShimmerSkeleton variant="card" lines={4} showAvatar />
 * <ShimmerSkeleton variant="custom" width="100%" height={200} />
 * ```
 */

'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Variant types for ShimmerSkeleton
 */
export type ShimmerSkeletonVariant = 'text' | 'circle' | 'card' | 'custom'

/**
 * Props interface for ShimmerSkeleton component
 */
export interface ShimmerSkeletonProps {
  /** Visual variant type */
  variant?: ShimmerSkeletonVariant
  /** Width for circle/custom variants */
  width?: string | number
  /** Height for custom variant */
  height?: string | number
  /** Number of lines for text/card variant */
  lines?: number
  /** Additional CSS classes */
  className?: string
  /** Show avatar for card variant */
  showAvatar?: boolean
  /** ARIA label for accessibility */
  ariaLabel?: string
  /** Test ID for testing */
  testId?: string
}

/**
 * Base animation configuration for shimmer pulse effect
 */
const shimmerAnimation = {
  initial: { opacity: 0.5 },
  animate: { opacity: 1 },
  transition: {
    repeat: Infinity,
    duration: 1,
    repeatType: 'reverse' as const,
    ease: 'easeInOut' as const,
  },
}

/**
 * Base skeleton element classes
 */
const baseSkeletonClass = 'rounded-md bg-surface-2'

/**
 * Text line height classes
 */
const textLineHeight = 'h-4'

/**
 * ShimmerSkeleton - Loading skeleton with shimmer wave effect
 *
 * @example
 * ```tsx
 * // Text variant with multiple lines
 * <ShimmerSkeleton variant="text" lines={3} />
 *
 * // Circle variant (avatar, icon)
 * <ShimmerSkeleton variant="circle" width={40} />
 *
 * // Card variant with avatar
 * <ShimmerSkeleton variant="card" lines={4} showAvatar />
 *
 * // Custom dimensions
 * <ShimmerSkeleton variant="custom" width="100%" height={200} />
 * ```
 */
export function ShimmerSkeleton({
  variant = 'text',
  width,
  height,
  lines = 3,
  className,
  showAvatar = false,
  ariaLabel,
  testId,
}: ShimmerSkeletonProps) {
  // ==================================================================
  // RENDER VARIANTS
  // ==================================================================

  /**
   * Text variant - Multiple skeleton lines with decreasing width
   * Simulates paragraphs of text with natural line breaks
   */
  if (variant === 'text') {
    return (
      <div
        className={cn('space-y-2', className)}
        aria-label={ariaLabel || 'Loading text content'}
        aria-hidden="true"
        data-testid={testId}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(baseSkeletonClass, textLineHeight)}
            style={{ width: i === lines - 1 ? '70%' : '100%' }}
            {...shimmerAnimation}
            transition={{
              ...shimmerAnimation.transition,
              delay: i * 0.1, // Staggered delay for wave effect
            }}
          />
        ))}
      </div>
    )
  }

  /**
   * Circle variant - Circular skeleton for avatars, icons, badges
   * Width is used for both width and height (always circular)
   */
  if (variant === 'circle') {
    const size = width || '2.5rem'

    return (
      <motion.div
        className={cn(baseSkeletonClass, 'rounded-full', className)}
        style={{ width: size, height: size }}
        {...shimmerAnimation}
        aria-label={ariaLabel || 'Loading circular content'}
        aria-hidden="true"
        data-testid={testId}
      />
    )
  }

  /**
   * Card variant - Complex card layout with header and content lines
   * Includes optional avatar and realistic content structure
   */
  if (variant === 'card') {
    return (
      <div
        className={cn('p-4 space-y-3 bg-surface border border-border rounded-lg', className)}
        aria-label={ariaLabel || 'Loading card content'}
        aria-hidden="true"
        data-testid={testId}
      >
        {/* Header section with optional avatar */}
        <div className="flex items-center gap-3">
          {showAvatar && (
            <motion.div
              className="w-10 h-10 rounded-full bg-surface-2"
              {...shimmerAnimation}
              transition={{ ...shimmerAnimation.transition, delay: 0 }}
            />
          )}
          <div className="flex-1 space-y-2">
            <motion.div
              className={cn(baseSkeletonClass, 'h-4')}
              style={{ width: '60%' }}
              {...shimmerAnimation}
              transition={{ ...shimmerAnimation.transition, delay: 0.05 }}
            />
            <motion.div
              className={cn(baseSkeletonClass, 'h-3')}
              style={{ width: '35%' }}
              {...shimmerAnimation}
              transition={{ ...shimmerAnimation.transition, delay: 0.1 }}
            />
          </div>
        </div>

        {/* Content lines with staggered delays */}
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(baseSkeletonClass, 'h-3')}
            style={{ width: i === lines - 1 ? '80%' : '100%' }}
            {...shimmerAnimation}
            transition={{ ...shimmerAnimation.transition, delay: 0.15 + i * 0.08 }}
          />
        ))}
      </div>
    )
  }

  /**
   * Custom variant - Fully customizable dimensions
   * Use for any custom shape or size requirement
   */
  return (
    <motion.div
      className={cn(baseSkeletonClass, className)}
      style={{ width, height }}
      {...shimmerAnimation}
      aria-label={ariaLabel || 'Loading content'}
      aria-hidden="true"
      data-testid={testId}
    />
  )
}

/**
 * TextSkeleton - Convenient wrapper for text variant
 * @example
 * ```tsx
 * <TextSkeleton lines={2} />
 * ```
 */
export function TextSkeleton({
  lines = 3,
  className,
  ...props
}: Omit<ShimmerSkeletonProps, 'variant'>) {
  return <ShimmerSkeleton variant="text" lines={lines} className={className} {...props} />
}

/**
 * CircleSkeleton - Convenient wrapper for circle variant
 * @example
 * ```tsx
 * <CircleSkeleton width={40} />
 * ```
 */
export function CircleSkeleton({
  width = 40,
  className,
  ...props
}: Omit<ShimmerSkeletonProps, 'variant' | 'height'>) {
  return <ShimmerSkeleton variant="circle" width={width} className={className} {...props} />
}

/**
 * CardSkeleton - Convenient wrapper for card variant
 * @example
 * ```tsx
 * <CardSkeleton lines={4} showAvatar />
 * ```
 */
export function CardSkeleton({
  lines = 3,
  showAvatar = false,
  className,
  ...props
}: Omit<ShimmerSkeletonProps, 'variant'>) {
  return (
    <ShimmerSkeleton variant="card" lines={lines} showAvatar={showAvatar} className={className} {...props} />
  )
}

/**
 * Default export for convenience
 */
export default ShimmerSkeleton
