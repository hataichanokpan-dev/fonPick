/**
 * Quality Assessment Lens
 *
 * Assesses company financial health and profitability
 * Based on profit margins, ROE, debt levels, and earnings growth
 */

import type { LensScore, QualityInput, LensStatus } from '../types'

/**
 * Assess stock quality
 * @param input Quality metrics
 * @returns Quality lens score
 */
export function assessQuality(input: QualityInput): LensScore {
  const scores: number[] = []
  const notes: string[] = []

  // 1. Profitability - Net Profit Margin (weight: 20%)
  const marginScore = assessProfitMargin(input.netProfitMargin)
  scores.push(marginScore.score)
  notes.push(...marginScore.notes)

  // 2. Return on Equity - ROE (weight: 25%)
  const roeScore = assessROE(input.roe)
  scores.push(roeScore.score)
  notes.push(...roeScore.notes)

  // 3. Financial Health - Debt to Equity (weight: 25%)
  const debtScore = assessDebtLevel(input.debtToEquity)
  scores.push(debtScore.score)
  notes.push(...debtScore.notes)

  // 4. Cash Flow (weight: 15%)
  const cashFlowScore = assessCashFlow(input.cashFlow)
  scores.push(cashFlowScore.score)
  notes.push(...cashFlowScore.notes)

  // 5. Growth - Earnings Growth (weight: 15%)
  const growthScore = assessEarningsGrowth(input.earningsGrowth)
  scores.push(growthScore.score)
  notes.push(...growthScore.notes)

  // Calculate weighted average score
  // Apply weights: Margin(20%), ROE(25%), Debt(25%), CashFlow(15%), Growth(15%)
  const weights = [0.2, 0.25, 0.25, 0.15, 0.15]
  let finalScore = 0

  for (let i = 0; i < scores.length && i < weights.length; i++) {
    finalScore += scores[i] * weights[i]
  }

  // Normalize if we have less than 5 metrics
  if (scores.length > 0 && scores.length < weights.length) {
    const totalWeight = weights.slice(0, scores.length).reduce((a, b) => a + b, 0)
    finalScore = finalScore / totalWeight
  } else if (scores.length === 0) {
    finalScore = 50 // Default to neutral
  }

  // Determine status
  const status: LensStatus = determineQualityStatus(finalScore, scores.length)

  return {
    lens: 'quality',
    status,
    score: Math.round(finalScore),
    notes: notes.slice(0, 5), // Limit to 5 notes max
  }
}

/**
 * Assess profit margin
 */
function assessProfitMargin(margin?: number): { score: number; notes: string[] } {
  if (margin === undefined) {
    return { score: 50, notes: [] }
  }

  if (margin > 15) {
    return {
      score: 100,
      notes: ['Excellent profitability (margin > 15%)'],
    }
  } else if (margin > 10) {
    return {
      score: 85,
      notes: ['Strong profitability (margin > 10%)'],
    }
  } else if (margin > 5) {
    return {
      score: 60,
      notes: ['Moderate profitability'],
    }
  } else if (margin > 0) {
    return {
      score: 35,
      notes: ['Low profitability'],
    }
  } else {
    return {
      score: 10,
      notes: ['Negative profit margin'],
    }
  }
}

/**
 * Assess ROE
 */
function assessROE(roe?: number): { score: number; notes: string[] } {
  if (roe === undefined) {
    return { score: 50, notes: [] }
  }

  if (roe > 20) {
    return {
      score: 100,
      notes: ['Exceptional ROE (> 20%)'],
    }
  } else if (roe > 15) {
    return {
      score: 90,
      notes: ['Excellent ROE (> 15%)'],
    }
  } else if (roe > 10) {
    return {
      score: 70,
      notes: ['Good ROE (> 10%)'],
    }
  } else if (roe > 5) {
    return {
      score: 50,
      notes: ['Adequate ROE'],
    }
  } else {
    return {
      score: 30,
      notes: ['Below average ROE'],
    }
  }
}

/**
 * Assess debt level
 */
function assessDebtLevel(debtToEquity?: number): { score: number; notes: string[] } {
  if (debtToEquity === undefined) {
    return { score: 50, notes: [] }
  }

  if (debtToEquity < 0.3) {
    return {
      score: 100,
      notes: ['Very low debt (conservative)'],
    }
  } else if (debtToEquity < 0.5) {
    return {
      score: 90,
      notes: ['Low debt (healthy)'],
    }
  } else if (debtToEquity < 1) {
    return {
      score: 70,
      notes: ['Moderate debt level'],
    }
  } else if (debtToEquity < 1.5) {
    return {
      score: 45,
      notes: ['Elevated debt (caution)'],
    }
  } else {
    return {
      score: 20,
      notes: ['High debt (financial risk)'],
    }
  }
}

/**
 * Assess cash flow
 */
function assessCashFlow(cashFlow?: number): { score: number; notes: string[] } {
  if (cashFlow === undefined) {
    return { score: 50, notes: [] }
  }

  // Cash flow in million THB - scale based on company size
  if (cashFlow > 1000) {
    return {
      score: 100,
      notes: ['Strong operating cash flow'],
    }
  } else if (cashFlow > 500) {
    return {
      score: 80,
      notes: ['Healthy cash generation'],
    }
  } else if (cashFlow > 0) {
    return {
      score: 60,
      notes: ['Positive cash flow'],
    }
  } else {
    return {
      score: 20,
      notes: ['Negative cash flow (concern)'],
    }
  }
}

/**
 * Assess earnings growth
 */
function assessEarningsGrowth(growth?: number): { score: number; notes: string[] } {
  if (growth === undefined) {
    return { score: 50, notes: [] }
  }

  if (growth > 20) {
    return {
      score: 100,
      notes: ['Exceptional earnings growth (> 20%)'],
    }
  } else if (growth > 10) {
    return {
      score: 85,
      notes: ['Strong earnings growth (> 10%)'],
    }
  } else if (growth > 5) {
    return {
      score: 65,
      notes: ['Moderate earnings growth'],
    }
  } else if (growth > 0) {
    return {
      score: 50,
      notes: ['Positive earnings growth'],
    }
  } else if (growth > -10) {
    return {
      score: 30,
      notes: ['Declining earnings'],
    }
  } else {
    return {
      score: 10,
      notes: ['Significant earnings decline'],
    }
  }
}

/**
 * Determine quality status based on score and data completeness
 */
function determineQualityStatus(score: number, dataPoints: number): LensStatus {
  // Check data completeness
  if (dataPoints < 2) {
    return 'Partial' // Not enough data
  }

  if (score >= 70) {
    return 'Pass'
  } else if (score >= 50) {
    return 'Partial'
  } else {
    return 'Fail'
  }
}
