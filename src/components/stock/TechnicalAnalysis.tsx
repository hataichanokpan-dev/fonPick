/**
 * TechnicalAnalysis Component
 *
 * Displays technical analysis metrics and performance data
 *
 * Sections:
 * - Price Performance (ผลการดำเนินงาน):
 *   1D, 1W, 1M, 3M, 6M, YTD, 1Y returns
 *
 * - Trading Statistics (สถิติการซื้อขาย):
 *   Average Volume (1M, 3M, 1Y), Turnover, Volatility (Beta)
 *
 * - Price Range (ช่วงราคา):
 *   52-week high/low, Current price position
 *
 * Features:
 * - Bar chart for performance visualization
 * - Color coding (green for positive, red for negative)
 * - Range slider visualization
 * - Collapsible sections
 * - Thai labels with English subtitles
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StockStatisticsData } from '@/types/stock-api'

export interface TechnicalAnalysisProps {
  /** Stock statistics data */
  data: StockStatisticsData
  /** 52-week high price (optional) */
  week52High?: number
  /** 52-week low price (optional) */
  week52Low?: number
  /** Current price for range visualization (optional) */
  currentPrice?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * Format percentage with sign
 */
function formatPercentage(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

/**
 * Get color class based on performance value
 */
function getPerformanceColor(value: number): string {
  if (value > 0) return 'text-green-500'
  if (value < 0) return 'text-red-500'
  return 'text-gray-500'
}

/**
 * Get background bar color based on performance value
 */
function getBarColor(value: number): string {
  if (value > 0) return 'bg-green-500'
  if (value < 0) return 'bg-red-500'
  return 'bg-gray-500'
}

/**
 * Calculate percentage position in range
 */
function calculateRangePosition(
  current: number,
  high: number,
  low: number
): number {
  if (high === low) return 50
  return ((current - low) / (high - low)) * 100
}

/**
 * TechnicalAnalysis Component
 *
 * @example
 * ```tsx
 * <TechnicalAnalysis data={stockStatisticsData} />
 *
 * <TechnicalAnalysis
 *   data={stockStatisticsData}
 *   week52High={40.0}
 *   week52Low={30.0}
 *   currentPrice={35.0}
 * />
 * ```
 */
export function TechnicalAnalysis({
  data,
  week52High,
  week52Low,
  currentPrice,
  className,
}: TechnicalAnalysisProps) {
  const [performanceCollapsed, setPerformanceCollapsed] = useState(false)
  const [tradingCollapsed, setTradingCollapsed] = useState(false)
  const [rangeCollapsed, setRangeCollapsed] = useState(false)

  const { performance, trading } = data

  // Calculate max performance for bar chart scaling
  const maxPerf = Math.max(
    ...Object.values(performance).map(Math.abs),
    10 // Minimum 10% for scaling
  )

  // ==================================================================
  // RENDER
  // ==================================================================

  return (
    <div data-testid="technical-analysis" className={cn('space-y-4', className)}>
      {/* Price Performance Section */}
      <motion.div
        className="w-full rounded-lg bg-surface border border-border/50 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <button
          data-testid="price-performance-header"
          type="button"
          className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setPerformanceCollapsed(!performanceCollapsed)}
          aria-expanded={!performanceCollapsed}
          aria-label="Toggle Price Performance section"
        >
          <div>
            <h3
              data-testid="price-performance-thai-label"
              className="text-lg font-semibold text-text-primary"
            >
              ผลการดำเนินงาน
            </h3>
            <p
              data-testid="price-performance-english-label"
              className="text-sm text-text-2"
            >
              Price Performance
            </p>
          </div>

          <motion.div
            animate={{ rotate: performanceCollapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-text-2"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {!performanceCollapsed && (
            <motion.div
              data-testid="price-performance-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border/50"
            >
              <div className="p-4">
                {/* Bar Chart */}
                <div data-testid="performance-bar-chart" className="mb-4">
                  <div className="flex items-end gap-2 h-24">
                    <PerformanceBar
                      label="1D"
                      value={performance.w1d}
                      max={maxPerf}
                      testId="performance-bar-w1d"
                    />
                    <PerformanceBar
                      label="1W"
                      value={performance.w1m}
                      max={maxPerf}
                      testId="performance-bar-w1m"
                    />
                    <PerformanceBar
                      label="1M"
                      value={performance.w3m}
                      max={maxPerf}
                      testId="performance-bar-w3m"
                    />
                    <PerformanceBar
                      label="3M"
                      value={performance.w6m}
                      max={maxPerf}
                      testId="performance-bar-w6m"
                    />
                    <PerformanceBar
                      label="6M"
                      value={performance.ytd}
                      max={maxPerf}
                      testId="performance-bar-ytd"
                    />
                    <PerformanceBar
                      label="1Y"
                      value={performance.y1}
                      max={maxPerf}
                      testId="performance-bar-y1"
                    />
                  </div>
                </div>

                {/* Performance Values Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <PerformanceCard
                    label="1 Day"
                    thaiLabel="1 วัน"
                    value={performance.w1d}
                    testId="performance-w1d"
                  />
                  <PerformanceCard
                    label="1 Week"
                    thaiLabel="1 สัปดาห์"
                    value={performance.w1m}
                    testId="performance-w1m"
                  />
                  <PerformanceCard
                    label="1 Month"
                    thaiLabel="1 เดือน"
                    value={performance.w3m}
                    testId="performance-w3m"
                  />
                  <PerformanceCard
                    label="3 Month"
                    thaiLabel="3 เดือน"
                    value={performance.w6m}
                    testId="performance-w6m"
                  />
                  <PerformanceCard
                    label="6 Month"
                    thaiLabel="6 เดือน"
                    value={performance.ytd}
                    testId="performance-ytd"
                  />
                  <PerformanceCard
                    label="1 Year"
                    thaiLabel="1 ปี"
                    value={performance.y1}
                    testId="performance-y1"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Trading Statistics Section */}
      <motion.div
        data-testid="trading-statistics-section"
        className="w-full rounded-lg bg-surface border border-border/50 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Header */}
        <button
          data-testid="trading-statistics-header"
          type="button"
          className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setTradingCollapsed(!tradingCollapsed)}
          aria-expanded={!tradingCollapsed}
          aria-label="Toggle Trading Statistics section"
        >
          <div>
            <h3
              data-testid="trading-statistics-thai-label"
              className="text-lg font-semibold text-text-primary"
            >
              สถิติการซื้อขาย
            </h3>
            <p
              data-testid="trading-statistics-english-label"
              className="text-sm text-text-2"
            >
              Trading Statistics
            </p>
          </div>

          <motion.div
            animate={{ rotate: tradingCollapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-text-2"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {!tradingCollapsed && (
            <motion.div
              data-testid="trading-statistics-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border/50"
            >
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Average Volume 1M */}
                  <div className="p-3 rounded-lg bg-surface-2 border border-border/30">
                    <div className="text-xs text-text-2 mb-1">Avg Volume (1M)</div>
                    <div
                      data-testid="trading-avg-volume-1m"
                      className="text-lg font-semibold font-mono tabular-nums text-text-primary"
                    >
                      {formatLargeNumber(trading.avgVolume1m)}
                    </div>
                  </div>

                  {/* Average Volume 3M */}
                  <div className="p-3 rounded-lg bg-surface-2 border border-border/30">
                    <div className="text-xs text-text-2 mb-1">Avg Volume (3M)</div>
                    <div
                      data-testid="trading-avg-volume-3m"
                      className="text-lg font-semibold font-mono tabular-nums text-text-primary"
                    >
                      {formatLargeNumber(trading.avgVolume3m)}
                    </div>
                  </div>

                  {/* Average Volume 1Y */}
                  <div className="p-3 rounded-lg bg-surface-2 border border-border/30">
                    <div className="text-xs text-text-2 mb-1">Avg Volume (1Y)</div>
                    <div
                      data-testid="trading-avg-volume-1y"
                      className="text-lg font-semibold font-mono tabular-nums text-text-primary"
                    >
                      {formatLargeNumber(trading.avgVolume1y)}
                    </div>
                  </div>

                  {/* Turnover */}
                  <div className="p-3 rounded-lg bg-surface-2 border border-border/30">
                    <div className="text-xs text-text-2 mb-1">Turnover</div>
                    <div
                      data-testid="trading-turnover"
                      className="text-lg font-semibold font-mono tabular-nums text-text-primary"
                    >
                      {formatLargeNumber(trading.turnover)}
                    </div>
                  </div>

                  {/* Volatility (Beta) */}
                  <div className="p-3 rounded-lg bg-surface-2 border border-border/30">
                    <div className="text-xs text-text-2 mb-1">Beta (Volatility)</div>
                    <div
                      data-testid="trading-volatility"
                      className={cn(
                        'text-lg font-semibold font-mono tabular-nums',
                        trading.volatility > 1 ? 'text-red-500' : 'text-green-500'
                      )}
                    >
                      {trading.volatility.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Price Range Section (if data available) */}
      {week52High && week52Low && (
        <motion.div
          data-testid="price-range-section"
          className="w-full rounded-lg bg-surface border border-border/50 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {/* Header */}
          <button
            data-testid="price-range-header"
            type="button"
            className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setRangeCollapsed(!rangeCollapsed)}
            aria-expanded={!rangeCollapsed}
            aria-label="Toggle Price Range section"
          >
            <div>
              <h3
                data-testid="price-range-thai-label"
                className="text-lg font-semibold text-text-primary"
              >
                ช่วงราคา
              </h3>
              <p
                data-testid="price-range-english-label"
                className="text-sm text-text-2"
              >
                Price Range (52-Week)
              </p>
            </div>

            <motion.div
              animate={{ rotate: rangeCollapsed ? -90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-text-2"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </button>

          {/* Content */}
          <AnimatePresence>
            {!rangeCollapsed && (
              <motion.div
                data-testid="price-range-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/50"
              >
                <div className="p-4">
                  {/* Range Values */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-surface-2 border border-border/30">
                      <div className="text-xs text-text-2 mb-1">52-Week High</div>
                      <div
                        data-testid="price-range-high"
                        className="text-xl font-semibold font-mono tabular-nums text-green-500"
                      >
                        {week52High.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-surface-2 border border-border/30">
                      <div className="text-xs text-text-2 mb-1">52-Week Low</div>
                      <div
                        data-testid="price-range-low"
                        className="text-xl font-semibold font-mono tabular-nums text-red-500"
                      >
                        {week52Low.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Visual Range Indicator */}
                  {currentPrice && (
                    <div data-testid="price-range-indicator" className="mt-4">
                      <div className="flex items-center justify-between text-xs text-text-2 mb-1">
                        <span>Low</span>
                        <span>Current Position</span>
                        <span>High</span>
                      </div>
                      <div className="relative h-8 bg-surface-2 rounded-lg overflow-hidden border border-border/30">
                        {/* Position marker */}
                        <motion.div
                          data-testid="price-range-position"
                          className="absolute top-0 bottom-0 w-1 bg-blue-500"
                          style={{
                            left: `${calculateRangePosition(
                              currentPrice,
                              week52High,
                              week52Low
                            )}%`,
                          }}
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        {/* Current price label */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <span className="text-sm font-semibold text-text-primary">
                            {currentPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

/**
 * Format large numbers with suffixes
 */
function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`
  }
  return num.toFixed(2)
}

interface PerformanceBarProps {
  label: string
  value: number
  max: number
  testId: string
}

function PerformanceBar({ label, value, max, testId }: PerformanceBarProps) {
  const heightPercent = Math.min(Math.abs(value) / max, 1) * 100
  const color = getBarColor(value)

  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <motion.div
        data-testid={testId}
        className={cn('w-full rounded-t-sm', color)}
        initial={{ height: 0 }}
        animate={{ height: `${heightPercent}%` }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ minHeight: value !== 0 ? '4px' : '0' }}
      />
      <span className="text-xs text-text-2">{label}</span>
    </div>
  )
}

interface PerformanceCardProps {
  label: string
  thaiLabel: string
  value: number
  testId: string
}

function PerformanceCard({ label, thaiLabel, value, testId }: PerformanceCardProps) {
  return (
    <div className="p-3 rounded-lg bg-surface-2 border border-border/30">
      <div className="text-xs text-text-2 mb-1">{thaiLabel}</div>
      <div
        data-testid={testId}
        className={cn(
          'text-lg font-semibold font-mono tabular-nums',
          getPerformanceColor(value)
        )}
      >
        {formatPercentage(value)}
      </div>
      <div className="text-xs text-text-2 mt-1">{label}</div>
    </div>
  )
}

/**
 * Default export for convenience
 */
export default TechnicalAnalysis
