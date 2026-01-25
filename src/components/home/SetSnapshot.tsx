/**
 * SetSnapshot Component
 * Compact SET index display with market metrics
 * Mobile-first, data-dense professional design
 */

'use client'

import { Card } from '@/components/shared'
import {
  formatNumber,
  formatPercent,
  formatMarketCap,
  getValueArrow,
} from '@/lib/utils'
import type { TrendValue } from '@/lib/trends/types'
import { cn } from '@/lib/utils'

interface SetSnapshotProps {
  data: {
    index: number
    change: number
    changePercent: number
  }
  totalMarketCap?: number
  totalVolume?: number
  timestamp?: number
  trends?: {
    fiveDay?: TrendValue
    twentyDay?: TrendValue
    ytd?: TrendValue
  }
}

interface TrendBadgeProps {
  label: string
  trend: TrendValue | undefined
}

function getTrendColorStyle(trend: TrendValue) {
  const pct = trend.changePercent
  if (pct > 1.5) return { bg: '#4ade80', text: '#0a0e17' }
  if (pct > 0) return { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80' }
  if (pct < -1.5) return { bg: '#ff6b6b', text: '#ffffff' }
  if (pct < 0) return { bg: 'rgba(255, 107, 107, 0.15)', text: '#ff6b6b' }
  return { bg: '#9ca3af', text: '#0a0e17' }
}

function TrendBadge({ label, trend }: TrendBadgeProps) {
  if (!trend) return null

  const styles = getTrendColorStyle(trend)
  const arrow = getValueArrow(trend.changePercent)

  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] uppercase tracking-wide text-text-muted">{label}</span>
      <span
        className="text-[10px] font-semibold rounded px-1.5 py-0.5 tabular-nums"
        style={{ backgroundColor: styles.bg, color: styles.text }}
      >
        {arrow} {formatPercent(Math.abs(trend.changePercent))}
      </span>
    </div>
  )
}

export function SetSnapshot({
  data,
  totalMarketCap,
  totalVolume,
  trends,
}: SetSnapshotProps) {
  const getMainBadgeStyle = () => {
    if (data.changePercent > 1.5) return { bg: '#4ade80', text: '#0a0e17' }
    if (data.changePercent > 0) return { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80' }
    if (data.changePercent < -1.5) return { bg: '#ff6b6b', text: '#ffffff' }
    if (data.changePercent < 0) return { bg: 'rgba(255, 107, 107, 0.15)', text: '#ff6b6b' }
    return { bg: '#9ca3af', text: '#0a0e17' }
  }

  const mainBadgeStyle = getMainBadgeStyle()
  const arrow = getValueArrow(data.changePercent)

  // Compact volume formatting
  const formatVolumeCompact = (volume?: number) => {
    if (!volume) return '—'
    const billions = volume / 1_000_000_000
    const millions = volume / 1_000_000
    if (billions >= 1) return `${billions.toFixed(1)}B`
    if (millions >= 1) return `${millions.toFixed(1)}M`
    return `${volume.toLocaleString()}`
  }

  return (
    <Card variant="default" className="mb-3">
      {/* Compact single-row layout on all screens */}
      <div className="flex flex-col gap-2">
        {/* Primary row: SET Index + Change Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-text-secondary tracking-tight">SET</span>
            <span className="text-lg font-bold text-text-primary tabular-nums tracking-tight">
              {formatNumber(data.index, 2)}
            </span>
            <span
              className={cn(
                'text-xs font-semibold rounded-md px-2 py-0.5 tabular-nums'
              )}
              style={{ backgroundColor: mainBadgeStyle.bg, color: mainBadgeStyle.text }}
            >
              {arrow} {formatPercent(Math.abs(data.changePercent))}
            </span>
          </div>

          {/* Trend badges - compact row */}
          {trends && (trends.fiveDay || trends.twentyDay || trends.ytd) && (
            <div className="flex items-center gap-3">
              <TrendBadge label="5D" trend={trends.fiveDay} />
              <TrendBadge label="20D" trend={trends.twentyDay} />
              <TrendBadge label="YTD" trend={trends.ytd} />
            </div>
          )}
        </div>

        {/* Secondary row: Market Cap + Volume - compact inline */}
        {(totalMarketCap || totalVolume) && (
          <div className="flex items-center gap-3 text-xs text-text-muted">
            {totalMarketCap && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Cap:</span>
                <span className="font-semibold text-text-secondary tabular-nums">
                  {formatMarketCap(totalMarketCap)}
                </span>
              </span>
            )}
            {totalMarketCap && totalVolume && (
              <span className="text-border-subtle">|</span>
            )}
            {totalVolume && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Vol:</span>
                <span className="font-semibold text-text-secondary tabular-nums">
                  {formatVolumeCompact(totalVolume)}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default SetSnapshot
