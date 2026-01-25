/**
 * Volume Calculator Service
 *
 * Calculates volume-based metrics for market health analysis.
 * Volume is the "fuel" that drives price movements.
 *
 * Key Metrics:
 * - Volume Health: Today's volume vs historical average (0-100)
 * - VWAD: Volume-Weighted Advance/Decline for conviction measurement
 * - Concentration: Market diversification risk (0-100%)
 * - Relative Volume: Momentum identification (0-∞)
 */

import type {
  VolumeHealthData,
  VolumeHealthStatus,
  VolumeTrend,
  VWADData,
  ConvictionLevel,
  ConcentrationData,
  ConcentrationLevel,
  VWADInput,
  ConcentrationInput,
} from '@/types/volume'

/**
 * Mock 30-day average volume (millions THB)
 * TODO: Replace with historical data calculation when available
 */
const MOCK_30DAY_AVERAGE_VOLUME = 45000 // 45 billion THB

/**
 * Mock 30-day average per stock (millions THB)
 * TODO: Replace with stock-specific historical averages
 */
const MOCK_STOCK_AVERAGE_VOLUME = 1000 // 1 billion THB per stock

// ============================================================================
// VOLUME HEALTH CALCULATION
// ============================================================================

/**
 * Determine volume health status from health score
 * @param score - Health score (0-100)
 * @returns Health status classification
 */
function getHealthStatus(score: number): VolumeHealthStatus {
  if (score >= 90) return 'Explosive'
  if (score >= 70) return 'Strong'
  if (score >= 30) return 'Normal'
  return 'Anemic'
}

/**
 * Calculate volume health score
 * Formula: (current / average) × 50, capped at 100
 * @param currentVolume - Today's total volume in millions
 * @param averageVolume - 30-day average in millions
 * @returns Health score (0-100)
 */
function calculateHealthScore(
  currentVolume: number,
  averageVolume: number
): number {
  if (averageVolume <= 0) return 50 // Neutral if no average data

  const ratio = currentVolume / averageVolume
  const score = Math.min(100, Math.max(0, ratio * 50))
  return Math.round(score)
}

/**
 * Calculate volume trend based on recent comparison
 * @param currentVolume - Today's volume
 * @param previousVolume - Previous day's volume (5-day avg if available)
 * @returns Trend direction
 */
function calculateTrend(
  currentVolume: number,
  previousVolume?: number
): VolumeTrend {
  if (!previousVolume || previousVolume === 0) return 'Neutral'

  const changePercent = ((currentVolume - previousVolume) / previousVolume) * 100

  if (changePercent > 10) return 'Up'
  if (changePercent < -10) return 'Down'
  return 'Neutral'
}

/**
 * Calculate volume health metrics
 * @param currentVolume - Today's total volume in millions (THB)
 * @param averageVolume - 30-day average in millions (THB), defaults to mock value
 * @param previousVolume - Previous day's volume for trend calculation (optional)
 * @returns Volume health data
 */
export function calculateVolumeHealth(
  currentVolume: number,
  averageVolume: number = MOCK_30DAY_AVERAGE_VOLUME,
  previousVolume?: number
): VolumeHealthData {
  // Validate inputs
  const validatedCurrent = Math.max(0, currentVolume)
  const validatedAverage = Math.max(0, averageVolume)

  const healthScore = calculateHealthScore(validatedCurrent, validatedAverage)
  const healthStatus = getHealthStatus(healthScore)
  const trend = calculateTrend(validatedCurrent, previousVolume)

  return {
    currentVolume: validatedCurrent,
    averageVolume: validatedAverage,
    healthScore,
    healthStatus,
    trend,
  }
}

// ============================================================================
// 5-DAY AVERAGE VOLUME CALCULATION (Phase 1.1 Fix)
// ============================================================================

/**
 * Calculate average volume from historical volume array
 * Used as input for calculateVolumeHealth to get dynamic baseline
 *
 * @param historicalVolumes - Array of volume values in thousands
 * @returns Average volume in millions, or fallback to mock value if empty
 */
export function averageFromHistoricalVolumes(
  historicalVolumes: number[]
): number {
  if (!historicalVolumes || historicalVolumes.length === 0) {
    return MOCK_30DAY_AVERAGE_VOLUME // Fallback to mock value
  }

  // Convert from thousands to millions, then average
  const sum = historicalVolumes.reduce((acc, vol) => acc + vol, 0)
  return sum / historicalVolumes.length / 1000 // Convert to millions
}

// ============================================================================
// VWAD CALCULATION
// ============================================================================

/**
 * Determine conviction level from VWAD score
 * @param vwad - VWAD score (-100 to +100)
 * @returns Conviction level
 */
function getConvictionLevel(vwad: number): ConvictionLevel {
  if (vwad >= 30) return 'Bullish'
  if (vwad <= -30) return 'Bearish'
  return 'Neutral'
}

/**
 * Calculate VWAD (Volume-Weighted Advance/Decline)
 * Formula: ((upVolume - downVolume) / totalVolume) × 100
 * @param rankings - Array of stocks with change and volume
 * @returns VWAD data
 */
