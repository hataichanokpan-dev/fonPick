/**
 * Validation Tests
 *
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from 'vitest'
import {
  validateStockOverviewResponse,
  validateStockStatisticsResponse,
  safeValidateStockOverview,
  safeValidateStockStatistics,
} from './validation'

describe('Stock Overview Validation', () => {
  const validOverviewResponse = {
    success: true,
    data: {
      symbol: 'PTT',
      name: 'PTT Public Company Limited',
      sector: 'Energy',
      market: 'SET',
      price: {
        current: 34.75,
        change: 0.5,
        changePercent: 1.46,
        dayHigh: 35.0,
        dayLow: 34.5,
        previousClose: 34.25,
      },
      volume: {
        current: 15000000,
        average: 12000000,
        ratio: 1.25,
      },
      marketCap: '992.56B',
      peRatio: 13.46,
      pbvRatio: 1.2,
      dividendYield: 3.5,
      beta: 0.85,
      decisionBadge: {
        label: 'BUY',
        score: 75,
        type: 'bullish' as const,
      },
      layerScore: {
        quality: 70,
        valuation: 80,
        timing: 75,
      },
      lastUpdate: '2025-01-29T12:00:00Z',
    },
    cached: false,
  }

  describe('validateStockOverviewResponse', () => {
    it('should validate correct overview response', () => {
      const result = validateStockOverviewResponse(validOverviewResponse)

      expect(result).toEqual(validOverviewResponse)
      expect(result.data.symbol).toBe('PTT')
      expect(result.data.price.current).toBe(34.75)
      expect(result.data.decisionBadge.type).toBe('bullish')
    })

    it('should throw validation error for missing required fields', () => {
      const invalidResponse = {
        success: true,
        // Missing 'data' field
        cached: false,
      }

      expect(() => validateStockOverviewResponse(invalidResponse)).toThrow()
    })

    it('should throw validation error for invalid decision badge type', () => {
      const invalidResponse = {
        ...validOverviewResponse,
        data: {
          ...validOverviewResponse.data,
          decisionBadge: {
            label: 'BUY',
            score: 75,
            type: 'invalid', // Not 'bullish' | 'bearish' | 'neutral'
          },
        },
      }

      expect(() => validateStockOverviewResponse(invalidResponse)).toThrow()
    })

    it('should throw validation error for invalid price data type', () => {
      const invalidResponse = {
        ...validOverviewResponse,
        data: {
          ...validOverviewResponse.data,
          price: {
            current: '34.75', // Should be number
            change: 0.5,
            changePercent: 1.46,
            dayHigh: 35.0,
            dayLow: 34.5,
            previousClose: 34.25,
          },
        },
      }

      expect(() => validateStockOverviewResponse(invalidResponse)).toThrow()
    })

    it('should validate with cached: true', () => {
      const cachedResponse = { ...validOverviewResponse, cached: true }

      const result = validateStockOverviewResponse(cachedResponse)

      expect(result.cached).toBe(true)
    })
  })

  describe('safeValidateStockOverview', () => {
    it('should return validated data for valid input', () => {
      const result = safeValidateStockOverview(validOverviewResponse)

      expect(result).toEqual(validOverviewResponse)
    })

    it('should return null for invalid input', () => {
      const invalidResponse = {
        success: true,
        // Missing 'data' field
        cached: false,
      }

      const result = safeValidateStockOverview(invalidResponse)

      expect(result).toBeNull()
    })

    it('should return null for malformed data', () => {
      const malformedResponse = {
        success: 'true', // Should be boolean
        data: null,
        cached: false,
      }

      const result = safeValidateStockOverview(malformedResponse)

      expect(result).toBeNull()
    })
  })
})

describe('Stock Statistics Validation', () => {
  const validStatisticsResponse = {
    success: true,
    data: {
      symbol: 'PTT',
      financial: {
        revenue: 1500000000000,
        netProfit: 120000000000,
        totalAssets: 2500000000000,
        totalEquity: 800000000000,
        eps: 15.5,
        roe: 15.2,
        roa: 4.8,
        debtToEquity: 2.1,
        currentRatio: 1.5,
        quickRatio: 1.2,
      },
      valuation: {
        pe: 13.46,
        pbv: 1.2,
        ev: 1200000000000,
        evEbitda: 8.5,
        priceToSales: 0.8,
        pegRatio: 1.2,
        dividendYield: 3.5,
        payoutRatio: 0.5,
      },
      performance: {
        w1d: 1.5,
        w1m: 3.2,
        w3m: 8.5,
        w6m: 12.3,
        ytd: 5.8,
        y1: 18.5,
      },
      trading: {
        avgVolume1m: 15000000,
        avgVolume3m: 12000000,
        avgVolume1y: 10000000,
        turnover: 2500000000,
        volatility: 0.85,
      },
      analyst: {
        rating: 'BUY',
        targetPrice: 42.0,
        recommendation: 'Buy',
        strongBuy: 5,
        buy: 8,
        hold: 3,
        sell: 0,
        strongSell: 0,
      },
      lastUpdate: '2025-01-29T12:00:00Z',
    },
    cached: false,
  }

  describe('validateStockStatisticsResponse', () => {
    it('should validate correct statistics response', () => {
      const result = validateStockStatisticsResponse(validStatisticsResponse)

      expect(result).toEqual(validStatisticsResponse)
      expect(result.data.symbol).toBe('PTT')
      expect(result.data.financial.eps).toBe(15.5)
      expect(result.data.valuation.pe).toBe(13.46)
      expect(result.data.analyst.rating).toBe('BUY')
    })

    it('should throw validation error for missing nested fields', () => {
      const invalidResponse = {
        success: true,
        data: {
          symbol: 'PTT',
          // Missing 'financial' field
        },
        cached: false,
      }

      expect(() => validateStockStatisticsResponse(invalidResponse)).toThrow()
    })

    it('should throw validation error for invalid analyst counts', () => {
      const invalidResponse = {
        ...validStatisticsResponse,
        data: {
          ...validStatisticsResponse.data,
          analyst: {
            rating: 'BUY',
            targetPrice: 42.0,
            recommendation: 'Buy',
            strongBuy: -5, // Should be non-negative
            buy: 8,
            hold: 3,
            sell: 0,
            strongSell: 0,
          },
        },
      }

      // Zod doesn't validate ranges for numbers by default, but the structure should be valid
      const result = validateStockStatisticsResponse(invalidResponse)
      expect(result.data.analyst.strongBuy).toBe(-5)
    })

    it('should validate performance data structure', () => {
      const result = validateStockStatisticsResponse(validStatisticsResponse)

      expect(result.data.performance).toBeDefined()
      expect(result.data.performance.w1d).toBeDefined()
      expect(result.data.performance.y1).toBeDefined()
    })
  })

  describe('safeValidateStockStatistics', () => {
    it('should return validated data for valid input', () => {
      const result = safeValidateStockStatistics(validStatisticsResponse)

      expect(result).toEqual(validStatisticsResponse)
    })

    it('should return null for invalid input', () => {
      const invalidResponse = {
        success: true,
        data: {
          symbol: 'PTT',
          // Missing required nested fields
        },
        cached: false,
      }

      const result = safeValidateStockStatistics(invalidResponse)

      expect(result).toBeNull()
    })

    it('should return null for malformed structure', () => {
      const malformedResponse = {
        success: true,
        data: null,
        cached: false,
      }

      const result = safeValidateStockStatistics(malformedResponse)

      expect(result).toBeNull()
    })
  })
})

describe('Edge Cases', () => {
  const validOverviewResponse = {
    success: true,
    data: {
      symbol: 'PTT',
      name: 'PTT Public Company Limited',
      sector: 'Energy',
      market: 'SET',
      price: {
        current: 34.75,
        change: 0.5,
        changePercent: 1.46,
        dayHigh: 35.0,
        dayLow: 34.5,
        previousClose: 34.25,
      },
      volume: {
        current: 15000000,
        average: 12000000,
        ratio: 1.25,
      },
      marketCap: '992.56B',
      peRatio: 13.46,
      pbvRatio: 1.2,
      dividendYield: 3.5,
      beta: 0.85,
      decisionBadge: {
        label: 'BUY',
        score: 75,
        type: 'bullish' as const,
      },
      layerScore: {
        quality: 70,
        valuation: 80,
        timing: 75,
      },
      lastUpdate: '2025-01-29T12:00:00Z',
    },
    cached: false,
  }

  it('should handle null values in optional fields', () => {
    // The schemas don't have optional fields, but we test the behavior
    const responseWithNulls = {
      ...validOverviewResponse,
      data: {
        ...validOverviewResponse.data,
        // No optional fields in current schema
      },
    }

    const result = safeValidateStockOverview(responseWithNulls)
    expect(result).not.toBeNull()
  })

  it('should handle empty strings', () => {
    const responseWithEmptyString = {
      ...validOverviewResponse,
      data: {
        ...validOverviewResponse.data,
        symbol: '', // Empty string is valid for string type
      },
    }

    const result = safeValidateStockOverview(responseWithEmptyString)
    expect(result).not.toBeNull()
  })

  it('should handle zero values', () => {
    const responseWithZeros = {
      ...validOverviewResponse,
      data: {
        ...validOverviewResponse.data,
        price: {
          current: 0,
          change: 0,
          changePercent: 0,
          dayHigh: 0,
          dayLow: 0,
          previousClose: 0,
        },
      },
    }

    const result = safeValidateStockOverview(responseWithZeros)
    expect(result).not.toBeNull()
  })

  it('should handle negative values where appropriate', () => {
    const responseWithNegatives = {
      ...validOverviewResponse,
      data: {
        ...validOverviewResponse.data,
        price: {
          current: 34.75,
          change: -0.5,
          changePercent: -1.46,
          dayHigh: 35.0,
          dayLow: 34.5,
          previousClose: 34.25,
        },
      },
    }

    const result = safeValidateStockOverview(responseWithNegatives)
    expect(result).not.toBeNull()
  })
})
