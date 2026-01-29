/**
 * RTDB Paths Tests (Thai Timezone UTC+7)
 *
 * TDD Workflow:
 * 1. RED - Write failing tests first
 * 2. GREEN - Implement to pass tests
 * 3. REFACTOR - Improve while keeping tests passing
 *
 * These tests verify that RTDB paths use Thai timezone consistently
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getTodayDate,
  getDateDaysAgo,
  RTDB_PATHS,
  getStockPath,
  getFallbackPath,
} from './paths'

describe('RTDB Paths (Thai Timezone)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // GET TODAY DATE (Thai Timezone)
  // ==========================================================================

  describe('getTodayDate', () => {
    it('should return today date in Thai timezone', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getTodayDate()

      // In Thai time: 2026-01-29T19:00:00
      expect(result).toBe('2026-01-29')
    })

    it('should handle date before midnight Thai time', () => {
      // Mock UTC time before Thai midnight: 2026-01-29T16:00:00.000Z
      // Thai time: 2026-01-29T23:00:00
      const mockDate = new Date('2026-01-29T16:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getTodayDate()

      expect(result).toBe('2026-01-29')
    })

    it('should handle date after midnight Thai time', () => {
      // Mock UTC time after Thai midnight: 2026-01-29T17:00:00.000Z
      // Thai time: 2026-01-30T00:00:00
      const mockDate = new Date('2026-01-29T17:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getTodayDate()

      // Should be next day in Thai time
      expect(result).toBe('2026-01-30')
    })

    it('should return consistent format', () => {
      const result = getTodayDate()

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should not use UTC toISOString (which causes wrong day)', () => {
      const mockDate = new Date('2026-01-29T22:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getTodayDate()

      // Using toISOString().split('T')[0] would return '2026-01-29' (UTC date)
      // But in Thai time (UTC+7), it's already 2026-01-30T05:00:00
      // So we should get '2026-01-30'
      expect(result).toBe('2026-01-30')
      expect(result).not.toBe('2026-01-29')
    })
  })

  // ==========================================================================
  // GET DATE DAYS AGO (Thai Timezone)
  // ==========================================================================

  describe('getDateDaysAgo', () => {
    it('should return yesterday date in Thai timezone', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getDateDaysAgo(1)

      // Thai time: 2026-01-29T19:00:00
      // 1 day ago: 2026-01-28
      expect(result).toBe('2026-01-28')
    })

    it('should return 7 days ago date in Thai timezone', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getDateDaysAgo(7)

      // Thai time: 2026-01-29T19:00:00
      // 7 days ago: 2026-01-22
      expect(result).toBe('2026-01-22')
    })

    it('should handle month boundary correctly', () => {
      const mockDate = new Date('2026-02-01T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getDateDaysAgo(1)

      // Should go to January 31
      expect(result).toBe('2026-01-31')
    })

    it('should handle year boundary correctly', () => {
      const mockDate = new Date('2026-01-01T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getDateDaysAgo(1)

      // Should go to December 31, 2025
      expect(result).toBe('2025-12-31')
    })

    it('should return consistent format', () => {
      const result = getDateDaysAgo(1)

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  // ==========================================================================
  // RTDB PATHS CONSTANTS
  // ==========================================================================

  describe('RTDB_PATHS', () => {
    it('should have MARKET_OVERVIEW_LATEST with today Thai date', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = RTDB_PATHS.MARKET_OVERVIEW_LATEST

      expect(result).toContain('/settrade/marketOverview/byDate/')
      expect(result).toContain('2026-01-29')
    })

    it('should have MARKET_OVERVIEW_PREVIOUS with yesterday Thai date', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = RTDB_PATHS.MARKET_OVERVIEW_PREVIOUS

      expect(result).toContain('/settrade/marketOverview/byDate/')
      expect(result).toContain('2026-01-28')
    })

    it('should have INVESTOR_TYPE_LATEST with today Thai date', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = RTDB_PATHS.INVESTOR_TYPE_LATEST

      expect(result).toContain('/settrade/investorType/byDate/')
      expect(result).toContain('2026-01-29')
    })

    it('should have INVESTOR_TYPE_PREVIOUS with yesterday Thai date', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = RTDB_PATHS.INVESTOR_TYPE_PREVIOUS

      expect(result).toContain('/settrade/investorType/byDate/')
      expect(result).toContain('2026-01-28')
    })

    it('should have INDUSTRY_SECTOR_LATEST with today Thai date', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = RTDB_PATHS.INDUSTRY_SECTOR_LATEST

      expect(result).toContain('/settrade/industrySector/byDate/')
      expect(result).toContain('2026-01-29')
    })

    it('should have NVDR_LATEST with today Thai date', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = RTDB_PATHS.NVDR_LATEST

      expect(result).toContain('/settrade/nvdr/byDate/')
      expect(result).toContain('2026-01-29')
    })

    it('should have RANKINGS_LATEST with today Thai date', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = RTDB_PATHS.RANKINGS_LATEST

      expect(result).toContain('/settrade/topRankings/byDate/')
      expect(result).toContain('2026-01-29')
    })

    it('should have SET_INDEX_LATEST with today Thai date', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = RTDB_PATHS.SET_INDEX_LATEST

      expect(result).toContain('/settrade/setIndex/byDate/')
      expect(result).toContain('2026-01-29')
    })
  })

  // ==========================================================================
  // GET STOCK PATH
  // ==========================================================================

  describe('getStockPath', () => {
    it('should return valid stock path for symbol', () => {
      const result = getStockPath('PTT')

      expect(result).toBe('/settrade/stocks/PTT')
    })

    it('should uppercase symbol', () => {
      const result = getStockPath('ptt')

      expect(result).toBe('/settrade/stocks/PTT')
    })

    it('should trim whitespace', () => {
      const result = getStockPath('  PTT  ')

      expect(result).toBe('/settrade/stocks/PTT')
    })

    it('should throw error for empty symbol', () => {
      expect(() => getStockPath('')).toThrow('Stock symbol cannot be empty')
      expect(() => getStockPath('   ')).toThrow('Stock symbol cannot be empty')
    })

    it('should throw error for null/undefined', () => {
      expect(() => getStockPath(null as unknown as string)).toThrow()
      expect(() => getStockPath(undefined as unknown as string)).toThrow()
    })
  })

  // ==========================================================================
  // GET FALLBACK PATH
  // ==========================================================================

  describe('getFallbackPath', () => {
    it('should return yesterday path for today path', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const todayPath = '/settrade/marketOverview/byDate/2026-01-29'
      const result = getFallbackPath(todayPath)

      expect(result).toBe('/settrade/marketOverview/byDate/2026-01-28')
    })

    it('should return undefined for path without date', () => {
      const result = getFallbackPath('/settrade/marketOverview')

      expect(result).toBeUndefined()
    })

    it('should handle /latest paths', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const latestPath = '/settrade/marketOverview/latest'
      const result = getFallbackPath(latestPath)

      expect(result).toBe('/settrade/marketOverview/byDate/2026-01-28')
    })

    it('should return undefined for paths that do not match', () => {
      const result = getFallbackPath('/some/other/path')

      expect(result).toBeUndefined()
    })
  })

  // ==========================================================================
  // CONSISTENCY TESTS
  // ==========================================================================

  describe('Server/Client Consistency', () => {
    it('should return same date for multiple calls', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result1 = getTodayDate()
      const result2 = getTodayDate()
      const result3 = getTodayDate()

      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
    })

    it('should have consistent latest and previous paths', () => {
      const mockDate = new Date('2026-01-29T12:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const latest = RTDB_PATHS.MARKET_OVERVIEW_LATEST
      const previous = RTDB_PATHS.MARKET_OVERVIEW_PREVIOUS

      expect(latest).toContain('2026-01-29')
      expect(previous).toContain('2026-01-28')
    })
  })

  // ==========================================================================
  // REAL-WORLD SCENARIOS
  // ==========================================================================

  describe('Real-World Scenarios', () => {
    it('should handle market close time (16:30 Thai time)', () => {
      // Market closes at 16:30 Thai time = 09:30 UTC
      const mockDate = new Date('2026-01-29T09:30:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getTodayDate()

      expect(result).toBe('2026-01-29')
    })

    it('should handle market open time (10:00 Thai time)', () => {
      // Market opens at 10:00 Thai time = 03:00 UTC
      const mockDate = new Date('2026-01-29T03:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getTodayDate()

      expect(result).toBe('2026-01-29')
    })

    it('should handle after-market data fetch (18:00 Thai time)', () => {
      // After-market: 18:00 Thai time = 11:00 UTC
      const mockDate = new Date('2026-01-29T11:00:00.000Z')
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const today = getTodayDate()
      const yesterday = getDateDaysAgo(1)

      expect(today).toBe('2026-01-29')
      expect(yesterday).toBe('2026-01-28')
    })

    it('should handle Vercel deployment (UTC server)', () => {
      // Vercel uses UTC, so we need to ensure Thai time is used
      // Mock a time where UTC and Thai time are on different days
      const mockDate = new Date('2026-01-29T22:00:00.000Z') // 22:00 UTC
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

      const result = getTodayDate()

      // In Thai time (UTC+7), this is 2026-01-30T05:00:00
      // So we should get '2026-01-30', not '2026-01-29'
      expect(result).toBe('2026-01-30')
    })
  })
})
