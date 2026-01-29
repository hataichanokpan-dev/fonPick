/**
 * Validation Schemas Tests
 *
 * TDD: Tests for LayerScore validation
 */

import { describe, it, expect } from 'vitest'
import {
  LayerScoreSchema,
  DecisionBadgeSchema,
  validateLayerScore,
  validateDecisionBadge,
  safeValidate,
} from './schemas'
import type { LayerScore } from '@/types/stock-api'

describe('LayerScoreSchema', () => {
  describe('Valid 4-layer scores', () => {
    it('should validate 4-layer score with quality, valuation, growth, technical', () => {
      const validScore: LayerScore = {
        quality: 85,
        valuation: 72,
        growth: 65,
        technical: 58,
      }

      const result = LayerScoreSchema.safeParse(validScore)
      expect(result.success).toBe(true)
    })

    it('should validate 4-layer score with catalyst instead of technical', () => {
      const validScore: LayerScore = {
        quality: 75,
        valuation: 68,
        growth: 62,
        catalyst: 55,
      }

      const result = LayerScoreSchema.safeParse(validScore)
      expect(result.success).toBe(true)
    })

    it('should validate 4-layer score with all optional fields', () => {
      const validScore: LayerScore = {
        quality: 80,
        valuation: 70,
        timing: 60,
        growth: 65,
        technical: 58,
        catalyst: 55,
      }

      const result = LayerScoreSchema.safeParse(validScore)
      expect(result.success).toBe(true)
    })
  })

  describe('Valid 3-layer scores (backwards compatibility)', () => {
    it('should validate 3-layer score with quality, valuation, timing', () => {
      const validScore: LayerScore = {
        quality: 75,
        valuation: 60,
        timing: 45,
      }

      const result = LayerScoreSchema.safeParse(validScore)
      expect(result.success).toBe(true)
    })

    it('should validate 3-layer score with only quality and valuation plus growth', () => {
      const validScore: LayerScore = {
        quality: 70,
        valuation: 65,
        growth: 55,
      }

      const result = LayerScoreSchema.safeParse(validScore)
      expect(result.success).toBe(true)
    })
  })

  describe('Score range validation', () => {
    it('should validate scores at minimum (0)', () => {
      const minScore: LayerScore = {
        quality: 0,
        valuation: 0,
        growth: 0,
      }

      const result = LayerScoreSchema.safeParse(minScore)
      expect(result.success).toBe(true)
    })

    it('should validate scores at maximum (100)', () => {
      const maxScore: LayerScore = {
        quality: 100,
        valuation: 100,
        growth: 100,
      }

      const result = LayerScoreSchema.safeParse(maxScore)
      expect(result.success).toBe(true)
    })

    it('should reject scores below 0', () => {
      const invalidScore: LayerScore = {
        quality: -10,
        valuation: 50,
        growth: 50,
      }

      const result = LayerScoreSchema.safeParse(invalidScore)
      expect(result.success).toBe(false)
    })

    it('should reject scores above 100', () => {
      const invalidScore: LayerScore = {
        quality: 150,
        valuation: 50,
        growth: 50,
      }

      const result = LayerScoreSchema.safeParse(invalidScore)
      expect(result.success).toBe(false)
    })
  })

  describe('Required fields validation', () => {
    it('should require quality field', () => {
      const invalidScore = {
        valuation: 50,
        growth: 50,
      } as unknown as LayerScore

      const result = LayerScoreSchema.safeParse(invalidScore)
      expect(result.success).toBe(false)
    })

    it('should require valuation field', () => {
      const invalidScore = {
        quality: 50,
        growth: 50,
      } as unknown as LayerScore

      const result = LayerScoreSchema.safeParse(invalidScore)
      expect(result.success).toBe(false)
    })

    it('should require at least one of timing, growth, technical, or catalyst', () => {
      const invalidScore = {
        quality: 50,
        valuation: 50,
      } as unknown as LayerScore

      const result = LayerScoreSchema.safeParse(invalidScore)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('timing or growth/technical/catalyst')
      }
    })
  })

  describe('validateLayerScore function', () => {
    it('should return validated data for valid input', () => {
      const validScore: LayerScore = {
        quality: 85,
        valuation: 72,
        growth: 65,
      }

      const result = validateLayerScore(validScore)
      expect(result).toEqual(validScore)
    })

    it('should throw error for invalid input', () => {
      const invalidScore = {
        quality: 150,
        valuation: 50,
      }

      expect(() => validateLayerScore(invalidScore)).toThrow()
    })
  })

  describe('safeValidate function', () => {
    it('should return validated data for valid input', () => {
      const validScore: LayerScore = {
        quality: 85,
        valuation: 72,
        growth: 65,
      }

      const result = safeValidate(LayerScoreSchema, validScore)
      expect(result).toEqual(validScore)
    })

    it('should return null for invalid input', () => {
      const invalidScore = {
        quality: 150,
        valuation: 50,
      }

      const result = safeValidate(LayerScoreSchema, invalidScore)
      expect(result).toBeNull()
    })
  })
})

