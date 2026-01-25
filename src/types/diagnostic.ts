/**
 * Stock Decline Diagnostic Types
 *
 * Diagnostic system for analyzing why a stock is declining.
 * Analyzes signals across 5 dimensions: Volume, Sector/Market Context,
 * Smart Money Flow, Technical/Price Action, and Valuation.
 */

import type { VolumeAnalysisData } from './volume'
import type { SectorPerformance, RegimeContext } from './sector-rotation'
import type { SmartMoneyAnalysis } from './smart-money'
import type { RTDBTopRankings } from './rtdb'

// Re-export types that are used by the diagnostic system
export type { VolumeAnalysisData } from './volume'
export type { SectorPerformance, RegimeContext } from './sector-rotation'
export type { SmartMoneyAnalysis } from './smart-money'

// ============================================================================
// DIAGNOSTIC FLAG TYPES
// ============================================================================

/**
 * Diagnostic flag category
 */
export type DiagnosticCategory =
  | 'volume'
  | 'sector'
  | 'smart_money'
  | 'technical'
  | 'valuation'

/**
 * Diagnostic flag severity
 */
export type DiagnosticSeverity = 'red' | 'yellow'

/**
 * Individual diagnostic flag
 */
export interface DiagnosticFlag {
  /** Flag category */
  category: DiagnosticCategory

  /** Flag severity */
  severity: DiagnosticSeverity

  /** Signal that triggered the flag */
  signal: string

  /** Human-readable description */
  description: string

  /** Recommended action */
  action: string

  /** Supporting data value (optional) */
  value?: number

  /** Comparison to threshold (optional) */
  comparison?: string
}

// ============================================================================
// OVERALL ACTION TYPES
// ============================================================================

/**
 * Overall diagnostic action recommendation
 */
export type DiagnosticAction =
  | 'IMMEDIATE_SELL'  // 3+ Red Flags
  | 'STRONG_SELL'     // 2 Red + 2+ Yellow
  | 'REDUCE'          // 2 Red + 2+ Yellow (alternative)
  | 'TRIM'            // 1-2 Red Flags
  | 'HOLD'            // 0-2 Yellow (normal volatility)
  | 'ACCUMULATE'      // Not used in decline diagnostic, but included for completeness

// ============================================================================
// DIAGNOSTIC INPUT DATA
// ============================================================================

/**
 * Technical indicators for a stock
 */
export interface TechnicalIndicators {
  /** Stock symbol */
  symbol: string

  /** Price change percentage */
  changePercent: number

  /** 5-day trend (positive/negative) */
  trend5D: number

  /** 20-day trend (positive/negative) */
  trend20D: number

  /** 52-week range position (0-100) */
  week52Position: number

  /** Is stock in top 10 losers */
  isTopLoser: boolean

  /** Is stock in top 10 gainers */
  isTopGainer: boolean

  /** Is stock in any ranking (gainer, loser, volume, value) */
  isInAnyRanking: boolean

  /** P/E ratio */
  pe?: number

  /** Sector average P/E */
  sectorPe?: number

  /** Historical average P/E */
  historicalPe?: number

  /** Sector code */
  sectorCode?: string

  /** Sector name */
  sectorName?: string

  /** Sector performance vs market */
  sectorVsMarket?: number

  /** Sector momentum classification */
  sectorMomentum?: string

  /** Relative volume (vs 30-day average) */
  relativeVolume?: number
}

/**
 * Valuation data for a stock
 */
export interface ValuationData {
  /** Stock P/E ratio */
  stockPE?: number

  /** Sector average P/E */
  sectorPE?: number

  /** Stock's historical P/E average */
  historicalPE?: number

  /** P/BV ratio */
  pbv?: number

  /** Dividend yield */
  dividendYield?: number
}

// ============================================================================
// STOCK DIAGNOSTIC INPUT
// ============================================================================

/**
 * Complete input data for stock decline diagnostic
 */
export interface StockDiagnosticInput {
  /** Stock symbol */
  symbol: string

  /** Technical indicators */
  technical: TechnicalIndicators

  /** Volume analysis data */
  volume: VolumeAnalysisData

  /** Sector performance data */
  sector?: SectorPerformance

  /** Market regime context */
  regimeContext?: RegimeContext

  /** Smart money analysis */
  smartMoney: SmartMoneyAnalysis

  /** Top rankings data */
  rankings: RTDBTopRankings

  /** Valuation data */
  valuation?: ValuationData

  /** Analysis options */
  options?: DiagnosticOptions
}

/**
 * Options for diagnostic analysis
 */
export interface DiagnosticOptions {
  /** Threshold for strong foreign sell (default: 500M) */
  strongForeignSellThreshold?: number

  /** Threshold for institution sell (default: 100M) */
  institutionSellThreshold?: number

  /** Threshold for smart money score (default: 40) */
  smartMoneyScoreThreshold?: number

  /** Threshold for 5-day cumulative flow (default: -200) */
  cumulativeFlowThreshold?: number

  /** Volume health score threshold (default: 30) */
  volumeHealthThreshold?: number

  /** VWAD bearish threshold (default: -30) */
  vwadBearishThreshold?: number

  /** Concentration risky threshold (default: 40%) */
  concentrationThreshold?: number

  /** Relative volume low threshold (default: 0.5x) */
  relativeVolumeLowThreshold?: number

