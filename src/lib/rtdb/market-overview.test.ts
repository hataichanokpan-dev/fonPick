/**
 * Market Overview Tests
 *
 * Unit tests for market overview data fetching and validation.
 * Tests validateMarketOverviewData, fetchMarketOverview, etc.
 *
 * Tests for Homepage Issues:
 * - Issue #1: Mkt Cap validation
 * - Issues #2, #6: Volume validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  fetchMarketOverviewByDate,
  fetchMarketOverview,
  fetchSetIndex,
  fetchTotalMarketValue,
  fetchTotalVolume,
  fetchAdvanceDecline,
  isMarketOverviewFresh,
  getMarketStatus,
  getMarketColor,
} from './market-overview'
import type { RTDBMarketOverviewEntry } from '@/types/rtdb'

// Mock the fetchWithFallback function
vi.mock('./client', () => ({
  fetchWithFallback: vi.fn(),
}))

import { fetchWithFallback } from './client'

describe('Market Overview', () => {
  // ==========================================================================
  // VALIDATION TESTS (Homepage Issues #1, #2, #6)
  // ==========================================================================

  describe('Data Validation (via fetchMarketOverview)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should handle missing totalValue gracefully (Issue #1)', async () => {
      const mockData: RTDBMarketOverviewEntry = {
        data: {
          setIndex: 1250.5,
          setIndexChg: 10.5,
          setIndexChgPct: 0.85,
          totalValue: 0, // Missing/zero market cap
          totalVolume: 45000,
          advanceCount: 150,
          declineCount: 100,
          unchangedCount: 50,
          newHighCount: 20,
          newLowCount: 5,
        },
        meta: {
          capturedAt: new Date().toISOString(),
          schemaVersion: 1,
          source: 'settrade',
        },
      }

      vi.mocked(fetchWithFallback).mockResolvedValue(mockData)

      const result = await fetchMarketOverview()

      expect(result).toBeDefined()
      expect(result?.totalValue).toBe(0) // Should be set to 0, not undefined
      expect(result?.totalMarketCap).toBe(0)
    })

    it('should handle missing totalVolume gracefully (Issues #2, #6)', async () => {
      const mockData: RTDBMarketOverviewEntry = {
        data: {
          setIndex: 1250.5,
          setIndexChg: 10.5,
          setIndexChgPct: 0.85,
          totalValue: 15000000,
          totalVolume: 0, // Missing/zero volume
          advanceCount: 150,
          declineCount: 100,
          unchangedCount: 50,
          newHighCount: 20,
          newLowCount: 5,
        },
        meta: {
          capturedAt: new Date().toISOString(),
          schemaVersion: 1,
          source: 'settrade',
        },
      }

      vi.mocked(fetchWithFallback).mockResolvedValue(mockData)

      const result = await fetchMarketOverview()

      expect(result).toBeDefined()
      // Should use fallback value (60M = SET average daily volume in thousands)
      expect(result?.totalVolume).toBe(60000000)
    })

    it('should handle NaN values in numeric fields', async () => {
      const mockData: RTDBMarketOverviewEntry = {
        data: {
          setIndex: NaN,
          setIndexChg: NaN,
          setIndexChgPct: NaN,
          totalValue: NaN as unknown as number,
          totalVolume: NaN as unknown as number,
          advanceCount: NaN as unknown as number,
          declineCount: NaN as unknown as number,
          unchangedCount: NaN as unknown as number,
          newHighCount: NaN as unknown as number,
          newLowCount: NaN as unknown as number,
        },
        meta: {
          capturedAt: new Date().toISOString(),
          schemaVersion: 1,
          source: 'settrade',
        },
      }

      vi.mocked(fetchWithFallback).mockResolvedValue(mockData)

      const result = await fetchMarketOverview()

      expect(result).toBeDefined()
      expect(result?.set.index).toBe(0) // NaN converted to 0
      expect(result?.set.change).toBe(0)
      expect(result?.set.changePercent).toBe(0)
      expect(result?.totalValue).toBe(0)
      // NaN totalVolume uses fallback value
      expect(result?.totalVolume).toBe(60000000)
      expect(result?.advanceCount).toBe(0)
      expect(result?.declineCount).toBe(0)
    })

    it('should handle valid data correctly', async () => {
      const mockData: RTDBMarketOverviewEntry = {
        data: {
          setIndex: 1250.5,
          setIndexChg: 10.5,
          setIndexChgPct: 0.85,
          totalValue: 15000000,
          totalVolume: 45000,
          advanceCount: 150,
          declineCount: 100,
          unchangedCount: 50,
          newHighCount: 20,
          newLowCount: 5,
        },
        meta: {
          capturedAt: new Date().toISOString(),
          schemaVersion: 1,
          source: 'settrade',
        },
      }

      vi.mocked(fetchWithFallback).mockResolvedValue(mockData)

      const result = await fetchMarketOverview()

      expect(result).toBeDefined()
      expect(result?.set.index).toBe(1250.5)
      expect(result?.set.change).toBe(10.5)
      expect(result?.set.changePercent).toBe(0.85)
      expect(result?.totalValue).toBe(15000000)
      expect(result?.totalVolume).toBe(45000)
      expect(result?.advanceCount).toBe(150)
      expect(result?.declineCount).toBe(100)
    })

    it('should handle null when data is unavailable', async () => {
      vi.mocked(fetchWithFallback).mockResolvedValue(null)

      const result = await fetchMarketOverview()

      expect(result).toBeNull()
    })
  })

  // ==========================================================================
  // FETCH MARKET OVERVIEW BY DATE
  // ==========================================================================

  describe('fetchMarketOverviewByDate', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should fetch data for specific date', async () => {
      const mockData: RTDBMarketOverviewEntry = {
        data: {
          setIndex: 1250.5,
          setIndexChg: 10.5,
          setIndexChgPct: 0.85,
          totalValue: 15000000,
          totalVolume: 45000,
          advanceCount: 150,
          declineCount: 100,
          unchangedCount: 50,
          newHighCount: 20,
          newLowCount: 5,
        },
        meta: {
          capturedAt: '2024-01-15T09:00:00.000Z',
          schemaVersion: 1,
          source: 'settrade',
        },
      }

      vi.mocked(fetchWithFallback).mockResolvedValue(mockData)

      const result = await fetchMarketOverviewByDate('2024-01-15')

      expect(result).toBeDefined()
      expect(result?.set.index).toBe(1250.5)
      // Note: The actual implementation may not call with exact these paths
      // Just verify the result is correct
    })
  })

  // ==========================================================================
  // FETCH SET INDEX
  // ==========================================================================

  describe('fetchSetIndex', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return SET index data', async () => {
      const mockData: RTDBMarketOverviewEntry = {
        data: {
          setIndex: 1250.5,
          setIndexChg: 10.5,
          setIndexChgPct: 0.85,
          totalValue: 15000000,
          totalVolume: 45000,
          advanceCount: 150,
          declineCount: 100,
          unchangedCount: 50,
          newHighCount: 20,
          newLowCount: 5,
        },
        meta: {
          capturedAt: new Date().toISOString(),
          schemaVersion: 1,
          source: 'settrade',
        },
      }

      vi.mocked(fetchWithFallback).mockResolvedValue(mockData)

      const result = await fetchSetIndex()

      expect(result).toEqual({
        index: 1250.5,
        change: 10.5,
        changePercent: 0.85,
      })
    })

    it('should return null when data unavailable', async () => {
      vi.mocked(fetchWithFallback).mockResolvedValue(null)

      const result = await fetchSetIndex()

      expect(result).toBeNull()
    })
  })

  // ==========================================================================
  // FETCH TOTAL MARKET VALUE
  // ==========================================================================

  describe('fetchTotalMarketValue', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return total market value', async () => {
      const mockData: RTDBMarketOverviewEntry = {
        data: {
          setIndex: 1250.5,
          setIndexChg: 10.5,
          setIndexChgPct: 0.85,
          totalValue: 15000000,
          totalVolume: 45000,
          advanceCount: 150,
          declineCount: 100,
          unchangedCount: 50,
          newHighCount: 20,
          newLowCount: 5,
        },
        meta: {
          capturedAt: new Date().toISOString(),
          schemaVersion: 1,
          source: 'settrade',
        },
      }

      vi.mocked(fetchWithFallback).mockResolvedValue(mockData)

      const result = await fetchTotalMarketValue()

      expect(result).toBe(15000000)
    })

    it('should return null when data unavailable', async () => {
      vi.mocked(fetchWithFallback).mockResolvedValue(null)

      const result = await fetchTotalMarketValue()

      expect(result).toBeNull()
    })
  })

  // ==========================================================================
  // FETCH TOTAL VOLUME
  // ==========================================================================

  describe('fetchTotalVolume', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return total volume', async () => {
      const mockData: RTDBMarketOverviewEntry = {
        data: {
          setIndex: 1250.5,
          setIndexChg: 10.5,
          setIndexChgPct: 0.85,
          totalValue: 15000000,
          totalVolume: 45000,
          advanceCount: 150,
          declineCount: 100,
          unchangedCount: 50,
          newHighCount: 20,
          newLowCount: 5,
        },
        meta: {
          capturedAt: new Date().toISOString(),
          schemaVersion: 1,
          source: 'settrade',
        },
      }

      vi.mocked(fetchWithFallback).mockResolvedValue(mockData)

      const result = await fetchTotalVolume()

      expect(result).toBe(45000)
    })

    it('should return null when data unavailable', async () => {
      vi.mocked(fetchWithFallback).mockResolvedValue(null)

      const result = await fetchTotalVolume()

      expect(result).toBeNull()
    })
  })

  // ==========================================================================
  // FETCH ADVANCE/DECLINE
  // ==========================================================================

  describe('fetchAdvanceDecline', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return advance/decline data', async () => {
      const mockData: RTDBMarketOverviewEntry = {
        data: {
          setIndex: 1250.5,
          setIndexChg: 10.5,
          setIndexChgPct: 0.85,
          totalValue: 15000000,
          totalVolume: 45000,
          advanceCount: 150,
          declineCount: 100,
          unchangedCount: 50,
          newHighCount: 20,
          newLowCount: 5,
        },
        meta: {
          capturedAt: new Date().toISOString(),
          schemaVersion: 1,
          source: 'settrade',
        },
      }

      vi.mocked(fetchWithFallback).mockResolvedValue(mockData)

      const result = await fetchAdvanceDecline()

      expect(result).toEqual({
        advance: 150,
        decline: 100,
        unchanged: 50,
      })
    })

    it('should return null when data unavailable', async () => {
      vi.mocked(fetchWithFallback).mockResolvedValue(null)

      const result = await fetchAdvanceDecline()

      expect(result).toBeNull()
    })
  })

  // ==========================================================================
  // MARKET OVERVIEW FRESHNESS
  // ==========================================================================

  describe('isMarketOverviewFresh', () => {
    it('should return true for fresh data', () => {
      const now = Date.now()
      const overview = {
        set: { index: 1250.5, change: 10.5, changePercent: 0.85 },
        totalMarketCap: 15000000,
        totalValue: 15000000,
        totalVolume: 45000,
        advanceCount: 150,
        declineCount: 100,
        unchangedCount: 50,
        newHighCount: 20,
        newLowCount: 5,
        timestamp: now - 30 * 60 * 1000, // 30 minutes ago
      }

      const result = isMarketOverviewFresh(overview, 60 * 60 * 1000) // 1 hour max age

      expect(result).toBe(true)
    })

    it('should return false for stale data', () => {
      const now = Date.now()
      const overview = {
        set: { index: 1250.5, change: 10.5, changePercent: 0.85 },
        totalMarketCap: 15000000,
        totalValue: 15000000,
        totalVolume: 45000,
        advanceCount: 150,
        declineCount: 100,
        unchangedCount: 50,
        newHighCount: 20,
        newLowCount: 5,
        timestamp: now - 2 * 60 * 60 * 1000, // 2 hours ago
      }

      const result = isMarketOverviewFresh(overview, 60 * 60 * 1000) // 1 hour max age

      expect(result).toBe(false)
    })

    it('should return false for null data', () => {
      const result = isMarketOverviewFresh(null)

      expect(result).toBe(false)
    })
  })

  // ==========================================================================
  // MARKET STATUS
  // ==========================================================================

  describe('getMarketStatus', () => {
    it('should return Strong bullish for >1% gain', () => {
      const overview = {
        set: { index: 1250.5, change: 15, changePercent: 1.2 },
        totalMarketCap: 15000000,
        totalValue: 15000000,
        totalVolume: 45000,
        advanceCount: 150,
        declineCount: 100,
        unchangedCount: 50,
        newHighCount: 20,
        newLowCount: 5,
        timestamp: Date.now(),
      }

      expect(getMarketStatus(overview)).toBe('Strong bullish')
    })

    it('should return Bullish for >0% gain', () => {
      const overview = {
        set: { index: 1250.5, change: 5, changePercent: 0.4 },
        totalMarketCap: 15000000,
        totalValue: 15000000,
        totalVolume: 45000,
        advanceCount: 150,
        declineCount: 100,
        unchangedCount: 50,
        newHighCount: 20,
        newLowCount: 5,
        timestamp: Date.now(),
      }

      expect(getMarketStatus(overview)).toBe('Bullish')
    })

    it('should return Bearish for <-1% loss', () => {
      const overview = {
        set: { index: 1250.5, change: -15, changePercent: -1.2 },
        totalMarketCap: 15000000,
        totalValue: 15000000,
        totalVolume: 45000,
        advanceCount: 100,
        declineCount: 150,
        unchangedCount: 50,
        newHighCount: 5,
        newLowCount: 20,
        timestamp: Date.now(),
      }

      expect(getMarketStatus(overview)).toBe('Bearish')
    })

    it('should return Weak bearish for <0% loss', () => {
      const overview = {
        set: { index: 1250.5, change: -5, changePercent: -0.4 },
        totalMarketCap: 15000000,
        totalValue: 15000000,
        totalVolume: 45000,
        advanceCount: 100,
        declineCount: 150,
        unchangedCount: 50,
        newHighCount: 5,
        newLowCount: 20,
        timestamp: Date.now(),
      }

      expect(getMarketStatus(overview)).toBe('Weak bearish')
    })

    it('should return Flat for no change', () => {
      const overview = {
        set: { index: 1250.5, change: 0, changePercent: 0 },
        totalMarketCap: 15000000,
        totalValue: 15000000,
        totalVolume: 45000,
        advanceCount: 100,
        declineCount: 100,
        unchangedCount: 150,
        newHighCount: 10,
        newLowCount: 10,
        timestamp: Date.now(),
      }

      expect(getMarketStatus(overview)).toBe('Flat')
    })

    it('should return Data unavailable for null', () => {
      expect(getMarketStatus(null)).toBe('Data unavailable')
    })
  })

  // ==========================================================================
  // MARKET COLOR
  // ==========================================================================

  describe('getMarketColor', () => {
    it('should return green for positive change', () => {
      const overview = {
        set: { index: 1250.5, change: 10, changePercent: 0.8 },
        totalMarketCap: 15000000,
        totalValue: 15000000,
        totalVolume: 45000,
        advanceCount: 150,
        declineCount: 100,
        unchangedCount: 50,
        newHighCount: 20,
        newLowCount: 5,
        timestamp: Date.now(),
      }

      expect(getMarketColor(overview)).toBe('green')
    })

    it('should return red for negative change', () => {
      const overview = {
        set: { index: 1250.5, change: -10, changePercent: -0.8 },
        totalMarketCap: 15000000,
        totalValue: 15000000,
        totalVolume: 45000,
        advanceCount: 100,
        declineCount: 150,
        unchangedCount: 50,
        newHighCount: 5,
        newLowCount: 20,
        timestamp: Date.now(),
      }

      expect(getMarketColor(overview)).toBe('red')
    })

    it('should return green for zero change', () => {
      const overview = {
        set: { index: 1250.5, change: 0, changePercent: 0 },
        totalMarketCap: 15000000,
        totalValue: 15000000,
        totalVolume: 45000,
        advanceCount: 100,
        declineCount: 100,
        unchangedCount: 150,
        newHighCount: 10,
        newLowCount: 10,
        timestamp: Date.now(),
      }

      expect(getMarketColor(overview)).toBe('green')
    })

    it('should return gray for null', () => {
      expect(getMarketColor(null)).toBe('gray')
    })
  })
})
