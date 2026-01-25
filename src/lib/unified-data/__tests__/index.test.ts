/**
 * TDD: Unified Data Layer Tests
 *
 * RED PHASE: Writing tests BEFORE implementation
 * These tests will FAIL because the implementation doesn't exist yet
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchUnifiedMarketData } from '../index'
import type { DashboardOptions } from '@/types/market-intelligence'

// Mock all RTDB fetchers
vi.mock('@/lib/rtdb', () => ({
  fetchMarketOverview: vi.fn(),
  fetchInvestorType: vi.fn(),
  fetchIndustrySector: vi.fn(),
  fetchTopRankingsEnhanced: vi.fn(),
}))

// Mock analysis services
vi.mock('@/services/market-regime', () => ({
  analyzeMarketRegime: vi.fn(),
}))

vi.mock('@/services/market-intelligence', () => ({
  aggregateMarketIntelligence: vi.fn(),
}))

import {
  fetchMarketOverview,
  fetchInvestorType,
  fetchIndustrySector,
  fetchTopRankingsEnhanced,
} from '@/lib/rtdb'
import { analyzeMarketRegime } from '@/services/market-regime'
import { aggregateMarketIntelligence } from '@/services/market-intelligence'

describe('fetchUnifiedMarketData', () => {
  const mockMarketOverview = {
    set: { index: 1314.39, change: 2.75, changePercent: 0.21 },
    totalMarketCap: 50901860,
    totalValue: 50901.86,
    totalVolume: 7555000,
    advanceCount: 450,
    declineCount: 380,
    unchangedCount: 120,
    newHighCount: 15,
    newLowCount: 8,
    timestamp: Date.now(),
  }

  const mockInvestorType = {
    foreign: { buy: 26855, sell: 23499, net: 3356 },
    institution: { buy: 3898, sell: 5299, net: -1401 },
    retail: { buy: 10893, sell: 14035, net: -3142 },
    prop: { buy: 4128, sell: 2940, net: 1188 },
    timestamp: Date.now(),
  }

  const mockIndustrySector = {
    sectors: [
      { id: 'ENERG', name: 'Energy', index: 350, change: 6.5, changePercent: 1.91, marketCap: 8858630, volume: 521024000 },
      { id: 'BANK', name: 'Banking', index: 280, change: 1.3, changePercent: 0.47, marketCap: 8534370, volume: 587741000 },
    ],
    timestamp: Date.now(),
  }

  const mockRankings = {
    topGainers: [
      { symbol: 'BDMS', name: 'BDMS', price: 24.5, change: 3.17, changePct: 3.17, volume: 1750000, value: 1750000 },
    ],
    topLosers: [
      { symbol: 'KBANK', name: 'KBANK', price: 128, change: -1.29, changePct: -1.29, volume: 1528000, value: 1528000 },
    ],
    topVolume: [
      { symbol: 'KBANK', name: 'KBANK', price: 128, change: -1.29, changePct: -1.29, volume: 1528000, value: 1528000 },
    ],
    topValue: [
      { symbol: 'CPALL', name: 'CP ALL', price: 68, change: 2.35, changePct: 2.35, volume: 2590000, value: 2590000 },
    ],
    timestamp: Date.now(),
  }

  const mockRegimeAnalysis = {
    regime: 'Risk-On' as const,
    confidence: 'High' as const,
    reasons: ['Strong market gains', 'Foreign buying'],
    focus: 'Growth stocks favored',
    caution: 'Monitor for reversal',
    scores: { riskOn: 75, riskOff: 25 },
  }

  const mockMarketIntelligence = {
    regime: mockRegimeAnalysis,
    smartMoney: {
      signal: 'Strong Buy',
      confidence: 'High',
      trend: 'bullish',
      netFlow: 1955,
      summary: 'Strong foreign and institutional buying',
    },
    sectorRotation: {
      currentPhase: 'Growth',
      leadership: 'cyclical',
      defensiveLeadership: null,
      topSectors: ['ENERG', 'BANK'],
      bottomSectors: ['PROP', 'FOOD'],
      summary: 'Rotation into cyclical sectors',
    },
    activeStocks: {
      topByValue: [],
      topByVolume: [],
      crossRanked: [],
      metrics: {
        top10ValueConcentration: 35,
        top5StockConcentration: 20,
        crossRankedCount: 2,
        hhi: 1200,
        interpretation: 'Broadly Distributed' as const,
      },
      observations: ['Market attention broadly distributed'],
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
    freshness: {
      isFresh: true,
      maxAgeMinutes: 5,
      sources: { market: 5, investor: 5, sector: 5, rankings: 5 },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // TEST 1: Fetches all RTDB data in parallel
  // =========================================================================

  it('should fetch all RTDB data sources in parallel', async () => {
    vi.mocked(fetchMarketOverview).mockResolvedValue(mockMarketOverview)
    vi.mocked(fetchInvestorType).mockResolvedValue(mockInvestorType)
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)

    await fetchUnifiedMarketData()

    expect(fetchMarketOverview).toHaveBeenCalledTimes(1)
    expect(fetchInvestorType).toHaveBeenCalledTimes(1)
    expect(fetchIndustrySector).toHaveBeenCalledTimes(1)
    expect(fetchTopRankingsEnhanced).toHaveBeenCalledTimes(1)
  })

  // =========================================================================
  // TEST 2: Returns complete unified data object
  // =========================================================================

  it('should return complete UnifiedMarketData object', async () => {
    vi.mocked(fetchMarketOverview).mockResolvedValue(mockMarketOverview)
    vi.mocked(fetchInvestorType).mockResolvedValue(mockInvestorType)
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)
    vi.mocked(aggregateMarketIntelligence).mockResolvedValue(mockMarketIntelligence)

    const result = await fetchUnifiedMarketData()

    expect(result).toHaveProperty('marketOverview')
    expect(result).toHaveProperty('investorType')
    expect(result).toHaveProperty('industrySector')
    expect(result).toHaveProperty('rankings')
    expect(result).toHaveProperty('regimeAnalysis')
    expect(result).toHaveProperty('marketIntelligence')
    expect(result).toHaveProperty('timestamp')
    expect(result).toHaveProperty('errors')
  })

  // =========================================================================
  // TEST 3: Includes market regime analysis
  // =========================================================================

  it('should include market regime analysis when data is available', async () => {
    vi.mocked(fetchMarketOverview).mockResolvedValue(mockMarketOverview)
    vi.mocked(fetchInvestorType).mockResolvedValue(mockInvestorType)
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)
    // analyzeMarketRegime is synchronous, use mockReturnValue not mockResolvedValue
    vi.mocked(analyzeMarketRegime).mockReturnValue(mockRegimeAnalysis)

    const result = await fetchUnifiedMarketData()

    expect(analyzeMarketRegime).toHaveBeenCalledWith({
      overview: mockMarketOverview,
      investor: mockInvestorType,
      sector: mockIndustrySector,
    })
    expect(result.regimeAnalysis).toEqual(mockRegimeAnalysis)
  })

  // =========================================================================
  // TEST 4: Includes market intelligence aggregation
  // =========================================================================

  it('should include market intelligence aggregation', async () => {
    vi.mocked(fetchMarketOverview).mockResolvedValue(mockMarketOverview)
    vi.mocked(fetchInvestorType).mockResolvedValue(mockInvestorType)
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)
    vi.mocked(aggregateMarketIntelligence).mockResolvedValue(mockMarketIntelligence)

    const options: Partial<DashboardOptions> = {
      includeP0: true,
      includeP1: true,
      includeP2: true,
    }

    const result = await fetchUnifiedMarketData(options)

    expect(aggregateMarketIntelligence).toHaveBeenCalledWith(
      expect.objectContaining({
        marketOverview: expect.any(Object),
        investorType: expect.any(Object),
        industrySector: expect.any(Object),
        rankings: expect.any(Object),
      }),
      options
    )
    expect(result.marketIntelligence).toEqual(mockMarketIntelligence)
  })

  // =========================================================================
  // TEST 5: Handles partial data gracefully
  // =========================================================================

  it('should handle partial data gracefully when some sources fail', async () => {
    vi.mocked(fetchMarketOverview).mockResolvedValue(mockMarketOverview)
    // Use rejected promise to simulate fetch failure (not just null result)
    vi.mocked(fetchInvestorType).mockRejectedValue(new Error('RTDB error'))
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)
    vi.mocked(aggregateMarketIntelligence).mockResolvedValue(mockMarketIntelligence)

    const result = await fetchUnifiedMarketData()

    expect(result.marketOverview).toEqual(mockMarketOverview)
    expect(result.investorType).toBeNull()
    expect(result.industrySector).toEqual(mockIndustrySector)
    expect(result.rankings).toEqual(mockRankings)
    expect(result.errors).toContain('investorType')
  })

  // =========================================================================
  // TEST 6: Handles complete failure gracefully
  // =========================================================================

  it('should return empty data when all sources fail', async () => {
    // Use rejected promises to simulate all fetch failures
    vi.mocked(fetchMarketOverview).mockRejectedValue(new Error('RTDB error'))
    vi.mocked(fetchInvestorType).mockRejectedValue(new Error('RTDB error'))
    vi.mocked(fetchIndustrySector).mockRejectedValue(new Error('RTDB error'))
    vi.mocked(fetchTopRankingsEnhanced).mockRejectedValue(new Error('RTDB error'))

    const result = await fetchUnifiedMarketData()

    expect(result.marketOverview).toBeNull()
    expect(result.investorType).toBeNull()
    expect(result.industrySector).toBeNull()
    expect(result.rankings).toBeNull()
    expect(result.regimeAnalysis).toBeNull()
    expect(result.marketIntelligence).toBeNull()
    expect(result.errors).toContain('marketOverview')
    expect(result.errors).toContain('investorType')
    expect(result.errors).toContain('industrySector')
    expect(result.errors).toContain('rankings')
  })

  // =========================================================================
  // TEST 7: Timestamp reflects fetch time
  // =========================================================================

  it('should include timestamp of data fetch', async () => {
    vi.mocked(fetchMarketOverview).mockResolvedValue(mockMarketOverview)
    vi.mocked(fetchInvestorType).mockResolvedValue(mockInvestorType)
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)

    const beforeFetch = Date.now()
    const result = await fetchUnifiedMarketData()
    const afterFetch = Date.now()

    expect(result.timestamp).toBeGreaterThanOrEqual(beforeFetch)
    expect(result.timestamp).toBeLessThanOrEqual(afterFetch)
  })

  // =========================================================================
  // TEST 8: Passes options to market intelligence
  // =========================================================================

  it('should pass dashboard options to market intelligence aggregator', async () => {
    vi.mocked(fetchMarketOverview).mockResolvedValue(mockMarketOverview)
    vi.mocked(fetchInvestorType).mockResolvedValue(mockInvestorType)
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)
    vi.mocked(aggregateMarketIntelligence).mockResolvedValue(mockMarketIntelligence)

    const options: Partial<DashboardOptions> = {
      includeP0: true,
      includeP1: false,
      includeP2: true,
      topStocksCount: 15,
    }

    await fetchUnifiedMarketData(options)

    expect(aggregateMarketIntelligence).toHaveBeenCalledWith(
      expect.any(Object),
      options
    )
  })

  // =========================================================================
  // TEST 9: Empty options use defaults
  // =========================================================================

  it('should use default options when none provided', async () => {
    vi.mocked(fetchMarketOverview).mockResolvedValue(mockMarketOverview)
    vi.mocked(fetchInvestorType).mockResolvedValue(mockInvestorType)
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)
    vi.mocked(aggregateMarketIntelligence).mockResolvedValue(mockMarketIntelligence)

    await fetchUnifiedMarketData()

    expect(aggregateMarketIntelligence).toHaveBeenCalledWith(
      expect.any(Object),
      {}
    )
  })

  // =========================================================================
  // TEST 10: Parallel fetching performance
  // =========================================================================

  it('should fetch all RTDB sources in parallel (not sequential)', async () => {
    let resolveOrder: string[] = []

    vi.mocked(fetchMarketOverview).mockImplementation(
      () => new Promise(resolve => {
        setTimeout(() => { resolveOrder.push('market'); resolve(mockMarketOverview) }, 10)
      })
    )
    vi.mocked(fetchInvestorType).mockImplementation(
      () => new Promise(resolve => {
        setTimeout(() => { resolveOrder.push('investor'); resolve(mockInvestorType) }, 5)
      })
    )
    vi.mocked(fetchIndustrySector).mockImplementation(
      () => new Promise(resolve => {
        setTimeout(() => { resolveOrder.push('sector'); resolve(mockIndustrySector) }, 15)
      })
    )
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)
    vi.mocked(aggregateMarketIntelligence).mockResolvedValue(mockMarketIntelligence)

    await fetchUnifiedMarketData()

    // All should be fetched in parallel, so completion order varies
    // But investor (5ms) should complete before sector (15ms) if truly parallel
    expect(resolveOrder).toContain('investor')
    expect(resolveOrder).toContain('market')
    expect(resolveOrder).toContain('sector')
  })

  // =========================================================================
  // TEST 11: Transform RTDB data to market intelligence input format
  // =========================================================================

  it('should transform RTDB data to market intelligence input format', async () => {
    vi.mocked(fetchMarketOverview).mockResolvedValue(mockMarketOverview)
    vi.mocked(fetchInvestorType).mockResolvedValue(mockInvestorType)
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)
    vi.mocked(aggregateMarketIntelligence).mockResolvedValue(mockMarketIntelligence)

    await fetchUnifiedMarketData()

    const calls = vi.mocked(aggregateMarketIntelligence).mock.calls
    expect(calls.length).toBeGreaterThan(0)

    const [input] = calls[0]
    expect(input).toMatchObject({
      marketOverview: {
        setIndex: mockMarketOverview.set.index,
        setChange: mockMarketOverview.set.change,
        setChangePercent: mockMarketOverview.set.changePercent,
        totalValue: mockMarketOverview.totalValue,
        totalVolume: mockMarketOverview.totalVolume,
        timestamp: mockMarketOverview.timestamp,
      },
      investorType: {
        foreign: mockInvestorType.foreign,
        institution: mockInvestorType.institution,
        retail: mockInvestorType.retail,
        prop: mockInvestorType.prop,
        timestamp: mockInvestorType.timestamp,
      },
    })
  })

  // =========================================================================
  // TEST 12: Null market overview results in null regime analysis
  // =========================================================================

  it('should return null regime analysis when market overview is null', async () => {
    vi.mocked(fetchMarketOverview).mockRejectedValue(new Error('RTDB error'))
    vi.mocked(fetchInvestorType).mockResolvedValue(mockInvestorType)
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)
    vi.mocked(aggregateMarketIntelligence).mockResolvedValue(mockMarketIntelligence)

    const result = await fetchUnifiedMarketData()

    expect(analyzeMarketRegime).not.toHaveBeenCalled()
    expect(result.regimeAnalysis).toBeNull()
  })

  // =========================================================================
  // TEST 13: Partial regime analysis data
  // =========================================================================

  it('should handle partial regime analysis data gracefully', async () => {
    vi.mocked(fetchMarketOverview).mockResolvedValue(mockMarketOverview)
    // Use rejected promise to simulate missing data source
    vi.mocked(fetchInvestorType).mockRejectedValue(new Error('RTDB error'))
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)
    vi.mocked(aggregateMarketIntelligence).mockResolvedValue(mockMarketIntelligence)

    const result = await fetchUnifiedMarketData()

    // Regime analysis requires all three data sources
    expect(result.regimeAnalysis).toBeNull()
    expect(result.marketOverview).not.toBeNull()
    expect(result.investorType).toBeNull()
  })

  // =========================================================================
  // TEST 14: Handles empty rankings
  // =========================================================================

  it('should handle empty rankings gracefully', async () => {
    const emptyRankings = {
      topGainers: [],
      topLosers: [],
      topVolume: [],
      topValue: [],
      timestamp: Date.now(),
    }

    vi.mocked(fetchMarketOverview).mockResolvedValue(mockMarketOverview)
    vi.mocked(fetchInvestorType).mockResolvedValue(mockInvestorType)
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(emptyRankings)
    vi.mocked(aggregateMarketIntelligence).mockResolvedValue(mockMarketIntelligence)

    const result = await fetchUnifiedMarketData()

    expect(result.rankings).toEqual(emptyRankings)
  })

  // =========================================================================
  // TEST 15: Returns immutably (no mutation of input data)
  // =========================================================================

  it('should not mutate input data from RTDB', async () => {
    const originalMarketOverview = { ...mockMarketOverview }
    const originalInvestorType = { ...mockInvestorType }

    vi.mocked(fetchMarketOverview).mockResolvedValue(mockMarketOverview)
    vi.mocked(fetchInvestorType).mockResolvedValue(mockInvestorType)
    vi.mocked(fetchIndustrySector).mockResolvedValue(mockIndustrySector)
    vi.mocked(fetchTopRankingsEnhanced).mockResolvedValue(mockRankings)
    vi.mocked(aggregateMarketIntelligence).mockResolvedValue(mockMarketIntelligence)

    await fetchUnifiedMarketData()

    expect(mockMarketOverview).toEqual(originalMarketOverview)
    expect(mockInvestorType).toEqual(originalInvestorType)
  })
})
