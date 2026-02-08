'use client'

/**
 * Entry Plan Card Component (Enhanced with Dual-Perspective Analysis)
 *
 * Displays actionable trading plan combining Technical and Value perspectives:
 * - Signal alignment indicator
 * - Buy at price (with technical & value rationale)
 * - Stop loss (showing both technical and value SL)
 * - Target price (showing both technical and value targets)
 * - Valuation targets (from Alpha API) - expandable section
 * - Position size
 * - Risk/reward ratio
 */

import { formatCurrency } from './utils/formatters'
import type {
  EntryPlanCardProps,
  ValuationTargets,
  SignalAlignmentStatus,
} from './types'
import {
  ArrowDownRight,
  Target,
  Shield,
  Wallet,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Star,
  Activity,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  MinusCircle,
} from 'lucide-react'
import { safeToFixed } from '@/lib/utils'
import { useState } from 'react'

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'ENTRY PLAN',
    signalAlignment: 'SIGNAL ALIGNMENT',
    technical: 'TECHNICAL',
    value: 'VALUE',
    buyAt: 'BUY AT',
    stopLoss: 'STOP LOSS',
    technicalTarget: 'TECHNICAL TARGET',
    valueTarget: 'VALUE TARGET',
    target: 'TARGET',
    positionSize: 'POSITION SIZE',
    riskReward: 'RISK / REWARD',
    timeHorizon: 'TIME HORIZON',
    atSupport: 'at support',
    discount: 'discount',
    fromBuy: 'from buy',
    portfolio: 'of portfolio',
    months: 'months',
    technicalSL: 'Technical SL',
    valueSL: 'Value SL',
    technicalTgt: 'Technical Target',
    valueTgt: 'Value Target',
    valuationTargets: 'VALUATION TARGETS',
    valuationSources: 'FROM ALPHA ANALYSIS',
    expand: 'Expand',
    collapse: 'Collapse',
    avgForecast: 'Avg Forecast',
    intrinsicValue: 'Intrinsic Value',
    lowForecast: 'Low Forecast',
    highForecast: 'High Forecast',
    dcfValue: 'DCF Value',
    bearCase: 'Bear Case',
    fairValue: 'Fair Value',
    baseCase: 'Base Case',
    bullCase: 'Bull Case',
    range: 'Range',
    current: 'Current',
    keyInsight: 'Key Insight',
    keyInsightText: 'Avg Forecast provides the most reliable target based on consensus analyst estimates.',
    primary: 'PRIMARY',
    strongAlignment: 'STRONG ALIGNMENT',
    partialAlignment: 'PARTIAL ALIGNMENT',
    conflict: 'CONFLICTING SIGNALS',
    neutral: 'INSUFFICIENT DATA',
    buyRecommendation: 'BUY',
    considerRecommendation: 'CONSIDER',
    waitRecommendation: 'WAIT FOR BETTER PRICE',
    avoidRecommendation: 'AVOID',
    speculativeRecommendation: 'SPECULATIVE',
    passRecommendation: 'PASS',
    technicalScore: 'Technical Score',
    valueScore: 'Value Score',
    points: 'points',
  },
  th: {
    title: 'แผนการเข้าซื้อ',
    signalAlignment: 'สัญญาณควบคู่',
    technical: 'เทคนิค',
    value: 'มูลค่า',
    buyAt: 'ซื้อที่',
    stopLoss: 'ตัดขาดทอน',
    technicalTarget: 'เป้าหมายเทคนิค',
    valueTarget: 'เป้าหมายมูลค่า',
    target: 'เป้าหมาย',
    positionSize: 'ขนาดการถือ',
    riskReward: 'ความเสี่ยง/ผลตอบแทน',
    timeHorizon: 'ระยะเวลา',
    atSupport: 'ที่แนวรับ',
    discount: 'ส่วนลด',
    fromBuy: 'จากราคาซื้อ',
    portfolio: 'ของพอร์ต',
    months: 'เดือน',
    technicalSL: 'SL เทคนิค',
    valueSL: 'SL มูลค่า',
    technicalTgt: 'เป้าหมายเทคนิค',
    valueTgt: 'เป้าหมายมูลค่า',
    valuationTargets: 'เป้าหมายมูลค่า',
    valuationSources: 'จากการวิเคราะห์ Alpha',
    expand: 'ขยาย',
    collapse: 'ย่อ',
    avgForecast: 'คาดการณ์เฉลี่ย',
    intrinsicValue: 'มูลค่าตามหลักการ',
    lowForecast: 'คาดการณ์ต่ำสุด',
    highForecast: 'คาดการณ์สูงสุด',
    dcfValue: 'มูลค่า DCF',
    bearCase: 'กรณีแย่',
    fairValue: 'มูลค่าพอเหมาะ',
    baseCase: 'กรณีฐาน',
    bullCase: 'กรณีดี',
    range: 'ช่วง',
    current: 'ปัจจุบัน',
    keyInsight: 'ข้อควรระวัง',
    keyInsightText: 'คาดการณ์เฉลี่ยให้เป้าหมายที่เชื่อถือได้มากที่สุดจากความเห็นของนักวิเคราะห์',
    primary: 'หลัก',
    strongAlignment: 'สัญญาณตรงกัน',
    partialAlignment: 'สัญญาณบางส่วน',
    conflict: 'สัญญาณขัดแย้ง',
    neutral: 'ข้อมูลไม่เพียงพอ',
    buyRecommendation: 'ซื้อ',
    considerRecommendation: 'พิจารณา',
    waitRecommendation: 'รอราคาดีกว่า',
    avoidRecommendation: 'หลีกเลี่ยง',
    speculativeRecommendation: 'เก็งกำไร',
    passRecommendation: 'พัก',
    technicalScore: 'คะแนนเทคนิค',
    valueScore: 'คะแนนมูลค่า',
    points: 'คะแนน',
  },
} as const

