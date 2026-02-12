/**
 * Data Quality System for Entry Plan
 *
 * Provides type-safe data quality assessment with visual indicators
 * and N/A handling for incomplete data scenarios.
 */

// ============================================================================
// DATA QUALITY TYPES
// ============================================================================

/**
 * Data quality level based on completeness
 * - complete: All required data available (80-100%)
 * - partial: Some data missing, using defaults (50-79%)
 * - limited: Critical data partially missing (30-49%)
 * - insufficient: Cannot generate reliable plan (< 30%)
 */
export type DataQualityLevel = 'complete' | 'partial' | 'limited' | 'insufficient'

/**
 * Data field status for individual metrics
 */
export type DataFieldStatus = 'available' | 'estimated' | 'missing'

/**
 * Quality assessment result with actionable info
 */
export interface DataQualityAssessment {
  level: DataQualityLevel
  score: number // 0-100
  missingRequired: string[]
  missingOptional: string[]
  estimatedFields: string[]
  canShowEntryPlan: boolean
  confidence: number // 0-1
}

/**
 * Data field with quality metadata
 */
export interface QualityDataField<T> {
  status: DataFieldStatus
  value: T | null
  estimated?: boolean
  reason?: string
  fallbackUsed?: boolean
}

// ============================================================================
// FIELD DEFINITIONS
// ============================================================================

/**
 * Required fields for entry plan calculation
 */
export const REQUIRED_FIELDS = {
  currentPrice: 'currentPrice',
  // At least one technical level
  support1: 'support1',
  resistance1: 'resistance1',
  // At least one valuation target
  avgForecast: 'avgForecast',
  intrinsicValue: 'intrinsicValue',
} as const

/**
 * Optional fields that enhance quality
 */
export const OPTIONAL_FIELDS = {
  rsi: 'rsi',
  atr: 'atr',
  dcfValue: 'dcfValue',
  highForecast: 'highForecast',
  lowForecast: 'lowForecast',
  relativeValue: 'relativeValue',
  support2: 'support2',
  resistance2: 'resistance2',
} as const

/**
 * All field names for error messages
 */
export const FIELD_NAMES: Record<string, { en: string; th: string }> = {
  currentPrice: { en: 'Current Price', th: 'ราคาปัจจุบัน' },
  support1: { en: 'Support Level 1', th: 'แนวรับ 1' },
  support2: { en: 'Support Level 2', th: 'แนวรับ 2' },
  resistance1: { en: 'Resistance Level 1', th: 'แนวต้าน 1' },
  resistance2: { en: 'Resistance Level 2', th: 'แนวต้าน 2' },
  rsi: { en: 'RSI Indicator', th: 'ดัชนี RSI' },
  atr: { en: 'Average True Range', th: 'ATR' },
  avgForecast: { en: 'Average Forecast', th: 'คาดการณ์ราคาเฉลี่ย' },
  intrinsicValue: { en: 'Intrinsic Value', th: 'มูลค่าตามหลักการ' },
  dcfValue: { en: 'DCF Value', th: 'มูลค่า DCF' },
  highForecast: { en: 'High Forecast', th: 'คาดการณ์ราคาสูงสุด' },
  lowForecast: { en: 'Low Forecast', th: 'คาดการณ์ราคาต่ำสุด' },
  relativeValue: { en: 'Relative Value', th: 'มูลค่าสัมพันธ์' },
}

// ============================================================================
// DATA QUALITY CALCULATOR
// ============================================================================

/**
 * Input data for quality assessment
 */
export interface DataQualityInput {
  currentPrice?: number | null
  technical?: {
    support1?: number | null
    support2?: number | null
    resistance1?: number | null
    resistance2?: number | null
    rsi?: number | null
    atr?: number | null
  }
  valuation?: {
    avgForecast?: number | null
    intrinsicValue?: number | null
    dcfValue?: number | null
    highForecast?: number | null
    lowForecast?: number | null
    relativeValue?: number | null
  }
}

/**
 * Calculate data quality score and assessment
 */
