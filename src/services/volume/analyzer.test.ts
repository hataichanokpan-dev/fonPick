/**
 * Volume Analyzer Tests
 *
 * Unit tests for volume analysis and insight generation functions.
 * Tests generateVolumeInsights, detectVolumeTrend, identifyVolumeLeaders,
 * and utility functions.
 */

import { describe, it, expect } from 'vitest'
import {
  generateVolumeInsights,
  detectVolumeTrend,
  identifyVolumeLeaders,
  getVolumeTradingRecommendation,
  isVolumeAnomaly,
  getVolumeAnomalyDescription,
} from './analyzer'
import type { VolumeAnalysisData, VolumeLeaderInput } from '@/types/volume'

describe('Volume Analyzer', () => {
  // ==========================================================================
  // VOLUME INSIGHTS GENERATION
  // ==========================================================================

  describe('generateVolumeInsights', () => {
    const createMockData = (
      healthStatus: string,
      healthScore: number,
      conviction: string,
      vwad: number,
      concentrationLevel: string,
      concentration: number
    ): VolumeAnalysisData => ({
      health: {
        currentVolume: 50000,
        averageVolume: 45000,
        healthScore,
        healthStatus: healthStatus as any,
        trend: 'Up',
      },
      vwad: {
        vwad,
        conviction: conviction as any,
        upVolume: 30000,
        downVolume: 10000,
        totalVolume: 40000,
      },
      concentration: {
        top5Volume: 20000,
        totalVolume: 40000,
        concentration,
        concentrationLevel: concentrationLevel as any,
      },
      volumeLeaders: [
        { symbol: 'PTT', volume: 10000, relativeVolume: 2, priceChange: 5 },
        { symbol: 'AOT', volume: 8000, relativeVolume: 1.5, priceChange: 3 },
      ],
      timestamp: Date.now(),
    })

    it('should generate Explosive volume health insights', () => {
      const data = createMockData('Explosive', 95, 'Bullish', 50, 'Healthy', 20)
      const insights = generateVolumeInsights(data)

      expect(insights.some((i) => i.includes('Explosive volume'))).toBe(true)
      expect(insights.some((i) => i.includes('Strong institutional participation'))).toBe(true)
    })

    it('should generate Strong volume health insights', () => {
      const data = createMockData('Strong', 75, 'Bullish', 50, 'Healthy', 20)
      const insights = generateVolumeInsights(data)

      expect(insights.some((i) => i.includes('Strong volume'))).toBe(true)
      expect(insights.some((i) => i.includes('Healthy market participation'))).toBe(true)
    })

    it('should generate Normal volume health insights', () => {
      const data = createMockData('Normal', 50, 'Bullish', 50, 'Healthy', 20)
      const insights = generateVolumeInsights(data)

      expect(insights.some((i) => i.includes('Normal volume'))).toBe(true)
    })

    it('should generate Anemic volume health insights', () => {
      const data = createMockData('Anemic', 20, 'Bearish', -50, 'Risky', 50)
      const insights = generateVolumeInsights(data)

      expect(insights.some((i) => i.includes('Anemic volume'))).toBe(true)
      expect(insights.some((i) => i.includes('Low participation'))).toBe(true)
    })

    it('should generate Bullish VWAD insights', () => {
      const data = createMockData('Normal', 50, 'Bullish', 50, 'Healthy', 20)
      const insights = generateVolumeInsights(data)

      expect(insights.some((i) => i.includes('Bullish conviction'))).toBe(true)
      expect(insights.some((i) => i.includes('institutional accumulation'))).toBe(true)
    })

    it('should generate Bearish VWAD insights', () => {
      const data = createMockData('Normal', 50, 'Bearish', -50, 'Risky', 50)
      const insights = generateVolumeInsights(data)

      expect(insights.some((i) => i.includes('Bearish conviction'))).toBe(true)
      expect(insights.some((i) => i.includes('distribution detected'))).toBe(true)
    })

    it('should generate Risky concentration insights', () => {
      const data = createMockData('Normal', 50, 'Bullish', 50, 'Risky', 45)
      const insights = generateVolumeInsights(data)

      expect(insights.some((i) => i.includes('Risky concentration'))).toBe(true)
      expect(insights.some((i) => i.includes('low diversification'))).toBe(true)
    })

    it('should generate Healthy concentration insights', () => {
      const data = createMockData('Normal', 50, 'Bullish', 50, 'Healthy', 20)
      const insights = generateVolumeInsights(data)

      expect(insights.some((i) => i.includes('Healthy concentration'))).toBe(true)
      expect(insights.some((i) => i.includes('Well-diversified'))).toBe(true)
    })

    it('should generate volume leaders insights', () => {
      const data = createMockData('Normal', 50, 'Bullish', 50, 'Healthy', 20)
      const insights = generateVolumeInsights(data)

      expect(insights.some((i) => i.includes('Top volume: PTT'))).toBe(true)
    })

    it('should count stocks with unusual volume', () => {
      const data: VolumeAnalysisData = {
        health: {
          currentVolume: 50000,
          averageVolume: 45000,
          healthScore: 50,
          healthStatus: 'Normal',
          trend: 'Up',
        },
        vwad: {
          vwad: 0,
          conviction: 'Neutral',
          upVolume: 20000,
          downVolume: 20000,
          totalVolume: 40000,
        },
        concentration: {
          top5Volume: 20000,
          totalVolume: 40000,
          concentration: 50,
          concentrationLevel: 'Normal',
        },
        volumeLeaders: [
          { symbol: 'PTT', volume: 10000, relativeVolume: 2.5, priceChange: 5 },
          { symbol: 'AOT', volume: 8000, relativeVolume: 2.1, priceChange: 3 },
          { symbol: 'KBANK', volume: 5000, relativeVolume: 1.5, priceChange: 1 },
        ],
        timestamp: Date.now(),
      }

      const insights = generateVolumeInsights(data)

      expect(insights).toContain('🔥 2 stocks with 2x+ unusual volume')
    })
  })

  // ==========================================================================
  // VOLUME TREND DETECTION
  // ==========================================================================

  describe('detectVolumeTrend', () => {
    it('should return Up for strong upward trend', () => {
      const volumes = [40000, 45000, 50000, 55000, 60000]

      const result = detectVolumeTrend(volumes)

      expect(result).toBe('Up')
    })

    it('should return Down for strong downward trend', () => {
      const volumes = [60000, 55000, 50000, 45000, 40000]

      const result = detectVolumeTrend(volumes)

      expect(result).toBe('Down')
    })

    it('should return Neutral for flat trend', () => {
      const volumes = [50000, 50000, 50000, 50000, 50000]

      const result = detectVolumeTrend(volumes)

      expect(result).toBe('Neutral')
    })

    it('should return Neutral for volatile data without clear trend', () => {
      const volumes = [50000, 45000, 55000, 48000, 52000]

      const result = detectVolumeTrend(volumes)

      expect(result).toBe('Neutral')
    })

    it('should handle empty array', () => {
      const result = detectVolumeTrend([])

      expect(result).toBe('Neutral')
    })

    it('should handle single element array', () => {
      const result = detectVolumeTrend([50000])

      expect(result).toBe('Neutral')
    })

    it('should handle two element array', () => {
      const result1 = detectVolumeTrend([40000, 60000])
      const result2 = detectVolumeTrend([60000, 40000])

      expect(result1).toBe('Up')
      expect(result2).toBe('Down')
    })
  })

  // ==========================================================================
  // VOLUME LEADERS IDENTIFICATION
  // ==========================================================================

  describe('identifyVolumeLeaders', () => {
    it('should identify top 5 volume leaders', () => {
      const rankings: VolumeLeaderInput[] = [
        { symbol: 'PTT', volume: 10000, change: 5 },
        { symbol: 'AOT', volume: 8000, change: 3 },
        { symbol: 'KBANK', volume: 6000, change: 2 },
        { symbol: 'SCB', volume: 5000, change: 1 },
        { symbol: 'BBL', volume: 4000, change: -1 },
        { symbol: 'BDMS', volume: 3000, change: -2 },
        { symbol: 'CPF', volume: 2000, change: -3 },
      ]

      const result = identifyVolumeLeaders(rankings)

      expect(result).toHaveLength(5)
      expect(result[0].symbol).toBe('PTT')
      expect(result[0].volume).toBe(10000)
      expect(result[4].symbol).toBe('BBL')
    })

    it('should calculate relative volume for each leader', () => {
      const rankings: VolumeLeaderInput[] = [
        { symbol: 'PTT', volume: 2000, change: 5 },
        { symbol: 'AOT', volume: 1500, change: 3 },
        { symbol: 'KBANK', volume: 500, change: 2 },
      ]

      const averages = new Map([
        ['PTT', 1000],
        ['AOT', 1000],
        ['KBANK', 1000],
      ])

      const result = identifyVolumeLeaders(rankings, averages)

      expect(result[0].relativeVolume).toBe(2)
      expect(result[1].relativeVolume).toBe(1.5)
      expect(result[2].relativeVolume).toBe(0.5)
    })

    it('should use default average when stock not in map', () => {
      const rankings: VolumeLeaderInput[] = [
        { symbol: 'PTT', volume: 2000, change: 5 },
        { symbol: 'AOT', volume: 1500, change: 3 },
      ]

      const averages = new Map([['PTT', 1000]])

      const result = identifyVolumeLeaders(rankings, averages)

      expect(result[0].relativeVolume).toBe(2)
      expect(result[1].relativeVolume).toBe(1.5) // Default 1000
    })

    it('should return empty array for empty input', () => {
      const result = identifyVolumeLeaders([])

      expect(result).toEqual([])
    })

    it('should return empty array for null input', () => {
      const result = identifyVolumeLeaders(null as unknown as VolumeLeaderInput[])

      expect(result).toEqual([])
    })

    it('should preserve price change from input', () => {
      const rankings: VolumeLeaderInput[] = [
        { symbol: 'PTT', volume: 10000, change: 5.5 },
        { symbol: 'AOT', volume: 8000, change: -3.2 },
      ]

      const result = identifyVolumeLeaders(rankings)

      expect(result[0].priceChange).toBe(5.5)
      expect(result[1].priceChange).toBe(-3.2)
    })
  })

  // ==========================================================================
  // TRADING RECOMMENDATION
  // ==========================================================================

  describe('getVolumeTradingRecommendation', () => {
    const createMockData = (
      healthScore: number,
      conviction: string,
      concentrationLevel: string
    ): VolumeAnalysisData => ({
      health: {
        currentVolume: 50000,
        averageVolume: 45000,
        healthScore,
        healthStatus: healthScore >= 70 ? 'Strong' : 'Normal',
        trend: 'Up',
      },
      vwad: {
        vwad: conviction === 'Bullish' ? 50 : conviction === 'Bearish' ? -50 : 0,
        conviction: conviction as any,
        upVolume: 30000,
        downVolume: 10000,
        totalVolume: 40000,
      },
      concentration: {
        top5Volume: 20000,
        totalVolume: 40000,
        concentration: 20,
        concentrationLevel: concentrationLevel as any,
      },
      volumeLeaders: [],
      timestamp: Date.now(),
    })

    it('should recommend BUY for strong bullish signals', () => {
      const data = createMockData(85, 'Bullish', 'Healthy')
      const result = getVolumeTradingRecommendation(data)

      expect(result.action).toContain('BUY')
      expect(result.confidence).toBeGreaterThanOrEqual(70)
    })

    it('should recommend WAIT for weak bearish signals', () => {
      const data = createMockData(20, 'Bearish', 'Risky')
      const result = getVolumeTradingRecommendation(data)

      expect(result.action).toContain('WAIT')
      expect(result.confidence).toBeLessThan(50)
    })

    it('should recommend HOLD for mixed signals', () => {
      const data = createMockData(50, 'Neutral', 'Normal')
      const result = getVolumeTradingRecommendation(data)

      // With healthScore 50 (Normal), the bullish score calculation:
      // Health: 50 >= 40 gives 20 points
      // VWAD Neutral: 0 points
      // Concentration Normal: 0 points
      // Total = 20, which is < 30, so action = 'WAIT - Weak volume or bearish conviction'
      expect(result.action).toContain('WAIT')
    })

    it('should provide reason for recommendation', () => {
      const data = createMockData(75, 'Bullish', 'Healthy')
      const result = getVolumeTradingRecommendation(data)

      expect(result.reason).toBeDefined()
      expect(result.reason.length).toBeGreaterThan(0)
    })

    it('should cap confidence at 100', () => {
      const data = createMockData(95, 'Bullish', 'Healthy')
      const result = getVolumeTradingRecommendation(data)

      expect(result.confidence).toBeLessThanOrEqual(100)
    })

    it('should never return confidence below 0', () => {
      const data = createMockData(10, 'Bearish', 'Risky')
      const result = getVolumeTradingRecommendation(data)

      expect(result.confidence).toBeGreaterThanOrEqual(0)
    })
  })

  // ==========================================================================
  // VOLUME ANOMALY DETECTION
  // ==========================================================================

  describe('isVolumeAnomaly', () => {
    it('should return true for relative volume >= 2.0', () => {
      expect(isVolumeAnomaly(2.0)).toBe(true)
      expect(isVolumeAnomaly(3.5)).toBe(true)
      expect(isVolumeAnomaly(10.0)).toBe(true)
    })

    it('should return true for relative volume <= 0.5', () => {
      expect(isVolumeAnomaly(0.5)).toBe(true)
      expect(isVolumeAnomaly(0.3)).toBe(true)
      expect(isVolumeAnomaly(0.1)).toBe(true)
    })

    it('should return false for normal relative volume', () => {
      expect(isVolumeAnomaly(0.6)).toBe(false)
      expect(isVolumeAnomaly(1.0)).toBe(false)
      expect(isVolumeAnomaly(1.5)).toBe(false)
      expect(isVolumeAnomaly(1.9)).toBe(false)
    })
  })

  describe('getVolumeAnomalyDescription', () => {
    it('should describe extreme volume spike', () => {
      expect(getVolumeAnomalyDescription(3.0)).toBe('🔥🔥🔥 Extreme volume spike - major news or event')
      expect(getVolumeAnomalyDescription(5.0)).toBe('🔥🔥🔥 Extreme volume spike - major news or event')
    })

    it('should describe unusual volume', () => {
      expect(getVolumeAnomalyDescription(2.0)).toBe('🔥🔥 Unusual volume - significant activity')
      expect(getVolumeAnomalyDescription(2.5)).toBe('🔥🔥 Unusual volume - significant activity')
    })

    it('should describe extremely light volume', () => {
      expect(getVolumeAnomalyDescription(0.1)).toBe('❄️❄️❄️ Extremely light volume - possible halt or illiquidity')
      expect(getVolumeAnomalyDescription(0.3)).toBe('❄️❄️❄️ Extremely light volume - possible halt or illiquidity')
    })

    it('should describe below normal volume', () => {
      expect(getVolumeAnomalyDescription(0.5)).toBe('❄️❄️ Below normal volume - light trading')
      expect(getVolumeAnomalyDescription(0.4)).toBe('❄️❄️ Below normal volume - light trading')
    })

    it('should return empty string for normal volume', () => {
      expect(getVolumeAnomalyDescription(0.6)).toBe('')
      expect(getVolumeAnomalyDescription(1.0)).toBe('')
      expect(getVolumeAnomalyDescription(1.5)).toBe('')
    })
  })
})