// ============================================================================
// COLOR CONFIGURATION
// ============================================================================

const ALIGNMENT_CONFIG = {
  strong: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-500',
    icon: CheckCircle2,
    label: 'strongAlignment',
  },
  partial: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-500',
    icon: AlertCircle,
    label: 'partialAlignment',
  },
  conflict: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-500',
    icon: MinusCircle,
    label: 'conflict',
  },
  neutral: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-500',
    icon: MinusCircle,
    label: 'neutral',
  },
} as const

export function EntryPlanCard({
  entryPlan,
  currentPrice,
  locale = 'th',
  className = '',
  valuationTargets,
  technicalScoreData,
  valueScoreData,
}: EntryPlanCardProps) {
  const t = LABELS[locale]
  const [isValuationExpanded, setIsValuationExpanded] = useState(false)

  // Handle N/A values - don't show card if no valid data
  if (!currentPrice || currentPrice <= 0 || !entryPlan) {
    return null
  }

  // Get scores for signal alignment
  const technicalScore = technicalScoreData?.technicalScore ?? 0
  const technicalMaxScore = 5 // Layer 4 technical score max
  const valueScore = valueScoreData?.valueScore ?? 0
  const valueMaxScore = 5 // Layer 3 value score max

  // Determine signal alignment
  const signalAlignment = entryPlan.signalAlignment ?? {
    technicalScore,
    technicalMaxScore,
    valueScore,
    valueMaxScore,
    status: 'neutral',
    recommendation: t.passRecommendation,
  }

  const alignmentConfig = ALIGNMENT_CONFIG[signalAlignment.status]
  const AlignmentIcon = alignmentConfig.icon

  // Calculate percentages
  const buyDiscount = ((currentPrice - entryPlan.buyAt.price) / currentPrice) * 100
  const stopFromBuy = entryPlan.stopLoss.percentageFromBuy
  const targetFromBuy = entryPlan.target.percentageFromBuy

  return (
    <div className={`entry-plan-card ${className}`}>
      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-surface-2/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Target className="w-4 h-4 text-accent-teal" />
              {t.title}
            </h3>
            {/* Overall quality badge if available */}
            {signalAlignment.status !== 'neutral' && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${alignmentConfig.bg} ${alignmentConfig.border} ${alignmentConfig.text}`}>
                <AlignmentIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  {t[alignmentConfig.label]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Signal Alignment Section */}
          <SignalAlignmentSection
            signalAlignment={signalAlignment}
            locale={locale}
          />

          {/* Main price levels - 3 columns */}
          <div className="grid lg:grid-cols-3 gap-3">
            {/* Buy at */}
            <DualPerspectivePriceCard
              label={t.buyAt}
              price={entryPlan.buyAt.price}
              percentage={buyDiscount}
              percentageLabel={t.discount}
              icon={<ArrowDownRight className="w-4 h-4" />}
              color="up"
              rationale={entryPlan.buyAt.rationale}
              technicalRationale={entryPlan.buyAt.technicalRationale}
              valueRationale={entryPlan.buyAt.valueRationale}
            />

            {/* Stop loss */}
            <DualPerspectivePriceCard
              label={t.stopLoss}
              price={entryPlan.stopLoss.price}
              percentage={stopFromBuy}
              percentageLabel={t.fromBuy}
              icon={<Shield className="w-4 h-4" />}
              color="down"
              rationale={entryPlan.stopLoss.rationale}
              technicalValue={entryPlan.stopLoss.technicalSL}
              valueValue={entryPlan.stopLoss.valueSL}
              technicalLabel={t.technicalSL}
              valueLabel={t.valueSL}
            />

            {/* Target */}
            <DualPerspectivePriceCard
              label={t.target}
              price={entryPlan.target.price}
              percentage={targetFromBuy}
              percentageLabel={t.fromBuy}
              icon={<Target className="w-4 h-4" />}
              color="up"
              rationale={entryPlan.target.rationale}
              technicalValue={entryPlan.target.technicalTarget}
              valueValue={entryPlan.target.valueTarget}
              technicalLabel={t.technicalTgt}
              valueLabel={t.valueTgt}
            />
          </div>

          {/* Risk/Reward Visualizer */}
          {(entryPlan.riskReward.riskAmount !== undefined && entryPlan.riskReward.rewardAmount !== undefined) && (
            <RiskRewardVisualizer
              currentPrice={currentPrice}
              buyPrice={entryPlan.buyAt.price}
              stopLoss={entryPlan.stopLoss.price}
              technicalTarget={entryPlan.target.technicalTarget ?? entryPlan.target.price}
              valueTarget={entryPlan.target.valueTarget ?? entryPlan.target.price}
              finalTarget={entryPlan.target.price}
              locale={locale}
            />
          )}

          {/* Valuation Targets Section - Collapsible */}
          {valuationTargets && (
            <ValuationTargetsSection
              targets={valuationTargets}
              buyPrice={entryPlan.buyAt.price}
              currentPrice={currentPrice}
              isExpanded={isValuationExpanded}
              onToggle={() => setIsValuationExpanded(!isValuationExpanded)}
              locale={locale}
            />
          )}

          {/* Position size, R/R, Time Horizon - 3 columns */}
          <div className="grid lg:grid-cols-3 gap-3">
            {/* Position size */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-accent-teal" />
                <span className="text-xs text-text-secondary">{t.positionSize}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-text-primary tabular-nums">
                  {safeToFixed(entryPlan.positionSize.percentage * 100, 0)}
                </span>
                <span className="text-xs text-text-secondary">% {t.portfolio}</span>
              </div>
              {entryPlan.positionSize.rationale && (
                <p className="text-xs text-text-3 mt-1 line-clamp-2">
                  {entryPlan.positionSize.rationale}
                </p>
              )}
            </div>

            {/* Risk/Reward */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-accent-blue" />
                <span className="text-xs text-text-secondary">{t.riskReward}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tabular-nums text-text-primary">
                  {entryPlan.riskReward.ratio}
                </span>
              </div>
              {entryPlan.riskReward.riskAmount && entryPlan.riskReward.rewardAmount && (
                <p className="text-xs text-text-3 mt-1">
                  {locale === 'th' ? 'รับ' : 'Risk'} {formatCurrency(entryPlan.riskReward.riskAmount)} / {locale === 'th' ? 'ได้' : 'Reward'} {formatCurrency(entryPlan.riskReward.rewardAmount)}
                </p>
              )}
            </div>

            {/* Time Horizon */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent-purple" />
                <span className="text-xs text-text-secondary">{t.timeHorizon}</span>
              </div>
              <div className="text-lg font-bold text-text-primary tabular-nums">
                {entryPlan.timeHorizon}
              </div>
              <p className="text-xs text-text-3 mt-1">
                {locale === 'th' ? 'ระยะเวลาแนะนำ' : 'Recommended period'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// SIGNAL ALIGNMENT SECTION
// ============================================================================

interface SignalAlignmentSectionProps {
  signalAlignment: {
    technicalScore: number
    technicalMaxScore: number
    valueScore: number
    valueMaxScore: number
    status: SignalAlignmentStatus
    recommendation: string
  }
  locale: 'en' | 'th'
}

function SignalAlignmentSection({
  signalAlignment,
  locale,
}: SignalAlignmentSectionProps) {
  const t = LABELS[locale]
  const alignmentConfig = ALIGNMENT_CONFIG[signalAlignment.status]
  const AlignmentIcon = alignmentConfig.icon

  // Normalize scores to 0-5 scale for display
  const techNorm = Math.round((signalAlignment.technicalScore / signalAlignment.technicalMaxScore) * 5)
  const valNorm = Math.round((signalAlignment.valueScore / signalAlignment.valueMaxScore) * 5)

  return (
    <div className={`p-3 rounded-lg border ${alignmentConfig.bg} ${alignmentConfig.border}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {t.signalAlignment}
          </span>
        </div>
        <AlignmentIcon className={`w-4 h-4 ${alignmentConfig.text}`} />
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        {/* Technical score */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-teal-500/10 border border-teal-500/30">
            <BarChart3 className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-xs text-text-secondary">{t.technical}</span>
          </div>
          <span className={`text-sm font-bold ${techNorm >= 4 ? 'text-emerald-500' : techNorm >= 3 ? 'text-amber-500' : 'text-red-500'}`}>
            {techNorm}/5
          </span>
        </div>

        {/* Value score */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30">
            <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-xs text-text-secondary">{t.value}</span>
          </div>
          <span className={`text-sm font-bold ${valNorm >= 4 ? 'text-emerald-500' : valNorm >= 3 ? 'text-amber-500' : 'text-red-500'}`}>
            {valNorm}/5
          </span>
        </div>
      </div>

      {/* Recommendation */}
      <p className={`text-xs ${alignmentConfig.text} font-medium`}>
        {signalAlignment.recommendation}
      </p>
    </div>
  )
}

// ============================================================================
// DUAL PERSPECTIVE PRICE CARD
// ============================================================================

interface DualPerspectivePriceCardProps {
  label: string
  price: number
  percentage: number
  percentageLabel: string
  icon: React.ReactNode
  color: 'up' | 'down'
  rationale?: string
  technicalValue?: number
  valueValue?: number
  technicalLabel?: string
  valueLabel?: string
  technicalRationale?: string
  valueRationale?: string
}

function DualPerspectivePriceCard({
  label,
  price,
  percentage,
  percentageLabel,
  icon,
  color,
  rationale,
  technicalValue,
  valueValue,
  technicalLabel,
  valueLabel,
}: DualPerspectivePriceCardProps) {
  const colorClasses = {
    up: 'text-up-primary',
    down: 'text-risk',
  }

  const percentageColor = color === 'up'
    ? (percentage > 0 ? 'text-up-primary' : 'text-risk')
    : 'text-risk'

  const hasBreakdown = technicalValue !== undefined && valueValue !== undefined

  return (
    <div className="p-3 rounded-lg bg-surface-2 border border-border hover:border-border-subtle/80 transition-colors">
      <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`text-xl font-bold tabular-nums ${colorClasses[color]}`}>
        {formatCurrency(price)}
      </div>
      <div className={`text-xs mt-1 ${percentageColor}`}>
        {color === 'up' && percentage > 0 ? '+' : ''}{safeToFixed(percentage, 1)}% {percentageLabel}
      </div>

      {/* Dual perspective breakdown */}
      {hasBreakdown && technicalLabel && valueLabel && (
        <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
          {/* Technical */}
          {technicalValue !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                {technicalLabel}
              </span>
              <span className="font-medium text-teal-500 tabular-nums">
                {formatCurrency(technicalValue)}
              </span>
            </div>
          )}
          {/* Value */}
          {valueValue !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                {valueLabel}
              </span>
              <span className="font-medium text-purple-500 tabular-nums">
                {formatCurrency(valueValue)}
              </span>
            </div>
          )}
        </div>
      )}

      {rationale && !hasBreakdown && (
        <p className="text-xs text-text-3 mt-1 line-clamp-2">{rationale}</p>
      )}
    </div>
  )
}

