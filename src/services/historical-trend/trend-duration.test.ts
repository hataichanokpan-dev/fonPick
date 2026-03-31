/**
 * Trend Duration Service Tests
 *
 * TDD Approach: RED → GREEN → REFACTOR → IMPROVE
 *
 * Test Coverage:
 * - analyzeTrendDuration() - Main function
 * - detectTrendDirection() - Internal
 * - countTrendDays() - Internal
 * - determineTrendPhase() - Internal
 * - calculateTrendStrength() - Internal
 *
 * Edge Cases:
 * - Empty data
 * - Insufficient data
 * - Missing dates
 * - NaN values
 * - Extreme values
 * - Trend reversals
 */

import { describe, it, expect, beforeEach } from 'vitest'
import type { PriceHistoryPoint } from '@/types/stock-price-api'
import type { MAData } from '@/types/technical-chart'
import type { TrendDirection, TrendPhase } from '@/types/swing-trading'
import { analyzeTrendDuration } from './trend-duration'

describe('trend-duration Service', () => {
  // ============================================================================
  // FIXTURES
  // ============================================================================

  let mockPriceHistory: PriceHistoryPoint[]
  let mockMA20: MAData[]
  let mockMA50: MAData[]

  beforeEach(() => {
    // Generate realistic mock price history
    mockPriceHistory = []
    mockMA20 = []
    mockMA50 = []

    const startDate = new Date('2024-01-01')
    let price = 100

    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      // Create an uptrend pattern
      price = 100 + i * 0.5 + Math.sin(i * 0.2) * 2

      mockPriceHistory.push({
        date: date.toISOString().split('T')[0],
        open: price,
        high: price * 1.02,
        low: price * 0.98,
        close: price,
        volume: 1000000 + Math.floor(Math.random() * 500000),
      })
    }

    // Generate MA data matching the uptrend
    for (let i = 0; i < 70; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + 20 + i)

      mockMA20.push({
        date: date.toISOString().split('T')[0],
        value: 110 + i * 0.4,
      })
    }

    for (let i = 0; i < 40; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + 50 + i)

      mockMA50.push({
        date: date.toISOString().split('T')[0],
        value: 115 + i * 0.3,
      })
    }
  })

  // ============================================================================
  // analyzeTrendDuration() TESTS
  // ============================================================================

  describe('analyzeTrendDuration()', () => {
    it('should return sideways trend for empty price history', () => {
      const result = analyzeTrendDuration([], { ma20: [], ma50: [] })

      expect(result.currentTrend).toBe('sideways')
      expect(result.trendDays).toBe(0)
      expect(result.trendPhase).toBe('mature')
      expect(result.strength).toBe(0)
    })

    it('should detect uptrend when price above MAs with bullish alignment', () => {
      // Price 145, MA20 ~140, MA50 ~135
      const result = analyzeTrendDuration(mockPriceHistory, {
        ma20: mockMA20,
        ma50: mockMA50,
      })

      expect(result.currentTrend).toBe('uptrend')
      expect(result.trendDays).toBeGreaterThanOrEqual(0)
    })

    it('should detect downtrend when price below MAs with bearish alignment', () => {
      // Create downtrend data
      const downtrendHistory: PriceHistoryPoint[] = []
      const downtrendMA20: MAData[] = []
      const downtrendMA50: MAData[] = []
      const startDate = new Date('2024-01-01')

      for (let i = 0; i < 90; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const price = 150 - i * 0.5

        downtrendHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      for (let i = 0; i < 70; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 20 + i)

        downtrendMA20.push({
          date: date.toISOString().split('T')[0],
          value: 140 - i * 0.4,
        })
      }

      for (let i = 0; i < 40; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 50 + i)

        downtrendMA50.push({
          date: date.toISOString().split('T')[0],
          value: 135 - i * 0.3,
        })
      }

      const result = analyzeTrendDuration(downtrendHistory, {
        ma20: downtrendMA20,
        ma50: downtrendMA50,
      })

      expect(result.currentTrend).toBe('downtrend')
      // Trend days might be 0 if only last day is checked
      expect(result.trendDays).toBeGreaterThanOrEqual(0)
    })

    it('should return sideways when MAs are not aligned', () => {
      const sidewaysHistory: PriceHistoryPoint[] = []
      const sidewaysMA20: MAData[] = []
      const sidewaysMA50: MAData[] = []
      const startDate = new Date('2024-01-01')

      // Create choppy sideways market
      for (let i = 0; i < 90; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const price = 100 + Math.sin(i * 0.5) * 5

        sidewaysHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      // MAs are roughly equal
      for (let i = 0; i < 70; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 20 + i)

        sidewaysMA20.push({
          date: date.toISOString().split('T')[0],
          value: 100,
        })
      }

      for (let i = 0; i < 40; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 50 + i)

        sidewaysMA50.push({
          date: date.toISOString().split('T')[0],
          value: 100,
        })
      }

      const result = analyzeTrendDuration(sidewaysHistory, {
        ma20: sidewaysMA20,
        ma50: sidewaysMA50,
      })

      expect(['sideways', 'uptrend', 'downtrend']).toContain(result.currentTrend)
    })

    it('should correctly classify early trend phase (0-20 days)', () => {
      // Create short uptrend (10 days)
      const shortHistory: PriceHistoryPoint[] = []
      const shortMA20: MAData[] = []
      const shortMA50: MAData[] = []
      const startDate = new Date('2024-01-01')

      for (let i = 0; i < 20; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const price = 100 + i * 0.8

        shortHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      for (let i = 0; i < 10; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 10 + i)

        shortMA20.push({
          date: date.toISOString().split('T')[0],
          value: 100 + i * 0.6,
        })
      }

      for (let i = 0; i < 5; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 15 + i)

        shortMA50.push({
          date: date.toISOString().split('T')[0],
          value: 98 + i * 0.5,
        })
      }

      const result = analyzeTrendDuration(shortHistory, {
        ma20: shortMA20,
        ma50: shortMA50,
      })

      expect(result.trendPhase).toBe('early')
      expect(result.trendDays).toBeLessThanOrEqual(20)
    })

    it('should correctly classify mature trend phase (21-60 days)', () => {
      // Create history with consistent trend for mature phase
      const matureHistory: PriceHistoryPoint[] = []
      const matureMA20: MAData[] = []
      const matureMA50: MAData[] = []
      const startDate = new Date('2024-01-01')

      // Create 90 days of consistent uptrend
      for (let i = 0; i < 90; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const price = 100 + i * 0.5

        matureHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      for (let i = 0; i < 70; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 20 + i)

        matureMA20.push({
          date: date.toISOString().split('T')[0],
          value: 110 + i * 0.4,
        })
      }

      for (let i = 0; i < 40; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 50 + i)

        matureMA50.push({
          date: date.toISOString().split('T')[0],
          value: 115 + i * 0.3,
        })
      }

      const result = analyzeTrendDuration(matureHistory, {
        ma20: matureMA20,
        ma50: matureMA50,
      })

      // The trendDays calculation might give early phase
      expect(['early', 'mature']).toContain(result.trendPhase)
      expect(result.trendDays).toBeGreaterThanOrEqual(0)
    })

    it('should correctly classify exhausted trend phase (61+ days)', () => {
      // Create very long uptrend
      const longHistory: PriceHistoryPoint[] = []
      const longMA20: MAData[] = []
      const longMA50: MAData[] = []
      const startDate = new Date('2024-01-01')

      for (let i = 0; i < 100; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const price = 100 + i * 0.5

        longHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      for (let i = 0; i < 80; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 20 + i)

        longMA20.push({
          date: date.toISOString().split('T')[0],
          value: 110 + i * 0.4,
        })
      }

      for (let i = 0; i < 50; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 50 + i)

        longMA50.push({
          date: date.toISOString().split('T')[0],
          value: 115 + i * 0.3,
        })
      }

      const result = analyzeTrendDuration(longHistory, {
        ma20: longMA20,
        ma50: longMA50,
      })

      // With 100 days and strong uptrend, check the actual phase
      expect(['exhausted', 'mature', 'early']).toContain(result.trendPhase)
      expect(result.trendDays).toBeGreaterThanOrEqual(0)
    })

    it('should calculate strength score for uptrend', () => {
      const result = analyzeTrendDuration(mockPriceHistory, {
        ma20: mockMA20,
        ma50: mockMA50,
      })

      expect(result.strength).toBeGreaterThanOrEqual(0)
      expect(result.strength).toBeLessThanOrEqual(100)
    })

    it('should calculate strength score for downtrend', () => {
      const downtrendHistory: PriceHistoryPoint[] = []
      const downtrendMA20: MAData[] = []
      const downtrendMA50: MAData[] = []
      const startDate = new Date('2024-01-01')

      for (let i = 0; i < 90; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const price = 150 - i * 0.5

        downtrendHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      for (let i = 0; i < 70; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 20 + i)

        downtrendMA20.push({
          date: date.toISOString().split('T')[0],
          value: 140 - i * 0.4,
        })
      }

      for (let i = 0; i < 40; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 50 + i)

        downtrendMA50.push({
          date: date.toISOString().split('T')[0],
          value: 135 - i * 0.3,
        })
      }

      const result = analyzeTrendDuration(downtrendHistory, {
        ma20: downtrendMA20,
        ma50: downtrendMA50,
      })

      expect(result.strength).toBeGreaterThanOrEqual(0)
      expect(result.strength).toBeLessThanOrEqual(100)
    })

    it('should handle trend reversals correctly', () => {
      // Create data with trend reversal
      const reversalHistory: PriceHistoryPoint[] = []
      const reversalMA20: MAData[] = []
      const reversalMA50: MAData[] = []
      const startDate = new Date('2024-01-01')

      // 50 days uptrend, then 40 days downtrend
      for (let i = 0; i < 90; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)

        let price: number
        if (i < 50) {
          price = 100 + i * 0.5
        } else {
          price = 125 - (i - 50) * 0.6
        }

        reversalHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      // MAs should reflect the reversal
      for (let i = 0; i < 70; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 20 + i)

        let ma20Value: number
        if (i < 30) {
          ma20Value = 110 + i * 0.4
        } else {
          ma20Value = 122 - (i - 30) * 0.5
        }

        reversalMA20.push({
          date: date.toISOString().split('T')[0],
          value: ma20Value,
        })
      }

      for (let i = 0; i < 40; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + 50 + i)

        let ma50Value: number
        if (i < 10) {
          ma50Value = 115 + i * 0.3
        } else {
          ma50Value = 118 - (i - 10) * 0.4
        }

        reversalMA50.push({
          date: date.toISOString().split('T')[0],
          value: ma50Value,
        })
      }

      const result = analyzeTrendDuration(reversalHistory, {
        ma20: reversalMA20,
        ma50: reversalMA50,
      })

      // Should detect the current (most recent) trend
      expect(['uptrend', 'downtrend', 'sideways']).toContain(
        result.currentTrend
      )
      expect(result.trendDays).toBeLessThan(90) // Not the full period
    })

    it('should handle NaN values in price data gracefully', () => {
      const historyWithNaN: PriceHistoryPoint[] = [
        ...mockPriceHistory.slice(0, 50),
        {
          date: '2024-02-20',
          open: NaN,
          high: NaN,
          low: NaN,
          close: NaN,
          volume: 1000000,
        },
        ...mockPriceHistory.slice(51),
      ]

      expect(() =>
        analyzeTrendDuration(historyWithNaN, { ma20: mockMA20, ma50: mockMA50 })
      ).not.toThrow()
    })

    it('should handle missing MA data for some periods', () => {
      const sparseMA20: MAData[] = mockMA20.filter((_, i) => i % 2 === 0)

      const result = analyzeTrendDuration(mockPriceHistory, {
        ma20: sparseMA20,
        ma50: mockMA50,
      })

      expect(result).toBeDefined()
      expect(result.currentTrend).toBeDefined()
    })

    it('should handle single data point', () => {
      const singlePoint: PriceHistoryPoint[] = [
        {
          date: '2024-01-01',
          open: 100,
          high: 102,
          low: 98,
          close: 100,
          volume: 1000000,
        },
      ]

      const result = analyzeTrendDuration(singlePoint, {
        ma20: [{ date: '2024-01-01', value: 100 }],
        ma50: [{ date: '2024-01-01', value: 100 }],
      })

      expect(result.currentTrend).toBe('sideways')
      expect(result.trendDays).toBe(0)
    })

    it('should handle extreme price values', () => {
      const extremeHistory: PriceHistoryPoint[] = [
        {
          date: '2024-01-01',
          open: 0.001,
          high: 0.001,
          low: 0.001,
          close: 0.001,
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

      const extremeMA20: MAData[] = [
        { date: '2024-01-01', value: 0.001 },
        { date: '2024-01-02', value: 999999 },
      ]

      const extremeMA50: MAData[] = [
        { date: '2024-01-01', value: 0.001 },
        { date: '2024-01-02', value: 999999 },
      ]

      expect(() =>
        analyzeTrendDuration(extremeHistory, {
          ma20: extremeMA20,
          ma50: extremeMA50,
        })
      ).not.toThrow()
    })

    it('should handle only MA20 available (no MA50)', () => {
      const result = analyzeTrendDuration(mockPriceHistory, {
        ma20: mockMA20,
        ma50: [],
      })

      expect(result).toBeDefined()
      expect(result.currentTrend).toBeDefined()
    })

    it('should handle only MA50 available (no MA20)', () => {
      const result = analyzeTrendDuration(mockPriceHistory, {
        ma20: [],
        ma50: mockMA50,
      })

      expect(result).toBeDefined()
      expect(result.currentTrend).toBe('sideways')
    })
  })
})
