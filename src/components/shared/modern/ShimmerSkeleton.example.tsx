/**
 * ShimmerSkeleton Component Examples
 *
 * This file demonstrates all variants and usage patterns of the ShimmerSkeleton component.
 * These examples are for documentation and testing purposes.
 */

'use client'

import { ShimmerSkeleton, TextSkeleton, CircleSkeleton, CardSkeleton } from './ShimmerSkeleton'
import { GlassCard } from './GlassCard'

/**
 * Basic usage examples for all variants
 */
export function ShimmerSkeletonExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-text-primary">ShimmerSkeleton Examples</h2>

      {/* Text Variant Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Text Variant</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard>
            <div className="space-y-3">
              <p className="text-sm text-text-tertiary">Single line</p>
              <ShimmerSkeleton variant="text" lines={1} />
            </div>
          </GlassCard>
          <GlassCard>
            <div className="space-y-3">
              <p className="text-sm text-text-tertiary">Two lines</p>
              <ShimmerSkeleton variant="text" lines={2} />
            </div>
          </GlassCard>
          <GlassCard>
            <div className="space-y-3">
              <p className="text-sm text-text-tertiary">Three lines</p>
              <ShimmerSkeleton variant="text" lines={3} />
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Circle Variant Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Circle Variant</h3>
        <div className="flex items-center gap-6">
          <div className="space-y-2 text-center">
            <ShimmerSkeleton variant="circle" width={32} />
            <p className="text-xs text-text-tertiary">32px</p>
          </div>
          <div className="space-y-2 text-center">
            <ShimmerSkeleton variant="circle" width={40} />
            <p className="text-xs text-text-tertiary">40px</p>
          </div>
          <div className="space-y-2 text-center">
            <ShimmerSkeleton variant="circle" width={48} />
            <p className="text-xs text-text-tertiary">48px</p>
          </div>
          <div className="space-y-2 text-center">
            <ShimmerSkeleton variant="circle" width={64} />
            <p className="text-xs text-text-tertiary">64px</p>
          </div>
          <div className="space-y-2 text-center">
            <ShimmerSkeleton variant="circle" width={80} />
            <p className="text-xs text-text-tertiary">80px</p>
          </div>
        </div>
      </section>

      {/* Card Variant Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Card Variant</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Without avatar */}
          <div>
            <p className="text-sm text-text-tertiary mb-2">Without avatar</p>
            <ShimmerSkeleton variant="card" lines={3} showAvatar={false} />
          </div>
          {/* With avatar */}
          <div>
            <p className="text-sm text-text-tertiary mb-2">With avatar</p>
            <ShimmerSkeleton variant="card" lines={3} showAvatar />
          </div>
        </div>
      </section>

      {/* Custom Variant Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Custom Variant</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-tertiary mb-2">Full width banner (32px height)</p>
            <ShimmerSkeleton variant="custom" width="100%" height={32} />
          </div>
          <div>
            <p className="text-sm text-text-tertiary mb-2">Square box (200px x 200px)</p>
            <ShimmerSkeleton variant="custom" width={200} height={200} />
          </div>
        </div>
      </section>

      {/* Convenience Wrapper Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Convenience Wrappers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard>
            <div className="space-y-3">
              <p className="text-sm text-text-tertiary">TextSkeleton</p>
              <TextSkeleton lines={2} />
            </div>
          </GlassCard>
          <GlassCard>
            <div className="space-y-3">
              <p className="text-sm text-text-tertiary">CircleSkeleton</p>
              <div className="flex justify-center">
                <CircleSkeleton width={48} />
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="space-y-3">
              <p className="text-sm text-text-tertiary">CardSkeleton</p>
              <CardSkeleton lines={2} showAvatar />
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Real-World Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Real-World Examples</h3>

        {/* Stock Card Skeleton */}
        <GlassCard>
          <p className="text-sm text-text-tertiary mb-4">Stock Card Loading State</p>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CircleSkeleton width={48} />
              <div className="space-y-2">
                <TextSkeleton lines={1} />
                <TextSkeleton lines={1} />
              </div>
            </div>
            <div className="text-right space-y-2">
              <TextSkeleton lines={1} />
              <CircleSkeleton width={60} />
            </div>
          </div>
        </GlassCard>

        {/* List Items Skeleton */}
        <GlassCard>
          <p className="text-sm text-text-tertiary mb-4">List Loading State</p>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <CircleSkeleton width={32} />
                <TextSkeleton lines={1} />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Stats Grid Skeleton */}
        <GlassCard>
          <p className="text-sm text-text-tertiary mb-4">Stats Grid Loading State</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <TextSkeleton lines={1} />
                <TextSkeleton lines={1} />
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  )
}

/**
 * Real-world usage: Stock Card Loading State
 */
export function StockCardLoadingSkeleton() {
  return (
    <div className="rounded-lg p-4 bg-surface border border-border">
      <div className="flex items-start justify-between">
        {/* Left: Symbol and name */}
        <div className="flex items-center gap-3">
          <CircleSkeleton width={48} ariaLabel="Loading stock icon" />
          <div className="space-y-2">
            <ShimmerSkeleton variant="text" lines={1} ariaLabel="Loading stock symbol" />
            <ShimmerSkeleton variant="text" lines={1} ariaLabel="Loading stock name" />
          </div>
        </div>

        {/* Right: Price and change */}
        <div className="text-right space-y-2">
          <ShimmerSkeleton variant="text" lines={1} ariaLabel="Loading stock price" />
          <ShimmerSkeleton variant="custom" width={80} height={24} ariaLabel="Loading price change" />
        </div>
      </div>

      {/* Bottom: Metrics */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[1, 2, 3].map((i) => (
          <ShimmerSkeleton key={i} variant="custom" width="100%" height={48} ariaLabel="Loading metric" />
        ))}
      </div>
    </div>
  )
}

/**
 * Real-world usage: Table Loading State
 */
export function TableLoadingSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-lg overflow-hidden border border-border bg-surface">
      {/* Header */}
      <div
        className="grid gap-2 p-3 border-b border-border"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <ShimmerSkeleton key={`header-${i}`} variant="text" lines={1} ariaLabel="Loading table header" />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-2 p-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <ShimmerSkeleton
                key={`cell-${rowIndex}-${colIndex}`}
                variant="text"
                lines={1}
                ariaLabel="Loading table cell"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Real-world usage: Dashboard Module Loading State
 */
export function ModuleLoadingSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="rounded-lg p-4 bg-surface border border-border space-y-3">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <TextSkeleton lines={1} ariaLabel="Loading module title" />
          <CircleSkeleton width={24} ariaLabel="Loading module action" />
        </div>
      )}

      {/* Content */}
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <TextSkeleton lines={1} ariaLabel="Loading metric label" />
            <TextSkeleton lines={1} ariaLabel="Loading metric value" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ShimmerSkeletonExamples
