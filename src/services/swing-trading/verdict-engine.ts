/**
 * Swing Trading Verdict Engine
 *
 * Main service for generating swing trading verdicts with entry/exit planning
 * Integrates historical trend analysis, entry/exit calculators, and position sizing
 */

import type {
  SwingVerdict,
  SwingVerdictType,
  SwingHorizon,
  TrendQuality,
  EntryTiming,
  ConfirmationAnalysis,
} from '@/types/swing-trading'
import type { HistoricalTrendAnalysis } from '@/types/swing-trading'
import { analyzeHistoricalTrend } from '@/services/historical-trend'
import { calculateEntryZone } from './entry-calculator'
import { calculateExitLevels } from './exit-calculator'
import { calculatePositionSize } from './position-sizer'
import { fetchStockPrice } from '@/lib/api/stock-api'
import { analyzeMultiDayPatterns } from '@/services/smart-money/multi-day-analyzer'
import { generateConfirmation } from '@/services/confirmation'

// ============================================================================
// VERDICT GENERATION
// ============================================================================

/**
 * Determine swing trading verdict type based on analysis
 *
 * @param trend - Historical trend analysis
 * @returns Verdict type and confidence
 */
function determineVerdict(
  trend: HistoricalTrendAnalysis
): { verdict: SwingVerdictType; confidence: 'High' | 'Medium' | 'Low' } {
  const { trend: trendData, momentum, dataQuality } = trend

  // Low data quality = low confidence
  if (dataQuality.completeness < 60) {
    return { verdict: 'Avoid', confidence: 'Low' }
  }

  // Strong Buy: Early uptrend with accelerating momentum
  if (
    trendData.direction === 'uptrend' &&
    (trendData.phase === 'early' || trendData.phase === 'mature') &&
    trendData.strength >= 70 &&
    momentum.isAccelerating &&
    momentum.sustainabilityScore >= 70
  ) {
    return { verdict: 'Strong Buy', confidence: 'High' }
  }

  // Buy: Uptrend with good fundamentals
  if (
    trendData.direction === 'uptrend' &&
    trendData.phase !== 'exhausted' &&
    trendData.strength >= 50 &&
    momentum.sustainabilityScore >= 50
  ) {
    return { verdict: 'Buy', confidence: 'Medium' }
  }

  // Avoid: Downtrend or exhausted trend
  if (
    trendData.direction === 'downtrend' ||
    trendData.phase === 'exhausted' ||
    momentum.isDecelerating
  ) {
    return { verdict: 'Avoid', confidence: 'Medium' }
  }

  // Default: Wait
  return { verdict: 'Wait', confidence: 'Low' }
}

/**
 * Calculate trend quality score
 *
 * @param trend - Historical trend analysis
 * @returns Trend quality classification
 */
function calculateTrendQuality(trend: HistoricalTrendAnalysis): TrendQuality {
  const { trend: trendData, momentum } = trend

  // Excellent: Strong uptrend with accelerating momentum
  if (
    trendData.direction === 'uptrend' &&
    trendData.strength >= 80 &&
    momentum.isAccelerating &&
    momentum.sustainabilityScore >= 80
  ) {
    return 'excellent'
  }

  // Good: Solid uptrend with good momentum
  if (
    trendData.direction === 'uptrend' &&
    trendData.strength >= 60 &&
    momentum.sustainabilityScore >= 60
  ) {
    return 'good'
  }

  // Fair: Mixed signals
  if (
    trendData.direction === 'sideways' ||
    (trendData.strength >= 40 && trendData.strength < 60)
  ) {
    return 'fair'
  }

  // Poor: Weak or downtrend
  return 'poor'
}

/**
 * Calculate entry timing assessment
 *
 * @param entryZone - Calculated entry zone
 * @param currentPrice - Current market price
 * @param trend - Historical trend analysis
 * @returns Entry timing classification
 */
function calculateEntryTiming(
  entryZone: { min: number; max: number },
  currentPrice: number,
  trend: HistoricalTrendAnalysis
): EntryTiming {
  const distanceToZone = currentPrice - entryZone.min

  // In zone and early trend = optimal
  if (
    currentPrice >= entryZone.min &&
    currentPrice <= entryZone.max &&
    trend.trend.phase === 'early'
  ) {
    return 'optimal'
  }

  // Near zone = good
  if (Math.abs(distanceToZone) / currentPrice < 0.02) {
    return 'good'
  }

  // In zone but late trend = wait
  if (currentPrice >= entryZone.min && currentPrice <= entryZone.max) {
    return 'wait'
  }

  // Far from zone = poor
  return 'poor'
}

/**
 * Generate key factors for the verdict
 *
 * @param trend - Historical trend analysis
 * @returns Array of key factors
 */
