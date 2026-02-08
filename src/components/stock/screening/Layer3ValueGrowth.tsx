'use client'

/**
 * Layer 3: Value + Growth Metrics Component
 *
 * Displays value (4 metrics, 5 points) and growth (2 metrics, 5 points):
 *
 * VALUE (5 points):
 * - PE vs Band (2 pts)
 * - PB vs Fair PB (1 pt)
 * - Div Yield > avg (1 pt)
 * - P/FCF < 15x (1 pt)
 *
 * GROWTH (5 points):
 * - EPS +10% YoY (2 pts)
 * - EPS Accelerate (2 pts)
 */

import { VALUE_THRESHOLDS, GROWTH_THRESHOLDS, VALUE_POINTS, GROWTH_POINTS } from './constants'
import { ScoreIndicator } from './ScoreIndicator'
import type { ValueGrowthScoreData, MetricStatus } from './types'
import { formatRatio, formatPercentageFromDecimal } from './utils/formatters'
import { safeToFixed } from '@/lib/utils'

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'VALUE + GROWTH',
    description: 'Valuation and growth metrics',
    value: 'VALUE',
    valueThai: 'มูลค่า',
    growth: 'GROWTH',
    growthThai: 'การเติบโต',
    peBand: 'PE vs Band',
    peBandThai: 'PE vs Band : เทียบแถบ',
    pbFair: 'PB vs Fair PB',
    pbFairThai: 'PB vs มูลค่าที่เหมาะสม',
    divYield: 'Dividend Yield',
    divYieldThai: 'DIV : อัตราผลตอบแทนปันผล',
    pfcf: 'P/FCF',
    pfcfThai: 'P/FCF : ราคาต่อเงินสดไหลเสรี',
    epsYoY: 'EPS Growth YoY',
    epsYoYThai: 'EPS Growth YoY : การเติบโตของกำไรต่อหุ้นรายปี',
    epsAccel: 'EPS Acceleration',
    epsAccelThai: 'ความเร่งของกำไรต่อหุ้น',
    cheap: 'ถูก',
    fair: 'เหมาะสม',
    expensive: 'แพง',
    vsSector: 'vs Sector',
    accelerating: 'เร่งขึ้น',
    decelerating: 'ชะลอลง',
    stable: 'คงที่',
  },
  th: {
    title: 'มูลค่าและการเติบโต',
    description: 'ตัวชี้วัดมูลค่าและการเติบโต',
    value: 'VALUE',
    valueThai: 'มูลค่า',
    growth: 'GROWTH',
    growthThai: 'การเติบโต',
    peBand: 'PE vs Band',
    peBandThai: 'PE vs Band : เทียบแถบ',
    pbFair: 'PB vs Fair PB',
    pbFairThai: 'PB vs มูลค่าที่เหมาะสม',
    divYield: 'Dividend Yield',
    divYieldThai: 'DIV : อัตราผลตอบแทนปันผล',
    pfcf: 'P/FCF',
    pfcfThai: 'P/FCF : ราคาต่อเงินสดไหลเสรี',
    epsYoY: 'EPS Growth YoY',
    epsYoYThai: 'EPS Growth YoY : การเติบโตของกำไรต่อหุ้นรายปี',
    epsAccel: 'EPS Acceleration',
    epsAccelThai: 'ความเร่งของกำไรต่อหุ้น',
    cheap: 'ถูก',
    fair: 'เหมาะสม',
    expensive: 'แพง',
    vsSector: 'เทียบภาค',
    accelerating: 'เร่งขึ้น',
    decelerating: 'ชะลอลง',
    stable: 'คงที่',
  },
} as const

// ============================================================================
// INPUT DATA
// ============================================================================

export interface ValueGrowthInputData {
  // Value metrics
  peRatio: number
  pbRatio: number
  returnOnEquity: number
  dividendYield: number  // Decimal
  pfcfRatio: number
  sectorAvgDivYield?: number
  marketCap?: number  // Market cap for P/FCF formula display

  // Growth metrics
  epsGrowthYoY: number  // Decimal (e.g., 0.15 for 15%)
  epsAcceleration: number  // QoQ change (positive = accelerating)
  epsCurrent?: number  // Current year EPS for CAGR formula display
  eps5YearsAgo?: number  // EPS 5 years ago for CAGR formula display

