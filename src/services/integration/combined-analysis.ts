/**
 * Combined Analysis Service
 *
 * Orchestrates all market analysis services to provide a complete
 * market picture. This is the main integration layer for Phase 2.
 *
 * Part of Phase 2: Cross-Analysis - Service Integration Layer
 */

import { rtdbGet, fetchWithFallback } from '@/lib/rtdb/client'
import { RTDB_PATHS, getDateDaysAgo, getTodayDate } from '@/lib/rtdb/paths'
import { analyzeMarketBreadth } from '@/services/market-breadth/analyzer'
import { analyzeSectorRotation } from '@/services/sector-rotation/analyzer'
import { mapRankingsToSectors } from '@/services/sector-rotation/mapper'
import { analyzeSmartMoney } from '@/services/smart-money/signal'
import {
  analyzeRankingsSectorCorrelation,
  analyzeRankingsImpact,
} from '@/services/correlations/analyzer'
import { generateActionableInsights } from '@/services/insights/generator'
import type { InsightInputs } from '@/types/insights'
import type { ActionableInsights } from '@/types/insights'
import type { MarketBreadthAnalysis } from '@/types/market-breadth'
import type { SectorRotationAnalysis, RankingsSectorMap } from '@/types/sector-rotation'
import type { SmartMoneyAnalysis } from '@/types/smart-money'
import type { RankingsVsSectorAnalysis, RankingsImpactAnalysis } from '@/types/correlation'
import type { RTDBMarketOverview, RTDBIndustrySector, RTDBInvestorType, RTDBTopRankings } from '@/types/rtdb'

// ============================================================================
// ANALYSIS RESULT TYPES
// ============================================================================

/**
 * Complete market analysis result
 * Contains all individual analyses and the combined insights
 */
export interface CompleteMarketAnalysis {
  /** Market breadth analysis */
  breadth: MarketBreadthAnalysis

  /** Sector rotation analysis */
  sectorRotation: SectorRotationAnalysis

  /** Smart money analysis */
  smartMoney: SmartMoneyAnalysis

  /** Rankings-sector correlation (if rankings data available) */
  correlation?: RankingsVsSectorAnalysis

  /** Rankings impact analysis (if rankings data available) */
  rankingsImpact?: RankingsImpactAnalysis

  /** Combined actionable insights */
  insights: ActionableInsights

  /** Metadata about the analysis */
  meta: AnalysisMetadata
}

/**
 * Analysis metadata
 */
export interface AnalysisMetadata {
  /** Analysis date (YYYY-MM-DD) */
  date: string

  /** Timestamp when analysis was performed */
  timestamp: number

  /** Data availability status */
  dataAvailability: {
    marketOverview: boolean
    industrySector: boolean
    investorType: boolean
    topRankings: boolean
  }

  /** Historical data points available */
  historicalDataPoints: {
    market: number
    sector: number
    investor: number
  }

  /** Analysis duration in milliseconds (if measured) */
  duration?: number
}

/**
 * Analysis options
 */
export interface AnalysisOptions {
  /** Target date (defaults to today) */
  date?: string

  /** Number of historical days to include (default: 5) */
  historicalDays?: number

  /** Include rankings cross-analysis (default: true) */
  includeRankings?: boolean

  /** Include prop trading analysis (default: true) */
  includePropTrading?: boolean

  /** Measure analysis performance (default: false) */
  measurePerformance?: boolean
}

// ============================================================================
// MAIN ORCHESTRATION FUNCTION
// ============================================================================

/**
 * Get complete market analysis
 *
 * Main entry point for combining all analysis services.
 * Fetches all required data from RTDB and performs all analyses.
 *
 * @param options Analysis options
 * @returns Complete market analysis
 *
 * @example
 * ```ts
 * const analysis = await getCompleteMarketAnalysis({
 *   date: '2024-01-15',
 *   historicalDays: 5,
 *   includeRankings: true,
 * })
 *
 * console.log(analysis.insights.trading.action) // 'Buy' | 'Sell' | 'Hold'
 * console.log(analysis.breadth.status) // 'Bullish' | 'Bearish' | 'Neutral'
 * ```
 */
