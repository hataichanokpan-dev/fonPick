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
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
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