// ============================================================================
// RISK/REWARD VISUALIZER
// ============================================================================

interface RiskRewardVisualizerProps {
  currentPrice: number
  buyPrice: number
  stopLoss: number
  technicalTarget: number
  valueTarget: number
  finalTarget: number
  locale: 'en' | 'th'
}

function RiskRewardVisualizer({
  currentPrice,
  buyPrice,
  stopLoss,
  technicalTarget,
  valueTarget,
  locale,
}: RiskRewardVisualizerProps) {
  // Find range for visualization
  const prices = [currentPrice, buyPrice, stopLoss, technicalTarget, valueTarget]
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const range = maxPrice - minPrice

  // Calculate positions (0-100%)
  const getPosition = (price: number) => ((price - minPrice) / range) * 100

  const currentPos = getPosition(currentPrice)
  const buyPos = getPosition(buyPrice)
  const stopPos = getPosition(stopLoss)
  const techPos = getPosition(technicalTarget)
  const valPos = getPosition(valueTarget)

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-text-3">
        <span>{locale === 'th' ? 'ระดับราคาและเป้าหมาย' : 'Price Levels & Targets'}</span>
      </div>
      <div className="relative h-10 bg-surface-3 rounded-lg overflow-hidden px-1">
        {/* Background track */}
        <div className="absolute inset-x-1 inset-y-2 bg-surface-2 rounded" />

        {/* Stop loss */}
        <div
          className="absolute top-2 bottom-2 w-0.5 bg-risk"
          style={{ left: `calc(4% + ${stopPos * 92}%)` }}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-risk whitespace-nowrap font-medium">
            {formatCurrency(stopLoss)}
          </div>
        </div>

        {/* Buy at */}
        <div
          className="absolute top-2 bottom-2 w-0.5 bg-up-primary"
          style={{ left: `calc(4% + ${buyPos * 92}%)` }}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-up-primary whitespace-nowrap font-medium">
            {formatCurrency(buyPrice)}
          </div>
        </div>

        {/* Current price */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-text-primary"
          style={{ left: `calc(4% + ${currentPos * 92}%)` }}
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-text-primary whitespace-nowrap bg-surface px-1 rounded">
            {formatCurrency(currentPrice)}
          </div>
        </div>

        {/* Technical target */}
        <div
          className="absolute top-2 bottom-2 w-0.5 bg-teal-500"
          style={{ left: `calc(4% + ${techPos * 92}%)` }}
        >
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-teal-500 whitespace-nowrap font-medium">
            T: {formatCurrency(technicalTarget)}
          </div>
        </div>

        {/* Value target */}
        <div
          className="absolute top-2 bottom-2 w-0.5 bg-purple-500"
          style={{ left: `calc(4% + ${valPos * 92}%)` }}
        >
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-purple-500 whitespace-nowrap font-medium">
            V: {formatCurrency(valueTarget)}
          </div>
        </div>
      </div>

      {/* R/R ratios */}
      <div className="flex justify-center gap-4 text-xs">
        <span className="text-teal-500">
          {locale === 'th' ? 'เทคนิค' : 'Technical'}: 1:{safeToFixed((technicalTarget - buyPrice) / (buyPrice - stopLoss), 1)}
        </span>
        <span className="text-purple-500">
          {locale === 'th' ? 'มูลค่า' : 'Value'}: 1:{safeToFixed((valueTarget - buyPrice) / (buyPrice - stopLoss), 1)}
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// VALUATION TARGETS SECTION (Keeping existing implementation)
// ============================================================================

interface ValuationTargetsSectionProps {
  targets: ValuationTargets
  buyPrice: number
  currentPrice: number
  isExpanded: boolean
  onToggle: () => void
  locale: 'en' | 'th'
}

function ValuationTargetsSection({
  targets,
  buyPrice,
  currentPrice,
  isExpanded,
  onToggle,
  locale,
}: ValuationTargetsSectionProps) {
  const t = LABELS[locale]

  // Calculate percentages from buy price
  const calcPercentage = (value: number) =>
    safeToFixed(((value - buyPrice) / buyPrice) * 100, 1)

  // Determine range for visualization
  const allValues = [
    targets.lowForecast,
    targets.intrinsicValue,
    targets.avgForecast,
    targets.dcfValue,
    targets.highForecast,
    currentPrice,
  ].filter(Boolean)

  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const range = maxValue - minValue

  const getPosition = (value: number) =>
    ((value - minValue) / range) * 100

  return (
    <div className="border border-border/50 rounded-xl bg-surface-3/30 overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-2/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent-purple" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {t.valuationTargets}
          </span>
          <span className="text-xs text-text-3">
            {t.valuationSources}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Primary Target Summary */}
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <span className="text-xs text-text-3">{t.avgForecast}:</span>
            <span className="text-sm font-bold text-up-primary tabular-nums">
              {formatCurrency(targets.avgForecast)}
            </span>
            <span className="text-xs text-up-primary">
              +{calcPercentage(targets.avgForecast)}%
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-text-3" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-3" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-slide-down">
          {/* Primary Target Highlight */}
          <div className="p-4 rounded-xl border-2 border-up-primary/30 bg-up-soft/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-up-primary" />
                <span className="text-sm font-semibold text-text-primary">
                  {t.avgForecast}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-up-primary/20 text-up-primary">
                  {t.primary}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold tabular-nums text-up-primary">
                  {formatCurrency(targets.avgForecast)}
                </div>
                <div className="text-sm text-up-primary">
                  +{calcPercentage(targets.avgForecast)}%
                </div>
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {t.keyInsightText}
            </p>
          </div>

          {/* Range Visualization */}
          <div>
            <div className="flex justify-between text-xs text-text-3 mb-2">
              <span>{t.range}</span>
              <span>
                {formatCurrency(minValue)} - {formatCurrency(maxValue)}
              </span>
            </div>
            <div className="relative h-12 bg-surface-2 rounded-lg overflow-hidden px-1">
              {/* Background track */}
              <div className="absolute inset-x-1 inset-y-3 bg-surface-3 rounded" />

              {/* Value markers */}
              <ValueMarker
                value={targets.lowForecast}
                position={getPosition(targets.lowForecast)}
                label="Low"
                buyPrice={buyPrice}
                locale={locale}
              />
              <ValueMarker
                value={targets.intrinsicValue}
                position={getPosition(targets.intrinsicValue)}
                label="Intrinsic"
                buyPrice={buyPrice}
                locale={locale}
              />
              <ValueMarker
                value={targets.avgForecast}
                position={getPosition(targets.avgForecast)}
                label="Avg"
                buyPrice={buyPrice}
                locale={locale}
                isPrimary
              />
              <ValueMarker
                value={targets.dcfValue}
                position={getPosition(targets.dcfValue)}
                label="DCF"
                buyPrice={buyPrice}
                locale={locale}
              />
              <ValueMarker
                value={targets.highForecast}
                position={getPosition(targets.highForecast)}
                label="High"
                buyPrice={buyPrice}
                locale={locale}
              />
              <ValueMarker
                value={currentPrice}
                position={getPosition(currentPrice)}
                label="Current"
                buyPrice={buyPrice}
                locale={locale}
                isCurrent
              />
            </div>
          </div>

          {/* Detailed Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <ValuationTargetCard
              type="low"
              value={targets.lowForecast}
              buyPrice={buyPrice}
              locale={locale}
              label={t.lowForecast}
              caseLabel={t.bearCase}
            />
            <ValuationTargetCard
              type="intrinsic"
              value={targets.intrinsicValue}
              buyPrice={buyPrice}
              locale={locale}
              label={t.intrinsicValue}
              caseLabel={t.fairValue}
            />
            <ValuationTargetCard
              type="avg"
              value={targets.avgForecast}
              buyPrice={buyPrice}
              locale={locale}
              label={t.avgForecast}
              caseLabel={t.baseCase}
              isPrimary
            />
            <ValuationTargetCard
              type="high"
              value={targets.highForecast}
              buyPrice={buyPrice}
              locale={locale}
              label={t.highForecast}
              caseLabel={t.bullCase}
            />
          </div>

          {/* DCF Value - Full width */}
          <ValuationTargetCard
            type="dcf"
            value={targets.dcfValue}
            buyPrice={buyPrice}
            locale={locale}
            label={t.dcfValue}
            caseLabel={locale === 'th' ? 'มูลค่ากระแสเงินสด' : 'Cash Flow Analysis'}
            fullWidth
          />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// VALUE MARKER COMPONENT
// ============================================================================

interface ValueMarkerProps {
  value: number
  position: number
  label: string
  buyPrice: number
  locale: 'en' | 'th'
  isPrimary?: boolean
  isCurrent?: boolean
}

function ValueMarker({
  value,
  position,
  label,
  buyPrice,
  isPrimary,
  isCurrent,
}: ValueMarkerProps) {
  const percentage = safeToFixed(((value - buyPrice) / buyPrice) * 100, 1)

  return (
    <div
      className={`absolute top-0 bottom-0 flex flex-col items-center ${isCurrent ? 'z-10' : 'z-0'}`}
      style={{ left: `calc(4% + ${position * 92}%)` }}
    >
      <div
        className={`
          -mt-1 px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap
          ${isPrimary ? 'bg-up-primary text-white' : isCurrent ? 'bg-text-primary text-white' : 'bg-surface-3 text-text-3'}
        `}
      >
        {formatCurrency(value)}
      </div>
      <div
        className={`
          w-0.5 flex-1 mt-0.5
          ${isCurrent ? 'bg-text-primary w-1' : isPrimary ? 'bg-up-primary' : 'bg-border'}
        `}
      />
      <div className="-mb-0.5 text-xs text-text-3 font-medium">
        {label}
      </div>
      <div className="-mb-1 text-xs font-medium tabular-nums">
        <span className={Number(percentage) >= 0 ? 'text-up-primary' : 'text-risk'}>
          {Number(percentage) >= 0 ? '+' : ''}{percentage}%
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// VALUATION TARGET CARD COMPONENT
// ============================================================================

interface ValuationTargetCardProps {
  type: 'low' | 'intrinsic' | 'avg' | 'high' | 'dcf'
  value: number
  buyPrice: number
  locale: 'en' | 'th'
  label: string
  caseLabel: string
  isPrimary?: boolean
  fullWidth?: boolean
}

function ValuationTargetCard({
  type,
  value,
  buyPrice,
  label,
  caseLabel,
  isPrimary,
  fullWidth,
}: ValuationTargetCardProps) {
  const percentage = safeToFixed(((value - buyPrice) / buyPrice) * 100, 1)
  const isPositive = Number(percentage) >= 0

  const colorMap = {
    low: 'text-text-3',
    intrinsic: 'text-accent-blue',
    avg: 'text-up-primary',
    high: 'text-accent-purple',
    dcf: 'text-accent-teal',
  }

  const bgMap = {
    low: 'bg-surface-2',
    intrinsic: 'bg-accent-blue/10',
    avg: 'bg-up-soft/30',
    high: 'bg-accent-purple/10',
    dcf: 'bg-accent-teal/10',
  }

  return (
    <div
      className={`
        p-3 rounded-lg border ${isPrimary ? 'border-up-primary/50' : 'border-border/50'}
        ${bgMap[type]} ${fullWidth ? 'col-span-full' : ''}
        transition-all hover:shadow-lg
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-3">{label}</span>
        {isPrimary && (
          <Star className="w-3 h-3 text-up-primary" />
        )}
      </div>
      <div className={`text-lg font-bold tabular-nums ${colorMap[type]}`}>
        {formatCurrency(value)}
      </div>
      <div className={`text-sm ${isPositive ? 'text-up-primary' : 'text-risk'}`}>
        {isPositive ? '+' : ''}{percentage}%
      </div>
      <div className="text-xs text-text-3 mt-1">
        {caseLabel}
      </div>
    </div>
  )
}
