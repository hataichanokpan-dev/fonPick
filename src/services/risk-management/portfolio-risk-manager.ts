/**
 * Portfolio Risk Manager
 *
 * Analyzes portfolio risk based on swing trading positions.
 * Calculates risk exposure, concentration, and provides recommendations.
 */

import type {
  PortfolioRiskRequest,
  PortfolioRiskAssessment,
  PositionRisk,
  RiskLevel,
  RiskTolerance,
} from '@/types/risk-management'

// ============================================================================
// CONSTANTS
// ============================================================================

const RISK_THRESHOLDS = {
  /** Low risk: < 5% portfolio at risk */
  LOW: 5,
  /** Medium risk: 5-10% portfolio at risk */
  MEDIUM: 10,
  /** High risk: 10-15% portfolio at risk */
  HIGH: 15,
  /** Very High risk: > 15% portfolio at risk */
  VERY_HIGH: 15,
} as const

const CONCENTRATION_THRESHOLDS = {
  /** Low concentration: top 3 < 30% */
  LOW: 30,
  /** Medium concentration: top 3 30-50% */
  MEDIUM: 50,
  /** High concentration: top 3 > 50% */
  HIGH: 50,
} as const

// ============================================================================
// MAIN ANALYZER
// ============================================================================

/**
 * Analyze portfolio risk
 *
 * @param request Portfolio risk request
 * @returns Portfolio risk assessment
 */
export function analyzePortfolioRisk(request: PortfolioRiskRequest): PortfolioRiskAssessment {
  const { positions, accountValue, tolerance = 'Moderate' } = request

  // Calculate position value for each position
  const positionRisks: PositionRisk[] = positions.map(pos => {
    const positionValue = pos.shares * pos.currentPrice
    const weight = (positionValue / accountValue) * 100

    // Use provided stop loss or calculate default (10% below entry)
    const stopLoss = pos.stopLoss ?? pos.entryPrice * 0.9

    // Maximum risk if stop loss is hit
    const maxRisk = pos.shares * (pos.currentPrice - stopLoss)

    return {
      symbol: pos.symbol,
      positionValue,
      weight,
      stopLoss,
      maxRisk,
      riskContribution: (maxRisk / accountValue) * 100,
    }
  })

  // Calculate total risk at stop loss
  const totalRiskAtStopLoss = positionRisks.reduce((sum, pos) => sum + pos.maxRisk, 0)
  const portfolioRiskPercent = (totalRiskAtStopLoss / accountValue) * 100

  // Determine risk level
  const riskLevel = determineRiskLevel(portfolioRiskPercent, tolerance)

  // Calculate concentration (top 3 holdings)
  const sortedByWeight = [...positionRisks].sort((a, b) => b.weight - a.weight)
  const concentration = sortedByWeight.slice(0, 3).reduce((sum, pos) => sum + pos.weight, 0)

  // Generate recommendations
  const recommendations = generateRiskRecommendations({
    positionRisks,
    portfolioRiskPercent,
    riskLevel,
    concentration,
    tolerance,
  })

  return {
    totalValue: accountValue,
    positionCount: positions.length,
    positions: positionRisks,
    totalRiskAtStopLoss,
    portfolioRiskPercent,
    riskLevel,
    concentration,
    recommendations,
    timestamp: Date.now(),
  }
}

// ============================================================================
// RISK LEVEL DETERMINATION
// ============================================================================

/**
 * Determine risk level based on portfolio risk percentage and tolerance
 *
 * @param portfolioRiskPercent Portfolio risk percentage
 * @param tolerance Risk tolerance
 * @returns Risk level classification
 */
function determineRiskLevel(
  portfolioRiskPercent: number,
  tolerance: RiskTolerance
): RiskLevel {
  // Adjust thresholds based on tolerance
  const thresholds = getToleranceThresholds(tolerance)

  if (portfolioRiskPercent < thresholds.LOW) {
    return 'Low'
  }
  if (portfolioRiskPercent < thresholds.MEDIUM) {
    return 'Medium'
  }
  if (portfolioRiskPercent < thresholds.HIGH) {
    return 'High'
  }
  return 'Very High'
}

/**
 * Get risk thresholds based on tolerance
 *
 * @param tolerance Risk tolerance
 * @returns Adjusted thresholds
 */
