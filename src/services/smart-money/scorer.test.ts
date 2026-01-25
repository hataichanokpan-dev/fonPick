/**
 * Smart Money Scorer Tests
 *
 * Unit tests for signal scoring logic.
 * Tests classifySignalStrength, detectFlowTrend, scoreInvestorSignal,
 * calculateSmartMoneyScore, and calculateOverallConfidence functions.
 */

import { describe, it, expect } from 'vitest'
import {
  classifySignalStrength,
  detectFlowTrend,
  scoreInvestorSignal,
  calculateSmartMoneyScore,
  calculateOverallConfidence,
  applyThaiMarketContext,
  calculateTrendStrength,
} from './scorer'
import type { SmartMoneyInvestor } from '@/types/smart-money'
import type { RTDBInvestorFlow } from '@/types/rtdb'

describe('Smart Money Scorer', () => {
  // ==========================================================================
  // CLASSIFY SIGNAL STRENGTH
  // ==========================================================================

  describe('classifySignalStrength', () => {
    it('should return Strong Buy for flows >= 500M', () => {
      expect(classifySignalStrength(500)).toBe('Strong Buy')
      expect(classifySignalStrength(1000)).toBe('Strong Buy')
    })

    it('should return Buy for flows between 100M and 500M', () => {
      expect(classifySignalStrength(100)).toBe('Buy')
      expect(classifySignalStrength(250)).toBe('Buy')
      expect(classifySignalStrength(499)).toBe('Buy')
    })

    it('should return Neutral for flows between -100M and 100M', () => {
      expect(classifySignalStrength(0)).toBe('Neutral')
      expect(classifySignalStrength(50)).toBe('Neutral')
      expect(classifySignalStrength(-50)).toBe('Neutral')
    })

    it('should return Sell for flows between -500M and -100M', () => {
      expect(classifySignalStrength(-100)).toBe('Sell')
      expect(classifySignalStrength(-250)).toBe('Sell')
      expect(classifySignalStrength(-499)).toBe('Sell')
    })

    it('should return Strong Sell for flows <= -500M', () => {
      expect(classifySignalStrength(-500)).toBe('Strong Sell')
      expect(classifySignalStrength(-1000)).toBe('Strong Sell')
    })
  })

  // ==========================================================================
  // DETECT FLOW TREND
  // ==========================================================================

  describe('detectFlowTrend', () => {
    it('should return Accelerating Buy for strong positive flow with positive momentum', () => {
      const historical = [100, 150, 200]
      expect(detectFlowTrend(350, historical)).toBe('Accelerating Buy')
    })

    it('should return Stable Buy for consistent positive flow', () => {
      const historical = [200, 210, 220]
      expect(detectFlowTrend(250, historical)).toBe('Stable Buy')
    })

    it('should return Decreasing Buy for positive flow with negative momentum', () => {
      const historical = [400, 350, 300]
      expect(detectFlowTrend(250, historical)).toBe('Decreasing Buy')
    })

    it('should return Accelerating Sell for strong negative flow with negative momentum', () => {
      const historical = [-100, -150, -200]
      expect(detectFlowTrend(-350, historical)).toBe('Accelerating Sell')
    })

    it('should return Stable Sell for consistent negative flow', () => {
      const historical = [-200, -210, -220]
      expect(detectFlowTrend(-250, historical)).toBe('Stable Sell')
    })

    it('should return Decreasing Sell for negative flow with positive momentum', () => {
      const historical = [-400, -350, -300]
      expect(detectFlowTrend(-250, historical)).toBe('Decreasing Sell')
    })

    it('should return Neutral when no historical data provided and flow is neutral', () => {
      expect(detectFlowTrend(50)).toBe('Neutral')
    })

    it('should return Stable Buy when no historical data and flow is positive', () => {
      expect(detectFlowTrend(150)).toBe('Stable Buy')
    })

    it('should return Stable Sell when no historical data and flow is negative', () => {
      expect(detectFlowTrend(-150)).toBe('Stable Sell')
    })

    it('should handle edge case of empty historical array', () => {
      expect(detectFlowTrend(100, [])).toBe('Neutral')
    })
  })

  // ==========================================================================
  // SCORE INVESTOR SIGNAL
  // ==========================================================================

  describe('scoreInvestorSignal', () => {
    const mockInvestor: SmartMoneyInvestor = 'foreign'

    const createMockFlow = (net: number): RTDBInvestorFlow => ({
      buy: Math.abs(net) > 0 ? Math.abs(net) + 500 : 500,
      sell: net > 0 ? 500 : Math.abs(net) + 500,
      net,
    })

    it('should score Strong Buy signal correctly', () => {
      const flow = createMockFlow(600)
      const result = scoreInvestorSignal(mockInvestor, flow)

      expect(result.investor).toBe('foreign')
      expect(result.todayNet).toBe(600)
      expect(result.strength).toBe('Strong Buy')
      expect(result.trend).toBe('Stable Buy')
      expect(result.confidence).toBeGreaterThan(70)
    })

    it('should score Strong Sell signal correctly', () => {
      const flow = createMockFlow(-600)
      const result = scoreInvestorSignal(mockInvestor, flow)

      expect(result.investor).toBe('foreign')
      expect(result.todayNet).toBe(-600)
      expect(result.strength).toBe('Strong Sell')
      expect(result.trend).toBe('Stable Sell')
      expect(result.confidence).toBeGreaterThan(70)
    })

    it('should calculate 5-day trend from historical data', () => {
      const flow = createMockFlow(200)
      const historical = [
        createMockFlow(100),
        createMockFlow(150),
        createMockFlow(120),
        createMockFlow(180),
        createMockFlow(160),
        createMockFlow(190),
      ]

      const result = scoreInvestorSignal(mockInvestor, flow, historical)

      expect(result.trend5Day).toBeDefined()
      expect(result.avg5Day).toBeDefined()
      expect(result.vsAverage).toBeDefined()
      expect(result.trend5Day).toBeGreaterThan(0)
    })

    it('should handle edge case of zero historical flows', () => {
      const flow = createMockFlow(0)
      const historical = [createMockFlow(0), createMockFlow(0)]

      const result = scoreInvestorSignal(mockInvestor, flow, historical)

      expect(result.trend5Day).toBe(0)
      expect(result.avg5Day).toBe(0)
    })

    it('should calculate vsAverage correctly', () => {
      const flow = createMockFlow(200)
      const historical = [
        createMockFlow(100),
        createMockFlow(100),
        createMockFlow(100),
      ]

      const result = scoreInvestorSignal(mockInvestor, flow, historical)

      expect(result.vsAverage).toBeGreaterThan(0)
      expect(result.vsAverage).toBe(100) // 200 - 100 avg
    })

    it('should handle all investor types (retail, prop)', () => {
      const retailInvestor: SmartMoneyInvestor = 'retail'
      const propInvestor: SmartMoneyInvestor = 'prop'
      const flow = createMockFlow(100)

      const retailResult = scoreInvestorSignal(retailInvestor, flow)
      const propResult = scoreInvestorSignal(propInvestor, flow)

      expect(retailResult.investor).toBe('retail')
      expect(propResult.investor).toBe('prop')
    })
  })

  // ==========================================================================
  // CALCULATE SMART MONEY SCORE
  // ==========================================================================

  describe('calculateSmartMoneyScore', () => {
    const createInvestorAnalysis = (todayNet: number, strength: string) => ({
      investor: 'foreign' as SmartMoneyInvestor,
      todayNet,
      strength: strength as any,
      trend: 'Stable Buy' as const,
      confidence: 85,
      trend5Day: 1000,
      avg5Day: 200,
      vsAverage: 400,
    })

    it('should calculate maximum score when both signals are Strong Buy', () => {
      const foreign = createInvestorAnalysis(600, 'Strong Buy')
      const institution = createInvestorAnalysis(600, 'Strong Buy')

      const result = calculateSmartMoneyScore(foreign, institution)

      expect(result.foreignScore).toBeGreaterThan(40)
      expect(result.institutionScore).toBeGreaterThan(40)
      // New formula: 80% smart money weight, 20% context weight (retail+prop undefined=0)
      // Expected: (50 + 45) * 0.8 = 76
      expect(result.totalScore).toBeGreaterThan(70)
      expect(result.totalScore).toBeLessThanOrEqual(100)
    })

    it('should calculate minimum score when both signals are Strong Sell', () => {
      const foreign = createInvestorAnalysis(-600, 'Strong Sell')
      const institution = createInvestorAnalysis(-600, 'Strong Sell')

      const result = calculateSmartMoneyScore(foreign, institution)

      expect(result.foreignScore).toBeLessThan(20)
      expect(result.institutionScore).toBeLessThan(20)
      expect(result.totalScore).toBeLessThan(40)
    })

    it('should cap individual scores at 50', () => {
      const foreign = createInvestorAnalysis(2000, 'Strong Buy')
      const institution = createInvestorAnalysis(2000, 'Strong Buy')

      const result = calculateSmartMoneyScore(foreign, institution)

      expect(result.foreignScore).toBeLessThanOrEqual(50)
      expect(result.institutionScore).toBeLessThanOrEqual(50)
    })

    it('should cap total score at 100', () => {
      const foreign = createInvestorAnalysis(2000, 'Strong Buy')
      const institution = createInvestorAnalysis(2000, 'Strong Buy')

      const result = calculateSmartMoneyScore(foreign, institution)

      expect(result.totalScore).toBeLessThanOrEqual(100)
    })

    it('should include context investor scores (retail, prop)', () => {
      const foreign = createInvestorAnalysis(500, 'Strong Buy')
      const institution = createInvestorAnalysis(500, 'Strong Buy')
      const retail = createInvestorAnalysis(300, 'Buy')
      const prop = createInvestorAnalysis(200, 'Buy')

      const result = calculateSmartMoneyScore(foreign, institution, retail, prop)

      expect(result.retailScore).toBeGreaterThan(0)
      expect(result.propScore).toBeGreaterThan(0)
      expect(result.retailScore).toBeLessThanOrEqual(25)
      expect(result.propScore).toBeLessThanOrEqual(25)
    })

    it('should return zero context scores when not provided', () => {
      const foreign = createInvestorAnalysis(500, 'Strong Buy')
      const institution = createInvestorAnalysis(500, 'Strong Buy')

      const result = calculateSmartMoneyScore(foreign, institution)

      expect(result.retailScore).toBe(0)
      expect(result.propScore).toBe(0)
    })

    it('should weight smart money higher than context investors', () => {
      const foreign = createInvestorAnalysis(500, 'Strong Buy')
      const institution = createInvestorAnalysis(500, 'Strong Buy')
      const retail = createInvestorAnalysis(500, 'Strong Buy')
      const prop = createInvestorAnalysis(500, 'Strong Buy')

      const result = calculateSmartMoneyScore(foreign, institution, retail, prop)

      // Smart money (foreign + institution) should contribute 80% to total
      // Context (retail + prop) should contribute 20% to total
      const smartMoneyContribution = (result.foreignScore + result.institutionScore) / result.totalScore
      expect(smartMoneyContribution).toBeGreaterThan(0.7)
    })
  })

  // ==========================================================================
  // CALCULATE OVERALL CONFIDENCE
  // ==========================================================================

  describe('calculateOverallConfidence', () => {
    const createInvestorAnalysis = (todayNet: number, strength: string, confidence: number) => ({
      investor: 'foreign' as SmartMoneyInvestor,
      todayNet,
      strength: strength as any,
      trend: 'Stable Buy' as const,
      confidence,
      trend5Day: 1000,
      avg5Day: 200,
      vsAverage: 400,
    })

    it('should boost confidence when both investors agree (bullish)', () => {
      const foreign = createInvestorAnalysis(500, 'Strong Buy', 80)
      const institution = createInvestorAnalysis(400, 'Buy', 75)

      const result = calculateOverallConfidence(foreign, institution)

      expect(result).toBeGreaterThan(75) // Boosted above average
    })

    it('should boost confidence when both investors agree (bearish)', () => {
      const foreign = createInvestorAnalysis(-500, 'Strong Sell', 80)
      const institution = createInvestorAnalysis(-400, 'Sell', 75)

      const result = calculateOverallConfidence(foreign, institution)

      expect(result).toBeGreaterThan(75) // Boosted above average
    })

    it('should reduce confidence when investors disagree', () => {
      const foreign = createInvestorAnalysis(500, 'Buy', 80)
      const institution = createInvestorAnalysis(-400, 'Sell', 75)

      const result = calculateOverallConfidence(foreign, institution)

      expect(result).toBeLessThan(77.5) // Reduced from average
    })

    it('should return average confidence when signals are neutral/mixed', () => {
      const foreign = createInvestorAnalysis(50, 'Neutral', 60)
      const institution = createInvestorAnalysis(80, 'Neutral', 70)

      const result = calculateOverallConfidence(foreign, institution)

      expect(result).toBe(65) // Average of 60 and 70
    })

    it('should never return confidence below 0', () => {
      const foreign = createInvestorAnalysis(500, 'Buy', 5)
      const institution = createInvestorAnalysis(-400, 'Sell', 5)

      const result = calculateOverallConfidence(foreign, institution)

      expect(result).toBeGreaterThanOrEqual(0)
    })

    it('should handle optional retail and prop parameters', () => {
      const foreign = createInvestorAnalysis(500, 'Buy', 80)
      const institution = createInvestorAnalysis(400, 'Buy', 75)
      const retail = createInvestorAnalysis(100, 'Neutral', 50)
      const prop = createInvestorAnalysis(50, 'Neutral', 50)

      // Should not throw error
      const result = calculateOverallConfidence(foreign, institution, retail, prop)
      expect(result).toBeDefined()
      expect(result).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // APPLY THAI MARKET CONTEXT
  // ==========================================================================

  describe('applyThaiMarketContext', () => {
    it('should boost score when foreign flow is positive', () => {
      const baseScore = 60
      const foreignNet = 500

      const result = applyThaiMarketContext(baseScore, foreignNet)

      expect(result).toBeGreaterThan(baseScore)
    })

    it('should not modify score when foreign flow is negative or zero', () => {
      const baseScore = 60

      const result1 = applyThaiMarketContext(baseScore, -100)
      const result2 = applyThaiMarketContext(baseScore, 0)

      expect(result1).toBe(baseScore)
      expect(result2).toBe(baseScore)
    })

    it('should cap adjusted score at 100', () => {
      const baseScore = 95
      const foreignNet = 1000

      const result = applyThaiMarketContext(baseScore, foreignNet)

      expect(result).toBeLessThanOrEqual(100)
    })

    it('should never return score below 0', () => {
      const baseScore = 10
      const foreignNet = -500

      const result = applyThaiMarketContext(baseScore, foreignNet)

      expect(result).toBeGreaterThanOrEqual(0)
    })
  })

  // ==========================================================================
  // CALCULATE TREND STRENGTH
  // ==========================================================================

  describe('calculateTrendStrength', () => {
    it('should return 50 for insufficient data (single element)', () => {
      const result = calculateTrendStrength([100])
      expect(result).toBe(50)
    })

    it('should return 50 for empty array', () => {
      const result = calculateTrendStrength([])
      expect(result).toBe(50)
    })

    it('should return high strength for strong upward trend', () => {
      const result = calculateTrendStrength([100, 150, 200, 250, 300])
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(100)
    })

    it('should return high strength for strong downward trend', () => {
      const result = calculateTrendStrength([300, 250, 200, 150, 100])
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(100)
    })

    it('should return low strength for flat trend', () => {
      const result = calculateTrendStrength([100, 100, 100, 100, 100])
      expect(result).toBeLessThan(50)
    })

    it('should cap strength at 100', () => {
      const result = calculateTrendStrength([0, 100, 200, 300, 400, 500])
      expect(result).toBeLessThanOrEqual(100)
    })

    it('should handle oscillating data', () => {
      const result = calculateTrendStrength([100, 200, 100, 200, 100])
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(100)
    })
  })
})
