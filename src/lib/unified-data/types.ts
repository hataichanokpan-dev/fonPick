/**
 * Unified Data Layer Types
 *
 * Single source of truth for unified market data fetching
 */

import type { RTDBMarketOverview, RTDBInvestorType, RTDBIndustrySector, RTDBTopRankingsEnhanced } from '@/types/rtdb'
import type { RegimeResult } from '@/services/market-regime/types'
import type { MarketIntelligenceData } from '@/types/market-intelligence'
import type { DashboardOptions } from '@/types/market-intelligence'

/**
 * Unified market data returned from fetchUnifiedMarketData
 * Combines raw RTDB data with derived analysis
 */
export interface UnifiedMarketData {
  /** Raw market overview from RTDB */
  marketOverview: RTDBMarketOverview | null

  /** Raw investor type data from RTDB */
  investorType: RTDBInvestorType | null

  /** Raw industry sector data from RTDB */
  industrySector: RTDBIndustrySector | null

  /** Enhanced rankings with cross-ranking detection */
  rankings: RTDBTopRankingsEnhanced | null

  /** Market regime analysis (Risk-On/Neutral/Risk-Off) */
  regimeAnalysis: RegimeResult | null

  /** Aggregated market intelligence (regime, smart money, sector rotation, active stocks) */
  marketIntelligence: MarketIntelligenceData | null

  /** Timestamp when data was fetched */
  timestamp: number

  /** List of data source keys that failed to fetch */
  errors: UnifiedDataErrors
}

/**
 * Keys for data sources that may fail
 */
export type UnifiedDataErrorKey = 'marketOverview' | 'investorType' | 'industrySector' | 'rankings'

/**
 * Array of failed data source keys
 */
export type UnifiedDataErrors = UnifiedDataErrorKey[]

/**
 * Options for fetching unified market data
 */
export interface UnifiedDataOptions extends Partial<DashboardOptions> {
  /** Maximum age for data to be considered fresh (in minutes) */
  maxDataAgeMinutes?: number

  /** Whether to include market regime analysis */
  includeRegimeAnalysis?: boolean

  /** Whether to include market intelligence aggregation */
  includeMarketIntelligence?: boolean
}

/**
 * Default options for unified data fetching
 */
export const DEFAULT_UNIFIED_DATA_OPTIONS: Required<UnifiedDataOptions> = {
  includeP0: true,
  includeP1: true,
  includeP2: true,
  topSectorsCount: 5,
  bottomSectorsCount: 5,
  topStocksCount: 10,
  maxDataAgeMinutes: 60,
  includeRegimeAnalysis: true,
  includeMarketIntelligence: true,
} as const
