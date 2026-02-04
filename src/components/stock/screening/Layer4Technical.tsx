'use client'

/**
 * Layer 4: Technical + Catalyst Component
 *
 * Displays technical indicators (5 points) and catalysts (5 points):
 *
 * TECHNICAL (5 points):
 * - Price vs MA50 (1 pt)
 * - RSI 40-60 (1 pt)
 * - MACD positive (1 pt)
 * - Near support (2 pts)
 *
 * CATALYST (5 points):
 * - High-impact event (3 pts)
 * - Sector momentum (1 pt)
 * - Seasonality (1 pt)
 */

import { TECHNICAL_THRESHOLDS, TECHNICAL_POINTS } from './constants'
import { MetricProgressBar } from './MetricProgressBar'
import type { TechnicalScoreData, MetricStatus } from './types'
import { formatRatio } from './utils/formatters'
import { Calendar } from 'lucide-react'
import { safeToFixed } from '@/lib/utils'

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'TECHNICAL + CATALYST',
    description: 'Technical analysis and upcoming events',
    technical: 'TECHNICAL',
    technicalThai: 'เทคนิค',
    catalyst: 'CATALYST',
    catalystThai: 'เหตุการณ์สำคัญ',
    priceVsMA50: 'Price vs MA50',
    priceVsMA50Thai: 'ราคาเทียบค่าเฉลี่ย 50 วัน',
    rsi: 'RSI',
    rsiThai: 'ดัชนีกำลัง RSI',
    macd: 'MACD',
    macdThai: 'ดัชนีการลากตัว',
    support: 'Support Level',
    supportThai: 'แนวรับ',
    catalystEvents: 'Upcoming Events',
    catalystEventsThai: 'เหตุการณ์ที่จะเกิดขึ้น',
    sectorMomentum: 'Sector Momentum',
    sectorMomentumThai: 'แรงขับเคลื่อนภาค',
    seasonality: 'Seasonality',
    seasonalityThai: 'ฤดูกาล',
    above: 'Above',
    below: 'Below',
    neutral: 'Neutral',
    overbought: 'Overbought',
    oversold: 'Oversold',
    bullish: 'Bullish',
    bearish: 'Bearish',
    near: 'Near',
    far: 'Far from',
    favorable: 'Favorable',
    unfavorable: 'Unfavorable',
    strong: 'Strong',
    weak: 'Weak',
    noEvents: 'No upcoming events',
    daysAway: 'days away',
    highImpact: 'High',
    mediumImpact: 'Medium',
    lowImpact: 'Low',
  },
  th: {
    title: 'เทคนิคและเหตุการณ์',
    description: 'การวิเคราะห์เทคนิคและเหตุการณ์สำคัญ',
    technical: 'TECHNICAL',
    technicalThai: 'เทคนิค',
    catalyst: 'CATALYST',
    catalystThai: 'เหตุการณ์สำคัญ',
    priceVsMA50: 'Price vs MA50',
    priceVsMA50Thai: 'ราคาเทียบค่าเฉลี่ย 50 วัน',
    rsi: 'RSI',
    rsiThai: 'ดัชนีกำลัง RSI',
    macd: 'MACD',
    macdThai: 'ดัชนีการลากตัว',
    support: 'Support Level',
    supportThai: 'แนวรับ',
    catalystEvents: 'Upcoming Events',
    catalystEventsThai: 'เหตุการณ์ที่จะเกิดขึ้น',
    sectorMomentum: 'Sector Momentum',
    sectorMomentumThai: 'แรงขับเคลื่อนภาค',
    seasonality: 'Seasonality',
    seasonalityThai: 'ฤดูกาล',
    above: 'สูงกว่า',
    below: 'ต่ำกว่า',
    neutral: 'กลาง',
    overbought: 'ซื้อเกินไป',
    oversold: 'ขายเกินไป',
    bullish: 'ขาขึ้น',
    bearish: 'ขาลง',
    near: 'ใกล้',
    far: 'ไกลจาก',
    favorable: 'ดี',
    unfavorable: 'ไม่ดี',
    strong: 'แรง',
    weak: 'อ่อน',
    noEvents: 'ไม่มีเหตุการณ์ที่จะเกิดขึ้น',
    daysAway: 'วัน',
    highImpact: 'สูง',
    mediumImpact: 'ปานกลาง',
    lowImpact: 'ต่ำ',
  },
} as const

