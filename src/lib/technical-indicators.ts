/**
 * Technical Indicators Calculator
 *
 * Utility functions for calculating trading indicators
 */

import type {
  PriceHistoryPoint,
  MAData,
  SupportResistanceLevel,
  VolumeDataPoint,
} from '@/types/technical-chart'

// ============================================================================
// MOVING AVERAGE CALCULATION
// ============================================================================

/**
 * Calculate Simple Moving Average (SMA)
 *
 * @param data - Price history data
 * @param period - MA period (e.g., 20, 50, 200)
 * @returns Array of MA data points
 */
export function calculateSMA(
  data: PriceHistoryPoint[],
  period: number
): MAData[] {
  const result: MAData[] = []

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    result.push({
      date: data[i].date,
      value: sum / period,
    })
  }

  return result
}

/**
 * Calculate Exponential Moving Average (EMA)
 *
 * @param data - Price history data
 * @param period - EMA period
 * @returns Array of EMA data points
 */
export function calculateEMA(
  data: PriceHistoryPoint[],
  period: number
): MAData[] {
  if (data.length < period) return []

  const result: MAData[] = []
  const multiplier = 2 / (period + 1)

  // Start with SMA for first EMA value
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i].close
  }
  let ema = sum / period

  result.push({
    date: data[period - 1].date,
    value: ema,
  })

  // Calculate subsequent EMA values
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema
    result.push({
      date: data[i].date,
      value: ema,
    })
  }

  return result
}

// ============================================================================
// SUPPORT/RESISTANCE CALCULATION
// ============================================================================

interface PivotCandidate {
  price: number
  date: string
  type: 'high' | 'low'
}

/**
 * Find pivot points (local highs and lows)
 */
function findPivotPoints(
  data: PriceHistoryPoint[],
  lookback: number = 5
): PivotCandidate[] {
  const pivots: PivotCandidate[] = []

  for (let i = lookback; i < data.length - lookback; i++) {
    const current = data[i]
    let isHigh = true
    let isLow = true

    // Check if current point is a local high
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j === i) continue
      if (data[j].high >= current.high) isHigh = false
      if (data[j].low <= current.low) isLow = false
    }

    if (isHigh) {
      pivots.push({ price: current.high, date: current.date, type: 'high' })
    }
    if (isLow) {
      pivots.push({ price: current.low, date: current.date, type: 'low' })
    }
  }

  return pivots
}

/**
 * Group nearby price levels
 */
function groupPriceLevels(
  pivots: PivotCandidate[],
  threshold: number = 0.02 // 2% threshold
): Map<number, PivotCandidate[]> {
  const groups = new Map<number, PivotCandidate[]>()

  for (const pivot of pivots) {
    let found = false

    for (const [groupPrice, groupPivots] of groups) {
      const diff = Math.abs(pivot.price - groupPrice) / groupPrice
      if (diff <= threshold) {
        groupPivots.push(pivot)
        found = true
        break
      }
    }

    if (!found) {
      groups.set(pivot.price, [pivot])
    }
  }

  return groups
}

/**
 * Calculate Support and Resistance Levels
 *
 * @param data - Price history data
 * @param lookback - Lookback period for pivot detection
 * @param priceThreshold - Price grouping threshold (percentage)
 * @returns Support and resistance levels
 */
