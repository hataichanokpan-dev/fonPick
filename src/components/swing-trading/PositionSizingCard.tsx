/**
 * Position Sizing Card Component
 *
 * Displays position sizing recommendation including:
 * - Position size as % of portfolio
 * - Risk amount calculation
 * - Rationale explanation
 *
 * Uses CSS animations for visual feedback
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card'
import { Wallet, PieChart, Info } from 'lucide-react'
import { cn, safeToFixed } from '@/lib/utils'
import type { PositionSizing } from '@/types/swing-trading'

interface PositionSizingCardProps {
  position: PositionSizing
  locale: 'en' | 'th'
}

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'Position Sizing',
    recommendedSize: 'Recommended Position Size',
    ofPortfolio: 'of portfolio',
    riskAmount: 'Risk Amount',
    rationale: 'Rationale',
    conservative: 'Conservative',
    moderate: 'Moderate',
    aggressive: 'Aggressive',
  },
  th: {
    title: 'การจัดสรรปริมาณ',
    recommendedSize: 'ขนาดตำแหน่งที่แนะนำ',
    ofPortfolio: 'ของพอร์ต',
    riskAmount: 'จำนวนเงินที่เสี่ยง',
    rationale: 'เหตุผล',
    conservative: 'อนุรักษ์นิยม',
    moderate: 'ปานกลาง',
    aggressive: 'ก้าวร้าว',
  },
} as const

export function PositionSizingCard({ position, locale }: PositionSizingCardProps) {
  const t = LABELS[locale]

  // Determine risk level based on percentage
  const getRiskLevel = (): 'conservative' | 'moderate' | 'aggressive' => {
    if (position.percentage <= 5) return 'conservative'
    if (position.percentage <= 15) return 'moderate'
    return 'aggressive'
  }

  const riskLevel = getRiskLevel()

  // Risk level config
  const riskConfig = {
    conservative: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-500',
      icon: PieChart,
    },
    moderate: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-500',
      icon: PieChart,
    },
    aggressive: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-500',
      icon: PieChart,
    },
  }[riskLevel]

  const RiskIcon = riskConfig.icon

  // Calculate visual indicator for portfolio percentage
  const maxPercentage = 25 // Cap visualization at 25%
  const visualPercentage = Math.min(position.percentage, maxPercentage)
  const visualPercentOfMax = (visualPercentage / maxPercentage) * 100

  return (
    <Card variant="default" padding="md" className="animate-slide-up [animation-delay:300ms]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-accent-blue" />
          {t.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Position Size Display */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-surface-2 border border-border">
          <div>
            <div className="text-xs text-text-secondary mb-1">{t.recommendedSize}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-text-primary tabular-nums">
                {safeToFixed(position.percentage, 1)}
              </span>
              <span className="text-lg text-text-secondary">{t.ofPortfolio}</span>
            </div>
          </div>

          {/* Risk Level Badge */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border',
            riskConfig.bg,
            riskConfig.border
          )}>
            <RiskIcon className={cn('w-4 h-4', riskConfig.text)} />
            <span className={cn('text-sm font-medium', riskConfig.text)}>
              {t[riskLevel]}
            </span>
          </div>
        </div>

        {/* Visual Portfolio Allocation */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Portfolio Allocation</span>
            <span className="font-medium">{safeToFixed(position.percentage, 1)}%</span>
          </div>
          <div className="h-3 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                riskLevel === 'conservative'
                  ? 'bg-emerald-500'
                  : riskLevel === 'moderate'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              )}
              style={{ width: `${visualPercentOfMax}%` }}
            />
          </div>
          {/* Scale markers */}
          <div className="flex justify-between text-[10px] text-text-3 px-1">
            <span>0%</span>
            <span>5%</span>
            <span>10%</span>
            <span>15%</span>
            <span>20%</span>
            <span>25%+</span>
          </div>
        </div>

        {/* Risk Amount */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-accent-teal" />
              <span className="text-xs text-text-secondary">{t.riskAmount}</span>
            </div>
            <div className="text-xl font-bold text-text-primary tabular-nums">
              {safeToFixed(position.riskAmount)}
            </div>
            <div className="text-xs text-text-3 mt-1">THB</div>
          </div>

          {/* Position Amount (calculated) */}
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-accent-purple" />
              <span className="text-xs text-text-secondary">Position Value</span>
            </div>
            <div className="text-xl font-bold text-text-primary tabular-nums">
              ~{safeToFixed(position.riskAmount * 5)}
            </div>
            <div className="text-xs text-text-3 mt-1">THB (est.)</div>
          </div>
        </div>

        {/* Rationale */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-2 border border-border">
          <Info className="w-4 h-4 text-accent-blue flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs text-text-secondary mb-1">{t.rationale}</div>
            <p className="text-sm text-text-primary leading-relaxed">
              {position.rationale}
            </p>
          </div>
        </div>

        {/* Risk Disclaimer */}
        {riskLevel === 'aggressive' && (
          <div className="p-3 rounded-lg bg-risk/10 border border-risk/30">
            <p className="text-xs text-risk leading-relaxed">
              <span className="font-medium">Caution:</span> This position size is
              considered {t[riskLevel]}. Consider reducing allocation to manage
              risk effectively.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
