/**
 * Stock API Types Tests
 *
 * Tests for type definitions and backwards compatibility
 */

import { describe, it, expect } from 'vitest'
import type { LayerScore, DecisionBadge } from './stock-api'

describe('LayerScore Type', () => {
  describe('4-layer system', () => {
    it('should accept 4-layer score with quality, valuation, growth, technical', () => {
      const score: LayerScore = {
        quality: 85,
        valuation: 72,
        growth: 65,
        technical: 58,
      }

      expect(score.quality).toBe(85)
      expect(score.valuation).toBe(72)
      expect(score.growth).toBe(65)
      expect(score.technical).toBe(58)
    })

    it('should accept 4-layer score with catalyst', () => {
      const score: LayerScore = {
        quality: 75,
        valuation: 68,
        growth: 62,
        catalyst: 55,
      }

      expect(score.catalyst).toBe(55)
      expect(score.technical).toBeUndefined()
    })

    it('should accept 4-layer score with all fields', () => {
      const score: LayerScore = {
        quality: 80,
        valuation: 70,
        timing: 60,
        growth: 65,
        technical: 58,
        catalyst: 55,
      }

      expect(score.timing).toBe(60)
      expect(score.growth).toBe(65)
    })
  })

  describe('3-layer system (backwards compatibility)', () => {
    it('should accept 3-layer score with quality, valuation, timing', () => {
      const score: LayerScore = {
        quality: 75,
        valuation: 60,
        timing: 45,
      }

      expect(score.quality).toBe(75)
      expect(score.valuation).toBe(60)
      expect(score.timing).toBe(45)
      expect(score.growth).toBeUndefined()
      expect(score.technical).toBeUndefined()
    })

    it('should accept partial 4-layer with only quality, valuation, growth', () => {
      const score: LayerScore = {
        quality: 70,
        valuation: 65,
        growth: 55,
      }

      expect(score.growth).toBe(55)
      expect(score.timing).toBeUndefined()
    })
  })

  describe('Type safety', () => {
    it('should allow quality and valuation as required fields', () => {
      // @ts-expect-error - Missing required fields
      const invalidScore: LayerScore = {
        growth: 50,
      }

      expect(invalidScore.quality).toBeUndefined()
    })

    it('should allow optional timing field', () => {
      const score: LayerScore = {
        quality: 50,
        valuation: 50,
        timing: 50,
      }

      expect(score.timing).toBeDefined()
    })

    it('should allow optional growth field', () => {
      const score: LayerScore = {
        quality: 50,
        valuation: 50,
        growth: 50,
      }

      expect(score.growth).toBeDefined()
    })

    it('should allow optional technical field', () => {
      const score: LayerScore = {
        quality: 50,
        valuation: 50,
        technical: 50,
      }

      expect(score.technical).toBeDefined()
    })

    it('should allow optional catalyst field', () => {
      const score: LayerScore = {
        quality: 50,
        valuation: 50,
        catalyst: 50,
      }

      expect(score.catalyst).toBeDefined()
    })
  })
})

describe('DecisionBadge Type', () => {
  it('should accept bullish type', () => {
    const badge: DecisionBadge = {
      label: 'BUY',
      score: 85,
      type: 'bullish',
    }

    expect(badge.type).toBe('bullish')
  })

  it('should accept bearish type', () => {
    const badge: DecisionBadge = {
      label: 'AVOID',
      score: 25,
      type: 'bearish',
    }

    expect(badge.type).toBe('bearish')
  })

  it('should accept neutral type', () => {
    const badge: DecisionBadge = {
      label: 'WATCH',
      score: 50,
      type: 'neutral',
    }

    expect(badge.type).toBe('neutral')
  })

  it('should not accept invalid type', () => {
    // @ts-expect-error - Invalid type
    const invalidBadge: DecisionBadge = {
      label: 'BUY',
      score: 75,
      type: 'invalid',
    }

    expect(invalidBadge.type).toBe('invalid')
  })
})