export async function getCompleteMarketAnalysis(
  options: AnalysisOptions = {}
): Promise<CompleteMarketAnalysis> {
  const startTime = options.measurePerformance ? performance.now() : undefined

  // Determine target date
  const targetDate = options.date ?? getTodayDate()
  const historicalDays = options.historicalDays ?? 5

  // Fetch all data in parallel for maximum performance
  const [
    marketOverview,
    industrySector,
    investorType,
    topRankings,
    historicalMarket,
    historicalSector,
    historicalInvestor,
  ] = await Promise.all([
    // Current data
    fetchWithFallback<RTDBMarketOverview>(
      RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(targetDate),
      RTDB_PATHS.MARKET_OVERVIEW_PREVIOUS
    ),
    fetchWithFallback<RTDBIndustrySector>(
      RTDB_PATHS.INDUSTRY_SECTOR_BY_DATE(targetDate),
      RTDB_PATHS.INDUSTRY_SECTOR_PREVIOUS
    ),
    fetchWithFallback<RTDBInvestorType>(
      RTDB_PATHS.INVESTOR_TYPE_BY_DATE(targetDate),
      RTDB_PATHS.INVESTOR_TYPE_PREVIOUS
    ),
    options.includeRankings !== false
      ? rtdbGet<RTDBTopRankings>(RTDB_PATHS.RANKINGS_BY_DATE(targetDate))
      : Promise.resolve(undefined),
    // Historical data
    fetchHistoricalData<RTDBMarketOverview>(
      'MARKET_OVERVIEW_BY_DATE',
      historicalDays
    ),
    fetchHistoricalData<RTDBIndustrySector>(
      'INDUSTRY_SECTOR_BY_DATE',
      historicalDays
    ),
    fetchHistoricalData<RTDBInvestorType>(
      'INVESTOR_TYPE_BY_DATE',
      historicalDays
    ),
  ])

  // Build metadata
  const dataAvailability = {
    marketOverview: !!marketOverview,
    industrySector: !!industrySector,
    investorType: !!investorType,
    topRankings: !!topRankings,
  }

  const historicalDataPoints = {
    market: historicalMarket.length,
    sector: historicalSector.length,
    investor: historicalInvestor.length,
  }

  // Check if we have minimum required data
  if (!marketOverview || !industrySector || !investorType) {
    throw new Error(
      'Insufficient data available for analysis. ' +
      `Missing: ${[
        !marketOverview && 'marketOverview',
        !industrySector && 'industrySector',
        !investorType && 'investorType',
      ].filter(Boolean).join(', ')}`
    )
  }

  // Perform individual analyses
  const breadth: MarketBreadthAnalysis = analyzeMarketBreadth({
    current: marketOverview,
    historical: historicalMarket.length > 0
      ? historicalMarket.filter((m): m is RTDBMarketOverview => m !== null)
      : undefined,
  })

  const sectorRotation: SectorRotationAnalysis = analyzeSectorRotation({
    sectors: industrySector,
    rankings: topRankings || undefined,
    historical: historicalSector.length > 0
      ? historicalSector.filter((s): s is RTDBIndustrySector => s !== null)
      : undefined,
  })

  const smartMoney: SmartMoneyAnalysis = analyzeSmartMoney({
    current: investorType,
    historical: historicalInvestor.length > 0
      ? historicalInvestor.filter((i): i is RTDBInvestorType => i !== null)
      : undefined,
  })

  // Perform correlation analysis if we have rankings data
  let correlation: RankingsVsSectorAnalysis | undefined
  let rankingsImpact: RankingsImpactAnalysis | undefined
  let rankingsMap: RankingsSectorMap | undefined

  if (topRankings) {
    correlation = analyzeRankingsSectorCorrelation({
      rankings: topRankings,
      sectors: industrySector,
    })

    rankingsImpact = analyzeRankingsImpact({
      rankings: topRankings,
      sectors: industrySector,
    })

    rankingsMap = mapRankingsToSectors(topRankings, industrySector)
  }

  // Generate actionable insights
  const insightsInputs: InsightInputs = {
    breadth,
    sectorRotation,
    smartMoney,
    rankingsMap,
  }

  const insights: ActionableInsights = generateActionableInsights(insightsInputs)

  // Build metadata
  const duration = startTime
    ? Math.round(performance.now() - startTime)
    : undefined

  const meta: AnalysisMetadata = {
    date: targetDate,
    timestamp: Date.now(),
    dataAvailability,
    historicalDataPoints,
    duration,
  }

  return {
    breadth,
    sectorRotation,
    smartMoney,
    correlation,
    rankingsImpact,
    insights,
    meta,
  }
}

