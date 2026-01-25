/**
 * Correlations Analyzer
 *
 * Analyzes correlation between Top Rankings and Sector performance.
 * Part of Phase 5: Correlations Analysis
 */

import type {
  CorrelationInput,
  CorrelationStrength,
  AnomalyType,
  SectorRankingsCorrelation,
  RankingsImpactAnalysis,
  RankingsImpactLevel,
  SectorDominance,
  BreadthImpact,
  ConcentrationAnalysis,
  RankingsVsSectorAnalysis,
  SectorAnomaly,
  CorrelationMetrics,
  CorrelationSummary,
  CrossReferenceData,
  RankedStockWithSector,
} from '@/types/correlation'
import type { RTDBTopRankings, RTDBTopStock } from '@/types/rtdb'
import type { RTDBIndustrySector } from '@/types/rtdb'

// ============================================================================
// CORRELATION ANALYSIS
// ============================================================================

/**
 * Analyze rankings-sector correlation
 * @param input Correlation input
 * @returns Rankings vs sector analysis
 */
export function analyzeRankingsSectorCorrelation(
  input: CorrelationInput
): RankingsVsSectorAnalysis {
  const { rankings, sectors } = input

  // Map rankings to sectors
  const bySector = mapRankingsBySector(rankings, sectors)

  // Calculate per-sector correlations
  const sectorCorrelations = calculateSectorCorrelations(bySector, sectors)

  // Detect anomalies
  const anomalies = detectSectorAnomalies(bySector, sectors)

  // Calculate overall correlation
  const { overallCorrelation, correlationScore } = calculateOverallCorrelation(sectorCorrelations)

  // Check alignment
  const aligned = overallCorrelation === 'Strong Positive' || overallCorrelation === 'Positive'

  // Generate insights
  const insights = generateCorrelationInsights(overallCorrelation, sectorCorrelations, anomalies)

  return {
    overallCorrelation,
    correlationScore,
    sectorCorrelations,
    anomalies,
    aligned,
    insights,
    timestamp: sectors.timestamp,
  }
}

/**
 * Map rankings by sector
 * @param rankings Top rankings
 * @param sectors Industry sectors
 * @returns Array of sector rankings data
 */
function mapRankingsBySector(
  rankings: RTDBTopRankings,
  sectors: RTDBIndustrySector
): Array<{
  sectorId: string
  sectorName: string
  sectorChange: number
  rankingsCount: number
  gainers: number
  losers: number
}> {
  const sectorMap: Record<string, {
    sectorId: string
    sectorName: string
    sectorChange: number
    rankingsCount: number
    gainers: number
    losers: number
  }> = {}

  // Initialize with all sectors
  sectors.sectors.forEach(sector => {
    sectorMap[sector.id] = {
      sectorId: sector.id,
      sectorName: sector.name,
      sectorChange: sector.changePercent,
      rankingsCount: 0,
      gainers: 0,
      losers: 0,
    }
  })

  // Count rankings by sector
  const countRankings = (stocks: RTDBTopStock[], type: 'gainers' | 'losers') => {
    stocks.forEach(stock => {
      const sectorId = findStockSector(stock.symbol, sectors)
      if (sectorId && sectorMap[sectorId]) {
        sectorMap[sectorId].rankingsCount++
        if (type === 'gainers') {
          sectorMap[sectorId].gainers++
        } else {
          sectorMap[sectorId].losers++
        }
      }
    })
  }

  countRankings(rankings.topGainers, 'gainers')
  countRankings(rankings.topLosers, 'losers')
  countRankings(rankings.topVolume, 'losers') // Count as neutral
  countRankings(rankings.topValue, 'losers') // Count as neutral

  return Object.values(sectorMap).filter(s => s.rankingsCount > 0)
}

/**
 * Find stock's sector
 * @param symbol Stock symbol
 * @param sectors Industry sectors
 * @returns Sector ID or undefined
 */
