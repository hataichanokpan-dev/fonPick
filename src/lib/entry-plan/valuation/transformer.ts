/**
 * Valuation Transformer
 *
 * Transforms raw Alpha API response into enhanced ValuationTargetsV2
 * with quality metadata, fallback calculations, and derived values
 */

import type { AlphaAPIResponse } from '@/components/stock/screening/types'

// ============================================================================
// QUALITY VALUE WRAPPER
// ============================================================================

/**
 * Wraps a value with quality metadata
 * T = actual value type (number, string, etc.)
 */
export interface QualityValue<T> {
  value: T | null
  source: 'api' | 'calculated' | 'estimated' | 'missing'
  confidence?: number // 0-1
  reliability?: 'high' | 'medium' | 'low'
}

/**
 * Create a quality value from API
 */
function createApiValue<T>(value: T | null): QualityValue<T> {
  return {
    value,
    source: value !== null ? 'api' : 'missing',
    confidence: 1.0,
    reliability: 'high',
  }
}

/**
 * Create a calculated quality value
 */
export function createCalculatedValue<T>(
  value: T,
  source: 'calculated' | 'estimated',
  confidence = 0.8,
  reliability: 'medium' = 'medium'
): QualityValue<T> {
  return {
    value,
    source,
    confidence,
    reliability,
  }
}

/**
 * Create an estimated value from fallback
 */
export function createEstimatedValue<T>(
  value: T,
  confidence = 0.5,
  reliability: 'low' = 'low'
): QualityValue<T> {
  return {
    value,
    source: 'estimated',
    confidence,
    reliability,
  }
}

/**
 * Create missing value indicator
 */
function createMissingValue(): QualityValue<number> {
  return {
    value: null,
    source: 'missing',
    confidence: 0,
    reliability: 'low',
  }
}

// ============================================================================
// VALUATION TARGETS V2
// ============================================================================

/**
 * Enhanced ValuationTargets with quality metadata
 */
export interface ValuationTargetsV2 {
  intrinsicValue: QualityValue<number>
  lowForecast: QualityValue<number>
  avgForecast: QualityValue<number>  // PRIMARY - required
  highForecast: QualityValue<number>
  dcfValue: QualityValue<number>
  relativeValue?: QualityValue<number>

  // Derived values (when source data is missing)
  derivedValues?: {
    intrinsicValueEst?: number
    avgForecastEst?: number
  }

  // Overall quality assessment
  quality: {
    level: 'complete' | 'partial' | 'limited' | 'insufficient'
    score: number // 0-100
    missingFields: string[]
  }
}

/**
 * Quality level for valuation data
 */
export type ValuationQualityLevel =
  | 'complete'    // All 6 metrics available
  | 'partial'     // 4-5 metrics available
  | 'limited'     // 2-3 metrics available
  | 'insufficient' // 0-1 metrics available (only avgForecast)

// ============================================================================
// TRANSFORM FUNCTION
// ============================================================================

/**
 * Transform Alpha API response to ValuationTargetsV2
 */
