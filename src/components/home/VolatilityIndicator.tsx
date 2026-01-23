/**
 * VolatilityIndicator Component
 * Displays market volatility with level indicator - Dark Theme
 */

import { Card } from '@/components/shared'
import { formatNumber } from '@/lib/utils'

interface VolatilityIndicatorProps {
  volatility: number // Standard deviation as percentage
  average?: number
  className?: string
}

function getVolatilityLevel(
  vol: number,
  avg?: number
): { level: string; color: string; bgColor: string } {
  const compareAvg = avg || 15

  if (vol < compareAvg * 0.5) {
    return {
      level: 'Low',
      color: '#22C55E',
      bgColor: 'rgba(34, 197, 94, 0.15)',
    }
  }
  if (vol < compareAvg * 0.8) {
    return {
      level: 'Below Normal',
      color: '#86EFAC',
      bgColor: 'rgba(134, 239, 172, 0.15)',
    }
  }
  if (vol < compareAvg * 1.2) {
    return {
      level: 'Normal',
      color: '#9CA3AF',
      bgColor: 'rgba(148, 163, 184, 0.15)',
    }
  }
  if (vol < compareAvg * 1.5) {
    return {
      level: 'Elevated',
      color: '#FBBF24',
      bgColor: 'rgba(251, 191, 36, 0.15)',
    }
  }
  return {
    level: 'High',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  }
}

function getGaugeWidth(vol: number): number {
  // Map 0-40% volatility to 0-100% width
  return Math.min(100, (vol / 40) * 100)
}

function getGaugeColor(vol: number): string {
  if (vol < 8) return '#22C55E'
  if (vol < 12) return '#86EFAC'
  if (vol < 18) return '#9CA3AF'
  if (vol < 25) return '#FBBF24'
  return '#EF4444'
}

export function VolatilityIndicator({
  volatility,
  average,
  className = '',
}: VolatilityIndicatorProps) {
  const { level, color, bgColor } = getVolatilityLevel(volatility, average)
  const gaugeWidth = getGaugeWidth(volatility)
  const gaugeColor = getGaugeColor(volatility)

  return (
    <Card variant="default" className={`p-3 ${className}`}>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>
          Volatility (30D)
        </span>

        {/* Volatility value */}
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold" style={{ color: '#E5E7EB' }}>
            {formatNumber(volatility, 1)}%
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ color, backgroundColor: bgColor }}
          >
            {level}
          </span>
        </div>

        {/* Average comparison */}
        {average && (
          <div className="text-xs" style={{ color: '#9CA3AF' }}>
            Avg: {formatNumber(average, 1)}%
          </div>
        )}

        {/* Gauge */}
        <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#374151' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${gaugeWidth}%`,
              backgroundColor: gaugeColor,
            }}
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-xs" style={{ color: '#6B7280' }}>
          <span>Low</span>
          <span>Normal</span>
          <span>High</span>
        </div>
      </div>
    </Card>
  )
}
