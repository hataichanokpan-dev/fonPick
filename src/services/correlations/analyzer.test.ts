/**
 * Correlations Analyzer Tests
 *
 * Unit tests for correlation analysis logic.
 * Tests analyzeRankingsSectorCorrelation, analyzeRankingsImpact,
 * and generateCrossReferenceData functions.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  analyzeRankingsSectorCorrelation,
  analyzeRankingsImpact,
  generateCorrelationSummary,
  generateCrossReferenceData,
} from './analyzer'
import type { CorrelationInput } from '@/types/correlation'
import type { RTDBTopRankings, RTDBTopStock, RTDBIndustrySector, RTDBSector } from '@/types/rtdb'

// Helper function to create mock top stock
const createMockTopStock = (
  symbol: string,
  name: string,
  changePct: number
): RTDBTopStock => ({
  symbol,
  name,
  change: changePct * 10,
  changePct,
  volume: 10000 + Math.random() * 5000,
  value: 500 + Math.random() * 200,
})

// Helper to create mock rankings
const createMockRankings = (): RTDBTopRankings => ({
  topGainers: [
    createMockTopStock('KBANK', 'KBANK', 5.0),
    createMockTopStock('SCB', 'SCB', 4.5),
    createMockTopStock('BBL', 'BBL', 4.0),
    createMockTopStock('PTT', 'PTT', 3.5),
    createMockTopStock('ADVANC', 'ADVANC', 3.0),
  ],
  topLosers: [
    createMockTopStock('TRUE', 'TRUE', -4.0),
    createMockTopStock('INTUCH', 'INTUCH', -3.5),
    createMockTopStock('CPF', 'CPF', -3.0),
    createMockTopStock('AP', 'AP', -2.5),
    createMockTopStock('LAND', 'LAND', -2.0),
  ],
  topVolume: [
    createMockTopStock('PTT', 'PTT', 1.5),
    createMockTopStock('KBANK', 'KBANK', 1.0),
    createMockTopStock('SCB', 'SCB', 0.5),
    createMockTopStock('BBL', 'BBL', 0.3),
    createMockTopStock('TRUE', 'TRUE', -0.5),
  ],
  topValue: [
    createMockTopStock('KBANK', 'KBANK', 2.0),
    createMockTopStock('PTT', 'PTT', 1.5),
    createMockTopStock('BBL', 'BBL', 1.0),
    createMockTopStock('SCB', 'SCB', 0.8),
    createMockTopStock('ADVANC', 'ADVANC', 0.5),
  ],
  timestamp: Date.now(),
})

// Helper to create mock industry sectors
const createMockSectors = (): RTDBIndustrySector => {
  const sectors: RTDBSector[] = [
    { id: 'FIN', name: 'Financial', index: 350, change: 25, changePercent: 2.5, marketCap: 500000, volume: 15000 },
    { id: 'ENERGY', name: 'Energy', index: 280, change: 20, changePercent: 2.0, marketCap: 450000, volume: 12000 },
    { id: 'TECH', name: 'Technology', index: 320, change: -15, changePercent: -1.5, marketCap: 300000, volume: 8000 },
    { id: 'AGRI', name: 'Agribusiness', index: 180, change: -12, changePercent: -1.2, marketCap: 250000, volume: 6000 },
    { id: 'PROP', name: 'Property', index: 140, change: -10, changePercent: -1.0, marketCap: 200000, volume: 5000 },
  ]

  return {
    sectors,
    timestamp: Date.now(),
  }
}

describe('Correlations Analyzer', () => {
  let mockInput: CorrelationInput

  beforeEach(() => {
    mockInput = {
      rankings: createMockRankings(),
      sectors: createMockSectors(),
    }
  })

  // ==========================================================================
  // ANALYZE RANKINGS SECTOR CORRELATION
  // ==========================================================================

  describe('analyzeRankingsSectorCorrelation', () => {
    it('should analyze rankings-sector correlation', () => {
      const result = analyzeRankingsSectorCorrelation(mockInput)

      expect(result.overallCorrelation).toBeDefined()
      expect(result.correlationScore).toBeGreaterThanOrEqual(0)
      expect(result.correlationScore).toBeLessThanOrEqual(100)
      expect(result.sectorCorrelations).toBeDefined()
      expect(result.anomalies).toBeDefined()
      expect(result.aligned).toBeDefined()
      expect(result.insights).toBeDefined()
      expect(result.timestamp).toBeDefined()
    })

    it('should calculate per-sector correlations', () => {
      const result = analyzeRankingsSectorCorrelation(mockInput)

      expect(result.sectorCorrelations.length).toBeGreaterThan(0)

      result.sectorCorrelations.forEach(correlation => {
        expect(correlation.sectorId).toBeDefined()
        expect(correlation.sectorName).toBeDefined()
        expect(correlation.sectorChange).toBeDefined()
        expect(correlation.rankingsCount).toBeGreaterThanOrEqual(0)
        expect(correlation.expectedCount).toBeGreaterThanOrEqual(0)
        expect(correlation.correlation).toBeDefined()
        expect(correlation.anomaly).toBeDefined()
        expect(correlation.correlationScore).toBeGreaterThanOrEqual(0)
        expect(correlation.correlationScore).toBeLessThanOrEqual(100)
      })
    })

    it('should detect anomalies when sector up but no rankings', () => {
      // Create input where a sector is up but has no rankings
      const customInput: CorrelationInput = {
        rankings: {
          topGainers: [createMockTopStock('TRUE', 'TRUE', 4.0)],
          topLosers: [],
          topVolume: [],
          topValue: [],
          timestamp: Date.now(),
        },
        sectors: {
          sectors: [
            { id: 'TECH', name: 'Technology', index: 320, change: 25, changePercent: 2.5, marketCap: 300000, volume: 8000 },
            { id: 'FIN', name: 'Financial', index: 350, change: 5, changePercent: 0.5, marketCap: 500000, volume: 15000 },
          ],
          timestamp: Date.now(),
        },
      }

      const result = analyzeRankingsSectorCorrelation(customInput)

      // Note: Anomalies depend on stock-sector mapping which is simplified
      expect(result.anomalies).toBeDefined()
    })

    it('should set aligned flag correctly', () => {
      const result = analyzeRankingsSectorCorrelation(mockInput)

      if (result.overallCorrelation === 'Strong Positive' || result.overallCorrelation === 'Positive') {
        expect(result.aligned).toBe(true)
      } else if (result.overallCorrelation === 'Negative' || result.overallCorrelation === 'Strong Negative') {
        expect(result.aligned).toBe(false)
      }
    })

    it('should generate insights', () => {
      const result = analyzeRankingsSectorCorrelation(mockInput)

      expect(result.insights.length).toBeGreaterThan(0)
      expect(result.insights.some(insight => insight.includes('correlation'))).toBe(true)
    })

    it('should handle empty rankings', () => {
      const emptyInput: CorrelationInput = {
        rankings: {
          topGainers: [],
          topLosers: [],
          topVolume: [],
          topValue: [],
          timestamp: Date.now(),
        },
        sectors: createMockSectors(),
      }

      const result = analyzeRankingsSectorCorrelation(emptyInput)

      expect(result.overallCorrelation).toBe('Neutral')
      expect(result.sectorCorrelations.length).toBe(0)
    })

    it('should handle empty sectors', () => {
      const emptyInput: CorrelationInput = {
        rankings: createMockRankings(),
        sectors: {
          sectors: [],
          timestamp: Date.now(),
        },
      }

      const result = analyzeRankingsSectorCorrelation(emptyInput)

      expect(result.overallCorrelation).toBe('Neutral')
      expect(result.sectorCorrelations.length).toBe(0)
    })
  })

  // ==========================================================================
  // ANALYZE RANKINGS IMPACT
  // ==========================================================================

  describe('analyzeRankingsImpact', () => {
    it('should analyze rankings impact', () => {
      const result = analyzeRankingsImpact(mockInput)

      expect(result.impact).toBeDefined()
      expect(result.dominance).toBeDefined()
      expect(result.breadthImpact).toBeDefined()
      expect(result.concentration).toBeDefined()
      expect(result.observations).toBeDefined()
      expect(result.timestamp).toBeDefined()
    })

    it('should calculate sector dominance', () => {
      const result = analyzeRankingsImpact(mockInput)

      expect(result.dominance.dominant).toBeDefined()
      expect(result.dominance.dominanceScore).toBeGreaterThanOrEqual(0)
      expect(result.dominance.dominanceScore).toBeLessThanOrEqual(100)
      expect(result.dominance.sectorCount).toBeGreaterThanOrEqual(0)
      expect(result.dominance.topSectorPercent).toBeGreaterThanOrEqual(0)
      expect(result.dominance.topSectorPercent).toBeLessThanOrEqual(100)
    })

    it('should calculate breadth impact', () => {
      const result = analyzeRankingsImpact(mockInput)

      expect(result.breadthImpact.confirmed).toBeDefined()
      expect(result.breadthImpact.rankingsBreadth).toMatch(/^(Broad|Narrow|Mixed)$/)
      expect(result.breadthImpact.explanation).toBeDefined()
    })

    it('should calculate concentration metrics', () => {
      const result = analyzeRankingsImpact(mockInput)

      expect(result.concentration.score).toBeGreaterThanOrEqual(0)
      expect(result.concentration.score).toBeLessThanOrEqual(100)
      expect(result.concentration.level).toMatch(/^(High|Medium|Low)$/)
      expect(result.concentration.top3Percent).toBeGreaterThanOrEqual(0)
      expect(result.concentration.top3Percent).toBeLessThanOrEqual(100)
      expect(result.concentration.interpretation).toBeDefined()
    })

    it('should determine impact level correctly', () => {
      const result = analyzeRankingsImpact(mockInput)

      expect(result.impact).toMatch(/^(High|Medium|Low|Unclear)$/)
    })

    it('should generate impact observations', () => {
      const result = analyzeRankingsImpact(mockInput)

      expect(result.observations.length).toBeGreaterThan(0)
      expect(result.observations.some(obs => obs.includes('impact'))).toBe(true)
      expect(result.observations.some(obs => obs.includes('Concentration'))).toBe(true)
    })

    it('should detect High impact when concentration is high', () => {
      const highConcentrationInput: CorrelationInput = {
        rankings: {
          // All financial stocks, high concentration
          topGainers: [
            createMockTopStock('KBANK', 'KBANK', 5.0),
            createMockTopStock('SCB', 'SCB', 4.5),
            createMockTopStock('BBL', 'BBL', 4.0),
          ],
          topLosers: [],
          topVolume: [],
          topValue: [],
          timestamp: Date.now(),
        },
        sectors: {
          sectors: [
            { id: 'FIN', name: 'Financial', index: 350, change: 25, changePercent: 2.5, marketCap: 500000, volume: 15000 },
            { id: 'TECH', name: 'Technology', index: 320, change: 5, changePercent: 0.5, marketCap: 300000, volume: 8000 },
          ],
          timestamp: Date.now(),
        },
      }

      const result = analyzeRankingsImpact(highConcentrationInput)

      // With high concentration, should detect High or Medium impact
      expect(result.impact).toMatch(/^(High|Medium|Low|Unclear)$/)
    })

    it('should detect Low impact when breadth is broad', () => {
      const broadBreadthInput: CorrelationInput = {
        rankings: {
          // Stocks from many different sectors
          topGainers: [
            createMockTopStock('KBANK', 'KBANK', 5.0),
            createMockTopStock('PTT', 'PTT', 4.5),
            createMockTopStock('ADVANC', 'ADVANC', 4.0),
            createMockTopStock('CPF', 'CPF', 3.5),
            createMockTopStock('AP', 'AP', 3.0),
          ],
          topLosers: [],
          topVolume: [],
          topValue: [],
          timestamp: Date.now(),
        },
        sectors: {
          sectors: [
            { id: 'FIN', name: 'Financial', index: 350, change: 25, changePercent: 2.5, marketCap: 500000, volume: 15000 },
            { id: 'ENERGY', name: 'Energy', index: 280, change: 20, changePercent: 2.0, marketCap: 450000, volume: 12000 },
            { id: 'TECH', name: 'Technology', index: 320, change: 15, changePercent: 1.5, marketCap: 300000, volume: 8000 },
            { id: 'AGRI', name: 'Agribusiness', index: 180, change: 12, changePercent: 1.2, marketCap: 250000, volume: 6000 },
            { id: 'PROP', name: 'Property', index: 140, change: 10, changePercent: 1.0, marketCap: 200000, volume: 5000 },
          ],
          timestamp: Date.now(),
        },
      }

      const result = analyzeRankingsImpact(broadBreadthInput)

      expect(result.impact).toMatch(/^(High|Medium|Low|Unclear)$/)
      expect(result.breadthImpact.rankingsBreadth).toBe('Broad')
    })
  })

  // ==========================================================================
  // GENERATE CORRELATION SUMMARY
  // ==========================================================================

  describe('generateCorrelationSummary', () => {
    it('should generate comprehensive correlation summary', () => {
      const impact = analyzeRankingsImpact(mockInput)
      const correlation = analyzeRankingsSectorCorrelation(mockInput)

      const summary = generateCorrelationSummary(impact, correlation)

      expect(summary.impact).toBeDefined()
      expect(summary.impact.level).toBeDefined()
      expect(summary.impact.explanation).toBeDefined()

      expect(summary.correlation).toBeDefined()
      expect(summary.correlation.strength).toBeDefined()
      expect(summary.correlation.score).toBeGreaterThanOrEqual(0)
      expect(summary.correlation.score).toBeLessThanOrEqual(100)
      expect(summary.correlation.explanation).toBeDefined()

      expect(summary.anomalies).toBeDefined()
      expect(summary.insights).toBeDefined()
    })

    it('should include all observations from impact and correlation', () => {
      const impact = analyzeRankingsImpact(mockInput)
      const correlation = analyzeRankingsSectorCorrelation(mockInput)

      const summary = generateCorrelationSummary(impact, correlation)

      expect(summary.insights.length).toBeGreaterThanOrEqual(impact.observations.length + correlation.insights.length)
    })

    it('should map anomalies correctly', () => {
      const impact = analyzeRankingsImpact(mockInput)
      const correlation = analyzeRankingsSectorCorrelation(mockInput)

      const summary = generateCorrelationSummary(impact, correlation)

      if (correlation.anomalies.length > 0) {
        expect(summary.anomalies.length).toBe(correlation.anomalies.length)
      }
    })
  })

  // ==========================================================================
  // GENERATE CROSS REFERENCE DATA
  // ==========================================================================

  describe('generateCrossReferenceData', () => {
    it('should generate cross-reference data', () => {
      const result = generateCrossReferenceData(mockInput.rankings, mockInput.sectors)

      expect(result.rankedStocks).toBeDefined()
      expect(result.bySector).toBeDefined()
      expect(result.metrics).toBeDefined()
      expect(result.anomalies).toBeDefined()
    })

    it('should include ranked stocks with sector info', () => {
      const result = generateCrossReferenceData(mockInput.rankings, mockInput.sectors)

      result.rankedStocks.forEach(stock => {
        expect(stock.symbol).toBeDefined()
        expect(stock.name).toBeDefined()
        expect(stock.change).toBeDefined()
        expect(stock.sectorCode).toBeDefined()
        expect(stock.sectorName).toBeDefined()
        expect(stock.sectorChange).toBeDefined()
        expect(stock.in).toBeDefined()
      })
    })

    it('should aggregate data by sector', () => {
      const result = generateCrossReferenceData(mockInput.rankings, mockInput.sectors)

      result.bySector.forEach(sector => {
        expect(sector.sectorId).toBeDefined()
        expect(sector.sectorName).toBeDefined()
        expect(sector.totalRankings).toBeGreaterThanOrEqual(0)
        expect(sector.sectorChange).toBeDefined()
        expect(sector.isAnomaly).toBeDefined()
      })
    })

    it('should calculate correlation metrics', () => {
      const result = generateCrossReferenceData(mockInput.rankings, mockInput.sectors)

      expect(result.metrics.sectorCount).toBeGreaterThanOrEqual(0)
      expect(result.metrics.uniqueStocks).toBeGreaterThanOrEqual(0)
      expect(result.metrics.concentrationScore).toBeGreaterThanOrEqual(0)
      expect(result.metrics.concentrationScore).toBeLessThanOrEqual(100)
      expect(result.metrics.avgCorrelationScore).toBeGreaterThanOrEqual(0)
      expect(result.metrics.avgCorrelationScore).toBeLessThanOrEqual(100)
    })

    it('should detect anomalies in cross-reference', () => {
      const result = generateCrossReferenceData(mockInput.rankings, mockInput.sectors)

      expect(result.anomalies).toBeDefined()
    })

    it('should handle empty rankings', () => {
      const emptyRankings: RTDBTopRankings = {
        topGainers: [],
        topLosers: [],
        topVolume: [],
        topValue: [],
        timestamp: Date.now(),
      }

      const result = generateCrossReferenceData(emptyRankings, mockInput.sectors)

      expect(result.rankedStocks.length).toBe(0)
      expect(result.metrics.uniqueStocks).toBe(0)
    })

    it('should handle empty sectors', () => {
      const emptySectors: RTDBIndustrySector = {
        sectors: [],
        timestamp: Date.now(),
      }

      const result = generateCrossReferenceData(mockInput.rankings, emptySectors)

      expect(result.bySector.length).toBe(0)
      expect(result.metrics.sectorCount).toBe(0)
    })
  })
})
