/**
 * Formatters Utility
 *
 * Number and currency formatting functions for screening system.
 */

import { NUMBER_SUFFIXES, NUMBER_THRESHOLDS } from '../constants'

/**
 * Format large numbers with suffixes (K, M, B)
 * Safe version - handles null/undefined/NaN
 */
export function formatLargeNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || Number.isNaN(num)) return 'N/A'
  if (num >= NUMBER_THRESHOLDS.BILLION) {
    return `${(num / NUMBER_THRESHOLDS.BILLION).toFixed(2)}${NUMBER_SUFFIXES.BILLION}`
  }
  if (num >= NUMBER_THRESHOLDS.MILLION) {
    return `${(num / NUMBER_THRESHOLDS.MILLION).toFixed(2)}${NUMBER_SUFFIXES.MILLION}`
  }
  if (num >= NUMBER_THRESHOLDS.THOUSAND) {
    return `${(num / NUMBER_THRESHOLDS.THOUSAND).toFixed(2)}${NUMBER_SUFFIXES.THOUSAND}`
  }
  return num.toFixed(2)
}

/**
 * Format currency value (THB)
 * Safe version - handles null/undefined/NaN
 */
export function formatCurrency(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A'
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format percentage value
 * Safe version - handles null/undefined/NaN
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A'
  return new Intl.NumberFormat('th-TH', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100) // Divide by 100 because value is likely already in percentage form
}

/**
 * Format percentage from decimal (e.g., 0.15 -> "15.0%")
 * Safe version - handles null/undefined/NaN
 */
export function formatPercentageFromDecimal(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A'
  return new Intl.NumberFormat('th-TH', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format ratio value (e.g., PE, PB, ROE)
 * Safe version - handles null/undefined/NaN
 */
export function formatRatio(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A'
  return value.toFixed(decimals)
}

/**
 * Format decimal number
 * Safe version - handles null/undefined/NaN
 */
export function formatNumber(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A'
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format date
 */
export function formatDate(date: Date | string, locale: 'en' | 'th' = 'th'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Format date range
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string, locale: 'en' | 'th' = 'th'): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  const formatter = new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    month: 'short',
    day: 'numeric',
  })

  return `${formatter.format(start)} - ${formatter.format(end)}`
}

/**
 * Format countdown (e.g., "in 12 days")
 */
export function formatCountdown(targetDate: Date, locale: 'en' | 'th' = 'th'): string {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) {
    return locale === 'th' ? 'ผ่านมาแล้ว' : 'Passed'
  }

  if (days === 0) {
    return locale === 'th' ? 'วันนี้' : 'Today'
  }

  if (days === 1) {
    return locale === 'th' ? 'พรุ่งนี้' : 'Tomorrow'
  }

  if (locale === 'th') {
    return `อีก ${days} วัน`
  }

  return `in ${days} days`
}

/**
 * Format score with color class
 */
export function formatScore(score: number, maxScore: number): {
  display: string
  percentage: number
  colorClass: string
} {
  const percentage = Math.round((score / maxScore) * 100)
  let colorClass = 'text-risk'

  if (percentage >= 90) {
    colorClass = 'text-up-primary'
  } else if (percentage >= 70) {
    colorClass = 'text-up'
  } else if (percentage >= 50) {
    colorClass = 'text-insight'
  } else if (percentage >= 30) {
    colorClass = 'text-warn'
  }

  return {
    display: `${score}/${maxScore}`,
    percentage,
    colorClass,
  }
}

/**
 * Format change percentage with sign and color
 * Safe version - handles null/undefined/NaN
 */
export function formatChange(value: number | null | undefined): {
  display: string
  colorClass: string
  icon: 'up' | 'down' | 'flat'
} {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return { display: 'N/A', colorClass: 'text-flat', icon: 'flat' }
  }
  const display = `${value > 0 ? '+' : ''}${value.toFixed(2)}%`

  let colorClass = 'text-flat'
  let icon: 'up' | 'down' | 'flat' = 'flat'

  if (value > 0) {
    colorClass = 'text-up-primary'
    icon = 'up'
  } else if (value < 0) {
    colorClass = 'text-risk'
    icon = 'down'
  }

  return { display, colorClass, icon }
}

/**
 * Format Thai Baht amount with "บาท" suffix
 * Safe version - handles null/undefined/NaN
 */
export function formatBaht(amount: number | null | undefined, decimals: number = 2): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return 'N/A'
  const formatted = formatNumber(amount, decimals)
  return `${formatted} บาท`
}

/**
 * Format millions (for market cap, etc.)
 * Safe version - handles null/undefined/NaN
 */
export function formatMillions(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A'
  return `${(value / 1_000_000).toFixed(decimals)}M`
}

/**
 * Format billions (for market cap, etc.)
 * Safe version - handles null/undefined/NaN
 */
export function formatBillions(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A'
  return `${(value / 1_000_000_000).toFixed(decimals)}B`
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format number with commas (Thai style)
 * Safe version - handles null/undefined/NaN
 */
export function formatWithCommas(num: number | null | undefined): string {
  if (num === null || num === undefined || Number.isNaN(num)) return 'N/A'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