export function calculateDataQuality(input: DataQualityInput): DataQualityAssessment {
  const missingRequired: string[] = []
  const missingOptional: string[] = []
  const estimatedFields: string[] = []

  let score = 100

  // Check current price (CRITICAL - weight 25)
  if (!input.currentPrice || input.currentPrice <= 0) {
    score -= 25
    missingRequired.push('currentPrice')
  }

  // Check technical levels (CRITICAL - at least one needed, weight 20)
  const hasSupport = !!(input.technical?.support1 && input.technical.support1 > 0)
  const hasResistance = !!(input.technical?.resistance1 && input.technical.resistance1 > 0)
  const hasTechnical = hasSupport || hasResistance

  if (!hasTechnical && !input.technical?.rsi) {
    score -= 20
    missingRequired.push('support1', 'resistance1')
  } else if (!hasSupport) {
    missingOptional.push('support1')
  }
  if (!hasResistance) {
    missingOptional.push('resistance1')
  }

  // Check valuation targets (CRITICAL - at least one needed, weight 25)
  const hasValuation = !!(
    input.valuation?.avgForecast ||
    input.valuation?.intrinsicValue ||
    input.valuation?.highForecast ||
    input.valuation?.dcfValue
  )

  if (!hasValuation) {
    score -= 25
    missingRequired.push('avgForecast')
  }

  // Optional technical indicators (weight 10 each)
  if (!input.technical?.rsi) {
    score -= 10
    missingOptional.push('rsi')
  }
  if (!input.technical?.atr) {
    score -= 5
    missingOptional.push('atr')
  }

  // Optional valuation targets (weight 5 each)
  if (!input.valuation?.dcfValue) {
    score -= 5
    missingOptional.push('dcfValue')
  }
  if (!input.valuation?.intrinsicValue) {
    score -= 5
    missingOptional.push('intrinsicValue')
  }
  if (!input.valuation?.highForecast) {
    score -= 5
    missingOptional.push('highForecast')
  }
  if (!input.valuation?.lowForecast) {
    score -= 3
    missingOptional.push('lowForecast')
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score)

  // Determine quality level
  const level: DataQualityLevel = score >= 80 ? 'complete' : score >= 50 ? 'partial' : score >= 30 ? 'limited' : 'insufficient'

  // Calculate confidence (0-1 scale)
  const confidence = score / 100

  // Can show entry plan?
  const canShowEntryPlan = score >= 30

  return {
    level,
    score,
    missingRequired,
    missingOptional,
    estimatedFields,
    canShowEntryPlan,
    confidence,
  }
}

// ============================================================================
// QUALITY FIELD HELPERS
// ============================================================================

/**
 * Create a quality data field
 */
export function createQualityField<T>(
  value: T | null | undefined,
  options: {
    estimated?: boolean
    reason?: string
    fallback?: T
  } = {}
): QualityDataField<T> {
  const { estimated = false, reason, fallback } = options

  if (value !== null && value !== undefined) {
    return {
      status: estimated ? 'estimated' : 'available',
      value,
      estimated,
      reason: estimated ? reason : undefined,
    }
  }

  if (fallback !== undefined) {
    return {
      status: 'estimated',
      value: fallback,
      estimated: true,
      reason: reason ?? 'Using fallback value',
      fallbackUsed: true,
    }
  }

  return {
    status: 'missing',
    value: null,
    reason: reason ?? 'Data not available',
  }
}

/**
 * Get value from quality field with fallback
 */
export function getQualityValue<T>(field: QualityDataField<T>, fallback: T): T {
  return field.value ?? fallback
}

/**
 * Check if quality field is available (not missing)
 */
export function isQualityFieldAvailable<T>(field: QualityDataField<T>): boolean {
  return field.status !== 'missing' && field.value !== null
}

// ============================================================================
// VISUAL CONFIG
// ============================================================================

/**
 * Visual config for each quality level
 */
export const QUALITY_CONFIG = {
  complete: {
    color: 'emerald' as const,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-500',
    icon: 'CheckCircle' as const,
    label: { en: 'Complete Data', th: 'ข้อมูลครบถ้วน' },
    description: {
      en: 'All critical data available for accurate calculation',
      th: 'ข้อมูลสำคัญครบถ้วนสำหรับการคำนวณที่แม่นยำ',
    },
  },
  partial: {
    color: 'amber' as const,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-500',
    icon: 'AlertTriangle' as const,
    label: { en: 'Partial Data', th: 'ข้อมูลบางส่วน' },
    description: {
      en: 'Some data missing, using estimates where needed',
      th: 'ข้อมูลบางส่วนหายไป ใช้ค่าประมาณในบางจุด',
    },
  },
  limited: {
    color: 'orange' as const,
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-500',
    icon: 'AlertCircle' as const,
    label: { en: 'Limited Data', th: 'ข้อมูลจำกัด' },
    description: {
      en: 'Critical data partially missing, reduce position size',
      th: 'ข้อมูลสำคัญบางส่วนขาดหาย ควรลดขนาดการถือ',
    },
  },
  insufficient: {
    color: 'red' as const,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-500',
    icon: 'XCircle' as const,
    label: { en: 'Insufficient Data', th: 'ข้อมูลไม่เพียงพอ' },
    description: {
      en: 'Cannot generate reliable entry plan',
      th: 'ไม่สามารถคำนวณแผนการเข้าซื้อที่เชื่อถือได้',
    },
  },
} as const

