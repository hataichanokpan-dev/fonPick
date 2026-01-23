/**
 * TopRankings Component
 * Displays top gainers, losers, volume leaders, and value leaders - Dark Theme
 * Enhanced with sector badges, market cap badges, and cross-ranking section
 */

'use client'

import { Card } from '@/components/shared'
import { TrendingUp, TrendingDown, Activity, Coins, Flame } from 'lucide-react'
import { formatPercent, formatVolume, formatTradingValue } from '@/lib/utils'
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
// HELPER COMPONENTS
// ==================================================================

interface SectorBadgeProps {
  code?: string
}

function SectorBadge({ code }: SectorBadgeProps) {
  if (!code) {
    return (
      <span
        className="text-xs font-medium px-1.5 py-0.5 rounded"
        style={{ backgroundColor: '#374151', color: '#6B7280' }}
      >
        N/A
      </span>
    )
  }

  return (
    <span
      className="text-xs font-medium px-1.5 py-0.5 rounded"
      style={{ backgroundColor: '#374151', color: '#9CA3AF' }}
    >
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
      <span
        className="text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full"
        style={{ backgroundColor: '#374151', color: '#6B7280' }}
      >
        -
      </span>
    )
  }

  const groupColors: Record<'L' | 'M' | 'S', { bg: string; text: string }> = {
    L: { bg: '#1E40AF', text: '#DBEAFE' }, // Blue
    M: { bg: '#065F46', text: '#A7F3D0' }, // Green
    S: { bg: '#92400E', text: '#FDE68A' }, // Amber
  }

  const style = groupColors[group]

  return (
    <span
      className="text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full"
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
        <span className="text-xs" style={{ color: '#9CA3AF' }}>
          {formatVolume(volume)} vol
        </span>
      )}
      {value && (
        <span className="text-xs font-medium" style={{ color: '#E5E7EB' }}>
          {formatTradingValue(value)}
        </span>
      )}
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
        return { color: '#22C55E' }
      case 'loser':
        return { color: '#EF4444' }
      case 'volume':
        return { color: '#3B82F6' }
      case 'value':
        return { color: '#F59E0B' }
      default:
        return { color: '#9CA3AF' }
    }
  }

  const valueStyle = getValueStyle()

  const isEnhancedStock = (stock: StockRankingData): boolean => {
    return !!(stock.sectorCode || stock.marketCapGroup || stock.value !== undefined)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="font-semibold text-sm" style={{ color: '#9CA3AF' }}>
          {title}
        </h4>
      </div>

      <ul className="space-y-1.5">
        {stocks.slice(0, 5).map((stock, index) => {
          const symbol = stock.symbol
          const isEnhanced = isEnhancedStock(stock)

          return (
            <li key={symbol}>
              <Link
                href={`/stock/${symbol}`}
                className="block p-2 rounded transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1F2937')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Left side: Rank, Symbol, Badges */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-xs font-medium w-4 flex-shrink-0"
                      style={{ color: '#6B7280' }}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium text-sm" style={{ color: '#E5E7EB' }}>
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
                      <TradingValueDisplay
                        volume={stock.volume}
                        value={stock.value}
                      />
                    ) : type === 'value' && isEnhanced ? (
                      <span className="text-sm font-medium" style={valueStyle}>
                        {stock.value ? formatTradingValue(stock.value) : 'N/A'}
                      </span>
                    ) : type === 'volume' && !isEnhanced ? (
                      <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
                        {formatVolume(stock.volume || 0)}
                      </span>
                    ) : (
                      <span className="text-sm font-medium" style={valueStyle}>
                        {stock.change !== undefined ? formatPercent(stock.change) : 'N/A'}
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
    <div className="mt-6 pt-4" style={{ borderTop: '1px solid #273449' }}>
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4" style={{ color: '#F59E0B' }} />
        <h4 className="font-semibold text-sm" style={{ color: '#E5E7EB' }}>
          🔥 CROSS-RANKING (in 2+ categories)
        </h4>
      </div>

      <div className="space-y-2">
        {crossRankedStocks.slice(0, 5).map((stock) => {
          const { rankings, changePct, sectorCode, marketCapGroup } = stock

          if (!rankings) return null

          // Generate ranking badges
          const rankingBadges: React.ReactNode[] = []

          if (rankings.gainer) {
            rankingBadges.push(
              <span
                key="gainer"
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22C55E' }}
              >
                Gainer#{rankings.gainer}
              </span>
            )
          }

          if (rankings.loser) {
            rankingBadges.push(
              <span
                key="loser"
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' }}
              >
                Loser#{rankings.loser}
              </span>
            )
          }

          if (rankings.volume) {
            rankingBadges.push(
              <span
                key="volume"
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}
              >
                Volume#{rankings.volume}
              </span>
            )
          }

          if (rankings.value) {
            rankingBadges.push(
              <span
                key="value"
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}
              >
                Value#{rankings.value}
              </span>
            )
          }

          const changeColor =
            changePct && changePct > 0 ? '#22C55E' : changePct && changePct < 0 ? '#EF4444' : '#9CA3AF'

          return (
            <Link
              key={stock.symbol}
              href={`/stock/${stock.symbol}`}
              className="flex items-center gap-2 p-2 rounded transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1F2937')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span className="font-semibold text-sm" style={{ color: '#E5E7EB', minWidth: '48px' }}>
                {stock.symbol}
              </span>
              <div className="flex items-center gap-1 flex-wrap">{rankingBadges}</div>
              <div className="flex items-center gap-2 ml-auto">
                {changePct !== undefined && (
                  <span className="text-sm font-medium" style={{ color: changeColor }}>
                    {formatPercent(changePct)}
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
    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'
    : 'grid grid-cols-1 md:grid-cols-3 gap-6'

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#E5E7EB' }}>
          Top Rankings
        </h3>
        {data.timestamp && (
          <span className="text-xs" style={{ color: '#6B7280' }}>
            Updated: {new Date(data.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div className={gridClasses}>
        {/* Top Gainers */}
        <RankingList
          title="Top Gainers"
          icon={<TrendingUp className="w-5 h-5" style={{ color: '#22C55E' }} />}
          stocks={data.topGainers}
          type="gainer"
        />

        {/* Top Losers */}
        <RankingList
          title="Top Losers"
          icon={<TrendingDown className="w-5 h-5" style={{ color: '#EF4444' }} />}
          stocks={data.topLosers}
          type="loser"
        />

        {/* Top Volume */}
        <RankingList
          title="Top Volume"
          icon={<Activity className="w-5 h-5" style={{ color: '#3B82F6' }} />}
          stocks={data.topVolume}
          type="volume"
        />

        {/* Top Value - only show if data exists */}
        {hasEnhancedData && data.topValue && (
          <RankingList
            title="Top Value"
            icon={<Coins className="w-5 h-5" style={{ color: '#F59E0B' }} />}
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
