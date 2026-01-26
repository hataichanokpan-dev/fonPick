/**
 * AnimatedPrice Component
 *
 * An animated price display component with flash effect on value changes.
 * Features:
 * - Flash animation when value changes (green for up, red for down)
 * - Smooth number transition (counting animation with requestAnimationFrame)
 * - Color-coded based on change direction
 * - Tabular numbers for alignment
 * - Change indicator with percentage and trend icon
 * - Multiple sizes (sm, md, lg, xl)
 *
 * Based on: docs/design_rules.md
 */

'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState, useRef, useCallback } from 'react'

/**
 * Size variants for the component
 */
type AnimatedPriceSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Props interface for AnimatedPrice component
 */
export interface AnimatedPriceProps {
  /** Current price value */
  value: number
  /** Previous value for calculating change */
  previousValue?: number
  /** Prefix to display before the value (e.g., '฿', '$', 'THB') */
  prefix?: string
  /** Suffix to display after the value (e.g., '%', 'M', 'B') */
  suffix?: string
  /** Whether to show the percentage change indicator */
  showChange?: boolean
  /** Whether to show the trend icon */
  showIcon?: boolean
  /** Size variant for the component */
  size?: AnimatedPriceSize
  /** Additional CSS classes to apply */
  className?: string
  /** Number of decimal places to display (default: 2) */
  decimals?: number
  /** ARIA label for accessibility */
  ariaLabel?: string
}

/**
 * Size configurations mapping
 */
const sizeClasses = {
  sm: 'text-sm', // 14px
  md: 'text-base', // 16px
  lg: 'text-xl', // 20px
  xl: 'text-2xl', // 24px
}

/**
 * Change indicator size configurations
 */
const changeSizeClasses = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
  xl: 'text-base',
}

/**
 * Icon size configurations
 */
const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
  xl: 'w-5 h-5',
}

/**
 * AnimatedPrice - Flash animation on price changes with counting animation
 *
 * @example
 * ```tsx
 * <AnimatedPrice value={1250.50} previousValue={1200} prefix="฿" />
 * <AnimatedPrice value={-2.5} previousValue={0} suffix="%" showChange showIcon />
 * <AnimatedPrice value={1500} size="xl" showChange={false} />
 * ```
 */
