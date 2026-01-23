/**
 * Verdict Engine Service
 *
 * Exports for stock verdict generation
 */

// Types
export type {
  LensStatus,
  LensType,
  LensScore,
  Verdict,
  VerdictConfidence,
  VerdictBullets,
  StockVerdict,
  QualityInput,
  ValuationInput,
  TimingInput,
  StockAnalysisInput,
} from './types'

// Lenses
export { assessQuality } from './lenses/quality'
export { assessValuation } from './lenses/valuation'
export { assessTiming } from './lenses/timing'

// Engine
export { generateVerdict, generateBatchVerdicts } from './engine'
