/**
 * Decision Engine Utilities
 *
 * Advanced decision-making logic for investment recommendations.
 * Includes scenario analysis and what-if calculations.
 */

import { DECISION_THRESHOLDS } from '../constants'
import type { InvestmentDecision, ConfidenceLevel, TotalScore } from '../types'

/**
 * Decision engine result
 */
export interface DecisionEngineResult {
  decision: InvestmentDecision
  confidence: ConfidenceLevel
  confidencePercent: number
  rationale: string[]
  warnings: string[]
  keyFactors: {
    positive: string[]
    negative: string[]
  }
}

/**
 * Decision factors analysis
 */
export interface DecisionFactors {
  // Positive factors
  strongQuality: boolean
  attractiveValuation: boolean
  goodGrowth: boolean
  bullishTechnical: boolean
  positiveCatalyst: boolean

  // Negative factors
  weakQuality: boolean
  expensiveValuation: boolean
  poorGrowth: boolean
  bearishTechnical: boolean
  negativeCatalyst: boolean
}

/**
 * Analyze decision factors from scores
 */
export function analyzeDecisionFactors(scores: {
  quality: number
  valueGrowth: number
  technical: number
}): DecisionFactors {
  const { quality, valueGrowth, technical } = scores

  return {
    // Positive factors
    strongQuality: quality >= 7,
    attractiveValuation: valueGrowth >= 7,
    goodGrowth: valueGrowth >= 5,
    bullishTechnical: technical >= 7,
    positiveCatalyst: technical >= 5,

    // Negative factors
    weakQuality: quality <= 4,
    expensiveValuation: valueGrowth <= 3,
    poorGrowth: valueGrowth <= 2,
    bearishTechnical: technical <= 3,
    negativeCatalyst: technical <= 2,
  }
}

/**
 * Run decision engine
 */
export function runDecisionEngine(scores: {
  totalScore: TotalScore
  quality: number
  valueGrowth: number
  technical: number
  universePassed: boolean
}): DecisionEngineResult {
  const { totalScore, quality, valueGrowth, technical, universePassed } = scores
  const factors = analyzeDecisionFactors({ quality, valueGrowth, technical })

  // Determine decision
  let decision: InvestmentDecision = 'PASS'
  if (totalScore >= DECISION_THRESHOLDS.BUY && universePassed) {
    decision = 'BUY'
  } else if (totalScore >= DECISION_THRESHOLDS.HOLD) {
    decision = 'HOLD'
  }

  // Calculate confidence
  const confidenceResult = calculateDecisionConfidence(scores, factors)

  // Generate rationale
  const rationale = generateDecisionRationale(decision, factors)

  // Generate warnings
  const warnings = generateDecisionWarnings(scores)

  // Key factors
  const keyFactors = generateKeyFactors(factors)

  return {
    decision,
    confidence: confidenceResult.level,
    confidencePercent: confidenceResult.percent,
    rationale,
    warnings,
    keyFactors,
  }
}

/**
 * Calculate decision confidence
 */
function calculateDecisionConfidence(
  scores: {
    totalScore: TotalScore
    quality: number
    valueGrowth: number
    technical: number
  },
  factors: DecisionFactors
): { level: ConfidenceLevel; percent: number } {
  let confidencePercent = (scores.totalScore / 27) * 100

  // Adjust based on universe
  if (!factors.strongQuality || !factors.attractiveValuation) {
    confidencePercent -= 10
  }

  // Adjust based on balance
  const scoreArray = [scores.quality, scores.valueGrowth, scores.technical]
  const maxScore = Math.max(...scoreArray)
  const minScore = Math.min(...scoreArray)
  const spread = maxScore - minScore

  if (spread > 5) {
    confidencePercent -= 15 // Unbalanced scores reduce confidence
  } else if (spread > 3) {
    confidencePercent -= 5
  }

  // Adjust based on technical alignment
  if (scores.technical >= 5 && factors.bullishTechnical) {
    confidencePercent += 5
  }

  confidencePercent = Math.max(0, Math.min(100, confidencePercent))

  let level: ConfidenceLevel = 'Low'
  if (confidencePercent >= 70) level = 'High'
  else if (confidencePercent >= 50) level = 'Medium'

  return { level, percent: Math.round(confidencePercent) }
}

/**
 * Generate decision rationale
 */
function generateDecisionRationale(
  decision: InvestmentDecision,
  factors: DecisionFactors
): string[] {
  const rationale: string[] = []

  if (decision === 'BUY') {
    if (factors.strongQuality) {
      rationale.push('คุณภาพกิจการดีเยี่ยม')
    }
    if (factors.attractiveValuation) {
      rationale.push('ราคาถูกเมื่อเทียบกับมูลค่า')
    }
    if (factors.goodGrowth) {
      rationale.push('มีแนวโน้มเติบโตที่ดี')
    }
    if (factors.bullishTechnical) {
      rationale.push('สัญญาณเทคนิคเป็นบวก')
    }
    if (factors.positiveCatalyst) {
      rationale.push('มีเหตุการณ์สนับสนุน')
    }
  } else if (decision === 'HOLD') {
    rationale.push('มีทั้งจุดแข็งและจุดอ่อนปนกัน')
    if (factors.strongQuality) {
      rationale.push('กิจการมีคุณภาพ แต่ราคาอาจอยู่ในระดับสูง')
    } else if (factors.attractiveValuation) {
      rationale.push('ราคาถูก แต่คุณภาพกิจการต้องติดตาม')
    }
  } else {
    if (factors.weakQuality) {
      rationale.push('คุณภาพกิจการอ่อน')
    }
    if (factors.expensiveValuation) {
      rationale.push('ราคาแพงเมื่อเทียบกับมูลค่า')
    }
    if (factors.bearishTechnical) {
      rationale.push('สัญญาณเทคนิคเป็นลบ')
    }
  }

  return rationale.length > 0 ? rationale : ['ข้อมูลไม่เพียงพอสำหรับการวิเคราะห์']
}

