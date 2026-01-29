/**
 * TopRankings Component
 * Displays top gainers, losers, volume leaders, and value leaders
 * Based on: docs/design_rules.md
 * Enhanced with sector badges, market cap badges, and cross-ranking section
 *
 * Phase 4: Updated with compact design tokens
 * Phase 1.2: Added Relative Volume column to volume rankings with 🔥 indicator for 2x+ volume spikes
 */

'use client'

import { Card } from '@/components/shared'
import { TrendingUp, TrendingDown, Activity, Coins, Flame } from 'lucide-react'
import { formatPercentage, formatVolume, formatTradingValue, formatDecimal } from '@/lib/utils'
import Link from 'next/link'
import { memo } from 'react'

// ==================================================================
// TYPES
// ==================================================================

interface StockRankingData {
  symbol: string
  name?: string
  price?: number
  change?: number
  changePct?: number
  volume?: number
  value?: number
  sectorCode?: string
  marketCapGroup?: 'L' | 'M' | 'S'
  rankings?: {
    gainer?: number
    loser?: number
    volume?: number
    value?: number
  }
}

interface TopRankingsProps {
  data: {
    topGainers: StockRankingData[]
    topLosers: StockRankingData[]
    topVolume: StockRankingData[]
    topValue?: StockRankingData[]
    timestamp?: number
  }
  showTrends?: boolean
}

// ==================================================================
// CONSTANTS
// ==================================================================

/**
 * Mock 30-day average volume for relative volume calculation
 * This will be replaced with actual historical data in Phase 2
 */
const MOCK_STOCK_AVERAGE_VOLUME = 1000 // In millions (THB 1B)

/**
 * Calculate relative volume for a stock
 * Formula: stockVolume / stockAverage
 * @param stockVolume - Current stock volume in millions
 * @returns Relative volume ratio (rounded to 1 decimal place)
 */
function calculateRelativeVolume(stockVolume: number = 0): number {
  if (stockVolume <= 0) return 0
  if (MOCK_STOCK_AVERAGE_VOLUME <= 0) return 1

  const relativeVolume = stockVolume / MOCK_STOCK_AVERAGE_VOLUME
  return Math.round(relativeVolume * 10) / 10 // Round to 1 decimal place
}

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

interface SectorBadgeProps {
  code?: string
}

function SectorBadge({ code }: SectorBadgeProps) {
  if (!code) {
    return (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-bg-surface-2 text-text-disabled">
        N/A
      </span>
    )
  }

  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-bg-surface-2 text-text-secondary">
      {code}
    </span>
  )
}

interface MarketCapBadgeProps {
  group?: 'L' | 'M' | 'S'
}

function MarketCapBadge({ group }: MarketCapBadgeProps) {
  if (!group) {
    return (
      <span className="text-[10px] font-medium w-4 h-4 flex items-center justify-center rounded-full bg-bg-surface-2 text-text-disabled">
        -
      </span>
    )
  }

  const groupColors: Record<'L' | 'M' | 'S', { bg: string; text: string }> = {
    L: { bg: '#3b82f6', text: '#DBEAFE' }, // accent-blue
    M: { bg: '#4ade80', text: '#0a0e17' }, // up-primary
    S: { bg: '#f59e0b', text: '#0a0e17' }, // insight
  }

  const style = groupColors[group]

  return (
    <span
      className="text-[10px] font-medium w-4 h-4 flex items-center justify-center rounded-full"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {group}
    </span>
  )
}

interface TradingValueDisplayProps {
  volume?: number
  value?: number
}

function TradingValueDisplay({ volume, value }: TradingValueDisplayProps) {
  if (!volume && !value) return null

  return (
    <div className="flex flex-col items-end gap-0.5">
      {volume && (
        <span className="text-[10px] text-text-tertiary tabular-nums">
          {formatVolume(volume)} vol
        </span>
      )}
      {value && (
        <span className="text-[10px] font-medium text-text-primary tabular-nums">
          {formatTradingValue(value)}
        </span>
      )}
    </div>
  )
}

/**
 * Relative Volume Display Component
 * Shows relative volume ratio with 🔥 indicator for 2x+ volume spikes
 * Pattern based on VolumeAnalysisModule VolumeLeaderRow
 */
interface RelativeVolumeDisplayProps {
  volume?: number
}

