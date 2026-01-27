/**
 * Conflict Resolution Service
 *
 * Resolves conflicting market signals using Thai SET-specific rules.
 * Applies resolution hierarchy and generates actionable verdict.
 */

import type {
  DataInsight,
  DataInsightInput,
  ResolutionRule,
  ResolutionContext,
  Verdict,
  ConvictionLevel,
  PrimaryDriver,
  SectorFocus,
} from '@/types/data-insight'
import {
  THAI_SET_THRESHOLDS,
  DEFAULT_WEIGHTS,
} from '@/types/data-insight'
import { detectConflicts, formatConflictDescription } from './conflict-detector'

// ============================================================================
// MAIN RESOLUTION FUNCTION
// ============================================================================

/**
 * Resolve conflicting signals into a single verdict
 */
export function resolveSignals(input: DataInsightInput): DataInsight {
  // Detect conflicts first
  const conflictResult = detectConflicts(input)

  // Check for critical conflicts that require immediate verdict
  const criticalConflictVerdict = checkCriticalConflicts(input, conflictResult)
  if (criticalConflictVerdict) {
    return criticalConflictVerdict
  }

  // Apply resolution rules in priority order
  const resolution = applyResolutionRules(input, conflictResult)

  // Calculate verdict from resolution
  const verdict = calculateVerdict(input, resolution)

  // Build final data insight
  return buildDataInsight(input, verdict, conflictResult, resolution)
}

// ============================================================================
// CRITICAL CONFLICT CHECKS
// ============================================================================

/**
 * Check for critical conflicts that override normal resolution
 */
function checkCriticalConflicts(
  input: DataInsightInput,
  conflictResult: ReturnType<typeof detectConflicts>
): DataInsight | null {
  // Rule: Prop trading noise - return WAIT immediately
  const propNoiseConflict = conflictResult.conflicts.find(
    c => c.type === 'High Prop Trading Noise'
  )

  if (propNoiseConflict) {
    return createDataInsight(input, {
      verdict: 'WAIT',
      conviction: 'Low',
      primaryDriver: 'None',
      explanation: 'High prop trading noise detected',
      actionableTakeaway: 'Wait for prop trading activity to normalize before making trading decisions',
      keyConflictAlert: propNoiseConflict.description,
      sectorFocus: 'NEUTRAL',
      confidence: 30,
      reasoning: [
        'Prop trading accounts for >40% of total flow',
        'This creates excessive noise in market signals',
        'Wait for prop trading to subside for clearer signals',
      ],
    })
  }

  return null
}

// ============================================================================
// RESOLUTION RULES
// ============================================================================

/**
 * Apply resolution rules in priority order
 */
function applyResolutionRules(
  input: DataInsightInput,
  _conflictResult: ReturnType<typeof detectConflicts>
): ResolutionContext {
  const rules = getResolutionRules()

  const appliedRules: string[] = []
  const weights = { ...DEFAULT_WEIGHTS }
  const specialCases: string[] = []

  // Sort rules by priority (higher first)
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)

  // Apply each rule if condition matches
  for (const rule of sortedRules) {
    if (rule.condition(input)) {
      const ruleResult = rule.resolve(input, weights)
      appliedRules.push(rule.name)

      // Update weights if specified
      if (ruleResult.weights) {
        Object.assign(weights, ruleResult.weights)
      }

      // Track special cases
      if (ruleResult.specialCase) {
        specialCases.push(ruleResult.specialCase)
      }

      // Break after first match (highest priority wins)
      break
    }
  }

  return {
    appliedRules,
    weights,
    specialCases,
  }
}

/**
 * Get all resolution rules
 */
