/**
 * MarketContextCard Component
 * Base card component for market context metrics
 */

import { Card } from '@/components/shared'

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
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const trendColors = {
  up: '#22C55E',
  down: '#EF4444',
  neutral: '#94A3B8',
}

export function MarketContextCard({
  label,
  value,
  trend,
  size = 'md',
  className = '',
}: MarketContextCardProps) {
  return (
    <Card variant="default" className={`p-3 ${className}`}>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className={`font-semibold ${sizeStyles[size]}`} style={{ color: '#E5E7EB' }}>
            {value}
          </span>
          {trend && (
            <span
              className="text-xs font-medium"
              style={{ color: trendColors[trend.direction] }}
            >
              {trend.direction === 'up' && '▲'}
              {trend.direction === 'down' && '▼'}
              {trend.direction === 'neutral' && '─'}
              {Math.abs(trend.value) > 0 && ` ${Math.abs(trend.value).toFixed(1)}%`}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