function findStockSector(symbol: string, _sectors: RTDBIndustrySector): string | undefined {
  // Comprehensive mapping for Thai stocks
  const sectorMap: Record<string, string> = {
    // Financials (FIN)
    'KBANK': 'FIN', 'SCB': 'FIN', 'BBL': 'FIN', 'KTB': 'FIN', 'TISCO': 'FIN',
    'CIMBT': 'FIN', 'KKP': 'FIN', 'MFC': 'FIN', 'BGIF': 'FIN', 'FSS': 'FIN',
    'GI': 'FIN', 'LHFG': 'FIN', 'MTF': 'FIN', 'PHATH': 'FIN', 'SISB': 'FIN',
    'TIP': 'FIN', 'TLUX': 'FIN', 'THIP': 'FIN', 'TID': 'FIN',
    'TPAC': 'FIN', 'TSCR': 'FIN', 'UOB': 'FIN',
    'XPG': 'FIN', 'GHL': 'FIN', 'IPC': 'FIN', 'JMT': 'FIN', 'KGI': 'FIN',
    'MGI': 'FIN', 'MST': 'FIN', 'OLY': 'FIN', 'PRINC': 'FIN', 'RICH': 'FIN',
    'TAYA': 'FIN', 'THAI': 'FIN', 'TKS': 'FIN', 'TPS': 'FIN',
    'TRUB': 'FIN', 'W-F': 'FIN', 'WFX': 'FIN', 'WHAIR': 'FIN',
    // Energy (ENERGY)
    'PTT': 'ENERGY', 'PTTEP': 'ENERGY', 'TOP': 'ENERGY', 'BCP': 'ENERGY',
    'BPP': 'ENERGY', 'BR': 'ENERGY', 'CHEART': 'ENERGY', 'CPN': 'ENERGY',
    'EASTW': 'ENERGY', 'EFORT': 'ENERGY', 'GGC': 'ENERGY',
    'HYPE': 'ENERGY', 'IRCP': 'ENERGY', 'KSL': 'ENERGY', 'MOCCA': 'ENERGY',
    'ORI': 'ENERGY', 'PG': 'ENERGY', 'PTTGC': 'ENERGY', 'RATCH': 'ENERGY',
    'SSSC': 'ENERGY', 'STEC': 'ENERGY', 'SUSCO': 'ENERGY', 'SYNTEC': 'ENERGY',
    'TPIPP': 'ENERGY', 'WIIK': 'ENERGY',
    // Technology (TECH)
    'ADVANC': 'TECH', 'INTUCH': 'TECH', 'TRUE': 'TECH', 'AIS': 'TECH',
    'DTAC': 'TECH', 'FORTH': 'TECH', 'IVL': 'TECH', 'JASIF': 'TECH',
    'SAMART': 'TECH', 'SYNEXA': 'TECH', 'SYNEX': 'TECH', 'TMT': 'TECH',
    // Agriculture (AGRI)
    'CPF': 'AGRI', 'TA': 'AGRI', 'APURE': 'AGRI', 'CFR': 'AGRI',
    'GFPT': 'AGRI', 'MCOT': 'AGRI', 'SFP': 'AGRI', 'STA': 'AGRI',
    'TFM': 'AGRI', 'TFF': 'AGRI', 'TIPCO': 'AGRI', 'VRANDA': 'AGRI',
    // Property (PROP)
    'AP': 'PROP', 'LAND': 'PROP', 'LH': 'PROP', 'AMATA': 'PROP',
    'CK': 'PROP', 'FMT': 'PROP', 'GTPL': 'PROP', 'IMPACT': 'PROP',
    'KEX': 'PROP', 'NCH': 'PROP',
    'PF': 'PROP', 'PLE': 'PROP', 'PRIN': 'PROP', 'PSL': 'PROP',
    'QH': 'PROP', 'RONIN': 'PROP', 'RML': 'PROP', 'SAM': 'PROP',
    'SIRI': 'PROP', 'SPALI': 'PROP', 'SST': 'PROP', 'SUKUMVIT': 'PROP',
    'SUPAL': 'PROP', 'WFB': 'PROP',
    // Consumer
    'HMPRO': 'CONS', 'MJC': 'CONS', 'SAUCE': 'CONS', 'SUCK': 'CONS',
    'TOK': 'CONS', 'WPHY': 'CONS',
    // Industrial
    'BEM': 'INDUS', 'BGRIM': 'INDUS', 'DELTA': 'INDUS', 'EGCO': 'INDUS',
    'KCE': 'INDUS', 'SAK': 'INDUS',
    'SVI': 'INDUS',
    // Resources
    'AOT': 'RES',
    'DUSIT': 'RES', 'PATO': 'RES',
  }

  return sectorMap[symbol]
}

