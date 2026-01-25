/**
 * PageContainer Component
 * fonPick - Thai Stock Market Application
 *
 * Main page wrapper with responsive max-width and padding.
 * Handles safe area insets for mobile devices with notches.
 *
 * Based on: docs/design_rules.md
 * Phase 2: Enhanced Layout Component Structure
 */

'use client'

import { type ReactNode, useMemo } from 'react'
import { cn } from '@/lib/utils'

// ==================================================================
// TYPES
// ==================================================================

/**
 * Max width options for content container
 */
export type MaxWidth = 'mobile' | 'tablet' | 'desktop' | 'desktopWide'

/**
 * Padding options for horizontal spacing
 */
export type PaddingSize = 'none' | 'sm' | 'md' | 'lg'

/**
 * Page container props
 */
export interface PageContainerProps {
  /** Child content */
  children: ReactNode
  /** Max width for content */
  maxWidth?: MaxWidth
  /** Horizontal padding */
  padding?: PaddingSize
  /** Add safe area insets for mobile (notch support) */
  safeArea?: boolean
  /** Vertical padding */
  verticalPadding?: PaddingSize
  /** Additional CSS classes */
  className?: string
  /** HTML tag to render */
  as?: 'div' | 'main' | 'section' | 'article'
}

// ==================================================================
// PROP MAPPINGS
// ==================================================================

/**
 * Max width classes matching Tailwind config
 */
const maxWidthClasses: Record<MaxWidth, string> = {
  mobile: 'max-w-mobile',
  tablet: 'max-w-tablet',
  desktop: 'max-w-desktop',
  desktopWide: 'max-w-desktop-wide',
}

/**
 * Horizontal padding classes (base values)
 */
const horizontalPaddingClasses: Record<PaddingSize, string> = {
  none: '',
  sm: 'px-4',   // 16px - mobile-safe
  md: 'px-6',   // 24px - standard
  lg: 'px-8',   // 32px - spacious
}

/**
 * Vertical padding classes (base values)
 */
const verticalPaddingClasses: Record<PaddingSize, string> = {
  none: '',
  sm: 'py-4',   // 16px
  md: 'py-6',   // 24px
  lg: 'py-8',   // 32px
}

/**
 * Safe area utility classes from globals.css
 */
const SAFE_TOP = 'safe-top'
const SAFE_BOTTOM = 'safe-bottom'

// ==================================================================
// COMPONENT
// ==================================================================

/**
 * PageContainer - Main page wrapper with responsive max-width and padding
 *
 * Handles safe area insets for mobile devices with notches (iPhone X+).
 * Centers content and applies consistent horizontal padding.
 *
 * @example
 * ```tsx
 * <PageContainer maxWidth="desktop" padding="md">
 *   <h1>Page Title</h1>
 *   <p>Content goes here</p>
 * </PageContainer>
 * ```
 *
 * @example With safe area disabled
 * ```tsx
 * <PageContainer safeArea={false} padding="none">
 *   <ResponsiveGrid>...</ResponsiveGrid>
 * </PageContainer>
 * ```
 *
 * @example As main content area
 * ```tsx
 * <PageContainer as="main" verticalPadding="lg">
 *   {children}
 * </PageContainer>
 * ```
 */
export function PageContainer({
  children,
  maxWidth = 'desktopWide',
  padding = 'md',
  safeArea = true,
  verticalPadding = 'none',
  className,
  as: Component = 'div',
}: PageContainerProps) {
  // Build className string with memoization for performance
  const containerClassName = useMemo(() => {
    return cn(
      // Max width constraint
      maxWidthClasses[maxWidth],
      // Center horizontally
      'mx-auto',
      // Horizontal padding
      horizontalPaddingClasses[padding],
      // Vertical padding (optional)
      verticalPaddingClasses[verticalPadding],
      // Safe area insets for mobile notch support (from globals.css)
      safeArea && cn(SAFE_TOP, SAFE_BOTTOM),
      // Custom classes
      className
    )
  }, [maxWidth, padding, safeArea, verticalPadding, className])

  return <Component className={containerClassName}>{children}</Component>
}

// ==================================================================
// CONVENIENT VARIANTS
// ==================================================================

/**
 * PageContainer.FullBleed - Variant with no padding for full-width content
 * Useful for hero sections or background containers
 */
PageContainer.FullBleed = function PageContainerFullBleed({
  children,
  className,
  ...props
}: Omit<PageContainerProps, 'padding'>) {
  return (
    <PageContainer padding="none" safeArea={false} className={className} {...props}>
      {children}
    </PageContainer>
  )
}

/**
 * PageContainer.Compact - Variant with smaller padding for dense layouts
 */
PageContainer.Compact = function PageContainerCompact({
  children,
  className,
  ...props
}: Omit<PageContainerProps, 'padding'>) {
  return (
    <PageContainer padding="sm" className={className} {...props}>
      {children}
    </PageContainer>
  )
}

/**
 * PageContainer.Mobile - Variant optimized for mobile screens
 */
PageContainer.Mobile = function PageContainerMobile({
  children,
  className,
  ...props
}: Omit<PageContainerProps, 'maxWidth' | 'padding'>) {
  return (
    <PageContainer maxWidth="mobile" padding="sm" className={className} {...props}>
      {children}
    </PageContainer>
  )
}
