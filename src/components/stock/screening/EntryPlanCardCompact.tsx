'use client'

/**
 * Entry Plan Card - Compact Version (v2)
 *
 * Redesigned with:
 * - Data quality indicators
 * - Compact visual hierarchy
 * - Better N/A handling
 * - Cleaner layout structure
 */

import { formatCurrency } from './utils/formatters'
import type {
  EntryPlan,
  ValuationTargets,
  SignalAlignmentStatus,
} from './types'
import type { ValuationTargetsV2 } from '@/lib/entry-plan/valuation/transformer'
import {
  Target,
  Shield,
  Wallet,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Star,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  MinusCircle,
  ArrowDownRight,
} from 'lucide-react'
import { safeToFixed } from '@/lib/utils'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// Import new data quality components
import {
  DataQualityBadge,
  DataQualityBanner,
  ConfidencePercent,
  SimplePriceBar,
  calculateDataQuality,
  type DataQualityAssessment,
  type PriceLevel,
} from './data-quality'

// Import V2 helpers
import { v2ToDataQualityInput } from '@/lib/entry-plan/data-quality'

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'ENTRY PLAN',
    signalAlignment: 'ALIGNMENT',
    technical: 'TECHNICAL',
    value: 'VALUE',
    buyAt: 'BUY AT',
    stopLoss: 'STOP LOSS',
    target: 'TARGET',
    positionSize: 'POSITION',
    riskReward: 'RISK/REWARD',
    timeHorizon: 'TIME HORIZON',
    fromBuy: 'from buy',
    ofPortfolio: 'of portfolio',
    recommended: 'Recommended',
    months: 'months',
    technicalSL: 'Technical',
    valueSL: 'Value',
    technicalTarget: 'Technical',
    valueTarget: 'Value',
    valuationTargets: 'VALUATION TARGETS',
    fromAlpha: 'From Alpha Analysis',
    expand: 'Show targets',
    collapse: 'Hide targets',
    avgForecast: 'Avg Forecast',
    lowForecast: 'Low Forecast',
    intrinsicValue: 'Intrinsic Value',
    dcfValue: 'DCF Value',
    highForecast: 'High Forecast',
    strongAlignment: 'STRONG',
    partialAlignment: 'PARTIAL',
    conflict: 'CONFLICT',
    neutral: 'NEUTRAL',
    na: 'N/A',
    estimated: 'Est.',
  },
  th: {
    title: 'แผนการเข้าซื้อ',
    signalAlignment: 'สัญญาณควบคู่',
    technical: 'เทคนิค',
    value: 'มูลค่า',
    buyAt: 'ซื้อที่',
    stopLoss: 'ตัดขาดทอน',
    target: 'เป้าหมาย',
    positionSize: 'ขนาดการถือ',
    riskReward: 'ความเสี่ยง/ผลตอบ',
    timeHorizon: 'ระยะเวลา',
    fromBuy: 'จากราคาซื้อ',
    ofPortfolio: 'ของพอร์ต',
    recommended: 'แนะนำ',
    months: 'เดือน',
    technicalSL: 'เทคนิค',
    valueSL: 'มูลค่า',
    technicalTarget: 'เทคนิค',
    valueTarget: 'มูลค่า',
    valuationTargets: 'เป้าหมายมูลค่า',
    fromAlpha: 'จากการวิเคราะห์ Alpha',
    expand: 'แสดงเป้าหมาย',
    collapse: 'ซ่อนเป้าหมาย',
    avgForecast: 'คาดการณ์เฉลี่ย',
    lowForecast: 'คาดการณ์ต่ำสุด',
    intrinsicValue: 'มูลค่าตามหลักการ',
    dcfValue: 'มูลค่า DCF',
    highForecast: 'คาดการณ์สูงสุด',
    strongAlignment: 'ตรงกัน',
    partialAlignment: 'บางส่วน',
    conflict: 'ขัดแย้ง',
    neutral: 'ไม่ชัดเจน',
    na: 'ไม่ระบุ',
    estimated: 'ประมาณ',
  },
} as const