  // EPS history for stability check (5 years)
  epsHistory?: {
    year: number
    eps: number
  }[]
}

// ============================================================================
// SCORE CALCULATION
// ============================================================================

/**
 * Calculate PE Band score
 * Assumes we have PE history data - simplified for now
 */
function calculatePEBandScore(peRatio: number): { score: number; status: MetricStatus; interpretation: string } {
  // Simplified: assume PE around 15 is fair, <10 is cheap, >20 is expensive
  if (peRatio <= 10) {
    return { score: 10, status: 'pass', interpretation: LABELS.th.cheap }
  }
  if (peRatio <= 15) {
    return { score: 8, status: 'pass', interpretation: LABELS.th.fair }
  }
  if (peRatio <= 20) {
    return { score: 5, status: 'partial', interpretation: LABELS.th.fair }
  }
  return { score: 2, status: 'fail', interpretation: LABELS.th.expensive }
}

/**
 * Calculate Fair PB from ROE
 * Fair PB ≈ ROE * 1.25 (from constants)
 */
function calculateFairPB(roe: number): number {
  return roe * 1.25
}

/**
 * Calculate value score (5 points max)
 */
function calculateValueScore(data: ValueGrowthInputData) {
  let valueScore = 0

  // PE vs Band (2 pts)
  const peScore = calculatePEBandScore(data.peRatio)
  valueScore += peScore.score >= 7 ? VALUE_POINTS.PE_BAND : 0

  // PB vs Fair PB (1 pt)
  const fairPB = calculateFairPB(data.returnOnEquity)
  const pbStatus: MetricStatus = data.pbRatio <= fairPB ? 'pass' : 'fail'
  valueScore += pbStatus === 'pass' ? VALUE_POINTS.PB_FAIR : 0

  // Div Yield > avg (1 pt)
  const sectorDiv = data.sectorAvgDivYield || 0.03
  const divStatus: MetricStatus = data.dividendYield >= sectorDiv ? 'pass' : 'fail'
  valueScore += divStatus === 'pass' ? VALUE_POINTS.DIV_YIELD : 0

  // P/FCF < 15x (1 pt)
  const pfcfStatus: MetricStatus = data.pfcfRatio <= VALUE_THRESHOLDS.PFCF_MAX ? 'pass' : 'fail'
  valueScore += pfcfStatus === 'pass' ? VALUE_POINTS.PFCF : 0

  return {
    totalScore: valueScore,
    peScore,
    fairPB,
    pbStatus,
    sectorDiv,
    divStatus,
    pfcfStatus,
  }
}

/**
 * Calculate growth score (5 points max)
 */
function calculateGrowthScore(data: ValueGrowthInputData) {
  let growthScore = 0

  // EPS +10% YoY (2 pts)
  const epsYoYStatus: MetricStatus = data.epsGrowthYoY >= GROWTH_THRESHOLDS.EPS_YOY_MIN ? 'pass' : 'fail'
  growthScore += epsYoYStatus === 'pass' ? GROWTH_POINTS.EPS_YOY : 0

  // EPS Accelerate (2 pts)
  const epsAccelStatus: MetricStatus = data.epsAcceleration > 0 ? 'pass' : 'fail'
  growthScore += epsAccelStatus === 'pass' ? GROWTH_POINTS.EPS_ACCEL : 0

  // Determine trend
  let trend: 'up' | 'down' | 'flat' = 'flat'
  if (data.epsAcceleration > 0.05) trend = 'up'
  else if (data.epsAcceleration < -0.05) trend = 'down'

  return {
    totalScore: growthScore,
    epsYoYStatus,
    epsAccelStatus,
    trend,
  }
}

/**
 * Calculate total value + growth score
 */
