/**
 * Stock Price API Types
 *
 * Types for external stock API price-related endpoints
 * from my-fon-stock-api.vercel.app
 */

// ============================================================================
// PRICE API TYPES
// ============================================================================

/**
 * Current price quote data from external API
 */
export interface StockPriceData {
  currency: string
  marketState: string
  regularMarketPrice: number
  regularMarketChange: number
  regularMarketChangePercent: number
  marketCap: number
  trailingPE: number
  dividendYield: number
  // Optional fields that may or may not be present
  regularMarketOpen?: number
  regularMarketDayHigh?: number
  regularMarketDayLow?: number
  regularMarketPreviousClose?: number
  regularMarketVolume?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  epsTrailingTwelveMonths?: number
  epsForward?: number
  forwardPE?: number
  beta?: number
  bookValue?: number
  priceHint?: number
  dividendRate?: number
  sharesOutstanding?: number
}

/**
 * External price API response wrapper
 */
export interface StockPriceResponse {
  success: boolean
  data: StockPriceData
}

// ============================================================================
// PRICE HISTORY API TYPES
// ============================================================================

/**
 * Historical price data point (OHLCV)
 */
export interface PriceHistoryPoint {
  date: string  // ISO 8601 date string
  open: number
  high: number
  low: number
  close: number
  volume: number
  adjClose?: number  // Adjusted close (optional)
}

/**
 * Price history query parameters
 */
export interface PriceHistoryParams {
  period1?: string | number  // Start date (YYYY-MM-DD or Unix timestamp)
  period2?: string | number  // End date (YYYY-MM-DD or Unix timestamp)
  interval?: '1d' | '1wk' | '1mo'  // Default: '1d'
}

/**
 * External price history API response wrapper
 */
export interface PriceHistoryResponse {
  success: boolean
  data: PriceHistoryPoint[]
}

// ============================================================================
// YEARLY DATA API TYPES
// ============================================================================

/**
 * Yearly financial metrics
 * Note: Most values are strings from the API
 */
export interface YearlyMetrics {
  asset: string
  book_value_per_share: string
  cash?: string
  cash_cycle?: string
  close?: string
  da?: string  // Depreciation & Amortization
  debt_to_equity: string
  dividend_yield?: string
  earning_per_share: string
  earning_per_share_yoy?: string
  end_of_year_date?: string
  equity?: string
  fiscal: number
  gpm?: string  // Gross Profit Margin
  gross_profit?: string
  mkt_cap?: string
  net_profit?: string
  net_profit_yoy?: string
  npm?: string  // Net Profit Margin
  operating_activities?: string
  financing_activities?: string
  price_book_value?: string
  price_earning_ratio?: string
  quarter: number
  revenue?: string
  revenue_yoy?: string
  roa?: string
  roe: string
  security_id?: string
  sga?: string  // Selling, General & Administrative
  sga_per_revenue?: string
  total_debt?: string
}

/**
 * External yearly data API response wrapper
 * Key-value object where key is year string (e.g., "2023")
 */
export interface YearlyDataResponse {
  success: boolean
  data: Record<string, YearlyMetrics>
}

// ============================================================================
// QUARTERLY OPERATIONS API TYPES
// ============================================================================

/**
 * Quarterly operational metrics
 * Note: Most values are strings from the API
 */
export interface QuarterlyMetrics {
  asset: string
  book_value_per_share: string
  cash?: string
  cash_cycle?: string
  close?: string
  da?: string
  debt_to_equity?: string
  dividend_yield?: string
  earning_per_share: string
  earning_per_share_qoq?: string
  equity?: string
  fiscal: number
  gpm?: string
  gross_profit?: string
  mkt_cap?: string
  net_profit?: string
  net_profit_qoq?: string
  npm?: string
  operating_activities?: string
  financing_activities?: string
  price_book_value?: string
  price_earning_ratio?: string
  quarter: 1 | 2 | 3 | 4
  revenue?: string
  revenue_qoq?: string
  roa?: string
  roe: string
  security_id?: string
  sga?: string
  sga_per_revenue?: string
  total_debt?: string
}

/**
 * Quarterly period format: "YYYY-Q#" (e.g., "2023-Q4")
 */
export type QuarterlyPeriod = `${number}-Q${1 | 2 | 3 | 4}`

/**
 * External quarterly operations API response wrapper
 * Key-value object where key is period string (e.g., "2023-Q4")
 */
export interface QuarterlyOperationsResponse {
  success: boolean
  data: Record<string, QuarterlyMetrics>
}
