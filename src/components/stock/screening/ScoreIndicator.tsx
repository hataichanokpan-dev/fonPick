'use client'

/**
 * ScoreIndicator Component
 *
 * Simple status indicator for stock screening metrics.
 * Replaces MetricProgressBar with cleaner pass/fail/partial display.
 *
 * Shows:
 * - Status icon (✓ / ✗ / −)
 * - Metric name (Thai/English)
 * - Actual value (e.g., "15.2%")
 *
 * Usage:
 * ```tsx
 * <ScoreIndicator
 *   status="pass"
 *   label="PE Ratio"
 *   thaiLabel="PE vs Band"
 *   value="12.5x - ถูก"
 *   locale="th"
 *   compact
 * />
 * ```
 */

import { Check, X, Minus } from 'lucide-react'
import type { MetricStatus } from './types'

// ============================================================================
// TYPES
// ============================================================================

interface ScoreIndicatorProps {
  /** Metric status (pass/fail/partial) */
  status: MetricStatus
  /** Metric name (English) */
  label: string
  /** Metric name (Thai) - optional, will be displayed first */
  thaiLabel?: string
  /** Actual metric value to display (e.g., "15.2%", "฿12.50") */
  value: string
  /** Points earned for this metric (0-2) */
  points?: number
  /** Maximum points possible for this metric (1-2) */
  maxPoints?: number
  /** Language preference ('en' | 'th') */
  locale?: 'en' | 'th'
  /** Compact mode (single row) */
  compact?: boolean
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Visual configuration for each status
 */
const STATUS_CONFIG = {
  pass: {
    icon: Check,
    bgColor: 'bg-up-soft',
    textColor: 'text-up-primary',
    iconBg: 'bg-up-primary',
    borderColor: 'border-up-primary/20',
    badgeBg: 'bg-up-soft',
    badgeText: 'text-up-primary',
  },
  fail: {
    icon: X,
    bgColor: 'bg-risk/10',
    textColor: 'text-risk',
    iconBg: 'bg-risk',
    borderColor: 'border-risk/20',
    badgeBg: 'bg-risk/10',
    badgeText: 'text-risk',
  },
  partial: {
    icon: Minus,
    bgColor: 'bg-insight/20',
    textColor: 'text-insight',
    iconBg: 'bg-insight',
    borderColor: 'border-insight/20',
    badgeBg: 'bg-insight/20',
    badgeText: 'text-insight',
  },
} as const

// ============================================================================
// COMPONENT
// ============================================================================

export function ScoreIndicator({
  status,
  label,
  thaiLabel,
  value,
  points,
  maxPoints,
  locale = 'th',
  compact = false,
  className = '',
}: ScoreIndicatorProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  const displayLabel = locale === 'th' && thaiLabel ? thaiLabel : label
  const showSubtitle = locale === 'th' && thaiLabel && thaiLabel !== label

  // Points badge - show only if both points and maxPoints are provided
  const showPointsBadge = points !== undefined && maxPoints !== undefined

  // Determine badge styling based on points earned
  const getBadgeConfig = () => {
    if (points === undefined || maxPoints === undefined) return null

    const ratio = points / maxPoints
    if (ratio >= 1) {
      // Full points (2/2, 1/1)
      return {
        bg: 'bg-up-soft',
        text: 'text-up-primary',
        border: 'border-up-primary/20',
      }
    } else if (ratio > 0) {
      // Partial points (1/2)
      return {
        bg: 'bg-insight/20',
        text: 'text-insight',
        border: 'border-insight/20',
      }
    } else {
      // No points (0/2, 0/1)
      return {
        bg: 'bg-risk/10',
        text: 'text-risk',
        border: 'border-risk/20',
      }
    }
  }

  const badgeConfig = getBadgeConfig()

  // Points badge component
  const PointsBadge = () => {
    if (!showPointsBadge || !badgeConfig) return null

    return (
      <span
        className={`px-1.5 py-0.5 rounded text-xs font-medium tabular-nums ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border} border`}
        aria-label={`ได้ ${points} จาก ${maxPoints} คะแนน`}
      >
        {points}/{maxPoints}
      </span>
    )
  }

  // Compact mode: Single row, icon + label + value + points badge
  if (compact) {
    return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
        {/* Left: Icon + Label */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${config.iconBg}`}>
            <Icon className="w-3 h-3 text-white" strokeWidth={3} />
          </span>
          <span className="text-xs text-text-primary truncate">
            {displayLabel}
          </span>
        </div>

        {/* Right: Value + Points Badge */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className={`text-xs font-semibold tabular-nums ${config.textColor}`}>
            {value}
          </span>
          <PointsBadge />
        </div>
      </div>
    )
  }

  // Full mode: Card with icon + label + subtitle + value + points badge
  return (
    <div className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon + Label + Subtitle */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${config.iconBg}`}>
            <Icon className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-text-primary">
              {displayLabel}
            </div>
            {showSubtitle && (
              <div className="text-xs text-text-secondary mt-0.5">
                {label}
              </div>
            )}
          </div>
        </div>

        {/* Right: Value + Points Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold tabular-nums ${config.textColor}`}>
            {value}
          </span>
          <PointsBadge />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ScoreIndicator
