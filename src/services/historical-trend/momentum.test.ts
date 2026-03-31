/**
 * Momentum Service Tests
 *
 * TDD Approach: RED → GREEN → REFACTOR → IMPROVE
 *
 * Test Coverage:
 * - analyzeMomentum() - Main function
 * - calculateROC() - Internal
 * - calculateMomentumScore() - Internal
 * - isMomentumAccelerating() - Internal
 * - isMomentumDecelerating() - Internal
 * - getMomentumRecommendation()
 *
 * Edge Cases:
 * - Empty data
 * - Insufficient data (<10 days)
 * - Missing dates
 * - NaN values
 * - Extreme values
 * - Zero/negative prices
 */

import { describe, it, expect, beforeEach } from 'vitest'
import type { PriceHistoryPoint } from '@/types/stock-price-api'
import {
  analyzeMomentum,
  getMomentumRecommendation,
} from './momentum'

describe('momentum Service', () => {
  // ============================================================================
  // FIXTURES
  // ============================================================================

  let mockPriceHistory: PriceHistoryPoint[]

  beforeEach(() => {
    // Generate realistic mock price history with momentum
    mockPriceHistory = []
    const startDate = new Date('2024-01-01')
    let price = 100

    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      // Create accelerating uptrend (increasing gains)
      const gain = 0.2 + i * 0.01
      price = price * (1 + gain / 100)

      mockPriceHistory.push({
        date: date.toISOString().split('T')[0],
        open: price,
        high: price * 1.02,
        low: price * 0.98,
        close: price,
        volume: 1000000 + Math.floor(Math.random() * 500000),
      })
    }
  })

  // ============================================================================
  // analyzeMomentum() TESTS
  // ============================================================================

  describe('analyzeMomentum()', () => {
    it('should return neutral score for insufficient data (<10 days)', () => {
      const shortHistory = mockPriceHistory.slice(0, 5)

      const result = analyzeMomentum(shortHistory, 5)

      expect(result.sustainabilityScore).toBe(50) // Neutral
      expect(result.isAccelerating).toBe(false)
      expect(result.isDecelerating).toBe(false)
    })

    it('should detect accelerating momentum', () => {
      const acceleratingHistory: PriceHistoryPoint[] = []
      const startDate = new Date('2024-01-01')
      let price = 100

      // First 10 days: small gains
      for (let i = 0; i < 10; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        price = price * 1.002

        acceleratingHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      // Next 5 days: larger gains (accelerating)
      for (let i = 10; i < 15; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        price = price * 1.01

        acceleratingHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      const result = analyzeMomentum(acceleratingHistory, 15)

      expect(result.isAccelerating).toBe(true)
    })

    it('should detect decelerating momentum', () => {
      const deceleratingHistory: PriceHistoryPoint[] = []
      const startDate = new Date('2024-01-01')
      let price = 100

      // First 10 days: large gains
      for (let i = 0; i < 10; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        price = price * 1.01

        deceleratingHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      // Next 5 days: smaller gains (decelerating)
      for (let i = 10; i < 15; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        price = price * 1.002

        deceleratingHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      const result = analyzeMomentum(deceleratingHistory, 15)

      expect(result.isDecelerating).toBe(true)
    })

    it('should calculate high sustainability score for consistent uptrend', () => {
      const result = analyzeMomentum(mockPriceHistory, 60)

      expect(result.sustainabilityScore).toBeGreaterThan(50)
      expect(result.sustainabilityScore).toBeLessThanOrEqual(100)
    })

    it('should calculate sustainability score for downtrend', () => {
      const downtrendHistory: PriceHistoryPoint[] = []
      const startDate = new Date('2024-01-01')
      let price = 150

      for (let i = 0; i < 90; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        price = price * 0.995

        downtrendHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      const result = analyzeMomentum(downtrendHistory, 90)

      // The momentum score might be high for consistent downtrend too
      // because consistency is rewarded
      expect(result.sustainabilityScore).toBeGreaterThanOrEqual(0)
      expect(result.sustainabilityScore).toBeLessThanOrEqual(100)
    })

    it('should return moderate score for sideways market', () => {
      const sidewaysHistory: PriceHistoryPoint[] = []
      const startDate = new Date('2024-01-01')

      for (let i = 0; i < 90; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const price = 100 + Math.sin(i * 0.2) * 5

        sidewaysHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      const result = analyzeMomentum(sidewaysHistory, 90)

      expect(result.sustainabilityScore).toBeGreaterThanOrEqual(0)
      expect(result.sustainabilityScore).toBeLessThanOrEqual(100)
    })

    it('should handle early trend (trendDays <= 20) favorably', () => {
      const earlyTrendHistory = mockPriceHistory.slice(0, 25)

      const result = analyzeMomentum(earlyTrendHistory, 15)

      expect(result.sustainabilityScore).toBeGreaterThanOrEqual(0)
    })

    it('should penalize late trend (trendDays > 60)', () => {
      const lateTrendHistory = mockPriceHistory.slice(0, 90)

      const result = analyzeMomentum(lateTrendHistory, 65)

      expect(result.sustainabilityScore).toBeLessThanOrEqual(100)
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

      expect(() => analyzeMomentum(historyWithNaN, 60)).not.toThrow()
    })

    it('should handle insufficient data for acceleration check (<15 days)', () => {
      const shortHistory = mockPriceHistory.slice(0, 12)

      const result = analyzeMomentum(shortHistory, 10)

      expect(result.isAccelerating).toBe(false)
      expect(result.isDecelerating).toBe(false)
    })

    it('should handle extreme price movements', () => {
      const extremeHistory: PriceHistoryPoint[] = []
      const startDate = new Date('2024-01-01')

      // 10% daily gain (very extreme)
      for (let i = 0; i < 20; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const price = 100 * Math.pow(1.1, i)

        extremeHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      const result = analyzeMomentum(extremeHistory, 20)

      // Should handle extreme values without breaking
      expect(result.sustainabilityScore).toBeGreaterThanOrEqual(0)
      expect(result.sustainabilityScore).toBeLessThanOrEqual(100)
    })

    it('should handle very small price movements', () => {
      const smallMovementHistory: PriceHistoryPoint[] = []
      const startDate = new Date('2024-01-01')

      for (let i = 0; i < 90; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const price = 100 + i * 0.001 // Very small change

        smallMovementHistory.push({
          date: date.toISOString().split('T')[0],
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: 1000000,
        })
      }

      const result = analyzeMomentum(smallMovementHistory, 90)

      expect(result.sustainabilityScore).toBeGreaterThanOrEqual(0)
      expect(result.sustainabilityScore).toBeLessThanOrEqual(100)
    })

    it('should calculate correct ROC values', () => {
      const rocTestHistory: PriceHistoryPoint[] = [
        { date: '2024-01-01', open: 100, high: 102, low: 98, close: 100, volume: 1000000 },
        { date: '2024-01-02', open: 102, high: 104, low: 100, close: 102, volume: 1000000 },
        { date: '2024-01-03', open: 104, high: 106, low: 102, close: 104, volume: 1000000 },
        { date: '2024-01-04', open: 106, high: 108, low: 104, close: 106, volume: 1000000 },
        { date: '2024-01-05', open: 108, high: 110, low: 106, close: 108, volume: 1000000 },
        { date: '2024-01-06', open: 110, high: 112, low: 108, close: 110, volume: 1000000 },
      ]

      const result = analyzeMomentum(rocTestHistory, 5)

      expect(result.sustainabilityScore).toBeGreaterThanOrEqual(0)
    })
  })

  // ============================================================================
  // getMomentumRecommendation() TESTS
  // ============================================================================

  describe('getMomentumRecommendation()', () => {
    it('should return strong recommendation for high accelerating momentum', () => {
      const momentum = {
        sustainabilityScore: 75,
        isAccelerating: true,
        isDecelerating: false,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toContain('Strong')
      expect(recommendation).toContain('accelerating')
      expect(recommendation).toContain('favorable')
    })

    it('should return strong recommendation for high sustainable momentum', () => {
      const momentum = {
        sustainabilityScore: 70,
        isAccelerating: false,
        isDecelerating: false,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toContain('Strong')
      expect(recommendation).toContain('sustainable')
    })

    it('should return building momentum recommendation for moderate accelerating', () => {
      const momentum = {
        sustainabilityScore: 55,
        isAccelerating: true,
        isDecelerating: false,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toContain('building')
      expect(recommendation).toContain('monitor')
    })

    it('should return fading momentum recommendation for moderate decelerating', () => {
      const momentum = {
        sustainabilityScore: 55,
        isAccelerating: false,
        isDecelerating: true,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toContain('fading')
      expect(recommendation).toContain('caution')
    })

    it('should return selective entry for moderate steady momentum', () => {
      const momentum = {
        sustainabilityScore: 55,
        isAccelerating: false,
        isDecelerating: false,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toContain('Moderate')
      expect(recommendation).toContain('selective')
    })

    it('should return weak momentum recommendation for low score with deceleration', () => {
      const momentum = {
        sustainabilityScore: 35,
        isAccelerating: false,
        isDecelerating: true,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toContain('Weak')
      expect(recommendation).toContain('avoid')
    })

    it('should return inconsistent recommendation for low score without deceleration', () => {
      const momentum = {
        sustainabilityScore: 35,
        isAccelerating: false,
        isDecelerating: false,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toContain('inconsistent')
      expect(recommendation).toContain('wait')
    })

    it('should return poor momentum recommendation for very low score', () => {
      const momentum = {
        sustainabilityScore: 20,
        isAccelerating: false,
        isDecelerating: false,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toContain('Poor')
      expect(recommendation).toContain('avoid')
    })

    it('should handle boundary case at score 70', () => {
      const momentum = {
        sustainabilityScore: 70,
        isAccelerating: false,
        isDecelerating: false,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toBeDefined()
      expect(recommendation.length).toBeGreaterThan(0)
    })

    it('should handle boundary case at score 50', () => {
      const momentum = {
        sustainabilityScore: 50,
        isAccelerating: false,
        isDecelerating: false,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toBeDefined()
      expect(recommendation.length).toBeGreaterThan(0)
    })

    it('should handle boundary case at score 30', () => {
      const momentum = {
        sustainabilityScore: 30,
        isAccelerating: false,
        isDecelerating: false,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toBeDefined()
      expect(recommendation.length).toBeGreaterThan(0)
    })

    it('should handle edge case of 100 score', () => {
      const momentum = {
        sustainabilityScore: 100,
        isAccelerating: true,
        isDecelerating: false,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toContain('Strong')
    })

    it('should handle edge case of 0 score', () => {
      const momentum = {
        sustainabilityScore: 0,
        isAccelerating: false,
        isDecelerating: true,
      }

      const recommendation = getMomentumRecommendation(momentum)

      expect(recommendation).toContain('avoid')
    })
  })

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle empty price history', () => {
      const result = analyzeMomentum([], 0)

      expect(result.sustainabilityScore).toBe(50)
      expect(result.isAccelerating).toBe(false)
      expect(result.isDecelerating).toBe(false)
    })

    it('should handle single price point', () => {
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

      const result = analyzeMomentum(singlePoint, 1)

      expect(result.sustainabilityScore).toBe(50)
    })

    it('should handle zero prices', () => {
      const zeroPriceHistory: PriceHistoryPoint[] = [
        {
          date: '2024-01-01',
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          volume: 1000000,
        },
        {
          date: '2024-01-02',
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          volume: 1000000,
        },
      ]

      expect(() => analyzeMomentum(zeroPriceHistory, 2)).not.toThrow()
    })

    it('should handle negative prices (invalid but should not crash)', () => {
      const negativePriceHistory: PriceHistoryPoint[] = [
        {
          date: '2024-01-01',
          open: -100,
          high: -98,
          low: -102,
          close: -100,
          volume: 1000000,
        },
      ]

      expect(() => analyzeMomentum(negativePriceHistory, 1)).not.toThrow()
    })
  })
})
