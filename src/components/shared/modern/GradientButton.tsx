/**
 * GradientButton Component
 *
 * A modern gradient button component with shimmer hover effect and smooth animations.
 * Features:
 * - Gradient backgrounds (multiple color schemes)
 * - Shimmer animation on hover (sweeping light effect)
 * - Colored glow shadow on hover
 * - Multiple variants (primary, success, outline, ghost)
 * - Multiple sizes (sm, md, lg)
 * - Loading state with spinner
 * - Icon support (left and right)
 * - Full width option
 * - Focus ring for keyboard navigation
 * - Smooth Framer Motion animations
 * - Accessibility support (ARIA, keyboard nav)
 *
 * Based on: docs/design_rules.md
 * @example
 * ```tsx
 * <GradientButton variant="primary" size="md" shimmer>
 *   Click Me
 * </GradientButton>
 * ```
 */

'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

/**
 * Variant types for GradientButton
 */
export type GradientButtonVariant = 'primary' | 'success' | 'outline' | 'ghost'

/**
 * Size types for GradientButton
 */
export type GradientButtonSize = 'sm' | 'md' | 'lg'

/**
 * Props interface for GradientButton component
 */
export interface GradientButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  /** Button content */
  children: React.ReactNode
  /** Visual variant */
  variant?: GradientButtonVariant
  /** Button size */
  size?: GradientButtonSize
  /** Show loading state with spinner */
  loading?: boolean
  /** Enable shimmer effect on hover */
  shimmer?: boolean
  /** Icon to display on the left */
  leftIcon?: React.ReactNode
  /** Icon to display on the right */
  rightIcon?: React.ReactNode
  /** Stretch button to full width */
  fullWidth?: boolean
  /** Additional CSS classes */
  className?: string
  /** Test ID for testing */
  testId?: string
}

/**
 * Variant class configurations
 */
const getVariantClasses = (variant: GradientButtonVariant): string => {
  const variants = {
    // Primary: Blue to purple gradient with glow
    primary: cn(
      'bg-gradient-to-r from-accent-blue to-accent-purple',
      'text-white',
      'shadow-lg shadow-accent-blue/25',
      'hover:shadow-xl hover:shadow-accent-blue/40'
    ),

    // Success: Green gradient with glow
    success: cn(
      'bg-gradient-to-r from-up-primary to-emerald-600',
      'text-white',
      'shadow-lg shadow-up-primary/25',
      'hover:shadow-xl hover:shadow-up-primary/40'
    ),

    // Outline: Transparent with border
    outline: cn(
      'bg-transparent',
      'border border-border-subtle',
      'text-text-primary',
      'hover:bg-surface-2',
      'hover:border-border-default'
    ),

    // Ghost: Minimal transparent button
    ghost: cn(
      'bg-transparent',
      'text-text-secondary',
      'hover:bg-surface-2',
      'hover:text-text-primary'
    ),
  }

  return variants[variant] || variants.primary
}

/**
 * Size class configurations
 */
const getSizeClasses = (size: GradientButtonSize): string => {
  const sizes = {
    sm: 'h-9 px-3 text-sm',     // 36px height
    md: 'h-11 px-5 text-base',   // 44px height
    lg: 'h-[52px] px-6 text-lg', // 52px height (h-13 equivalent)
  }

  return sizes[size] || sizes.md
}

/**
 * Icon size based on button size
 */
const getIconSize = (size: GradientButtonSize): string => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return iconSizes[size] || iconSizes.md
}

/**
 * GradientButton - Modern gradient button with shimmer effect
 *
 * @example
 * ```tsx
 * // Basic usage
 * <GradientButton>
 *   Click Me
 * </GradientButton>
 *
 * // With shimmer effect and loading state
 * <GradientButton variant="primary" size="lg" shimmer loading>
 *   Submit
 * </GradientButton>
 *
 * // With icons
 * <GradientButton
 *   variant="success"
 *   leftIcon={<CheckIcon />}
 *   rightIcon={<ArrowRightIcon />}
 * >
 *   Confirm Action
 * </GradientButton>
 *
 * // Full width ghost button
 * <GradientButton
 *   variant="ghost"
 *   fullWidth
 *   onClick={() => console.log('clicked')}
 * >
 *   Cancel
 * </GradientButton>
 * ```
 */
export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      shimmer = true,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      testId,
      disabled,
      ...motionProps
    },
    ref
  ) => {
    // Combine all classes
    const buttonClasses = cn(
      // Base styles
      'relative inline-flex items-center justify-center gap-2',
      'rounded-xl font-semibold',
      'transition-all duration-200',
      // Focus styles for keyboard navigation
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-accent-blue/50',
      'focus:ring-offset-2',
      'focus:ring-offset-bg-primary',
      // Disabled state
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      // Active/tactile feedback
      'active:scale-[0.97]',
      // Width
      fullWidth && 'w-full',
      // Variant styles
      getVariantClasses(variant),
      // Size styles
      getSizeClasses(size),
      // Custom classes
      className
    )

    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        data-testid={testId}
        {...motionProps}
      >
        {/* Shimmer effect overlay */}
        {shimmer && !isDisabled && (
          <motion.span
            className="absolute inset-0 rounded-xl"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
            }}
          />
        )}

        {/* Left icon */}
        {leftIcon && !loading && (
          <span className={cn('flex-shrink-0', getIconSize(size))}>{leftIcon}</span>
        )}

        {/* Loading spinner */}
        {loading && <Loader2 className={cn('animate-spin', getIconSize(size))} />}

        {/* Button content */}
        <span className="relative z-10">{children}</span>

        {/* Right icon */}
        {rightIcon && !loading && (
          <span className={cn('flex-shrink-0', getIconSize(size))}>{rightIcon}</span>
        )}
      </motion.button>
    )
  }
)

GradientButton.displayName = 'GradientButton'

/**
 * Default export for convenience
 */
export default GradientButton
