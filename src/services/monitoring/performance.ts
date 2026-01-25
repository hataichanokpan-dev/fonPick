/**
 * Performance Monitoring
 *
 * Adds timing logs to critical functions and cache optimization
 * for frequently accessed data.
 */

// ============================================================================
// PERFORMANCE METRICS TYPES
// ============================================================================

export interface PerformanceMetrics {
  operation: string
  duration: number // milliseconds
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  hits: number
  lastAccessed: number
}

export interface CacheStats {
  size: number
  totalHits: number
  totalMisses: number
  hitRate: number
  oldestEntry: number
  newestEntry: number
}

// ============================================================================
// TIMING UTILITIES
// ============================================================================

/**
 * Timing wrapper for function execution
 * @param operation Name of the operation being timed
 * @param fn Function to execute
 * @returns Result of the function with timing information
 */
export async function withTiming<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const startTime = performance.now()
  const timestamp = Date.now()

  try {
    const result = await fn()
    const duration = performance.now() - startTime

    const metrics: PerformanceMetrics = {
      operation,
      duration,
      timestamp,
    }

    logPerformance(metrics)

    return { result, metrics }
  } catch (error) {
    const duration = performance.now() - startTime

    const metrics: PerformanceMetrics = {
      operation,
      duration,
      timestamp,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    }

    logPerformance(metrics)

    throw error
  }
}

/**
 * Synchronous timing wrapper
 * @param operation Name of the operation being timed
 * @param fn Function to execute
 * @returns Result of the function with timing information
 */
export function withTimingSync<T>(
  operation: string,
  fn: () => T
): { result: T; metrics: PerformanceMetrics } {
  const startTime = performance.now()
  const timestamp = Date.now()

  try {
    const result = fn()
    const duration = performance.now() - startTime

    const metrics: PerformanceMetrics = {
      operation,
      duration,
      timestamp,
    }

    logPerformance(metrics)

    return { result, metrics }
  } catch (error) {
    const duration = performance.now() - startTime

    const metrics: PerformanceMetrics = {
      operation,
      duration,
      timestamp,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    }

    logPerformance(metrics)

    throw error
  }
}

// ============================================================================
// PERFORMANCE LOGGING
// ============================================================================

const performanceMetrics: PerformanceMetrics[] = []
const MAX_METRICS = 1000

/**
 * Log performance metrics
 */
function logPerformance(metrics: PerformanceMetrics): void {
  performanceMetrics.push(metrics)

  // Keep only recent metrics
  if (performanceMetrics.length > MAX_METRICS) {
    performanceMetrics.shift()
  }

  // Log slow operations (> 1000ms)
  if (metrics.duration > 1000) {
    console.warn(`[Performance] Slow operation: ${metrics.operation} took ${metrics.duration.toFixed(2)}ms`)
  }

  // Log very slow operations (> 5000ms)
  if (metrics.duration > 5000) {
    console.error(`[Performance] VERY SLOW operation: ${metrics.operation} took ${metrics.duration.toFixed(2)}ms`)
  }
}

/**
 * Get all performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics[] {
  return [...performanceMetrics]
}

/**
 * Get metrics for a specific operation
 */
export function getMetricsForOperation(operation: string): PerformanceMetrics[] {
  return performanceMetrics.filter(m => m.operation === operation)
}

/**
 * Get average duration for an operation
 */
export function getAverageDuration(operation: string): number {
  const metrics = getMetricsForOperation(operation)
  if (metrics.length === 0) return 0

  const total = metrics.reduce((sum, m) => sum + m.duration, 0)
  return total / metrics.length
}

/**
 * Get median duration for an operation
 */
