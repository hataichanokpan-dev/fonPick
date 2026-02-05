/**
 * Screening Components Export Barrel
 *
 * Centralized exports for all screening-related components and utilities.
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Score types
  MetricScore,
  UniverseScore,
  QualityScore,
  ValueGrowthScore,
  TechnicalScore,
  TotalScore,
  InvestmentDecision,
  ConfidenceLevel,
  MetricStatus,
  // Layer types
  UniverseFilters,
  UniverseScoreData,
  QualityMetric,
  QualityScoreData,
  ValueMetric,
  GrowthMetric,
  ValueGrowthScoreData,
  TechnicalMetric,
  CatalystEvent,
  TechnicalScoreData,
  ScreeningScoreData,
  MetricResult,
  // Entry plan types
  EntryPlan,
  // API types
  AlphaAPIResponse,
  PriceHistoryPoint,
  SupportResistanceLevels,
  // Component props
  MetricProgressBarProps,
  LayerCardProps,
  TotalScoreCardProps,
  DecisionBadgeProps,
  EntryPlanCardProps,
  // Helper types
  LayerColor,
  ScoreColorClasses,
  TranslationKey,
} from './types'

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  SCORE_THRESHOLDS,
  DECISION_THRESHOLDS,
  CONFIDENCE_THRESHOLDS,
  UNIVERSE_THRESHOLDS,
  QUALITY_THRESHOLDS,
  QUALITY_POINTS,
  VALUE_THRESHOLDS,
  GROWTH_THRESHOLDS,
  VALUE_POINTS,
  GROWTH_POINTS,
  TECHNICAL_THRESHOLDS,
  TECHNICAL_POINTS,
  CATALYST_POINTS,
  DECISION_GRADIENTS,
  DECISION_TEXT_COLORS,
  getScoreColorClasses,
  getLayerColorClasses,
  ANIMATION_DURATIONS,
  LAYER_CONFIG,
  ENTRY_PLAN_DEFAULTS,
  FORMAT_OPTIONS,
  NUMBER_SUFFIXES,
  NUMBER_THRESHOLDS,
  SUPPORT_RESISTANCE_CONFIG,
  CATALYST_CONFIG,
  SEASONALITY_CONFIG,
  isFavorableSeasonality,
  getSeasonalityStatus,
} from './constants'

// ============================================================================
// COMPONENTS
// ============================================================================

// Progress bars
export {
  MetricProgressBar,
  CompactMetricRow,
} from './MetricProgressBar'

// New simplified score indicators (Phase 1)
export {
  ScoreIndicator,
} from './ScoreIndicator'

// New grade badges (Phase 1)
export {
  GradeBadge,
  SimpleGradeDisplay,
  ScoreWithGrade,
} from './GradeBadge'

// Score displays
export {
  ScoreBadge,
  LayerScoreBadge,
  TotalScoreDisplay,
} from './ScoreBadge'

// Decision displays
export {
  DecisionBadge,
  DecisionCard,
  MiniDecisionBadge,
  DecisionIcon,
} from './DecisionBadge'

// Layer cards
export {
  LayerCard,
  CompactLayerCard,
  LayerHeaderOnly,
} from './LayerCard'

// Layer components
export {
  Layer1Universe,
  calculateUniverseScore,
} from './Layer1Universe'

export {
  Layer2Quality,
  calculateQualityScore,
  type QualityInputData,
} from './Layer2Quality'

export {
  Layer3ValueGrowth,
  calculateValueGrowthScore,
  type ValueGrowthInputData,
} from './Layer3ValueGrowth'

export {
  Layer4Technical,
  calculateTechnicalScore,
  type TechnicalInputData,
} from './Layer4Technical'

// Main cards
export {
  TotalScoreCard,
  CompactTotalScore,
  determineDecision,
  determineConfidence,
} from './TotalScoreCard'

export {
  EntryPlanCard,
  calculateEntryPlan,
} from './EntryPlanCard'

// ============================================================================
// UTILITIES
// ============================================================================

// Display transformer (Phase 1) - Convert scores to user-friendly formats
export {
  toDisplayScore,
  getScoreDisplayColor,
  getDecisionLabel,
  formatScoreDisplay,
  type DisplayScore,
} from './utils/display-transformer'

// Formatters
export {
  formatLargeNumber,
  formatCurrency,
  formatPercentage,
  formatPercentageFromDecimal,
  formatRatio,
  formatNumber,
  formatDate,
  formatDateRange,
  formatCountdown,
  formatScore,
  formatChange,
  formatBaht,
  formatMillions,
  formatBillions,
  truncateText,
  formatWithCommas,
} from './utils/formatters'
