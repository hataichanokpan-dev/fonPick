/**
 * Correlation Checker
 *
 * Analyzes price correlation between stocks to identify
 * relationships and diversification opportunities.
 */

import type {
  CorrelationAnalysis,
  CorrelationEntry,
  CorrelationStrength,
  CorrelationRequest,
} from '@/types/risk-management'
import type { PriceHistoryPoint } from '@/types/stock-price-api'
import { fetchPriceHistory } from '@/lib/api/stock-api'

// ============================================================================
// CONSTANTS
// ============================================================================

const CORRELATION_THRESHOLDS = {
  /** Strong negative correlation */
  STRONG_NEGATIVE: -0.7,
  /** Weak negative correlation */
  WEAK_NEGATIVE: -0.3,
  /** Weak positive correlation */
  WEAK_POSITIVE: 0.3,
  /** Strong positive correlation */
  STRONG_POSITIVE: 0.7,
} as const

// ============================================================================
// MAIN ANALYZER
// ============================================================================

/**
 * Analyze correlation between multiple stocks
 *
 * @param request Correlation analysis request
 * @returns Correlation analysis result
 */
export async function analyzeCorrelation(
  request: CorrelationRequest
): Promise<CorrelationAnalysis | null> {
  const { symbols, period = 90 } = request

  if (symbols.length < 2) {
    console.error('Correlation analysis requires at least 2 symbols')
    return null
  }

  try {
    // Fetch price history for all symbols
    const priceHistoryMap = new Map<string, PriceHistoryPoint[]>()

    await Promise.all(
      symbols.map(async (symbol) => {
        const endDate = new Date().toISOString().split('T')[0]
        const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]

        const response = await fetchPriceHistory(symbol, {
          period1: startDate,
          period2: endDate,
          interval: '1d',
        })
        if (response.success && response.data) {
          priceHistoryMap.set(symbol, response.data)
        }
      })
    )

    // Verify we have data for all symbols
    if (priceHistoryMap.size !== symbols.length) {
      console.error('Failed to fetch price history for all symbols')
      return null
    }

    // Calculate correlations
    const correlations: CorrelationEntry[] = []
    const symbolPairs = generateSymbolPairs(symbols)

    for (const [symbol1, symbol2] of symbolPairs) {
      const history1 = priceHistoryMap.get(symbol1)!
      const history2 = priceHistoryMap.get(symbol2)!

      // Align dates and calculate returns
      const alignedReturns = alignAndCalculateReturns(history1, history2)

      if (alignedReturns.length < 30) {
        // Not enough data points
        continue
      }

      // Calculate correlation coefficient
      const coefficient = calculateCorrelationCoefficient(alignedReturns)

      correlations.push({
        symbol1,
        symbol2,
        coefficient,
        strength: classifyCorrelationStrength(coefficient),
        sampleSize: alignedReturns.length,
        significance: calculateSignificance(alignedReturns.length, coefficient),
      })
    }

    // Find highly correlated pairs
    const highlyCorrelated = correlations
      .filter(c => Math.abs(c.coefficient) >= CORRELATION_THRESHOLDS.STRONG_POSITIVE)
      .map(c => ({
        symbol1: c.symbol1,
        symbol2: c.symbol2,
        coefficient: c.coefficient,
        risk: c.coefficient > 0.8 ? 'Very High' : 'High',
      }))

    // Calculate diversification score
    const diversificationScore = calculateDiversificationScore(correlations)

    // Generate recommendations
    const recommendations = generateCorrelationRecommendations(
      highlyCorrelated,
      diversificationScore
    )

    return {
      symbols,
      correlations,
      highlyCorrelated,
      diversificationScore,
      recommendations,
      periodDays: period,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Correlation analysis failed:', error)
    return null
  }
}

// ============================================================================
// CORRELATION CALCULATION
// ============================================================================

/**
 * Generate all unique symbol pairs
 *
 * @param symbols List of symbols
 * @returns Array of symbol pairs
 */
function generateSymbolPairs(symbols: string[]): Array<[string, string]> {
  const pairs: Array<[string, string]> = []

  for (let i = 0; i < symbols.length; i++) {
    for (let j = i + 1; j < symbols.length; j++) {
      pairs.push([symbols[i], symbols[j]])
    }
  }

  return pairs
}

/**
 * Align price histories by date and calculate daily returns
 *
 * @param history1 First price history
 * @param history2 Second price history
 * @returns Array of paired returns
 */
function alignAndCalculateReturns(
  history1: PriceHistoryPoint[],
  history2: PriceHistoryPoint[]
): Array<[number, number]> {
  // Create maps for quick lookup
  const map1 = new Map(history1.map(p => [p.date, p.close]))
  const map2 = new Map(history2.map(p => [p.date, p.close]))

  // Find common dates
  const commonDates = new Set([
    ...history1.map(p => p.date),
    ...history2.map(p => p.date),
  ])

  const returns: Array<[number, number]> = []

  // Calculate returns for each common date
  let prevPrice1: number | null = null
  let prevPrice2: number | null = null

  for (const date of Array.from(commonDates).sort()) {
    const price1 = map1.get(date)
    const price2 = map2.get(date)

    if (price1 && price2 && prevPrice1 && prevPrice2) {
      // Calculate daily return
      const return1 = (price1 - prevPrice1) / prevPrice1
      const return2 = (price2 - prevPrice2) / prevPrice2

      returns.push([return1, return2])
    }

    prevPrice1 = price1 ?? prevPrice1
    prevPrice2 = price2 ?? prevPrice2
  }

  return returns
}

/**
 * Calculate Pearson correlation coefficient
 *
 * @param returns Array of paired returns
 * @returns Correlation coefficient (-1 to 1)
 */
