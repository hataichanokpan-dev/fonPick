/**
 * Zod Validation Schemas
 *
 * Runtime validation schemas for all RTDB data based on /settrade structure
 */

import { z } from 'zod'

// ============================================================================
// STOCK API SCHEMAS
// ============================================================================

/**
 * Layer Score Schema
 * Supports both 3-layer (backwards compatible) and 4-layer systems
 */
export const LayerScoreSchema = z
  .object({
    quality: z.number().min(0).max(100),
    valuation: z.number().min(0).max(100),
    timing: z.number().min(0).max(100).optional(),
    growth: z.number().min(0).max(100).optional(),
    technical: z.number().min(0).max(100).optional(),
    catalyst: z.number().min(0).max(100).optional(),
  })
  .refine(
    (data) => {
      // Must have at least timing (3-layer) OR growth/technical/catalyst (4-layer)
      return data.timing !== undefined || data.growth !== undefined || data.technical !== undefined || data.catalyst !== undefined
    },
    { message: 'LayerScore must have at least timing or growth/technical/catalyst' }
  )

/**
 * Decision Badge Schema
 */
export const DecisionBadgeSchema = z.object({
  label: z.string(),
  score: z.number().min(0).max(100),
  type: z.enum(['bullish', 'bearish', 'neutral']),
})

// ============================================================================
// MARKET OVERVIEW SCHEMAS
// ============================================================================

/**
 * Market Overview Data Schema (from /settrade/marketOverview/byDate/{date}/data)
 */
export const MarketOverviewDataSchema = z.object({
  setIndex: z.number(),
  setIndexChg: z.number(),
  setIndexChgPct: z.number(),
  totalValue: z.number(),
  totalVolume: z.number(),
  advanceCount: z.number(),
  declineCount: z.number(),
  unchangedCount: z.number(),
  newHighCount: z.number(),
  newLowCount: z.number(),
})

/**
 * Market Overview Meta Schema
 */
export const MarketOverviewMetaSchema = z.object({
  capturedAt: z.string(),
  schemaVersion: z.number(),
  source: z.string(),
})

/**
 * Market Overview Entry Schema
 */
export const MarketOverviewEntrySchema = z.object({
  data: MarketOverviewDataSchema,
  meta: MarketOverviewMetaSchema,
})

// ============================================================================
// INVESTOR TYPE SCHEMAS
// ============================================================================

/**
 * Investor Type Row Schema (from /settrade/investorType/byDate/{date}/rows/{TYPE})
 */
export const InvestorTypeRowSchema = z.object({
  buyPct: z.number(),
  buyValue: z.number(),
  name: z.string(),
  netValue: z.number(),
  sellPct: z.number(),
  sellValue: z.number(),
})

/**
 * Investor Type Rows Schema
 */
export const InvestorTypeRowsSchema = z.object({
  FOREIGN: InvestorTypeRowSchema,
  LOCAL_INDIVIDUAL: InvestorTypeRowSchema,
  LOCAL_INST: InvestorTypeRowSchema,
  PROPRIETARY: InvestorTypeRowSchema,
})

/**
 * Investor Type Meta Schema
 */
export const InvestorTypeMetaSchema = z.object({
  capturedAt: z.string(),
  schemaVersion: z.number(),
  source: z.string(),
})

/**
 * Investor Type Entry Schema
 */
export const InvestorTypeEntrySchema = z.object({
  rows: InvestorTypeRowsSchema,
  meta: InvestorTypeMetaSchema,
})

// ============================================================================
// INDUSTRY SECTOR SCHEMAS
// ============================================================================

/**
 * Sector Row Schema (from /settrade/industrySector/byDate/{date}/rows/{SECTOR_ID})
 */
export const SectorRowSchema = z.object({
  chg: z.number(),
  chgPct: z.number(),
  last: z.number(),
  name: z.string(),
  valMn: z.number(),
  volK: z.number(),
})

/**
 * Industry Sector Meta Schema
 */
export const IndustrySectorMetaSchema = z.object({
  capturedAt: z.string(),
  schemaVersion: z.number(),
  source: z.string(),
})

/**
 * Industry Sector Entry Schema
 */
export const IndustrySectorEntrySchema = z.object({
  rows: z.record(z.string(), SectorRowSchema),
  meta: IndustrySectorMetaSchema,
})

// ============================================================================
// NVDR SCHEMAS
// ============================================================================

/**
 * NVDR Stock Schema
 */
export const NVDRStockSchema = z.object({
  b: z.number(),  // buy value
  m: z.number(),  // market cap
  n: z.number(),  // net value
  r: z.number(),  // ratio
  s: z.number(),  // sell value
  t: z.number(),  // total
})

/**
 * NVDR Data Schema
 */
export const NVDRDataSchema = z.object({
  stocks: z.record(z.string(), NVDRStockSchema),
  totalMarketK: z.number(),
  totalNVDRK: z.number(),
})

/**
 * NVDR Meta Schema
 */
export const NVDRMetaSchema = z.object({
  capturedAt: z.string(),
  schemaVersion: z.number(),
  source: z.string(),
})

/**
 * NVDR Entry Schema
 */
export const NVDREntrySchema = z.object({
  data: NVDRDataSchema,
  meta: NVDRMetaSchema,
})

// ============================================================================
// STOCK SCHEMAS
// ============================================================================

/**
 * Stock Symbol Validation
 * Uppercase letters and numbers only, 1-10 characters
 */
