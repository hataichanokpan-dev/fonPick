/**
 * Market Data Generator
 *
 * Generates realistic Thai market scenarios for testing.
 * Supports Bullish, Bearish, Risk-On, Risk-Off, and Sector Rotation scenarios.
 */

import type {
  RTDBInvestorType,
  RTDBInvestorFlow,
  RTDBIndustrySector,
  RTDBSector,
  RTDBTopRankings,
  RTDBTopStock,
} from '@/types/rtdb'

// ============================================================================
// MARKET SCENARIO TYPES
// ============================================================================

export type MarketScenario =
  | 'Bullish'       // Strong buy across the board
  | 'Bearish'       // Strong sell across the board
  | 'Risk-On'       // Cyclicals up, defensives down
  | 'Risk-Off'      // Defensives up, cyclicals down
  | 'SectorRotation' // Money moving between sectors
  | 'Mixed'         // No clear direction
  | 'Flat'          // Minimal movement

export interface GeneratorOptions {
  scenario: MarketScenario
  intensity?: 'Low' | 'Medium' | 'High'
  timestamp?: number
  historicalDays?: number
  includeRankings?: boolean
}

// ============================================================================
// SECTOR DEFINITIONS FOR GENERATION
// ============================================================================

const SECTOR_CONFIGS: Record<
  string,
  { id: string; name: string; group: string; baseIndex: number; baseVol: number }
> = {
  FIN: { id: 'FIN', name: 'Financial', group: 'Cyclical', baseIndex: 350, baseVol: 15000 },
  ENERGY: { id: 'ENERGY', name: 'Energy', group: 'Resource', baseIndex: 280, baseVol: 12000 },
  TECH: { id: 'TECH', name: 'Technology', group: 'Growth', baseIndex: 320, baseVol: 8000 },
  AGRI: { id: 'AGRI', name: 'Agribusiness', group: 'Resource', baseIndex: 180, baseVol: 6000 },
  FOOD: { id: 'FOOD', name: 'Food', group: 'Defensive', baseIndex: 200, baseVol: 5000 },
  HEALTH: { id: 'HEALTH', name: 'Healthcare', group: 'Defensive', baseIndex: 250, baseVol: 4000 },
  PROP: { id: 'PROP', name: 'Property', group: 'Property', baseIndex: 140, baseVol: 5000 },
  CONS: { id: 'CONS', name: 'Construction', group: 'Cyclical', baseIndex: 160, baseVol: 4500 },
  TRANS: { id: 'TRANS', name: 'Transport', group: 'Cyclical', baseIndex: 120, baseVol: 3500 },
  COMM: { id: 'COMM', name: 'Commerce', group: 'Growth', baseIndex: 90, baseVol: 3000 },
}

const SECTOR_IDS = Object.keys(SECTOR_CONFIGS)

// ============================================================================
// STOCK DEFINITIONS FOR RANKINGS
// ============================================================================

