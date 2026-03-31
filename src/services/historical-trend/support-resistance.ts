/**
 * Support/Resistance Detector
 *
 * Detects and validates support/resistance levels for swing trading
 * Extends existing technical-indicators.ts functionality
 */

import type { PriceHistoryPoint } from '@/types/stock-price-api'
import type { SupportResistanceLevel } from '@/types/technical-chart'
import { calculateSupportResistance } from '@/lib/technical-indicators'

// ============================================================================
// SUPPORT/RESISTANCE DETECTION
// ============================================================================

/**
 * Get nearest support level
 *
 * @param levels - Support levels (sorted by price, descending)
 * @param currentPrice - Current market price
 * @returns Nearest support level or null
 */
export function getNearestSupport(
  levels: SupportResistanceLevel[],
  currentPrice: number
): SupportResistanceLevel | null {
  // Filter support levels below current price
  const validSupports = levels.filter((level) => level.price < currentPrice)

  if (validSupports.length === 0) {
    return null
  }

  // Find nearest (highest price below current)
  return validSupports.reduce((nearest, level) => {
    if (!nearest || level.price > nearest.price) {
      return level
    }
    return nearest
  }, null as SupportResistanceLevel | null)
}

/**
 * Get nearest resistance level
 *
 * @param levels - Resistance levels (sorted by price, ascending)
 * @param currentPrice - Current market price
 * @returns Nearest resistance level or null
 */
export function getNearestResistance(
  levels: SupportResistanceLevel[],
  currentPrice: number
): SupportResistanceLevel | null {
  // Filter resistance levels above current price
  const validResistances = levels.filter((level) => level.price > currentPrice)

  if (validResistances.length === 0) {
    return null
  }

  // Find nearest (lowest price above current)
  return validResistances.reduce((nearest, level) => {
    if (!nearest || level.price < nearest.price) {
      return level
    }
    return nearest
  }, null as SupportResistanceLevel | null)
}

/**
 * Calculate support/resistance strength score (0-100)
 *
 * Factors:
 * - Number of touches
 * - Time since last touch
 * - Strength classification (strong/moderate/weak)
 *
 * @param level - Support/resistance level
 * @param currentDate - Current date string
 * @returns Strength score (0-100)
 */
export function calculateLevelStrength(
  level: SupportResistanceLevel,
  currentDate: string
): number {
  let score = 0

  // Base score from strength classification
  switch (level.strength) {
    case 'strong':
      score += 50
      break
    case 'moderate':
      score += 35
      break
    case 'weak':
      score += 20
      break
  }

  // Touch count bonus (up to 30 points)
  const touchBonus = Math.min(30, level.touches * 10)
  score += touchBonus

  // Recency bonus (up to 20 points)
  if (level.lastTouchDate) {
    const daysSinceTouch = getDaysBetween(level.lastTouchDate, currentDate)
    if (daysSinceTouch <= 5) {
      score += 20 // Recently tested
    } else if (daysSinceTouch <= 15) {
      score += 15
    } else if (daysSinceTouch <= 30) {
      score += 10
    } else if (daysSinceTouch <= 60) {
      score += 5
    }
    // Older than 60 days: no recency bonus
  }

  return Math.min(100, score)
}

/**
 * Get days between two dates (YYYY-MM-DD format)
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days (absolute value)
 */
function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Detect support/resistance levels with custom settings
 *
 * @param priceHistory - Historical price data
 * @param lookback - Lookback period for pivot detection (default: 5)
 * @param priceThreshold - Price grouping threshold % (default: 0.02)
 * @param minTouches - Minimum touches to include (default: 2)
 * @returns Support and resistance levels
 */
export function detectSupportResistanceLevels(
  priceHistory: PriceHistoryPoint[],
  lookback: number = 5,
  priceThreshold: number = 0.02,
  minTouches: number = 2
): {
  support: SupportResistanceLevel[]
  resistance: SupportResistanceLevel[]
} {
  // Use existing function from technical-indicators.ts
  const result = calculateSupportResistance(
    priceHistory,
    lookback,
    priceThreshold
  )

  // Filter by minimum touches
  const filteredSupport = result.support.filter(
    (level) => level.touches >= minTouches
  )
  const filteredResistance = result.resistance.filter(
    (level) => level.touches >= minTouches
  )

  return {
    support: filteredSupport,
    resistance: filteredResistance,
  }
}

/**
 * Get distance to nearest level as percentage
 *
 * @param currentPrice - Current market price
 * @param level - Support/resistance level
 * @returns Distance as percentage
 */
export function getDistancePercentage(
  currentPrice: number,
  level: SupportResistanceLevel
): number {
  return ((level.price - currentPrice) / currentPrice) * 100
}

/**
 * Validate if price is near support/resistance level
 *
 * @param currentPrice - Current market price
 * @param level - Support/resistance level
 * @param threshold - Distance threshold % (default: 2%)
 * @returns Whether price is near the level
 */
export function isPriceNearLevel(
  currentPrice: number,
  level: SupportResistanceLevel,
  threshold: number = 2
): boolean {
  const distance = Math.abs(getDistancePercentage(currentPrice, level))
  return distance <= threshold
}

/**
 * Get trading range from nearest support and resistance
 *
 * @param support - Nearest support level
 * @param resistance - Nearest resistance level
 * @returns Trading range or null
 */
export function getTradingRange(
  support: SupportResistanceLevel | null,
  resistance: SupportResistanceLevel | null
): { lower: number; upper: number; width: number } | null {
  if (!support || !resistance) {
    return null
  }

  const lower = support.price
  const upper = resistance.price
  const width = ((upper - lower) / lower) * 100

  return { lower, upper, width }
}
