/**
 * Entry Plan Card Component
 *
 * Displays entry plan details including:
 * - Entry zone (min/max price) with visual range indicator
 * - Current price comparison
 * - Discount percentage from current
 * - Rationale explanation
 *
 * Uses CSS animations for visual feedback
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card'
import { ArrowDownRight, Info } from 'lucide-react'
import { cn, safeToFixed } from '@/lib/utils'
import type { EntryPlan } from '@/types/swing-trading'

interface EntryPlanCardProps {
  entry: EntryPlan
  locale: 'en' | 'th'
}

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'Entry Plan',
    entryZone: 'Entry Zone',
    currentPrice: 'Current Price',
    maxEntry: 'Max Entry',
    minEntry: 'Ideal Entry',
    discountFromCurrent: 'Discount from Current',
    rationale: 'Rationale',
    buyAt: 'Buy At',
    waitFor: 'Wait for price to drop to',
    identicalPrices: 'Cannot display range: all prices are identical',
  },
  th: {
    title: 'แผนการเข้าซื้อ',
    entryZone: 'ช่วงราคาเข้าซื้อ',
    currentPrice: 'ราคาปัจจุบัน',
    maxEntry: 'ราคาเข้าสูงสุด',
    minEntry: 'ราคาเข้าเหมาะสม',
    discountFromCurrent: 'ส่วนลดจากราคาปัจจุบัน',
    rationale: 'เหตุผล',
    buyAt: 'ซื้อที่',
    waitFor: 'รอราคาลดลงถึง',
    identicalPrices: 'ไม่สามารถแสดงช่วงราคา: ราคาทั้งหมดเหมือนกัน',
  },
} as const

export function EntryPlanCard({ entry, locale }: EntryPlanCardProps) {
  const t = LABELS[locale]

  // Calculate discount percentage
  const discountFromCurrent = entry.discountFromCurrent
  const isDiscountPositive = discountFromCurrent > 0

  // Calculate range for visualization
  const { zone } = entry
  const rangeMin = Math.min(zone.min, zone.current)
  const rangeMax = Math.max(zone.max, zone.current)
  const totalRange = rangeMax - rangeMin

  // Guard against division by zero
  if (totalRange === 0) {
    return (
      <Card variant="default" padding="md" className="animate-slide-up [animation-delay:100ms]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownRight className="w-5 h-5 text-accent-teal" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-surface-2 border border-border">
            <div className="text-center text-text-tertiary text-sm">
              {t.identicalPrices}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Position percentages for visual indicator
  const currentPos = ((zone.current - rangeMin) / totalRange) * 100
  const maxPos = ((zone.max - rangeMin) / totalRange) * 100
  const minPos = ((zone.min - rangeMin) / totalRange) * 100

  return (
    <Card variant="default" padding="md" className="animate-slide-up [animation-delay:100ms]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownRight className="w-5 h-5 text-accent-teal" />
          {t.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Range Visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>{t.entryZone}</span>
            <span className={cn(
              'font-medium',
              isDiscountPositive ? 'text-up-primary' : 'text-risk'
            )}>
              {isDiscountPositive ? '+' : ''}{safeToFixed(discountFromCurrent, 1)}% {t.discountFromCurrent}
            </span>
          </div>

          {/* Visual Range Bar */}
          <div className="relative h-12 bg-surface-2 rounded-lg overflow-hidden px-2">
            {/* Background track */}
            <div className="absolute inset-x-2 inset-y-3 bg-surface-3 rounded" />

            {/* Entry Zone Highlight */}
            <div
              className="absolute top-3 bottom-3 bg-up-primary/20 border border-up-primary/40 rounded transition-all duration-500"
              style={{
                left: `calc(${Math.min(minPos, maxPos)}% + 8px)`,
                right: `calc(${100 - Math.max(minPos, maxPos)}% + 8px)`,
              }}
            />

            {/* Current Price Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-text-primary"
              style={{ left: `${currentPos}%` }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-text-primary whitespace-nowrap bg-surface px-1.5 py-0.5 rounded">
                {safeToFixed(zone.current)}
              </div>
            </div>

            {/* Max Entry Price */}
            <div
              className="absolute top-3 bottom-3 w-0.5 bg-accent-blue"
              style={{ left: `${maxPos}%` }}
            >
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-accent-blue whitespace-nowrap font-medium">
                {safeToFixed(zone.max)}
              </div>
            </div>

            {/* Min Entry Price (Ideal) */}
            <div
              className="absolute top-3 bottom-3 w-0.5 bg-up-primary"
              style={{ left: `${minPos}%` }}
            >
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-up-primary whitespace-nowrap font-medium">
                {safeToFixed(zone.min)}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-text-primary" />
              <span className="text-text-3">{t.currentPrice}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-blue" />
              <span className="text-text-3">{t.maxEntry}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-up-primary" />
              <span className="text-text-3">{t.minEntry}</span>
            </div>
          </div>
        </div>

        {/* Price Details Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Current Price */}
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="text-xs text-text-secondary mb-1">{t.currentPrice}</div>
            <div className="text-lg font-bold text-text-primary tabular-nums">
              {safeToFixed(zone.current)}
            </div>
          </div>

          {/* Max Entry */}
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="text-xs text-text-secondary mb-1">{t.maxEntry}</div>
            <div className="text-lg font-bold text-accent-blue tabular-nums">
              {safeToFixed(zone.max)}
            </div>
          </div>

          {/* Min Entry (Ideal) */}
          <div className="p-3 rounded-lg bg-up-soft/20 border border-up-primary/30">
            <div className="text-xs text-up-primary/80 mb-1">{t.minEntry}</div>
            <div className="text-lg font-bold text-up-primary tabular-nums">
              {safeToFixed(zone.min)}
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-2 border border-border">
          <Info className="w-4 h-4 text-accent-blue flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs text-text-secondary mb-1">{t.rationale}</div>
            <p className="text-sm text-text-primary leading-relaxed">
              {entry.rationale}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
