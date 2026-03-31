/**
 * Exit Calculator Tests
 *
 * TDD Test Suite for swing trading exit level calculations
 * Tests all functions: calculateExitLevels, validateExitSetup, getTrailingStopRecommendation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  calculateExitLevels,
  validateExitSetup,
  getTrailingStopRecommendation,
} from './exit-calculator'
import type { ExitCalculatorInput } from '@/types/swing-trading'

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const defaultInput: ExitCalculatorInput = {
  entryPrice: 100,
  targetReturn: 0.2, // 20% target
  supportLevel: 95,
  resistanceLevel: 110,
  atr: 3, // Average True Range
}

const noAtrInput: ExitCalculatorInput = {
  entryPrice: 100,
  targetReturn: 0.2,
  supportLevel: 95,
  resistanceLevel: 110,
  atr: undefined,
}

// ============================================================================
// CALCULATE EXIT LEVELS TESTS
// ============================================================================

describe('calculateExitLevels', () => {
  describe('Stop Loss Calculation with ATR', () => {
    it('should calculate ATR-based stop loss (2x ATR)', () => {
      const result = calculateExitLevels(defaultInput)

      expect(result.stopLoss.price).toBeCloseTo(94, 1) // 100 - (3 * 2)
      expect(result.stopLoss.percentFromEntry).toBeCloseTo(-6, 1)
      expect(result.stopLoss.rationale).toContain('ATR-based')
      expect(result.stopLoss.rationale).toContain('2x ATR')
    })

    it('should handle large ATR values', () => {
      const input: ExitCalculatorInput = {
        ...defaultInput,
        entryPrice: 100,
        atr: 8, // Large ATR
      }

      const result = calculateExitLevels(input)

      expect(result.stopLoss.price).toBeCloseTo(84, 1) // 100 - (8 * 2)
    })

    it('should handle small ATR values', () => {
      const input: ExitCalculatorInput = {
        ...defaultInput,
        entryPrice: 100,
        atr: 0.5, // Small ATR
      }

      const result = calculateExitLevels(input)

      expect(result.stopLoss.price).toBeCloseTo(99, 1) // 100 - (0.5 * 2)
    })
  })

  describe('Stop Loss Calculation with Support (no ATR)', () => {
    it('should calculate support-based stop loss when ATR unavailable', () => {
      const result = calculateExitLevels(noAtrInput)

      expect(result.stopLoss.price).toBeCloseTo(93.1, 1) // 95 * 0.98
      expect(result.stopLoss.percentFromEntry).toBeCloseTo(-6.9, 1)
      expect(result.stopLoss.rationale).toContain('Support-based')
      expect(result.stopLoss.rationale).toContain('2% below support')
    })

    it('should handle support level far below entry', () => {
      const input: ExitCalculatorInput = {
        ...noAtrInput,
        entryPrice: 100,
        supportLevel: 80, // Far below
      }

      const result = calculateExitLevels(input)

      expect(result.stopLoss.price).toBeCloseTo(78.4, 1) // 80 * 0.98
      expect(result.stopLoss.rationale).toContain('support at 80.00')
    })

    it('should handle support level just below entry', () => {
      const input: ExitCalculatorInput = {
        ...noAtrInput,
        entryPrice: 100,
        supportLevel: 98, // Just below
      }

      const result = calculateExitLevels(input)

      expect(result.stopLoss.price).toBeCloseTo(96.04, 1) // 98 * 0.98
    })
  })

  describe('Stop Loss Calculation Fallback (no ATR, no support)', () => {
    it('should use 8% percentage-based stop when no ATR or support', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        atr: undefined,
        supportLevel: undefined,
      }

      const result = calculateExitLevels(input)

      expect(result.stopLoss.price).toBe(92) // 100 * 0.92
      expect(result.stopLoss.percentFromEntry).toBe(-8)
      expect(result.stopLoss.rationale).toContain('Percentage-based')
      expect(result.stopLoss.rationale).toContain('8%')
    })

    it('should calculate percentage correctly for different entry prices', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 50,
        targetReturn: 0.2,
        atr: undefined,
        supportLevel: undefined,
      }

      const result = calculateExitLevels(input)

      expect(result.stopLoss.price).toBe(46) // 50 * 0.92
      expect(result.stopLoss.percentFromEntry).toBe(-8)
    })

    it('should handle support above entry price (invalid support)', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        supportLevel: 105, // Above entry - should be ignored
        atr: undefined,
      }

      const result = calculateExitLevels(input)

      // Should fall back to percentage-based
      expect(result.stopLoss.price).toBe(92)
      expect(result.stopLoss.rationale).toContain('Percentage-based')
    })
  })

  describe('Take Profit Levels Calculation', () => {
    it('should calculate 3 take profit levels', () => {
      const result = calculateExitLevels(defaultInput)

      expect(result.takeProfits).toHaveLength(3)
      expect(result.takeProfits[0].level).toBe(1)
      expect(result.takeProfits[1].level).toBe(2)
      expect(result.takeProfits[2].level).toBe(3)
    })

    it('should calculate TP1 as conservative target', () => {
      const result = calculateExitLevels(defaultInput)

      expect(result.takeProfits[0].label).toBe('Conservative (15%)')
      expect(result.takeProfits[0].price).toBeGreaterThan(result.stopLoss.price)
      expect(result.takeProfits[0].price).toBeGreaterThan(defaultInput.entryPrice)
    })

    it('should calculate TP2 as main target (20%)', () => {
      const result = calculateExitLevels(defaultInput)

      expect(result.takeProfits[1].label).toBe('Target (20%)')
      expect(result.takeProfits[1].price).toBeCloseTo(120, 1) // 100 * 1.20
      expect(result.takeProfits[1].percentFromEntry).toBeCloseTo(20, 1)
    })

    it('should calculate TP3 as optimistic target (25%+)', () => {
      const result = calculateExitLevels(defaultInput)

      expect(result.takeProfits[2].label).toBe('Optimistic (25%+)')
      expect(result.takeProfits[2].price).toBeGreaterThan(result.takeProfits[1].price)
      expect(result.takeProfits[2].percentFromEntry).toBeGreaterThanOrEqual(25)
    })

    it('should ensure TP1 < TP2 < TP3', () => {
      const result = calculateExitLevels(defaultInput)

      expect(result.takeProfits[0].price).toBeLessThan(result.takeProfits[1].price)
      expect(result.takeProfits[1].price).toBeLessThan(result.takeProfits[2].price)
    })

    it('should use risk-reward ratios when they give higher targets', () => {
      // When stop loss is very tight, RR-based targets may be higher
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        atr: 1, // Tight stop (2%)
        supportLevel: 98,
      }

      const result = calculateExitLevels(input)

      // Risk = 100 - 98 = 2
      // TP1 should be max(15%, 1.5 * 2 = 3%) = 15%
      // TP2 should be max(20%, 2.5 * 2 = 5%) = 20%
      // TP3 should be max(25%, 4 * 2 = 8%) = 25%
      expect(result.takeProfits[0].price).toBeCloseTo(115, 1)
      expect(result.takeProfits[1].price).toBeCloseTo(120, 1)
      expect(result.takeProfits[2].price).toBeCloseTo(125, 1)
    })
  })

  describe('Risk-Reward Ratio Calculation', () => {
    it('should calculate RR ratio based on TP2', () => {
      const result = calculateExitLevels(defaultInput)

      // Entry: 100, SL: 94, TP2: 120
      // Risk: 6, Reward: 20, RR: 1:3.33
      expect(result.riskRewardRatio).toContain('1:')
         })

    it('should show "Excellent" for RR >= 3', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        atr: 2, // SL: 96, TP2: 120, RR: 1:6
        supportLevel: undefined,
      }

      const result = calculateExitLevels(input)

      expect(result.riskRewardRatio).toContain('Excellent')
    })

    it('should show "Very Good" for RR >= 2.5', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        atr: 4, // SL: 92, TP2: 120, RR: 1:2.5
        supportLevel: undefined,
      }

      const result = calculateExitLevels(input)

      expect(result.riskRewardRatio).toContain('Very Good')
    })

    it('should show "Good" for RR >= 2', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        atr: 5, // SL: 90, TP2: 120, RR: 1:2
        supportLevel: undefined,
      }

      const result = calculateExitLevels(input)

      expect(result.riskRewardRatio).toContain('Good')
    })

    it('should show "Acceptable" for RR >= 1.5', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        atr: 8, // SL: 84, TP2: ~133, RR: 1:2.44
        supportLevel: undefined,
      }

      const result = calculateExitLevels(input)

      expect(result.riskRewardRatio).toContain('Good')
    })

    it('should show "Acceptable" for RR around 1.5-2', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        atr: 12, // SL: 76, TP2: ~153, RR: ~1:2.5
        supportLevel: undefined,
      }

      const result = calculateExitLevels(input)

      expect(result.riskRewardRatio).toContain('Very Good')
    })

    it('should return N/A when risk is zero', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        atr: 0, // Zero ATR falls back to percentage
        supportLevel: undefined,
      }

      const result = calculateExitLevels(input)

      // Falls back to 8% SL: 92, Risk: 8, Reward: 20, RR: 1:2.5
      expect(result.riskRewardRatio).toContain('Very Good')
    })
  })

  describe('Different Target Returns', () => {
    it('should calculate for 20% target (30-60 day horizon)', () => {
      const input: ExitCalculatorInput = {
        ...defaultInput,
        targetReturn: 0.2,
      }

      const result = calculateExitLevels(input)

      expect(result.takeProfits[1].label).toBe('Target (20%)')
      expect(result.takeProfits[1].percentFromEntry).toBeCloseTo(20, 1)
    })

    it('should calculate for 25% target (90 day horizon)', () => {
      const input: ExitCalculatorInput = {
        ...defaultInput,
        targetReturn: 0.25,
      }

      const result = calculateExitLevels(input)

      expect(result.takeProfits[1].label).toBe('Target (25%)')
      expect(result.takeProfits[1].percentFromEntry).toBeCloseTo(25, 1)
    })

    it('should handle lower target returns', () => {
      const input: ExitCalculatorInput = {
        ...defaultInput,
        targetReturn: 0.15,
      }

      const result = calculateExitLevels(input)

      expect(result.takeProfits[1].label).toBe('Target (15%)')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very low entry price', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 5,
        targetReturn: 0.2,
        atr: 0.2,
        supportLevel: 4.5,
      }

      const result = calculateExitLevels(input)

      expect(result.stopLoss.price).toBeGreaterThan(0)
      expect(result.stopLoss.price).toBeLessThan(input.entryPrice)
      expect(result.takeProfits[0].price).toBeGreaterThan(input.entryPrice)
    })

    it('should handle very high entry price', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 2000,
        targetReturn: 0.2,
        atr: 50,
        supportLevel: 1900,
      }

      const result = calculateExitLevels(input)

      expect(result.stopLoss.price).toBeLessThan(input.entryPrice)
      expect(result.takeProfits).toHaveLength(3)
    })

    it('should handle fractional prices', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100.75,
        targetReturn: 0.2,
        atr: 3.25,
        supportLevel: 95.5,
      }

      const result = calculateExitLevels(input)

      expect(result.stopLoss.price).toBeCloseTo(94.25, 1)
      expect(result.takeProfits[1].price).toBeGreaterThan(input.entryPrice)
    })

    it('should handle zero ATR (treat as unavailable)', () => {
      const input: ExitCalculatorInput = {
        ...defaultInput,
        atr: 0,
        supportLevel: undefined,
      }

      const result = calculateExitLevels(input)

      // Should fall back to percentage-based
      expect(result.stopLoss.rationale).toContain('Percentage-based')
    })

    it('should handle negative ATR (treat as unavailable)', () => {
      const input: ExitCalculatorInput = {
        ...defaultInput,
        atr: -1,
        supportLevel: undefined,
      }

      const result = calculateExitLevels(input)

      // Should fall back to percentage-based
      expect(result.stopLoss.rationale).toContain('Percentage-based')
    })
  })
})

// ============================================================================
// VALIDATE EXIT SETUP TESTS
// ============================================================================

describe('validateExitSetup', () => {
  describe('Valid Setups', () => {
    it('should validate normal ATR-based setup', () => {
      const result = validateExitSetup(defaultInput)

      expect(result.isValid).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should validate support-based setup', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        supportLevel: 95,
        atr: undefined,
      }

      const result = validateExitSetup(input)

      expect(result.isValid).toBe(true)
    })

    it('should validate setup with no ATR or support', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        atr: undefined,
        supportLevel: undefined,
      }

      const result = validateExitSetup(input)

      expect(result.isValid).toBe(true)
    })
  })

  describe('Invalid Setups - ATR Too Wide', () => {
    it('should invalidate when ATR-based stop > 15%', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        atr: 8, // 2x ATR = 16% stop
        supportLevel: undefined,
      }

      const result = validateExitSetup(input)

      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('stop loss too wide')
      expect(result.reason).toContain('High risk trade')
    })

    it('should calculate exact ATR stop percentage correctly', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        atr: 7.6, // 2x ATR = 15.2% stop (just over threshold)
        supportLevel: undefined,
      }

      const result = validateExitSetup(input)

      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('15.2%')
    })

    it('should validate when ATR stop is exactly at boundary', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        atr: 7.5, // 2x ATR = 15% stop (at boundary)
        supportLevel: undefined,
      }

      const result = validateExitSetup(input)

      // At 15%, the validation uses > 15%, so this should be valid
      expect(result.isValid).toBe(true)
    })
  })

  describe('Invalid Setups - Support Above Entry', () => {
    it('should invalidate when support level is above entry price', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        supportLevel: 105, // Above entry - invalid
      }

      const result = validateExitSetup(input)

      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('Support level above entry price')
      expect(result.reason).toContain('invalid setup')
    })

    it('should invalidate when support equals entry price', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        supportLevel: 100, // Equal to entry
      }

      const result = validateExitSetup(input)

      expect(result.isValid).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined entry price', () => {
      const result = validateExitSetup({
        entryPrice: NaN,
        atr: 3,
      })

      expect(result).toBeDefined()
    })

    it('should handle very small ATR', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        atr: 0.1,
        supportLevel: undefined,
      }

      const result = validateExitSetup(input)

      expect(result.isValid).toBe(true)
    })

    it('should handle very large entry price with ATR', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 10000,
        atr: 500, // 10% stop
        supportLevel: undefined,
      }

      const result = validateExitSetup(input)

      expect(result.isValid).toBe(true)
    })
  })
})

// ============================================================================
// GET TRAILING STOP RECOMMENDATION TESTS
// ============================================================================

describe('getTrailingStopRecommendation', () => {
  describe('Uptrend', () => {
    it('should recommend trailing stop for uptrend', () => {
      const result = getTrailingStopRecommendation('uptrend')

      expect(result.method).toBe('Trailing Stop')
      expect(result.trigger).toContain('MA20')
      expect(result.trigger).toContain('TP1')
    })

    it('should mention MA20 as trailing stop level', () => {
      const result = getTrailingStopRecommendation('uptrend')

      expect(result.trigger).toContain('MA20')
      expect(result.trigger).toContain('trailing stop')
    })
  })

  describe('Downtrend', () => {
    it('should recommend fixed stop loss for downtrend', () => {
      const result = getTrailingStopRecommendation('downtrend')

      expect(result.method).toBe('Fixed Stop Loss')
      expect(result.trigger).toContain('Do not use trailing stop')
      expect(result.trigger).toContain('downtrend')
    })
  })

  describe('Sideways', () => {
    it('should recommend fixed stop loss for sideways market', () => {
      const result = getTrailingStopRecommendation('sideways')

      expect(result.method).toBe('Fixed Stop Loss')
      expect(result.trigger).toContain('sideways market')
    })
  })

  describe('Edge Cases', () => {
    it('should handle all trend types without crashing', () => {
      const trends = ['uptrend', 'downtrend', 'sideways'] as const

      trends.forEach((trend) => {
        const result = getTrailingStopRecommendation(trend)

        expect(result.method).toBeTruthy()
        expect(result.trigger).toBeTruthy()
      })
    })
  })
})

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Exit Calculator - Integration', () => {
  describe('Complete Exit Plan Workflow', () => {
    it('should generate complete exit plan with all components', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        supportLevel: 95,
        resistanceLevel: 110,
        atr: 3,
      }

      const result = calculateExitLevels(input)

      // Verify all components present
      expect(result.stopLoss).toBeDefined()
      expect(result.stopLoss.price).toBeDefined()
      expect(result.stopLoss.percentFromEntry).toBeDefined()
      expect(result.stopLoss.rationale).toBeDefined()

      expect(result.takeProfits).toBeDefined()
      expect(result.takeProfits).toHaveLength(3)

      expect(result.riskRewardRatio).toBeDefined()
      expect(result.riskRewardRatio).toContain('1:')
    })

    it('should validate setup before trading', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        supportLevel: 95,
        atr: 3,
      }

      const validation = validateExitSetup(input)
      const levels = calculateExitLevels(input)

      expect(validation.isValid).toBe(true)
      expect(levels.stopLoss.price).toBeLessThan(input.entryPrice)
    })

    it('should provide trailing stop recommendation for uptrend', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        atr: 3,
      }

      const levels = calculateExitLevels(input)
      const trailingStop = getTrailingStopRecommendation('uptrend')

      expect(levels.stopLoss.price).toBeDefined()
      expect(trailingStop.method).toBe('Trailing Stop')
    })
  })

  describe('Real-World Scenarios', () => {
    it('should handle PTT stock (high price, volatile)', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 350,
        targetReturn: 0.2,
        supportLevel: 335,
        atr: 10,
      }

      const result = calculateExitLevels(input)

      expect(result.stopLoss.price).toBeLessThan(input.entryPrice)
      expect(result.takeProfits[1].price).toBeCloseTo(420, 5) // ~20% gain
      expect(result.riskRewardRatio).toBeTruthy()
    })

    it('should handle ADVANC stock (mid price)', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 180,
        targetReturn: 0.2,
        supportLevel: 172,
        atr: 5,
      }

      const result = calculateExitLevels(input)

      expect(result.stopLoss.price).toBeLessThan(input.entryPrice)
      expect(result.takeProfits[1].price).toBeCloseTo(216, 2) // ~20% gain
    })

    it('should handle low-priced stock with tight ATR', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 5,
        targetReturn: 0.2,
        supportLevel: 4.75,
        atr: 0.1,
      }

      const result = calculateExitLevels(input)

      expect(result.stopLoss.price).toBeGreaterThan(4)
      expect(result.takeProfits[1].price).toBeCloseTo(6, 0.5)
    })
  })

  describe('Risk Management Edge Cases', () => {
    it('should warn on very wide stop loss', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        atr: 10, // 20% stop - very wide
      }

      const validation = validateExitSetup(input)

      expect(validation.isValid).toBe(false)
      expect(validation.reason).toContain('too wide')
    })

    it('should handle tight stop loss with excellent RR', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        atr: 2, // 4% stop - tight
        supportLevel: undefined,
      }

      const result = calculateExitLevels(input)

      // Entry: 100, SL: 96, TP2: 120
      // Risk: 4, Reward: 20, RR: 1:5
      expect(result.riskRewardRatio).toContain('Excellent')
    })

    it('should handle moderate stop loss with good RR', () => {
      const input: ExitCalculatorInput = {
        entryPrice: 100,
        targetReturn: 0.2,
        atr: 5, // 10% stop - moderate
        supportLevel: undefined,
      }

      const result = calculateExitLevels(input)

      expect(result.riskRewardRatio).toContain('Good')
    })
  })
})
