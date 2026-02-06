/**
 * Smart Money Trend Analyzer
 *
 * Analyzes historical investor flow data to detect trends, patterns,
 * and generate insights for smart money movement.
 *
 * Phase 1: Backend Implementation
 */

import type {
  RTDBInvestorType,
  RTDBInvestorFlow,
} from '@/types/rtdb'
import type {
  InvestorTrendData,
  DailyTrendPoint,
  AggregatedMetrics,
  CombinedTrendPoint,
  DetectedPattern,
  CombinedSignal,
  RiskSignal,
  TrendDirection,
} from '@/types/smart-money'

// ============================================================================
// PATTERN ENRICHMENT HELPERS
// ============================================================================

/**
 * Determine participant role for a pattern
 */
function getParticipantRole(
  investorNet: number,
  totalNet: number,
  threshold: number = 100
): 'driving' | 'following' | 'absent' | 'opposing' {
  const absNet = Math.abs(investorNet)
  const pct = totalNet !== 0 ? Math.abs(investorNet / totalNet) : 0

  if (absNet < threshold) return 'absent'
  if (pct > 0.5 && investorNet * totalNet > 0) return 'driving'
  if (investorNet * totalNet > 0) return 'following'
  return 'opposing'
}

/**
 * Get actionable guidance for pattern type
 */
function getPatternGuidance(
  type: DetectedPattern['type'],
  strength: number,
  isSmartMoneyBuying: boolean
): Pick<DetectedPattern, 'action' | 'riskLevel' | 'insight'> {
  const highStrength = strength >= 70
  const lowStrength = strength < 40

  switch (type) {
    case 'Accumulation':
      return {
        action: highStrength ? 'accumulate' : 'buy',
        riskLevel: 'low',
        insight: 'Smart money quietly buying. Add on pullbacks for swing trades.',
      }

    case 'Distribution':
      return {
        action: 'reduce',
        riskLevel: highStrength ? 'high' : 'medium',
        insight: 'Smart money exiting. Reduce exposure, avoid new entries.',
      }

    case 'Divergence':
      if (isSmartMoneyBuying) {
        return {
          action: 'buy',
          riskLevel: 'medium',
          insight: 'Smart money buying while retail sells. Bullish signal.',
        }
      }
      return {
        action: 'sell',
        riskLevel: 'medium',
        insight: 'Smart money selling into retail buying. Be cautious.',
      }

    case 'FOMO':
      return {
        action: 'wait',
        riskLevel: 'high',
        insight: 'Retail chasing prices. Smart money typically sells into this.',
      }

    case 'Panic':
      return {
        action: isSmartMoneyBuying ? 'buy' : 'wait',
        riskLevel: isSmartMoneyBuying ? 'medium' : 'high',
        insight: isSmartMoneyBuying
          ? 'Capitulation selling. Smart money absorbing - opportunity.'
          : 'Panic selling in progress. Wait for stabilization.',
      }

    case 'Reversal':
      return {
        action: 'hold',
        riskLevel: 'medium',
        insight: 'Trend changing direction. Wait for confirmation before acting.',
      }

    default:
      return {
        action: 'hold',
        riskLevel: 'medium',
        insight: 'Monitor closely for more signals.',
      }
  }
}

// ============================================================================
// DATA CONVERSION
// ============================================================================

/**
 * Convert RTDBInvestorFlow to DailyTrendPoint
 */
function flowToDailyPoint(
  date: string,
  timestamp: number,
  flow: RTDBInvestorFlow,
  buyPct: number,
  sellPct: number
): DailyTrendPoint {
  return {
    date,
    timestamp,
    buy: flow.buy,
    sell: flow.sell,
    net: flow.net,
    buyPct,
    sellPct,
  }
}

/**
 * Convert RTDBInvestorType array to InvestorTrendData
 */
