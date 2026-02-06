/**
 * Trend Data Cache
 *
 * Simple in-memory cache for trend API responses.
 * Reduces Firebase reads and improves response times.
 *
 * Phase 1: Backend Implementation
 */

import type { TrendAnalysisResponse, TrendAnalysisParams } from '@/types/smart-money'

// ============================================================================
// CACHE ENTRY
// ============================================================================

interface CacheEntry<T> {
  data: T
  expiresAt: number
  createdAt: number
}

// ============================================================================
// TREND CACHE CLASS
// ============================================================================

/**
 * Trend data cache with TTL support
 *
 * @example
 * const cache = new TrendCache(60 * 1000) // 1 minute TTL
 * cache.set('trend:30:all', data)
 * const data = cache.get('trend:30:all')
 */
class TrendCacheClass {
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly defaultTTL: number

  constructor(defaultTTL: number = 60 * 1000) {
    this.defaultTTL = defaultTTL
  }

  /**
   * Set a cache entry
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (optional, uses default)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      expiresAt: now + (ttl ?? this.defaultTTL),
      createdAt: now,
    })
  }

  /**
   * Get a cache entry
   * @param key Cache key
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Check if a key exists and is not expired
   * @param key Cache key
   * @returns True if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete a cache entry
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clean up expired entries
   * @returns Number of entries cleaned up
   */
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    const entries = Array.from(this.cache.entries())
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    keys: string[]
    oldestEntry: number | null
    newestEntry: number | null
  } {
    const keys = Array.from(this.cache.keys())
    const values = Array.from(this.cache.values())
    let oldestEntry: number | null = null
    let newestEntry: number | null = null

    for (const entry of values) {
      if (oldestEntry === null || entry.createdAt < oldestEntry) {
        oldestEntry = entry.createdAt
      }
      if (newestEntry === null || entry.createdAt > newestEntry) {
        newestEntry = entry.createdAt
      }
    }

    return {
      size: this.cache.size,
      keys,
      oldestEntry,
      newestEntry,
    }
  }

  /**
   * Get or set pattern (cache-aside)
   * @param key Cache key
   * @param factory Function to generate data if not cached
   * @param ttl Time to live in milliseconds (optional)
   * @returns Cached or newly generated data
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await factory()
    this.set(key, data, ttl)
    return data
  }
}

// ============================================================================
// CACHE KEY GENERATION
// ============================================================================

/**
 * Generate cache key for trend analysis
 * @param params Trend analysis parameters
 * @returns Cache key string
 */
export function generateTrendCacheKey(params: TrendAnalysisParams): string {
  const { period, investors, aggregate, startDate, endDate } = params

  // Sort investors for consistent keys
  const sortedInvestors = [...investors].sort().join(',')

  // Build key components
  const parts = ['trend', period, sortedInvestors]

  if (aggregate) {
    parts.push(aggregate)
  }

  if (startDate) {
    parts.push(startDate)
  }

  if (endDate) {
    parts.push(endDate)
  }

  return parts.join(':')
}

/**
 * Parse cache key to extract parameters
 * @param key Cache key string
 * @returns Parsed parameters or null if invalid
 */
export function parseTrendCacheKey(key: string): TrendAnalysisParams | null {
  if (!key.startsWith('trend:')) {
    return null
  }

  const parts = key.split(':')
  if (parts.length < 3) {
    return null
  }

  const [, period, investorsStr, aggregate, startDate, endDate] = parts

  return {
    period: parseInt(period) as TrendAnalysisParams['period'],
    investors: investorsStr.split(',') as TrendAnalysisParams['investors'],
    aggregate: aggregate as TrendAnalysisParams['aggregate'],
    startDate,
    endDate,
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Get appropriate cache TTL based on time of day
 * RTDB data updates daily at 18:30 Thailand time (11:30 UTC)
 *
 * Strategy:
 * - After update: 15 minutes TTL (fresh data)
 * - Before update: 4 hours TTL (stale until next update)
 *
 * @returns TTL in milliseconds
 */
export function getSmartCacheTTL(): number {
  const now = new Date()
  const utcHour = now.getUTCHours()

  // Update happens at 11:30 UTC (18:30 Thailand)
  // 4 hours after update = 15:30 UTC
  // 4 hours before next update = 07:30 UTC

  if (utcHour >= 15 && utcHour < 19) {
    // Fresh data period (15:30 - 19:00 UTC) = 15 min cache
    return 15 * 60 * 1000
  } else if (utcHour >= 19 || utcHour < 7) {
    // Evening/night until early morning = 4 hour cache
    return 4 * 60 * 60 * 1000
  } else {
    // Morning until fresh data = 1 hour cache
    return 60 * 60 * 1000
  }
}

/**
 * Get Cache-Control header value for trend API
 * @returns Cache-Control header string
 */
export function getTrendCacheControl(): string {
  // Use CDN caching with stale-while-revalidate
  // s-maxage: CDN cache time (5 min)
  // stale-while-revalidate: Serve stale while revalidating (15 min)
  // max-age: Browser cache time (2 min - allow refresh to get fresh)
  return 'public, s-maxage=300, stale-while-revalidate=900, max-age=120'
}

/**
 * Global trend cache instance
 * TTL varies based on time of day
 */
export const trendCache = new TrendCacheClass(getSmartCacheTTL())

/**
 * Update cache TTL periodically (every hour)
 */
if (typeof window === 'undefined') {
  // Server-side only - update TTL based on time
  setInterval(() => {
    const newTTL = getSmartCacheTTL()
    console.log(`[TrendCache] TTL updated to ${newTTL / 1000}s based on time of day`)
  }, 60 * 60 * 1000)

  // Cleanup expired entries every 30 minutes
  setInterval(() => {
    const cleaned = trendCache.cleanup()
    if (cleaned > 0) {
      console.log(`[TrendCache] Cleaned up ${cleaned} expired entries`)
    }
  }, 30 * 60 * 1000)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Cache trend analysis response with appropriate headers
 * @param params Trend analysis parameters
 * @param response Response to cache
 * @param ttl Time to live in milliseconds (optional)
 */
export function cacheTrendResponse(
  params: TrendAnalysisParams,
  response: TrendAnalysisResponse,
  ttl?: number
): void {
  const key = generateTrendCacheKey(params)

  // Set meta with cache status
  const responseWithMeta = {
    ...response,
    meta: {
      ...response.meta,
      cacheStatus: 'miss' as const,
    },
  }

  trendCache.set(key, responseWithMeta, ttl)
}

/**
 * Get cached trend analysis response
 * @param params Trend analysis parameters
 * @returns Cached response with hit status or null
 */
export function getCachedTrendResponse(
  params: TrendAnalysisParams
): (TrendAnalysisResponse & { meta: { cacheStatus: 'hit' } }) | null {
  const key = generateTrendCacheKey(params)
  const cached = trendCache.get<TrendAnalysisResponse>(key)

  if (cached) {
    return {
      ...cached,
      meta: {
        timestamp: cached.meta?.timestamp ?? Date.now(),
        processingTime: cached.meta?.processingTime ?? 0,
        cacheStatus: 'hit' as const,
      },
    }
  }

  return null
}

// ============================================================================
// EXPORTS
// ============================================================================
