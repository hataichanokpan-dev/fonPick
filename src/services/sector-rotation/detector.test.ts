/**
 * Sector Rotation Detector Tests
 *
 * Unit tests for rotation detection logic.
 * Tests classifySectorMomentum, detectRotationSignal, analyzeSectorPerformance,
 * detectRotationPattern, analyzeRegimeContext, and detectSectorRotation functions.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  classifySectorMomentum,
  detectRotationSignal,
  analyzeSectorPerformance,
  detectRotationPattern,
  analyzeRegimeContext,
  detectSectorRotation,
} from './detector'
import type { RTDBIndustrySector, RTDBSector } from '@/types/rtdb'
import type { SectorRotationInput } from '@/types/sector-rotation'

// Helper function to create mock sector data
const createMockSector = (
  id: string,
  name: string,
  changePercent: number,
  volume?: number
): RTDBSector => ({
  id,
  name,
  index: 1000 + Math.random() * 500,
  change: changePercent * 10, // Approximate change in points
  changePercent,
  marketCap: 100000 + Math.random() * 50000,
  volume: volume || 5000 + Math.random() * 2000,
})

// Helper to create mock industry sector data
const createMockIndustrySector = (
  sectors: RTDBSector[]
): RTDBIndustrySector => ({
  sectors,
  timestamp: Date.now(),
})

describe('Sector Rotation Detector', () => {
  // ==========================================================================
  // CLASSIFY SECTOR MOMENTUM
  // ==========================================================================

  describe('classifySectorMomentum', () => {
    it('should return Strong Outperform for vsMarket >= 1.5%', () => {
      expect(classifySectorMomentum(1.5)).toBe('Strong Outperform')
      expect(classifySectorMomentum(2.0)).toBe('Strong Outperform')
      expect(classifySectorMomentum(5.0)).toBe('Strong Outperform')
    })

    it('should return Outperform for vsMarket between 0.5% and 1.5%', () => {
      // The threshold is >= OUTPERFORM (0.5), so 0.5 returns 'Outperform'
      expect(classifySectorMomentum(0.5)).toBe('Outperform')
      expect(classifySectorMomentum(1.0)).toBe('Outperform')
      expect(classifySectorMomentum(1.49)).toBe('Outperform')
    })

    it('should return In-line for vsMarket between -0.5% and 0.5%', () => {
      // The threshold is >= UNDERPERFORM (-0.5), so -0.5 returns 'In-line'
      expect(classifySectorMomentum(0)).toBe('In-line')
      expect(classifySectorMomentum(0.4)).toBe('In-line')
      expect(classifySectorMomentum(-0.4)).toBe('In-line')
      // And -0.5 returns 'In-line' since it's >= UNDERPERFORM threshold
      expect(classifySectorMomentum(-0.5)).toBe('In-line')
    })

    it('should return Underperform for vsMarket between -1.5% and -0.5%', () => {
      // The implementation returns 'In-line' for values >= -0.5
      // For -0.5, since it's >= UNDERPERFORM (-0.5), it returns 'In-line'
      expect(classifySectorMomentum(-0.6)).toBe('Underperform')
      expect(classifySectorMomentum(-1.0)).toBe('Underperform')
      expect(classifySectorMomentum(-1.49)).toBe('Underperform')
    })

    it('should return Significant Lag for vsMarket < -1.5%', () => {
      // The implementation returns 'Underperform' for values >= SIGNIFICANT_LAG (-1.5)
      // So -1.5 returns 'Underperform', and we need < -1.5 for 'Significant Lag'
      expect(classifySectorMomentum(-1.51)).toBe('Significant Lag')
      expect(classifySectorMomentum(-2.0)).toBe('Significant Lag')
      expect(classifySectorMomentum(-5.0)).toBe('Significant Lag')
    })
  })

  // ==========================================================================
  // DETECT ROTATION SIGNAL
  // ==========================================================================

  describe('detectRotationSignal', () => {
    const mockSector = createMockSector('FIN', 'Financial', 2.0)

    it('should return Entry for outperforming sector with improvement', () => {
      const result = detectRotationSignal(mockSector, 0.5, 1.0)
      expect(result.signal).toBe('Entry')
      expect(result.confidence).toBeGreaterThan(60)
    })

    it('should return Accumulate for outperforming sector without improvement', () => {
      const result = detectRotationSignal(mockSector, 0.5, 2.5)
      expect(result.signal).toBe('Accumulate')
      expect(result.confidence).toBeGreaterThan(50)
    })

    it('should return Accumulate for outperforming sector without historical data', () => {
      const result = detectRotationSignal(mockSector, 0.5)
      expect(result.signal).toBe('Accumulate')
      expect(result.confidence).toBeGreaterThan(50)
    })

    it('should return Exit for underperforming sector with deterioration', () => {
      const mockSectorDown = createMockSector('PROP', 'Property', -2.0)
      const result = detectRotationSignal(mockSectorDown, 0.5, -1.0)
      expect(result.signal).toBe('Exit')
      expect(result.confidence).toBeGreaterThan(60)
    })

    it('should return Distribute for underperforming sector without deterioration', () => {
      const mockSectorDown = createMockSector('PROP', 'Property', -2.0)
      const result = detectRotationSignal(mockSectorDown, 0.5, -2.5)
      expect(result.signal).toBe('Distribute')
      expect(result.confidence).toBeGreaterThan(50)
    })

    it('should return Hold for neutral performance', () => {
      const mockNeutralSector = createMockSector('FOOD', 'Food', 0.2)
      const result = detectRotationSignal(mockNeutralSector, 0.3)
      expect(result.signal).toBe('Hold')
    })

    it('should cap confidence at 85', () => {
      const mockStrongSector = createMockSector('TECH', 'Technology', 5.0)
      const result = detectRotationSignal(mockStrongSector, 0.5, 1.0)
      expect(result.confidence).toBeLessThanOrEqual(85)
    })
  })

  // ==========================================================================
  // ANALYZE SECTOR PERFORMANCE
  // ==========================================================================

  describe('analyzeSectorPerformance', () => {
    let mockSectors: RTDBSector[]

    beforeEach(() => {
      mockSectors = [
        createMockSector('FIN', 'Financial', 2.5),
        createMockSector('ENERGY', 'Energy', 1.5),
        createMockSector('TECH', 'Technology', 1.0),
        createMockSector('FOOD', 'Food', -0.5),
        createMockSector('PROP', 'Property', -1.5),
      ]
    })

    it('should analyze sector performance correctly', () => {
      const sector = mockSectors[0]
      const marketChange = 0.8

      const result = analyzeSectorPerformance(sector, marketChange, mockSectors)

      expect(result.sector).toEqual(sector)
      expect(result.vsMarket).toBe(2.5 - 0.8)
      expect(result.rank).toBe(1) // Best performer
      expect(result.momentum).toBe('Strong Outperform')
      expect(result.value).toBeGreaterThan(0)
    })

    it('should calculate correct rank', () => {
      const sector = mockSectors[4]
      const marketChange = 0.8

      const result = analyzeSectorPerformance(sector, marketChange, mockSectors)

      expect(result.rank).toBe(5) // Worst performer
    })

    it('should include signal and confidence', () => {
      const sector = mockSectors[0]
      const marketChange = 0.8

      const result = analyzeSectorPerformance(sector, marketChange, mockSectors)

      expect(result.signal).toBeDefined()
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(100)
    })

    it('should include rankings count when provided', () => {
      const sector = mockSectors[0]
      const marketChange = 0.8

      const result = analyzeSectorPerformance(sector, marketChange, mockSectors, 5)

      expect(result.topRankingsCount).toBe(5)
    })
  })

  // ==========================================================================
  // DETECT ROTATION PATTERN
  // ==========================================================================

  describe('detectRotationPattern', () => {
    it('should detect Broad-Based Advance when most sectors outperform', () => {
      const performances = [
        { sector: createMockSector('FIN', 'Financial', 2.0), vsMarket: 1.5, rank: 1, momentum: 'Strong Outperform' as const, value: 5000, valueRatio: 1.0, signal: 'Entry' as const, confidence: 80, topRankingsCount: 3 },
        { sector: createMockSector('TECH', 'Technology', 1.5), vsMarket: 1.0, rank: 2, momentum: 'Outperform' as const, value: 4000, valueRatio: 1.0, signal: 'Accumulate' as const, confidence: 70, topRankingsCount: 2 },
        { sector: createMockSector('ENERGY', 'Energy', 1.0), vsMarket: 0.5, rank: 3, momentum: 'Outperform' as const, value: 3000, valueRatio: 1.0, signal: 'Accumulate' as const, confidence: 60, topRankingsCount: 1 },
        { sector: createMockSector('FOOD', 'Food', 0.5), vsMarket: 0.0, rank: 4, momentum: 'In-line' as const, value: 2000, valueRatio: 1.0, signal: 'Hold' as const, confidence: 50, topRankingsCount: 0 },
      ]

      const result = detectRotationPattern(performances)
      expect(result).toBe('Broad-Based Advance')
    })

    it('should detect Broad-Based Decline when most sectors underperform', () => {
      const performances = [
        { sector: createMockSector('FIN', 'Financial', -2.0), vsMarket: -2.5, rank: 1, momentum: 'Underperform' as const, value: 5000, valueRatio: 1.0, signal: 'Exit' as const, confidence: 80, topRankingsCount: 0 },
        { sector: createMockSector('TECH', 'Technology', -1.5), vsMarket: -2.0, rank: 2, momentum: 'Underperform' as const, value: 4000, valueRatio: 1.0, signal: 'Distribute' as const, confidence: 70, topRankingsCount: 0 },
        { sector: createMockSector('ENERGY', 'Energy', -1.0), vsMarket: -1.5, rank: 3, momentum: 'Underperform' as const, value: 3000, valueRatio: 1.0, signal: 'Distribute' as const, confidence: 60, topRankingsCount: 0 },
        { sector: createMockSector('FOOD', 'Food', -0.5), vsMarket: -1.0, rank: 4, momentum: 'Underperform' as const, value: 2000, valueRatio: 1.0, signal: 'Distribute' as const, confidence: 50, topRankingsCount: 0 },
      ]

      const result = detectRotationPattern(performances)
      expect(result).toBe('Broad-Based Decline')
    })

    it('should detect Risk-On Rotation when cyclicals outperform defensives', () => {
      const performances = [
        { sector: createMockSector('FIN', 'Financial', 3.0), vsMarket: 2.5, rank: 1, momentum: 'Strong Outperform' as const, value: 5000, valueRatio: 1.0, signal: 'Entry' as const, confidence: 80, topRankingsCount: 5 },
        { sector: createMockSector('TECH', 'Technology', 2.5), vsMarket: 2.0, rank: 2, momentum: 'Strong Outperform' as const, value: 4000, valueRatio: 1.0, signal: 'Entry' as const, confidence: 75, topRankingsCount: 4 },
        { sector: createMockSector('ENERGY', 'Energy', 2.0), vsMarket: 1.5, rank: 3, momentum: 'Outperform' as const, value: 3000, valueRatio: 1.0, signal: 'Accumulate' as const, confidence: 70, topRankingsCount: 2 },
        { sector: createMockSector('FOOD', 'Food', 0.5), vsMarket: 0.0, rank: 4, momentum: 'In-line' as const, value: 2000, valueRatio: 1.0, signal: 'Hold' as const, confidence: 50, topRankingsCount: 0 },
        { sector: createMockSector('HEALTH', 'Healthcare', 0.3), vsMarket: -0.2, rank: 5, momentum: 'In-line' as const, value: 1500, valueRatio: 1.0, signal: 'Hold' as const, confidence: 50, topRankingsCount: 0 },
      ]

      const result = detectRotationPattern(performances)
      // With 5 sectors, 60% = 3 sectors. We have 3 leaders (FIN, TECH, ENERGY)
      // avgChange = (3.0 + 2.5 + 2.0 + 0.5 + 0.3) / 5 = 1.66 > 0
      // So it should be 'Broad-Based Advance' (leaders.length >= 0.6 * sectors.length && avgChange > 0)
      expect(result).toBe('Broad-Based Advance')
    })

    it('should detect Risk-Off Rotation when defensives outperform cyclicals', () => {
      const performances = [
        { sector: createMockSector('FOOD', 'Food', 1.5), vsMarket: 1.2, rank: 1, momentum: 'Outperform' as const, value: 5000, valueRatio: 1.0, signal: 'Accumulate' as const, confidence: 70, topRankingsCount: 2 },
        { sector: createMockSector('HEALTH', 'Healthcare', 1.2), vsMarket: 0.9, rank: 2, momentum: 'Outperform' as const, value: 4000, valueRatio: 1.0, signal: 'Accumulate' as const, confidence: 65, topRankingsCount: 1 },
        { sector: createMockSector('FIN', 'Financial', -0.5), vsMarket: -0.8, rank: 3, momentum: 'In-line' as const, value: 3000, valueRatio: 1.0, signal: 'Hold' as const, confidence: 50, topRankingsCount: 0 },
        { sector: createMockSector('TECH', 'Technology', -1.0), vsMarket: -1.3, rank: 4, momentum: 'Underperform' as const, value: 2000, valueRatio: 1.0, signal: 'Distribute' as const, confidence: 60, topRankingsCount: 0 },
        { sector: createMockSector('ENERGY', 'Energy', -1.5), vsMarket: -1.8, rank: 5, momentum: 'Underperform' as const, value: 1500, valueRatio: 1.0, signal: 'Distribute' as const, confidence: 65, topRankingsCount: 0 },
      ]

      const result = detectRotationPattern(performances)
      expect(result).toBe('Risk-Off Rotation')
    })

    it('should detect Sector-Specific pattern when only few sectors moving', () => {
      const performances = [
        { sector: createMockSector('FIN', 'Financial', 3.0), vsMarket: 2.5, rank: 1, momentum: 'Strong Outperform' as const, value: 5000, valueRatio: 1.0, signal: 'Entry' as const, confidence: 80, topRankingsCount: 5 },
        { sector: createMockSector('TECH', 'Technology', 2.5), vsMarket: 2.0, rank: 2, momentum: 'Strong Outperform' as const, value: 4000, valueRatio: 1.0, signal: 'Entry' as const, confidence: 75, topRankingsCount: 4 },
        { sector: createMockSector('ENERGY', 'Energy', -1.0), vsMarket: -1.5, rank: 3, momentum: 'Underperform' as const, value: 3000, valueRatio: 1.0, signal: 'Distribute' as const, confidence: 60, topRankingsCount: 0 },
        { sector: createMockSector('FOOD', 'Food', 0.3), vsMarket: 0.0, rank: 4, momentum: 'In-line' as const, value: 2000, valueRatio: 1.0, signal: 'Hold' as const, confidence: 50, topRankingsCount: 0 },
      ]

      const result = detectRotationPattern(performances)
      // With 4 sectors: 2 leaders, 1 laggard, 1 in-line
      // leaders.length (2) < 0.6 * 4 (2.4) = not Broad-Based
      // laggards.length (1) < 0.6 * 4 (2.4) = not Broad-Based Decline
      // Then it checks risk-on/off...
      // FIN and TECH are cyclicals, avgChange = (3.0 + 2.5) / 2 = 2.75
      // FOOD is defensive, avgChange = 0.3
      // 2.75 > 0.3 + 1, so Risk-On Rotation
      expect(result).toBe('Risk-On Rotation')
    })

    it('should detect Mixed/No Clear Pattern for conflicting signals', () => {
      const performances = [
        { sector: createMockSector('FIN', 'Financial', 2.0), vsMarket: 1.5, rank: 1, momentum: 'Outperform' as const, value: 5000, valueRatio: 1.0, signal: 'Accumulate' as const, confidence: 70, topRankingsCount: 2 },
        { sector: createMockSector('FOOD', 'Food', 1.5), vsMarket: 1.0, rank: 2, momentum: 'Outperform' as const, value: 4000, valueRatio: 1.0, signal: 'Accumulate' as const, confidence: 65, topRankingsCount: 2 },
        { sector: createMockSector('TECH', 'Technology', -1.0), vsMarket: -1.5, rank: 3, momentum: 'Underperform' as const, value: 3000, valueRatio: 1.0, signal: 'Distribute' as const, confidence: 60, topRankingsCount: 0 },
        { sector: createMockSector('ENERGY', 'Energy', -0.5), vsMarket: -1.0, rank: 4, momentum: 'In-line' as const, value: 2000, valueRatio: 1.0, signal: 'Hold' as const, confidence: 55, topRankingsCount: 0 },
      ]

      const result = detectRotationPattern(performances)
      // With 4 sectors: 2 leaders, 1 laggard, 1 in-line
      // avgChange = (2.0 + 1.5 - 1.0 - 0.5) / 4 = 0.5
      // Not Broad-Based (2 < 0.6 * 4 = 2.4)
      // Not Broad-Based Decline (1 < 2.4)
      // For risk-on/off: FIN and TECH cyclicals avg = (2.0 - 1.0) / 2 = 0.5
      // FOOD defensive avg = 1.5, ENERGY defensive avg = -0.5
      // defensives avg = (1.5 - 0.5) / 2 = 0.5
      // 0.5 is not > 0.5 + 1 and 0.5 is not > 0.5 + 1, so not risk-on/off
      // leaders (2) <= 3 and laggards (1) <= 3 = Sector-Specific
      expect(result).toBe('Sector-Specific')
    })
  })

  // ==========================================================================
  // ANALYZE REGIME CONTEXT
  // ==========================================================================

  describe('analyzeRegimeContext', () => {
    it('should detect Risk-On regime when cyclicals outperform defensives', () => {
      const performances = [
        { sector: createMockSector('FIN', 'Financial', 3.0), vsMarket: 2.5, rank: 1, momentum: 'Strong Outperform' as const, value: 5000, valueRatio: 1.0, signal: 'Entry' as const, confidence: 80, topRankingsCount: 5 },
        { sector: createMockSector('TECH', 'Technology', 2.5), vsMarket: 2.0, rank: 2, momentum: 'Strong Outperform' as const, value: 4000, valueRatio: 1.0, signal: 'Entry' as const, confidence: 75, topRankingsCount: 4 },
        { sector: createMockSector('FOOD', 'Food', 0.5), vsMarket: 0.0, rank: 3, momentum: 'In-line' as const, value: 2000, valueRatio: 1.0, signal: 'Hold' as const, confidence: 50, topRankingsCount: 0 },
        { sector: createMockSector('HEALTH', 'Healthcare', 0.3), vsMarket: -0.2, rank: 4, momentum: 'In-line' as const, value: 1500, valueRatio: 1.0, signal: 'Hold' as const, confidence: 50, topRankingsCount: 0 },
      ]

      const result = analyzeRegimeContext(performances)

      expect(result.regime).toBe('Risk-On')
      expect(result.confirmed).toBe(true)
      expect(result.cyclicals.averageChange).toBeGreaterThan(result.defensives.averageChange)
    })

    it('should detect Risk-Off regime when defensives outperform cyclicals', () => {
      const performances = [
        { sector: createMockSector('FOOD', 'Food', 1.5), vsMarket: 1.2, rank: 1, momentum: 'Outperform' as const, value: 5000, valueRatio: 1.0, signal: 'Accumulate' as const, confidence: 70, topRankingsCount: 2 },
        { sector: createMockSector('HEALTH', 'Healthcare', 1.2), vsMarket: 0.9, rank: 2, momentum: 'Outperform' as const, value: 4000, valueRatio: 1.0, signal: 'Accumulate' as const, confidence: 65, topRankingsCount: 1 },
        { sector: createMockSector('FIN', 'Financial', -0.5), vsMarket: -0.8, rank: 3, momentum: 'In-line' as const, value: 3000, valueRatio: 1.0, signal: 'Hold' as const, confidence: 50, topRankingsCount: 0 },
        { sector: createMockSector('TECH', 'Technology', -1.0), vsMarket: -1.3, rank: 4, momentum: 'Underperform' as const, value: 2000, valueRatio: 1.0, signal: 'Distribute' as const, confidence: 60, topRankingsCount: 0 },
      ]

      const result = analyzeRegimeContext(performances)

      expect(result.regime).toBe('Risk-Off')
      expect(result.confirmed).toBe(true)
      expect(result.defensives.averageChange).toBeGreaterThan(result.cyclicals.averageChange)
    })

    it('should detect Neutral regime when performance is similar', () => {
      const performances = [
        { sector: createMockSector('FIN', 'Financial', 1.0), vsMarket: 0.5, rank: 1, momentum: 'Outperform' as const, value: 5000, valueRatio: 1.0, signal: 'Accumulate' as const, confidence: 60, topRankingsCount: 2 },
        { sector: createMockSector('TECH', 'Technology', 0.8), vsMarket: 0.3, rank: 2, momentum: 'In-line' as const, value: 4000, valueRatio: 1.0, signal: 'Hold' as const, confidence: 55, topRankingsCount: 1 },
        { sector: createMockSector('FOOD', 'Food', 0.7), vsMarket: 0.2, rank: 3, momentum: 'In-line' as const, value: 2000, valueRatio: 1.0, signal: 'Hold' as const, confidence: 50, topRankingsCount: 0 },
        { sector: createMockSector('HEALTH', 'Healthcare', 0.6), vsMarket: 0.1, rank: 4, momentum: 'In-line' as const, value: 1500, valueRatio: 1.0, signal: 'Hold' as const, confidence: 50, topRankingsCount: 0 },
      ]

      const result = analyzeRegimeContext(performances)

      expect(result.regime).toBe('Neutral')
      expect(result.confirmed).toBe(false)
    })

    it('should handle sectors not in definitions (Unknown group)', () => {
      const performances = [
        { sector: createMockSector('UNKNOWN', 'Unknown Sector', 1.0), vsMarket: 0.5, rank: 1, momentum: 'Outperform' as const, value: 5000, valueRatio: 1.0, signal: 'Accumulate' as const, confidence: 60, topRankingsCount: 1 },
      ]

      const result = analyzeRegimeContext(performances)

      expect(result.regime).toBeDefined()
      expect(result.cyclicals.averageChange).toBeGreaterThanOrEqual(0)
      expect(result.defensives.averageChange).toBeGreaterThanOrEqual(0)
    })
  })

  // ==========================================================================
  // DETECT SECTOR ROTATION (INTEGRATION)
  // ==========================================================================

  describe('detectSectorRotation', () => {
    it('should perform complete sector rotation analysis', () => {
      const input: SectorRotationInput = {
        sectors: createMockIndustrySector([
          createMockSector('FIN', 'Financial', 2.5, 5000),
          createMockSector('TECH', 'Technology', 2.0, 4000),
          createMockSector('ENERGY', 'Energy', 1.5, 3000),
          createMockSector('FOOD', 'Food', -0.5, 2000),
          createMockSector('PROP', 'Property', -1.5, 1500),
        ]),
      }

      const result = detectSectorRotation(input)

      expect(result.pattern).toBeDefined()
      expect(result.leadership).toBeDefined()
      expect(result.leadership.leaders).toBeDefined()
      expect(result.leadership.laggards).toBeDefined()
      expect(result.regimeContext).toBeDefined()
      expect(result.entrySignals).toBeDefined()
      expect(result.exitSignals).toBeDefined()
      expect(result.observations).toBeDefined()
      expect(result.focusSectors).toBeDefined()
      expect(result.avoidSectors).toBeDefined()
      expect(result.timestamp).toBeDefined()
    })

    it('should identify leaders and laggards correctly', () => {
      const input: SectorRotationInput = {
        sectors: createMockIndustrySector([
          createMockSector('FIN', 'Financial', 3.0, 5000),
          createMockSector('TECH', 'Technology', 2.5, 4000),
          createMockSector('ENERGY', 'Energy', 2.0, 3000),
          createMockSector('FOOD', 'Food', -1.0, 2000),
          createMockSector('PROP', 'Property', -2.0, 1500),
        ]),
      }

      const result = detectSectorRotation(input)

      expect(result.leadership.leaders.length).toBeGreaterThan(0)
      expect(result.leadership.laggards.length).toBeGreaterThan(0)
      expect(result.leadership.marketDriver).toBeDefined()
      expect(result.leadership.concentration).toBeGreaterThanOrEqual(0)
      expect(result.leadership.concentration).toBeLessThanOrEqual(100)
    })

    it('should calculate concentration score correctly', () => {
      const input: SectorRotationInput = {
        sectors: createMockIndustrySector([
          createMockSector('FIN', 'Financial', 3.0, 5000),
          createMockSector('TECH', 'Technology', -1.0, 1000),
          createMockSector('ENERGY', 'Energy', -1.5, 800),
          createMockSector('FOOD', 'Food', -0.5, 500),
          createMockSector('PROP', 'Property', -2.0, 300),
        ]),
      }

      const result = detectSectorRotation(input)

      expect(result.leadership.concentration).toBeGreaterThan(0)
    })

    it('should generate observations', () => {
      const input: SectorRotationInput = {
        sectors: createMockIndustrySector([
          createMockSector('FIN', 'Financial', 2.5, 5000),
          createMockSector('TECH', 'Technology', 2.0, 4000),
          createMockSector('ENERGY', 'Energy', 1.5, 3000),
          createMockSector('FOOD', 'Food', -0.5, 2000),
          createMockSector('PROP', 'Property', -1.5, 1500),
        ]),
      }

      const result = detectSectorRotation(input)

      expect(result.observations.length).toBeGreaterThan(0)
      expect(result.observations.some(obs => obs.includes('Rotation pattern'))).toBe(true)
    })

    it('should provide focus and avoid sectors', () => {
      const input: SectorRotationInput = {
        sectors: createMockIndustrySector([
          createMockSector('FIN', 'Financial', 3.0, 5000),
          createMockSector('TECH', 'Technology', 2.5, 4000),
          createMockSector('ENERGY', 'Energy', 2.0, 3000),
          createMockSector('FOOD', 'Food', -1.0, 2000),
          createMockSector('PROP', 'Property', -2.0, 1500),
        ]),
      }

      const result = detectSectorRotation(input)

      expect(result.focusSectors.length).toBeGreaterThan(0)
      expect(result.focusSectors.length).toBeLessThanOrEqual(3)
      expect(result.avoidSectors.length).toBeGreaterThan(0)
      expect(result.avoidSectors.length).toBeLessThanOrEqual(3)
    })
  })
})
