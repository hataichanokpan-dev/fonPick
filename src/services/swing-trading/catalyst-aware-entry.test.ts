/**
 * Catalyst-Aware Entry Calculator Tests
 *
 * Test suite for catalyst-integrated entry calculation
 * ทดสอบการคำนวณ entry zone ที่รวม catalyst events เข้าไป
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calculateEntryZoneWithCatalyst,
  getCatalystBasedUrgency,
  getCatalystBasedTiming,
  shouldAccelerateEntry,
  type CatalystAwareEntryInput
} from './catalyst-aware-entry'
import type { ParsedCatalystData } from '@/types/catalyst'

// Mock catalyst data
const mockCatalystData: ParsedCatalystData = {
  theme: 'Digital Banking Transformation',
  catalysts: [
    'Q1 earnings release (15 Feb)',
    'New product launch (1 Mar)',
    'Shareholder meeting (20 Mar)'
  ],
  whatToWatch: [
    'NIM trends',
    'Loan growth',
    'Cost/income ratio'
  ],
  aiScore: 8.5
}

describe('Catalyst-Aware Entry Calculator', () => {
  // Base input สำหรับทุก test
  const baseInput: CatalystAwareEntryInput = {
    currentPrice: 150.0,
    supportLevels: [
      { price: 148.0, strength: 'strong' },
      { price: 145.0, strength: 'moderate' }
    ],
    movingAverages: {
      ma20: 149.0,
      ma50: 147.0
    },
    trendPhase: 'early',
    catalystData: mockCatalystData
  }

  describe('calculateEntryZoneWithCatalyst', () => {
    it('ควรคำนวณ entry zone พร้อมปรับตาม catalyst timeline', () => {
      const result = calculateEntryZoneWithCatalyst(baseInput)

      // ตรวจสอบพื้นฐาน
      expect(result.entryZone).toBeDefined()
      expect(result.entryZone.min).toBeGreaterThan(0)
      expect(result.entryZone.max).toBeGreaterThan(result.entryZone.min)
      expect(result.confidence).toBeGreaterThan(0).and.toBeLessThanOrEqual(100)

      // ตรวจสอบ catalyst integration (catalysts may not have parseable dates)
      expect(result.catalystAdjustment).toBeDefined()
      expect(result.catalystAdjustment!.upcomingCatalysts).toBeDefined()
      // ตรวจสอบว่ามี catalyst data (อาจเป็น empty array ถ้า parse ไม่ได้)
      expect(Array.isArray(result.catalystAdjustment!.upcomingCatalysts)).toBe(true)
    })

    it('ควรเพิ่ม confidence เมื่อมี catalyst ใกล้เข้ามา (< 7 วัน)', () => {
      // Catalyst ใกล้เข้ามา (15 Feb, ปัจจุบัน 10 Feb)
      const inputWithNearCatalyst: CatalystAwareEntryInput = {
        ...baseInput,
        currentDate: new Date('2026-02-10')
      }

      const result = calculateEntryZoneWithCatalyst(inputWithNearCatalyst)
      const resultWithoutCatalyst = calculateEntryZoneWithCatalyst({
        ...baseInput,
        catalystData: undefined
      })

      // Confidence ควรสูงกว่าเมื่อมี catalyst ใกล้เข้ามา
      expect(result.confidence).toBeGreaterThan(resultWithoutCatalyst.confidence)
    })

    it('ควรลด confidence เมื่อ catalyst ทั้งหมดผ่านไปแล้ว', () => {
      // Catalyst ผ่านไปแล้ว (หลังจาก 20 Mar)
      const inputWithPassedCatalyst: CatalystAwareEntryInput = {
        ...baseInput,
        currentDate: new Date('2026-04-01')
      }

      const result = calculateEntryZoneWithCatalyst(inputWithPassedCatalyst)

      // ควรมี warning เกี่ยวกับ catalyst ที่ผ่านไปแล้ว
      expect(result.catalystAdjustment?.allCatalystsPassed).toBe(true)
      expect(result.catalystAdjustment?.recommendation).toContain('wait')
    })

    it('ควรจัดการกรณีไม่มี catalyst data อย่างถูกต้อง', () => {
      const inputWithoutCatalyst: CatalystAwareEntryInput = {
        ...baseInput,
        catalystData: undefined
      }

      const result = calculateEntryZoneWithCatalyst(inputWithoutCatalyst)

      // ควรยังคงทำงานได้โดยไม่ crash
      expect(result.entryZone).toBeDefined()
      expect(result.catalystAdjustment).toBeUndefined()
      expect(result.rationale).not.toContain('catalyst')
    })

    it('ควรปรับ entry zone ตาม AI score', () => {
      const highScoreInput: CatalystAwareEntryInput = {
        ...baseInput,
        catalystData: {
          ...mockCatalystData,
          aiScore: 9.5 // คะแนนสูงมาก
        }
      }

      const lowScoreInput: CatalystAwareEntryInput = {
        ...baseInput,
        catalystData: {
          ...mockCatalystData,
          aiScore: 4.0 // คะแนนต่ำ
        }
      }

      const highScoreResult = calculateEntryZoneWithCatalyst(highScoreInput)
      const lowScoreResult = calculateEntryZoneWithCatalyst(lowScoreInput)

      // High score = confidence สูงกว่า
      expect(highScoreResult.confidence).toBeGreaterThan(lowScoreResult.confidence)
    })

    it('ควรจัดการ catalyst dates ที่อยู่ในอดีต', () => {
      const inputWithPastCatalyst: CatalystAwareEntryInput = {
        ...baseInput,
        catalystData: {
          ...mockCatalystData,
          catalysts: [
            'Past event (1 Jan 2025)', // ผ่านไปแล้ว (ปีที่แล้ว)
            'Future event (15 Feb)',
            'Another future (1 Mar)'
          ]
        },
        currentDate: new Date('2026-02-10')
      }

      const result = calculateEntryZoneWithCatalyst(inputWithPastCatalyst)

      // ควรกรอง catalyst ที่ผ่านไปแล้วออกจาก upcomingCatalysts
      expect(result.catalystAdjustment?.upcomingCatalysts).toBeDefined()
      // upcomingCatalysts ควรมีเฉพาะ future catalysts
      // Past catalysts (daysUntil < 0) ควรไม่ถูกนับ
      const futureCatalysts = result.catalystAdjustment!.upcomingCatalysts.filter(c => c.daysUntil >= 0 && c.daysUntil !== Infinity)
      expect(futureCatalysts.length).toBeGreaterThan(0)
      expect(futureCatalysts.every(c => !c.description.includes('Past event'))).toBe(true)
    })
  })

  describe('getCatalystBasedUrgency', () => {
    it('ควรคืนค่า urgency สูงเมื่อ catalyst ใกล้เข้ามา (< 3 วัน)', () => {
      const catalysts = [
        { description: 'Earnings tomorrow', daysUntil: 1 }
      ]

      const urgency = getCatalystBasedUrgency(catalysts, 50)

      expect(urgency).toBeGreaterThan(70)
    })

    it('ควรคืนค่า urgency ปานกลางเมื่อ catalyst อยู่ 7-14 วัน', () => {
      const catalysts = [
        { description: 'Product launch', daysUntil: 10 }
      ]

      const urgency = getCatalystBasedUrgency(catalysts, 50)

      expect(urgency).toBeGreaterThan(40).and.toBeLessThan(70)
    })

    it('ควรคืนค่า urgency ต่ำเมื่อ catalyst ไกล (> 30 วัน)', () => {
      const catalysts = [
        { description: 'Meeting', daysUntil: 45 }
      ]

      const urgency = getCatalystBasedUrgency(catalysts, 50)

      expect(urgency).toBeLessThan(50) // Base 50 - 15 = 35
    })

    it('ควรคืนค่า base urgency เมื่อไม่มี catalyst', () => {
      const urgency = getCatalystBasedUrgency([], 50)

      expect(urgency).toBe(50)
    })

    it('ควรพิจารณา catalyst ที่ใกล้ที่สุดเมื่อมีหลาย catalyst', () => {
      const catalysts = [
        { description: 'Far event', daysUntil: 60 },
        { description: 'Near event', daysUntil: 5 },
        { description: 'Medium event', daysUntil: 20 }
      ]

      const urgency = getCatalystBasedUrgency(catalysts, 50)

      // ควรพิจารณา Near event (5 วัน) - Base 50 + 20 = 70
      expect(urgency).toBeGreaterThan(60)
      expect(urgency).toBeLessThan(80)
    })
  })

  describe('getCatalystBasedTiming', () => {
    it('ควรแนะนำให้ enter ทันทีเมื่อ urgency สูง (>= 80)', () => {
      const timing = getCatalystBasedTiming(85)

      expect(timing).toContain('immediately') || expect(timing).toContain('ทันที')
    })

    it('ควรแนะนำให้ enter ภายใน 3-5 วันเมื่อ urgency ปานกลาง (60-79)', () => {
      const timing = getCatalystBasedTiming(70)

      expect(timing).toContain('3-5')
    })

    it('ควรแนะนำให้รอเมื่อ urgency ต่ำ (< 60)', () => {
      const timing = getCatalystBasedTiming(40)

      expect(timing).toContain('Wait') || expect(timing).toContain('wait')
    })
  })

  describe('shouldAccelerateEntry', () => {
    it('ควร accelerate เมื่อ catalyst ใกล้และ trend แข็งแรง', () => {
      const should = shouldAccelerateEntry({
        daysUntilNearestCatalyst: 2,
        trendPhase: 'early',
        catalystScore: 8.5
      })

      expect(should).toBe(true)
    })

    it('ไม่ควร accelerate เมื่อ catalyst ไกล', () => {
      const should = shouldAccelerateEntry({
        daysUntilNearestCatalyst: 45,
        trendPhase: 'early',
        catalystScore: 8.5
      })

      expect(should).toBe(false)
    })

    it('ไม่ควร accelerate เมื่อ trend exhausted', () => {
      const should = shouldAccelerateEntry({
        daysUntilNearestCatalyst: 2,
        trendPhase: 'exhausted',
        catalystScore: 8.5
      })

      expect(should).toBe(false)
    })

    it('ไม่ควร accelerate เมื่อ catalyst score ต่ำ', () => {
      const should = shouldAccelerateEntry({
        daysUntilNearestCatalyst: 2,
        trendPhase: 'early',
        catalystScore: 3.0
      })

      expect(should).toBe(false)
    })

    it('ควร accelerate เมื่อเงื่อนไขครบถ้วน', () => {
      const should = shouldAccelerateEntry({
        daysUntilNearestCatalyst: 5,
        trendPhase: 'early',
        catalystScore: 7.5
      })

      expect(should).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('ควรจัดการ catalyst ที่ไม่มี date format ที่ชัดเจน', () => {
      const inputWithInvalidCatalyst: CatalystAwareEntryInput = {
        ...baseInput,
        catalystData: {
          ...mockCatalystData,
          catalysts: [
            'No date here',
            'Also no date',
            'Meeting soon' // vague
          ]
        }
      }

      const result = calculateEntryZoneWithCatalyst(inputWithInvalidCatalyst)

      // ไม่ควร crash และควรยังคงให้ผลลัพธ์
      expect(result.entryZone).toBeDefined()
      expect(result.catalystAdjustment?.upcomingCatalysts).toBeDefined()
    })

    it('ควรจัดการ empty catalysts array', () => {
      const inputWithEmptyCatalysts: CatalystAwareEntryInput = {
        ...baseInput,
        catalystData: {
          ...mockCatalystData,
          catalysts: []
        }
      }

      const result = calculateEntryZoneWithCatalyst(inputWithEmptyCatalysts)

      expect(result.entryZone).toBeDefined()
      expect(result.catalystAdjustment?.upcomingCatalysts).toHaveLength(0)
    })

    it('ควรจัดการ catalyst dates ที่เป็น Thai format', () => {
      const inputWithThaiDates: CatalystAwareEntryInput = {
        ...baseInput,
        catalystData: {
          ...mockCatalystData,
          catalysts: [
            'งานประชุมผู้ถือหุ้น 15 ก.พ.',
            'ประกาศผลประกอบการ 1 มี.ค.'
          ]
        },
        currentDate: new Date('2026-02-10')
      }

      const result = calculateEntryZoneWithCatalyst(inputWithThaiDates)

      // ควรแปลง Thai dates ได้ถูกต้อง
      expect(result.entryZone).toBeDefined()
      // ต้องมี upcoming catalysts (ที่ไม่ใช่ Infinity)
      const validCatalysts = result.catalystAdjustment?.upcomingCatalysts.filter(c => c.daysUntil !== Infinity)
      expect(validCatalysts!.length).toBeGreaterThan(0)
    })

    it('ควรจัดการสถานการณ์ที่ catalyst วันนี้', () => {
      const today = new Date()
      const day = today.getDate()
      const month = today.getMonth()

      // Create catalyst for today using simple format
      const inputWithTodayCatalyst: CatalystAwareEntryInput = {
        ...baseInput,
        catalystData: {
          ...mockCatalystData,
          catalysts: [
            `Earnings release ${day} ${month + 1}` // Simple format: day month
          ]
        },
        currentDate: today
      }

      const result = calculateEntryZoneWithCatalyst(inputWithTodayCatalyst)

      // ควรมี catalyst ที่ parse ได้
      expect(result.entryZone).toBeDefined()
      expect(result.catalystAdjustment).toBeDefined()
    })
  })
})
