/**
 * API Response Caching
 *
 * Provides caching utilities for API routes.
 * Implements cache headers and stale-while-revalidate strategy.
 *
 * Part of Phase 4: API Response Caching.
 */

import { NextResponse } from 'next/server'

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

/**
 * Cache duration presets (in seconds)
 */
export const CACHE_DURATION = {
  /** No caching */
  NONE: 0,

  /** Very short cache (30 seconds) */
  VERY_SHORT: 30,

  /** Short cache (60 seconds) - default for market data */
  SHORT: 60,

  /** Medium cache (5 minutes) */
  MEDIUM: 300,

  /** Long cache (15 minutes) */
  LONG: 900,

  /** Very long cache (1 hour) */
  VERY_LONG: 3600,
}

/**
 * Cache strategy types
 */
export type CacheStrategy =
  | 'public'
  | 'private'
  | 'no-cache'
  | 'no-store'
  | 'stale-while-revalidate'

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Cache duration in seconds */
  maxAge?: number

  /** Stale-while-revalidate duration in seconds */
  staleWhileRevalidate?: number

  /** Cache strategy */
  strategy?: CacheStrategy

  /** Whether to vary cache by user agent */
  varyUserAgent?: boolean

  /** Custom cache key (for application-level caching) */
  cacheKey?: string
}

// ============================================================================
// CACHE HEADERS GENERATOR
// ============================================================================

/**
 * Generate cache headers for API response
 *
 * @param config Cache configuration
 * @returns Cache headers object
 *
 * @example
 * ```ts
 * const headers = getCacheHeaders({
 *   maxAge: 60,
 *   staleWhileRevalidate: 120,
 *   strategy: 'stale-while-revalidate',
 * })
 *
 * return NextResponse.json(data, { headers })
 * ```
 */
export function getCacheHeaders(config: CacheConfig = {}): HeadersInit {
  const {
    maxAge = CACHE_DURATION.SHORT,
    staleWhileRevalidate = maxAge * 2,
    strategy = 'stale-while-revalidate',
    varyUserAgent = false,
  } = config

  const headers: Record<string, string> = {}

  switch (strategy) {
    case 'public':
      headers['Cache-Control'] = `public, max-age=${maxAge}`
      break

    case 'private':
      headers['Cache-Control'] = `private, max-age=${maxAge}`
      break

    case 'no-cache':
      headers['Cache-Control'] = 'no-cache'
      break

    case 'no-store':
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
      break

    case 'stale-while-revalidate':
      headers['Cache-Control'] =
        `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
      headers['CDN-Cache-Control'] = `public, max-age=${maxAge}, s-maxage=${maxAge}`
      break
  }

  // Add ETag for validation
  headers['ETag'] = generateETag()

  // Add Vary header if needed
  if (varyUserAgent) {
    headers['Vary'] = 'User-Agent'
  }

  // Add expires header for older caches
  if (maxAge > 0) {
    const expiresDate = new Date(Date.now() + maxAge * 1000)
    headers['Expires'] = expiresDate.toUTCString()
  }

  return headers
}

/**
 * Apply caching to NextResponse
 *
 * @param response NextResponse to add cache headers to
 * @param config Cache configuration
 * @returns Response with cache headers
 *
 * @example
 * ```ts
 * const data = { foo: 'bar' }
 * const response = NextResponse.json(data)
 * return withCache(response, { maxAge: 60 })
 * ```
 */
export function withCache<T>(response: NextResponse<T>, config: CacheConfig = {}): NextResponse<T> {
  const headers = getCacheHeaders(config)

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

/**
 * Create a cached JSON response
 *
 * @param data Response data
 * @param config Cache configuration
 * @param status HTTP status code
 * @returns Cached NextResponse
 *
 * @example
 * ```ts
 * return cachedJson({ data: 'value' }, {
 *   maxAge: 60,
 *   strategy: 'stale-while-revalidate',
 * })
 * ```
 */
export function cachedJson<T>(
  data: T,
  config: CacheConfig = {},
  status: number = 200
): NextResponse<T> {
  const response = NextResponse.json(data, { status }) as NextResponse<T>
  return withCache(response, config)
}

// ============================================================================
// PRESET CACHE CONFIGURATIONS
// ============================================================================

/**
 * Cache preset for market data (fast-changing)
 */
export const MARKET_DATA_CACHE: CacheConfig = {
  maxAge: CACHE_DURATION.SHORT, // 60 seconds
  staleWhileRevalidate: 120, // 2 minutes
  strategy: 'stale-while-revalidate',
}

/**
 * Cache preset for insights (medium-changing)
 */
export const INSIGHTS_CACHE: CacheConfig = {
  maxAge: CACHE_DURATION.MEDIUM, // 5 minutes
  staleWhileRevalidate: 300, // 5 minutes
  strategy: 'stale-while-revalidate',
}

/**
 * Cache preset for sector analysis (slower-changing)
 */
export const SECTOR_ANALYSIS_CACHE: CacheConfig = {
  maxAge: CACHE_DURATION.MEDIUM, // 5 minutes
  staleWhileRevalidate: 600, // 10 minutes
  strategy: 'stale-while-revalidate',
}

/**
 * Cache preset for smart money (fast-changing)
 */
export const SMART_MONEY_CACHE: CacheConfig = {
  maxAge: CACHE_DURATION.SHORT, // 60 seconds
  staleWhileRevalidate: 120, // 2 minutes
  strategy: 'stale-while-revalidate',
}

/**
 * Cache preset for historical data (slow-changing)
 */
export const HISTORICAL_DATA_CACHE: CacheConfig = {
  maxAge: CACHE_DURATION.LONG, // 15 minutes
  staleWhileRevalidate: 1800, // 30 minutes
  strategy: 'stale-while-revalidate',
}

/**
 * No cache preset for real-time data
 */
export const NO_CACHE: CacheConfig = {
  strategy: 'no-store',
}

// ============================================================================
// ETAG GENERATION
// ============================================================================

/**
 * Generate ETag for cache validation
 *
 * @param data Optional data to hash for ETag
 * @returns ETag string
 */
function generateETag(data?: unknown): string {
  if (data) {
    // Create hash from data
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return `"${Math.abs(hash).toString(16)}"`
  }

  // Generate timestamp-based ETag
  return `"${Date.now().toString(36)}"`
}

/**
 * Check if request ETag matches current ETag
 *
 * @param request Request with If-None-Match header
 * @param currentETag Current ETag to compare
 * @returns true if ETags match (should return 304)
 */
export function etagMatches(request: Request, currentETag: string): boolean {
  const ifNoneMatch = request.headers.get('if-none-match')
  return ifNoneMatch === currentETag
}

/**
 * Return 304 Not Modified if ETag matches
 *
 * @param request Request with If-None-Match header
 * @param currentETag Current ETag to compare
 * @returns NextResponse with 304 status if match, null otherwise
 */
export function conditionalCache(
  request: Request,
  currentETag: string
): NextResponse | null {
  if (etagMatches(request, currentETag)) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: currentETag,
        'Cache-Control': 'public, max-age=60',
      },
    })
  }
  return null
}

// ============================================================================
// REVALIDATION TRIGGERS
// ============================================================================

/**
 * Trigger revalidation of cached data
 *
 * Add this endpoint to manually purge/refresh caches when needed.
 */
export function createRevalidationResponse(tag: string): NextResponse {
  return NextResponse.json(
    {
      revalidated: true,
      now: Date.now(),
      tag,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'X-Revalidated': 'true',
      },
    }
  )
}

// ============================================================================
// CACHE KEY GENERATION
// ============================================================================

/**
 * Generate cache key from request parameters
 *
 * @param baseUrl Base URL path
 * @param params Query parameters
 * @returns Cache key string
 */
export function generateCacheKey(baseUrl: string, params: Record<string, string | string[]>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${Array.isArray(params[key]) ? params[key].join(',') : params[key]}`)
    .join('&')

  return sortedParams ? `${baseUrl}?${sortedParams}` : baseUrl
}

