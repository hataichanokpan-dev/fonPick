/**
 * Screening System Constants
 *
 * Score thresholds, color mappings, and configuration for Practical Screening Sheet
 */

import type { ScoreColorClasses, LayerColor } from './types'

// ============================================================================
// SCORE THRESHOLDS
// ============================================================================

/**
 * Score thresholds for determining pass/fail/partial status
 */
export const SCORE_THRESHOLDS = {
  EXCELLENT: 9,    // 9-10 points
  GOOD: 7,         // 7-8 points
  FAIR: 5,         // 5-6 points
  POOR: 3,         // 3-4 points
  BAD: 0,          // 0-2 points
} as const

/**
 * Total score thresholds for investment decision
 */
export const DECISION_THRESHOLDS = {
  BUY: 18,    // >= 18/27 (67%)
  HOLD: 14,   // 14-17/27 (50-66%)
  PASS: 0,    // < 14/27 (<50%)
} as const

/**
 * Confidence thresholds based on score distribution
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 85,    // 85%+
  MEDIUM: 60,  // 60-84%
  LOW: 0,      // <60%
} as const

// ============================================================================
// LAYER 1: UNIVERSE THRESHOLDS
// ============================================================================

export const UNIVERSE_THRESHOLDS = {
  MARKET_CAP_MIN: 5_000_000_000,  // 5B THB
  VOLUME_DAILY_MIN: 5_000_000,     // 5M THB
} as const

// ============================================================================
// LAYER 2: QUALITY THRESHOLDS
// ============================================================================

export const QUALITY_THRESHOLDS = {
  PEG_MAX: 1.5,                    // < 1.5
  NPM_MIN: 0,                      // > sector avg (dynamic)
  ROE_MIN: 0,                      // > sector avg (dynamic)
  ROIC_WACC_MIN: 1.5,              // > 1.5
  DEBT_EQUITY_MAX: 2.0,            // < 2.0 (appropriate)
  FCF_YIELD_MIN: 0.03,             // > 3%
  OCF_NI_MIN: 1.0,                 // > 1.0
} as const

// Quality metric point allocations
export const QUALITY_POINTS = {
  PEG: 2,
  NPM: 2,
  ROE: 1,
  ROIC_WACC: 2,
  DEBT_EQUITY: 1,
  FCF_YIELD: 1,
  OCF_NI: 1,
} as const

// ============================================================================
// LAYER 3: VALUE + GROWTH THRESHOLDS
// ============================================================================

export const VALUE_THRESHOLDS = {
  PE_SD_GOOD: -1,                  // < -1 SD = cheap
  PE_SD_FAIR: 0,                   // 0 SD = fair
  PE_PB_MULTIPLIER: 1.25,          // PB < 1.25 * Fair PB
  DIV_YIELD_MIN: 0,                // > sector avg (dynamic)
  PFCF_MAX: 15,                    // < 15x
} as const

export const GROWTH_THRESHOLDS = {
  EPS_YOY_MIN: 0.10,               // > 10% YoY
  EPS_ACCEL_MIN: 0,                // Positive QoQ
} as const

// Value metric point allocations
export const VALUE_POINTS = {
  PE_BAND: 2,
  PB_FAIR: 1,
  DIV_YIELD: 1,
  PFCF: 1,
} as const

// Growth metric point allocations
export const GROWTH_POINTS = {
  EPS_YOY: 2,
  EPS_ACCEL: 2,
} as const

// ============================================================================
// LAYER 4: TECHNICAL + CATALYST THRESHOLDS
// ============================================================================

export const TECHNICAL_THRESHOLDS = {
  RSI_GOOD_MIN: 40,                // 40-60 = neutral
  RSI_GOOD_MAX: 60,
  SUPPORT_PROXIMITY_PCT: 0.05,     // Within 5% of support
} as const

// Technical metric point allocations
export const TECHNICAL_POINTS = {
  PRICE_VS_MA50: 1,
  RSI: 1,
  MACD: 1,
  SUPPORT: 2,
} as const

// Catalyst point allocations
export const CATALYST_POINTS = {
  HIGH_IMPACT_EVENT: 3,
  SECTOR_MOMENTUM: 1,
  SEASONALITY: 1,
} as const

// ============================================================================
// COLOR MAPPINGS
// ============================================================================

/**
 * Get color classes based on score
 */
