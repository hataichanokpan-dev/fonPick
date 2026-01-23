/**
 * MarketBreadth Component
 * Displays advance/decline ratio for market breadth
 */

import { Card } from '@/components/shared'
import { formatNumber } from '@/lib/utils'

interface MarketBreadthProps {
  advances: number
  declines: number
  className?: string
}

function getBreadthStatus(advances: number, declines: number): {
  status: string
  color: string
} {
  const ratio = declines > 0 ? advances / declines : advances

  if (ratio >= 1.5) {
    return { status: 'Strong', color: '#22C55E' }
  }
  if (ratio >= 1.1) {
    return { status: 'Bullish', color: '#86EFAC' }
  }
  if (ratio >= 0.9) {
    return { status: 'Neutral', color: '#94A3B8' }
  }
  if (ratio >= 0.67) {
    return { status: 'Bearish', color: '#FECACA' }
  }
  return { status: 'Weak', color: '#EF4444' }
}

function getGaugeFill(advances: number, declines: number): number {
  const ratio = declines > 0 ? advances / declines : 2
  // Clamp between 0 and 100
  return Math.max(10, Math.min(90, 50 + ratio * 15))
}

export function MarketBreadth({
  advances,
  declines,
  className = '',
}: MarketBreadthProps) {
  const ratio = declines > 0 ? advances / declines : advances
  const { status, color } = getBreadthStatus(advances, declines)
  const fillPercent = getGaugeFill(advances, declines)

  return (
    <Card variant="default" className={`p-3 ${className}`}>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>
          Market Breadth
        </span>

        {/* A/D ratio */}
        <div className="flex items-baseline justify-between">
          <span className="text-xs" style={{ color: '#9CA3AF' }}>A/D Ratio</span>
          <span className="text-sm font-semibold" style={{ color: '#E5E7EB' }}>{ratio.toFixed(2)}</span>
        </div>

        {/* Gauge */}
        <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1F2937' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${fillPercent}%`,
              background: 'linear-gradient(to right, #EF4444, #94A3B8, #22C55E)'
            }}
          />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-xs" style={{ color: '#9CA3AF' }}>
            <span>Adv: {formatNumber(advances, 0)}</span>
            <span>Dec: {formatNumber(declines, 0)}</span>
          </div>
          <span className="text-xs font-semibold" style={{ color }}>{status}</span>
        </div>
      </div>
    </Card>
  )
}