/**
 * N/A display patterns
 */
export const NA_PATTERNS = {
  grayed: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-500',
    display: '—',
  },
  dashed: {
    border: 'border-dashed border-gray-500/30',
    display: '—.—',
  },
  icon: {
    icon: 'HelpCircle',
    label: { en: 'N/A', th: 'ไม่ระบุ' },
  },
} as const

// ============================================================================
// RECOMMENDATION GENERATOR
// ============================================================================

/**
 * Generate user-facing message based on quality assessment
 */
export function getQualityMessage(
  assessment: DataQualityAssessment,
  locale: 'en' | 'th' = 'th'
): {
  title: string
  description: string
  action?: string
} {
  const config = QUALITY_CONFIG[assessment.level]

  const baseMessage = {
    title: config.label[locale],
    description: config.description[locale],
  }

  if (assessment.level === 'insufficient') {
    return {
      ...baseMessage,
      action: locale === 'th'
        ? 'รอข้อมูลเพิ่มเติมก่อนตัดสินใจ'
        : 'Wait for more data before deciding',
    }
  }

  if (assessment.level === 'limited') {
    return {
      ...baseMessage,
      action: locale === 'th'
        ? 'ลดขนาดการถือหรือรอข้อมูลเพิ่มเติม'
        : 'Reduce position size or wait for more data',
    }
  }

  if (assessment.level === 'partial') {
    const missingFields = assessment.missingRequired
      .map((f) => FIELD_NAMES[f]?.[locale] ?? f)
      .join(locale === 'th' ? ', ' : ', ')

    return {
      ...baseMessage,
      description: locale === 'th'
        ? `ข้อมูลที่ขาด: ${missingFields}`
        : `Missing: ${missingFields}`,
    }
  }

  return baseMessage
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for complete quality
 */
export function isCompleteQuality(assessment: DataQualityAssessment): assessment is DataQualityAssessment & { level: 'complete' } {
  return assessment.level === 'complete'
}

/**
 * Type guard for sufficient quality (can show entry plan)
 */
export function isSufficientQuality(assessment: DataQualityAssessment): boolean {
  return assessment.canShowEntryPlan
}

/**
 * Type guard for missing field
 */
export function isMissingField<T>(field: QualityDataField<T>): boolean {
  return field.status === 'missing'
}

// ============================================================================
// V2 INTEGRATION HELPERS
// ============================================================================

/**
 * Convert ValuationTargetsV2 to DataQualityInput format
 * Extracts values from QualityValue wrappers for quality assessment
 */
import type { ValuationTargetsV2 } from '@/lib/entry-plan/valuation/transformer'

export function v2ToDataQualityInput(
  v2: ValuationTargetsV2 | null | undefined,
  currentPrice?: number | null
): DataQualityInput {
  const result: DataQualityInput = {
    currentPrice: currentPrice ?? undefined,
    technical: undefined,
    valuation: {
      avgForecast: v2?.avgForecast.value ?? undefined,
      intrinsicValue: v2?.intrinsicValue.value ?? v2?.derivedValues?.intrinsicValueEst ?? undefined,
      dcfValue: v2?.dcfValue.value ?? undefined,
      highForecast: v2?.highForecast.value ?? undefined,
      lowForecast: v2?.lowForecast.value ?? undefined,
      relativeValue: v2?.relativeValue?.value ?? undefined,
    },
  }

  // Mark estimated fields
  if (v2?.derivedValues?.avgForecastEst) {
    result.valuation!.avgForecast = v2.derivedValues.avgForecastEst
  }
  if (v2?.derivedValues?.intrinsicValueEst) {
    result.valuation!.intrinsicValue = v2.derivedValues.intrinsicValueEst
  }

  return result
}

/**
 * Get human-readable source label for QualityValue
 */
export function getValueSourceLabel(
  source: 'api' | 'calculated' | 'estimated' | 'missing',
  locale: 'en' | 'th' = 'th'
): string {
  const labels = {
    api: { en: 'From API', th: 'จาก API' },
    calculated: { en: 'Calculated', th: 'คำนวณ' },
    estimated: { en: 'Estimated', th: 'ประมาณ' },
    missing: { en: 'Missing', th: 'ไม่ระบุ' },
  }
  return labels[source][locale]
}

/**
 * Check if a QualityValue should show estimated indicator
 */
export function shouldShowEstimated(value: { source?: string; value: any }): boolean {
  return value?.source === 'estimated' || value?.source === 'calculated'
}