export function getMedianDuration(operation: string): number {
  const metrics = getMetricsForOperation(operation)
  if (metrics.length === 0) return 0

  const sorted = metrics.map(m => m.duration).sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

/**
 * Get percentile duration for an operation
 */
export function getPercentileDuration(operation: string, percentile: number): number {
  const metrics = getMetricsForOperation(operation)
  if (metrics.length === 0) return 0

  const sorted = metrics.map(m => m.duration).sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1

  return sorted[Math.max(0, Math.min(index, sorted.length - 1))]
}

/**
 * Clear all performance metrics
 */
export function clearPerformanceMetrics(): void {
  performanceMetrics.length = 0
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): Record<
  string,
  {
    count: number
    avg: number
    median: number
    p95: number
    p99: number
    min: number
    max: number
  }
> {
  const operations = [...new Set(performanceMetrics.map(m => m.operation))]
  const summary: Record<
    string,
    {
      count: number
      avg: number
      median: number
      p95: number
      p99: number
      min: number
      max: number
    }
  > = {}

  for (const operation of operations) {
    const metrics = getMetricsForOperation(operation)
    const durations = metrics.map(m => m.duration).sort((a, b) => a - b)

    summary[operation] = {
      count: metrics.length,
      avg: getAverageDuration(operation),
      median: getMedianDuration(operation),
      p95: getPercentileDuration(operation, 95),
      p99: getPercentileDuration(operation, 99),
      min: durations[0] || 0,
      max: durations[durations.length - 1] || 0,
    }
  }

  return summary
}

// ============================================================================
// CACHE IMPLEMENTATION
// ============================================================================

class MemoryCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private defaultTTL: number
  private maxSize: number

  constructor(options: { defaultTTL?: number; maxSize?: number } = {}) {
    this.cache = new Map()
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000 // 5 minutes default
    this.maxSize = options.maxSize || 100
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key)
      return null
    }

    // Update access info
    entry.hits++
    entry.lastAccessed = Date.now()

    return entry.data
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, _ttl?: number): void {
    // Check size limit
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
      lastAccessed: Date.now(),
    })
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if expired
    if (Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    let totalHits = 0
    let totalMisses = 0
    let oldestEntry = Date.now()
    let newestEntry = 0

    for (const entry of this.cache.values()) {
      totalHits += entry.hits
      totalMisses += entry.hits === 0 ? 1 : 0
      if (entry.timestamp < oldestEntry) oldestEntry = entry.timestamp
      if (entry.timestamp > newestEntry) newestEntry = entry.timestamp
    }

    const totalRequests = totalHits + totalMisses
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0

    return {
      size: this.cache.size,
      totalHits,
      totalMisses,
      hitRate,
      oldestEntry,
      newestEntry,
    }
  }

  /**
   * Evict oldest entry (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestAccess = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    let removed = 0
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key)
        removed++
      }
    }

    return removed
  }
}

// ============================================================================
// CACHE INSTANCES
// ============================================================================

// Global cache instances for different data types
export const investorTypeCache = new MemoryCache<{ defaultTTL: number; maxSize: number }>({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 50,
})

export const sectorCache = new MemoryCache({ defaultTTL: 5 * 60 * 1000, maxSize: 50 })
export const rankingsCache = new MemoryCache({ defaultTTL: 2 * 60 * 1000, maxSize: 100 })
export const analysisCache = new MemoryCache({ defaultTTL: 10 * 60 * 1000, maxSize: 200 })

// ============================================================================
// CACHED FUNCTION WRAPPERS
// ============================================================================

/**
 * Wrap a function with caching
 * @param cache Cache instance
 * @param keyFn Function to generate cache key
 * @param fn Function to wrap
 * @returns Cached function
 */
export function withCache<T, Args extends unknown[]>(
  cache: MemoryCache<T>,
  keyFn: (...args: Args) => string,
  fn: (...args: Args) => T
): (...args: Args) => T {
  return (...args: Args): T => {
    const key = keyFn(...args)

    // Check cache
    const cached = cache.get(key)
    if (cached !== null) {
      return cached
    }

    // Execute function
    const result = fn(...args)

    // Store in cache
    cache.set(key, result)

    return result
  }
}

/**
 * Wrap an async function with caching
 * @param cache Cache instance
 * @param keyFn Function to generate cache key
 * @param fn Function to wrap
 * @returns Cached async function
 */
export function withCacheAsync<T, Args extends unknown[]>(
  cache: MemoryCache<T>,
  keyFn: (...args: Args) => string,
  fn: (...args: Args) => Promise<T>
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const key = keyFn(...args)

    // Check cache
    const cached = cache.get(key)
    if (cached !== null) {
      return cached
    }

    // Execute function
    const result = await fn(...args)

    // Store in cache
    cache.set(key, result)

    return result
  }
}

// ============================================================================
// CACHE KEY GENERATORS
// ============================================================================

/**
 * Generate cache key for investor type by date
 */
export function investorTypeKey(date: string): string {
  return `investorType:${date}`
}

/**
 * Generate cache key for sector data by date
 */
export function sectorKey(date: string): string {
  return `sector:${date}`
}

/**
 * Generate cache key for rankings by date
 */
export function rankingsKey(date: string): string {
  return `rankings:${date}`
}

/**
 * Generate cache key for analysis
 */
export function analysisKey(type: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(k => `${k}=${JSON.stringify(params[k])}`)
    .join('&')
  return `analysis:${type}:${sortedParams}`
}

// ============================================================================
// CACHE MAINTENANCE
// ============================================================================

/**
 * Clean all expired cache entries
 */
export function cleanAllCaches(): number {
  let totalRemoved = 0

  totalRemoved += investorTypeCache.cleanExpired()
  totalRemoved += sectorCache.cleanExpired()
  totalRemoved += rankingsCache.cleanExpired()
  totalRemoved += analysisCache.cleanExpired()

  return totalRemoved
}

/**
 * Get all cache statistics
 */
export function getAllCacheStats(): Record<string, CacheStats> {
  return {
    investorType: investorTypeCache.getStats(),
    sector: sectorCache.getStats(),
    rankings: rankingsCache.getStats(),
    analysis: analysisCache.getStats(),
  }
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  investorTypeCache.clear()
  sectorCache.clear()
  rankingsCache.clear()
  analysisCache.clear()
}
