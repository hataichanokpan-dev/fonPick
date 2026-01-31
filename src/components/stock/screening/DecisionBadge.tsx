/**
 * Decision Badge Component
 *
 * Displays investment decision (BUY/HOLD/PASS) with confidence level.
 * Features gradient backgrounds and animated effects.
 */

import { DECISION_GRADIENTS, DECISION_TEXT_COLORS } from './constants'
import type { DecisionBadgeProps, InvestmentDecision, ConfidenceLevel } from './types'
import { TrendingUp, Minus, TrendingDown } from 'lucide-react'

/**
 * Size configurations
 */
const SIZE_CONFIG = {
  sm: {
    container: 'px-3 py-1.5',
    icon: 'w-4 h-4',
    text: 'text-sm font-semibold',
    confidence: 'text-xs',
  },
  md: {
    container: 'px-4 py-2',
    icon: 'w-5 h-5',
    text: 'text-base font-bold',
    confidence: 'text-xs',
  },
  lg: {
    container: 'px-6 py-3',
    icon: 'w-6 h-6',
    text: 'text-lg font-bold',
    confidence: 'text-sm',
  },
} as const

/**
 * Decision icons
 */
const DECISION_ICONS = {
  BUY: TrendingUp,
  HOLD: Minus,
  PASS: TrendingDown,
} as const

/**
 * Decision labels (English)
 */
const DECISION_LABELS_EN = {
  BUY: 'BUY',
  HOLD: 'HOLD',
  PASS: 'PASS',
} as const

/**
 * Decision labels (Thai)
 */
const DECISION_LABELS_TH = {
  BUY: 'ซื้อ',
  HOLD: 'ถือ',
  PASS: 'ผ่าน',
} as const

/**
 * Confidence labels (English)
 */
const CONFIDENCE_LABELS_EN = {
  High: 'High',
  Medium: 'Medium',
  Low: 'Low',
} as const

/**
 * Confidence labels (Thai)
 */
const CONFIDENCE_LABELS_TH = {
  High: 'สูง',
  Medium: 'ปานกลาง',
  Low: 'ต่ำ',
} as const

/**
 * Main DecisionBadge component
 */
export function DecisionBadge({
  decision,
  confidence,
  size = 'md',
  locale = 'th',
  className = '',
}: DecisionBadgeProps) {
  const sizeConfig = SIZE_CONFIG[size]
  const Icon = DECISION_ICONS[decision]
  const gradient = DECISION_GRADIENTS[decision]

  const decisionLabel = locale === 'th' ? DECISION_LABELS_TH[decision] : DECISION_LABELS_EN[decision]
  const confidenceLabel = confidence
    ? locale === 'th'
      ? CONFIDENCE_LABELS_TH[confidence]
      : CONFIDENCE_LABELS_EN[confidence]
    : null

  return (
    <div className={`decision-badge ${className}`}>
      <div
        className={`inline-flex items-center gap-2 rounded-xl ${gradient} text-white shadow-lg ${sizeConfig.container}`}
      >
        {/* Icon */}
        <Icon className={sizeConfig.icon} strokeWidth={2.5} />

        {/* Decision text */}
        <span className={sizeConfig.text}>
          {decisionLabel}
        </span>

        {/* Confidence badge (if provided) */}
        {confidence && confidenceLabel && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/20 text-white text-xs font-medium">
            {confidenceLabel}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * DecisionCard - Larger card with full details
 */
interface DecisionCardProps {
  decision: InvestmentDecision
  confidence: ConfidenceLevel
  confidencePercent: number
  summary: string
  rationale?: string[]
  locale?: 'en' | 'th'
  className?: string
}

export function DecisionCard({
  decision,
  confidence,
  confidencePercent,
  summary,
  rationale = [],
  locale = 'th',
  className = '',
}: DecisionCardProps) {
  const gradient = DECISION_GRADIENTS[decision]
  const decisionLabel = locale === 'th' ? DECISION_LABELS_TH[decision] : DECISION_LABELS_EN[decision]
  const confidenceLabel = locale === 'th' ? CONFIDENCE_LABELS_TH[confidence] : CONFIDENCE_LABELS_EN[confidence]

  return (
    <div className={`decision-card ${className}`}>
      <div className={`rounded-xl ${gradient} p-6 text-white`}>
        {/* Header: Decision and Confidence */}
        <div className="flex items-start justify-between mb-4">
          {/* Decision */}
          <div>
            <div className="text-sm opacity-80 mb-1">
              {locale === 'th' ? 'คำแนะนำ' : 'Recommendation'}
            </div>
            <div className="text-3xl font-bold">
              {decisionLabel}
            </div>
          </div>

          {/* Confidence */}
          <div className="text-right">
            <div className="text-sm opacity-80 mb-1">
              {locale === 'th' ? 'ความมั่นใจ' : 'Confidence'}
            </div>
            <div className="text-2xl font-bold">
              {confidenceLabel}
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mb-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <div className="text-right text-xs opacity-80 mt-1">
            {confidencePercent}%
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white/10 rounded-lg p-3 mb-3">
          <p className="text-sm font-medium">
            {summary}
          </p>
        </div>

        {/* Rationale (if provided) */}
        {rationale.length > 0 && (
          <div>
            <div className="text-xs opacity-80 mb-2">
              {locale === 'th' ? 'เหตุผลสำคัญ' : 'Key Reasons'}
            </div>
            <ul className="space-y-1.5">
              {rationale.slice(0, 3).map((reason, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-white/60">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * MiniDecisionBadge - Compact version for tight spaces
 */
interface MiniDecisionBadgeProps {
  decision: InvestmentDecision
  locale?: 'en' | 'th'
  className?: string
}

export function MiniDecisionBadge({
  decision,
  locale = 'th',
  className = '',
}: MiniDecisionBadgeProps) {
  const textColor = DECISION_TEXT_COLORS[decision]
  const bgColor = {
    BUY: 'bg-up-soft',
    HOLD: 'bg-insight/20',
    PASS: 'bg-risk/20',
  }[decision]

  const decisionLabel = locale === 'th' ? DECISION_LABELS_TH[decision] : DECISION_LABELS_EN[decision]

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md ${bgColor} ${textColor} text-xs font-semibold ${className}`}>
      {decisionLabel}
    </span>
  )
}

/**
 * DecisionIcon - Icon only version
 */
export function DecisionIcon({
  decision,
  size = 24,
}: {
  decision: InvestmentDecision
  size?: number
}) {
  const Icon = DECISION_ICONS[decision]
  const textColor = DECISION_TEXT_COLORS[decision]

  return (
    <Icon
      width={size}
      height={size}
      className={textColor}
      strokeWidth={2.5}
    />
  )
}
