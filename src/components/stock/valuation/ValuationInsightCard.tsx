/**
 * Valuation Insight Card Component
 *
 * แสดงข้อมูลสรุปมูลค่าการประเมิน (Upside/Downside) อย่างกระชับ
 *
 * Design improvements based on @ui-ux-designer feedback:
 * - Clear visual hierarchy with Upside/Downside as hero element
 * - Better information organization with breathing room
 * - Consistent color tokens (up/down/neutral)
 * - Improved labels (Target → Return to Mean)
 * - Responsive typography
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
    downsideToMinus1SD = 0,
    interpretation,
    currentPercentile,
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

  // Get status badge color - standardized to use up/down/neutral tokens
  const getStatusBadge = () => {
    const baseColor = isUndervalued ? 'up' : isOvervalued ? 'down' : 'neutral'

    return {
      bg: baseColor === 'up' ? 'bg-up-soft' : baseColor === 'down' ? 'bg-down-soft' : 'bg-surface-2',
      text: baseColor === 'up' ? 'text-up-primary' : baseColor === 'down' ? 'text-down-primary' : 'text-text-secondary',
      border: baseColor === 'up' ? 'border-up-primary/30' : baseColor === 'down' ? 'border-down-primary/30' : 'border-border-subtle/50',
      icon: isUndervalued ? TrendingUp : isOvervalued ? TrendingDown : Minus,
      label: isThai
        ? (interpretation === 'deep_undervalued' ? 'ถูกมาก'
          : interpretation === 'undervalued' ? 'ถูก'
          : interpretation === 'fair_value' ? 'ปกติ'
          : interpretation === 'overvalued' ? 'แพง'
          : 'แพงมาก')
        : (interpretation === 'deep_undervalued' ? 'Deep Undervalued'
          : interpretation === 'undervalued' ? 'Undervalued'
          : interpretation === 'fair_value' ? 'Fair Value'
          : interpretation === 'overvalued' ? 'Overvalued'
          : 'Sell Zone'),
    }
  }

  const statusBadge = getStatusBadge()
  const StatusIcon = statusBadge.icon

  // Secondary context data for 3-column layout
  const showSecondary = primaryPercentage !== 0 || currentPercentile !== undefined

  return (
    <div className={cn('rounded-xl bg-surface-2/50 border border-border/50 p-4 sm:p-5', className)}>
      {/* TOP ROW: Status Badge + Current Value */}
      <div className="flex items-center justify-between mb-4">
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
          <div className="text-base sm:text-lg font-bold tabular-nums text-text-primary">
            {formatValue(currentValue, metric)}{getUnit(metric)}
          </div>
        </div>
      </div>

      {/* HERO: Upside/Downside to Mean - Make this the focal point */}
      {primaryPercentage !== 0 && (
        <div className={cn(
          'flex items-center justify-between p-4 sm:p-5 rounded-xl border-2 mb-3',
          isUndervalued
            ? 'border-up-primary/30 bg-up-soft/20'
            : 'border-down-primary/30 bg-down-soft/20'
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center justify-center w-10 h-10 rounded-xl',
              isUndervalued ? 'bg-up-primary/20' : 'bg-down-primary/20'
            )}>
              {isUndervalued ? (
                <TrendingUp className="w-5 h-5 text-up-primary" />
              ) : (
                <TrendingDown className="w-5 h-5 text-down-primary" />
              )}
            </div>
            <div>
              <div className="text-xs text-text-2 mb-0.5">
                {isThai
                  ? (isUndervalued ? 'กลับสู่ค่าเฉลี่ย' : 'Downside to Mean')
                  : (isUndervalued ? 'Return to Mean' : 'Downside to Mean')
                }
              </div>
              <div className="text-sm text-text-secondary">
                {isThai ? 'เป้าหมาย' : 'Target'}: {formatValue(mean, metric)}{getUnit(metric)}
              </div>
            </div>
          </div>
          <div className={cn(
            'text-3xl sm:text-4xl font-bold tabular-nums tracking-tight',
            isUndervalued ? 'text-up-primary' : 'text-down-primary'
          )}>
            {isUndervalued ? '+' : '-'}{primaryPercentage.toFixed(1)}%
          </div>
        </div>
      )}

      {/* SECONDARY: Context row - 3 columns grid */}
      {showSecondary && (
        <div className="grid lg:grid-cols-3 gap-2">
          {/* Max Upside / Max Downside */}
          {((isUndervalued && upsideToPlus1SD > 0) || (isOvervalued && downsideToMinus1SD > 0)) && (
            <div className="text-center p-2 sm:p-3 rounded-lg bg-surface-3/50">
              <div className="text-xs text-text-3 mb-1 text-text-secondary">
                {isThai
                  ? (isUndervalued ? 'Upside สูงสุด' : 'Downside สูงสุด')
                  : (isUndervalued ? 'Max Upside' : 'Max Downside')
                }
              </div>
              <div className="font-semibold tabular-nums text-sm sm:text-xs text-text-primary">
                {isUndervalued
                  ? `+${upsideToPlus1SD.toFixed(1)}%`
                  : `-${downsideToMinus1SD.toFixed(1)}%`
                }
              </div>
            </div>
          )}

          {/* Percentile */}
          {currentPercentile !== undefined && (
            <div className="text-center p-2 sm:p-3 rounded-lg bg-surface-3/50">
              <div className="text-xs text-text-3 mb-1 text-text-secondary  ">
                {isThai ? 'ระดับ' : 'Percentile'}
              </div>
              <div className="font-semibold tabular-nums text-sm sm:text-xs text-text-primary">
                {currentPercentile.toFixed(0)}{isThai ? 'th' : 'th'}
              </div>
            </div>
          )}

          {/* Normal Range */}
          <div className="text-center p-2 sm:p-3 rounded-lg bg-surface-3/50">
            <div className="text-xs text-text-3 mb-1 text-text-secondary">
              {isThai ? 'ช่วงปกติ' : 'Normal Range'}
            </div>
            <div className="font-semibold tabular-nums text-sm sm:text-xs text-text-primary">
              {formatValue(band.minus1SD, metric)}-{formatValue(band.plus1SD, metric)}{getUnit(metric)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ValuationInsightCard
