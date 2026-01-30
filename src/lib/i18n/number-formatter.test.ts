/**
 * NumberFormatter Tests (Thai/English Bilingual)
 *
 * TDD Workflow:
 * 1. RED - Write failing tests first
 * 2. GREEN - Implement to pass tests
 * 3. REFACTOR - Improve while keeping tests passing
 *
 * These tests verify number formatting for both Thai and English locales
 */

import { describe, it, expect } from 'vitest'
import { NumberFormatter } from './number-formatter'

// =============================================================================
// FORMAT NUMBER TESTS
// =============================================================================

describe('NumberFormatter.formatNumber', () => {
  describe('English locale (en-US)', () => {
    const formatter = new NumberFormatter('en')

    it('should format positive numbers with thousand separators', () => {
      expect(formatter.formatNumber(1234.56)).toBe('1,234.56')
    })

    it('should format large numbers with multiple separators', () => {
      expect(formatter.formatNumber(1234567.89)).toBe('1,234,567.89')
    })

    it('should format very large numbers', () => {
      expect(formatter.formatNumber(1234567890.12)).toBe('1,234,567,890.12')
    })

    it('should format small numbers', () => {
      expect(formatter.formatNumber(0.12)).toBe('0.12')
    })

    it('should format zero', () => {
      expect(formatter.formatNumber(0)).toBe('0.00')
    })

    it('should format negative numbers', () => {
      expect(formatter.formatNumber(-1234.56)).toBe('-1,234.56')
    })

    it('should respect custom decimals', () => {
      expect(formatter.formatNumber(1234.567, 0)).toBe('1,235')
      expect(formatter.formatNumber(1234.567, 3)).toBe('1,234.567')
    })

    it('should handle integers correctly', () => {
      expect(formatter.formatNumber(1000)).toBe('1,000.00')
    })

    it('should handle numbers less than 1', () => {
      expect(formatter.formatNumber(0.12345, 4)).toBe('0.1235')
    })
  })

  describe('Thai locale (th-TH)', () => {
    const formatter = new NumberFormatter('th')

    it('should format positive numbers with Thai separators', () => {
      expect(formatter.formatNumber(1234.56)).toBe('1,234.56')
    })

    it('should format large numbers with multiple separators', () => {
      expect(formatter.formatNumber(1234567.89)).toBe('1,234,567.89')
    })

    it('should format zero', () => {
      expect(formatter.formatNumber(0)).toBe('0.00')
    })

    it('should format negative numbers', () => {
      expect(formatter.formatNumber(-1234.56)).toBe('-1,234.56')
    })

    it('should respect custom decimals', () => {
      expect(formatter.formatNumber(1234.567, 0)).toBe('1,235')
      expect(formatter.formatNumber(1234.567, 3)).toBe('1,234.567')
    })
  })

  describe('Edge Cases', () => {
    const formatter = new NumberFormatter('en')

    it('should handle NaN', () => {
      expect(formatter.formatNumber(NaN)).toBe('N/A')
    })

    it('should handle Infinity', () => {
      expect(formatter.formatNumber(Infinity)).toBe('Infinity')
      expect(formatter.formatNumber(-Infinity)).toBe('-Infinity')
    })

    it('should handle very small decimals', () => {
      expect(formatter.formatNumber(0.0001, 6)).toBe('0.000100')
    })

    it('should handle rounding correctly', () => {
      expect(formatter.formatNumber(1.005, 2)).toBe('1.01')
      expect(formatter.formatNumber(1.004, 2)).toBe('1.00')
    })
  })
})

// =============================================================================
// FORMAT SHORT TESTS (K/M/B/T suffixes)
// =============================================================================

