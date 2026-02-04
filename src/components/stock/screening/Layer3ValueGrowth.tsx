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
import { MetricProgressBar } from './MetricProgressBar'
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
        <div className="space-y-3">
          <div className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3">
            {t.value}
          </div>

          <MetricProgressBar
            score={Math.min(10, (scoreData.valueMetrics.peBand.points / VALUE_POINTS.PE_BAND) * 10)}
            label={t.peBand}
            thaiLabel={t.peBandThai}
            value={`${t.peBandThai} ${formatRatio(scoreData.valueMetrics.peBand.currentValue)} - ${scoreData.valueMetrics.peBand.interpretation}`}
            points={scoreData.valueMetrics.peBand.points}
            maxPoints={scoreData.valueMetrics.peBand.maxPoints}
            status={scoreData.valueMetrics.peBand.status}
            compact={compact}
          />

          <MetricProgressBar
            score={Math.min(10, (scoreData.valueMetrics.pbFair.points / VALUE_POINTS.PB_FAIR) * 10)}
            label={t.pbFair}
            thaiLabel={t.pbFairThai}
            value={`${formatRatio(scoreData.valueMetrics.pbFair.currentValue)} vs ${formatRatio(scoreData.valueMetrics.pbFair.targetValue!)} - ${scoreData.valueMetrics.pbFair.interpretation}`}
            points={scoreData.valueMetrics.pbFair.points}
            maxPoints={scoreData.valueMetrics.pbFair.maxPoints}
            status={scoreData.valueMetrics.pbFair.status}
            compact={compact}
          />

          <MetricProgressBar
            score={Math.min(10, (scoreData.valueMetrics.divYield.points / VALUE_POINTS.DIV_YIELD) * 10)}
            label={t.divYield}
            thaiLabel={t.divYieldThai}
            value={`${(scoreData.valueMetrics.divYield.currentValue)} ${t.vsSector} ${formatPercentageFromDecimal(scoreData.valueMetrics.divYield.targetValue!)}`}
            points={scoreData.valueMetrics.divYield.points}
            maxPoints={scoreData.valueMetrics.divYield.maxPoints}
            status={scoreData.valueMetrics.divYield.status}
            compact={compact}
          />

          <MetricProgressBar
            score={Math.min(10, (scoreData.valueMetrics.pfcf.points / VALUE_POINTS.PFCF) * 10)}
            label={t.pfcf}
            thaiLabel={t.pfcfThai}
            value={`${formatRatio(scoreData.valueMetrics.pfcf.currentValue)}x `}
            points={scoreData.valueMetrics.pfcf.points}
            maxPoints={scoreData.valueMetrics.pfcf.maxPoints}
            status={scoreData.valueMetrics.pfcf.status}
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
        <div className="space-y-3">
          <div className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3">
            {t.growth}
          </div>

          <MetricProgressBar
            score={Math.min(10, (scoreData.growthMetrics.epsYoY.points / GROWTH_POINTS.EPS_YOY) * 10)}
            label={t.epsYoY}
            thaiLabel={t.epsYoYThai}
            value={`${formatPercentageFromDecimal(scoreData.growthMetrics.epsYoY.currentValue)} CAGR`}
            points={scoreData.growthMetrics.epsYoY.points}
            maxPoints={scoreData.growthMetrics.epsYoY.maxPoints}
            status={scoreData.growthMetrics.epsYoY.status}
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

          <MetricProgressBar
            score={Math.min(10, (scoreData.growthMetrics.epsAccel.points / GROWTH_POINTS.EPS_ACCEL) * 10)}
            label={t.epsAccel}
            thaiLabel={t.epsAccelThai}
            value={getTrendLabel(scoreData.growthMetrics.epsAccel.trend, locale)}
            points={scoreData.growthMetrics.epsAccel.points}
            maxPoints={scoreData.growthMetrics.epsAccel.maxPoints}
            status={scoreData.growthMetrics.epsAccel.status}
            compact={compact}
          />

          {/* Trend indicator */}
          <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-surface-2">
            <TrendIcon trend={scoreData.growthMetrics.epsAccel.trend} />
            <span className="text-sm text-text-secondary">
              {getTrendDescription(scoreData.growthMetrics.epsAccel.trend, locale)}
            </span>
          </div>
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

/**
 * Get trend description
 */
function getTrendDescription(trend: 'up' | 'down' | 'flat', locale: 'en' | 'th'): string {
  if (trend === 'up') return locale === 'th' ? 'กำไรเติบโตเร็วขึ้น' : 'Earnings accelerating'
  if (trend === 'down') return locale === 'th' ? 'กำไรชะลอลง' : 'Earnings decelerating'
  return locale === 'th' ? 'กำไรคงที่' : 'Earnings stable'
}

/**
 * Trend icon component
 */
function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') {
    return (
      <div className="w-8 h-8 rounded-full bg-up-soft flex items-center justify-center">
        <svg className="w-4 h-4 text-up-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
    )
  }

  if (trend === 'down') {
    return (
      <div className="w-8 h-8 rounded-full bg-risk/10 flex items-center justify-center">
        <svg className="w-4 h-4 text-risk" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      </div>
    )
  }

  return (
    <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center">
      <svg className="w-4 h-4 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
      </svg>
    </div>
  )
}
