/**
 * Urgency Badge Component
 *
 * แสดงความเร่งด่วนของการ entry สำหรับ Swing Trading
 * - Immediate (เข้าซื้อทันที) - สีแดง + Pulse animation
 * - Soon (เข้าซื้อเร็วๆ นี้) - สีส้ม
 * - Wait (รอสัญญาณ) - สีเหลือง
 * - Avoid (หลีกเลี่ยง) - สีเทา
 *
 * ใช้ CSS animation สำหรับ pulse effect (ประหยัด memory)
 */

'use client'

import { Zap, Clock, AlertOctagon, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export type UrgencyLevel = 'immediate' | 'soon' | 'wait' | 'avoid'

interface UrgencyBadgeProps {
  /** ระดับความเร่งด่วน */
  urgency: UrgencyLevel
  /** ภาษา */
  locale: 'en' | 'th'
  /** ขนาด (optional) */
  size?: 'sm' | 'md' | 'lg'
  /** แสดงเฉพาะ icon (ไม่แสดง text) */
  iconOnly?: boolean
}

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    immediate: 'Immediate',
    soon: 'Soon',
    wait: 'Wait',
    avoid: 'Avoid',
  },
  th: {
    immediate: 'เร่งด่วน',
    soon: 'เร็วๆ นี้',
    wait: 'รอ',
    avoid: 'หลีกเลี่ยง',
  },
} as const

// ============================================================================
// URGENCY CONFIG
// ============================================================================

interface UrgencyConfig {
  icon: typeof Zap | typeof Clock | typeof AlertOctagon | typeof Ban
  bgColor: string
  textColor: string
  borderColor: string
  pulse?: boolean
}

const URGENCY_CONFIG: Record<UrgencyLevel, UrgencyConfig> = {
  immediate: {
    icon: Zap,
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-500',
    borderColor: 'border-rose-500/30',
    pulse: true,
  },
  soon: {
    icon: AlertOctagon,
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
  },
  wait: {
    icon: Clock,
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-500',
    borderColor: 'border-yellow-500/30',
  },
  avoid: {
    icon: Ban,
    bgColor: 'bg-surface-2',
    textColor: 'text-text-3',
    borderColor: 'border-border',
  },
}

// ============================================================================
// SIZE CONFIG
// ============================================================================

const SIZE_CONFIG = {
  sm: {
    container: 'px-2 py-1 gap-1.5',
    icon: 'w-4 h-4',
    text: 'text-xs',
  },
  md: {
    container: 'px-3 py-1.5 gap-2',
    icon: 'w-5 h-5',
    text: 'text-sm',
  },
  lg: {
    container: 'px-4 py-2 gap-2',
    icon: 'w-6 h-6',
    text: 'text-base',
  },
} as const

// ============================================================================
// COMPONENT
// ============================================================================

export function UrgencyBadge({
  urgency,
  locale,
  size = 'md',
  iconOnly = false,
}: UrgencyBadgeProps) {
  const t = LABELS[locale]
  const config = URGENCY_CONFIG[urgency]
  const Icon = config.icon
  const sizeConfig = SIZE_CONFIG[size]

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border font-medium transition-all duration-200',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeConfig.container,
        // Pulse animation สำหรับ immediate
        config.pulse && 'animate-pulse-glow'
      )}
    >
      <Icon className={cn('flex-shrink-0', sizeConfig.icon)} />
      {!iconOnly && (
        <span className={cn('font-semibold', sizeConfig.text)}>
          {t[urgency]}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// HELPER: Calculate urgency from verdict data
// ============================================================================

export interface UrgencyCalculationParams {
  /** ประเภท verdict */
  verdict: 'Strong Buy' | 'Buy' | 'Wait' | 'Avoid'
  /** Confirmation analysis (optional) */
  confirmation?: {
    overallConfidence: number
    isConfirmed: boolean
  }
  /** Entry timing assessment */
  entryTiming: 'optimal' | 'good' | 'wait' | 'poor'
  /** Trend phase */
  trendPhase: 'early' | 'mature' | 'exhausted'
  /** Current price vs entry zone */
  currentPrice: number
  entryZoneMax: number
  /** Days until catalyst (if any) */
  daysUntilCatalyst?: number
}

/**
 * คำนวณระดับความเร่งด่วนจากข้อมูล verdict
 */
export function calculateUrgency(params: UrgencyCalculationParams): UrgencyLevel {
  const {
    verdict,
    confirmation,
    entryTiming,
    trendPhase,
    currentPrice,
    entryZoneMax,
    daysUntilCatalyst,
  } = params

  // 1. Avoid verdict → หลีกเลี่ยงทันที
  if (verdict === 'Avoid') {
    return 'avoid'
  }

  // 2. Wait verdict → รอ
  if (verdict === 'Wait') {
    return 'wait'
  }

  // 3. Strong Buy / Buy → ตรวจสอบเงื่อนไขเพิ่มเติม
  if (verdict === 'Strong Buy' || verdict === 'Buy') {
    // 3.1 Immediate conditions
    const isImmediate =
      // Confirmation สูงมาก (>80%)
      (confirmation?.isConfirmed && confirmation.overallConfidence > 80) ||
      // Entry timing optimal + Early trend
      (entryTiming === 'optimal' && trendPhase === 'early') ||
      // ราคาอยู่ใน entry zone แล้ว
      currentPrice <= entryZoneMax ||
      // Catalyst ใกล้เกิด (<7 days)
      (daysUntilCatalyst !== undefined && daysUntilCatalyst < 7)

    if (isImmediate) {
      return 'immediate'
    }

    // 3.2 Soon conditions
    const isSoon =
      // Confirmation ดี (>60%)
      (confirmation?.isConfirmed && confirmation.overallConfidence > 60) ||
      // Entry timing good
      entryTiming === 'good' ||
      // Catalyst ใกล้เกิด (<14 days)
      (daysUntilCatalyst !== undefined && daysUntilCatalyst < 14)

    if (isSoon) {
      return 'soon'
    }
  }

  // Default: wait
  return 'wait'
}
