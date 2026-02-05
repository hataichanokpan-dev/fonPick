'use client'

/**
 * GradeBadge Component
 *
 * Displays letter grade (A/B/C/D) with meaning and color coding.
 * Based on the 27-point screening score system.
 *
 * Grades:
 * - A (23-27): Excellent - Strong buy candidate
 * - B (18-22): Good - Worth considering
 * - C (14-17): Fair - Hold and watch
 * - D (0-13): Poor - Pass for now
 *
 * Usage:
 * ```tsx
 * <GradeBadge
 *   score={21}
 *   maxScore={27}
 *   locale="th"
 * />
 * ```
 */

import { toDisplayScore } from './utils/display-transformer'

// ============================================================================
// TYPES
// ============================================================================

interface GradeBadgeProps {
  /** Raw score (0-27 for total, 0-10 for layers) */
  score: number
  /** Maximum possible score (default: 27) */
  maxScore?: number
  /** Language preference ('en' | 'th') */
  locale?: 'en' | 'th'
  /** Display size ('sm' | 'md' | 'lg') */
  size?: 'sm' | 'md' | 'lg'
  /** Show description text */
  showDescription?: boolean
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// SIZE CONFIGURATION
// ============================================================================

const SIZE_CONFIG = {
  sm: {
    gradeText: 'text-2xl',
    labelText: 'text-xs',
    descriptionText: 'text-xs',
    padding: 'p-3',
    gap: 'gap-1',
  },
  md: {
    gradeText: 'text-3xl',
    labelText: 'text-sm',
    descriptionText: 'text-xs',
    padding: 'p-4',
    gap: 'gap-1.5',
  },
  lg: {
    gradeText: 'text-4xl',
    labelText: 'text-base',
    descriptionText: 'text-sm',
    padding: 'p-5',
    gap: 'gap-2',
  },
} as const

// ============================================================================
// COMPONENT
// ============================================================================

export function GradeBadge({
  score,
  maxScore = 27,
  locale = 'th',
  size = 'md',
  showDescription = true,
  className = '',
}: GradeBadgeProps) {
  // Get display score with grade, label, and colors
  const display = toDisplayScore(score, maxScore, locale)
  const sizeConfig = SIZE_CONFIG[size]
  const { color, letterGrade, label, description } = display

  return (
    <div className={`${color.bg} ${color.border} rounded-xl ${sizeConfig.padding} ${sizeConfig.gap} ${className}`}>
      {/* Letter Grade */}
      <div className={`${sizeConfig.gradeText} font-bold ${color.text} text-center`}>
        {letterGrade}
      </div>

      {/* Grade Label */}
      <div className={`${sizeConfig.labelText} font-medium ${color.text} text-center`}>
        {label}
      </div>

      {/* Description */}
      {showDescription && (
        <div className={`${sizeConfig.descriptionText} text-text-secondary text-center opacity-90`}>
          {description}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SIMPLE GRADE DISPLAY (COMPONENT VARIANT)
// ============================================================================

/**
 * SimpleGradeDisplay - Minimalist grade badge without background
 *
 * Shows just the grade letter with color indicator
 */
export function SimpleGradeDisplay({
  score,
  maxScore = 27,
  locale = 'th',
  className = '',
}: {
  score: number
  maxScore?: number
  locale?: 'en' | 'th'
  className?: string
}) {
  const display = toDisplayScore(score, maxScore, locale)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Grade Letter with colored background */}
      <span className={`px-2.5 py-1 rounded-lg text-lg font-bold text-white ${display.color.bg.replace('/20', '').replace('/10', '')}`}>
        {display.letterGrade}
      </span>

      {/* Grade Label */}
      <span className={`text-sm font-medium ${display.color.text}`}>
        {display.label}
      </span>
    </div>
  )
}

// ============================================================================
// SCORE + GRADE DISPLAY (COMBINED)
// ============================================================================

/**
 * ScoreWithGrade - Shows both numeric score and grade badge
 *
 * Example:
 * ┌────────────────────────────┐
 * │  21  │  A  ยอดเยี่ยม      │
 * │ /27  │  78%                │
 * └────────────────────────────┘
 */
export function ScoreWithGrade({
  score,
  maxScore = 27,
  locale = 'th',
  className = '',
}: {
  score: number
  maxScore?: number
  locale?: 'en' | 'th'
  className?: string
}) {
  const display = toDisplayScore(score, maxScore, locale)

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Numeric Score */}
      <div className="text-center">
        <div className={`text-3xl font-bold tabular-nums ${display.color.text}`}>
          {score}
        </div>
        <div className="text-xs text-text-secondary">/{maxScore}</div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-border" />

      {/* Percentage */}
      <div className="text-center">
        <div className={`text-3xl font-bold tabular-nums ${display.color.text}`}>
          {display.percentage}%
        </div>
        <div className="text-xs text-text-secondary">{display.label}</div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-border" />

      {/* Grade Badge */}
      <div className={`${display.color.bg} ${display.color.border} rounded-lg px-3 py-2`}>
        <div className={`text-2xl font-bold ${display.color.text}`}>
          {display.letterGrade}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default GradeBadge
