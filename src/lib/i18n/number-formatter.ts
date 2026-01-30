/**
 * NumberFormatter - Bilingual Number Formatting (Thai/English)
 *
 * A comprehensive number formatting utility that supports both Thai and English locales.
 * Provides formatting for numbers, currency, percentages, and volumes with locale-aware
 * symbols and unit suffixes.
 *
 * @example
 * ```typescript
 * const formatterEn = new NumberFormatter('en')
 * formatterEn.formatCurrency(1500000) // "THB 1.50M"
 *
 * const formatterTh = new NumberFormatter('th')
 * formatterTh.formatCurrency(1500000) // "฿1.50M"
 * ```
 *
 * @see ADR-001 for design decisions
 */

// ============================================================================
// TYPES
// ============================================================================

export type Locale = 'en' | 'th'
export type NumberSuffix = '' | 'K' | 'M' | 'B' | 'T'

/**
 * Threshold suffixes for short number formatting
 */
const SUFFIX_THRESHOLDS: { value: number; suffix: NumberSuffix }[] = [
  { value: 1_000_000_000_000, suffix: 'T' },
  { value: 1_000_000_000, suffix: 'B' },
  { value: 1_000_000, suffix: 'M' },
  { value: 1_000, suffix: 'K' },
]

// ============================================================================
// NUMBER FORMATTER CLASS
// ============================================================================

/**
 * NumberFormatter class for bilingual number formatting
 *
 * Supports:
 * - Basic number formatting with thousand separators
 * - Short number format with K/M/B/T suffixes
 * - Currency formatting with locale-aware symbols (THB/฿)
 * - Percentage formatting with +/- signs
 * - Volume formatting with locale-aware unit suffixes (shares/หุ้น)
 */
export class NumberFormatter {
  private readonly locale: string

  /**
   * Create a new NumberFormatter instance
   * @param locale - 'en' for English, 'th' for Thai (default: 'en')
   */
  constructor(locale: Locale = 'en') {
    this.locale = locale === 'th' ? 'th-TH' : 'en-US'
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  /**
   * Get the appropriate volume unit for the current locale
   * @param count - Number of items (for singular/plural in English)
   * @returns The volume unit string
   */
  private getVolumeUnit(count: number): string {
    if (this.locale === 'th-TH') {
      return 'หุ้น'
    }
    return Math.abs(count) === 1 ? 'share' : 'shares'
  }

  /**
   * Get the currency prefix for the current locale
   * @returns The currency prefix string
   */
  private getCurrencyPrefix(): string {
    return this.locale === 'th-TH' ? '฿' : 'THB '
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Format a number with thousand separators
   *
   * @param value - The number to format
   * @param decimals - Number of decimal places (default: 2)
   * @returns Formatted number string or "N/A" for NaN
   *
   * @example
   * ```typescript
   * formatter.formatNumber(1234.56) // "1,234.56"
   * formatter.formatNumber(1234.56, 0) // "1,235"
   * formatter.formatNumber(0) // "0.00"
   * formatter.formatNumber(-1234.56) // "-1,234.56"
   * ```
   */
  formatNumber(value: number, decimals: number = 2): string {
    if (Number.isNaN(value)) {
      return 'N/A'
    }

    if (!Number.isFinite(value)) {
      return value > 0 ? 'Infinity' : '-Infinity'
    }

    return new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }

  /**
   * Format a number with short suffix (K/M/B/T)
   *
   * Uses compact representation for large numbers without thousand separators
   * for cleaner display in UI components.
   *
   * @param value - The number to format
   * @param decimals - Number of decimal places (default: 2)
   * @returns Formatted number with suffix or "N/A" for NaN
   *
   * @example
   * ```typescript
   * formatter.formatShort(1500) // "1.50K"
   * formatter.formatShort(1500000) // "1.50M"
   * formatter.formatShort(1500000000) // "1.50B"
   * formatter.formatShort(1500000000000) // "1.50T"
   * formatter.formatShort(999) // "999.00"
   * ```
   */
  formatShort(value: number, decimals: number = 2): string {
    if (Number.isNaN(value)) {
      return 'N/A'
    }

    if (!Number.isFinite(value)) {
      return value > 0 ? 'Infinity' : '-Infinity'
    }

    const absValue = Math.abs(value)

    // Find appropriate suffix based on thresholds
    const match = SUFFIX_THRESHOLDS.find(
      (threshold) => absValue >= threshold.value
    )

    if (match) {
      const { value: divisor, suffix } = match
      const scaled = value / divisor

      // Format without thousand separators for clean short format
      const formatted = scaled.toLocaleString(this.locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: false,
      })

      return `${formatted}${suffix}`
    }

    // No suffix needed (< 1000), format as regular number
    return value.toLocaleString(this.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: false,
    })
  }

