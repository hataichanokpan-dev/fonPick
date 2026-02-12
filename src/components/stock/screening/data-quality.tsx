'use client'

/**
 * Data Quality UI Components
 *
 * Visual components for displaying data quality indicators,
 * badges, banners, and N/A handling in the screening UI.
 */

import { cn } from '@/lib/utils'
import {
  QUALITY_CONFIG,
  getQualityMessage,
  type DataQualityAssessment,
} from '@/lib/entry-plan/data-quality'
import { CheckCircle2, AlertTriangle, AlertCircle, XCircle, HelpCircle } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export type PriceLevel = {
  label: string
  value: number
  color: 'risk' | 'up-primary' | 'text-primary' | 'up-secondary'
  isCurrent?: boolean
  isPrimary?: boolean
}

export type PriceColor = 'risk' | 'down' | 'neutral' | 'up-primary' | 'up-secondary'

// ============================================================================
// DATA QUALITY BADGE
// ============================================================================

export interface DataQualityBadgeProps {
  assessment: DataQualityAssessment
  locale?: 'en' | 'th'
  variant?: 'compact' | 'card' | 'inline'
  showDetails?: boolean
  className?: string
}

export function DataQualityBadge({
  assessment,
  locale = 'th',
  variant = 'compact',
  showDetails = false,
  className,
}: DataQualityBadgeProps) {
  const config = QUALITY_CONFIG[assessment.level]
  const message = getQualityMessage(assessment, locale)

  const icons = {
    CheckCircle: CheckCircle2,
    AlertTriangle,
    AlertCircle,
    XCircle,
    HelpCircle,
  }
  const Icon = icons[config.icon as keyof typeof icons] as any

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <Icon className={cn('w-3.5 h-3.5', config.text)} />
        <span className={cn('text-xs font-medium', config.text)}>
          {config.label[locale]}
        </span>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <span className={cn('text-xs', config.text, className)}>
        {config.label[locale]}
      </span>
    )
  }

  // Card variant
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className={cn('w-4 h-4', config.text)} />
      <div>
        <div className={cn('text-sm font-semibold', config.text)}>
          {message.title}
        </div>
        <div className="text-xs text-text-secondary">
          {message.description}
        </div>
        {showDetails && assessment.missingRequired.length > 0 && (
          <div className="mt-1 text-xs text-text-3">
            {locale === 'th' ? 'ขาด: ' : 'Missing: '}
            {assessment.missingRequired.join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// CONFIDENCE PERCENTAGE
// ============================================================================

export interface ConfidencePercentProps {
  confidence: number // 0-1
  locale?: 'en' | 'th'
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ConfidencePercent({
  confidence,
  locale = 'th',
  showLabel = true,
  size = 'md',
  className,
}: ConfidencePercentProps) {
  const percent = Math.round(confidence * 100)

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const getConfidenceColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-500'
    if (pct >= 50) return 'text-amber-500'
    return 'text-red-500'
  }

  const getConfidenceBg = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500/10'
    if (pct >= 50) return 'bg-amber-500/10'
    return 'bg-red-500/10'
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {showLabel && (
        <span className="text-xs text-text-secondary">
          {locale === 'th' ? 'ความมั่นใจ' : 'Confidence'}
        </span>
      )}
      <div className={cn(
        'px-2 py-0.5 rounded-full font-medium tabular-nums',
        sizeClasses[size],
        getConfidenceBg(percent),
        getConfidenceColor(percent)
      )}>
        {percent}%
      </div>
    </div>
  )
}

// ============================================================================
// DATA QUALITY BANNER
// ============================================================================

export interface DataQualityBannerProps {
  assessment: DataQualityAssessment
  locale?: 'en' | 'th'
  className?: string
}

export function DataQualityBanner({
  assessment,
  locale = 'th',
  className,
}: DataQualityBannerProps) {
  const config = QUALITY_CONFIG[assessment.level]
  const message = getQualityMessage(assessment, locale)

  // Icon mapping
  const icons = {
    CheckCircle: CheckCircle2,
    AlertTriangle,
    AlertCircle,
    XCircle,
    HelpCircle,
  }
  const Icon = icons[config.icon as keyof typeof icons] as any

  // Don't show banner for complete quality
  if (assessment.level === 'complete') {
    return null
  }

  return (
    <div className={cn(
      'mx-4 mt-3 px-3 py-2 rounded-lg border flex items-start gap-2',
      config.bg, config.border,
      className
    )}>
      <Icon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', config.text)} />
      <div className="flex-1 min-w-0">
        <div className={cn('text-xs font-semibold', config.text)}>
          {message.title} 
        </div> 
        <div className="text-xs text-text-secondary line-clamp-1">
          {message.description}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PRICE VISUALIZER
// ============================================================================

export interface PriceVisualizerProps {
  stopLoss?: number | null
  buyPrice?: number | null
  currentPrice: number
  target?: number | null
  locale?: 'en' | 'th'
  className?: string
}

export function PriceVisualizer({
  stopLoss,
  buyPrice,
  currentPrice,
  target,
  locale = 'th',
  className,
}: PriceVisualizerProps) {
  const prices = [stopLoss, buyPrice, currentPrice, target].filter(
    (p): p is number => p !== null && p !== undefined
  )

  if (prices.length === 0) {
    return null
  }

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const range = maxPrice - minPrice

  const getPosition = (price: number) => {
    if (range === 0) return 50
    return ((price - minPrice) / range) * 100
  }

  return (
    <div className={cn('relative h-2 bg-surface-3 rounded-full overflow-hidden', className)}>
      {/* Price markers */}
      {stopLoss && (
        <div
          className="absolute top-0 w-3 h-3 -translate-y-0.5 -translate-x-1.5 rounded-full bg-risk border-2 border-surface"
          style={{ left: `${getPosition(stopLoss)}%` }}
          title={`${locale === 'th' ? 'ตัดขาด' : 'Stop'}: ${stopLoss}`}
        />
      )}
      {buyPrice && (
        <div
          className="absolute top-0 w-3 h-3 -translate-y-0.5 -translate-x-1.5 rounded-full bg-up-primary border-2 border-surface"
          style={{ left: `${getPosition(buyPrice)}%` }}
          title={`${locale === 'th' ? 'ซื้อ' : 'Buy'}: ${buyPrice}`}
        />
      )}
      <div
        className="absolute top-0 w-4 h-4 -translate-y-1 -translate-x-2 rounded-full bg-text-primary border-2 border-surface shadow-lg"
        style={{ left: `${getPosition(currentPrice)}%` }}
        title={`${locale === 'th' ? 'ปัจจุบัน' : 'Current'}: ${currentPrice}`}
      />
      {target && (
        <div
          className="absolute top-0 w-3 h-3 -translate-y-0.5 -translate-x-1.5 rounded-full bg-up-secondary border-2 border-surface"
          style={{ left: `${getPosition(target)}%` }}
          title={`${locale === 'th' ? 'เป้า' : 'Target'}: ${target}`}
        />
      )}
    </div>
  )
}

// ============================================================================
// SIMPLE PRICE BAR
// ============================================================================

export interface SimplePriceBarProps {
  stopLoss?: number | null
  buyPrice: number
  currentPrice: number
  target?: number | null
  className?: string
}

export function SimplePriceBar({
  stopLoss,
  buyPrice,
  currentPrice,
  target,
  className,
}: SimplePriceBarProps) {
  const prices = [stopLoss, buyPrice, currentPrice, target].filter(
    (p): p is number => p !== null && p !== undefined
  )

  if (prices.length === 0) return null

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const range = maxPrice - minPrice || 1

  const formatPrice = (p: number) => {
    return p.toFixed(2)
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {/* Bar visualization */}
      <div className="relative h-6 bg-surface-2 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-1.5 bg-surface-3 rounded-full mx-2 relative">
            {/* Stop Loss marker */}
            {stopLoss && (
              <div
                className="absolute top-0 w-2 h-2 -translate-y-0.25 -translate-x-1 rounded-full bg-risk"
                style={{ left: `${((stopLoss - minPrice) / range) * 100}%` }}
              />
            )}
            {/* Buy price marker */}
            <div
              className="absolute top-0 w-3 h-3 -translate-y-1 -translate-x-1.5 rounded-full bg-up-primary shadow-sm"
              style={{ left: `${((buyPrice - minPrice) / range) * 100}%` }}
            />
            {/* Current price marker */}
            <div
              className="absolute top-0 w-2 h-2 -translate-y-0.25 -translate-x-1 rounded-full bg-text-primary border border-surface"
              style={{ left: `${((currentPrice - minPrice) / range) * 100}%` }}
            />
            {/* Target marker */}
            {target && (
              <div
                className="absolute top-0 w-2 h-2 -translate-y-0.25 -translate-x-1 rounded-full bg-up-secondary"
                style={{ left: `${((target - minPrice) / range) * 100}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Price labels */}
      <div className="flex justify-between text-xs text-text-3 px-1">
        <span>฿{formatPrice(minPrice)}</span>
        <span>฿{formatPrice(maxPrice)}</span>
      </div>
    </div>
  )
}

// ============================================================================
// PRICE DIFF
// ============================================================================

export interface PriceDiffProps {
  from: number
  to: number
  showSign?: boolean
  className?: string
}

export function PriceDiff({
  from,
  to,
  showSign = true,
  className,
}: PriceDiffProps) {
  const diff = to - from
  const pct = (diff / from) * 100
  const isPositive = diff >= 0

  return (
    <span className={cn(
      'tabular-nums',
      isPositive ? 'text-up-primary' : 'text-risk',
      className
    )}>
      {showSign && (isPositive ? '+' : '')}
      {pct.toFixed(1)}%
    </span>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export { calculateDataQuality } from '@/lib/entry-plan/data-quality'
export type { DataQualityAssessment, DataQualityLevel } from '@/lib/entry-plan/data-quality'
