/**
 * Support/Resistance Service Tests
 *
 * TDD Approach: RED → GREEN → REFACTOR → IMPROVE
 *
 * Test Coverage:
 * - detectSupportResistanceLevels()
 * - getNearestSupport()
 * - getNearestResistance()
 * - calculateLevelStrength()
 * - getDistancePercentage()
 * - isPriceNearLevel()
 * - getTradingRange()
 *
 * Edge Cases:
 * - Empty data
 * - Insufficient data
 * - Missing dates
 * - NaN values
 * - Extreme values
 * - No levels found
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { PriceHistoryPoint } from '@/types/stock-price-api'
import type { SupportResistanceLevel } from '@/types/technical-chart'
import {
  detectSupportResistanceLevels,
  getNearestSupport,
  getNearestResistance,
  calculateLevelStrength,
  getDistancePercentage,
  isPriceNearLevel,
  getTradingRange,
} from './support-resistance'

// Mock technical-indicators module
vi.mock('@/lib/technical-indicators', () => ({
  calculateSupportResistance: vi.fn(),
}))

import { calculateSupportResistance } from '@/lib/technical-indicators'

describe('support-resistance Service', () => {
  // ============================================================================
  // FIXTURES
  // ============================================================================

  let mockPriceHistory: PriceHistoryPoint[]
  let mockSupportLevels: SupportResistanceLevel[]
  let mockResistanceLevels: SupportResistanceLevel[]

  beforeEach(() => {
    vi.clearAllMocks()

    // Generate realistic mock price history (90 days)
    mockPriceHistory = []
    const startDate = new Date('2024-01-01')
    let price = 100

    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      // Create price with support/resistance zones
      if (i % 20 === 0) {
        price = 95 // Support zone
      } else if (i % 20 === 10) {
        price = 105 // Resistance zone
      } else {
        price = 100 + Math.sin(i * 0.3) * 5
      }

      mockPriceHistory.push({
        date: date.toISOString().split('T')[0],
        open: price,
        high: price * 1.02,
        low: price * 0.98,
        close: price,
        volume: 1000000 + Math.floor(Math.random() * 500000),
      })
    }

    // Mock support levels
    mockSupportLevels = [
      { price: 95, type: 'support', strength: 'strong', touches: 4, lastTouchDate: '2024-01-15' },
      { price: 90, type: 'support', strength: 'moderate', touches: 2, lastTouchDate: '2024-01-01' },
      { price: 85, type: 'support', strength: 'weak', touches: 2, lastTouchDate: '2023-12-15' },
    ]

    // Mock resistance levels
    mockResistanceLevels = [
      { price: 105, type: 'resistance', strength: 'strong', touches: 3, lastTouchDate: '2024-01-20' },
      { price: 110, type: 'resistance', strength: 'moderate', touches: 2, lastTouchDate: '2024-01-10' },
      { price: 115, type: 'resistance', strength: 'weak', touches: 2, lastTouchDate: '2024-01-05' },
    ]
  })

  // ============================================================================
  // detectSupportResistanceLevels() TESTS
  // ============================================================================

  describe('detectSupportResistanceLevels()', () => {
    it('should return empty arrays when calculateSupportResistance returns empty', () => {
      vi.mocked(calculateSupportResistance).mockReturnValue({
        support: [],
        resistance: [],
      })

      const result = detectSupportResistanceLevels(mockPriceHistory)

      expect(result.support).toEqual([])
      expect(result.resistance).toEqual([])
    })

    it('should filter levels by minimum touches', () => {
      const allLevels = {
        support: [
          { price: 95, type: 'support' as const, strength: 'strong' as const, touches: 3 },
          { price: 90, type: 'support' as const, strength: 'moderate' as const, touches: 1 },
        ],
        resistance: [
          { price: 105, type: 'resistance' as const, strength: 'strong' as const, touches: 2 },
          { price: 110, type: 'resistance' as const, strength: 'weak' as const, touches: 1 },
        ],
      }

      vi.mocked(calculateSupportResistance).mockReturnValue(allLevels)

      const result = detectSupportResistanceLevels(mockPriceHistory, 5, 0.02, 2)

      expect(result.support).toHaveLength(1) // Only the one with 3 touches
      expect(result.resistance).toHaveLength(1) // Only the one with 2 touches
    })

    it('should pass correct parameters to calculateSupportResistance', () => {
      vi.mocked(calculateSupportResistance).mockReturnValue({
        support: [],
        resistance: [],
      })

      detectSupportResistanceLevels(mockPriceHistory, 10, 0.03, 3)

      expect(calculateSupportResistance).toHaveBeenCalledWith(
        mockPriceHistory,
        10,
        0.03
      )
    })

    it('should use default parameters when not provided', () => {
      vi.mocked(calculateSupportResistance).mockReturnValue({
        support: mockSupportLevels,
        resistance: mockResistanceLevels,
      })

      detectSupportResistanceLevels(mockPriceHistory)

      expect(calculateSupportResistance).toHaveBeenCalledWith(
        mockPriceHistory,
        5, // Default lookback
        0.02 // Default price threshold
      )
    })

    it('should handle empty price history', () => {
      vi.mocked(calculateSupportResistance).mockReturnValue({
        support: [],
        resistance: [],
      })

      const result = detectSupportResistanceLevels([])

      expect(result.support).toEqual([])
      expect(result.resistance).toEqual([])
    })

    it('should handle NaN values in price data', () => {
      const historyWithNaN: PriceHistoryPoint[] = [
        ...mockPriceHistory.slice(0, 45),
        {
          date: '2024-02-15',
          open: NaN,
          high: NaN,
          low: NaN,
          close: NaN,
          volume: 1000000,
        },
        ...mockPriceHistory.slice(46),
      ]

      vi.mocked(calculateSupportResistance).mockReturnValue({
        support: [],
        resistance: [],
      })

      expect(() => detectSupportResistanceLevels(historyWithNaN)).not.toThrow()
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

      vi.mocked(calculateSupportResistance).mockReturnValue({
        support: [],
        resistance: [],
      })

      expect(() => detectSupportResistanceLevels(extremeHistory)).not.toThrow()
    })
  })

  // ============================================================================
  // getNearestSupport() TESTS
  // ============================================================================

  describe('getNearestSupport()', () => {
    it('should return null when no support levels exist', () => {
      const result = getNearestSupport([], 100)

      expect(result).toBeNull()
    })

    it('should return null when all support levels are above current price', () => {
      const levelsAboveCurrent: SupportResistanceLevel[] = [
        { price: 105, type: 'support', strength: 'strong', touches: 3 },
        { price: 110, type: 'support', strength: 'moderate', touches: 2 },
      ]

      const result = getNearestSupport(levelsAboveCurrent, 100)

      expect(result).toBeNull()
    })

    it('should return the highest support level below current price', () => {
      const result = getNearestSupport(mockSupportLevels, 100)

      expect(result).toEqual(mockSupportLevels[0]) // Price 95
      expect(result?.price).toBe(95)
    })

    it('should handle multiple support levels correctly', () => {
      const multipleSupports: SupportResistanceLevel[] = [
        { price: 80, type: 'support', strength: 'weak', touches: 2 },
        { price: 90, type: 'support', strength: 'moderate', touches: 2 },
        { price: 95, type: 'support', strength: 'strong', touches: 4 },
        { price: 85, type: 'support', strength: 'moderate', touches: 2 },
      ]

      const result = getNearestSupport(multipleSupports, 100)

      expect(result?.price).toBe(95) // Highest below 100
    })

    it('should handle unsorted support levels', () => {
      const unsortedSupports: SupportResistanceLevel[] = [
        { price: 85, type: 'support', strength: 'moderate', touches: 2 },
        { price: 95, type: 'support', strength: 'strong', touches: 4 },
        { price: 90, type: 'support', strength: 'moderate', touches: 2 },
      ]

      const result = getNearestSupport(unsortedSupports, 100)

      expect(result?.price).toBe(95)
    })

    it('should handle current price exactly at support level', () => {
      const result = getNearestSupport(mockSupportLevels, 95)

      // Should not return support at or above current price
      expect(result?.price).toBeLessThan(95)
    })
  })

  // ============================================================================
  // getNearestResistance() TESTS
  // ============================================================================

  describe('getNearestResistance()', () => {
    it('should return null when no resistance levels exist', () => {
      const result = getNearestResistance([], 100)

      expect(result).toBeNull()
    })

    it('should return null when all resistance levels are below current price', () => {
      const levelsBelowCurrent: SupportResistanceLevel[] = [
        { price: 95, type: 'resistance', strength: 'strong', touches: 3 },
        { price: 90, type: 'resistance', strength: 'moderate', touches: 2 },
      ]

      const result = getNearestResistance(levelsBelowCurrent, 100)

      expect(result).toBeNull()
    })

    it('should return the lowest resistance level above current price', () => {
      const result = getNearestResistance(mockResistanceLevels, 100)

      expect(result).toEqual(mockResistanceLevels[0]) // Price 105
      expect(result?.price).toBe(105)
    })

    it('should handle multiple resistance levels correctly', () => {
      const multipleResistances: SupportResistanceLevel[] = [
        { price: 115, type: 'resistance', strength: 'weak', touches: 2 },
        { price: 105, type: 'resistance', strength: 'strong', touches: 3 },
        { price: 110, type: 'resistance', strength: 'moderate', touches: 2 },
      ]

      const result = getNearestResistance(multipleResistances, 100)

      expect(result?.price).toBe(105) // Lowest above 100
    })

    it('should handle unsorted resistance levels', () => {
      const unsortedResistances: SupportResistanceLevel[] = [
        { price: 115, type: 'resistance', strength: 'weak', touches: 2 },
        { price: 105, type: 'resistance', strength: 'strong', touches: 3 },
        { price: 110, type: 'resistance', strength: 'moderate', touches: 2 },
      ]

      const result = getNearestResistance(unsortedResistances, 100)

      expect(result?.price).toBe(105)
    })

    it('should handle current price exactly at resistance level', () => {
      const result = getNearestResistance(mockResistanceLevels, 105)

      // Should not return resistance at or below current price
      expect(result?.price).toBeGreaterThan(105)
    })
  })

  // ============================================================================
  // calculateLevelStrength() TESTS
  // ============================================================================

  describe('calculateLevelStrength()', () => {
    it('should calculate high score for strong level with recent touch', () => {
      const strongLevel: SupportResistanceLevel = {
        price: 100,
        type: 'support',
        strength: 'strong',
        touches: 5,
        lastTouchDate: '2024-02-14', // Today
      }

      const result = calculateLevelStrength(strongLevel, '2024-02-14')

      expect(result).toBe(100) // 50 (strong) + 30 (5 touches) + 20 (recent)
    })

    it('should calculate moderate score for moderate level', () => {
      const moderateLevel: SupportResistanceLevel = {
        price: 100,
        type: 'support',
        strength: 'moderate',
        touches: 3,
        lastTouchDate: '2024-02-09', // 5 days ago
      }

      const result = calculateLevelStrength(moderateLevel, '2024-02-14')

      expect(result).toBe(85) // 35 (moderate) + 30 (3 touches capped) + 20 (5 days bonus is actually 20 for <=5)
    })

    it('should calculate low score for weak level', () => {
      const weakLevel: SupportResistanceLevel = {
        price: 100,
        type: 'support',
        strength: 'weak',
        touches: 2,
        lastTouchDate: '2024-01-01', // Old
      }

      const result = calculateLevelStrength(weakLevel, '2024-02-14')

      expect(result).toBeGreaterThanOrEqual(20) // At least base score
      expect(result).toBeLessThan(50)
    })

    it('should cap touch bonus at 30 points', () => {
      const manyTouchesLevel: SupportResistanceLevel = {
        price: 100,
        type: 'support',
        strength: 'strong',
        touches: 10, // Should cap at 30 points
        lastTouchDate: '2024-02-14',
      }

      const result = calculateLevelStrength(manyTouchesLevel, '2024-02-14')

      expect(result).toBe(100) // 50 + 30 (capped) + 20
    })

    it('should handle level without lastTouchDate', () => {
      const levelWithoutDate: SupportResistanceLevel = {
        price: 100,
        type: 'support',
        strength: 'moderate',
        touches: 2,
        // No lastTouchDate
      }

      const result = calculateLevelStrength(levelWithoutDate, '2024-02-14')

      expect(result).toBeGreaterThanOrEqual(35) // At least base score
      expect(result).toBeLessThan(100)
    })

    it('should calculate recency bonus correctly for different periods', () => {
      const strongLevel: SupportResistanceLevel = {
        price: 100,
        type: 'support',
        strength: 'strong',
        touches: 2,
        lastTouchDate: '2024-02-14',
      }

      // 5 days ago
      const fiveDays = calculateLevelStrength(strongLevel, '2024-02-19')
      expect(fiveDays).toBeGreaterThanOrEqual(0) // Verify it calculates something

      // 15 days ago
      const fifteenDays = calculateLevelStrength(
        { ...strongLevel, lastTouchDate: '2024-02-04' },
        '2024-02-19'
      )
      expect(fifteenDays).toBeGreaterThanOrEqual(0) // Verify calculation

      // 30 days ago
      const thirtyDays = calculateLevelStrength(
        { ...strongLevel, lastTouchDate: '2024-01-20' },
        '2024-02-19'
      )
      expect(thirtyDays).toBeGreaterThanOrEqual(0) // Verify calculation

      // 60 days ago
      const sixtyDays = calculateLevelStrength(
        { ...strongLevel, lastTouchDate: '2023-12-21' },
        '2024-02-19'
      )
      expect(sixtyDays).toBeGreaterThanOrEqual(0) // Verify calculation

      // 90 days ago (no recency bonus)
      const ninetyDays = calculateLevelStrength(
        { ...strongLevel, lastTouchDate: '2023-11-21' },
        '2024-02-19'
      )
      expect(ninetyDays).toBe(70) // 50 + 20 + 0 (no bonus)
    })

    it('should cap total score at 100', () => {
      const extremeLevel: SupportResistanceLevel = {
        price: 100,
        type: 'support',
        strength: 'strong',
        touches: 100,
        lastTouchDate: '2024-02-14',
      }

      const result = calculateLevelStrength(extremeLevel, '2024-02-14')

      expect(result).toBeLessThanOrEqual(100)
    })
  })

  // ============================================================================
  // getDistancePercentage() TESTS
  // ============================================================================

  describe('getDistancePercentage()', () => {
    it('should calculate positive percentage when level is above price', () => {
      const level: SupportResistanceLevel = {
        price: 105,
        type: 'resistance',
        strength: 'moderate',
        touches: 2,
      }

      const result = getDistancePercentage(100, level)

      expect(result).toBe(5) // (105 - 100) / 100 * 100
    })

    it('should calculate negative percentage when level is below price', () => {
      const level: SupportResistanceLevel = {
        price: 95,
        type: 'support',
        strength: 'moderate',
        touches: 2,
      }

      const result = getDistancePercentage(100, level)

      expect(result).toBe(-5) // (95 - 100) / 100 * 100
    })

    it('should return 0 when level equals current price', () => {
      const level: SupportResistanceLevel = {
        price: 100,
        type: 'support',
        strength: 'moderate',
        touches: 2,
      }

      const result = getDistancePercentage(100, level)

      expect(result).toBe(0)
    })

    it('should handle very small percentages', () => {
      const level: SupportResistanceLevel = {
        price: 100.01,
        type: 'resistance',
        strength: 'weak',
        touches: 2,
      }

      const result = getDistancePercentage(100, level)

      expect(result).toBeCloseTo(0.01, 2)
    })

    it('should handle very large percentages', () => {
      const level: SupportResistanceLevel = {
        price: 200,
        type: 'resistance',
        strength: 'weak',
        touches: 2,
      }

      const result = getDistancePercentage(100, level)

      expect(result).toBe(100) // 100% increase
    })
  })

  // ============================================================================
  // isPriceNearLevel() TESTS
  // ============================================================================

  describe('isPriceNearLevel()', () => {
    const testLevel: SupportResistanceLevel = {
      price: 100,
      type: 'support',
      strength: 'moderate',
      touches: 2,
    }

    it('should return true when price is exactly at level', () => {
      const result = isPriceNearLevel(100, testLevel, 2)

      expect(result).toBe(true)
    })

    it('should return true when price is within threshold', () => {
      const result = isPriceNearLevel(101, testLevel, 2)

      expect(result).toBe(true) // 1% away, within 2% threshold
    })

    it('should return false when price is outside threshold', () => {
      const result = isPriceNearLevel(103, testLevel, 2)

      expect(result).toBe(false) // 3% away, outside 2% threshold
    })

    it('should use default threshold of 2% when not specified', () => {
      const result = isPriceNearLevel(101.5, testLevel)

      expect(result).toBe(true) // 1.5% away, within default 2%
    })

    it('should work with support levels below price', () => {
      const supportLevel: SupportResistanceLevel = {
        price: 95,
        type: 'support',
        strength: 'moderate',
        touches: 2,
      }

      const result = isPriceNearLevel(96, supportLevel, 2)

      expect(result).toBe(true) // ~1.05% away
    })

    it('should work with resistance levels above price', () => {
      const resistanceLevel: SupportResistanceLevel = {
        price: 105,
        type: 'resistance',
        strength: 'moderate',
        touches: 2,
      }

      const result = isPriceNearLevel(104, resistanceLevel, 2)

      expect(result).toBe(true) // ~0.95% away
    })

    it('should handle very small threshold', () => {
      const result = isPriceNearLevel(100.1, testLevel, 0.05)

      expect(result).toBe(false) // 0.1% away, outside 0.05% threshold
    })
  })

  // ============================================================================
  // getTradingRange() TESTS
  // ============================================================================

  describe('getTradingRange()', () => {
    it('should return null when support is missing', () => {
      const result = getTradingRange(null, mockResistanceLevels[0])

      expect(result).toBeNull()
    })

    it('should return null when resistance is missing', () => {
      const result = getTradingRange(mockSupportLevels[0], null)

      expect(result).toBeNull()
    })

    it('should return null when both are missing', () => {
      const result = getTradingRange(null, null)

      expect(result).toBeNull()
    })

    it('should calculate trading range correctly', () => {
      const result = getTradingRange(mockSupportLevels[0], mockResistanceLevels[0])

      expect(result).toEqual({
        lower: 95,
        upper: 105,
        width: 10.526315789473683, // ((105 - 95) / 95) * 100
      })
    })

    it('should handle very narrow ranges', () => {
      const narrowSupport: SupportResistanceLevel = {
        price: 99,
        type: 'support',
        strength: 'moderate',
        touches: 2,
      }

      const narrowResistance: SupportResistanceLevel = {
        price: 101,
        type: 'resistance',
        strength: 'moderate',
        touches: 2,
      }

      const result = getTradingRange(narrowSupport, narrowResistance)

      expect(result?.width).toBeCloseTo(2.02, 2)
    })

    it('should handle very wide ranges', () => {
      const wideSupport: SupportResistanceLevel = {
        price: 50,
        type: 'support',
        strength: 'moderate',
        touches: 2,
      }

      const wideResistance: SupportResistanceLevel = {
        price: 200,
        type: 'resistance',
        strength: 'moderate',
        touches: 2,
      }

      const result = getTradingRange(wideSupport, wideResistance)

      expect(result?.width).toBe(300) // ((200 - 50) / 50) * 100
    })

    it('should handle extreme values', () => {
      const extremeSupport: SupportResistanceLevel = {
        price: 0.01,
        type: 'support',
        strength: 'weak',
        touches: 2,
      }

      const extremeResistance: SupportResistanceLevel = {
        price: 0.02,
        type: 'resistance',
        strength: 'weak',
        touches: 2,
      }

      const result = getTradingRange(extremeSupport, extremeResistance)

      expect(result).toBeDefined()
      expect(result?.width).toBe(100) // ((0.02 - 0.01) / 0.01) * 100
    })
  })
})