  /**
   * Format a currency value with locale-aware symbol and short suffix
   *
   * Thai locale uses ฿ prefix, English uses THB prefix.
   * Values are formatted using short suffix format (K/M/B/T).
   *
   * @param value - The currency value to format
   * @returns Formatted currency string
   *
   * @example
   * ```typescript
   * // English locale
   * formatter.formatCurrency(1500000) // "THB 1.50M"
   * formatter.formatCurrency(1500) // "THB 1.50K"
   * formatter.formatCurrency(999) // "THB 999.00"
   *
   * // Thai locale
   * formatter.formatCurrency(1500000) // "฿1.50M"
   * formatter.formatCurrency(1500) // "฿1.50K"
   * ```
   */
  formatCurrency(value: number): string {
    if (Number.isNaN(value)) {
      const prefix = this.getCurrencyPrefix()
      return `${prefix}N/A`
    }

    const shortValue = this.formatShort(value)
    const prefix = this.getCurrencyPrefix()

    return `${prefix}${shortValue}`
  }

  /**
   * Format a percentage value with +/- sign
   *
   * Always includes sign for clarity (positive values get + prefix).
   * Uses formatNumber internally for proper locale-aware formatting.
   *
   * @param value - The percentage value to format
   * @param decimals - Number of decimal places (default: 2)
   * @returns Formatted percentage string with sign
   *
   * @example
   * ```typescript
   * formatter.formatPercentage(2.35) // "+2.35%"
   * formatter.formatPercentage(-1.50) // "-1.50%"
   * formatter.formatPercentage(0) // "0.00%"
   * formatter.formatPercentage(1234.56) // "+1,234.56%"
   * ```
   */
  formatPercentage(value: number, decimals: number = 2): string {
    if (Number.isNaN(value)) {
      return 'N/A'
    }

    if (!Number.isFinite(value)) {
      const sign = value > 0 ? '+' : ''
      return `${sign}${value}%`
    }

    const formatted = this.formatNumber(value, decimals)
    const sign = value > 0 ? '+' : ''

    return `${sign}${formatted}%`
  }

  /**
   * Format a volume value with locale-aware unit suffix
   *
   * Thai locale uses "หุ้น" (shares), English uses "share" or "shares".
   * Small values (< 1000) are shown without decimals.
   * Large values use short suffix format (K/M/B).
   *
   * @param value - The volume to format (number of shares)
   * @returns Formatted volume string with unit
   *
   * @example
   * ```typescript
   * // English locale
   * formatter.formatVolume(1500000) // "1.50M shares"
   * formatter.formatVolume(1500) // "1.50K shares"
   * formatter.formatVolume(999) // "999 shares"
   * formatter.formatVolume(1) // "1 share"
   *
   * // Thai locale
   * formatter.formatVolume(1500000) // "1.50M หุ้น"
   * formatter.formatVolume(999) // "999 หุ้น"
   * formatter.formatVolume(1) // "1 หุ้น"
   * ```
   */
  formatVolume(value: number): string {
    if (Number.isNaN(value)) {
      return `N/A ${this.getVolumeUnit(2)}`
    }

    const absValue = Math.abs(value)

    // For small values (< 1000), display as integer without decimals
    if (absValue < 1000 && Number.isInteger(value)) {
      return `${value} ${this.getVolumeUnit(value)}`
    }

    // For larger values, use short suffix format
    const shortValue = this.formatShort(value)
    const unit = this.getVolumeUnit(value)

    return `${shortValue} ${unit}`
  }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Default formatter instances for convenience
 *
 * @example
 * ```typescript
 * import { formatterEn, formatterTh } from './number-formatter'
 *
 * formatterEn.formatCurrency(1500000) // "THB 1.50M"
 * formatterTh.formatCurrency(1500000) // "฿1.50M"
 * ```
 */
export const formatterEn = new NumberFormatter('en')
export const formatterTh = new NumberFormatter('th')
