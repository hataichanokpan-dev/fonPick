/**
 * StockHero Component
 *
 * Displays comprehensive stock information in a hero section including:
 * - Stock name and symbol
 * - Current price with change
 * - Volume information with ratio
 * - Market cap
 * - Sector and market
 * - 52-week range (if available)
 * - Last update timestamp (Thai timezone)
 *
 * Features:
 * - Color coding: Green for positive change, Red for negative, Gray for neutral
 * - Responsive design (mobile first)
 * - Animated price change flash
 * - Accessibility (ARIA labels, semantic HTML)
 * - Thai timezone support for timestamps
 * - Proper number formatting (large numbers, decimals)
 *
 * Based on: docs/design_rules.md
 */

'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Building2, Activity } from 'lucide-react'
import { cn, safeToFixed } from '@/lib/utils'
import { format } from 'date-fns'
import type { StockOverviewData } from '@/types/stock-api'

export interface StockHeroProps {
  /** Stock overview data from API */
  data: StockOverviewData
  /** Additional CSS classes to apply */
  className?: string
}

/**
 * Format large numbers with suffixes (K, M, B)
 * Uses safeToFixed to prevent null toFixed errors
 */
function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${safeToFixed(num / 1_000_000_000)}B`
  }
  if (num >= 1_000_000) {
    return `${safeToFixed(num / 1_000_000)}M`
  }
  if (num >= 1_000) {
    return `${safeToFixed(num / 1_000)}K`
  }
  return safeToFixed(num)
}

/**
 * Format volume with suffix
 */
function formatVolume(volume: number): string {
  return formatLargeNumber(volume)
}

/**
 * Get color classes based on price change
 */
function getPriceChangeColor(change: number) {
  if (change > 0) {
    return {
      text: 'text-up-primary',
      bg: 'bg-up-soft',
      icon: <TrendingUp className="w-4 h-4" />,
    }
  }
  if (change < 0) {
    return {
      text: 'text-down-primary',
      bg: 'bg-down-soft',
      icon: <TrendingDown className="w-4 h-4" />,
    }
  }
  return {
    text: 'text-neutral',
    bg: 'bg-neutral/20',
    icon: <Minus className="w-4 h-4" />,
  }
}

/**
 * Format timestamp in Thai timezone (UTC+7)
 */
function formatThaiTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    // Convert to Thai timezone (UTC+7)
    const thaiTime = new Date(date.getTime() + (7 * 60 * 60 * 1000))
    return format(thaiTime, 'HH:mm')
  } catch {
    return '--:--'
  }
}

/**
 * Get safe value or fallback
 */
function getSafeValue<T>(value: T, fallback: T): T {
  return value !== undefined && value !== null && value !== '' ? value : fallback
}

/**
 * StockHero - Comprehensive stock information display
 *
 * @example
 * ```tsx
 * <StockHero data={stockOverviewData} />
 * ```
 */
export function StockHero({ data, className }: StockHeroProps) {
  const priceColor = getPriceChangeColor(data.price.change)

  // Safe values with fallbacks
  const safeName = getSafeValue(data.name, 'N/A')
  const safeSymbol = getSafeValue(data.symbol, 'N/A')
  const safeSector = getSafeValue(data.sector, 'N/A')
  const safeMarket = getSafeValue(data.market, 'N/A')

  // Safe numeric values using safeToFixed
  const currentPrice = safeToFixed(data.price.current)
  const priceChange = safeToFixed(data.price.change)
  const priceChangePercent = safeToFixed(data.price.changePercent)
  const dayLow = safeToFixed(data.price.dayLow)
  const dayHigh = safeToFixed(data.price.dayHigh)
  const volumeRatio = safeToFixed(data.volume.ratio)
  const peRatio = safeToFixed(data.peRatio)
  const dividendYield = safeToFixed(data.dividendYield)

  // 52-week values (if available)
  const week52Low = 'week52Low' in data ? safeToFixed((data as any).week52Low) : null
  const week52High = 'week52High' in data ? safeToFixed((data as any).week52High) : null

  // ==================================================================
  // RENDER
  // ==================================================================

  return (
    <motion.div
      data-testid="stock-hero"
      className={cn(
        'w-full rounded-lg bg-surface border border-border/50',
        'p-4 md:p-6',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header: Name and Symbol */}
      <div className="mb-4">
        <h1
          data-testid="stock-name"
          className="text-xl md:text-2xl font-bold text-text-primary mb-1"
          aria-label={`Stock name: ${safeName}`}
        >
          {safeName}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            data-testid="stock-symbol"
            className="inline-flex items-center px-2 py-1 rounded-md bg-surface-2 text-text-primary font-mono font-semibold"
          >
            {safeSymbol}
          </span>
          <span
            data-testid="stock-sector"
            className="text-sm text-text-2 flex items-center gap-1"
            aria-label={`Sector: ${safeSector}`}
          >
            <Building2 className="w-3 h-3" />
            {safeSector}
          </span>
          <span
            data-testid="stock-market"
            className="text-sm text-text-2"
            aria-label={`Market: ${safeMarket}`}
          >
            • {safeMarket}
          </span>
        </div>
      </div>

      {/* Price Section */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          {/* Current Price */}
          <motion.span
            data-testid="current-price"
            className={cn(
              'text-3xl md:text-4xl font-bold font-mono tabular-nums',
              priceColor.text
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            role="status"
            aria-label={`Current price: ${currentPrice}`}
          >
            {currentPrice}
          </motion.span>

          {/* Price Change */}
          <motion.div
            data-testid="price-change-container"
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-md',
              priceColor.bg,
              priceColor.text
            )}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {priceColor.icon}
            <span
              data-testid="price-change"
              className="font-semibold tabular-nums"
            >
              {data.price.change > 0 ? '+' : ''}
              {priceChange}
            </span>
            <span
              data-testid="price-change-percent"
              className="text-xs tabular-nums"
            >
              ({data.price.changePercent > 0 ? '+' : ''}
              {priceChangePercent}%)
            </span>
          </motion.div>
        </div>

        {/* Day Range */}
        <div className="text-xs text-text-2 mt-1">
          Day Range:{' '}
          <span className="font-mono tabular-nums">
            {dayLow} - {dayHigh}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Volume */}
        <div className="space-y-1">
          <div className="text-xs text-text-2">Volume</div>
          <div
            data-testid="volume-current"
            className="text-base md:text-lg font-semibold font-mono tabular-nums text-text-primary"
            aria-label={`Volume: ${formatVolume(data.volume.current)}`}
          >
            {formatVolume(data.volume.current)}
          </div>
          <div
            data-testid="volume-ratio"
            className={cn(
              'text-xs flex items-center gap-1',
              data.volume.ratio > 1 ? 'text-up-primary' : 'text-text-2'
            )}
          >
            <Activity className="w-3 h-3" />
            {volumeRatio}x avg
          </div>
        </div>

        {/* Market Cap */}
        <div className="space-y-1">
          <div className="text-xs text-text-2">Market Cap</div>
          <div
            data-testid="market-cap"
            className="text-base md:text-lg font-semibold font-mono tabular-nums text-text-primary"
            aria-label={`Market cap: ${data.marketCap}`}
          >
            {data.marketCap}
          </div>
          <div className="text-xs text-text-2">THB</div>
        </div>

        {/* P/E Ratio */}
        <div className="space-y-1">
          <div className="text-xs text-text-2">P/E Ratio</div>
          <div
            data-testid="pe-ratio"
            className="text-base md:text-lg font-semibold font-mono tabular-nums text-text-primary"
            aria-label={`P/E ratio: ${peRatio}`}
          >
            {peRatio}
          </div>
          <div className="text-xs text-text-2">TTM</div>
        </div>

        {/* Dividend Yield */}
        <div className="space-y-1">
          <div className="text-xs text-text-2">Div Yield</div>
          <div
            data-testid="dividend-yield"
            className="text-base md:text-lg font-semibold font-mono tabular-nums text-text-primary"
            aria-label={`Dividend yield: ${dividendYield}%`}
          >
            {dividendYield}%
          </div>
          <div className="text-xs text-text-2">Annual</div>
        </div>
      </div>

      {/* 52-Week Range (if available) */}
      {week52Low && week52High && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="text-xs text-text-2 mb-1">52-Week Range</div>
          <div
            data-testid="week-52-range"
            className="text-sm font-mono tabular-nums text-text-primary"
            aria-label={`52-week range: ${week52Low} - ${week52High}`}
          >
            {week52Low} - {week52High}
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
        <div className="text-xs text-text-2">
          Last updated:{' '}
          <span
            data-testid="last-update"
            className="font-mono tabular-nums"
            aria-label={`Last updated at ${formatThaiTimestamp(data.lastUpdate)} Thai time`}
          >
            {formatThaiTimestamp(data.lastUpdate)} (TH)
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Default export for convenience
 */
export default StockHero
