'use client'

/**
 * Stock Page Client Component
 *
 * Client-side component that uses the useStockData hook for data fetching.
 * Integrates with the server component by providing the initial RTDB fallback data.
 *
 * Features:
 * - Uses useStockData hook for API data fetching
 * - Shows loading skeleton while fetching
 * - Displays error boundary on error
 * - Falls back to RTDB data if API fails
 * - Displays StockHero, DecisionBadge, LayerScores, and Analysis Sections
 * - Phase 6: Integration & Polish
 *   - ShareSheet component for social sharing
 *   - WatchlistButton with localStorage persistence
 *   - StockDataFreshness with Thai timezone
 *   - Smooth transitions and animations
 *   - Performance optimizations
 */

import { useStockData } from '@/hooks/useStockData'
import {
  StockPageSkeleton,
  StockPageErrorBoundary,
  StockHero,
  DecisionBadge,
  LayerScores,
  FundamentalAnalysis,
  TechnicalAnalysis,
  CatalystSection,
  ShareSheet,
  WatchlistButton,
  StockDataFreshness,
} from '@/components/stock'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useCallback } from 'react'

export interface StockPageClientProps {
  symbol: string
  children?: React.ReactNode
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
        {/* Fallback to RTDB data */}
        {children}
      </div>
    )
  }

  // Display API data with StockHero, DecisionBadge, LayerScores, and Analysis Sections
  if (data) {
    const { overview, statistics } = data

    // Track share events
    const handleShare = (event: {
      type: 'share'
      symbol: string
      method: 'web-share-api' | 'copy-link' | 'facebook' | 'twitter' | 'line'
    }) => {
      trackEvent('stock_share', {
        symbol,
        method: event.method,
      })
    }

    // Track watchlist events
    const handleWatchlistChange = (state: { symbol: string; isOnWatchlist: boolean }) => {
      trackEvent('watchlist_toggle', {
        symbol,
        action: state.isOnWatchlist ? 'add' : 'remove',
      })
    }

    // Handle refresh by calling refetch and ignoring the result
    // Using useCallback with empty deps since refetch is stable from React Query
    const handleRefresh = useCallback(() => {
      refetch().then(() => undefined)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <div className="space-y-6">
        {/* Stock Hero Section with Share and Watchlist */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <StockHero data={overview.data} />
          </div>
          <div className="flex items-center gap-2">
            <WatchlistButton
              symbol={symbol}
              onChange={handleWatchlistChange}
            />
            <ShareSheet
              symbol={overview.data.symbol}
              name={overview.data.name}
              currentPrice={overview.data.price.current}
              change={overview.data.price.change}
              changePercent={overview.data.price.changePercent}
              onShare={handleShare}
            />
          </div>
        </div>

        {/* Data Freshness Indicator */}
        <StockDataFreshness
          lastUpdate={overview.data.lastUpdate}
          onRefresh={handleRefresh}
          autoRefreshInterval={5 * 60 * 1000} // 5 minutes
        />

        {/* Decision Badge */}
        <DecisionBadge badge={overview.data.decisionBadge} />

        {/* Layer Scores - NEW 4-Layer System */}
        <LayerScores layerScore={overview.data.layerScore} />

        {/* Phase 5: Analysis Sections */}
        {statistics && (
          <>
            {/* Fundamental Analysis */}
            <FundamentalAnalysis data={statistics.data} />

            {/* Technical Analysis */}
            <TechnicalAnalysis
              data={statistics.data}
              week52High={overview.data.week52High}
              week52Low={overview.data.week52Low}
              currentPrice={overview.data.price.current}
            />

            {/* Catalyst Section */}
            <CatalystSection
              data={statistics.data}
              events={[]}
              technicalSignals={{
                movingAverageAlignment: 'bullish',
                rsiStatus: 'neutral',
                macdSignal: 'buy',
                supportLevel: 32.5,
                resistanceLevel: 38.0,
              }}
            />
          </>
        )}

        {/* Fallback to RTDB data for additional content */}
        {/* In the future, this could be replaced with API data */}
        {children}
      </div>
    )
  }

  // Show children (RTDB fallback) if API data is not available
  return <>{children}</>
}
