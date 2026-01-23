/**
 * Verdict Engine
 *
 * Aggregates lens scores and generates final investment verdict
 */

import type {
  LensScore,
  StockVerdict,
  Verdict,
  VerdictConfidence,
  VerdictBullets,
  StockAnalysisInput,
} from './types'
import { assessQuality } from './lenses/quality'
import { assessValuation } from './lenses/valuation'
import { assessTiming } from './lenses/timing'
import type { MarketRegime } from '@/types/market'

/**
 * Generate stock verdict from analysis
 * @param input Stock analysis input
 * @returns Complete stock verdict
 */
export function generateVerdict(input: StockAnalysisInput): StockVerdict {
  const { stock, marketRegime, avgVolume } = input

  // Assess through three lenses
  const quality = assessQuality({
    netProfitMargin: undefined, // Would need additional data
    roe: undefined,
    debtToEquity: undefined,
    cashFlow: undefined,
    earningsGrowth: undefined,
  })

  const valuation = assessValuation({
    pe: stock.pe,
    pbv: stock.pbv,
    dividendYield: stock.dividendYield,
    ev: undefined,
    ebitda: undefined,
  })

  const timing = assessTiming({
    priceChangePercent: stock.changePct,
    volume: stock.volume,
    avgVolume,
    marketRegime,
    isNearHigh: undefined,
    isNearLow: undefined,
  })

  // Calculate data completeness
  const dataCompleteness = calculateDataCompleteness(stock, quality, valuation)

  // Determine verdict and confidence
  const { verdict, confidence } = determineVerdict(
    quality,
    valuation,
    timing,
    dataCompleteness
  )

  // Generate bullets
  const bullets = generateBullets(quality, valuation, timing, verdict)

  // Generate next step
  const nextStep = generateNextStep(verdict, timing)

  return {
    symbol: stock.symbol,
    verdict,
    confidence,
    bullets,
    lenses: [quality, valuation, timing],
    nextStep,
    dataCompleteness,
  }
}

/**
 * Calculate data completeness percentage
 */
function calculateDataCompleteness(
  stock: { pe?: number; pbv?: number; dividendYield?: number },
  quality: LensScore,
  _valuation: LensScore
): number {
  let availableMetrics = 0
  let totalMetrics = 0

  // Stock basic metrics (always available)
  totalMetrics += 3 // symbol, name, price are always present
  availableMetrics += 3

  // Valuation metrics
  totalMetrics += 3
  if (stock.pe !== undefined) availableMetrics++
  if (stock.pbv !== undefined) availableMetrics++
  if (stock.dividendYield !== undefined) availableMetrics++

  // Quality metrics (based on notes count as proxy)
  totalMetrics += 5
  availableMetrics += Math.min(quality.notes.length, 5)

  return Math.round((availableMetrics / totalMetrics) * 100)
}

/**
 * Determine verdict from lens scores
 */
function determineVerdict(
  quality: LensScore,
  valuation: LensScore,
  timing: LensScore,
  dataCompleteness: number
): { verdict: Verdict; confidence: VerdictConfidence } {
  // Count lens results
  const passCount = [quality, valuation, timing].filter((l) => l.status === 'Pass').length
  const failCount = [quality, valuation, timing].filter((l) => l.status === 'Fail').length

  // Data completeness affects confidence
  if (dataCompleteness < 40) {
    return { verdict: 'Watch', confidence: 'Low' }
  }

  // Timing is critical - if timing is Fail, lean conservative
  if (timing.status === 'Fail') {
    if (failCount >= 2 || passCount === 0) {
      return { verdict: 'Avoid', confidence: dataCompleteness > 70 ? 'High' : 'Medium' }
    }
    return { verdict: 'Watch', confidence: 'Medium' }
  }

  // Quality and valuation are Pass (timing is not Fail at this point)
  if (passCount >= 2) {
    return {
      verdict: 'Buy',
      confidence: dataCompleteness > 80 ? 'High' : 'Medium',
    }
  }

  // Both quality and valuation are Fail
  if (failCount >= 2) {
    return { verdict: 'Avoid', confidence: dataCompleteness > 70 ? 'High' : 'Medium' }
  }

  // Mixed signals or neutral
  return { verdict: 'Watch', confidence: 'Medium' }
}

/**
 * Generate verdict bullets
 */
function generateBullets(
  quality: LensScore,
  valuation: LensScore,
  timing: LensScore,
  _verdict: Verdict
): VerdictBullets {
  const strengths: string[] = []
  const warnings: string[] = []

  // Quality lens
  if (quality.status === 'Pass') {
    strengths.push(...quality.notes.slice(0, 2))
  } else if (quality.status === 'Fail') {
    warnings.push(...quality.notes.slice(0, 2))
  }

  // Valuation lens
  if (valuation.status === 'Pass') {
    strengths.push(...valuation.notes.slice(0, 1))
  } else if (valuation.status === 'Fail') {
    warnings.push(...valuation.notes.slice(0, 1))
  }

  // Timing lens
  const marketFit = timing.notes[0] || 'Market fit unclear due to limited data'

  // Limit bullets
  return {
    strengths: strengths.slice(0, 2),
    warnings: warnings.slice(0, 2),
    marketFit,
  }
}

/**
 * Generate next step guidance
 */
function generateNextStep(verdict: Verdict, _timing: LensScore): string {
  const nextStepMap: Record<Verdict, string> = {
    Buy: 'Consider starting a small position. Monitor for entry points on dips.',
    Watch: 'Add to watchlist. Wait for clearer signals or better valuation.',
    Avoid: 'Stay on sidelines. Look for better opportunities elsewhere.',
  }

  return nextStepMap[verdict]
}

/**
 * Batch generate verdicts for multiple stocks
 * @param inputs Array of stock analysis inputs
 * @param marketRegime Current market regime
 * @returns Array of stock verdicts
 */
export function generateBatchVerdicts(
  inputs: StockAnalysisInput[],
  marketRegime: MarketRegime | null
): StockVerdict[] {
  return inputs.map((input) =>
    generateVerdict({
      ...input,
      marketRegime,
    })
  )
}
