/**
 * Technical Chart Types
 *
 * Types for professional trading chart with indicators
 */

import type { PriceHistoryPoint } from './stock-price-api'

// Re-export PriceHistoryPoint for convenience
export type { PriceHistoryPoint }

// ============================================================================
// TECHNICAL INDICATOR TYPES
// ============================================================================

/**
 * Moving Average Data Point
 */
export interface MAData {
  date: string
  value: number
}

/**
 * Support/Resistance Level
 */
export interface SupportResistanceLevel {
  price: number
  type: 'support' | 'resistance'
  strength: 'weak' | 'moderate' | 'strong'
  touches: number
  lastTouchDate?: string
}

/**
 * Trading Level (Entry, Stop Loss, Take Profit)
 */
export interface TradingLevel {
  type: 'entry' | 'stopLoss' | 'takeProfit'
  price: number
  label?: string
  level?: number // 1, 2, 3 for TP
}

/**
 * Volume Data Point with Color
 */
export interface VolumeDataPoint {
  date: string
  volume: number
  isUp: boolean
}

/**
 * Calculated Technical Indicators
 */
export interface TechnicalIndicators {
  // Moving Averages
  ma20?: MAData[]
  ma50?: MAData[]
  ma200?: MAData[]

  // Support/Resistance
  supportLevels: SupportResistanceLevel[]
  resistanceLevels: SupportResistanceLevel[]

  // Trading Levels (optional - user-defined or calculated)
  entryPoint?: TradingLevel
  stopLoss?: TradingLevel
  takeProfit?: TradingLevel[]
}

/**
 * Chart Display Configuration
 */
export interface ChartDisplayConfig {
  // Visible indicators
  showMA20: boolean
  showMA50: boolean
  showMA200: boolean
  showSupportResistance: boolean
  showVolume: boolean
  showEntryPoints: boolean
  showTradingLevels: boolean

  // Chart style
  chartType: 'line' | 'area' | 'candlestick'
}

/**
 * Technical Chart Data
 */
export interface TechnicalChartData {
  priceHistory: PriceHistoryPoint[]
  volumeHistory: VolumeDataPoint[]
  indicators: TechnicalIndicators
}
