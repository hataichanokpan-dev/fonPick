/**
 * Stock Decline Diagnostic Tests
 *
 * TDD Approach: Tests written FIRST before implementation.
 *
 * Test Categories:
 * 1. Volume Signal Tests - Health score, VWAD, Concentration, Relative Volume
 * 2. Sector/Market Context Tests - Laggards, Exit signals, Risk-Off
 * 3. Smart Money Flow Tests - Foreign, Institution, Score, Cumulative
 * 4. Technical/Price Action Tests - Top losers, 52-week, Rankings, Trends
 * 5. Valuation Concern Tests - P/E comparisons
 * 6. Action Decision Matrix Tests - Flag count to action mapping
 * 7. Edge Cases and Error Handling
 */

import { describe, it, expect } from 'vitest'
import {
  diagnoseStockDecline,
  checkVolumeSignals,
  checkSectorSignals,
  checkSmartMoneySignals,
  checkTechnicalSignals,
  checkValuationSignals,
  determineOverallAction,
  generateDiagnosticSummary,
} from './stock-decline-diagnostic'
import type {
  StockDiagnosticInput,
  TechnicalIndicators,
  VolumeAnalysisData,
  SectorPerformance,
  RegimeContext,
  SmartMoneyAnalysis,
  ValuationData,
  DiagnosticFlag,
} from '@/types/diagnostic'
import type { RTDBTopRankings } from '@/types/rtdb'

// ============================================================================
// TEST HELPERS
// ============================================================================

const createMockTechnical = (overrides: Partial<TechnicalIndicators> = {}): TechnicalIndicators => ({
  symbol: 'TEST',
  changePercent: -2.5,
  trend5D: -1.0,
  trend20D: -0.5,
  week52Position: 25,
  isTopLoser: false,
  isTopGainer: false,
  isInAnyRanking: true,
  pe: 15,
  sectorPe: 12,
  historicalPe: 14,
  sectorCode: 'FIN',
  sectorName: 'Financial',
  sectorVsMarket: -1.5,
  sectorMomentum: 'Underperform',
  relativeVolume: 1.0,
  ...overrides,
})

const createMockVolume = (overrides: Partial<VolumeAnalysisData> = {}): VolumeAnalysisData => ({
  health: {
    currentVolume: 50000,
    averageVolume: 40000,
    healthScore: 75,
    healthStatus: 'Strong',
    trend: 'Up',
  },
  vwad: {
    vwad: 25,
    conviction: 'Bullish',
    upVolume: 30000,
    downVolume: 20000,
    totalVolume: 50000,
  },
  concentration: {
    top5Volume: 15000,
    totalVolume: 50000,
    concentration: 30,
    concentrationLevel: 'Normal',
  },
  volumeLeaders: [],
  timestamp: Date.now(),
  ...overrides,
})

const createMockSector = (overrides: Partial<SectorPerformance> = {}): SectorPerformance => ({
  sector: {
    id: 'FIN',
    name: 'Financial',
    index: 1200,
    change: -10,
    changePercent: -0.83,
    marketCap: 5000000,
    volume: 50000,
  },
  vsMarket: -1.5,
  rank: 8,
  momentum: 'Underperform',
  value: 50000,
  valueRatio: 1.0,
  signal: 'Hold',
  confidence: 50,
  topRankingsCount: 2,
  ...overrides,
})

const createMockRegimeContext = (overrides: Partial<RegimeContext> = {}): RegimeContext => ({
  regime: 'Neutral',
  defensives: {
    averageChange: 0.5,
    vsMarket: 0.0,
  },
  cyclicals: {
    averageChange: 0.8,
    vsMarket: 0.3,
  },
  confirmed: false,
  ...overrides,
})

