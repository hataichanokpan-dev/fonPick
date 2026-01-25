/**
 * Stock Decline Diagnostic Service
 *
 * TDD Implementation: This code was written to pass the tests in
 * stock-decline-diagnostic.test.ts
 *
 * Analyzes why a stock is declining based on 5 dimensions:
 * 1. Volume Signals
 * 2. Sector/Market Context
 * 3. Smart Money Flow
 * 4. Technical/Price Action
 * 5. Valuation Concerns
 */

import type {
  StockDiagnosticInput,
  StockDiagnosticResult,
  DiagnosticFlag,
  DiagnosticCategory,
  DiagnosticAction,
  TechnicalIndicators,
  VolumeAnalysisData,
  SectorPerformance,
  RegimeContext,
  SmartMoneyAnalysis,
  ValuationData,
} from '@/types/diagnostic'
import {
  DEFAULT_DIAGNOSTIC_THRESHOLDS,
  FLAG_DESCRIPTIONS,
} from '@/types/diagnostic'

// ============================================================================
// VOLUME SIGNAL CHECKS
// ============================================================================

/**
 * Check volume signals for diagnostic flags
 */
export function checkVolumeSignals(
  _symbol: string,
  volume: VolumeAnalysisData,
  technical?: TechnicalIndicators
): DiagnosticFlag[] {
  const flags: DiagnosticFlag[] = []

  // Check 1: Health score < 30 = Red Flag (Anemic)
  if (volume.health.healthScore < DEFAULT_DIAGNOSTIC_THRESHOLDS.volumeHealthThreshold) {
    flags.push({
      category: 'volume',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.volume.anemic.signal,
      description: FLAG_DESCRIPTIONS.volume.anemic.description,
      action: FLAG_DESCRIPTIONS.volume.anemic.action,
      value: volume.health.healthScore,
    })
  }

  // Check 2: VWAD <= -30 = Red Flag (Bearish conviction)
  if (volume.vwad.vwad <= DEFAULT_DIAGNOSTIC_THRESHOLDS.vwadBearishThreshold) {
    flags.push({
      category: 'volume',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.volume.bearishVWAD.signal,
      description: FLAG_DESCRIPTIONS.volume.bearishVWAD.description,
      action: FLAG_DESCRIPTIONS.volume.bearishVWAD.action,
      value: volume.vwad.vwad,
    })
  }

  // Check 3: Concentration >= 40% = Red Flag (Illiquid)
  if (volume.concentration.concentration >= DEFAULT_DIAGNOSTIC_THRESHOLDS.concentrationThreshold) {
    flags.push({
      category: 'volume',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.volume.illiquid.signal,
      description: FLAG_DESCRIPTIONS.volume.illiquid.description,
      action: FLAG_DESCRIPTIONS.volume.illiquid.action,
      value: volume.concentration.concentration,
    })
  }

  // Check 4: Relative volume < 0.5x = Yellow Flag
  if (technical && technical.relativeVolume !== undefined) {
    if (technical.relativeVolume < DEFAULT_DIAGNOSTIC_THRESHOLDS.relativeVolumeLowThreshold) {
      flags.push({
        category: 'volume',
        severity: 'yellow',
        signal: FLAG_DESCRIPTIONS.volume.lowRelativeVolume.signal,
        description: FLAG_DESCRIPTIONS.volume.lowRelativeVolume.description,
        action: FLAG_DESCRIPTIONS.volume.lowRelativeVolume.action,
        value: technical.relativeVolume,
      })
    }
  }

  return flags
}

// ============================================================================
// SECTOR/MARKET CONTEXT CHECKS
// ============================================================================

/**
 * Check sector and market context signals for diagnostic flags
 */