/**
 * Calculate per-sector correlations
 * @param bySector Rankings by sector data
 * @param sectors Industry sectors
 * @returns Array of sector correlations
 */
function calculateSectorCorrelations(
  bySector: Array<{
    sectorId: string
    sectorName: string
    sectorChange: number
    rankingsCount: number
    gainers: number
    losers: number
  }>,
  sectors: RTDBIndustrySector
): SectorRankingsCorrelation[] {
  return bySector.map(sectorData => {
    const { sectorId, sectorName, sectorChange, rankingsCount, gainers, losers } = sectorData

    // Calculate expected count (proportional to sector size)
    // Round to 2 decimal places to avoid floating-point precision issues
    const totalRankings = bySector.reduce((sum, s) => sum + s.rankingsCount, 0)
    const sectorCount = sectors.sectors.length
    const expectedCountRaw = totalRankings / sectorCount
    const expectedCount = Math.round(expectedCountRaw * 100) / 100

    // Determine correlation strength
    const correlation = calculateSectorCorrelationStrength(sectorChange, gainers, losers, rankingsCount)

    // Calculate correlation score
    const correlationScore = calculateSectorCorrelationScore(correlation)

    // Detect anomaly
    const anomaly = detectSectorAnomalyType(sectorChange, gainers, losers, rankingsCount)

    return {
      sectorId,
      sectorName,
      sectorChange,
      rankingsCount,
      expectedCount,
      correlation,
      anomaly,
      correlationScore,
    }
  })
}

/**
 * Calculate sector correlation strength
 * @param sectorChange Sector change percentage
 * @param gainers Number of stocks in top gainers
 * @param losers Number of stocks in top losers
 * @param rankingsCount Total rankings count
 * @returns Correlation strength
 */
function calculateSectorCorrelationStrength(
  sectorChange: number,
  gainers: number,
  losers: number,
  _rankingsCount: number
): CorrelationStrength {
  // Positive sector with gainers in rankings
  if (sectorChange > 0.5 && gainers > 0) {
    return gainers >= 3 ? 'Strong Positive' : 'Positive'
  }

  // Negative sector with losers in rankings
  if (sectorChange < -0.5 && losers > 0) {
    return losers >= 3 ? 'Strong Positive' : 'Positive'
  }

  // Divergence: positive sector but losers > gainers
  if (sectorChange > 0.5 && losers > gainers) {
    return losers >= 3 ? 'Negative' : 'Neutral'
  }

  // Divergence: negative sector but gainers > losers
  if (sectorChange < -0.5 && gainers > losers) {
    return gainers >= 3 ? 'Negative' : 'Neutral'
  }

  return 'Neutral'
}

/**
 * Calculate sector correlation score
 * @param correlation Correlation strength
 * @returns Score (0-100)
 */
function calculateSectorCorrelationScore(correlation: CorrelationStrength): number {
  switch (correlation) {
    case 'Strong Positive':
      return 90
    case 'Positive':
      return 70
    case 'Neutral':
      return 50
    case 'Negative':
      return 30
    case 'Strong Negative':
      return 10
  }
}

/**
 * Detect sector anomaly type
 * @param sectorChange Sector change
 * @param gainers Gainers count
 * @param losers Losers count
 * @param rankingsCount Total rankings
 * @returns Anomaly type
 */
