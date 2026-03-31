/**
 * Historical Trend API Route Integration Tests
 *
 * TDD Approach: RED -> GREEN -> REFACTOR -> IMPROVE
 *
 * Test Coverage:
 * - GET /api/stocks/[symbol]/trend/history?days={5|10|30|60|90}
 * - Query parameter validation
 * - Response structure validation
 * - Error handling (500 errors)
 * - Cache headers
 * - Edge cases (invalid symbols, network errors)
 *
 * Mock Strategy:
 * - analyzeHistoricalTrend from '@/services/historical-trend'
 * - NextRequest for simulating HTTP requests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'
import type { HistoricalTrendAnalysis, HistoricalTrendResponse } from '@/types/swing-trading'

// Mock external dependencies
vi.mock('@/services/historical-trend', () => ({
  analyzeHistoricalTrend: vi.fn(),
}))

import { analyzeHistoricalTrend } from '@/services/historical-trend'

describe('GET /api/stocks/[symbol]/trend/history', () => {
  // ============================================================================
  // FIXTURES
  // ============================================================================

  let mockAnalysis: HistoricalTrendAnalysis

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup realistic mock analysis
    mockAnalysis = {
      symbol: 'PTT',
      period: {
        start: '2024-01-01',
        end: '2024-03-31',
        days: 90,
      },
      priceHistory: [],
      movingAverages: {
        ma20: [
          { date: '2024-03-30', value: 350.0 },
          { date: '2024-03-31', value: 351.5 },
        ],
        ma50: [
          { date: '2024-03-30', value: 345.0 },
          { date: '2024-03-31', value: 346.0 },
        ],
        ma200: [],
      },
      trend: {
        direction: 'uptrend',
        duration: 60,
        phase: 'mature',
        strength: 75,
      },
      momentum: {
        sustainabilityScore: 70,
        isAccelerating: true,
        isDecelerating: false,
      },
      levels: {
        support: [
          { price: 340, type: 'support', strength: 'strong', touches: 4, lastTouchDate: '2024-03-15' },
        ],
        resistance: [
          { price: 360, type: 'resistance', strength: 'moderate', touches: 2, lastTouchDate: '2024-03-25' },
        ],
      },
      dataQuality: {
        completeness: 100,
        hasEnoughData: true,
        missingDates: [],
      },
    }

    // Default successful response
    vi.mocked(analyzeHistoricalTrend).mockResolvedValue(mockAnalysis)
  })

  // ============================================================================
  // SUCCESS CASES
  // ============================================================================

  describe('Success cases', () => {
    it('should return 200 with valid symbol and default days (90)', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/PTT/trend/history')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.error).toBeUndefined()
      expect(data.meta).toBeDefined()
    })

    it('should return 200 with days=5', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/PTT/trend/history?days=5'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(analyzeHistoricalTrend).toHaveBeenCalledWith({ symbol: 'PTT', days: 5 })
    })

    it('should return 200 with days=10', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/PTT/trend/history?days=10'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(analyzeHistoricalTrend).toHaveBeenCalledWith({ symbol: 'PTT', days: 10 })
    })

    it('should return 200 with days=30', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/PTT/trend/history?days=30'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(analyzeHistoricalTrend).toHaveBeenCalledWith({ symbol: 'PTT', days: 30 })
    })

    it('should return 200 with days=60', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/PTT/trend/history?days=60'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(analyzeHistoricalTrend).toHaveBeenCalledWith({ symbol: 'PTT', days: 60 })
    })

    it('should return 200 with days=90', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/PTT/trend/history?days=90'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(analyzeHistoricalTrend).toHaveBeenCalledWith({ symbol: 'PTT', days: 90 })
    })

    it('should include all required fields in response data', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/PTT/trend/history')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(data.data).toMatchObject({
        symbol: expect.any(String),
        period: {
          start: expect.any(String),
          end: expect.any(String),
          days: expect.any(Number),
        },
        priceHistory: expect.any(Array),
        movingAverages: {
          ma20: expect.any(Array),
          ma50: expect.any(Array),
          ma200: expect.any(Array),
        },
        trend: {
          direction: expect.any(String),
          duration: expect.any(Number),
          phase: expect.any(String),
          strength: expect.any(Number),
        },
        momentum: {
          sustainabilityScore: expect.any(Number),
          isAccelerating: expect.any(Boolean),
          isDecelerating: expect.any(Boolean),
        },
        levels: {
          support: expect.any(Array),
          resistance: expect.any(Array),
        },
        dataQuality: {
          completeness: expect.any(Number),
          hasEnoughData: expect.any(Boolean),
          missingDates: expect.any(Array),
        },
      })
    })

    it('should include metadata with timestamp and processing time', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/PTT/trend/history')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(data.meta).toBeDefined()
      expect(data.meta?.timestamp).toBeDefined()
      expect(data.meta?.processingTime).toBeDefined()
      expect(data.meta?.cacheStatus).toBe('miss')
      expect(data.meta?.timestamp).toBeGreaterThan(0)
      expect(data.meta?.processingTime).toBeGreaterThanOrEqual(0)
    })

    it('should return correct symbol in response', async () => {
      const aaplAnalysis = { ...mockAnalysis, symbol: 'AAPL' }
      vi.mocked(analyzeHistoricalTrend).mockResolvedValue(aaplAnalysis)

      const request = new NextRequest('http://localhost:3000/api/stocks/AAPL/trend/history')
      const params = Promise.resolve({ symbol: 'AAPL' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(data.data?.symbol).toBe('AAPL')
    })

    it('should handle lowercase symbol', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/ptt/trend/history')
      const params = Promise.resolve({ symbol: 'ptt' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  // ============================================================================
  // QUERY PARAMETER VALIDATION
  // ============================================================================

  describe('Query parameter validation', () => {
    it('should default to 90 days when parameter is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/PTT/trend/history')
      const params = Promise.resolve({ symbol: 'PTT' })
      await GET(request, { params })

      expect(analyzeHistoricalTrend).toHaveBeenCalledWith({ symbol: 'PTT', days: 90 })
    })

    it('should default to 90 days for invalid days parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/PTT/trend/history?days=invalid'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      await GET(request, { params })

      expect(analyzeHistoricalTrend).toHaveBeenCalledWith({ symbol: 'PTT', days: 90 })
    })

    it('should default to 90 days for days=0', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/PTT/trend/history?days=0'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      await GET(request, { params })

      expect(analyzeHistoricalTrend).toHaveBeenCalledWith({ symbol: 'PTT', days: 90 })
    })

    it('should default to 90 days for days=100 (out of range)', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/PTT/trend/history?days=100'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      await GET(request, { params })

      expect(analyzeHistoricalTrend).toHaveBeenCalledWith({ symbol: 'PTT', days: 90 })
    })

    it('should default to 90 days for negative days', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/PTT/trend/history?days=-5'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      await GET(request, { params })

      expect(analyzeHistoricalTrend).toHaveBeenCalledWith({ symbol: 'PTT', days: 90 })
    })

    it('should handle days parameter as string number', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/PTT/trend/history?days=30'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(200)
      expect(analyzeHistoricalTrend).toHaveBeenCalledWith({ symbol: 'PTT', days: 30 })
    })
  })

  // ============================================================================
  // CACHE HEADERS
  // ============================================================================

  describe('Cache headers', () => {
    it('should include Cache-Control header with no-store', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/PTT/trend/history')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })

      const cacheControl = response.headers.get('Cache-Control')
      expect(cacheControl).toBe('no-store, no-cache, must-revalidate')
    })

    it('should include same cache headers for all days parameters', async () => {
      const days: (5 | 10 | 30 | 60 | 90)[] = [5, 10, 30, 60, 90]

      for (const day of days) {
        const request = new NextRequest(
          `http://localhost:3000/api/stocks/PTT/trend/history?days=${day}`
        )
        const params = Promise.resolve({ symbol: 'PTT' })
        const response = await GET(request, { params })

        const cacheControl = response.headers.get('Cache-Control')
        expect(cacheControl).toBe('no-store, no-cache, must-revalidate')
      }
    })
  })

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe('Error handling', () => {
    it('should return 500 when analyzeHistoricalTrend returns null', async () => {
      vi.mocked(analyzeHistoricalTrend).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/stocks/PTT/trend/history')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to analyze historical trend. Please try again later.')
      expect(data.data).toBeUndefined()
    })

    it('should return 500 when analyzeHistoricalTrend throws error', async () => {
      vi.mocked(analyzeHistoricalTrend).mockRejectedValue(
        new Error('Service unavailable')
      )

      const request = new NextRequest('http://localhost:3000/api/stocks/PTT/trend/history')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Service unavailable')
    })

    it('should return 500 with unknown error message', async () => {
      vi.mocked(analyzeHistoricalTrend).mockRejectedValue('String error')

      const request = new NextRequest('http://localhost:3000/api/stocks/PTT/trend/history')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unknown error occurred')
    })

    it('should handle network errors gracefully', async () => {
      vi.mocked(analyzeHistoricalTrend).mockRejectedValue(
        new Error('Network connection failed')
      )

      const request = new NextRequest('http://localhost:3000/api/stocks/PTT/trend/history')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Network connection failed')
    })
  })

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge cases', () => {
    it('should handle special characters in symbol', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/PTT-BD/trend/history'
      )
      const params = Promise.resolve({ symbol: 'PTT-BD' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      // Should not throw
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })

    it('should handle numeric symbol', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/123/trend/history')
      const params = Promise.resolve({ symbol: '123' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      // Should not throw
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })

    it('should handle very long symbol', async () => {
      const longSymbol = 'A'.repeat(100)
      const request = new NextRequest(
        `http://localhost:3000/api/stocks/${longSymbol}/trend/history`
      )
      const params = Promise.resolve({ symbol: longSymbol })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      // Should not throw
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })

    it('should handle empty string symbol', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks//trend/history')
      const params = Promise.resolve({ symbol: '' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      // Should not throw
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })

    it('should handle whitespace in symbol', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/PTT%20/trend/history')
      const params = Promise.resolve({ symbol: 'PTT ' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      // Should not throw
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })

    it('should handle multiple query parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/PTT/trend/history?days=30&extra=param'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      // Should ignore extra parameter
      expect(response.status).toBe(200)
      expect(analyzeHistoricalTrend).toHaveBeenCalledWith({ symbol: 'PTT', days: 30 })
    })

    it('should handle null values in analysis', async () => {
      const nullAnalysis: HistoricalTrendAnalysis = {
        ...mockAnalysis,
        movingAverages: { ma20: [], ma50: [], ma200: [] },
        levels: { support: [], resistance: [] },
      }
      vi.mocked(analyzeHistoricalTrend).mockResolvedValue(nullAnalysis)

      const request = new NextRequest('http://localhost:3000/api/stocks/PTT/trend/history')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  // ============================================================================
  // PERFORMANCE
  // ============================================================================

  describe('Performance', () => {
    it('should complete request within reasonable time', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/PTT/trend/history')
      const params = Promise.resolve({ symbol: 'PTT' })

      const startTime = Date.now()
      const response = await GET(request, { params })
      const endTime = Date.now()

      const data: HistoricalTrendResponse = await response.json()

      // Should complete within 5 seconds (generous limit for tests)
      expect(endTime - startTime).toBeLessThan(5000)
      expect(data.meta?.processingTime).toBeGreaterThanOrEqual(0)
    })

    it('should include processing time in metadata', async () => {
      const request = new NextRequest('http://localhost:3000/api/stocks/PTT/trend/history')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: HistoricalTrendResponse = await response.json()

      expect(data.meta?.processingTime).toBeDefined()
      expect(typeof data.meta?.processingTime).toBe('number')
      expect(data.meta?.processingTime).toBeGreaterThanOrEqual(0)
    })
  })
})
