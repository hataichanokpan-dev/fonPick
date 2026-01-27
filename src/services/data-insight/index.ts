/**
 * Data Insight Service
 *
 * Main exports for data insight analysis.
 */

export {
  detectConflicts,
  getConflictsBySeverity,
  formatConflictDescription,
} from './conflict-detector'

export {
  resolveSignals,
} from './resolver'

export type {
  DataInsight,
  DataInsightInput,
  MarketIntelligenceInput,
  Conflict,
  ConflictDetectionResult,
  ResolutionRule,
  ResolutionContext,
} from '@/types/data-insight'