export function checkSectorSignals(
  _symbol: string,
  sector?: SectorPerformance,
  regimeContext?: RegimeContext
): DiagnosticFlag[] {
  const flags: DiagnosticFlag[] = []

  // Check 1: Sector in "Laggards" = Red Flag
  if (sector) {
    if (sector.momentum === 'Underperform' || sector.momentum === 'Significant Lag') {
      flags.push({
        category: 'sector',
        severity: 'red',
        signal: FLAG_DESCRIPTIONS.sector.laggard.signal,
        description: FLAG_DESCRIPTIONS.sector.laggard.description,
        action: FLAG_DESCRIPTIONS.sector.laggard.action,
        value: sector.vsMarket,
      })
    }

    // Check 2: "Exit" rotation signal >= 70% confidence = Red Flag
    if (sector.signal === 'Exit' && sector.confidence >= 70) {
      flags.push({
        category: 'sector',
        severity: 'red',
        signal: FLAG_DESCRIPTIONS.sector.exitSignal.signal,
        description: FLAG_DESCRIPTIONS.sector.exitSignal.description,
        action: FLAG_DESCRIPTIONS.sector.exitSignal.action,
        value: sector.confidence,
      })
    }
  }

  // Check 3: Market regime "Risk-Off" confirmed = Red Flag
  if (regimeContext && regimeContext.regime === 'Risk-Off' && regimeContext.confirmed) {
    flags.push({
      category: 'sector',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.sector.riskOff.signal,
      description: FLAG_DESCRIPTIONS.sector.riskOff.description,
      action: FLAG_DESCRIPTIONS.sector.riskOff.action,
    })
  }

  return flags
}

// ============================================================================
// SMART MONEY FLOW CHECKS
// ============================================================================

/**
 * Check smart money flow signals for diagnostic flags
 */
export function checkSmartMoneySignals(
  smartMoney: SmartMoneyAnalysis
): DiagnosticFlag[] {
  const flags: DiagnosticFlag[] = []

  // Check 1: Foreign net flow < -500M THB = Red Flag (Strong Sell)
  const foreignNet = smartMoney.investors.foreign.todayNet
  if (foreignNet < -DEFAULT_DIAGNOSTIC_THRESHOLDS.strongForeignSellThreshold) {
    flags.push({
      category: 'smart_money',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.smartMoney.foreignStrongSell.signal,
      description: FLAG_DESCRIPTIONS.smartMoney.foreignStrongSell.description,
      action: FLAG_DESCRIPTIONS.smartMoney.foreignStrongSell.action,
      value: foreignNet,
    })
  }

  // Check 2: Institution net flow < -100M THB = Red Flag
  const institutionNet = smartMoney.investors.institution.todayNet
  if (institutionNet < -DEFAULT_DIAGNOSTIC_THRESHOLDS.institutionSellThreshold) {
    flags.push({
      category: 'smart_money',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.smartMoney.institutionSell.signal,
      description: FLAG_DESCRIPTIONS.smartMoney.institutionSell.description,
      action: FLAG_DESCRIPTIONS.smartMoney.institutionSell.action,
      value: institutionNet,
    })
  }

  // Check 3: Smart money score < 40 = Red Flag
  if (smartMoney.score < DEFAULT_DIAGNOSTIC_THRESHOLDS.smartMoneyScoreThreshold) {
    flags.push({
      category: 'smart_money',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.smartMoney.lowScore.signal,
      description: FLAG_DESCRIPTIONS.smartMoney.lowScore.description,
      action: FLAG_DESCRIPTIONS.smartMoney.lowScore.action,
      value: smartMoney.score,
    })
  }

  // Check 4: 5-day cumulative < -200 = Red Flag
  const foreign5Day = smartMoney.investors.foreign.trend5Day
  if (foreign5Day < DEFAULT_DIAGNOSTIC_THRESHOLDS.cumulativeFlowThreshold) {
    flags.push({
      category: 'smart_money',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.smartMoney.negativeCumulative.signal,
      description: FLAG_DESCRIPTIONS.smartMoney.negativeCumulative.description,
      action: FLAG_DESCRIPTIONS.smartMoney.negativeCumulative.action,
      value: foreign5Day,
    })
  }

  return flags
}

// ============================================================================
// TECHNICAL/PRICE ACTION CHECKS
// ============================================================================

/**
 * Check technical and price action signals for diagnostic flags
 */