function generateKeyFactors(
  trend: HistoricalTrendAnalysis
): string[] {
  const factors: string[] = []
  const { trend: trendData, momentum } = trend

  // Trend direction
  if (trendData.direction === 'uptrend') {
    factors.push(`Uptrend (${trendData.duration} days)`)
  } else if (trendData.direction === 'downtrend') {
    factors.push(`Downtrend (${trendData.duration} days)`)
  } else {
    factors.push('Sideways trend')
  }

  // Trend phase
  if (trendData.phase === 'early') {
    factors.push('Early trend stage - high potential')
  } else if (trendData.phase === 'mature') {
    factors.push('Mature trend - moderate potential')
  } else if (trendData.phase === 'exhausted') {
    factors.push('Late trend stage - high reversal risk')
  }

  // Momentum
  if (momentum.isAccelerating) {
    factors.push('Momentum accelerating')
  } else if (momentum.isDecelerating) {
    factors.push('Momentum decelerating')
  }

  // Support/Resistance
  if (trend.levels.support.length > 0) {
    const nearestSupport = trend.levels.support[0]
    factors.push(`Near support at ${nearestSupport.price.toFixed(2)}`)
  }

  // Trend strength
  if (trendData.strength >= 70) {
    factors.push('Strong trend (70+ score)')
  } else if (trendData.strength >= 50) {
    factors.push('Moderate trend (50-70 score)')
  } else {
    factors.push('Weak trend (<50 score)')
  }

  return factors.slice(0, 5) // Max 5 factors
}

/**
 * Calculate time estimate for target holding period
 *
 * @param horizon - Target holding period (30, 60, or 90 days)
 * @param trend - Historical trend analysis
 * @returns Time estimate
 */
function calculateTimeEstimate(
  horizon: SwingHorizon,
  trend: HistoricalTrendAnalysis
): { minDays: number; maxDays: number; rationale: string } {
  const { trend: trendData } = trend

  // Base estimate on horizon
  let minDays = horizon * 0.7 // 70% of target
  let maxDays = horizon * 1.2 // 120% of target

  // Adjust based on trend phase
  if (trendData.phase === 'early') {
    maxDays = horizon * 1.5 // Early trend may take longer
  } else if (trendData.phase === 'exhausted') {
    maxDays = horizon * 0.8 // Exhausted trend may exit early
  }

  // Adjust based on momentum
  if (trend.momentum.isAccelerating) {
    minDays = horizon * 0.5 // Accelerating = faster target
  }

  // Generate rationale
  let rationale = `Based on ${horizon}-day target holding period`

  if (trendData.phase === 'early') {
    rationale += '. Early trend may extend target'
  } else if (trendData.phase === 'exhausted') {
    rationale += '. Late trend may exit early'
  }

  return {
    minDays: Math.round(minDays),
    maxDays: Math.round(maxDays),
    rationale,
  }
}

/**
 * Calculate overall data quality score
 *
 * @param trend - Historical trend analysis
 * @param currentPrice - Current market price
 * @returns Data quality score (0-100)
 */
function calculateOverallDataQuality(
  trend: HistoricalTrendAnalysis,
  currentPrice: number
): number {
  let score = 0

  // Historical data completeness (40 points)
  score += (trend.dataQuality.completeness / 100) * 40

  // Price validity (20 points)
  if (currentPrice > 0) {
    score += 20
  }

  // MA availability (20 points)
  if (trend.movingAverages.ma20.length > 0) {
    score += 7
  }
  if (trend.movingAverages.ma50.length > 0) {
    score += 7
  }
  if (trend.movingAverages.ma200.length > 0) {
    score += 6
  }

  // S/R levels available (20 points)
  if (trend.levels.support.length > 0) {
    score += 10
  }
  if (trend.levels.resistance.length > 0) {
    score += 10
  }

  return Math.min(100, Math.round(score))
}

// ============================================================================
// MAIN VERDICT FUNCTION
// ============================================================================

/**
 * Generate swing trading verdict
 *
 * This is the main entry point for swing trading verdict generation.
 * It integrates:
 * - Historical trend analysis
 * - Entry zone calculation
 * - Exit level calculation (stop-loss, take-profit)
 * - Position sizing
 * - Smart money flow (optional)
 * - Confirmation analysis (optional)
 *
 * @param params - Verdict generation parameters
 * @returns Complete swing trading verdict or null if failed
 *
 * @example
 * ```typescript
 * const verdict = await generateSwingVerdict({
 *   symbol: 'PTT',
 *   horizon: 60,
 *   includeConfirmation: true,
 * })
 * if (verdict) {
 *   console.log(`Verdict: ${verdict.verdict}`)
 *   console.log(`Entry: ${verdict.entry.zone.min} - ${verdict.entry.zone.max}`)
 *   console.log(`Confirmation: ${verdict.confirmation?.recommendation}`)
 * }
 * ```
 */
