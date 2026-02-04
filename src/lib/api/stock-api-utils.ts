/**
 * Stock API Utilities
 *
 * Shared utilities for stock API routes including:
 * - CORS origin validation
 * - Bounded in-memory cache
 * - Rate limiting
 * - Common types and helpers
 */

import { NextRequest } from 'next/server'

// ============================================================================
// TYPES
// ============================================================================

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    symbol: string
    fetchedAt: number
    cached?: boolean
  }
}

/**
 * Cache entry with TTL
 */
interface CacheEntry<T> {
  data: T
  expiry: number
  accessAt: number // For LRU eviction
}

/**
 * Rate limit entry
 */
interface RateLimitEntry {
  count: number
  resetAt: number
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Allowed CORS origins
 * In production, configure via environment variable
 */
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.NEXT_PUBLIC_APP_URL || 'https://fonpick.vercel.app',
    ].filter(Boolean)

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  maxRequests: 60, // requests per window
  windowMs: 60 * 1000, // 1 minute window
} as const


// ============================================================================
// RATE LIMITER
// ============================================================================

/**
 * In-memory rate limiter
 * Map structure: clientIdentifier -> { count, resetAt }
 */
const rateLimitMap = new Map<string, RateLimitEntry>()

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimitEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitEntries, 60 * 1000)
}

/**
 * Check rate limit for a client
 *
 * @param identifier Client identifier (IP or symbol+IP combo)
 * @returns true if rate limit exceeded
 */
export function checkRateLimit(identifier: string): { exceeded: boolean; resetAt?: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // Create new entry or reset expired window
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_CONFIG.windowMs,
    })
    return { exceeded: false }
  }

  // Increment counter
  entry.count++

  // Check if limit exceeded
  if (entry.count > RATE_LIMIT_CONFIG.maxRequests) {
    return { exceeded: true, resetAt: entry.resetAt }
  }

  return { exceeded: false }
}

// ============================================================================
// BOUNDED CACHE
// ============================================================================

/**
 * Generic bounded cache with LRU eviction
 */
export class BoundedCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private maxSize: number
  private ttl: number

  constructor(maxSize: number, ttl: number) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }

  /**
   * Get cached entry if valid
   */
  get(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    const now = Date.now()
    if (now > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    // Update access time for LRU
    entry.accessAt = now
    return entry.data
  }

  /**
   * Set cached entry with LRU eviction
   */
  set(key: string, data: T): void {
    const now = Date.now()

    // If at max size, evict least recently used
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      let lruKey: string | null = null
      let lruTime = Infinity

      for (const [k, entry] of this.cache.entries()) {
        if (entry.accessAt < lruTime) {
          lruTime = entry.accessAt
          lruKey = k
        }
      }

      if (lruKey) {
        this.cache.delete(lruKey)
      }
    }

    this.cache.set(key, {
      data,
      expiry: now + this.ttl,
      accessAt: now,
    })
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * Delete specific entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
}

// ============================================================================
// CORS UTILITIES
// ============================================================================

/**
 * Validate origin against allowed origins list
 *
 * @param origin Origin header value
 * @returns true if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    return true // Same-origin requests are always allowed
  }

  // Check exact match
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true
  }

  // For development, allow localhost on any port
  if (process.env.NODE_ENV === 'development') {
    const localhostMatch = /^http:\/\/localhost:\d+$/.test(origin)
    if (localhostMatch) {
      return true
    }
  }

  return false
}

/**
 * Build CORS headers with origin validation
 *
 * @param request NextRequest
 * @returns CORS headers
 */
export function getCorsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get('origin')

  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  }

  // Only set Access-Control-Allow-Origin if origin is validated
  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Vary'] = 'Origin'
  } else if (!origin) {
    // For same-origin requests, don't set the header
    // Browser won't send CORS headers for same-origin
  }

  return headers
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate stock symbol format
 *
 * Thai stock symbols are typically 2-6 uppercase letters
 * Examples: PTT (3), AOT (3), KBANK (5), ADVANC (6)
 *
 * @param symbol Stock symbol to validate
 * @returns true if valid
 */
export function validateSymbol(symbol: string): boolean {
  // Thai stock symbols are 2-6 uppercase letters
  const symbolPattern = /^[A-Z]{2,6}$/
  return symbolPattern.test(symbol)
}

// ============================================================================
// CLIENT IDENTIFICATION
// ============================================================================

/**
 * Get client identifier for rate limiting
 * Combines IP address and optionally the symbol for per-symbol limits
 *
 * @param request NextRequest
 * @param symbol Optional stock symbol for per-symbol rate limiting
 * @returns Client identifier
 */
export function getClientIdentifier(request: NextRequest, symbol?: string): string {
  // Try to get real IP from headers (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  const ip = forwardedFor?.split(',')[0]?.trim()
    || realIp
    || cfConnectingIp
    || 'unknown'

  // Rate limit per symbol+IP to prevent abusing specific stocks
  return symbol ? `${ip}:${symbol}` : ip
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Custom error for stock API failures
 */
export class StockApiError extends Error {
  constructor(
    public statusCode: number,
    public symbol: string,
    message: string
  ) {
    super(message)
    this.name = 'StockApiError'
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends Error {
  constructor(
    public resetAt: number,
    message: string = 'Rate limit exceeded'
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}
