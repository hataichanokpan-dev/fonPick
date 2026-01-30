/**
 * ActiveStocksCard Component
 *
 * Displays active stocks concentration analysis including:
 * - Concentration metrics (top5, top10, HHI)
 * - Concentration bar visualization
 * - Top 10 by value with badges
 * - Cross-ranked stocks badges
 * - Market interpretation
 * - Phase 2: Accumulation pattern tags
 *
 * Answers Q4-Q6: Active stock analysis
 * Data source: /api/market-intelligence
 *
 * Theme: Green-tinted dark with teal up / soft red down
 * Design: Compact 12px padding, large prominent numbers
 */

'use client'

import { Card } from '@/components/shared'
import { Badge } from '@/components/shared/Badge'
import {
  TrendingUp,
  BarChart3,
  Award,
  Activity,
  AlertCircle,
} from 'lucide-react'
import { formatTradingValue, formatPercentage } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { AccumulationPattern } from '@/types/market-intelligence'
import { useActiveStocks } from '@/hooks/useMarketIntelligence'

// ==================================================================
// TYPES
// ==================================================================

export interface StockConcentration {
  symbol: string
  name?: string
  value: number
  volume: number
  changePercent: number
  sectorCode?: string
  marketCapGroup?: 'L' | 'M' | 'S'
  concentrationScore: number
  valuePercentOfTotal: number
  rankings?: {
    value?: number
    volume?: number
    gainer?: number
    loser?: number
  }
  /** Phase 2: Accumulation pattern analysis */
  accumulationPattern?: AccumulationPattern
  /** Phase 2: Number of days in this pattern */
  accumulationDays?: number
}

export interface CrossRankedStock {
  symbol: string
  name?: string
  rankings: {
    value?: number
    volume?: number
    gainer?: number
    loser?: number
  }
  rankingCount: number
  strengthScore: number
}

export interface ConcentrationMetrics {
  top10ValueConcentration: number
  top5StockConcentration: number
  crossRankedCount: number
  hhi: number
  interpretation: 'Highly Concentrated' | 'Moderately Concentrated' | 'Broadly Distributed'
  totalValue?: number
}

export interface ActiveStocksCardData {
  topByValue: StockConcentration[]
  topByVolume: StockConcentration[]
  crossRanked: CrossRankedStock[]
  metrics: ConcentrationMetrics
  observations: string[]
  timestamp: number
}

export interface ActiveStocksCardProps {
  /** Additional CSS classes */
  className?: string
  /** Number of stocks to show */
  topCount?: number
}

// ==================================================================
// CONSTANTS
// ==================================================================

const COLORS = {
  up: '#2ED8A7',
  down: '#F45B69',
  warn: '#F7C948',
  neutral: '#AEB7B3',
}

const DEFAULT_TOP_COUNT = 10

// ==================================================================
// UTILITY FUNCTIONS
// ==================================================================

/**
 * Get badge color based on accumulation pattern
 */
function getAccumulationBadgeColor(pattern?: AccumulationPattern): 'buy' | 'sell' | 'neutral' | 'watch' {
  if (!pattern || pattern === 'Neutral') return 'neutral'

  if (pattern === 'Strong Accumulation' || pattern === 'Accumulation') {
    return pattern === 'Strong Accumulation' ? 'buy' : 'buy'
  }

  // Distribution patterns
  if (pattern === 'Strong Distribution' || pattern === 'Distribution') {
    return 'sell'
  }

  return 'neutral'
}

/**
 * Format accumulation pattern text
 */
function formatAccumulationTag(pattern?: AccumulationPattern, days?: number): string | null {
  if (!pattern) return null

  // Shorten pattern names for badge display
  const patternShort = pattern
    .replace('Strong Accumulation', 'Str Acc')
    .replace('Strong Distribution', 'Str Dist')
    .replace('Accumulation', 'Acc')
    .replace('Distribution', 'Dist')

  return days ? `${days}d ${patternShort}` : patternShort
}

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

interface ConcentrationBarProps {
  metrics: ConcentrationMetrics
}

function ConcentrationBar({ metrics }: ConcentrationBarProps) {
  // Determine interpretation color
  const getInterpretationColor = () => {
    switch (metrics.interpretation) {
      case 'Highly Concentrated':
        return COLORS.down
      case 'Moderately Concentrated':
        return COLORS.warn
      default:
        return COLORS.up
    }
  }

  const interpretationColor = getInterpretationColor()

  return (
    <div className="p-3 rounded-lg bg-surface-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" style={{ color: interpretationColor }} />
          <span className="text-[10px] uppercase tracking-wide text-text-muted">
            Market Concentration
          </span>
        </div>
        <Badge
          size="sm"
          color={
            metrics.interpretation === 'Highly Concentrated'
              ? 'sell'
              : metrics.interpretation === 'Moderately Concentrated'
                ? 'watch'
                : 'buy'
          }
        >
          {metrics.interpretation}
        </Badge>
      </div>

      {/* Top 5 Concentration Bar */}
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-text-muted uppercase">
              Top 5 Concentration
            </span>
            <span className="text-xs font-medium text-text">
              {metrics.top5StockConcentration.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, metrics.top5StockConcentration)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: interpretationColor }}
            />
          </div>
        </div>

        {/* HHI Indicator */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-text-muted uppercase">HHI Score</span>
          <span className="text-xs font-medium text-text">
            {metrics.hhi.toFixed(0)}
          </span>
        </div>

        {/* Cross-Ranked Count */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-text-muted uppercase">
            Cross-Ranked Stocks
          </span>
          <span className="text-xs font-medium text-text">
            {metrics.crossRankedCount}
          </span>
        </div>
      </div>
    </div>
  )
}

