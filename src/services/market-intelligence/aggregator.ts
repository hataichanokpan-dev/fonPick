/**
 * Market Intelligence Aggregator
 *
 * GREEN PHASE: Minimal implementation to make tests pass
 * TDD: Writing code AFTER tests have been written
 */

import type {
  MarketIntelligenceData,
  MarketIntelligenceInput,
  DashboardOptions,
  ActiveStocksAnalysis,
  StockConcentration,
  CrossRankedStock,
  ConcentrationMetrics,
} from '@/types/market-intelligence'
import { DEFAULT_DASHBOARD_OPTIONS } from '@/types/market-intelligence'
import { analyzeMarketRegime } from '@/services/market-regime'
import { analyzeSmartMoney } from '@/services/smart-money/signal'
import { detectSectorRotation } from '@/services/sector-rotation/detector'

// ============================================================================
// MAIN AGGREGATOR
// ============================================================================

/**
 * Aggregate market intelligence from all data sources
 */
export async function aggregateMarketIntelligence(
  input: MarketIntelligenceInput,
  options: Partial<DashboardOptions> = {}
): Promise<MarketIntelligenceData> {
  const opts = { ...DEFAULT_DASHBOARD_OPTIONS, ...options }

  // Analyze each component based on options
  const regime = opts.includeP0 ? await analyzeRegimeComponent(input) : null
  const smartMoney = opts.includeP0 ? await analyzeSmartMoneyComponent(input) : null
  const sectorRotation = opts.includeP1 ? await analyzeSectorRotationComponent(input) : null
  const activeStocks = opts.includeP2 ? await analyzeActiveStocksComponent(input, opts) : null

  // Calculate data freshness
  const freshness = calculateDataFreshness(input, opts.maxDataAgeMinutes)

  return {
    regime,
    smartMoney,
    sectorRotation,
    activeStocks,
    timestamp: Date.now(),
    freshness,
  }
}

// ============================================================================
// COMPONENT ANALYZERS
// ============================================================================

/**
 * Analyze market regime
 */
async function analyzeRegimeComponent(input: MarketIntelligenceInput) {
  if (!input.marketOverview || !input.investorType || !input.industrySector) {
    return null
  }

  try {
    // Transform input to match MarketDataForRegime interface
    const marketDataForRegime = {
      overview: {
        set: {
          index: input.marketOverview.setIndex,
          change: input.marketOverview.setChange,
          changePercent: input.marketOverview.setChangePercent,
        },
        totalMarketCap: input.marketOverview.totalValue,
        totalValue: input.marketOverview.totalValue,
        totalVolume: input.marketOverview.totalVolume,
        advanceCount: 0, // Data not available, default to 0
        declineCount: 0, // Data not available, default to 0
        unchangedCount: 0,
        newHighCount: 0,
        newLowCount: 0,
        timestamp: input.marketOverview.timestamp,
      },
      investor: input.investorType,
      sector: {
        sectors: input.industrySector.sectors.map(s => ({
          ...s,
          index: 0, // Not available in current data
          change: s.changePercent, // Map changePercent to change
        })),
        timestamp: input.industrySector.timestamp,
      },
    }

    return analyzeMarketRegime(marketDataForRegime)
  } catch (error) {
    console.error('Error analyzing regime:', error)
    return null
  }
}

/**
 * Analyze smart money
 */
async function analyzeSmartMoneyComponent(input: MarketIntelligenceInput) {
  if (!input.investorType) {
    return null
  }

  try {
    // Transform input to match RTDBInvestorType interface
    const currentInvestorType: import('@/types/rtdb').RTDBInvestorType = {
      foreign: input.investorType.foreign,
      institution: input.investorType.institution,
      retail: input.investorType.retail,
      prop: input.investorType.prop,
      timestamp: input.investorType.timestamp,
    }

    // Transform historical data if available - Note: historical may only have net
    const historicalInvestorTypes = input.historical?.investorTypes?.map(h => {
      const createFlow = (net: number) => ({
        buy: Math.max(0, net), // Estimate buy from net
        sell: Math.max(0, -net), // Estimate sell from negative net
        net,
      })

      return {
        foreign: createFlow(h.foreign.net),
        institution: createFlow(h.institution.net),
        retail: createFlow(h.retail.net),
        prop: createFlow(h.prop.net),
        timestamp: h.timestamp,
      }
    })

    return analyzeSmartMoney({
      current: currentInvestorType,
      historical: historicalInvestorTypes,
    })
  } catch (error) {
    console.error('Error analyzing smart money:', error)
    return null
  }
}

/**
 * Analyze sector rotation
 */
