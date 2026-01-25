/**
 * ResponsiveGrid Component
 * fonPick - Thai Stock Market Application
 *
 * Pre-configured grid wrapper for fonPick layouts.
 * Provides convenient defaults and standard 2-column desktop layout.
 *
 * Based on: docs/design_rules.md
 * Phase 2: Enhanced Layout Component Structure
 */

'use client'

import { cn } from '@/lib/utils'
import {
  Grid,
  GridItem,
  type GridProps,
  type GridItemProps,
  type GridVariant,
  type ColumnSpan,
} from '@/lib/design/grid-system'

// ==================================================================
// RE-EXPORTS
// ==================================================================

// Export base Grid components for advanced usage
export { Grid, GridItem }
export type { GridProps, GridItemProps, GridVariant, ColumnSpan }

// ==================================================================
// TYPES
// ==================================================================

/**
 * Standard gap sizes for fonPick layouts
 */
export type FonPickGap = 'none' | 'compact' | 'standard' | 'spacious'

/**
 * Preset layout configurations
 * Phase 2: Added 'asymmetric' preset
 */
export type LayoutPreset =
  | 'default'      // 2-column desktop, 1-column mobile
  | 'triple'       // 3-column desktop
  | 'quad'         // 4-column desktop
  | 'bento'        // Bento-style grid
  | 'modules'      // Module grid layout
  | 'asymmetric'   // Phase 2: 3-column asymmetric (40% | 35% | 25%)

/**
 * ResponsiveGrid component props type
 */
export type ResponsiveGridProps = Omit<GridProps, 'gap'> & {
  /** Gap size using fonPick spacing tokens */
  gap?: FonPickGap
  /** Pre-configured layout preset */
  preset?: LayoutPreset
}

/**
 * Grid item column span sizes for asymmetric layout
 * Phase 2: Added support for custom column spans
 */
export type AsymmetricSpan = 'narrow' | 'medium' | 'wide' | 'full'

// ==================================================================
// PROP MAPPINGS
// ==================================================================

/**
 * Gap size classes matching design system spacing
 */
const gapSizeClasses: Record<FonPickGap, string> = {
  none: 'gap-0',
  compact: 'gap-2 md:gap-3 lg:gap-4',      // 8px mobile, 12px tablet, 16px desktop
  standard: 'gap-4 md:gap-4 lg:gap-6',     // 16px mobile, 24px desktop (default)
  spacious: 'gap-6 md:gap-6 lg:gap-8',     // 24px mobile, 32px desktop
}

/**
 * Preset layout configurations
 * Phase 2: Added asymmetric preset
 */
