/**
 * Market Intelligence Dashboard Loading Skeleton
 *
 * Displays while the dashboard page is being loaded (during navigation)
 */

/**
 * Priority Section Label Skeleton
 */
function PrioritySectionLabelSkeleton() {
  return (
    <div className="flex items-center gap-2 mb-3 px-2 py-1 rounded border border-border-subtle bg-surface-2 animate-pulse">
      <div className="h-3 w-6 bg-surface-3 rounded" />
      <div className="h-3 w-24 bg-surface-3 rounded" />
    </div>
  )
}

/**
 * Dashboard Loading Skeleton
 */
export default function MarketIntelligenceLoading() {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header Skeleton */}
      <div className="mb-6 space-y-3">
        <div className="h-8 bg-surface-2 rounded w-48 animate-pulse" />
        <div className="h-4 bg-surface-2 rounded w-96 animate-pulse" />
      </div>

      {/* P0 Section Skeleton */}
      <section>
        <PrioritySectionLabelSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Market Regime Skeleton */}
          <div className="h-80 bg-surface-2 rounded-lg animate-pulse" />

          {/* Smart Money Skeleton */}
          <div className="h-80 bg-surface-2 rounded-lg animate-pulse" />
        </div>
      </section>

      {/* P1 Section Skeleton */}
      <section>
        <PrioritySectionLabelSkeleton />
        <div className="h-96 bg-surface-2 rounded-lg animate-pulse" />
      </section>

      {/* P2 Section Skeleton */}
      <section>
        <PrioritySectionLabelSkeleton />
        <div className="h-[500px] bg-surface-2 rounded-lg animate-pulse" />
      </section>
    </div>
  )
}
