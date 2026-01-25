/**
 * Correlation Types
 *
 * Cross-reference analysis between Top Rankings and Sector performance.
 * Answers Questions #5 and #6.
 */

import type { RTDBTopRankings } from './rtdb'
import type { RTDBIndustrySector } from './rtdb'
import type { RankingsBySector } from './sector-rotation'

// ============================================================================
// COVERAGE METRICS (Phase 2)
// ============================================================================

/**
 * Coverage metrics for stock-to-sector mapping
 * Indicates how many stocks in rankings have been successfully mapped to sectors
 */
export interface CoverageMetrics {
  /** Total stocks in rankings */
  totalStocks: number
  /** Number of mapped stocks */
  mappedStocks: number
  /** Coverage percentage */
  coveragePercent: number
}

// ============================================================================
// CORRELATION ANALYSIS
// ============================================================================

/**
 * Correlation strength between rankings and sector performance
 */
export type CorrelationStrength =
  | 'Strong Positive'   // Rankings strongly confirm sector move
  | 'Positive'          // Rankings confirm sector move
  | 'Neutral'           // No clear correlation
  | 'Negative'          // Rankings contradict sector move
  | 'Strong Negative'   // Rankings strongly contradict sector move

/**
 * Sector anomaly type
 */
export type AnomalyType =
  | 'Sector Up No Rankings'   // Sector positive but no stocks in rankings
  | 'Sector Down Many Rankings' // Sector negative but many stocks in rankings
  | 'Concentrated Rankings'   // One sector dominating rankings
  | 'Divergent Performance'   // Top stocks up but sector down (or vice versa)
  | 'No Anomaly'

/**
 * Sector-rankings correlation data
 */
export interface SectorRankingsCorrelation {
  /** Sector identifier */
  sectorId: string

  /** Sector name */
  sectorName: string

  /** Sector performance */
  sectorChange: number

  /** Number of stocks in rankings */
  rankingsCount: number

  /** Expected rankings count (based on sector size) */
  expectedCount: number

  /** Correlation strength */
  correlation: CorrelationStrength

  /** Anomaly type */
  anomaly: AnomalyType

  /** Anomaly explanation */
  anomalyExplanation?: string

  /** Correlation score (0-100) */
  correlationScore: number
}

// ============================================================================
// RANKINGS IMPACT ANALYSIS
// ============================================================================

/**
 * Rankings impact on market
 * Answers Question #5: "How top ranking effect to market?"
 */
export interface RankingsImpactAnalysis {
  /** Overall rankings impact */
  impact: RankingsImpactLevel

  /** Sector dominance */
  dominance: SectorDominance

  /** Market breadth impact */
  breadthImpact: BreadthImpact

  /** Concentration analysis */
  concentration: ConcentrationAnalysis

  /** Key observations */
  observations: string[]

  /** Timestamp */
  timestamp: number
}

/**
 * Overall rankings impact level
 */
export type RankingsImpactLevel =
  | 'High'      // Rankings heavily concentrated, driving market
  | 'Medium'    // Some concentration, moderate impact
  | 'Low'       // Broad participation, rankings less impactful
  | 'Unclear'   // Insufficient data

/**
 * Sector dominance in rankings
 */
export interface SectorDominance {
  /** Dominant sectors (controlling most ranking spots) */
  dominant: string[]

  /** Dominance score (0-100, higher = more concentrated) */
  dominanceScore: number

  /** Number of sectors represented in rankings */
  sectorCount: number

  /** Top sector percentage */
  topSectorPercent: number
}

/**
 * Rankings impact on market breadth
 */
export interface BreadthImpact {
  /** Is breadth confirming rankings? */
  confirmed: boolean

  /** Rankings breadth (broad vs narrow) */
  rankingsBreadth: 'Broad' | 'Narrow' | 'Mixed'

  /** Explanation */
  explanation: string
}

/**
 * Concentration analysis
 */
export interface ConcentrationAnalysis {
  /** Concentration score (0-100) */
  score: number

