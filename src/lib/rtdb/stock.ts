/**
 * Stock Data Fetcher
 *
 * Fetches individual stock data from RTDB
 *
 * NOTE: The example data structure doesn't include individual stock details.
 * Stock data would typically be available at:
 * /settrade/stocks/{symbol} or a similar path
 *
 * This file provides the structure for when stock data becomes available.
 */

import { fetchWithFallback } from './client'
import { getStockPath } from './paths'
import { fetchStockNVDR } from './nvdr'
import type { RTDBStock } from '@/types/rtdb'

/**
 * Fetch stock data by symbol
 * @param symbol Stock symbol
 * @returns Stock data or null if unavailable
 */
export async function fetchStock(symbol: string): Promise<RTDBStock | null> {
  try {
    const normalizedSymbol = symbol.toUpperCase().trim()
    const path = getStockPath(normalizedSymbol)

    const data = await fetchWithFallback<RTDBStock>(path)

    if (!data) {
      return null
    }

    return data
  } catch (error) {
    console.error(`Error fetching stock ${symbol}:`, error)
    return null
  }
}

/**
 * Fetch stock data with NVDR information
 * @param symbol Stock symbol
 * @returns Stock data with NVDR or null if unavailable
 */
export async function fetchStockWithNVDR(symbol: string): Promise<RTDBStock | null> {
  try {
    const normalizedSymbol = symbol.toUpperCase().trim()
    const path = getStockPath(normalizedSymbol)

    const [stock, nvdr] = await Promise.all([
      fetchWithFallback<RTDBStock>(path),
      fetchStockNVDR(normalizedSymbol),
    ])

    if (!stock) {
      return null
    }

    // Attach NVDR data if available
    if (nvdr) {
      stock.nvdr = nvdr
    }

    return stock
  } catch (error) {
    console.error(`Error fetching stock ${symbol}:`, error)
    return null
  }
}

/**
 * Fetch multiple stocks by symbols
 * @param symbols Array of stock symbols
 * @returns Array of stock data (null for unavailable stocks)
 */
export async function fetchStocks(symbols: string[]): Promise<Array<RTDBStock | null>> {
  const promises = symbols.map((symbol) => fetchStock(symbol))
  return Promise.all(promises)
}

/**
 * Fetch stocks in the same sector
 * @param sector Sector ID (e.g., 'BANK', 'ENERG')
 * @param excludeSymbol Symbol to exclude from results
 * @param limit Maximum number of stocks to return
 * @returns Array of stocks in the sector
 */
export async function fetchStocksBySector(
  _sector: string,
  _excludeSymbol?: string,
  _limit: number = 10
): Promise<RTDBStock[]> {
  // Note: This would typically require a stock list or sector index
  // For now, return empty array
  // TODO: Implement when stock list is available

  // Future implementation could:
  // 1. Query /settrade/stocks and filter by sector
  // 2. Use a pre-built index of stocks by sector
  // 3. Cache the results for performance

  return []
}

/**
 * Fetch stock with peers for comparison
 * @param symbol Stock symbol
 * @param peerLimit Maximum number of peers to return (default: 5)
 * @returns Stock data with sector peers
 */
export async function fetchStockWithPeers(
  symbol: string,
  peerLimit: number = 5
): Promise<{
  stock: RTDBStock | null
  peers: RTDBStock[]
}> {
  const stock = await fetchStockWithNVDR(symbol)

  if (!stock || !stock.sectorId) {
    return { stock, peers: [] }
  }

  const peers = await fetchStocksBySector(stock.sectorId, symbol, peerLimit)

  return {
    stock,
    peers: peers.slice(0, peerLimit),
  }
}

/**
 * Check if stock data is fresh
 * @param symbol Stock symbol
 * @param maxAge Maximum age in milliseconds (default: 1 day)
 * @returns true if fresh, false otherwise
 */
export async function isStockDataFresh(
  symbol: string,
  maxAge: number = 24 * 60 * 60 * 1000
): Promise<boolean> {
  const stock = await fetchStock(symbol)

  if (!stock) {
    return false
  }

  const now = Date.now()
  const age = now - stock.timestamp
  return age < maxAge
}

/**
 * Search stocks by symbol prefix
 * @param prefix Symbol prefix to search
 * @param limit Maximum results (default: 20)
 * @returns Array of matching stocks
 */
export async function searchStocksByPrefix(
  _prefix: string,
  _limit: number = 20
): Promise<RTDBStock[]> {
  // Note: This requires a stock index or search capability
  // Future implementation could:
  // 1. Query from /settrade/stocks index
  // 2. Use Firebase's query capabilities
  // 3. Implement client-side filtering if dataset is small enough

  return []
}

/**
 * Get stock valuation metrics
 * @param symbol Stock symbol
 * @returns Valuation metrics or null if unavailable
 */
export async function fetchStockValuation(
  symbol: string
): Promise<{
  pe?: number
  pbv?: number
  dividendYield?: number
  priceToBook?: number
  earningsYield?: number
} | null> {
  const stock = await fetchStock(symbol)

  if (!stock) {
    return null
  }

  const priceToBook = stock.pbv ? stock.price / stock.pbv : undefined
  const earningsYield = stock.pe ? 100 / stock.pe : undefined

  return {
    pe: stock.pe,
    pbv: stock.pbv,
    dividendYield: stock.dividendYield,
    priceToBook,
    earningsYield,
  }
}

/**
 * Get stock price info for display
 * @param symbol Stock symbol
 * @returns Price info or null if unavailable
 */
export async function fetchStockPrice(symbol: string): Promise<{
  price: number
  change: number
  changePercent: number
} | null> {
  const stock = await fetchStock(symbol)

  if (!stock) {
    return null
  }

  return {
    price: stock.price,
    change: stock.change,
    changePercent: stock.changePct,
  }
}

/**
 * Create mock stock data for testing/development
 * @param symbol Stock symbol
 * @param name Stock name (optional)
 * @returns Mock stock data
 */
export function createMockStock(symbol: string, name?: string): RTDBStock {
  const now = Date.now()
  const basePrice = Math.random() * 100 + 10

  return {
    symbol: symbol.toUpperCase(),
    name: name ?? `${symbol.toUpperCase()} - Mock Stock`,
    price: basePrice,
    change: (Math.random() - 0.5) * 2,
    changePct: (Math.random() - 0.5) * 2,
    volume: Math.floor(Math.random() * 10000),
    value: Math.floor(Math.random() * 1000),
    timestamp: now,
  }
}
