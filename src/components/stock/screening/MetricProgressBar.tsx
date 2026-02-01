'use client'

/**
 * Metric Progress Bar Component
 *
 * Displays a metric with progress bar visualization.
 * Supports both compact (mobile) and expanded (desktop) modes.
 */

import { getScoreColorClasses } from './constants'
import type { MetricProgressBarProps } from './types'
import { Check, X, Minus } from 'lucide-react'

export function MetricProgressBar({
  score,
  maxScore = 10,
  label,
  thaiLabel,
  value,
  points,
  maxPoints,
  status,
  showValue = true,
  compact = true,
  className = '',
}: MetricProgressBarProps) {
  const colors = getScoreColorClasses(score)
  const percentage = (score / maxScore) * 100

   
  // Status icon
  const StatusIcon = () => {
    if (status === 'pass') {
      return <Check className="w-3.5 h-3.5" strokeWidth={3} />
    }
    if (status === 'fail') {
      return <X className="w-3.5 h-3.5" strokeWidth={3} />
    }
    return <Minus className="w-3.5 h-3.5" strokeWidth={3} />
  }

  // Compact mode (mobile)
  if (compact) {
    return (
      <div className={`metric-progress-bar-compact ${className}`}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {/* Label and status icon */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span
              className={`text-xs font-medium ${status === 'pass' ? 'text-up-primary' : status === 'fail' ? 'text-risk' : 'text-insight'}`}
            >
              <StatusIcon />
            </span>
            <span className="text-sm text-text-secondary truncate">
              {thaiLabel || label}
            </span>
          </div>

          {/* Score and points */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-sm font-semibold tabular-nums ${colors.text}`}>
              {score}/{maxScore}
            </span>
            {points !== undefined && maxPoints !== undefined && (
              <span className="text-xs text-text-3 tabular-nums">
                ({points} pts)
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-surface-3 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${colors.progress}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Value display */}
        {showValue && value && (
          <div className="mt-1 text-xs text-text-3 tabular-nums">
            {value}
          </div>
        )}
      </div>
    )
  }

  // Expanded mode (desktop)
  return (
    <div className={`metric-progress-bar-expanded ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-2">
        {/* Left: Label and value */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-medium ${status === 'pass' ? 'text-up-primary' : status === 'fail' ? 'text-risk' : 'text-insight'}`}
            >
              <StatusIcon />
            </span>
            <span className="text-sm text-text-secondary">
              {label}
            </span>
            {thaiLabel && (
              <span className="text-sm text-text-3">
                ({thaiLabel})
              </span>
            )}
          </div>
          {showValue && value && (
            <div className="text-xs text-text-3 tabular-nums ml-5">
              {value}
            </div>
          )}
        </div>

        {/* Right: Score bar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Progress bar */}
          <div className="relative w-24 h-2 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${colors.progress}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Score */}
          <span className={`text-sm font-semibold tabular-nums ${colors.text} w-12 text-right`}>
            {score}
            <span className="text-text-3">/{maxScore}</span>
          </span>

          {/* Points */}
          {points !== undefined && maxPoints !== undefined && (
            <span className="text-xs text-text-3 tabular-nums w-16 text-right">
              ({points}/{maxPoints})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * CompactMetricRow - Simple row for dense layouts
 */
interface CompactMetricRowProps {
  label: string
  thaiLabel?: string
  value: string
  status: 'pass' | 'fail' | 'partial'
  className?: string
}

export function CompactMetricRow({
  label,
  thaiLabel,
  value,
  status,
  className = '',
}: CompactMetricRowProps) {
  const statusColors = {
    pass: 'text-up-primary bg-up-soft border-up-primary',
    fail: 'text-risk bg-risk/20 border-risk',
    partial: 'text-insight bg-insight/20 border-insight',
  }

  const StatusIcon = () => {
    if (status === 'pass') {
      return <Check className="w-3 h-3" strokeWidth={3} />
    }
    if (status === 'fail') {
      return <X className="w-3 h-3" strokeWidth={3} />
    }
    return <Minus className="w-3 h-3" strokeWidth={3} />
  }

  return (
    <div className={`compact-metric-row ${className}`}>
      <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
        <div className="flex items-center gap-2">
          <span className={`p-1 rounded ${statusColors[status].split(' ')[1]} ${statusColors[status].split(' ')[2]}`}>
            <StatusIcon />
          </span>
          <span className="text-sm text-text-secondary">
            {thaiLabel || label}
          </span>
        </div>
        <span className={`text-sm font-semibold tabular-nums ${statusColors[status].split(' ')[0]}`}>
          {value}
        </span>
      </div>
    </div>
  )
}