describe('NumberFormatter.formatShort', () => {
  describe('English locale', () => {
    const formatter = new NumberFormatter('en')

    it('should format numbers in thousands with K suffix', () => {
      expect(formatter.formatShort(1500)).toBe('1.50K')
      expect(formatter.formatShort(15000)).toBe('15.00K')
      expect(formatter.formatShort(150000)).toBe('150.00K')
    })

    it('should format numbers in millions with M suffix', () => {
      expect(formatter.formatShort(1500000)).toBe('1.50M')
      expect(formatter.formatShort(15000000)).toBe('15.00M')
      expect(formatter.formatShort(150000000)).toBe('150.00M')
    })

    it('should format numbers in billions with B suffix', () => {
      expect(formatter.formatShort(1500000000)).toBe('1.50B')
      expect(formatter.formatShort(15000000000)).toBe('15.00B')
    })

    it('should format numbers in trillions with T suffix', () => {
      expect(formatter.formatShort(1500000000000)).toBe('1.50T')
      expect(formatter.formatShort(15000000000000)).toBe('15.00T')
    })

    it('should format small numbers without suffix', () => {
      expect(formatter.formatShort(999)).toBe('999.00')
      expect(formatter.formatShort(100)).toBe('100.00')
      expect(formatter.formatShort(0)).toBe('0.00')
    })

    it('should format exactly 1000 with K suffix', () => {
      expect(formatter.formatShort(1000)).toBe('1.00K')
    })

    it('should format exactly 1000000 with M suffix', () => {
      expect(formatter.formatShort(1000000)).toBe('1.00M')
    })

    it('should format exactly 1000000000 with B suffix', () => {
      expect(formatter.formatShort(1000000000)).toBe('1.00B')
    })

    it('should format exactly 1000000000000 with T suffix', () => {
      expect(formatter.formatShort(1000000000000)).toBe('1.00T')
    })

    it('should respect custom decimals', () => {
      expect(formatter.formatShort(1500, 0)).toBe('2K')
      expect(formatter.formatShort(1500, 1)).toBe('1.5K')
      expect(formatter.formatShort(1500, 3)).toBe('1.500K')
    })

    it('should handle negative numbers', () => {
      expect(formatter.formatShort(-1500)).toBe('-1.50K')
      expect(formatter.formatShort(-1500000)).toBe('-1.50M')
    })
  })

  describe('Thai locale', () => {
    const formatter = new NumberFormatter('th')

    it('should format numbers with same suffixes as English', () => {
      expect(formatter.formatShort(1500)).toBe('1.50K')
      expect(formatter.formatShort(1500000)).toBe('1.50M')
      expect(formatter.formatShort(1500000000)).toBe('1.50B')
      expect(formatter.formatShort(1500000000000)).toBe('1.50T')
    })

    it('should format small numbers without suffix', () => {
      expect(formatter.formatShort(999)).toBe('999.00')
    })
  })

  describe('Edge Cases', () => {
    const formatter = new NumberFormatter('en')

    it('should handle NaN', () => {
      expect(formatter.formatShort(NaN)).toBe('N/A')
    })

    it('should handle Infinity', () => {
      expect(formatter.formatShort(Infinity)).toBe('Infinity')
    })

    it('should handle very large numbers beyond trillions', () => {
      expect(formatter.formatShort(1500000000000000)).toBe('1500.00T')
    })

    it('should handle rounding at boundary', () => {
      expect(formatter.formatShort(999999)).toBe('1000.00K')
      expect(formatter.formatShort(999)).toBe('999.00')
    })
  })
})

// =============================================================================
// FORMAT CURRENCY TESTS
// =============================================================================

