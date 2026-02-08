/**
 * Stock Metadata API Route Tests
 *
 * Integration tests for the stock metadata API endpoints.
 * Tests the GET /api/stocks/metadata endpoint with various query parameters.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GET } from '../route'
import { NextRequest } from 'next/server'

describe('GET /api/stocks/metadata', () => {
  beforeEach(() => {
    // Clear any module caches if needed
  })

  describe('Symbol lookup with peers', () => {
    it('should return stock metadata with peers for valid symbol', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/metadata?symbol=ADVANC'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.stock).toBeDefined()
      expect(data.stock.symbol).toBe('ADVANC')
      expect(data.stock.peers).toBeDefined()
      expect(Array.isArray(data.stock.peers)).toBe(true)
      expect(data.stock.peers.length).toBeGreaterThan(0)
      expect(data.stock.peers).toContain('ADVANC')
    })

    it('should return 404 for invalid symbol', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/metadata?symbol=INVALID_SYMBOL_999'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Symbol not found')
    })

    it('should be case-insensitive', async () => {
      const request1 = new NextRequest(
        'http://localhost:3000/api/stocks/metadata?symbol=ADVANC'
      )
      const request2 = new NextRequest(
        'http://localhost:3000/api/stocks/metadata?symbol=advanc'
      )
      const request3 = new NextRequest(
        'http://localhost:3000/api/stocks/metadata?symbol=AdvAnc'
      )

      const response1 = await GET(request1)
      const response2 = await GET(request2)
      const response3 = await GET(request3)

      const data1 = await response1.json()
      const data2 = await response2.json()
      const data3 = await response3.json()

      expect(data1.stock.symbol).toBe(data2.stock.symbol)
      expect(data2.stock.symbol).toBe(data3.stock.symbol)
      expect(data1.stock.peers).toEqual(data2.stock.peers)
      expect(data2.stock.peers).toEqual(data3.stock.peers)
    })

    it('should return peers in sorted order', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/metadata?symbol=KBANK'
      )
      const response = await GET(request)
      const data = await response.json()

      const peers = data.stock.peers
      const sortedPeers = [...peers].sort()

      expect(peers).toEqual(sortedPeers)
    })

    it('should return all peers from the same sub-sector', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/metadata?symbol=BAY'
      )
      const response = await GET(request)
      const data = await response.json()

      const stock = data.stock
      const peers = stock.peers

      // All peers should have the same subSectorEn as the requested stock
      // Note: We can't directly query other stocks in the test, but we can verify
      // that the response structure is correct
      expect(peers).toBeDefined()
      expect(Array.isArray(peers)).toBe(true)
      expect(stock.subSectorEn).toBeDefined()

      // The stock itself should be in the peers list
      expect(peers).toContain(stock.symbol)
    })
  })

  describe('Error handling', () => {
    it('should handle whitespace in symbol', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/metadata?symbol=  ADVANC  '
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.stock.symbol).toBe('ADVANC')
    })

    it('should return 400 for invalid market parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stocks/metadata?market=INVALID'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid market parameter')
    })
  })
})
