'use client'

/**
 * Entry Plan Card Component
 *
 * Displays actionable trading plan with:
 * - Buy at price
 * - Stop loss
 * - Target price
 * - Position size
 * - Risk/reward ratio
 */

import { ENTRY_PLAN_DEFAULTS } from './constants'
import { formatCurrency } from './utils/formatters'
import type { EntryPlanCardProps } from './types'
import { ArrowDownRight, Target, Shield, Wallet } from 'lucide-react'
import { safeToFixed } from '@/lib/utils'

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'ENTRY PLAN',
    buyAt: 'BUY AT',
    stopLoss: 'STOP LOSS',
    target: 'TARGET',
    positionSize: 'POSITION SIZE',
    riskReward: 'RISK / REWARD',
    atSupport: 'at support',
      discount: 'discount',
      fromBuy: 'from buy',
      fromBuy2: 'from buy',
      timeHorizon: 'Time Horizon',
      portfolio: 'of portfolio',
      months: 'months',
    buyRationale: 'Buy near support level',
    stopRationale: 'Stop below support',
    targetRationale: 'Based on fair value',
  },
  th: {
    title: 'แผนการเข้าซื้อ',
    buyAt: 'ซื้อที่',
    stopLoss: 'ตัดขาดทอน',
    target: 'เป้าหมาย',
    positionSize: 'ขนาดการถือ',
    riskReward: 'ความเสี่ยง/ผลตอบแทน',
    atSupport: 'ที่แนวรับ',
    discount: 'ส่วนลด',
    fromBuy: 'จากราคาซื้อ',
    fromBuy2: 'จากราคาซื้อ',
    timeHorizon: 'ระยะเวลา',
    portfolio: 'ของพอร์ต',
    months: 'เดือน',
    buyRationale: 'ซื้อใกล้แนวรับ',
    stopRationale: 'ตัดขาดทอนหลังแนวรับ',
    targetRationale: 'พิจารณาจากมูลค่าที่เหมาะสม',
  },
} as const

