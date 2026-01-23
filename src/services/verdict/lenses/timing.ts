/**
 * Timing Assessment Lens
 *
 * Assesses market timing and fit
 * Based on price momentum, volume, and market regime alignment
 */

import type { LensScore, TimingInput, LensStatus } from '../types'

/**
 * Assess timing and market fit
 * @param input Timing metrics
 * @returns Timing lens score
 */
export function assessTiming(input: TimingInput): LensScore {
  const scores: number[] = []
  const notes: string[] = []

  // 1. Price momentum (weight: 30%)
  const momentumScore = assessPriceMomentum(input.priceChangePercent)
  scores.push(momentumScore.score)
  notes.push(...momentumScore.notes)

  // 2. Volume analysis (weight: 20%)
  const volumeScore = assessVolume(input.volume, input.avgVolume)
  scores.push(volumeScore.score)
  notes.push(...volumeScore.notes)

  // 3. Market regime alignment (weight: 30%)
  const regimeScore = assessRegimeAlignment(input.marketRegime)
  scores.push(regimeScore.score)
  notes.push(...regimeScore.notes)

  // 4. Price position (near high/low) (weight: 20%)
  const positionScore = assessPricePosition(input.isNearHigh, input.isNearLow)
  scores.push(positionScore.score)
  notes.push(...positionScore.notes)

  // Calculate weighted average score
  const weights = [0.3, 0.2, 0.3, 0.2]
  let finalScore = 0

  for (let i = 0; i < scores.length && i < weights.length; i++) {
    finalScore += scores[i] * weights[i]
  }

  // Normalize if we have less than 4 metrics
  if (scores.length > 0 && scores.length < weights.length) {
    const totalWeight = weights.slice(0, scores.length).reduce((a, b) => a + b, 0)
    finalScore = finalScore / totalWeight
  } else if (scores.length === 0) {
    finalScore = 50 // Default to neutral
  }

  // Determine status
  const status: LensStatus = determineTimingStatus(finalScore)

  return {
    lens: 'timing',
    status,
    score: Math.round(finalScore),
    notes: notes.slice(0, 4), // Limit to 4 notes max
  }
}

/**
 * Assess price momentum
 */
function assessPriceMomentum(changePercent: number): { score: number; notes: string[] } {
  if (changePercent > 3) {
    return {
      score: 100,
      notes: ['Strong positive momentum (> +3%)'],
    }
  } else if (changePercent > 1) {
    return {
      score: 85,
      notes: ['Positive momentum (> +1%)'],
    }
  } else if (changePercent > 0) {
    return {
      score: 65,
      notes: ['Modestly positive'],
    }
  } else if (changePercent > -1) {
    return {
      score: 50,
      notes: ['Flat trading'],
    }
  } else if (changePercent > -3) {
    return {
      score: 35,
      notes: ['Modest decline'],
    }
  } else {
    return {
      score: 15,
      notes: ['Significant decline (> -3%)'],
    }
  }
}

/**
 * Assess volume
 */
function assessVolume(
  volume: number,
  avgVolume?: number
): { score: number; notes: string[] } {
  if (!avgVolume || avgVolume === 0) {
    return { score: 50, notes: [] }
  }

  const volumeRatio = volume / avgVolume

  if (volumeRatio > 2) {
    return {
      score: 100,
      notes: ['Very high volume (strong interest)'],
    }
  } else if (volumeRatio > 1.5) {
    return {
      score: 85,
      notes: ['Above average volume'],
    }
  } else if (volumeRatio > 0.8) {
    return {
      score: 60,
      notes: ['Normal volume'],
    }
  } else if (volumeRatio > 0.5) {
    return {
      score: 40,
      notes: ['Below average volume (low interest)'],
    }
  } else {
    return {
      score: 20,
      notes: ['Very low volume'],
    }
  }
}

/**
 * Assess market regime alignment
 */
function assessRegimeAlignment(regime: 'Risk-On' | 'Neutral' | 'Risk-Off' | null): {
  score: number
  notes: string[]
} {
  if (!regime) {
    return { score: 50, notes: [] }
  }

  if (regime === 'Risk-On') {
    return {
      score: 85,
      notes: ['Favorable market regime (Risk-On)'],
    }
  } else if (regime === 'Neutral') {
    return {
      score: 60,
      notes: ['Neutral market environment'],
    }
  } else {
    // Risk-Off
    return {
      score: 30,
      notes: ['Unfavorable market regime (Risk-Off)'],
    }
  }
}

/**
 * Assess price position relative to 52-week range
 */
function assessPricePosition(
  isNearHigh?: boolean,
  isNearLow?: boolean
): { score: number; notes: string[] } {
  if (isNearHigh) {
    return {
      score: 40,
      notes: ['Trading near 52-week high (caution)'],
    }
  } else if (isNearLow) {
    return {
      score: 75,
      notes: ['Trading near 52-week low (opportunity)'],
    }
  } else {
    return {
      score: 60,
      notes: ['Mid-range price level'],
    }
  }
}

/**
 * Determine timing status based on score
 */
function determineTimingStatus(score: number): LensStatus {
  if (score >= 70) {
    return 'Pass' // Good timing
  } else if (score >= 45) {
    return 'Partial' // OK timing
  } else {
    return 'Fail' // Poor timing
  }
}
