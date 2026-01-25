/**
 * Card Component Types
 * fonPick - Thai Stock Market Application
 *
 * Type definitions for the enhanced Card component system.
 * Based on: docs/design_rules.md
 */

import type { ReactNode } from 'react'

// ==================================================================
// CARD VARIANTS
// ==================================================================

/**
 * Available card visual variants
 * - default: Standard card with subtle border and background
 * - outlined: Transparent background with border only
 * - elevated: Raised appearance with shadow
 * - flat: No border, background only
 * - compact: Smaller padding for dense layouts
 * - glass: Glass-morphism effect with backdrop blur
 */
export type CardVariant =
  | 'default'
  | 'outlined'
  | 'elevated'
  | 'flat'
  | 'compact'
  | 'glass'

// ==================================================================
// PADDING SIZES
// ==================================================================

/**
 * Responsive padding sizes
 * Mobile uses smaller padding (16px), desktop uses larger (24px)
 */
export type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// ==================================================================
// BORDER OPTIONS
// ==================================================================

/**
 * Border strength options
 * - none: No border
 * - subtle: Very light border (lowest contrast)
 * - default: Standard border
 * - strong: High contrast border
 */
export type CardBorder = 'none' | 'subtle' | 'default' | 'strong'

// ==================================================================
// MAIN CARD PROPS
// ==================================================================

/**
 * Enhanced Card component props
 */
export interface CardProps {
  /** Card content */
  children: ReactNode

  /** Visual variant of the card */
  variant?: CardVariant

  /** Padding size (responsive: mobile 16px, desktop 24px for md) */
  padding?: CardPadding

  /** Border strength */
  border?: CardBorder

  /** Enable hover interaction effects */
  interactive?: boolean

  /** Show loading skeleton state */
  loading?: boolean

  /** Optional CSS classes */
  className?: string

  /** Click handler (enables interactive mode) */
  onClick?: () => void

  /** Test ID for testing */
  testId?: string

  /** Aria label for accessibility */
  ariaLabel?: string
}

// ==================================================================
// CARD SUB-COMPONENT PROPS
// ==================================================================

export interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export interface CardTitleProps {
  children: ReactNode
  className?: string
}

export interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export interface CardContentProps {
  children: ReactNode
  className?: string
}

export interface CardFooterProps {
  children: ReactNode
  className?: string
}
