/**
 * Verdict Engine Tests
 *
 * TDD Test Suite for swing trading verdict generation
 * Tests the main integration function: generateSwingVerdict
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSwingVerdict } from './verdict-engine'
import type { SwingVerdict, SwingHorizon } from '@/types/swing-trading'
import type { HistoricalTrendAnalysis } from '@/types/swing-trading'
import type { PriceHistoryPoint } from '@/types/stock-price-api'
import type { MAData } from '@/types/technical-chart'

// ============================================================================
// MOCKS
// ============================================================================

// Mock all external dependencies
vi.mock('@/services/historical-trend/analyzer', () => ({
  analyzeHistoricalTrend: vi.fn(),
}))

vi.mock('@/services/swing-trading/entry-calculator', () => ({
  calculateEntryZone: vi.fn(),
}))

vi.mock('@/services/swing-trading/exit-calculator', () => ({
  calculateExitLevels: vi.fn(),
}))

vi.mock('@/services/swing-trading/position-sizer', () => ({
  calculatePositionSize: vi.fn(),
}))

vi.mock('@/lib/api/stock-api', () => ({
  fetchStockPrice: vi.fn(),
}))

import { analyzeHistoricalTrend } from '@/services/historical-trend/analyzer'
import { calculateEntryZone } from './entry-calculator'
import { calculateExitLevels } from './exit-calculator'
import { calculatePositionSize } from './position-sizer'
import { fetchStockPrice } from '@/lib/api/stock-api'

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const mockPriceHistory: PriceHistoryPoint[] = [
  { date: '2024-01-01', close: 100, open: 98, high: 102, low: 97, volume: 1000000 },
  { date: '2024-01-02', close: 102, open: 100, high: 103, low: 99, volume: 1100000 },
  { date: '2024-01-03', close: 105, open: 102, high: 106, low: 101, volume: 1200000 },
]

const mockMA20: MAData[] = [
  { date: '2024-01-01', value: 100 },
  { date: '2024-01-02', value: 101 },
  { date: '2024-01-03', value: 102 },
]

const mockMA50: MAData[] = [
  { date: '2024-01-01', value: 98 },
  { date: '2024-01-02', value: 99 },
  { date: '2024-01-03', value: 100 },
]

const mockMA200: MAData[] = [
  { date: '2024-01-01', value: 95 },
  { date: '2024-01-02', value: 95.5 },
  { date: '2024-01-03', value: 96 },
]

const mockStrongBuyTrend: HistoricalTrendAnalysis = {
  symbol: 'PTT',
  period: {
    start: '2024-01-01',
    end: '2024-03-31',
    days: 90,
  },
  priceHistory: mockPriceHistory,
  movingAverages: {
    ma20: mockMA20,
    ma50: mockMA50,
    ma200: mockMA200,
  },
  trend: {
    direction: 'uptrend',
    duration: 30,
    phase: 'early',
    strength: 85, // Changed from 75 to 85 to get 'excellent' quality
  },
  momentum: {
    sustainabilityScore: 85, // Changed from 80 to 85 to get 'excellent' quality
    isAccelerating: true,
    isDecelerating: false,
  },
  levels: {
    support: [
      { price: 100, strength: 'strong', touches: 5, lastTestDate: '2024-01-15', lastTouchDate: '2024-01-15' },
    ],
    resistance: [
      { price: 110, strength: 'moderate', touches: 3, lastTestDate: '2024-01-10', lastTouchDate: '2024-01-10' },
    ],
  },
  dataQuality: {
    completeness: 95,
    hasEnoughData: true,
    missingDates: [],
  },
}

const mockBuyTrend: HistoricalTrendAnalysis = {
  ...mockStrongBuyTrend,
  trend: {
    direction: 'uptrend',
    duration: 45,
    phase: 'mature',
    strength: 60,
  },
  momentum: {
    sustainabilityScore: 60,
    isAccelerating: false,
    isDecelerating: false,
  },
}

const mockAvoidTrend: HistoricalTrendAnalysis = {
  ...mockStrongBuyTrend,
  trend: {
    direction: 'downtrend',
    duration: 20,
    phase: 'exhausted',
    strength: 30,
  },
  momentum: {
    sustainabilityScore: 40,
    isAccelerating: false,
    isDecelerating: true,
  },
}

const mockWaitTrend: HistoricalTrendAnalysis = {
  ...mockStrongBuyTrend,
  trend: {
    direction: 'sideways',
    duration: 15,
    phase: 'mature',
    strength: 45,
  },
  momentum: {
    sustainabilityScore: 50,
    isAccelerating: false,
    isDecelerating: false,
  },
}

// ============================================================================
// MOCK RETURN VALUES
// ============================================================================

const mockEntryResult = {
  entryZone: {
    min: 98,
    max: 102,
    current: 105,
  },
  discountPercent: 2.86,
  confidence: 85,
  rationale: 'Buy near strong support at 100.00 (early trend)',
}

const mockExitResult = {
  stopLoss: {
    price: 94,
    percentFromEntry: -6,
    rationale: 'Percentage-based stop loss (8% below entry)',
  },
  takeProfits: [
    { level: 1, price: 115, percentFromEntry: 15, label: 'Conservative (15%)' },
    { level: 2, price: 120, percentFromEntry: 20, label: 'Target (20%)' },
    { level: 3, price: 125, percentFromEntry: 25, label: 'Optimistic (25%+)' },
  ],
  riskRewardRatio: '1:2.6 (Very Good)',
}

const mockPositionResult = {
  percentage: 10,
  shares: 100,
  riskAmount: 2000,
  rationale: 'Position capped at 10% portfolio ($10000) - Stop loss too wide for 2% risk. SL: 6.0% below entry',
}

// ============================================================================
// SETUP
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks()

  // Setup default mocks
  vi.mocked(fetchStockPrice).mockResolvedValue({
    success: true,
    data: {
      regularMarketPrice: 105,
    },
  })

  vi.mocked(analyzeHistoricalTrend).mockResolvedValue(mockStrongBuyTrend)
  vi.mocked(calculateEntryZone).mockReturnValue(mockEntryResult)
  vi.mocked(calculateExitLevels).mockReturnValue(mockExitResult)
  vi.mocked(calculatePositionSize).mockReturnValue(mockPositionResult)
})

// ============================================================================
// GENERATE SWING VERDICT TESTS
// ============================================================================

describe('generateSwingVerdict', () => {
  describe('Successful Verdict Generation', () => {
    it('should generate complete verdict for strong buy setup', async () => {
      vi.mocked(analyzeHistoricalTrend).mockResolvedValue(mockStrongBuyTrend)

      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict).not.toBeNull()
      expect(verdict?.verdict).toBe('Strong Buy')
      expect(verdict?.confidence).toBe('High')
      expect(verdict?.symbol).toBe('PTT')
      expect(verdict?.horizon).toBe(60)
    })

    it('should generate verdict with buy recommendation', async () => {
      vi.mocked(analyzeHistoricalTrend).mockResolvedValue(mockBuyTrend)

      const verdict = await generateSwingVerdict({
        symbol: 'ADVANC',
        horizon: 30,
      })

      expect(verdict).not.toBeNull()
      expect(verdict?.verdict).toBe('Buy')
      expect(verdict?.confidence).toBe('Medium')
    })

    it('should generate verdict with avoid recommendation', async () => {
      vi.mocked(analyzeHistoricalTrend).mockResolvedValue(mockAvoidTrend)

      const verdict = await generateSwingVerdict({
        symbol: 'BBL',
        horizon: 90,
      })

      expect(verdict).not.toBeNull()
      expect(verdict?.verdict).toBe('Avoid')
      expect(verdict?.confidence).toBe('Medium')
    })

    it('should generate verdict with wait recommendation', async () => {
      vi.mocked(analyzeHistoricalTrend).mockResolvedValue(mockWaitTrend)

      const verdict = await generateSwingVerdict({
        symbol: 'AOT',
        horizon: 60,
      })

      expect(verdict).not.toBeNull()
      expect(verdict?.verdict).toBe('Wait')
      expect(verdict?.confidence).toBe('Low')
    })
  })

  describe('Entry Plan', () => {
    it('should include entry zone in verdict', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.entry.zone).toBeDefined()
      expect(verdict?.entry.zone.min).toBe(98)
      expect(verdict?.entry.zone.max).toBe(102)
      expect(verdict?.entry.zone.current).toBe(105)
    })

    it('should include discount from current price', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.entry.discountFromCurrent).toBeCloseTo(2.86, 1)
    })

    it('should include entry rationale', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.entry.rationale).toContain('strong support')
    })
  })

  describe('Exit Plan', () => {
    it('should include stop loss in verdict', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.exit.stopLoss).toBeDefined()
      expect(verdict?.exit.stopLoss.price).toBe(94)
      expect(verdict?.exit.stopLoss.percentFromEntry).toBe(-6)
    })

    it('should include take profit levels', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.exit.takeProfits).toHaveLength(3)
      expect(verdict?.exit.takeProfits[0].level).toBe(1)
      expect(verdict?.exit.takeProfits[1].level).toBe(2)
      expect(verdict?.exit.takeProfits[2].level).toBe(3)
    })

    it('should include risk-reward ratio', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.exit.riskRewardRatio).toContain('1:')
    })
  })

  describe('Position Sizing', () => {
    it('should include position sizing recommendation', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      // The verdict should be successful
      expect(verdict).not.toBeNull()
      if (verdict) {
        expect(verdict.position).toBeDefined()
        expect(verdict.position.percentage).toBeDefined()
      }
    })

    it('should include position rationale', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.position.rationale).toBeDefined()
    })
  })

  describe('Analysis Components', () => {
    it('should include trend quality assessment', async () => {
      vi.mocked(analyzeHistoricalTrend).mockResolvedValue(mockStrongBuyTrend)

      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      // With strength 85 and sustainability 85, should be 'excellent'
      expect(verdict?.analysis.trendQuality).toBe('excellent')
    })

    it('should include trend sustainability score', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.analysis.trendSustainability).toBe(85)
    })

    it('should include entry timing assessment', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.analysis.timing).toBeDefined()
    })

    it('should include key factors', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.analysis.keyFactors).toBeDefined()
      expect(verdict?.analysis.keyFactors.length).toBeGreaterThan(0)
      expect(verdict?.analysis.keyFactors.length).toBeLessThanOrEqual(5)
    })
  })

  describe('Time Estimate', () => {
    it('should include time estimate for 30 day horizon', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 30,
      })

      expect(verdict?.timeEstimate.minDays).toBeGreaterThan(0)
      expect(verdict?.timeEstimate.maxDays).toBeGreaterThan(verdict?.timeEstimate.minDays || 0)
      expect(verdict?.timeEstimate.rationale).toBeDefined()
    })

    it('should include time estimate for 60 day horizon', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.timeEstimate.minDays).toBeGreaterThan(0)
      expect(verdict?.timeEstimate.maxDays).toBeGreaterThan(verdict?.timeEstimate.minDays || 0)
    })

    it('should include time estimate for 90 day horizon', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 90,
      })

      expect(verdict?.timeEstimate.minDays).toBeGreaterThan(0)
      expect(verdict?.timeEstimate.maxDays).toBeGreaterThan(verdict?.timeEstimate.minDays || 0)
    })

    it('should adjust time estimate based on trend phase', async () => {
      vi.mocked(analyzeHistoricalTrend).mockResolvedValue(mockStrongBuyTrend) // Early trend

      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      // Early trend should extend max days
      expect(verdict?.timeEstimate.maxDays).toBeGreaterThan(60)
    })
  })

  describe('Data Quality', () => {
    it('should include overall data quality score', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.dataQuality).toBeGreaterThan(0)
      expect(verdict?.dataQuality).toBeLessThanOrEqual(100)
    })

    it('should include timestamp', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.timestamp).toBeDefined()
      expect(verdict?.timestamp).toBeGreaterThan(0)
    })
  })

  describe('Current Price Handling', () => {
    it('should fetch current price when not provided', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
        // No currentPrice provided
      })

      expect(fetchStockPrice).toHaveBeenCalledWith('PTT')
      expect(verdict).not.toBeNull()
    })

    it('should use provided current price', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
        currentPrice: 110,
      })

      expect(fetchStockPrice).not.toHaveBeenCalled()
      expect(verdict).not.toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should return null when price fetch fails', async () => {
      vi.mocked(fetchStockPrice).mockResolvedValue({
        success: false,
        error: 'Network error',
      })

      const verdict = await generateSwingVerdict({
        symbol: 'INVALID',
        horizon: 60,
      })

      expect(verdict).toBeNull()
    })

    it('should return null when historical trend analysis fails', async () => {
      vi.mocked(analyzeHistoricalTrend).mockResolvedValue(null)

      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict).toBeNull()
    })

    it('should return null when price data is missing', async () => {
      vi.mocked(fetchStockPrice).mockResolvedValue({
        success: true,
        data: undefined,
      })

      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict).toBeNull()
    })

    it('should handle exceptions gracefully', async () => {
      vi.mocked(fetchStockPrice).mockRejectedValue(new Error('API error'))

      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict).toBeNull()
    })
  })

  describe('Target Return by Horizon', () => {
    it('should use 20% target for 30 day horizon', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 30,
      })

      expect(calculateExitLevels).toHaveBeenCalledWith(
        expect.objectContaining({
          targetReturn: 0.20,
        })
      )
    })

    it('should use 20% target for 60 day horizon', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(calculateExitLevels).toHaveBeenCalledWith(
        expect.objectContaining({
          targetReturn: 0.20,
        })
      )
    })

    it('should use 25% target for 90 day horizon', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 90,
      })

      expect(calculateExitLevels).toHaveBeenCalledWith(
        expect.objectContaining({
          targetReturn: 0.25,
        })
      )
    })
  })

  describe('Calculator Integration', () => {
    it('should call calculateEntryZone with correct parameters', async () => {
      await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(calculateEntryZone).toHaveBeenCalledWith({
        currentPrice: 105,
        supportLevels: mockStrongBuyTrend.levels.support,
        movingAverages: {
          ma20: 102,
          ma50: 100,
        },
        trendPhase: 'early',
      })
    })

    it('should call calculateExitLevels with entry zone max as entry price', async () => {
      await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(calculateExitLevels).toHaveBeenCalledWith(
        expect.objectContaining({
          entryPrice: 102, // entryZone.max
        })
      )
    })

    it('should call calculatePositionSize with entry zone max and stop loss', async () => {
      await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(calculatePositionSize).toHaveBeenCalledWith(
        expect.objectContaining({
          entryPrice: 102, // entryZone.max
          stopLoss: 94, // From mockExitResult
          riskPerTrade: 0.02,
          accountValue: 100000,
        })
      )
    })
  })

  describe('Low Data Quality Handling', () => {
    it('should return avoid verdict when data quality is low', async () => {
      const lowQualityTrend: HistoricalTrendAnalysis = {
        ...mockStrongBuyTrend,
        dataQuality: {
          completeness: 50, // Below 60% threshold
          hasEnoughData: false,
          missingDates: ['2024-01-15'],
        },
      }

      vi.mocked(analyzeHistoricalTrend).mockResolvedValue(lowQualityTrend)

      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.verdict).toBe('Avoid')
      expect(verdict?.confidence).toBe('Low')
    })
  })

  describe('Key Factors Generation', () => {
    it('should include trend direction in key factors', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.analysis.keyFactors.some(f => f.includes('Uptrend'))).toBe(true)
    })

    it('should include trend phase in key factors', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.analysis.keyFactors.some(f => f.includes('Early trend'))).toBe(true)
    })

    it('should include momentum status in key factors', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict?.analysis.keyFactors.some(f => f.includes('accelerating'))).toBe(true)
    })
  })

  describe('Smart Money Flow Integration', () => {
    it('should accept smart money flow parameter', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
        smartMoneyFlow: {
          foreignNet: 1000000,
          institutionNet: 500000,
        },
      })

      // Should not throw
      expect(verdict).not.toBeNull()
    })
  })
})

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Verdict Engine - Integration', () => {
  describe('Complete Workflow', () => {
    it('should generate complete verdict with all components', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict).toMatchObject({
        symbol: expect.any(String),
        horizon: expect.any(Number),
        verdict: expect.any(String),
        confidence: expect.any(String),
        entry: {
          zone: {
            min: expect.any(Number),
            max: expect.any(Number),
            current: expect.any(Number),
          },
          discountFromCurrent: expect.any(Number),
          rationale: expect.any(String),
        },
        exit: {
          stopLoss: {
            price: expect.any(Number),
            percentFromEntry: expect.any(Number),
            rationale: expect.any(String),
          },
          takeProfits: expect.any(Array),
          riskRewardRatio: expect.any(String),
        },
        position: {
          percentage: expect.any(Number),
          riskAmount: expect.any(Number),
          rationale: expect.any(String),
        },
        analysis: {
          trendQuality: expect.any(String),
          trendSustainability: expect.any(Number),
          timing: expect.any(String),
          keyFactors: expect.any(Array),
        },
        timeEstimate: {
          minDays: expect.any(Number),
          maxDays: expect.any(Number),
          rationale: expect.any(String),
        },
        timestamp: expect.any(Number),
        dataQuality: expect.any(Number),
      })
    })

    it('should ensure verdict type is valid', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      const validVerdicts = ['Strong Buy', 'Buy', 'Wait', 'Avoid']
      expect(validVerdicts).toContain(verdict?.verdict)
    })

    it('should ensure confidence is valid', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      const validConfidences = ['High', 'Medium', 'Low']
      expect(validConfidences).toContain(verdict?.confidence)
    })

    it('should ensure horizon is valid', async () => {
      const verdict30 = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 30,
      })
      expect(verdict30?.horizon).toBe(30)

      const verdict60 = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })
      expect(verdict60?.horizon).toBe(60)

      const verdict90 = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 90,
      })
      expect(verdict90?.horizon).toBe(90)
    })
  })

  describe('Real-World Scenarios', () => {
    it('should handle PTT stock scenario', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'PTT',
        horizon: 60,
      })

      expect(verdict).not.toBeNull()
      expect(verdict?.symbol).toBe('PTT')
    })

    it('should handle ADVANC stock scenario', async () => {
      const verdict = await generateSwingVerdict({
        symbol: 'ADVANC',
        horizon: 90,
      })

      expect(verdict).not.toBeNull()
      expect(verdict?.symbol).toBe('ADVANC')
      expect(verdict?.horizon).toBe(90)
    })

    it('should handle invalid stock symbol', async () => {
      vi.mocked(fetchStockPrice).mockResolvedValue({
        success: false,
        error: 'Symbol not found',
      })

      const verdict = await generateSwingVerdict({
        symbol: 'INVALID123',
        horizon: 60,
      })

      expect(verdict).toBeNull()
    })
  })
})
