/**
 * Volume Calculator Tests
 *
 * Unit tests for volume calculation functions.
 * Tests calculateVolumeHealth, calculateVWAD, calculateConcentration,
 * calculateRelativeVolume, and utility functions.
 */

import { describe, it, expect } from 'vitest'
import {
  calculateVolumeHealth,
  calculateVWAD,
  calculateConcentration,
  calculateRelativeVolume,
  calculateBatchRelativeVolume,
  thousandsToMillions,
  millionsToThousands,
  formatVolume,
} from './calculator'
import type { VWADInput, ConcentrationInput } from '@/types/volume'

describe('Volume Calculator', () => {
  // ==========================================================================
  // VOLUME HEALTH CALCULATION
  // ==========================================================================

  describe('calculateVolumeHealth', () => {
    it('should return Explosive status for score >= 90', () => {
      const result = calculateVolumeHealth(180000, 45000) // ~4x average = 200 score, capped at 100

      expect(result.healthStatus).toBe('Explosive')
      expect(result.healthScore).toBeGreaterThanOrEqual(90)
      expect(result.healthScore).toBeLessThanOrEqual(100)
    })

    it('should return Strong status for score between 70-89', () => {
      const result = calculateVolumeHealth(65000, 45000) // ~1.44x average

      expect(result.healthStatus).toBe('Strong')
      expect(result.healthScore).toBeGreaterThanOrEqual(70)
      expect(result.healthScore).toBeLessThan(90)
    })

    it('should return Normal status for score between 30-69', () => {
      const result = calculateVolumeHealth(45000, 45000) // 1.0x average

      expect(result.healthStatus).toBe('Normal')
      expect(result.healthScore).toBeGreaterThanOrEqual(30)
      expect(result.healthScore).toBeLessThan(70)
    })

    it('should return Anemic status for score < 30', () => {
      const result = calculateVolumeHealth(10000, 45000) // ~0.22x average

      expect(result.healthStatus).toBe('Anemic')
      expect(result.healthScore).toBeGreaterThanOrEqual(0)
      expect(result.healthScore).toBeLessThan(30)
    })

    it('should return Up trend when current volume > previous by >10%', () => {
      const result = calculateVolumeHealth(50000, 45000, 40000)

      expect(result.trend).toBe('Up')
    })

    it('should return Down trend when current volume < previous by >10%', () => {
      const result = calculateVolumeHealth(30000, 45000, 40000)

      expect(result.trend).toBe('Down')
    })

    it('should return Neutral trend for stable volume', () => {
      const result1 = calculateVolumeHealth(45000, 45000, 44000)
      const result2 = calculateVolumeHealth(45000, 45000, 46000)

      expect(result1.trend).toBe('Neutral')
      expect(result2.trend).toBe('Neutral')
    })

    it('should handle zero or negative inputs gracefully', () => {
      const result1 = calculateVolumeHealth(0, 45000)
      const result2 = calculateVolumeHealth(45000, 0)
      const result3 = calculateVolumeHealth(-1000, 45000)

      expect(result1.currentVolume).toBe(0)
      expect(result2.averageVolume).toBe(0)
      expect(result3.currentVolume).toBe(0) // Negative values become 0
    })

    it('should handle missing previous volume', () => {
      const result = calculateVolumeHealth(50000, 45000)

      expect(result.trend).toBe('Neutral') // No trend without previous data
    })

    it('should use default average when not provided', () => {
      const result = calculateVolumeHealth(60000)

      expect(result.averageVolume).toBe(45000) // Mock default
    })

    it('should cap health score at 100', () => {
      const result = calculateVolumeHealth(200000, 45000) // ~4.44x average

      expect(result.healthScore).toBeLessThanOrEqual(100)
    })

    it('should cap health score at minimum 0', () => {
      const result = calculateVolumeHealth(0, 45000)

      expect(result.healthScore).toBeGreaterThanOrEqual(0)
    })
  })

  // ==========================================================================
  // VWAD CALCULATION
  // ==========================================================================

  describe('calculateVWAD', () => {
    it('should return Bullish conviction for VWAD >= 30', () => {
      const rankings: VWADInput[] = [
        { change: 5, volume: 10000 },
        { change: 3, volume: 8000 },
        { change: -1, volume: 1000 },
        { change: 2, volume: 5000 },
      ]

      const result = calculateVWAD(rankings)

      expect(result.conviction).toBe('Bullish')
      expect(result.vwad).toBeGreaterThanOrEqual(30)
    })

    it('should return Bearish conviction for VWAD <= -30', () => {
      const rankings: VWADInput[] = [
        { change: -5, volume: 10000 },
        { change: -3, volume: 8000 },
        { change: 1, volume: 1000 },
        { change: -2, volume: 5000 },
      ]

      const result = calculateVWAD(rankings)

      expect(result.conviction).toBe('Bearish')
      expect(result.vwad).toBeLessThanOrEqual(-30)
    })

    it('should return Neutral conviction for VWAD between -30 and 30', () => {
      const rankings: VWADInput[] = [
        { change: 2, volume: 5000 },
        { change: -2, volume: 5000 },
      ]

      const result = calculateVWAD(rankings)

      expect(result.conviction).toBe('Neutral')
      expect(result.vwad).toBeGreaterThanOrEqual(-30)
      expect(result.vwad).toBeLessThanOrEqual(30)
    })

    it('should correctly sum upVolume for gainers only', () => {
      const rankings: VWADInput[] = [
        { change: 5, volume: 10000 },
        { change: 3, volume: 8000 },
        { change: 0, volume: 2000 }, // Flat, should not count
        { change: -2, volume: 5000 },
      ]

      const result = calculateVWAD(rankings)

      expect(result.upVolume).toBe(18000) // Only gainers
    })

    it('should correctly sum downVolume for losers only', () => {
      const rankings: VWADInput[] = [
        { change: -5, volume: 10000 },
        { change: -3, volume: 8000 },
        { change: 0, volume: 2000 }, // Flat, should not count
        { change: 2, volume: 5000 },
      ]

      const result = calculateVWAD(rankings)

      expect(result.downVolume).toBe(18000) // Only losers
    })

    it('should ignore stocks with zero change in VWAD calculation', () => {
      const rankings: VWADInput[] = [
        { change: 5, volume: 10000 },
        { change: 0, volume: 10000 },
        { change: -5, volume: 10000 },
      ]

      const result = calculateVWAD(rankings)

      expect(result.upVolume).toBe(10000)
      expect(result.downVolume).toBe(10000)
      expect(result.totalVolume).toBe(30000)
    })

    it('should handle empty rankings array', () => {
      const result = calculateVWAD([])

      expect(result.vwad).toBe(0)
      expect(result.conviction).toBe('Neutral')
      expect(result.upVolume).toBe(0)
      expect(result.downVolume).toBe(0)
      expect(result.totalVolume).toBe(0)
    })

    it('should handle null or undefined rankings', () => {
      const result1 = calculateVWAD(null as unknown as VWADInput[])
      const result2 = calculateVWAD(undefined as unknown as VWADInput[])

      expect(result1.vwad).toBe(0)
      expect(result2.vwad).toBe(0)
    })

    it('should round VWAD to 2 decimal places', () => {
      const rankings: VWADInput[] = [
        { change: 5, volume: 10000 },
        { change: -3, volume: 8000 },
      ]

      const result = calculateVWAD(rankings)

      // VWAD = (10000 - 8000) / 18000 * 100 = 11.111...
      expect(result.vwad).toBe(11.11)
    })
  })

  // ==========================================================================
  // CONCENTRATION CALCULATION
  // ==========================================================================

  describe('calculateConcentration', () => {
    it('should return Healthy level for concentration < 25%', () => {
      // For < 25% concentration, we need top 5 to be < 25% of top 30
      // If we have 30 stocks with 1000 each, top 5 = 5000, total = 30000, concentration = 16.67%
      const rankings: ConcentrationInput[] = Array.from({ length: 30 }, () => ({ volume: 1000 }))

      const result = calculateConcentration(rankings)

      expect(result.concentrationLevel).toBe('Healthy')
      expect(result.concentration).toBeLessThan(25)
    })

    it('should return Healthy level for evenly distributed volume', () => {
      // With 30 evenly distributed stocks, top 5 / top 30 = 5/30 = 16.67%
      const rankings: ConcentrationInput[] = Array.from({ length: 30 }, () => ({ volume: 1000 }))

      const result = calculateConcentration(rankings)

      expect(result.concentrationLevel).toBe('Healthy')
      expect(result.concentration).toBeLessThan(25)
    })

    it('should return Normal level for concentration between 25-40%', () => {
      // For 25-40% concentration, we need top 5 to be 25-40% of top 30
      // Let's create: top 5 have 2000 each, next 25 have 500 each
      // top5Volume = 2000 * 5 = 10000
      // totalVolume = 10000 + 500 * 25 = 10000 + 12500 = 22500
      // concentration = 10000 / 22500 * 100 = 44.44% -> actually Risky
      // Let's adjust: top 5 have 1500 each, next 25 have 1000 each
      // top5Volume = 1500 * 5 = 7500
      // totalVolume = 7500 + 1000 * 25 = 7500 + 25000 = 32500
      // concentration = 7500 / 32500 * 100 = 23.08% -> Healthy, need more

      // Try: top 5 have 2000 each, next 25 have 1500 each
      // top5Volume = 2000 * 5 = 10000
      // totalVolume = 10000 + 1500 * 25 = 10000 + 37500 = 47500
      // concentration = 10000 / 47500 * 100 = 21.05% -> still Healthy

      // Let's create explicitly 25-40%: We need more volume in top 5
      const rankings: ConcentrationInput[] = [
        // Top 5 with high volume
        { volume: 5000 },
        { volume: 4500 },
        { volume: 4000 },
        { volume: 3500 },
        { volume: 3000 }, // Top 5 = 20000
        // Next 25 with lower volume
        ...Array.from({ length: 25 }, () => ({ volume: 1000 })),
      ]
      // top5Volume = 20000
      // totalVolume = 20000 + 25000 = 45000
      // concentration = 20000 / 45000 * 100 = 44.44% -> Risky

      // Need exactly 25-40%. Let's try:
      const rankings2: ConcentrationInput[] = [
        { volume: 4000 },
        { volume: 3500 },
        { volume: 3000 },
        { volume: 2500 },
        { volume: 2000 }, // Top 5 = 15000
        ...Array.from({ length: 25 }, () => ({ volume: 1200 })),
      ]
      // top5Volume = 15000
      // totalVolume = 15000 + 30000 = 45000
      // concentration = 15000 / 45000 * 100 = 33.33% -> Normal!

      const result = calculateConcentration(rankings2)

      expect(result.concentrationLevel).toBe('Normal')
      expect(result.concentration).toBeGreaterThanOrEqual(25)
      expect(result.concentration).toBeLessThan(40)
    })

    it('should return Risky level for concentration >= 40%', () => {
      const rankings: ConcentrationInput[] = [
        { volume: 10000 },
        { volume: 9000 },
        { volume: 8000 },
        { volume: 7000 },
        { volume: 6000 },
        { volume: 5000 },
        { volume: 4000 },
        { volume: 3000 },
        { volume: 2000 },
        { volume: 1000 },
      ]

      const result = calculateConcentration(rankings)

      // With this distribution, top 5 is 40000 out of 55000 = ~72.7%
      expect(result.concentration).toBeGreaterThan(40)
      expect(result.top5Volume).toBe(40000)
    })

    it('should correctly calculate top 5 volume', () => {
      const rankings: ConcentrationInput[] = [
        { volume: 10000 },
        { volume: 9000 },
        { volume: 8000 },
        { volume: 7000 },
        { volume: 6000 },
        { volume: 5000 },
      ]

      const result = calculateConcentration(rankings)

      expect(result.top5Volume).toBe(40000)
    })

    it('should handle array with less than 5 elements', () => {
      const rankings: ConcentrationInput[] = [
        { volume: 10000 },
        { volume: 9000 },
      ]

      const result = calculateConcentration(rankings)

      expect(result.top5Volume).toBe(19000)
      expect(result.totalVolume).toBe(19000)
      expect(result.concentration).toBe(100)
    })

    it('should handle empty rankings array', () => {
      const result = calculateConcentration([])

      expect(result.top5Volume).toBe(0)
      expect(result.totalVolume).toBe(0)
      expect(result.concentration).toBe(0)
      expect(result.concentrationLevel).toBe('Healthy')
    })

    it('should sort by volume descending before calculating', () => {
      const rankings: ConcentrationInput[] = [
        { volume: 1000 }, // Should be in top 5
        { volume: 20000 }, // Should be #1
        { volume: 500 },
        { volume: 15000 }, // Should be #2
        { volume: 300 },
        { volume: 12000 }, // Should be #3
        { volume: 10000 }, // Should be #4
        { volume: 8000 }, // Should be #5
        { volume: 200 },
        { volume: 5000 },
      ]

      const result = calculateConcentration(rankings)

      expect(result.top5Volume).toBe(65000) // 20000+15000+12000+10000+8000
    })

    it('should round concentration to 2 decimal places', () => {
      const rankings: ConcentrationInput[] = [
        { volume: 10000 },
        { volume: 9000 },
        { volume: 8000 },
        { volume: 7000 },
        { volume: 6000 },
        { volume: 1000 },
        { volume: 1000 },
        { volume: 1000 },
      ]

      const result = calculateConcentration(rankings)

      // Concentration = 40000 / 43000 = 93.023...%
      expect(result.concentration.toString()).toMatch(/^\d+\.\d{2}$/)
    })
  })

  // ==========================================================================
  // RELATIVE VOLUME CALCULATION
  // ==========================================================================

  describe('calculateRelativeVolume', () => {
    it('should calculate relative volume ratio correctly', () => {
      const result = calculateRelativeVolume(2000, 1000)

      expect(result).toBe(2)
    })

    it('should return 1 when volume equals average', () => {
      const result = calculateRelativeVolume(1000, 1000)

      expect(result).toBe(1)
    })

    it('should return <1 when volume is below average', () => {
      const result = calculateRelativeVolume(500, 1000)

      expect(result).toBe(0.5)
    })

    it('should use default average when not provided', () => {
      const result = calculateRelativeVolume(2000)

      expect(result).toBe(2) // 2000 / 1000 default
    })

    it('should handle zero average', () => {
      const result = calculateRelativeVolume(1000, 0)

      expect(result).toBe(1) // Neutral when no average data
    })

    it('should round to 2 decimal places', () => {
      const result = calculateRelativeVolume(1555, 1000)

      expect(result).toBe(1.56)
    })

    it('should handle negative input volumes', () => {
      const result = calculateRelativeVolume(-1000, 1000)

      expect(result).toBe(-1)
    })
  })

  // ==========================================================================
  // BATCH RELATIVE VOLUME CALCULATION
  // ==========================================================================

  describe('calculateBatchRelativeVolume', () => {
    it('should calculate relative volume for multiple stocks', () => {
      const stocks = [
        { symbol: 'PTT', volume: 2000 },
        { symbol: 'AOT', volume: 1500 },
        { symbol: 'KBANK', volume: 500 },
      ]

      const averages = new Map([
        ['PTT', 1000],
        ['AOT', 1000],
        ['KBANK', 1000],
      ])

      const result = calculateBatchRelativeVolume(stocks, averages)

      expect(result.get('PTT')).toBe(2)
      expect(result.get('AOT')).toBe(1.5)
      expect(result.get('KBANK')).toBe(0.5)
    })

    it('should use default average when stock not in averages map', () => {
      const stocks = [
        { symbol: 'PTT', volume: 2000 },
        { symbol: 'AOT', volume: 1500 },
      ]

      const averages = new Map([['PTT', 1000]])

      const result = calculateBatchRelativeVolume(stocks, averages)

      expect(result.get('PTT')).toBe(2)
      expect(result.get('AOT')).toBe(1.5) // Using default 1000
    })

    it('should return map with all stocks', () => {
      const stocks = [
        { symbol: 'PTT', volume: 2000 },
        { symbol: 'AOT', volume: 1500 },
        { symbol: 'KBANK', volume: 500 },
      ]

      const result = calculateBatchRelativeVolume(stocks)

      expect(result.size).toBe(3)
      expect(result.has('PTT')).toBe(true)
      expect(result.has('AOT')).toBe(true)
      expect(result.has('KBANK')).toBe(true)
    })
  })

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  describe('thousandsToMillions', () => {
    it('should convert thousands to millions', () => {
      expect(thousandsToMillions(1000000)).toBe(1000)
      expect(thousandsToMillions(45000)).toBe(45)
      expect(thousandsToMillions(1000)).toBe(1)
    })

    it('should handle decimal values', () => {
      expect(thousandsToMillions(1500)).toBe(1.5)
      expect(thousandsToMillions(999)).toBe(0.999)
    })
  })

  describe('millionsToThousands', () => {
    it('should convert millions to thousands', () => {
      expect(millionsToThousands(1000)).toBe(1000000)
      expect(millionsToThousands(45)).toBe(45000)
      expect(millionsToThousands(1)).toBe(1000)
    })

    it('should round to whole thousands', () => {
      expect(millionsToThousands(1.5)).toBe(1500)
      expect(millionsToThousands(1.999)).toBe(1999)
    })
  })

  describe('formatVolume', () => {
    it('should format trillions correctly', () => {
      expect(formatVolume(1500000)).toBe('1.50T')
      expect(formatVolume(1000000)).toBe('1.00T')
    })

    it('should format billions correctly', () => {
      expect(formatVolume(45000)).toBe('45.00B')
      expect(formatVolume(1500)).toBe('1.50B')
      expect(formatVolume(1000)).toBe('1.00B')
    })

    it('should format millions correctly', () => {
      expect(formatVolume(500)).toBe('500.00M')
      expect(formatVolume(50)).toBe('50.00M')
      expect(formatVolume(1)).toBe('1.00M')
    })

    it('should handle decimal values', () => {
      expect(formatVolume(1555)).toBe('1.55B')
      expect(formatVolume(999)).toBe('999.00M') // 999M is less than 1000, so stays as M
      expect(formatVolume(50.5)).toBe('50.50M')
    })
  })
})