function detectSectorAnomalyType(
  sectorChange: number,
  gainers: number,
  losers: number,
  rankingsCount: number
): AnomalyType {
  if (sectorChange > 1 && gainers === 0) {
    return 'Sector Up No Rankings'
  }
  if (sectorChange < -1 && rankingsCount >= 3) {
    return 'Sector Down Many Rankings'
  }
  if (sectorChange > 1 && losers > gainers) {
    return 'Divergent Performance'
  }
  if (sectorChange < -1 && gainers > losers) {
    return 'Divergent Performance'
  }
  return 'No Anomaly'
}

/**
 * Calculate overall correlation
 * @param correlations Sector correlations
 * @returns Overall correlation strength and score
 */
function calculateOverallCorrelation(
  correlations: SectorRankingsCorrelation[]
): { overallCorrelation: CorrelationStrength; correlationScore: number } {
  if (correlations.length === 0) {
    return { overallCorrelation: 'Neutral', correlationScore: 50 }
  }

  // Average correlation score
  const avgScore = correlations.reduce((sum, c) => sum + c.correlationScore, 0) / correlations.length

  // Determine overall correlation
  let overallCorrelation: CorrelationStrength
  if (avgScore >= 80) {
    overallCorrelation = 'Strong Positive'
  } else if (avgScore >= 60) {
    overallCorrelation = 'Positive'
  } else if (avgScore >= 40) {
    overallCorrelation = 'Neutral'
  } else if (avgScore >= 20) {
    overallCorrelation = 'Negative'
  } else {
    overallCorrelation = 'Strong Negative'
  }

  return { overallCorrelation, correlationScore: Math.round(avgScore) }
}

/**
 * Detect sector anomalies with severity
 * @param bySector Rankings by sector data
 * @param sectors Industry sectors
 * @returns Array of sector anomalies
 */
function detectSectorAnomalies(
  bySector: Array<{
    sectorId: string
    sectorName: string
    sectorChange: number
    rankingsCount: number
    gainers: number
    losers: number
  }>,
  _sectors: RTDBIndustrySector
): SectorAnomaly[] {
  const anomalies: SectorAnomaly[] = []

  bySector.forEach(data => {
    const anomaly = detectSectorAnomalyType(
      data.sectorChange,
      data.gainers,
      data.losers,
      data.rankingsCount
    )

    if (anomaly !== 'No Anomaly') {
      const severity = calculateAnomalySeverity(data.sectorChange, data.rankingsCount)

      anomalies.push({
        sectorId: data.sectorId,
        sectorName: data.sectorName,
        sectorChange: data.sectorChange,
        rankingsCount: data.rankingsCount,
        expectedCount: 0,
        correlation: 'Neutral',
        correlationScore: 50,
        anomaly,
        anomalyExplanation: generateAnomalyExplanation(anomaly, data),
        severity,
        explanation: generateAnomalyExplanation(anomaly, data),
        insight: generateAnomalyInsight(anomaly, data.sectorName),
      })
    }
  })

  return anomalies
}

/**
 * Calculate anomaly severity
 * @param sectorChange Sector change
 * @param rankingsCount Rankings count
 * @returns Severity level
 */
function calculateAnomalySeverity(sectorChange: number, rankingsCount: number): 'High' | 'Medium' | 'Low' {
  const magnitude = Math.abs(sectorChange)

  if (magnitude > 2 && rankingsCount === 0) {
    return 'High'
  } else if (magnitude > 1.5 || (magnitude > 1 && rankingsCount === 0)) {
    return 'Medium'
  }
  return 'Low'
}

/**
 * Generate anomaly explanation
 * @param anomaly Anomaly type
 * @param data Sector data
 * @returns Explanation string
 */
