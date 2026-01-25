/**
 * MarketContextCard Component
 * Base card component for market context metrics
 * Based on: docs/design_rules.md
 *
 * Phase 4: Updated with compact design tokens
 */

import { Card } from '@/components/shared'
import { formatDecimal } from '@/lib/utils'

interface TrendData {
  value: number
  direction: 'up' | 'down' | 'neutral'
}

interface MarketContextCardProps {
  label: string
  value: string | number
  trend?: TrendData
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

const trendColors = {
  up: '#4ade80',    // up-primary (green)
  down: '#ff6b6b',  // down-primary (soft red)
  neutral: '#9ca3af', // neutral
}

export function MarketContextCard({
  label,
  value,
  trend,
  size = 'md',
  className = '',
}: MarketContextCardProps) {
  return (
    <Card variant="default" className={`p-2 ${className}`}>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wide text-text-tertiary">
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className={`font-semibold ${sizeStyles[size]} text-text-primary`}>
            {value}
          </span>
          {trend && (
            <span
              className="text-[10px] font-medium tabular-nums"
              style={{ color: trendColors[trend.direction] }}
            >
              {trend.direction === 'up' && '▲'}
              {trend.direction === 'down' && '▼'}
              {trend.direction === 'neutral' && '─'}
              {Math.abs(trend.value) > 0 && ` ${formatDecimal(Math.abs(trend.value), 1)}%`}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
