/**
 * Swing Trading Verdict API Route Integration Tests
 *
 * TDD Approach: RED -> GREEN -> REFACTOR -> IMPROVE
 *
 * Test Coverage:
 * - GET /api/swing/[symbol]/verdict?horizon={30|60|90}
 * - Query parameter validation
 * - Response structure validation
 * - Error handling (500 errors)
 * - Cache headers
 * - Edge cases (invalid symbols, network errors)
 *
 * Mock Strategy:
 * - generateSwingVerdict from '@/services/swing-trading'
 * - NextRequest for simulating HTTP requests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'
import type { SwingVerdict, SwingVerdictResponse } from '@/types/swing-trading'

// Mock external dependencies
vi.mock('@/services/swing-trading', () => ({
  generateSwingVerdict: vi.fn(),
}))

import { generateSwingVerdict } from '@/services/swing-trading'

describe('GET /api/swing/[symbol]/verdict', () => {
  // ============================================================================
  // FIXTURES
  // ============================================================================

  let mockVerdict: SwingVerdict

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup realistic mock verdict
    mockVerdict = {
      symbol: 'PTT',
      horizon: 60,
      verdict: 'Buy',
      confidence: 'Medium',
      entry: {
        zone: {
          min: 340.0,
          max: 350.0,
          current: 348.5,
        },
        discountFromCurrent: 2.3,
        rationale: 'Near support level with uptrend confirmation',
      },
      exit: {
        stopLoss: {
          price: 335.0,
          percentFromEntry: 4.3,
          rationale: 'Below nearest support level',
        },
        takeProfits: [
          { level: 1, price: 360.0, percentFromEntry: 2.9 },
          { level: 2, price: 375.0, percentFromEntry: 7.1 },
          { level: 3, price: 390.0, percentFromEntry: 11.4 },
        ],
        riskRewardRatio: '1:2.5',
      },
      position: {
        percentage: 5.0,
        riskAmount: 2000.0,
        rationale: '2% risk per trade with 100k portfolio',
      },
      analysis: {
        trendQuality: 'good',
        trendSustainability: 70,
        timing: 'good',
        keyFactors: [
          'Uptrend (60 days)',
          'Mature trend - moderate potential',
          'Momentum accelerating',
          'Near support at 340.00',
          'Moderate trend (50-70 score)',
        ],
      },
      timeEstimate: {
        minDays: 42,
        maxDays: 72,
        rationale: 'Based on 60-day target holding period',
      },
      timestamp: Date.now(),
      dataQuality: 85,
    }

    // Default successful response
    vi.mocked(generateSwingVerdict).mockResolvedValue(mockVerdict)
  })

  // ============================================================================
  // SUCCESS CASES
  // ============================================================================

  describe('Success cases', () => {
    it('should return 200 with valid symbol and default horizon (60)', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.error).toBeUndefined()
      expect(data.meta).toBeDefined()
    })

    it('should return 200 with horizon=30', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict?horizon=30')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(generateSwingVerdict).toHaveBeenCalledWith({ symbol: 'PTT', horizon: 30 })
    })

    it('should return 200 with horizon=60', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict?horizon=60')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(generateSwingVerdict).toHaveBeenCalledWith({ symbol: 'PTT', horizon: 60 })
    })

    it('should return 200 with horizon=90', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict?horizon=90')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(generateSwingVerdict).toHaveBeenCalledWith({ symbol: 'PTT', horizon: 90 })
    })

    it('should include all required fields in verdict data', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(data.data).toMatchObject({
        symbol: expect.any(String),
        horizon: expect.any(Number),
        verdict: expect.any(String),
        confidence: expect.any(String),
        entry: {
          zone: {
            min: expect.any(Number),
            max: expect.any(Number),
            current: expect.any(Number),
          },
          discountFromCurrent: expect.any(Number),
          rationale: expect.any(String),
        },
        exit: {
          stopLoss: {
            price: expect.any(Number),
            percentFromEntry: expect.any(Number),
            rationale: expect.any(String),
          },
          takeProfits: expect.any(Array),
          riskRewardRatio: expect.any(String),
        },
        position: {
          percentage: expect.any(Number),
          riskAmount: expect.any(Number),
          rationale: expect.any(String),
        },
        analysis: {
          trendQuality: expect.any(String),
          trendSustainability: expect.any(Number),
          timing: expect.any(String),
          keyFactors: expect.any(Array),
        },
        timeEstimate: {
          minDays: expect.any(Number),
          maxDays: expect.any(Number),
          rationale: expect.any(String),
        },
        timestamp: expect.any(Number),
        dataQuality: expect.any(Number),
      })
    })

    it('should include metadata with timestamp and processing time', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(data.meta).toBeDefined()
      expect(data.meta?.timestamp).toBeDefined()
      expect(data.meta?.processingTime).toBeDefined()
      expect(data.meta?.cacheStatus).toBe('miss')
      expect(data.meta?.timestamp).toBeGreaterThan(0)
      expect(data.meta?.processingTime).toBeGreaterThanOrEqual(0)
    })

    it('should return correct symbol in response', async () => {
      const aaplVerdict = { ...mockVerdict, symbol: 'AAPL' }
      vi.mocked(generateSwingVerdict).mockResolvedValue(aaplVerdict)

      const request = new NextRequest('http://localhost:3000/api/swing/AAPL/verdict')
      const params = Promise.resolve({ symbol: 'AAPL' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(data.data?.symbol).toBe('AAPL')
    })

    it('should return correct horizon in response', async () => {
      const verdict30Days = { ...mockVerdict, horizon: 30 }
      vi.mocked(generateSwingVerdict).mockResolvedValue(verdict30Days)

      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict?horizon=30')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(data.data?.horizon).toBe(30)
    })

    it('should handle valid verdict types', async () => {
      const verdictTypes: SwingVerdict['verdict'][] = ['Strong Buy', 'Buy', 'Wait', 'Avoid']

      for (const verdictType of verdictTypes) {
        const mockVerdictWithType: SwingVerdict = {
          ...mockVerdict,
          verdict: verdictType,
        }
        vi.mocked(generateSwingVerdict).mockResolvedValue(mockVerdictWithType)

        const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
        const params = Promise.resolve({ symbol: 'PTT' })
        const response = await GET(request, { params })
        const data: SwingVerdictResponse = await response.json()

        expect(response.status).toBe(200)
        expect(data.data?.verdict).toBe(verdictType)
      }
    })

    it('should handle valid confidence levels', async () => {
      const confidenceLevels: SwingVerdict['confidence'][] = ['High', 'Medium', 'Low']

      for (const confidence of confidenceLevels) {
        const mockVerdictWithConfidence: SwingVerdict = {
          ...mockVerdict,
          confidence: confidence,
        }
        vi.mocked(generateSwingVerdict).mockResolvedValue(mockVerdictWithConfidence)

        const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
        const params = Promise.resolve({ symbol: 'PTT' })
        const response = await GET(request, { params })
        const data: SwingVerdictResponse = await response.json()

        expect(response.status).toBe(200)
        expect(data.data?.confidence).toBe(confidence)
      }
    })

    it('should return correct take profit levels', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(data.data?.exit.takeProfits).toHaveLength(3)
      expect(data.data?.exit.takeProfits[0].level).toBe(1)
      expect(data.data?.exit.takeProfits[1].level).toBe(2)
      expect(data.data?.exit.takeProfits[2].level).toBe(3)
    })

    it('should include risk-reward ratio', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(data.data?.exit.riskRewardRatio).toBeDefined()
      expect(typeof data.data?.exit.riskRewardRatio).toBe('string')
      expect(data.data?.exit.riskRewardRatio).toMatch(/\d:\d+(\.\d+)?/)
    })
  })

  // ============================================================================
  // QUERY PARAMETER VALIDATION
  // ============================================================================

  describe('Query parameter validation', () => {
    it('should default to 60 days when parameter is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      await GET(request, { params })

      expect(generateSwingVerdict).toHaveBeenCalledWith({ symbol: 'PTT', horizon: 60 })
    })

    it('should default to 60 days for invalid horizon parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/swing/PTT/verdict?horizon=invalid'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      await GET(request, { params })

      expect(generateSwingVerdict).toHaveBeenCalledWith({ symbol: 'PTT', horizon: 60 })
    })

    it('should default to 60 days for horizon=0', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict?horizon=0')
      const params = Promise.resolve({ symbol: 'PTT' })
      await GET(request, { params })

      expect(generateSwingVerdict).toHaveBeenCalledWith({ symbol: 'PTT', horizon: 60 })
    })

    it('should default to 60 days for horizon=100 (out of range)', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/swing/PTT/verdict?horizon=100'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      await GET(request, { params })

      expect(generateSwingVerdict).toHaveBeenCalledWith({ symbol: 'PTT', horizon: 60 })
    })

    it('should default to 60 days for negative horizon', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/swing/PTT/verdict?horizon=-30'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      await GET(request, { params })

      expect(generateSwingVerdict).toHaveBeenCalledWith({ symbol: 'PTT', horizon: 60 })
    })

    it('should handle horizon parameter as string number', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict?horizon=90')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(200)
      expect(generateSwingVerdict).toHaveBeenCalledWith({ symbol: 'PTT', horizon: 90 })
    })

    it('should handle horizon boundary at 30', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict?horizon=30')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(200)
      expect(generateSwingVerdict).toHaveBeenCalledWith({ symbol: 'PTT', horizon: 30 })
    })

    it('should handle horizon boundary at 90', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict?horizon=90')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(200)
      expect(generateSwingVerdict).toHaveBeenCalledWith({ symbol: 'PTT', horizon: 90 })
    })
  })

  // ============================================================================
  // CACHE HEADERS
  // ============================================================================

  describe('Cache headers', () => {
    it('should include Cache-Control header with 30 min cache', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })

      const cacheControl = response.headers.get('Cache-Control')
      expect(cacheControl).toBe('public, s-maxage=1800, stale-while-revalidate=900')
    })

    it('should include same cache headers for all horizon parameters', async () => {
      const horizons: (30 | 60 | 90)[] = [30, 60, 90]

      for (const horizon of horizons) {
        const request = new NextRequest(
          `http://localhost:3000/api/swing/PTT/verdict?horizon=${horizon}`
        )
        const params = Promise.resolve({ symbol: 'PTT' })
        const response = await GET(request, { params })

        const cacheControl = response.headers.get('Cache-Control')
        expect(cacheControl).toBe('public, s-maxage=1800, stale-while-revalidate=900')
      }
    })
  })

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe('Error handling', () => {
    it('should return 500 when generateSwingVerdict returns null', async () => {
      vi.mocked(generateSwingVerdict).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to generate swing trading verdict. Please try again later.')
      expect(data.data).toBeUndefined()
    })

    it('should return 500 when generateSwingVerdict throws error', async () => {
      vi.mocked(generateSwingVerdict).mockRejectedValue(
        new Error('Service unavailable')
      )

      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Service unavailable')
    })

    it('should return 500 with unknown error message', async () => {
      vi.mocked(generateSwingVerdict).mockRejectedValue('String error')

      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unknown error occurred')
    })

    it('should handle network errors gracefully', async () => {
      vi.mocked(generateSwingVerdict).mockRejectedValue(
        new Error('Network connection failed')
      )

      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Network connection failed')
    })

    it('should handle timeout errors', async () => {
      vi.mocked(generateSwingVerdict).mockRejectedValue(
        new Error('Request timeout')
      )

      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Request timeout')
    })
  })

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge cases', () => {
    it('should handle special characters in symbol', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT-BD/verdict')
      const params = Promise.resolve({ symbol: 'PTT-BD' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      // Should not throw
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })

    it('should handle numeric symbol', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/123/verdict')
      const params = Promise.resolve({ symbol: '123' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      // Should not throw
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })

    it('should handle very long symbol', async () => {
      const longSymbol = 'A'.repeat(100)
      const request = new NextRequest(`http://localhost:3000/api/swing/${longSymbol}/verdict`)
      const params = Promise.resolve({ symbol: longSymbol })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      // Should not throw
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })

    it('should handle empty string symbol', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing//verdict')
      const params = Promise.resolve({ symbol: '' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      // Should not throw
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })

    it('should handle whitespace in symbol', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT%20/verdict')
      const params = Promise.resolve({ symbol: 'PTT ' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      // Should not throw
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })

    it('should handle multiple query parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/swing/PTT/verdict?horizon=30&extra=param'
      )
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      // Should ignore extra parameter
      expect(response.status).toBe(200)
      expect(generateSwingVerdict).toHaveBeenCalledWith({ symbol: 'PTT', horizon: 30 })
    })

    it('should handle verdict with Avoid type', async () => {
      const avoidVerdict: SwingVerdict = {
        ...mockVerdict,
        verdict: 'Avoid',
        confidence: 'High',
      }
      vi.mocked(generateSwingVerdict).mockResolvedValue(avoidVerdict)

      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.data?.verdict).toBe('Avoid')
    })

    it('should handle verdict with Wait type', async () => {
      const waitVerdict: SwingVerdict = {
        ...mockVerdict,
        verdict: 'Wait',
        confidence: 'Low',
      }
      vi.mocked(generateSwingVerdict).mockResolvedValue(waitVerdict)

      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.data?.verdict).toBe('Wait')
    })

    it('should handle verdict with Strong Buy type', async () => {
      const strongBuyVerdict: SwingVerdict = {
        ...mockVerdict,
        verdict: 'Strong Buy',
        confidence: 'High',
      }
      vi.mocked(generateSwingVerdict).mockResolvedValue(strongBuyVerdict)

      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.data?.verdict).toBe('Strong Buy')
    })
  })

  // ============================================================================
  // DATA QUALITY
  // ============================================================================

  describe('Data quality', () => {
    it('should include data quality score in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(data.data?.dataQuality).toBeDefined()
      expect(typeof data.data?.dataQuality).toBe('number')
      expect(data.data?.dataQuality).toBeGreaterThanOrEqual(0)
      expect(data.data?.dataQuality).toBeLessThanOrEqual(100)
    })

    it('should handle high data quality', async () => {
      const highQualityVerdict: SwingVerdict = {
        ...mockVerdict,
        dataQuality: 95,
      }
      vi.mocked(generateSwingVerdict).mockResolvedValue(highQualityVerdict)

      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.data?.dataQuality).toBe(95)
    })

    it('should handle low data quality', async () => {
      const lowQualityVerdict: SwingVerdict = {
        ...mockVerdict,
        dataQuality: 30,
        confidence: 'Low',
      }
      vi.mocked(generateSwingVerdict).mockResolvedValue(lowQualityVerdict)

      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.data?.dataQuality).toBe(30)
      expect(data.data?.confidence).toBe('Low')
    })

    it('should include timestamp in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(data.data?.timestamp).toBeDefined()
      expect(typeof data.data?.timestamp).toBe('number')
      expect(data.data?.timestamp).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // PERFORMANCE
  // ============================================================================

  describe('Performance', () => {
    it('should complete request within reasonable time', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })

      const startTime = Date.now()
      const response = await GET(request, { params })
      const endTime = Date.now()

      const data: SwingVerdictResponse = await response.json()

      // Should complete within 5 seconds (generous limit for tests)
      expect(endTime - startTime).toBeLessThan(5000)
      expect(data.meta?.processingTime).toBeGreaterThanOrEqual(0)
    })

    it('should include processing time in metadata', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/PTT/verdict')
      const params = Promise.resolve({ symbol: 'PTT' })
      const response = await GET(request, { params })
      const data: SwingVerdictResponse = await response.json()

      expect(data.meta?.processingTime).toBeDefined()
      expect(typeof data.meta?.processingTime).toBe('number')
      expect(data.meta?.processingTime).toBeGreaterThanOrEqual(0)
    })
  })
})
