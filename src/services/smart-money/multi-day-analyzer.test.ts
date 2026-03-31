/**
 * Multi-Day Smart Money Analyzer Tests
 *
 * TDD approach: Write failing tests first (RED), then implement (GREEN), then refactor (IMPROVE)
 *
 * Test Coverage:
 * - detectPattern(): Pattern detection from multi-day flow data
 * - calculateTrend(): Trend direction and consistency calculation
 * - calculateSustainability(): Sustainability level assessment
 * - generateDailySignal(): Daily signal generation from net flows
 * - analyzeMultiDayPatterns(): Main analysis function with RTDB integration
 * - getPatternRecommendation(): Pattern-based recommendation generation
 *
 * Edge Cases:
 * - Empty data arrays
 * - Single day data
 * - Mixed signals (accumulation vs distribution)
 * - Divergence patterns
 * - Null/undefined data handling
 * - Weekend exclusion
 * - RTDB fetch failures
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { analyzeMultiDayPatterns, getPatternRecommendation } from './multi-day-analyzer'
import type { MultiDaySmartMoneyAnalysis } from '@/types/swing-trading'
import type { RTDBInvestorType } from '@/types/rtdb'

// Mock the RTDB client
vi.mock('@/lib/rtdb/historical', () => ({
  getHistoricalInvestorType: vi.fn(),
}))

import { getHistoricalInvestorType } from '@/lib/rtdb/historical'

describe('Multi-Day Smart Money Analyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ==========================================================================
  // MOCK DATA FACTORIES
  // ==========================================================================

  /**
   * Create mock investor type data for a single date
   */
  const createMockInvestorType = (
    foreignNet: number,
    institutionNet: number
  ): RTDBInvestorType => ({
    foreign: {
      buy: Math.abs(foreignNet) > 0 ? Math.abs(foreignNet) + 500 : 500,
      sell: foreignNet > 0 ? 500 : Math.abs(foreignNet) + 500,
      net: foreignNet,
    },
    institution: {
      buy: Math.abs(institutionNet) > 0 ? Math.abs(institutionNet) + 500 : 500,
      sell: institutionNet > 0 ? 500 : Math.abs(institutionNet) + 500,
      net: institutionNet,
    },
    retail: {
      buy: 1000,
      sell: 1000,
      net: 0,
    },
    prop: {
      buy: 500,
      sell: 500,
      net: 0,
    },
    timestamp: Date.now(),
  })

  /**
   * Create mock historical data for multiple days
   */
  const createMockHistoricalData = (
    days: number,
    foreignNet: number,
    institutionNet: number
  ) => {
    const today = new Date()
    const data = Array.from({ length: days }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (days - 1 - i))
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() - (date.getDay() === 0 ? 2 : 1))
      }
      return {
        date: date.toISOString().split('T')[0],
        data: createMockInvestorType(foreignNet + i * 10, institutionNet + i * 10),
      }
    })
    return { data, missingDates: [], requestedCount: days, retrievedCount: days }
  }

  // ==========================================================================
  // ANALYZE MULTI-DAY PATTERNS - HAPPY PATH
  // ==========================================================================

  describe('analyzeMultiDayPatterns', () => {
    it('should detect accumulation pattern with consistent positive flows', async () => {
      const mockData = createMockHistoricalData(5, 300, 200)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })

      expect(result).not.toBeNull()
      expect(result?.pattern.type).toBe('accumulation')
      expect(result?.pattern.totalFlow).toBeGreaterThan(0)
      expect(result?.daily).toHaveLength(5)
      expect(result?.daily[0].signal).toMatch(/Buy|Strong Buy/)
    })

    it('should detect distribution pattern with consistent negative flows', async () => {
      const mockData = createMockHistoricalData(5, -300, -200)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })

      expect(result).not.toBeNull()
      expect(result?.pattern.type).toBe('distribution')
      expect(result?.pattern.totalFlow).toBeLessThan(0)
      expect(result?.daily[0].signal).toMatch(/Sell|Strong Sell/)
    })

    it('should detect divergence when foreign and institution move oppositely', async () => {
      // Divergence: Foreign trend up, Institution trend down
      // AND smart money not consistent enough (< 0.7) to trigger accumulation/distribution
      const today = new Date()
      const data = [
        // Exactly 50/50 split to keep consistency at 0.5 (below 0.7 threshold)
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(300, -200) }, // Net: +100
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(250, -150) }, // Net: +100
        { date: new Date(today.getTime() - 172800000).toISOString().split('T')[0], data: createMockInvestorType(200, -350) }, // Net: -150
        { date: new Date(today.getTime() - 259200000).toISOString().split('T')[0], data: createMockInvestorType(150, -300) }, // Net: -150
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 4,
        retrievedCount: 4,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 4 })

      expect(result).not.toBeNull()
      // 2 positive, 2 negative = 50% consistency for both directions
      // Foreign: all positive (up), Institution: all negative (down)
      // This should trigger divergence
      expect(result?.pattern.type).toBe('divergence')
    })

    it('should return neutral for inconsistent mixed signals', async () => {
      const today = new Date()
      const data = [
        {
          date: new Date(today).toISOString().split('T')[0],
          data: createMockInvestorType(100, -50), // Weak positive
        },
        {
          date: new Date(today.getTime() - 86400000).toISOString().split('T')[0],
          data: createMockInvestorType(-100, 50), // Weak negative
        },
        {
          date: new Date(today.getTime() - 172800000).toISOString().split('T')[0],
          data: createMockInvestorType(50, 25), // Weak positive
        },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 3,
        retrievedCount: 3,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 3 })

      expect(result).not.toBeNull()
      expect(result?.pattern.type).toBe('neutral')
    })

    it('should return high sustainability for strong 3+ day accumulation', async () => {
      const mockData = createMockHistoricalData(5, 500, 400)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })

      expect(result).not.toBeNull()
      expect(result?.pattern.sustainability).toBe('high')
      expect(result?.confirmation.isConfirmed).toBe(true)
      expect(result?.confirmation.confidence).toBeGreaterThanOrEqual(80)
    })

    it('should return medium sustainability for moderate 2+ day pattern', async () => {
      const today = new Date()
      const data = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(200, 150) },
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(190, 140) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 2,
        retrievedCount: 2,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 2 })

      expect(result).not.toBeNull()
      expect(result?.pattern.sustainability).toBe('medium')
      expect(result?.confirmation.isConfirmed).toBe(true)
      expect(result?.confirmation.confidence).toBeGreaterThanOrEqual(60)
    })

    it('should return low sustainability for weak patterns', async () => {
      const today = new Date()
      const data = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(100, 50) },
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(-50, -25) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 2,
        retrievedCount: 2,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 2 })

      expect(result).not.toBeNull()
      expect(result?.pattern.sustainability).toBe('low')
      expect(result?.confirmation.isConfirmed).toBe(false)
      expect(result?.confirmation.confidence).toBe(40)
    })
  })

  // ==========================================================================
  // DAILY SIGNAL GENERATION
  // ==========================================================================

  describe('Daily Signal Generation', () => {
    it('should generate Strong Buy signal for net flow > 500M', async () => {
      const mockData = createMockHistoricalData(1, 400, 200) // Net = 600
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 1 })

      expect(result?.daily[0].signal).toBe('Strong Buy')
    })

    it('should generate Buy signal for net flow between 200-500M', async () => {
      const mockData = createMockHistoricalData(1, 150, 100) // Net = 250
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 1 })

      expect(result?.daily[0].signal).toBe('Buy')
    })

    it('should generate Neutral signal for net flow between -200 to 200M', async () => {
      const mockData = createMockHistoricalData(1, 50, 30) // Net = 80
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 1 })

      expect(result?.daily[0].signal).toBe('Neutral')
    })

    it('should generate Sell signal for net flow between -500 to -200M', async () => {
      const mockData = createMockHistoricalData(1, -150, -100) // Net = -250
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 1 })

      expect(result?.daily[0].signal).toBe('Sell')
    })

    it('should generate Strong Sell signal for net flow < -500M', async () => {
      const mockData = createMockHistoricalData(1, -300, -250) // Net = -550
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 1 })

      expect(result?.daily[0].signal).toBe('Strong Sell')
    })
  })

  // ==========================================================================
  // EDGE CASES - EMPTY/NULL DATA
  // ==========================================================================

  describe('Edge Cases: Empty/Null Data', () => {
    it('should return null when RTDB returns null', async () => {
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(null as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })

      expect(result).toBeNull()
    })

    it('should return null when RTDB returns empty array', async () => {
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data: [],
        missingDates: [],
        requestedCount: 5,
        retrievedCount: 0,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })

      expect(result).toBeNull()
    })

    it('should return null when all data points have null data field', async () => {
      const today = new Date()
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data: [
          { date: today.toISOString().split('T')[0], data: null },
          { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: null },
        ],
        missingDates: [],
        requestedCount: 2,
        retrievedCount: 0,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 2 })

      expect(result).toBeNull()
    })

    it('should handle RTDB errors gracefully', async () => {
      vi.mocked(getHistoricalInvestorType).mockRejectedValue(new Error('RTDB connection failed'))

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })

      expect(result).toBeNull()
    })

    it('should filter out data points with null data field', async () => {
      const today = new Date()
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data: [
          { date: today.toISOString().split('T')[0], data: createMockInvestorType(100, 50) },
          { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: null },
          { date: new Date(today.getTime() - 172800000).toISOString().split('T')[0], data: createMockInvestorType(200, 100) },
        ],
        missingDates: [],
        requestedCount: 3,
        retrievedCount: 2,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 3 })

      expect(result).not.toBeNull()
      expect(result?.daily).toHaveLength(2)
    })
  })

  // ==========================================================================
  // EDGE CASES - SINGLE DAY DATA
  // ==========================================================================

  describe('Edge Cases: Single Day Data', () => {
    it('should analyze single day data correctly', async () => {
      const mockData = createMockHistoricalData(1, 500, 300)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 1 })

      expect(result).not.toBeNull()
      expect(result?.period.days).toBe(1)
      expect(result?.daily).toHaveLength(1)
      expect(result?.pattern.consecutiveDays).toBe(1)
    })

    it('should return low sustainability for single day data', async () => {
      const mockData = createMockHistoricalData(1, 500, 300)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 1 })

      expect(result?.pattern.sustainability).toBe('low')
      expect(result?.confirmation.isConfirmed).toBe(false)
    })
  })

  // ==========================================================================
  // EDGE CASES - MIXED SIGNALS
  // ==========================================================================

  describe('Edge Cases: Mixed Signals', () => {
    it('should detect early shift from accumulation to distribution', async () => {
      const today = new Date()
      const data = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(-100, -50) }, // Recent: negative
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(-150, -75) },
        { date: new Date(today.getTime() - 172800000).toISOString().split('T')[0], data: createMockInvestorType(-200, -100) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 3,
        retrievedCount: 3,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 3 })

      // Should detect distribution based on consistent negative flow
      expect(result?.pattern.type).toBe('distribution')
    })

    it('should detect early shift from distribution to accumulation', async () => {
      const today = new Date()
      const data = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(100, 50) }, // Recent: positive
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(150, 75) },
        { date: new Date(today.getTime() - 172800000).toISOString().split('T')[0], data: createMockInvestorType(200, 100) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 3,
        retrievedCount: 3,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 3 })

      // Should detect accumulation based on consistent positive flow
      expect(result?.pattern.type).toBe('accumulation')
    })

    it('should calculate consecutive days correctly for pattern breaks', async () => {
      const today = new Date()
      const data = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(200, 100) },
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(150, 75) },
        { date: new Date(today.getTime() - 172800000).toISOString().split('T')[0], data: createMockInvestorType(-50, -25) }, // Pattern break
        { date: new Date(today.getTime() - 259200000).toISOString().split('T')[0], data: createMockInvestorType(100, 50) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 4,
        retrievedCount: 4,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 4 })

      // Should count consecutive days from most recent
      expect(result?.pattern.consecutiveDays).toBe(2)
    })
  })

  // ==========================================================================
  // PERIOD HANDLING
  // ==========================================================================

  describe('Period Handling', () => {
    it('should calculate correct period start and end dates', async () => {
      const mockData = createMockHistoricalData(5, 200, 100)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })

      expect(result?.period.start).toBeDefined()
      expect(result?.period.end).toBeDefined()
      expect(result?.period.days).toBe(5)
    })

    it('should exclude weekends from period calculation', async () => {
      // This test verifies that when RTDB returns filtered data (excluding weekends),
      // the analyzer correctly processes the available trading days
      const today = new Date()
      const tradingDays = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(200, 100) },
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(210, 110) },
        { date: new Date(today.getTime() - 172800000).toISOString().split('T')[0], data: createMockInvestorType(220, 120) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data: tradingDays,
        missingDates: [],
        requestedCount: 5,
        retrievedCount: 3,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })

      expect(result?.period.days).toBe(3) // Only 3 trading days returned
    })

    it('should handle all three day options (3, 5, 10)', async () => {
      const mockData3 = createMockHistoricalData(3, 200, 100)
      vi.mocked(getHistoricalInvestorType).mockResolvedValueOnce(mockData3 as any)
      const result3 = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 3 })
      expect(result3?.period.days).toBe(3)

      const mockData5 = createMockHistoricalData(5, 200, 100)
      vi.mocked(getHistoricalInvestorType).mockResolvedValueOnce(mockData5 as any)
      const result5 = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })
      expect(result5?.period.days).toBe(5)

      const mockData10 = createMockHistoricalData(10, 200, 100)
      vi.mocked(getHistoricalInvestorType).mockResolvedValueOnce(mockData10 as any)
      const result10 = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 10 })
      expect(result10?.period.days).toBe(10)
    })
  })

  // ==========================================================================
  // PATTERN RECOMMENDATION
  // ==========================================================================

  describe('getPatternRecommendation', () => {
    const createMockAnalysis = (
      patternType: 'accumulation' | 'distribution' | 'divergence' | 'neutral',
      isConfirmed: boolean,
      consecutiveDays: number
    ): MultiDaySmartMoneyAnalysis => ({
      symbol: 'PTT',
      period: {
        start: '2024-01-01',
        end: '2024-01-05',
        days: 5,
      },
      daily: [],
      pattern: {
        type: patternType,
        consecutiveDays,
        totalFlow: 1000,
        sustainability: 'high',
      },
      confirmation: {
        isConfirmed,
        confidence: 80,
        rationale: 'Test rationale',
      },
    })

    it('should recommend entry for confirmed accumulation pattern', () => {
      const analysis = createMockAnalysis('accumulation', true, 3)
      const recommendation = getPatternRecommendation(analysis)

      expect(recommendation).toContain('Accumulation confirmed')
      expect(recommendation).toContain('3 days')
      expect(recommendation).toContain('Favorable for entries')
    })

    it('should recommend avoidance for confirmed distribution pattern', () => {
      const analysis = createMockAnalysis('distribution', true, 4)
      const recommendation = getPatternRecommendation(analysis)

      expect(recommendation).toContain('Distribution confirmed')
      expect(recommendation).toContain('4 days')
      expect(recommendation).toContain('Avoid new entries')
    })

    it('should recommend waiting for divergence pattern', () => {
      const analysis = createMockAnalysis('divergence', true, 2)
      const recommendation = getPatternRecommendation(analysis)

      expect(recommendation).toContain('Divergence detected')
      expect(recommendation).toContain('Mixed signals')
      expect(recommendation).toContain('Wait for clarity')
    })

    it('should recommend monitoring for neutral pattern', () => {
      const analysis = createMockAnalysis('neutral', true, 1)
      const recommendation = getPatternRecommendation(analysis)

      expect(recommendation).toContain('No clear pattern')
      expect(recommendation).toContain('Monitor market')
    })

    it('should recommend waiting when pattern is not confirmed', () => {
      const analysis = createMockAnalysis('accumulation', false, 2)
      const recommendation = getPatternRecommendation(analysis)

      expect(recommendation).toContain('Pattern not confirmed')
      expect(recommendation).toContain('Wait for clearer signals')
    })

    it('should recommend waiting for unconfirmed distribution pattern', () => {
      const analysis = createMockAnalysis('distribution', false, 1)
      const recommendation = getPatternRecommendation(analysis)

      expect(recommendation).toContain('Pattern not confirmed')
    })
  })

  // ==========================================================================
  // RATIONALE GENERATION
  // ==========================================================================

  describe('Rationale Generation', () => {
    it('should generate strong accumulation rationale for 3+ days', async () => {
      const mockData = createMockHistoricalData(5, 400, 300)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })

      expect(result?.confirmation.rationale).toContain('Strong accumulation')
      expect(result?.confirmation.rationale).toContain('Smart money building position')
    })

    it('should generate moderate accumulation rationale for <3 days', async () => {
      const mockData = createMockHistoricalData(2, 300, 200)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 2 })

      expect(result?.confirmation.rationale).toContain('Accumulation pattern detected')
      expect(result?.confirmation.rationale).toContain('Smart money buying interest')
    })

    it('should generate strong distribution rationale for 3+ days', async () => {
      const mockData = createMockHistoricalData(5, -400, -300)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })

      expect(result?.confirmation.rationale).toContain('Strong distribution')
      expect(result?.confirmation.rationale).toContain('Smart money exiting position')
    })

    it('should generate divergence rationale', async () => {
      const today = new Date()
      const data = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(300, -200) },
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(250, -150) },
        { date: new Date(today.getTime() - 172800000).toISOString().split('T')[0], data: createMockInvestorType(200, -350) },
        { date: new Date(today.getTime() - 259200000).toISOString().split('T')[0], data: createMockInvestorType(150, -300) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 4,
        retrievedCount: 4,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 4 })

      expect(result?.confirmation.rationale).toContain('diverging')
      expect(result?.confirmation.rationale).toContain('Mixed signals')
    })

    it('should generate neutral rationale for no clear pattern', async () => {
      const today = new Date()
      const data = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(50, 25) },
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(-30, -15) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 2,
        retrievedCount: 2,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 2 })

      expect(result?.confirmation.rationale).toContain('No clear smart money pattern')
      expect(result?.confirmation.rationale).toContain('Inconclusive')
    })
  })

  // ==========================================================================
  // CONFIDENCE CALCULATION
  // ==========================================================================

  describe('Confidence Calculation', () => {
    it('should set confidence to 80 for high sustainability', async () => {
      const mockData = createMockHistoricalData(5, 500, 400)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })

      expect(result?.confirmation.confidence).toBe(80)
    })

    it('should set confidence to 60 for medium sustainability', async () => {
      const today = new Date()
      const data = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(200, 150) },
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(190, 140) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 2,
        retrievedCount: 2,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 2 })

      expect(result?.confirmation.confidence).toBe(60)
    })

    it('should set confidence to 40 for low sustainability', async () => {
      const today = new Date()
      const data = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(100, 50) },
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(-50, -25) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 2,
        retrievedCount: 2,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 2 })

      expect(result?.confirmation.confidence).toBe(40)
    })
  })

  // ==========================================================================
  // TOTAL FLOW CALCULATION
  // ==========================================================================

  describe('Total Flow Calculation', () => {
    it('should correctly sum all smart money flows', async () => {
      const today = new Date()
      const data = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(100, 50) },
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(200, 100) },
        { date: new Date(today.getTime() - 172800000).toISOString().split('T')[0], data: createMockInvestorType(300, 150) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 3,
        retrievedCount: 3,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 3 })

      // Expected: (100+50) + (200+100) + (300+150) = 900
      expect(result?.pattern.totalFlow).toBe(900)
    })

    it('should handle negative total flows correctly', async () => {
      const today = new Date()
      const data = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(-100, -50) },
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(-200, -100) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 2,
        retrievedCount: 2,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 2 })

      // Expected: -(100+50) - (200+100) = -450
      expect(result?.pattern.totalFlow).toBe(-450)
    })

    it('should handle mixed positive and negative flows', async () => {
      const today = new Date()
      const data = [
        { date: new Date(today).toISOString().split('T')[0], data: createMockInvestorType(300, 150) },
        { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], data: createMockInvestorType(-100, -50) },
      ]
      vi.mocked(getHistoricalInvestorType).mockResolvedValue({
        data,
        missingDates: [],
        requestedCount: 2,
        retrievedCount: 2,
      })

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 2 })

      // Expected: (300+150) - (100+50) = 300
      expect(result?.pattern.totalFlow).toBe(300)
    })
  })

  // ==========================================================================
  // RTDB INTEGRATION
  // ==========================================================================

  describe('RTDB Integration', () => {
    it('should call getHistoricalInvestorType with correct parameters', async () => {
      const mockData = createMockHistoricalData(5, 200, 100)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      await analyzeMultiDayPatterns({ symbol: 'PTT', days: 5 })

      expect(getHistoricalInvestorType).toHaveBeenCalledTimes(1)
      expect(getHistoricalInvestorType).toHaveBeenCalledWith({
        days: 5,
        excludeWeekends: true,
      })
    })

    it('should not pass symbol to getHistoricalInvestorType (market-wide data)', async () => {
      const mockData = createMockHistoricalData(3, 200, 100)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      await analyzeMultiDayPatterns({ symbol: 'ANY', days: 3 })

      // Verify it was called, but symbol doesn't matter for investor type data
      expect(getHistoricalInvestorType).toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // BOUNDARY CONDITIONS
  // ==========================================================================

  describe('Boundary Conditions', () => {
    it('should handle maximum day count (10 days)', async () => {
      const mockData = createMockHistoricalData(10, 200, 100)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 10 })

      expect(result).not.toBeNull()
      expect(result?.period.days).toBe(10)
    })

    it('should handle zero net flows', async () => {
      const mockData = createMockHistoricalData(3, 0, 0)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 3 })

      expect(result).not.toBeNull()
      expect(result?.daily[0].signal).toBe('Neutral')
    })

    it('should handle very large positive flows', async () => {
      const mockData = createMockHistoricalData(3, 5000, 3000)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 3 })

      expect(result).not.toBeNull()
      expect(result?.pattern.totalFlow).toBeGreaterThan(0)
      expect(result?.daily[0].signal).toBe('Strong Buy')
    })

    it('should handle very large negative flows', async () => {
      const mockData = createMockHistoricalData(3, -5000, -3000)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 3 })

      expect(result).not.toBeNull()
      expect(result?.pattern.totalFlow).toBeLessThan(0)
      expect(result?.daily[0].signal).toBe('Strong Sell')
    })

    it('should handle signal boundary at exactly 500M (should be Buy, not Strong Buy)', async () => {
      const mockData = createMockHistoricalData(1, 300, 200) // Net = 500 (not > 500)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 1 })

      expect(result?.daily[0].signal).toBe('Buy') // Strict inequality: 500 is NOT > 500
    })

    it('should handle signal boundary at exactly 200M (should be Neutral, not Buy)', async () => {
      const mockData = createMockHistoricalData(1, 120, 80) // Net = 200 (not > 200)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 1 })

      expect(result?.daily[0].signal).toBe('Neutral') // Strict inequality: 200 is NOT > 200
    })

    it('should handle signal boundary at exactly -200M (should be Neutral, not Sell)', async () => {
      const mockData = createMockHistoricalData(1, -120, -80) // Net = -200 (not < -200)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 1 })

      expect(result?.daily[0].signal).toBe('Neutral') // Strict inequality: -200 is NOT < -200
    })

    it('should handle signal boundary at exactly -500M (should be Sell, not Strong Sell)', async () => {
      const mockData = createMockHistoricalData(1, -300, -200) // Net = -500 (not < -500)
      vi.mocked(getHistoricalInvestorType).mockResolvedValue(mockData as any)

      const result = await analyzeMultiDayPatterns({ symbol: 'PTT', days: 1 })

      expect(result?.daily[0].signal).toBe('Sell') // Strict inequality: -500 is NOT < -500
    })
  })
})
