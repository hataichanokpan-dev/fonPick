/**
 * Volume Analysis Types
 *
 * Types for volume-based market health indicators.
 * Volume is the "fuel" that drives price movements - without volume analysis,
 * investors see price action but miss the conviction behind it.
 */

/**
 * Volume health status classification
 */
export type VolumeHealthStatus = 'Anemic' | 'Normal' | 'Strong' | 'Explosive'

/**
 * Volume trend direction
 */
export type VolumeTrend = 'Up' | 'Down' | 'Neutral'

/**
 * Conviction level for VWAD analysis
 */
export type ConvictionLevel = 'Bullish' | 'Bearish' | 'Neutral'

/**
 * Concentration risk level
 */
export type ConcentrationLevel = 'Healthy' | 'Normal' | 'Risky'

/**
 * Volume health data
 * Measures today's volume vs historical average
 */
export interface VolumeHealthData {
  /** Today's total volume in millions (THB) */
  currentVolume: number
  /** 30-day average in millions (THB) */
  averageVolume: number
  /** Health score from 0-100 */
  healthScore: number
  /** Health status classification */
  healthStatus: VolumeHealthStatus
  /** Trend based on 5-day comparison */
  trend: VolumeTrend
}

/**
 * VWAD (Volume-Weighted Advance/Decline) data
 * Reveals market conviction by analyzing volume distribution
 */
export interface VWADData {
  /** Volume-Weighted Advance/Decline (-100 to +100) */
  vwad: number
  /** Conviction level based on VWAD */
  conviction: ConvictionLevel
  /** Sum of volume for gainers (millions THB) */
  upVolume: number
  /** Sum of volume for losers (millions THB) */
  downVolume: number
  /** Total volume analyzed (millions THB) */
  totalVolume: number
}

/**
 * Concentration data
 * Measures market diversification risk
 */
export interface ConcentrationData {
  /** Volume of top 5 stocks (millions THB) */
  top5Volume: number
  /** Total volume of top 30 stocks (millions THB) */
  totalVolume: number
  /** Concentration percentage (0-100) */
  concentration: number
  /** Concentration risk level */
  concentrationLevel: ConcentrationLevel
}

/**
 * Volume leader data
 */
export interface VolumeLeader {
  /** Stock symbol */
  symbol: string
  /** Volume in millions (THB) */
  volume: number
  /** Relative volume ratio (vs 30-day average) */
  relativeVolume: number
  /** Price change percentage */
  priceChange: number
}

/**
 * Complete volume analysis data
 * Aggregates all volume metrics for comprehensive analysis
 */
export interface VolumeAnalysisData {
  /** Volume health metrics */
  health: VolumeHealthData
  /** VWAD conviction metrics */
  vwad: VWADData
  /** Concentration risk metrics */
  concentration: ConcentrationData
  /** Top 5 volume leaders */
  volumeLeaders: VolumeLeader[]
  /** Analysis timestamp */
  timestamp: number
}

/**
 * Input type for VWAD calculation
 */
export interface VWADInput {
  /** Price change percentage */
  change: number
  /** Volume in millions (THB) */
  volume: number
}

/**
 * Input type for concentration calculation
 */
export interface ConcentrationInput {
  /** Volume in millions (THB) */
  volume: number
}

/**
 * Input type for volume leaders identification
 */
export interface VolumeLeaderInput {
  /** Stock symbol */
  symbol: string
  /** Volume in millions (THB) */
  volume: number
  /** Price change percentage */
  change: number
}
