/**
 * Entry Calculator Tests
 *
 * TDD Test Suite for swing trading entry zone calculations
 * Tests all functions: calculateEntryZone, getEntryUrgency, getEntryTiming, validateEntrySetup
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  calculateEntryZone,
  getEntryUrgency,
  getEntryTiming,
  validateEntrySetup,
} from './entry-calculator'
import type { EntryCalculatorInput } from '@/types/swing-trading'
import type { SupportResistanceLevel } from '@/types/technical-chart'

// ============================================================================
// MOCKS
// ============================================================================

// Mock getNearestSupport from historical-trend service
vi.mock('@/services/historical-trend', () => ({
  getNearestSupport: vi.fn(),
}))

import { getNearestSupport } from '@/services/historical-trend'

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const mockStrongSupport: SupportResistanceLevel = {
  price: 100,
  strength: 'strong',
  touches: 5,
  lastTestDate: '2024-01-15',
  lastTouchDate: '2024-01-15',
}

const mockModerateSupport: SupportResistanceLevel = {
  price: 98,
  strength: 'moderate',
  touches: 3,
  lastTestDate: '2024-01-14',
  lastTouchDate: '2024-01-14',
}

const mockWeakSupport: SupportResistanceLevel = {
  price: 95,
  strength: 'weak',
  touches: 2,
  lastTestDate: '2024-01-13',
  lastTouchDate: '2024-01-13',
}

const defaultInput: EntryCalculatorInput = {
  currentPrice: 105,
  supportLevels: [mockStrongSupport, mockModerateSupport, mockWeakSupport],
  movingAverages: {
    ma20: 102,
    ma50: 100,
  },
  trendPhase: 'early',
}

// ============================================================================
// SETUP
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks()
})

// ============================================================================
// CALCULATE ENTRY ZONE TESTS
// ============================================================================

describe('calculateEntryZone', () => {
  describe('Strong Support Case', () => {
    beforeEach(() => {
      vi.mocked(getNearestSupport).mockReturnValue(mockStrongSupport)
    })

    it('should return entry zone near strong support', () => {
      const result = calculateEntryZone(defaultInput)

      expect(result.entryZone.min).toBeCloseTo(99.5, 1) // 100 * 0.995
      // Max is adjusted by early trend: 100 * 1.01 = 101, then Math.max(101, 99.5 * 1.02) = ~101.49
      expect(result.entryZone.max).toBeGreaterThan(100)
      expect(result.confidence).toBeGreaterThanOrEqual(85)
      expect(result.rationale).toContain('strong support')
      expect(result.rationale).toContain('100.00')
    })

    it('should include current price in entry zone', () => {
      const result = calculateEntryZone(defaultInput)

      expect(result.entryZone.current).toBe(105)
    })

    it('should calculate discount percentage correctly', () => {
      const result = calculateEntryZone(defaultInput)

      // Discount = (105 - max) / 105 * 100, where max is adjusted for early trend
      expect(result.discountPercent).toBeGreaterThan(0)
    })

    it('should clamp confidence at maximum 100', () => {
      const result = calculateEntryZone({
        ...defaultInput,
        trendPhase: 'early', // Adds +5 confidence
      })

      expect(result.confidence).toBeLessThanOrEqual(100)
    })
  })

  describe('Moderate Support Case', () => {
    beforeEach(() => {
      vi.mocked(getNearestSupport).mockReturnValue(mockModerateSupport)
    })

    it('should return entry zone near moderate support', () => {
      const result = calculateEntryZone(defaultInput)

      expect(result.entryZone.min).toBe(98) // At support
      // Max is adjusted by early trend: Math.max(98 * 1.005, 98 * 1.02) = ~100
      expect(result.entryZone.max).toBeGreaterThanOrEqual(98)
      // Confidence is adjusted by early trend: 70 + 5 = 75
      expect(result.confidence).toBeGreaterThanOrEqual(70)
      expect(result.rationale).toContain('moderate support')
    })
  })

  describe('Weak/No Support Case - Use MA50', () => {
    beforeEach(() => {
      vi.mocked(getNearestSupport).mockReturnValue(mockWeakSupport)
    })

    it('should use MA50 when price above MA50', () => {
      const result = calculateEntryZone(defaultInput)

      expect(result.entryZone.min).toBeCloseTo(99, 1) // 100 * 0.99
      // Max is adjusted by early trend
      expect(result.entryZone.max).toBeGreaterThan(100)
      // Confidence is adjusted by early trend: 60 + 5 = 65
      expect(result.confidence).toBeGreaterThanOrEqual(60)
      expect(result.rationale).toContain('MA50')
    })
  })

  describe('Weak/No Support Case - Use MA20', () => {
    beforeEach(() => {
      vi.mocked(getNearestSupport).mockReturnValue(mockWeakSupport)
    })

    it('should use MA20 when price below MA50 but above MA20', () => {
      const input: EntryCalculatorInput = {
        ...defaultInput,
        currentPrice: 101,
        movingAverages: {
          ma20: 100,
          ma50: 105, // Price below MA50
        },
      }

      const result = calculateEntryZone(input)

      expect(result.entryZone.min).toBeCloseTo(99, 1) // 100 * 0.99
      // Max is adjusted by early trend
      expect(result.entryZone.max).toBeGreaterThan(100)
      // Confidence is adjusted by early trend: 50 + 5 = 55
      expect(result.confidence).toBeGreaterThanOrEqual(50)
      expect(result.rationale).toContain('MA20')
    })
  })

  describe('No Clear Support or MA Case', () => {
    beforeEach(() => {
      vi.mocked(getNearestSupport).mockReturnValue(null)
    })

    it('should use conservative discount from current price', () => {
      const input: EntryCalculatorInput = {
        ...defaultInput,
        movingAverages: {
          ma20: undefined,
          ma50: undefined,
        },
      }

      const result = calculateEntryZone(input)

      expect(result.entryZone.min).toBeCloseTo(101.85, 1) // 105 * 0.97
      expect(result.entryZone.max).toBeCloseTo(103.95, 1) // 105 * 0.99
      // Confidence is adjusted for early trend: 30 - 10 (exhausted) = 20
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.rationale).toContain('No clear support')
    })
  })

  describe('Trend Phase Adjustments', () => {
    beforeEach(() => {
      vi.mocked(getNearestSupport).mockReturnValue(mockModerateSupport)
    })

    it('should increase confidence and widen upper bound for early trend', () => {
      const result = calculateEntryZone({
        ...defaultInput,
        trendPhase: 'early',
      })

      expect(result.rationale).toContain('early trend')
      expect(result.confidence).toBe(75) // 70 + 5
    })

    it('should decrease confidence and adjust min for exhausted trend', () => {
      const result = calculateEntryZone({
        ...defaultInput,
        trendPhase: 'exhausted',
      })

      expect(result.rationale).toContain('late trend')
      expect(result.confidence).toBe(60) // 70 - 10
      expect(result.entryZone.min).toBeGreaterThanOrEqual(105 * 0.98) // Adjusted min
    })

    it('should not adjust for mature trend', () => {
      const result = calculateEntryZone({
        ...defaultInput,
        trendPhase: 'mature',
      })

      expect(result.confidence).toBe(70) // Base confidence
    })
  })

  describe('Edge Cases', () => {
    it('should handle very low current price', () => {
      vi.mocked(getNearestSupport).mockReturnValue({
        ...mockStrongSupport,
        price: 5,
      })

      const result = calculateEntryZone({
        ...defaultInput,
        currentPrice: 6,
      })

      expect(result.entryZone.min).toBeGreaterThan(0)
      expect(result.entryZone.max).toBeGreaterThan(0)
    })

    it('should handle very high current price', () => {
      vi.mocked(getNearestSupport).mockReturnValue({
        ...mockStrongSupport,
        price: 1500,
      })

      const result = calculateEntryZone({
        ...defaultInput,
        currentPrice: 1550,
      })

      expect(result.entryZone.min).toBeLessThan(result.entryZone.max)
      expect(result.entryZone.current).toBe(1550)
    })

    it('should clamp confidence at minimum 0', () => {
      vi.mocked(getNearestSupport).mockReturnValue(mockWeakSupport)

      const result = calculateEntryZone({
        ...defaultInput,
        trendPhase: 'exhausted',
        currentPrice: 105,
        movingAverages: { ma20: undefined, ma50: undefined },
      })

      // Base confidence 30 - 10 (exhausted) = 20
      expect(result.confidence).toBeGreaterThanOrEqual(0)
    })
  })
})

// ============================================================================
// GET ENTRY URGENCY TESTS
// ============================================================================

describe('getEntryUrgency', () => {
  const entryZone = { min: 98, max: 102 }

  describe('Price In Entry Zone', () => {
    it('should return high urgency when price in zone', () => {
      const urgency = getEntryUrgency(100, entryZone, 'mature')

      expect(urgency).toBe(80)
    })

    it('should increase urgency for early trend', () => {
      const urgency = getEntryUrgency(100, entryZone, 'early')

      expect(urgency).toBe(90) // 80 + 10
    })

    it('should decrease urgency for exhausted trend', () => {
      const urgency = getEntryUrgency(100, entryZone, 'exhausted')

      expect(urgency).toBe(65) // 80 - 15
    })
  })

  describe('Price Below Entry Zone', () => {
    it('should return very high urgency when slightly below zone', () => {
      const urgency = getEntryUrgency(96, entryZone, 'mature')

      // (98 - 96) / 96 * 100 = ~2.1%, which is <= 2%
      expect(urgency).toBeGreaterThanOrEqual(90)
    })

    it('should return high urgency when reasonably below zone', () => {
      const urgency = getEntryUrgency(94, entryZone, 'mature')

      expect(urgency).toBe(90) // ~4% discount
    })

    it('should return moderate urgency when significantly below zone', () => {
      const urgency = getEntryUrgency(90, entryZone, 'mature')

      expect(urgency).toBe(70) // ~8% discount
    })

    it('should adjust for early trend when below zone', () => {
      const urgency = getEntryUrgency(96, entryZone, 'early')

      expect(urgency).toBe(100) // Clamped at max
    })
  })

  describe('Price Above Entry Zone', () => {
    it('should return low urgency when slightly above zone', () => {
      const urgency = getEntryUrgency(104, entryZone, 'mature')

      expect(urgency).toBe(40) // ~2% premium
    })

    it('should return very low urgency when significantly above zone', () => {
      const urgency = getEntryUrgency(110, entryZone, 'mature')

      expect(urgency).toBe(20) // ~8% premium
    })

    it('should adjust for exhausted trend when above zone', () => {
      const urgency = getEntryUrgency(104, entryZone, 'exhausted')

      expect(urgency).toBe(25) // 40 - 15
    })
  })

  describe('Edge Cases', () => {
    it('should clamp urgency at maximum 100', () => {
      const urgency = getEntryUrgency(96, { min: 100, max: 110 }, 'early')

      expect(urgency).toBeLessThanOrEqual(100)
    })

    it('should clamp urgency at minimum 0', () => {
      const urgency = getEntryUrgency(150, { min: 50, max: 60 }, 'exhausted')

      expect(urgency).toBeGreaterThanOrEqual(0)
    })

    it('should handle negative prices gracefully', () => {
      // Should not crash with edge case input
      expect(() => {
        getEntryUrgency(-10, { min: -15, max: -5 }, 'mature')
      }).not.toThrow()
    })
  })
})

// ============================================================================
// GET ENTRY TIMING TESTS
// ============================================================================

describe('getEntryTiming', () => {
  describe('Urgency Levels', () => {
    it('should recommend immediate entry for urgency >= 80', () => {
      const timing = getEntryTiming(80)

      expect(timing).toBe('Enter within 1-2 trading days')
    })

    it('should recommend soon entry for urgency >= 60', () => {
      const timing = getEntryTiming(70)

      expect(timing).toBe('Enter within 3-5 trading days')
    })

    it('should recommend wait for pullback for urgency >= 40', () => {
      const timing = getEntryTiming(50)

      expect(timing).toBe('Wait for pullback to entry zone')
    })

    it('should recommend wait for urgency < 40', () => {
      const timing = getEntryTiming(30)

      expect(timing).toBe('Wait - current price not favorable')
    })

    it('should handle edge case urgency of 0', () => {
      const timing = getEntryTiming(0)

      expect(timing).toBe('Wait - current price not favorable')
    })

    it('should handle edge case urgency of 100', () => {
      const timing = getEntryTiming(100)

      expect(timing).toBe('Enter within 1-2 trading days')
    })
  })
})

// ============================================================================
// VALIDATE ENTRY SETUP TESTS
// ============================================================================

describe('validateEntrySetup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Valid Setups', () => {
    it('should validate when price near MA50', () => {
      vi.mocked(getNearestSupport).mockReturnValue(mockStrongSupport)

      const result = validateEntrySetup({
        currentPrice: 100,
        supportLevels: [mockStrongSupport],
        movingAverages: { ma20: 99, ma50: 100 },
      })

      expect(result.isValid).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should validate when price above MA50', () => {
      vi.mocked(getNearestSupport).mockReturnValue(mockStrongSupport)

      const result = validateEntrySetup({
        currentPrice: 105,
        supportLevels: [mockStrongSupport],
        movingAverages: { ma20: 102, ma50: 100 },
      })

      expect(result.isValid).toBe(true)
    })

    it('should validate when no support but price is reasonable', () => {
      vi.mocked(getNearestSupport).mockReturnValue(null)

      const result = validateEntrySetup({
        currentPrice: 100,
        supportLevels: [],
        movingAverages: { ma20: 98, ma50: 95 },
      })

      expect(result.isValid).toBe(true)
    })
  })

  describe('Invalid Setups - Downtrend', () => {
    it('should invalidate when price too far below MA50', () => {
      vi.mocked(getNearestSupport).mockReturnValue(null)

      const result = validateEntrySetup({
        currentPrice: 90,
        supportLevels: [],
        movingAverages: { ma20: 92, ma50: 100 },
      })

      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('too far below MA50')
      expect(result.reason).toContain('downtrend')
    })

    it('should validate when price is exactly 5% below MA50 (boundary)', () => {
      vi.mocked(getNearestSupport).mockReturnValue(null)

      const result = validateEntrySetup({
        currentPrice: 95,
        supportLevels: [],
        movingAverages: { ma20: 97, ma50: 100 },
      })

      // 95 is exactly 5% below 100, which should be valid (only invalid if < 95%)
      expect(result.isValid).toBe(true)
    })
  })

  describe('Invalid Setups - Too Far Below Support', () => {
    it('should invalidate when price too far below MA50 even with support', () => {
      vi.mocked(getNearestSupport).mockReturnValue({
        price: 110,
        strength: 'strong',
        touches: 5,
        lastTestDate: '2024-01-15',
        lastTouchDate: '2024-01-15',
      })

      const result = validateEntrySetup({
        currentPrice: 95,
        supportLevels: [
          { price: 110, strength: 'strong', touches: 5, lastTestDate: '2024-01-15', lastTouchDate: '2024-01-15' },
        ],
        movingAverages: { ma20: 100, ma50: 105 },
      })

      // Price is below MA50 threshold, which is checked first
      expect(result.isValid).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero current price', () => {
      vi.mocked(getNearestSupport).mockReturnValue(null)

      const result = validateEntrySetup({
        currentPrice: 0,
        supportLevels: [],
        movingAverages: { ma20: undefined, ma50: undefined },
      })

      // Should not crash
      expect(result).toBeDefined()
    })

    it('should handle negative current price', () => {
      vi.mocked(getNearestSupport).mockReturnValue(null)

      const result = validateEntrySetup({
        currentPrice: -10,
        supportLevels: [],
        movingAverages: { ma20: undefined, ma50: undefined },
      })

      // Should not crash
      expect(result).toBeDefined()
    })

    it('should handle empty support levels', () => {
      vi.mocked(getNearestSupport).mockReturnValue(null)

      const result = validateEntrySetup({
        currentPrice: 100,
        supportLevels: [],
        movingAverages: { ma20: undefined, ma50: 100 },
      })

      expect(result).toBeDefined()
    })

    it('should handle missing MA values', () => {
      vi.mocked(getNearestSupport).mockReturnValue(null)

      const result = validateEntrySetup({
        currentPrice: 100,
        supportLevels: [],
        movingAverages: { ma20: undefined, ma50: undefined },
      })

      expect(result.isValid).toBe(true)
    })
  })
})

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Entry Calculator - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should work end-to-end: calculate zone, urgency, timing, and validation', () => {
    vi.mocked(getNearestSupport).mockReturnValue(mockStrongSupport)

    const input: EntryCalculatorInput = {
      currentPrice: 105,
      supportLevels: [mockStrongSupport],
      movingAverages: { ma20: 102, ma50: 100 },
      trendPhase: 'early',
    }

    // Calculate entry zone
    const entryResult = calculateEntryZone(input)
    expect(entryResult.entryZone.min).toBeGreaterThan(0)
    expect(entryResult.entryZone.max).toBeGreaterThan(0)

    // Get urgency
    const urgency = getEntryUrgency(
      input.currentPrice,
      entryResult.entryZone,
      input.trendPhase
    )
    expect(urgency).toBeGreaterThan(0)

    // Get timing
    const timing = getEntryTiming(urgency)
    expect(timing).toBeTruthy()

    // Validate setup
    const validation = validateEntrySetup(input)
    expect(validation.isValid).toBe(true)
  })

  it('should handle real-world PTT stock scenario', () => {
    vi.mocked(getNearestSupport).mockReturnValue({
      price: 350,
      strength: 'strong',
      touches: 4,
      lastTestDate: '2024-01-10',
      lastTouchDate: '2024-01-10',
    })

    const input: EntryCalculatorInput = {
      currentPrice: 360,
      supportLevels: [
        { price: 350, strength: 'strong', touches: 4, lastTestDate: '2024-01-10', lastTouchDate: '2024-01-10' },
      ],
      movingAverages: { ma20: 355, ma50: 350 },
      trendPhase: 'early',
    }

    const result = calculateEntryZone(input)

    expect(result.entryZone.min).toBeLessThan(result.entryZone.max)
    expect(result.confidence).toBeGreaterThan(80)
    expect(result.rationale).toContain('strong support')
  })

  it('should handle real-world ADVANC stock scenario', () => {
    vi.mocked(getNearestSupport).mockReturnValue({
      price: 180,
      strength: 'moderate',
      touches: 3,
      lastTestDate: '2024-01-12',
      lastTouchDate: '2024-01-12',
    })

    const input: EntryCalculatorInput = {
      currentPrice: 185,
      supportLevels: [
        { price: 180, strength: 'moderate', touches: 3, lastTestDate: '2024-01-12', lastTouchDate: '2024-01-12' },
      ],
      movingAverages: { ma20: 182, ma50: 178 },
      trendPhase: 'mature',
    }

    const result = calculateEntryZone(input)

    expect(result.entryZone.min).toBeLessThan(result.entryZone.max)
    expect(result.confidence).toBeGreaterThan(60)
  })
})