const createMockSmartMoney = (overrides: Partial<SmartMoneyAnalysis> = {}): SmartMoneyAnalysis => ({
  investors: {
    foreign: {
      investor: 'foreign',
      todayNet: 100,
      strength: 'Buy',
      trend: 'Stable Buy',
      confidence: 60,
      trend5Day: 200,
      avg5Day: 150,
      vsAverage: -50,
    },
    institution: {
      investor: 'institution',
      todayNet: 50,
      strength: 'Buy',
      trend: 'Stable Buy',
      confidence: 55,
      trend5Day: 100,
      avg5Day: 80,
      vsAverage: -30,
    },
    retail: {
      investor: 'retail',
      todayNet: -20,
      strength: 'Sell',
      trend: 'Stable Sell',
      confidence: 45,
      trend5Day: -50,
      avg5Day: -30,
      vsAverage: 10,
    },
    prop: {
      investor: 'prop',
      todayNet: 0,
      strength: 'Neutral',
      trend: 'Neutral',
      confidence: 50,
      trend5Day: 10,
      avg5Day: 10,
      vsAverage: 0,
    },
  },
  combinedSignal: 'Buy',
  riskSignal: 'Risk-On Mild',
  score: 65,
  confidence: 60,
  observations: ['Foreign buying'],
  primaryDriver: 'foreign',
  riskOnConfirmed: true,
  riskOffConfirmed: false,
  timestamp: Date.now(),
  ...overrides,
})

const createMockRankings = (overrides: Partial<RTDBTopRankings> = {}): RTDBTopRankings => ({
  topGainers: [
    { symbol: 'GAINER1', name: 'Gainer 1', price: 100, change: 5, changePct: 5.0 },
  ],
  topLosers: [
    { symbol: 'LOSER1', name: 'Loser 1', price: 50, change: -3, changePct: -6.0 },
  ],
  topVolume: [
    { symbol: 'VOLUME1', name: 'Volume 1', volume: 10000 },
  ],
  topValue: [
    { symbol: 'VALUE1', name: 'Value 1', value: 5000 },
  ],
  timestamp: Date.now(),
  ...overrides,
})

const createMockValuation = (overrides: Partial<ValuationData> = {}): ValuationData => ({
  stockPE: 15,
  sectorPE: 12,
  historicalPE: 14,
  pbv: 1.5,
  dividendYield: 3.0,
  ...overrides,
})