const STOCK_DEFINITIONS: Record<string, { symbol: string; name: string; sectorId: string }> = {
  // Financial
  KBANK: { symbol: 'KBANK', name: 'Kasikornbank', sectorId: 'FIN' },
  SCB: { symbol: 'SCB', name: 'SCB', sectorId: 'FIN' },
  BBL: { symbol: 'BBL', name: 'Bangkok Bank', sectorId: 'FIN' },
  KTB: { symbol: 'KTB', name: 'Krungthai Bank', sectorId: 'FIN' },
  TTB: { symbol: 'TTB', name: 'TTB', sectorId: 'FIN' },

  // Energy
  PTT: { symbol: 'PTT', name: 'PTT', sectorId: 'ENERGY' },
  PTTEP: { symbol: 'PTTEP', name: 'PTTEP', sectorId: 'ENERGY' },
  TOP: { symbol: 'TOP', name: 'TOP', sectorId: 'ENERGY' },
  BCP: { symbol: 'BCP', name: 'BCP', sectorId: 'ENERGY' },

  // Technology
  ADVANC: { symbol: 'ADVANC', name: 'Advanced Info', sectorId: 'TECH' },
  INTUCH: { symbol: 'INTUCH', name: 'Intouch', sectorId: 'TECH' },
  TRUE: { symbol: 'TRUE', name: 'TRUE', sectorId: 'TECH' },
  HMPRO: { symbol: 'HMPRO', name: 'HMPRO', sectorId: 'TECH' },

  // Agribusiness
  CPF: { symbol: 'CPF', name: 'CPF', sectorId: 'AGRI' },
  TA: { symbol: 'TA', name: 'Thai Union', sectorId: 'AGRI' },

  // Food
  MFC: { symbol: 'MFC', name: 'MFC', sectorId: 'FOOD' },
  TU: { symbol: 'TU', name: 'TU', sectorId: 'FOOD' },

  // Healthcare
  BH: { symbol: 'BH', name: 'Bangkok Hosp', sectorId: 'HEALTH' },
  CHG: { symbol: 'CHG', name: 'Chaeng Watthana', sectorId: 'HEALTH' },

  // Property
  AP: { symbol: 'AP', name: 'Asian Property', sectorId: 'PROP' },
  LAND: { symbol: 'LAND', name: 'Land & Houses', sectorId: 'PROP' },
  LH: { symbol: 'LH', name: 'LH', sectorId: 'PROP' },
  QH: { symbol: 'QH', name: 'Quality Houses', sectorId: 'PROP' },

  // Construction
  ITD: { symbol: 'ITD', name: 'Italian-Thai', sectorId: 'CONS' },
  CK: { symbol: 'CK', name: 'CH Karnchang', sectorId: 'CONS' },

  // Transport
  THAI: { symbol: 'THAI', name: 'THAI Airways', sectorId: 'TRANS' },
  BLS: { symbol: 'BLS', name: 'BLS', sectorId: 'TRANS' },

  // Commerce
  CPALL: { symbol: 'CPALL', name: 'CPALL', sectorId: 'COMM' },
  BJC: { symbol: 'BJC', name: 'BJC', sectorId: 'COMM' },
}

// ============================================================================
// INTENSITY MULTIPLIERS
// ============================================================================

const INTENSITY_MULTIPLIERS: Record<'Low' | 'Medium' | 'High', number> = {
  Low: 0.5,
  Medium: 1.0,
  High: 2.0,
}

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================

/**
 * Generate complete market data for a scenario
 * @param options Generation options
 * @returns Complete market data
 */
export function generateMarketData(options: GeneratorOptions): {
  investorType: RTDBInvestorType
  industrySector: RTDBIndustrySector
  topRankings?: RTDBTopRankings
  historical: {
    investorType: RTDBInvestorType[]
    industrySector: RTDBIndustrySector[]
  }
} {
  const {
    scenario,
    intensity = 'Medium',
    timestamp = Date.now(),
    historicalDays = 10,
    includeRankings = true,
  } = options

  const multiplier = INTENSITY_MULTIPLIERS[intensity]

  // Generate current data
  const investorType = generateInvestorType(scenario, multiplier, timestamp)
  const industrySector = generateIndustrySector(scenario, multiplier, timestamp)
  const topRankings = includeRankings ? generateTopRankings(scenario, multiplier, industrySector, timestamp) : undefined

  // Generate historical data
  const historical = generateHistoricalData(scenario, multiplier, timestamp, historicalDays)

  return {
    investorType,
    industrySector,
    topRankings,
    historical,
  }
}

// ============================================================================
// INVESTOR TYPE GENERATION
// ============================================================================

/**
 * Generate investor type data based on scenario
 */
function generateInvestorType(
  scenario: MarketScenario,
  multiplier: number,
  timestamp: number
): RTDBInvestorType {
  const baseActivity = 10000 // Base trading value in millions

  // Scenario-based flow generation
  const flows = getScenarioFlows(scenario, multiplier)

  return {
    foreign: generateInvestorFlow(baseActivity * flows.foreign, flows.foreignTrend),
    institution: generateInvestorFlow(baseActivity * 0.7 * flows.institution, flows.institutionTrend),
    retail: generateInvestorFlow(baseActivity * 0.3 * flows.retail, flows.retailTrend),
    prop: generateInvestorFlow(baseActivity * 0.2 * flows.prop, flows.propTrend),
    timestamp,
  }
}

/**
 * Get flow multipliers based on scenario
 */
