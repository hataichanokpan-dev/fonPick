/**
 * Performance Utilities
 * fonPick - Thai Stock Market Application
 *
 * This module provides:
 * - Debounce and throttle functions
 * - Memoization helpers
 * - Lazy loading utilities
 * - Performance monitoring
 */

// ==================================================================
// TIMING UTILITIES
// ==================================================================

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, wait)
  }
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function throttled(...args: Parameters<T>) {
    const now = Date.now()
    const remaining = wait - (now - lastTime)

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastTime = now
      func(...args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now()
        timeoutId = null
        func(...args)
      }, remaining)
    }
  }
}

/**
 * Delays execution by a specified number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ==================================================================
// MEMOIZATION
// ==================================================================

/**
 * Simple memoization cache
 */
export class MemoCache<K, V> {
  private cache = new Map<K, { value: V; expiry: number }>()
  private ttl: number

  constructor(ttl: number = 5000) {
    this.ttl = ttl
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return undefined
    }

    return entry.value
  }

  set(key: K, value: V): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
    })
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}

/**
 * Creates a memoized version of a function
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

// ==================================================================
// LAZY LOADING
// ==================================================================

/**
 * Creates a lazy-loaded value that is computed on first access
 */
export function createLazy<T>(factory: () => T): () => T {
  let value: T | undefined
  let initialized = false

  return () => {
    if (!initialized) {
      value = factory()
      initialized = true
    }
    return value!
  }
}

/**
 * Lazy component loader for React dynamic imports
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  _fallback?: React.ReactNode
) {
  return React.lazy(() => importFunc())
}

// ==================================================================
// REQUEST CANCELLATION
// ==================================================================

/**
 * Creates an abortable async operation
 */
export async function abortable<T>(
  signal: AbortSignal,
  operation: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  if (signal.aborted) {
    throw new Error('Operation was aborted')
  }

  try {
    return await operation(signal)
  } catch (error) {
    if (signal.aborted) {
      throw new Error('Operation was aborted')
    }
    throw error
  }
}

/**
 * Creates a timeout promise that rejects after specified milliseconds
 */
export function timeout(ms: number, message = 'Operation timed out'): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms)
  })
}

/**
 * Races a promise against a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = 'Operation timed out'
): Promise<T> {
  return Promise.race([promise, timeout(ms, message)])
}

// ==================================================================
// PERFORMANCE MONITORING
// ==================================================================

/**
 * Measures the execution time of a function
 */
export async function measureTime<T>(
  label: string,
  func: () => T | Promise<T>
): Promise<T> {
  const start = performance.now()
  try {
    return await func()
  } finally {
    const duration = performance.now() - start
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
    }
  }
}

/**
 * Synchronous version of measureTime
 */
export function measureTimeSync<T>(
  label: string,
  func: () => T
): T {
  const start = performance.now()
  try {
    return func()
  } finally {
    const duration = performance.now() - start
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
    }
  }
}

/**
 * Creates a performance marker
 */
export class PerformanceMarker {
  private marks = new Map<string, number>()

  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark)
    if (!start) {
      console.warn(`Mark "${startMark}" not found`)
      return 0
    }

    const end = performance.now()
    const duration = end - start

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  clear(): void {
    this.marks.clear()
  }
}

// ==================================================================
// BATCHING
// ==================================================================

/**
 * Batches function calls to run in a single frame
 */
export function batch<T>(func: () => T): T {
  if (typeof requestAnimationFrame !== 'undefined') {
    return func()
  }
  return func()
}

/**
 * Debounces multiple updates into a single batch
 */
export function createBatcher<T>(
  processBatch: (items: T[]) => void,
  wait: number = 0
) {
  let items: T[] = []
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (item: T) => {
    items.push(item)

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      const batch = [...items]
      items = []
      timeoutId = null
      processBatch(batch)
    }, wait)
  }
}

// ==================================================================
// IDLE CALLBACK
// ==================================================================

/**
 * Schedules a function to run when the browser is idle
 */
export function whenIdle(
  callback: () => void,
  timeout: number = 2000
): () => void {
  if (typeof requestIdleCallback !== 'undefined') {
    const handle = requestIdleCallback(() => callback(), { timeout })
    return () => cancelIdleCallback(handle)
  }

  // Fallback to setTimeout
  const handle = setTimeout(callback, 0)
  return () => clearTimeout(handle)
}

// ==================================================================
// IMPORT SHORTCUTS FOR REACT
// ==================================================================

// Import React types for lazy loading
import React from 'react'