const createMockDiagnosticInput = (overrides: Partial<StockDiagnosticInput> = {}): StockDiagnosticInput => ({
  symbol: 'TEST',
  technical: createMockTechnical(),
  volume: createMockVolume(),
  sector: createMockSector(),
  regimeContext: createMockRegimeContext(),
  smartMoney: createMockSmartMoney(),
  rankings: createMockRankings(),
  valuation: createMockValuation(),
  options: {},
  ...overrides,
})

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Stock Decline Diagnostic', () => {
  describe('checkVolumeSignals', () => {
    it('should return red flag for anemic volume (health score < 30)', () => {
      const volume = createMockVolume({
        health: {
          currentVolume: 10000,
          averageVolume: 40000,
          healthScore: 25,
          healthStatus: 'Anemic',
          trend: 'Down',
        },
      })

      const flags = checkVolumeSignals('TEST', volume)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Anemic Volume')).toBe(true)
    })

    it('should return red flag for bearish VWAD (<= -30)', () => {
      const volume = createMockVolume({
        vwad: {
          vwad: -35,
          conviction: 'Bearish',
          upVolume: 15000,
          downVolume: 35000,
          totalVolume: 50000,
        },
      })

      const flags = checkVolumeSignals('TEST', volume)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Bearish Conviction')).toBe(true)
    })

    it('should return red flag for illiquid market (concentration >= 40%)', () => {
      const volume = createMockVolume({
        concentration: {
          top5Volume: 25000,
          totalVolume: 50000,
          concentration: 50,
          concentrationLevel: 'Risky',
        },
      })

      const flags = checkVolumeSignals('TEST', volume)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Illiquid Market')).toBe(true)
    })

    it('should return yellow flag for low relative volume (< 0.5x)', () => {
      const volume = createMockVolume()
      const technical = createMockTechnical({ relativeVolume: 0.3 })

      const flags = checkVolumeSignals('TEST', volume, technical)

      const yellowFlags = flags.filter(f => f.severity === 'yellow')
      expect(yellowFlags.length).toBeGreaterThan(0)
      expect(yellowFlags.some(f => f.signal === 'Low Relative Volume')).toBe(true)
    })

    it('should return no flags for healthy volume conditions', () => {
      const volume = createMockVolume()
      const technical = createMockTechnical()

      const flags = checkVolumeSignals('TEST', volume, technical)

      expect(flags.length).toBe(0)
    })

    it('should handle missing technical data gracefully', () => {
      const volume = createMockVolume()

      const flags = checkVolumeSignals('TEST', volume, undefined)

      // Should not throw, just skip relative volume check
      expect(flags).toBeDefined()
      expect(Array.isArray(flags)).toBe(true)
    })
  })

  describe('checkSectorSignals', () => {
    it('should return red flag for laggard sector (Underperform/Significant Lag)', () => {
      const sector = createMockSector({
        momentum: 'Underperform',
        vsMarket: -2.0,
      })

      const flags = checkSectorSignals('TEST', sector)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Laggard Sector')).toBe(true)
    })

    it('should return red flag for significant lag sector', () => {
      const sector = createMockSector({
        momentum: 'Significant Lag',
        vsMarket: -3.0,
      })

      const flags = checkSectorSignals('TEST', sector)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
    })

    it('should return red flag for exit signal with high confidence (>= 70%)', () => {
      const sector = createMockSector({
        signal: 'Exit',
        confidence: 75,
      })

      const flags = checkSectorSignals('TEST', sector)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Sector Exit Signal')).toBe(true)
    })

    it('should not return exit flag with low confidence (< 70%)', () => {
      const sector = createMockSector({
        signal: 'Exit',
        confidence: 60,
      })

      const flags = checkSectorSignals('TEST', sector)

      expect(flags.some(f => f.signal === 'Sector Exit Signal')).toBe(false)
    })

    it('should return red flag for risk-off market when confirmed', () => {
      const regime = createMockRegimeContext({
        regime: 'Risk-Off',
        confirmed: true,
      })

      const flags = checkSectorSignals('TEST', undefined, regime)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Risk-Off Market')).toBe(true)
    })

    it('should not return risk-off flag when not confirmed', () => {
      const regime = createMockRegimeContext({
        regime: 'Risk-Off',
        confirmed: false,
      })

      const flags = checkSectorSignals('TEST', undefined, regime)

      expect(flags.some(f => f.signal === 'Risk-Off Market')).toBe(false)
    })

    it('should return no flags for healthy sector conditions', () => {
      const sector = createMockSector({
        momentum: 'Outperform',
        vsMarket: 1.5,
        signal: 'Entry',
      })
      const regime = createMockRegimeContext({
        regime: 'Risk-On',
        confirmed: true,
      })

      const flags = checkSectorSignals('TEST', sector, regime)

      expect(flags.length).toBe(0)
    })

    it('should handle missing sector and regime data gracefully', () => {
      const flags = checkSectorSignals('TEST', undefined, undefined)

      expect(flags).toEqual([])
    })
  })

  describe('checkSmartMoneySignals', () => {
    it('should return red flag for foreign strong sell (< -500M THB)', () => {
      const smartMoney = createMockSmartMoney({
        investors: {
          ...createMockSmartMoney().investors,
          foreign: {
            investor: 'foreign',
            todayNet: -600,
            strength: 'Strong Sell',
            trend: 'Accelerating Sell',
            confidence: 80,
            trend5Day: -1000,
            avg5Day: -500,
            vsAverage: -100,
          },
        },
      })

      const flags = checkSmartMoneySignals(smartMoney)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Foreign Strong Sell')).toBe(true)
    })

    it('should return red flag for institution selling (< -100M THB)', () => {
      const smartMoney = createMockSmartMoney({
        investors: {
          ...createMockSmartMoney().investors,
          institution: {
            investor: 'institution',
            todayNet: -150,
            strength: 'Sell',
            trend: 'Stable Sell',
            confidence: 60,
            trend5Day: -200,
            avg5Day: -120,
            vsAverage: -30,
          },
        },
      })

      const flags = checkSmartMoneySignals(smartMoney)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Institution Selling')).toBe(true)
    })

    it('should return red flag for low smart money score (< 40)', () => {
      const smartMoney = createMockSmartMoney({
        score: 35,
      })

      const flags = checkSmartMoneySignals(smartMoney)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Low Smart Money Score')).toBe(true)
    })

    it('should return red flag for negative 5-day cumulative (< -200)', () => {
      const smartMoney = createMockSmartMoney({
        investors: {
          ...createMockSmartMoney().investors,
          foreign: {
            investor: 'foreign',
            todayNet: -100,
            strength: 'Sell',
            trend: 'Stable Sell',
            confidence: 60,
            trend5Day: -300,
            avg5Day: -150,
            vsAverage: -50,
          },
        },
      })

      const flags = checkSmartMoneySignals(smartMoney)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Negative Cumulative Flow')).toBe(true)
    })

    it('should return multiple red flags for multiple smart money issues', () => {
      const smartMoney = createMockSmartMoney({
        score: 30,
        investors: {
          ...createMockSmartMoney().investors,
          foreign: {
            investor: 'foreign',
            todayNet: -600,
            strength: 'Strong Sell',
            trend: 'Accelerating Sell',
            confidence: 80,
            trend5Day: -1000,
            avg5Day: -500,
            vsAverage: -100,
          },
          institution: {
            investor: 'institution',
            todayNet: -150,
            strength: 'Sell',
            trend: 'Stable Sell',
            confidence: 60,
            trend5Day: -200,
            avg5Day: -120,
            vsAverage: -30,
          },
        },
      })

      const flags = checkSmartMoneySignals(smartMoney)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThanOrEqual(3)
    })

    it('should return no flags for positive smart money conditions', () => {
      const smartMoney = createMockSmartMoney({
        score: 70,
        investors: {
          ...createMockSmartMoney().investors,
          foreign: {
            investor: 'foreign',
            todayNet: 600,
            strength: 'Strong Buy',
            trend: 'Accelerating Buy',
            confidence: 80,
            trend5Day: 1000,
            avg5Day: 500,
            vsAverage: 100,
          },
        },
      })

      const flags = checkSmartMoneySignals(smartMoney)

      expect(flags.length).toBe(0)
    })
  })

  describe('checkTechnicalSignals', () => {
    it('should return red flag for top loser stock', () => {
      const technical = createMockTechnical({
        isTopLoser: true,
      })
      const rankings = createMockRankings({
        topLosers: [
          { symbol: 'TEST', name: 'Test Stock', price: 50, change: -5, changePct: -10.0 },
        ],
      })

      const flags = checkTechnicalSignals('TEST', technical, rankings)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Top Loser')).toBe(true)
    })

    it('should return red flag for low 52-week position (< 20%)', () => {
      const technical = createMockTechnical({
        week52Position: 15,
      })

      const flags = checkTechnicalSignals('TEST', technical, createMockRankings())

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Near 52-Week Low')).toBe(true)
    })

    it('should return yellow flag for stock missing from all rankings', () => {
      const technical = createMockTechnical({
        isInAnyRanking: false,
      })
      const rankings = createMockRankings({
        topGainers: [{ symbol: 'OTHER1', name: 'Other', price: 100, change: 5, changePct: 5.0 }],
        topLosers: [{ symbol: 'OTHER2', name: 'Other', price: 50, change: -5, changePct: -5.0 }],
        topVolume: [{ symbol: 'OTHER3', name: 'Other', volume: 10000 }],
        topValue: [{ symbol: 'OTHER4', name: 'Other', value: 5000 }],
      })

      const flags = checkTechnicalSignals('TEST', technical, rankings)

      const yellowFlags = flags.filter(f => f.severity === 'yellow')
      expect(yellowFlags.length).toBeGreaterThan(0)
      expect(yellowFlags.some(f => f.signal === 'Absent from Rankings')).toBe(true)
    })

    it('should return red flag for negative 5D and 20D trends', () => {
      const technical = createMockTechnical({
        trend5D: -2.0,
        trend20D: -1.5,
      })

      const flags = checkTechnicalSignals('TEST', technical, createMockRankings())

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Negative Short & Long Trend')).toBe(true)
    })

    it('should return no flags for positive technical conditions', () => {
      const technical = createMockTechnical({
        week52Position: 60,
        trend5D: 1.5,
        trend20D: 2.0,
        isInAnyRanking: true,
      })

      const flags = checkTechnicalSignals('TEST', technical, createMockRankings())

      expect(flags.length).toBe(0)
    })
  })

  describe('checkValuationSignals', () => {
    it('should return red flag when P/E > sector by > 30%', () => {
      const valuation = createMockValuation({
        stockPE: 20,
        sectorPE: 14,
      })

      const flags = checkValuationSignals(valuation)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Overvalued vs Sector')).toBe(true)
    })

    it('should return red flag when P/E > history by > 30%', () => {
      const valuation = createMockValuation({
        stockPE: 20,
        historicalPE: 14,
      })

      const flags = checkValuationSignals(valuation)

      const redFlags = flags.filter(f => f.severity === 'red')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags.some(f => f.signal === 'Overvalued vs History')).toBe(true)
    })

    it('should return no flags for reasonable valuation', () => {
      const valuation = createMockValuation({
        stockPE: 15,
        sectorPE: 14,
        historicalPE: 14,
      })

      const flags = checkValuationSignals(valuation)

      expect(flags.length).toBe(0)
    })

    it('should handle missing valuation data gracefully', () => {
      const flags = checkValuationSignals(undefined)

      expect(flags).toEqual([])
    })
  })

  describe('determineOverallAction', () => {
    it('should return IMMEDIATE_SELL for 3+ red flags', () => {
      const flags: DiagnosticFlag[] = [
        { category: 'volume', severity: 'red', signal: 'Anemic Volume', description: 'Test', action: 'Sell' },
        { category: 'smart_money', severity: 'red', signal: 'Foreign Strong Sell', description: 'Test', action: 'Sell' },
        { category: 'technical', severity: 'red', signal: 'Top Loser', description: 'Test', action: 'Sell' },
      ]

      const action = determineOverallAction(flags)

      expect(action).toBe('IMMEDIATE_SELL')
    })

    it('should return STRONG_SELL for 2 red + 2+ yellow flags', () => {
      const flags: DiagnosticFlag[] = [
        { category: 'volume', severity: 'red', signal: 'Anemic Volume', description: 'Test', action: 'Sell' },
        { category: 'smart_money', severity: 'red', signal: 'Foreign Strong Sell', description: 'Test', action: 'Sell' },
        { category: 'technical', severity: 'yellow', signal: 'Absent from Rankings', description: 'Test', action: 'Hold' },
        { category: 'technical', severity: 'yellow', signal: 'Low Relative Volume', description: 'Test', action: 'Hold' },
      ]

      const action = determineOverallAction(flags)

      expect(action).toBe('STRONG_SELL')
    })

    it('should return TRIM for 1-2 red flags', () => {
      const flags1: DiagnosticFlag[] = [
        { category: 'volume', severity: 'red', signal: 'Anemic Volume', description: 'Test', action: 'Sell' },
      ]

      expect(determineOverallAction(flags1)).toBe('TRIM')

      const flags2: DiagnosticFlag[] = [
        { category: 'volume', severity: 'red', signal: 'Anemic Volume', description: 'Test', action: 'Sell' },
        { category: 'smart_money', severity: 'red', signal: 'Institution Selling', description: 'Test', action: 'Sell' },
      ]

      expect(determineOverallAction(flags2)).toBe('TRIM')
    })

    it('should return HOLD for 3+ yellow flags', () => {
      const flags: DiagnosticFlag[] = [
        { category: 'technical', severity: 'yellow', signal: 'Absent from Rankings', description: 'Test', action: 'Hold' },
        { category: 'technical', severity: 'yellow', signal: 'Low Relative Volume', description: 'Test', action: 'Hold' },
        { category: 'technical', severity: 'yellow', signal: 'Near 52-Week Low', description: 'Test', action: 'Hold' },
      ]

      const action = determineOverallAction(flags)

      expect(action).toBe('HOLD')
    })

    it('should return HOLD for 0-2 yellow flags (normal volatility)', () => {
      const flags1: DiagnosticFlag[] = []

      expect(determineOverallAction(flags1)).toBe('HOLD')

      const flags2: DiagnosticFlag[] = [
        { category: 'technical', severity: 'yellow', signal: 'Absent from Rankings', description: 'Test', action: 'Hold' },
      ]

      expect(determineOverallAction(flags2)).toBe('HOLD')

      const flags3: DiagnosticFlag[] = [
        { category: 'technical', severity: 'yellow', signal: 'Absent from Rankings', description: 'Test', action: 'Hold' },
        { category: 'technical', severity: 'yellow', signal: 'Low Relative Volume', description: 'Test', action: 'Hold' },
      ]

      expect(determineOverallAction(flags3)).toBe('HOLD')
    })
  })

  describe('generateDiagnosticSummary', () => {
    it('should generate summary for IMMEDIATE_SELL action', () => {
      const flags: DiagnosticFlag[] = [
        { category: 'volume', severity: 'red', signal: 'Anemic Volume', description: 'Low volume', action: 'Sell' },
        { category: 'smart_money', severity: 'red', signal: 'Foreign Strong Sell', description: 'Foreign selling', action: 'Sell' },
        { category: 'technical', severity: 'red', signal: 'Top Loser', description: 'Top loser', action: 'Sell' },
      ]

      const summary = generateDiagnosticSummary('TEST', flags, 'IMMEDIATE_SELL')

      expect(summary).toContain('IMMEDIATE_SELL')
      expect(summary).toContain('3 red flags')
      expect(summary.length).toBeGreaterThan(0)
    })

    it('should generate summary for TRIM action', () => {
      const flags: DiagnosticFlag[] = [
        { category: 'volume', severity: 'red', signal: 'Anemic Volume', description: 'Low volume', action: 'Trim' },
      ]

      const summary = generateDiagnosticSummary('TEST', flags, 'TRIM')

      expect(summary).toContain('TRIM')
      expect(summary).toContain('red flag')
    })

    it('should generate summary for HOLD action', () => {
      const flags: DiagnosticFlag[] = []

      const summary = generateDiagnosticSummary('TEST', flags, 'HOLD')

      expect(summary).toContain('HOLD')
      expect(summary).toContain('normal volatility')
    })
  })

  describe('diagnoseStockDecline', () => {
    it('should perform complete diagnostic analysis', () => {
      const input = createMockDiagnosticInput()

      const result = diagnoseStockDecline(input)

      expect(result.symbol).toBe('TEST')
      expect(result.overallAction).toBeDefined()
      expect(result.redFlags).toBeDefined()
      expect(result.yellowFlags).toBeDefined()
      expect(result.summary).toBeDefined()
      expect(result.flagCounts).toBeDefined()
      expect(result.riskLevel).toBeGreaterThanOrEqual(0)
      expect(result.riskLevel).toBeLessThanOrEqual(100)
      expect(result.timestamp).toBeDefined()
    })

    it('should return correct flag counts', () => {
      const input = createMockDiagnosticInput()

      const result = diagnoseStockDecline(input)

      expect(result.flagCounts.red).toBeGreaterThanOrEqual(0)
      expect(result.flagCounts.yellow).toBeGreaterThanOrEqual(0)
      expect(result.flagCounts.byCategory).toBeDefined()
      expect(result.flagCounts.byCategory.volume).toBeDefined()
      expect(result.flagCounts.byCategory.sector).toBeDefined()
      expect(result.flagCounts.byCategory.smart_money).toBeDefined()
      expect(result.flagCounts.byCategory.technical).toBeDefined()
      expect(result.flagCounts.byCategory.valuation).toBeDefined()
    })

    it('should calculate risk level based on flags', () => {
      const input = createMockDiagnosticInput()

      const result = diagnoseStockDecline(input)

      expect(result.riskLevel).toBeGreaterThanOrEqual(0)
      expect(result.riskLevel).toBeLessThanOrEqual(100)
    })

    it('should handle missing optional data gracefully', () => {
      const input = createMockDiagnosticInput({
        sector: undefined,
        regimeContext: undefined,
        valuation: undefined,
      })

      const result = diagnoseStockDecline(input)

      expect(result.symbol).toBe('TEST')
      expect(result.overallAction).toBeDefined()
    })

    it('should detect multiple red flags correctly', () => {
      const input = createMockDiagnosticInput({
        technical: createMockTechnical({
          isTopLoser: true,
          week52Position: 15,
          trend5D: -2.0,
          trend20D: -1.5,
          relativeVolume: 0.3,
        }),
        volume: createMockVolume({
          health: {
            currentVolume: 10000,
            averageVolume: 40000,
            healthScore: 25,
            healthStatus: 'Anemic',
            trend: 'Down',
          },
          vwad: {
            vwad: -35,
            conviction: 'Bearish',
            upVolume: 15000,
            downVolume: 35000,
            totalVolume: 50000,
          },
        }),
        smartMoney: createMockSmartMoney({
          score: 35,
          investors: {
            ...createMockSmartMoney().investors,
            foreign: {
              investor: 'foreign',
              todayNet: -600,
              strength: 'Strong Sell',
              trend: 'Accelerating Sell',
              confidence: 80,
              trend5Day: -1000,
              avg5Day: -500,
              vsAverage: -100,
            },
          },
        }),
        valuation: createMockValuation({
          stockPE: 20,
          sectorPE: 14,
          historicalPE: 14,
        }),
      })

      const result = diagnoseStockDecline(input)

      expect(result.flagCounts.red).toBeGreaterThanOrEqual(3)
      expect(result.overallAction).toBe('IMMEDIATE_SELL')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined values gracefully', () => {
      const input = createMockDiagnosticInput({
        technical: createMockTechnical({
          pe: undefined,
          sectorPe: undefined,
          historicalPe: undefined,
          relativeVolume: undefined,
        }),
        valuation: {
          stockPE: undefined,
          sectorPE: undefined,
          historicalPE: undefined,
        },
      })

      expect(() => diagnoseStockDecline(input)).not.toThrow()
    })

    it('should handle empty rankings', () => {
      const input = createMockDiagnosticInput({
        rankings: {
          topGainers: [],
          topLosers: [],
          topVolume: [],
          topValue: [],
          timestamp: Date.now(),
        },
      })

      expect(() => diagnoseStockDecline(input)).not.toThrow()
    })

    it('should handle zero/negative values in calculations', () => {
      const valuation = createMockValuation({
        stockPE: 0,
        sectorPE: 0,
        historicalPE: 0,
      })

      expect(() => checkValuationSignals(valuation)).not.toThrow()
    })

    it('should calculate risk level correctly with various flag combinations', () => {
      // No flags = 0 risk
      const input1 = createMockDiagnosticInput({
        technical: createMockTechnical({
          week52Position: 60,
          trend5D: 1.5,
          trend20D: 2.0,
        }),
        volume: createMockVolume(),
        smartMoney: createMockSmartMoney({
          score: 75,
          investors: {
            ...createMockSmartMoney().investors,
            foreign: {
              investor: 'foreign',
              todayNet: 500,
              strength: 'Strong Buy',
              trend: 'Accelerating Buy',
              confidence: 80,
              trend5Day: 1000,
              avg5Day: 500,
              vsAverage: 100,
            },
          },
        }),
      })

      const result1 = diagnoseStockDecline(input1)
      expect(result1.riskLevel).toBeLessThan(30)

      // Multiple red flags = high risk
      const input2 = createMockDiagnosticInput({
        technical: createMockTechnical({
          isTopLoser: true,
          week52Position: 10,
          trend5D: -3.0,
          trend20D: -2.0,
        }),
        volume: createMockVolume({
          health: {
            currentVolume: 5000,
            averageVolume: 40000,
            healthScore: 15,
            healthStatus: 'Anemic',
            trend: 'Down',
          },
        }),
        smartMoney: createMockSmartMoney({
          score: 25,
          investors: {
            ...createMockSmartMoney().investors,
            foreign: {
              investor: 'foreign',
              todayNet: -800,
              strength: 'Strong Sell',
              trend: 'Accelerating Sell',
              confidence: 85,
              trend5Day: -1500,
              avg5Day: -600,
              vsAverage: -200,
            },
            institution: {
              investor: 'institution',
              todayNet: -200,
              strength: 'Sell',
              trend: 'Stable Sell',
              confidence: 65,
              trend5Day: -400,
              avg5Day: -150,
              vsAverage: -50,
            },
          },
        }),
      })

      const result2 = diagnoseStockDecline(input2)
      expect(result2.riskLevel).toBeGreaterThan(70)
    })
  })
})
