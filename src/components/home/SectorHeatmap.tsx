/**
 * Sector Heatmap Component
 * Grid-based heatmap showing sector performance with trend indicators - Dark Theme
 */

import { Card } from '@/components/shared'
import { formatPercentage, getValueArrow } from '@/lib/utils'
import type { TrendValue } from '@/lib/trends/types'

interface SectorHeatmapProps {
  data: {
    sectors: Array<{
      name: string
      changePercent: number
      marketCap?: number
      trend5Day?: TrendValue
    }>
    timestamp?: number
  }
  showTrends?: boolean
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Get cell colors based on change percent magnitude and direction
 */
function getCellColors(changePercent: number): { bg: string; text: string } {
  // Strong up (>3%)
  if (changePercent > 3) return { bg: '#16A34A', text: '#FFFFFF' }
  // Medium up (1.5% to 3%)
  if (changePercent > 1.5) return { bg: '#22C55E', text: '#FFFFFF' }
  // Light up (0% to 1.5%)
  if (changePercent > 0) return { bg: '#86EFAC', text: '#064E3B' }
  // Light down (0% to -1.5%)
  if (changePercent > -1.5) return { bg: '#FECACA', text: '#7F1D1D' }
  // Medium down (-1.5% to -3%)
  if (changePercent > -3) return { bg: '#EF4444', text: '#FFFFFF' }
  // Strong down (<-3%)
  return { bg: '#DC2626', text: '#FFFFFF' }
}

/**
 * Get trend arrow color
 */
function getTrendArrowColor(trend: TrendValue | undefined): string {
  if (!trend) return '#6B7280' // text-text-muted
  if (trend.changePercent > 1.5) return '#FFFFFF'
  if (trend.changePercent > 0) return '#064E3B'
  if (trend.changePercent < -1.5) return '#FFFFFF'
  if (trend.changePercent < 0) return '#7F1D1D'
  return '#6B7280'
}

export function SectorHeatmap({
  data,
  showTrends = false,
}: SectorHeatmapProps) {
  // Sort sectors by market cap if available, otherwise by change percent
  const sortedSectors = [...data.sectors].sort((a, b) => {
    if (a.marketCap && b.marketCap) {
      return b.marketCap - a.marketCap
    }
    return b.changePercent - a.changePercent
  })

  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Sector Performance
      </h3>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {sortedSectors.map((sector) => {
          const colors = getCellColors(sector.changePercent)
          const trendArrow = showTrends && sector.trend5Day
            ? getValueArrow(sector.trend5Day.changePercent)
            : null

          return (
            <div
              key={sector.name}
              className={cn(
                'rounded-lg p-3 text-center transition-transform hover:scale-105 relative'
              )}
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
              }}
              title={
                showTrends && sector.trend5Day
                  ? `5D: ${formatPercentage(sector.trend5Day.changePercent, 2)}`
                  : undefined
              }
            >
              <div className="flex items-center justify-center gap-1">
                <div className="text-xs font-medium truncate flex-1">
                  {sector.name}
                </div>
                {trendArrow && (
                  <span
                    className="text-xs"
                    style={{ color: getTrendArrowColor(sector.trend5Day) }}
                  >
                    {trendArrow}
                  </span>
                )}
              </div>
              <div className="text-sm font-bold">
                {formatPercentage(sector.changePercent, 2)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs" style={{ color: '#6B7280' }}>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#16A34A' }} />
          <span>Strong Up</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#86EFAC' }} />
          <span>Slight Up</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FECACA' }} />
          <span>Slight Down</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#DC2626' }} />
          <span>Strong Down</span>
        </div>
        {showTrends && (
          <div className="flex items-center gap-1 ml-2 pl-2" style={{ borderLeft: '1px solid #273449' }}>
            <span className="text-xs">▲/▼ = 5D Trend</span>
          </div>
        )}
      </div>
    </Card>
  )
}
