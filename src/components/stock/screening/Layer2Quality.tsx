'use client'

/**
 * Layer 2: Quality Metrics Component
 *
 * Displays 7 quality metrics with scoring (10 points total):
 * - PEG Ratio (2 pts)
 * - Net Profit Margin (2 pts)
 * - ROE (1 pt)
 * - ROIC/WACC (2 pts)
 * - Debt/Equity (1 pt)
 * - FCF Yield (1 pt)
 * - OCF/Net Income (1 pt)
 */

import { QUALITY_THRESHOLDS, QUALITY_POINTS, getScoreColorClasses } from './constants'
import { MetricProgressBar } from './MetricProgressBar'
import type { QualityScoreData, MetricStatus } from './types'
import { formatPercentageFromDecimal, formatRatio } from './utils/formatters'

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'QUALITY',
    description: 'Financial quality metrics',
    peg: 'PEG Ratio',
    pegThai: 'อัตราส่วน PEG',
    npm: 'Net Profit Margin',
    npmThai: 'อัตรากำไรสุทธิ',
    roe: 'Return on Equity',
    roeThai: 'อัตราผลตอบแทนต่อผู้ถือหุ้น',
    roicWacc: 'ROIC / WACC',
    roicWaccThai: 'อัตราผลตอบแทนต่อทุน / ต้นทุนทุน',
    debtEquity: 'Debt to Equity',
    debtEquityThai: 'หนี้สินต่อส่วนของผู้ถือหุ้น',
    fcfYield: 'FCF Yield',
    fcfYieldThai: 'อัตราผลตอบแทนเงินสดไหลเสรี',
    ocfNi: 'OCF / Net Income',
    ocfNiThai: 'กระแสเงินสดจากดำเนินงาน / กำไรสุทธิ',
    vsSector: 'vs Sector',
    lessThan: '<',
    greaterThan: '>',
  },
  th: {
    title: 'คุณภาพ',
    description: 'ตัวชี้วัดคุณภาพทางการเงิน',
    peg: 'PEG Ratio',
    pegThai: 'อัตราส่วน PEG',
    npm: 'Net Profit Margin',
    npmThai: 'อัตรากำไรสุทธิ',
    roe: 'Return on Equity',
    roeThai: 'อัตราผลตอบแทนต่อผู้ถือหุ้น',
    roicWacc: 'ROIC / WACC',
    roicWaccThai: 'อัตราผลตอบแทนต่อทุน / ต้นทุนทุน',
    debtEquity: 'Debt to Equity',
    debtEquityThai: 'หนี้สินต่อส่วนของผู้ถือหุ้น',
    fcfYield: 'FCF Yield',
    fcfYieldThai: 'อัตราผลตอบแทนเงินสดไหลเสรี',
    ocfNi: 'OCF / Net Income',
    ocfNiThai: 'กระแสเงินสดจากดำเนินงาน / กำไรสุทธิ',
    vsSector: 'เทียบภาค',
    lessThan: '<',
    greaterThan: '>',
  },
} as const

// ============================================================================
// INPUT DATA
// ============================================================================

export interface QualityInputData {
  pegRatio: number | null
  profitMargin: number  // Decimal (e.g., 0.15 for 15%)
  returnOnEquity: number  // Decimal
  returnOnInvestedCapital: number  // Decimal
  debtToEquity: number
  fcfYield: number  // Decimal
  operatingCashFlow: number
  netIncome: number
  sectorAverages?: {
    profitMargin?: number
    returnOnEquity?: number
  }
}

// ============================================================================
// SCORE CALCULATION
// ============================================================================

/**
 * Calculate individual metric score (0-10)
 */
function calculateMetricScore(
  value: number,
  threshold: number,
  isLessThan: boolean
): { score: number; status: MetricStatus } {
  const passes = isLessThan ? value <= threshold : value >= threshold

  if (passes) {
    // Base score of 7, up to 10 based on how much it exceeds threshold
    const margin = isLessThan ? threshold - value : value - threshold
    const bonus = Math.min(3, Math.round(margin * 10))
    return { score: 7 + bonus, status: 'pass' }
  }

  // Failed: score based on proximity
  const margin = isLessThan ? value - threshold : threshold - value
  if (margin <= 0.1) {
    return { score: 5, status: 'partial' }
  }
  if (margin <= 0.3) {
    return { score: 3, status: 'fail' }
  }
  return { score: 1, status: 'fail' }
}

/**
 * Calculate quality layer score
 */