function RelativeVolumeDisplay({ volume = 0 }: RelativeVolumeDisplayProps) {
  const relativeVolume = calculateRelativeVolume(volume)
  const isUnusual = relativeVolume >= 2

  // Color based on relative volume
  const getColor = () => {
    if (relativeVolume >= 2) return '#4ade80' // up-primary (green) for high volume
    if (relativeVolume >= 1) return '#3b82f6' // accent-blue for normal
    return '#9ca3af' // neutral for below average
  }

  const color = getColor()

  return (
    <div className="flex items-center gap-1">
      {isUnusual && <Flame className="w-3 h-3" style={{ color: '#f97316' }} />}
      <span className="text-xs font-medium tabular-nums" style={{ color }}>
        {formatDecimal(relativeVolume, 1)}x
      </span>
    </div>
  )
}

interface RankingListProps {
  title: string
  icon: React.ReactNode
  stocks: StockRankingData[]
  type: 'gainer' | 'loser' | 'volume' | 'value'
}

function RankingList({ title, icon, stocks, type }: RankingListProps) {
  const getValueStyle = () => {
    switch (type) {
      case 'gainer':
        return { color: '#4ade80' } // up-primary (green)
      case 'loser':
        return { color: '#ff6b6b' } // down-primary (soft red)
      case 'volume':
        return { color: '#3b82f6' } // accent-blue
      case 'value':
        return { color: '#f59e0b' } // insight (gold)
      default:
        return { color: '#9ca3af' } // neutral
    }
  }

  const valueStyle = getValueStyle()

  const isEnhancedStock = (stock: StockRankingData): boolean => {
    return !!(stock.sectorCode || stock.marketCapGroup || stock.value !== undefined)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="font-semibold text-xs text-text-secondary">
          {title}
        </h4>
      </div>

      <ul className="space-y-1">
        {stocks.slice(0, 5).map((stock, index) => {
          const symbol = stock.symbol
          const isEnhanced = isEnhancedStock(stock)

          return (
            <li key={symbol}>
              <Link
                href={`/stock/${symbol}`}
                className="block p-2 rounded transition-colors hover:bg-bg-surface-2"
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Left side: Rank, Symbol, Badges */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-medium w-3 flex-shrink-0 text-text-tertiary tabular-nums">
                      {index + 1}
                    </span>
                    <span className="font-medium text-xs text-text-primary">
                      {symbol}
                    </span>
                    {isEnhanced && (
                      <>
                        <SectorBadge code={stock.sectorCode} />
                        <MarketCapBadge group={stock.marketCapGroup} />
                      </>
                    )}
                  </div>

                  {/* Right side: Value display */}
                  <div className="flex-shrink-0">
                    {type === 'volume' && isEnhanced ? (
                      <div className="flex items-center gap-2">
                        <RelativeVolumeDisplay volume={stock.volume} />
                        <TradingValueDisplay
                          volume={stock.volume}
                          value={stock.value}
                        />
                      </div>
                    ) : type === 'value' && isEnhanced ? (
                      <span className="text-xs font-medium tabular-nums" style={valueStyle}>
                        {stock.value ? formatTradingValue(stock.value) : 'N/A'}
                      </span>
                    ) : type === 'volume' && !isEnhanced ? (
                      <div className="flex items-center gap-2">
                        <RelativeVolumeDisplay volume={stock.volume} />
                        <span className="text-xs font-medium text-text-secondary tabular-nums">
                          {formatVolume(stock.volume || 0)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium tabular-nums" style={valueStyle}>
                        {stock.change !== undefined ? formatPercentage(stock.change) : 'N/A'}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ==================================================================
// CROSS-RANKING SECTION
// ==================================================================

interface CrossRankingSectionProps {
  stocks: StockRankingData[]
}

function CrossRankingSection({ stocks }: CrossRankingSectionProps) {
  // Find stocks that appear in 2+ ranking categories
  const crossRankedStocks = stocks.filter((stock) => {
    if (!stock.rankings) return false
    const rankCount = Object.values(stock.rankings).filter((v) => v !== undefined).length
    return rankCount >= 2
  })

  if (crossRankedStocks.length === 0) return null

  return (
    <div className="mt-4 pt-3 border-t border-border-subtle">
      <div className="flex items-center gap-2 mb-2">
        <Flame className="w-3 h-3 text-warning" />
        <h4 className="font-semibold text-xs text-text-primary">
          🔥 CROSS-RANKING (in 2+ categories)
        </h4>
      </div>

      <div className="space-y-1">
        {crossRankedStocks.slice(0, 5).map((stock) => {
          const { rankings, changePct, sectorCode, marketCapGroup } = stock

          if (!rankings) return null

          // Generate ranking badges
          const rankingBadges: React.ReactNode[] = []

          if (rankings.gainer) {
            rankingBadges.push(
              <span
                key="gainer"
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-up-soft text-up-primary"
              >
                Gainer#{rankings.gainer}
              </span>
            )
          }

          if (rankings.loser) {
            rankingBadges.push(
              <span
                key="loser"
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-down-soft text-down-primary"
              >
                Loser#{rankings.loser}
              </span>
            )
          }

          if (rankings.volume) {
            rankingBadges.push(
              <span
                key="volume"
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent-blue/20 text-accent-blue"
              >
                Volume#{rankings.volume}
              </span>
            )
          }

          if (rankings.value) {
            rankingBadges.push(
              <span
                key="value"
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-insight/20 text-insight"
              >
                Value#{rankings.value}
              </span>
            )
          }

          const changeColor =
            changePct && changePct > 0 ? '#4ade80' : changePct && changePct < 0 ? '#ff6b6b' : '#9ca3af'

          return (
            <Link
              key={stock.symbol}
              href={`/stock/${stock.symbol}`}
              className="flex items-center gap-2 p-2 rounded transition-colors hover:bg-bg-surface-2"
            >
              <span className="font-semibold text-xs text-text-primary" style={{ minWidth: '40px' }}>
                {stock.symbol}
              </span>
              <div className="flex items-center gap-1 flex-wrap">{rankingBadges}</div>
              <div className="flex items-center gap-2 ml-auto">
                {changePct !== undefined && (
                  <span className="text-xs font-medium tabular-nums" style={{ color: changeColor }}>
                    {formatPercentage(changePct)}
                  </span>
                )}
                <SectorBadge code={sectorCode} />
                <MarketCapBadge group={marketCapGroup} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function TopRankings({ data, showTrends = false }: TopRankingsProps) {
  // Create a map of unique stocks with their rankings
  const stockMap = new Map<string, StockRankingData>()

  // Process gainers
  data.topGainers.forEach((stock, index) => {
    const existing = stockMap.get(stock.symbol)
    stockMap.set(stock.symbol, {
      ...existing,
      ...stock,
      rankings: { ...existing?.rankings, gainer: index + 1 },
    })
  })

  // Process losers
  data.topLosers.forEach((stock, index) => {
    const existing = stockMap.get(stock.symbol)
    stockMap.set(stock.symbol, {
      ...existing,
      ...stock,
      rankings: { ...existing?.rankings, loser: index + 1 },
    })
  })

  // Process volume
  data.topVolume.forEach((stock, index) => {
    const existing = stockMap.get(stock.symbol)
    stockMap.set(stock.symbol, {
      ...existing,
      ...stock,
      rankings: { ...existing?.rankings, volume: index + 1 },
    })
  })

  // Process value
  if (data.topValue) {
    data.topValue.forEach((stock, index) => {
      const existing = stockMap.get(stock.symbol)
      stockMap.set(stock.symbol, {
        ...existing,
        ...stock,
        rankings: { ...existing?.rankings, value: index + 1 },
      })
    })
  }

  const uniqueStocks = Array.from(stockMap.values())

  // Check if we have enhanced data (with topValue or enhanced fields)
  const hasEnhancedData =
    (data.topValue && data.topValue.length > 0) ||
    data.topGainers.some(
      (s) => 'sectorCode' in s || 'marketCapGroup' in s || 'value' in s || 'rankings' in s
    )

  // Grid classes based on whether we show 4 columns or 3
  const gridClasses = hasEnhancedData
    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-card-gap-mobile xl:gap-card-gap-desktop'
    : 'grid grid-cols-1 md:grid-cols-3 gap-card-gap-mobile md:gap-card-gap-desktop'

  return (
    <Card variant="compact" padding="md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Top Rankings
        </h3>
        {data.timestamp && (
          <span className="text-[10px] text-text-tertiary">
            Updated: {new Date(data.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div className={gridClasses}>
        {/* Top Gainers */}
        <RankingList
          title="Top Gainers"
          icon={<TrendingUp className="w-4 h-4 text-up-primary" />}
          stocks={data.topGainers}
          type="gainer"
        />

        {/* Top Losers */}
        <RankingList
          title="Top Losers"
          icon={<TrendingDown className="w-4 h-4 text-down-primary" />}
          stocks={data.topLosers}
          type="loser"
        />

        {/* Top Volume */}
        <RankingList
          title="Top Volume"
          icon={<Activity className="w-4 h-4 text-accent-blue" />}
          stocks={data.topVolume}
          type="volume"
        />

        {/* Top Value - only show if data exists */}
        {hasEnhancedData && data.topValue && (
          <RankingList
            title="Top Value"
            icon={<Coins className="w-4 h-4 text-insight" />}
            stocks={data.topValue}
            type="value"
          />
        )}
      </div>

      {/* Cross-Ranking Section - only show with enhanced data */}
      {showTrends && hasEnhancedData && <CrossRankingSection stocks={uniqueStocks} />}
    </Card>
  )
}

export default memo(TopRankings)