async function analyzeSectorRotationComponent(input: MarketIntelligenceInput) {
  if (!input.industrySector) {
    return null
  }

  try {
    // Transform to match RTDBIndustrySector interface
    const sectorData: import('@/types/rtdb').RTDBIndustrySector = {
      sectors: input.industrySector.sectors.map(s => ({
        ...s,
        index: 0, // Not available in current data
        change: s.changePercent, // Map changePercent to change
        name: s.name,
        marketCap: s.marketCap,
        volume: s.volume,
      })),
      timestamp: input.industrySector.timestamp,
    }

    // Note: Historical data transformation would require proper RTDBSector structure
    return detectSectorRotation({
      sectors: sectorData,
      historical: undefined, // TODO: Transform historical data properly
    })
  } catch (error) {
    console.error('Error analyzing sector rotation:', error)
    return null
  }
}

/**
 * Analyze active stocks concentration (Memory-optimized)
 */
async function analyzeActiveStocksComponent(
  input: MarketIntelligenceInput,
  options: Required<DashboardOptions>
): Promise<ActiveStocksAnalysis | null> {
  if (!input.rankings) {
    return null
  }

  try {
    const rankings = input.rankings

    // Build stock concentration lists
    const totalValue = rankings.topValue.reduce((sum, s) => sum + (s.value || 0), 0)

    const topByValue = buildStockConcentration(
      rankings.topValue.slice(0, options.topStocksCount),
      totalValue
    )

    const topByVolume = buildStockConcentration(
      rankings.topVolume.slice(0, options.topStocksCount),
      0
    )

    // Detect cross-rankings (limited results)
    const crossRanked = detectCrossRankings(rankings, {
      maxStocksPerCategory: 50,
      maxResults: options.topStocksCount,
    })

    // Calculate concentration metrics - pass crossRankedCount to avoid recalculation
    const metrics = calculateConcentrationMetrics(rankings, totalValue, crossRanked.length)

    // Generate observations
    const observations = generateObservations(topByValue, crossRanked, metrics)

    return {
      topByValue,
      topByVolume,
      crossRanked,
      metrics,
      observations,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Error analyzing active stocks:', error)
    return null
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build stock concentration list
 */
export function buildStockConcentration(
  stocks: Array<{
    symbol: string
    name?: string
    value?: number
    volume?: number
    changePct?: number
    sectorCode?: string
    marketCapGroup?: 'L' | 'M' | 'S'
  }>,
  totalValue: number
): StockConcentration[] {
  return stocks.map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    value: stock.value || 0,
    volume: stock.volume || 0,
    changePercent: stock.changePct || 0,
    sectorCode: stock.sectorCode,
    marketCapGroup: stock.marketCapGroup,
    concentrationScore: totalValue > 0 ? ((stock.value || 0) / totalValue) * 100 : 0,
    valuePercentOfTotal: totalValue > 0 ? ((stock.value || 0) / totalValue) * 100 : 0,
    rankings: undefined,
  }))
}

/**
 * Detect cross-ranked stocks (Memory-optimized)
 * Limits processing to prevent memory leaks from large datasets
 */
export function detectCrossRankings(
  rankings: MarketIntelligenceInput['rankings'],
  options?: { maxStocksPerCategory?: number; maxResults?: number }
): CrossRankedStock[] {
  if (!rankings) return []

  // Limits to prevent memory bloat
  const MAX_STOCKS_PER_CATEGORY = options?.maxStocksPerCategory ?? 50
  const MAX_RESULTS = options?.maxResults ?? 20

  const stockMap = new Map<string, CrossRankedStock>()

  // Helper to add stock to map
  const addStock = (symbol: string, name: string | undefined, category: string, rank: number) => {
    if (!stockMap.has(symbol)) {
      stockMap.set(symbol, {
        symbol,
        name,
        rankings: {},
        rankingCount: 0,
        strengthScore: 0,
      })
    }

    const stock = stockMap.get(symbol)!
    ;(stock.rankings as Record<string, number>)[category] = rank
    stock.rankingCount = Object.keys(stock.rankings).length
    stock.strengthScore = calculateStrengthScore(stock.rankings)
  }

  // Process only limited number of stocks per category to prevent memory bloat
  rankings.topValue.slice(0, MAX_STOCKS_PER_CATEGORY).forEach((s, i) =>
    addStock(s.symbol, s.name, 'value', i + 1)
  )
  rankings.topVolume.slice(0, MAX_STOCKS_PER_CATEGORY).forEach((s, i) =>
    addStock(s.symbol, s.name, 'volume', i + 1)
  )
  rankings.topGainers.slice(0, MAX_STOCKS_PER_CATEGORY).forEach((s, i) =>
    addStock(s.symbol, s.name, 'gainer', i + 1)
  )
  rankings.topLosers.slice(0, MAX_STOCKS_PER_CATEGORY).forEach((s, i) =>
    addStock(s.symbol, s.name, 'loser', i + 1)
  )

  // Return only stocks appearing in multiple categories, sorted by strength, limited results
  const results = Array.from(stockMap.values())
    .filter(s => s.rankingCount >= 2)
    .sort((a, b) => b.strengthScore - a.strengthScore)
    .slice(0, MAX_RESULTS)

  // Clear map to free memory immediately
  stockMap.clear()

  return results
}

