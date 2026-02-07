/**
 * Dividend Calculator Utilities
 *
 * Utility functions for calculating dividend consistency, growth, and forecasts
 */

import type {
  DividendHistory,
  DividendConsistency,
  DividendConsistencyRating,
  DividendForecasts,
} from '@/types/dividend';

// ============================================================================
// DIVIDEND CONSISTENCY CALCULATION
// ============================================================================

/**
 * Calculate dividend consistency score
 * Based on:
 * - Number of years with dividend payments
 * - Consecutive payment streak
 * - Growth consistency (not declining)
 *
 * @param history Dividend payment history
 * @returns Dividend consistency analysis
 */
export function calculateDividendConsistency(
  history: DividendHistory
): DividendConsistency {
  if (!history || history.length === 0) {
    return {
      score: 0,
      yearsPaid: 0,
      growthStreak: 0,
      averageGrowth: 0,
      rating: 'irregular',
    };
  }

  // Sort by year
  const sortedHistory = [...history].sort((a, b) => a.year - b.year);

  // Count years with dividend payments
  const yearsPaid = sortedHistory.filter((p) => p.dps > 0).length;

  // Calculate consecutive payment streak
  let currentStreak = 0;
  let maxStreak = 0;
  for (let i = sortedHistory.length - 1; i >= 0; i--) {
    if (sortedHistory[i].dps > 0) {
      currentStreak++;
    } else {
      break;
    }
  }
  maxStreak = Math.max(currentStreak, maxStreak);

  // Calculate growth streak (consecutive years of dividend growth)
  let growthStreak = 0;
  for (let i = sortedHistory.length - 1; i > 0; i--) {
    if (sortedHistory[i].dps > 0 && sortedHistory[i - 1].dps > 0) {
      if (sortedHistory[i].dps > sortedHistory[i - 1].dps) {
        growthStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate average growth rate (CAGR)
  const averageGrowth = calculateDividendCAGR(sortedHistory);

  // Calculate consistency score (0-100)
  let score = 0;

  // Payment streak score (max 40 points)
  if (yearsPaid >= 25) score += 40;
  else if (yearsPaid >= 10) score += 30;
  else if (yearsPaid >= 5) score += 20;
  else if (yearsPaid >= 3) score += 10;
  else score += 5;

  // Growth streak score (max 30 points)
  if (growthStreak >= 10) score += 30;
  else if (growthStreak >= 5) score += 20;
  else if (growthStreak >= 3) score += 10;
  else if (growthStreak >= 1) score += 5;

  // Average growth score (max 20 points)
  if (averageGrowth >= 10) score += 20;
  else if (averageGrowth >= 5) score += 15;
  else if (averageGrowth >= 2) score += 10;
  else if (averageGrowth >= 0) score += 5;

  // Stability score (max 10 points) - penalize volatility
  const volatility = calculateDividendVolatility(sortedHistory);
  if (volatility < 0.1) score += 10;
  else if (volatility < 0.2) score += 7;
  else if (volatility < 0.3) score += 4;
  else score += 0;

  // Determine rating
  let rating: DividendConsistencyRating = 'irregular';
  if (yearsPaid >= 25 && growthStreak >= 25) {
    rating = 'dividend_king';
  } else if (yearsPaid >= 25) {
    rating = 'dividend_aristocrat';
  } else if (yearsPaid >= 10 && growthStreak >= 5) {
    rating = 'consistent';
  } else if (yearsPaid >= 5 && growthStreak >= 3) {
    rating = 'growing';
  } else if (yearsPaid >= 3) {
    rating = 'stable';
  } else {
    rating = 'irregular';
  }

  return {
    score: Math.min(100, score),
    yearsPaid: maxStreak,
    growthStreak,
    averageGrowth,
    rating,
  };
}

/**
 * Calculate dividend CAGR (Compound Annual Growth Rate)
 *
 * @param history Dividend payment history
 * @param years Number of years to calculate (default: all)
 * @returns CAGR as percentage
 */
export function calculateDividendCAGR(
  history: DividendHistory,
  years: number = 5
): number {
  const sortedHistory = [...history].sort((a, b) => a.year - b.year);
  const recent = sortedHistory.slice(-years).filter((p) => p.dps > 0);

  if (recent.length < 2) return 0;

  const first = recent[0].dps;
  const last = recent[recent.length - 1].dps;

  if (first <= 0) return 0;

  const n = recent.length - 1;
  const cagr = ((last / first) ** (1 / n) - 1) * 100;

  return cagr;
}

/**
 * Calculate dividend volatility (coefficient of variation)
 *
 * @param history Dividend payment history
 * @returns Volatility score (0-1, lower is better)
 */
export function calculateDividendVolatility(history: DividendHistory): number {
  const values = history.map((p) => p.dps);
  if (values.length === 0) return 1;

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  if (mean === 0) return 1;
  return stdDev / mean;
}

// ============================================================================
// DIVIDEND FORECAST CALCULATION
// ============================================================================

/**
 * Generate dividend forecasts using payout ratio method
 *
 * @param payoutRatio Average payout ratio (%)
 * @param epsForecast Forecast EPS for next years
 * @returns Dividend forecasts
 */
export function forecastDividendByPayoutRatio(
  payoutRatio: number,
  epsForecast: number[],
  confidence: 'low' | 'medium' | 'high' = 'medium'
): DividendForecasts {
  return epsForecast.map((eps, index) => ({
    year: new Date().getFullYear() + index + 1,
    estimatedDps: (eps * payoutRatio) / 100,
    estimatedYield: 0, // Will be calculated later based on current price
    confidence,
    methodology: 'payout_ratio',
  }));
}

/**
 * Generate dividend forecasts using growth trend method
 *
 * @param history Dividend payment history
 * @param years Number of years to forecast
 * @returns Dividend forecasts
 */
export function forecastDividendByGrowthTrend(
  history: DividendHistory,
  years: number = 3
): DividendForecasts {
  const sortedHistory = [...history].sort((a, b) => a.year - b.year);
  const recent = sortedHistory.slice(-5); // Use last 5 years

  if (recent.length < 2) return [];

  // Calculate average growth rate
  const cagr = calculateDividendCAGR(recent, Math.min(5, recent.length));
  const lastDPS = sortedHistory[sortedHistory.length - 1].dps;

  const forecasts: DividendForecasts = [];
  let currentDPS = lastDPS;

  for (let i = 1; i <= years; i++) {
    currentDPS = currentDPS * (1 + cagr / 100);
    forecasts.push({
      year: new Date().getFullYear() + i,
      estimatedDps: Math.max(0, currentDPS),
      estimatedYield: 0,
      confidence: cagr > 5 ? 'high' : cagr > 0 ? 'medium' : 'low',
      methodology: 'growth_trend',
    });
  }

  return forecasts;
}

/**
 * Generate dividend forecasts using FCF coverage method
 *
 * @param fcfForecast Forecast free cash flow per share
 * @param historicalPayoutRatio Historical average FCF payout ratio
 * @param years Number of years to forecast
 * @returns Dividend forecasts
 */
export function forecastDividendByFCFCoverage(
  fcfForecast: number[],
  historicalPayoutRatio: number = 0.6,
  years: number = 3
): DividendForecasts {
  return fcfForecast.slice(0, years).map((fcf, index) => ({
    year: new Date().getFullYear() + index + 1,
    estimatedDps: Math.max(0, fcf * historicalPayoutRatio),
    estimatedYield: 0,
    confidence: 'medium',
    methodology: 'fcf_coverage',
  }));
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

/**
 * Generate mock dividend payment history
 *
 * @param symbol Stock symbol (affects the pattern)
 * @param years Number of years of history
 * @returns Mock dividend history
 */
export function generateMockDividendHistory(
  symbol: string,
  years: number = 10
): DividendHistory {
  const history: DividendHistory = [];
  const currentYear = new Date().getFullYear();

  // Different base patterns for different types of stocks
  const isHighYield = ['BBL', 'CPF', 'TISCO', 'BDMS'].includes(symbol);
  const isGrowth = ['ADVANC', 'INTUCH', 'DELTA'].includes(symbol);

  // Base values
  const baseDPS = isHighYield ? 1.5 : isGrowth ? 0.3 : 0.8;
  const basePayout = isHighYield ? 60 : isGrowth ? 30 : 45;
  const growthRate = isHighYield ? 0.05 : isGrowth ? 0.10 : 0.07;

  for (let i = years; i >= 1; i--) {
    const year = currentYear - i;
    const yearOffset = years - i; // 0 to years-1

    // Add some randomness
    const randomFactor = 0.95 + Math.random() * 0.1; // 0.95 to 1.05

    // Calculate DPS with growth trend
    const dps = Math.max(
      0.1,
      baseDPS * Math.pow(1 + growthRate, yearOffset) * randomFactor
    );

    // NOTE: Yield is now calculated at presentation layer using real currentPrice
    // This prevents incorrect yield calculations from assumed historical prices

    // Calculate payout ratio (fluctuate around base)
    const payoutRatio = basePayout + (Math.random() - 0.5) * 10;

    history.push({
      year,
      dps: Math.round(dps * 100) / 100,
      yield: 0, // Will be calculated at presentation layer: (dps / currentPrice) * 100
      payoutRatio: Math.round(payoutRatio),
      exDate: `${year}-12-15`, // Approximate ex-dividend date
      paymentType: i % 2 === 0 ? 'interim' : 'final',
    });
  }

  return history;
}

/**
 * Generate complete mock dividend analysis data
 *
 * @param symbol Stock symbol
 * @returns Mock dividend analysis data
 */
export function generateMockDividendAnalysis(symbol: string) {
  const history = generateMockDividendHistory(symbol, 10);
  const consistency = calculateDividendConsistency(history);
  const forecasts = forecastDividendByGrowthTrend(history, 3);

  const current = history[history.length - 1];
  const previous = history[history.length - 2];

  return {
    symbol,
    current: {
      dps: current.dps,
      yield: 0, // Will be calculated at presentation layer using real currentPrice
      payoutRatio: current.payoutRatio,
      dpsChange: previous ? ((current.dps - previous.dps) / previous.dps) * 100 : 0,
    },
    history,
    consistency,
    forecasts,
    metrics: {
      threeYearCAGR: calculateDividendCAGR(history.slice(-3), 3),
      fiveYearCAGR: calculateDividendCAGR(history, 5),
      fcfCoverage: 1.5 + Math.random() * 1, // 1.5 to 2.5x
      totalDividendPaid: history.reduce((sum, p) => sum + p.dps, 0) * 1000000, // Assume 1M shares
    },
    asOfDate: new Date().toISOString(),
    updatedAt: Date.now(),
  };
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Dividend Calculator Utilities
 */
export const dividendCalculatorUtils = {
  calculateConsistency: calculateDividendConsistency,
  calculateCAGR: calculateDividendCAGR,
  calculateVolatility: calculateDividendVolatility,
  forecastByPayoutRatio: forecastDividendByPayoutRatio,
  forecastByGrowthTrend: forecastDividendByGrowthTrend,
  forecastByFCFCoverage: forecastDividendByFCFCoverage,
  generateMock: generateMockDividendAnalysis,
};
