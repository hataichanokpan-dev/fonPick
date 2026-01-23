/**
 * Market Regime Service
 *
 * Exports for market regime detection and analysis
 */

// Types
export type {
  MarketRegime,
  RegimeConfidence,
  RegimeInput,
  RegimeResult,
  MarketDataForRegime,
  RegimeAnalysisOptions,
} from './types'

// Rules
export {
  calculateRiskOnScore,
  calculateRiskOffScore,
  determineRegime,
  generateFocusGuidance,
  generateCautionGuidance,
} from './rules'

// Analyzer
export {
  analyzeRegime,
  buildRegimeInput,
  analyzeMarketRegime,
} from './analyzer'