function getScenarioFlows(scenario: MarketScenario, multiplier: number) {
  switch (scenario) {
    case 'Bullish':
      return {
        foreign: 1.2 * multiplier,
        foreignTrend: 'buying',
        institution: 1.0 * multiplier,
        institutionTrend: 'buying',
        retail: 0.8 * multiplier,
        retailTrend: 'buying',
        prop: 0.5 * multiplier,
        propTrend: 'neutral',
      }
    case 'Bearish':
      return {
        foreign: -1.2 * multiplier,
        foreignTrend: 'selling',
        institution: -1.0 * multiplier,
        institutionTrend: 'selling',
        retail: -0.5 * multiplier,
        retailTrend: 'selling',
        prop: 0.3 * multiplier,
        propTrend: 'buying',
      }
    case 'Risk-On':
      return {
        foreign: 1.5 * multiplier,
        foreignTrend: 'buying',
        institution: 1.2 * multiplier,
        institutionTrend: 'buying',
        retail: 0.6 * multiplier,
        retailTrend: 'buying',
        prop: 0.8 * multiplier,
        propTrend: 'buying',
      }
    case 'Risk-Off':
      return {
        foreign: -0.8 * multiplier,
        foreignTrend: 'selling',
        institution: -0.5 * multiplier,
        institutionTrend: 'selling',
        retail: 0.3 * multiplier,
        retailTrend: 'buying',
        prop: -0.2 * multiplier,
        propTrend: 'selling',
      }
    case 'SectorRotation':
      return {
        foreign: 0.5 * multiplier,
        foreignTrend: 'buying',
        institution: 0.8 * multiplier,
        institutionTrend: 'buying',
        retail: 0.4 * multiplier,
        retailTrend: 'neutral',
        prop: 0.3 * multiplier,
        propTrend: 'neutral',
      }
    case 'Mixed':
      return {
        foreign: 0.3 * multiplier,
        foreignTrend: 'buying',
        institution: -0.2 * multiplier,
        institutionTrend: 'selling',
        retail: 0.1 * multiplier,
        retailTrend: 'neutral',
        prop: 0.1 * multiplier,
        propTrend: 'neutral',
      }
    case 'Flat':
      return {
        foreign: 0.1 * multiplier,
        foreignTrend: 'neutral',
        institution: 0.1 * multiplier,
        institutionTrend: 'neutral',
        retail: 0.1 * multiplier,
        retailTrend: 'neutral',
        prop: 0.1 * multiplier,
        propTrend: 'neutral',
      }
    default:
      return {
        foreign: 0,
        foreignTrend: 'neutral',
        institution: 0,
        institutionTrend: 'neutral',
        retail: 0,
        retailTrend: 'neutral',
        prop: 0,
        propTrend: 'neutral',
      }
  }
}

/**
 * Generate investor flow with trend
 */
function generateInvestorFlow(baseActivity: number, trend: string): RTDBInvestorFlow {
  const volatility = baseActivity * 0.3
  const buy = Math.max(0, baseActivity + (Math.random() - 0.5) * volatility)
  const sell = Math.max(0, baseActivity + (Math.random() - 0.5) * volatility)

  let net = buy - sell

  // Adjust net based on trend
  if (trend === 'buying') {
    net = Math.abs(net) * 0.8 + 200
  } else if (trend === 'selling') {
    net = -(Math.abs(net) * 0.8 + 200)
  } else {
    net = (Math.random() - 0.5) * 100
  }

  return {
    buy: Math.round(buy),
    sell: Math.round(sell),
    net: Math.round(net),
  }
}

// ============================================================================
// INDUSTRY SECTOR GENERATION
// ============================================================================

/**
 * Generate industry sector data based on scenario
 */
function generateIndustrySector(
  scenario: MarketScenario,
  multiplier: number,
  timestamp: number
): RTDBIndustrySector {
  const sectors: RTDBSector[] = SECTOR_IDS.map(id => {
    const config = SECTOR_CONFIGS[id]
    const { changePercent, volumeMultiplier } = getSectorChange(scenario, id, multiplier)

    return {
      id: config.id,
      name: config.name,
      index: config.baseIndex * (1 + changePercent / 100),
      change: config.baseIndex * (changePercent / 100),
      changePercent,
      marketCap: 100000 + Math.random() * 50000,
      volume: config.baseVol * volumeMultiplier * (0.8 + Math.random() * 0.4),
    }
  })

  return { sectors, timestamp }
}

/**
 * Get sector change based on scenario and sector type
 */
