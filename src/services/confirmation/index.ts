/**
 * Confirmation Service
 *
 * Phase 3: Confirmation
 * Combines signals from multiple sources for swing trading confirmation
 */

export {
  confirmSectorRotation,
  isSectorInLeadership,
  isSectorInLaggards,
  getSectorRotationWeight,
  getSignalWeight,
  calculateSectorConfidence,
} from './sector-confirmator'

export {
  generateConfirmation,
  getConfirmationSummary,
  meetsConfirmationThreshold,
  getPrimaryConfirmationSource,
} from './confirm-engine'