  /** Concentration level */
  level: 'High' | 'Medium' | 'Low'

  /** Top 3 concentration percentage */
  top3Percent: number

  /** Interpretation */
  interpretation: string
}

// ============================================================================
// RANKINGS VS SECTOR ANALYSIS
// ============================================================================

/**
 * Rankings vs Sector comparison
 * Answers Question #6: "What we see in top ranking compare with sector?"
 */
export interface RankingsVsSectorAnalysis {
  /** Overall correlation */
  overallCorrelation: CorrelationStrength

  /** Correlation score (0-100) */
  correlationScore: number

  /** Per-sector correlations */
  sectorCorrelations: SectorRankingsCorrelation[]

  /** Detected anomalies */
  anomalies: SectorAnomaly[]

  /** Alignment status (do rankings align with sector performance?) */
  aligned: boolean

  /** Key insights */
  insights: string[]

  /** Timestamp */
  timestamp: number
}

/**
 * Sector anomaly detail
 */
export interface SectorAnomaly extends SectorRankingsCorrelation {
  /** Anomaly severity */
  severity: 'High' | 'Medium' | 'Low'

  /** Potential explanation */
  explanation: string

  /** Actionable insight */
  insight: string
}

// ============================================================================
// CORRELATION INPUT
// ============================================================================

/**
 * Input data for correlation analysis
 */
export interface CorrelationInput {
  /** Top rankings data */
  rankings: RTDBTopRankings

  /** Industry sector data */
  sectors: RTDBIndustrySector

  /** Historical data (optional, for trend) */
  historical?: {
    rankings?: RTDBTopRankings[]
    sectors?: RTDBIndustrySector[]
  }

  /** Analysis options */
  options?: CorrelationOptions
}

/**
 * Options for correlation analysis
 */
export interface CorrelationOptions {
  /** Threshold for high concentration (default: 40%) */
  highConcentrationThreshold?: number

  /** Threshold for anomaly detection (default: 2x expected) */
  anomalyThreshold?: number

  /** Include trend analysis (default: true) */
  includeTrend?: boolean
}

// ============================================================================
// CORRELATION METRICS
// ============================================================================

/**
 * Correlation metrics for UI display
 */
export interface CorrelationMetrics {
  /** Number of sectors in rankings */
  sectorCount: number

  /** Total unique stocks in rankings */
  uniqueStocks: number

  /** Concentration score */
  concentrationScore: number

  /** Anomaly count */
  anomalyCount: number

  /** Average correlation score */
  avgCorrelationScore: number
}

/**
 * Correlation summary
 */
export interface CorrelationSummary {
  /** Rankings impact (Q5 answer) */
  impact: {
    level: RankingsImpactLevel
    explanation: string
  }

  /** Correlation status (Q6 answer) */
  correlation: {
    strength: CorrelationStrength
    score: number
    explanation: string
  }

  /** Key anomalies */
  anomalies: string[]

  /** Actionable insights */
  insights: string[]
}

// ============================================================================
// CROSS-REFERENCE UTILITIES
// ============================================================================

/**
 * Stock in rankings with sector info
 */
export interface RankedStockWithSector {
  /** Stock symbol */
  symbol: string

  /** Stock name */
  name: string

  /** Change percent */
  change: number

  /** Sector code */
  sectorCode: string

  /** Sector name */
  sectorName: string

  /** Sector change percent */
  sectorChange: number

  /** Ranking categories */
  in: {
    gainers?: number
    losers?: number
    volume?: number
    value?: number
  }

  /** Is this stock an anomaly? */
  isAnomaly: boolean
}

/**
 * Complete cross-reference data
 */
export interface CrossReferenceData {
  /** All ranked stocks with sector info */
  rankedStocks: RankedStockWithSector[]

  /** Rankings by sector aggregation */
  bySector: RankingsBySector[]

  /** Correlation metrics */
  metrics: CorrelationMetrics

  /** Anomalies detected */
  anomalies: SectorAnomaly[]
}
