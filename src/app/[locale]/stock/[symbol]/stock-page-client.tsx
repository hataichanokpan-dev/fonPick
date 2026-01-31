'use client'

/**
 * Stock Page Client Component
 *
 * Client-side component that fetches stock data from internal proxy APIs.
 *
 * APIs used:
 * - GET /api/stocks/{symbol}/overview - Basic stock information
 * - GET /api/stocks/{symbol}/statistics - Complete statistics
 *
 * Features:
 * - Uses useStockData hook for API data fetching
 * - Shows loading skeleton while fetching
 * - Displays error boundary on error
 * - Displays stock information with overview and statistics
 */

import { useStockData } from '@/hooks/useStockData'
import { StockPageSkeleton, StockPageErrorBoundary, WatchlistButton } from '@/components/stock'
import { useAnalytics } from '@/hooks/useAnalytics'
import type { StockOverviewData, StockStatisticsData } from '@/types/stock-proxy-api'

export interface StockPageClientProps {
  symbol: string
  locale: string
  children?: React.ReactNode
}

/**
 * Stock overview display component
 */
function StockOverview({ data, symbol }: { data: StockOverviewData; symbol: string }) {
  return (
    <div className="space-y-3">
      {/* Stock Name and Price */}
      <div className="rounded-lg p-3 bg-surface border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-text">{symbol}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl font-bold text-text">
                {data.price.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-xs text-text-2">
            <div>Market Cap: {data.marketCap}</div>
            <div>Volume: {data.volume?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="rounded-lg p-3 bg-surface border border-border">
        <h2 className="text-sm font-semibold mb-2 text-text">Overview Metrics</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-text-2">P/E Ratio:</span>{' '}
            <span className="text-text">{data.peRatio.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-text-2">Forward P/E:</span>{' '}
            <span className="text-text">{data.forwardPERatio.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-text-2">EPS:</span>{' '}
            <span className="text-text">{data.eps.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-text-2">Beta:</span>{' '}
            <span className="text-text">{data.beta?.toFixed(2) || 'N/A'}</span>
          </div>
          <div>
            <span className="text-text-2">52W High:</span>{' '}
            <span className="text-text">{data.high52Week || 'N/A'}</span>
          </div>
          <div>
            <span className="text-text-2">52W Low:</span>{' '}
            <span className="text-text">{data.low52Week || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Key Dates */}
      <div className="rounded-lg p-3 bg-surface border border-border">
        <h2 className="text-sm font-semibold mb-2 text-text">Key Dates</h2>
        <div className="space-y-1 text-xs">
          <div>
            <span className="text-text-2">Earnings:</span>{' '}
            <span className="text-text">{data.earningsDate || 'N/A'}</span>
          </div>
          <div>
            <span className="text-text-2">Ex-Dividend:</span>{' '}
            <span className="text-text">{data.exDividendDate || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Stock statistics display component
 */
function StockStatistics({ data }: { data: StockStatisticsData }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg p-3 bg-surface border border-border">
        <h2 className="text-sm font-semibold mb-2 text-text">Valuation Metrics</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-text-2">P/E:</span>{' '}
            <span className="text-text">{data.peRatio.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-text-2">Forward P/E:</span>{' '}
            <span className="text-text">{data.forwardPERatio.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-text-2">P/S:</span>{' '}
            <span className="text-text">{data.psRatio.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-text-2">P/B:</span>{' '}
            <span className="text-text">{data.pbRatio.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-text-2">EV/EBITDA:</span>{' '}
            <span className="text-text">{data.evEbitda.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-text-2">PEG Ratio:</span>{' '}
            <span className="text-text">{data.pegRatio?.toFixed(2) || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg p-3 bg-surface border border-border">
        <h2 className="text-sm font-semibold mb-2 text-text">Financial Health</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-text-2">Current Ratio:</span>{' '}
            <span className="text-text">{data.currentRatio.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-text-2">Quick Ratio:</span>{' '}
            <span className="text-text">{data.quickRatio.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-text-2">Debt/Equity:</span>{' '}
            <span className="text-text">{data.debtToEquity.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-text-2">Interest Coverage:</span>{' '}
            <span className="text-text">{data.interestCoverage.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg p-3 bg-surface border border-border">
        <h2 className="text-sm font-semibold mb-2 text-text">Profitability</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-text-2">ROE:</span>{' '}
            <span className="text-text">{(data.returnOnEquity * 100).toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-text-2">ROA:</span>{' '}
            <span className="text-text">{(data.returnOnAssets * 100).toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-text-2">ROIC:</span>{' '}
            <span className="text-text">{(data.returnOnInvestedCapital * 100).toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-text-2">Profit Margin:</span>{' '}
            <span className="text-text">{(data.profitMargin * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg p-3 bg-surface border border-border">
        <h2 className="text-sm font-semibold mb-2 text-text">Dividend Info</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-text-2">Dividend Yield:</span>{' '}
            <span className="text-text">{(data.dividendYield * 100).toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-text-2">Payout Ratio:</span>{' '}
            <span className="text-text">{(data.payoutRatio * 100).toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-text-2">Dividend Growth:</span>{' '}
            <span className="text-text">{data.dividendGrowth.toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-text-2">FCF Yield:</span>{' '}
            <span className="text-text">{(data.fcfYield * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Stock page client wrapper component
 */
export function StockPageClient({ symbol, children }: StockPageClientProps) {
  const { data, isLoading, error, refetch } = useStockData(symbol)
  const { trackEvent } = useAnalytics()

  // Show loading skeleton while fetching
  if (isLoading) {
    return <StockPageSkeleton />
  }

  // Show error boundary on error
  if (error) {
    return (
      <div className="space-y-4">
        <StockPageErrorBoundary
          error={error}
          symbol={symbol}
          onRetry={refetch}
        />
        {/* Fallback to server-rendered content */}
        {children}
      </div>
    )
  }

  // Display API data
  if (data) {
    // Track watchlist events
    const handleWatchlistChange = (state: { symbol: string; isOnWatchlist: boolean }) => {
      trackEvent('watchlist_toggle', {
        symbol,
        action: state.isOnWatchlist ? 'add' : 'remove',
      })
    }

    return (
      <div className="space-y-4">
        {/* Header with Watchlist */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Overview data */}
            {data.overview.success && data.overview.data && (
              <StockOverview data={data.overview.data} symbol={symbol} />
            )}
          </div>
          <WatchlistButton
            symbol={symbol}
            onChange={handleWatchlistChange}
          />
        </div>

        {/* Statistics data */}
        {data.statistics.success && data.statistics.data && (
          <StockStatistics data={data.statistics.data} />
        )}

        {/* Fallback to server-rendered content for additional data */}
        {children}
      </div>
    )
  }

  // Show children (server-rendered fallback) if API data is not available
  return <>{children}</>
}
