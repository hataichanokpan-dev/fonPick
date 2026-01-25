/**
 * Format Utilities Tests
 *
 * Unit tests for formatting utility functions.
 * Tests formatDecimal, formatNumber, formatPercent, formatMarketCap, etc.
 */

import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  formatDecimal,
  formatPercent,
  formatMarketCap,
  formatVolume,
  formatTimestamp,
  getValueColor,
  getValueArrow,
  formatTradingValue,
} from './format'

describe('Format Utilities', () => {
  // ==========================================================================
  // FORMAT NUMBER
  // ==========================================================================

  describe('formatNumber', () => {
    it('should format number with thousand separators', () => {
      expect(formatNumber(1234567.89, 2)).toBe('1,234,567.89')
    })

    it('should handle zero', () => {
      expect(formatNumber(0, 2)).toBe('0.00')
    })

    it('should handle negative numbers', () => {
      expect(formatNumber(-1234.56, 2)).toBe('-1,234.56')
    })

    it('should handle NaN', () => {
      expect(formatNumber(NaN, 2)).toBe('N/A')
    })

    it('should respect decimal parameter', () => {
      expect(formatNumber(1234.5678, 0)).toBe('1,235')
      expect(formatNumber(1234.5678, 4)).toBe('1,234.5678')
    })
  })

  // ==========================================================================
  // FORMAT DECIMAL (Homepage Issue #3, #7 fix)
  // ==========================================================================

  describe('formatDecimal', () => {
    it('should format decimal with default precision (2)', () => {
      expect(formatDecimal(3.5999999999999996)).toBe('3.6')
      expect(formatDecimal(123.456)).toBe('123.46')
    })

    it('should remove trailing zeros', () => {
      expect(formatDecimal(3.0, 2)).toBe('3')
      expect(formatDecimal(3.50, 2)).toBe('3.5')
      expect(formatDecimal(3.00, 2)).toBe('3')
    })

    it('should handle floating point precision issues', () => {
      // Common JavaScript floating point errors
      expect(formatDecimal(0.1 + 0.2, 2)).toBe('0.3') // Not 0.30000000000000004
      // 1.005.toFixed(2) in JavaScript gives "1.00" due to floating point representation
      // The actual value is 1.0049999999999999... which rounds to 1.00
      expect(formatDecimal(1.005, 2)).toBe('1')
    })

    it('should handle maxDecimals parameter', () => {
      expect(formatDecimal(123.456789, 0)).toBe('123')
      expect(formatDecimal(123.456789, 2)).toBe('123.46')
      expect(formatDecimal(123.456789, 4)).toBe('123.4568')
    })

    it('should handle zero', () => {
      expect(formatDecimal(0)).toBe('0')
      expect(formatDecimal(0, 2)).toBe('0')
    })

    it('should handle negative numbers', () => {
      expect(formatDecimal(-3.14159, 2)).toBe('-3.14')
      expect(formatDecimal(-123.999, 2)).toBe('-124')
    })

    it('should handle very small numbers', () => {
      expect(formatDecimal(0.001, 2)).toBe('0')
      expect(formatDecimal(0.009, 2)).toBe('0.01')
    })

    it('should handle very large numbers', () => {
      // formatDecimal returns the result of parseFloat().toString()
      // It doesn't add commas like formatNumber
      expect(formatDecimal(999999.999, 2)).toBe('1000000')
    })

    it('should handle NaN', () => {
      expect(formatDecimal(NaN)).toBe('N/A')
    })

    it('should handle Infinity', () => {
      // Infinity is not NaN in JavaScript, so formatDecimal doesn't handle it
      // parseFloat(Infinity.toFixed(2)) returns Infinity
      // Infinity.toString() returns "Infinity"
      expect(formatDecimal(Infinity)).toBe('Infinity')
      expect(formatDecimal(-Infinity)).toBe('-Infinity')
    })

    it('should return integer string for whole numbers', () => {
      expect(formatDecimal(5, 2)).toBe('5')
      expect(formatDecimal(100, 2)).toBe('100')
    })

    it('should preserve significant decimals', () => {
      expect(formatDecimal(3.14159, 2)).toBe('3.14')
      expect(formatDecimal(3.15, 2)).toBe('3.15')
      // JavaScript's toFixed uses banker's rounding (round half to even)
      // 3.155.toFixed(2) = "3.15" (not "3.16" because 5 rounds to even)
      expect(formatDecimal(3.155, 2)).toBe('3.15')
      expect(formatDecimal(3.1551, 2)).toBe('3.16') // This should round up
    })
  })

  // ==========================================================================
  // FORMAT PERCENT
  // ==========================================================================

  describe('formatPercent', () => {
    it('should format percentage with sign', () => {
      expect(formatPercent(5.5, 2)).toBe('+5.5%')
      expect(formatPercent(-3.2, 2)).toBe('-3.2%')
    })

    it('should handle zero', () => {
      // formatPercent uses formatDecimal internally, which removes trailing zeros
      // So formatDecimal(0, 2) returns "0" (not "0.00")
      expect(formatPercent(0, 2)).toBe('+0%')
    })

    it('should handle NaN', () => {
      expect(formatPercent(NaN, 2)).toBe('N/A')
    })

    it('should use formatDecimal for precision handling', () => {
      expect(formatPercent(3.5999999999999996, 2)).toBe('+3.6%')
    })
  })

  // ==========================================================================
  // FORMAT MARKET CAP
  // ==========================================================================

  describe('formatMarketCap', () => {
    it('should format trillions', () => {
      expect(formatMarketCap(1.5e12)).toBe('1.5T')
      expect(formatMarketCap(2.0e12)).toBe('2T')
    })

    it('should format billions', () => {
      expect(formatMarketCap(1.5e9)).toBe('1.5B')
      // 500e6 = 500,000,000 which is < 1B (1 billion), so it formats as 500M (not 0.5B)
      expect(formatMarketCap(500e6)).toBe('500M')
    })

    it('should format millions', () => {
      expect(formatMarketCap(1.5e6)).toBe('1.5M')
      // 500e3 = 500,000 which is < 1M, so it formats with commas
      expect(formatMarketCap(500e3)).toBe('500,000')
    })

    it('should format small numbers with commas', () => {
      expect(formatMarketCap(999999)).toBe('999,999')
    })

    it('should handle NaN', () => {
      expect(formatMarketCap(NaN)).toBe('N/A')
    })

    it('should handle zero', () => {
      expect(formatMarketCap(0)).toBe('0')
    })
  })

  // ==========================================================================
  // FORMAT VOLUME
  // ==========================================================================

  describe('formatVolume', () => {
    it('should format millions', () => {
      expect(formatVolume(1.5e6)).toBe('1.5M')
      // 500e3 = 500,000 which is 500 thousand, so it formats as 500K (not 0.5M)
      expect(formatVolume(500e3)).toBe('500K')
    })

    it('should format thousands', () => {
      expect(formatVolume(1.5e3)).toBe('1.5K')
      expect(formatVolume(500)).toBe('500')
    })

    it('should handle NaN', () => {
      expect(formatVolume(NaN)).toBe('N/A')
    })

    it('should handle zero', () => {
      expect(formatVolume(0)).toBe('0')
    })
  })

  // ==========================================================================
  // FORMAT TIMESTAMP
  // ==========================================================================

  describe('formatTimestamp', () => {
    const now = Date.now()

    it('should format just now', () => {
      const timestamp = now - 10000 // 10 seconds ago
      expect(formatTimestamp(timestamp)).toBe('Just now')
    })

    it('should format minutes ago', () => {
      const timestamp = now - 5 * 60 * 1000 // 5 minutes ago
      expect(formatTimestamp(timestamp)).toBe('5m ago')
    })

    it('should format hours ago', () => {
      const timestamp = now - 3 * 60 * 60 * 1000 // 3 hours ago
      expect(formatTimestamp(timestamp)).toBe('3h ago')
    })

    it('should format days ago', () => {
      const timestamp = now - 5 * 24 * 60 * 60 * 1000 // 5 days ago
      expect(formatTimestamp(timestamp)).toBe('5d ago')
    })
  })

  // ==========================================================================
  // GET VALUE COLOR
  // ==========================================================================

  describe('getValueColor', () => {
    it('should return up for positive values', () => {
      expect(getValueColor(1)).toBe('up')
      expect(getValueColor(0.01)).toBe('up')
    })

    it('should return down for negative values', () => {
      expect(getValueColor(-1)).toBe('down')
      expect(getValueColor(-0.01)).toBe('down')
    })

    it('should return neutral for zero', () => {
      expect(getValueColor(0)).toBe('neutral')
    })
  })

  // ==========================================================================
  // GET VALUE ARROW
  // ==========================================================================

  describe('getValueArrow', () => {
    it('should return up arrow for positive values', () => {
      expect(getValueArrow(1)).toBe('▲')
      expect(getValueArrow(0.01)).toBe('▲')
    })

    it('should return down arrow for negative values', () => {
      expect(getValueArrow(-1)).toBe('▼')
      expect(getValueArrow(-0.01)).toBe('▼')
    })

    it('should return flat line for zero', () => {
      expect(getValueArrow(0)).toBe('▬')
    })
  })

  // ==========================================================================
  // FORMAT TRADING VALUE
  // ==========================================================================

  describe('formatTradingValue', () => {
    it('should format billions with Thai Baht symbol', () => {
      expect(formatTradingValue(1.5e9)).toBe('฿1.5B')
      // 500e6 = 500,000,000 which is 500 million, so it formats as ฿500M (not ฿0.5B)
      expect(formatTradingValue(500e6)).toBe('฿500M')
    })

    it('should format millions with Thai Baht symbol', () => {
      expect(formatTradingValue(1.5e6)).toBe('฿1.5M')
      // 500e3 = 500,000 which is 500 thousand, so it formats with commas
      expect(formatTradingValue(500e3)).toBe('฿500,000')
    })

    it('should format small numbers with Thai Baht symbol', () => {
      expect(formatTradingValue(999999)).toBe('฿999,999')
    })

    it('should handle NaN', () => {
      expect(formatTradingValue(NaN)).toBe('N/A')
    })

    it('should handle zero', () => {
      expect(formatTradingValue(0)).toBe('฿0')
    })
  })
})