export function convertToInvestorTrend(
  data: Array<{ date: string; data: RTDBInvestorType }>,
  investorType: 'foreign' | 'institution' | 'retail' | 'prop'
): InvestorTrendData {
  const names: Record<typeof investorType, string> = {
    foreign: 'นักลงทุนต่างประเทศ',
    institution: 'สถาบันในประเทศ',
    retail: 'นักลงทุนทั่วไปในประเทศ',
    prop: 'บัญชีบริษัทหลักทรัพย์',
  }

  // Get raw rows from example data structure (if available)
  const daily: DailyTrendPoint[] = data.map((item) => {
    const flow = item.data[investorType]
    // For now, use approximate buyPct/sellPct since we don't have them in RTDBInvestorType
    const total = flow.buy + flow.sell
    const buyPct = total > 0 ? (flow.buy / total) * 100 : 50
    const sellPct = total > 0 ? (flow.sell / total) * 100 : 50

    return flowToDailyPoint(item.date, item.data.timestamp, flow, buyPct, sellPct)
  })

  // Calculate aggregated metrics
  const aggregated = calculateAggregatedMetrics(daily)

  // Calculate moving averages
  const movingAverages = {
    ma3: calculateMA(daily, 3),
    ma5: calculateMA(daily, 5),
    ma10: calculateMA(daily, 10),
  }

  return {
    investor: investorType,
    name: names[investorType],
    daily,
    aggregated,
    movingAverages,
  }
}

// ============================================================================
// AGGREGATION FUNCTIONS
// ============================================================================

/**
 * Calculate aggregated metrics from daily data
 */
function calculateAggregatedMetrics(daily: DailyTrendPoint[]): AggregatedMetrics {
  if (daily.length === 0) {
    return {
      totalBuy: 0,
      totalSell: 0,
      totalNet: 0,
      avgDaily: 0,
      maxBuy: { date: '', value: 0 },
      maxSell: { date: '', value: 0 },
      trend: 'sideways',
      trendStrength: 0,
      stdDev: 0,
    }
  }

  const totalBuy = daily.reduce((sum, d) => sum + d.buy, 0)
  const totalSell = daily.reduce((sum, d) => sum + d.sell, 0)
  const totalNet = daily.reduce((sum, d) => sum + d.net, 0)
  const avgDaily = totalNet / daily.length

  // Find max buy/sell days
  let maxBuy = { date: daily[0].date, value: daily[0].buy }
  let maxSell = { date: daily[0].date, value: daily[0].sell }

  for (const d of daily) {
    if (d.buy > maxBuy.value) maxBuy = { date: d.date, value: d.buy }
    if (d.sell > maxSell.value) maxSell = { date: d.date, value: d.sell }
  }

  // Calculate trend direction using linear regression
  const trend = calculateTrendDirection(daily)

  // Calculate trend strength (R-squared of trend)
  const trendStrength = calculateTrendStrength(daily, trend)

  // Calculate standard deviation
  const stdDev = calculateStdDev(daily.map((d) => d.net))

  return {
    totalBuy,
    totalSell,
    totalNet,
    avgDaily,
    maxBuy,
    maxSell,
    trend,
    trendStrength,
    stdDev,
  }
}

/**
 * Calculate moving average for given period
 */
function calculateMA(daily: DailyTrendPoint[], period: number): number | null {
  if (daily.length < period) return null

  const recentNet = daily.slice(-period).map((d) => d.net)
  return recentNet.reduce((sum, val) => sum + val, 0) / period
}

/**
 * Calculate trend direction using linear regression
 */
function calculateTrendDirection(daily: DailyTrendPoint[]): TrendDirection {
  if (daily.length < 2) return 'sideways'

  const n = daily.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += daily[i].net
    sumXY += i * daily[i].net
    sumX2 += i * i
  }

  // Calculate slope
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

  // Determine direction based on slope
  if (slope > 50) return 'up'
  if (slope < -50) return 'down'
  return 'sideways'
}

/**
 * Calculate trend strength (0-100) based on R-squared
 */
function calculateTrendStrength(daily: DailyTrendPoint[], trend: TrendDirection): number {
  if (daily.length < 3 || trend === 'sideways') return 50

  const n = daily.length
  const mean = daily.reduce((sum, d) => sum + d.net, 0) / n

  // Calculate total sum of squares
  const totalSS = daily.reduce((sum, d) => sum + Math.pow(d.net - mean, 2), 0)

  if (totalSS === 0) return 50

  // Calculate linear regression line
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += daily[i].net
    sumXY += i * daily[i].net
    sumX2 += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate residual sum of squares
  const residualSS = daily.reduce((sum, d, i) => {
    const predicted = slope * i + intercept
    return sum + Math.pow(d.net - predicted, 2)
  }, 0)

  // R-squared
  const rSquared = 1 - residualSS / totalSS

  // Convert to 0-100 scale
  return Math.round(Math.max(0, Math.min(100, rSquared * 100)))
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length

  return Math.sqrt(variance)
}