  /** Include detailed flags (default: true) */
  includeDetailedFlags?: boolean
}

// ============================================================================
// STOCK DIAGNOSTIC RESULT
// ============================================================================

/**
 * Complete stock diagnostic result
 */
export interface StockDiagnosticResult {
  /** Stock symbol */
  symbol: string

  /** Overall action recommendation */
  overallAction: DiagnosticAction

  /** Red flags detected */
  redFlags: DiagnosticFlag[]

  /** Yellow flags detected */
  yellowFlags: DiagnosticFlag[]

  /** Human-readable summary */
  summary: string

  /** Flag counts by category */
  flagCounts: {
    red: number
    yellow: number
    byCategory: Record<DiagnosticCategory, { red: number; yellow: number }>
  }

  /** Risk level (0-100) */
  riskLevel: number

  /** Analysis timestamp */
  timestamp: number
}

// ============================================================================
// DIAGNOSTIC THRESHOLDS
// ============================================================================

/**
 * Default diagnostic thresholds
 */
export const DEFAULT_DIAGNOSTIC_THRESHOLDS = {
  strongForeignSellThreshold: 500,
  institutionSellThreshold: 100,
  smartMoneyScoreThreshold: 40,
  cumulativeFlowThreshold: -200,
  volumeHealthThreshold: 30,
  vwadBearishThreshold: -30,
  concentrationThreshold: 40,
  relativeVolumeLowThreshold: 0.5,
  peOvervaluationThreshold: 1.3, // 30% above sector/historical
  week52PositionLowThreshold: 20,
} as const

// ============================================================================
// DIAGNOSTIC FLAG DESCRIPTIONS
// ============================================================================

/**
 * Flag description templates
 */
export const FLAG_DESCRIPTIONS: Record<
  string,
  Record<
    string,
    { signal: string; description: string; action: string }
  >
> = {
  volume: {
    anemic: {
      signal: 'Anemic Volume',
      description: 'Trading volume is critically low, indicating weak liquidity and lack of investor interest.',
      action: 'Exercise extreme caution - bid-ask spreads may widen significantly.',
    },
    bearishVWAD: {
      signal: 'Bearish Conviction',
      description: 'Volume-weighted advance/decline shows strong bearish conviction.',
      action: 'Sell pressure is confirmed by volume - avoid catching falling knife.',
    },
    illiquid: {
      signal: 'Illiquid Market',
      description: 'High concentration in top stocks indicates illiquid market conditions.',
      action: 'Exit and re-entry costs may be high - consider market impact.',
    },
    lowRelativeVolume: {
      signal: 'Low Relative Volume',
      description: 'Trading volume is below 30-day average, indicating weak participation.',
      action: 'Wait for volume confirmation before making decisions.',
    },
  },
  sector: {
    laggard: {
      signal: 'Laggard Sector',
      description: 'Stock sector is underperforming the market significantly.',
      action: 'Consider rotating to leading sectors or defensive positions.',
    },
    exitSignal: {
      signal: 'Sector Exit Signal',
      description: 'Strong rotation signal detected - money flowing out of this sector.',
      action: 'Follow the smart money - reduce exposure to this sector.',
    },
    riskOff: {
      signal: 'Risk-Off Market',
      description: 'Market regime confirmed as risk-off - defensive positioning favored.',
      action: 'Reduce cyclical exposure, increase defensive holdings.',
    },
  },
  smartMoney: {
    foreignStrongSell: {
      signal: 'Foreign Strong Sell',
      description: 'Foreign investors are aggressively selling this stock.',
      action: 'Foreign flows lead price action - consider following their lead.',
    },
    institutionSell: {
      signal: 'Institution Selling',
      description: 'Institutional investors are net sellers.',
      action: 'Smart money distribution - reduce positions.',
    },
    lowScore: {
      signal: 'Low Smart Money Score',
      description: 'Smart money sentiment is bearish.',
      action: 'Wait for smart money confirmation before buying.',
    },
    negativeCumulative: {
      signal: 'Negative Cumulative Flow',
      description: '5-day cumulative flow is strongly negative.',
      action: 'Sustained selling pressure - avoid counter-trend trades.',
    },
  },
  technical: {
    topLoser: {
      signal: 'Top Loser',
      description: 'Stock is in top 10 losers today.',
      action: 'Strong momentum downside - wait for stabilization.',
    },
    low52Week: {
      signal: 'Near 52-Week Low',
      description: 'Stock is trading in bottom 20% of 52-week range.',
      action: 'Support levels may be tested - risk of further decline.',
    },
    missingRankings: {
      signal: 'Absent from Rankings',
      description: 'Stock not present in any top rankings.',
      action: 'Lack of market interest - consider why stock is ignored.',
    },
    doubleNegativeTrend: {
      signal: 'Negative Short & Long Trend',
      description: 'Both 5D and 20D trends are negative.',
      action: 'Downtrend confirmed across timeframes.',
    },
  },
  valuation: {
    overvaluedVsSector: {
      signal: 'Overvalued vs Sector',
      description: 'P/E is significantly higher than sector average.',
      action: 'Valuation risk - consider switching to sector peers.',
    },
    overvaluedVsHistory: {
      signal: 'Overvalued vs History',
      description: 'P/E is significantly higher than historical average.',
      action: 'Valuation mean reversion risk - upside limited.',
    },
  },
}
