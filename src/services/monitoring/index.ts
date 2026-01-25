/**
 * Monitoring Services Index
 *
 * Exports all monitoring-related utilities.
 */

export {
  withTiming,
  withTimingSync,
  getPerformanceMetrics,
  getMetricsForOperation,
  getAverageDuration,
  getMedianDuration,
  getPercentileDuration,
  clearPerformanceMetrics,
  getPerformanceSummary,
  type PerformanceMetrics,
} from './performance'

export {
  investorTypeCache,
  sectorCache,
  rankingsCache,
  analysisCache,
  withCache,
  withCacheAsync,
  cleanAllCaches,
  getAllCacheStats,
  clearAllCaches,
  investorTypeKey,
  sectorKey,
  rankingsKey,
  analysisKey,
  type CacheEntry,
  type CacheStats,
} from './performance'
