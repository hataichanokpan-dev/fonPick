/**
 * Dividend Analysis Types
 *
 * Types for displaying dividend analysis including consistency, yield, and forecasts
 * Used in DividendAnalysisCard component
 */

// ============================================================================
// DIVIDEND HISTORY
// ============================================================================

/**
 * Single dividend payment data point
 *
 * Note: yield is optional and should be calculated at presentation layer
 * using the formula: (dps / currentPrice) * 100
 */
export interface DividendPayment {
  /** Year of payment */
  year: number;
  /** Dividend per share (DPS) in THB */
  dps: number;
  /** Dividend yield at year-end (%) - calculate at presentation layer */
  yield?: number;
  /** Payout ratio (%) */
  payoutRatio: number;
  /** Ex-dividend date (ISO format) */
  exDate?: string;
  /** Payment type */
  paymentType?: 'interim' | 'final' | 'special';
}

/**
 * Dividend time series
 */
export type DividendHistory = DividendPayment[];

// ============================================================================
// DIVIDEND FORECAST
// ============================================================================

/**
 * Dividend forecast for future years
 */
export interface DividendForecast {
  /** Forecast year */
  year: number;
  /** Estimated dividend per share */
  estimatedDps: number;
  /** Estimated yield at current price */
  estimatedYield: number;
  /** Confidence level of the forecast */
  confidence: 'low' | 'medium' | 'high';
  /** Forecast methodology */
  methodology: 'payout_ratio' | 'fcf_coverage' | 'analyst' | 'growth_trend';
}

/**
 * Dividend forecast series
 */
export type DividendForecasts = DividendForecast[];

// ============================================================================
// DIVIDEND CONSISTENCY METRICS
// ============================================================================

/**
 * Dividend consistency analysis
 */
export interface DividendConsistency {
  /** Overall consistency score (0-100) */
  score: number;
  /** Number of years with consecutive dividend payments */
  yearsPaid: number;
  /** Years of consecutive dividend growth */
  growthStreak: number;
  /** Average growth rate (CAGR) over the period */
  averageGrowth: number;
  /** Consistency rating */
  rating: DividendConsistencyRating;
}

/**
 * Dividend consistency rating
 */
export type DividendConsistencyRating =
  | 'dividend_king'    // 25+ years of increases
  | 'dividend_aristocrat'  // 25+ years of payments
  | 'dividend_champion'    // 25+ years of increases
  | 'consistent'           // 10+ years of payments
  | 'growing'              // 5+ years of growth
  | 'stable'               // 3+ years of payments
  | 'irregular';           // Less than 3 years or inconsistent

// ============================================================================
// COMPLETE DIVIDEND ANALYSIS DATA
// ============================================================================

/**
 * Complete dividend analysis data for a stock
 */
export interface DividendAnalysisData {
  /** Stock symbol */
  symbol: string;

  /** Current dividend metrics */
  current: {
    /** Most recent dividend per share */
    dps: number;
    /** Current dividend yield at current price */
    yield: number;
    /** Most recent payout ratio */
    payoutRatio: number;
    /** Year-over-year DPS change (%) */
    dpsChange: number;
  };

  /** Historical dividend payments */
  history: DividendHistory;

  /** Dividend consistency analysis */
  consistency: DividendConsistency;

  /** Future dividend forecasts */
  forecasts: DividendForecasts;

  /** Additional dividend metrics */
  metrics: {
    /** 3-year CAGR of DPS */
    threeYearCAGR: number;
    /** 5-year CAGR of DPS */
    fiveYearCAGR: number;
    /** Free cash flow coverage (FCF / Dividend) */
    fcfCoverage: number;
    /** Total dividend paid (in millions THB) */
    totalDividendPaid: number;
  };

  /** Data timestamp */
  asOfDate: string;
  /** Last updated timestamp */
  updatedAt: number;
}

// ============================================================================
// CHART DATA TRANSFORM
// ============================================================================

/**
 * Data point formatted for dividend chart
 */
export interface DividendChartDataPoint extends DividendPayment {
  /** Timestamp for X-axis */
  timestamp: number;
  /** Whether this is historical data or forecast */
  isForecast: boolean;
}

// ============================================================================
// DISPLAY CONFIG
// ============================================================================

/**
 * Dividend status based on yield
 */
export type DividendYieldStatus = 'attractive' | 'normal' | 'low';

/**
 * Get dividend yield status from yield percentage
 */
export function getDividendYieldStatus(yieldValue: number): DividendYieldStatus {
  if (yieldValue >= 4) return 'attractive';
  if (yieldValue >= 2) return 'normal';
  return 'low';
}

/**
 * Dividend status colors and labels
 */
export const DIVIDEND_STATUS_CONFIG: Record<DividendYieldStatus, {
  bg: string;
  text: string;
  border: string;
  icon: 'up' | 'neutral' | 'down';
}> = {
  attractive: {
    bg: 'rgba(74, 222, 128, 0.15)',  // green
    text: 'text-up-primary',
    border: 'border-up-primary/30',
    icon: 'up',
  },
  normal: {
    bg: 'rgba(148, 163, 184, 0.1)',   // gray
    text: 'text-text-secondary',
    border: 'border-border-subtle/50',
    icon: 'neutral',
  },
  low: {
    bg: 'rgba(255, 107, 107, 0.15)',   // red
    text: 'text-down-primary',
    border: 'border-down-primary/30',
    icon: 'down',
  },
} as const;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API response for dividend analysis
 */
export interface DividendAnalysisResponse {
  success: boolean;
  data?: DividendAnalysisData;
  error?: string;
}
