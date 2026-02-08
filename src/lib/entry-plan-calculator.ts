/**
 * Entry Plan Calculator
 *
 * Hybrid calculation functions for stock entry plans
 * combining both Technical and Value perspectives
 */

import { formatterTh } from '@/lib/i18n/number-formatter'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Input data for entry plan calculation
 */
export interface EntryPlanInput {
  currentPrice: number | null
  support1?: number | null
  support2?: number | null
  resistance1?: number | null
  resistance2?: number | null
  rsi?: number | null
  atr?: number | null
  screeningScore?: number
  valuationTargets?: {
    intrinsicValue?: number | null
    avgForecast?: number | null
    highForecast?: number | null
    dcfValue?: number | null
  }
}

/**
 * Hybrid stop loss calculation result
 */
export interface HybridStopLossResult {
  technicalSL: number
  technicalSLRationale: string
  valueSL: number
  valueSLRationale: string
  finalSL: number
  finalSLRationale: string
  riskPercentage: number
}

/**
 * Hybrid target calculation result
 */
export interface HybridTargetResult {
  technicalTarget: number
  technicalTargetRationale: string
  valueTarget: number
  valueTargetRationale: string
  finalTarget: number
  finalTargetRationale: string
  rewardPercentage: number
}

/**
 * Position size calculation result
 */
export interface PositionSizeResult {
  percentage: number
  rationale: string
  riskAmount: number
}

/**
 * Complete entry plan calculation result
 */
