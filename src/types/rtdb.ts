/**
 * RTDB Data Types for fonPick
 * Matches the Firebase Realtime Database structure under /settrade
 */

// ============================================================================
// MARKET OVERVIEW (/settrade/marketOverview/byDate/{date})
// ============================================================================

export interface RTDBMarketOverviewData {
  setIndex: number
  setIndexChg: number
  setIndexChgPct: number
  totalValue: number        // Total trading value in millions
  totalVolume: number       // Total volume in thousands
  advanceCount: number
  declineCount: number
  unchangedCount: number
  newHighCount: number
  newLowCount: number
}

export interface RTDBMarketOverviewMeta {
  capturedAt: string
  schemaVersion: number
  source: string
}

export interface RTDBMarketOverviewEntry {
  data: RTDBMarketOverviewData
  meta: RTDBMarketOverviewMeta
}

// Simplified type for app use
export interface RTDBMarketOverview {
  set: {
    index: number
    change: number
    changePercent: number
  }
  totalMarketCap: number
  totalValue: number
  totalVolume: number
  advanceCount: number
  declineCount: number
  unchangedCount: number
  newHighCount: number
  newLowCount: number
  timestamp: number
}

// ============================================================================
// INVESTOR TYPE (/settrade/investorType/byDate/{date})
// ============================================================================

export interface RTDBInvestorTypeRow {
  buyPct: number
  buyValue: number
  name: string
  netValue: number
  sellPct: number
  sellValue: number
}

export interface RTDBInvestorTypeRows {
  FOREIGN: RTDBInvestorTypeRow           // นักลงทุนต่างประเทศ
  LOCAL_INDIVIDUAL: RTDBInvestorTypeRow  // นักลงทุนทั่วไปในประเทศ
  LOCAL_INST: RTDBInvestorTypeRow        // สถาบันในประเทศ
  PROPRIETARY: RTDBInvestorTypeRow       // บัญชีบริษัทหลักทรัพย์
}

export interface RTDBInvestorTypeMeta {
  capturedAt: string
  schemaVersion: number
  source: string
}

export interface RTDBInvestorTypeEntry {
  rows: RTDBInvestorTypeRows
  meta: RTDBInvestorTypeMeta
}

// Simplified flow type for app use
export interface RTDBInvestorFlow {
  buy: number
  sell: number
  net: number
}

export interface RTDBInvestorType {
  foreign: RTDBInvestorFlow
  institution: RTDBInvestorFlow
  retail: RTDBInvestorFlow
  prop: RTDBInvestorFlow
  timestamp: number
}

// ============================================================================
// INDUSTRY SECTOR (/settrade/industrySector/byDate/{date})
// ============================================================================

export interface RTDBSectorRow {
  chg: number
  chgPct: number
  last: number
  name: string
  valMn: number     // Value in millions
  volK: number      // Volume in thousands
}

export interface RTDBIndustrySectorMeta {
  capturedAt: string
  schemaVersion: number
  source: string
}

export interface RTDBIndustrySectorEntry {
  rows: Record<string, RTDBSectorRow>
  meta: RTDBIndustrySectorMeta
}

// Simplified sector type for app use
export interface RTDBSector {
  id: string
  name: string
  index: number
  change: number
  changePercent: number
  marketCap: number
  volume: number
}

export interface RTDBIndustrySector {
  sectors: RTDBSector[]
  timestamp: number
}

// ============================================================================
// NVDR (/settrade/nvdr/byDate/{date})
// ============================================================================

export interface RTDBNVDRStock {
  b: number  // buy value
  m: number  // market cap
  n: number  // net value
  r: number  // ratio
  s: number  // sell value
  t: number  // total
}

export interface RTDBNVDRData {
  stocks: Record<string, RTDBNVDRStock>
  totalMarketK: number
  totalNVDRK: number
}

export interface RTDBNVDRMeta {
  capturedAt: string
  schemaVersion: number
  source: string
}

export interface RTDBNVDRDEntry {
  data: RTDBNVDRData
  meta: RTDBNVDRMeta
}

// ============================================================================
// SET INDEX HISTORY (/settrade/setIndex/byDate/{date})
// ============================================================================

export interface RTDBSetIndexData {
  close: number
  open: number
  high: number
  low: number
  volume: number
  adjClose: number
  change: number
  changePercent: number
}

export interface RTDBSetIndexMeta {
  capturedAt: string
  schemaVersion: number
  source: 'yahoo-finance'
}

export interface RTDBSetIndexEntry {
  date: string
  data: RTDBSetIndexData
  meta: RTDBSetIndexMeta
}

// Simplified for app use
export interface RTDBSetIndex {
  date: string
  index: number
  change: number
  changePercent: number
  high: number
  low: number
  volume: number
  timestamp: number
}

// ============================================================================
// TOP RANKINGS (Derived from sector/stock data)
// ============================================================================

export interface RTDBTopStock {
  symbol: string
  name?: string
  price?: number
  change?: number
  changePct?: number
  volume?: number
  value?: number
}

export interface RTDBTopRankings {
  topGainers: RTDBTopStock[]
  topLosers: RTDBTopStock[]
  topVolume: RTDBTopStock[]
  topValue: RTDBTopStock[]
  timestamp: number
}

// ============================================================================
// ENHANCED TOP RANKINGS (Professional-grade display data)
// ============================================================================

/**
 * Enhanced top stock data with additional professional fields
 * Extends RTDBTopStock with sector, market cap, volume metrics,
 * valuation data, and cross-ranking indicators
 */
export interface RTDBTopStockEnhanced extends RTDBTopStock {
  // Additional professional fields
  sectorCode?: string // 3-4 letter code: 'FIN', 'ENER', 'TECH', 'AGRI', 'PROP'
  marketCapGroup?: 'L' | 'M' | 'S' // Large/Mid/Small cap
  volumeRatio?: number // vs 30-day average (e.g., 2.5x, 0.8x)
  pe?: number // P/E ratio for valuation context
  week52Position?: number // 0-100 position within 52-week range
  foreignNet?: number // NVDR foreign net flow (Million THB)

  // Cross-ranking indicators
  rankings?: {
    gainer?: number // Rank in top gainers (1-10)
    loser?: number // Rank in top losers (1-10)
    volume?: number // Rank in top volume (1-10)
    value?: number // Rank in top value (1-10)
  }
}

/**
 * Enhanced top rankings with cross-ranking detection
 * All stock entries include their rankings across all categories
 */
export interface RTDBTopRankingsEnhanced {
  topGainers: RTDBTopStockEnhanced[]
  topLosers: RTDBTopStockEnhanced[]
  topVolume: RTDBTopStockEnhanced[]
  topValue: RTDBTopStockEnhanced[]
  timestamp: number
}

// ============================================================================
// STOCK DATA (Aggregated from various sources)
// ============================================================================

export interface RTDBStock {
  symbol: string
  name: string
  sector?: string
  sectorId?: string
  price: number
  change: number
  changePct: number
  volume: number
  value: number
  marketCap?: number
  // Fundamental data (from separate source)
  pe?: number
  pbv?: number
  dividendYield?: number
  roe?: number
  debtToEquity?: number
  eps?: number
  // NVDR data if available
  nvdr?: RTDBNVDRStock
  // Timestamp
  timestamp: number
}

// ============================================================================
// META
// ============================================================================

export interface RTDBMeta {
  lastUpdate: number
  schemaVersion: number
  latestDate: string
  version: string
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type RTDBDataByDate<T> = Record<string, T>

export interface RTDBResponse<T> {
  byDate: RTDBDataByDate<T>
  [key: string]: unknown
}
