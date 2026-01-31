/**
 * Stock Proxy API Types
 *
 * Types for internal proxy API responses
 * These APIs proxy to external stock API with added caching and rate limiting
 */

// Import and re-export overview types from the API route
import type { StockOverviewData } from '@/app/api/stocks/[symbol]/overview/route'

// Import and re-export statistics types from the API route
import type { StockStatisticsData } from '@/app/api/stocks/[symbol]/statistics/route'

// Import and re-export ApiResponse wrapper
import type { ApiResponse } from '@/lib/api/stock-api-utils'

// Re-export types
export type { StockOverviewData, StockStatisticsData, ApiResponse }

/**
 * Combined stock data from proxy APIs
 */
export interface ProxyStockData {
  overview: StockOverviewData
  statistics?: StockStatisticsData
}

/**
 * Formatted stock data for display
 */
export interface FormattedStockData {
  // Basic info
  symbol: string
  name: string
  sector?: string

  // Price
  price: number
  change: number
  changePercent: number

  // Market data
  marketCap?: number
  volume?: number
  pe?: number
  pbv?: number
  dividendYield?: number

  // Additional fields from overview
  previousClose?: number
  dayHigh?: number
  dayLow?: number
  open?: number

  // 52 week range
  week52High?: number
  week52Low?: number

  // Beta
  beta?: number

  // Statistics (optional)
  statistics?: StockStatisticsData
}
