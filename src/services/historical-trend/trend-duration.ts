/**
 * Trend Duration Analyzer
 *
 * Analyzes trend duration, phase, and strength for swing trading
 */

import type { PriceHistoryPoint } from '@/types/stock-price-api'
import type { MAData } from '@/types/technical-chart'
import type { TrendDirection, TrendPhase } from '@/types/swing-trading'

// ============================================================================
// TREND DURATION ANALYSIS
// ============================================================================

/**
 * Detect trend direction based on price vs moving averages
 *
 * @param price - Current price
 * @param ma20 - 20-day MA value
 * @param ma50 - 50-day MA value
 * @returns Trend direction
 */
function detectTrendDirection(
  price: number,
  ma20?: number,
  ma50?: number
): TrendDirection {
  // If no MAs available, cannot determine trend
  if (!ma20 && !ma50) {
    return 'sideways'
  }

  // Bullish: Price above MA20 and MA20 above MA50
  if (ma20 && ma50) {
    if (price > ma20 && ma20 > ma50) {
      return 'uptrend'
    }
    if (price < ma20 && ma20 < ma50) {
      return 'downtrend'
    }
  } else if (ma20) {
    // Only MA20 available
    if (price > ma20 * 1.02) {
      return 'uptrend'
    }
    if (price < ma20 * 0.98) {
      return 'downtrend'
    }
  }

  return 'sideways'
}

/**
 * Count days in current trend
 *
 * @param priceHistory - Historical price data
 * @param currentDirection - Current trend direction
 * @param maData - Moving average data
 * @returns Number of days in current trend
 */
function countTrendDays(
  priceHistory: PriceHistoryPoint[],
  currentDirection: TrendDirection,
  maData: { ma20?: MAData[]; ma50?: MAData[] }
): number {
  if (priceHistory.length < 2) {
    return 0
  }

  let trendDays = 0
  const ma20 = maData.ma20
  const ma50 = maData.ma50

  // Count backwards from the most recent data
  for (let i = priceHistory.length - 1; i >= 0; i--) {
    const price = priceHistory[i].close
    const currentMA20 = ma20?.[i]?.value
    const currentMA50 = ma50?.[i]?.value

    const dayDirection = detectTrendDirection(price, currentMA20, currentMA50)

    if (dayDirection === currentDirection) {
      trendDays++
    } else {
      // Trend changed or became sideways
      break
    }
  }

  return trendDays
}

/**
 * Determine trend phase based on duration
 *
 * - Early: 0-20 days (trend just started)
 * - Mature: 21-60 days (trend established)
 * - Exhausted: 61+ days (trend may be weakening)
 *
 * @param trendDays - Number of days in current trend
 * @param trendDirection - Current trend direction
 * @returns Trend phase
 */
function determineTrendPhase(
  trendDays: number,
  trendDirection: TrendDirection
): TrendPhase {
  if (trendDirection === 'sideways') {
    return 'mature'
  }

  if (trendDays <= 20) {
    return 'early'
  }

  if (trendDays <= 60) {
    return 'mature'
  }

  return 'exhausted'
}

/**
 * Calculate trend strength score (0-100)
 *
 * Factors:
 * - Price position relative to MAs
 * - MA alignment (MA20 vs MA50)
 * - Duration consistency
 *
 * @param priceHistory - Historical price data
 * @param trendDays - Days in current trend
 * @param maData - Moving average data
 * @param trendDirection - Current trend direction
 * @returns Strength score (0-100)
 */