export function calculateQualityScore(data: QualityInputData): QualityScoreData {
  let totalScore = 0

  // PEG Ratio (2 pts) - lower is better
  const pegScore = calculateMetricScore(
    data.pegRatio ?? 0,
    QUALITY_THRESHOLDS.PEG_MAX,
    true
  )
  totalScore += pegScore.score >= 7 ? QUALITY_POINTS.PEG : 0

  // Net Profit Margin (2 pts) - compare to sector
  const sectorNpm = data.sectorAverages?.profitMargin || 0.10
  const npmScore = calculateMetricScore(
    data.profitMargin,
    sectorNpm,
    false
  )
  totalScore += npmScore.score >= 7 ? QUALITY_POINTS.NPM : 0

  // ROE (1 pt) - compare to sector
  const sectorRoe = data.sectorAverages?.returnOnEquity || 0.10
  const roeScore = calculateMetricScore(
    data.returnOnEquity,
    sectorRoe,
    false
  )
  totalScore += roeScore.score >= 7 ? QUALITY_POINTS.ROE : 0

  // ROIC/WACC (2 pts) - higher is better
  const roicScore = calculateMetricScore(
    data.returnOnInvestedCapital,
    0.10, // Assuming 10% WACC if not provided
    false
  )
  totalScore += roicScore.score >= 7 ? QUALITY_POINTS.ROIC_WACC : 0

  // Debt/Equity (1 pt) - lower is better
  const deScore = calculateMetricScore(
    data.debtToEquity,
    QUALITY_THRESHOLDS.DEBT_EQUITY_MAX,
    true
  )
  totalScore += deScore.score >= 7 ? QUALITY_POINTS.DEBT_EQUITY : 0

  // FCF Yield (1 pt) - higher is better
  const fcfScore = calculateMetricScore(
    data.fcfYield,
    QUALITY_THRESHOLDS.FCF_YIELD_MIN,
    false
  )
  totalScore += fcfScore.score >= 7 ? QUALITY_POINTS.FCF_YIELD : 0

  // OCF/NI (1 pt) - higher is better
  const ocfNiRatio = data.netIncome !== 0 ? data.operatingCashFlow / data.netIncome : 0
  const ocfScore = calculateMetricScore(
    ocfNiRatio,
    QUALITY_THRESHOLDS.OCF_NI_MIN,
    false
  )
  totalScore += ocfScore.score >= 7 ? QUALITY_POINTS.OCF_NI : 0

  return {
    totalScore: totalScore as QualityScoreData['totalScore'],
    maxScore: 10,
    metrics: {
      peg: {
        name: LABELS.en.peg,
        thaiName: LABELS.th.pegThai,
        points: pegScore.score >= 7 ? QUALITY_POINTS.PEG : 0,
        maxPoints: QUALITY_POINTS.PEG,
        currentValue: data.pegRatio || 0,
        targetValue: QUALITY_THRESHOLDS.PEG_MAX,
        status: pegScore.status,
        description: `${LABELS.th.lessThan} ${QUALITY_THRESHOLDS.PEG_MAX}`,
      },
      npm: {
        name: LABELS.en.npm,
        thaiName: LABELS.th.npmThai,
        points: npmScore.score >= 7 ? QUALITY_POINTS.NPM : 0,
        maxPoints: QUALITY_POINTS.NPM,
        currentValue: data.profitMargin,
        targetValue: sectorNpm,
        comparison: sectorNpm,
        status: npmScore.status,
        description: `${LABELS.th.vsSector} ${formatPercentageFromDecimal(sectorNpm)}`,
      },
      roe: {
        name: LABELS.en.roe,
        thaiName: LABELS.th.roeThai,
        points: roeScore.score >= 7 ? QUALITY_POINTS.ROE : 0,
        maxPoints: QUALITY_POINTS.ROE,
        currentValue: data.returnOnEquity,
        targetValue: sectorRoe,
        comparison: sectorRoe,
        status: roeScore.status,
        description: `${LABELS.th.vsSector} ${formatPercentageFromDecimal(sectorRoe)}`,
      },
      roicWacc: {
        name: LABELS.en.roicWacc,
        thaiName: LABELS.th.roicWaccThai,
        points: roicScore.score >= 7 ? QUALITY_POINTS.ROIC_WACC : 0,
        maxPoints: QUALITY_POINTS.ROIC_WACC,
        currentValue: data.returnOnInvestedCapital,
        targetValue: 1.5,
        status: roicScore.status,
        description: `${LABELS.th.greaterThan} 1.5x`,
      },
      debtEquity: {
        name: LABELS.en.debtEquity,
        thaiName: LABELS.th.debtEquityThai,
        points: deScore.score >= 7 ? QUALITY_POINTS.DEBT_EQUITY : 0,
        maxPoints: QUALITY_POINTS.DEBT_EQUITY,
        currentValue: data.debtToEquity,
        targetValue: QUALITY_THRESHOLDS.DEBT_EQUITY_MAX,
        status: deScore.status,
        description: `${LABELS.th.lessThan} ${QUALITY_THRESHOLDS.DEBT_EQUITY_MAX}`,
      },
      fcfYield: {
        name: LABELS.en.fcfYield,
        thaiName: LABELS.th.fcfYieldThai,
        points: fcfScore.score >= 7 ? QUALITY_POINTS.FCF_YIELD : 0,
        maxPoints: QUALITY_POINTS.FCF_YIELD,
        currentValue: data.fcfYield,
        targetValue: QUALITY_THRESHOLDS.FCF_YIELD_MIN,
        status: fcfScore.status,
        description: `${LABELS.th.greaterThan} ${formatPercentageFromDecimal(QUALITY_THRESHOLDS.FCF_YIELD_MIN)}`,
      },
      ocfNi: {
        name: LABELS.en.ocfNi,
        thaiName: LABELS.th.ocfNiThai,
        points: ocfScore.score >= 7 ? QUALITY_POINTS.OCF_NI : 0,
        maxPoints: QUALITY_POINTS.OCF_NI,
        currentValue: ocfNiRatio,
        targetValue: QUALITY_THRESHOLDS.OCF_NI_MIN,
        status: ocfScore.status,
        description: `${LABELS.th.greaterThan} ${QUALITY_THRESHOLDS.OCF_NI_MIN}x`,
      },
    },
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

interface Layer2QualityProps {
  data: QualityInputData
  locale?: 'en' | 'th'
  compact?: boolean
  className?: string
}

export function Layer2Quality({
  data,
  locale = 'th',
  compact = false,
  className = '',
}: Layer2QualityProps) {
  const scoreData = calculateQualityScore(data)
  const t = LABELS[locale]
  const colors = getScoreColorClasses(scoreData.totalScore)

  return (
    <div className={`layer2-quality ${className}`}>
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
        <div className={`px-3 py-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
          <span className={`text-lg font-bold tabular-nums ${colors.text}`}>
            {scoreData.totalScore}
          </span>
          <span className="text-sm text-text-3 ml-1">
            /{scoreData.maxScore}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {/* PEG Ratio */}
        <MetricProgressBar
          score={Math.min(10, scoreData.metrics.peg.points * 5)}
          label={t.peg}
          thaiLabel={t.pegThai}
          value={formatRatio(scoreData.metrics.peg.currentValue)}
          points={scoreData.metrics.peg.points}
          maxPoints={scoreData.metrics.peg.maxPoints}
          status={scoreData.metrics.peg.status}
          compact={compact}
        />

        {/* Net Profit Margin */}
        <MetricProgressBar
          score={Math.min(10, scoreData.metrics.npm.points * 5)}
          label={t.npm}
          thaiLabel={t.npmThai}
          value={`${(scoreData.metrics.npm.currentValue)}% ${t.vsSector} ${formatPercentageFromDecimal(scoreData.metrics.npm.comparison!)}`}
          points={scoreData.metrics.npm.points}
          maxPoints={scoreData.metrics.npm.maxPoints}
          status={scoreData.metrics.npm.status}
          compact={compact}
        />

        {/* ROE */}
        <MetricProgressBar
          score={Math.min(10, scoreData.metrics.roe.points * 10)}
          label={t.roe}
          thaiLabel={t.roeThai}
          value={`${(scoreData.metrics.roe.currentValue)}% ${t.vsSector} ${formatPercentageFromDecimal(scoreData.metrics.roe.comparison!)}`}
          points={scoreData.metrics.roe.points}
          maxPoints={scoreData.metrics.roe.maxPoints}
          status={scoreData.metrics.roe.status}
          compact={compact}
        />

        {/* ROIC/WACC */}
        <MetricProgressBar
          score={Math.min(10, scoreData.metrics.roicWacc.points * 5)}
          label={t.roicWacc}
          thaiLabel={t.roicWaccThai}
          value={formatRatio(scoreData.metrics.roicWacc.currentValue)}
          points={scoreData.metrics.roicWacc.points}
          maxPoints={scoreData.metrics.roicWacc.maxPoints}
          status={scoreData.metrics.roicWacc.status}
          compact={compact}
        />

        {/* Debt/Equity */}
        <MetricProgressBar
          score={Math.min(10, scoreData.metrics.debtEquity.points * 10)}
          label={t.debtEquity}
          thaiLabel={t.debtEquityThai}
          value={formatRatio(scoreData.metrics.debtEquity.currentValue)}
          points={scoreData.metrics.debtEquity.points}
          maxPoints={scoreData.metrics.debtEquity.maxPoints}
          status={scoreData.metrics.debtEquity.status}
          compact={compact}
        />

        {/* FCF Yield */}
        <MetricProgressBar
          score={Math.min(10, scoreData.metrics.fcfYield.points * 10)}
          label={t.fcfYield}
          thaiLabel={t.fcfYieldThai}
          value={formatPercentageFromDecimal(scoreData.metrics.fcfYield.currentValue)}
          points={scoreData.metrics.fcfYield.points}
          maxPoints={scoreData.metrics.fcfYield.maxPoints}
          status={scoreData.metrics.fcfYield.status}
          compact={compact}
        />

        {/* OCF/NI */}
        <MetricProgressBar
          score={Math.min(10, scoreData.metrics.ocfNi.points * 10)}
          label={t.ocfNi}
          thaiLabel={t.ocfNiThai}
          value={formatRatio(scoreData.metrics.ocfNi.currentValue)}
          points={scoreData.metrics.ocfNi.points}
          maxPoints={scoreData.metrics.ocfNi.maxPoints}
          status={scoreData.metrics.ocfNi.status}
          compact={compact}
        />
      </div>
    </div>
  )
}
