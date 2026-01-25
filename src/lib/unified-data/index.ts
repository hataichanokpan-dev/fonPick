/**
 * Unified Data Layer
 *
 * Single entry point for all market data fetching.
 * Eliminates duplicate RTDB calls by fetching all data in parallel
 * and providing both raw data and derived analysis.
 *
 * Usage:
 *   const data = await fetchUnifiedMarketData({ includeP0: true, includeP1: false })
 *   console.log(data.marketOverview, data.regimeAnalysis)
 */

// Public exports
export type {
  UnifiedMarketData,
  UnifiedDataErrorKey,
  UnifiedDataErrors,
  UnifiedDataOptions,
} from './types'
export { DEFAULT_UNIFIED_DATA_OPTIONS } from './types'

import type {
  UnifiedMarketData,
  UnifiedDataErrors,
  UnifiedDataOptions,
  UnifiedDataErrorKey,
} from './types'
import type { DashboardOptions } from '@/types/market-intelligence'

// RTDB fetchers
import {
  fetchMarketOverview,
  fetchInvestorType,
  fetchIndustrySector,
  fetchTopRankingsEnhanced,
} from '@/lib/rtdb'

// Analysis services
import { analyzeMarketRegime } from '@/services/market-regime'
import { aggregateMarketIntelligence } from '@/services/market-intelligence'

/**
 * Fetch all market data in a single call
 *
 * This function:
 * 1. Fetches all RTDB data sources in parallel (no waiting)
 * 2. Runs analysis services (regime, smart money, sector rotation)
 * 3. Returns unified object with all data and analysis results
 *
 * @param options - Dashboard and analysis options
 * @returns Unified market data with raw RTDB data and analysis results
 *
 * @example
 * // Fetch all data with default options
 * const data = await fetchUnifiedMarketData()
 *
 * @example
 * // Fetch with custom options
 * const data = await fetchUnifiedMarketData({
 *   includeP0: true,
 *   includeP1: false,
 *   includeP2: true,
 *   topStocksCount: 15,
 * })
 */
export async function fetchUnifiedMarketData(
  options: Partial<UnifiedDataOptions> = {}
): Promise<UnifiedMarketData> {
  const timestamp = Date.now()
  const errors: UnifiedDataErrors = []

  // Step 1: Fetch all RTDB data in parallel
  // Use Promise.allSettled to ensure all fetches complete even if some fail
  const [marketOverviewResult, investorTypeResult, industrySectorResult, rankingsResult] =
    await Promise.allSettled([
      fetchMarketOverview(),
      fetchInvestorType(),
      fetchIndustrySector(),
      fetchTopRankingsEnhanced(),
    ])

  // Step 2: Extract results and track errors
  const marketOverview = extractResult(marketOverviewResult, 'marketOverview', errors)
  const investorType = extractResult(investorTypeResult, 'investorType', errors)
  const industrySector = extractResult(industrySectorResult, 'industrySector', errors)
  const rankings = extractResult(rankingsResult, 'rankings', errors)

  // Step 3: Run market regime analysis if all required data is available
  const regimeAnalysis = analyzeRegime(marketOverview, investorType, industrySector)

  // Step 4: Aggregate market intelligence
  const marketIntelligence = await aggregateIntelligence(
    marketOverview,
    investorType,
    industrySector,
    rankings,
    options
  )

  return {
    marketOverview,
    investorType,
    industrySector,
    rankings,
    regimeAnalysis,
    marketIntelligence,
    timestamp,
    errors,
  }
}

/**
 * Extract result from Promise.allSettled result
 */
function extractResult<T>(
  result: PromiseSettledResult<T | null>,
  key: UnifiedDataErrorKey,
  errors: UnifiedDataErrors
): T | null {
  if (result.status === 'fulfilled') {
    return result.value
  }
  // Rejection means error
  errors.push(key)
  return null
}

/**
 * Analyze market regime if all required data is available
 */
function analyzeRegime(
  marketOverview: UnifiedMarketData['marketOverview'],
  investorType: UnifiedMarketData['investorType'],
  industrySector: UnifiedMarketData['industrySector']
): UnifiedMarketData['regimeAnalysis'] {
  // Regime analysis requires all three data sources
  if (!marketOverview || !investorType || !industrySector) {
    return null
  }

  try {
    return analyzeMarketRegime({
      overview: marketOverview,
      investor: investorType,
      sector: industrySector,
    })
  } catch (error) {
    console.error('[unified-data] Regime analysis failed:', error)
    return null
  }
}

/**
 * Aggregate market intelligence from all data sources
 */
async function aggregateIntelligence(
  marketOverview: UnifiedMarketData['marketOverview'],
  investorType: UnifiedMarketData['investorType'],
  industrySector: UnifiedMarketData['industrySector'],
  rankings: UnifiedMarketData['rankings'],
  options: Partial<UnifiedDataOptions>
): Promise<UnifiedMarketData['marketIntelligence']> {
  // Transform RTDB data to market intelligence input format
  const input = buildMarketIntelligenceInput(
    marketOverview,
    investorType,
    industrySector,
    rankings
  )

  // Filter out empty input - aggregator needs at least some data
  const hasAnyData =
    input.marketOverview !== null ||
    input.investorType !== null ||
    input.industrySector !== null ||
    input.rankings !== null

  if (!hasAnyData) {
    return null
  }

  try {
    return await aggregateMarketIntelligence(input, options as Partial<DashboardOptions>)
  } catch (error) {
    console.error('[unified-data] Market intelligence aggregation failed:', error)
    return null
  }
}

/**
 * Build market intelligence input from RTDB data
 */
function buildMarketIntelligenceInput(
  marketOverview: UnifiedMarketData['marketOverview'],
  investorType: UnifiedMarketData['investorType'],
  industrySector: UnifiedMarketData['industrySector'],
  rankings: UnifiedMarketData['rankings']
) {
  return {
    marketOverview: marketOverview
      ? {
          setIndex: marketOverview.set.index,
          setChange: marketOverview.set.change,
          setChangePercent: marketOverview.set.changePercent,
          totalValue: marketOverview.totalValue,
          totalVolume: marketOverview.totalVolume,
          timestamp: marketOverview.timestamp,
        }
      : null,

    investorType: investorType
      ? {
          foreign: { ...investorType.foreign },
          institution: { ...investorType.institution },
          retail: { ...investorType.retail },
          prop: { ...investorType.prop },
          timestamp: investorType.timestamp,
        }
      : null,

    industrySector: industrySector
      ? {
          sectors: industrySector.sectors.map(s => ({
            id: s.id,
            name: s.name,
            changePercent: s.changePercent,
            marketCap: s.marketCap,
            volume: s.volume,
          })),
          timestamp: industrySector.timestamp,
        }
      : null,

    rankings: rankings
      ? {
          topValue: rankings.topValue.map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            value: stock.value,
            volume: stock.volume,
            changePct: stock.changePct,
            sectorCode: stock.sectorCode,
            marketCapGroup: stock.marketCapGroup,
          })),
          topVolume: rankings.topVolume.map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            value: stock.value,
            volume: stock.volume,
            changePct: stock.changePct,
            sectorCode: stock.sectorCode,
            marketCapGroup: stock.marketCapGroup,
          })),
          topGainers: rankings.topGainers.map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            value: stock.value,
            changePct: stock.changePct,
          })),
          topLosers: rankings.topLosers.map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            value: stock.value,
            changePct: stock.changePct,
          })),
          timestamp: rankings.timestamp,
        }
      : null,

    historical: undefined, // TODO: Add historical data support if needed
  }
}
