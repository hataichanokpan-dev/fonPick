/**
 * Volume Analyzer Service
 *
 * Generates actionable insights from volume metrics.
 * Transforms raw volume data into investment guidance.
 */

import type {
  VolumeAnalysisData,
  VolumeHealthData,
  VolumeTrend,
  VWADData,
  ConcentrationData,
  VolumeLeader,
  VolumeLeaderInput,
} from '@/types/volume'

// ============================================================================
// VOLUME INSIGHTS GENERATION
// ============================================================================

/**
 * Generate insights for volume health
 * @param health - Volume health data
 * @returns Array of insight strings
 */
function generateHealthInsights(health: VolumeHealthData): string[] {
  const insights: string[] = []

  const { healthStatus, healthScore, currentVolume, averageVolume, trend } = health

  // Health status insight
  switch (healthStatus) {
    case 'Explosive':
      insights.push(
        `🔥 Explosive volume (${healthScore}/100): Strong institutional participation detected`
      )
      break
    case 'Strong':
      insights.push(
        `💪 Strong volume (${healthScore}/100): Healthy market participation above average`
      )
      break
    case 'Normal':
      insights.push(`📊 Normal volume (${healthScore}/100): Typical market participation`)
      break
    case 'Anemic':
      insights.push(
        `⚠️ Anemic volume (${healthScore}/100): Low participation, lacks conviction`
      )
      break
  }

  // Volume comparison insight
  const volumeRatio = currentVolume / averageVolume
  if (volumeRatio >= 1.5) {
    insights.push(
      `Volume is ${Math.round(volumeRatio * 100)}% of 30-day average - unusual activity`
    )
  } else if (volumeRatio <= 0.5) {
    insights.push(
      `Volume is ${Math.round(volumeRatio * 100)}% of 30-day average - light trading`
    )
  }

  // Trend insight
  switch (trend) {
    case 'Up':
      insights.push('📈 Volume trending up - increasing market interest')
      break
    case 'Down':
      insights.push('📉 Volume trending down - waning participation')
      break
    case 'Neutral':
      // No insight for neutral trend
      break
  }

  return insights
}

/**
 * Generate insights for VWAD
 * @param vwad - VWAD data
 * @returns Array of insight strings
 */
function generateVWADInsights(vwad: VWADData): string[] {
  const insights: string[] = []

  const { conviction, vwad: score, upVolume, downVolume, totalVolume } = vwad

  // Conviction insight
  switch (conviction) {
    case 'Bullish':
      insights.push(
        `🟢 Bullish conviction (VWAD: ${score}): Volume favors gainers, institutional accumulation likely`
      )
      break
    case 'Bearish':
      insights.push(
        `🔴 Bearish conviction (VWAD: ${score}): Volume favors losers, distribution detected`
      )
      break
    case 'Neutral':
      insights.push(
        `⚪ Neutral conviction (VWAD: ${score}): Volume balanced between gainers and losers`
      )
      break
  }

  // Volume distribution insight
  const upRatio = totalVolume > 0 ? (upVolume / totalVolume) * 100 : 0
  const downRatio = totalVolume > 0 ? (downVolume / totalVolume) * 100 : 0

  if (upRatio > 60) {
    insights.push(
      `${Math.round(upRatio)}% of volume in gainers - strong buying pressure`
    )
  } else if (downRatio > 60) {
    insights.push(
      `${Math.round(downRatio)}% of volume in losers - strong selling pressure`
    )
  }

  return insights
}

/**
 * Generate insights for concentration
 * @param concentration - Concentration data
 * @returns Array of insight strings
 */
function generateConcentrationInsights(concentration: ConcentrationData): string[] {
  const insights: string[] = []

  const { concentrationLevel, concentration: score, top5Volume, totalVolume } = concentration

  // Concentration level insight
  switch (concentrationLevel) {
    case 'Risky':
      insights.push(
        `⚠️ Risky concentration (${score.toFixed(1)}%): Top 5 stocks dominate ${Math.round(
          (top5Volume / totalVolume) * 100
        )}% of volume - low diversification`
      )
      break
    case 'Normal':
      insights.push(
        `📊 Normal concentration (${score.toFixed(1)}%): Moderate diversification across leaders`
      )
      break
    case 'Healthy':
      insights.push(
        `✅ Healthy concentration (${score.toFixed(1)}%): Well-diversified volume across many stocks`
      )
      break
  }

  return insights
}

/**
 * Generate volume leaders insights
 * @param volumeLeaders - Array of volume leaders
 * @returns Array of insight strings
 */
function generateLeadersInsights(volumeLeaders: VolumeLeader[]): string[] {
  const insights: string[] = []

  if (volumeLeaders.length === 0) {
    return insights
  }

  // Top leader
  const topLeader = volumeLeaders[0]
  insights.push(
    `🏆 Top volume: ${topLeader.symbol} (${formatVolume(topLeader.volume)})`
  )

  // Count unusual volume activity
  const unusualCount = volumeLeaders.filter((l) => l.relativeVolume >= 2).length
  if (unusualCount > 0) {
    insights.push(
      `🔥 ${unusualCount} stock${unusualCount > 1 ? 's' : ''} with 2x+ unusual volume`
    )
  }

  return insights
}

/**
 * Generate comprehensive volume insights
 * @param data - Complete volume analysis data
 * @returns Array of insight strings
 */
export function generateVolumeInsights(data: VolumeAnalysisData): string[] {
  const insights: string[] = []

  // Health insights
  insights.push(...generateHealthInsights(data.health))

  // VWAD insights
  insights.push(...generateVWADInsights(data.vwad))

  // Concentration insights
  insights.push(...generateConcentrationInsights(data.concentration))

  // Leaders insights
  insights.push(...generateLeadersInsights(data.volumeLeaders))

  return insights
}