// ============================================================================
// INPUT DATA
// ============================================================================

export interface TechnicalInputData {
  // Technical metrics
  currentPrice: number
  ma50: number | null
  rsi: number | null
  macdPositive: boolean | null
  supportLevel: number | null

  // AI Catalyst score (0-10) - will be converted to 0-5 points
  aiScore?: number | null
}

// ============================================================================
// SCORE CALCULATION
// ============================================================================

 

/**
 * Calculate catalyst score using AI score (0-10 → 0-5 points)
 */
function calculateCatalystScore(data: TechnicalInputData) {
  let catalystScore = 0

  // AI Score: Convert 0-10 scale to 0-5 points (divide by 2)
  if (data.aiScore !== null && data.aiScore !== undefined) {
    catalystScore = Math.floor(data.aiScore / 2)
  }

  return {
    totalScore: catalystScore,
    aiScore: data.aiScore,
  }
}

/**
 * Calculate technical metrics score (helper function)
 */
function calculateTechnicalMetricsScore(data: TechnicalInputData) {
  let techScore = 0

  // Price vs MA50 (1 pt) - Above MA50 is bullish
  const priceVsMA50Status: MetricStatus = data.ma50 && data.currentPrice >= data.ma50 ? 'pass' : 'fail'
  techScore += priceVsMA50Status === 'pass' ? TECHNICAL_POINTS.PRICE_VS_MA50 : 0

  // RSI 40-60 (1 pt) - In neutral zone
  let rsiStatus: MetricStatus = 'fail'
  if (data.rsi) {
    if (data.rsi >= TECHNICAL_THRESHOLDS.RSI_GOOD_MIN && data.rsi <= TECHNICAL_THRESHOLDS.RSI_GOOD_MAX) {
      rsiStatus = 'pass'
    } else if (data.rsi >= 35 && data.rsi <= 65) {
      rsiStatus = 'partial'
    }
  }
  techScore += rsiStatus === 'pass' ? TECHNICAL_POINTS.RSI : 0

  // MACD positive (1 pt)
  const macdStatus: MetricStatus = data.macdPositive === true ? 'pass' : data.macdPositive === false ? 'fail' : 'partial'
  techScore += macdStatus === 'pass' ? TECHNICAL_POINTS.MACD : 0

  // Near support (2 pts) - Within 5% of support
  let supportStatus: MetricStatus = 'fail'
  let distanceToSupport = 0
  if (data.supportLevel) {
    distanceToSupport = (data.currentPrice - data.supportLevel) / data.supportLevel
    if (distanceToSupport >= 0 && distanceToSupport <= TECHNICAL_THRESHOLDS.SUPPORT_PROXIMITY_PCT) {
      supportStatus = 'pass'
    } else if (distanceToSupport > 0 && distanceToSupport <= TECHNICAL_THRESHOLDS.SUPPORT_PROXIMITY_PCT * 2) {
      supportStatus = 'partial'
    }
  }
  techScore += supportStatus === 'pass' ? TECHNICAL_POINTS.SUPPORT : 0

  return {
    totalScore: techScore,
    priceVsMA50Status,
    rsiStatus,
    macdStatus,
    supportStatus,
    distanceToSupport,
  }
}

/**
 * Calculate total technical + catalyst score
 */