// ============================================================================
// RATE LIMITING HEADERS
// ============================================================================

/**
 * Add rate limit headers to response
 *
 * @param response NextResponse
 * @param limit Request limit
 * @param remaining Remaining requests
 * @param reset Unix timestamp of reset
 * @returns Response with rate limit headers
 */
export function withRateLimit(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number = Date.now() + 60000
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', reset.toString())

  return response
}

// ============================================================================
// CACHE STATUS HELPERS
// ============================================================================

/**
 * Check if response was served from cache
 *
 * @param response NextResponse
 * @returns true if response was cached
 */
export function isCachedResponse(response: NextResponse): boolean {
  const age = response.headers.get('Age')
  const xCache = response.headers.get('X-Cache')

  return !!(age || xCache === 'HIT')
}

/**
 * Get cache age in seconds
 *
 * @param response NextResponse
 * @returns Age in seconds or 0 if not cached
 */
export function getCacheAge(response: NextResponse): number {
  const age = response.headers.get('Age')
  return age ? parseInt(age, 10) : 0
}

// ============================================================================
// MARKET DATA SPECIFIC CACHING
// ============================================================================

/**
 * Get cache config for market data based on data type
 *
 * @param dataType Type of market data
 * @returns Cache configuration
 */
export function getMarketDataCacheConfig(dataType: 'realtime' | 'intraday' | 'eod' | 'historical'): CacheConfig {
  switch (dataType) {
    case 'realtime':
      return { maxAge: 30, staleWhileRevalidate: 60, strategy: 'stale-while-revalidate' }

    case 'intraday':
      return { maxAge: 60, staleWhileRevalidate: 120, strategy: 'stale-while-revalidate' }

    case 'eod':
      return { maxAge: 300, staleWhileRevalidate: 600, strategy: 'stale-while-revalidate' }

    case 'historical':
      return { maxAge: 3600, staleWhileRevalidate: 7200, strategy: 'stale-while-revalidate' }
  }
}

/**
 * Apply market data caching to response
 *
 * @param response NextResponse
 * @param dataType Type of market data
 * @returns Cached response
 */
export function withMarketDataCache(
  response: NextResponse,
  dataType: 'realtime' | 'intraday' | 'eod' | 'historical'
): NextResponse {
  return withCache(response, getMarketDataCacheConfig(dataType))
}
