/**
 * GlassCard Component
 *
 * A glassmorphism card component with blur effect and smooth animations.
 * Features:
 * - Semi-transparent background with backdrop-blur
 * - Subtle border with opacity
 * - Multi-layered shadow for depth
 * - Hover elevation effect
 * - Smooth spring animations
 * - Multiple variants (default, elevated, floating)
 * - Multiple padding sizes (sm, md, lg)
 * - Click support with focus styles
 * - Fade-in animation on mount
 * - Keyboard navigation support
 *
 * Based on: docs/design_rules.md
 * @example
 * ```tsx
 * <GlassCard variant="elevated" padding="md" interactive>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </GlassCard>
 * ```
 */

'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Variant types for GlassCard
 */
export type GlassCardVariant = 'default' | 'elevated' | 'floating'

/**
 * Padding size types for GlassCard
 */
export type GlassCardPadding = 'sm' | 'md' | 'lg'

/**
 * Props interface for GlassCard component
 */
export interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  /** Card content */
  children: React.ReactNode
  /** Visual variant */
  variant?: GlassCardVariant
  /** Padding size */
  padding?: GlassCardPadding
  /** Additional CSS classes */
  className?: string
  /** Click handler */
  onClick?: () => void
  /** Enable hover/click effects */
  interactive?: boolean
  /** ARIA label for accessibility */
  ariaLabel?: string
  /** Test ID for testing */
  testId?: string
}

/**
 * Variant class configurations
 */
const getVariantClasses = (variant: GlassCardVariant): string => {
  const variants = {
    // Default: Standard glass effect with medium blur
    default: cn(
      'bg-surface/70',
      'backdrop-blur-md',
      'border border-white/8',
      'shadow-soft'
    ),

    // Elevated: Higher opacity, stronger blur, more prominent border
    elevated: cn(
      'bg-surface/80',
      'backdrop-blur-lg',
      'border border-white/10',
      'shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
    ),

    // Floating: Lower opacity, maximum blur, subtle border
    floating: cn(
      'bg-surface/60',
      'backdrop-blur-xl',
      'border border-white/12',
      'shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
    ),
  }

  return variants[variant] || variants.default
}

/**
 * Responsive padding classes
 * Mobile (default) / Desktop (md:)
 */
const getPaddingClasses = (padding: GlassCardPadding): string => {
  const paddings = {
    sm: 'p-4 md:p-5',      // 16px mobile, 20px desktop
    md: 'p-5 md:p-6',      // 20px mobile, 24px desktop
    lg: 'p-6 md:p-8',      // 24px mobile, 32px desktop
  }

  return paddings[padding] || paddings.md
}

/**
 * Interactive state classes
 * Applied when card is clickable or interactive
 */
const getInteractiveClasses = (interactive: boolean, hasOnClick: boolean): string => {
  if (!interactive && !hasOnClick) return ''

  return cn(
    // Cursor and transition
    'cursor-pointer',
    'transition-all',
    'duration-300',
    'ease-out',
    // Hover effects
    'hover:shadow-[0_24px_48px_rgba(0,0,0,0.5)]',
    'hover:-translate-y-1',
    // Active/tactile feedback
    'active:scale-[0.99]',
    // Focus styles for keyboard navigation
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-accent-blue/50',
    'focus:ring-offset-2',
    'focus:ring-offset-bg-primary'
  )
}

/**
 * GlassCard - Glassmorphism card component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <GlassCard>
 *   <p>Content here</p>
 * </GlassCard>
 *
 * // Interactive card with click handler
 * <GlassCard
 *   variant="elevated"
 *   padding="lg"
 *   interactive
 *   onClick={() => console.log('clicked')}
 * >
 *   <h3>Clickable Card</h3>
 * </GlassCard>
 *
 * // Floating variant
 * <GlassCard variant="floating" padding="md">
 *   <p>Floating glass card</p>
 * </GlassCard>
 * ```
 */
export function GlassCard({
  children,
  variant = 'default',
  padding = 'md',
  className,
  onClick,
  interactive = false,
  ariaLabel,
  testId,
  ...motionProps
}: GlassCardProps) {
  // Combine all classes
  const cardClasses = cn(
    // Base rounded corners
    'rounded-xl',
    // Variant styles
    getVariantClasses(variant),
    // Padding
    getPaddingClasses(padding),
    // Interactive states
    getInteractiveClasses(interactive, !!onClick),
    // Custom classes
    className
  )

  // Determine if card should behave as a button
  const isClickable = interactive || !!onClick

  return (
    <motion.div
      className={cardClasses}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={isClickable ? { scale: 1.01 } : {}}
      whileTap={isClickable ? { scale: 0.99 } : {}}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel}
      data-testid={testId}
      onKeyDown={(e) => {
        // Keyboard navigation support
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.()
        }
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

/**
 * Default export for convenience
 */
export default GlassCard
