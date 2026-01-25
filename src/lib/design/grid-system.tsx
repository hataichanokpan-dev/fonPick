/**
 * Grid System Components
 * fonPick - Thai Stock Market Application
 *
 * Responsive grid utilities and components matching concept images:
 * - Mobile: single column
 * - Desktop: two columns
 * - Configurable gaps and padding
 *
 * Based on: docs/design_rules.md
 */

'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ==================================================================
// TYPES
// ==================================================================

/**
 * Grid layout variant options
 */
export type GridVariant = 'mobile' | 'desktop' | 'auto'

/**
 * Column span options for grid items
 */
export type ColumnSpan = 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'full'

/**
 * Grid component props
 */
export interface GridProps {
  /** Child grid items */
  children: ReactNode
  /** Layout variant */
  variant?: GridVariant
  /** Number of columns on desktop (1-12) */
  desktopColumns?: 1 | 2 | 3 | 4 | 6 | 12
  /** Number of columns on tablet (1-12) */
  tabletColumns?: 1 | 2 | 3 | 4 | 6 | 12
  /** Number of columns on mobile (always 1 for this design) */
  mobileColumns?: 1
  /** Grid gap size */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Additional CSS classes */
  className?: string
  /** Enable equal height rows */
  equalHeight?: boolean
}

/**
 * Grid item (cell) props
 */
export interface GridItemProps {
  /** Child content */
  children: ReactNode
  /** Column span on mobile */
  span?: ColumnSpan
  /** Column span on tablet */
  spanTablet?: ColumnSpan
  /** Column span on desktop */
  spanDesktop?: ColumnSpan
  /** Column start position (for advanced layouts) */
  colStart?: number | 'auto'
  /** Column end position (for advanced layouts) */
  colEnd?: number | 'auto'
  /** Row span (for multi-row items) */
  rowSpan?: number
  /** Row start position */
  rowStart?: number | 'auto'
  /** Row end position */
  rowEnd?: number | 'auto'
  /** Additional CSS classes */
  className?: string
}

// ==================================================================
// GRID GAP MAPPING
// ==================================================================

/**
 * Responsive gap classes
 */
const responsiveGapClasses: Record<string, string> = {
  none: 'gap-0',
  xs: 'gap-1 md:gap-1 lg:gap-1',
  sm: 'gap-2 md:gap-2 lg:gap-2',
  md: 'gap-4 md:gap-4 lg:gap-6',    // 16px mobile, 24px desktop
  lg: 'gap-6 md:gap-6 lg:gap-6',    // 24px all
  xl: 'gap-8 md:gap-8 lg:gap-8',    // 32px all
}

// ==================================================================
// COLUMN SPAN MAPPING
// ==================================================================

/**
 * Get Tailwind column span classes
 */
function getColumnSpanClasses(span: ColumnSpan, breakpoint: '' | 'md:' | 'lg:' = ''): string {
  if (span === 'full') return `${breakpoint}col-span-full`
  return `${breakpoint}col-span-${span}`
}

/**
 * Get responsive column span classes
 */
function getResponsiveSpanClasses(
  span?: ColumnSpan,
  spanTablet?: ColumnSpan,
  spanDesktop?: ColumnSpan
): string {
  const classes: string[] = []

  // Mobile (base)
  if (span) {
    classes.push(getColumnSpanClasses(span))
  }

  // Tablet (md)
  if (spanTablet) {
    classes.push(getColumnSpanClasses(spanTablet, 'md:'))
  }

  // Desktop (lg)
  if (spanDesktop) {
    classes.push(getColumnSpanClasses(spanDesktop, 'lg:'))
  }

  return classes.join(' ')
}

// ==================================================================
// GRID COMPONENT
// ==================================================================

/**
 * Grid - Responsive grid layout component
 *
 * Example usage:
 * ```tsx
 * <Grid>
 *   <GridItem>Content 1</GridItem>
 *   <GridItem>Content 2</GridItem>
 * </Grid>
 * ```
 *
 * With custom columns:
 * ```tsx
 * <Grid desktopColumns={3} tabletColumns={2} gap="lg">
 *   <GridItem span={1} spanDesktop={2}>Wide item on desktop</GridItem>
 *   <GridItem>Normal item</GridItem>
 * </Grid>
 * ```
 */
