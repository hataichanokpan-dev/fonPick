/**
 * Data Insight Types
 *
 * Data insight analysis resolves conflicting market signals using Thai SET-specific rules.
 * Combines regime, smart money, and sector rotation data into a single verdict.
 */

import type { RegimeResult } from './market'
import type { SmartMoneyAnalysis } from './smart-money'
import type { SectorRotationAnalysis } from './sector-rotation'

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Trading verdict - what should the trader do?
 */
export type Verdict = 'PROCEED' | 'CAUTION' | 'WAIT' | 'NEUTRAL'

/**
 * Conviction level - how confident are we in this verdict?
 */
export type ConvictionLevel = 'High' | 'Medium' | 'Low'

/**
 * Primary driver - what's the main signal driving this verdict?
 */
export type PrimaryDriver = 'Foreign Flow' | 'Smart Money' | 'Market Regime' | 'Sector Strength' | 'None'

/**
 * Sector focus recommendation
 */
export type SectorFocus = 'OVERWEIGHT' | 'UNDERWEIGHT' | 'NEUTRAL'

// ============================================================================
// DATA INSIGHT RESULT
// ============================================================================

/**
 * Complete data insight analysis result
 * Resolves conflicting signals into a single actionable verdict
 */
export interface DataInsight {
  /** Trading verdict */
  verdict: Verdict

  /** Conviction level */
  conviction: ConvictionLevel

  /** Primary driver of this verdict */
  primaryDriver: PrimaryDriver

  /** Human-readable explanation */
  explanation: string

  /** Actionable takeaway for traders */
  actionableTakeaway: string

  /** Alert if there's a high-impact conflict */
  keyConflictAlert?: string

  /** Sector focus recommendation */
  sectorFocus: SectorFocus

  /** Confidence score (0-100) */
  confidence: number

  /** All signals considered for this analysis */
  conflictingSignals: {
    regime?: SignalValue
    smartMoney?: SignalValue
    sector?: SignalValue
    foreign?: SignalValue
  }

  /** Reasoning steps used to reach verdict */
  reasoning: string[]

  /** Timestamp of analysis */
  timestamp: number
}

/**
 * Signal value with confidence
 */
export interface SignalValue {
  /** Signal value (e.g., 'Risk-On', 'Buy', etc.) */
  value: string

  /** Confidence in this signal (0-100) */
  confidence: number
}

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Input data for conflict detection and resolution
 */
export interface DataInsightInput {
  /** Market regime data */
  regime: {
    type: 'Risk-On' | 'Neutral' | 'Risk-Off'
    confidence: number
    focus: string
    caution: string
  }

  /** Smart money analysis */
  smartMoney: {
    score: number
    combinedSignal: string
    riskSignal: string
    confidence: number
    investors: {
      foreign: { todayNet: number; strength: string }
      institution: { todayNet: number; strength: string }
      retail: { todayNet: number; strength: string }
      prop: { todayNet: number; strength: string }
    }
    primaryDriver?: string
  }

  /** Sector rotation data */
  sector: {
    pattern: string
    concentration: number
    focusSectors: string[]
    avoidSectors: string[]
    leadership: {
      leaders: Array<{ sector: { name: string }; vsMarket: number }>
      laggards: Array<{ sector: { name: string }; vsMarket: number }>
    }
  }
}

/**
 * Input from market intelligence aggregation
 */
export interface MarketIntelligenceInput {
  regime: RegimeResult | null
  smartMoney: SmartMoneyAnalysis | null
  sectorRotation: SectorRotationAnalysis | null
}

// ============================================================================
// CONFLICT DETECTION TYPES
// ============================================================================

/**
 * Detected conflict between signals
 */
export interface Conflict {
  /** Conflict type */
  type: ConflictType

  /** Severity of this conflict */
  severity: 'High' | 'Medium' | 'Low'

  /** Description of the conflict */
  description: string

  /** Signals involved in the conflict */
  signals: string[]

  /** Impact on verdict */
  impact: string
}

/**
 * Conflict types
 */
export type ConflictType =
  | 'Regime-SmartMoney Mismatch'
  | 'Regime-Sector Mismatch'
  | 'Foreign-Domestic Divergence'
  | 'High Prop Trading Noise'
  | 'Bank Sector Defensive Signal'
  | 'Smart Money Contradiction'
  | 'No Clear Conflict'

/**
 * Conflict detection result
 */
export interface ConflictDetectionResult {
  /** Detected conflicts */
  conflicts: Conflict[]

  /** Overall conflict level */
  conflictLevel: 'High' | 'Medium' | 'Low' | 'None'

  /** Is there a critical conflict that overrides normal rules? */
  hasCriticalConflict: boolean
}

// ============================================================================
// RESOLUTION RULE TYPES
// ============================================================================

/**
 * Resolution rule
 */
export interface ResolutionRule {
  /** Rule name */
  name: string

  /** Priority (higher = more important) */
  priority: number

  /** Condition check */
  condition: (input: DataInsightInput) => boolean

  /** Resolution application - returns weight adjustments and special cases */
  resolve: (
    input: DataInsightInput,
    currentWeights: { regime: number; smartMoney: number; foreign: number; sector: number }
  ) => {
    weights?: { regime: number; smartMoney: number; foreign: number; sector: number }
    specialCase?: string
  }
}

/**
 * Resolution context
 */
export interface ResolutionContext {
  /** Applied rules */
  appliedRules: string[]

  /** Weight adjustments made */
  weights: {
    regime: number
    smartMoney: number
    foreign: number
    sector: number
  }

  /** Special cases detected */
  specialCases: string[]
}

// ============================================================================
// THAI SET SPECIFIC CONSTANTS
// ============================================================================

/**
 * Thai market specific thresholds
 */
export const THAI_SET_THRESHOLDS = {
  /** Foreign flow threshold (million THB) for primary signal */
  FOREIGN_FLOW_THRESHOLD: 1000,

  /** Smart money score threshold for high conviction */
  SMART_MONEY_HIGH_THRESHOLD: 60,

  /** Smart money score threshold for low conviction */
  SMART_MONEY_LOW_THRESHOLD: 30,

  /** Regime confidence threshold for override */
  REGIME_CONFIDENCE_OVERRIDE: 80,

  /** Prop trading percentage for noise detection */
  PROP_TRADING_NOISE_THRESHOLD: 40,

  /** Banks sector weight in SET (%) */
  BANKS_SECTOR_WEIGHT: 30,
} as const

/**
 * Default weights for signal resolution
 */
export const DEFAULT_WEIGHTS = {
  regime: 1.0,
  smartMoney: 1.2,
  foreign: 1.5,
  sector: 0.8,
} as const
