/**
 * Yahoo Finance Types for SET Index (^SET)
 */

/**
 * Historical quote data from Yahoo Finance
 */
export interface YahooHistoricalQuote {
  date: Date
  open: number
  high: number
  low: number
  close: number
  adjClose: number
  volume: number
}

/**
 * Complete SET index data from Yahoo Finance
 */
export interface YahooSetIndexData {
  symbol: string
  quotes: YahooHistoricalQuote[]
  meta: {
    currency: string
    instrumentType: string
    firstTradeDate: number
    timezone: string
  }
}

/**
 * Single day SET index snapshot
 */
export interface YahooSetIndexSnapshot {
  date: string // YYYY-MM-DD
  close: number
  change: number // Change from previous day
  changePercent: number
  high: number
  low: number
  volume: number
}

/**
 * RTDB storage format for SET index data
 */
export interface RTDBSetIndexEntry {
  date: string
  data: {
    close: number
    open: number
    high: number
    low: number
    volume: number
    adjClose: number
    change: number
    changePercent: number
  }
  meta: {
    capturedAt: string
    schemaVersion: number
    source: 'yahoo-finance'
  }
}

/**
 * Simplified SET index for app use
 */
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

/**
 * SET index history for trends
 */
export interface SetIndexHistory {
  current: number
  fiveDayAgo: number | null
  twentyDayAgo: number | null
  ytdStart: number | null
  week52High: number | null
  week52Low: number | null
}

/**
 * Raw Yahoo Finance API response for historical data
 */
export interface YahooFinanceHistoricalResponse {
  quotes: Array<{
    date: Date | string | number
    open?: number
    high?: number
    low?: number
    close?: number
    adjClose?: number
    volume?: number
  }>
  meta?: {
    currency?: string
    instrumentType?: string
    firstTradeDate?: number
    timezone?: string
  }
}