export function Grid({
  children,
  variant = 'auto',
  desktopColumns = 2,
  tabletColumns = 2,
  mobileColumns = 1,
  gap = 'md',
  className,
  equalHeight = false,
}: GridProps) {
  // Determine column classes based on variant
  const getColumnClasses = (): string => {
    if (variant === 'mobile') {
      return 'grid-cols-1'
    }

    if (variant === 'desktop') {
      return 'grid-cols-1 md:grid-cols-2'
    }

    // Auto variant - use props
    return `grid-cols-${mobileColumns} md:grid-cols-${tabletColumns} lg:grid-cols-${desktopColumns}`
  }

  return (
    <div
      className={cn(
        // Base grid
        'grid',
        // Responsive columns
        getColumnClasses(),
        // Responsive gaps
        responsiveGapClasses[gap],
        // Equal height rows
        equalHeight && 'grid-rows-[auto]',
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  )
}

// ==================================================================
// GRID ITEM COMPONENT
// ==================================================================

/**
 * GridItem - Grid cell/component wrapper
 *
 * Example usage:
 * ```tsx
 * <GridItem span={2} spanDesktop={1}>
 *   <Card>Full width on mobile, half on desktop</Card>
 * </GridItem>
 * ```
 */
export function GridItem({
  children,
  span,
  spanTablet,
  spanDesktop,
  colStart,
  colEnd,
  rowSpan,
  rowStart,
  rowEnd,
  className,
}: GridItemProps) {
  // Build column span classes
  const spanClasses = getResponsiveSpanClasses(span, spanTablet, spanDesktop)

  // Build column position classes
  const colPositionClasses = cn(
    colStart && `col-start-${colStart}`,
    colEnd && `col-end-${colEnd}`
  )

  // Build row position classes
  const rowPositionClasses = cn(
    rowStart && `row-start-${rowStart}`,
    rowEnd && `row-end-${rowEnd}`,
    rowSpan && `row-span-${rowSpan}`
  )

  return (
    <div
      className={cn(
        // Column spans
        spanClasses,
        // Column positions
        colPositionClasses,
        // Row positions
        rowPositionClasses,
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  )
}

// ==================================================================
// GRID COLUMN UTILITIES
// ==================================================================

/**
 * Quick-access column span utilities
 * These can be used directly as className values
 */
export const gridCols = {
  full: 'col-span-full',
  half: 'col-span-1',
  third: 'col-span-1',
  quarter: 'col-span-1',
  // Responsive versions
  fullMobile: 'col-span-full md:col-span-1',
  halfDesktop: 'col-span-full lg:col-span-1',
} as const

/**
 * Quick-access grid template utilities
 */
export const gridTemplates = {
  // Standard 2-column layout (mobile → desktop)
  standard: 'grid-cols-1 lg:grid-cols-2',

  // 3-column layout
  threeColumn: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',

  // 4-column layout
  fourColumn: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',

  // Compact (modules)
  compact: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',

  // Bento grid style
  bento: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
} as const

// ==================================================================
// RESPONSIVE CONTAINER
// ==================================================================

/**
 * Responsive container props
 */
export interface ResponsiveContainerProps {
  children: ReactNode
  /** Max width breakpoint */
  maxWidth?: 'mobile' | 'tablet' | 'desktop' | 'desktopWide' | 'none'
  /** Center content */
  center?: boolean
  /** Horizontal padding */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

/**
 * ResponsiveContainer - Container with responsive max-width and padding
 *
 * Example usage:
 * ```tsx
 * <ResponsiveContainer maxWidth="desktop" padding="md">
 *   <Grid>...</Grid>
 * </ResponsiveContainer>
 * ```
 */
export function ResponsiveContainer({
  children,
  maxWidth = 'desktopWide',
  center = true,
  padding = 'md',
  className,
}: ResponsiveContainerProps) {
  const maxWidthClasses: Record<typeof maxWidth, string> = {
    mobile: 'max-w-[428px]',
    tablet: 'max-w-[768px]',
    desktop: 'max-w-[1024px]',
    desktopWide: 'max-w-[1280px]',
    none: '',
  }

  const paddingClasses: Record<typeof padding, string> = {
    none: '',
    sm: 'px-4',      // 16px
    md: 'px-6',      // 24px
    lg: 'px-8',      // 32px
  }

  return (
    <div
      className={cn(
        // Max width
        maxWidthClasses[maxWidth],
        // Center
        center && 'mx-auto',
        // Padding
        paddingClasses[padding],
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  )
}

// ==================================================================
// EXPORTS
// ==================================================================

export default Grid
