/**
 * RTDB Data Layer
 *
 * Centralized export for all RTDB data fetchers
 */

// Path constants
export { RTDB_PATHS, getStockPath, getFallbackPath, SETTRADE_BASE } from './paths'

// Client utilities
export {
  rtdbGet,
  fetchWithFallback,
  isDataFresh,
  formatTimestamp,
  getDataAge,
  RTDBError,
} from './client'

// Historical data queries (Phase 2: Cross-Analysis)
export {
  getHistoricalMarketOverview,
  getHistoricalIndustrySector,
  getHistoricalInvestorType,
  getHistoricalTopRankings,
  getHistoricalSetIndex,
  getCompleteHistoricalData,
  getLookbackData,
  get60DayLookback,
  get30DayLookback,
  get7DayLookback,
  checkDataAvailability,
  findLatestAvailableDate,
  getDataCoverageReport,
} from './historical'

// Internal imports for use within this file
import {
  fetchMarketOverview,
  isMarketOverviewFresh,
} from './market-overview'
import { fetchInvestorType } from './investor-type'
import { fetchIndustrySector } from './industry-sector'
import { fetchTopRankings } from './top-rankings'

// Market Overview fetchers
export {
  fetchMarketOverview,
  fetchMarketOverviewByDate,
  fetchSetIndex,
  fetchTotalMarketValue,
  fetchTotalVolume,
  fetchAdvanceDecline,
  isMarketOverviewFresh,
  getMarketStatus,
  getMarketColor,
} from './market-overview'

// Investor Type fetchers
export {
  fetchInvestorType,
  fetchInvestorTypeByDate,
  fetchSmartMoneyFlow,
  isSmartMoneyBuying,
  fetchInvestorFlowSummary,
  getInvestorTrend,
} from './investor-type'

// Industry Sector fetchers
export {
  fetchIndustrySector,
  fetchIndustrySectorByDate,
  fetchTopSectors,
  fetchWorstSectors,
  fetchTopSectorsByMarketCap,
  fetchTopSectorsByVolume,
  fetchDefensiveSectorPerformance,
  fetchOverallSectorPerformance,
  fetchSectorByIdentifier,
  fetchSectorHeatmap,
  fetchSectorsByPerformance,
} from './industry-sector'

// Top Rankings fetchers
export {
  fetchTopRankings,
  fetchTopRankingsEnhanced,
  fetchTopRankingsByDate,
  fetchTopGainers,
  fetchTopLosers,
  fetchTopVolume,
  fetchTopValue,
  fetchAllRankings,
  checkStockRanking,
} from './top-rankings'

// NVDR fetchers
export {
  fetchNVDR,
  fetchNVDRByDate,
  fetchStockNVDR,
  fetchTopNVDRByBuyValue,
  fetchTopNVDRByNetValue,
  fetchTopNVDRBySellValue,
  hasHighForeignBuying,
} from './nvdr'

// Stock fetchers
export {
  fetchStock,
  fetchStockWithNVDR,
  fetchStocks,
  fetchStocksBySector,
  fetchStockWithPeers,
  isStockDataFresh,
  searchStocksByPrefix,
  fetchStockValuation,
  fetchStockPrice,
  createMockStock,
} from './stock'

/**
 * Fetch all homepage data in parallel
 * @returns Combined homepage data or partial data if some sources fail
 */
export async function fetchHomepageData() {
  const [market, investor, sector, rankings] = await Promise.all([
    fetchMarketOverview().catch(() => null),
    fetchInvestorType().catch(() => null),
    fetchIndustrySector().catch(() => null),
    fetchTopRankings().catch(() => null),
  ])

  return {
    market,
    investor,
    sector,
    rankings,
  }
}

/**
 * Get data freshness summary
 * @returns Summary of data freshness across all sources
 */
export async function getDataFreshness(): Promise<{
  market: { fresh: boolean; age: string } | null
  investor: { fresh: boolean; age: string } | null
  sector: { fresh: boolean; age: string } | null
}> {
  const [market, investor, sector] = await Promise.all([
    fetchMarketOverview().catch(() => null),
    fetchInvestorType().catch(() => null),
    fetchIndustrySector().catch(() => null),
  ])

  const now = Date.now()

  const getAge = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A'
    const age = now - timestamp
    const minutes = Math.floor(age / 60000)
    const hours = Math.floor(age / 3600000)
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return {
    market: market
      ? { fresh: isMarketOverviewFresh(market, 2 * 60 * 60 * 1000), age: getAge(market.timestamp) }
      : null,
    investor: investor
      ? { fresh: now - investor.timestamp < 2 * 60 * 60 * 1000, age: getAge(investor.timestamp) }
      : null,
    sector: sector
      ? { fresh: now - sector.timestamp < 2 * 60 * 60 * 1000, age: getAge(sector.timestamp) }
      : null,
  }
}