function calculateCorrelationCoefficient(returns: Array<[number, number]>): number {
  if (returns.length === 0) return 0

  const n = returns.length

  // Calculate means
  const mean1 = returns.reduce((sum, [r1]) => sum + r1, 0) / n
  const mean2 = returns.reduce((sum, [, r2]) => sum + r2, 0) / n

  // Calculate covariance and standard deviations
  let covariance = 0
  let stdDev1 = 0
  let stdDev2 = 0

  for (const [r1, r2] of returns) {
    const diff1 = r1 - mean1
    const diff2 = r2 - mean2

    covariance += diff1 * diff2
    stdDev1 += diff1 * diff1
    stdDev2 += diff2 * diff2
  }

  covariance /= n
  stdDev1 = Math.sqrt(stdDev1 / n)
  stdDev2 = Math.sqrt(stdDev2 / n)

  // Calculate correlation
  if (stdDev1 === 0 || stdDev2 === 0) {
    return 0
  }

  return covariance / (stdDev1 * stdDev2)
}

/**
 * Classify correlation strength
 *
 * @param coefficient Correlation coefficient
 * @returns Strength classification
 */
function classifyCorrelationStrength(coefficient: number): CorrelationStrength {
  if (coefficient <= CORRELATION_THRESHOLDS.STRONG_NEGATIVE) {
    return 'Strong Negative'
  }
  if (coefficient <= CORRELATION_THRESHOLDS.WEAK_NEGATIVE) {
    return 'Weak Negative'
  }
  if (coefficient < CORRELATION_THRESHOLDS.WEAK_POSITIVE) {
    return 'None'
  }
  if (coefficient < CORRELATION_THRESHOLDS.STRONG_POSITIVE) {
    return 'Weak Positive'
  }
  return 'Strong Positive'
}

/**
 * Calculate significance (approximate p-value)
 *
 * @param sampleSize Sample size
 * @param coefficient Correlation coefficient
 * @returns Significance score (0-1, lower is more significant)
 */
function calculateSignificance(sampleSize: number, coefficient: number): number {
  // Approximate using t-statistic
  if (sampleSize <= 2) return 1

  const t = Math.abs(coefficient) * Math.sqrt((sampleSize - 2) / (1 - coefficient * coefficient))

  // Simple approximation for significance
  // Lower value = more significant
  return Math.max(0, 1 - t / 5)
}

// ============================================================================
// DIVERSIFICATION SCORE
// ============================================================================

/**
 * Calculate diversification score (0-100)
 *
 * @param correlations Correlation data
 * @returns Diversification score
 */
function calculateDiversificationScore(correlations: CorrelationEntry[]): number {
  if (correlations.length === 0) return 50

  // Average absolute correlation
  const avgCorrelation =
    correlations.reduce((sum, c) => sum + Math.abs(c.coefficient), 0) / correlations.length

  // Convert to diversification score
  // Lower correlation = higher diversification
  const score = Math.max(0, Math.min(100, (1 - avgCorrelation) * 100))

  return Math.round(score)
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * Generate correlation-based recommendations
 *
 * @param highlyCorrelated Highly correlated pairs
 * @param diversificationScore Diversification score
 * @returns Array of recommendations
 */
function generateCorrelationRecommendations(
  highlyCorrelated: Array<{
    symbol1: string
    symbol2: string
    coefficient: number
    risk: string
  }>,
  diversificationScore: number
): string[] {
  const recommendations: string[] = []

  // Diversification score recommendation
  if (diversificationScore >= 70) {
    recommendations.push(`✓ ความกระจายดีมาก (${diversificationScore}/100) พอร์ตfolioมี diversification ที่ดี`)
  } else if (diversificationScore >= 50) {
    recommendations.push(`✓ ความกระจายปานกลาง (${diversificationScore}/100) diversification อยู่ในเกณฑ์ดี`)
  } else if (diversificationScore >= 30) {
    recommendations.push(`⚠️ ความกระจายต่ำ (${diversificationScore}/100) ควรพิจารณาเพิ่มความหลากหลาย`)
  } else {
    recommendations.push(`⚠️ ความกระจายต่ำมาก (${diversificationScore}/100) พอร์ตfolioไม่กระจายความเสี่ยง`)
  }

  // Highly correlated pairs warning
  if (highlyCorrelated.length > 0) {
    const pairs = highlyCorrelated
      .slice(0, 3)
      .map(p => `${p.symbol1}-${p.symbol2}`)
      .join(', ')

    recommendations.push(
      `⚠️ พบความสัมพันธ์สูง: ${pairs} การถือครองพร้อมกันอาจเพิ่มความเสี่ยง`
    )
  }

  // Negative correlation recommendation
  recommendations.push(
    '💡 พิจารณาหลักทรัพย์ที่มีความสัมพันธ์ติดลบเพื่อลดความเสี่ยงโดยรวม'
  )

  return recommendations
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Quick correlation check between two symbols
 *
 * @param symbol1 First symbol
 * @param symbol2 Second symbol
 * @param days Historical period (default: 90)
 * @returns Correlation coefficient or null if failed
 */
export async function quickCorrelationCheck(
  symbol1: string,
  symbol2: string,
  days: number = 90
): Promise<{ coefficient: number; strength: CorrelationStrength } | null> {
  try {
    const result = await analyzeCorrelation({
      symbols: [symbol1, symbol2],
      period: days,
    })

    if (!result || result.correlations.length === 0) {
      return null
    }

    const correlation = result.correlations[0]
    return {
      coefficient: correlation.coefficient,
      strength: correlation.strength,
    }
  } catch {
    return null
  }
}
