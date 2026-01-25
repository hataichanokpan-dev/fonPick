/**
 * Enhanced Card Component
 * fonPick - Thai Stock Market Application
 *
 * A professional, minimal card container with multiple variants.
 * Features:
 * - 6 visual variants (default, outlined, elevated, flat, compact, glass)
 * - Responsive padding (16px mobile, 24px desktop)
 * - Smooth hover transitions (200ms)
 * - Loading skeleton support
 * - Glass-morphism effect with backdrop-blur
 * - Interactive states with tactile feedback
 *
 * Based on: docs/design_rules.md
 */

'use client'

import { cn } from '@/lib/utils'
import { CardSkeleton } from './LoadingSkeleton'
import type {
  CardProps,
  CardVariant,
  CardPadding,
  CardBorder,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from './Card.types'

export function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
  border = 'default',
  interactive = false,
  loading = false,
  onClick,
  testId,
  ariaLabel,
}: CardProps) {
  // ==================================================================
  // VARIANT STYLES
  // ==================================================================

  const getVariantClasses = (variant: CardVariant): string => {
    const variants = {
      // Default: Standard card with subtle border and background
      default: cn(
        'bg-surface',
        'border border-border-subtle',
        'rounded-lg'
      ),

      // Outlined: Transparent background with border only
      outlined: cn(
        'bg-transparent',
        'border border-border-subtle',
        'rounded-lg'
      ),

      // Elevated: Raised appearance with shadow
      elevated: cn(
        'bg-surface-2',
        'border border-border-default',
        'rounded-lg',
        'shadow-soft'
      ),

      // Flat: No border, background only
      flat: cn(
        'bg-surface',
        'rounded-lg',
        'border-0'
      ),

      // Compact: Smaller padding, same as default visually
      compact: cn(
        'bg-surface',
        'border border-border-subtle',
        'rounded-lg'
      ),

      // Glass: Glass-morphism effect with backdrop blur
      glass: cn(
        'bg-surface/80',
        'backdrop-blur-card',
        'border border-border-subtle/50',
        'shadow-soft',
        'rounded-lg'
      ),
    }

    return variants[variant] || variants.default
  }

  // ==================================================================
  // BORDER STYLES
  // ==================================================================

  const getBorderClasses = (border: CardBorder): string => {
    const borders = {
      none: 'border-0',
      subtle: 'border border-border-subtle',
      default: 'border border-border-default',
      strong: 'border-2 border-border-strong',
    }

    return borders[border] || borders.default
  }

  // ==================================================================
  // RESPONSIVE PADDING
  // Mobile: 16px (p-4), Desktop: 24px (p-6) for 'md' size
  // ==================================================================

  const getPaddingClasses = (padding: CardPadding): string => {
    const paddings = {
      none: 'p-0',
      xs: 'p-2',           // 8px - ultra compact
      sm: 'p-3',           // 12px - compact
      md: 'p-4 md:p-6',    // 16px mobile, 24px desktop - standard
      lg: 'p-6 md:p-8',    // 24px mobile, 32px desktop - spacious
      xl: 'p-8 md:p-10',   // 32px mobile, 40px desktop - extra spacious
    }

    return paddings[padding] || paddings.md
  }

  // ==================================================================
  // INTERACTIVE STATES
  // Smooth hover transitions (200ms), no layout shift
  // ==================================================================

  const getInteractiveClasses = (): string => {
    if (!interactive && !onClick) return ''

    return cn(
      // Cursor and base transition
      'cursor-pointer',
      'transition-all duration-200',
      'ease-out',
      // Hover states - no translate to prevent layout shift
      'hover:bg-surface-2',
      'hover:shadow-md',
      'hover:border-border-default',
      // Active/tactile feedback
      'active:scale-[0.98]',
      'active:shadow-sm',
      // Focus for accessibility
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-accent-blue/30',
      'focus:border-accent-blue'
    )
  }

  // ==================================================================
  // COMBINED CLASSES
  // ==================================================================

  const cardClasses = cn(
    // Base styles
    getVariantClasses(variant),
    // Override border if explicitly set
    border !== 'default' && getBorderClasses(border),
    // Padding
    getPaddingClasses(padding),
    // Interactive states
    getInteractiveClasses(),
    // Custom classes
    className
  )

  // ==================================================================
  // RENDER
  // ==================================================================

  if (loading) {
    return (
      <div className={cardClasses} data-testid={testId}>
        <CardSkeleton lines={3} header={true} footer={false} />
      </div>
    )
  }

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      data-testid={testId}
      aria-label={ariaLabel}
      role={interactive || onClick ? 'button' : undefined}
      tabIndex={interactive || onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if ((interactive || onClick) && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      {children}
    </div>
  )
}

/**
 * Card.Header - Header section with optional styling
 */
export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

/**
 * Card.Title - Title with proper hierarchy
 */
export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn(
      'text-lg font-semibold text-text-primary',
      'leading-tight',
      className
    )}>
      {children}
    </h3>
  )
}

/**
 * Card.Description - Subtitle/description text
 */
export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn(
      'text-sm text-text-secondary',
      'mt-1',
      className
    )}>
      {children}
    </p>
  )
}

/**
 * Card.Content - Main content area
 */
export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('flex-1', className)}>
      {children}
    </div>
  )
}

/**
 * Card.Footer - Footer section
 */
export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn(
      'mt-4 pt-4',
      'border-t border-border-subtle',
      className
    )}>
      {children}
    </div>
  )
}
