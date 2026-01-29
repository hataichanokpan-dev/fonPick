/**
 * Zod Validation Schemas for Stock API
 *
 * Runtime validation schemas for external stock API responses
 */

import { z } from 'zod'

// ============================================================================
// OVERVIEW API SCHEMAS
// ============================================================================

/**
 * Decision Badge Schema
 */
export const DecisionBadgeSchema = z.object({
  label: z.string(),
  score: z.number(),
  type: z.enum(['bullish', 'bearish', 'neutral']),
})

/**
 * Layer Score Schema
 */
export const LayerScoreSchema = z.object({
  quality: z.number(),
  valuation: z.number(),
  timing: z.number(),
})

/**
 * Price Info Schema
 */
export const PriceInfoSchema = z.object({
  current: z.number(),
  change: z.number(),
  changePercent: z.number(),
  dayHigh: z.number(),
  dayLow: z.number(),
  previousClose: z.number(),
})

/**
 * Volume Info Schema
 */
export const VolumeInfoSchema = z.object({
  current: z.number(),
  average: z.number(),
  ratio: z.number(),
})

/**
 * Stock Overview Data Schema
 */
export const StockOverviewDataSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  sector: z.string(),
  market: z.string(),
  price: PriceInfoSchema,
  volume: VolumeInfoSchema,
  marketCap: z.string(),
  peRatio: z.number(),
  pbvRatio: z.number(),
  dividendYield: z.number(),
  beta: z.number(),
  decisionBadge: DecisionBadgeSchema,
  layerScore: LayerScoreSchema,
  lastUpdate: z.string(),
})

/**
 * Stock Overview Response Schema
 */
export const StockOverviewResponseSchema = z.object({
  success: z.boolean(),
  data: StockOverviewDataSchema,
  cached: z.boolean(),
})

// ============================================================================
// STATISTICS API SCHEMAS
// ============================================================================

/**
 * Financial Stats Schema
 */
export const FinancialStatsSchema = z.object({
  revenue: z.number(),
  netProfit: z.number(),
  totalAssets: z.number(),
  totalEquity: z.number(),
  eps: z.number(),
  roe: z.number(),
  roa: z.number(),
  debtToEquity: z.number(),
  currentRatio: z.number(),
  quickRatio: z.number(),
})

/**
 * Valuation Stats Schema
 */
export const ValuationStatsSchema = z.object({
  pe: z.number(),
  pbv: z.number(),
  ev: z.number(),
  evEbitda: z.number(),
  priceToSales: z.number(),
  pegRatio: z.number(),
  dividendYield: z.number(),
  payoutRatio: z.number(),
})

/**
 * Price Performance Schema
 */
export const PricePerformanceSchema = z.object({
  w1d: z.number(),
  w1m: z.number(),
  w3m: z.number(),
  w6m: z.number(),
  ytd: z.number(),
  y1: z.number(),
})

/**
 * Trading Stats Schema
 */
export const TradingStatsSchema = z.object({
  avgVolume1m: z.number(),
  avgVolume3m: z.number(),
  avgVolume1y: z.number(),
  turnover: z.number(),
  volatility: z.number(),
})

/**
 * Analyst Stats Schema
 */
export const AnalystStatsSchema = z.object({
  rating: z.string(),
  targetPrice: z.number(),
  recommendation: z.string(),
  strongBuy: z.number(),
  buy: z.number(),
  hold: z.number(),
  sell: z.number(),
  strongSell: z.number(),
})

/**
 * Stock Statistics Data Schema
 */
export const StockStatisticsDataSchema = z.object({
  symbol: z.string(),
  financial: FinancialStatsSchema,
  valuation: ValuationStatsSchema,
  performance: PricePerformanceSchema,
  trading: TradingStatsSchema,
  analyst: AnalystStatsSchema,
  lastUpdate: z.string(),
})

/**
 * Stock Statistics Response Schema
 */
export const StockStatisticsResponseSchema = z.object({
  success: z.boolean(),
  data: StockStatisticsDataSchema,
  cached: z.boolean(),
})

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type ValidatedDecisionBadge = z.infer<typeof DecisionBadgeSchema>
export type ValidatedLayerScore = z.infer<typeof LayerScoreSchema>
export type ValidatedPriceInfo = z.infer<typeof PriceInfoSchema>
export type ValidatedVolumeInfo = z.infer<typeof VolumeInfoSchema>
export type ValidatedStockOverviewData = z.infer<typeof StockOverviewDataSchema>
export type ValidatedStockOverviewResponse = z.infer<typeof StockOverviewResponseSchema>
export type ValidatedFinancialStats = z.infer<typeof FinancialStatsSchema>
export type ValidatedValuationStats = z.infer<typeof ValuationStatsSchema>
export type ValidatedPricePerformance = z.infer<typeof PricePerformanceSchema>
export type ValidatedTradingStats = z.infer<typeof TradingStatsSchema>
export type ValidatedAnalystStats = z.infer<typeof AnalystStatsSchema>
export type ValidatedStockStatisticsData = z.infer<typeof StockStatisticsDataSchema>
export type ValidatedStockStatisticsResponse = z.infer<typeof StockStatisticsResponseSchema>

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate stock overview response
 */
export function validateStockOverviewResponse(
  data: unknown
): ValidatedStockOverviewResponse {
  return StockOverviewResponseSchema.parse(data)
}

/**
 * Validate stock statistics response
 */
export function validateStockStatisticsResponse(
  data: unknown
): ValidatedStockStatisticsResponse {
  return StockStatisticsResponseSchema.parse(data)
}

/**
 * Safe validation with fallback
 * Returns null if validation fails
 */
export function safeValidateStockOverview(
  data: unknown
): ValidatedStockOverviewResponse | null {
  const result = StockOverviewResponseSchema.safeParse(data)
  return result.success ? result.data : null
}

/**
 * Safe validation for statistics with fallback
 */
export function safeValidateStockStatistics(
  data: unknown
): ValidatedStockStatisticsResponse | null {
  const result = StockStatisticsResponseSchema.safeParse(data)
  return result.success ? result.data : null
}
