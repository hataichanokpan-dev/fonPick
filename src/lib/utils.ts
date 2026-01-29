/**
 * Utility Functions
 *
 * Common utility functions used throughout the application
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 *
 * @example
 * ```tsx
 * <div className={cn('px-4 py-2', isActive && 'bg-blue-500', className)} />
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format currency in Thai Baht
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount)
}

/**
 * Format percentage with sign
 */
export function formatPercentage(value: number, decimals = 2): string {
  const formatted = value.toFixed(decimals)
  return value > 0 ? `+${formatted}%` : `${formatted}%`
}

// Re-export formatting utilities from utils/format.ts for convenience
// This allows imports from '@/lib/utils' to access all formatting functions
export {
  formatNumber as formatNumberWithDecimals,
  formatDecimal,
  formatTradingValue,
  formatMarketCap,
  formatVolume,
  formatTimestamp,
  getValueColor,
  getValueArrow,
} from './utils/format'

// Alias formatPercent from format.ts as formatPercentage to avoid duplication
export { formatPercent as formatPercentageFromFormat } from './utils/format'
