/**
 * Stock API Types
 *
 * Types for external stock API responses from my-fon-stock-api.vercel.app
 */

// ============================================================================
// OVERVIEW API TYPES
// ============================================================================

/**
 * Decision badge from overview API
 */
export interface DecisionBadge {
  label: string
  score: number
  type: 'bullish' | 'bearish' | 'neutral'
}

/**
 * Layer score component
 * Supports both 3-layer (backwards compatible) and 4-layer systems
 * - 3-layer: quality, valuation, timing
 * - 4-layer: quality, valuation, growth, technical
 */
export interface LayerScore {
  quality: number
  valuation: number
  timing?: number // Optional for backwards compatibility
  growth?: number // NEW: 4th layer (0-100)
  technical?: number // ALTERNATIVE: 4th layer (0-100)
  catalyst?: number // ALTERNATIVE: 4th layer (0-100)
}

/**
 * Price information
 */
export interface PriceInfo {
  current: number
  change: number
  changePercent: number
  dayHigh: number
  dayLow: number
  previousClose: number
}

/**
 * Volume information
 */
export interface VolumeInfo {
  current: number
  average: number
  ratio: number
}

/**
 * Stock overview data
 */
export interface StockOverviewData {
  symbol: string
  name: string
  sector: string
  market: string
  price: PriceInfo
  volume: VolumeInfo
  marketCap: string
  peRatio: number
  pbvRatio: number
  dividendYield: number
  beta: number
  decisionBadge: DecisionBadge
  layerScore: LayerScore
  lastUpdate: string
  week52High?: number // Optional 52-week high
  week52Low?: number // Optional 52-week low
}

/**
 * Overview API response wrapper
 */
export interface StockOverviewResponse {
  success: boolean
  data: StockOverviewData
  cached: boolean
}

// ============================================================================
// STATISTICS API TYPES
// ============================================================================

/**
 * Financial statistics
 */
export interface FinancialStats {
  revenue: number
  netProfit: number
  totalAssets: number
  totalEquity: number
  eps: number
  roe: number
  roa: number
  debtToEquity: number
  currentRatio: number
  quickRatio: number
  epsHistory?: { year: number; eps: number }[]  // EPS history for 5 years
}

/**
 * Valuation metrics
 */
export interface ValuationStats {
  pe: number
  pbv: number
  ev: number
  evEbitda: number
  priceToSales: number
  pegRatio: number
  dividendYield: number
  payoutRatio: number
}

/**
 * Price performance
 */
export interface PricePerformance {
  w1d: number
  w1m: number
  w3m: number
  w6m: number
  ytd: number
  y1: number
}

/**
 * Trading statistics
 */
export interface TradingStats {
  avgVolume1m: number
  avgVolume3m: number
  avgVolume1y: number
  turnover: number
  volatility: number
}

/**
 * Analyst recommendations
 */
export interface AnalystStats {
  rating: string
  targetPrice: number
  recommendation: string
  strongBuy: number
  buy: number
  hold: number
  sell: number
  strongSell: number
}

/**
 * Stock statistics data
 */
export interface StockStatisticsData {
  symbol: string
  financial: FinancialStats
  valuation: ValuationStats
  performance: PricePerformance
  trading: TradingStats
  analyst: AnalystStats
  lastUpdate: string
}

/**
 * Statistics API response wrapper
 */
export interface StockStatisticsResponse {
  success: boolean
  data: StockStatisticsData
  cached: boolean
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Custom error types for API failures
 */
export enum ApiErrorType {
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    public type: ApiErrorType,
    public statusCode: number,
    message: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * API request options
 */
export interface ApiRequestOptions {
  timeout?: number
  retries?: number
  signal?: AbortSignal
}

/**
 * Fetch configuration
 */
export interface FetchConfig {
  timeout: number
  retries: number
  baseURL: string
}
