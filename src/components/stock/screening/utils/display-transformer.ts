/**
 * Display Transformer for Stock Screening Scores
 *
 * Transforms internal scores (27-point system) into user-friendly display formats:
 * - Percentage (0-100%)
 * - Letter grade (A/B/C/D)
 * - Status labels (Thai/English)
 */

import type { ScoreColorClasses } from '../types'

// ============================================================================
// TYPES
// ============================================================================

export interface DisplayScore {
  percentage: number
  letterGrade: 'A' | 'B' | 'C' | 'D'
  status: 'excellent' | 'good' | 'fair' | 'poor'
  label: string
  description: string
  color: ScoreColorClasses
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Grade thresholds based on 27-point system
 * Aligned with decision thresholds:
 * - A: 23-27 (85%+) = Excellent Buy candidate
 * - B: 18-22 (67-84%) = Good Consider
 * - C: 14-17 (50-66%) = Hold/Watch
 * - D: 0-13 (<50%) = Pass
 */
const GRADE_THRESHOLDS = {
  A_MIN: 23,      // 85% of 27
  B_MIN: 18,      // 67% of 27
  C_MIN: 14,      // 50% of 27
} as const

/**
 * Status labels in Thai and English
 */
const STATUS_LABELS = {
  excellent: {
    en: 'Excellent',
    th: 'ยอดเยี่ยม',
    description: {
      en: 'Strong buy candidate',
      th: 'แนะนำซื้อ',
    },
  },
  good: {
    en: 'Good',
    th: 'ดี',
    description: {
      en: 'Worth considering',
      th: 'น่าสนใจ',
    },
  },
  fair: {
    en: 'Fair',
    th: 'ปานกลาง',
    description: {
      en: 'Hold and watch',
      th: 'คงไว้ก่อน',
    },
  },
  poor: {
    en: 'Poor',
    th: 'อ่อน',
    description: {
      en: 'Pass for now',
      th: 'ไม่แนะนำ',
    },
  },
} as const

/**
 * Color classes for each status/grade
 *
 * Grade colors using project theme colors:
 * - A (Excellent): up-primary - Strong buy candidate
 * - B (Good): up - Worth considering
 * - C (Fair): insight - Hold and watch
 * - D (Poor): risk - Pass for now
 */
const STATUS_COLORS: Record<DisplayScore['status'], ScoreColorClasses> = {
  excellent: {
    text: 'text-up-primary',
    bg: 'bg-up-soft',
    border: 'border-up-primary',
    progress: 'bg-up-primary',
  },
  good: {
    text: 'text-up',
    bg: 'bg-up-soft',
    border: 'border-up-strong',
    progress: 'bg-up',
  },
  fair: {
    text: 'text-insight',
    bg: 'bg-insight/20',
    border: 'border-insight',
    progress: 'bg-insight',
  },
  poor: {
    text: 'text-risk',
    bg: 'bg-risk/20',
    border: 'border-risk',
    progress: 'bg-risk',
  },
}

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Convert raw score to display format with percentage, grade, and labels
 *
 * @param score - Raw score (0-27 for total, or 0-10 for individual layers)
 * @param maxScore - Maximum possible score (27 for total, 10 for layers)
 * @param locale - Language preference ('en' | 'th')
 * @returns Display score with percentage, grade, labels, and colors
 */
export function toDisplayScore(
  score: number,
  maxScore: number = 27,
  locale: 'en' | 'th' = 'th'
): DisplayScore {
  // Calculate percentage
  const percentage = Math.round((score / maxScore) * 100)

  // Determine grade and status
  let letterGrade: DisplayScore['letterGrade']
  let status: DisplayScore['status']

  if (score >= GRADE_THRESHOLDS.A_MIN) {
    letterGrade = 'A'
    status = 'excellent'
  } else if (score >= GRADE_THRESHOLDS.B_MIN) {
    letterGrade = 'B'
    status = 'good'
  } else if (score >= GRADE_THRESHOLDS.C_MIN) {
    letterGrade = 'C'
    status = 'fair'
  } else {
    letterGrade = 'D'
    status = 'poor'
  }

  // Get labels
  const labels = STATUS_LABELS[status]
  const label = labels[locale === 'en' ? 'en' : 'th']
  const description = labels.description[locale === 'en' ? 'en' : 'th']
  const color = STATUS_COLORS[status]

  return {
    percentage,
    letterGrade,
    status,
    label,
    description,
    color,
  }
}

/**
 * Get color classes for a given score
 *
 * @param score - Raw score (0-27)
 * @param maxScore - Maximum possible score (default: 27)
 * @returns Color classes for text, background, border, and progress
 */
export function getScoreDisplayColor(
  score: number,
  maxScore: number = 27
): ScoreColorClasses {
  const display = toDisplayScore(score, maxScore, 'en')
  return display.color
}

/**
 * Get decision label (BUY/HOLD/PASS) based on score
 *
 * @param score - Raw score (0-27)
 * @param locale - Language preference ('en' | 'th')
 * @returns Decision label and color
 */
export function getDecisionLabel(
  score: number,
  locale: 'en' | 'th' = 'th'
): { label: string; color: string } {
  const decisionLabels = {
    en: {
      buy: 'BUY',
      hold: 'HOLD',
      pass: 'PASS',
    },
    th: {
      buy: 'ซื้อ',
      hold: 'คงไว้',
      pass: 'ผ่าน',
    },
  }

  const lang = locale === 'en' ? 'en' : 'th'

  if (score >= GRADE_THRESHOLDS.B_MIN) {
    return {
      label: decisionLabels[lang].buy,
      color: 'text-up-primary bg-up-soft border-up-primary',
    }
  }
  if (score >= GRADE_THRESHOLDS.C_MIN) {
    return {
      label: decisionLabels[lang].hold,
      color: 'text-insight bg-insight/20 border-insight',
    }
  }
  return {
    label: decisionLabels[lang].pass,
    color: 'text-risk bg-risk/20 border-risk',
  }
}

/**
 * Format score for display (e.g., "21/27" or "78%")
 *
 * @param score - Raw score
 * @param maxScore - Maximum possible score
 * @param format - Display format ('score' | 'percentage' | 'both')
 * @returns Formatted score string
 */
export function formatScoreDisplay(
  score: number,
  maxScore: number = 27,
  format: 'score' | 'percentage' | 'both' = 'both'
): string {
  const percentage = Math.round((score / maxScore) * 100)

  switch (format) {
    case 'score':
      return `${score}/${maxScore}`
    case 'percentage':
      return `${percentage}%`
    case 'both':
    default:
      return `${score}/${maxScore} (${percentage}%)`
  }
}