function getSectorChange(
  scenario: MarketScenario,
  sectorId: string,
  multiplier: number
): { changePercent: number; volumeMultiplier: number } {
  const config = SECTOR_CONFIGS[sectorId]
  const baseChange = 2.0 * multiplier

  switch (scenario) {
    case 'Bullish':
      return {
        changePercent: baseChange * (0.5 + Math.random() * 1.5),
        volumeMultiplier: 1.5,
      }
    case 'Bearish':
      return {
        changePercent: -baseChange * (0.5 + Math.random() * 1.5),
        volumeMultiplier: 1.3,
      }
    case 'Risk-On':
      // Cyclicals and Growth up, Defensives down or flat
      if (config.group === 'Cyclical' || config.group === 'Growth') {
        return {
          changePercent: baseChange * (1 + Math.random()),
          volumeMultiplier: 1.8,
        }
      } else if (config.group === 'Defensive') {
        return {
          changePercent: -baseChange * 0.3 * Math.random(),
          volumeMultiplier: 0.8,
        }
      }
      return {
        changePercent: baseChange * 0.5 * Math.random(),
        volumeMultiplier: 1.0,
      }
    case 'Risk-Off':
      // Defensives up, Cyclicals down
      if (config.group === 'Defensive') {
        return {
          changePercent: baseChange * (0.8 + Math.random() * 0.5),
          volumeMultiplier: 1.2,
        }
      } else if (config.group === 'Cyclical' || config.group === 'Growth') {
        return {
          changePercent: -baseChange * (0.5 + Math.random() * 0.8),
          volumeMultiplier: 0.7,
        }
      }
      return {
        changePercent: baseChange * 0.3 * Math.random(),
        volumeMultiplier: 1.0,
      }
    case 'SectorRotation':
      // Create divergence: some sectors up, some down
      const isLeading = ['FIN', 'TECH', 'ENERGY'].includes(sectorId)
      const isLagging = ['PROP', 'FOOD', 'HEALTH'].includes(sectorId)
      if (isLeading) {
        return {
          changePercent: baseChange * (1.5 + Math.random()),
          volumeMultiplier: 1.8,
        }
      } else if (isLagging) {
        return {
          changePercent: -baseChange * (0.5 + Math.random() * 0.5),
          volumeMultiplier: 0.6,
        }
      }
      return {
        changePercent: baseChange * 0.2 * (Math.random() - 0.5),
        volumeMultiplier: 1.0,
      }
    case 'Mixed':
      return {
        changePercent: baseChange * (Math.random() - 0.5) * 2,
        volumeMultiplier: 0.8 + Math.random() * 0.4,
      }
    case 'Flat':
      return {
        changePercent: (Math.random() - 0.5) * 0.3,
        volumeMultiplier: 0.7 + Math.random() * 0.2,
      }
    default:
      return {
        changePercent: 0,
        volumeMultiplier: 1.0,
      }
  }
}

// ============================================================================
// TOP RANKINGS GENERATION
// ============================================================================

/**
 * Generate top rankings based on scenario and sector data
 */
function generateTopRankings(
  scenario: MarketScenario,
  multiplier: number,
  industrySector: RTDBIndustrySector,
  timestamp: number
): RTDBTopRankings {
  // Get sector performance for stock weighting
  const sectorChanges: Record<string, number> = {}
  industrySector.sectors.forEach(s => {
    sectorChanges[s.id] = s.changePercent
  })

  // Generate stocks
  const allStocks = Object.values(STOCK_DEFINITIONS).map(def => {
    const sectorChange = sectorChanges[def.sectorId] || 0
    const baseChange = scenario === 'Bullish' || scenario === 'Risk-On' ? 3 : -2

    return {
      ...def,
      changePct: sectorChange + (Math.random() - 0.3) * baseChange * multiplier,
    }
  })

  // Sort and pick top gainers/losers
  const sortedByGain = [...allStocks].sort((a, b) => b.changePct - a.changePct)
  const sortedByLoss = [...allStocks].sort((a, b) => a.changePct - b.changePct)
  const sortedByVolume = [...allStocks].sort(() => Math.random() - 0.5)

  const topGainers = sortedByGain.slice(0, 10).map(s => createTopStock(s, 'gainer'))
  const topLosers = sortedByLoss.slice(0, 10).map(s => createTopStock(s, 'loser'))
  const topVolume = sortedByVolume.slice(0, 10).map(s => createTopStock(s, 'volume'))
  const topValue = sortedByVolume.slice(0, 10).map(s => createTopStock(s, 'value'))

  return {
    topGainers,
    topLosers,
    topVolume,
    topValue,
    timestamp,
  }
}

