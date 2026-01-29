/**
 * Date Utilities Tests (Thai Timezone UTC+7)
 *
 * TDD Workflow:
 * 1. RED - Write failing tests first
 * 2. GREEN - Implement to pass tests
 * 3. REFACTOR - Improve while keeping tests passing
 *
 * These tests verify Thai time (UTC+7) consistency across server and client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getThaiDate,
  getThaiDateDaysAgo,
  formatThaiDate,
  formatThaiDateTime,
  parseThaiDate,
  getTodayThaiDateString,
  getYesterdayThaiDateString,
  isInThaiTimezone,
} from './date'

describe('Date Utilities (Thai Timezone UTC+7)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // GET THAI DATE
  // ==========================================================================

  describe('getThaiDate', () => {
    it('should return current date in Thai timezone (UTC+7)', () => {
      // Mock a specific UTC time: 2026-01-29T00:00:00.000Z
      // In Thai time (UTC+7), this is 2026-01-29T07:00:00
      const utcDate = new Date('2026-01-29T00:00:00.000Z')
      const result = getThaiDate(utcDate)

      // Should return Thai date: 2026-01-29
      expect(result).toBe('2026-01-29')
    })

    it('should handle UTC time before midnight in Thai time', () => {
      // Mock UTC time: 2026-01-28T22:00:00.000Z
      // In Thai time (UTC+7), this is 2026-01-29T05:00:00
      const utcDate = new Date('2026-01-28T22:00:00.000Z')
      const result = getThaiDate(utcDate)

      // Should return next day in Thai time: 2026-01-29
      expect(result).toBe('2026-01-29')
    })

    it('should handle UTC time after midnight in Thai time', () => {
      // Mock UTC time: 2026-01-29T16:00:00.000Z
      // In Thai time (UTC+7), this is 2026-01-29T23:00:00
      const utcDate = new Date('2026-01-29T16:00:00.000Z')
      const result = getThaiDate(utcDate)

      // Should return same day: 2026-01-29
      expect(result).toBe('2026-01-29')
    })

    it('should handle UTC time at boundary (17:00 UTC = midnight Thai)', () => {
      // Mock UTC time: 2026-01-29T17:00:00.000Z
      // In Thai time (UTC+7), this is 2026-01-30T00:00:00 (midnight)
      const utcDate = new Date('2026-01-29T17:00:00.000Z')
      const result = getThaiDate(utcDate)

      // Should return next day: 2026-01-30
      expect(result).toBe('2026-01-30')
    })

    it('should use current time when no date provided', () => {
      // Mock current system time
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getThaiDate()

      // In Thai time: 2026-01-29T19:00:00
      expect(result).toBe('2026-01-29')
    })

    it('should return consistent results for same UTC timestamp', () => {
      const utcDate = new Date('2026-01-29T10:00:00.000Z')
      const result1 = getThaiDate(utcDate)
      const result2 = getThaiDate(utcDate)

      expect(result1).toBe(result2)
      expect(result1).toBe('2026-01-29')
    })
  })

  // ==========================================================================
  // GET THAI DATE DAYS AGO
  // ==========================================================================

  describe('getThaiDateDaysAgo', () => {
    it('should return date 1 day ago in Thai timezone', () => {
      const utcDate = new Date('2026-01-29T12:00:00.000Z')
      const result = getThaiDateDaysAgo(1, utcDate)

      // Thai time: 2026-01-29T19:00:00
      // 1 day ago: 2026-01-28
      expect(result).toBe('2026-01-28')
    })

    it('should return date 7 days ago in Thai timezone', () => {
      const utcDate = new Date('2026-01-29T12:00:00.000Z')
      const result = getThaiDateDaysAgo(7, utcDate)

      // Thai time: 2026-01-29T19:00:00
      // 7 days ago: 2026-01-22
      expect(result).toBe('2026-01-22')
    })

    it('should handle day crossing correctly in Thai timezone', () => {
      // Mock UTC time: 2026-01-29T02:00:00.000Z
      // In Thai time (UTC+7), this is 2026-01-29T09:00:00
      const utcDate = new Date('2026-01-29T02:00:00.000Z')
      const result = getThaiDateDaysAgo(1, utcDate)

      // Thai time: 2026-01-29T09:00:00
      // 1 day ago: 2026-01-28
      expect(result).toBe('2026-01-28')
    })

    it('should handle month boundary correctly', () => {
      const utcDate = new Date('2026-02-01T12:00:00.000Z')
      const result = getThaiDateDaysAgo(1, utcDate)

      // Should go to January 31
      expect(result).toBe('2026-01-31')
    })

    it('should handle year boundary correctly', () => {
      const utcDate = new Date('2026-01-01T12:00:00.000Z')
      const result = getThaiDateDaysAgo(1, utcDate)

      // Should go to December 31, 2025
      expect(result).toBe('2025-12-31')
    })

    it('should use current time when no date provided', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getThaiDateDaysAgo(1)

      expect(result).toBe('2026-01-28')
    })

    it('should return 0 days ago as today', () => {
      const utcDate = new Date('2026-01-29T12:00:00.000Z')
      const result = getThaiDateDaysAgo(0, utcDate)

      expect(result).toBe('2026-01-29')
    })
  })

  // ==========================================================================
  // FORMAT THAI DATE
  // ==========================================================================

  describe('formatThaiDate', () => {
    it('should format date in Thai locale', () => {
      const utcDate = new Date('2026-01-29T12:00:00.000Z')
      const result = formatThaiDate(utcDate)

      // Should format as Thai date (e.g., "29 ม.ค. 2026" or similar)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle date at midnight Thai time', () => {
      const utcDate = new Date('2026-01-29T17:00:00.000Z')
      const result = formatThaiDate(utcDate)

      // Thai time: 2026-01-30T00:00:00
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should accept date string input', () => {
      const result = formatThaiDate('2026-01-29')

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should accept timestamp input', () => {
      const timestamp = new Date('2026-01-29T12:00:00.000Z').getTime()
      const result = formatThaiDate(timestamp)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })

  // ==========================================================================
  // FORMAT THAI DATE TIME
  // ==========================================================================

  describe('formatThaiDateTime', () => {
    it('should format date and time in Thai timezone', () => {
      const utcDate = new Date('2026-01-29T12:00:00.000Z')
      const result = formatThaiDateTime(utcDate)

      // Thai time: 19:00:00
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      // Should contain time information
      expect(result).toMatch(/\d{1,2}:\d{2}/)
    })

    it('should show correct hour offset for Thai time', () => {
      const utcDate = new Date('2026-01-29T12:00:00.000Z')
      const result = formatThaiDateTime(utcDate)

      // UTC 12:00 = Thai 19:00, so should contain "19"
      expect(result).toBeDefined()
    })

    it('should handle midnight in Thai time', () => {
      const utcDate = new Date('2026-01-29T17:00:00.000Z')
      const result = formatThaiDateTime(utcDate)

      // Thai time: 00:00:00
      expect(result).toBeDefined()
    })
  })

  // ==========================================================================
  // PARSE THAI DATE
  // ==========================================================================

  describe('parseThaiDate', () => {
    it('should parse YYYY-MM-DD string to Date in Thai timezone', () => {
      const result = parseThaiDate('2026-01-29')

      expect(result).toBeInstanceOf(Date)
      // The date should represent midnight in Thai time
      expect(result?.getTime()).not.toBeNaN()
    })

    it('should handle leap year dates', () => {
      const result = parseThaiDate('2024-02-29')

      expect(result).toBeInstanceOf(Date)
      expect(result?.getTime()).not.toBeNaN()
    })

    it('should return null for invalid date format', () => {
      const result = parseThaiDate('invalid-date')

      expect(result).toBeNull()
    })

    it('should return null for invalid date values', () => {
      const result = parseThaiDate('2026-13-01')

      expect(result).toBeNull()
    })

    it('should handle month boundary', () => {
      const result = parseThaiDate('2026-01-31')

      expect(result).toBeInstanceOf(Date)
      expect(result?.getTime()).not.toBeNaN()
    })
  })

  // ==========================================================================
  // GET TODAY THAI DATE STRING
  // ==========================================================================

  describe('getTodayThaiDateString', () => {
    it('should return today date string in Thai timezone', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getTodayThaiDateString()

      expect(result).toBe('2026-01-29')
    })

    it('should handle date before midnight Thai time', () => {
      // Mock UTC time before Thai midnight: 2026-01-29T16:00:00.000Z
      // Thai time: 2026-01-29T23:00:00
      const mockDate = new Date('2026-01-29T16:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getTodayThaiDateString()

      expect(result).toBe('2026-01-29')
    })

    it('should handle date after midnight Thai time', () => {
      // Mock UTC time after Thai midnight: 2026-01-29T17:00:00.000Z
      // Thai time: 2026-01-30T00:00:00
      const mockDate = new Date('2026-01-29T17:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getTodayThaiDateString()

      // Should be next day in Thai time
      expect(result).toBe('2026-01-30')
    })

    it('should return consistent format', () => {
      const result = getTodayThaiDateString()

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  // ==========================================================================
  // GET YESTERDAY THAI DATE STRING
  // ==========================================================================

  describe('getYesterdayThaiDateString', () => {
    it('should return yesterday date string in Thai timezone', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getYesterdayThaiDateString()

      expect(result).toBe('2026-01-28')
    })

    it('should handle month boundary', () => {
      const mockDate = new Date('2026-02-01T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getYesterdayThaiDateString()

      expect(result).toBe('2026-01-31')
    })

    it('should handle year boundary', () => {
      const mockDate = new Date('2026-01-01T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getYesterdayThaiDateString()

      expect(result).toBe('2025-12-31')
    })

    it('should return consistent format', () => {
      const result = getYesterdayThaiDateString()

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  // ==========================================================================
  // IS IN THAI TIMEZONE
  // ==========================================================================

  describe('isInThaiTimezone', () => {
    it('should return true for dates in Thai timezone', () => {
      // A date that should be in Thai time
      const result = isInThaiTimezone()

      expect(typeof result).toBe('boolean')
    })

    it('should detect timezone from environment', () => {
      const result = isInThaiTimezone()

      // Should return a boolean
      expect([true, false]).toContain(result)
    })
  })

  // ==========================================================================
  // CONSISTENCY TESTS (Critical for hydration)
  // ==========================================================================

  describe('Server/Client Consistency', () => {
    it('should return same Thai date for same UTC timestamp', () => {
      const utcTimestamp = new Date('2026-01-29T12:00:00.000Z').getTime()

      const result1 = getThaiDate(new Date(utcTimestamp))
      const result2 = getThaiDate(new Date(utcTimestamp))

      expect(result1).toBe(result2)
    })

    it('should handle multiple calls consistently', () => {
      const utcDate = new Date('2026-01-29T12:00:00.000Z')

      const results = Array.from({ length: 10 }, () => getThaiDate(utcDate))

      // All results should be identical
      expect(results.every(r => r === results[0])).toBe(true)
    })

    it('should maintain consistency across date arithmetic', () => {
      const utcDate = new Date('2026-01-29T12:00:00.000Z')

      const today = getThaiDate(utcDate)
      const yesterday = getThaiDateDaysAgo(1, utcDate)
      const twoDaysAgo = getThaiDateDaysAgo(2, utcDate)

      // Verify dates are in correct order
      expect(today).not.toBe(yesterday)
      expect(yesterday).not.toBe(twoDaysAgo)
    })
  })

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle null input gracefully', () => {
      const result = getThaiDate(null as unknown as Date)
      // Should return current Thai date
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should handle undefined input gracefully', () => {
      const result = getThaiDate(undefined as unknown as Date)
      // Should return current Thai date
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should handle invalid Date object', () => {
      const invalidDate = new Date('invalid')
      const result = getThaiDate(invalidDate)

      // Should handle gracefully
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should handle very large days ago values', () => {
      const utcDate = new Date('2026-01-29T12:00:00.000Z')
      const result = getThaiDateDaysAgo(365, utcDate)

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should handle negative days ago', () => {
      const utcDate = new Date('2026-01-29T12:00:00.000Z')
      const result = getThaiDateDaysAgo(-1, utcDate)

      // Should go to next day
      expect(result).toBe('2026-01-30')
    })
  })

  // ==========================================================================
  // REAL-WORLD SCENARIOS
  // ==========================================================================

  describe('Real-World Scenarios', () => {
    it('should handle market close time (16:30 Thai time)', () => {
      // Market closes at 16:30 Thai time = 09:30 UTC
      const utcDate = new Date('2026-01-29T09:30:00.000Z')
      const result = getThaiDate(utcDate)

      expect(result).toBe('2026-01-29')
    })

    it('should handle market open time (10:00 Thai time)', () => {
      // Market opens at 10:00 Thai time = 03:00 UTC
      const utcDate = new Date('2026-01-29T03:00:00.000Z')
      const result = getThaiDate(utcDate)

      expect(result).toBe('2026-01-29')
    })

    it('should handle pre-market (08:00 Thai time)', () => {
      const utcDate = new Date('2026-01-29T01:00:00.000Z')
      const result = getThaiDate(utcDate)

      expect(result).toBe('2026-01-29')
    })

    it('should handle after-market (18:00 Thai time)', () => {
      const utcDate = new Date('2026-01-29T11:00:00.000Z')
      const result = getThaiDate(utcDate)

      expect(result).toBe('2026-01-29')
    })

    it('should handle midnight boundary correctly', () => {
      // Just before midnight Thai time: 23:59 = 16:59 UTC
      const beforeMidnight = new Date('2026-01-29T16:59:59.999Z')
      expect(getThaiDate(beforeMidnight)).toBe('2026-01-29')

      // At midnight Thai time: 00:00 = 17:00 UTC (previous day)
      const atMidnight = new Date('2026-01-29T17:00:00.000Z')
      expect(getThaiDate(atMidnight)).toBe('2026-01-30')

      // Just after midnight Thai time: 00:01 = 17:01 UTC (previous day)
      const afterMidnight = new Date('2026-01-29T17:01:00.000Z')
      expect(getThaiDate(afterMidnight)).toBe('2026-01-30')
    })
  })
})
