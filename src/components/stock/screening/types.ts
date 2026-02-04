/**
 * Screening System Types
 *
 * Types for Practical Screening Sheet - 4 layer investment analysis framework
 */

// ============================================================================
// SCORE TYPES
// ============================================================================

/**
 * Score range for individual metrics (0-10)
 */
export type MetricScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/**
 * Total score ranges for each layer
 */
export type UniverseScore = 0 | 1 | 2  // 2 metrics
export type QualityScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10  // 10 points
export type ValueGrowthScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10  // 10 points
export type TechnicalScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10  // 10 points

/**
 * Total screening score (27 points max)
 */
export type TotalScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
  11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
  21 | 22 | 23 | 24 | 25 | 26 | 27

/**
 * Investment decision based on total score
 */
export type InvestmentDecision = 'BUY' | 'HOLD' | 'PASS'

/**
 * Confidence level for decision
 */
export type ConfidenceLevel = 'High' | 'Medium' | 'Low'

/**
 * Pass/Fail/Partial status for metrics
 */
export type MetricStatus = 'pass' | 'fail' | 'partial'

// ============================================================================
// LAYER 1: UNIVERSE TYPES
// ============================================================================

/**
 * Universe filter results
 */
export interface UniverseFilters {
  marketCap: MetricResult<number>
  volume: MetricResult<number>
}

export interface UniverseScoreData {
  totalScore: UniverseScore
  maxScore: 2
  filters: UniverseFilters
  allPassed: boolean
}

// ============================================================================
// LAYER 2: QUALITY TYPES
// ============================================================================

/**
 * Quality metric with scoring
 */
export interface QualityMetric {
  name: string
  thaiName: string
  points: number  // Points contributed (1-2)
  maxPoints: number
  currentValue: number
  targetValue: number
  comparison?: number  // Sector average for comparison
  status: MetricStatus
  description: string
}

export interface QualityScoreData {
  totalScore: QualityScore
  maxScore: 10
  metrics: {
    peg: QualityMetric
    npm: QualityMetric
    roe: QualityMetric
    roicWacc: QualityMetric
    debtEquity: QualityMetric
    fcfYield: QualityMetric
    ocfNi: QualityMetric
  }
}

// ============================================================================
// LAYER 3: VALUE + GROWTH TYPES
// ============================================================================

/**
 * Value metric result
 */
export interface ValueMetric {
  name: string
  thaiName: string
  points: number  // Points contributed (1-2)
  maxPoints: number
  currentValue: number
  targetValue?: number
  status: MetricStatus
  interpretation: string  // "ถูก" (cheap) or "แพง" (expensive)
}

/**
 * Growth metric result
 */
export interface GrowthMetric {
  name: string
  thaiName: string
  points: number
  maxPoints: number
  currentValue: number
  targetValue?: number
  trend: 'up' | 'down' | 'flat'
  status: MetricStatus
}

export interface ValueGrowthScoreData {
  totalScore: ValueGrowthScore
  maxScore: 10
  valueScore: number  // 0-5
  growthScore: number  // 0-5
  valueMetrics: {
    peBand: ValueMetric
    pbFair: ValueMetric
    divYield: ValueMetric
    pfcf: ValueMetric
  }
  growthMetrics: {
    epsYoY: GrowthMetric
    epsAccel: GrowthMetric
  }
}

// ============================================================================
// LAYER 4: TECHNICAL + CATALYST TYPES
// ============================================================================

/**
 * Technical metric result
 */
export interface TechnicalMetric {
  name: string
  thaiName: string
  points: number
  maxPoints: number
  currentValue: number | string
  status: MetricStatus
  detail?: string
}

/**
 * Catalyst event
 */
export interface CatalystEvent {
  id: string
  name: string
  thaiName: string
  date: Date | null
  importance: 'high' | 'medium' | 'low'
  impact: 'positive' | 'negative' | 'neutral'
  description?: string
  countdown?: string  // e.g., "in 12 days"
}

export interface TechnicalScoreData {
  totalScore: TechnicalScore
  maxScore: 10
  technicalScore: number  // 0-5
  catalystScore: number  // 0-5
  technicalMetrics: {
    priceVsMA50: TechnicalMetric
    rsi: TechnicalMetric
    macd: TechnicalMetric
    support: TechnicalMetric
  }
  catalysts: {
    aiScore?: number | null  // 0-10 from AI API
  }
}