/**
 * Create top stock entry
 */
function createTopStock(
  stock: { symbol: string; name: string; sectorId: string; changePct: number },
  _type: 'gainer' | 'loser' | 'volume' | 'value'
): RTDBTopStock {
  const volumeBase = 50000
  const valueBase = 2000

  return {
    symbol: stock.symbol,
    name: stock.name,
    price: 10 + Math.random() * 100,
    change: stock.changePct * 0.1,
    changePct: stock.changePct,
    volume: Math.round(volumeBase * (0.5 + Math.random())),
    value: Math.round(valueBase * (0.5 + Math.random())),
  }
}

// ============================================================================
// HISTORICAL DATA GENERATION
// ============================================================================

/**
 * Generate historical data for trend analysis
 */
function generateHistoricalData(
  scenario: MarketScenario,
  multiplier: number,
  currentTimestamp: number,
  days: number
): {
  investorType: RTDBInvestorType[]
  industrySector: RTDBIndustrySector[]
} {
  const investorType: RTDBInvestorType[] = []
  const industrySector: RTDBIndustrySector[] = []

  for (let i = days; i > 0; i--) {
    const timestamp = currentTimestamp - i * 24 * 60 * 60 * 1000

    // Add some randomness to historical scenario
    const historicalScenario = i === 1 ? scenario : getRandomVariation(scenario)

    investorType.push(generateInvestorType(historicalScenario, multiplier * 0.9, timestamp))
    industrySector.push(generateIndustrySector(historicalScenario, multiplier * 0.9, timestamp))
  }

  return { investorType, industrySector }
}

/**
 * Get random variation of scenario for historical data
 */
function getRandomVariation(scenario: MarketScenario): MarketScenario {
  const variations: Record<MarketScenario, MarketScenario[]> = {
    Bullish: ['Bullish', 'Bullish', 'Mixed'],
    Bearish: ['Bearish', 'Bearish', 'Mixed'],
    'Risk-On': ['Risk-On', 'Risk-On', 'Mixed', 'Bullish'],
    'Risk-Off': ['Risk-Off', 'Risk-Off', 'Mixed', 'Bearish'],
    SectorRotation: ['SectorRotation', 'Mixed', 'Risk-On'],
    Mixed: ['Mixed', 'Mixed', 'Flat'],
    Flat: ['Flat', 'Mixed', 'Flat'],
  }

  const possibleVariations = variations[scenario] || [scenario]
  return possibleVariations[Math.floor(Math.random() * possibleVariations.length)]
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Generate bullish market data
 */
export function generateBullishMarket(intensity: 'Low' | 'Medium' | 'High' = 'Medium') {
  return generateMarketData({ scenario: 'Bullish', intensity })
}

/**
 * Generate bearish market data
 */
export function generateBearishMarket(intensity: 'Low' | 'Medium' | 'High' = 'Medium') {
  return generateMarketData({ scenario: 'Bearish', intensity })
}

/**
 * Generate risk-on market data
 */
export function generateRiskOnMarket(intensity: 'Low' | 'Medium' | 'High' = 'Medium') {
  return generateMarketData({ scenario: 'Risk-On', intensity })
}

/**
 * Generate risk-off market data
 */
export function generateRiskOffMarket(intensity: 'Low' | 'Medium' | 'High' = 'Medium') {
  return generateMarketData({ scenario: 'Risk-Off', intensity })
}

/**
 * Generate sector rotation market data
 */
export function generateSectorRotationData(intensity: 'Low' | 'Medium' | 'High' = 'Medium') {
  return generateMarketData({ scenario: 'SectorRotation', intensity })
}

/**
 * Generate mixed/flat market data
 */
export function generateMixedMarket(intensity: 'Low' | 'Medium' | 'High' = 'Medium') {
  return generateMarketData({ scenario: 'Mixed', intensity })
}

/**
 * Generate flat market data
 */
export function generateFlatMarket() {
  return generateMarketData({ scenario: 'Flat', intensity: 'Low' })
}
