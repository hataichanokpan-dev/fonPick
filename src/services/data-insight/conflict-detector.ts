/**
 * Conflict Detection Service
 *
 * Detects conflicts between different market signals.
 * Thai SET-specific rules for identifying high-impact conflicts.
 */

import type {
  DataInsightInput,
  Conflict,
  ConflictDetectionResult,
} from '@/types/data-insight'
import { THAI_SET_THRESHOLDS } from '@/types/data-insight'

// ============================================================================
// CONFLICT DETECTION
// ============================================================================

/**
 * Detect conflicts between market signals
 */
export function detectConflicts(input: DataInsightInput): ConflictDetectionResult {
  const conflicts: Conflict[] = []

  // Detect all conflict types
  const regimeSmartMoneyConflict = detectRegimeSmartMoneyConflict(input)
  if (regimeSmartMoneyConflict) conflicts.push(regimeSmartMoneyConflict)

  const regimeSectorConflict = detectRegimeSectorConflict(input)
  if (regimeSectorConflict) conflicts.push(regimeSectorConflict)

  const foreignDomesticConflict = detectForeignDomesticConflict(input)
  if (foreignDomesticConflict) conflicts.push(foreignDomesticConflict)

  const propTradingNoise = detectPropTradingNoise(input)
  if (propTradingNoise) conflicts.push(propTradingNoise)

  const bankSectorDefensive = detectBankSectorDefensive(input)
  if (bankSectorDefensive) conflicts.push(bankSectorDefensive)

  const smartMoneyContradiction = detectSmartMoneyContradiction(input)
  if (smartMoneyContradiction) conflicts.push(smartMoneyContradiction)

  // Calculate overall conflict level
  const conflictLevel = calculateConflictLevel(conflicts)
  const hasCriticalConflict = conflicts.some(c => c.severity === 'High')

  return {
    conflicts,
    conflictLevel,
    hasCriticalConflict,
  }
}

// ============================================================================
// SPECIFIC CONFLICT DETECTORS
// ============================================================================

/**
 * Detect conflict between regime and smart money
 * High-Impact: Regime = Risk-On + Smart Money Score < 40
 */
function detectRegimeSmartMoneyConflict(input: DataInsightInput): Conflict | null {
  const { regime, smartMoney } = input

  // Regime says risk-on but smart money score is low
  if (regime.type === 'Risk-On' && smartMoney.score < 40) {
    return {
      type: 'Regime-SmartMoney Mismatch',
      severity: 'High',
      description: `Market regime is ${regime.type} but smart money score is low (${smartMoney.score.toFixed(2)}/100)`,
      signals: ['regime', 'smartMoney'],
      impact: 'Regime may be lagging; smart money suggests caution',
    }
  }

  // Regime says risk-off but smart money score is high
  if (regime.type === 'Risk-Off' && smartMoney.score > 60) {
    return {
      type: 'Regime-SmartMoney Mismatch',
      severity: 'Medium',
      description: `Market regime is ${regime.type} but smart money score is high (${smartMoney.score.toFixed(2)}/100)`,
      signals: ['regime', 'smartMoney'],
      impact: 'Smart money may be detecting bottoming opportunity',
    }
  }

  return null
}

/**
 * Detect conflict between regime and sector leadership
 * High-Impact: Regime = Risk-Off + Sector Leaders = Banks/Energy
 */
function detectRegimeSectorConflict(input: DataInsightInput): Conflict | null {
  const { regime, sector } = input

  // Check if defensive sectors are leading
  const defensiveSectors = ['Banks', 'Energy', 'Food', 'Healthcare', 'Utilities']
  const leaderNames = sector.leadership.leaders.map(l => l.sector.name)
  const hasDefensiveLeaders = leaderNames.some(name =>
    defensiveSectors.some(d => name.includes(d))
  )

  // Risk-off regime with defensive leaders = confirms defensive positioning
  if (regime.type === 'Risk-Off' && hasDefensiveLeaders) {
    return {
      type: 'Bank Sector Defensive Signal',
      severity: 'Medium',
      description: `Risk-off regime with defensive sector leadership (${leaderNames.join(', ')})`,
      signals: ['regime', 'sector'],
      impact: 'Defensive positioning confirmed, not a bullish signal',
    }
  }

  // Risk-on regime with defensive leaders = potential conflict
  if (regime.type === 'Risk-On' && hasDefensiveLeaders) {
    return {
      type: 'Regime-Sector Mismatch',
      severity: 'Medium',
      description: `Regime is Risk-On but defensive sectors are leading`,
      signals: ['regime', 'sector'],
      impact: 'Sector rotation may be early or regime signal may be premature',
    }
  }

  return null
}

/**
 * Detect divergence between foreign and domestic investors
 * High-Impact: Foreign Strong Positive + Retail/Prop Strong Negative
 */