/**
 * Generate decision warnings
 */
function generateDecisionWarnings(
  scores: {
    totalScore: TotalScore
    quality: number
    valueGrowth: number
    technical: number
  }
): string[] {
  const warnings: string[] = []

  // Low quality warning
  if (scores.quality <= 4) {
    warnings.push('คุณภาพกิจการอ่อน - มีความเสี่ยงสูง')
  }

  // Expensive warning
  if (scores.valueGrowth <= 3 && scores.valueGrowth > 0) {
    warnings.push('ราคาอาจแพงเกินไป')
  }

  // Technical warning
  if (scores.technical <= 3) {
    warnings.push('สัญญาณเทคนิคไม่ดี - อาจมีความผันผวนสูง')
  }

  // Unbalanced scores warning
  const scoreArray = [scores.quality, scores.valueGrowth, scores.technical]
  const maxScore = Math.max(...scoreArray)
  const minScore = Math.min(...scoreArray)
  if (maxScore - minScore > 6) {
    warnings.push('คะแนนไม่สมดุล - ติดตามอย่างใกล้ชิด')
  }

  return warnings
}

/**
 * Generate key factors
 */
function generateKeyFactors(factors: DecisionFactors): {
  positive: string[]
  negative: string[]
} {
  const positive: string[] = []
  const negative: string[] = []

  if (factors.strongQuality) positive.push('คุณภาพดี')
  if (factors.attractiveValuation) positive.push('ราคาถูก')
  if (factors.goodGrowth) positive.push('เติบโตดี')
  if (factors.bullishTechnical) positive.push('เทคนิคบวก')
  if (factors.positiveCatalyst) positive.push('มี catalyst')

  if (factors.weakQuality) negative.push('คุณภาพอ่อน')
  if (factors.expensiveValuation) negative.push('ราคาแพง')
  if (factors.poorGrowth) negative.push('เติบโตต่ำ')
  if (factors.bearishTechnical) negative.push('เทคนิคลบ')
  if (factors.negativeCatalyst) negative.push('มีความเสี่ยง')

  return { positive, negative }
}

/**
 * What-if analysis
 */
export interface WhatIfScenario {
  name: string
  description: string
  adjustedScore: number
  newDecision: InvestmentDecision
  change: number
}

export function runWhatIfAnalysis(
  currentScore: TotalScore
): WhatIfScenario[] {
  const scenarios: WhatIfScenario[] = []

  // Scenario 1: Best case (all scores +20%)
  const bestCaseScore = Math.min(27, Math.round(currentScore * 1.2))
  scenarios.push({
    name: 'กรณีที่ดีที่สุด',
    description: 'ทุกหมวดได้คะแนนสูงขึ้น 20%',
    adjustedScore: bestCaseScore,
    newDecision: determineDecision(bestCaseScore),
    change: bestCaseScore - currentScore,
  })

  // Scenario 2: Worst case (all scores -20%)
  const worstCaseScore = Math.max(0, Math.round(currentScore * 0.8))
  scenarios.push({
    name: 'กรณีที่แย่ที่สุด',
    description: 'ทุกหมวดได้คะแนนลดลง 20%',
    adjustedScore: worstCaseScore,
    newDecision: determineDecision(worstCaseScore),
    change: worstCaseScore - currentScore,
  })

  // Scenario 3: Technical improves
  const techImprovedScore = Math.min(27, currentScore + 3)
  scenarios.push({
    name: 'เทคนิคดีขึ้น',
    description: 'สัญญาณเทคนิคดีขึ้น เข้าใกล้แนวรับ',
    adjustedScore: techImprovedScore,
    newDecision: determineDecision(techImprovedScore),
    change: techImprovedScore - currentScore,
  })

  // Scenario 4: Catalyst occurs
  const catalystScore = Math.min(27, currentScore + 2)
  scenarios.push({
    name: 'มีเหตุการณ์เป็นบวก',
    description: 'มีเหตุการณ์สำคัญที่เป็นบวก',
    adjustedScore: catalystScore,
    newDecision: determineDecision(catalystScore),
    change: catalystScore - currentScore,
  })

  return scenarios
}

/**
 * Determine decision from score
 */
function determineDecision(score: number): InvestmentDecision {
  if (score >= DECISION_THRESHOLDS.BUY) return 'BUY'
  if (score >= DECISION_THRESHOLDS.HOLD) return 'HOLD'
  return 'PASS'
}