export function calculateVWAD(rankings: VWADInput[]): VWADData {
  if (!rankings || rankings.length === 0) {
    return {
      vwad: 0,
      conviction: 'Neutral',
      upVolume: 0,
      downVolume: 0,
      totalVolume: 0,
    }
  }

  // Separate volume by gainers and losers
  let upVolume = 0
  let downVolume = 0
  let totalVolume = 0

  for (const stock of rankings) {
    const volume = Math.max(0, stock.volume || 0)
    totalVolume += volume

    if (stock.change > 0) {
      upVolume += volume
    } else if (stock.change < 0) {
      downVolume += volume
    }
    // Flat stocks (change === 0) don't contribute to VWAD
  }

  // Calculate VWAD score (-100 to +100)
  let vwad = 0
  if (totalVolume > 0) {
    vwad = ((upVolume - downVolume) / totalVolume) * 100
  }

  const conviction = getConvictionLevel(vwad)

  return {
    vwad: Math.round(vwad * 100) / 100, // Round to 2 decimal places
    conviction,
    upVolume: Math.round(upVolume),
    downVolume: Math.round(downVolume),
    totalVolume: Math.round(totalVolume),
  }
}

// ============================================================================
// CONCENTRATION CALCULATION
// ============================================================================

/**
 * Determine concentration level from concentration percentage
 * @param concentration - Concentration percentage (0-100)
 * @returns Concentration risk level
 */
function getConcentrationLevel(concentration: number): ConcentrationLevel {
  if (concentration >= 40) return 'Risky'
  if (concentration >= 25) return 'Normal'
  return 'Healthy'
}

/**
 * Calculate market concentration
 * Measures how much volume is concentrated in top 5 stocks vs top 30
 * @param rankings - Array of stocks with volume data
 * @returns Concentration data
 */
export function calculateConcentration(rankings: ConcentrationInput[]): ConcentrationData {
  if (!rankings || rankings.length === 0) {
    return {
      top5Volume: 0,
      totalVolume: 0,
      concentration: 0,
      concentrationLevel: 'Healthy',
    }
  }

  // Sort by volume descending
  const sorted = [...rankings]
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))

  // Get top 5 volume
  const top5 = sorted.slice(0, 5)
  const top5Volume = top5.reduce((sum, stock) => sum + (stock.volume || 0), 0)

  // Get top 30 volume (or all if less than 30)
  const top30 = sorted.slice(0, 30)
  const totalVolume = top30.reduce((sum, stock) => sum + (stock.volume || 0), 0)

  // Calculate concentration percentage
  let concentration = 0
  if (totalVolume > 0) {
    concentration = (top5Volume / totalVolume) * 100
  }

  const concentrationLevel = getConcentrationLevel(concentration)

  return {
    top5Volume: Math.round(top5Volume),
    totalVolume: Math.round(totalVolume),
    concentration: Math.round(concentration * 100) / 100, // Round to 2 decimal places
    concentrationLevel,
  }
}

// ============================================================================
// RELATIVE VOLUME CALCULATION
// ============================================================================

/**
 * Calculate relative volume for a single stock
 * Formula: stockVolume / stockAverage
 * @param stockVolume - Current stock volume in millions
 * @param stockAverage - 30-day average volume in millions
 * @returns Relative volume ratio (0-∞)
 */
export function calculateRelativeVolume(
  stockVolume: number,
  stockAverage: number = MOCK_STOCK_AVERAGE_VOLUME
): number {
  if (stockAverage <= 0) return 1 // No data, return neutral

  const relativeVolume = stockVolume / stockAverage
  return Math.round(relativeVolume * 100) / 100 // Round to 2 decimal places
}

// ============================================================================
// BATCH CALCULATIONS
// ============================================================================

/**
 * Calculate relative volume for multiple stocks
 * @param stocks - Array of stocks with current volume
 * @param stockAverages - Map of symbol to average volume (optional, uses mock if not provided)
 * @returns Map of symbol to relative volume
 */
export function calculateBatchRelativeVolume(
  stocks: Array<{ symbol: string; volume: number }>,
  stockAverages?: Map<string, number>
): Map<string, number> {
  const result = new Map<string, number>()

  for (const stock of stocks) {
    const average = stockAverages?.get(stock.symbol) || MOCK_STOCK_AVERAGE_VOLUME
    const relativeVolume = calculateRelativeVolume(stock.volume, average)
    result.set(stock.symbol, relativeVolume)
  }

  return result
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert volume from thousands to millions
 * RTDB stores volume in thousands, we calculate in millions
 * @param volumeInThousands - Volume in thousands
 * @returns Volume in millions
 */
export function thousandsToMillions(volumeInThousands: number): number {
  return volumeInThousands / 1000
}

/**
 * Convert volume from millions to thousands
 * @param volumeInMillions - Volume in millions
 * @returns Volume in thousands
 */
export function millionsToThousands(volumeInMillions: number): number {
  return Math.round(volumeInMillions * 1000)
}

/**
 * Format volume for display (e.g., "42.50B", "1.20T")
 * All values formatted to 2 decimal places for consistency
 * @param volumeInMillions - Volume in millions
 * @returns Formatted volume string
 */
export function formatVolume(volumeInMillions: number): string {
  if (volumeInMillions >= 1000000) {
    // Trillions
    return `${(volumeInMillions / 1000000).toFixed(2)}T`
  }
  if (volumeInMillions >= 1000) {
    // Billions
    return `${(volumeInMillions / 1000).toFixed(2)}B`
  }
  // Millions
  return `${volumeInMillions.toFixed(2)}M`
}
