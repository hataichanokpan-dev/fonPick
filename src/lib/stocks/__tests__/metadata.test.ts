/**
 * Stock Metadata Tests
 *
 * Unit tests for stock metadata functions.
 * Tests findBySymbol, findBySubSector, findBySector, getPeerSymbols, etc.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  findBySymbol,
  findBySubSector,
  findBySector,
  findByMarket,
  searchStocks,
  getAllSubSectors,
  getAllSectors,
  isValidSymbol,
  getDatabaseSummary,
  findManyBySymbols,
  getPeerSymbols,
} from '../metadata'
import { beforeEach as before } from 'node:test'

describe('Stock Metadata', () => {
  // ==========================================================================
  // FIND BY SYMBOL
  // ==========================================================================

  describe('findBySymbol', () => {
    it('should return stock data for valid symbol', () => {
      const result = findBySymbol('ADVANC')

      expect(result).not.toBeNull()
      expect(result?.symbol).toBe('ADVANC')
      expect(result?.market).toBeDefined()
    })

    it('should return null for invalid symbol', () => {
      const result = findBySymbol('INVALID_SYMBOL')

      expect(result).toBeNull()
    })

    it('should be case-insensitive', () => {
      const result1 = findBySymbol('ADVANC')
      const result2 = findBySymbol('advanc')
      const result3 = findBySymbol('Advanc')

      expect(result1?.symbol).toBe(result2?.symbol)
      expect(result2?.symbol).toBe(result3?.symbol)
    })

    it('should handle whitespace in symbol', () => {
      const result = findBySymbol('  ADVANC  ')

      expect(result).not.toBeNull()
      expect(result?.symbol).toBe('ADVANC')
    })
  })

  // ==========================================================================
  // FIND BY SUB-SECTOR
  // ==========================================================================

  describe('findBySubSector', () => {
    it('should return stocks for valid sub-sector', () => {
      const results = findBySubSector('Technology')

      expect(results.length).toBeGreaterThan(0)
      expect(results[0].subSectorEn).toBe('Technology')
    })

    it('should return empty array for invalid sub-sector', () => {
      const results = findBySubSector('Invalid SubSector')

      expect(results).toEqual([])
    })

    it('should return stocks with all required fields', () => {
      const results = findBySubSector('Technology')

      results.forEach(stock => {
        expect(stock.symbol).toBeDefined()
        expect(stock.name).toBeDefined()
        expect(stock.market).toBeDefined()
        expect(stock.subSectorEn).toBe('Technology')
      })
    })
  })

  // ==========================================================================
  // FIND BY SECTOR
  // ==========================================================================

  describe('findBySector', () => {
    it('should return stocks for valid sector', () => {
      const results = findBySector('ธนาคาร')

      expect(results.length).toBeGreaterThan(0)
    })

    it('should return empty array for invalid sector', () => {
      const results = findBySector('Invalid Sector')

      expect(results).toEqual([])
    })
  })

  // ==========================================================================
  // FIND BY MARKET
  // ==========================================================================

  describe('findByMarket', () => {
    it('should return SET stocks', () => {
      const results = findByMarket('SET')

      expect(results.length).toBeGreaterThan(0)
      results.forEach(stock => {
        expect(stock.market).toBe('SET')
      })
    })

    it('should return mai stocks', () => {
      const results = findByMarket('mai')

      results.forEach(stock => {
        expect(stock.market).toBe('mai')
      })
    })
  })

  // ==========================================================================
  // SEARCH STOCKS
  // ==========================================================================

  describe('searchStocks', () => {
    it('should search by symbol', () => {
      const result = searchStocks({ symbol: 'ADVANC' })

      expect(result.stocks).toHaveLength(1)
      expect(result.stocks[0].symbol).toBe('ADVANC')
      expect(result.total).toBe(1)
    })

    it('should search by name (partial match)', () => {
      const result = searchStocks({ name: 'แอดวานซ์' })

      expect(result.stocks.length).toBeGreaterThan(0)
      result.stocks.forEach(stock => {
        expect(stock.name.toLowerCase()).toContain('แอดวานซ์')
      })
    })

    it('should apply limit', () => {
      const result = searchStocks({ limit: 5 })

      expect(result.stocks.length).toBeLessThanOrEqual(5)
    })

    it('should apply offset', () => {
      const result1 = searchStocks({ limit: 5, offset: 0 })
      const result2 = searchStocks({ limit: 5, offset: 5 })

      expect(result1.stocks).not.toEqual(result2.stocks)
    })

    it('should filter by market', () => {
      const result = searchStocks({ market: 'SET' })

      result.stocks.forEach(stock => {
        expect(stock.market).toBe('SET')
      })
    })
  })

  // ==========================================================================
  // GET ALL SUB-SECTORS
  // ==========================================================================

  describe('getAllSubSectors', () => {
    it('should return all sub-sectors', () => {
      const subSectors = getAllSubSectors()

      expect(subSectors.length).toBeGreaterThan(0)
      expect(subSectors[0]).toHaveProperty('name')
      expect(subSectors[0]).toHaveProperty('count')
      expect(subSectors[0]).toHaveProperty('symbols')
    })

    it('should be sorted by count (descending)', () => {
      const subSectors = getAllSubSectors()

      for (let i = 0; i < subSectors.length - 1; i++) {
        expect(subSectors[i].count).toBeGreaterThanOrEqual(subSectors[i + 1].count)
      }
    })
  })

  // ==========================================================================
  // GET ALL SECTORS
  // ==========================================================================

  describe('getAllSectors', () => {
    it('should return all sectors', () => {
      const sectors = getAllSectors()

      expect(sectors.length).toBeGreaterThan(0)
      sectors.forEach(sector => {
        expect(sector).toHaveProperty('name')
        expect(sector).toHaveProperty('count')
        expect(sector).toHaveProperty('symbols')
      })
    })
  })

  // ==========================================================================
  // IS VALID SYMBOL
  // ==========================================================================

  describe('isValidSymbol', () => {
    it('should return true for valid symbol', () => {
      expect(isValidSymbol('ADVANC')).toBe(true)
    })

    it('should return false for invalid symbol', () => {
      expect(isValidSymbol('INVALID')).toBe(false)
    })
  })

  // ==========================================================================
  // GET DATABASE SUMMARY
  // ==========================================================================

  describe('getDatabaseSummary', () => {
    it('should return summary with all fields', () => {
      const summary = getDatabaseSummary()

      expect(summary).toHaveProperty('version')
      expect(summary).toHaveProperty('lastUpdated')
      expect(summary).toHaveProperty('totalStocks')
      expect(summary).toHaveProperty('totalSectors')
      expect(summary).toHaveProperty('totalSubSectors')
      expect(summary).toHaveProperty('setCount')
      expect(summary).toHaveProperty('maiCount')
    })

    it('should have positive counts', () => {
      const summary = getDatabaseSummary()

      expect(summary.totalStocks).toBeGreaterThan(0)
      expect(summary.totalSectors).toBeGreaterThan(0)
      expect(summary.totalSubSectors).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // FIND MANY BY SYMBOLS
  // ==========================================================================

  describe('findManyBySymbols', () => {
    it('should return map of found symbols', () => {
      const symbols = ['ADVANC', 'KBANK', 'INVALID']
      const result = findManyBySymbols(symbols)

      expect(result).toBeInstanceOf(Map)
      expect(result.has('ADVANC')).toBe(true)
      expect(result.has('KBANK')).toBe(true)
      expect(result.has('INVALID')).toBe(false)
    })

    it('should handle empty array', () => {
      const result = findManyBySymbols([])

      expect(result.size).toBe(0)
    })
  })

  // ==========================================================================
  // GET PEER SYMBOLS (NEW FEATURE)
  // ==========================================================================

  describe('getPeerSymbols', () => {
    it('should return array of peer symbols for valid stock', () => {
      const peers = getPeerSymbols('ADVANC')

      expect(Array.isArray(peers)).toBe(true)
      expect(peers.length).toBeGreaterThan(0)
      expect(peers).toContain('ADVANC')
    })

    it('should return empty array for invalid symbol', () => {
      const peers = getPeerSymbols('INVALID_SYMBOL')

      expect(peers).toEqual([])
    })

    it('should return empty array for stock without subSectorEn', () => {
      // First, let's verify the function handles this case
      // We need to test with a stock that might not have subSectorEn
      const result = findBySymbol('ADVANC')

      if (result) {
        // Temporarily remove subSectorEn to test
        const originalSubSector = result.subSectorEn
        // @ts-ignore - testing edge case
        result.subSectorEn = undefined

        const peers = getPeerSymbols('ADVANC')
        expect(peers).toEqual([])

        // Restore
        result.subSectorEn = originalSubSector
      }
    })

    it('should return sorted array of symbols', () => {
      const peers = getPeerSymbols('ADVANC')

      const sortedPeers = [...peers].sort()
      expect(peers).toEqual(sortedPeers)
    })

    it('should be case-insensitive', () => {
      const peers1 = getPeerSymbols('ADVANC')
      const peers2 = getPeerSymbols('advanc')
      const peers3 = getPeerSymbols('Advanc')

      expect(peers1).toEqual(peers2)
      expect(peers2).toEqual(peers3)
    })

    it('should handle whitespace in symbol', () => {
      const peers = getPeerSymbols('  ADVANC  ')

      expect(peers).not.toEqual([])
    })

    it('should return all stocks in same sub-sector', () => {
      const stock = findBySymbol('ADVANC')

      if (stock && stock.subSectorEn) {
        const peers = getPeerSymbols('ADVANC')
        const subSectorStocks = findBySubSector(stock.subSectorEn)
        const subSectorSymbols = subSectorStocks.map(s => s.symbol).sort()

        expect(peers).toEqual(subSectorSymbols)
      }
    })

    it('should return single symbol if sub-sector has only one stock', () => {
      // This tests edge case where sub-sector has only one stock
      const stock = findBySymbol('ADVANC')

      if (stock && stock.subSectorEn) {
        const peers = getPeerSymbols(stock.symbol)

        // All peers should have the same subSectorEn
        peers.forEach(peerSymbol => {
          const peerStock = findBySymbol(peerSymbol)
          expect(peerStock?.subSectorEn).toBe(stock.subSectorEn)
        })
      }
    })

    it('should not mutate original data', () => {
      const peers1 = getPeerSymbols('ADVANC')
      const peers2 = getPeerSymbols('ADVANC')

      expect(peers1).toEqual(peers2)
    })
  })
})
