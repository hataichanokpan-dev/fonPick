'use client'

/**
 * Score Badge Component
 *
 * Displays a score in a badge format with color coding based on performance.
 * Supports multiple sizes and styles.
 */

import { getScoreColorClasses, SCORE_THRESHOLDS } from './constants'

interface ScoreBadgeProps {
  score: number
  maxScore?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  label?: string
  thaiLabel?: string
  variant?: 'default' | 'subtle' | 'solid'
  className?: string
}

/**
 * Size configurations
 */
const SIZE_CONFIG = {
  sm: {
    container: 'px-2 py-1',
    score: 'text-sm',
    label: 'text-xs',
  },
  md: {
    container: 'px-3 py-1.5',
    score: 'text-base',
    label: 'text-xs',
  },
  lg: {
    container: 'px-4 py-2',
    score: 'text-lg',
    label: 'text-sm',
  },
  xl: {
    container: 'px-5 py-3',
    score: 'text-xl',
    label: 'text-sm',
  },
} as const

/**
 * Variant configurations
 */
const VARIANT_CONFIG = {
  default: {
    container: 'border',
    bg: true,
  },
  subtle: {
    container: '',
    bg: true,
  },
  solid: {
    container: '',
    bg: false,
  },
} as const

export function ScoreBadge({
  score,
  maxScore = 10,
  size = 'md',
  showLabel = false,
  label,
  thaiLabel,
  variant = 'default',
  className = '',
}: ScoreBadgeProps) {
  const colors = getScoreColorClasses(score)
  const sizeConfig = SIZE_CONFIG[size]
  const variantConfig = VARIANT_CONFIG[variant]

  // Determine grade label based on score
  const getGradeLabel = () => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'A'
    if (score >= SCORE_THRESHOLDS.GOOD) return 'B'
    if (score >= SCORE_THRESHOLDS.FAIR) return 'C'
    if (score >= SCORE_THRESHOLDS.POOR) return 'D'
    return 'F'
  }

  // Build container classes
  const containerClasses = [
    'inline-flex items-center gap-2 rounded-lg transition-all duration-200',
    sizeConfig.container,
    variantConfig.container,
    variantConfig.bg ? colors.bg : '',
    variant === 'default' ? colors.border : '',
    variant === 'solid' ? colors.text.replace('text-', 'bg-') : '',
    variant === 'solid' ? 'text-white' : colors.text,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClasses}>
      {/* Grade letter (optional indicator) */}
      {variant === 'solid' && (
        <span className={`font-bold ${sizeConfig.score}`}>
          {getGradeLabel()}
        </span>
      )}

      {/* Score */}
      <span className={`font-semibold tabular-nums ${sizeConfig.score}`}>
        {score}
        <span className="opacity-60">/{maxScore}</span>
      </span>

      {/* Label */}
      {showLabel && (label || thaiLabel) && (
        <span className={`font-medium ${sizeConfig.label}`}>
          {thaiLabel || label}
        </span>
      )}
    </div>
  )
}

/**
 * LayerScoreBadge - Badge for layer scores
 */
interface LayerScoreBadgeProps {
  layer: number
  score: number
  maxScore: number
  title: string
  thaiTitle?: string
  passed?: boolean
  className?: string
}

export function LayerScoreBadge({
  layer,
  score,
  maxScore,
  title,
  thaiTitle,
  passed,
  className = '',
}: LayerScoreBadgeProps) {
  const colors = getScoreColorClasses(score)
  const percentage = Math.round((score / maxScore) * 100)

  return (
    <div className={`layer-score-badge ${className}`}>
      <div className="flex items-center gap-3">
        {/* Layer indicator */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${colors.bg} ${colors.text}`}>
          {layer}
        </div>

        {/* Score info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-text-secondary">
              {thaiTitle || title}
            </span>
            {passed !== undefined && (
              <span className={`text-xs ${passed ? 'text-up-primary' : 'text-warn'}`}>
                {passed ? '✓' : '⚠'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Progress bar */}
            <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${colors.progress}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {/* Score */}
            <span className={`text-sm font-semibold tabular-nums ${colors.text} w-12 text-right`}>
              {score}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * TotalScoreDisplay - Large display for total score
 */
interface TotalScoreDisplayProps {
  score: number
  maxScore: number
  percentage: number
  className?: string
}

export function TotalScoreDisplay({
  score,
  maxScore,
  percentage,
  className = '',
}: TotalScoreDisplayProps) {
  const colors = getScoreColorClasses(score)

  return (
    <div className={`total-score-display ${className}`}>
      {/* Score circle */}
      <div className="relative w-32 h-32 mx-auto">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className="stroke-surface-3"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={colors.progress.replace('bg-', 'stroke-')}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold tabular-nums ${colors.text}`}>
            {score}
          </span>
          <span className="text-xs text-text-3">
            / {maxScore}
          </span>
        </div>
      </div>

      {/* Percentage text */}
      <div className="text-center mt-4">
        <span className={`text-lg font-semibold ${colors.text}`}>
          {Math.round(percentage)}%
        </span>
        <span className="text-sm text-text-3 ml-1">
          of maximum
        </span>
      </div>
    </div>
  )
}