// ============================================================================
// COMBINED TREND ANALYSIS
// ============================================================================

/**
 * Generate combined trend points from all investor data
 */
export function generateCombinedTrend(
  data: Array<{ date: string; data: RTDBInvestorType }>
): CombinedTrendPoint[] {
  return data.map((item) => {
    const { foreign, institution, retail, prop } = item.data
    const smartMoneyNet = foreign.net + institution.net
    const totalNet = smartMoneyNet + retail.net + prop.net

    // Generate combined signal
    const signal = generateCombinedSignal(smartMoneyNet)
    const riskSignal = generateRiskSignal(smartMoneyNet)

    return {
      date: item.date,
      timestamp: item.data.timestamp,
      smartMoneyNet,
      retailNet: retail.net,
      propNet: prop.net,
      totalNet,
      signal,
      riskSignal,
    }
  })
}

/**
 * Generate combined signal from smart money net
 */
function generateCombinedSignal(smartMoneyNet: number): CombinedSignal {
  if (smartMoneyNet >= 600) return 'Strong Buy'
  if (smartMoneyNet >= 100) return 'Buy'
  if (smartMoneyNet <= -600) return 'Strong Sell'
  if (smartMoneyNet <= -100) return 'Sell'
  return 'Neutral'
}

/**
 * Generate risk signal from smart money net
 */
function generateRiskSignal(smartMoneyNet: number): RiskSignal {
  if (smartMoneyNet >= 1000) return 'Risk-On'
  if (smartMoneyNet >= 300) return 'Risk-On Mild'
  if (smartMoneyNet <= -1000) return 'Risk-Off'
  if (smartMoneyNet <= -300) return 'Risk-Off Mild'
  return 'Neutral'
}

// ============================================================================
// PATTERN DETECTION
// ============================================================================

/**
 * Detect patterns in trend data
 */
export function detectPatterns(
  foreign: InvestorTrendData,
  institution: InvestorTrendData,
  retail: InvestorTrendData
): DetectedPattern[] {
  const patterns: DetectedPattern[] = []

  // Detect accumulation (smart money net buy for multiple days)
  const accumulationPattern = detectAccumulation(foreign, institution)
  if (accumulationPattern) patterns.push(accumulationPattern)

  // Detect distribution (smart money net sell for multiple days)
  const distributionPattern = detectDistribution(foreign, institution)
  if (distributionPattern) patterns.push(distributionPattern)

  // Detect divergence (smart money vs retail)
  const divergencePattern = detectDivergence(foreign, institution, retail)
  if (divergencePattern) patterns.push(divergencePattern)

  // Detect FOMO (retail heavy buying)
  const fomoPattern = detectFOMO(retail)
  if (fomoPattern) patterns.push(fomoPattern)

  // Detect panic (retail heavy selling)
  const panicPattern = detectPanic(retail)
  if (panicPattern) patterns.push(panicPattern)

  return patterns
}

/**
 * Detect accumulation pattern
 */
function detectAccumulation(
  foreign: InvestorTrendData,
  institution: InvestorTrendData
): DetectedPattern | null {
  const combinedDaily = foreign.daily.map((f, i) => ({
    date: f.date,
    net: f.net + institution.daily[i]?.net,
  }))

  // Check for consecutive net buy days
  let consecutiveBuys = 0
  let maxConsecutiveBuys = 0

  for (const point of combinedDaily) {
    if (point.net > 0) {
      consecutiveBuys++
      if (consecutiveBuys > maxConsecutiveBuys) {
        maxConsecutiveBuys = consecutiveBuys
      }
    } else {
      consecutiveBuys = 0
    }
  }

  if (maxConsecutiveBuys >= 3) {
    const totalFlow = combinedDaily.reduce((sum, d) => sum + d.net, 0)
    const foreignTotal = foreign.aggregated.totalNet
    const instTotal = institution.aggregated.totalNet
    const strength = Math.min(100, maxConsecutiveBuys * 15 + Math.abs(totalFlow) / 100)

    // Get actionable guidance
    const guidance = getPatternGuidance('Accumulation', strength, true)

    // Determine participant roles
    const totalFlowAbs = Math.abs(totalFlow)
    const participants = {
      foreign: getParticipantRole(foreignTotal, totalFlowAbs, 200),
      institution: getParticipantRole(instTotal, totalFlowAbs, 200),
      retail: 'absent' as const,
    }

    return {
      type: 'Accumulation',
      description: `Smart money accumulation detected (${maxConsecutiveBuys} consecutive buy days, +${totalFlow.toFixed(0)}M total)`,
      startDate: combinedDaily[0].date,
      strength,
      investors: ['foreign', 'institution'],
      // P0: Actionable fields
      consecutiveDays: maxConsecutiveBuys,
      totalFlow,
      ...guidance,
      participants,
    }
  }

  return null
}