// ============================================================================
// QUICK ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get quick market snapshot
 * Returns only the most essential data for a quick view
 *
 * @param date Optional target date
 * @returns Quick market snapshot
 */
async function getQuickMarketSnapshot(date?: string): Promise<{
  verdict: string
  confidence: number
  breadthStatus: string
  volatility: string
  topSectors: string[]
  smartMoneySignal: string
  riskSignal: string
  timestamp: number
}> {
  const analysis = await getCompleteMarketAnalysis({
    date,
    historicalDays: 3, // Less historical for quick snapshot
    includeRankings: true,
  })

  return {
    verdict: analysis.insights.trading.action,
    confidence: analysis.insights.confidence.overall,
    breadthStatus: analysis.breadth.status,
    volatility: analysis.breadth.volatility,
    topSectors: analysis.insights.sectorFocus.slice(0, 3).map(s => s.sector),
    smartMoneySignal: analysis.smartMoney.combinedSignal,
    riskSignal: analysis.smartMoney.riskSignal,
    timestamp: analysis.meta.timestamp,
  }
}

/**
 * Get sector focus only
 * Returns sector rotation data for sector-focused views
 *
 * @param date Optional target date
 * @returns Sector focus data
 */
async function getSectorFocus(date?: string): Promise<{
  pattern: string
  regime: string
  focusSectors: string[]
  avoidSectors: string[]
  entrySignals: Array<{ sector: string; signal: string; confidence: number }>
  exitSignals: Array<{ sector: string; signal: string; confidence: number }>
  timestamp: number
}> {
  const analysis = await getCompleteMarketAnalysis({
    date,
    historicalDays: 5,
    includeRankings: true,
  })

  return {
    pattern: analysis.sectorRotation.pattern,
    regime: analysis.sectorRotation.regimeContext.regime,
    focusSectors: analysis.sectorRotation.focusSectors,
    avoidSectors: analysis.sectorRotation.avoidSectors,
    entrySignals: analysis.sectorRotation.entrySignals.map(s => ({
      sector: s.sector.name,
      signal: s.signal,
      confidence: s.confidence,
    })),
    exitSignals: analysis.sectorRotation.exitSignals.map(s => ({
      sector: s.sector.name,
      signal: s.signal,
      confidence: s.confidence,
    })),
    timestamp: analysis.meta.timestamp,
  }
}

// ============================================================================
// DATA FETCHING HELPERS
// ============================================================================

/**
 * Fetch historical data for a given path
 * @param pathKey RTDB path key
 * @param days Number of days to fetch
 * @returns Array of historical data
 */
async function fetchHistoricalData<T>(
  pathKey: keyof typeof RTDB_PATHS,
  days: number
): Promise<(T | null)[]> {
  const pathFn = RTDB_PATHS[pathKey] as (date: string) => string

  const promises = Array.from({ length: days }, (_, i) => {
    const date = getDateDaysAgo(i + 1)
    return rtdbGet<T>(pathFn(date))
  })

  const results = await Promise.all(promises)
  return results
}

// ============================================================================
// BATCH ANALYSIS (for multiple dates)
// ============================================================================

/**
 * Analyze multiple dates at once
 * Useful for backtesting or historical trend analysis
 *
 * @param dates Array of dates to analyze (YYYY-MM-DD format)
 * @param progressCallback Optional progress callback
 * @returns Array of analyses for each date
 */
async function analyzeDateRange(
  dates: string[],
  progressCallback?: (current: number, total: number, date: string) => void
): Promise<Array<{ date: string; analysis: CompleteMarketAnalysis }>> {
  const results: Array<{ date: string; analysis: CompleteMarketAnalysis }> = []

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]

    try {
      const analysis = await getCompleteMarketAnalysis({
        date,
        historicalDays: 5,
        includeRankings: true,
      })

      results.push({ date, analysis })

      if (progressCallback) {
        progressCallback(i + 1, dates.length, date)
      }
    } catch (error) {
      console.error(`Failed to analyze date ${date}:`, error)
      // Continue with next date
    }
  }

  return results
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  getCompleteMarketAnalysis as default,
  getQuickMarketSnapshot,
  getSectorFocus,
  analyzeDateRange,
}