// ============================================================================
// TOTAL SCORE & DECISION TYPES
// ============================================================================

/**
 * Complete screening score data
 */
export interface ScreeningScoreData {
  totalScore: TotalScore
  maxScore: 27
  decision: InvestmentDecision
  confidence: ConfidenceLevel
  confidencePercent: number  // 0-100
  layers: {
    universe: UniverseScoreData
    quality: QualityScoreData
    valueGrowth: ValueGrowthScoreData
    technical: TechnicalScoreData
  }
  summary: string
  rationale: string[]
}

// ============================================================================
// METRIC RESULT TYPES
// ============================================================================

/**
 * Generic metric result
 */
export interface MetricResult<T = number | string> {
  value: T
  passes: boolean
  threshold?: T
  currentDisplay?: string
  thresholdDisplay?: string
}

// ============================================================================
// ENTRY PLAN TYPES
// ============================================================================

/**
 * Entry plan for trading
 */
export interface EntryPlan {
  buyAt: {
    price: number
    discountFromCurrent?: number
    rationale: string
  }
  stopLoss: {
    price: number
    percentageFromBuy: number
    rationale: string
  }
  target: {
    price: number
    percentageFromBuy: number
    rationale: string
  }
  positionSize: {
    percentage: number
    rationale: string
  }
  riskReward: {
    ratio: string  // e.g., "1:3"
    calculation: string
  }
  timeHorizon: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Alpha API response for target prices
 */
export interface AlphaAPIResponse {
  success: boolean
  data: {
    IntrinsicValue: number
    LowForecast: number
    AvgForecast: number
    HighForecast: number
    DCFValue: number
    RelativeValue: number
  }
  cached?: boolean
}

/**
 * Price history point for support/resistance calculation
 */
export interface PriceHistoryPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * Support/Resistance levels
 */
export interface SupportResistanceLevels {
  support1: number  // Nearest support
  support2: number  // Second support
  resistance1: number  // Nearest resistance
  resistance2: number  // Second resistance
  currentDistanceToSupport: number  // Percentage
  currentDistanceToResistance: number  // Percentage
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Progress bar component props
 */
export interface MetricProgressBarProps {
  score: number  // Calculated score (0-10 or 0-100)
  maxScore?: number
  label: string
  thaiLabel?: string
  value?: string
  points?: number
  maxPoints?: number
  status: MetricStatus
  showValue?: boolean
  compact?: boolean
  className?: string
}

/**
 * Layer card component props
 */
export interface LayerCardProps {
  layer: number
  title: string
  thaiTitle: string
  description?: string
  thaiDescription?: string
  score: number
  maxScore: number
  color: 'quality' | 'value' | 'technical' | 'universe'
  expanded?: boolean
  onToggle?: () => void
  children: React.ReactNode
  className?: string
}

/**
 * Total score card component props
 */
export interface TotalScoreCardProps {
  totalScore: TotalScore
  maxScore: number
  decision: InvestmentDecision
  confidence: ConfidenceLevel
  confidencePercent: number
  layers: {
    universe: { score: UniverseScore; passed: boolean }
    quality: { score: QualityScore }
    valueGrowth: { score: ValueGrowthScore }
    technical: { score: TechnicalScore }
  }
  summary: string
  rationale: string[]
  locale?: 'en' | 'th'
  className?: string
}

/**
 * Decision badge component props
 */
export interface DecisionBadgeProps {
  decision: InvestmentDecision
  confidence?: ConfidenceLevel
  size?: 'sm' | 'md' | 'lg'
  className?: string
  locale ?: 'en' | 'th'
}

/**
 * Entry plan card component props
 */
export interface EntryPlanCardProps {
  entryPlan: EntryPlan
  currentPrice: number
  locale?: 'en' | 'th'
  className?: string
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Layer color type for styling
 */
export type LayerColor = 'quality' | 'value' | 'technical' | 'universe'

/**
 * Score color class mapping
 */
export interface ScoreColorClasses {
  text: string
  bg: string
  border: string
  progress: string
}

/**
 * Translation keys
 */
export type TranslationKey =
  | 'universe'
  | 'quality'
  | 'valueGrowth'
  | 'technical'
  | 'totalScore'
  | 'buy'
  | 'hold'
  | 'pass'
  | 'confidence'
  | 'entryPlan'
  | 'buyAt'
  | 'stopLoss'
  | 'target'
  | 'positionSize'
  | 'riskReward'