describe('DecisionBadgeSchema', () => {
  describe('Valid decision badges', () => {
    it('should validate BUY decision with bullish type', () => {
      const validBadge = {
        label: 'BUY',
        score: 85,
        type: 'bullish' as const,
      }

      const result = DecisionBadgeSchema.safeParse(validBadge)
      expect(result.success).toBe(true)
    })

    it('should validate WATCH decision with neutral type', () => {
      const validBadge = {
        label: 'WATCH',
        score: 50,
        type: 'neutral' as const,
      }

      const result = DecisionBadgeSchema.safeParse(validBadge)
      expect(result.success).toBe(true)
    })

    it('should validate AVOID decision with bearish type', () => {
      const validBadge = {
        label: 'AVOID',
        score: 25,
        type: 'bearish' as const,
      }

      const result = DecisionBadgeSchema.safeParse(validBadge)
      expect(result.success).toBe(true)
    })
  })

  describe('Score validation', () => {
    it('should validate score at minimum (0)', () => {
      const badge = {
        label: 'WATCH',
        score: 0,
        type: 'neutral' as const,
      }

      const result = DecisionBadgeSchema.safeParse(badge)
      expect(result.success).toBe(true)
    })

    it('should validate score at maximum (100)', () => {
      const badge = {
        label: 'BUY',
        score: 100,
        type: 'bullish' as const,
      }

      const result = DecisionBadgeSchema.safeParse(badge)
      expect(result.success).toBe(true)
    })

    it('should reject score below 0', () => {
      const badge = {
        label: 'WATCH',
        score: -10,
        type: 'neutral' as const,
      }

      const result = DecisionBadgeSchema.safeParse(badge)
      expect(result.success).toBe(false)
    })

    it('should reject score above 100', () => {
      const badge = {
        label: 'BUY',
        score: 150,
        type: 'bullish' as const,
      }

      const result = DecisionBadgeSchema.safeParse(badge)
      expect(result.success).toBe(false)
    })
  })

  describe('Type validation', () => {
    it('should accept bullish type', () => {
      const badge = {
        label: 'BUY',
        score: 75,
        type: 'bullish' as const,
      }

      const result = DecisionBadgeSchema.safeParse(badge)
      expect(result.success).toBe(true)
    })

    it('should accept bearish type', () => {
      const badge = {
        label: 'AVOID',
        score: 25,
        type: 'bearish' as const,
      }

      const result = DecisionBadgeSchema.safeParse(badge)
      expect(result.success).toBe(true)
    })

    it('should accept neutral type', () => {
      const badge = {
        label: 'WATCH',
        score: 50,
        type: 'neutral' as const,
      }

      const result = DecisionBadgeSchema.safeParse(badge)
      expect(result.success).toBe(true)
    })

    it('should reject invalid type', () => {
      const badge = {
        label: 'BUY',
        score: 75,
        type: 'invalid' as unknown as 'bullish',
      }

      const result = DecisionBadgeSchema.safeParse(badge)
      expect(result.success).toBe(false)
    })
  })

  describe('validateDecisionBadge function', () => {
    it('should return validated data for valid input', () => {
      const validBadge = {
        label: 'BUY',
        score: 85,
        type: 'bullish' as const,
      }

      const result = validateDecisionBadge(validBadge)
      expect(result).toEqual(validBadge)
    })

    it('should throw error for invalid input', () => {
      const invalidBadge = {
        label: 'BUY',
        score: 150,
        type: 'bullish' as const,
      }

      expect(() => validateDecisionBadge(invalidBadge)).toThrow()
    })
  })
})
