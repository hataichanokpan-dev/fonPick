/**
 * Verdict Engine Service Types
 */

import type { RTDBStock } from '@/types/rtdb'
import type { MarketRegime } from '@/types/market'

/**
 * Lens status classification
 */
export type LensStatus = 'Pass' | 'Fail' | 'Partial'

/**
 * Lens type identifier
 */
export type LensType = 'quality' | 'valuation' | 'timing'

/**
 * Individual lens assessment result
 */
export interface LensScore {
  lens: LensType
  status: LensStatus
  score: number // 0-100
  notes: string[]
}

/**
 * Investment verdict
 */
export type Verdict = 'Buy' | 'Watch' | 'Avoid'

/**
 * Verdict confidence level
 */
export type VerdictConfidence = 'High' | 'Medium' | 'Low'

/**
 * Stock verdict bullets
 */
export interface VerdictBullets {
  strengths: string[] // Main strengths (1-2)
  warnings: string[] // What to watch (1-2)
  marketFit: string // Market fit explanation (1)
}

/**
 * Final stock verdict result
 */
export interface StockVerdict {
  symbol: string
  verdict: Verdict
  confidence: VerdictConfidence
  bullets: VerdictBullets
  lenses: LensScore[]
  nextStep?: string
  dataCompleteness: number // 0-100
}

/**
 * Quality lens input metrics
 */
export interface QualityInput {
  netProfitMargin?: number
  roe?: number // Return on Equity
  debtToEquity?: number
  cashFlow?: number // Operating cash flow (million)
  earningsGrowth?: number // Earnings growth (%)
}

/**
 * Valuation lens input metrics
 */
export interface ValuationInput {
  pe?: number // Price to Earnings
  pbv?: number // Price to Book Value
  dividendYield?: number // Dividend Yield (%)
  ev?: number // Enterprise Value
  ebitda?: number // EBITDA
}

/**
 * Timing lens input metrics
 */
export interface TimingInput {
  priceChangePercent: number
  volume: number
  avgVolume?: number // Average volume for comparison
  volatility?: number // Price volatility
  marketRegime: MarketRegime | null
  isNearHigh?: boolean // Is price near 52-week high?
  isNearLow?: boolean // Is price near 52-week low?
}

/**
 * Stock analysis input
 */
export interface StockAnalysisInput {
  stock: RTDBStock
  marketRegime: MarketRegime | null
  avgVolume?: number
}