describe('NumberFormatter.formatCurrency', () => {
  describe('English locale', () => {
    const formatter = new NumberFormatter('en')

    it('should format currency with THB prefix and short suffix', () => {
      expect(formatter.formatCurrency(1500000)).toBe('THB 1.50M')
    })

    it('should format millions', () => {
      expect(formatter.formatCurrency(15000000)).toBe('THB 15.00M')
    })

    it('should format billions', () => {
      expect(formatter.formatCurrency(1500000000)).toBe('THB 1.50B')
    })

    it('should format small amounts without suffix', () => {
      expect(formatter.formatCurrency(999)).toBe('THB 999.00')
    })

    it('should format thousands', () => {
      expect(formatter.formatCurrency(1500)).toBe('THB 1.50K')
    })

    it('should format zero', () => {
      expect(formatter.formatCurrency(0)).toBe('THB 0.00')
    })

    it('should handle negative amounts', () => {
      expect(formatter.formatCurrency(-1500)).toBe('THB -1.50K')
    })
  })

  describe('Thai locale', () => {
    const formatter = new NumberFormatter('th')

    it('should format currency with ฿ prefix and short suffix', () => {
      expect(formatter.formatCurrency(1500000)).toBe('฿1.50M')
    })

    it('should format millions', () => {
      expect(formatter.formatCurrency(15000000)).toBe('฿15.00M')
    })

    it('should format billions', () => {
      expect(formatter.formatCurrency(1500000000)).toBe('฿1.50B')
    })

    it('should format small amounts without suffix', () => {
      expect(formatter.formatCurrency(999)).toBe('฿999.00')
    })

    it('should format thousands', () => {
      expect(formatter.formatCurrency(1500)).toBe('฿1.50K')
    })

    it('should format zero', () => {
      expect(formatter.formatCurrency(0)).toBe('฿0.00')
    })

    it('should handle negative amounts', () => {
      expect(formatter.formatCurrency(-1500)).toBe('฿-1.50K')
    })
  })

  describe('Edge Cases', () => {
    const formatterEn = new NumberFormatter('en')
    const formatterTh = new NumberFormatter('th')

    it('should handle NaN in English', () => {
      expect(formatterEn.formatCurrency(NaN)).toBe('THB N/A')
    })

    it('should handle NaN in Thai', () => {
      expect(formatterTh.formatCurrency(NaN)).toBe('฿N/A')
    })

    it('should handle very large amounts', () => {
      expect(formatterEn.formatCurrency(1500000000000)).toBe('THB 1.50T')
      expect(formatterTh.formatCurrency(1500000000000)).toBe('฿1.50T')
    })
  })
})

// =============================================================================
// FORMAT PERCENTAGE TESTS
// =============================================================================

describe('NumberFormatter.formatPercentage', () => {
  describe('English locale', () => {
    const formatter = new NumberFormatter('en')

    it('should format positive percentage with + sign', () => {
      expect(formatter.formatPercentage(2.35)).toBe('+2.35%')
    })

    it('should format negative percentage with - sign', () => {
      expect(formatter.formatPercentage(-1.50)).toBe('-1.50%')
    })

    it('should format zero without sign', () => {
      expect(formatter.formatPercentage(0)).toBe('0.00%')
    })

    it('should format small percentages', () => {
      expect(formatter.formatPercentage(0.01)).toBe('+0.01%')
      expect(formatter.formatPercentage(-0.01)).toBe('-0.01%')
    })

    it('should format large percentages', () => {
      expect(formatter.formatPercentage(100.50)).toBe('+100.50%')
      expect(formatter.formatPercentage(-100.50)).toBe('-100.50%')
    })

    it('should respect custom decimals', () => {
      expect(formatter.formatPercentage(2.345, 0)).toBe('+2%')
      expect(formatter.formatPercentage(2.345, 1)).toBe('+2.3%')
      expect(formatter.formatPercentage(2.345, 3)).toBe('+2.345%')
    })

    it('should use formatNumber internally for proper formatting', () => {
      expect(formatter.formatPercentage(1234.56)).toBe('+1,234.56%')
    })
  })

  describe('Thai locale', () => {
    const formatter = new NumberFormatter('th')

    it('should format positive percentage with + sign', () => {
      expect(formatter.formatPercentage(2.35)).toBe('+2.35%')
    })

    it('should format negative percentage with - sign', () => {
      expect(formatter.formatPercentage(-1.50)).toBe('-1.50%')
    })

    it('should format zero without sign', () => {
      expect(formatter.formatPercentage(0)).toBe('0.00%')
    })

    it('should respect custom decimals', () => {
      expect(formatter.formatPercentage(2.345, 1)).toBe('+2.3%')
    })
  })

  describe('Edge Cases', () => {
    const formatter = new NumberFormatter('en')

    it('should handle NaN', () => {
      expect(formatter.formatPercentage(NaN)).toBe('N/A')
    })

    it('should handle Infinity', () => {
      expect(formatter.formatPercentage(Infinity)).toBe('+Infinity%')
      expect(formatter.formatPercentage(-Infinity)).toBe('-Infinity%')
    })

    it('should handle very small decimals', () => {
      expect(formatter.formatPercentage(0.001, 4)).toBe('+0.0010%')
    })
  })
})

