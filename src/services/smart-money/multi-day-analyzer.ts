/**
 * Multi-Day Smart Money Analyzer
 *
 * Analyzes smart money flow patterns over multiple days for swing trading
 * Extends existing smart-money service for sustainability confirmation
 */

import type { MultiDaySmartMoneyAnalysis, SmartMoneyPattern, SustainabilityLevel } from '@/types/swing-trading'
import { getHistoricalInvestorType } from '@/lib/rtdb/historical'

// ============================================================================
// PATTERN DETECTION
// ============================================================================

/**
 * Detect smart money flow pattern over multiple days
 *
 * @param dataPoints - Array of daily smart money flow data
 * @returns Detected pattern type
 */
function detectPattern(
  dataPoints: Array<{
    date: string
    foreignNet: number
    institutionNet: number
    smartMoneyNet: number
  }>
): SmartMoneyPattern {
  const foreign = dataPoints.map((d) => d.foreignNet)
  const institution = dataPoints.map((d) => d.institutionNet)
  const smartMoney = dataPoints.map((d) => d.smartMoneyNet)

  // Calculate trends
  const foreignTrend = calculateTrend(foreign)
  const institutionTrend = calculateTrend(institution)
  const smartMoneyTrend = calculateTrend(smartMoney)

  // Accumulation: Consistent positive flow
  if (smartMoneyTrend.direction === 'up' && smartMoneyTrend.consistency >= 0.7) {
    return 'accumulation'
  }

  // Distribution: Consistent negative flow
  if (smartMoneyTrend.direction === 'down' && smartMoneyTrend.consistency >= 0.7) {
    return 'distribution'
  }

  // Divergence: Foreign and institution moving in opposite directions
  if (
    (foreignTrend.direction === 'up' && institutionTrend.direction === 'down') ||
    (foreignTrend.direction === 'down' && institutionTrend.direction === 'up')
  ) {
    return 'divergence'
  }

  // Default: Neutral
  return 'neutral'
}

/**
 * Calculate trend direction and consistency
 *
 * @param values - Array of numeric values
 * @returns Trend direction and consistency score
 */
function calculateTrend(values: number[]): {
  direction: 'up' | 'down' | 'flat'
  consistency: number
} {
  if (values.length === 0) {
    return { direction: 'flat', consistency: 0 }
  }

  const gains = values.filter((v) => v > 0)
  const losses = values.filter((v) => v < 0)
  const total = values.length

  const gainPct = gains.length / total
  const lossPct = losses.length / total

  let direction: 'up' | 'down' | 'flat'
  if (gainPct >= 0.6) {
    direction = 'up'
  } else if (lossPct >= 0.6) {
    direction = 'down'
  } else {
    direction = 'flat'
  }

  // Consistency = how uniform the direction is
  const consistency = Math.max(gainPct, lossPct)

  return { direction, consistency }
}

/**
 * Calculate sustainability level
 *
 * @param pattern - Detected pattern
 * @param consistency - Trend consistency score
 * @param consecutiveDays - Number of consecutive days with same pattern
 * @returns Sustainability level
 */
function calculateSustainability(
  pattern: SmartMoneyPattern,
  consistency: number,
  consecutiveDays: number
): SustainabilityLevel {
  // High sustainability: Strong consistent accumulation/distribution
  if (
    (pattern === 'accumulation' || pattern === 'distribution') &&
    consistency >= 0.8 &&
    consecutiveDays >= 3
  ) {
    return 'high'
  }

  // Medium sustainability: Moderate consistency
  if (consistency >= 0.6 && consecutiveDays >= 2) {
    return 'medium'
  }

  // Low sustainability: Weak or inconsistent
  return 'low'
}

// ============================================================================
// SIGNAL GENERATION
// ============================================================================

/**
 * Generate daily signal based on net flow
 *
 * @param foreignNet - Net foreign flow
 * @param institutionNet - Net institutional flow
 * @returns Signal classification
 */
function generateDailySignal(
  foreignNet: number,
  institutionNet: number
): 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell' {
  const smartMoneyNet = foreignNet + institutionNet

  // Strong signals: >500M or <-500M
  if (smartMoneyNet > 500) {
    return 'Strong Buy'
  }
  if (smartMoneyNet < -500) {
    return 'Strong Sell'
  }

  // Normal signals: >200M or <-200M
  if (smartMoneyNet > 200) {
    return 'Buy'
  }
  if (smartMoneyNet < -200) {
    return 'Sell'
  }

  return 'Neutral'
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyze multi-day smart money patterns
 *
 * @param params - Analysis parameters
 * @returns Complete multi-day smart money analysis
 */
