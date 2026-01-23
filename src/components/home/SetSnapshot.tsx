/**
 * SetSnapshot Component
 * Displays SET index with green/red indicator, market cap, and trend badges - Dark Theme
 */

import { Card } from '@/components/shared'
import {
  formatNumber,
  formatPercent,
  formatMarketCap,
  getValueArrow,
} from '@/lib/utils'
import type { TrendValue } from '@/lib/trends/types'

interface SetSnapshotProps {
  data: {
    index: number
    change: number
    changePercent: number
  }
  totalMarketCap?: number
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
  if (pct > 1.5) return { bg: '#22C55E', text: '#FFFFFF' } // up_strong
  if (pct > 0) return { bg: '#86EFAC', text: '#065F46' } // up_soft
  if (pct < -1.5) return { bg: '#EF4444', text: '#FFFFFF' } // down_strong
  if (pct < 0) return { bg: '#FECACA', text: '#991B1F' } // down_soft
  return { bg: '#94A3B8', text: '#0F172A' } // neutral
}

function TrendBadge({ label, trend }: TrendBadgeProps) {
  if (!trend) return null

  const styles = getTrendColorStyle(trend)
  const arrow = getValueArrow(trend.changePercent)

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-text-secondary">{label}</span>
      <span
        className="text-xs font-semibold rounded-full px-2 py-0.5"
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
  trends,
}: SetSnapshotProps) {
  // Use inline style for the main badge to match spec
  const getMainBadgeStyle = () => {
    if (data.changePercent > 1.5) return { bg: '#22C55E', text: '#FFFFFF' }
    if (data.changePercent > 0) return { bg: '#86EFAC', text: '#065F46' }
    if (data.changePercent < -1.5) return { bg: '#EF4444', text: '#FFFFFF' }
    if (data.changePercent < 0) return { bg: '#FECACA', text: '#991B1F' }
    return { bg: '#94A3B8', text: '#0F172A' }
  }

  const mainBadgeStyle = getMainBadgeStyle()
  const arrow = getValueArrow(data.changePercent)

  return (
    <Card variant="default" className="mb-6">
      <div className="flex flex-col gap-4">
        {/* Main SET display */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-bold text-text-primary">SET</h2>
            <span className="text-2xl font-semibold text-text-primary">
              {formatNumber(data.index, 2)}
            </span>
            <span
              className="text-base font-semibold rounded-full px-3 py-1"
              style={{ backgroundColor: mainBadgeStyle.bg, color: mainBadgeStyle.text }}
            >
              {arrow} {formatPercent(Math.abs(data.changePercent))}
            </span>
          </div>

          {totalMarketCap && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="font-medium">Market Cap:</span>
              <span className="font-semibold text-text-primary">{formatMarketCap(totalMarketCap)}</span>
            </div>
          )}
        </div>

        {/* Trend badges */}
        {trends && (trends.fiveDay || trends.twentyDay || trends.ytd) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-base-border">
            <TrendBadge label="5D" trend={trends.fiveDay} />
            <TrendBadge label="20D" trend={trends.twentyDay} />
            <TrendBadge label="YTD" trend={trends.ytd} />
          </div>
        )}
      </div>
    </Card>
  )
}
