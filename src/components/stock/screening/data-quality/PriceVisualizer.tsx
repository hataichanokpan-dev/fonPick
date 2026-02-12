/**
 * Price Visualizer Component
 *
 * Horizontal bar visualization showing price levels (Stop, Buy, Current, Target)
 * with clear visual hierarchy for easy understanding
 */

import { formatCurrency } from '../utils/formatters'
import { safeToFixed } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface PriceLevel {
  label: string
  value: number
  color: 'risk' | 'up-primary' | 'text-primary' | 'teal' | 'purple'
  isCurrent?: boolean
  isPrimary?: boolean
}

export interface PriceVisualizerProps {
  levels: PriceLevel[]
  currentValue: number
  locale?: 'en' | 'th'
  className?: string
  compact?: boolean
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PriceVisualizer({
  levels,
  currentValue,
  locale = 'th',
  className,
  compact = false,
}: PriceVisualizerProps) {
  // Find range for visualization
  const allValues = levels.map((l) => l.value)
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const range = maxValue - minValue

  // Guard against division by zero
  if (range === 0) {
    return null
  }

  // Calculate positions (0-100%)
  const getPosition = (value: number) => ((value - minValue) / range) * 100

  // Color mapping
  const colorClasses = {
    risk: 'bg-risk',
    'up-primary': 'bg-up-primary',
    'text-primary': 'bg-text-primary',
    teal: 'bg-teal-500',
    purple: 'bg-purple-500',
  }

  const textColorClasses = {
    risk: 'text-risk',
    'up-primary': 'text-up-primary',
    'text-primary': 'text-text-primary',
    teal: 'text-teal-500',
    purple: 'text-purple-500',
  }

  // Height based on compact mode
  const height = compact ? 'h-8' : 'h-12'

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <div className="flex justify-between text-xs text-text-3">
        <span>{locale === 'th' ? 'ระดับราคาและเป้าหมาย' : 'Price Levels'}</span>
        <span className="tabular-nums">
          {formatCurrency(minValue)} - {formatCurrency(maxValue)}
        </span>
      </div>

      {/* Visualizer bar */}
      <div className={cn('relative bg-surface-2 rounded-lg overflow-hidden', height)}>
        {/* Background track */}
        <div className={cn('absolute inset-0 bg-surface-3', compact ? 'inset-y-1 inset-x-1 rounded' : 'inset-y-3 inset-x-1 rounded')} />

        {/* Price markers */}
        {levels.map((level, index) => {
          const position = getPosition(level.value)
          const bgColor = colorClasses[level.color]
          const textColor = textColorClasses[level.color]

          return (
            <PriceMarker
              key={`${level.label}-${index}`}
              label={level.label}
              value={level.value}
              position={position}
              color={textColor}
              bgColor={bgColor}
              isCurrent={level.isCurrent}
              isPrimary={level.isPrimary}
              compact={compact}
            />
          )
        })}
      </div>

      {/* Current price indicator line (external) */}
      {!compact && (
        <div className="flex justify-center">
          <span className="text-xs text-text-3">
            {locale === 'th' ? 'ราคาปัจจุบัน: ' : 'Current: '}
            <span className="font-bold text-text-primary tabular-nums">
              {formatCurrency(currentValue)}
            </span>
          </span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// PRICE MARKER COMPONENT
// ============================================================================

export interface PriceMarkerProps {
  label: string
  value: number
  position: number // 0-100
  color: string // Tailwind text class
  bgColor: string // Tailwind bg class
  isCurrent?: boolean
  isPrimary?: boolean
  compact?: boolean
}

function PriceMarker({
  label,
  value,
  position,
  color,
  bgColor,
  isCurrent,
  isPrimary,
  compact,
}: PriceMarkerProps) {
  // Calculate left position with padding (4% on each side)
  const leftPos = `calc(4% + ${position * 92}%)`

  // Width based on importance
  const width = isCurrent ? 'w-1' : 'w-0.5'

  return (
    <div
      className={cn(
        'absolute flex flex-col items-center',
        isCurrent ? 'z-10 top-0 bottom-0' : 'z-0',
        !isCurrent && (compact ? 'top-1 bottom-1' : 'top-3 bottom-3')
      )}
      style={{ left: leftPos }}
    >
      {/* Top label (above bar) */}
      {!compact && (
        <div className="-mt-1 px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap">
          <span className={isPrimary ? `${bgColor} text-white` : 'bg-surface-3 text-text-3'}>
            {formatCurrency(value)}
          </span>
        </div>
      )}

      {/* Vertical line */}
      <div
        className={cn(
          'flex-1 mt-0.5',
          width,
          isCurrent ? 'bg-text-primary' : bgColor
        )}
      />

      {/* Bottom label (below bar) */}
      <div className="-mb-0.5 text-xs text-text-3 font-medium">
        {label}
      </div>

      {/* Compact mode: show value below */}
      {compact && (
        <div className="-mb-1 text-xs font-medium tabular-nums">
          <span className={color}>{formatCurrency(value)}</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SIMPLE PRICE BAR (Alternative minimal version)
// ============================================================================

export interface SimplePriceBarProps {
  stopLoss?: number
  buyPrice: number
  currentPrice: number
  target?: number
  locale?: 'en' | 'th'
  className?: string
}

/**
 * Simplified price bar for quick reference
 */
export function SimplePriceBar({
  stopLoss,
  buyPrice,
  currentPrice,
  target,
  locale = 'th',
  className,
}: SimplePriceBarProps) {
  // Build levels array
  const levels: PriceLevel[] = []

  if (stopLoss) {
    levels.push({
      label: locale === 'th' ? 'ตัดขาด' : 'Stop',
      value: stopLoss,
      color: 'risk',
    })
  }

  levels.push({
    label: locale === 'th' ? 'ซื้อ' : 'Buy',
    value: buyPrice,
    color: 'up-primary',
  })

  levels.push({
    label: locale === 'th' ? 'ปัจจุบัน' : 'Curr',
    value: currentPrice,
    color: 'text-primary',
    isCurrent: true,
  })

  if (target) {
    levels.push({
      label: locale === 'th' ? 'เป้า' : 'Tgt',
      value: target,
      color: 'up-primary',
      isPrimary: true,
    })
  }

  return <PriceVisualizer levels={levels} currentValue={currentPrice} locale={locale} compact className={className} />
}

// ============================================================================
// PRICE DIFFERENCE INDICATOR
// ============================================================================

export interface PriceDiffProps {
  from: number
  to: number
  showAbsolute?: boolean
  className?: string
}

/**
 * Show percentage difference between two prices
 */
export function PriceDiff({ from, to, showAbsolute = false, className }: PriceDiffProps) {
  const diff = to - from
  const percent = (diff / from) * 100
  const isPositive = percent >= 0

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className={cn('text-sm font-medium tabular-nums', isPositive ? 'text-up-primary' : 'text-risk')}>
        {isPositive ? '+' : ''}{safeToFixed(percent, 1)}%
      </span>
      {showAbsolute && (
        <span className="text-xs text-text-3 tabular-nums">
          ({isPositive ? '+' : ''}{formatCurrency(diff)})
        </span>
      )}
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default PriceVisualizer