// ============================================================================
// VOLUME TREND DETECTION
// ============================================================================

/**
 * Calculate linear regression slope
 * @param data - Array of values
 * @returns Slope of the trend line
 */
function calculateSlope(data: number[]): number {
  if (data.length < 2) return 0

  const n = data.length
  const xMean = (n - 1) / 2
  const yMean = data.reduce((sum, val) => sum + val, 0) / n

  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (data[i] - yMean)
    denominator += (i - xMean) ** 2
  }

  return denominator === 0 ? 0 : numerator / denominator
}

/**
 * Detect volume trend from historical data
 * @param historicalVolumes - Array of historical volume values
 * @returns Trend direction
 */
export function detectVolumeTrend(historicalVolumes: number[]): VolumeTrend {
  if (!historicalVolumes || historicalVolumes.length < 2) {
    return 'Neutral'
  }

  const slope = calculateSlope(historicalVolumes)
  const avgVolume = historicalVolumes.reduce((sum, v) => sum + v, 0) / historicalVolumes.length

  // Calculate slope as percentage of average
  const slopePercent = avgVolume > 0 ? (slope / avgVolume) * 100 : 0

  if (slopePercent > 5) {
    return 'Up'
  }
  if (slopePercent < -5) {
    return 'Down'
  }
  return 'Neutral'
}

// ============================================================================
// VOLUME LEADERS IDENTIFICATION
// ============================================================================

/**
 * Identify top volume leaders with relative volume calculation
 * @param rankings - Array of stocks with symbol, volume, and change
 * @param stockAverages - Optional map of stock symbols to their average volumes
 * @returns Array of volume leaders (top 5)
 */
export function identifyVolumeLeaders(
  rankings: VolumeLeaderInput[],
  stockAverages?: Map<string, number>
): VolumeLeader[] {
  if (!rankings || rankings.length === 0) {
    return []
  }

  // Calculate relative volume for each stock
  const leaders: VolumeLeader[] = rankings.map((stock) => {
    const average = stockAverages?.get(stock.symbol) || 1000 // Default 1B THB average
    const relativeVolume = average > 0 ? stock.volume / average : 1

    return {
      symbol: stock.symbol,
      volume: stock.volume,
      relativeVolume: Math.round(relativeVolume * 100) / 100,
      priceChange: stock.change,
    }
  })

  // Sort by volume descending and take top 5
  return leaders
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format volume for display (e.g., "42.5B", "1.2T")
 * @param volumeInMillions - Volume in millions (THB)
 * @returns Formatted volume string
 */
function formatVolume(volumeInMillions: number): string {
  if (volumeInMillions >= 1000000) {
    return `${(volumeInMillions / 1000000).toFixed(1)}T`
  }
  if (volumeInMillions >= 1000) {
    return `${(volumeInMillions / 1000).toFixed(1)}B`
  }
  return `${volumeInMillions.toFixed(1)}M`
}

/**
 * Get trading recommendation based on volume analysis
 * @param data - Complete volume analysis data
 * @returns Trading recommendation
 */
export function getVolumeTradingRecommendation(data: VolumeAnalysisData): {
  action: string
  reason: string
  confidence: number
} {
  let bullishScore = 0
  const reasons: string[] = []

  // Factor 1: Volume health (40 points max)
  const healthScore = data.health.healthScore
  if (healthScore >= 70) {
    bullishScore += 40
    reasons.push('Strong volume participation')
  } else if (healthScore >= 40) {
    bullishScore += 20
    reasons.push('Normal volume participation')
  } else {
    reasons.push('Weak volume participation')
  }

  // Factor 2: VWAD conviction (40 points max)
  if (data.vwad.conviction === 'Bullish') {
    bullishScore += 40
    reasons.push('Bullish conviction - volume favors gainers')
  } else if (data.vwad.conviction === 'Bearish') {
    reasons.push('Bearish conviction - volume favors losers')
  }

  // Factor 3: Concentration (20 points max)
  if (data.concentration.concentrationLevel === 'Healthy') {
    bullishScore += 20
    reasons.push('Healthy diversification')
  } else if (data.concentration.concentrationLevel === 'Risky') {
    reasons.push('Risky concentration in few stocks')
  }

  // Determine action
  let action: string
  if (bullishScore >= 70) {
    action = 'BUY - Strong volume support with bullish conviction'
  } else if (bullishScore >= 50) {
    action = 'BUY - Moderate volume support'
  } else if (bullishScore >= 30) {
    action = 'HOLD - Mixed volume signals'
  } else {
    action = 'WAIT - Weak volume or bearish conviction'
  }

  return {
    action,
    reason: reasons.join(', '),
    confidence: Math.min(100, bullishScore),
  }
}

/**
 * Detect volume anomaly (unusual activity)
 * @param relativeVolume - Relative volume ratio
 * @returns True if anomalous (2x+ or 0.5x-)
 */
export function isVolumeAnomaly(relativeVolume: number): boolean {
  return relativeVolume >= 2.0 || relativeVolume <= 0.5
}

/**
 * Get volume anomaly description
 * @param relativeVolume - Relative volume ratio
 * @returns Description of the anomaly
 */
export function getVolumeAnomalyDescription(relativeVolume: number): string {
  if (relativeVolume >= 3.0) {
    return '🔥🔥🔥 Extreme volume spike - major news or event'
  }
  if (relativeVolume >= 2.0) {
    return '🔥🔥 Unusual volume - significant activity'
  }
  if (relativeVolume <= 0.3) {
    return '❄️❄️❄️ Extremely light volume - possible halt or illiquidity'
  }
  if (relativeVolume <= 0.5) {
    return '❄️❄️ Below normal volume - light trading'
  }
  return ''
}