/**
 * Calculate strength score for cross-ranked stock
 */
function calculateStrengthScore(rankings: Record<string, number>): number {
  const values = Object.values(rankings)
  if (values.length === 0) return 0

  // Lower rank = higher score (rank 1 = 100 points)
  const scores = values.map(rank => Math.max(0, 100 - (rank - 1) * 10))
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}

/**
 * Calculate concentration metrics (Memory-optimized)
 * Accepts optional crossRankedCount to avoid recalculating
 */
export function calculateConcentrationMetrics(
  rankings: MarketIntelligenceInput['rankings'],
  totalValue: number,
  crossRankedCount?: number // Optional: pass in to avoid recalculating
): ConcentrationMetrics {
  if (!rankings || totalValue === 0) {
    return {
      top10ValueConcentration: 0,
      top5StockConcentration: 0,
      crossRankedCount: 0,
      hhi: 0,
      interpretation: 'Broadly Distributed',
      totalValue: 0,
    }
  }

  const topValue = rankings.topValue.slice(0, 10)

  // Top 10 concentration
  const top10Value = topValue.reduce((sum, s) => sum + (s.value || 0), 0)
  const top10Concentration = (top10Value / totalValue) * 100

  // Top 5 concentration
  const top5Value = topValue.slice(0, 5).reduce((sum, s) => sum + (s.value || 0), 0)
  const top5Concentration = (top5Value / totalValue) * 100

  // Cross-ranked count - use provided value or default to 0 (no duplicate calculation)
  const calculatedCrossRankedCount = crossRankedCount ?? 0

  // HHI calculation
  const marketShares = topValue.map(s => (s.value || 0) / totalValue)
  const hhi = marketShares.reduce((sum, share) => sum + share * share, 0) * 10000

  // Interpretation
  let interpretation: ConcentrationMetrics['interpretation']
  if (top5Concentration > 50 || hhi > 2000) {
    interpretation = 'Highly Concentrated'
  } else if (top5Concentration > 30 || hhi > 1500) {
    interpretation = 'Moderately Concentrated'
  } else {
    interpretation = 'Broadly Distributed'
  }

  return {
    top10ValueConcentration: Math.round(top10Concentration),
    top5StockConcentration: Math.round(top5Concentration),
    crossRankedCount: calculatedCrossRankedCount,
    hhi: Math.round(hhi),
    interpretation,
    totalValue,
  }
}

/**
 * Generate observations
 */
function generateObservations(
  topByValue: StockConcentration[],
  crossRanked: CrossRankedStock[],
  metrics: ConcentrationMetrics
): string[] {
  const observations: string[] = []

  // Concentration observation
  if (metrics.interpretation === 'Highly Concentrated') {
    observations.push('Market attention highly concentrated in few stocks')
  } else if (metrics.interpretation === 'Broadly Distributed') {
    observations.push('Market attention broadly distributed across many stocks')
  }

  // Top stocks
  if (topByValue.length > 0) {
    const topStock = topByValue[0]
    observations.push(`Highest concentration: ${topStock.symbol} (${topStock.valuePercentOfTotal.toFixed(1)}% of value)`)
  }

  // Cross-ranked stocks
  if (crossRanked.length > 0) {
    observations.push(`${crossRanked.length} stocks appearing in multiple rankings`)
  }

  return observations.slice(0, 3)
}

/**
 * Calculate data freshness
 */
function calculateDataFreshness(
  input: MarketIntelligenceInput,
  maxAgeMinutes: number
): MarketIntelligenceData['freshness'] {
  const now = Date.now()

  const sources = {
    market: input.marketOverview ? (now - input.marketOverview.timestamp) / 60000 : Infinity,
    investor: input.investorType ? (now - input.investorType.timestamp) / 60000 : Infinity,
    sector: input.industrySector ? (now - input.industrySector.timestamp) / 60000 : Infinity,
    rankings: input.rankings ? (now - input.rankings.timestamp) / 60000 : Infinity,
  }

  const maxAge = Math.max(sources.market, sources.investor, sources.sector, sources.rankings)
  const isFresh = maxAge <= maxAgeMinutes

  return {
    isFresh,
    maxAgeMinutes: Math.round(maxAge),
    sources,
  }
}
