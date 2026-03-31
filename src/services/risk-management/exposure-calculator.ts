/**
 * Exposure Calculator
 *
 * Calculates market and sector exposure for swing trading positions.
 * Helps identify concentration risks and portfolio balance.
 */

import type {
  ExposureAnalysis,
  ExposureRequest,
  SectorExposure,
  MarketExposure,
  RiskLevel,
} from '@/types/risk-management'

// ============================================================================
// CONSTANTS
// ============================================================================

const EXPOSURE_THRESHOLDS = {
  /** Low exposure: < 60% */
  LOW: 60,
  /** Medium exposure: 60-80% */
  MEDIUM: 80,
  /** High exposure: 80-95% */
  HIGH: 95,
  /** Very High exposure: > 95% */
  VERY_HIGH: 95,
} as const

const SECTOR_CONCENTRATION_LIMITS = {
  /** Low concentration: < 25% per sector */
  LOW: 25,
  /** Medium concentration: 25-40% per sector */
  MEDIUM: 40,
  /** High concentration: > 40% per sector */
  HIGH: 40,
} as const

// ============================================================================
// MAIN CALCULATOR
// ============================================================================

/**
 * Calculate portfolio exposure analysis
 *
 * @param request Exposure calculation request
 * @returns Exposure analysis
 */
export function calculateExposure(request: ExposureRequest): ExposureAnalysis {
  const { positions, accountValue } = request

  // Calculate sector exposures
  const sectorMap = new Map<string, number>()

  for (const pos of positions) {
    const positionValue = pos.shares * pos.currentPrice
    const currentValue = sectorMap.get(pos.sector) ?? 0
    sectorMap.set(pos.sector, currentValue + positionValue)
  }

  // Convert to sector exposure array
  const sectors: SectorExposure[] = Array.from(sectorMap.entries()).map(([sector, exposure]) => ({
    sector,
    exposure,
    percent: (exposure / accountValue) * 100,
    riskLevel: determineSectorRiskLevel(exposure / accountValue),
  }))

  // Sort by exposure descending
  sectors.sort((a, b) => b.exposure - a.exposure)

  // Calculate market exposure
  const longExposure = positions.reduce((sum, pos) => sum + pos.shares * pos.currentPrice, 0)
  const shortExposure = 0 // Swing trading is long-only for now

  const market: MarketExposure = {
    longExposure,
    shortExposure,
    netExposure: longExposure - shortExposure,
    grossExposure: longExposure + Math.abs(shortExposure),
    netExposurePercent: ((longExposure - shortExposure) / accountValue) * 100,
  }

  // Calculate sector concentration (top sector %)
  const sectorConcentration = sectors.length > 0 ? sectors[0].percent : 0

  // Determine overall exposure level
  const exposureLevel = determineExposureLevel(market.netExposurePercent, sectorConcentration)

  // Generate recommendations
  const recommendations = generateExposureRecommendations({
    market,
    sectors,
    sectorConcentration,
    exposureLevel,
  })

  return {
    portfolioValue: accountValue,
    market,
    sectors,
    sectorConcentration,
    exposureLevel,
    recommendations,
    timestamp: Date.now(),
  }
}

// ============================================================================
// RISK LEVEL DETERMINATION
// ============================================================================

/**
 * Determine sector risk level based on exposure percentage
 *
 * @param exposureRatio Exposure ratio (0-1)
 * @returns Risk level
 */
function determineSectorRiskLevel(exposureRatio: number): RiskLevel {
  const percent = exposureRatio * 100

  if (percent <= SECTOR_CONCENTRATION_LIMITS.LOW) {
    return 'Low'
  }
  if (percent <= SECTOR_CONCENTRATION_LIMITS.MEDIUM) {
    return 'Medium'
  }
  return 'High'
}

/**
 * Determine overall exposure level
 *
 * @param netExposurePercent Net exposure percentage
 * @param sectorConcentration Top sector concentration
 * @returns Risk level
 */