export function transformToValuationTargetsV2(
  apiResponse: AlphaAPIResponse | null,
  currentPrice?: number | null
): ValuationTargetsV2 {
  // Default empty response
  if (!apiResponse?.success || !apiResponse.data) {
    return createEmptyValuation()
  }

  const { data } = apiResponse
  const currentPriceValue = currentPrice ?? null

  // Build quality values from API
  const intrinsicValue = createApiValue(data.IntrinsicValue ?? null)
  const lowForecast = createApiValue(data.LowForecast ?? null)
  const avgForecast = createApiValue(data.AvgForecast ?? null)
  const highForecast = createApiValue(data.HighForecast ?? null)
  const dcfValue = createApiValue(data.DCFValue ?? null)
  const relativeValue = data.RelativeValue
    ? createApiValue(data.RelativeValue)
    : undefined

  // Calculate derived values for missing data
  const derivedValues = calculateDerivedValues(
    { intrinsicValue, avgForecast, dcfValue },
    currentPriceValue
  )

  // Calculate quality assessment
  const quality = assessValuationQuality({
    hasIntrinsic: intrinsicValue.value !== null,
    hasLowForecast: lowForecast.value !== null,
    hasAvgForecast: avgForecast.value !== null,
    hasHighForecast: highForecast.value !== null,
    hasDcf: dcfValue.value !== null,
    hasRelative: relativeValue?.value !== undefined,
  })

  return {
    intrinsicValue,
    lowForecast,
    avgForecast,
    highForecast,
    dcfValue,
    relativeValue,
    derivedValues,
    quality,
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate derived values when source data is missing
 */
function calculateDerivedValues(
  available: {
    intrinsicValue: QualityValue<number>
    avgForecast: QualityValue<number>
    dcfValue: QualityValue<number>
  },
  currentPrice: number | null
): ValuationTargetsV2['derivedValues'] {
  const derived: ValuationTargetsV2['derivedValues'] = {}

  // Extract values for cleaner code
  const intrinsicValue = available.intrinsicValue
  const avgForecast = available.avgForecast
  const dcfValue = available.dcfValue

  // Fallback 1: IntrinsicValue from DCF (IV typically 10-15% above DCF)
  if (intrinsicValue.value === null && dcfValue.value !== null) {
    derived.intrinsicValueEst = dcfValue.value * 1.1
  }

  // Fallback 2: AvgForecast from DCF (analysts typically 7% below DCF)
  if (avgForecast.value === null && dcfValue.value !== null) {
    derived.avgForecastEst = dcfValue.value * 0.93
  }

  // Fallback 3: If neither available, estimate from current price
  if (intrinsicValue.value === null && avgForecast.value === null && dcfValue.value === null && currentPrice) {
    derived.intrinsicValueEst = currentPrice * 1.08 // 8% premium
    derived.avgForecastEst = currentPrice * 1.12 // 12% premium
  }

  // If no derived values calculated, return undefined
  if (Object.keys(derived).length === 0) {
    return undefined
  }

  return derived
}

/**
 * Assess overall quality of valuation data
 */
function assessValuationQuality(
  available: {
    hasIntrinsic: boolean
    hasLowForecast: boolean
    hasAvgForecast: boolean
    hasHighForecast: boolean
    hasDcf: boolean
    hasRelative: boolean
  }
): ValuationTargetsV2['quality'] {
  let score = 100
  const missingFields: string[] = []

  // AvgForecast is REQUIRED (lose 50 points if missing)
  if (!available.hasAvgForecast) {
    score -= 50
    missingFields.push('avgForecast')
  }

  // IntrinsicValue is HIGH priority (lose 15 points if missing)
  if (!available.hasIntrinsic) {
    score -= 15
    missingFields.push('intrinsicValue')
  }

  // DCFValue is HIGH priority (lose 15 points if missing)
  if (!available.hasDcf) {
    score -= 15
    missingFields.push('dcfValue')
  }

  // HighForecast is MEDIUM priority (lose 8 points if missing)
  if (!available.hasHighForecast) {
    score -= 8
    missingFields.push('highForecast')
  }

  // LowForecast is LOW priority (lose 4 points if missing)
  if (!available.hasLowForecast) {
    score -= 4
    missingFields.push('lowForecast')
  }

  // RelativeValue is LOWEST priority (lose 2 points if missing)
  if (!available.hasRelative) {
    score -= 2
  }

  let level: ValuationQualityLevel

  if (score >= 90) {
    level = 'complete'
  } else if (score >= 70) {
    level = 'partial'
  } else if (score >= 50) {
    level = 'limited'
  } else {
    level = 'insufficient'
  }

  return {
    level,
    score: Math.max(0, score),
    missingFields,
  }
}

/**
 * Create empty valuation when no data available
 */
function createEmptyValuation(): ValuationTargetsV2 {
  return {
    intrinsicValue: createMissingValue(),
    lowForecast: createMissingValue(),
    avgForecast: createMissingValue(),
    highForecast: createMissingValue(),
    dcfValue: createMissingValue(),
    relativeValue: undefined,
    quality: {
      level: 'insufficient',
      score: 0,
      missingFields: ['avgForecast'],
    },
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Extract actual value from QualityValue wrapper
 */
export function getValuationValue<T>(qualityValue: QualityValue<T>): T | null {
  return qualityValue.value
}

/**
 * Check if valuation has sufficient data for entry plan
 */
export function hasSufficientValuation(v2: ValuationTargetsV2): boolean {
  // At minimum, we need avgForecast
  return v2.avgForecast.value !== null && v2.avgForecast.value !== undefined
}

/**
 * Get primary target price (AvgForecast) with fallback
 */
export function getPrimaryTarget(v2: ValuationTargetsV2): number | null {
  const avg = v2.avgForecast.value ?? v2.derivedValues?.avgForecastEst
  return avg ?? null
}

/**
 * Get formatted target percentage from buy price
 */
export function getTargetPercentage(
  v2: ValuationTargetsV2,
  buyPrice: number,
  locale: 'en' | 'th' = 'th'
): string {
  const target = getPrimaryTarget(v2)
  if (target === null || buyPrice === null) return 'N/A'

  const pct = ((target - buyPrice) / buyPrice) * 100
  const sign = pct >= 0 ? '+' : ''

  if (locale === 'th') {
    return `${sign}${pct.toFixed(1)}%`
  }
  return `${sign}${pct.toFixed(1)}%`
}
