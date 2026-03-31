/**
 * Swing Trading Types
 *
 * Types for 30-90 day swing trading features
 * Target return: 20%++
 */

import type { PriceHistoryPoint } from './stock-price-api'
import type { MAData, SupportResistanceLevel } from './technical-chart'

// Re-export for convenience
export type { PriceHistoryPoint, MAData, SupportResistanceLevel }

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Swing trading horizon (target holding period in days)
 */
export type SwingHorizon = 30 | 60 | 90

/**
 * Swing trading verdict type
 */
export type SwingVerdictType = 'Strong Buy' | 'Buy' | 'Wait' | 'Avoid'

/**
 * Trend phase classification
 * - early: Trend just started, high potential
 * - mature: Trend established, moderate potential
 * - exhausted: Trend weakening, late entry risk
 */
export type TrendPhase = 'early' | 'mature' | 'exhausted'

/**
 * Trend direction
 */
export type TrendDirection = 'uptrend' | 'downtrend' | 'sideways'

/**
 * Trend quality assessment
 */
export type TrendQuality = 'excellent' | 'good' | 'fair' | 'poor'

/**
 * Timing assessment for entry
 */
export type EntryTiming = 'optimal' | 'good' | 'wait' | 'poor'

/**
 * Pattern type for smart money flow
 */
export type SmartMoneyPattern = 'accumulation' | 'distribution' | 'divergence' | 'neutral'

/**
 * Pattern sustainability level
 */
export type SustainabilityLevel = 'high' | 'medium' | 'low'

// ============================================================================
// HISTORICAL TREND ANALYSIS
// ============================================================================

/**
 * Data quality metrics for historical analysis
 */
export interface DataQualityMetrics {
  /** Percentage of complete data (0-100) */
  completeness: number
  /** Whether there's enough data for analysis (min 60 days) */
  hasEnoughData: boolean
  /** Missing dates in the period (if any) */
  missingDates: string[]
}

/**
 * Trend duration and phase analysis
 */
export interface TrendDurationAnalysis {
  /** Current trend direction */
  direction: TrendDirection
  /** Number of days in current trend */
  duration: number
  /** Trend phase classification */
  phase: TrendPhase
  /** Trend strength score (0-100) */
  strength: number
}

/**
 * Momentum sustainability analysis
 */
export interface MomentumAnalysis {
  /** Sustainability score (0-100) */
  sustainabilityScore: number
  /** Whether momentum is accelerating */
  isAccelerating: boolean
  /** Whether momentum is decelerating */
  isDecelerating: boolean
}

/**
 * Support and resistance levels with strength
 */
export interface PriceLevels {
  support: SupportResistanceLevel[]
  resistance: SupportResistanceLevel[]
}

/**
 * Historical trend period information
 */
export interface TrendPeriod {
  /** Start date (YYYY-MM-DD) */
  start: string
  /** End date (YYYY-MM-DD) */
  end: string
  /** Number of days in period */
  days: number
}

/**
 * Complete historical trend analysis
 */
export interface HistoricalTrendAnalysis {
  /** Stock symbol */
  symbol: string
  /** Analysis period */
  period: TrendPeriod
  /** Historical price data */
  priceHistory: PriceHistoryPoint[]
  /** Moving averages (20, 50, 200 day) */
  movingAverages: {
    ma20: MAData[]
    ma50: MAData[]
    ma200: MAData[]
  }
  /** Trend duration and phase */
  trend: TrendDurationAnalysis
  /** Momentum sustainability */
  momentum: MomentumAnalysis
  /** Support and resistance levels */
  levels: PriceLevels
  /** Data quality metrics */
  dataQuality: DataQualityMetrics
}

// ============================================================================
// SWING TRADING VERDICT
// ============================================================================

/**
 * Entry zone with price range
 */
export interface EntryZone {
  /** Maximum price to enter */
  min: number
  /** Maximum price to enter (ideal entry) */
  max: number
  /** Current market price */
  current: number
}

/**
 * Entry plan with rationale
 */
export interface EntryPlan {
  /** Entry price zone */
  zone: EntryZone
  /** Discount from current price (%) */
  discountFromCurrent: number
  /** Explanation of entry zone */
  rationale: string
}

/**
 * Stop loss level with rationale
 */
export interface StopLoss {
  /** Stop loss price */
  price: number
  /** Percentage from entry */
  percentFromEntry: number
  /** Explanation of stop loss placement */
  rationale: string
}

/**
 * Take profit target level
 */
export interface TakeProfitLevel {
  /** Target level (1, 2, or 3) */
  level: 1 | 2 | 3
  /** Target price */
  price: number
  /** Percentage gain from entry */
  percentFromEntry: number
}

/**
 * Exit plan with stop loss and take profit levels
 */
