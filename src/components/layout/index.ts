/**
 * Layout Components
 * fonPick - Thai Stock Market Application
 *
 * Barrel export for all layout components.
 *
 * Phase 2: Enhanced Layout Components
 */

// ==================================================================
// IMPORTS
// ==================================================================

// PageContainer
import { PageContainer } from './PageContainer'
export { PageContainer } from './PageContainer'
export type { PageContainerProps, MaxWidth, PaddingSize } from './PageContainer'

// PageHeader
import { PageHeader } from './PageHeader'
export { PageHeader } from './PageHeader'
export type { PageHeaderProps } from './PageHeader'

// ResponsiveGrid
import { ResponsiveGrid } from './ResponsiveGrid'
export {
  ResponsiveGrid,
  Grid,
  GridItem,
} from './ResponsiveGrid'
export type {
  ResponsiveGridProps,
  ResponsiveGridItemProps,
  FonPickGap,
  LayoutPreset,
  GridProps,
  GridItemProps,
  GridVariant,
  ColumnSpan,
} from './ResponsiveGrid'

// Header & Navigation (Phase 4)
export { Header } from './Header'
export { MobileBottomNav } from './MobileBottomNav'
export { Footer } from './Footer'

// ==================================================================
// CONVENIENCE EXPORTS
// ==================================================================

/**
 * Default layout components for most pages
 */
export const defaultLayout = {
  PageContainer,
  PageHeader,
  ResponsiveGrid,
} as const

/**
 * Layout variants for special cases
 */
export const layoutVariants = {
  // PageContainer variants
  PageContainerFullBleed: PageContainer,
  PageContainerCompact: PageContainer,
  PageContainerMobile: PageContainer,
  // PageHeader variants
  PageHeaderCompact: PageHeader,
  PageHeaderLarge: PageHeader,
  PageHeaderCentered: PageHeader,
  // ResponsiveGrid presets
  ResponsiveGridTripleColumn: ResponsiveGrid,
  ResponsiveGridQuadColumn: ResponsiveGrid,
  ResponsiveGridBento: ResponsiveGrid,
  ResponsiveGridModules: ResponsiveGrid,
} as const