function getResolutionRules(): ResolutionRule[] {
  return [
    // Rule 1: Foreign Dominance (Highest Priority)
    {
      name: 'Foreign Dominance',
      priority: 100,
      condition: (input: DataInsightInput) => {
        const foreignNet = Math.abs(input.smartMoney.investors.foreign.todayNet)
        return (
          foreignNet > THAI_SET_THRESHOLDS.FOREIGN_FLOW_THRESHOLD &&
          input.regime.confidence < THAI_SET_THRESHOLDS.REGIME_CONFIDENCE_OVERRIDE
        )
      },
      resolve: (_input: DataInsightInput, currentWeights: { regime: number; smartMoney: number; foreign: number; sector: number }) => {
        return {
          weights: {
            ...currentWeights,
            foreign: 2.0,
            regime: 0.5,
          },
          specialCase: 'Foreign flow dominance detected',
        }
      },
    },

    // Rule 2: Smart Money Extremes
    {
      name: 'Smart Money Extremes',
      priority: 90,
      condition: (input: DataInsightInput) => {
        const score = input.smartMoney.score
        return (
          score > THAI_SET_THRESHOLDS.SMART_MONEY_HIGH_THRESHOLD ||
          score < THAI_SET_THRESHOLDS.SMART_MONEY_LOW_THRESHOLD
        )
      },
      resolve: (input: DataInsightInput, currentWeights: { regime: number; smartMoney: number; foreign: number; sector: number }) => {
        const regimeOverride =
          input.regime.confidence >= THAI_SET_THRESHOLDS.REGIME_CONFIDENCE_OVERRIDE

        return {
          weights: regimeOverride
            ? currentWeights
            : {
                ...currentWeights,
                smartMoney: 1.8,
                regime: 0.6,
              },
          specialCase: regimeOverride
            ? 'Regime high confidence overrides smart money'
            : 'Smart money at extreme levels',
        }
      },
    },

    // Rule 3: Bank Sector Special Case
    {
      name: 'Bank Sector Defensive',
      priority: 80,
      condition: (input: DataInsightInput) => {
        const bankLeaders = input.sector.leadership.leaders.filter(l =>
          l.sector.name.toLowerCase().includes('bank') ||
          l.sector.name.toLowerCase().includes('financial')
        )
        return (
          bankLeaders.length > 0 &&
          (input.regime.type === 'Risk-Off' || input.regime.confidence < 60)
        )
      },
      resolve: (_input: DataInsightInput, _currentWeights: { regime: number; smartMoney: number; foreign: number; sector: number }) => {
        return {
          specialCase: 'Bank sector leadership is defensive, not bullish',
        }
      },
    },

    // Rule 4: Sector Confirmation
    {
      name: 'Sector Confirmation',
      priority: 70,
      condition: (input: DataInsightInput) => {
        return input.sector.concentration > 60
      },
      resolve: (_input: DataInsightInput, currentWeights: { regime: number; smartMoney: number; foreign: number; sector: number }) => {
        return {
          weights: {
            ...currentWeights,
            sector: 1.2,
          },
          specialCase: 'High sector concentration confirms trend',
        }
      },
    },
  ]
}

// ============================================================================
// VERDICT CALCULATION
// ============================================================================

/**
 * Calculate verdict from weighted signals
 */
function calculateVerdict(
  input: DataInsightInput,
  resolution: ResolutionContext
): {
  verdict: Verdict
  conviction: ConvictionLevel
  primaryDriver: PrimaryDriver
  sectorFocus: SectorFocus
  confidence: number
  reasoning: string[]
} {
  const weights = resolution.weights
  const reasoning: string[] = []

  // Calculate weighted scores
  const regimeScore = getRegimeScore(input.regime)
  const smartMoneyScore = input.smartMoney.score
  const foreignScore = getForeignScore(input.smartMoney.investors.foreign.todayNet)
  const sectorScore = getSectorScore(input)

  // Apply weights (with NaN safety - use 0 as default for invalid scores)
  const weightedRegime = (regimeScore || 0) * weights.regime
  const weightedSmartMoney = (smartMoneyScore || 0) * weights.smartMoney
  const weightedForeign = (foreignScore || 0) * weights.foreign
  const weightedSector = (sectorScore || 0) * weights.sector

  const totalScore = weightedRegime + weightedSmartMoney + weightedForeign + weightedSector
  const maxScore =
    weights.regime * 100 +
    weights.smartMoney * 100 +
    weights.foreign * 100 +
    weights.sector * 100

  const normalizedScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 50

  // Add reasoning
  reasoning.push(`Regime score: ${regimeScore}/100 (weight: ${weights.regime})`)
  reasoning.push(`Smart Money score: ${smartMoneyScore}/100 (weight: ${weights.smartMoney})`)
  reasoning.push(`Foreign score: ${foreignScore}/100 (weight: ${weights.foreign})`)
  reasoning.push(`Sector score: ${sectorScore}/100 (weight: ${weights.sector})`)
  reasoning.push(`Final score: ${normalizedScore.toFixed(1)}/100`)

  // Determine primary driver
  const primaryDriver = determinePrimaryDriver(
    weightedRegime,
    weightedSmartMoney,
    weightedForeign,
    weightedSector
  )

  // Determine verdict
  let verdict: Verdict
  if (normalizedScore >= 65) {
    verdict = 'PROCEED'
  } else if (normalizedScore >= 45) {
    verdict = 'CAUTION'
  } else if (normalizedScore >= 30) {
    verdict = 'NEUTRAL'
  } else {
    verdict = 'WAIT'
  }

  // Determine conviction level
  const conviction = determineConviction(input, normalizedScore, resolution)

  // Determine sector focus
  const sectorFocus = determineSectorFocus(input, verdict)

  // Calculate confidence
  const confidence = calculateConfidence(input, normalizedScore)

  return {
    verdict,
    conviction,
    primaryDriver,
    sectorFocus,
    confidence,
    reasoning,
  }
}

