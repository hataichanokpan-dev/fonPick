/**
 * Sector Rotation Types
 *
 * Sector rotation analysis identifies which sectors are leading or lagging,
 * and detects money flow between sectors.
 * Answers Question #2: "What sector is heavy market up or down because xxx sector?"
 */

import type { RTDBIndustrySector, RTDBSector } from './rtdb'
import type { RTDBTopRankings } from './rtdb'

// ============================================================================
// SECTOR PERFORMANCE CLASSIFICATION
// ============================================================================

/**
 * Sector momentum category
 */
export type SectorMomentum =
  | 'Strong Outperform'  // Significantly beating market
  | 'Outperform'         // Beating market
  | 'In-line'            // Tracking market
  | 'Underperform'       // Lagging market
  | 'Significant Lag'    // Significantly lagging

/**
 * Sector rotation signal
 */
export type RotationSignal =
  | 'Entry'      // Money flowing IN, good time to enter
  | 'Accumulate' // Money starting to flow in
  | 'Hold'       // No clear rotation signal
  | 'Distribute' // Money starting to flow out
  | 'Exit'       // Money flowing OUT, time to exit

/**
 * Sector group classification
 */
export type SectorGroup =
  | 'Defensive'   // Food, Health, Utilities
  | 'Cyclical'    // Banking, Energy, Construction
  | 'Growth'      // Technology, Commerce
  | 'Resource'    // Mining, Energy, Agribusiness
  | 'Property'    // Property funds, REITs
  | 'Unknown'

// ============================================================================
// SECTOR ANALYSIS DATA
// ============================================================================

/**
 * Sector performance analysis
 */
export interface SectorPerformance {
  /** Sector identifier */
  sector: RTDBSector

  /** Performance vs SET index (percentage points) */
  vsMarket: number

  /** Performance rank among all sectors (1 = best) */
  rank: number

  /** Momentum classification */
  momentum: SectorMomentum

  /** Trading value (millions) */
  value: number

  /** Value vs 30-day average ratio */
  valueRatio: number

  /** Rotation signal */
  signal: RotationSignal

  /** Signal confidence (0-100) */
  confidence: number

  /** Number of stocks in top rankings */
  topRankingsCount: number
}

/**
 * Sector leadership data
 */
export interface SectorLeadership {
  /** Top performing sectors */
  leaders: SectorPerformance[]

  /** Lagging sectors */
  laggards: SectorPerformance[]

  /** Market-driving sector (primary mover) */
  marketDriver?: SectorPerformance

  /** Sector concentration score (0-100, higher = more concentrated) */
  concentration: number
}

// ============================================================================
// SECTOR ROTATION ANALYSIS RESULT
// ============================================================================

/**
 * Complete sector rotation analysis result
 * Answers Question #2: "What sector is heavy market up or down because xxx sector?"
 */
export interface SectorRotationAnalysis {
  /** Overall rotation pattern */
  pattern: RotationPattern

  /** Leadership data */
  leadership: SectorLeadership

  /** Market regime context (risk-on favors cyclicals, risk-off defensives) */
  regimeContext: RegimeContext

  /** Sectors with entry signals */
  entrySignals: SectorPerformance[]

  /** Sectors with exit signals */
  exitSignals: SectorPerformance[]

  /** Key rotation observations */
  observations: string[]

  /** Actionable focus sectors */
  focusSectors: string[]

  /** Sectors to avoid */
  avoidSectors: string[]

  /** Timestamp of analysis */
  timestamp: number
}

/**
 * Overall rotation pattern
 */
export type RotationPattern =
  | 'Risk-On Rotation'      // Money moving to cyclicals
  | 'Risk-Off Rotation'     // Money moving to defensives
  | 'Broad-Based Advance'   // Most sectors up
  | 'Broad-Based Decline'   // Most sectors down
  | 'Mixed/No Clear Pattern' // Conflicting signals
  | 'Sector-Specific'       // Only certain sectors moving

/**
 * Market regime context for sector analysis
 */
export interface RegimeContext {
  /** Current market regime */
  regime: 'Risk-On' | 'Neutral' | 'Risk-Off'

  /** Defensive sectors performance */
  defensives: {
    averageChange: number
    vsMarket: number
  }