export function getScoreColorClasses(score: number): ScoreColorClasses {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) {
    return {
      text: 'text-up-primary',
      bg: 'bg-up-soft',
      border: 'border-up-primary',
      progress: 'bg-up-primary',
    }
  }
  if (score >= SCORE_THRESHOLDS.GOOD) {
    return {
      text: 'text-up',
      bg: 'bg-up-soft',
      border: 'border-up-strong',
      progress: 'bg-up',
    }
  }
  if (score >= SCORE_THRESHOLDS.FAIR) {
    return {
      text: 'text-insight',
      bg: 'bg-insight/20',
      border: 'border-insight',
      progress: 'bg-insight',
    }
  }
  if (score >= SCORE_THRESHOLDS.POOR) {
    return {
      text: 'text-warn',
      bg: 'bg-warn/20',
      border: 'border-warn',
      progress: 'bg-warn',
    }
  }
  return {
    text: 'text-risk',
    bg: 'bg-risk/20',
    border: 'border-risk',
    progress: 'bg-risk',
  }
}

/**
 * Get color classes for layer
 */
export function getLayerColorClasses(layer: LayerColor): ScoreColorClasses {
  const layerColors: Record<LayerColor, ScoreColorClasses> = {
    quality: {
      text: 'text-accent-blue',
      bg: 'bg-info-soft',
      border: 'border-info',
      progress: 'bg-accent-blue',
    },
    value: {
      text: 'text-accent-teal',
      bg: 'bg-up-soft',
      border: 'border-up-primary',
      progress: 'bg-accent-teal',
    },
    technical: {
      text: 'text-accent-purple',
      bg: 'bg-accent-purple/10',
      border: 'border-accent-purple',
      progress: 'bg-accent-purple',
    },
    universe: {
      text: 'text-text-primary',
      bg: 'bg-surface-2',
      border: 'border-border',
      progress: 'bg-text-primary',
    },
  }
  return layerColors[layer]
}

/**
 * Decision badge gradient classes
 */
export const DECISION_GRADIENTS = {
  BUY: 'bg-gradient-success',
  HOLD: 'bg-gradient-insight',
  PASS: 'bg-gradient-danger',
} as const

/**
 * Decision text colors
 */
export const DECISION_TEXT_COLORS = {
  BUY: 'text-up-primary',
  HOLD: 'text-insight',
  PASS: 'text-risk',
} as const

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 600,
  VERY_SLOW: 1000,
} as const

// ============================================================================
// LAYER CONFIGURATION
// ============================================================================

/**
 * Layer metadata for UI
 */
export const LAYER_CONFIG = {
  1: {
    id: 'universe',
    title: 'UNIVERSE',
    thaiTitle: 'กรองพื้นฐาน',
    description: 'Basic eligibility filters',
    thaiDescription: 'เกณฑ์การคัดเลือกพื้นฐาน',
    color: 'universe' as LayerColor,
    maxScore: 2,
  },
  2: {
    id: 'quality',
    title: 'QUALITY',
    thaiTitle: 'คุณภาพ',
    description: 'Financial quality metrics',
    thaiDescription: 'ตัวชี้วัดคุณภาพทางการเงิน',
    color: 'quality' as LayerColor,
    maxScore: 10,
  },
  3: {
    id: 'valueGrowth',
    title: 'VALUE + GROWTH',
    thaiTitle: 'มูลค่าและการเติบโต',
    description: 'Valuation and growth metrics',
    thaiDescription: 'ตัวชี้วัดมูลค่าและการเติบโต',
    color: 'value' as LayerColor,
    maxScore: 10,
  },
  4: {
    id: 'technical',
    title: 'TECHNICAL + CATALYST',
    thaiTitle: 'เทคนิคและเหตุการณ์',
    description: 'Technical analysis and catalysts',
    thaiDescription: 'การวิเคราะห์เทคนิคและเหตุการณ์สำคัญ',
    color: 'technical' as LayerColor,
    maxScore: 10,
  },
} as const

