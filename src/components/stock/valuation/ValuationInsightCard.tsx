/**
 * Valuation Insight Card Component
 *
 * แสดงข้อมูลสรุปมูลค่าการประเมิน (Upside/Downside) อย่างกระชับ
 *
 * Features:
 * - Upside/Downside percentage to Mean
 * - สถานะการประเมิน (Undervalued/Fair Value/Overvalued)
 * - Current value vs Mean comparison
 * - Color-coded for quick understanding
 * - Bilingual support (Thai/English)
 */

'use client'

import { useLocale } from 'next-intl'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ValuationBand } from '@/types/valuation'
import { cn } from '@/lib/utils'

interface ValuationInsightCardProps {
  band: ValuationBand
  metric: 'PE' | 'PBV' | 'ROE'
  className?: string
}

/**
 * Format value based on metric type
 */
function formatValue(value: number, metric: 'PE' | 'PBV' | 'ROE'): string {
  if (metric === 'ROE') {
    return value.toFixed(1)
  }
  return metric === 'PBV' ? value.toFixed(2) : value.toFixed(1)
}

/**
 * Get unit suffix based on metric type
 */
function getUnit(metric: 'PE' | 'PBV' | 'ROE'): string {
  return metric === 'ROE' ? '%' : 'x'
}

export function ValuationInsightCard({ band, metric, className }: ValuationInsightCardProps) {
  const locale = useLocale() as 'en' | 'th'
  const isThai = locale === 'th'

  const {
    currentValue,
    mean,
    upsideToMean = 0,
    downsideToMean = 0,
    upsideToPlus1SD = 0,
    interpretation,
  } = band

  // Determine if undervalued (upside) or overvalued (downside)
  const isUndervalued = interpretation === 'undervalued' || interpretation === 'deep_undervalued'
  const isOvervalued = interpretation === 'overvalued' || interpretation === 'sell_zone'

  // Calculate percentage to show
  const primaryPercentage = isUndervalued
    ? upsideToMean
    : isOvervalued
      ? downsideToMean
      : 0

  // Get status badge color
  const getStatusBadge = () => {
    switch (interpretation) {
      case 'deep_undervalued':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          icon: TrendingUp,
          label: isThai ? 'ถูกมาก' : 'Deep Undervalued',
        }
      case 'undervalued':
        return {
          bg: 'bg-up-soft',
          text: 'text-up-primary',
          border: 'border-up-primary/30',
          icon: TrendingUp,
          label: isThai ? 'ถูก' : 'Undervalued',
        }
      case 'fair_value':
        return {
          bg: 'bg-surface-2',
          text: 'text-text-secondary',
          border: 'border-border-subtle/50',
          icon: Minus,
          label: isThai ? 'ปกติ' : 'Fair Value',
        }
      case 'overvalued':
        return {
          bg: 'bg-down-soft',
          text: 'text-down-primary',
          border: 'border-down-primary/30',
          icon: TrendingDown,
          label: isThai ? 'แพง' : 'Overvalued',
        }
      case 'sell_zone':
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
          icon: TrendingDown,
          label: isThai ? 'แพงมาก' : 'Sell Zone',
        }
    }
  }

  const statusBadge = getStatusBadge()
  const StatusIcon = statusBadge.icon

  return (
    <div className={cn('rounded-xl bg-surface-2/50 border border-border/50 p-4', className)}>
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full border',
          statusBadge.bg, statusBadge.text, statusBadge.border
        )}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">{statusBadge.label}</span>
        </div>

        {/* Current Value */}
        <div className="text-right">
          <div className="text-xs text-text-2">
            {isThai ? 'ค่าปัจจุบัน' : 'Current'}
          </div>
          <div className="text-lg font-bold tabular-nums text-text-primary">
            {formatValue(currentValue, metric)}{getUnit(metric)}
          </div>
        </div>
      </div>

      {/* Upside/Downside to Mean */}
      {primaryPercentage !== 0 && (
        <div className={cn(
          'flex items-center justify-between p-3 rounded-lg border',
          isUndervalued
            ? 'bg-up-soft/30 border-up-primary/20'
            : 'bg-down-soft/30 border-down-primary/20'
        )}>
          <div className="flex items-center gap-2">
            {isUndervalued ? (
              <TrendingUp className="w-5 h-5 text-up-primary" />
            ) : (
              <TrendingDown className="w-5 h-5 text-down-primary" />
            )}
            <div>
              <div className="text-xs text-text-2">
                {isUndervalued
                  ? (isThai ? 'Upside to Mean' : 'Upside to Mean')
                  : (isThai ? 'Downside to Mean' : 'Downside to Mean')}
              </div>
              <div className="text-xs text-text-3">
                {isThai ? 'เป้าหมาย' : 'Target'}: {formatValue(mean, metric)}{getUnit(metric)}
              </div>
            </div>
          </div>
          <div className={cn(
            'text-2xl font-bold tabular-nums',
            isUndervalued ? 'text-up-primary' : 'text-down-primary'
          )}>
            {isUndervalued ? '+' : '-'}{primaryPercentage.toFixed(1)}%
          </div>
        </div>
      )}

      {/* Additional info for undervalued - upside to +1SD */}
      {isUndervalued && upsideToPlus1SD > 0 && upsideToPlus1SD !== upsideToMean && (
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-text-3">
            {isThai ? 'Upside ถึง +1SD' : 'Upside to +1SD'}
          </span>
          <span className="text-accent-blue font-semibold tabular-nums">
            +{upsideToPlus1SD.toFixed(1)}%
          </span>
        </div>
      )}

      {/* Percentile info */}
      {band.currentPercentile !== undefined && (
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
          <span className="text-text-2">
            {isThai ? 'อยู่ในระดับ' : 'Percentile'}
          </span>
          <span className="font-semibold text-text-primary tabular-nums">
            {band.currentPercentile.toFixed(0)}{isThai ? 'th percentile' : 'th'}
          </span>
        </div>
      )}

      {/* Quick range reference */}
      <div className="mt-2 flex items-center justify-between text-xs text-text-3">
        <span>
          {isThai ? 'ช่วงปกติ' : 'Normal Range'}:
        </span>
        <span className="tabular-nums">
          {formatValue(band.minus1SD, metric)} - {formatValue(band.plus1SD, metric)}{getUnit(metric)}
        </span>
      </div>
    </div>
  )
}

export default ValuationInsightCard
