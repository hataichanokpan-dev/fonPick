/**
 * Valuation Band Calculator
 *
 * Utility functions for calculating statistical bands for valuation metrics
 * Uses standard deviation analysis to determine valuation zones
 */

import type {
  ValuationSeries,
  ValuationBand,
  ValuationInterpretation,
  MetricType,
} from '@/types/valuation';

// ============================================================================
// STATISTICAL FUNCTIONS
// ============================================================================

/**
 * Calculate mean (average) of an array of numbers
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate standard deviation of an array of numbers
 * Uses sample standard deviation (n-1 denominator)
 */
function calculateStandardDeviation(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return 0;

  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / (values.length - 1);

  return Math.sqrt(variance);
}

/**
 * Calculate percentile of a value within a dataset
 */
function calculatePercentile(values: number[], targetValue: number): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = sorted.findIndex((val) => val >= targetValue);

  if (index === -1) return 100;
  if (index === 0) return 0;

  return (index / sorted.length) * 100;
}

// ============================================================================
// VALUATION INTERPRETATION
// ============================================================================

/**
 * Get valuation interpretation based on current value vs bands
 */
function getValuationInterpretation(
  currentValue: number,
  bands: { minus2SD: number; minus1SD: number; plus1SD: number; plus2SD: number }
): ValuationInterpretation {
  if (currentValue <= bands.minus2SD) return 'deep_undervalued';
  if (currentValue <= bands.minus1SD) return 'undervalued';
  if (currentValue <= bands.plus1SD) return 'fair_value';
  if (currentValue <= bands.plus2SD) return 'overvalued';
  return 'sell_zone';
}

/**
 * Get color class for valuation interpretation
 */
export function getInterpretationColor(interpretation: ValuationInterpretation): {
  bg: string;
  text: string;
  border: string;
} {
  switch (interpretation) {
    case 'deep_undervalued':
    case 'undervalued':
      return {
        bg: 'bg-up-soft',
        text: 'text-up-primary',
        border: 'border-up-primary/30',
      };
    case 'fair_value':
      return {
        bg: 'bg-surface-2',
        text: 'text-text-secondary',
        border: 'border-border-subtle/50',
      };
    case 'overvalued':
    case 'sell_zone':
      return {
        bg: 'bg-down-soft',
        text: 'text-down-primary',
        border: 'border-down-primary/30',
      };
  }
}

// ============================================================================
// BAND CALCULATION
// ============================================================================

/**
 * Calculate valuation bands from time series data
 * @param series - Time series data points
 * @param metric - Metric type (PE, PBV, ROE)
 * @param currentValue - Current value of the metric
 * @returns ValuationBand object with calculated bands
 */
export function calculateValuationBand(
  series: ValuationSeries,
  metric: MetricType,
  currentValue: number
): ValuationBand {
  // Extract values from series, filtering out null/undefined
  const values = series
    .map((point) => point.value)
    .filter((val): val is number => val !== null && val !== undefined && !isNaN(val));

  if (values.length === 0) {
    // Return default bands if no data
    return {
      metric,
      minus2SD: 0,
      minus1SD: 0,
      mean: currentValue,
      plus1SD: currentValue * 1.5,
      plus2SD: currentValue * 2,
      currentValue,
      currentPercentile: 50,
      interpretation: 'fair_value',
      upsideToMean: 0,
      downsideToMean: 0,
      upsideToPlus1SD: 0,
      downsideToMinus1SD: 0,
    };
  }

  // Calculate statistics
  const mean = calculateMean(values);
  const stdDev = calculateStandardDeviation(values, mean);
  const percentile = calculatePercentile(values, currentValue);

  // Calculate bands
  const minus2SD = mean - 2 * stdDev;
  const minus1SD = mean - 1 * stdDev;
  const plus1SD = mean + 1 * stdDev;
  const plus2SD = mean + 2 * stdDev;

  // Determine interpretation
  const interpretation = getValuationInterpretation(currentValue, {
    minus2SD,
    minus1SD,
    plus1SD,
    plus2SD,
  });

  // Calculate upside/downside percentages
  // When current value is below mean: upside potential
  const upsideToMean = currentValue < mean && currentValue > 0
    ? ((mean - currentValue) / currentValue) * 100
    : 0;

  // When current value is above mean: downside risk
  const downsideToMean = currentValue > mean && currentValue > 0
    ? ((currentValue - mean) / currentValue) * 100
    : 0;

  // Upside to +1SD (upper normal range)
  const upsideToPlus1SD = currentValue < plus1SD && currentValue > 0
    ? ((plus1SD - currentValue) / currentValue) * 100
    : 0;

  // Downside to -1SD (lower normal range)
  const downsideToMinus1SD = currentValue > minus1SD && currentValue > 0
    ? ((currentValue - minus1SD) / currentValue) * 100
    : 0;

  return {
    metric,
    minus2SD: Math.max(0, minus2SD), // Ensure non-negative for most metrics
    minus1SD: Math.max(0, minus1SD),
    mean,
    plus1SD,
    plus2SD,
    currentValue,
    currentPercentile: percentile,
    interpretation,
    upsideToMean,
    downsideToMean,
    upsideToPlus1SD,
    downsideToMinus1SD,
  };
}

