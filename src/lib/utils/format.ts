/**
 * Formatting utilities
 */

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value)) return 'N/A'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format percentage with sign
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value)) return 'N/A'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Format market cap to readable string
 */
export function formatMarketCap(value: number): string {
  if (isNaN(value)) return 'N/A'

  const trillions = value / 1_000_000_000_000
  const billions = value / 1_000_000_000
  const millions = value / 1_000_000

  if (trillions >= 1) {
    return `${trillions.toFixed(2)}T`
  } else if (billions >= 1) {
    return `${billions.toFixed(2)}B`
  } else if (millions >= 1) {
    return `${millions.toFixed(2)}M`
  }
  return formatNumber(value, 0)
}

/**
 * Format volume to readable string
 */
export function formatVolume(value: number): string {
  if (isNaN(value)) return 'N/A'

  const millions = value / 1_000_000
  const thousands = value / 1_000

  if (millions >= 1) {
    return `${millions.toFixed(2)}M`
  } else if (thousands >= 1) {
    return `${thousands.toFixed(2)}K`
  }
  return formatNumber(value, 0)
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

/**
 * Format trading value to readable string (in Thai Baht)
 */
export function formatTradingValue(value: number): string {
  if (isNaN(value)) return 'N/A'

  const billions = value / 1_000_000_000
  const millions = value / 1_000_000

  if (billions >= 1) {
    return `฿${billions.toFixed(2)}B`
  } else if (millions >= 1) {
    return `฿${millions.toFixed(2)}M`
  }
  return `฿${formatNumber(value, 0)}`
}