interface StockRowProps {
  stock: StockConcentration
  rank: number
}

function StockRow({ stock, rank }: StockRowProps) {
  const isPositive = stock.changePercent >= 0
  const valueColor = isPositive ? COLORS.up : COLORS.down

  // Get ranking badges
  const rankingBadges = []

  if (stock.rankings?.value) {
    rankingBadges.push(
      <Badge key="value" size="sm" color="neutral">
        #{stock.rankings.value} Val
      </Badge>
    )
  }
  if (stock.rankings?.volume) {
    rankingBadges.push(
      <Badge key="volume" size="sm" color="neutral">
        #{stock.rankings.volume} Vol
      </Badge>
    )
  }
  if (stock.rankings?.gainer) {
    rankingBadges.push(
      <Badge key="gainer" size="sm" color="buy">
        #{stock.rankings.gainer} Up
      </Badge>
    )
  }
  if (stock.rankings?.loser) {
    rankingBadges.push(
      <Badge key="loser" size="sm" color="sell">
        #{stock.rankings.loser} Dn
      </Badge>
    )
  }

  // Phase 2: Accumulation tag badge
  const accumulationTag = formatAccumulationTag(stock.accumulationPattern, stock.accumulationDays)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 p-2 rounded hover:bg-surface-2 transition-colors"
    >
      {/* Rank */}
      <span className="text-xs font-semibold w-6 text-text-muted">
        {rank}
      </span>

      {/* Symbol & Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text">{stock.symbol}</span>
          {stock.marketCapGroup && (
            <span
              className="text-[9px] px-1 rounded text-text-muted bg-surface-2"
            >
              {stock.marketCapGroup}
            </span>
          )}
          {/* Phase 2: Accumulation tag badge */}
          {accumulationTag && (
            <Badge size="sm" color={getAccumulationBadgeColor(stock.accumulationPattern)}>
              {accumulationTag}
            </Badge>
          )}
        </div>
        {stock.name && (
          <span className="text-[10px] text-text-muted truncate block">
            {stock.name}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="text-right">
        <div className="text-sm font-bold tabular-nums text-text">
          {formatTradingValue(stock.value)}
        </div>
        <div
          className="text-xs tabular-nums"
          style={{ color: valueColor }}
        >
          {isPositive && '+'}
          {formatPercentage(stock.changePercent)}
        </div>
      </div>

      {/* Ranking Badges (if any) */}
      {rankingBadges.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-end">
          {rankingBadges}
        </div>
      )}
    </motion.div>
  )
}

interface CrossRankedBadgeProps {
  stock: CrossRankedStock
}

function CrossRankedBadge({ stock }: CrossRankedBadgeProps) {
  return (
    <Badge
      size="sm"
      color={stock.strengthScore > 5 ? 'buy' : stock.strengthScore > 3 ? 'watch' : 'neutral'}
      className="flex items-center gap-1"
    >
      <Award className="w-3 h-3" />
      {stock.symbol}
      <span className="text-[9px]">({stock.rankingCount})</span>
    </Badge>
  )
}

// Loading Skeleton
function ActiveStocksSkeleton() {
  return (
    <Card padding="sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-2">Active Stocks</h3>
      </div>
      <div className="animate-pulse space-y-2">
        <div className="h-20 bg-surface-2 rounded" />
        <div className="h-12 bg-surface-2 rounded" />
        <div className="h-12 bg-surface-2 rounded" />
      </div>
    </Card>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function ActiveStocksCard({
  className,
  topCount = DEFAULT_TOP_COUNT,
}: ActiveStocksCardProps) {
  // Use Context-based hook for market intelligence data
  const { data: activeStocksData, isLoading, error } = useActiveStocks()

  if (isLoading) {
    return <ActiveStocksSkeleton />
  }

  if (error || !data?.success || !activeStocksData) {
    return (
      <Card padding="sm" className={className}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-2">Active Stocks</h3>
          </div>
        </div>
        <p className="text-text-muted text-xs">
          Unable to load active stocks data
        </p>
      </Card>
    )
  }

  return (
    <Card padding="sm" className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-2">Active Stocks</h3>
        </div>
        {activeStocksData.metrics.totalValue && (
          <span className="text-xs text-text-muted">
            Total: {formatTradingValue(activeStocksData.metrics.totalValue)}
          </span>
        )}
      </div>

      {/* Concentration Metrics */}
      <ConcentrationBar metrics={activeStocksData.metrics} />

      {/* Cross-Ranked Stocks Section */}
      {activeStocksData.crossRanked.length > 0 && (
        <div className="mt-3 p-2 rounded-lg bg-surface-2">
          <div className="flex items-center gap-1 mb-2">
            <Award className="w-3 h-3 text-warn" />
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              Cross-Ranked ({activeStocksData.crossRanked.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeStocksData.crossRanked.slice(0, 8).map((stock) => (
              <CrossRankedBadge key={stock.symbol} stock={stock} />
            ))}
          </div>
        </div>
      )}

      {/* Top Stocks by Value */}
      <div className="mt-3">
        <div className="flex items-center gap-1 mb-2">
          <TrendingUp className="w-3 h-3 text-up" />
          <span className="text-[10px] uppercase tracking-wide text-text-muted">
            Top {topCount} by Value
          </span>
        </div>
        <div className="space-y-1">
          {activeStocksData.topByValue.slice(0, topCount).map((stock, index) => (
            <StockRow key={stock.symbol} stock={stock} rank={index + 1} />
          ))}
        </div>
      </div>

      {/* Key Observations */}
      {activeStocksData.observations && activeStocksData.observations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3 h-3 text-warn flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted leading-relaxed">
              {activeStocksData.observations[0]}
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

export default ActiveStocksCard