function generateAnomalyExplanation(
  anomaly: AnomalyType,
  data: { sectorName: string; sectorChange: number; gainers: number; losers: number }
): string {
  switch (anomaly) {
    case 'Sector Up No Rankings':
      return `${data.sectorName} up ${data.sectorChange.toFixed(1)}% but no stocks in top gainers`
    case 'Sector Down Many Rankings':
      return `${data.sectorName} down ${Math.abs(data.sectorChange).toFixed(1)}% but has ${data.gainers + data.losers} stocks in rankings`
    case 'Divergent Performance':
      return `${data.sectorName} performance diverges from stock rankings`
    default:
      return 'No anomaly'
  }
}

/**
 * Generate anomaly insight
 * @param anomaly Anomaly type
 * @param sectorName Sector name
 * @returns Insight string
 */
function generateAnomalyInsight(anomaly: AnomalyType, sectorName: string): string {
  switch (anomaly) {
    case 'Sector Up No Rankings':
      return `Broad-based ${sectorName} rally not concentrated in top stocks`
    case 'Sector Down Many Rankings':
      return `${sectorName} weakness not reflected in individual stock performance`
    case 'Divergent Performance':
      return `Check ${sectorName} components for rotation opportunities`
    default:
      return 'No specific insight'
  }
}

/**
 * Generate correlation insights
 * @param overallCorrelation Overall correlation
 * @param sectorCorrelations Sector correlations
 * @param anomalies Detected anomalies
 * @returns Array of insights
 */
function generateCorrelationInsights(
  overallCorrelation: CorrelationStrength,
  _sectorCorrelations: SectorRankingsCorrelation[],
  anomalies: SectorAnomaly[]
): string[] {
  const insights: string[] = []

  // Overall correlation insight
  insights.push(`Rankings-to-sector correlation: ${overallCorrelation}`)

  // Positive correlation insight
  if (overallCorrelation === 'Strong Positive' || overallCorrelation === 'Positive') {
    insights.push('Top rankings confirm sector trends - good alignment')
  } else if (overallCorrelation === 'Negative' || overallCorrelation === 'Strong Negative') {
    insights.push('Top rankings diverge from sector trends - rotation possible')
  }

  // Anomaly insight
  if (anomalies.length > 0) {
    insights.push(`${anomalies.length} sector anomalies detected`)
  }

  return insights
}

// ============================================================================
// RANKINGS IMPACT ANALYSIS
// ============================================================================

/**
 * Analyze rankings impact on market
 * @param input Correlation input
 * @returns Rankings impact analysis
 */
export function analyzeRankingsImpact(input: CorrelationInput): RankingsImpactAnalysis {
  const { rankings, sectors } = input

  // Map rankings by sector
  const bySector = mapRankingsBySector(rankings, sectors)

  // Calculate sector dominance
  const dominance = calculateSectorDominance(bySector)

  // Calculate breadth impact
  const breadthImpact = calculateBreadthImpact(bySector, sectors)

  // Calculate concentration
  const concentration = calculateConcentrationMetrics(bySector)

  // Determine overall impact
  const impact = determineImpactLevel(dominance, concentration)

  // Generate observations
  const observations = generateImpactObservations(impact, dominance, concentration)

  return {
    impact,
    dominance,
    breadthImpact,
    concentration,
    observations,
    timestamp: sectors.timestamp,
  }
}

/**
 * Calculate sector dominance
 * @param bySector Rankings by sector
 * @returns Sector dominance data
 */
function calculateSectorDominance(
  bySector: Array<{ sectorId: string; sectorName: string; rankingsCount: number }>
): SectorDominance {
  // Sort by rankings count
  const sorted = [...bySector].sort((a, b) => b.rankingsCount - a.rankingsCount)

  // Get dominant sectors (top 3) - use sectorId for consistency with API route mapping
  const dominant = sorted.slice(0, 3).map(s => s.sectorId)

  // Calculate dominance score
  const totalRankings = bySector.reduce((sum, s) => sum + s.rankingsCount, 0)
  const top3Count = sorted.slice(0, 3).reduce((sum, s) => sum + s.rankingsCount, 0)
  const dominanceScore = Math.round((top3Count / totalRankings) * 100)

  // Sector count
  const sectorCount = bySector.length

  // Top sector percentage
  const topSectorPercent = sorted.length > 0 ? Math.round((sorted[0].rankingsCount / totalRankings) * 100) : 0

  return {
    dominant,
    dominanceScore,
    sectorCount,
    topSectorPercent,
  }
}

