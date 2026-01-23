/**
 * Verdict Engine Types
 */

export type LensStatus = 'Pass' | 'Fail' | 'Partial'

export interface LensScore {
  lens: 'quality' | 'valuation' | 'timing'
  status: LensStatus
  score: number
  notes: string[]
}

export type Verdict = 'Buy' | 'Watch' | 'Avoid'

export interface StockVerdict {
  symbol: string
  verdict: Verdict
  confidence: 'High' | 'Medium' | 'Low'
  bullets: {
    strengths: string[]
    warnings: string[]
    marketFit: string
  }
  lenses: LensScore[]
  nextStep?: string
  dataCompleteness: number
}

export interface StockWithVerdict {
  stock: {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    volume: number
    marketCap: number
    pe?: number
    pbv?: number
    dividendYield?: number
    sector?: string
  }
  verdict: StockVerdict
  peers?: Array<{
    symbol: string
    name: string
    verdict: Verdict
  }>
}