export interface ExitPlan {
  /** Stop loss level */
  stopLoss: StopLoss
  /** Take profit targets (1-3) */
  takeProfits: TakeProfitLevel[]
  /** Risk-reward ratio (e.g., "1:2.5") */
  riskRewardRatio: string
}

/**
 * Position sizing recommendation
 */
export interface PositionSizing {
  /** Position size as % of portfolio */
  percentage: number
  /** Risk amount in currency */
  riskAmount: number
  /** Explanation of position size */
  rationale: string
}

/**
 * Swing trading analysis summary
 */
export interface SwingAnalysis {
  /** Trend quality assessment */
  trendQuality: TrendQuality
  /** Trend sustainability score (0-100) */
  trendSustainability: number
  /** Entry timing assessment */
  timing: EntryTiming
  /** Key factors influencing the verdict */
  keyFactors: string[]
}

/**
 * Time estimate for holding period
 */
export interface TimeEstimate {
  /** Minimum holding days */
  minDays: number
  /** Maximum holding days */
  maxDays: number
  /** Explanation of time estimate */
  rationale: string
}

/**
 * Complete swing trading verdict
 */
export interface SwingVerdict {
  /** Stock symbol */
  symbol: string
  /** Target holding period (30, 60, or 90 days) */
  horizon: SwingHorizon
  /** Buy/Sell recommendation */
  verdict: SwingVerdictType
  /** Confidence level */
  confidence: 'High' | 'Medium' | 'Low'
  /** Entry plan */
  entry: EntryPlan
  /** Exit plan */
  exit: ExitPlan
  /** Position sizing */
  position: PositionSizing
  /** Analysis summary */
  analysis: SwingAnalysis
  /** Time estimate */
  timeEstimate: TimeEstimate
  /** Unix timestamp of verdict */
  timestamp: number
  /** Data quality score (0-100) */
  dataQuality: number
  /** Optional confirmation analysis from Phase 3 */
  confirmation?: ConfirmationAnalysis
}

// ============================================================================
// MULTI-DAY SMART MONEY ANALYSIS
// ============================================================================

/**
 * Daily smart money flow data point
 */
export interface DailySmartMoneyFlow {
  /** Date (YYYY-MM-DD) */
  date: string
  /** Net foreign flow */
  foreignNet: number
  /** Net institutional flow */
  institutionNet: number
  /** Combined smart money flow */
  smartMoneyNet: number
  /** Signal for this day */
  signal: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell'
}

/**
 * Pattern detection result
 */
export interface PatternDetection {
  /** Pattern type detected */
  type: SmartMoneyPattern
  /** Number of consecutive days */
  consecutiveDays: number
  /** Total flow amount */
  totalFlow: number
  /** Sustainability level */
  sustainability: SustainabilityLevel
}

/**
 * Confirmation status
 */
export interface ConfirmationStatus {
  /** Whether pattern is confirmed */
  isConfirmed: boolean
  /** Confidence score (0-100) */
  confidence: number
  /** Explanation of confirmation */
  rationale: string
}

/**
 * Multi-day smart money flow analysis
 */
export interface MultiDaySmartMoneyAnalysis {
  /** Stock symbol */
  symbol: string
  /** Analysis period */
  period: TrendPeriod
  /** Daily breakdown */
  daily: DailySmartMoneyFlow[]
  /** Pattern detection */
  pattern: PatternDetection
  /** Confirmation status */
  confirmation: ConfirmationStatus
}

// ============================================================================
// CONFIRMATION ANALYSIS
// ============================================================================

/**
 * Confirmation source type
 */
export type ConfirmationSource =
  | 'smart-money'
  | 'sector-rotation'
  | 'trend-maturity'
  | 'volume'

/**
 * Individual signal confirmation
 */
export interface SignalConfirmation {
  /** Source of this confirmation */
  source: ConfirmationSource
  /** Whether signal is confirmed */
  isConfirmed: boolean
  /** Confidence score (0-100) */
  confidence: number
  /** Weight in overall calculation (0-1) */
  weight: number
  /** Explanation */
  rationale: string
}

/**
 * Overall confirmation analysis
 */
