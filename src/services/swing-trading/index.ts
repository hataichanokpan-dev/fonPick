/**
 * Swing Trading Service
 *
 * Exports for swing trading verdict generation and calculators
 */

export { generateSwingVerdict } from './verdict-engine'

export {
  calculateEntryZone,
  getEntryUrgency,
  getEntryTiming,
  validateEntrySetup,
} from './entry-calculator'

export {
  calculateExitLevels,
  validateExitSetup,
  getTrailingStopRecommendation,
} from './exit-calculator'

export {
  calculatePositionSize,
  adjustPositionByConviction,
  validatePositionSize,
  calculatePyramiding,
  calculateScalingOut,
  getPositionSizingSummary,
} from './position-sizer'