/**
 * Get regime score (0-100)
 */
function getRegimeScore(regime: DataInsightInput['regime']): number {
  const baseScores = {
    'Risk-On': 75,
    'Neutral': 50,
    'Risk-Off': 25,
  }
  const baseScore = baseScores[regime.type] || 50

  // Adjust by confidence (with NaN safety)
  const confidenceMultiplier = (regime.confidence || 50) / 100

  return baseScore * confidenceMultiplier
}

/**
 * Get foreign score (0-100)
 */
function getForeignScore(foreignNet: number): number {
  // Foreign leads market by 1-3 days (70% accuracy)
  const threshold = THAI_SET_THRESHOLDS.FOREIGN_FLOW_THRESHOLD

  if (foreignNet > threshold) {
    return Math.min(75 + (foreignNet - threshold) / 100, 100)
  }

  if (foreignNet < -threshold) {
    return Math.max(25 - (Math.abs(foreignNet) - threshold) / 100, 0)
  }

  return 50 // Neutral
}

/**
 * Get sector score (0-100)
 */
function getSectorScore(input: DataInsightInput): number {
  const { sector, regime } = input

  // Check if sector pattern matches regime
  const sectorMatchesRegime =
    (regime.type === 'Risk-On' && sector.pattern.includes('Risk-On')) ||
    (regime.type === 'Risk-Off' && sector.pattern.includes('Risk-Off'))

  if (sectorMatchesRegime) {
    return 70 + (sector.concentration / 100) * 20 // 70-90
  }

  if (sector.pattern === 'Mixed/No Clear Pattern') {
    return 40
  }

  return 50
}

/**
 * Determine primary driver
 */
function determinePrimaryDriver(
  weightedRegime: number,
  weightedSmartMoney: number,
  weightedForeign: number,
  weightedSector: number
): PrimaryDriver {
  const scores = {
    'Market Regime': weightedRegime,
    'Smart Money': weightedSmartMoney,
    'Foreign Flow': weightedForeign,
    'Sector Strength': weightedSector,
  }

  const maxScore = Math.max(...Object.values(scores))

  for (const [driver, score] of Object.entries(scores)) {
    if (score === maxScore && maxScore > 0) {
      return driver as PrimaryDriver
    }
  }

  return 'None'
}

/**
 * Determine conviction level
 */
function determineConviction(
  input: DataInsightInput,
  finalScore: number,
  resolution: ResolutionContext
): ConvictionLevel {
  // Low conviction if there are high-severity conflicts
  const hasHighConflicts = resolution.specialCases.some(c =>
    c.includes('noise') || c.includes('conflict')
  )

  if (hasHighConflicts) return 'Low'

  // High conviction if all signals align
  const signalsAligned =
    (input.regime.type === 'Risk-On' && input.smartMoney.score > 60) ||
    (input.regime.type === 'Risk-Off' && input.smartMoney.score < 40)

  if (signalsAligned && finalScore > 70) return 'High'

  // Medium conviction for moderate scores
  if (finalScore > 50) return 'Medium'

  return 'Low'
}

/**
 * Determine sector focus
 */
function determineSectorFocus(input: DataInsightInput, verdict: Verdict): SectorFocus {
  if (verdict === 'WAIT' || verdict === 'NEUTRAL') return 'NEUTRAL'

  const { sector, regime } = input

  if (verdict === 'PROCEED') {
    // Overweight focus sectors in risk-on
    if (regime.type === 'Risk-On' && sector.focusSectors.length > 0) {
      return 'OVERWEIGHT'
    }
  }

  if (verdict === 'CAUTION') {
    // Underweight if there are clear avoid sectors
    if (sector.avoidSectors.length > 0) {
      return 'UNDERWEIGHT'
    }
  }

  return 'NEUTRAL'
}

