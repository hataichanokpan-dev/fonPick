/**
 * Trend Calculation Types
 */

/**
 * Single trend value for a period
 */
export interface TrendValue {
  value: number
  change: number
  changePercent: number
  period: '5D' | '20D' | 'YTD'
}

/**
 * Sector trend data
 */
export interface SectorTrend {
  sectorId: string
  sectorName: string
  fiveDay: TrendValue | null
  twentyDay: TrendValue | null
  ytd: TrendValue | null
}

/**
 * Investor flow trend data
 */
export interface InvestorTrend {
  type: 'foreign' | 'institution' | 'retail' | 'prop'
  fiveDayNet: number
  twentyDayNet: number
  ytdNet: number
}

/**
 * Market trend summary
 */
export interface MarketTrend {
  index: {
    fiveDay: TrendValue | null
    twentyDay: TrendValue | null
    ytd: TrendValue | null
  }
  topSectors: SectorTrend[]
  bottomSectors: SectorTrend[]
  investorFlows: InvestorTrend[]
}

/**
 * Trend direction for display
 */
export type TrendDirection = 'up' | 'down' | 'neutral'

/**
 * Get trend direction from change value
 */
export function getTrendDirection(change: number): TrendDirection {
  if (change > 0.01) return 'up'
  if (change < -0.01) return 'down'
  return 'neutral'
}

/**
 * Get trend color class for Tailwind
 */
export function getTrendColor(direction: TrendDirection): string {
  switch (direction) {
    case 'up':
      return 'text-green-600'
    case 'down':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Get trend arrow icon
 */
export function getTrendArrow(direction: TrendDirection): string {
  switch (direction) {
    case 'up':
      return '▲'
    case 'down':
      return '▼'
    default:
      return '─'
  }
}
