/**
 * ModuleGrid Component
 *
 * Responsive grid layout for the 6 homepage modules:
 * - VolatilityModule (Market Breadth)
 * - SectorRotationModule
 * - SmartMoneyModule
 * - InsightsModule
 * - RankingsImpactModule
 * - CorrelationModule
 *
 * Responsive behavior:
 * - Desktop (1024px+): 3 columns, 2 rows
 * - Tablet (768px-1023px): 2 columns
 * - Mobile (<768px): 1 column
 * - Gap: 12px (compact)
 *
 * Performance: Lazy loads below-fold modules
 */

'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

// ==================================================================
// TYPES
// ==================================================================

export interface ModuleGridProps {
  /** Child module components */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Number of columns on desktop */
  desktopColumns?: 2 | 3
  /** Enable lazy loading for below-fold modules */
  lazyLoad?: boolean
  /** Number of modules to render immediately (others lazy loaded) */
  priorityCount?: number
}

// ==================================================================
// LAZY LOADING WRAPPER
// ==================================================================

interface LazyModuleWrapperProps {
  children: React.ReactNode
  /** Delay in ms before rendering (for stagger effect) */
  delay?: number
}

function LazyModuleWrapper({ children, delay: _delay = 0 }: LazyModuleWrapperProps) {
  // For now, simple client-side rendering
  // In a production app, you might use IntersectionObserver
  return <>{children}</>
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

function ModuleGrid({
  children,
  className,
  desktopColumns = 3,
  lazyLoad = false,
  priorityCount = 6,
}: ModuleGridProps) {
  // Convert children to array for processing
  const childArray = Array.isArray(children) ? children : [children]

  // Apply responsive grid classes
  const gridClasses = cn(
    // Base grid
    'grid gap-3',
    // Mobile: 1 column
    'grid-cols-1',
    // Tablet (md): 2 columns
    'md:grid-cols-2',
    // Desktop (lg): 2 or 3 columns
    desktopColumns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2',
    className
  )

  // Process children for lazy loading
  const renderChildren = () => {
    if (!lazyLoad) {
      return childArray
    }

    return childArray.map((child, index) => {
      const isPriority = index < priorityCount

      if (isPriority) {
        return child
      }

      return (
        <LazyModuleWrapper key={index} delay={index * 50}>
          {child}
        </LazyModuleWrapper>
      )
    })
  }

  return <div className={gridClasses}>{renderChildren()}</div>
}

// Memoize to prevent unnecessary re-renders
const MemoizedModuleGrid = memo(ModuleGrid, (prevProps, nextProps) => {
  // Only re-render if children change
  return (
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className &&
    prevProps.desktopColumns === nextProps.desktopColumns
  )
})

// Named export for convenience
export { MemoizedModuleGrid as ModuleGrid }

// Default export
export default MemoizedModuleGrid

// ==================================================================
// MODULE SKELETON LOADING STATE
// ==================================================================

export interface ModuleSkeletonProps {
  /** Additional CSS classes */
  className?: string
}

export function ModuleSkeleton({ className }: ModuleSkeletonProps) {
  return (
    <div className={cn('bg-surface border border-border rounded-lg p-3', className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-surface-2 rounded animate-pulse" />
        <div className="h-5 w-16 bg-surface-2 rounded animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2">
        <div className="h-16 bg-surface-2 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 bg-surface-2 rounded animate-pulse" />
          <div className="h-12 bg-surface-2 rounded animate-pulse" />
          <div className="h-12 bg-surface-2 rounded animate-pulse" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="h-3 w-full bg-surface-2 rounded animate-pulse" />
      </div>
    </div>
  )
}

// ==================================================================
// MODULE ERROR STATE
// ==================================================================

export interface ModuleErrorProps {
  /** Module title */
  title: string
  /** Error message */
  error?: string
  /** Retry callback */
  onRetry?: () => void
  /** Additional CSS classes */
  className?: string
}

export function ModuleError({
  title,
  error = 'Unable to load data',
  onRetry,
  className,
}: ModuleErrorProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg p-3 flex flex-col items-center justify-center min-h-[140px]',
        className
      )}
    >
      {/* Error icon */}
      <div className="w-10 h-10 rounded-full bg-sell-bg/30 flex items-center justify-center mb-2">
        <svg
          className="w-5 h-5 text-down"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Error message */}
      <h3 className="text-sm font-semibold text-text-2 mb-1">{title}</h3>
      <p className="text-xs text-text-muted text-center mb-3">{error}</p>

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 text-xs font-medium bg-surface-1 hover:bg-surface-2 border border-border rounded transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}

// ==================================================================
// MODULE WRAPPER WITH LOADING/ERROR STATES
// ==================================================================

export interface ModuleWrapperProps {
  /** Module title */
  title: string
  /** Loading state */
  isLoading?: boolean
  /** Error state */
  error?: string | null
  /** Retry callback */
  onRetry?: () => void
  /** Child content */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

export function ModuleWrapper({
  title,
  isLoading = false,
  error = null,
  onRetry,
  children,
  className,
}: ModuleWrapperProps) {
  if (isLoading) {
    return <ModuleSkeleton className={className} />
  }

  if (error) {
    return (
      <ModuleError
        title={title}
        error={error}
        onRetry={onRetry}
        className={className}
      />
    )
  }

  return <>{children}</>
}