function getToleranceThresholds(tolerance: RiskTolerance): {
  LOW: number
  MEDIUM: number
  HIGH: number
  VERY_HIGH: number
} {
  const base = { ...RISK_THRESHOLDS }

  switch (tolerance) {
    case 'Conservative':
      // More sensitive - lower thresholds
      return {
        LOW: base.LOW * 0.6,
        MEDIUM: base.MEDIUM * 0.7,
        HIGH: base.HIGH * 0.7,
        VERY_HIGH: base.VERY_HIGH * 0.7,
      }
    case 'Aggressive':
      // Less sensitive - higher thresholds
      return {
        LOW: base.LOW * 1.4,
        MEDIUM: base.MEDIUM * 1.3,
        HIGH: base.HIGH * 1.3,
        VERY_HIGH: base.VERY_HIGH * 1.3,
      }
    default: // Moderate
      return base
  }
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * Generate risk management recommendations
 *
 * @param params Analysis parameters
 * @returns Array of recommendation strings
 */
function generateRiskRecommendations(params: {
  positionRisks: PositionRisk[]
  portfolioRiskPercent: number
  riskLevel: RiskLevel
  concentration: number
  tolerance: RiskTolerance
}): string[] {
  const recommendations: string[] = []
  const { positionRisks, portfolioRiskPercent, riskLevel, concentration, tolerance } = params

  // Risk level recommendations
  if (riskLevel === 'Very High') {
    recommendations.push(`⚠️ ความเสี่ยงระดับสูงมาก (${portfolioRiskPercent.toFixed(1)}%) ควรลดขนาด position`)
  } else if (riskLevel === 'High') {
    recommendations.push(`⚠️ ความเสี่ยงระดับสูง (${portfolioRiskPercent.toFixed(1)}%) พิจารณาลดความเสี่ยง`)
  } else if (riskLevel === 'Medium') {
    recommendations.push(`✓ ความเสี่ยงระดับปานกลาง (${portfolioRiskPercent.toFixed(1)}%) อยู่ในช่วงที่เหมาะสม`)
  } else {
    recommendations.push(`✓ ความเสี่ยงระดับต่ำ (${portfolioRiskPercent.toFixed(1)}%) อยู่ในเกณฑ์ปลอดภัย`)
  }

  // Concentration recommendations
  if (concentration > CONCENTRATION_THRESHOLDS.HIGH) {
    recommendations.push(`⚠️ การกระจุกตัวสูง (${concentration.toFixed(1)}% ใน 3 หลักทรัพย์) ควรกระจายความเสี่ยง`)
  } else if (concentration > CONCENTRATION_THRESHOLDS.MEDIUM) {
    recommendations.push(`⚠️ การกระจุกตัวปานกลาง (${concentration.toFixed(1)}%) พิจารณา diversification`)
  }

  // Position-specific recommendations
  const highRiskPositions = positionRisks.filter(p => p.riskContribution > 3)
  if (highRiskPositions.length > 0) {
    const symbols = highRiskPositions.map(p => p.symbol).join(', ')
    recommendations.push(`⚠️ หลักทรัพย์ที่มีความเสี่ยงต่อพอร์ตfolio สูง: ${symbols}`)
  }

  // Tolerance-specific recommendations
  if (tolerance === 'Conservative' && riskLevel !== 'Low') {
    recommendations.push('📊 สำหรับนักลงทุนอนุรักษ์นิยม ควรพิจารณาลดขนาด position ลง')
  } else if (tolerance === 'Aggressive' && riskLevel === 'Low') {
    recommendations.push('📊 สำหรับนักลงทุมกระหาย อาจเพิ่มขนาด position เพื่อผลตอบแทนที่สูงขึ้น')
  }

  return recommendations
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate maximum position size based on risk tolerance
 *
 * @param accountValue Account value
 * @param riskPerTrade Risk percentage per trade (default: 2%)
 * @param stopLossPercent Stop loss percentage from entry
 * @returns Maximum position size in currency
 */
export function calculateMaxPositionSize(
  accountValue: number,
  riskPerTrade: number = 0.02,
  stopLossPercent: number = 0.10
): number {
  const riskAmount = accountValue * riskPerTrade
  const positionSize = riskAmount / stopLossPercent

  // Cap at 10% of portfolio
  const maxPosition = accountValue * 0.10

  return Math.min(positionSize, maxPosition)
}

/**
 * Check if adding a new position would exceed risk limits
 *
 * @param currentPortfolio Current portfolio positions
 * @param newPosition New position to add
 * @param tolerance Risk tolerance
 * @returns Whether position can be added safely
 */
export function canAddPosition(
  currentPortfolio: PortfolioRiskRequest,
  newPosition: {
    symbol: string
    shares: number
    entryPrice: number
    currentPrice: number
    stopLoss?: number
  },
  tolerance: RiskTolerance = 'Moderate'
): {
  canAdd: boolean
  reason?: string
  newRiskLevel?: RiskLevel
} {
  // Calculate new portfolio with position added
  const updatedPositions = [
    ...currentPortfolio.positions,
    newPosition,
  ]

  const updatedRequest: PortfolioRiskRequest = {
    ...currentPortfolio,
    positions: updatedPositions,
  }

  const assessment = analyzePortfolioRisk(updatedRequest)
  const thresholds = getToleranceThresholds(tolerance)

  // Check if risk would exceed tolerance
  if (assessment.portfolioRiskPercent > thresholds.HIGH) {
    return {
      canAdd: false,
      reason: `การเพิ่ม position นี้จะทำให้ความเสี่ยงพอร์ตfolio เกิน ${thresholds.HIGH.toFixed(1)}%`,
      newRiskLevel: assessment.riskLevel,
    }
  }

  return {
    canAdd: true,
    newRiskLevel: assessment.riskLevel,
  }
}
