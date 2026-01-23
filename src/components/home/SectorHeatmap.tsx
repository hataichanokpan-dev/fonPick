/**
 * SectorHeatmap Component
 * Grid-based heatmap showing sector performance
 */

import { Card } from '@/components/shared'
import { formatPercent } from '@/lib/utils'

interface SectorHeatmapProps {
  data: {
    sectors: Array<{
      name: string
      changePercent: number
      marketCap?: number
    }>
    timestamp?: number
  }
}

export function SectorHeatmap({ data }: SectorHeatmapProps) {
  // Sort sectors by market cap if available, otherwise by change percent
  const sortedSectors = [...data.sectors].sort((a, b) => {
    if (a.marketCap && b.marketCap) {
      return b.marketCap - a.marketCap
    }
    return b.changePercent - a.changePercent
  })

  // Get color intensity based on performance
  const getColorIntensity = (changePercent: number): string => {
    const abs = Math.abs(changePercent)
    if (abs >= 3) return 'intense'
    if (abs >= 1.5) return 'medium'
    return 'light'
  }

  const getBgColor = (changePercent: number, intensity: string): string => {
    const isPositive = changePercent >= 0

    if (isPositive) {
      switch (intensity) {
        case 'intense':
          return 'bg-up-600 text-white'
        case 'medium':
          return 'bg-up-400 text-white'
        case 'light':
          return 'bg-up-200 text-up-900'
        default:
          return 'bg-up-200 text-up-900'
      }
    } else {
      switch (intensity) {
        case 'intense':
          return 'bg-down-600 text-white'
        case 'medium':
          return 'bg-down-400 text-white'
        case 'light':
          return 'bg-down-200 text-down-900'
        default:
          return 'bg-down-200 text-down-900'
      }
    }
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sector Performance
      </h3>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {sortedSectors.map((sector) => {
          const intensity = getColorIntensity(sector.changePercent)
          const bgColor = getBgColor(sector.changePercent, intensity)

          return (
            <div
              key={sector.name}
              className={cn(
                'rounded-lg p-3 text-center transition-transform hover:scale-105',
                bgColor
              )}
            >
              <div className="text-xs font-medium truncate mb-1">
                {sector.name}
              </div>
              <div className="text-sm font-bold">
                {formatPercent(sector.changePercent, 1)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-up-600" />
          <span>Strong Up</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-up-200" />
          <span>Slight Up</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-down-200" />
          <span>Slight Down</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-down-600" />
          <span>Strong Down</span>
        </div>
      </div>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
