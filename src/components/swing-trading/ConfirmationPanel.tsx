/**
 * Confirmation Panel Component
 *
 * แสดงสรุปสัญญาณยืนยันทั้งหมดสำหรับ Swing Trading
 * - Smart Money Flow
 * - Trend Phase
 * - Momentum
 * - Sector Rotation
 * - Overall Confirmation Percentage
 *
 * ใช้ CSS animations แทน Framer Motion เพื่อประหยัด memory
 * ใช้ icons (Checkmark/X) แทนข้อความยาวๆ
 */

'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card'
import { Check, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConfirmationAnalysis } from '@/types/swing-trading'

interface ConfirmationPanelProps {
  /** ข้อมูลการวิเคราะห์การยืนยัน */
  confirmation: ConfirmationAnalysis
  locale: 'en' | 'th'
}

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'Signal Confirmation',
    overallConfidence: 'Overall Confidence',
    confirmed: 'Confirmed',
    notConfirmed: 'Not Confirmed',
    sources: {
      'smart-money': 'Smart Money',
      'sector-rotation': 'Sector Rotation',
      'trend-maturity': 'Trend Maturity',
      'volume': 'Volume',
    },
    recommendation: {
      'Strong Entry': 'Strong Entry',
      'Entry': 'Entry',
      'Wait': 'Wait',
      'Avoid Entry': 'Avoid Entry',
    },
  },
  th: {
    title: 'การยืนยันสัญญาณ',
    overallConfidence: 'ความมั่นใจโดยรวม',
    confirmed: 'ยืนยันแล้ว',
    notConfirmed: 'ไม่ยืนยัน',
    sources: {
      'smart-money': 'เงินอัจฉริยะ',
      'sector-rotation': 'การหมุนเวียนกลุ่มหุ้น',
      'trend-maturity': 'ความสุกงอมของเทรนด์',
      'volume': 'ปริมาณการซื้อขาย',
    },
    recommendation: {
      'Strong Entry': 'เข้าซื้อมาก',
      'Entry': 'เข้าซื้อ',
      'Wait': 'รอ',
      'Avoid Entry': 'หลีกเลี่ยง',
    },
  },
} as const

// ============================================================================
// SOURCE ICON CONFIG
// ============================================================================

interface SourceIconConfig {
  icon: typeof Check | typeof X | typeof AlertTriangle
  bgColor: string
  textColor: string
  borderColor: string
}

function getSourceConfig(
  isConfirmed: boolean,
  confidence: number
): SourceIconConfig {
  // ถ้ายืนยันและมั่นใจสูง (>70%) - เขียว
  if (isConfirmed && confidence >= 70) {
    return {
      icon: Check,
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/30',
    }
  }

  // ถ้ายืนยันแต่มั่นใจปานกลาง (50-70%) - เหลือง/ส้ม
  if (isConfirmed && confidence >= 50) {
    return {
      icon: Check,
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-500',
      borderColor: 'border-amber-500/30',
    }
  }

  // ถ้าไม่ยืนยัน - แดง
  if (!isConfirmed) {
    return {
      icon: X,
      bgColor: 'bg-rose-500/10',
      textColor: 'text-rose-500',
      borderColor: 'border-rose-500/30',
    }
  }

  // กรณีอื่นๆ - ส้มเตือน
  return {
    icon: AlertTriangle,
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ConfirmationPanel({
  confirmation,
  locale,
}: ConfirmationPanelProps) {
  const t = LABELS[locale]

  // คำนวณสีของ overall confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-emerald-500'
    if (confidence >= 50) return 'text-amber-500'
    return 'text-rose-500'
  }

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 75) return 'bg-emerald-500/10'
    if (confidence >= 50) return 'bg-amber-500/10'
    return 'bg-rose-500/10'
  }

  const getConfidenceBorder = (confidence: number) => {
    if (confidence >= 75) return 'border-emerald-500/30'
    if (confidence >= 50) return 'border-amber-500/30'
    return 'border-rose-500/30'
  }

  // คำนวณสีของ recommendation
  const getRecommendationColor = (recommendation: string) => {
    if (recommendation === 'Strong Entry' || recommendation === 'Entry')
      return 'text-up-primary'
    if (recommendation === 'Wait') return 'text-amber-500'
    return 'text-rose-500'
  }

  return (
    <Card variant="default" padding="md" className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t.title}</span>
          {/* Overall Confidence Badge */}
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border',
              getConfidenceBg(confirmation.overallConfidence),
              getConfidenceBorder(confirmation.overallConfidence)
            )}
          >
            <span className={cn(
              'text-2xl font-bold tabular-nums',
              getConfidenceColor(confirmation.overallConfidence)
            )}>
              {Math.round(confirmation.overallConfidence)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recommendation Badge */}
        <div
          className={cn(
            'flex items-center justify-center p-3 rounded-lg border',
            getConfidenceBg(confirmation.overallConfidence),
            getConfidenceBorder(confirmation.overallConfidence)
          )}
        >
          <span className={cn(
            'text-lg font-bold',
            getRecommendationColor(confirmation.recommendation)
          )}>
            {t.recommendation[confirmation.recommendation]}
          </span>
        </div>

        {/* Confirmation Sources Grid */}
        <div className="grid grid-cols-2 gap-3">
          {confirmation.confirmations.map((conf) => {
            const config = getSourceConfig(conf.isConfirmed, conf.confidence)
            const Icon = config.icon

            return (
              <div
                key={conf.source}
                className={cn(
                  'flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200',
                  config.bgColor,
                  config.borderColor,
                  'hover-scale'
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                    config.bgColor
                  )}
                >
                  <Icon className={cn('w-6 h-6', config.textColor)} />
                </div>

                {/* Source Name */}
                <span className="text-xs text-text-secondary text-center mb-1">
                  {t.sources[conf.source]}
                </span>

                {/* Confidence Score */}
                <span className={cn('text-sm font-bold tabular-nums', config.textColor)}>
                  {Math.round(conf.confidence)}%
                </span>

                {/* Weight indicator */}
                <div className="mt-2 w-full bg-surface-3 rounded-full h-1">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', config.textColor.replace('text-', 'bg-'))}
                    style={{ width: `${conf.weight * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary Text */}
        <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
          <span>
            {confirmation.confirmedCount} / {confirmation.totalSources}
          </span>
          <span>{t.confirmed}</span>
        </div>
      </CardContent>
    </Card>
  )
}
