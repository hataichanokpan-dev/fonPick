/**
 * SetPERatio Component
 * Displays SET P/E ratio with historical comparison - Dark Theme
 */

import { Card } from '@/components/shared'
import { formatDecimal } from '@/lib/utils'

interface SetPERatioProps {
  currentPE: number
  historicalAvg?: number
  className?: string
}

function getValuationLevel(
  current: number,
  avg?: number
): { level: string; color: string } {
  if (!avg) {
    return { level: 'N/A', color: '#9CA3AF' }
  }

  const diff = ((current - avg) / avg) * 100

  if (diff <= -15) {
    return { level: 'Cheap', color: '#22C55E' }
  }
  if (diff <= -5) {
    return { level: 'Below Avg', color: '#86EFAC' }
  }
  if (diff <= 5) {
    return { level: 'Fair', color: '#9CA3AF' }
  }
  if (diff <= 15) {
    return { level: 'Above Avg', color: '#FECACA' }
  }
  return { level: 'Expensive', color: '#EF4444' }
}

function getPercentileBar(current: number, avg?: number): number {
  if (!avg) return 50
  // Approximate percentile: 50 +/- based on deviation from avg
  const diff = ((current - avg) / avg) * 100
  return Math.max(10, Math.min(90, 50 + diff * 2))
}

export function SetPERatio({
  currentPE,
  historicalAvg,
  className = '',
}: SetPERatioProps) {
  const { level, color } = getValuationLevel(currentPE, historicalAvg)
  const barPercent = getPercentileBar(currentPE, historicalAvg)

  return (
    <Card variant="default" className={`p-3 ${className}`}>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>
          SET P/E Ratio
        </span>

        {/* Current P/E */}
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold tabular-nums" style={{ color: '#E5E7EB' }}>
            {formatDecimal(currentPE, 1)}x
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
            {level}
          </span>
        </div>

        {/* Historical comparison bar */}
        {historicalAvg && (
          <>
            <div className="flex items-baseline justify-between text-xs" style={{ color: '#9CA3AF' }}>
              <span className="tabular-nums">Avg: {formatDecimal(historicalAvg, 1)}x</span>
              <span className="tabular-nums">
                {currentPE > historicalAvg ? '+' : ''}
                {formatDecimal(Math.abs((currentPE - historicalAvg) / historicalAvg * 100), 1)}%
              </span>
            </div>

            {/* Percentile bar */}
            <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#374151' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${barPercent}%`,
                  backgroundColor: currentPE > historicalAvg ? '#EF4444' : '#22C55E',
                }}
              />
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