function detectForeignDomesticConflict(input: DataInsightInput): Conflict | null {
  const { smartMoney } = input
  const { foreign, retail, prop } = smartMoney.investors

  const foreignStrength = getStrengthScore(foreign.strength)
  const retailStrength = getStrengthScore(retail.strength)
  const propStrength = getStrengthScore(prop.strength)

  // Foreign strongly positive while domestic is strongly negative
  if (foreignStrength > 2 && (retailStrength < -2 || propStrength < -2)) {
    return {
      type: 'Foreign-Domestic Divergence',
      severity: 'High',
      description: `Foreign investors are ${foreign.strength} while ${
        retailStrength < -2 ? 'retail' : 'prop'
      } is ${retailStrength < -2 ? retail.strength : prop.strength}`,
      signals: ['foreign', 'domestic'],
      impact: 'Foreign flow typically leads market by 1-3 days',
    }
  }

  // Foreign strongly negative while domestic is strongly positive
  if (foreignStrength < -2 && (retailStrength > 2 || propStrength > 2)) {
    return {
      type: 'Foreign-Domestic Divergence',
      severity: 'Medium',
      description: `Foreign investors are ${foreign.strength} while ${
        retailStrength > 2 ? 'retail' : 'prop'
      } is ${retailStrength > 2 ? retail.strength : prop.strength}`,
      signals: ['foreign', 'domestic'],
      impact: 'Retail as contrarian indicator (sells at bottoms 65% of time)',
    }
  }

  return null
}

/**
 * Detect if prop trading is creating noise
 * High-Impact: Prop Trading > 40% of total flow = ignore all signals
 */
function detectPropTradingNoise(input: DataInsightInput): Conflict | null {
  const { smartMoney } = input
  const { foreign, institution, retail, prop } = smartMoney.investors

  // Calculate absolute flows
  const foreignAbs = Math.abs(foreign.todayNet)
  const institutionAbs = Math.abs(institution.todayNet)
  const retailAbs = Math.abs(retail.todayNet)
  const propAbs = Math.abs(prop.todayNet)

  const totalFlow = foreignAbs + institutionAbs + retailAbs + propAbs

  if (totalFlow === 0) return null

  // Calculate prop trading percentage
  const propPercentage = (propAbs / totalFlow) * 100

  if (propPercentage > THAI_SET_THRESHOLDS.PROP_TRADING_NOISE_THRESHOLD) {
    return {
      type: 'High Prop Trading Noise',
      severity: 'High',
      description: `Prop trading accounts for ${propPercentage.toFixed(1)}% of total flow`,
      signals: ['prop'],
      impact: 'High prop trading noise - WAIT for clearer signals',
    }
  }

  return null
}

/**
 * Detect if bank sector leadership is actually defensive
 */
function detectBankSectorDefensive(input: DataInsightInput): Conflict | null {
  const { regime, sector } = input

  const bankLeaders = sector.leadership.leaders.filter(l =>
    l.sector.name.toLowerCase().includes('bank') ||
    l.sector.name.toLowerCase().includes('financial')
  )

  if (bankLeaders.length === 0) return null

  // Banks leading but regime is cautious
  if (regime.type === 'Risk-Off' || regime.confidence < 60) {
    return {
      type: 'Bank Sector Defensive Signal',
      severity: 'Medium',
      description: `Banks sector leading but regime suggests ${regime.type} (Banks = ${THAI_SET_THRESHOLDS.BANKS_SECTOR_WEIGHT}% of SET)`,
      signals: ['sector', 'regime'],
      impact: 'Interpret as defensive positioning, not bullish signal',
    }
  }

  return null
}

/**
 * Detect contradiction within smart money components
 */
function detectSmartMoneyContradiction(input: DataInsightInput): Conflict | null {
  const { smartMoney } = input
  const { foreign, institution } = smartMoney.investors

  const foreignStrength = getStrengthScore(foreign.strength)
  const institutionStrength = getStrengthScore(institution.strength)

  // Foreign and institution strongly disagree
  if (foreignStrength > 2 && institutionStrength < -2) {
    return {
      type: 'Smart Money Contradiction',
      severity: 'Medium',
      description: `Foreign is ${foreign.strength} but Institution is ${institution.strength}`,
      signals: ['foreign', 'institution'],
      impact: 'Foreign typically leads institution by 1-2 days in Thai market',
    }
  }

  if (foreignStrength < -2 && institutionStrength > 2) {
    return {
      type: 'Smart Money Contradiction',
      severity: 'Medium',
      description: `Foreign is ${foreign.strength} but Institution is ${institution.strength}`,
      signals: ['foreign', 'institution'],
      impact: 'Foreign typically leads institution by 1-2 days in Thai market',
    }
  }

  return null
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate overall conflict level
 */
function calculateConflictLevel(conflicts: Conflict[]): ConflictDetectionResult['conflictLevel'] {
  if (conflicts.length === 0) return 'None'

  const hasHigh = conflicts.some(c => c.severity === 'High')
  const hasMedium = conflicts.some(c => c.severity === 'Medium')

  if (hasHigh) return 'High'
  if (hasMedium) return 'Medium'
  return 'Low'
}

/**
 * Convert strength string to numeric score
 */
function getStrengthScore(strength: string): number {
  const scores: Record<string, number> = {
    'Strong Buy': 3,
    'Buy': 1,
    'Neutral': 0,
    'Sell': -1,
    'Strong Sell': -3,
    'Strong Bullish': 3,
    'Bullish': 1,
    'Strong Bearish': -3,
    'Bearish': -1,
  }
  return scores[strength] ?? 0
}

/**
 * Get conflicts by severity
 */
export function getConflictsBySeverity(
  conflicts: Conflict[],
  severity: Conflict['severity']
): Conflict[] {
  return conflicts.filter(c => c.severity === severity)
}

/**
 * Get conflict description for user display
 */
export function formatConflictDescription(conflicts: Conflict[]): string {
  if (conflicts.length === 0) return ''

  const highSeverity = conflicts.filter(c => c.severity === 'High')
  if (highSeverity.length > 0) {
    return highSeverity.map(c => c.description).join('; ')
  }

  return conflicts[0].description
}
