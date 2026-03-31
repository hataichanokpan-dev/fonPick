/**
 * Risk Management Services
 *
 * Exports for all risk management services:
 * - Portfolio Risk Manager
 * - Correlation Checker
 * - Exposure Calculator
 * - Backtesting Module
 */

export {
  analyzePortfolioRisk,
  calculateMaxPositionSize,
  canAddPosition,
} from './portfolio-risk-manager'

export {
  analyzeCorrelation,
  quickCorrelationCheck,
} from './correlation-checker'

export {
  calculateExposure,
  calculateSectorLimits,
  canAddPositionBySector,
  getSectorSummary,
} from './exposure-calculator'

export {
  runBacktest,
  generateBacktestSummary,
  quickBacktest,
} from './backtesting-module'