/**
 * Calculate overall confidence
 */
function calculateConfidence(input: DataInsightInput, finalScore: number): number {
  const confidences = [
    input.regime.confidence,
    input.smartMoney.confidence,
    input.sector.concentration,
  ]

  const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length

  // Adjust based on how extreme the score is
  const scoreExtremity = Math.abs(finalScore - 50) / 50
  const adjustedConfidence = avgConfidence * (0.8 + scoreExtremity * 0.2)

  return Math.min(Math.round(adjustedConfidence), 100)
}

// ============================================================================
// DATA INSIGHT BUILDING
// ============================================================================

/**
 * Build final data insight object
 */
function buildDataInsight(
  input: DataInsightInput,
  verdict: ReturnType<typeof calculateVerdict>,
  conflictResult: ReturnType<typeof detectConflicts>,
  resolution: ResolutionContext
): DataInsight {
  const keyConflictAlert = formatConflictDescription(conflictResult.conflicts)

  return {
    ...verdict,
    explanation: generateExplanation(input, verdict, resolution, keyConflictAlert),
    actionableTakeaway: generateActionableTakeaway(verdict, input),
    keyConflictAlert: keyConflictAlert || undefined,
    conflictingSignals: extractSignalValues(input),
    timestamp: Date.now(),
  }
}

/**
 * Generate explanation
 */
function generateExplanation(
  input: DataInsightInput,
  verdict: ReturnType<typeof calculateVerdict>,
  _resolution: ResolutionContext,
  keyConflictAlert: string
): string {
  const parts: string[] = []

  // Start with primary driver
  parts.push(`${verdict.primaryDriver} is the primary driver.`)

  // Add regime context
  parts.push(`Market regime is ${input.regime.type} with ${input.regime.confidence}% confidence.`)

  // Add smart money context
  parts.push(
    `Smart money score is ${input.smartMoney.score}/100 with signal: ${input.smartMoney.combinedSignal}.`
  )

  // Add sector context
  parts.push(`Sector pattern shows ${input.sector.pattern}.`)

  // Add conflicts if any
  if (keyConflictAlert) {
    parts.push(`Key conflict: ${keyConflictAlert}`)
  }

  return parts.join(' ')
}

/**
 * Generate actionable takeaway
 */
function generateActionableTakeaway(
  verdict: ReturnType<typeof calculateVerdict>,
  input: DataInsightInput
): string {
  const { verdict: v, sectorFocus, primaryDriver } = verdict

  switch (v) {
    case 'PROCEED':
      if (sectorFocus === 'OVERWEIGHT' && input.sector.focusSectors.length > 0) {
        return `Consider ${sectorFocus.toLowerCase()} positions in ${input.sector.focusSectors.slice(0, 3).join(', ')}. Driven by ${primaryDriver}.`
      }
      return `Proceed with trades. Driven by ${primaryDriver}. Maintain standard position sizing.`

    case 'CAUTION':
      if (sectorFocus === 'UNDERWEIGHT' && input.sector.avoidSectors.length > 0) {
        return `Reduce exposure to ${input.sector.avoidSectors.slice(0, 2).join(', ')}. Use tighter stops.`
      }
      return `Exercise caution with new positions. Consider reducing position sizes by 25-50%.`

    case 'WAIT':
      return `Wait for clearer signals. Current market conditions are too ambiguous for high-conviction trades.`

    case 'NEUTRAL':
      return `Market signals are mixed. Hold existing positions and wait for directional clarity.`
  }
}

/**
 * Extract signal values for conflictingSignals field
 */
function extractSignalValues(input: DataInsightInput): DataInsight['conflictingSignals'] {
  return {
    regime: {
      value: input.regime.type,
      confidence: input.regime.confidence,
    },
    smartMoney: {
      value: input.smartMoney.combinedSignal,
      confidence: input.smartMoney.confidence,
    },
    sector: {
      value: input.sector.pattern,
      confidence: input.sector.concentration,
    },
    foreign: {
      value: input.smartMoney.investors.foreign.strength,
      confidence: Math.min(100, Math.abs(input.smartMoney.investors.foreign.todayNet) / 10),
    },
  }
}

/**
 * Create data insight object (helper for critical conflicts)
 */
function createDataInsight(
  input: DataInsightInput,
  data: Omit<DataInsight, 'conflictingSignals' | 'timestamp'>
): DataInsight {
  return {
    ...data,
    conflictingSignals: extractSignalValues(input),
    timestamp: Date.now(),
  }
}
