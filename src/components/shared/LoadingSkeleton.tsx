/**
 * LoadingSkeleton Component
 * Enhanced loading state placeholders with shimmer effect
 * Theme: Green-tinted dark with teal up / soft red down
 */

'use client'

import { cn } from '@/lib/utils'

export function LoadingSkeleton({
  className,
  variant = 'default',
  shimmer = true,
}: {
  className?: string
  variant?: 'default' | 'text' | 'circular' | 'rectangular' | 'rounded'
  shimmer?: boolean
}) {
  const variants = {
    default: 'rounded-lg',
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-md',
  }

  const shimmerClass = shimmer
    ? 'animate-shimmer bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 bg-[length:1000px_100%]'
    : 'animate-pulse bg-surface-2'

  return (
    <div
      className={cn(
        shimmerClass,
        variants[variant],
        className
      )}
      aria-hidden="true"
    />
  )
}

/**
 * Card skeleton loader with shimmer effect
 */
export function CardSkeleton({
  lines = 3,
  header = true,
  footer = false,
}: {
  lines?: number
  header?: boolean
  footer?: boolean
}) {
  return (
    <div className="rounded-lg p-4 space-y-3 bg-surface border border-border">
      {header && (
        <div className="space-y-2">
          <LoadingSkeleton className="h-5 w-1/3" variant="text" />
          <LoadingSkeleton className="h-4 w-1/4" variant="text" />
        </div>
      )}
      <div className="space-y-2 pt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <LoadingSkeleton
            key={i}
            className={cn('h-4 w-full', i === lines - 1 && 'w-2/3')}
            variant="text"
          />
        ))}
      </div>
      {footer && (
        <div className="pt-2">
          <LoadingSkeleton className="h-8 w-full" variant="rounded" />
        </div>
      )}
    </div>
  )
}

/**
 * Text skeleton loader
 */
export function TextSkeleton({
  width = '100%',
  lines = 1,
}: {
  width?: string
  lines?: number
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          className={cn('h-4', lines > 1 && i === lines - 1 ? 'w-2/3' : width)}
          variant="text"
        />
      ))}
    </div>
  )
}

/**
 * Stock card skeleton loader
 */
export function StockCardSkeleton() {
  return (
    <div className="rounded-lg p-4 space-y-3 bg-surface border border-border">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <LoadingSkeleton className="h-5 w-16" variant="text" />
          <LoadingSkeleton className="h-4 w-24" variant="text" />
        </div>
        <LoadingSkeleton className="h-8 w-20" variant="rounded" />
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2">
        <LoadingSkeleton className="h-12 w-full" variant="rounded" />
        <LoadingSkeleton className="h-12 w-full" variant="rounded" />
        <LoadingSkeleton className="h-12 w-full" variant="rounded" />
      </div>
    </div>
  )
}

/**
 * Table skeleton loader
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div className="rounded-lg overflow-hidden border border-border bg-surface">
      {/* Header */}
      <div className="grid gap-2 p-3 border-b border-border" style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}>
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingSkeleton key={`header-${i}`} className="h-4" variant="text" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid gap-2 p-3" style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
          }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <LoadingSkeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4" variant="text" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Chart skeleton loader
 */
export function ChartSkeleton({
  aspectRatio = '16/9',
  showAxis = true,
}: {
  aspectRatio?: string
  showAxis?: boolean
}) {
  return (
    <div className="rounded-lg p-4 bg-surface border border-border">
      <div className="space-y-2 mb-4">
        <LoadingSkeleton className="h-5 w-1/3" variant="text" />
        <LoadingSkeleton className="h-4 w-1/4" variant="text" />
      </div>
      <div
        className="w-full bg-surface-2 rounded relative overflow-hidden"
        style={{ aspectRatio }}
      >
        <LoadingSkeleton className="absolute inset-0" variant="rectangular" />
        {showAxis && (
          <>
            <LoadingSkeleton className="absolute left-0 top-0 bottom-0 w-8" variant="rectangular" />
            <LoadingSkeleton className="absolute left-0 right-0 bottom-0 h-6" variant="rectangular" />
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Module skeleton loader (compact)
 */
export function ModuleSkeleton({
  showHeader = true,
  contentLines = 3,
}: {
  showHeader?: boolean
  contentLines?: number
} = {}) {
  return (
    <div className="rounded-lg p-3 space-y-2 bg-surface border border-border">
      {showHeader && (
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="h-4 w-24" variant="text" />
          <LoadingSkeleton className="h-4 w-16" variant="text" />
        </div>
      )}
      <div className="space-y-2 pt-1">
        {Array.from({ length: contentLines }).map((_, i) => (
          <LoadingSkeleton
            key={i}
            className={cn(
              'h-3 w-full',
              i === contentLines - 1 && 'w-1/2'
            )}
            variant="text"
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Stats grid skeleton loader
 */
export function StatsGridSkeleton({
  items = 4,
}: {
  items?: number
} = {}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="rounded-lg p-3 space-y-2 bg-surface border border-border">
          <LoadingSkeleton className="h-3 w-16" variant="text" />
          <LoadingSkeleton className="h-6 w-20" variant="text" />
        </div>
      ))}
    </div>
  )
}

/**
 * Ranking list skeleton loader
 */
export function RankingListSkeleton({
  items = 5,
  showValue = true,
}: {
  items?: number
  showValue?: boolean
} = {}) {
  return (
    <div className="space-y-1">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2 rounded">
          <div className="flex items-center gap-2">
            <LoadingSkeleton className="h-3 w-3" variant="text" />
            <LoadingSkeleton className="h-4 w-16" variant="text" />
          </div>
          {showValue && <LoadingSkeleton className="h-4 w-12" variant="text" />}
        </div>
      ))}
    </div>
  )
}