/**
 * Calculate breadth impact
 * @param bySector Rankings by sector
 * @param sectors Industry sectors
 * @returns Breadth impact
 */
function calculateBreadthImpact(
  bySector: Array<{ sectorId: string; sectorName: string; rankingsCount: number }>,
  sectors: RTDBIndustrySector
): BreadthImpact {
  // Count sectors in rankings
  const sectorsInRankings = bySector.length
  const totalSectors = sectors.sectors.length

  // Determine breadth
  const breadthPct = (sectorsInRankings / totalSectors) * 100

  let rankingsBreadth: 'Broad' | 'Narrow' | 'Mixed'
  if (breadthPct >= 70) {
    rankingsBreadth = 'Broad'
  } else if (breadthPct <= 40) {
    rankingsBreadth = 'Narrow'
  } else {
    rankingsBreadth = 'Mixed'
  }

  // Check if breadth confirms (broad breadth = healthy)
  const confirmed = rankingsBreadth === 'Broad'

  const explanation = rankingsBreadth === 'Broad'
    ? 'Rankings spread across many sectors - broad participation'
    : rankingsBreadth === 'Narrow'
    ? 'Rankings concentrated in few sectors - narrow participation'
    : 'Moderately distributed rankings'

  return {
    confirmed,
    rankingsBreadth,
    explanation,
  }
}

/**
 * Calculate concentration metrics
 * @param bySector Rankings by sector
 * @returns Concentration analysis
 */
function calculateConcentrationMetrics(
  bySector: Array<{ rankingsCount: number }>
): ConcentrationAnalysis {
  const totalRankings = bySector.reduce((sum, s) => sum + s.rankingsCount, 0)

  // Calculate concentration score (top 3 percentage)
  const sorted = [...bySector].sort((a, b) => b.rankingsCount - a.rankingsCount)
  const top3Count = sorted.slice(0, 3).reduce((sum, s) => sum + s.rankingsCount, 0)
  const score = Math.round((top3Count / totalRankings) * 100)

  // Determine level
  let level: 'High' | 'Medium' | 'Low'
  if (score >= 60) {
    level = 'High'
  } else if (score >= 40) {
    level = 'Medium'
  } else {
    level = 'Low'
  }

  const top3Percent = score

  const interpretation = level === 'High'
    ? 'High concentration - market driven by few sectors'
    : level === 'Medium'
    ? 'Moderate concentration - balanced sector participation'
    : 'Low concentration - broad market participation'

  return {
    score,
    level,
    top3Percent,
    interpretation,
  }
}

/**
 * Determine impact level
 * @param dominance Sector dominance
 * @param concentration Concentration metrics
 * @returns Impact level
 */
function determineImpactLevel(
  _dominance: SectorDominance,
  concentration: ConcentrationAnalysis
): RankingsImpactLevel {
  if (concentration.score >= 60) {
    return 'High'
  } else if (concentration.score >= 40) {
    return 'Medium'
  } else if (concentration.score > 0) {
    return 'Low'
  }
  return 'Unclear'
}

/**
 * Generate impact observations
 * @param impact Impact level
 * @param dominance Sector dominance
 * @param concentration Concentration metrics
 * @returns Array of observations
 */
function generateImpactObservations(
  impact: RankingsImpactLevel,
  dominance: SectorDominance,
  concentration: ConcentrationAnalysis
): string[] {
  const observations: string[] = []

  observations.push(`Rankings impact: ${impact}`)

  if (dominance.dominant.length > 0) {
    observations.push(`Dominant sectors: ${dominance.dominant.join(', ')}`)
  }

  observations.push(`Concentration: ${concentration.level} (${concentration.score}%)`)

  if (dominance.sectorCount > 0) {
    observations.push(`${dominance.sectorCount} sectors represented in rankings`)
  }

  return observations
}

