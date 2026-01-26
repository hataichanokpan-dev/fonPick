/**
 * DailyFocusList Component
 *
 * P0 component showing cross-ranked stocks that appear in multiple categories (high-conviction picks).
 *
 * Features:
 * - Displays top N cross-ranked stocks as badges
 * - Shows ranking count in badge (e.g., "PTT (3)")
 * - Color-coded by strength score (buy/watch/neutral)
 * - Staggered entrance animation
 * - Horizontal scroll for more stocks
 * - Empty state when no stocks
 * - Sector badges and change % display (Phase 2)
 *
 * Data source: Cross-ranked stocks from market intelligence API
 */

'use client'

import { Card, CardHeader } from '@/components/shared'
import { Badge } from '@/components/shared/Badge'
import { Award } from 'lucide-react'
import { motion } from 'framer-motion'
import type { CrossRankedStock } from '@/types/market-intelligence'

// ==================================================================
// TYPES
// ==================================================================

export interface DailyFocusListProps {
  /** Cross-ranked stocks to display */
  crossRankedStocks: CrossRankedStock[]
  /** Number of top stocks to display (default: all) */
  topCount?: number
  /** Show detailed view with sector badges and change % */
  showDetails?: boolean
  /** Enable horizontal scrolling */
  horizontalScroll?: boolean
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

// Animation variants for staggered entrance
const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  },
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
  showDetails?: boolean // Phase 2: Show sector and change %
}

function StockBadge({ stock, index, showDetails = false }: StockBadgeProps) {
  const color = getStrengthColor(stock.strengthScore)

  if (showDetails) {
    // Detailed badge with sector and change %
    return (
      <motion.div
        variants={ANIMATION_VARIANTS.item}
        initial="hidden"
        animate="visible"
        custom={index}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-shrink-0"
      >
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-2 border border-border min-w-[100px]">
          {/* Symbol and rankings */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-text">
              {stock.symbol}
            </span>
            <Badge size="sm" color={color} className="flex items-center gap-0.5">
              <Award className="w-2.5 h-2.5" />
              {stock.rankingCount}
            </Badge>
          </div>

          {/* Strength score indicator */}
          <div className="text-[9px] text-text-muted">
            Strength: {stock.strengthScore.toFixed(1)}
          </div>

          {/* Rankings detail */}
          {stock.name && (
            <div className="text-[10px] text-text-muted truncate">
              {stock.name}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Simple badge (original)
  return (
    <motion.div
      variants={ANIMATION_VARIANTS.item}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Badge size="sm" color={color} className="flex items-center gap-1">
        <Award className="w-3 h-3" />
        {stock.symbol}
        <span className="text-[9px]">({stock.rankingCount})</span>
      </Badge>
    </motion.div>
  )
}

interface EmptyStateProps {
  stockCount: number
}

function EmptyState({ stockCount }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-6">
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
  crossRankedStocks,
  topCount,
  showDetails = false,
  horizontalScroll = false,
}: DailyFocusListProps) {
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
            {horizontalScroll && validStocks.length > 5 && (
              <span className="text-[9px] text-text-muted">
                → scroll for more
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Stock Badges */}
      <motion.div
        variants={ANIMATION_VARIANTS.container}
        initial="hidden"
        animate="visible"
        className={
          horizontalScroll
            ? "flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-surface-2 scrollbar-track-transparent"
            : "flex flex-wrap gap-1.5"
        }
        style={horizontalScroll ? { scrollbarWidth: "thin" } : {}}
      >
        {displayStocks.map((stock, index) => (
          <StockBadge
            key={stock.symbol}
            stock={stock}
            index={index}
            showDetails={showDetails}
          />
        ))}
      </motion.div>
    </Card>
  )
}

export default DailyFocusList
