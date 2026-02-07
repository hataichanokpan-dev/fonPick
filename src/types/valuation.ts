/**
 * Valuation Metrics Types
 *
 * Types for displaying historical valuation metrics with statistical bands
 * Used in ValuationMetricsCard component
 */

// ============================================================================
// VALUATION TIME SERIES
// ============================================================================

/**
 * Single data point in valuation time series
 */
export interface ValuationPoint {
  /** Date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Metric value at this point */
  value: number;
  /** Stock price at this point (optional, for correlation) */
  price?: number;
}

/**
 * Time series data for a specific metric
 */
export type ValuationSeries = ValuationPoint[];

// ============================================================================
// VALUATION BANDS
// ============================================================================

/**
 * Statistical bands for valuation metric
 * Based on historical standard deviation analysis
 */
export interface ValuationBand {
  /** Metric type (PE, PBV, or ROE) */
  metric: 'PE' | 'PBV' | 'ROE';
  /** Minus 2 Standard Deviations (2.5th percentile) */
  minus2SD: number;
  /** Minus 1 Standard Deviation (16th percentile) */
  minus1SD: number;
  /** Mean/Average value (50th percentile) */
  mean: number;
  /** Plus 1 Standard Deviation (84th percentile) */
  plus1SD: number;
  /** Plus 2 Standard Deviations (97.5th percentile) */
  plus2SD: number;
  /** Current value of the metric */
  currentValue: number;
  /** Current percentile (0-100) - optional */
  currentPercentile?: number;
  /** Valuation interpretation */
  interpretation: ValuationInterpretation;
  /** Upside to Mean (%) - positive when below mean, 0 otherwise */
  upsideToMean?: number;
  /** Downside to Mean (%) - positive when above mean, 0 otherwise */
  downsideToMean?: number;
  /** Upside to +1SD (%) - potential to upper normal range */
  upsideToPlus1SD?: number;
  /** Downside to -1SD (%) - risk to lower normal range */
  downsideToMinus1SD?: number;
}

/**
 * Valuation interpretation based on current value vs bands
 */
export type ValuationInterpretation =
  | 'deep_undervalued'  // < -2SD
  | 'undervalued'       // -2SD to -1SD
  | 'fair_value'        // -1SD to +1SD
  | 'overvalued'        // +1SD to +2SD
  | 'sell_zone';        // > +2SD

/**
 * All valuation bands for a stock
 */
export interface ValuationBands {
  /** P/E ratio bands */
  pe: ValuationBand;
  /** P/BV ratio bands */
  pbv: ValuationBand;
  /** ROE bands */
  roe: ValuationBand;
}

// ============================================================================
// METRIC TYPE CONFIG
// ============================================================================

/**
 * Metric type selector
 */
export type MetricType = 'PE' | 'PBV' | 'ROE';

/**
 * Time range selector for historical data
 */
export type TimeRange = '1Y' | '3Y' | '5Y' | 'ALL';

/**
 * Mapping of time range to years
 */
export const TIME_RANGE_YEARS: Record<TimeRange, number> = {
  '1Y': 1,
  '3Y': 3,
  '5Y': 5,
  'ALL': 10, // 10 years max for "all"
} as const;

// ============================================================================
// METRIC DISPLAY CONFIG
// ============================================================================

/**
 * Display configuration for each metric type
 */
export interface MetricDisplayConfig {
  /** Thai label */
  thai: string;
  /** English label */
  english: string;
  /** Format function for values */
  format: (value: number) => string;
  /** Unit suffix */
  unit: string;
  /** Color for the chart line */
  color: string;
}

/**
 * Metric configurations
 */
export const METRIC_CONFIGS: Record<MetricType, MetricDisplayConfig> = {
  PE: {
    thai: 'P/E',
    english: 'Price-to-Earnings',
    format: (v: number) => v.toFixed(1),
    unit: 'x',
    color: '#60a5fa', // blue-400
  },
  PBV: {
    thai: 'P/BV',
    english: 'Price-to-Book',
    format: (v: number) => v.toFixed(2),
    unit: 'x',
    color: '#a78bfa', // purple-400
  },
  ROE: {
    thai: 'ROE',
    english: 'Return on Equity',
    format: (v: number) => v.toFixed(1),
    unit: '%',
    color: '#34d399', // green-400
  },
} as const;

// ============================================================================
// COMPLETE VALUATION DATA
// ============================================================================

/**
 * Complete valuation metrics data for a stock
 */
export interface ValuationMetricsData {
  /** Stock symbol */
  symbol: string;
  /** Time series data for each metric */
  metrics: {
    pe: ValuationSeries;
    pbv: ValuationSeries;
    roe: ValuationSeries;
  };
  /** Statistical bands for each metric */
  bands: ValuationBands;
  /** Data timestamp */
  asOfDate: string;
  /** Last updated timestamp */
  updatedAt: number;
}

// ============================================================================
// CHART DATA TRANSFORM
// ============================================================================

/**
 * Data point formatted for Recharts
 */
export interface ChartDataPoint extends ValuationPoint {
  /** Timestamp for X-axis */
  timestamp: number;
  /** Mean value for band display */
  mean: number;
  /** Minus 2SD value */
  minus2SD: number;
  /** Minus 1SD value */
  minus1SD: number;
  /** Plus 1SD value */
  plus1SD: number;
  /** Plus 2SD value */
  plus2SD: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API response for valuation metrics
 */
export interface ValuationMetricsResponse {
  success: boolean;
  data?: ValuationMetricsData;
  error?: string;
}