export function calculateSupportResistance(
  data: PriceHistoryPoint[],
  lookback: number = 5,
  priceThreshold: number = 0.02
): { support: SupportResistanceLevel[]; resistance: SupportResistanceLevel[] } {
  const pivots = findPivotPoints(data, lookback)
  const highPivots = pivots.filter((p) => p.type === 'high')
  const lowPivots = pivots.filter((p) => p.type === 'low')

  const highGroups = groupPriceLevels(highPivots, priceThreshold)
  const lowGroups = groupPriceLevels(lowPivots, priceThreshold)

  // Current price for determining proximity
  const currentPrice = data[data.length - 1].close

  // Build resistance levels
  const resistance: SupportResistanceLevel[] = Array.from(highGroups.entries())
    .filter(([price]) => price > currentPrice)
    .sort((a, b) => a[0] - b[0])
    .slice(0, 5) // Top 5 resistance levels
    .map(([price, touches]) => {
      const strength = touches.length >= 3 ? 'strong' : touches.length >= 2 ? 'moderate' : 'weak'
      return {
        price,
        type: 'resistance',
        strength,
        touches: touches.length,
        lastTouchDate: touches[touches.length - 1]?.date,
      }
    })

  // Build support levels
  const support: SupportResistanceLevel[] = Array.from(lowGroups.entries())
    .filter(([price]) => price < currentPrice)
    .sort((a, b) => b[0] - a[0])
    .slice(0, 5) // Top 5 support levels
    .map(([price, touches]) => {
      const strength = touches.length >= 3 ? 'strong' : touches.length >= 2 ? 'moderate' : 'weak'
      return {
        price,
        type: 'support',
        strength,
        touches: touches.length,
        lastTouchDate: touches[touches.length - 1]?.date,
      }
    })

  return { support, resistance }
}

// ============================================================================
// VOLUME DATA PROCESSING
// ============================================================================

/**
 * Process volume data with up/down coloring
 *
 * @param data - Price history data
 * @returns Volume data points with color indicator
 */
export function processVolumeData(
  data: PriceHistoryPoint[]
): VolumeDataPoint[] {
  return data.map((point) => ({
    date: point.date,
    volume: point.volume,
    isUp: point.close >= point.open,
  }))
}

// ============================================================================
// ATR CALCULATION
// ============================================================================

/**
 * Calculate Average True Range (ATR)
 *
 * @param data - Price history data
 * @param period - ATR period (default: 14)
 * @returns ATR value
 */
export function calculateATR(
  data: PriceHistoryPoint[],
  period: number = 14
): number {
  if (data.length < period + 1) return 0

  const trueRanges: number[] = []

  for (let i = 1; i < data.length; i++) {
    const current = data[i]
    const previous = data[i - 1]

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    )
    trueRanges.push(tr)
  }

  // Average of last 'period' true ranges
  const recentTRs = trueRanges.slice(-period)
  return recentTRs.reduce((a, b) => a + b, 0) / recentTRs.length
}

/**
 * Calculate ATR-based Stop Loss
 *
 * @param entryPrice - Entry price
 * @param atr - ATR value
 * @param multiplier - ATR multiplier (default: 2)
 * @returns Stop loss price
 */
export function calculateATRStopLoss(
  entryPrice: number,
  atr: number,
  multiplier: number = 2
): number {
  return entryPrice - (atr * multiplier)
}

/**
 * Calculate Take Profit levels based on Risk:Reward ratio
 *
 * @param entryPrice - Entry price
 * @param stopLoss - Stop loss price
 * @returns Array of take profit prices [TP1, TP2, TP3]
 */
export function calculateTakeProfitLevels(
  entryPrice: number,
  stopLoss: number
): { tp1: number; tp2: number; tp3: number } {
  const risk = entryPrice - stopLoss

  return {
    tp1: entryPrice + risk * 1.5, // 1:1.5 R:R
    tp2: entryPrice + risk * 3,   // 1:3 R:R
    tp3: entryPrice + risk * 5,   // 1:5 R:R
  }
}

// ============================================================================
// TRADING LEVEL CALCULATION
// ============================================================================

/**
 * Suggest entry point based on support level
 */
export function suggestEntryPoint(
  supportLevels: SupportResistanceLevel[]
): number | null {
  if (supportLevels.length === 0) return null

  const nearestSupport = supportLevels[0] // Already sorted by price

  // Entry at slight premium above support (2%)
  return nearestSupport.price * 1.02
}

/**
 * Calculate stop loss level (hybrid: ATR + Support)
 */
export function calculateStopLoss(
  entryPrice: number,
  atr: number,
  supportLevel?: number,
  riskPercentage: number = 0.08
): number {
  const atrBasedSL = calculateATRStopLoss(entryPrice, atr, 2)

  if (supportLevel) {
    const supportBasedSL = supportLevel * 0.98 // 2% below support
    return Math.max(atrBasedSL, supportBasedSL)
  }

  // Percentage-based fallback
  return Math.max(atrBasedSL, entryPrice * (1 - riskPercentage))
}
