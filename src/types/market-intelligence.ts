/**
 * Market Intelligence Dashboard Types
 * TDD: Scaffolding phase - defining interfaces first
 */

import type { RegimeResult } from './market'
import type { SmartMoneyAnalysis } from './smart-money'
import type { SectorRotationAnalysis } from './sector-rotation'

// ============================================================================
// DASHBOARD DATA STRUCTURE
// ============================================================================

/**
 * Complete dashboard data
 */
export interface MarketIntelligenceData {
  regime: RegimeResult | null
  smartMoney: SmartMoneyAnalysis | null
  sectorRotation: SectorRotationAnalysis | null
  activeStocks: ActiveStocksAnalysis | null
  marketOverview: {
    setIndex: number
    setChange: number
    setChangePercent: number
    totalValue: number
    totalVolume: number
    timestamp: number
  } | null
  timestamp: number
  freshness: DataFreshness
}

/**
 * Data freshness information
 */
export interface DataFreshness {
  isFresh: boolean
  maxAgeMinutes: number
  sources: {
    market: number
    investor: number
    sector: number
    rankings: number
  }
}

// ============================================================================
// ACTIVE STOCKS ANALYSIS (P2)
// ============================================================================

/**
 * Active stocks concentration analysis
 */
export interface ActiveStocksAnalysis {
  topByValue: StockConcentration[]
  topByVolume: StockConcentration[]
  crossRanked: CrossRankedStock[]
  metrics: ConcentrationMetrics
  observations: string[]
  timestamp: number
}

/**
 * Stock with concentration data
 */
export interface StockConcentration {
  symbol: string
  name?: string
  value: number
  volume: number
  changePercent: number
  sectorCode?: string
  marketCapGroup?: 'L' | 'M' | 'S'
  concentrationScore: number
  valuePercentOfTotal: number
  rankings?: {
    value?: number
    volume?: number
    gainer?: number
    loser?: number
  }
  /** Phase 2: Accumulation pattern analysis */
  accumulationPattern?: AccumulationPattern
  /** Phase 2: Number of days in this pattern */
  accumulationDays?: number
}

/**
 * Accumulation pattern types
 */
export type AccumulationPattern =
  | 'Strong Accumulation'
  | 'Accumulation'
  | 'Neutral'
  | 'Distribution'
  | 'Strong Distribution'

/**
 * Accumulation pattern analysis details
 */
export interface AccumulationAnalysis {
  pattern: AccumulationPattern
  daysInPattern: number
  confidence: 'High' | 'Medium' | 'Low'
  signals: {
    volumeTrend: 'Increasing' | 'Stable' | 'Decreasing'
    priceAction: 'Strong' | 'Moderate' | 'Weak'
    smartMoneyFlow: 'Inflow' | 'Neutral' | 'Outflow'
  }
}

/**
 * Stock appearing in multiple rankings
 */
export interface CrossRankedStock {
  symbol: string
  name?: string
  rankings: {
    value?: number
    volume?: number
    gainer?: number
    loser?: number
  }
  rankingCount: number
  strengthScore: number
}

/**
 * Concentration metrics
 */
export interface ConcentrationMetrics {
  top10ValueConcentration: number
  top5StockConcentration: number
  crossRankedCount: number
  hhi: number
  interpretation: 'Highly Concentrated' | 'Moderately Concentrated' | 'Broadly Distributed'
  totalValue?: number
}

// ============================================================================
// DASHBOARD INPUT
// ============================================================================

/**
 * Input for market intelligence aggregation
 */
export interface MarketIntelligenceInput {
  marketOverview: {
    setIndex: number
    setChange: number
    setChangePercent: number
    totalValue: number
    totalVolume: number
    timestamp: number
  } | null

  investorType: {
    foreign: { buy: number; sell: number; net: number }
    institution: { buy: number; sell: number; net: number }
    retail: { buy: number; sell: number; net: number }
    prop: { buy: number; sell: number; net: number }
    timestamp: number
  } | null

  industrySector: {
    sectors: Array<{
      id: string
      name: string
      changePercent: number
      marketCap: number
      volume: number
    }>
    timestamp: number
  } | null

  rankings: {
    topValue: Array<{
      symbol: string
      name?: string
      value?: number
      volume?: number
      changePct?: number
      sectorCode?: string
      marketCapGroup?: 'L' | 'M' | 'S'
    }>
    topVolume: Array<{
      symbol: string
      name?: string
      value?: number
      volume?: number
      changePct?: number
      sectorCode?: string
      marketCapGroup?: 'L' | 'M' | 'S'
    }>
    topGainers: Array<{
      symbol: string
      name?: string
      changePct?: number
      value?: number
    }>
    topLosers: Array<{
      symbol: string
      name?: string
      changePct?: number
      value?: number
    }>
    timestamp: number
  } | null

  historical?: {
    investorTypes?: Array<{
      foreign: { net: number }
      institution: { net: number }
      retail: { net: number }
      prop: { net: number }
      timestamp: number
    }>
    sectors?: Array<{
      sectors: Array<{
        id: string
        changePercent: number
      }>
      timestamp: number
    }>
  }
}

// ============================================================================
// DASHBOARD CONFIGURATION
// ============================================================================

/**
 * Dashboard configuration options
 */
export interface DashboardOptions {
  includeP0?: boolean
  includeP1?: boolean
  includeP2?: boolean
  topSectorsCount?: number
  bottomSectorsCount?: number
  topStocksCount?: number
  maxDataAgeMinutes?: number
}

/**
 * Default dashboard options
 */
export const DEFAULT_DASHBOARD_OPTIONS: Required<DashboardOptions> = {
  includeP0: true,
  includeP1: true,
  includeP2: true,
  topSectorsCount: 5,
  bottomSectorsCount: 5,
  topStocksCount: 10,
  maxDataAgeMinutes: 60,
}
