/**
 * AnimatedPrice Component (Memory-Optimized)
 *
 * A price display component with flash effect on value changes.
 * Features:
 * - Flash animation when value changes (green for up, red for down)
 * - CSS-based transitions (no RAF, minimal memory)
 * - Color-coded based on change direction
 * - Tabular numbers for alignment
 * - Change indicator with percentage and trend icon
 * - Multiple sizes (sm, md, lg, xl)
 *
 * Based on: docs/design_rules.md
 */

'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useCallback, useRef } from 'react'

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
 * AnimatedPrice - Flash animation on price changes (CSS-based, minimal memory)
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

  const [flashDirection, setFlashDirection] = useState<'up' | 'down' | null>(null)
  const [showChangeIndicator, setShowChangeIndicator] = useState(false)
  const valueRef = useRef(value)
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ==================================================================
  // FLASH ANIMATION (CSS-based)
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

    // Show change indicator with slide-in animation
    setShowChangeIndicator(true)

    // Clear flash after animation completes (600ms matches CSS duration)
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current)
    }
    flashTimeoutRef.current = setTimeout(() => {
      setFlashDirection(null)
    }, 600)

    // Update ref
    valueRef.current = value

    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current)
      }
    }
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
  // CSS ANIMATION CLASSES
  // ==================================================================

  const getFlashClass = () => {
    if (flashDirection === 'up') return 'animate-price-up'
    if (flashDirection === 'down') return 'animate-price-down'
    return ''
  }

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
      {/* Main price value with CSS flash animation */}
      <span
        className={cn(
          'inline-flex items-center font-mono font-semibold tabular-nums',
          'transition-all duration-300 ease-out',
          sizeClasses[size],
          colorClasses.text,
          getFlashClass()
        )}
        style={{
          borderRadius: '4px',
          padding: '2px 4px',
        }}
        aria-label={generateAriaLabel()}
        role="status"
      >
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </span>

      {/* Change indicator with CSS slide-in animation */}
      {showChange && previousValue !== undefined && !isNeutral && showChangeIndicator && (
        <span
          className={cn(
            'inline-flex items-center gap-1 font-medium tabular-nums',
            'fade-in',
            changeSizeClasses[size],
            isPositive ? 'text-up-primary' : 'text-down-primary'
          )}
        >
          {showIcon && (isPositive ? <TrendingUp className={iconSizeClasses[size]} /> : <TrendingDown className={iconSizeClasses[size]} />)}
          {isPositive ? '+' : ''}
          {changePercentValue.toFixed(decimals)}%
        </span>
      )}
    </div>
  )
}

/**
 * Default export for convenience
 */
export default AnimatedPrice
