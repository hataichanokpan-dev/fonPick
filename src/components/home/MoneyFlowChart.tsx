/**
 * MoneyFlowChart Component
 * Bar chart showing money flow by investor type with cumulative trend indicators
 */

import { Card } from '@/components/shared'
import { formatNumber, getValueArrow, formatDecimal } from '@/lib/utils'

interface MoneyFlowChartProps {
  data: {
    foreign: {
      buy: number
      sell: number
      net: number
      trend5Day?: number // Cumulative 5-day net flow
    }
    institution: {
      buy: number
      sell: number
      net: number
      trend5Day?: number
    }
    retail: {
      buy: number
      sell: number
      net: number
      trend5Day?: number
    }
    prop: {
      buy: number
      sell: number
      net: number
      trend5Day?: number
    }
    timestamp?: number
  }
  showTrends?: boolean
}

const INVESTOR_LABELS: Record<string, string> = {
  foreign: 'Foreign',
  institution: 'Institution',
  retail: 'Retail',
  prop: 'Prop',
}

const INVESTOR_KEYS = ['foreign', 'institution', 'retail', 'prop'] as const

export function MoneyFlowChart({
  data,
  showTrends = false,
}: MoneyFlowChartProps) {
  // Calculate max value for scaling
  const allValues = INVESTOR_KEYS.flatMap((key) => [
    Math.abs(data[key].buy),
    Math.abs(data[key].sell),
  ])
  const maxValue = Math.max(...allValues)

  // Get net flow color based on value and threshold
  const getNetColorStyle = (value: number) => {
    const abs = Math.abs(value)
    if (value > 0) {
      return abs > 1500 ? '#16A34A' : '#86EFAC' // buy or up_soft
    } else if (value < 0) {
      return abs > 1500 ? '#DC2626' : '#FECACA' // sell or down_soft
    }
    return '#9CA3AF' // neutral
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Money Flow by Investor Type
      </h3>

      <div className="space-y-4">
        {INVESTOR_KEYS.map((investor) => {
          const { buy, sell, net, trend5Day } = data[investor]

          return (
            <div key={investor} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-text-secondary">
                  {INVESTOR_LABELS[investor]}
                </span>
                <div className="flex items-center gap-2">
                  {/* 5-day trend indicator */}
                  {showTrends && trend5Day !== undefined && (
                    <span
                      className="text-xs font-medium tabular-nums"
                      style={{
                        color: trend5Day > 0 ? '#86EFAC' : trend5Day < 0 ? '#FECACA' : '#9CA3AF',
                      }}
                    >
                      {getValueArrow(trend5Day)}5D {Math.abs(trend5Day) > 0 && `${formatDecimal(Math.abs(trend5Day), 0)}M`}
                    </span>
                  )}
                  {/* Today's net */}
                  <span
                    className="font-semibold tabular-nums"
                    style={{ color: getNetColorStyle(net) }}
                  >
                    {net >= 0 ? '+' : ''}
                    {formatNumber(net, 0)} M
                  </span>
                </div>
              </div>

              <div className="relative h-6 rounded overflow-hidden" style={{ backgroundColor: '#1F2937' }}>
                {/* Buy bar (buy color with opacity) */}
                <div
                  className="absolute left-0 top-0 h-full"
                  style={{
                    width: `${(buy / maxValue) * 50}%`,
                    backgroundColor: 'rgba(22, 163, 74, 0.7)',
                  }}
                />

                {/* Sell bar (sell color with opacity) */}
                <div
                  className="absolute right-0 top-0 h-full"
                  style={{
                    width: `${(sell / maxValue) * 50}%`,
                    backgroundColor: 'rgba(220, 38, 38, 0.7)',
                  }}
                />

                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: '#374151' }} />
              </div>

              <div className="flex justify-between text-xs tabular-nums" style={{ color: '#6B7280' }}>
                <span>B: {formatNumber(buy, 0)}M</span>
                <span>S: {formatNumber(sell, 0)}M</span>
              </div>
            </div>
          )
        })}
      </div>

      {showTrends && (
        <div className="mt-4 pt-3 text-xs" style={{ borderTop: '1px solid #273449', color: '#6B7280' }}>
          5D = Cumulative 5-day net flow
        </div>
      )}
    </Card>
  )
}
