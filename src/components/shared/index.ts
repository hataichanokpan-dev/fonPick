/**
 * Shared components exports
 */

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card'
export { Badge } from './Badge'
export { Button } from './Button'
export { CompactMetricStrip } from './CompactMetricStrip'
export type { MetricItem, CompactMetricStripProps } from './CompactMetricStrip'
export { LoadingSkeleton, CardSkeleton, TextSkeleton } from './LoadingSkeleton'
export { ErrorFallback } from './ErrorFallback'
export { DataBadge } from './DataBadge'
export { SearchBar } from './SearchBar'
export { DataFreshness } from './DataFreshness'
export { CompactSectionLabel } from './CompactSectionLabel'
export type { Priority, CompactSectionLabelProps } from './CompactSectionLabel'
export { SectionHeader } from './SectionHeader'
export type { Priority as SectionHeaderPriority, SectionHeaderProps } from './SectionHeader'
export {
  CompactCard,
  CompactMetric,
  CompactStatGrid,
  CompactGauge,
} from './CompactCard'
export {
  ErrorBoundary,
  InlineErrorBoundary,
  useErrorHandler,
} from './ErrorBoundary'
export { CollapsibleCard } from './CollapsibleCard'
export type { CollapsibleCardProps, CollapsibleCardPadding } from './CollapsibleCard'

// Modern components
export { AccessibleSignal } from './modern/AccessibleSignal'
export { SwipeableCard } from './modern/SwipeableCard'
export { AnimatedPrice } from './modern/AnimatedPrice'
export { GlassCard } from './modern/GlassCard'
export { GradientButton } from './modern/GradientButton'
export { ShimmerSkeleton } from './modern/ShimmerSkeleton'
export { PullToRefresh } from './modern/PullToRefresh'

export type { AccessibleSignalProps, SwipeableCardProps, AnimatedPriceProps } from '@/types'