export function AnimatedPrice({
  value,
  previousValue,
  prefix = '',
  suffix = '',
  showChange = true,
  showIcon = true,
  size = 'md',
  className,
  decimals = 2,
  ariaLabel,
}: AnimatedPriceProps) {
  // ==================================================================
  // STATE
  // ==================================================================

  const [displayValue, setDisplayValue] = useState(value)
  const [flashDirection, setFlashDirection] = useState<'up' | 'down' | null>(null)

  // Track value ref for comparison
  const valueRef = useRef(value)

  // ==================================================================
  // FLASH ANIMATION
  // ==================================================================

  /**
   * Trigger flash animation when value changes
   */
  useEffect(() => {
    // Skip initial render
    if (valueRef.current === value) return

    // Determine flash direction based on change
    const direction = value > valueRef.current ? 'up' : 'down'
    setFlashDirection(direction)

    // Clear flash after animation completes
    const flashTimer = setTimeout(() => {
      setFlashDirection(null)
    }, 600)

    return () => clearTimeout(flashTimer)
  }, [value])

  // ==================================================================
  // COUNTING ANIMATION
  // ==================================================================

  /**
   * Animate number from old value to new value using requestAnimationFrame
   * Uses cubic ease-out for smooth 60fps animation
   */
  useEffect(() => {
    // Skip if value hasn't changed
    if (displayValue === value) return

    const startValue = displayValue
    const endValue = value
    const duration = 500 // 500ms duration
    const startTime = performance.now()

    // Cubic ease-out function: 1 - (1 - t)^3
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3)
    }

    let cancelled = false
    let rafId: number

    // Animation frame handler
    const animate = (currentTime: number) => {
      if (cancelled) return

      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)

      // Calculate interpolated value
      const newValue = startValue + (endValue - startValue) * easedProgress
      setDisplayValue(newValue)

      // Continue animation if not complete
      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        // Ensure final value is exact
        setDisplayValue(endValue)
      }
    }

    // Start animation
    rafId = requestAnimationFrame(animate)

    // Cleanup function
    return () => {
      cancelled = true
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [value])

  // Update ref when value changes
  useEffect(() => {
    valueRef.current = value
  }, [value])

  // ==================================================================
  // CALCULATIONS
  // ==================================================================

  /**
   * Calculate absolute change and percentage change
   */
  const change = useCallback((): number => {
    if (previousValue === undefined) return 0
    return value - previousValue
  }, [value, previousValue])

  const changePercent = useCallback((): number => {
    if (previousValue === undefined || previousValue === 0) return 0
    return ((value - previousValue) / previousValue) * 100
  }, [value, previousValue])

  const changeValue = change()
  const changePercentValue = changePercent()
  const isPositive = changeValue > 0
  const isNegative = changeValue < 0
  const isNeutral = changeValue === 0

  // ==================================================================
  // COLOR CLASSES
  // ==================================================================

  const getColorClasses = () => {
    if (isNeutral) {
      return {
        text: 'text-neutral',
        bg: 'transparent',
      }
    }
    if (isPositive) {
      return {
        text: 'text-up-primary',
        bg: 'rgba(74, 222, 128, 0.15)',
      }
    }
    return {
      text: 'text-down-primary',
      bg: 'rgba(255, 107, 107, 0.15)',
    }
  }

  const colorClasses = getColorClasses()

  // ==================================================================
  // ARIA LABEL
  // ==================================================================

  const generateAriaLabel = useCallback((): string => {
    if (ariaLabel) return ariaLabel

    const parts = []

    if (prefix) parts.push(prefix)
    parts.push(value.toFixed(decimals))
    if (suffix) parts.push(suffix)

    if (showChange && previousValue !== undefined) {
      const direction = isPositive ? 'up' : isNegative ? 'down' : 'no change'
      parts.push(`${direction} ${Math.abs(changePercentValue).toFixed(decimals)} percent`)
    }

    return parts.join(' ')
  }, [ariaLabel, prefix, suffix, value, decimals, showChange, previousValue, isPositive, isNegative, changePercentValue])

  // ==================================================================
  // RENDER
  // ==================================================================

  return (
    <div className={cn('inline-flex items-baseline gap-2', className)}>
      {/* Main price value with flash animation */}
      <motion.span
        className={cn(
          'inline-flex items-center font-mono font-semibold tabular-nums',
          sizeClasses[size],
          colorClasses.text
        )}
        animate={{
          backgroundColor:
            flashDirection === 'up'
              ? ['transparent', 'rgba(74, 222, 128, 0.15)', 'transparent']
              : flashDirection === 'down'
                ? ['transparent', 'rgba(255, 107, 107, 0.15)', 'transparent']
                : 'transparent',
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ borderRadius: '4px', padding: '2px 4px' }}
        aria-label={generateAriaLabel()}
        role="status"
      >
        {prefix}
        {displayValue.toFixed(decimals)}
        {suffix}
      </motion.span>

      {/* Change indicator with percentage and icon */}
      {showChange && previousValue !== undefined && !isNeutral && (
        <motion.span
          className={cn(
            'inline-flex items-center gap-1 font-medium tabular-nums',
            changeSizeClasses[size],
            isPositive ? 'text-up-primary' : 'text-down-primary'
          )}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {showIcon && (isPositive ? <TrendingUp className={iconSizeClasses[size]} /> : <TrendingDown className={iconSizeClasses[size]} />)}
          {isPositive ? '+' : ''}
          {changePercentValue.toFixed(decimals)}%
        </motion.span>
      )}
    </div>
  )
}

/**
 * Default export for convenience
 */
export default AnimatedPrice