// ============================================================================
// ENTRY PLAN DEFAULTS
// ============================================================================

/**
 * Default entry plan calculations
 */
export const ENTRY_PLAN_DEFAULTS = {
  BUY_PROXIMITY: 0.02,        // Buy at support + 2%
  STOP_LOSS_PCT: 0.12,        // Stop loss at -12% from buy
  TARGET_PCT_MIN: 0.20,       // Target at least +20% from buy
  TARGET_PCT_MAX: 0.25,       // Target at most +25% from buy
  POSITION_SIZE_MAX: 0.20,    // Max 20% of portfolio
} as const

// ============================================================================
// FORMATTING CONSTANTS
// ============================================================================

/**
 * Number formatting options
 */
export const FORMAT_OPTIONS = {
  CURRENCY: {
    style: 'currency' as const,
    currency: 'THB' as const,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  PERCENTAGE: {
    style: 'percent' as const,
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  },
  NUMBER: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
} as const

/**
 * Large number suffixes for formatting
 */
export const NUMBER_SUFFIXES = {
  BILLION: 'B',
  MILLION: 'M',
  THOUSAND: 'K',
} as const

/**
 * Large number thresholds
 */
export const NUMBER_THRESHOLDS = {
  BILLION: 1_000_000_000,
  MILLION: 1_000_000,
  THOUSAND: 1_000,
} as const

// ============================================================================
// SUPPORT/RESISTANCE CONSTANTS
// ============================================================================

/**
 * Support/Resistance calculation settings
 */
export const SUPPORT_RESISTANCE_CONFIG = {
  HISTORY_YEARS: 2,              // 2 years of price history
  PIVOT_POINT_PERIOD: 5,         // 5-period pivot points
  MIN_SWING_POINTS: 10,          // Minimum swing points to calculate
  PROXIMITY_THRESHOLD: 0.02,     // 2% proximity = near level
} as const

// ============================================================================
// CATALYST EVENT CONSTANTS
// ============================================================================

/**
 * Catalyst event configuration
 */
export const CATALYST_CONFIG = {
  UPCOMING_DAYS: 30,             // Show events within 30 days
  HIGH_IMPACT_DAYS: 7,           // High impact if within 7 days
  MEDIUM_IMPACT_DAYS: 14,        // Medium impact if within 14 days
} as const

// ============================================================================
// SEASONALITY CONSTANTS
// ============================================================================

/**
 * Seasonality patterns (Thai stock market)
 */
export const SEASONALITY_CONFIG = {
  FAVORABLE_MONTHS: [10, 11, 12, 1, 2] as number[],  // Oct-Feb (year-end, dividend season)
  UNFAVORABLE_MONTHS: [5, 6, 7, 8] as number[],      // May-Aug (summer, low volume)
} as const

/**
 * Check if current date is in favorable seasonality
 */
export function isFavorableSeasonality(date: Date = new Date()): boolean {
  const month = date.getMonth() + 1  // JavaScript months are 0-indexed
  return SEASONALITY_CONFIG.FAVORABLE_MONTHS.includes(month)
}

/**
 * Get seasonality status
 */
export function getSeasonalityStatus(date: Date = new Date()): 'favorable' | 'unfavorable' | 'neutral' {
  const month = date.getMonth() + 1
  if (SEASONALITY_CONFIG.FAVORABLE_MONTHS.includes(month)) return 'favorable'
  if (SEASONALITY_CONFIG.UNFAVORABLE_MONTHS.includes(month)) return 'unfavorable'
  return 'neutral'
}