export interface EntryPlanResult {
  buyAt: {
    price: number
    discountFromCurrent: number
    rationale: string
    technicalRationale?: string
    valueRationale?: string
  }
  stopLoss: {
    price: number
    percentageFromBuy: number
    rationale: string
    technicalSL: number
    valueSL: number
  }
  target: {
    price: number
    percentageFromBuy: number
    rationale: string
    technicalTarget: number
    valueTarget: number
  }
  positionSize: {
    percentage: number
    rationale: string
  }
  riskReward: {
    ratio: string
    riskAmount: number
    rewardAmount: number
  }
  timeHorizon: string
  signalAlignment: {
    technicalScore: number
    technicalMaxScore: number
    valueScore: number
    valueMaxScore: number
    status: 'strong' | 'partial' | 'conflict' | 'neutral'
    recommendation: string
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ENTRY_PLAN_DEFAULTS = {
  // Buy At
  BUY_PROXIMITY: 0.02, // 2% discount from current

  // Stop Loss
  STOP_LOSS_TECHNICAL_MARGIN: 0.02, // 2% below support
  STOP_LOSS_VALUE_MARGIN: 0.15, // 15% below intrinsic value
  STOP_LOSS_MAX_PCT: 0.15, // Max -15% from buy price

  // Target
  TARGET_TECHNICAL_MARGIN: 0.02, // 2% below resistance
  TARGET_TECHNICAL_WEIGHT: 0.4, // 40% weight
  TARGET_VALUE_WEIGHT: 0.6, // 60% weight

  // Position Size
  POSITION_SIZE_MAX: 0.20, // Max 20% of portfolio
  POSITION_SIZE_BASE: 0.05, // Base 5%
  POSITION_SIZE_RISK_PER_TRADE: 0.02, // 2% risk per trade

  // RSI Adjustment
  RSI_OVERBOUGHT: 70,
  RSI_OVERSOLD: 30,
  RSI_OVERBOUGHT_MULTIPLIER: 0.7, // Reduce size when overbought
  RSI_OVERSOLD_MULTIPLIER: 1.3, // Increase size when oversold

  // Screening Score
  SCORE_HIGH: 22, // 1.5x multiplier
  SCORE_MEDIUM: 18, // 1.0x multiplier
  SCORE_LOW: 14, // 0.5x multiplier
  SCORE_HIGH_MULTIPLIER: 1.5,
  SCORE_MEDIUM_MULTIPLIER: 1.0,
  SCORE_LOW_MULTIPLIER: 0.5,
} as const

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Check if we have enough data to show entry plan
 */
export function shouldShowEntryPlan(input: EntryPlanInput): boolean {
  // 1. Current price must be valid
  if (!input.currentPrice || input.currentPrice <= 0) {
    return false
  }

  // 2. Must have at least support OR resistance
  const hasTechnical = !!(
    (input.support1 && input.support1 > 0) ||
    (input.resistance1 && input.resistance1 > 0)
  )

  // 3. Must have at least one valuation target
  const hasValuation = !!(
    input.valuationTargets?.avgForecast ||
    input.valuationTargets?.intrinsicValue ||
    input.valuationTargets?.highForecast ||
    input.valuationTargets?.dcfValue
  )

  // 4. Need both technical and valuation data
  return hasTechnical && hasValuation
}

// ============================================================================
// STOP LOSS CALCULATION
// ============================================================================

/**
 * Calculate hybrid stop loss combining technical and value perspectives
 */
export function calculateHybridStopLoss(
  buyPrice: number,
  input: EntryPlanInput
): HybridStopLossResult {
  const {
    support1,
    valuationTargets,
  } = input

  // 1. Technical Stop Loss: Below support level
  const technicalSL = support1 && support1 > 0
    ? support1 * (1 - ENTRY_PLAN_DEFAULTS.STOP_LOSS_TECHNICAL_MARGIN)
    : buyPrice * 0.95 // Default: 5% below buy

  const technicalSLRationale = support1 && support1 > 0
    ? `ตัดขาดทอนหลังแนวรับ (${formatterTh.formatNumber(support1)})`
    : 'Stop loss ที่ -5% จากราคาซื้อ'

  // 2. Value-Based Stop Loss: Below intrinsic value with safety margin
  const intrinsicValue = valuationTargets?.intrinsicValue
  const valueSL = intrinsicValue && intrinsicValue > 0
    ? intrinsicValue * (1 - ENTRY_PLAN_DEFAULTS.STOP_LOSS_VALUE_MARGIN)
    : buyPrice * 0.85 // Default: 15% below buy

  const valueSLRationale = intrinsicValue && intrinsicValue > 0
    ? `Stop loss ที่ ${ENTRY_PLAN_DEFAULTS.STOP_LOSS_VALUE_MARGIN * 100}% ของมูลค่าตามหลักการ (${formatterTh.formatNumber(intrinsicValue)})`
    : 'Stop loss ที่ -15% จากราคาซื้อ'

  // 3. Final Stop Loss: Choose higher (more protective)
  let finalSL = Math.max(technicalSL, valueSL)

  // Cap at maximum loss percentage
  const maxSL = buyPrice * (1 - ENTRY_PLAN_DEFAULTS.STOP_LOSS_MAX_PCT)
  if (finalSL < maxSL) {
    finalSL = maxSL
  }

  // 4. Determine rationale
  let finalSLRationale = ''
  if (finalSL === technicalSL) {
    finalSLRationale = 'Technical Stop Loss: อิงแนวรับเป็นหลัก'
  } else {
    finalSLRationale = 'Value Stop Loss: อิงมูลค่าตามหลักการเป็นหลัก'
  }

  // 5. Calculate risk percentage
  const riskPercentage = ((buyPrice - finalSL) / buyPrice) * 100

  return {
    technicalSL,
    technicalSLRationale,
    valueSL,
    valueSLRationale,
    finalSL,
    finalSLRationale,
    riskPercentage,
  }
}

// ============================================================================
// TARGET CALCULATION
// ============================================================================

/**
 * Calculate hybrid target combining technical and value perspectives
 */
export function calculateHybridTarget(
  buyPrice: number,
  input: EntryPlanInput
): HybridTargetResult {
  const {
    resistance1,
    valuationTargets,
  } = input

  // 1. Technical Target: Below resistance level
  const technicalTarget = resistance1 && resistance1 > 0
    ? resistance1 * (1 - ENTRY_PLAN_DEFAULTS.TARGET_TECHNICAL_MARGIN)
    : buyPrice * 1.15 // Default: +15% from buy

  const technicalTargetRationale = resistance1 && resistance1 > 0
    ? `เป้าหมายก่อนแนวต้าน (${formatterTh.formatNumber(resistance1)})`
    : 'Target ที่ +15% จากราคาซื้อ'

  // 2. Value-Based Target: Average of available forecasts
  const valueTargets = [
    valuationTargets?.avgForecast,
    valuationTargets?.highForecast,
    valuationTargets?.dcfValue,
  ].filter((v): v is number => v !== null && v !== undefined && v > 0)

  const valueTarget = valueTargets.length > 0
    ? valueTargets.reduce((a, b) => a + b, 0) / valueTargets.length
    : buyPrice * 1.10 // Default: +10% from buy

  let valueTargetRationale = ''
  if (valuationTargets?.avgForecast) {
    valueTargetRationale = `เฉลี่ยของ Avg Forecast, High Forecast, และ DCF`
  } else if (valuationTargets?.highForecast) {
    valueTargetRationale = 'เฉลี่ยของ High Forecast และ DCF'
  } else if (valuationTargets?.dcfValue) {
    valueTargetRationale = 'DCF Value'
  } else {
    valueTargetRationale = 'Target ที่ +10% จากราคาซื้อ'
  }

  // 3. Final Target: Weighted average (40% technical + 60% value)
  const finalTarget = (technicalTarget * ENTRY_PLAN_DEFAULTS.TARGET_TECHNICAL_WEIGHT) +
                      (valueTarget * ENTRY_PLAN_DEFAULTS.TARGET_VALUE_WEIGHT)

  const finalTargetRationale = `Target แบบบูรณาการ: Technical ${ENTRY_PLAN_DEFAULTS.TARGET_TECHNICAL_WEIGHT * 100}% + Value ${ENTRY_PLAN_DEFAULTS.TARGET_VALUE_WEIGHT * 100}%`

  // 4. Calculate reward percentage
  const rewardPercentage = ((finalTarget - buyPrice) / buyPrice) * 100

  return {
    technicalTarget,
    technicalTargetRationale,
    valueTarget,
    valueTargetRationale,
    finalTarget,
    finalTargetRationale,
    rewardPercentage,
  }
}

// ============================================================================
// BUY AT CALCULATION
// ============================================================================

/**
 * Calculate recommended buy price
 */
export function calculateBuyAt(input: EntryPlanInput): {
  price: number
  discountFromCurrent: number
  rationale: string
} {
  const { currentPrice, support1, valuationTargets } = input

  if (!currentPrice || currentPrice <= 0) {
    throw new Error('Invalid current price')
  }

  // Default buy price: with discount from current
  let buyPrice = currentPrice * (1 - ENTRY_PLAN_DEFAULTS.BUY_PROXIMITY)
  let rationale = `ซื้อที่ราคา -${ENTRY_PLAN_DEFAULTS.BUY_PROXIMITY * 100}% จากราคาปัจจุบัน`

  // If price is near support, use support-based price
  if (support1 && support1 > 0 && support1 < currentPrice) {
    const distanceToSupport = (currentPrice - support1) / currentPrice
    if (distanceToSupport < 0.05) { // Within 5% of support
      buyPrice = support1
      rationale = `ซื้อที่แนวรับ (${formatterTh.formatNumber(support1)})`
    }
  }

  // Consider intrinsic value for value investors
  const intrinsicValue = valuationTargets?.intrinsicValue
  if (intrinsicValue && intrinsicValue > 0 && intrinsicValue < currentPrice) {
    const distanceToIV = (currentPrice - intrinsicValue) / currentPrice
    if (distanceToIV < 0.10) { // Within 10% of IV
      // Take average of support-based and IV-based
      buyPrice = (buyPrice + intrinsicValue) / 2
      rationale = `ซื้อที่ระดับแนวรับและมูลค่าตามหลักการ`
    }
  }

  const discountFromCurrent = ((currentPrice - buyPrice) / currentPrice) * 100

  return {
    price: buyPrice,
    discountFromCurrent,
    rationale,
  }
}

// ============================================================================
// POSITION SIZE CALCULATION
// ============================================================================

/**
 * Calculate recommended position size
 */
export function calculatePositionSize(
  buyPrice: number,
  stopLoss: number,
  input: EntryPlanInput
): PositionSizeResult {
  const { screeningScore = 0, rsi } = input

  // 1. Calculate risk percentage
  const riskPercentage = (buyPrice - stopLoss) / buyPrice

  // 2. Base position size from risk
  let positionSize = ENTRY_PLAN_DEFAULTS.POSITION_SIZE_BASE

  // 3. Adjust based on screening score
  let scoreMultiplier: number = ENTRY_PLAN_DEFAULTS.SCORE_MEDIUM_MULTIPLIER
  if (screeningScore >= ENTRY_PLAN_DEFAULTS.SCORE_HIGH) {
    scoreMultiplier = ENTRY_PLAN_DEFAULTS.SCORE_HIGH_MULTIPLIER
  } else if (screeningScore >= ENTRY_PLAN_DEFAULTS.SCORE_LOW) {
    scoreMultiplier = ENTRY_PLAN_DEFAULTS.SCORE_LOW_MULTIPLIER
  } else {
    scoreMultiplier = 0 // PASS
  }

  // 4. Adjust based on RSI
  let rsiMultiplier: number = 1.0
  if (rsi !== null && rsi !== undefined) {
    if (rsi < ENTRY_PLAN_DEFAULTS.RSI_OVERSOLD) {
      rsiMultiplier = ENTRY_PLAN_DEFAULTS.RSI_OVERSOLD_MULTIPLIER
    } else if (rsi > ENTRY_PLAN_DEFAULTS.RSI_OVERBOUGHT) {
      rsiMultiplier = ENTRY_PLAN_DEFAULTS.RSI_OVERBOUGHT_MULTIPLIER
    }
  }

  // 5. Calculate final position size
  const finalPercentage = Math.min(
    positionSize * scoreMultiplier * rsiMultiplier,
    ENTRY_PLAN_DEFAULTS.POSITION_SIZE_MAX
  )

  // 6. Build rationale
  const rationaleParts: string[] = []

  if (scoreMultiplier >= ENTRY_PLAN_DEFAULTS.SCORE_HIGH_MULTIPLIER) {
    rationaleParts.push('Score สูง เพิ่มขนาด')
  } else if (scoreMultiplier <= ENTRY_PLAN_DEFAULTS.SCORE_LOW_MULTIPLIER) {
    rationaleParts.push('Score ปานกลาง ลดขนาด')
  }

  if (rsiMultiplier > 1.0) {
    rationaleParts.push('RSI Oversold โอกาสเข้าซื้อดี')
  } else if (rsiMultiplier < 1.0) {
    rationaleParts.push('RSI Overbought ระวังความเสี่ยง')
  }

  if (riskPercentage > 0.10) {
    rationaleParts.push('Risk สูง ลดขนาด')
  }

  const rationale = rationaleParts.length > 0
    ? rationaleParts.join(', ')
    : 'ขนาดมาตรฐาน'

  return {
    percentage: finalPercentage,
    rationale,
    riskAmount: buyPrice * finalPercentage * riskPercentage,
  }
}

// ============================================================================
// SIGNAL ALIGNMENT
// ============================================================================

/**
 * Calculate signal alignment status
 */
export function calculateSignalAlignment(
  technicalScore: number,
  technicalMaxScore: number,
  valueScore: number,
  valueMaxScore: number
): {
  status: 'strong' | 'partial' | 'conflict' | 'neutral'
  recommendation: string
} {
  // Normalize scores to 0-5 scale (with zero division protection)
  const techNorm = technicalMaxScore > 0
    ? (technicalScore / technicalMaxScore) * 5
    : 0
  const valNorm = valueMaxScore > 0
    ? (valueScore / valueMaxScore) * 5
    : 0

  let status: 'strong' | 'partial' | 'conflict' | 'neutral'
  let recommendation = ''

  // Strong alignment: both >= 4
  if (techNorm >= 4 && valNorm >= 4) {
    status = 'strong'
    recommendation = 'BUY: ทั้งเทคนิคและมูลค่าส่งสัญญาณซื้อชัดเจน'
  }
  // Conflict: one >= 4, other <= 2
  else if ((techNorm >= 4 && valNorm <= 2) || (techNorm <= 2 && valNorm >= 4)) {
    status = 'conflict'
    if (techNorm >= 4) {
      recommendation = 'CAUTION: เทคนิคดีแต่มูลค่าแพง รอราคาดีกว่านี้'
    } else {
      recommendation = 'SPECULATIVE: มูลค่าดีแต่เทคนิคยังไม่แข็งแรง ใช้ความระมัดระวัง'
    }
  }
  // Partial alignment: at least one >= 3
  else if (techNorm >= 3 || valNorm >= 3) {
    status = 'partial'
    if (techNorm >= 3 && valNorm >= 3) {
      recommendation = 'CONSIDER: ทั้งสองมุมมองให้คะแนนปานกลาง ขยายขนาดพอสมควร'
    } else if (techNorm >= 3) {
      recommendation = 'WAIT FOR VALUE: เทคนิคดีแต่มูลค่าเฉยๆ รอราคาดีกว่า'
    } else {
      recommendation = 'ACCUMULATE: มูลค่าดี เก็บสะสมเมื่อราคาถูก'
    }
  }
  // Neutral: both <= 2
  else {
    status = 'neutral'
    recommendation = 'PASS: ทั้งเทคนิคและมูลค่าไม่น่าสนใจ'
  }

  return { status, recommendation }
}

// ============================================================================
// COMPLETE ENTRY PLAN CALCULATION
// ============================================================================

/**
 * Calculate complete entry plan
 */
export function calculateEntryPlan(
  input: EntryPlanInput
): EntryPlanResult | null {
  // Validate input
  if (!shouldShowEntryPlan(input)) {
    return null
  }

  // 1. Calculate buy price
  const buyAt = calculateBuyAt(input)

  // 2. Calculate stop loss
  const stopLossCalc = calculateHybridStopLoss(buyAt.price, input)

  // 3. Calculate target
  const targetCalc = calculateHybridTarget(buyAt.price, input)

  // 4. Calculate position size
  const positionSize = calculatePositionSize(buyAt.price, stopLossCalc.finalSL, input)

  // 5. Calculate risk/reward
  const riskAmount = buyAt.price - stopLossCalc.finalSL
  const rewardAmount = targetCalc.finalTarget - buyAt.price
  const ratio = rewardAmount / riskAmount

  // 6. Time horizon based on position size and risk/reward
  let timeHorizon = '3-6 เดือน'
  if (ratio > 3) {
    timeHorizon = '6-12 เดือน'
  } else if (ratio < 1.5) {
    timeHorizon = '1-3 เดือน'
  }

  // 7. Signal alignment (would be passed in from screening data)
  const signalAlignment = {
    technicalScore: 0,
    technicalMaxScore: 5,
    valueScore: 0,
    valueMaxScore: 5,
    status: 'neutral' as const,
    recommendation: 'รอข้อมูล screening',
  }

  return {
    buyAt: {
      price: buyAt.price,
      discountFromCurrent: buyAt.discountFromCurrent,
      rationale: buyAt.rationale,
    },
    stopLoss: {
      price: stopLossCalc.finalSL,
      percentageFromBuy: stopLossCalc.riskPercentage,
      rationale: stopLossCalc.finalSLRationale,
      technicalSL: stopLossCalc.technicalSL,
      valueSL: stopLossCalc.valueSL,
    },
    target: {
      price: targetCalc.finalTarget,
      percentageFromBuy: targetCalc.rewardPercentage,
      rationale: targetCalc.finalTargetRationale,
      technicalTarget: targetCalc.technicalTarget,
      valueTarget: targetCalc.valueTarget,
    },
    positionSize: {
      percentage: positionSize.percentage,
      rationale: positionSize.rationale,
    },
    riskReward: {
      ratio: `1:${ratio.toFixed(1)}`,
      riskAmount,
      rewardAmount,
    },
    timeHorizon,
    signalAlignment,
  }
}
