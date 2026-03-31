/**
 * Historical Trend Chart Component
 *
 * Displays historical trend data including:
 * - Price history line chart
 * - MA20/50/200 overlay lines
 * - Support/Resistance level markers
 * - Trend phase indicator
 *
 * Uses CSS animations, not Framer Motion (for static chart)
 */

'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card'
import { TrendingUp, TrendingDown, Minus, Activity, LineChart as LineChartIcon } from 'lucide-react'
import { cn, safeToFixed } from '@/lib/utils'
import type { HistoricalTrendAnalysis, PriceHistoryPoint } from '@/types/swing-trading'

interface HistoricalTrendChartProps {
  data: HistoricalTrendAnalysis
  locale: 'en' | 'th'
}

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'Historical Trend',
    priceHistory: 'Price History',
    trendPhase: 'Trend Phase',
    momentum: 'Momentum',
    early: 'Early',
    mature: 'Mature',
    exhausted: 'Exhausted',
    accelerating: 'Accelerating',
    decelerating: 'Decelerating',
    stable: 'Stable',
    sustainability: 'Sustainability',
    days: 'days',
    support: 'Support',
    resistance: 'Resistance',
    identicalPrices: 'Cannot display chart: all prices are identical',
  },
  th: {
    title: 'แนวโน้มทางประวัติศาสตร์',
    priceHistory: 'ประวัติราคา',
    trendPhase: 'ระยะเทรนด์',
    momentum: 'โมเมนตัม',
    early: 'เริ่มต้น',
    mature: 'เต็มวัย',
    exhausted: 'อ่อนแรง',
    accelerating: 'เร่งขึ้น',
    decelerating: 'ชะลอตัว',
    stable: 'มั่นคง',
    sustainability: 'ความยั่งยืน',
    days: 'วัน',
    support: 'แนวรับ',
    resistance: 'แนวต้าน',
    identicalPrices: 'ไม่สามารถแสดงกราฟ: ราคาทั้งหมดเหมือนกัน',
  },
} as const

