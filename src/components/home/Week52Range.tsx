/**
 * Week52Range Component
 * Displays 52-week high/low range with current position - Dark Theme
 */

import { Card } from '@/components/shared'
import { formatNumber } from '@/lib/utils'

interface Week52RangeProps {
  current: number
  high: number
  low: number
  className?: string
}

function getPositionInRanger(current: number, high: number, low: number): number {
  if (high === low) return 50
  return ((current - low) / (high - low)) * 100
}

function getColorForPosition(position: number): string {
  if (position >= 80) return '#22C55E' // up_strong green
  if (position >= 60) return '#86EFAC' // up_soft green
  if (position >= 40) return '#94A3B8' // neutral gray
  if (position >= 20) return '#FECACA' // down_soft red
  return '#EF4444' // down_strong red
}

function getPositionLabel(position: number): string {
  if (position < 20) return 'Near 52-week low'
  if (position < 40) return 'Below mid-range'
  if (position < 60) return 'Mid-range'
  if (position < 80) return 'Above mid-range'
  return 'Near 52-week high'
}

export function Week52Range({
  current,
  high,
  low,
  className = '',
}: Week52RangeProps) {
  const position = getPositionInRanger(current, high, low)
  const barColor = getColorForPosition(position)

  return (
    <Card variant="default" className={`p-3 ${className}`}>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>
          52-Week Range
        </span>

        {/* Value display */}
        <div className="flex items-baseline justify-between">
          <span className="text-xs" style={{ color: '#9CA3AF' }}>
            {formatNumber(low, 0)}
          </span>
          <span className="text-sm font-semibold" style={{ color: '#E5E7EB' }}>
            {formatNumber(current, 0)}
          </span>
          <span className="text-xs" style={{ color: '#9CA3AF' }}>
            {formatNumber(high, 0)}
          </span>
        </div>

        {/* Visual bar */}
        <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#374151' }}>
          <div
            className="absolute h-full rounded-full"
            style={{
              left: `${Math.max(0, Math.min(100, position))}%`,
              width: '4px',
              transform: 'translateX(-50%)',
            }}
          >
            <div
              className="w-full rounded-full"
              style={{ marginTop: '-2px', height: '12px', backgroundColor: barColor }}
            />
          </div>
        </div>

        {/* Position indicator */}
        <div className="text-xs text-center" style={{ color: '#6B7280' }}>
          {getPositionLabel(position)}
        </div>
      </div>
    </Card>
  )
}