/**
 * Detect distribution pattern
 */
function detectDistribution(
  foreign: InvestorTrendData,
  institution: InvestorTrendData
): DetectedPattern | null {
  const combinedDaily = foreign.daily.map((f, i) => ({
    date: f.date,
    net: f.net + institution.daily[i]?.net,
  }))

  // Check for consecutive net sell days
  let consecutiveSells = 0
  let maxConsecutiveSells = 0

  for (const point of combinedDaily) {
    if (point.net < 0) {
      consecutiveSells++
      if (consecutiveSells > maxConsecutiveSells) {
        maxConsecutiveSells = consecutiveSells
      }
    } else {
      consecutiveSells = 0
    }
  }

  if (maxConsecutiveSells >= 3) {
    const totalFlow = combinedDaily.reduce((sum, d) => sum + d.net, 0)
    const foreignTotal = foreign.aggregated.totalNet
    const instTotal = institution.aggregated.totalNet
    const strength = Math.min(100, maxConsecutiveSells * 15 + Math.abs(totalFlow) / 100)

    // Get actionable guidance
    const guidance = getPatternGuidance('Distribution', strength, false)

    // Determine participant roles
    const totalFlowAbs = Math.abs(totalFlow)
    const participants = {
      foreign: getParticipantRole(foreignTotal, totalFlowAbs, 200),
      institution: getParticipantRole(instTotal, totalFlowAbs, 200),
      retail: 'absent' as const,
    }

    return {
      type: 'Distribution',
      description: `Smart money distribution detected (${maxConsecutiveSells} consecutive sell days, ${totalFlow.toFixed(0)}M total)`,
      startDate: combinedDaily[0].date,
      strength,
      investors: ['foreign', 'institution'],
      // P0: Actionable fields
      consecutiveDays: maxConsecutiveSells,
      totalFlow,
      ...guidance,
      participants,
    }
  }

  return null
}

/**
 * Detect divergence pattern (smart money vs retail)
 */
function detectDivergence(
  foreign: InvestorTrendData,
  institution: InvestorTrendData,
  retail: InvestorTrendData
): DetectedPattern | null {
  const smartMoneyDaily = foreign.daily.map((f, i) => ({
    date: f.date,
    smartMoneyNet: f.net + institution.daily[i]?.net,
    retailNet: retail.daily[i]?.net || 0,
  }))

  // Count divergence days
  let divergenceDays = 0
  let totalSmartMoneyFlow = 0
  let totalRetailFlow = 0

  for (const point of smartMoneyDaily) {
    // Divergence: smart money buying, retail selling (or vice versa)
    if ((point.smartMoneyNet > 100 && point.retailNet < -100) ||
        (point.smartMoneyNet < -100 && point.retailNet > 100)) {
      divergenceDays++
      totalSmartMoneyFlow += point.smartMoneyNet
      totalRetailFlow += point.retailNet
    }
  }

  if (divergenceDays >= 2) {
    const isSmartMoneyBuying = totalSmartMoneyFlow > 0
    const strength = Math.min(100, divergenceDays * 20 + Math.abs(totalSmartMoneyFlow) / 50)

    // Get actionable guidance
    const guidance = getPatternGuidance('Divergence', strength, isSmartMoneyBuying)

    // Determine participant roles
    const foreignTotal = foreign.aggregated.totalNet
    const instTotal = institution.aggregated.totalNet
    const retailTotal = retail.aggregated.totalNet
    const totalFlowAbs = Math.abs(totalSmartMoneyFlow) + Math.abs(totalRetailFlow)

    const participants = {
      foreign: getParticipantRole(foreignTotal, totalFlowAbs, 150),
      institution: getParticipantRole(instTotal, totalFlowAbs, 150),
      retail: getParticipantRole(retailTotal, totalFlowAbs, 200),
    }

    return {
      type: 'Divergence',
      description: isSmartMoneyBuying
        ? `Smart money accumulating (+${totalSmartMoneyFlow.toFixed(0)}M) while retail distributing (${totalRetailFlow.toFixed(0)}M)`
        : `Smart money distributing (${totalSmartMoneyFlow.toFixed(0)}M) while retail accumulating (+${totalRetailFlow.toFixed(0)}M)`,
      startDate: smartMoneyDaily[0].date,
      strength,
      investors: ['foreign', 'institution', 'retail'],
      // P0: Actionable fields
      consecutiveDays: divergenceDays,
      totalFlow: totalSmartMoneyFlow,
      ...guidance,
      participants,
    }
  }

  return null
}