const layoutPresets: Record<LayoutPreset, Pick<GridProps, 'desktopColumns' | 'tabletColumns' | 'mobileColumns'>> = {
  default: {
    desktopColumns: 2,
    tabletColumns: 2,
    mobileColumns: 1,
  },
  triple: {
    desktopColumns: 3,
    tabletColumns: 2,
    mobileColumns: 1,
  },
  quad: {
    desktopColumns: 4,
    tabletColumns: 2,
    mobileColumns: 1,
  },
  bento: {
    desktopColumns: 4,
    tabletColumns: 2,
    mobileColumns: 1,
  },
  modules: {
    desktopColumns: 3,
    tabletColumns: 2,
    mobileColumns: 1,
  },
  // Phase 2: Asymmetric preset with 12-column grid for custom spans
  asymmetric: {
    desktopColumns: 12,
    tabletColumns: 2,
    mobileColumns: 1,
  },
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

/**
 * ResponsiveGrid - Pre-configured grid for fonPick layouts
 *
 * Uses the standard 2-column desktop, 1-column mobile layout
 * with appropriate spacing gaps matching the design system.
 *
 * @example Default usage
 * ```tsx
 * <ResponsiveGrid>
 *   <GridItem><Card>Content 1</Card></GridItem>
 *   <GridItem><Card>Content 2</Card></GridItem>
 * </ResponsiveGrid>
 * ```
 *
 * @example With custom gap
 * ```tsx
 * <ResponsiveGrid gap="spacious">
 *   {children}
 * </ResponsiveGrid>
 * ```
 *
 * @example Using preset
 * ```tsx
 * <ResponsiveGrid preset="triple">
 *   {children}
 * </ResponsiveGrid>
 * ```
 *
 * @example Phase 2: Asymmetric layout
 * ```tsx
 * <ResponsiveGrid preset="asymmetric">
 *   <ResponsiveGrid.AsymmetricWide>
 *     <Card>Wide content (40%)</Card>
 *   </ResponsiveGrid.AsymmetricWide>
 *   <ResponsiveGrid.AsymmetricMedium>
 *     <Card>Medium content (35%)</Card>
 *   </ResponsiveGrid.AsymmetricMedium>
 *   <ResponsiveGrid.AsymmetricNarrow>
 *     <Card>Narrow content (25%)</Card>
 *   </ResponsiveGrid.AsymmetricNarrow>
 * </ResponsiveGrid>
 * ```
 *
 * @example Full width item
 * ```tsx
 * <ResponsiveGrid>
 *   <ResponsiveGrid.FullWidth>
 *     <Banner />
 *   </ResponsiveGrid.FullWidth>
 *   <ResponsiveGrid.Item>
 *     <Card />
 *   </ResponsiveGrid.Item>
 * </ResponsiveGrid>
 * ```
 */
export function ResponsiveGrid({
  children,
  gap = 'standard',
  preset = 'default',
  className,
  ...props
}: Omit<GridProps, 'gap'> & {
  /** Gap size using fonPick spacing tokens */
  gap?: FonPickGap
  /** Pre-configured layout preset */
  preset?: LayoutPreset
}) {
  const presetConfig = layoutPresets[preset]

  return (
    <Grid
      variant="auto"
      desktopColumns={presetConfig.desktopColumns}
      tabletColumns={presetConfig.tabletColumns}
      mobileColumns={presetConfig.mobileColumns}
      gap="md" // Use internal Grid gap prop, override with custom classes
      className={cn(
        // Override default Grid gap with fonPick spacing
        gapSizeClasses[gap],
        // Phase 2: Add custom class for asymmetric layout
        preset === 'asymmetric' && 'grid-rows-auto',
        // Custom classes
        className
      )}
      {...props}
    >
      {children}
    </Grid>
  )
}

// ==================================================================
// CONVENIENT SUB-COMPONENTS
// ==================================================================

/**
 * ResponsiveGrid.Item - Standard grid item wrapper
 * Provides convenient span props for common layouts
 */
export interface ResponsiveGridItemProps extends Omit<GridItemProps, 'span' | 'spanDesktop' | 'spanTablet'> {
  /** Responsive span: 'full' = full width, 'half' = half width on desktop */
  spanResponsive?: 'full' | 'half' | 'third' | 'quarter'
}

ResponsiveGrid.Item = function ResponsiveGridItem({
  spanResponsive,
  className,
  ...props
}: ResponsiveGridItemProps) {
  // Convert spanResponsive to actual column spans
  const spanMap = {
    full: { span: 1, spanTablet: 1, spanDesktop: 'full' as ColumnSpan },
    half: { span: 1, spanTablet: 1, spanDesktop: 1 },
    third: { span: 1, spanTablet: 1, spanDesktop: 1 },
    quarter: { span: 1, spanTablet: 1, spanDesktop: 1 },
  }

  const spans = spanResponsive ? spanMap[spanResponsive] : {}

  return (
    <GridItem
      className={className}
      {...spans}
      {...props}
    />
  )
}

/**
 * ResponsiveGrid.FullWidth - Grid item that spans full width on all breakpoints
 */
ResponsiveGrid.FullWidth = function ResponsiveGridFullWidth({
  children,
  className,
  ...props
}: Omit<GridItemProps, 'span' | 'spanTablet' | 'spanDesktop'>) {
  return (
    <GridItem
      span={1}
      spanTablet={1}
      spanDesktop={'full'}
      className={className}
      {...props}
    >
      {children}
    </GridItem>
  )
}

/**
 * ResponsiveGrid.Half - Grid item that spans half width on desktop
 */
ResponsiveGrid.Half = function ResponsiveGridHalf({
  children,
  className,
  ...props
}: Omit<GridItemProps, 'span' | 'spanTablet' | 'spanDesktop'>) {
  return (
    <GridItem
      span={1}
      spanTablet={1}
      spanDesktop={1}
      className={className}
      {...props}
    >
      {children}
    </GridItem>
  )
}

// ==================================================================
// PHASE 2: ASYMMETRIC LAYOUT HELPERS
// ==================================================================

/**
 * ResponsiveGrid.AsymmetricWide - Grid item that spans 5 columns (42%) in asymmetric layout
 * Use with preset="asymmetric" for the wide column
 */
ResponsiveGrid.AsymmetricWide = function ResponsiveGridAsymmetricWide({
  children,
  className,
  ...props
}: Omit<GridItemProps, 'span' | 'spanTablet' | 'spanDesktop'>) {
  return (
    <GridItem
      span={1}
      spanTablet={1}
      spanDesktop={5}
      className={className}
      {...props}
    >
      {children}
    </GridItem>
  )
}

/**
 * ResponsiveGrid.AsymmetricMedium - Grid item that spans 4 columns (33%) in asymmetric layout
 * Use with preset="asymmetric" for the medium column
 */
ResponsiveGrid.AsymmetricMedium = function ResponsiveGridAsymmetricMedium({
  children,
  className,
  ...props
}: Omit<GridItemProps, 'span' | 'spanTablet' | 'spanDesktop'>) {
  return (
    <GridItem
      span={1}
      spanTablet={1}
      spanDesktop={4}
      className={className}
      {...props}
    >
      {children}
    </GridItem>
  )
}

/**
 * ResponsiveGrid.AsymmetricNarrow - Grid item that spans 3 columns (25%) in asymmetric layout
 * Use with preset="asymmetric" for the narrow column
 */
ResponsiveGrid.AsymmetricNarrow = function ResponsiveGridAsymmetricNarrow({
  children,
  className,
  ...props
}: Omit<GridItemProps, 'span' | 'spanTablet' | 'spanDesktop'>) {
  return (
    <GridItem
      span={1}
      spanTablet={1}
      spanDesktop={3}
      className={className}
      {...props}
    >
      {children}
    </GridItem>
  )
}

// ==================================================================
// LAYOUT PRESET HELPERS
// ==================================================================

/**
 * ResponsiveGrid.TripleColumn - 3-column layout preset
 */
ResponsiveGrid.TripleColumn = function ResponsiveGridTripleColumn(props: ResponsiveGridProps) {
  return <ResponsiveGrid preset="triple" {...props} />
}

/**
 * ResponsiveGrid.QuadColumn - 4-column layout preset
 */
ResponsiveGrid.QuadColumn = function ResponsiveGridQuadColumn(props: ResponsiveGridProps) {
  return <ResponsiveGrid preset="quad" {...props} />
}

/**
 * ResponsiveGrid.Bento - Bento-style grid preset
 */
ResponsiveGrid.Bento = function ResponsiveGridBento(props: ResponsiveGridProps) {
  return <ResponsiveGrid preset="bento" {...props} />
}

/**
 * ResponsiveGrid.Modules - Module grid layout preset
 */
ResponsiveGrid.Modules = function ResponsiveGridModules(props: ResponsiveGridProps) {
  return <ResponsiveGrid preset="modules" gap="compact" {...props} />
}

/**
 * Phase 2: ResponsiveGrid.Asymmetric - Asymmetric 3-column layout preset
 * Layout: 40% | 35% | 25% (using 12-column grid: 5 | 4 | 3)
 */
ResponsiveGrid.Asymmetric = function ResponsiveGridAsymmetric(props: ResponsiveGridProps) {
  return <ResponsiveGrid preset="asymmetric" {...props} />
}

// Export asymmetric components as named exports for proper re-export
export const AsymmetricWide = ResponsiveGrid.AsymmetricWide
export const AsymmetricMedium = ResponsiveGrid.AsymmetricMedium
export const AsymmetricNarrow = ResponsiveGrid.AsymmetricNarrow
