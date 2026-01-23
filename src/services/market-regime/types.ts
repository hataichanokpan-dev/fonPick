/**
 * Market Regime Service Types
 */

import type { RTDBMarketOverview, RTDBInvestorType, RTDBIndustrySector } from '@/types/rtdb'

/**
 * Market regime classification
 */
export type MarketRegime = 'Risk-On' | 'Neutral' | 'Risk-Off'

/**
 * Regime confidence level
 */
export type RegimeConfidence = 'High' | 'Medium' | 'Low'

/**
 * Input data for regime detection
 */
export interface RegimeInput {
  setChange: number
  investorFlow: {
    foreignNet: number
    institutionNet: number
  }
  sectors: {
    defensivePerformance: number
    overallPerformance: number
  }
  liquidity: number
}

/**
 * Regime detection result
 */
export interface RegimeResult {
  regime: MarketRegime
  confidence: RegimeConfidence
  reasons: string[]
  focus: string
  caution: string
  scores: {
    riskOn: number
    riskOff: number
  }
}

/**
 * Market data for regime analysis
 */
export interface MarketDataForRegime {
  overview: RTDBMarketOverview | null
  investor: RTDBInvestorType | null
  sector: RTDBIndustrySector | null
}

/**
 * Regime analysis options
 */
export interface RegimeAnalysisOptions {
  customThresholds?: {
    setChangeStrong?: number
    setChangeWeak?: number
    strongFlow?: number
    weakFlow?: number
  }
}