export const StockSymbolSchema = z
  .string()
  .min(1, 'Symbol must be at least 1 character')
  .max(10, 'Symbol must be at most 10 characters')
  .regex(/^[A-Z0-9]+$/, 'Symbol must contain only uppercase letters and numbers')
  .transform((val) => val.toUpperCase())

/**
 * Stock Schema
 */
export const StockSchema = z.object({
  symbol: StockSymbolSchema,
  name: z.string(),
  sector: z.string().optional(),
  sectorId: z.string().optional(),
  price: z.number(),
  change: z.number(),
  changePct: z.number(),
  volume: z.number(),
  value: z.number(),
  marketCap: z.number().optional(),
  pe: z.number().optional(),
  pbv: z.number().optional(),
  dividendYield: z.number().optional(),
  roe: z.number().optional(),
  debtToEquity: z.number().optional(),
  eps: z.number().optional(),
  nvdr: NVDRStockSchema.optional(),
  timestamp: z.number(),
})

// ============================================================================
// TOP STOCK SCHEMAS
// ============================================================================

/**
 * Top Stock Schema
 */
export const TopStockSchema = z.object({
  symbol: z.string(),
  name: z.string().optional(),
  price: z.number(),
  change: z.number(),
  changePct: z.number(),
  volume: z.number().optional(),
  value: z.number().optional(),
})

/**
 * Top Rankings Schema
 */
export const TopRankingsSchema = z.object({
  topGainers: z.array(TopStockSchema),
  topLosers: z.array(TopStockSchema),
  topVolume: z.array(TopStockSchema),
  topValue: z.array(TopStockSchema),
  timestamp: z.number(),
})

// ============================================================================
// META SCHEMA
// ============================================================================

/**
 * Meta Schema
 */
export const MetaSchema = z.object({
  lastUpdate: z.number(),
  schemaVersion: z.number(),
  latestDate: z.string(),
  version: z.string(),
})

// ============================================================================
// TYPE INFERENCE HELPERS
// ============================================================================

export type StockSymbolInput = z.infer<typeof StockSymbolSchema>
export type ValidatedLayerScore = z.infer<typeof LayerScoreSchema>
export type ValidatedDecisionBadge = z.infer<typeof DecisionBadgeSchema>
export type ValidatedMarketOverviewData = z.infer<typeof MarketOverviewDataSchema>
export type ValidatedMarketOverviewEntry = z.infer<typeof MarketOverviewEntrySchema>
export type ValidatedInvestorTypeRow = z.infer<typeof InvestorTypeRowSchema>
export type ValidatedInvestorTypeRows = z.infer<typeof InvestorTypeRowsSchema>
export type ValidatedInvestorTypeEntry = z.infer<typeof InvestorTypeEntrySchema>
export type ValidatedSectorRow = z.infer<typeof SectorRowSchema>
export type ValidatedIndustrySectorEntry = z.infer<typeof IndustrySectorEntrySchema>
export type ValidatedNVDRStock = z.infer<typeof NVDRStockSchema>
export type ValidatedNVDRData = z.infer<typeof NVDRDataSchema>
export type ValidatedNVDEntry = z.infer<typeof NVDREntrySchema>
export type ValidatedStock = z.infer<typeof StockSchema>
export type ValidatedTopStock = z.infer<typeof TopStockSchema>
export type ValidatedTopRankings = z.infer<typeof TopRankingsSchema>

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Sanitize and validate stock symbol
 */
export function sanitizeStockSymbol(input: string): string {
  return StockSymbolSchema.parse(input)
}

/**
 * Validate layer score
 */
export function validateLayerScore(data: unknown): ValidatedLayerScore {
  return LayerScoreSchema.parse(data)
}

/**
 * Validate decision badge
 */
export function validateDecisionBadge(data: unknown): ValidatedDecisionBadge {
  return DecisionBadgeSchema.parse(data)
}

/**
 * Validate market overview data
 */
export function validateMarketOverviewData(data: unknown): ValidatedMarketOverviewData {
  return MarketOverviewDataSchema.parse(data)
}

/**
 * Validate market overview entry
 */
export function validateMarketOverviewEntry(data: unknown): ValidatedMarketOverviewEntry {
  return MarketOverviewEntrySchema.parse(data)
}

/**
 * Validate investor type data
 */
export function validateInvestorTypeEntry(data: unknown): ValidatedInvestorTypeEntry {
  return InvestorTypeEntrySchema.parse(data)
}

/**
 * Validate industry sector entry
 */
export function validateIndustrySectorEntry(data: unknown): ValidatedIndustrySectorEntry {
  return IndustrySectorEntrySchema.parse(data)
}

/**
 * Validate NVDR entry
 */
export function validateNVDEntry(data: unknown): ValidatedNVDEntry {
  return NVDREntrySchema.parse(data)
}

/**
 * Validate stock data
 */
export function validateStock(data: unknown): ValidatedStock {
  return StockSchema.parse(data)
}

/**
 * Validate top rankings
 */
export function validateTopRankings(data: unknown): ValidatedTopRankings {
  return TopRankingsSchema.parse(data)
}

/**
 * Safe validation with fallback
 * Returns null if validation fails
 */
export function safeValidate<T>(
  schemaOrFn: z.ZodSchema<T> | ((data: unknown) => T),
  data: unknown
): T | null {
  try {
    if (typeof schemaOrFn === 'function' && !('parse' in schemaOrFn)) {
      return schemaOrFn(data)
    }
    const result = (schemaOrFn as z.ZodSchema<T>).safeParse(data)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
