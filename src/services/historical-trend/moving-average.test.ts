/**
 * Moving Average Service Tests
 *
 * TDD Approach: RED → GREEN → REFACTOR → IMPROVE
 *
 * Test Coverage:
 * - calculateMovingAverages()
 * - calculateCrossOverSignals()
 * - getLatestMAValues()
 * - calculateMAAlignment()
 *
 * Edge Cases:
 * - Empty data
 * - Insufficient data (<60 days)
 * - Missing dates
 * - NaN values
 * - Extreme values
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { MAData } from '@/types/technical-chart'
import type { PriceHistoryPoint } from '@/types/stock-price-api'
import {
  calculateMovingAverages,
  calculateCrossOverSignals,
  getLatestMAValues,
  calculateMAAlignment,
} from './moving-average'

// Mock technical-indicators module
vi.mock('@/lib/technical-indicators', () => ({
  calculateSMA: vi.fn(),
}))

import { calculateSMA } from '@/lib/technical-indicators'

describe('moving-average Service', () => {
  // ============================================================================
  // FIXTURES
  // ============================================================================

  let mockPriceHistory: PriceHistoryPoint[]
  let mockMA20: MAData[]
  let mockMA50: MAData[]
  let mockMA200: MAData[]

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Generate realistic mock price history (90 days of data)
    mockPriceHistory = []
    let price = 100
    const startDate = new Date('2024-01-01')

    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      // Add some price movement
      const change = (Math.random() - 0.5) * 4 // -2 to +2
      price = Math.max(50, Math.min(200, price + change))

      mockPriceHistory.push({
        date: date.toISOString().split('T')[0],
        open: price,
        high: price * 1.02,
        low: price * 0.98,
        close: price,
        volume: 1000000 + Math.floor(Math.random() * 500000),
      })
    }

    // Generate mock MA data
    mockMA20 = []
    mockMA50 = []
    mockMA200 = []

    for (let i = 0; i < 70; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + 20 + i)
      mockMA20.push({
        date: date.toISOString().split('T')[0],
        value: 100 + Math.sin(i * 0.1) * 10,
      })
    }

    for (let i = 0; i < 40; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + 50 + i)
      mockMA50.push({
        date: date.toISOString().split('T')[0],
        value: 100 + Math.sin(i * 0.05) * 8,
      })
    }

    for (let i = 0; i < 20; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + 200 + i)
      mockMA200.push({
        date: date.toISOString().split('T')[0],
        value: 100 + Math.sin(i * 0.02) * 5,
      })
    }
  })

  // ============================================================================
  // calculateMovingAverages() TESTS
  // ============================================================================

  describe('calculateMovingAverages()', () => {
    it('should return empty arrays for empty price history', () => {
      vi.mocked(calculateSMA).mockReturnValue([])

      const result = calculateMovingAverages([])

      expect(result.ma20).toEqual([])
      expect(result.ma50).toEqual([])
      expect(result.ma200).toEqual([])
      expect(calculateSMA).toHaveBeenCalledWith([], 20)
      expect(calculateSMA).toHaveBeenCalledWith([], 50)
      expect(calculateSMA).toHaveBeenCalledWith([], 200)
    })

    it('should calculate all three moving averages', () => {
      vi.mocked(calculateSMA)
        .mockReturnValueOnce(mockMA20)
        .mockReturnValueOnce(mockMA50)
        .mockReturnValueOnce(mockMA200)

      const result = calculateMovingAverages(mockPriceHistory)

      expect(result.ma20).toEqual(mockMA20)
      expect(result.ma50).toEqual(mockMA50)
      expect(result.ma200).toEqual(mockMA200)
      expect(calculateSMA).toHaveBeenCalledTimes(3)
    })

    it('should handle insufficient data for MA200', () => {
      const shortHistory = mockPriceHistory.slice(0, 50)
      vi.mocked(calculateSMA).mockReturnValue([])

      const result = calculateMovingAverages(shortHistory)

      expect(result).toBeDefined()
      expect(calculateSMA).toHaveBeenCalledWith(shortHistory, 200)
    })

    it('should handle NaN values in price data gracefully', () => {
      const historyWithNaN: PriceHistoryPoint[] = [
        ...mockPriceHistory.slice(0, 10),
        {
          date: '2024-01-11',
          open: NaN,
          high: NaN,
          low: NaN,
          close: NaN,
          volume: 1000000,
        },
        ...mockPriceHistory.slice(11),
      ]

      vi.mocked(calculateSMA).mockReturnValue([])

      // Should not throw, but handle gracefully
      expect(() => calculateMovingAverages(historyWithNaN)).not.toThrow()
    })

    it('should handle extreme price values', () => {
      const extremeHistory: PriceHistoryPoint[] = [
        {
          date: '2024-01-01',
          open: 0.01,
          high: 0.01,
          low: 0.01,
          close: 0.01,
          volume: 1000000,
        },
        {
          date: '2024-01-02',
          open: 999999,
          high: 999999,
          low: 999999,
          close: 999999,
          volume: 1000000,
        },
      ]

      vi.mocked(calculateSMA).mockReturnValue([])

      expect(() => calculateMovingAverages(extremeHistory)).not.toThrow()
    })
  })

  // ============================================================================
  // calculateCrossOverSignals() TESTS
  // ============================================================================

  describe('calculateCrossOverSignals()', () => {
    it('should return empty object when insufficient MA50 data', () => {
      const result = calculateCrossOverSignals({
        ma50: [], // Less than 200
        ma200: mockMA200,
      })

      expect(result).toEqual({ goldenCross: undefined, deathCross: undefined })
    })

    it('should return empty object when insufficient MA200 data', () => {
      const result = calculateCrossOverSignals({
        ma50: mockMA50, // Less than 200
        ma200: [],
      })

      expect(result).toEqual({ goldenCross: undefined, deathCross: undefined })
    })

    it('should detect golden cross when MA50 crosses above MA200', () => {
      // Create data where MA50 crosses from below to above MA200
      const ma50: MAData[] = []
      const ma200: MAData[] = []
      const startDate = new Date('2024-01-01')

      for (let i = 0; i < 250; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)

        // MA50 starts below, then crosses above
        const ma50Value = i < 150 ? 98 + i * 0.01 : 99.5 + (i - 150) * 0.02
        const ma200Value = 99

        ma50.push({ date: date.toISOString().split('T')[0], value: ma50Value })
        ma200.push({ date: date.toISOString().split('T')[0], value: ma200Value })
      }

      const result = calculateCrossOverSignals({ ma50, ma200 })

      expect(result.goldenCross).toBeDefined()
      expect(result.deathCross).toBeUndefined()
      expect(result.goldenCross).toMatch(/^\d{4}-\d{2}-\d{2}$/) // Date format
    })

    it('should detect death cross when MA50 crosses below MA200', () => {
      const ma50: MAData[] = []
      const ma200: MAData[] = []
      const startDate = new Date('2024-01-01')

      for (let i = 0; i < 250; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)

        // MA50 starts above, then crosses below
        const ma50Value = i < 150 ? 102 - i * 0.01 : 100.5 - (i - 150) * 0.02
        const ma200Value = 101

        ma50.push({ date: date.toISOString().split('T')[0], value: ma50Value })
        ma200.push({ date: date.toISOString().split('T')[0], value: ma200Value })
      }

      const result = calculateCrossOverSignals({ ma50, ma200 })

      expect(result.deathCross).toBeDefined()
      expect(result.goldenCross).toBeUndefined()
      expect(result.deathCross).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should find most recent crossover when multiple exist', () => {
      const ma50: MAData[] = []
      const ma200: MAData[] = []
      const startDate = new Date('2024-01-01')

      // Create multiple crossovers
      for (let i = 0; i < 250; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)

        // Create multiple crosses
        let ma50Value = 100
        let ma200Value = 100

        if (i < 100) {
          ma50Value = 99 + i * 0.01
          ma200Value = 100
        } else if (i < 180) {
          ma50Value = 100 + (i - 100) * 0.02
          ma200Value = 100
        } else {
          ma50Value = 103.6 - (i - 180) * 0.03
          ma200Value = 102
        }

        ma50.push({ date: date.toISOString().split('T')[0], value: ma50Value })
        ma200.push({ date: date.toISOString().split('T')[0], value: ma200Value })
      }

      const result = calculateCrossOverSignals({ ma50, ma200 })

      // Should find the most recent crossover
      expect(result.goldenCross || result.deathCross).toBeDefined()
    })

    it('should handle equal values correctly', () => {
      const ma50: MAData[] = []
      const ma200: MAData[] = []
      const startDate = new Date('2024-01-01')

      for (let i = 0; i < 250; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const value = 100

        ma50.push({ date: date.toISOString().split('T')[0], value })
        ma200.push({ date: date.toISOString().split('T')[0], value })
      }

      const result = calculateCrossOverSignals({ ma50, ma200 })

      // When all equal, no crossover detected
      expect(result.goldenCross).toBeUndefined()
      expect(result.deathCross).toBeUndefined()
    })
  })

  // ============================================================================
  // getLatestMAValues() TESTS
  // ============================================================================

  describe('getLatestMAValues()', () => {
    it('should return all latest values when all MAs are available', () => {
      const result = getLatestMAValues({
        ma20: mockMA20,
        ma50: mockMA50,
        ma200: mockMA200,
      })

      expect(result.ma20).toBe(mockMA20[mockMA20.length - 1].value)
      expect(result.ma50).toBe(mockMA50[mockMA50.length - 1].value)
      expect(result.ma200).toBe(mockMA200[mockMA200.length - 1].value)
    })

    it('should return only available MAs when some are missing', () => {
      const result = getLatestMAValues({
        ma20: mockMA20,
        ma50: undefined,
        ma200: [],
      })

      expect(result.ma20).toBeDefined()
      expect(result.ma50).toBeUndefined()
      expect(result.ma200).toBeUndefined()
    })

    it('should return empty object when all MAs are empty', () => {
      const result = getLatestMAValues({})

      expect(result).toEqual({})
    })

    it('should handle single element MA arrays', () => {
      const singleMA: MAData[] = [{ date: '2024-01-01', value: 100 }]

      const result = getLatestMAValues({ ma20: singleMA })

      expect(result.ma20).toBe(100)
    })

    it('should handle NaN values in MA data', () => {
      const maWithNaN: MAData[] = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: NaN },
      ]

      const result = getLatestMAValues({ ma20: maWithNaN })

      expect(result.ma20).toBeNaN()
    })
  })

  // ============================================================================
  // calculateMAAlignment() TESTS
  // ============================================================================

  describe('calculateMAAlignment()', () => {
    it('should return 100 for perfect bullish alignment', () => {
      const result = calculateMAAlignment(
        {
          ma20: 105,
          ma50: 100,
          ma200: 95,
        },
        110 // Price above all MAs
      )

      expect(result).toBe(100)
    })

    it('should return 0 for perfect bearish alignment', () => {
      const result = calculateMAAlignment(
        {
          ma20: 95,
          ma50: 100,
          ma200: 105,
        },
        90 // Price below all MAs
      )

      expect(result).toBe(0)
    })

    it('should return 0 when no MAs are provided', () => {
      const result = calculateMAAlignment({}, 100)

      expect(result).toBe(0)
    })

    it('should score based on price vs MA20 only', () => {
      const aboveResult = calculateMAAlignment({ ma20: 100 }, 105)
      const belowResult = calculateMAAlignment({ ma20: 100 }, 95)

      expect(aboveResult).toBeGreaterThan(belowResult)
      expect(aboveResult).toBe(100)
      expect(belowResult).toBe(0)
    })

    it('should score based on MA20 vs MA50 relationship', () => {
      const bullishResult = calculateMAAlignment(
        { ma20: 105, ma50: 100 },
        110
      )
      const bearishResult = calculateMAAlignment(
        { ma20: 95, ma50: 100 },
        90
      )

      expect(bullishResult).toBeGreaterThan(bearishResult)
    })

    it('should score based on MA50 vs MA200 relationship', () => {
      const bullishResult = calculateMAAlignment(
        { ma50: 105, ma200: 100 },
        110
      )
      const bearishResult = calculateMAAlignment(
        { ma50: 95, ma200: 100 },
        90
      )

      expect(bullishResult).toBeGreaterThan(bearishResult)
    })

    it('should handle partial MA data', () => {
      const result = calculateMAAlignment({ ma20: 105 }, 110)

      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(100)
    })

    it('should handle zero values in MAs', () => {
      const result = calculateMAAlignment({ ma20: 0, ma50: 0 }, 100)

      // When MA20 = 0, price > MA20 is true
      // Since only MA20 is available, score is based on that alone (33% max for that portion)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(100)
    })

    it('should handle negative MA values', () => {
      const result = calculateMAAlignment(
        { ma20: -5, ma50: -10, ma200: -15 },
        -1
      )

      expect(result).toBe(100) // Still bullish alignment
    })

    it('should handle extreme price values', () => {
      const veryHighPriceResult = calculateMAAlignment(
        { ma20: 100, ma50: 100, ma200: 100 },
        999999
      )
      const veryLowPriceResult = calculateMAAlignment(
        { ma20: 100, ma50: 100, ma200: 100 },
        0.001
      )

      // Very high price should be bullish but MAs are equal (no bullish alignment)
      expect(veryHighPriceResult).toBeGreaterThanOrEqual(0)
      expect(veryHighPriceResult).toBeLessThanOrEqual(100)
      // Very low price should be bearish
      expect(veryLowPriceResult).toBe(0)
    })

    it('should calculate proportional score for mixed alignment', () => {
      const mixedResult = calculateMAAlignment(
        {
          ma20: 105, // Above MA50
          ma50: 100,
          ma200: 110, // But MA50 below MA200
        },
        110 // Price above MA20
      )

      expect(mixedResult).toBeGreaterThan(0)
      expect(mixedResult).toBeLessThan(100)
    })
  })
})
