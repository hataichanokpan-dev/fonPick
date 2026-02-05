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
  },
  fail: {
    icon: X,
    bgColor: 'bg-risk/10',
    textColor: 'text-risk',
    iconBg: 'bg-risk',
    borderColor: 'border-risk/20',
  },
  partial: {
    icon: Minus,
    bgColor: 'bg-insight/20',
    textColor: 'text-insight',
    iconBg: 'bg-insight',
    borderColor: 'border-insight/20',
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
  locale = 'th',
  compact = false,
  className = '',
}: ScoreIndicatorProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  const displayLabel = locale === 'th' && thaiLabel ? thaiLabel : label
  const showSubtitle = locale === 'th' && thaiLabel && thaiLabel !== label

  // Compact mode: Single row, icon + label + value
  if (compact) {
    return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
        {/* Left: Icon + Label */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${config.iconBg}`}>
            <Icon className="w-3 h-3 text-white" strokeWidth={3} />
          </span>
          <span className="text-sm text-text-primary truncate">
            {displayLabel}
          </span>
        </div>

        {/* Right: Value */}
        <span className={`text-sm font-semibold tabular-nums shrink-0 ml-2 ${config.textColor}`}>
          {value}
        </span>
      </div>
    )
  }

  // Full mode: Card with icon + label + subtitle + value
  return (
    <div className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon + Label + Subtitle */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${config.iconBg}`}>
            <Icon className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-text-primary">
              {displayLabel}
            </div>
            {showSubtitle && (
              <div className="text-xs text-text-secondary mt-0.5">
                {label}
              </div>
            )}
          </div>
        </div>

        {/* Right: Value */}
        <span className={`text-sm font-semibold tabular-nums shrink-0 ${config.textColor}`}>
          {value}
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ScoreIndicator