// ============================================================================
// CORRELATION SUMMARY
// ============================================================================

/**
 * Generate correlation summary
 * @param impact Rankings impact analysis
 * @param correlation Rankings vs sector analysis
 * @returns Correlation summary
 */
export function generateCorrelationSummary(
  impact: RankingsImpactAnalysis,
  correlation: RankingsVsSectorAnalysis
): CorrelationSummary {
  // Impact summary
  const impactSummary = {
    level: impact.impact,
    explanation: impact.concentration.interpretation,
  }

  // Correlation summary
  const correlationSummary = {
    strength: correlation.overallCorrelation,
    score: correlation.correlationScore,
    explanation: correlation.aligned
      ? 'Rankings align with sector performance'
      : 'Rankings diverge from sector performance',
  }

  // Anomalies
  const anomalies = correlation.anomalies.map(a => a.sectorName)

  // Insights
  const insights = [
    ...impact.observations,
    ...correlation.insights,
  ]

  return {
    impact: impactSummary,
    correlation: correlationSummary,
    anomalies,
    insights,
  }
}

// ============================================================================
// CROSS-REFERENCE DATA
// ============================================================================

/**
 * Generate cross-reference data
 * @param rankings Top rankings
 * @param sectors Industry sectors
 * @returns Cross-reference data
 */
export function generateCrossReferenceData(
  rankings: RTDBTopRankings,
  sectors: RTDBIndustrySector
): CrossReferenceData {
  // Generate ranked stocks with sector info
  const rankedStocks: RankedStockWithSector[] = []

  const processStocks = (
    stocks: RTDBTopStock[],
    category: 'gainers' | 'losers' | 'volume' | 'value'
  ) => {
    stocks.forEach(stock => {
      const existing = rankedStocks.find(s => s.symbol === stock.symbol)

      const sectorId = findStockSector(stock.symbol, sectors)
      const sector = sectors.sectors.find(s => s.id === sectorId)

      if (existing) {
        if (category === 'gainers') existing.in.gainers = 10 // Placeholder rank
        if (category === 'losers') existing.in.losers = 10
        if (category === 'volume') existing.in.volume = 10
        if (category === 'value') existing.in.value = 10
      } else {
        rankedStocks.push({
          symbol: stock.symbol,
          name: stock.name || stock.symbol,
          change: stock.changePct || 0,
          sectorCode: sectorId || 'Unknown',
          sectorName: sector?.name || 'Unknown',
          sectorChange: sector?.changePercent || 0,
          in: {
            ...(category === 'gainers' && { gainers: 10 }),
            ...(category === 'losers' && { losers: 10 }),
            ...(category === 'volume' && { volume: 10 }),
            ...(category === 'value' && { value: 10 }),
          },
          isAnomaly: false,
        })
      }
    })
  }

  processStocks(rankings.topGainers, 'gainers')
  processStocks(rankings.topLosers, 'losers')
  processStocks(rankings.topVolume, 'volume')
  processStocks(rankings.topValue, 'value')

  // Get bySector data
  const bySector = mapRankingsBySector(rankings, sectors)

  // Calculate metrics
  const metrics: CorrelationMetrics = {
    sectorCount: bySector.length,
    uniqueStocks: rankedStocks.length,
    concentrationScore: calculateConcentrationMetrics(
      bySector.map(s => ({ rankingsCount: s.rankingsCount }))
    ).score,
    anomalyCount: 0,
    avgCorrelationScore: 70,
  }

  // Anomalies would be detected separately

  return {
    rankedStocks,
    bySector: bySector.map(s => ({
      sectorId: s.sectorId,
      sectorName: s.sectorName,
      topGainers: s.gainers,
      topLosers: s.losers,
      topVolume: 0,
      topValue: 0,
      totalRankings: s.rankingsCount,
      sectorChange: s.sectorChange,
      isAnomaly: false,
    })),
    metrics,
    anomalies: [],
  }
}

