/**
 * Valuation Assessment Lens
 *
 * Assesses whether a stock is attractively valued
 * Based on P/E, P/BV, dividend yield, and historical comparisons
 */

import type { LensScore, ValuationInput, LensStatus } from '../types'

/**
 * Assess stock valuation
 * @param input Valuation metrics
 * @returns Valuation lens score
 */
export function assessValuation(input: ValuationInput): LensScore {
  const scores: number[] = []
  const notes: string[] = []

  // 1. P/E Ratio assessment (weight: 35%)
  const peScore = assessPERatio(input.pe)
  scores.push(peScore.score)
  notes.push(...peScore.notes)

  // 2. P/BV Ratio assessment (weight: 30%)
  const pbvScore = assessPBVRatio(input.pbv)
  scores.push(pbvScore.score)
  notes.push(...pbvScore.notes)

  // 3. Dividend Yield assessment (weight: 20%)
  const dividendScore = assessDividendYield(input.dividendYield)
  scores.push(dividendScore.score)
  notes.push(...dividendScore.notes)

  // 4. EV/EBITDA assessment (weight: 15%)
  const ebitdaScore = assessEVToEBITDA(input.ev, input.ebitda)
  scores.push(ebitdaScore.score)
  notes.push(...ebitdaScore.notes)

  // Calculate weighted average score
  const weights = [0.35, 0.3, 0.2, 0.15]
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
  const status: LensStatus = determineValuationStatus(finalScore, scores.length)

  return {
    lens: 'valuation',
    status,
    score: Math.round(finalScore),
    notes: notes.slice(0, 5), // Limit to 5 notes max
  }
}

/**
 * Assess P/E ratio
 * Note: These benchmarks are for Thai market context
 */
function assessPERatio(pe?: number): { score: number; notes: string[] } {
  if (pe === undefined || pe === null) {
    return { score: 50, notes: [] }
  }

  if (pe < 0) {
    // Negative earnings
    return {
      score: 10,
      notes: ['Negative earnings (no P/E ratio)'],
    }
  }

  // Thai market context - SET average P/E typically around 12-15x
  if (pe < 8) {
    return {
      score: 100,
      notes: ['Very attractive valuation (P/E < 8x)'],
    }
  } else if (pe < 12) {
    return {
      score: 85,
      notes: ['Attractive valuation (P/E < 12x)'],
    }
  } else if (pe < 15) {
    return {
      score: 65,
      notes: ['Fair valuation'],
    }
  } else if (pe < 20) {
    return {
      score: 45,
      notes: ['Slightly expensive (P/E > 15x)'],
    }
  } else if (pe < 30) {
    return {
      score: 25,
      notes: ['Expensive (P/E > 20x)'],
    }
  } else {
    return {
      score: 10,
      notes: ['Very expensive (P/E > 30x)'],
    }
  }
}

/**
 * Assess P/BV ratio
 * Note: These benchmarks are for Thai market context
 */
function assessPBVRatio(pbv?: number): { score: number; notes: string[] } {
  if (pbv === undefined || pbv === null) {
    return { score: 50, notes: [] }
  }

  if (pbv < 0.5) {
    return {
      score: 100,
      notes: ['Deep discount to book (P/BV < 0.5x)'],
    }
  } else if (pbv < 0.8) {
    return {
      score: 90,
      notes: ['Attractive valuation (P/BV < 0.8x)'],
    }
  } else if (pbv < 1) {
    return {
      score: 75,
      notes: ['Trading below book value'],
    }
  } else if (pbv < 1.5) {
    return {
      score: 60,
      notes: ['Reasonable valuation (P/BV < 1.5x)'],
    }
  } else if (pbv < 2) {
    return {
      score: 40,
      notes: ['Premium to book (P/BV > 1.5x)'],
    }
  } else if (pbv < 3) {
    return {
      score: 25,
      notes: ['High premium (P/BV > 2x)'],
    }
  } else {
    return {
      score: 10,
      notes: ['Very high premium (P/BV > 3x)'],
    }
  }
}

/**
 * Assess dividend yield
 */
function assessDividendYield(dividendYield?: number): { score: number; notes: string[] } {
  if (dividendYield === undefined || dividendYield === null) {
    return { score: 50, notes: [] }
  }

  if (dividendYield < 0) {
    return { score: 50, notes: [] }
  }

  if (dividendYield > 5) {
    return {
      score: 100,
      notes: ['Excellent dividend yield (> 5%)'],
    }
  } else if (dividendYield > 4) {
    return {
      score: 90,
      notes: ['High dividend yield (> 4%)'],
    }
  } else if (dividendYield > 3) {
    return {
      score: 75,
      notes: ['Good dividend yield (> 3%)'],
    }
  } else if (dividendYield > 2) {
    return {
      score: 55,
      notes: ['Moderate dividend yield'],
    }
  } else if (dividendYield > 0) {
    return {
      score: 40,
      notes: ['Low dividend yield'],
    }
  } else {
    return {
      score: 30,
      notes: ['No dividend'],
    }
  }
}

/**
 * Assess EV/EBITDA ratio
 */
function assessEVToEBITDA(ev?: number, ebitda?: number): { score: number; notes: string[] } {
  if (ev === undefined || ebitda === undefined || ebitda === 0) {
    return { score: 50, notes: [] }
  }

  const evEbitda = ev / ebitda

  if (evEbitda < 5) {
    return {
      score: 100,
      notes: ['Very attractive EV/EBITDA (< 5x)'],
    }
  } else if (evEbitda < 8) {
    return {
      score: 85,
      notes: ['Attractive EV/EBITDA (< 8x)'],
    }
  } else if (evEbitda < 10) {
    return {
      score: 65,
      notes: ['Fair EV/EBITDA'],
    }
  } else if (evEbitda < 12) {
    return {
      score: 45,
      notes: ['Slightly expensive EV/EBITDA (> 10x)'],
    }
  } else if (evEbitda < 15) {
    return {
      score: 30,
      notes: ['Expensive EV/EBITDA (> 12x)'],
    }
  } else {
    return {
      score: 15,
      notes: ['Very expensive EV/EBITDA (> 15x)'],
    }
  }
}

/**
 * Determine valuation status based on score and data completeness
 */
function determineValuationStatus(score: number, dataPoints: number): LensStatus {
  // Check data completeness
  if (dataPoints < 2) {
    return 'Partial' // Not enough data
  }

  if (score >= 70) {
    return 'Pass' // Attractive valuation
  } else if (score >= 50) {
    return 'Partial' // Fair valuation
  } else {
    return 'Fail' // Expensive
  }
}