export async function generateSwingVerdict(params: {
  symbol: string
  horizon: SwingHorizon
  currentPrice?: number
  smartMoneyFlow?: {
    foreignNet: number
    institutionNet: number
  }
  accountValue?: number // User's account value for position sizing
  includeConfirmation?: boolean // Generate confirmation analysis
}): Promise<SwingVerdict | null> {
  const { symbol, horizon } = params

  try {
    // Step 1: Fetch current price if not provided
    let currentPrice = params.currentPrice
    if (!currentPrice) {
      const priceResponse = await fetchStockPrice(symbol)
      if (!priceResponse.success || !priceResponse.data) {
        return null
      }
      currentPrice = priceResponse.data.regularMarketPrice
    }

    // Step 2: Analyze historical trend
    const historicalTrend = await analyzeHistoricalTrend({
      symbol,
      days: 90, // Use 90 days for comprehensive analysis
    })

    if (!historicalTrend) {
      return null
    }

    // Step 3: Determine verdict and confidence
    let { verdict, confidence } = determineVerdict(historicalTrend)

    // Step 4: Calculate entry zone
    const entryResult = calculateEntryZone({
      currentPrice,
      supportLevels: historicalTrend.levels.support,
      movingAverages: {
        ma20: historicalTrend.movingAverages.ma20[historicalTrend.movingAverages.ma20.length - 1]?.value,
        ma50: historicalTrend.movingAverages.ma50[historicalTrend.movingAverages.ma50.length - 1]?.value,
      },
      trendPhase: historicalTrend.trend.phase,
    })

    // Step 5: Calculate exit levels
    const targetReturn = horizon === 30 ? 0.20 : horizon === 60 ? 0.20 : 0.25 // 20% or 25% target
    const exitResult = calculateExitLevels({
      entryPrice: entryResult.entryZone.max, // Use upper end of entry zone
      targetReturn,
      supportLevel: historicalTrend.levels.support[0]?.price,
      resistanceLevel: historicalTrend.levels.resistance[0]?.price,
      atr: undefined, // TODO: Calculate ATR from historical data
    })

    // Step 6: Calculate position size
    const positionResult = calculatePositionSize({
      entryPrice: entryResult.entryZone.max,
      stopLoss: exitResult.stopLoss.price,
      riskPerTrade: 0.02, // 2% risk
      accountValue: params.accountValue ?? 100000, // Use provided value or default
    })

    // Step 7: Calculate analysis components
    const trendQuality = calculateTrendQuality(historicalTrend)
    const timing = calculateEntryTiming(
      entryResult.entryZone,
      currentPrice,
      historicalTrend
    )
    const keyFactors = generateKeyFactors(historicalTrend)
    const timeEstimate = calculateTimeEstimate(horizon, historicalTrend)

    // Step 8: Calculate overall data quality
    const dataQuality = calculateOverallDataQuality(historicalTrend, currentPrice)

    // Step 8.5: Generate confirmation (if requested)
    let confirmation: ConfirmationAnalysis | undefined
    if (params.includeConfirmation) {
      try {
        // Fetch multi-day smart money patterns
        const smartMoneyAnalysis = await analyzeMultiDayPatterns({
          symbol,
          days: 5, // 5-day pattern analysis
        })

        // Generate confirmation
        confirmation = await generateConfirmation({
          symbol,
          smartMoneyAnalysis,
          sectorRotation: undefined, // TODO: Add sector rotation later
          historicalTrend,
        })

        // Adjust verdict confidence based on confirmation
        if (confirmation.isConfirmed) {
          // Boost confidence if confirmed
          confidence = confirmation.overallConfidence >= 70
            ? 'High'
            : confirmation.overallConfidence >= 50 ? 'Medium' : 'Low'
        } else {
          // Lower confidence if not confirmed
          confidence = confidence === 'High'
            ? 'Medium'
            : 'Low'
        }

        // Adjust verdict if strong negative signals
        if (confirmation.recommendation === 'Avoid Entry') {
          verdict = 'Wait'
        }
      } catch {
        // Silently fail - confirmation is optional
      }
    }

    // Step 9: Return complete verdict
    return {
      symbol,
      horizon,
      verdict,
      confidence,
      entry: {
        zone: entryResult.entryZone,
        discountFromCurrent: entryResult.discountPercent,
        rationale: entryResult.rationale,
      },
      exit: {
        stopLoss: exitResult.stopLoss,
        takeProfits: exitResult.takeProfits,
        riskRewardRatio: exitResult.riskRewardRatio,
      },
      position: {
        percentage: positionResult.percentage,
        riskAmount: positionResult.riskAmount,
        rationale: positionResult.rationale,
      },
      analysis: {
        trendQuality,
        trendSustainability: historicalTrend.momentum.sustainabilityScore,
        timing,
        keyFactors,
      },
      timeEstimate,
      timestamp: Date.now(),
      dataQuality,
      confirmation,
    }
  } catch (error) {
    return null
  }
}