// ============================================================================
// SERIES VALIDATION
// ============================================================================

/**
 * Validate and clean valuation series data
 * Removes invalid data points and sorts by date
 */
export function validateAndCleanSeries(series: ValuationSeries): ValuationSeries {
  return series
    .filter(
      (point) =>
        point.date &&
        point.value !== null &&
        point.value !== undefined &&
        !isNaN(point.value) &&
        point.value >= 0 // Non-negative values only
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Filter series by date range (last N years)
 */
export function filterSeriesByYears(
  series: ValuationSeries,
  years: number
): ValuationSeries {
  if (years <= 0) return series;

  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - years);
  const cutoffTime = cutoffDate.getTime();

  return series.filter((point) => {
    const pointTime = new Date(point.date).getTime();
    return pointTime >= cutoffTime;
  });
}

// ============================================================================
// MOCK DATA GENERATION (for development)
// ============================================================================

/**
 * Generate mock valuation series for development/testing
 * Creates realistic-looking time series data with some randomness
 */
export function generateMockValuationSeries(
  metric: MetricType,
  years: number = 5,
  baseValue: number = 15,
  volatility: number = 0.2
): ValuationSeries {
  const series: ValuationSeries = [];
  const now = new Date();
  const months = years * 12;

  // Different base values for different metrics
  const baseValues: Record<MetricType, number> = {
    PE: 15,
    PBV: 1.5,
    ROE: 12,
  };

  const value = baseValues[metric] || baseValue;

  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);

    // Add some randomness with trend
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    const trendFactor = 1 + (Math.random() - 0.5) * 0.02; // Small trend
    const seriesValue = value * randomFactor * trendFactor * (1 + (months - i) / months * 0.1);

    series.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(0.1, seriesValue), // Ensure positive
    });
  }

  return series;
}

/**
 * Generate complete mock valuation data for all metrics
 */
export function generateMockValuationData(years: number = 5) {
  const peSeries = generateMockValuationSeries('PE', years, 15, 0.25);
  const pbvSeries = generateMockValuationSeries('PBV', years, 1.5, 0.15);
  const roeSeries = generateMockValuationSeries('ROE', years, 12, 0.1);

  return {
    pe: peSeries,
    pbv: pbvSeries,
    roe: roeSeries,
  };
}

// ============================================================================
// DATA TRANSFORMATION FOR CHARTS
// ============================================================================

/**
 * Transform valuation series to chart data format for Recharts
 * Adds timestamp and band values to each point
 */
export function transformToChartData(
  series: ValuationSeries,
  bands: ValuationBand
): Array<{
  timestamp: number;
  date: string;
  value: number;
  mean: number;
  minus2SD: number;
  minus1SD: number;
  plus1SD: number;
  plus2SD: number;
}> {
  return series.map((point) => ({
    timestamp: new Date(point.date).getTime(),
    date: point.date,
    value: point.value,
    mean: bands.mean,
    minus2SD: bands.minus2SD,
    minus1SD: bands.minus1SD,
    plus1SD: bands.plus1SD,
    plus2SD: bands.plus2SD,
  }));
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Valuation Band Calculator Utilities
 */
export const valuationBandUtils = {
  calculate: calculateValuationBand,
  validateSeries: validateAndCleanSeries,
  filterByYears: filterSeriesByYears,
  transformToChart: transformToChartData,
  generateMock: generateMockValuationData,
  getInterpretationColor,
};
