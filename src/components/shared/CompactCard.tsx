/**
 * CompactCard Component
 *
 * A smaller, more compact version of Card designed for module display.
 * Features:
 * - Smaller padding (12px vs 16px)
 * - Larger numbers (24-32px for key data)
 * - Clear visual hierarchy
 * - Optional header badge slot
 * - Optional footer slot
 *
 * Theme: Green-tinted dark with teal up / soft red down
 */

import { cn } from '@/lib/utils'
import type { CompactCardProps } from '@/types'

export function CompactCard({
  children,
  className,
  variant = 'default',
  headerBadge,
  footer,
  title,
  subtitle,
}: CompactCardProps) {
  const variants = {
    default: 'bg-surface border border-border rounded-lg shadow-sm',
    outlined: 'bg-transparent border border-border rounded-lg',
    elevated: 'bg-surface-1 border border-border rounded-lg shadow-soft',
    success: 'bg-buy-bg/30 border border-up/30 rounded-lg shadow-sm',
    warning: 'bg-warn/20 border border-warn/30 rounded-lg shadow-sm',
    danger: 'bg-sell-bg/30 border border-down/30 rounded-lg shadow-sm',
  }

  return (
    <div className={cn(variants[variant], 'p-3 flex flex-col', className)}>
      {/* Header Section */}
      {(title || headerBadge) && (
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            {title && (
              <h3 className="text-sm font-semibold text-text-2">{title}</h3>
            )}
            {subtitle && (
              <span className="text-xs text-text-muted">{subtitle}</span>
            )}
          </div>
          {headerBadge && (
            <div className="flex items-center gap-1.5">
              {headerBadge}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        {children}
      </div>

      {/* Footer Section */}
      {footer && (
        <div className="mt-2.5 pt-2.5 border-t border-border">
          {footer}
        </div>
      )}
    </div>
  )
}

/**
 * CompactMetric - Helper component for displaying key metrics
 * with large numbers and clear labels
 */
export interface CompactMetricProps {
  /** The main value to display (large number) */
  value: string | number
  /** Label for the metric */
  label: string
  /** Trend indicator */
  trend?: 'up' | 'down' | 'neutral'
  /** Whether to highlight the value (larger size) */
  highlight?: boolean
  /** Additional CSS classes */
  className?: string
  /** Optional sub-value (e.g., percentage) */
  subValue?: string | number
  /** Optional icon */
  icon?: React.ReactNode
}

export function CompactMetric({
  value,
  label,
  trend,
  highlight = false,
  className,
  subValue,
  icon,
}: CompactMetricProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-up'
    if (trend === 'down') return 'text-down'
    return 'text-flat'
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-[10px] uppercase tracking-wide text-text-muted">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        {icon && <span className="text-text-muted">{icon}</span>}
        <span
          className={cn(
            'font-semibold tabular-nums',
            highlight ? 'text-2xl' : 'text-lg',
            getTrendColor()
          )}
        >
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-text-muted">{subValue}</span>
        )}
      </div>
    </div>
  )
}

/**
 * CompactStatGrid - Helper component for displaying a grid of stats
 */
export interface CompactStatGridProps {
  /** Stat items to display */
  stats: Array<{
    value: string | number
    label: string
    trend?: 'up' | 'down' | 'neutral'
    highlight?: boolean
  }>
  /** Number of columns */
  columns?: 2 | 3 | 4
  /** Additional CSS classes */
  className?: string
}

export function CompactStatGrid({
  stats,
  columns = 3,
  className,
}: CompactStatGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <div className={cn('grid gap-2', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <CompactMetric
          key={index}
          value={stat.value}
          label={stat.label}
          trend={stat.trend}
          highlight={stat.highlight}
        />
      ))}
    </div>
  )
}

/**
 * CompactGauge - Helper component for displaying small gauge indicators
 */
export interface CompactGaugeProps {
  /** Value (0-100) */
  value: number
  /** Label */
  label?: string
  /** Size of the gauge */
  size?: number
  /** Additional CSS classes */
  className?: string
  /** Whether to show percentage in center */
  showValue?: boolean
}

export function CompactGauge({
  value,
  label,
  size = 48,
  className,
  showValue = true,
}: CompactGaugeProps) {
  const percentage = Math.max(0, Math.min(100, value))

  // Determine color based on value
  const getGaugeColor = (): { bg: string; fill: string } => {
    if (value >= 60) return { bg: 'rgba(46, 216, 167, 0.2)', fill: '#2ED8A7' }
    if (value >= 40) return { bg: 'rgba(174, 183, 179, 0.2)', fill: '#AEB7B3' }
    return { bg: 'rgba(244, 91, 105, 0.2)', fill: '#F45B69' }
  }

  const colors = getGaugeColor()
  const circumference = 2 * Math.PI * ((size - 6) / 2)
  const dashOffset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - 6) / 2}
            fill="none"
            stroke={colors.bg}
            strokeWidth="5"
          />
          {/* Foreground arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - 6) / 2}
            fill="none"
            stroke={colors.fill}
            strokeWidth="5"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashOffset,
              transition: 'stroke-dashoffset 0.6s ease-out',
            }}
          />
        </svg>
        {/* Center text */}
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color: colors.fill }}>
              {value}
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="text-[10px] uppercase tracking-wide text-text-muted">
          {label}
        </span>
      )}
    </div>
  )
}

export default CompactCard
