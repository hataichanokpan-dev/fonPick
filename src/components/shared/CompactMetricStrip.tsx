/**
 * CompactMetricStrip Component
 *
 * Horizontal inline display for key metrics (48px height vs ~150px for vertical cards).
 * Replaces vertical metric cards with space-efficient horizontal strip.
 */

import { cn } from '@/lib/utils'

export interface MetricItem {
  label: string
  value: string | number
  color?: 'up' | 'down' | 'neutral'
  trend?: string
}

export interface CompactMetricStripProps {
  metrics: MetricItem[]
  className?: string
  separator?: boolean
}

/**
 * Map color type to Tailwind classes
 */
function getColorClasses(color: 'up' | 'down' | 'neutral' = 'neutral'): string {
  const colorMap = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  }
  return colorMap[color]
}

/**
 * Format value for display
 */
function formatValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  return String(value)
}

/**
 * CompactMetricStrip Component
 *
 * Displays metrics in a horizontal strip layout with optional separators.
 *
 * @example
 * ```tsx
 * <CompactMetricStrip
 *   metrics={[
 *     { label: 'Volume', value: '1.5M', color: 'up' },
 *     { label: 'Change', value: '+2.5%', color: 'up', trend: '▲ 10%' },
 *     { label: 'PE', value: '15.2', color: 'neutral' },
 *   ]}
 *   separator={true}
 * />
 * ```
 */
export function CompactMetricStrip({
  metrics,
  className,
  separator = true,
}: CompactMetricStripProps) {
  if (!metrics || metrics.length === 0) {
    return <div className={cn('flex flex-row items-center h-12', className)} />
  }

  return (
    <div
      role="group"
      className={cn('flex flex-row items-center gap-3 h-12', className)}
    >
      {metrics.map((metric, index) => {
        const valueColor = getColorClasses(metric.color)
        const formattedValue = formatValue(metric.value)
        const showSeparator = separator && index < metrics.length - 1

        return (
          <div
            key={`${metric.label}-${index}`}
            className="flex items-center gap-2"
          >
            {/* Label */}
            <span className="text-xs text-gray-500 font-medium">
              {metric.label}
            </span>

            {/* Value */}
            <span className={cn('text-sm font-semibold', valueColor)}>
              {formattedValue}
            </span>

            {/* Optional Trend Indicator */}
            {metric.trend && (
              <span className="text-xs text-gray-400">{metric.trend}</span>
            )}

            {/* Separator (if enabled and not last item) */}
            {showSeparator && (
              <span
                data-testid="metric-separator"
                className="text-gray-600 mx-1"
                aria-hidden="true"
              >
                |
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
