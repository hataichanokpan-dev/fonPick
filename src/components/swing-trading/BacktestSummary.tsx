/**
 * Backtest Summary Component
 *
 * แสดงสรุปผลการ Backtest:
 * - Win rate (อัตราชนะ)
 * - Average return (ผลตอบแทนเฉลี่ย)
 * - Max drawdown (ราคาตกลงสูงสุด)
 * - Trend arrows (↑↓) แสดงการเปลี่ยนแปลง
 * - Compact card layout
 *
 * ใช้ CSS animations แทน Framer Motion (ประหยัด memory)
 */

'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card'
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react'
import { cn, safeToFixed } from '@/lib/utils'
import type { BacktestStatistics } from '@/types/risk-management'

interface BacktestSummaryProps {
  /** สถิติการ backtest */
  statistics: BacktestStatistics
  /** ค่าเปรียบเทียบ (optional) สำหรับแสดง trend arrow */
  comparison?: {
    previousWinRate?: number
    previousAvgReturn?: number
    previousMaxDrawdown?: number
  }
  locale: 'en' | 'th'
}

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'Backtest Summary',
    winRate: 'Win Rate',
    avgReturn: 'Avg Return',
    maxDrawdown: 'Max Drawdown',
    totalTrades: 'Total Trades',
    profitFactor: 'Profit Factor',
    sharpeRatio: 'Sharpe Ratio',
  },
  th: {
    title: 'สรุปผล Backtest',
    winRate: 'อัตราชนะ',
    avgReturn: 'ผลตอบแทนเฉลี่ย',
    maxDrawdown: 'ราคาตกสูงสุด',
    totalTrades: 'จำนวนเทรดทั้งหมด',
    profitFactor: 'อัตราผลกำไร',
    sharpeRatio: 'Sharpe Ratio',
  },
} as const

// ============================================================================
// TREND ARROW COMPONENT
// ============================================================================

interface TrendArrowProps {
  /** ค่าปัจจุบัน */
  current: number
  /** ค่าก่อนหน้า (สำหรับเปรียบเทียบ) */
  previous?: number
  /** กลับด้าน (ถ้าค่าลดดีขึ้น เช่น drawdown) */
  invert?: boolean
}

function TrendArrow({ current, previous, invert = false }: TrendArrowProps) {
  if (previous === undefined) {
    return null
  }

  const change = current - previous
  const percentChange = previous !== 0 ? (change / previous) * 100 : 0

  // ถ้าไม่มีการเปลี่ยนแปลง
  if (Math.abs(change) < 0.01) {
    return null
  }

  // กำหนดสีและไอคอน
  const isImprovement = invert ? change < 0 : change > 0
  const color = isImprovement ? 'text-up-primary' : 'text-rose-500'
  const Icon = isImprovement ? TrendingUp : TrendingDown

  return (
    <div className={cn('flex items-center gap-1 text-xs font-medium', color)}>
      <Icon className="w-3 h-3" />
      <span className="tabular-nums">
        {Math.abs(percentChange) >= 1
          ? `${safeToFixed(Math.abs(percentChange), 1)}%`
          : `${safeToFixed(Math.abs(change), 2)}`
        }
      </span>
    </div>
  )
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  label: string
  value: string
  subtext?: string
  icon: typeof Activity | typeof BarChart3 | typeof TrendingUp
  color: string
  bgColor: string
  trendArrow?: React.ReactNode
}

function StatCard({ label, value, subtext, icon: Icon, color, bgColor, trendArrow }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-border">
      <div className={cn('p-2 rounded-lg', bgColor)}>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <div className="flex-1">
        <div className="text-xs text-text-secondary">{label}</div>
        <div className={cn('text-lg font-bold tabular-nums', color)}>
          {value}
        </div>
        {subtext && (
          <div className="text-xs text-text-3">{subtext}</div>
        )}
      </div>
      {trendArrow && <div className="flex-shrink-0">{trendArrow}</div>}
    </div>
  )
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BacktestSummary({
  statistics,
  comparison,
  locale,
}: BacktestSummaryProps) {
  const t = LABELS[locale]

  return (
    <Card variant="default" padding="md" className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t.title}</span>
          <span className="text-xs text-text-3 font-normal">
            {t.totalTrades}: {statistics.totalTrades}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Win Rate */}
        <StatCard
          label={t.winRate}
          value={`${safeToFixed(statistics.winRate, 1)}%`}
          subtext={`${statistics.winCount}W / ${statistics.lossCount}L`}
          icon={Activity}
          color={statistics.winRate >= 60 ? 'text-up-primary' : statistics.winRate >= 50 ? 'text-amber-500' : 'text-rose-500'}
          bgColor={statistics.winRate >= 60 ? 'bg-up-soft/20' : statistics.winRate >= 50 ? 'bg-amber-500/10' : 'bg-rose-500/10'}
          trendArrow={
            comparison?.previousWinRate !== undefined && (
              <TrendArrow
                current={statistics.winRate}
                previous={comparison.previousWinRate}
              />
            )
          }
        />

        {/* Average Return */}
        <StatCard
          label={t.avgReturn}
          value={`${safeToFixed(statistics.totalReturnPercent, 1)}%`}
          subtext={`${statistics.winCount}W / ${statistics.lossCount}L`}
          icon={TrendingUp}
          color={statistics.totalReturnPercent >= 20 ? 'text-up-primary' : statistics.totalReturnPercent >= 10 ? 'text-amber-500' : 'text-rose-500'}
          bgColor={statistics.totalReturnPercent >= 20 ? 'bg-up-soft/20' : statistics.totalReturnPercent >= 10 ? 'bg-amber-500/10' : 'bg-rose-500/10'}
          trendArrow={
            comparison?.previousAvgReturn !== undefined && (
              <TrendArrow
                current={statistics.totalReturnPercent}
                previous={comparison.previousAvgReturn}
              />
            )
          }
        />

        {/* Max Drawdown */}
        <StatCard
          label={t.maxDrawdown}
          value={`-${safeToFixed(statistics.maxDrawdown, 1)}%`}
          icon={TrendingDown}
          color={statistics.maxDrawdown <= 10 ? 'text-up-primary' : statistics.maxDrawdown <= 20 ? 'text-amber-500' : 'text-rose-500'}
          bgColor={statistics.maxDrawdown <= 10 ? 'bg-up-soft/20' : statistics.maxDrawdown <= 20 ? 'bg-amber-500/10' : 'bg-rose-500/10'}
          trendArrow={
            comparison?.previousMaxDrawdown !== undefined && (
              <TrendArrow
                current={statistics.maxDrawdown}
                previous={comparison.previousMaxDrawdown}
                invert // ลด drawdown คือดีขึ้น
              />
            )
          }
        />

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Profit Factor */}
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="text-xs text-text-secondary mb-1">{t.profitFactor}</div>
            <div className={cn(
              'text-base font-bold tabular-nums',
              statistics.profitFactor >= 2 ? 'text-up-primary' : statistics.profitFactor >= 1.5 ? 'text-amber-500' : 'text-rose-500'
            )}>
              {safeToFixed(statistics.profitFactor, 2)}
            </div>
          </div>

          {/* Sharpe Ratio */}
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="text-xs text-text-secondary mb-1">{t.sharpeRatio}</div>
            <div className={cn(
              'text-base font-bold tabular-nums',
              statistics.sharpeRatio >= 2 ? 'text-up-primary' : statistics.sharpeRatio >= 1 ? 'text-amber-500' : 'text-rose-500'
            )}>
              {safeToFixed(statistics.sharpeRatio, 2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