function calculateTrendStrength(
  priceHistory: PriceHistoryPoint[],
  trendDays: number,
  maData: { ma20?: MAData[]; ma50?: MAData[] },
  trendDirection: TrendDirection
): number {
  if (priceHistory.length === 0) {
    return 0
  }

  let score = 0
  const currentPrice = priceHistory[priceHistory.length - 1].close
  const ma20 = maData.ma20?.[maData.ma20.length - 1]?.value
  const ma50 = maData.ma50?.[maData.ma50.length - 1]?.value

  // Factor 1: Price vs MA relationship (40 points max)
  if (ma20 && trendDirection === 'uptrend') {
    const diff = ((currentPrice - ma20) / ma20) * 100
    // Strong uptrend: price 3-8% above MA20
    if (diff >= 3 && diff <= 8) {
      score += 40
    } else if (diff >= 1 && diff < 3) {
      score += 30
    } else if (diff > 8) {
      score += 20 // Too extended, might be overbought
    } else if (diff > 0) {
      score += 10
    }
  } else if (ma20 && trendDirection === 'downtrend') {
    const diff = ((ma20 - currentPrice) / ma20) * 100
    // Strong downtrend: price 3-8% below MA20
    if (diff >= 3 && diff <= 8) {
      score += 40
    } else if (diff >= 1 && diff < 3) {
      score += 30
    } else if (diff > 8) {
      score += 20 // Too extended, might be oversold
    } else if (diff > 0) {
      score += 10
    }
  }

  // Factor 2: MA alignment (30 points max)
  if (ma20 && ma50) {
    const maDiff = ((ma20 - ma50) / ma50) * 100
    if (trendDirection === 'uptrend' && ma20 > ma50) {
      // Strong alignment: MA20 2-5% above MA50
      if (maDiff >= 2 && maDiff <= 5) {
        score += 30
      } else if (maDiff >= 1 && maDiff < 2) {
        score += 20
      } else if (maDiff > 5) {
        score += 25 // Strong but maybe extended
      } else if (maDiff > 0) {
        score += 10
      }
    } else if (trendDirection === 'downtrend' && ma20 < ma50) {
      const maDiff = ((ma50 - ma20) / ma50) * 100
      if (maDiff >= 2 && maDiff <= 5) {
        score += 30
      } else if (maDiff >= 1 && maDiff < 2) {
        score += 20
      } else if (maDiff > 5) {
        score += 25
      } else if (maDiff > 0) {
        score += 10
      }
    }
  }

  // Factor 3: Duration consistency (30 points max)
  // Early trends get full points for consistency
  // Mature/exhausted trends need more proof
  if (trendDays <= 20) {
    score += 30 // Early stage, benefit of doubt
  } else if (trendDays <= 60) {
    score += 25 // Mature, consistent
  } else if (trendDays <= 90) {
    score += 15 // Exhausted, weakening
  } else {
    score += 5 // Very long trend, high reversal risk
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Analyze trend duration, phase, and strength
 *
 * @param priceHistory - Historical price data
 * @param movingAverages - Moving average data
 * @returns Trend duration analysis
 */
export function analyzeTrendDuration(
  priceHistory: PriceHistoryPoint[],
  movingAverages: { ma20: MAData[]; ma50: MAData[] }
): {
  currentTrend: TrendDirection
  trendDays: number
  trendPhase: TrendPhase
  strength: number
} {
  if (priceHistory.length === 0) {
    return {
      currentTrend: 'sideways',
      trendDays: 0,
      trendPhase: 'mature',
      strength: 0,
    }
  }

  const currentPrice = priceHistory[priceHistory.length - 1].close
  const latestMA20 = movingAverages.ma20[movingAverages.ma20.length - 1]?.value
  const latestMA50 = movingAverages.ma50[movingAverages.ma50.length - 1]?.value

  // Detect current trend direction
  const currentTrend = detectTrendDirection(currentPrice, latestMA20, latestMA50)

  // Count days in current trend
  const trendDays = countTrendDays(priceHistory, currentTrend, {
    ma20: movingAverages.ma20,
    ma50: movingAverages.ma50,
  })

  // Determine trend phase
  const trendPhase = determineTrendPhase(trendDays, currentTrend)

  // Calculate trend strength
  const strength = calculateTrendStrength(
    priceHistory,
    trendDays,
    {
      ma20: movingAverages.ma20,
      ma50: movingAverages.ma50,
    },
    currentTrend
  )

  return {
    currentTrend,
    trendDays,
    trendPhase,
    strength,
  }
}
