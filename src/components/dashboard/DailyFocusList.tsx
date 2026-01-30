/**
 * DailyFocusList Component (Memory-Optimized)
 *
 * P0 component showing cross-ranked stocks that appear in multiple categories (high-conviction picks).
 *
 * Features:
 * - Displays top N cross-ranked stocks as badges
 * - Shows ranking count in badge (e.g., "PTT (3)")
 * - Color-coded by strength score (buy/watch/neutral)
 * - CSS-based animations (no Framer Motion memory overhead)
 * - Horizontal scroll for more stocks
 * - Empty state when no stocks
 * - Fetches from Context if props not provided
 *
 * Data source: Cross-ranked stocks from MarketIntelligenceContext
 */

'use client'

import Link from 'next/link'
import { Card, CardHeader } from '@/components/shared'
import { Badge } from '@/components/shared/Badge'
import { Award } from 'lucide-react'
import type { CrossRankedStock } from '@/types/market-intelligence'
import { useActiveStocks } from '@/hooks/useMarketIntelligence'

// ==================================================================
// TYPES
// ==================================================================

export interface DailyFocusListProps {
  /** Cross-ranked stocks to display (optional - will fetch from Context if not provided) */
  crossRankedStocks?: CrossRankedStock[]
  /** Number of top stocks to display (default: all) */
  topCount?: number
}

// ==================================================================
// CONSTANTS
// ==================================================================

const DEFAULT_TOP_COUNT = Number.MAX_SAFE_INTEGER

// Strength score thresholds for color coding
const STRENGTH_THRESHOLDS = {
  BUY: 5,    // > 5 = buy (green)
  WATCH: 3,  // 3-5 = watch (yellow)
  // < 3 = neutral (gray)
} as const

// ==================================================================
// HELPER FUNCTIONS
// ==================================================================

/**
 * Get badge color based on strength score
 */
function getStrengthColor(strengthScore: number): 'buy' | 'watch' | 'neutral' {
  if (strengthScore > STRENGTH_THRESHOLDS.BUY) {
    return 'buy'
  }
  if (strengthScore >= STRENGTH_THRESHOLDS.WATCH) {
    return 'watch'
  }
  return 'neutral'
}

/**
 * Validate and filter cross-ranked stocks
 */
function getValidStocks(stocks: CrossRankedStock[] | null | undefined): CrossRankedStock[] {
  if (!stocks || !Array.isArray(stocks)) {
    return []
  }
  return stocks.filter(
    (stock): stock is CrossRankedStock =>
      stock != null &&
      typeof stock.symbol === 'string' &&
      typeof stock.rankingCount === 'number' &&
      typeof stock.strengthScore === 'number'
  )
}

/**
 * Get display count with validation
 */
function getDisplayCount(topCount?: number): number {
  // If topCount is not provided, return MAX to show all stocks
  if (topCount === undefined) {
    return DEFAULT_TOP_COUNT
  }
  // If topCount is invalid (not a number or <= 0), return 0 to show empty state
  if (typeof topCount !== 'number' || topCount <= 0) {
    return 0
  }
  return Math.min(topCount, DEFAULT_TOP_COUNT)
}

// ==================================================================
// SUB-COMPONENTS
// ==================================================================

interface StockBadgeProps {
  stock: CrossRankedStock
  index: number
}

function StockBadge({ stock, index }: StockBadgeProps) {
  const color = getStrengthColor(stock.strengthScore)

  return (
    <Link href={`/stock/${stock.symbol}`}>
      <div
        className="fade-in hover:scale-105 active:scale-95 transition-transform duration-150"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <Badge size="sm" color={color} className="flex items-center gap-1.5 px-2.5 py-1">
          <Award className="w-3 h-3" />
          {stock.symbol}
          <span className="text-[9px] font-medium tabular-nums">({stock.rankingCount})</span>
        </Badge>
      </div>
    </Link>
  )
}

interface EmptyStateProps {
  stockCount: number
}

function EmptyState({ stockCount }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <p className="text-sm text-text-muted">
        {stockCount === 0
          ? 'No focus stocks available'
          : 'No cross-ranked stocks found'}
      </p>
    </div>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function DailyFocusList({
  crossRankedStocks: propsCrossRankedStocks,
  topCount,
}: DailyFocusListProps) {
  // Fetch from Context if props not provided (prevents duplication)
  const { data: activeStocksData } = useActiveStocks()
  const crossRankedStocks = propsCrossRankedStocks ?? activeStocksData?.crossRanked ?? []

  // Validate and filter stocks
  const validStocks = getValidStocks(crossRankedStocks)

  // Apply top count limit
  const displayCount = getDisplayCount(topCount)
  const displayStocks = displayCount > 0
    ? validStocks.slice(0, displayCount)
    : []

  // Empty state
  if (displayStocks.length === 0) {
    return (
      <Card
        padding="sm"
        variant="default"
        testId="daily-focus-list"
        className="min-h-[100px]"
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-warn" />
              <h3 className="text-sm font-semibold text-text-primary">
                Daily Focus
              </h3>
            </div>
            <Badge size="sm" color="neutral">
              {validStocks.length}
            </Badge>
          </div>
        </CardHeader>
        <EmptyState stockCount={validStocks.length} />
      </Card>
    )
  }

  return (
    <Card
      padding="sm"
      variant="default"
      testId="daily-focus-list"
      className="min-h-[100px]"
    >
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-warn" />
            <h3 className="text-sm font-semibold text-text-primary">
              Daily Focus
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge size="sm" color="neutral">
              {validStocks.length}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Stock Badges - CSS-based staggered animation */}
      <div className="flex flex-wrap gap-2">
        {displayStocks.map((stock, index) => (
          <StockBadge key={stock.symbol} stock={stock} index={index} />
        ))}
      </div>
    </Card>
  )
}