export interface ConfirmationAnalysis {
  /** Overall confirmation status */
  isConfirmed: boolean
  /** Overall confidence score (0-100) */
  overallConfidence: number
  /** Individual confirmations */
  confirmations: SignalConfirmation[]
  /** Confirmed sources count */
  confirmedCount: number
  /** Total sources count */
  totalSources: number
  /** Final recommendation */
  recommendation: 'Strong Entry' | 'Entry' | 'Wait' | 'Avoid Entry'
  /** Timestamp */
  timestamp: number
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Historical trend request parameters
 */
export interface HistoricalTrendRequest {
  /** Stock symbol */
  symbol: string
  /** Number of days to analyze */
  days: 5 | 10 | 30 | 60 | 90
}

/**
 * Historical trend API response
 */
export interface HistoricalTrendResponse {
  /** Success status */
  success: boolean
  /** Analysis data */
  data?: HistoricalTrendAnalysis
  /** Error message (if failed) */
  error?: string
  /** Response metadata */
  meta?: {
    timestamp: number
    processingTime: number
    cacheStatus: 'hit' | 'miss'
  }
}

/**
 * Swing trading verdict request parameters
 */
export interface SwingVerdictRequest {
  /** Stock symbol */
  symbol: string
  /** Target holding period */
  horizon: SwingHorizon
  /** Include confirmation analysis */
  includeConfirmation?: boolean
}

/**
 * Swing trading verdict API response
 */
export interface SwingVerdictResponse {
  /** Success status */
  success: boolean
  /** Verdict data */
  data?: SwingVerdict
  /** Error message (if failed) */
  error?: string
  /** Response metadata */
  meta?: {
    timestamp: number
    processingTime: number
    cacheStatus: 'hit' | 'miss'
  }
}

// ============================================================================
// CALCULATOR INPUT/OUTPUT TYPES
// ============================================================================

/**
 * Entry zone calculator input
 */
export interface EntryCalculatorInput {
  /** Current market price */
  currentPrice: number
  /** Support levels */
  supportLevels: SupportResistanceLevel[]
  /** Moving averages */
  movingAverages: {
    ma20?: number
    ma50?: number
  }
  /** Trend phase */
  trendPhase: TrendPhase
}

/**
 * Entry zone calculator output
 */
export interface EntryCalculatorOutput {
  /** Entry price zone */
  entryZone: {
    min: number
    max: number
    current: number
  }
  /** Discount from current price (%) */
  discountPercent: number
  /** Confidence score (0-100) */
  confidence: number
  /** Explanation */
  rationale: string
}

/**
 * Exit levels calculator input
 */
export interface ExitCalculatorInput {
  /** Entry price */
  entryPrice: number
  /** Target return (e.g., 0.20 for 20%) */
  targetReturn: number
  /** Support level (optional) */
  supportLevel?: number
  /** Resistance level (optional) */
  resistanceLevel?: number
  /** Average True Range (optional) */
  atr?: number
}

/**
 * Exit levels calculator output
 */
export interface ExitCalculatorOutput {
  /** Stop loss level */
  stopLoss: {
    price: number
    percentFromEntry: number
    rationale: string
  }
  /** Take profit targets */
  takeProfits: Array<{
    level: 1 | 2 | 3
    price: number
    percentFromEntry: number
    label: string
  }>
  /** Risk-reward ratio */
  riskRewardRatio: string
}

/**
 * Position size calculator input
 */
export interface PositionSizeCalculatorInput {
  /** Entry price */
  entryPrice: number
  /** Stop loss price */
  stopLoss: number
  /** Risk per trade as % (default: 0.02 for 2%) */
  riskPerTrade?: number
  /** Total account/portfolio value */
  accountValue?: number
}

/**
 * Position size calculator output
 */
export interface PositionSizeCalculatorOutput {
  /** Position size as % of portfolio */
  percentage: number
  /** Number of shares */
  shares: number
  /** Risk amount */
  riskAmount: number
  /** Explanation */
  rationale: string
}

// ============================================================================
// CATALYST-AWARE ENTRY TYPES
// ============================================================================

/**
 * Upcoming catalyst event with timing
 */
export interface UpcomingCatalyst {
  /** Catalyst description */
  description: string
  /** Days until catalyst (0 = today, negative = passed) */
  daysUntil: number
  /** Estimated date of catalyst */
  estimatedDate?: Date
}

/**
 * Catalyst adjustment for entry calculation
 */
export interface CatalystAdjustment {
  /** Upcoming catalysts sorted by date */
  upcomingCatalysts: UpcomingCatalyst[]
  /** Days until nearest catalyst */
  daysUntilNearest: number | null
  /** Whether all catalysts have passed */
  allCatalystsPassed: boolean
  /** Catalyst score (0-10) */
  catalystScore: number
  /** Recommendation based on catalyst */
  recommendation: string
  /** Whether to accelerate entry */
  shouldAccelerate: boolean
}

/**
 * Catalyst-aware entry calculator input
 */
export interface CatalystAwareEntryInput extends EntryCalculatorInput {
  /** Catalyst data (optional) */
  catalystData?: import('./catalyst').ParsedCatalystData | null
  /** Current date (defaults to now) */
  currentDate?: Date
}

/**
 * Catalyst-aware entry calculator output
 */
export interface CatalystAwareEntryOutput extends EntryCalculatorOutput {
  /** Catalyst adjustment information */
  catalystAdjustment?: CatalystAdjustment
  /** Catalyst-based urgency score (0-100) */
  catalystUrgency?: number
  /** Catalyst-based timing recommendation */
  catalystTiming?: string
}