export function HistoricalTrendChart({ data, locale }: HistoricalTrendChartProps) {
  const t = LABELS[locale]

  // Transform priceHistory to match SimpleTrendChart format
  // PriceHistoryPoint has { date, open, high, low, close }
  // SimpleTrendChart needs { date, price }
  const chartData = data.priceHistory.map((p: PriceHistoryPoint) => ({
    date: p.date,
    price: p.close, // Use close price for chart
  }))

  // Transform levels to match SimpleTrendChart format
  // SupportResistanceLevel has strength: 'weak' | 'moderate' | 'strong'
  // SimpleTrendChart needs strength: number (1-3)
  const transformedLevels = {
    support: data.levels.support.map((level) => ({
      price: level.price,
      strength:
        level.strength === 'strong' ? 3 : level.strength === 'moderate' ? 2 : 1,
    })),
    resistance: data.levels.resistance.map((level) => ({
      price: level.price,
      strength:
        level.strength === 'strong' ? 3 : level.strength === 'moderate' ? 2 : 1,
    })),
  }

  // Get trend direction icon and color
  const getTrendDisplay = () => {
    switch (data.trend.direction) {
      case 'uptrend':
        return {
          icon: TrendingUp,
          color: 'text-up-primary',
          bgColor: 'bg-up-primary/10',
          borderColor: 'border-up-primary/30',
        }
      case 'downtrend':
        return {
          icon: TrendingDown,
          color: 'text-risk',
          bgColor: 'bg-risk/10',
          borderColor: 'border-risk/30',
        }
      default:
        return {
          icon: Minus,
          color: 'text-text-3',
          bgColor: 'bg-surface-2',
          borderColor: 'border-border',
        }
    }
  }

  // Get trend phase display
  const getPhaseDisplay = () => {
    const phaseMap = {
      early: { color: 'text-emerald-500', label: t.early },
      mature: { color: 'text-amber-500', label: t.mature },
      exhausted: { color: 'text-rose-500', label: t.exhausted },
    }
    return phaseMap[data.trend.phase]
  }

  const trendDisplay = getTrendDisplay()
  const phaseDisplay = getPhaseDisplay()
  const TrendIcon = trendDisplay.icon

  return (
    <Card variant="default" padding="md" className="animate-slide-up [animation-delay:400ms]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-accent-teal" />
            {t.title}
          </CardTitle>
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg border',
            trendDisplay.bgColor,
            trendDisplay.borderColor
          )}>
            <TrendIcon className={cn('w-4 h-4', trendDisplay.color)} />
            <span className={cn('text-sm font-medium', trendDisplay.color)}>
              {data.trend.direction.charAt(0).toUpperCase() + data.trend.direction.slice(1)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chart Area */}
        <div className="relative h-64 bg-surface-2 rounded-lg overflow-hidden p-4">
          {chartData.length > 0 ? (
            <SimpleTrendChart
              priceHistory={chartData}
              movingAverages={data.movingAverages}
              levels={transformedLevels}
              locale={locale}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-text-3">
              <div className="text-center">
                <LineChartIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Trend Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Trend Duration */}
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="text-xs text-text-secondary mb-1">
              {data.trend.direction} {t.days}
            </div>
            <div className="text-lg font-bold text-text-primary tabular-nums">
              {data.trend.duration}
            </div>
            <div className="text-xs text-text-3 mt-1">
              {phaseDisplay.label}
            </div>
          </div>

          {/* Trend Strength */}
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="text-xs text-text-secondary mb-1">Strength</div>
            <div className="text-lg font-bold tabular-nums" style={{ color: phaseDisplay.color }}>
              {safeToFixed(data.trend.strength, 0)}
            </div>
            <div className="text-xs text-text-3 mt-1">/ 100</div>
          </div>

          {/* Momentum */}
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="text-xs text-text-secondary mb-1">{t.momentum}</div>
            <div className="flex items-center gap-1">
              <Activity className={cn(
                'w-4 h-4',
                data.momentum.isAccelerating
                  ? 'text-emerald-500'
                  : data.momentum.isDecelerating
                  ? 'text-rose-500'
                  : 'text-text-3'
              )} />
              <span className={cn(
                'text-sm font-medium',
                data.momentum.isAccelerating
                  ? 'text-emerald-500'
                  : data.momentum.isDecelerating
                  ? 'text-rose-500'
                  : 'text-text-3'
              )}>
                {data.momentum.isAccelerating
                  ? t.accelerating
                  : data.momentum.isDecelerating
                  ? t.decelerating
                  : t.stable}
              </span>
            </div>
          </div>

          {/* Sustainability */}
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="text-xs text-text-secondary mb-1">{t.sustainability}</div>
            <div className="text-lg font-bold text-accent-blue tabular-nums">
              {safeToFixed(data.momentum.sustainabilityScore, 0)}
            </div>
            <div className="text-xs text-text-3 mt-1">/ 100</div>
          </div>
        </div>

        {/* Support & Resistance */}
        {(data.levels.support.length > 0 || data.levels.resistance.length > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {/* Support Levels */}
            {data.levels.support.length > 0 && (
              <div className="p-3 rounded-lg bg-up-primary/10 border border-up-primary/30">
                <div className="text-xs text-up-primary/80 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {t.support}
                </div>
                <div className="space-y-1">
                  {data.levels.support.slice(0, 3).map((level, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-text-3">L{idx + 1}</span>
                      <span className="text-up-primary font-medium tabular-nums">
                        {safeToFixed(level.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resistance Levels */}
            {data.levels.resistance.length > 0 && (
              <div className="p-3 rounded-lg bg-risk/10 border border-risk/30">
                <div className="text-xs text-risk/80 mb-2 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {t.resistance}
                </div>
                <div className="space-y-1">
                  {data.levels.resistance.slice(0, 3).map((level, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-text-3">L{idx + 1}</span>
                      <span className="text-risk font-medium tabular-nums">
                        {safeToFixed(level.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data Quality Footer */}
        {data.dataQuality && (
          <div className="flex items-center justify-between text-xs text-text-3 px-3 py-2 rounded-lg bg-surface-2">
            <span>Data Quality: {safeToFixed(data.dataQuality.completeness, 0)}%</span>
            <span>
              {data.dataQuality.hasEnoughData ? (
                <span className="text-emerald-500">✓ Enough data</span>
              ) : (
                <span className="text-amber-500">⚠ Limited data</span>
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// SIMPLE SVG CHART (No Framer Motion)
// ============================================================================

interface SimpleTrendChartProps {
  priceHistory: Array<{ date: string; price: number }>
  movingAverages: {
    ma20: Array<{ date: string; value: number }>
    ma50: Array<{ date: string; value: number }>
    ma200: Array<{ date: string; value: number }>
  }
  levels: {
    support: Array<{ price: number; strength: number }>
    resistance: Array<{ price: number; strength: number }>
  }
  locale: 'en' | 'th'
}

function SimpleTrendChart({
  priceHistory,
  movingAverages,
  levels,
  locale,
}: SimpleTrendChartProps) {
  const t = LABELS[locale]

  // Calculate chart dimensions
  const width = 800
  const height = 250
  const padding = { top: 20, right: 20, bottom: 30, left: 60 }

  // Find price range
  const allPrices = priceHistory.map((p) => p.price)
  const allMA = [
    ...movingAverages.ma20.map((m) => m.value),
    ...movingAverages.ma50.map((m) => m.value),
    ...movingAverages.ma200.map((m) => m.value),
  ]
  const allValues = [...allPrices, ...allMA]

  const minPrice = Math.min(...allValues) * 0.995
  const maxPrice = Math.max(...allValues) * 1.005
  const priceRange = maxPrice - minPrice

  // Guard against division by zero
  if (priceRange === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-text-3">
        <div className="text-center">
          <LineChartIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">{t.identicalPrices}</p>
        </div>
      </div>
    )
  }

  // Helper: Convert price to Y coordinate
  const priceToY = (price: number) =>
    height - padding.bottom - ((price - minPrice) / priceRange) * (height - padding.top - padding.bottom)

  // Helper: Convert index to X coordinate
  const indexToX = (index: number) =>
    padding.left + (index / (priceHistory.length - 1)) * (width - padding.left - padding.right)

  // Generate path data for price line
  const pricePath = priceHistory
    .map((p, i) => {
      const x = indexToX(i)
      const y = priceToY(p.price)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  // Generate path data for MA lines
  const ma20Path = movingAverages.ma20
    .map((m, i) => {
      const x = indexToX(i)
      const y = priceToY(m.value)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const ma50Path = movingAverages.ma50
    .map((m, i) => {
      const x = indexToX(i)
      const y = priceToY(m.value)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  // Y-axis labels
  const yTicks = 5
  const yAxisLabels = Array.from({ length: yTicks }, (_, i) => {
    const price = minPrice + (i / (yTicks - 1)) * priceRange
    const y = priceToY(price)
    return { price, y }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Y-axis grid lines */}
      {yAxisLabels.map(({ price, y }, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke="#2a2a2a"
            strokeWidth="1"
            strokeDasharray={i === yAxisLabels.length - 1 ? '0' : '4 4'}
          />
          <text
            x={padding.left - 10}
            y={y + 4}
            fill="#6b7280"
            fontSize="12"
            textAnchor="end"
            className="text-xs"
          >
            {safeToFixed(price, 2)}
          </text>
        </g>
      ))}

      {/* Support level */}
      {levels.support.length > 0 && (
        <line
          x1={padding.left}
          y1={priceToY(levels.support[0].price)}
          x2={width - padding.right}
          y2={priceToY(levels.support[0].price)}
          stroke="#4ade80"
          strokeWidth="1"
          strokeDasharray="8 4"
          opacity="0.5"
        />
      )}

      {/* Resistance level */}
      {levels.resistance.length > 0 && (
        <line
          x1={padding.left}
          y1={priceToY(levels.resistance[0].price)}
          x2={width - padding.right}
          y2={priceToY(levels.resistance[0].price)}
          stroke="#ff6b6b"
          strokeWidth="1"
          strokeDasharray="8 4"
          opacity="0.5"
        />
      )}

      {/* MA200 line */}
      {movingAverages.ma200.length > 0 && (
        <path
          d={ma50Path}
          fill="none"
          stroke="#a855f7"
          strokeWidth="1.5"
          opacity="0.4"
          className="transition-opacity duration-200 hover:opacity-60"
        />
      )}

      {/* MA50 line */}
      {movingAverages.ma50.length > 0 && (
        <path
          d={ma50Path}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
          opacity="0.5"
          className="transition-opacity duration-200 hover:opacity-70"
        />
      )}

      {/* MA20 line */}
      {movingAverages.ma20.length > 0 && (
        <path
          d={ma20Path}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          opacity="0.6"
          className="transition-opacity duration-200 hover:opacity-80"
        />
      )}

      {/* Price line */}
      <path
        d={pricePath}
        fill="none"
        stroke="#2ED8A7"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="drop-shadow-lg"
      />

      {/* Price gradient area under line */}
      <defs>
        <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2ED8A7" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2ED8A7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`
          ${pricePath}
          L ${indexToX(priceHistory.length - 1)} ${height - padding.bottom}
          L ${indexToX(0)} ${height - padding.bottom}
          Z
        `}
        fill="url(#priceGradient)"
        opacity="0.3"
      />
    </svg>
  )
}