  /** Cyclical sectors performance */
  cyclicals: {
    averageChange: number
    vsMarket: number
  }

  /** Regime confirmation (do sectors match regime?) */
  confirmed: boolean
}

// ============================================================================
// SECTOR-RANKINGS MAPPING
// ============================================================================

/**
 * Rankings mapped to sectors
 * Used for cross-analysis in Question #5 and #6
 */
export interface RankingsBySector {
  /** Sector identifier */
  sectorId: string

  /** Sector name */
  sectorName: string

  /** Stocks in top gainers */
  topGainers: number

  /** Stocks in top losers */
  topLosers: number

  /** Stocks in top volume */
  topVolume: number

  /** Stocks in top value */
  topValue: number

  /** Total presence in rankings */
  totalRankings: number

  /** Sector performance */
  sectorChange: number

  /** Anomaly flag (e.g., sector up but no stocks in rankings) */
  isAnomaly: boolean

  /** Anomaly description */
  anomalyReason?: string
}

/**
 * Complete rankings-to-sector mapping
 */
export interface RankingsSectorMap {
  /** All sector mappings */
  bySector: RankingsBySector[]

  /** Sectors dominating rankings */
  dominantSectors: string[]

  /** Concentration score (0-100) */
  concentrationScore: number

  /** Detected anomalies */
  anomalies: RankingsBySector[]
}

// ============================================================================
// SECTOR ROTATION INPUT
// ============================================================================

/**
 * Input data required for sector rotation analysis
 */
export interface SectorRotationInput {
  /** Current industry sector data */
  sectors: RTDBIndustrySector

  /** Top rankings data (optional, for cross-analysis) */
  rankings?: RTDBTopRankings

  /** Historical sector data (optional, for trend detection) */
  historical?: RTDBIndustrySector[]

  /** Analysis options */
  options?: SectorRotationOptions
}

/**
 * Options for sector rotation analysis
 */
export interface SectorRotationOptions {
  /** Periods to consider for trend (default: 5) */
  trendPeriods?: number

  /** Threshold for strong outperform (default: +1.5%) */
  strongOutperformThreshold?: number

  /** Threshold for significant lag (default: -1.5%) */
  significantLagThreshold?: number

  /** Include rankings cross-analysis (default: true) */
  includeRankingsAnalysis?: boolean
}

// ============================================================================
// SECTOR DEFINITIONS
// ============================================================================

/**
 * Sector metadata and classification
 */
export interface SectorDefinition {
  /** Sector code */
  code: string

  /** Sector name */
  name: string

  /** Sector group */
  group: SectorGroup

  /** Typical behavior in risk-on regime */
  riskOnBehavior: 'benefits' | 'neutral' | 'hurts'

  /** Typical behavior in risk-off regime */
  riskOffBehavior: 'benefits' | 'neutral' | 'hurts'
}

/**
 * Default sector definitions
 */
export const SECTOR_DEFINITIONS: Record<string, SectorDefinition> = {
  FIN: {
    code: 'FIN',
    name: 'Financial',
    group: 'Cyclical',
    riskOnBehavior: 'benefits',
    riskOffBehavior: 'hurts',
  },
  ENERGY: {
    code: 'ENERGY',
    name: 'Energy',
    group: 'Resource',
    riskOnBehavior: 'benefits',
    riskOffBehavior: 'neutral',
  },
  AGRI: {
    code: 'AGRI',
    name: 'Agribusiness',
    group: 'Resource',
    riskOnBehavior: 'benefits',
    riskOffBehavior: 'neutral',
  },
  FOOD: {
    code: 'FOOD',
    name: 'Food',
    group: 'Defensive',
    riskOnBehavior: 'neutral',
    riskOffBehavior: 'benefits',
  },
  HEALTH: {
    code: 'HEALTH',
    name: 'Healthcare',
    group: 'Defensive',
    riskOnBehavior: 'neutral',
    riskOffBehavior: 'benefits',
  },
  TECH: {
    code: 'TECH',
    name: 'Technology',
    group: 'Growth',
    riskOnBehavior: 'benefits',
    riskOffBehavior: 'hurts',
  },
  PROP: {
    code: 'PROP',
    name: 'Property',
    group: 'Property',
    riskOnBehavior: 'neutral',
    riskOffBehavior: 'hurts',
  },
}