/**
 * Detect FOMO pattern (retail heavy buying)
 */
function detectFOMO(retail: InvestorTrendData): DetectedPattern | null {
  const heavyBuyDays = retail.daily.filter((d) => d.net > 500).length

  if (heavyBuyDays >= 2) {
    const totalBuy = retail.daily.reduce((sum, d) => sum + (d.net > 0 ? d.net : 0), 0)
    const strength = Math.min(100, heavyBuyDays * 20 + totalBuy / 100)

    // Get actionable guidance
    const guidance = getPatternGuidance('FOMO', strength, false)

    return {
      type: 'FOMO',
      description: `Retail FOMO detected (${heavyBuyDays} heavy buy days, +${totalBuy.toFixed(0)}M total)`,
      startDate: retail.daily[0].date,
      strength,
      investors: ['retail'],
      // P0: Actionable fields
      consecutiveDays: heavyBuyDays,
      totalFlow: totalBuy,
      ...guidance,
      participants: {
        foreign: 'absent',
        institution: 'absent',
        retail: 'driving',
      },
    }
  }

  return null
}

/**
 * Detect panic pattern (retail heavy selling)
 */
function detectPanic(retail: InvestorTrendData): DetectedPattern | null {
  const heavySellDays = retail.daily.filter((d) => d.net < -500).length

  if (heavySellDays >= 2) {
    const totalSell = retail.daily.reduce((sum, d) => sum + (d.net < 0 ? Math.abs(d.net) : 0), 0)
    const strength = Math.min(100, heavySellDays * 20 + totalSell / 100)

    // For panic, we assume smart money might be buying (opposite)
    // This will be refined by checking actual smart money data if available
    const guidance = getPatternGuidance('Panic', strength, false)

    return {
      type: 'Panic',
      description: `Retail panic selling detected (${heavySellDays} heavy sell days, -${totalSell.toFixed(0)}M total)`,
      startDate: retail.daily[0].date,
      strength,
      investors: ['retail'],
      // P0: Actionable fields
      consecutiveDays: heavySellDays,
      totalFlow: -totalSell,
      ...guidance,
      participants: {
        foreign: 'absent',
        institution: 'absent',
        retail: 'driving',
      },
    }
  }

  return null
}

// ============================================================================
// PRIMARY DRIVER DETECTION
// ============================================================================

/**
 * Detect which investor is the primary driver
 */
export function detectPrimaryDriver(
  foreign: AggregatedMetrics,
  institution: AggregatedMetrics,
  retail: AggregatedMetrics,
  prop: AggregatedMetrics
): 'foreign' | 'institution' | 'retail' | 'prop' | 'none' {
  const absForeign = Math.abs(foreign.totalNet)
  const absInstitution = Math.abs(institution.totalNet)
  const absRetail = Math.abs(retail.totalNet)
  const absProp = Math.abs(prop.totalNet)

  const maxFlow = Math.max(absForeign, absInstitution, absRetail, absProp)

  if (maxFlow < 500) return 'none'

  // Check for combined strength
  if (absForeign > absInstitution * 1.5) return 'foreign'
  if (absInstitution > absForeign * 1.5) return 'institution'

  // Check retail/prop if they're significantly larger
  if (absRetail > maxFlow * 0.4) return 'retail'
  if (absProp > maxFlow * 0.3) return 'prop'

  // Default to foreign if close
  return absForeign >= absInstitution ? 'foreign' : 'institution'
}

// ============================================================================
// EXPORTS
// ============================================================================
