/**
 * Score Calculator Utilities
 *
 * Central score calculation functions for the screening system.
 * Combines all layer calculators into one unified interface.
 */

import {
  calculateUniverseScore,
} from '../Layer1Universe'

import {
  calculateQualityScore,
} from '../Layer2Quality'

import {
  calculateValueGrowthScore,
} from '../Layer3ValueGrowth'

import {
  calculateTechnicalScore,
} from '../Layer4Technical'

import type {
  UniverseScoreData,
  QualityScoreData,
  ValueGrowthScoreData,
  TechnicalScoreData,
  ScreeningScoreData,
  InvestmentDecision,
  TotalScore,
} from '../types'

import {
  determineDecision,
  determineConfidence,
} from '../TotalScoreCard'

/**
 * Combined input data for all layers
 */
export interface ScreeningInputData {
  // Layer 1: Universe
  marketCap: number
  volume: number

  // Layer 2: Quality
  pegRatio: number | null
  profitMargin: number
  returnOnEquity: number
  returnOnInvestedCapital: number
  debtToEquity: number
  fcfYield: number
  operatingCashFlow: number
  netIncome: number
  sectorAverages?: {
    profitMargin?: number
    returnOnEquity?: number
    dividendYield?: number
  }

  // Layer 3: Value + Growth
  peRatio: number
  pbRatio: number
  dividendYield: number
  pfcfRatio: number
  epsGrowthYoY: number
  epsAcceleration: number

  // Layer 4: Technical + Catalyst
  currentPrice: number
  ma50: number | null
  rsi: number | null
  macdPositive: boolean | null
  supportLevel: number | null
  catalystEvents?: Array<{
    name: string
    thaiName?: string
    date: Date | null
    importance: 'high' | 'medium' | 'low'
    impact: 'positive' | 'negative' | 'neutral'
  }>
  sectorMomentum?: 'strong' | 'neutral' | 'weak'
}

/**
 * Calculate complete screening score
 */
export function calculateScreeningScore(data: ScreeningInputData): ScreeningScoreData {
  // Layer 1: Universe
  const universe = calculateUniverseScore(data.marketCap, data.volume)

  // Layer 2: Quality
  const quality = calculateQualityScore({
    pegRatio: data.pegRatio,
    profitMargin: data.profitMargin,
    returnOnEquity: data.returnOnEquity,
    returnOnInvestedCapital: data.returnOnInvestedCapital,
    debtToEquity: data.debtToEquity,
    fcfYield: data.fcfYield,
    operatingCashFlow: data.operatingCashFlow,
    netIncome: data.netIncome,
    sectorAverages: data.sectorAverages,
  })

  // Layer 3: Value + Growth
  const valueGrowth = calculateValueGrowthScore({
    peRatio: data.peRatio,
    pbRatio: data.pbRatio,
    returnOnEquity: data.returnOnEquity,
    dividendYield: data.dividendYield,
    pfcfRatio: data.pfcfRatio,
    sectorAvgDivYield: data.sectorAverages?.dividendYield,
    epsGrowthYoY: data.epsGrowthYoY,
    epsAcceleration: data.epsAcceleration,
  })

  // Layer 4: Technical + Catalyst
  const technical = calculateTechnicalScore({
    currentPrice: data.currentPrice,
    ma50: data.ma50,
    rsi: data.rsi,
    macdPositive: data.macdPositive,
    supportLevel: data.supportLevel,
    catalystEvents: data.catalystEvents,
    sectorMomentum: data.sectorMomentum,
  })

  // Calculate total score (27 max)
  const totalScore = (universe.totalScore + quality.totalScore + valueGrowth.totalScore + technical.totalScore) as TotalScore

  // Determine decision
  const decision = determineDecision(totalScore)

  // Determine confidence
  const confidence = determineConfidence(totalScore, {
    universe: { score: universe.totalScore, passed: universe.allPassed },
    quality: { score: quality.totalScore },
    valueGrowth: { score: valueGrowth.totalScore },
    technical: { score: technical.totalScore },
  })

  // Generate summary and rationale
  const { summary, rationale } = generateSummaryAndRationale({
    totalScore,
    decision,
    confidence,
    universe,
    quality,
    valueGrowth,
    technical,
  })

  return {
    totalScore,
    maxScore: 27,
    decision,
    confidence: confidence.level,
    confidencePercent: confidence.percent,
    layers: {
      universe,
      quality,
      valueGrowth,
      technical,
    },
    summary,
    rationale,
  }
}

