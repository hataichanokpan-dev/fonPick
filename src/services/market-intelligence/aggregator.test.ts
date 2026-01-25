/**
 * TDD: Market Intelligence Aggregator Tests
 *
 * RED PHASE: Writing tests BEFORE implementation
 * These tests will FAIL because the implementation doesn't exist yet
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aggregateMarketIntelligence } from './aggregator'
import type { MarketIntelligenceInput, DashboardOptions } from '@/types/market-intelligence'

// Mock existing services
vi.mock('@/services/market-regime', () => ({
  analyzeMarketRegime: vi.fn(),
}))

vi.mock('@/services/smart-money/signal', () => ({
  analyzeSmartMoney: vi.fn(),
}))

vi.mock('@/services/sector-rotation/detector', () => ({
  detectSectorRotation: vi.fn(),
}))

describe('aggregateMarketIntelligence', () => {
  let mockInput: MarketIntelligenceInput

  beforeEach(() => {
    // Setup mock input with all data sources
    mockInput = {
      marketOverview: {
        setIndex: 1314.39,
        setChange: 2.75,
        setChangePercent: 0.21,
        totalValue: 50901.86,
        totalVolume: 7555,
        timestamp: Date.now(),
      },
      investorType: {
        foreign: { buy: 26855, sell: 23499, net: 3356 },
        institution: { buy: 3898, sell: 5299, net: -1401 },
        retail: { buy: 10893, sell: 14035, net: -3142 },
        prop: { buy: 4128, sell: 2940, net: 1188 },
        timestamp: Date.now(),
      },
      industrySector: {
        sectors: [
          { id: 'ENERG', name: 'พลังงาน', changePercent: 1.91, marketCap: 8858.63, volume: 521024 },
          { id: 'BANK', name: 'ธนาคาร', changePercent: 0.47, marketCap: 8534.37, volume: 587741 },
          { id: 'ICT', name: 'เทคโนโลยี', changePercent: 0.75, marketCap: 4389.10, volume: 204188 },
        ],
        timestamp: Date.now(),
      },
      rankings: {
        topValue: [
          { symbol: 'CPALL', name: 'CP ALL', value: 2590, volume: 2590, changePct: 2.35, sectorCode: 'COMM' },
          { symbol: 'DELTA', name: 'DELTA', value: 1771, volume: 1771, changePct: 0.6, sectorCode: 'ETRON' },
          { symbol: 'BDMS', name: 'BDMS', value: 1750, volume: 1750, changePct: 3.17, sectorCode: 'HELTH' },
        ],
        topVolume: [
          { symbol: 'KBANK', name: 'KBANK', value: 1528, volume: 1528, changePct: -1.29, sectorCode: 'BANK' },
        ],
        topGainers: [
          { symbol: 'BDMS', name: 'BDMS', value: 1750, changePct: 3.17 },
          { symbol: 'CPALL', name: 'CP ALL', value: 2590, changePct: 2.35 },
        ],
        topLosers: [
          { symbol: 'KBANK', name: 'KBANK', value: 1528, changePct: -1.29 },
        ],
        timestamp: Date.now(),
      },
    }
  })

  // ========================================================================
  // TEST 1: Complete Data - All Features
  // ========================================================================

  it('should aggregate all data sources when includeP0, P1, P2 are true', async () => {
    const options: Partial<DashboardOptions> = {
      includeP0: true,
      includeP1: true,
      includeP2: true,
    }

    const result = await aggregateMarketIntelligence(mockInput, options)

    // Verify structure
    expect(result).toHaveProperty('regime')
    expect(result).toHaveProperty('smartMoney')
    expect(result).toHaveProperty('sectorRotation')
    expect(result).toHaveProperty('activeStocks')
    expect(result).toHaveProperty('timestamp')
    expect(result).toHaveProperty('freshness')

    // Verify timestamp
    expect(result.timestamp).toBeGreaterThan(0)
    expect(typeof result.timestamp).toBe('number')
  })

  // ========================================================================
  // TEST 2: P0 Only - Market Regime + Smart Money
  // ========================================================================

  it('should include only P0 features when includeP1 and includeP2 are false', async () => {
    const options: Partial<DashboardOptions> = {
      includeP0: true,
      includeP1: false,
      includeP2: false,
    }

    const result = await aggregateMarketIntelligence(mockInput, options)

    expect(result.regime).not.toBeNull()
    expect(result.smartMoney).not.toBeNull()
    expect(result.sectorRotation).toBeNull()
    expect(result.activeStocks).toBeNull()
  })

  // ========================================================================
  // TEST 3: P1 Only - Sector Rotation
  // ========================================================================

  it('should include only P1 features when includeP0 and includeP2 are false', async () => {
    const options: Partial<DashboardOptions> = {
      includeP0: false,
      includeP1: true,
      includeP2: false,
    }

    const result = await aggregateMarketIntelligence(mockInput, options)

    expect(result.regime).toBeNull()
    expect(result.smartMoney).toBeNull()
    expect(result.sectorRotation).not.toBeNull()
    expect(result.activeStocks).toBeNull()
  })

  // ========================================================================
  // TEST 4: P2 Only - Active Stocks
  // ========================================================================

  it('should include only P2 features when includeP0 and includeP1 are false', async () => {
    const options: Partial<DashboardOptions> = {
      includeP0: false,
      includeP1: false,
      includeP2: true,
    }

    const result = await aggregateMarketIntelligence(mockInput, options)

    expect(result.regime).toBeNull()
    expect(result.smartMoney).toBeNull()
    expect(result.sectorRotation).toBeNull()
    expect(result.activeStocks).not.toBeNull()
  })

  // ========================================================================
  // TEST 5: Partial Data - Missing Market Overview
  // ========================================================================

  it('should handle missing marketOverview gracefully', async () => {
    const partialInput = {
      ...mockInput,
      marketOverview: null,
    }

    const result = await aggregateMarketIntelligence(partialInput)

    // Should return null for regime (depends on marketOverview)
    expect(result.regime).toBeNull()
    // Other features should still work
    expect(result.smartMoney).not.toBeNull()
    expect(result.sectorRotation).not.toBeNull()
  })

  // ========================================================================
  // TEST 6: Partial Data - Missing Investor Type
  // ========================================================================

  it('should handle missing investorType gracefully', async () => {
    const partialInput = {
      ...mockInput,
      investorType: null,
    }

    const result = await aggregateMarketIntelligence(partialInput)

    expect(result.smartMoney).toBeNull()
    // Regime should also be null (depends on investor)
    expect(result.regime).toBeNull()
  })

  // ========================================================================
  // TEST 7: Partial Data - Missing Sector Data
  // ========================================================================

  it('should handle missing industrySector gracefully', async () => {
    const partialInput = {
      ...mockInput,
      industrySector: null,
    }

    const result = await aggregateMarketIntelligence(partialInput)

    expect(result.sectorRotation).toBeNull()
  })

  // ========================================================================
  // TEST 8: Partial Data - Missing Rankings
  // ========================================================================

  it('should handle missing rankings gracefully', async () => {
    const partialInput = {
      ...mockInput,
      rankings: null,
    }

    const result = await aggregateMarketIntelligence(partialInput)

    expect(result.activeStocks).toBeNull()
  })

  // ========================================================================
  // TEST 9: Data Freshness Calculation
  // ========================================================================

  it('should calculate data freshness correctly', async () => {
    const now = Date.now()
    const fiveMinutesAgo = now - 5 * 60 * 1000

    const freshInput = {
      ...mockInput,
      marketOverview: {
        ...mockInput.marketOverview!,
        timestamp: fiveMinutesAgo,
      },
    }

    const result = await aggregateMarketIntelligence(freshInput)

    expect(result.freshness).toBeDefined()
    expect(result.freshness.isFresh).toBe(true)
    expect(result.freshness.maxAgeMinutes).toBeLessThanOrEqual(5)
  })

  // ========================================================================
  // TEST 10: Active Stocks Analysis
  // ========================================================================

  it('should analyze active stocks concentration correctly', async () => {
    const options: Partial<DashboardOptions> = {
      includeP0: false,
      includeP1: false,
      includeP2: true,
      topStocksCount: 10,
    }

    const result = await aggregateMarketIntelligence(mockInput, options)

    expect(result.activeStocks).not.toBeNull()

    const activeStocks = result.activeStocks!
    expect(activeStocks.topByValue).toBeDefined()
    expect(activeStocks.topByValue.length).toBeGreaterThan(0)
    expect(activeStocks.metrics).toBeDefined()
    expect(activeStocks.metrics.top5StockConcentration).toBeGreaterThanOrEqual(0)
    expect(activeStocks.metrics.top10ValueConcentration).toBeLessThanOrEqual(100)
  })

  // ========================================================================
  // TEST 11: Cross-Ranked Stocks Detection
  // ========================================================================

  it('should detect cross-ranked stocks (appearing in multiple categories)', async () => {
    const result = await aggregateMarketIntelligence(mockInput)

    expect(result.activeStocks).not.toBeNull()

    const activeStocks = result.activeStocks!
    // BDMS appears in both topValue and topGainers
    const bdmsCross = activeStocks.crossRanked?.find(s => s.symbol === 'BDMS')
    expect(bdmsCross).toBeDefined()
    expect(bdmsCross?.rankingCount).toBeGreaterThanOrEqual(2)
  })

  // ========================================================================
  // TEST 12: Concentration Metrics Interpretation
  // ========================================================================

  it('should interpret concentration levels correctly', async () => {
    const result = await aggregateMarketIntelligence(mockInput)

    const { metrics } = result.activeStocks!
    expect(metrics.interpretation).toMatch(/^(Highly Concentrated|Moderately Concentrated|Broadly Distributed)$/)
  })

  // ========================================================================
  // TEST 13: Empty Rankings
  // ========================================================================

  it('should handle empty rankings gracefully', async () => {
    const emptyInput = {
      ...mockInput,
      rankings: {
        ...mockInput.rankings!,
        topValue: [],
        topVolume: [],
        topGainers: [],
        topLosers: [],
      },
    }

    const result = await aggregateMarketIntelligence(emptyInput)

    const activeStocks = result.activeStocks!
    expect(activeStocks.topByValue).toHaveLength(0)
    expect(activeStocks.metrics.top5StockConcentration).toBe(0)
  })

  // ========================================================================
  // TEST 14: Historical Data Integration
  // ========================================================================

  it('should use historical data when available', async () => {
    const inputWithHistory = {
      ...mockInput,
      historical: {
        investorTypes: [
          {
            foreign: { net: 1000 },
            institution: { net: -500 },
            retail: { net: -200 },
            prop: { net: 300 },
            timestamp: Date.now() - 86400000,
          },
        ],
      },
    }

    const result = await aggregateMarketIntelligence(inputWithHistory)

    // Smart money should use historical data for trend calculation
    expect(result.smartMoney).not.toBeNull()
  })

  // ========================================================================
  // TEST 15: Default Options
  // ========================================================================

  it('should use default options when none provided', async () => {
    const result = await aggregateMarketIntelligence(mockInput)

    // Should include all features by default
    expect(result.regime).not.toBeNull()
    expect(result.smartMoney).not.toBeNull()
    expect(result.sectorRotation).not.toBeNull()
    expect(result.activeStocks).not.toBeNull()
  })
})
