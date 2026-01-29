/**
 * Stock Data Types
 */

import type { RTDBStock } from './rtdb'
import type { MarketRegime } from './market'
import type {
  StockOverviewResponse,
  StockStatisticsResponse,
  ApiError,
  ApiErrorType,
} from './stock-api'

/**
 * Enhanced stock data with calculated fields
 */
export interface StockData extends RTDBStock {
  isPositive: boolean
  formattedPrice: string
  formattedChange: string
  formattedVolume: string
  formattedMarketCap: string
}

/**
 * Stock search result
 */
export interface StockSearchResult {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sector?: string
}

/**
 * Stock comparison data
 */
export interface StockComparison {
  primary: StockData
  peers: StockData[]
}

/**
 * Stock metrics for verdict engine
 */
export interface StockMetrics {
  // Price metrics
  price: number
  change: number
  changePercent: number

  // Valuation metrics
  pe?: number
  pbv?: number
  dividendYield?: number

  // Size metrics
  marketCap: number
  volume: number

  // Sector
  sector?: string

  // Calculated metrics
  priceToBook?: number
  earningsYield?: number
}

/**
 * Peer comparison result
 */
export interface PeerComparison {
  symbol: string
  name: string
  pe?: number
  pbv?: number
  dividendYield?: number
  marketCap: number
}

/**
 * Stock detail with market context
 */
export interface StockDetail {
  stock: StockData
  metrics: StockMetrics
  marketRegime: MarketRegime | null
  peers: PeerComparison[]
}

// Re-export stock API types for convenience
export type {
  StockOverviewResponse,
  StockStatisticsResponse,
  ApiError,
  ApiErrorType,
}
