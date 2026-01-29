/**
 * StockPageSkeleton Component
 *
 * Skeleton loading state for the stock detail page.
 * Displays placeholder elements while data is being fetched.
 *
 * Features:
 * - Hero section skeleton (back button, stock name, symbol)
 * - Price info skeleton (current price, change, market cap, sector)
 * - Decision badge skeleton (verdict, confidence score)
 * - Layer scores skeleton (quality, valuation, timing)
 * - Analysis sections skeleton (bullets, evidence cards, next step)
 *
 * Accessibility:
 * - aria-label for screen readers
 * - role="status" for loading indicators
 */

export function StockPageSkeleton() {
  return (
    <div
      data-testid="stock-page-skeleton"
      className="space-y-3"
      role="status"
      aria-label="Loading stock data"
    >
      {/* Back Button and Title - Compact */}
      <div className="flex items-center justify-between">
        <div
          data-testid="skeleton-back-button"
          className="h-4 w-24 bg-surface/50 rounded animate-pulse"
        />
        <div
          data-testid="skeleton-watchlist-button"
          className="h-8 w-8 bg-surface/50 rounded-full animate-pulse"
        />
      </div>

      {/* Stock Name and Price - Compact */}
      <div className="rounded-lg p-3 bg-surface border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            {/* Stock Name */}
            <div
              data-testid="skeleton-stock-name"
              className="h-6 w-48 bg-surface/50 rounded animate-pulse mb-2"
            />
            {/* Stock Symbol */}
            <div
              data-testid="skeleton-stock-symbol"
              className="h-4 w-20 bg-surface/50 rounded animate-pulse mb-3"
            />

            {/* Price Info */}
            <div className="flex items-center gap-3">
              {/* Current Price */}
              <div
                data-testid="skeleton-current-price"
                className="h-8 w-24 bg-surface/50 rounded animate-pulse"
              />
              {/* Price Change */}
              <div
                data-testid="skeleton-price-change"
                className="h-5 w-16 bg-surface/50 rounded animate-pulse"
              />
            </div>
          </div>

          {/* Market Info */}
          <div className="space-y-2">
            <div
              data-testid="skeleton-sector"
              className="h-4 w-32 bg-surface/50 rounded animate-pulse"
            />
            <div
              data-testid="skeleton-market-cap"
              className="h-4 w-40 bg-surface/50 rounded animate-pulse"
            />
          </div>
        </div>
      </div>

      {/* Decision Header - Compact */}
      <div
        data-testid="skeleton-decision-badge"
        className="rounded-lg p-3 bg-surface border border-border animate-pulse"
      >
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-surface/50 rounded" />
          <div
            data-testid="skeleton-confidence-score"
            className="h-6 w-16 bg-surface/50 rounded"
          />
        </div>
      </div>

      {/* Verdict Bullets - Compact */}
      <div
        data-testid="skeleton-verdict-bullets"
        className="rounded-lg p-3 bg-surface border border-border animate-pulse"
      >
        <div className="space-y-2">
          <div className="h-4 w-full bg-surface/50 rounded" />
          <div className="h-4 w-5/6 bg-surface/50 rounded" />
          <div className="h-4 w-4/6 bg-surface/50 rounded" />
        </div>
      </div>

      {/* Lens Scores and Evidence Cards - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Layer Scores */}
        <div
          data-testid="skeleton-layer-scores"
          className="rounded-lg p-3 bg-surface border border-border animate-pulse"
        >
          <div className="space-y-3">
            <div className="h-5 w-24 bg-surface/50 rounded" />
            <div className="space-y-2">
              {/* Quality Score */}
              <div className="flex items-center justify-between">
                <div
                  data-testid="skeleton-quality-score"
                  className="h-4 w-16 bg-surface/50 rounded"
                />
                <div className="h-4 w-12 bg-surface/50 rounded" />
              </div>
              {/* Valuation Score */}
              <div className="flex items-center justify-between">
                <div
                  data-testid="skeleton-valuation-score"
                  className="h-4 w-20 bg-surface/50 rounded"
                />
                <div className="h-4 w-12 bg-surface/50 rounded" />
              </div>
              {/* Timing Score */}
              <div className="flex items-center justify-between">
                <div
                  data-testid="skeleton-timing-score"
                  className="h-4 w-16 bg-surface/50 rounded"
                />
                <div className="h-4 w-12 bg-surface/50 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Cards */}
        <div
          data-testid="skeleton-evidence-cards"
          className="rounded-lg p-3 bg-surface border border-border animate-pulse"
        >
          <div className="space-y-3">
            <div className="h-5 w-24 bg-surface/50 rounded" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 bg-surface/50 rounded" />
              <div className="h-16 bg-surface/50 rounded" />
              <div className="h-16 bg-surface/50 rounded" />
              <div className="h-16 bg-surface/50 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Next Step - Compact */}
      <div
        data-testid="skeleton-next-step"
        className="rounded-lg p-3 bg-info/10 border border-info/30 animate-pulse"
      >
        <div className="flex items-start gap-2">
          <div className="text-sm text-info">➜</div>
          <div className="flex-1">
            <div className="h-4 w-20 bg-surface/50 rounded mb-2" />
            <div className="h-4 w-full bg-surface/50 rounded" />
          </div>
        </div>
      </div>

      {/* Data Completeness Disclaimer - Compact */}
      <div
        data-testid="skeleton-disclaimer"
        className="h-4 w-full bg-surface/50 rounded animate-pulse"
      />
    </div>
  )
}