// =============================================================================
// FORMAT VOLUME TESTS
// =============================================================================

describe('NumberFormatter.formatVolume', () => {
  describe('English locale', () => {
    const formatter = new NumberFormatter('en')

    it('should format volume in millions with "shares" suffix', () => {
      expect(formatter.formatVolume(1500000)).toBe('1.50M shares')
    })

    it('should format volume in thousands with "shares" suffix', () => {
      expect(formatter.formatVolume(1500)).toBe('1.50K shares')
    })

    it('should format small volumes with "shares" suffix', () => {
      expect(formatter.formatVolume(999)).toBe('999 shares')
      expect(formatter.formatVolume(100)).toBe('100 shares')
    })

    it('should format zero', () => {
      expect(formatter.formatVolume(0)).toBe('0 shares')
    })

    it('should handle negative volumes', () => {
      expect(formatter.formatVolume(-1500)).toBe('-1.50K shares')
    })
  })

  describe('Thai locale', () => {
    const formatter = new NumberFormatter('th')

    it('should format volume in millions with "หุ้น" suffix', () => {
      expect(formatter.formatVolume(1500000)).toBe('1.50M หุ้น')
    })

    it('should format volume in thousands with "หุ้น" suffix', () => {
      expect(formatter.formatVolume(1500)).toBe('1.50K หุ้น')
    })

    it('should format small volumes with "หุ้น" suffix', () => {
      expect(formatter.formatVolume(999)).toBe('999 หุ้น')
      expect(formatter.formatVolume(100)).toBe('100 หุ้น')
    })

    it('should format zero', () => {
      expect(formatter.formatVolume(0)).toBe('0 หุ้น')
    })

    it('should handle negative volumes', () => {
      expect(formatter.formatVolume(-1500)).toBe('-1.50K หุ้น')
    })

    it('should not use decimals for small volumes', () => {
      expect(formatter.formatVolume(500)).toBe('500 หุ้น')
    })
  })

  describe('Edge Cases', () => {
    const formatterEn = new NumberFormatter('en')
    const formatterTh = new NumberFormatter('th')

    it('should handle NaN in English', () => {
      expect(formatterEn.formatVolume(NaN)).toBe('N/A shares')
    })

    it('should handle NaN in Thai', () => {
      expect(formatterTh.formatVolume(NaN)).toBe('N/A หุ้น')
    })

    it('should handle very large volumes', () => {
      expect(formatterEn.formatVolume(1500000000)).toBe('1.50B shares')
      expect(formatterTh.formatVolume(1500000000)).toBe('1.50B หุ้น')
    })

    it('should handle single share', () => {
      expect(formatterEn.formatVolume(1)).toBe('1 share')
      expect(formatterTh.formatVolume(1)).toBe('1 หุ้น')
    })
  })
})

// =============================================================================
// INSTANCE METHODS AND CONSISTENCY
// =============================================================================

describe('NumberFormatter Instance Behavior', () => {
  it('should create independent instances for different locales', () => {
    const formatterEn = new NumberFormatter('en')
    const formatterTh = new NumberFormatter('th')

    expect(formatterEn.formatCurrency(1500000)).toBe('THB 1.50M')
    expect(formatterTh.formatCurrency(1500000)).toBe('฿1.50M')
  })

  it('should maintain locale across multiple calls', () => {
    const formatterEn = new NumberFormatter('en')

    expect(formatterEn.formatCurrency(1500)).toBe('THB 1.50K')
    expect(formatterEn.formatCurrency(1500000)).toBe('THB 1.50M')
    expect(formatterEn.formatCurrency(1500000000)).toBe('THB 1.50B')
  })

  it('should handle invalid locale gracefully', () => {
    const formatter = new NumberFormatter('invalid' as any)
    const result = formatter.formatNumber(1234.56)

    // Should still return a valid formatted number
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })
})