// ============================================================================
// ALIGNMENT CONFIG
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface EntryPlanCardCompactProps {
  entryPlan: EntryPlan | null
  currentPrice: number | null
  locale?: 'en' | 'th'
  valuationTargets?: ValuationTargets | ValuationTargetsV2  // Support both v1 and v2
  technicalData?: {
    support1?: number | null
    resistance1?: number | null
    rsi?: number | null
  }
  technicalScoreData?: {
    technicalScore: number
  }
  valueScoreData?: {
    valueScore: number
  }
  className?: string
}

export function EntryPlanCardCompact({
  entryPlan,
  currentPrice,
  locale = 'th',
  valuationTargets,
  technicalData,
  technicalScoreData,
  valueScoreData,
  className,
}: EntryPlanCardCompactProps) {
  const t = LABELS[locale]
  const [isValuationExpanded, setIsValuationExpanded] = useState(false)

  // Convert v2 to plain format if needed for data quality calculation
  const valuationForQuality = valuationTargets && 'quality' in valuationTargets
    ? v2ToDataQualityInput(valuationTargets as ValuationTargetsV2, currentPrice ?? undefined).valuation
    : valuationTargets

  // Calculate data quality
  const dataQuality: DataQualityAssessment = calculateDataQuality({
    currentPrice: currentPrice ?? undefined,
    technical: technicalData,
    valuation: valuationForQuality,
  })

  // Don't show if insufficient data
  if (!dataQuality.canShowEntryPlan) {
    return (
      <InsufficientDataCard
        locale={locale}
        dataQuality={dataQuality}
        className={className}
      />
    )
  }

  // Must have entry plan and current price
  if (!currentPrice || currentPrice <= 0 || !entryPlan) {
    return null
  }

  // Get scores
  const technicalScore = technicalScoreData?.technicalScore ?? 0
  const valueScore = valueScoreData?.valueScore ?? 0

  // Signal alignment
  const signalAlignment = entryPlan.signalAlignment ?? {
    technicalScore,
    technicalMaxScore: 5,
    valueScore,
    valueMaxScore: 5,
    status: 'neutral',
    recommendation: locale === 'th' ? 'ไม่สามารถประเมิน' : 'Unable to evaluate',
  }

  const alignmentConfig = ALIGNMENT_CONFIG[signalAlignment.status]
  const AlignmentIcon = alignmentConfig.icon

  // Build price levels for visualizer
  const priceLevels: PriceLevel[] = []
  if (entryPlan.stopLoss?.price) {
    priceLevels.push({
      label: locale === 'th' ? 'ตัดขาด' : 'Stop',
      value: entryPlan.stopLoss.price,
      color: 'risk',
    })
  }
  if (entryPlan.buyAt?.price) {
    priceLevels.push({
      label: locale === 'th' ? 'ซื้อ' : 'Buy',
      value: entryPlan.buyAt.price,
      color: 'up-primary',
    })
  }
  priceLevels.push({
    label: locale === 'th' ? 'ปัจจุบัน' : 'Now',
    value: currentPrice,
    color: 'text-primary',
    isCurrent: true,
  })
  if (entryPlan.target?.price) {
    priceLevels.push({
      label: locale === 'th' ? 'เป้า' : 'Target',
      value: entryPlan.target.price,
      color: 'up-primary',
      isPrimary: true,
    })
  }

  return (
    <div className={cn('entry-plan-card-compact', className)}>
      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        {/* Header - Compact with alignment & confidence */}
        <div className="px-4 py-3 border-b border-border bg-surface-2/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Target className="w-4 h-4 text-accent-teal" />
                {t.title}
              </h3>

              {/* Signal Alignment Badge */}
              {signalAlignment.status !== 'neutral' && (
                <div className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
                  alignmentConfig.bg, alignmentConfig.border, alignmentConfig.text
                )}>
                  <AlignmentIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">
                    {t[alignmentConfig.label]}
                  </span>
                </div>
              )}
            </div>

            {/* Confidence Percentage */}
            <ConfidencePercent
              confidence={dataQuality.confidence}
              locale={locale}
              showLabel={false}
              size="sm"
            />
          </div>
        </div>

        {/* Data Quality Banner (if needed) */}
        <DataQualityBanner assessment={dataQuality} locale={locale} />

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Signal Alignment Bar - Compact */}
          <SignalAlignmentBar
            technicalScore={technicalScore}
            valueScore={valueScore}
            status={signalAlignment.status}
            recommendation={signalAlignment.recommendation}
            locale={locale}
          />

          {/* Price Visualizer - Horizontal Bar */}
          <SimplePriceBar
            stopLoss={entryPlan.stopLoss?.price}
            buyPrice={entryPlan.buyAt.price}
            currentPrice={currentPrice}
            target={entryPlan.target?.price}
          />

          {/* Price Cards - 3 Columns */}
          <div className="grid grid-cols-3 gap-3">
            <CompactPriceCard
              label={t.buyAt}
              price={entryPlan.buyAt.price}
              icon={<ArrowDownRight className="w-4 h-4" />}
              color="up"
              technicalValue={entryPlan.buyAt.technicalRationale ? entryPlan.buyAt.price : undefined}
              valueValue={entryPlan.buyAt.valueRationale ? entryPlan.buyAt.price : undefined}
              rationale={entryPlan.buyAt.rationale}
              locale={locale}
            />
            <CompactPriceCard
              label={t.stopLoss}
              price={entryPlan.stopLoss?.price}
              icon={<Shield className="w-4 h-4" />}
              color="down"
              technicalValue={entryPlan.stopLoss?.technicalSL}
              valueValue={entryPlan.stopLoss?.valueSL}
              locale={locale}
            />
            <CompactPriceCard
              label={t.target}
              price={entryPlan.target.price}
              icon={<Target className="w-4 h-4" />}
              color="up"
              technicalValue={entryPlan.target?.technicalTarget}
              valueValue={entryPlan.target?.valueTarget}
              locale={locale}
            />
          </div>

          {/* Metrics Row - 3 Columns */}
          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              label={t.positionSize}
              value={safeToFixed((entryPlan.positionSize?.percentage ?? 0.05) * 100, 0) + '%'}
              subtext={t.ofPortfolio}
              icon={<Wallet className="w-4 h-4 text-accent-teal" />}
            />
            <MetricCard
              label={t.riskReward}
              value={entryPlan.riskReward?.ratio ?? 'N/A'}
              subtext={
                entryPlan.riskReward?.riskAmount && entryPlan.riskReward?.rewardAmount
                  ? `${locale === 'th' ? 'รับ' : 'Risk'} ${formatCurrency(entryPlan.riskReward.riskAmount)} / ${locale === 'th' ? 'ได้' : 'Reward'} ${formatCurrency(entryPlan.riskReward.rewardAmount)}`
                  : undefined
              }
              icon={<Target className="w-4 h-4 text-accent-blue" />}
            />
            <MetricCard
              label={t.timeHorizon}
              value={entryPlan.timeHorizon ?? 'N/A'}
              subtext={t.recommended}
              icon={<TrendingUp className="w-4 h-4 text-accent-purple" />}
            />
          </div>

          {/* Valuation Targets - Collapsible */}
          {valuationTargets && dataQuality.level !== 'insufficient' && (
            <ValuationTargetsCompact
              targets={valuationTargets}
              buyPrice={entryPlan.buyAt.price}
              isExpanded={isValuationExpanded}
              onToggle={() => setIsValuationExpanded(!isValuationExpanded)}
              locale={locale}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Signal Alignment Bar - Compact horizontal display
 */
function SignalAlignmentBar({
  technicalScore,
  valueScore,
  status,
  recommendation,
  locale,
}: {
  technicalScore: number
  valueScore: number
  status: SignalAlignmentStatus
  recommendation: string
  locale: 'en' | 'th'
}) {
  const t = LABELS[locale]
  const config = ALIGNMENT_CONFIG[status]

  // Normalize to 0-5
  const techNorm = Math.min(5, Math.round(technicalScore))
  const valNorm = Math.min(5, Math.round(valueScore))

  return (
    <div className={cn('p-3 rounded-lg border', config.bg, config.border)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {t.signalAlignment}
        </span>
        <span className={cn('text-xs font-medium', config.text)}>
          {recommendation}
        </span>
      </div>

      {/* Score bars */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-3 flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-teal-500" />
              {t.technical}
            </span>
            <span className={cn('font-bold', techNorm >= 4 ? 'text-emerald-500' : techNorm >= 3 ? 'text-amber-500' : 'text-red-500')}>
              {techNorm}/5
            </span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', techNorm >= 4 ? 'bg-emerald-500' : techNorm >= 3 ? 'bg-amber-500' : 'bg-red-500')}
              style={{ width: `${(techNorm / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-3 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-purple-500" />
              {t.value}
            </span>
            <span className={cn('font-bold', valNorm >= 4 ? 'text-emerald-500' : valNorm >= 3 ? 'text-amber-500' : 'text-red-500')}>
              {valNorm}/5
            </span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', valNorm >= 4 ? 'bg-emerald-500' : valNorm >= 3 ? 'bg-amber-500' : 'bg-red-500')}
              style={{ width: `${(valNorm / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact Price Card with N/A handling
 */
function CompactPriceCard({
  label,
  price,
  icon,
  color,
  technicalValue,
  valueValue,
  rationale,
  locale,
}: {
  label: string
  price?: number
  icon: React.ReactNode
  color: 'up' | 'down'
  technicalValue?: number
  valueValue?: number
  rationale?: string
  locale: 'en' | 'th'
}) {
  const t = LABELS[locale]
  const isNa = price === undefined || price === null
  const hasBreakdown = technicalValue !== undefined && valueValue !== undefined

  const colorClass = color === 'up' ? 'text-up-primary' : 'text-risk'

  return (
    <div className={cn(
      'p-3 rounded-lg border transition-colors',
      isNa
        ? 'bg-gray-500/5 border-gray-500/20'
        : 'bg-surface-2 border-border hover:border-border-subtle/80'
    )}>
      <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
        {icon}
        <span>{label}</span>
      </div>

      {isNa ? (
        <div className="h-6 flex items-center">
          <span className="text-text-3 text-sm">{t.na}</span>
        </div>
      ) : (
        <>
          <div className={cn('text-xl font-bold tabular-nums', colorClass)}>
            {formatCurrency(price)}
          </div>

          {/* Dual perspective breakdown */}
          {hasBreakdown && (
            <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  {t.technical}
                </span>
                <span className="font-medium text-teal-500 tabular-nums">
                  {formatCurrency(technicalValue)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  {t.value}
                </span>
                <span className="font-medium text-purple-500 tabular-nums">
                  {formatCurrency(valueValue)}
                </span>
              </div>
            </div>
          )}

          {rationale && !hasBreakdown && (
            <p className="text-xs text-text-3 mt-1 line-clamp-2">{rationale}</p>
          )}
        </>
      )}
    </div>
  )
}

/**
 * Simple metric card for bottom row
 */
function MetricCard({
  label,
  value,
  subtext,
  icon,
}: {
  label: string
  value: string
  subtext?: string
  icon: React.ReactNode
}) {
  return (
    <div className="p-3 rounded-lg bg-surface-2 border border-border">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
      <div className="text-lg font-bold text-text-primary tabular-nums">
        {value}
      </div>
      {subtext && (
        <p className="text-xs text-text-3 mt-1 line-clamp-1">{subtext}</p>
      )}
    </div>
  )
}

/**
 * Insufficient Data Card
 */
function InsufficientDataCard({
  locale,
  dataQuality,
  className,
}: {
  locale: 'en' | 'th'
  dataQuality: DataQualityAssessment
  className?: string
}) {
  return (
    <div className={cn('p-4 rounded-xl bg-surface-2 border border-border', className)}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            {locale === 'th' ? 'ข้อมูลไม่เพียงพอ' : 'Insufficient Data'}
          </h3>
          <p className="text-xs text-text-secondary mb-2">
            {locale === 'th'
              ? 'ไม่สามารถคำนวณแผนการเข้าซื้อที่เชื่อถือได้'
              : 'Cannot generate a reliable entry plan'}
          </p>
          <DataQualityBadge assessment={dataQuality} locale={locale} variant="card" showDetails />
        </div>
      </div>
    </div>
  )
}

/**
 * Valuation Targets - Compact Version (supports both v1 and v2)
 */
function ValuationTargetsCompact({
  targets,
  buyPrice,
  isExpanded,
  onToggle,
  locale,
}: {
  targets: ValuationTargets | ValuationTargetsV2
  buyPrice: number
  isExpanded: boolean
  onToggle: () => void
  locale: 'en' | 'th'
}) {
  const t = LABELS[locale]

  // Check if v2 format
  const isV2 = targets && 'quality' in targets

  // Extract values based on format
  const avgForecast = isV2
    ? (targets as ValuationTargetsV2).avgForecast.value ?? (targets as ValuationTargetsV2).derivedValues?.avgForecastEst
    : (targets as ValuationTargets).avgForecast

  const lowForecast = isV2
    ? (targets as ValuationTargetsV2).lowForecast.value
    : (targets as ValuationTargets).lowForecast

  const intrinsicValue = isV2
    ? (targets as ValuationTargetsV2).intrinsicValue.value ?? (targets as ValuationTargetsV2).derivedValues?.intrinsicValueEst
    : (targets as ValuationTargets).intrinsicValue

  const dcfValue = isV2
    ? (targets as ValuationTargetsV2).dcfValue.value
    : (targets as ValuationTargets).dcfValue

  const highForecast = isV2
    ? (targets as ValuationTargetsV2).highForecast.value
    : (targets as ValuationTargets).highForecast

  const calcPercentage = (value: number | undefined | null) => {
    if (!value) return '0.0'
    return safeToFixed(((value - buyPrice) / buyPrice) * 100, 1)
  }

  // Get quality info for v2
  const avgForecastQuality = isV2 ? (targets as ValuationTargetsV2).avgForecast : null
  const isAvgEstimated = avgForecastQuality?.source === 'estimated' || avgForecastQuality?.source === 'calculated'

  return (
    <div className="border border-border/50 rounded-xl bg-surface-3/30 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-2/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent-purple" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {t.valuationTargets}
          </span>
          <span className="text-xs text-text-3">{t.fromAlpha}</span>
          {isV2 && (
            <DataQualityBadge
              assessment={{
                level: (targets as ValuationTargetsV2).quality.level,
                score: (targets as ValuationTargetsV2).quality.score,
                missingRequired: [],
                missingOptional: [],
                estimatedFields: [],
                canShowEntryPlan: true,
                confidence: (targets as ValuationTargetsV2).quality.score / 100,
              }}
              locale={locale}
              variant="inline"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <span className="text-xs text-text-3">{t.avgForecast}:</span>
            {avgForecast ? (
              <>
                <span className="text-sm font-bold text-up-primary tabular-nums">
                  {formatCurrency(avgForecast)}
                </span>
                <span className="text-xs text-up-primary">
                  +{calcPercentage(avgForecast)}%
                </span>
                {isAvgEstimated && (
                  <span className="text-xs text-amber-500">
                    ({t.estimated})
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-text-3">{t.na}</span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-text-3" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-3" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Primary Target - only show if avgForecast exists */}
          {avgForecast && (
            <div className="p-3 rounded-lg border-2 border-up-primary/30 bg-up-soft/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-up-primary" />
                <span className="text-sm font-semibold text-text-primary">{t.avgForecast}</span>
                {isAvgEstimated && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500">
                    {t.estimated}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-up-primary tabular-nums">
                  {formatCurrency(avgForecast)}
                </span>
                <span className="text-sm text-up-primary">
                  +{calcPercentage(avgForecast)}%
                </span>
              </div>
            </div>
          )}

          {/* Target Cards Grid - only render cards with values */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {lowForecast && (
              <ValuationCard
                label={t.lowForecast}
                value={lowForecast}
                buyPrice={buyPrice}
                type="low"
                quality={isV2 ? (targets as ValuationTargetsV2).lowForecast : null}
                estimatedLabel={t.estimated}
              />
            )}
            {intrinsicValue && (
              <ValuationCard
                label={intrinsicValue ? (t.intrinsicValue || 'IV') : 'IV'}
                value={intrinsicValue}
                buyPrice={buyPrice}
                type="intrinsic"
                quality={isV2 ? (targets as ValuationTargetsV2).intrinsicValue : null}
                estimatedLabel={t.estimated}
              />
            )}
            {dcfValue && (
              <ValuationCard
                label={dcfValue ? (t.dcfValue || 'DCF') : 'DCF'}
                value={dcfValue}
                buyPrice={buyPrice}
                type="dcf"
                quality={isV2 ? (targets as ValuationTargetsV2).dcfValue : null}
                estimatedLabel={t.estimated}
              />
            )}
            {highForecast && (
              <ValuationCard
                label={t.highForecast}
                value={highForecast}
                buyPrice={buyPrice}
                type="high"
                quality={isV2 ? (targets as ValuationTargetsV2).highForecast : null}
                estimatedLabel={t.estimated}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Single valuation target card (supports v2 with quality indicators)
 */
function ValuationCard({
  label,
  value,
  buyPrice,
  type,
  quality,
  estimatedLabel = 'Est.',
}: {
  label: string
  value: number | null | undefined
  buyPrice: number
  type: 'low' | 'intrinsic' | 'dcf' | 'high'
  quality?: { source: string; value: number | null } | null
  estimatedLabel?: string
}) {
  const isNa = value === null || value === undefined

  if (isNa) {
    return null
  }

  const percentage = safeToFixed(((value - buyPrice) / buyPrice) * 100, 1)
  const isPositive = Number(percentage) >= 0
  const isEstimated = quality?.source === 'estimated' || quality?.source === 'calculated'

  const colorMap = {
    low: 'text-text-3',
    intrinsic: 'text-accent-blue',
    dcf: 'text-accent-teal',
    high: 'text-accent-purple',
  }

  const bgMap = {
    low: 'bg-surface-2',
    intrinsic: 'bg-accent-blue/10',
    dcf: 'bg-accent-teal/10',
    high: 'bg-accent-purple/10',
  }

  return (
    <div className={cn('p-2.5 rounded-lg border border-border/50 relative', bgMap[type])}>
      {isEstimated && (
        <span className="absolute top-1 right-1 text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-500">
          {estimatedLabel}
        </span>
      )}
      <div className="text-xs text-text-3 mb-1">{label}</div>
      <div className={cn('text-base font-bold tabular-nums', colorMap[type])}>
        {formatCurrency(value)}
      </div>
      <div className={cn('text-xs', isPositive ? 'text-up-primary' : 'text-risk')}>
        {isPositive ? '+' : ''}{percentage}%
      </div>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default EntryPlanCardCompact