function determineExposureLevel(
  netExposurePercent: number,
  sectorConcentration: number
): RiskLevel {
  // Consider both market exposure and sector concentration
  if (netExposurePercent >= EXPOSURE_THRESHOLDS.VERY_HIGH || sectorConcentration > 50) {
    return 'Very High'
  }
  if (netExposurePercent >= EXPOSURE_THRESHOLDS.HIGH || sectorConcentration > 40) {
    return 'High'
  }
  if (netExposurePercent >= EXPOSURE_THRESHOLDS.MEDIUM) {
    return 'Medium'
  }
  return 'Low'
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * Generate exposure-based recommendations
 *
 * @param params Analysis parameters
 * @returns Array of recommendations
 */
function generateExposureRecommendations(params: {
  market: MarketExposure
  sectors: SectorExposure[]
  sectorConcentration: number
  exposureLevel: RiskLevel
}): string[] {
  const recommendations: string[] = []
  const { market, sectors, sectorConcentration, exposureLevel } = params

  // Market exposure recommendations
  recommendations.push(
    `📊 Net Exposure: ${market.netExposurePercent.toFixed(1)}% (${market.longExposure.toFixed(0)} THB)`
  )

  if (exposureLevel === 'Very High') {
    recommendations.push('⚠️ การ exposure ระดับสูงมาก ควรพิจารณาลดขนาด position')
  } else if (exposureLevel === 'High') {
    recommendations.push('⚠️ การ exposure ระดับสูง พิจารณาลดความเสี่ยง')
  } else if (exposureLevel === 'Medium') {
    recommendations.push('✓ การ exposure ระดับปานกลาง อยู่ในเกณฑ์เหมาะสม')
  } else {
    recommendations.push('✓ การ exposure ระดับต่ำ อยู่ในเกณฑ์ปลอดภัย')
  }

  // Sector concentration recommendations
  if (sectors.length > 0) {
    const topSector = sectors[0]
    recommendations.push(
      `📊 ภาคะที่ถืออย่างหนักที่สุด: ${topSector.sector} (${topSector.percent.toFixed(1)}%)`
    )

    if (sectorConcentration > SECTOR_CONCENTRATION_LIMITS.HIGH) {
      recommendations.push(
        `⚠️ การกระจุกตัวในภาคะเดียวสูง (${sectorConcentration.toFixed(1)}%) ควรกระจายความเสี่ยง`
      )
    } else if (sectorConcentration > SECTOR_CONCENTRATION_LIMITS.MEDIUM) {
      recommendations.push(
        `⚠️ การกระจุกตัวในภาคะเดียวปานกลาง (${sectorConcentration.toFixed(1)}%)`
      )
    }
  }

  // Sector-specific recommendations
  const highRiskSectors = sectors.filter(s => s.riskLevel === 'High')
  if (highRiskSectors.length > 0) {
    const sectorNames = highRiskSectors.map(s => s.sector).join(', ')
    recommendations.push(`⚠️ ภาคะที่มีการถือครองเกินเกณฑ์: ${sectorNames}`)
  }

  // Cash position recommendation
  const cashPercent = 100 - market.netExposurePercent
  if (cashPercent < 10) {
    recommendations.push('💡 ตำแหน่งเงินสดต่ำมาก ควรแบ่งปันเงินสดสำหรับโอกาสใหม่')
  } else if (cashPercent < 20) {
    recommendations.push('💡 ตำแหน่งเงินสดต่ำ พิจารณาเก็บสำรองเงินสด')
  } else if (cashPercent > 40) {
    recommendations.push('💡 ตำแหน่งเงินสดสูง พิจารณาเพิ่มการลงทุน')
  }

  return recommendations
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate position weight limits for sectors
 *
 * @param accountValue Account value
 * @param maxSectorWeight Maximum weight per sector (default: 40%)
 * @returns Maximum exposure per sector
 */
export function calculateSectorLimits(
  accountValue: number,
  maxSectorWeight: number = 0.40
): Map<string, number> {
  const limits = new Map<string, number>()
  limits.set('default', accountValue * maxSectorWeight)
  return limits
}

/**
 * Check if adding a position would exceed sector limits
 *
 * @param currentPositions Current portfolio positions
 * @param newPosition New position to add
 * @param accountValue Account value
 * @param maxSectorWeight Maximum sector weight (default: 40%)
 * @returns Whether position can be added safely
 */
export function canAddPositionBySector(
  currentPositions: ExposureRequest['positions'],
  newPosition: {
    symbol: string
    shares: number
    currentPrice: number
    sector: string
  },
  accountValue: number,
  maxSectorWeight: number = 0.40
): {
  canAdd: boolean
  reason?: string
  currentSectorExposure: number
  newSectorExposure: number
} {
  // Calculate current sector exposure
  const sectorMap = new Map<string, number>()
  for (const pos of currentPositions) {
    const value = pos.shares * pos.currentPrice
    sectorMap.set(pos.sector, (sectorMap.get(pos.sector) ?? 0) + value)
  }

  const currentSectorExposure = (sectorMap.get(newPosition.sector) ?? 0) / accountValue
  const newPositionValue = newPosition.shares * newPosition.currentPrice
  const newSectorExposure = currentSectorExposure + newPositionValue / accountValue

  const limit = maxSectorWeight * 100

  if (newSectorExposure > limit) {
    return {
      canAdd: false,
      reason: `การเพิ่ม position นี้จะทำให้ exposure ภาคะ ${newPosition.sector} เกิน ${limit.toFixed(1)}%`,
      currentSectorExposure: currentSectorExposure * 100,
      newSectorExposure: newSectorExposure * 100,
    }
  }

  return {
    canAdd: true,
    currentSectorExposure: currentSectorExposure * 100,
    newSectorExposure: newSectorExposure * 100,
  }
}

/**
 * Get sector breakdown summary
 *
 * @param analysis Exposure analysis
 * @returns Formatted sector summary
 */
export function getSectorSummary(analysis: ExposureAnalysis): string {
  if (analysis.sectors.length === 0) {
    return 'No positions'
  }

  const top3 = analysis.sectors.slice(0, 3)
  const summary = top3
    .map(s => `${s.sector}: ${s.percent.toFixed(1)}%`)
    .join(', ')

  if (analysis.sectors.length > 3) {
    const otherPercent = analysis.sectors
      .slice(3)
      .reduce((sum, s) => sum + s.percent, 0)
    return `${summary}, Others: ${otherPercent.toFixed(1)}%`
  }

  return summary
}