export function checkTechnicalSignals(
  symbol: string,
  technical: TechnicalIndicators,
  rankings: { topGainers: Array<{ symbol: string }>; topLosers: Array<{ symbol: string }>; topVolume: Array<{ symbol: string }>; topValue: Array<{ symbol: string }> }
): DiagnosticFlag[] {
  const flags: DiagnosticFlag[] = []

  // Check 1: In top 10 losers = Red Flag
  if (technical.isTopLoser) {
    flags.push({
      category: 'technical',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.technical.topLoser.signal,
      description: FLAG_DESCRIPTIONS.technical.topLoser.description,
      action: FLAG_DESCRIPTIONS.technical.topLoser.action,
    })
  }

  // Check 2: 52-week position < 20% = Red Flag
  if (technical.week52Position < DEFAULT_DIAGNOSTIC_THRESHOLDS.week52PositionLowThreshold) {
    flags.push({
      category: 'technical',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.technical.low52Week.signal,
      description: FLAG_DESCRIPTIONS.technical.low52Week.description,
      action: FLAG_DESCRIPTIONS.technical.low52Week.action,
      value: technical.week52Position,
    })
  }

  // Check 3: Missing from all rankings = Yellow Flag
  const allRankings = [
    ...rankings.topGainers,
    ...rankings.topLosers,
    ...rankings.topVolume,
    ...rankings.topValue,
  ]
  const isInRankings = allRankings.some(r => r.symbol === symbol)

  if (!technical.isInAnyRanking && !isInRankings) {
    flags.push({
      category: 'technical',
      severity: 'yellow',
      signal: FLAG_DESCRIPTIONS.technical.missingRankings.signal,
      description: FLAG_DESCRIPTIONS.technical.missingRankings.description,
      action: FLAG_DESCRIPTIONS.technical.missingRankings.action,
    })
  }

  // Check 4: 5D & 20D trends both negative = Red Flag
  if (technical.trend5D < 0 && technical.trend20D < 0) {
    flags.push({
      category: 'technical',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.technical.doubleNegativeTrend.signal,
      description: FLAG_DESCRIPTIONS.technical.doubleNegativeTrend.description,
      action: FLAG_DESCRIPTIONS.technical.doubleNegativeTrend.action,
    })
  }

  return flags
}

// ============================================================================
// VALUATION CONCERN CHECKS
// ============================================================================

/**
 * Check valuation concern signals for diagnostic flags
 */
export function checkValuationSignals(
  valuation?: ValuationData
): DiagnosticFlag[] {
  const flags: DiagnosticFlag[] = []

  if (!valuation || valuation.stockPE === undefined) {
    return flags
  }

  // Check 1: P/E > sector by > 30% = Red Flag
  if (
    valuation.sectorPE &&
    valuation.sectorPE > 0 &&
    valuation.stockPE > valuation.sectorPE * DEFAULT_DIAGNOSTIC_THRESHOLDS.peOvervaluationThreshold
  ) {
    flags.push({
      category: 'valuation',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.valuation.overvaluedVsSector.signal,
      description: FLAG_DESCRIPTIONS.valuation.overvaluedVsSector.description,
      action: FLAG_DESCRIPTIONS.valuation.overvaluedVsSector.action,
    })
  }

  // Check 2: P/E > history by > 30% = Red Flag
  if (
    valuation.historicalPE &&
    valuation.historicalPE > 0 &&
    valuation.stockPE > valuation.historicalPE * DEFAULT_DIAGNOSTIC_THRESHOLDS.peOvervaluationThreshold
  ) {
    flags.push({
      category: 'valuation',
      severity: 'red',
      signal: FLAG_DESCRIPTIONS.valuation.overvaluedVsHistory.signal,
      description: FLAG_DESCRIPTIONS.valuation.overvaluedVsHistory.description,
      action: FLAG_DESCRIPTIONS.valuation.overvaluedVsHistory.action,
    })
  }

  return flags
}

// ============================================================================
// ACTION DECISION MATRIX
// ============================================================================

/**
 * Determine overall action based on flag counts
 * Action Decision Matrix:
 * - 3+ Red Flags -> IMMEDIATE_SELL
 * - 2 Red + 2+ Yellow -> STRONG_SELL / REDUCE 50%
 * - 1-2 Red Flags -> TRIM 25-30%
 * - 3+ Yellow -> HOLD (don't add)
 * - 0-2 Yellow -> HOLD (normal volatility)
 */
export function determineOverallAction(
  flags: DiagnosticFlag[]
): DiagnosticAction {
  const redCount = flags.filter(f => f.severity === 'red').length
  const yellowCount = flags.filter(f => f.severity === 'yellow').length

  if (redCount >= 3) {
    return 'IMMEDIATE_SELL'
  }

  if (redCount === 2 && yellowCount >= 2) {
    return 'STRONG_SELL'
  }

  if (redCount >= 1) {
    return 'TRIM'
  }

  return 'HOLD'
}

// ============================================================================
// SUMMARY GENERATION
// ============================================================================

/**
 * Generate human-readable diagnostic summary
 */