/**
 * Generate summary and rationale based on scores
 */
interface SummaryInput {
  totalScore: TotalScore
  decision: InvestmentDecision
  confidence: { level: 'High' | 'Medium' | 'Low'; percent: number }
  universe: UniverseScoreData
  quality: QualityScoreData
  valueGrowth: ValueGrowthScoreData
  technical: TechnicalScoreData
}

function generateSummaryAndRationale(input: SummaryInput): {
  summary: string
  rationale: string[]
} {
  const { decision, confidence, universe, quality, valueGrowth, technical } = input
  const rationale: string[] = []

  // Summary based on decision
  let summary = ''
  if (decision === 'BUY') {
    if (confidence.level === 'High') {
      summary = 'หุ้นมีคุณภาพดี ราคาเหมาะสม พร้อมเหตุการณ์สนับสนุน'
    } else {
      summary = 'หุ้นมีแนวโน้มขาขึ้น แต่มีความเสี่ยงบางประการ'
    }
  } else if (decision === 'HOLD') {
    summary = 'หุ้นมีทั้งจุดแข็งและจุดอ่อน ควรศึกษาเพิ่มเติม'
  } else {
    summary = 'หุ้นมีความเสี่ยงสูง ไม่แนะนำการลงทุนในขณะนี้'
  }

  // Generate rationale points
  // Universe
  if (universe.allPassed) {
    rationale.push('ผ่านเกณฑ์การคัดเลือกพื้นฐาน')
  } else {
    rationale.push('ไม่ผ่านเกณฑ์บางประการ')
  }

  // Quality
  if (quality.totalScore >= 7) {
    rationale.push('คุณภาพทางการเงินดี')
  } else if (quality.totalScore >= 5) {
    rationale.push('คุณภาพทางการเงินปานกลาง')
  } else {
    rationale.push('คุณภาพทางการเงินอ่อน')
  }

  // Value
  const valueScore = valueGrowth.valueScore
  if (valueScore >= 4) {
    rationale.push('ราคาถูกเมื่อเทียบกับมูลค่า')
  } else if (valueScore >= 2) {
    rationale.push('ราคาอยู่ในระดับปานกลาง')
  } else {
    rationale.push('ราคาแพงเมื่อเทียบกับมูลค่า')
  }

  // Growth
  const growthScore = valueGrowth.growthScore
  if (growthScore >= 4) {
    rationale.push('การเติบโตดี')
  } else if (growthScore >= 2) {
    rationale.push('การเติบโตปานกลาง')
  } else {
    rationale.push('การเติบโตอ่อน')
  }

  // Technical
  if (technical.technicalScore >= 3) {
    rationale.push('สัญญาณเทคนิคดี')
  } else if (technical.technicalScore >= 2) {
    rationale.push('สัญญาณเทคนิคปานกลาง')
  }

  // Catalyst
  if (technical.catalystScore >= 3) {
    rationale.push('มีเหตุการณ์สนับสนุน')
  }

  return { summary, rationale: rationale.slice(0, 5) }
}

/**
 * Calculate score change (for historical tracking)
 */
export function calculateScoreChange(
  oldScore: TotalScore,
  newScore: TotalScore
): {
  change: number
  improved: boolean
  percentChange: number
} {
  const change = newScore - oldScore
  const improved = change > 0
  const percentChange = oldScore > 0 ? (change / oldScore) * 100 : 0

  return { change, improved, percentChange }
}

/**
 * Validate input data
 */
export function validateScreeningInput(data: Partial<ScreeningInputData>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Required fields
  if (!data.marketCap || data.marketCap <= 0) {
    errors.push('Market cap must be positive')
  }
  if (!data.volume || data.volume <= 0) {
    errors.push('Volume must be positive')
  }
  if (!data.currentPrice || data.currentPrice <= 0) {
    errors.push('Current price must be positive')
  }

  // Value checks
  if (data.peRatio !== undefined && data.peRatio <= 0) {
    errors.push('PE ratio must be positive')
  }
  if (data.returnOnEquity !== undefined && data.returnOnEquity < -1) {
    errors.push('ROE cannot be less than -100%')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
