/**
 * SetSnapshot Component
 * Displays SET index with green/red indicator and market cap
 */

import { Card, Badge } from '@/components/shared'
import { formatNumber, formatPercent, formatMarketCap, getValueColor, getValueArrow } from '@/lib/utils'

interface SetSnapshotProps {
  data: {
    index: number
    change: number
    changePercent: number
  }
  totalMarketCap?: number
  timestamp?: number
}

export function SetSnapshot({ data, totalMarketCap }: SetSnapshotProps) {
  const color = getValueColor(data.changePercent)
  const arrow = getValueArrow(data.changePercent)

  return (
    <Card variant="default" className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-bold text-gray-900">
            SET
          </h2>
          <span className="text-2xl font-semibold text-gray-700">
            {formatNumber(data.index, 2)}
          </span>
          <Badge color={color} size="lg" className="font-semibold">
            {arrow} {formatPercent(Math.abs(data.changePercent))}
          </Badge>
        </div>

        {totalMarketCap && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Market Cap:</span>
            <span className="font-semibold">{formatMarketCap(totalMarketCap)}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
