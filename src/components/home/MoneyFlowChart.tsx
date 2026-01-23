/**
 * MoneyFlowChart Component
 * Bar chart showing money flow by investor type
 */

import { Card } from '@/components/shared'
import { formatNumber, getValueColor } from '@/lib/utils'

interface MoneyFlowChartProps {
  data: {
    foreign: { buy: number; sell: number; net: number }
    institution: { buy: number; sell: number; net: number }
    retail: { buy: number; sell: number; net: number }
    prop: { buy: number; sell: number; net: number }
    timestamp?: number
  }
}

const INVESTOR_LABELS: Record<string, string> = {
  foreign: 'Foreign',
  institution: 'Institution',
  retail: 'Retail',
  prop: 'Prop',
}

const INVESTOR_KEYS = ['foreign', 'institution', 'retail', 'prop'] as const

export function MoneyFlowChart({ data }: MoneyFlowChartProps) {
  // Calculate max value for scaling
  const allValues = INVESTOR_KEYS.flatMap((key) => [
    Math.abs(data[key].buy),
    Math.abs(data[key].sell),
  ])
  const maxValue = Math.max(...allValues)

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Money Flow by Investor Type
      </h3>

      <div className="space-y-4">
        {INVESTOR_KEYS.map((investor) => {
          const { buy, sell, net } = data[investor]
          const netColor = getValueColor(net)

          return (
            <div key={investor} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {INVESTOR_LABELS[investor]}
                </span>
                <span
                  className={cn(
                    'font-semibold',
                    netColor === 'up' && 'text-up-600',
                    netColor === 'down' && 'text-down-600',
                    netColor === 'neutral' && 'text-neutral-600'
                  )}
                >
                  {net >= 0 ? '+' : ''}{formatNumber(net, 0)} M
                </span>
              </div>

              <div className="relative h-6 bg-gray-100 rounded overflow-hidden">
                {/* Buy bar (green) */}
                <div
                  className="absolute left-0 top-0 h-full bg-up-500"
                  style={{
                    width: `${(buy / maxValue) * 50}%`,
                  }}
                />

                {/* Sell bar (red) */}
                <div
                  className="absolute right-0 top-0 h-full bg-down-500"
                  style={{
                    width: `${(sell / maxValue) * 50}%`,
                  }}
                />

                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>B: {formatNumber(buy, 0)}M</span>
                <span>S: {formatNumber(sell, 0)}M</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
