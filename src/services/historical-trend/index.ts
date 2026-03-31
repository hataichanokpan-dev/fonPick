/**
 * Historical Trend Service
 *
 * Exports for historical trend analysis in swing trading
 */

export {
  analyzeHistoricalTrend,
  getTrendSummary,
  isTrendFavorable,
  getEntryRecommendation,
} from './analyzer'

export {
  calculateMovingAverages,
  calculateCrossOverSignals,
  getLatestMAValues,
  calculateMAAlignment,
} from './moving-average'

export {
  analyzeTrendDuration,
} from './trend-duration'

export {
  analyzeMomentum,
  getMomentumRecommendation,
} from './momentum'

export {
  detectSupportResistanceLevels,
  getNearestSupport,
  getNearestResistance,
  calculateLevelStrength,
  getDistancePercentage,
  isPriceNearLevel,
  getTradingRange,
} from './support-resistance'