export function generateDiagnosticSummary(
  symbol: string,
  allFlags: DiagnosticFlag[],
  action: DiagnosticAction
): string {
  const redCount = allFlags.filter(f => f.severity === 'red').length
  const yellowCount = allFlags.filter(f => f.severity === 'yellow').length

  const flagSummary = `${redCount} red flag${redCount !== 1 ? 's' : ''}, ${yellowCount} yellow flag${yellowCount !== 1 ? 's' : ''}`

  switch (action) {
    case 'IMMEDIATE_SELL':
      return `${symbol}: ${action} - Critical warning! ${flagSummary}. Multiple system failures detected across volume, smart money, and technical indicators. Immediate position reduction recommended.`

    case 'STRONG_SELL':
      return `${symbol}: ${action} - Strong sell signal. ${flagSummary}. Confirmed selling pressure across multiple dimensions. Consider reducing 50% of position.`

    case 'TRIM':
      return `${symbol}: ${action} - Moderate warning. ${flagSummary}. Some concerning signals detected. Consider trimming 25-30% of position.`

    case 'HOLD':
      if (allFlags.length === 0) {
        return `${symbol}: ${action} - No significant decline signals detected. normal volatility. Continue monitoring.`
      }
      return `${symbol}: ${action} - Caution advised. ${flagSummary}. Minor concerns but no immediate action required. Maintain current position.`

    default:
      return `${symbol}: ${action} - ${flagSummary}.`
  }
}

// ============================================================================
// RISK LEVEL CALCULATION
// ============================================================================

/**
 * Calculate risk level (0-100) based on flags
 */
function calculateRiskLevel(flags: DiagnosticFlag[]): number {
  let risk = 0

  for (const flag of flags) {
    if (flag.severity === 'red') {
      risk += 25
    } else {
      risk += 10
    }
  }

  return Math.min(100, risk)
}

// ============================================================================
// FLAG COUNTS BY CATEGORY
// ============================================================================

/**
 * Count flags by category and severity
 */
function countFlagsByCategory(
  flags: DiagnosticFlag[]
): StockDiagnosticResult['flagCounts']['byCategory'] {
  const counts: Record<DiagnosticCategory, { red: number; yellow: number }> = {
    volume: { red: 0, yellow: 0 },
    sector: { red: 0, yellow: 0 },
    smart_money: { red: 0, yellow: 0 },
    technical: { red: 0, yellow: 0 },
    valuation: { red: 0, yellow: 0 },
  }

  for (const flag of flags) {
    if (counts[flag.category]) {
      if (flag.severity === 'red') {
        counts[flag.category].red++
      } else {
        counts[flag.category].yellow++
      }
    }
  }

  return counts
}

// ============================================================================
// MAIN DIAGNOSTIC FUNCTION
// ============================================================================

/**
 * Perform complete stock decline diagnostic analysis
 *
 * This is the main entry point for the diagnostic system.
 * It analyzes a stock across 5 dimensions and provides
 * actionable recommendations.
 */
export function diagnoseStockDecline(
  input: StockDiagnosticInput
): StockDiagnosticResult {
  const { symbol, technical, volume, sector, regimeContext, smartMoney, rankings, valuation } = input

  // Collect all flags from all dimensions
  const allFlags: DiagnosticFlag[] = [
    ...checkVolumeSignals(symbol, volume, technical),
    ...checkSectorSignals(symbol, sector, regimeContext),
    ...checkSmartMoneySignals(smartMoney),
    ...checkTechnicalSignals(symbol, technical, rankings),
    ...checkValuationSignals(valuation),
  ]

  // Separate by severity
  const redFlags = allFlags.filter(f => f.severity === 'red')
  const yellowFlags = allFlags.filter(f => f.severity === 'yellow')

  // Determine overall action
  const overallAction = determineOverallAction(allFlags)

  // Generate summary
  const summary = generateDiagnosticSummary(symbol, allFlags, overallAction)

  // Calculate risk level
  const riskLevel = calculateRiskLevel(allFlags)

  // Count flags by category
  const flagCounts = {
    red: redFlags.length,
    yellow: yellowFlags.length,
    byCategory: countFlagsByCategory(allFlags),
  }

  return {
    symbol,
    overallAction,
    redFlags,
    yellowFlags,
    summary,
    flagCounts,
    riskLevel,
    timestamp: Date.now(),
  }
}

// ============================================================================
// EXPORT DIAGNOSTIC TYPES
// ============================================================================

export type {
  StockDiagnosticInput,
  StockDiagnosticResult,
  DiagnosticFlag,
  DiagnosticCategory,
  DiagnosticAction,
  TechnicalIndicators,
  VolumeAnalysisData,
  SectorPerformance,
  RegimeContext,
  SmartMoneyAnalysis,
  ValuationData,
} from '@/types/diagnostic'