export function EntryPlanCard({
  entryPlan,
  currentPrice,
  locale = 'th',
  className = '',
}: EntryPlanCardProps) {
  const t = LABELS[locale]

  // Calculate percentages
  const buyDiscount = ((currentPrice - entryPlan.buyAt.price) / currentPrice) * 100
  const stopFromBuy = ((entryPlan.buyAt.price - entryPlan.stopLoss.price) / entryPlan.buyAt.price) * 100
  const targetFromBuy = ((entryPlan.target.price - entryPlan.buyAt.price) / entryPlan.buyAt.price) * 100

  return (
    <div className={`entry-plan-card ${className}`}>
      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-surface-2/50">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Target className="w-4 h-4 text-accent-teal" />
            {t.title}
          </h3>
        </div>

        {/* Price levels */}
        <div className="p-4">
          <div className="grid lg:grid-cols-3 gap-3 mb-4">
            {/* Buy at */}
            <PriceLevelCard
              label={t.buyAt}
              price={entryPlan.buyAt.price}
              percentage={buyDiscount}
              percentageLabel={t.discount}
              icon={<ArrowDownRight className="w-4 h-4" />}
              color="up"
              rationale={entryPlan.buyAt.rationale}
            />

            {/* Stop loss */}
            <PriceLevelCard
              label={t.stopLoss}
              price={entryPlan.stopLoss.price}
              percentage={stopFromBuy}
              percentageLabel={t.fromBuy}
              icon={<Shield className="w-4 h-4" />}
              color="down"
              rationale={entryPlan.stopLoss.rationale}
            />

            {/* Target */}
            <PriceLevelCard
              label={t.target}
              price={entryPlan.target.price}
              percentage={targetFromBuy}
              percentageLabel={t.fromBuy2}
              icon={<Target className="w-4 h-4" />}
              color="up"
              rationale={entryPlan.target.rationale}
            />
          </div>

          {/* Position size and R/R */}
          <div className="grid lg:grid-cols-2 gap-3">
            {/* Position size */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center gap-2 mb-2 ">
                <Wallet className="w-4 h-4 text-white" />
                <span className="text-xs text-white">{t.positionSize}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-text-primary">
                  {entryPlan.positionSize.percentage * 100}
                </span>
                <span className="text-xs text-white">%{t.portfolio}</span>
              </div>
              {entryPlan.positionSize.rationale && (
                <p className="text-xs text-text-3 mt-1 line-clamp-1">
                  {entryPlan.positionSize.rationale}
                </p>
              )}
            </div>

            {/* Risk/Reward */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-white" />
                <span className="text-xs text-white">{t.riskReward}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tabular-nums text-text-primary">
                  {entryPlan.riskReward.ratio}
                </span>
              </div>
              <p className="text-xs text-text-3 mt-1">
                {entryPlan.riskReward.calculation}
              </p>
            </div>
          </div>

          
        </div>

       
      </div>
      
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface PriceLevelCardProps {
  label: string
  price: number
  percentage: number
  percentageLabel: string
  icon: React.ReactNode
  color: 'up' | 'down'
  rationale?: string
}

function PriceLevelCard({
  label,
  price,
  percentage,
  percentageLabel,
  icon,
  color,
  rationale,
}: PriceLevelCardProps) {
  const colorClasses = {
    up: 'text-up-primary bg-up-soft',
    down: 'text-risk bg-risk/10',
  }

  const percentageColor = color === 'up' ? (percentage > 0 ? 'text-up-primary' : 'text-risk') : 'text-risk'

  return (
    <div className="p-3 rounded-lg bg-surface-2 border border-border">
      <div className="flex items-center gap-2 text-xs text-3 text-white mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`text-xl font-bold tabular-nums ${colorClasses[color].split(' ')[0]}`}>
        {formatCurrency(price)}
      </div>
      <div className={`text-xs mt-1 ${percentageColor}`}>
        {color === 'up' ? '+' : ''}{safeToFixed(percentage, 1)}% {percentageLabel}
      </div>
      {rationale && (
        <p className="text-xs text-text-3 mt-1 line-clamp-2">{rationale}</p>
      )}
    </div>
  )
}

interface PriceRangeVisualizerProps {
  currentPrice: number
  buyAt: number
  stopLoss: number
  target: number
}

export function PriceRangeVisualizer({
  currentPrice,
  buyAt,
  stopLoss,
  target,
}: PriceRangeVisualizerProps) {
  // Find range for visualization
  const minPrice = Math.min(stopLoss, buyAt, target, currentPrice)
  const maxPrice = Math.max(stopLoss, buyAt, target, currentPrice)
  const range = maxPrice - minPrice

  // Calculate positions (0-100%)
  const getPosition = (price: number) => ((price - minPrice) / range) * 100

  const currentPos = getPosition(currentPrice)
  const buyPos = getPosition(buyAt)
  const stopPos = getPosition(stopLoss)
  const targetPos = getPosition(target)

  return (
    <div className="relative h-12 bg-surface-3 rounded-lg overflow-hidden">
      {/* Range line */}
      <div className="absolute inset-y-2 left-4 right-4 bg-surface-2 rounded" />

      {/* Stop loss */}
      <div
        className="absolute top-2 bottom-2 w-0.5 bg-risk"
        style={{ left: `calc(4% + ${stopPos * 92}%)` }}
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-risk whitespace-nowrap">
          {formatCurrency(stopLoss)}
        </div>
      </div>

      {/* Buy at */}
      <div
        className="absolute top-2 bottom-2 w-0.5 bg-up-primary"
        style={{ left: `calc(4% + ${buyPos * 92}%)` }}
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-up-primary whitespace-nowrap">
          {formatCurrency(buyAt)}
        </div>
      </div>

      {/* Current price */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-text-primary"
        style={{ left: `calc(4% + ${currentPos * 92}%)` }}
      >
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-text-primary whitespace-nowrap bg-surface px-1 rounded">
          {formatCurrency(currentPrice)}
        </div>
      </div>

      {/* Target */}
      <div
        className="absolute top-2 bottom-2 w-0.5 bg-accent-teal"
        style={{ left: `calc(4% + ${targetPos * 92}%)` }}
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-accent-teal whitespace-nowrap">
          {formatCurrency(target)}
        </div>
      </div>
    </div>
  )
}

/**
 * Calculate entry plan from screening results
 */
export function calculateEntryPlan(
  currentPrice: number,
  supportLevel: number,
  targetPrice: number,
  decision: 'BUY' | 'HOLD' | 'PASS'
): EntryPlanCardProps['entryPlan'] {
  // Validate inputs
  if (currentPrice <= 0 || supportLevel <= 0 || targetPrice <= 0) {
    throw new Error('Prices must be positive numbers')
  }

  // Buy at support + small margin
  const buyAt = Math.max(supportLevel, currentPrice * (1 - ENTRY_PLAN_DEFAULTS.BUY_PROXIMITY))
  const buyDiscount = currentPrice > 0 ? (currentPrice - buyAt) / currentPrice : 0

  // Stop loss at -12% from buy (or below support)
  const stopLoss = Math.min(buyAt * (1 - ENTRY_PLAN_DEFAULTS.STOP_LOSS_PCT), supportLevel * 0.98)

  // Target at +20-25% from buy
  const target = Math.max(
    buyAt * (1 + ENTRY_PLAN_DEFAULTS.TARGET_PCT_MIN),
    Math.min(targetPrice, buyAt * (1 + ENTRY_PLAN_DEFAULTS.TARGET_PCT_MAX))
  )

  // Position size based on confidence
  let positionSize = 0.05 // Default 5%
  if (decision === 'BUY') {
    if (buyDiscount > 0.05) positionSize = 0.10
    else if (buyDiscount > 0.03) positionSize = 0.08
    else positionSize = 0.05
  } else if (decision === 'HOLD') {
    positionSize = 0.03
  } else {
    positionSize = 0 // PASS = don't buy
  }

  // Risk/reward ratio
  const risk = buyAt - stopLoss
  const reward = target - buyAt
  const rrRatio = reward / risk

  return {
    buyAt: {
      price: buyAt,
      discountFromCurrent: buyDiscount,
      rationale: 'Buy near support level with margin of safety',
    },
    stopLoss: {
      price: stopLoss,
      percentageFromBuy: ENTRY_PLAN_DEFAULTS.STOP_LOSS_PCT,
      rationale: 'Stop below support level',
    },
    target: {
      price: target,
      percentageFromBuy: (target - buyAt) / buyAt,
      rationale: 'Based on fair value estimate',
    },
    positionSize: {
      percentage: positionSize,
      rationale: positionSize > 0 ? `Based on entry discount and risk profile` : 'Not recommended',
    },
    riskReward: {
      ratio: `1:${safeToFixed(rrRatio, 1)}`,
      calculation: `Risk ${formatCurrency(risk)} / Reward ${formatCurrency(reward)}`,
    },
    timeHorizon: decision === 'BUY' ? '3-6 เดือน' : 'N/A',
  }
}