export function calculateValueGrowthScore(data: ValueGrowthInputData): ValueGrowthScoreData {
  const valueResult = calculateValueScore(data)
  const growthResult = calculateGrowthScore(data)
  const totalScore = valueResult.totalScore + growthResult.totalScore

  return {
    totalScore: totalScore as ValueGrowthScoreData['totalScore'],
    maxScore: 10,
    valueScore: valueResult.totalScore,
    growthScore: growthResult.totalScore,
    valueMetrics: {
      peBand: {
        name: LABELS.en.peBand,
        thaiName: LABELS.th.peBandThai,
        points: valueResult.peScore.score >= 7 ? VALUE_POINTS.PE_BAND : 0,
        maxPoints: VALUE_POINTS.PE_BAND,
        currentValue: data.peRatio,
        targetValue: 15, // Fair PE
        status: valueResult.peScore.status,
        interpretation: valueResult.peScore.interpretation,
      },
      pbFair: {
        name: LABELS.en.pbFair,
        thaiName: LABELS.th.pbFairThai,
        points: valueResult.pbStatus === 'pass' ? VALUE_POINTS.PB_FAIR : 0,
        maxPoints: VALUE_POINTS.PB_FAIR,
        currentValue: data.pbRatio,
        targetValue: valueResult.fairPB,
        status: valueResult.pbStatus,
        interpretation: data.pbRatio <= valueResult.fairPB ? LABELS.th.cheap : LABELS.th.expensive,
      },
      divYield: {
        name: LABELS.en.divYield,
        thaiName: LABELS.th.divYieldThai,
        points: valueResult.divStatus === 'pass' ? VALUE_POINTS.DIV_YIELD : 0,
        maxPoints: VALUE_POINTS.DIV_YIELD,
        currentValue: data.dividendYield,
        targetValue: valueResult.sectorDiv,
        status: valueResult.divStatus,
        interpretation: data.dividendYield >= valueResult.sectorDiv ? LABELS.th.cheap : LABELS.th.expensive,
      },
      pfcf: {
        name: LABELS.en.pfcf,
        thaiName: LABELS.th.pfcfThai,
        points: valueResult.pfcfStatus === 'pass' ? VALUE_POINTS.PFCF : 0,
        maxPoints: VALUE_POINTS.PFCF,
        currentValue: data.pfcfRatio,
        targetValue: VALUE_THRESHOLDS.PFCF_MAX,
        status: valueResult.pfcfStatus,
        interpretation: data.pfcfRatio <= VALUE_THRESHOLDS.PFCF_MAX ? LABELS.th.cheap : LABELS.th.expensive,
      },
    },
    growthMetrics: {
      epsYoY: {
        name: LABELS.en.epsYoY,
        thaiName: LABELS.th.epsYoYThai,
        points: growthResult.epsYoYStatus === 'pass' ? GROWTH_POINTS.EPS_YOY : 0,
        maxPoints: GROWTH_POINTS.EPS_YOY,
        currentValue: data.epsGrowthYoY,
        targetValue: GROWTH_THRESHOLDS.EPS_YOY_MIN,
        trend: growthResult.trend,
        status: growthResult.epsYoYStatus,
      },
      epsAccel: {
        name: LABELS.en.epsAccel,
        thaiName: LABELS.th.epsAccelThai,
        points: growthResult.epsAccelStatus === 'pass' ? GROWTH_POINTS.EPS_ACCEL : 0,
        maxPoints: GROWTH_POINTS.EPS_ACCEL,
        currentValue: data.epsAcceleration,
        targetValue: 0,
        trend: growthResult.trend,
        status: growthResult.epsAccelStatus,
      },
    },
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

interface Layer3ValueGrowthProps {
  data: ValueGrowthInputData
  locale?: 'en' | 'th'
  compact?: boolean
  className?: string
}

export function Layer3ValueGrowth({
  data,
  locale = 'th',
  compact = false,
  className = '',
}: Layer3ValueGrowthProps) {
  const scoreData = calculateValueGrowthScore(data)
  const t = LABELS[locale]

  return (
    <div className={`layer3-value-growth ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {t.title}
          </h3>
          <p className="text-sm text-text-3">
            {t.description}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
            <span className="text-xs text-text-3 text-text-secondary">{t.valueThai}</span>
            <span className="ml-1 text-sm font-bold text-accent-teal">{scoreData.valueScore}/5</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
            <span className="text-xs text-text-3 text-text-secondary">{t.growthThai}</span>
            <span className="ml-1 text-sm font-bold text-accent-blue">{scoreData.growthScore}/5</span>
          </div>
        </div>
      </div>

      {/* Two column layout for desktop */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {/* VALUE METRICS */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3">
            {t.value}
          </div>

          <ScoreIndicator
            status={scoreData.valueMetrics.peBand.status}
            label={t.peBand}
            thaiLabel={t.peBandThai}
            value={`${t.peBandThai} ${formatRatio(scoreData.valueMetrics.peBand.currentValue)} - ${scoreData.valueMetrics.peBand.interpretation}`}
            points={scoreData.valueMetrics.peBand.points}
            maxPoints={scoreData.valueMetrics.peBand.maxPoints}
            locale={locale}
            compact={compact}
          />

          <ScoreIndicator
            status={scoreData.valueMetrics.pbFair.status}
            label={t.pbFair}
            thaiLabel={t.pbFairThai}
            value={`${formatRatio(scoreData.valueMetrics.pbFair.currentValue)} vs ${formatRatio(scoreData.valueMetrics.pbFair.targetValue!)} - ${scoreData.valueMetrics.pbFair.interpretation}`}
            points={scoreData.valueMetrics.pbFair.points}
            maxPoints={scoreData.valueMetrics.pbFair.maxPoints}
            locale={locale}
            compact={compact}
          />

          <ScoreIndicator
            status={scoreData.valueMetrics.divYield.status}
            label={t.divYield}
            thaiLabel={t.divYieldThai}
            value={`${(scoreData.valueMetrics.divYield.currentValue)} ${t.vsSector} ${formatPercentageFromDecimal(scoreData.valueMetrics.divYield.targetValue!)}`}
            points={scoreData.valueMetrics.divYield.points}
            maxPoints={scoreData.valueMetrics.divYield.maxPoints}
            locale={locale}
            compact={compact}
          />

          <ScoreIndicator
            status={scoreData.valueMetrics.pfcf.status}
            label={t.pfcf}
            thaiLabel={t.pfcfThai}
            value={`${formatRatio(scoreData.valueMetrics.pfcf.currentValue)}x`}
            points={scoreData.valueMetrics.pfcf.points}
            maxPoints={scoreData.valueMetrics.pfcf.maxPoints}
            locale={locale}
            compact={compact}
          />
          {/* P/FCF formula with actual values */}
          {data.marketCap && data.pfcfRatio > 0 && (
            <div className="text-xs text-text-3 mt-1 ml-1">
              {(() => {
                const fcf = data.marketCap / data.pfcfRatio
                const formatLargeNumber = (num: number) => {
                  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(0)}B`
                  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(0)}M`
                  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`
                  return num.toFixed(0)
                }
                return `P/FCF = ${formatRatio(scoreData.valueMetrics.pfcf.currentValue)}x => (${formatLargeNumber(data.marketCap)} ÷ ${formatLargeNumber(fcf)})`
              })()}
            </div>
          )}
        </div>

        {/* GROWTH METRICS */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3">
            {t.growth}
          </div>

          <ScoreIndicator
            status={scoreData.growthMetrics.epsYoY.status}
            label={t.epsYoY}
            thaiLabel={t.epsYoYThai}
            value={`${formatPercentageFromDecimal(scoreData.growthMetrics.epsYoY.currentValue)} CAGR`}
            points={scoreData.growthMetrics.epsYoY.points}
            maxPoints={scoreData.growthMetrics.epsYoY.maxPoints}
            locale={locale}
            compact={compact}
          />
          {/* CAGR formula with actual values */}
          {data.epsCurrent && (
            <div className="text-xs text-text-3 mt-1 ml-1">
              {(() => {
                const eps5YAgo = data.eps5YearsAgo && data.eps5YearsAgo > 0
                  ? data.eps5YearsAgo
                  : data.epsCurrent / Math.pow(1 + scoreData.growthMetrics.epsYoY.currentValue, 5)
                const currentYear = new Date().getFullYear()
                const fiveYearsAgo = currentYear - 5
                return `CAGR 5Y = (${currentYear}: ${safeToFixed(data.epsCurrent, 2)} ÷ ${fiveYearsAgo}: ${safeToFixed(eps5YAgo, 2)})^(1/5) - 1 = ${formatPercentageFromDecimal(scoreData.growthMetrics.epsYoY.currentValue)}`
              })()}
            </div>
          )}

          <ScoreIndicator
            status={scoreData.growthMetrics.epsAccel.status}
            label={t.epsAccel}
            thaiLabel={t.epsAccelThai}
            value={getTrendLabel(scoreData.growthMetrics.epsAccel.trend, locale)}
            points={scoreData.growthMetrics.epsAccel.points}
            maxPoints={scoreData.growthMetrics.epsAccel.maxPoints}
            locale={locale}
            compact={compact}
          />

          {/* EPS History Table with Stability Check */}
          {data.epsHistory && data.epsHistory.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-surface-2 border border-border">
              {/* Stability Analysis */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-text-3">EPS 5 YEAR HISTORY</span>
                {(() => {
                  // Check stability conditions
                  const hasNegative = data.epsHistory.some(y => y.eps < 0)
                  const years = [...data.epsHistory].sort((a, b) => a.year - b.year)
                  const isAccelerating = years.length >= 2 && years.every((y, i) => {
                    if (i === 0) return true
                    return y.eps > years[i - 1].eps
                  })
                  const isStable = years.length >= 2 && years.every((y, i) => {
                    if (i === 0) return true
                    const decline = (years[i - 1].eps - y.eps) / years[i - 1].eps
                    return decline <= 0.10 // Not decline more than 10%
                  })

                  let statusText: string
                  let statusColor: string

                  if (hasNegative) {
                    statusText = locale === 'th' ? 'ไม่คงที่ (มีปีขาดทุน)' : 'Not Stable (Has Loss Year)'
                    statusColor = 'text-risk bg-risk/10 border-risk'
                  } else if (isAccelerating) {
                    statusText = locale === 'th' ? 'เร่งขึ้น (กำไรเพิ่มทุกปี)' : 'Accelerating (Growing Every Year)'
                    statusColor = 'text-up-primary bg-up-soft border-up-primary'
                  } else if (isStable) {
                    statusText = locale === 'th' ? 'คงที่ (ลดลงไม่เกิน 10%)' : 'Stable (Decline < 10%)'
                    statusColor = 'text-insight bg-insight/20 border-insight'
                  } else {
                    statusText = locale === 'th' ? 'ชะลอลง (กำไรลดลง)' : 'Decelerating (Declining)'
                    statusColor = 'text-risk bg-risk/10 border-risk'
                  }

                  return (
                    <span className={`text-xs px-2 py-1 rounded border ${statusColor}`}>
                      {statusText}
                    </span>
                  )
                })()}
              </div>

              {/* EPS Table */}
              <div className="space-y-1.5">
                {[...data.epsHistory].sort((a, b) => b.year - a.year).map((item, index) => {
                  const isNegative = item.eps < 0
                  const isLatest = index === 0
                  return (
                    <div key={item.year} className="flex items-center justify-between py-1.5 px-2 rounded text-xs">
                      <span className={`font-medium ${isLatest ? 'text-accent-blue' : 'text-text-secondary'}`}>
                        {item.year}
                      </span>
                      <span className={`font-semibold tabular-nums ${isNegative ? 'text-risk' : 'text-text-primary'}`}>
                        {isNegative ? '(' : ''}{safeToFixed(item.eps, 2)}{isNegative ? ')' : ''}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Stability Formula */}
              <div className="mt-3 pt-2 border-t border-border text-xs text-text-3 space-y-1">
                <div>• Accelerating: กำไรเพิ่มขึ้นทุกปี</div>
                <div>• Stable: ลดลงไม่เกิน 10% จากปีก่อน</div>
                <div>• Unstable: มีปีขาดทุน (ติดลบ)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Get trend label
 */
function getTrendLabel(trend: 'up' | 'down' | 'flat', locale: 'en' | 'th'): string {
  if (trend === 'up') return locale === 'th' ? LABELS.th.accelerating : LABELS.en.accelerating
  if (trend === 'down') return locale === 'th' ? LABELS.th.decelerating : LABELS.en.decelerating
  return locale === 'th' ? LABELS.th.stable : LABELS.en.stable
}
