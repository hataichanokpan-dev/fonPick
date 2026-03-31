/**
 * Exit Plan Card Component
 *
 * Displays exit plan details including:
 * - Stop loss level with rationale
 * - 3 Take profit levels (15%, 20%, 25% targets)
 * - Risk-reward ratio display
 * - Visual representation of levels
 *
 * Uses CSS animations for visual feedback
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card'
import { Shield, Target, TrendingUp, AlertTriangle } from 'lucide-react'
import { cn, safeToFixed } from '@/lib/utils'
import type { ExitPlan, TakeProfitLevel } from '@/types/swing-trading'

interface ExitPlanCardProps {
  exit: ExitPlan
  locale: 'en' | 'th'
}

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'Exit Plan',
    stopLoss: 'Stop Loss',
    takeProfits: 'Take Profit Targets',
    riskReward: 'Risk / Reward',
    level: 'Level',
    target: 'Target',
    rationale: 'Rationale',
    fromEntry: 'from entry',
    riskRewardRatio: 'Risk:Reward',
    identicalPrices: 'Cannot display range: all prices are identical',
  },
  th: {
    title: 'แผนการออกจากตำแหน่ง',
    stopLoss: 'ตัดขาดทอน',
    takeProfits: 'เป้าหมายกำไร',
    riskReward: 'ความเสี่ยง/ผลตอบแทน',
    level: 'ระดับ',
    target: 'เป้าหมาย',
    rationale: 'เหตุผล',
    fromEntry: 'จากราคาเข้า',
    riskRewardRatio: 'เสี่ยง:ได้',
    identicalPrices: 'ไม่สามารถแสดงช่วงราคา: ราคาทั้งหมดเหมือนกัน',
  },
} as const

export function ExitPlanCard({ exit, locale }: ExitPlanCardProps) {
  const t = LABELS[locale]

  // Calculate range for visualization
  const { stopLoss, takeProfits } = exit
  const allPrices = [stopLoss.price, ...takeProfits.map((tp) => tp.price)]
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const totalRange = maxPrice - minPrice

  // Guard against division by zero
  if (totalRange === 0) {
    return (
      <Card variant="default" padding="md" className="animate-slide-up [animation-delay:200ms]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-purple" />
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

  // Position percentages for visualization
  const stopPos = ((stopLoss.price - minPrice) / totalRange) * 100
  const tpPositions = takeProfits.map((tp) => ({
    ...tp,
    position: ((tp.price - minPrice) / totalRange) * 100,
  }))

  return (
    <Card variant="default" padding="md" className="animate-slide-up [animation-delay:200ms]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-accent-purple" />
          {t.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Risk-Reward Ratio Badge */}
        <div className="flex items-center justify-center p-3 rounded-lg bg-surface-2 border border-border">
          <span className="text-xs text-text-secondary mr-2">{t.riskRewardRatio}</span>
          <span className="text-xl font-bold text-accent-teal tabular-nums">
            {exit.riskRewardRatio}
          </span>
        </div>

        {/* Visual Level Representation */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>{t.level}</span>
            <span>Price ({t.fromEntry})</span>
          </div>
          <div className="relative h-24 bg-surface-2 rounded-lg overflow-hidden px-2">
            {/* Background track */}
            <div className="absolute inset-x-2 inset-y-4 bg-surface-3 rounded" />

            {/* Zone coloring */}
            <div
              className="absolute top-4 bottom-4 bg-risk/10 border-l border-risk/30"
              style={{ left: '0', right: `${100 - stopPos}%` }}
            />

            {/* Stop Loss Marker */}
            <div
              className="absolute top-4 bottom-4 w-0.5 bg-risk"
              style={{ left: `${stopPos}%` }}
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="bg-risk text-white px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap">
                  SL: {safeToFixed(stopLoss.price)}
                </div>
                <div className="text-[10px] text-risk mt-0.5 whitespace-nowrap">
                  -{safeToFixed(stopLoss.percentFromEntry, 1)}%
                </div>
              </div>
            </div>

            {/* Take Profit Markers */}
            {tpPositions.map((tp) => (
              <div
                key={tp.level}
                className="absolute top-4 bottom-4 w-0.5 bg-up-primary"
                style={{ left: `${tp.position}%` }}
              >
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="bg-up-primary text-white px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap">
                    TP{tp.level}: {safeToFixed(tp.price)}
                  </div>
                  <div className="text-[10px] text-up-primary mt-0.5 whitespace-nowrap">
                    +{safeToFixed(tp.percentFromEntry, 1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-risk" />
              <span className="text-text-3 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {t.stopLoss}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-up-primary" />
              <span className="text-text-3 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {t.takeProfits}
              </span>
            </div>
          </div>
        </div>

        {/* Price Levels Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Stop Loss */}
          <div className="p-3 rounded-lg bg-risk/10 border border-risk/30">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-4 h-4 text-risk" />
              <span className="text-xs text-risk/80 font-medium">SL</span>
            </div>
            <div className="text-lg font-bold text-risk tabular-nums">
              {safeToFixed(stopLoss.price)}
            </div>
            <div className="text-xs text-risk mt-1 tabular-nums">
              -{safeToFixed(stopLoss.percentFromEntry, 1)}%
            </div>
          </div>

          {/* Take Profit Levels */}
          {takeProfits.map((tp) => (
            <TakeProfitLevelCard
              key={tp.level}
              level={tp.level}
              price={tp.price}
              percentFromEntry={tp.percentFromEntry}
              locale={locale}
            />
          ))}
        </div>

        {/* Stop Loss Rationale */}
        <div className="p-3 rounded-lg bg-surface-2 border border-border">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-accent-orange flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-text-secondary mb-1">
                {t.stopLoss} {t.rationale}
              </div>
              <p className="text-sm text-text-primary leading-relaxed">
                {stopLoss.rationale}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// TAKE PROFIT LEVEL CARD
// ============================================================================

interface TakeProfitLevelCardProps {
  level: TakeProfitLevel['level']
  price: number
  percentFromEntry: number
  locale: 'en' | 'th'
}

function TakeProfitLevelCard({
  level,
  price,
  percentFromEntry,
  locale,
}: TakeProfitLevelCardProps) {
  const t = LABELS[locale]

  // Color coding by level
  const levelConfig = {
    1: {
      bgColor: 'bg-up-primary/10',
      borderColor: 'border-up-primary/30',
      textColor: 'text-up-primary',
      label: 'TP1',
    },
    2: {
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-500',
      label: 'TP2',
    },
    3: {
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      textColor: 'text-teal-500',
      label: 'TP3',
    },
  }[level]

  return (
    <div className={cn(
      'p-3 rounded-lg border',
      levelConfig.bgColor,
      levelConfig.borderColor
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          'text-xs font-medium',
          levelConfig.textColor
        )}>
          {levelConfig.label}
        </span>
        <span className="text-xs text-text-secondary">
          {t.level} {level}
        </span>
      </div>
      <div className={cn(
        'text-lg font-bold tabular-nums',
        levelConfig.textColor
      )}>
        {safeToFixed(price)}
      </div>
      <div className={cn(
        'text-xs mt-1 tabular-nums',
        levelConfig.textColor
      )}>
        +{safeToFixed(percentFromEntry, 1)}%
      </div>
    </div>
  )
}