export function calculateTechnicalScore(data: TechnicalInputData): TechnicalScoreData {
  const techResult = calculateTechnicalMetricsScore(data)
  const catalystResult = calculateCatalystScore(data)
  const totalScore = techResult.totalScore + catalystResult.totalScore

  return {
    totalScore: totalScore as TechnicalScoreData['totalScore'],
    maxScore: 10,
    technicalScore: techResult.totalScore,
    catalystScore: catalystResult.totalScore,
    technicalMetrics: {
      priceVsMA50: {
        name: LABELS.en.priceVsMA50,
        thaiName: LABELS.th.priceVsMA50Thai,
        points: techResult.priceVsMA50Status === 'pass' ? TECHNICAL_POINTS.PRICE_VS_MA50 : 0,
        maxPoints: TECHNICAL_POINTS.PRICE_VS_MA50,
        currentValue: data.ma50 ? ((data.currentPrice - data.ma50) / data.ma50 * 100) : 0,
        status: techResult.priceVsMA50Status,
        detail: data.ma50
          ? (data.currentPrice >= data.ma50 ? LABELS.th.above : LABELS.th.below)
          : LABELS.th.neutral,
      },
      rsi: {
        name: LABELS.en.rsi,
        thaiName: LABELS.th.rsiThai,
        points: techResult.rsiStatus === 'pass' ? TECHNICAL_POINTS.RSI : 0,
        maxPoints: TECHNICAL_POINTS.RSI,
        currentValue: data.rsi || 0,
        status: techResult.rsiStatus,
        detail: data.rsi
          ? (data.rsi > 70 ? LABELS.th.overbought : data.rsi < 30 ? LABELS.th.oversold : LABELS.th.neutral)
          : LABELS.th.neutral,
      },
      macd: {
        name: LABELS.en.macd,
        thaiName: LABELS.th.macdThai,
        points: techResult.macdStatus === 'pass' ? TECHNICAL_POINTS.MACD : 0,
        maxPoints: TECHNICAL_POINTS.MACD,
        currentValue: data.macdPositive === true ? 1 : data.macdPositive === false ? -1 : 0,
        status: techResult.macdStatus,
        detail: data.macdPositive === true ? LABELS.th.bullish : data.macdPositive === false ? LABELS.th.bearish : LABELS.th.neutral,
      },
      support: {
        name: LABELS.en.support,
        thaiName: LABELS.th.supportThai,
        points: techResult.supportStatus === 'pass' ? TECHNICAL_POINTS.SUPPORT : 0,
        maxPoints: TECHNICAL_POINTS.SUPPORT,
        currentValue: data.supportLevel || 0,
        status: techResult.supportStatus,
        detail: data.supportLevel
          ? `${techResult.distanceToSupport >= 0 ? '+' : ''}${safeToFixed(techResult.distanceToSupport * 100, 1)}%`
          : LABELS.th.neutral,
      },
    },
    catalysts: {
      aiScore: catalystResult.aiScore,
    },
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

interface Layer4TechnicalProps {
  data: TechnicalInputData
  locale?: 'en' | 'th'
  compact?: boolean
  className?: string
}

export function Layer4Technical({
  data,
  locale = 'th',
  compact = false,
  className = '',
}: Layer4TechnicalProps) {
  const scoreData = calculateTechnicalScore(data)
  const t = LABELS[locale]

  return (
    <div className={`layer4-technical ${className}`}>
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
            <span className="text-xs text-text-3 text-text-secondary">{t.technicalThai}</span>
            <span className="ml-1 text-sm font-bold text-accent-purple">{scoreData.technicalScore}/5</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
            <span className="text-xs text-text-3 text-text-secondary">{t.catalystThai}</span>
            <span className="ml-1 text-sm font-bold text-insight">{scoreData.catalystScore}/5</span>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {/* TECHNICAL METRICS */}
        <div className="space-y-3">
          <div className="text-xs font-semibold 
          text-text-3 uppercase tracking-wider mb-3">
            {t.technical}
          </div>

          <MetricProgressBar
            score={Math.min(10, (scoreData.technicalMetrics.priceVsMA50.points / TECHNICAL_POINTS.PRICE_VS_MA50) * 10)}
            label={t.priceVsMA50}
            thaiLabel={t.priceVsMA50Thai}
            value={scoreData.technicalMetrics.priceVsMA50.detail}
            points={scoreData.technicalMetrics.priceVsMA50.points}
            maxPoints={scoreData.technicalMetrics.priceVsMA50.maxPoints}
            status={scoreData.technicalMetrics.priceVsMA50.status}
            compact={compact}
          />

          <MetricProgressBar
            score={Math.min(10, (scoreData.technicalMetrics.rsi.points / TECHNICAL_POINTS.RSI) * 10)}
            label={t.rsi}
            thaiLabel={t.rsiThai}
            value={`${formatRatio(typeof scoreData.technicalMetrics.rsi.currentValue === 'number' ? scoreData.technicalMetrics.rsi.currentValue : 0)} - ${scoreData.technicalMetrics.rsi.detail}`}
            points={scoreData.technicalMetrics.rsi.points}
            maxPoints={scoreData.technicalMetrics.rsi.maxPoints}
            status={scoreData.technicalMetrics.rsi.status}
            compact={compact}
          />

          <MetricProgressBar
            score={Math.min(10, (scoreData.technicalMetrics.macd.points / TECHNICAL_POINTS.MACD) * 10)}
            label={t.macd}
            thaiLabel={t.macdThai}
            value={scoreData.technicalMetrics.macd.detail}
            points={scoreData.technicalMetrics.macd.points}
            maxPoints={scoreData.technicalMetrics.macd.maxPoints}
            status={scoreData.technicalMetrics.macd.status}
            compact={compact}
          />

          <MetricProgressBar
            score={Math.min(10, (scoreData.technicalMetrics.support.points / TECHNICAL_POINTS.SUPPORT) * 10)}
            label={t.support}
            thaiLabel={t.supportThai}
            value={scoreData.technicalMetrics.support.detail}
            points={scoreData.technicalMetrics.support.points}
            maxPoints={scoreData.technicalMetrics.support.maxPoints}
            status={scoreData.technicalMetrics.support.status}
            compact={compact}
          />
        </div>

        {/* CATALYSTS */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3">
            {t.catalyst}
          </div>

          {/* AI Score Display */}
          <div className="p-4 rounded-lg bg-surface-2 border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-insight" />
                <span className="text-sm font-medium text-text-primary">{t.catalystEventsThai}</span>
              </div>
              {scoreData.catalysts.aiScore !== null && scoreData.catalysts.aiScore !== undefined && (
                <div className="text-right">
                  <div className="text-xs text-text-3">AI Score</div>
                  <div className="text-lg font-bold text-insight">
                    {scoreData.catalysts.aiScore}<span className="text-sm">/10</span>
                  </div>
                </div>
              )}
            </div>

            {scoreData.catalysts.aiScore !== null && scoreData.catalysts.aiScore !== undefined ? (
              <div className="space-y-2">
                {/* Score-based message */}
                <div className="text-sm text-text-primary">
                  {scoreData.catalysts.aiScore >= 8 && '🎯 เหตุการณ์สำคัญระดับสูง มีแนวโน้มเป็นบวกต่อราคา'}
                  {scoreData.catalysts.aiScore >= 6 && scoreData.catalysts.aiScore < 8 && '📈 มีเหตุการณ์สนับสนุนระดับปานกลาง'}
                  {scoreData.catalysts.aiScore >= 4 && scoreData.catalysts.aiScore < 6 && '⚖️ เหตุการณ์สำคัญในระดับกลางๆ'}
                  {scoreData.catalysts.aiScore >= 2 && scoreData.catalysts.aiScore < 4 && '⚠️ มีความเสี่ยงหรือเหตุการณ์ไม่ชัดเจน'}
                  {scoreData.catalysts.aiScore < 2 && '🔴 ไม่มีเหตุการณ์สำคัญหรือมีความเสี่ยงสูง'}
                </div>

                {/* Points explanation */}
                <div className="text-xs text-text-3 pt-2 border-t border-border">
                  คะแนน CATALYST: {scoreData.catalystScore}/5 จากการแปลง AI Score ({scoreData.catalysts.aiScore}/10 ÷ 2)
                </div>
              </div>
            ) : (
              <div className="text-xs text-text-3 py-2 text-center">
                {t.noEvents}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
