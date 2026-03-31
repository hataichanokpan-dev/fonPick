/**
 * Swing Trading Entry API Tests
 *
 * Test suite for /api/swing/entry endpoint
 */

import { POST } from './route'
import { NextRequest } from 'next/server'

describe('/api/swing/entry', () => {
  describe('POST', () => {
    const baseRequestBody = {
      symbol: 'KBANK',
      currentPrice: 150.0,
      supportLevels: [
        { price: 148.0, strength: 'strong' as const },
        { price: 145.0, strength: 'moderate' as const }
      ],
      movingAverages: {
        ma20: 149.0,
        ma50: 147.0
      },
      trendPhase: 'early' as const,
      catalystData: {
        theme: 'Digital Banking',
        catalysts: ['Q1 Earnings (15 Feb)', 'Product Launch (1 Mar)'],
        whatToWatch: ['NIM', 'Loan Growth'],
        aiScore: 8.5
      }
    }

    it('ควรคืนค่า 200 เมื่อ request ถูกต้อง', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/entry', {
        method: 'POST',
        body: JSON.stringify(baseRequestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.entryZone).toBeDefined()
      expect(data.data.confidence).toBeGreaterThan(0)
    })

    it('ควรคำนวณ entry zone พร้อม catalyst adjustments', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/entry', {
        method: 'POST',
        body: JSON.stringify(baseRequestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.data.catalystAdjustment).toBeDefined()
      expect(data.data.catalystAdjustment.upcomingCatalysts).toBeDefined()
      expect(data.data.catalystUrgency).toBeDefined()
      expect(data.data.catalystTiming).toBeDefined()
    })

    it('ควรทำงานได้โดยไม่มี catalyst data', async () => {
      const bodyWithoutCatalyst = {
        ...baseRequestBody,
        catalystData: undefined
      }

      const request = new NextRequest('http://localhost:3000/api/swing/entry', {
        method: 'POST',
        body: JSON.stringify(bodyWithoutCatalyst)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.entryZone).toBeDefined()
      // ไม่ควรมี catalyst adjustments
      expect(data.data.catalystAdjustment).toBeUndefined()
    })

    it('ควรคืนค่า 400 เมื่อ symbol ไม่ถูกต้อง', async () => {
      const invalidBody = {
        ...baseRequestBody,
        symbol: '' // Empty symbol
      }

      const request = new NextRequest('http://localhost:3000/api/swing/entry', {
        method: 'POST',
        body: JSON.stringify(invalidBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid')
    })

    it('ควรคืนค่า 400 เมื่อ currentPrice เป็นค่าลบ', async () => {
      const invalidBody = {
        ...baseRequestBody,
        currentPrice: -10 // Negative price
      }

      const request = new NextRequest('http://localhost:3000/api/swing/entry', {
        method: 'POST',
        body: JSON.stringify(invalidBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('ควรคืนค่า 400 เมื่อ trendPhase ไม่ถูกต้อง', async () => {
      const invalidBody = {
        ...baseRequestBody,
        trendPhase: 'invalid' // Invalid phase
      }

      const request = new NextRequest('http://localhost:3000/api/swing/entry', {
        method: 'POST',
        body: JSON.stringify(invalidBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('ควรคืนค่า 400 เมื่อ aiScore อยู่นอกช่วง 0-10', async () => {
      const invalidBody = {
        ...baseRequestBody,
        catalystData: {
          ...baseRequestBody.catalystData!,
          aiScore: 15 // Invalid score
        }
      }

      const request = new NextRequest('http://localhost:3000/api/swing/entry', {
        method: 'POST',
        body: JSON.stringify(invalidBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('ควรรวม metadata ใน response', async () => {
      const request = new NextRequest('http://localhost:3000/api/swing/entry', {
        method: 'POST',
        body: JSON.stringify(baseRequestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.meta).toBeDefined()
      expect(data.meta.symbol).toBe('KBANK')
      expect(data.meta.timestamp).toBeDefined()
      expect(typeof data.meta.timestamp).toBe('number')
    })

    it('ควรจัดการ request body ที่ไม่สมบูรณ์', async () => {
      const incompleteBody = {
        symbol: 'KBANK'
        // Missing required fields
      }

      const request = new NextRequest('http://localhost:3000/api/swing/entry', {
        method: 'POST',
        body: JSON.stringify(incompleteBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('ควรใช้ค่า default เมื่อไม่ระบุ supportLevels', async () => {
      const bodyWithoutSupport = {
        ...baseRequestBody,
        supportLevels: undefined
      }

      const request = new NextRequest('http://localhost:3000/api/swing/entry', {
        method: 'POST',
        body: JSON.stringify(bodyWithoutSupport)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.entryZone).toBeDefined()
    })

    it('ควรใช้ค่า default trendPhase เมื่อไม่ระบุ', async () => {
      const bodyWithoutPhase = {
        ...baseRequestBody,
        trendPhase: undefined
      }

      const request = new NextRequest('http://localhost:3000/api/swing/entry', {
        method: 'POST',
        body: JSON.stringify(bodyWithoutPhase)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // ควรใช้ 'mature' เป็น default
      expect(data.data.rationale).toBeDefined()
    })
  })
})