export async function analyzeMultiDayPatterns(params: {
  symbol: string
  days: 3 | 5 | 10
}): Promise<MultiDaySmartMoneyAnalysis | null> {
  const { symbol, days } = params

  try {
    // Fetch historical investor type data
    const result = await getHistoricalInvestorType({
      days,
    excludeWeekends: true,
    })

    if (!result || result.data.length === 0) {
      console.error(`No investor type data available for ${symbol}`)
      return null
    }

    // Process data points (most recent first)
    type DataPoint = {
      date: string
      foreignNet: number
      institutionNet: number
      smartMoneyNet: number
    }

    const dataPoints = result.data
      .filter((d) => d.data)
      .map((d) => {
        const data = d.data
        if (!data) return null

        return {
          date: d.date,
          foreignNet: data.foreign.net,
          institutionNet: data.institution.net,
          smartMoneyNet: data.foreign.net + data.institution.net,
        }
      })
      .filter((d): d is NonNullable<DataPoint> => d !== null)
      .reverse() // Most recent last for chronological order

    if (dataPoints.length === 0) {
      return null
    }

    // Generate daily signals
    const daily = dataPoints.map((point) => ({
      date: point.date,
      foreignNet: point.foreignNet,
      institutionNet: point.institutionNet,
      smartMoneyNet: point.smartMoneyNet,
      signal: generateDailySignal(point.foreignNet, point.institutionNet),
    }))

    // Detect pattern
    const pattern = detectPattern(dataPoints)

    // Calculate consecutive days with this pattern
    let consecutiveDays = 0
    for (let i = dataPoints.length - 1; i >= 0; i--) {
      const net = dataPoints[i].smartMoneyNet

      if (pattern === 'accumulation' && net > 0) {
        consecutiveDays++
      } else if (pattern === 'distribution' && net < 0) {
        consecutiveDays++
      } else if (pattern === 'neutral') {
        consecutiveDays++
      } else {
        break
      }
    }

    // Calculate total flow
    const totalFlow = dataPoints.reduce((sum, point) => sum + point.smartMoneyNet, 0)

    // Calculate trend for consistency
    const smartMoneyValues = dataPoints.map((d) => d.smartMoneyNet)
    const { consistency } = calculateTrend(smartMoneyValues)

    // Calculate sustainability
    const sustainability = calculateSustainability(pattern, consistency, consecutiveDays)

    // Calculate confirmation
    const isConfirmed = sustainability === 'high' || sustainability === 'medium'
    const confidence = sustainability === 'high' ? 80 : sustainability === 'medium' ? 60 : 40

    // Generate rationale
    let rationale = ''
    if (pattern === 'accumulation') {
      rationale = consecutiveDays >= 3
        ? `Strong accumulation for ${consecutiveDays} days - Smart money building position`
        : `Accumulation pattern detected - Smart money buying interest`
    } else if (pattern === 'distribution') {
      rationale = consecutiveDays >= 3
        ? `Strong distribution for ${consecutiveDays} days - Smart money exiting position`
        : `Distribution pattern detected - Smart money selling interest`
    } else if (pattern === 'divergence') {
      rationale = 'Foreign and institutional flows diverging - Mixed signals'
    } else {
      rationale = 'No clear smart money pattern - Inconclusive'
    }

    // Build period info
    const startDate = result.data[result.data.length - 1].date
    const endDate = result.data[0].date

    return {
      symbol,
      period: {
        start: startDate,
        end: endDate,
        days: daily.length,
      },
      daily,
      pattern: {
        type: pattern,
        consecutiveDays,
        totalFlow,
        sustainability,
      },
      confirmation: {
        isConfirmed,
        confidence,
        rationale,
      },
    }
  } catch (error) {
    console.error(`Error analyzing multi-day patterns for ${params.symbol}:`, error)
    return null
  }
}

/**
 * Get pattern recommendation
 *
 * @param analysis - Multi-day smart money analysis
 * @returns Text recommendation
 */
export function getPatternRecommendation(
  analysis: MultiDaySmartMoneyAnalysis
): string {
  const { pattern, confirmation } = analysis

  if (!confirmation.isConfirmed) {
    return 'Pattern not confirmed - Wait for clearer signals'
  }

  switch (pattern.type) {
    case 'accumulation':
      return `Accumulation confirmed (${pattern.consecutiveDays} days) - Smart money building positions - Favorable for entries`

    case 'distribution':
      return `Distribution confirmed (${pattern.consecutiveDays} days) - Smart money exiting - Avoid new entries`

    case 'divergence':
      return 'Divergence detected - Mixed signals - Wait for clarity'

    default:
      return 'No clear pattern - Monitor market'
  }
}
