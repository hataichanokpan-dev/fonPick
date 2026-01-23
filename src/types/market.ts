/**
 * Market Analysis Types
 */

import type { RTDBMarketOverview, RTDBInvestorType, RTDBIndustrySector } from './rtdb'

export type MarketRegime = 'Risk-On' | 'Neutral' | 'Risk-Off'

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

export interface RegimeResult {
  regime: MarketRegime
  confidence: 'High' | 'Medium' | 'Low'
  reasons: string[]
  focus: string
  caution: string
}

export interface MarketData {
  overview: RTDBMarketOverview | null
  investor: RTDBInvestorType | null
  sector: RTDBIndustrySector | null
  regime: RegimeResult | null
}
