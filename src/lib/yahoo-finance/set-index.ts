/**
 * Yahoo Finance SET Index Data Fetcher
 *
 * Fetches historical SET index data from Yahoo Finance
 * Symbol: ^SET
 */

import yahooFinance from 'yahoo-finance2'
import type {
  YahooHistoricalQuote,
  YahooSetIndexData,
  YahooSetIndexSnapshot,
  RTDBSetIndexEntry,
} from './types'

const SET_SYMBOL = '^SET'

/**
 * Fetch historical SET index data from Yahoo Finance
 * @param startDate Start date (inclusive)
 * @param endDate End date (inclusive)
 * @returns Historical quotes or null on error
 */
export async function fetchYahooSetIndexHistorical(
  startDate: Date,
  endDate: Date
): Promise<YahooSetIndexData | null> {
  try {
    const result: any = await yahooFinance.historical(SET_SYMBOL, {
      from: startDate.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0],
    })

    if (!result) {
      return null
    }

    const quotes = result.quotes as unknown as Array<{
      date: Date | string | number
      open?: number
      high?: number
      low?: number
      close?: number
      adjClose?: number
      volume?: number
    }>

    if (!quotes || quotes.length === 0) {
      return null
    }

    // Transform to our format
    const data: YahooSetIndexData = {
      symbol: SET_SYMBOL,
      quotes: quotes.map((q): YahooHistoricalQuote => {
        const date = new Date(q.date)
        return {
          date,
          open: q.open ?? 0,
          high: q.high ?? 0,
          low: q.low ?? 0,
          close: q.close ?? 0,
          adjClose: q.adjClose ?? q.close ?? 0,
          volume: q.volume ?? 0,
        }
      }),
      meta: {
        currency: (result as any).meta?.currency || 'THB',
        instrumentType: (result as any).meta?.instrumentType || 'INDEX',
        firstTradeDate: (result as any).meta?.firstTradeDate || 0,
        timezone: (result as any).meta?.timezone || 'Asia/Bangkok',
      },
    }

    return data
  } catch (error) {
    console.error('Error fetching Yahoo Finance SET index:', error)
    return null
  }
}

/**
 * Fetch SET index for a specific date
 * @param date Target date
 * @returns SET index snapshot or null
 */
export async function fetchYahooSetIndexByDate(
  date: Date
): Promise<YahooSetIndexSnapshot | null> {
  // Fetch 3 days around the target date to handle weekends/holidays
  const startDate = new Date(date)
  startDate.setDate(startDate.getDate() - 2)

  const endDate = new Date(date)
  endDate.setDate(endDate.getDate() + 1)

  const data = await fetchYahooSetIndexHistorical(startDate, endDate)

  if (!data || data.quotes.length === 0) {
    return null
  }

  // Find the quote closest to the target date
  const targetDate = date.toISOString().split('T')[0]
  const quote = data.quotes.find(
    (q) => q.date.toISOString().split('T')[0] === targetDate
  )

  if (!quote) {
    // Fallback to last available quote
    const lastQuote = data.quotes[data.quotes.length - 1]
    if (!lastQuote) return null

    const change = 0
    const changePercent = 0

    return {
      date: targetDate,
      close: lastQuote.close,
      change,
      changePercent,
      high: lastQuote.high,
      low: lastQuote.low,
      volume: lastQuote.volume,
    }
  }

  // Calculate change from previous day
  const quoteIndex = data.quotes.indexOf(quote)
  const prevQuote = data.quotes[quoteIndex - 1]

  const change = prevQuote ? quote.close - prevQuote.close : 0
  const changePercent = prevQuote ? (change / prevQuote.close) * 100 : 0

  return {
    date: targetDate,
    close: quote.close,
    change,
    changePercent,
    high: quote.high,
    low: quote.low,
    volume: quote.volume,
  }
}

/**
 * Convert Yahoo data to RTDB format
 */
export function toRTDBSetIndexEntry(
  snapshot: YahooSetIndexSnapshot
): RTDBSetIndexEntry {
  return {
    date: snapshot.date,
    data: {
      close: snapshot.close,
      open: snapshot.close - snapshot.change, // Approximate
      high: snapshot.high,
      low: snapshot.low,
      volume: snapshot.volume,
      adjClose: snapshot.close,
      change: snapshot.change,
      changePercent: snapshot.changePercent,
    },
    meta: {
      capturedAt: new Date().toISOString(),
      schemaVersion: 1,
      source: 'yahoo-finance',
    },
  }
}

/**
 * Get missing dates in a range that need to be fetched
 */
export function getMissingDates(
  existingDates: string[],
  startDate: Date,
  endDate: Date
): Date[] {
  const missing: Date[] = []
  const existingSet = new Set(existingDates)

  const current = new Date(startDate)
  while (current <= endDate) {
    const day = current.getDay()
    // Skip weekends
    if (day !== 0 && day !== 6) {
      const dateStr = current.toISOString().split('T')[0]
      if (!existingSet.has(dateStr)) {
        missing.push(new Date(current))
      }
    }
    current.setDate(current.getDate() + 1)
  }

  return missing
}

/**
 * Calculate 52-week high and low from historical quotes
 */
export function calculate52WeekRange(
  quotes: YahooHistoricalQuote[]
): { high: number; low: number } | null {
  if (!quotes.length) return null

  // Filter to last 252 trading days (approximately 52 weeks)
  const tradingDays = 252
  const recentQuotes = quotes.slice(-tradingDays)

  const high = Math.max(...recentQuotes.map((q) => q.high))
  const low = Math.min(...recentQuotes.map((q) => q.low))

  return { high, low }
}
