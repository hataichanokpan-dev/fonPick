/**
 * Formatting utilities
 * Now using locale-aware NumberFormatter
 */

import { formatterTh } from '@/lib/i18n'

/**
 * Safe number check - handles null, undefined, NaN
 * Returns true if value is a valid number
 */
function isValidNumber(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && !Number.isNaN(value)
}

/**
 * Format number with thousand separators (safe version)
 * Handles null, undefined, NaN - returns "N/A" for invalid values
 * @deprecated Use formatterTh.formatNumber() directly for locale awareness
 */
export function formatNumber(value: number | null | undefined, decimals: number = 2): string {
  if (!isValidNumber(value)) return 'N/A'
  return formatterTh.formatNumber(value, decimals)
}

/**
 * Format decimal value with fixed precision to avoid floating point errors
 * Example: 3.5999999999999996 -> "3.60"
 * Safe version - handles null, undefined, NaN
 * @param value - The number to format
 * @param maxDecimals - Maximum decimal places (default: 2)
 * @returns Formatted string without trailing zeros, or "N/A" for invalid values
 */
export function formatDecimal(value: number | null | undefined, maxDecimals: number = 2): string {
  if (!isValidNumber(value)) return 'N/A'
  // Use toFixed to handle floating point precision, then parse to remove trailing zeros
  return parseFloat(value.toFixed(maxDecimals)).toString()
}

/**
 * Format percentage with sign (safe version)
 * Handles null, undefined, NaN - returns "N/A" for invalid values
 * @deprecated Use formatterTh.formatPercentage() directly for locale awareness
 */
export function formatPercent(value: number | null | undefined, decimals: number = 2): string {
  if (!isValidNumber(value)) return 'N/A'
  return formatterTh.formatPercentage(value, decimals)
}

/**
 * Format percentage (alias for formatPercent)
 */
export const formatPercentage = formatPercent

/**
 * Format market cap to readable string (safe version)
 * Handles null, undefined, NaN - returns "N/A" for invalid values
 * @deprecated Use formatterTh.formatShort() directly for locale awareness
 */
export function formatMarketCap(value: number | null | undefined): string {
  if (!isValidNumber(value)) return 'N/A'
  return formatterTh.formatShort(value)
}

/**
 * Format volume to readable string (safe version)
 * Handles null, undefined, NaN - returns "N/A" for invalid values
 * @deprecated Use formatterTh.formatVolume() directly for locale awareness
 */
export function formatVolume(value: number | null | undefined): string {
  if (!isValidNumber(value)) return 'N/A'
  return formatterTh.formatVolume(value)
}

/**
 * Format trading value to readable string in Thai Baht (safe version)
 * Handles null, undefined, NaN - returns "N/A" for invalid values
 * @deprecated Use formatterTh.formatCurrency() directly for locale awareness
 */
export function formatTradingValue(value: number | null | undefined): string {
  if (!isValidNumber(value)) return 'N/A'
  return formatterTh.formatCurrency(value)
}

/**
 * Format timestamp to relative time
 */
export function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

/**
 * Get color class for value (up/down)
 */
export function getValueColor(value: number): 'up' | 'down' | 'neutral' {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'neutral'
}

/**
 * Get arrow icon for value
 */
export function getValueArrow(value: number): string {
  if (value > 0) return '▲'
  if (value < 0) return '▼'
  return '▬'
}

// Re-export NumberFormatter for direct use
export { formatterTh, formatterEn } from '@/lib/i18n'
export type { NumberFormatter } from '@/lib/i18n'

/**
 * ============================================================================
 * SAFE NUMBER FORMATTING UTILITIES
 * ============================================================================
 * These utilities handle null, undefined, and NaN values gracefully
 * Prevents "Cannot read properties of null (reading 'toFixed')" errors
 *
 * Note: safeToFixed and safeNumber are defined in @/lib/utils.ts
 * These are additional safe formatters for specific use cases
 */

/**
 * Safe percentage format - Handles null/undefined/NaN
 * Returns formatted percentage string or 'N/A' for invalid values
 *
 * @example
 * safePercentage(15.5)   // '+15.50%'
 * safePercentage(null)   // 'N/A'
 */
export function safePercentage(value: number | null | undefined, decimals: number = 2): string {
  if (!isValidNumber(value)) return 'N/A'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Safe ratio format - For PE, PBV, ROE, etc.
 * Returns formatted ratio or 'N/A' for invalid values
 *
 * @example
 * safeRatio(15.5)   // '15.50'
 * safeRatio(null)   // 'N/A'
 */
export function safeRatio(value: number | null | undefined, decimals: number = 2): string {
  if (!isValidNumber(value)) return 'N/A'
  return value.toFixed(decimals)
}
