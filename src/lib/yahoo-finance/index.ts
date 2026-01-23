/**
 * Yahoo Finance Module
 * Main exports for SET index data
 */

export {
  fetchYahooSetIndexHistorical,
  fetchYahooSetIndexByDate,
  toRTDBSetIndexEntry,
  getMissingDates,
  calculate52WeekRange,
} from './set-index'

export type {
  YahooHistoricalQuote,
  YahooSetIndexData,
  YahooSetIndexSnapshot,
  RTDBSetIndexEntry,
  SetIndexHistory,
} from './types'
