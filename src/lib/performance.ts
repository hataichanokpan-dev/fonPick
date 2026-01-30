/**
 * Performance Utilities
 *
 * Helper functions for optimizing component performance:
 * - Memoization helpers
 * - Lazy loading utilities
 * - Debounce/throttle functions
 */

import { memo, ComponentType, useState, useRef, useEffect } from 'react'

// ==================================================================
// MEMOIZATION HELPERS
// ==================================================================

/**
 * Creates a memoized component with a custom comparison function
 * that compares specific props instead of shallow comparison
 */
export function memoByProps<T extends Record<string, any>>(
  component: ComponentType<T>,
  propKeys: (keyof T)[]
): ComponentType<T> {
  return memo(component, (prevProps, nextProps) => {
    // Only check the specified props
    for (const key of propKeys) {
      if (prevProps[key] !== nextProps[key]) {
        return false
      }
    }
    return true
  })
}

/**
 * Creates a memoized component that compares data by ID
 * Useful for list items where you only care about ID changes
 */
export function memoById<T extends { id: string | number } & Record<string, any>>(
  component: ComponentType<T>
): ComponentType<T> {
  return memo(component, (prevProps, nextProps) => {
    return prevProps.id === nextProps.id
  })
}

/**
 * Creates a memoized component that only re-renders when data changes
 * Ignores loading and error state changes
 */
export function memoByData<T extends { data?: any } & Record<string, any>>(
  component: ComponentType<T>
): ComponentType<T> {
  return memo(component, (prevProps, nextProps) => {
    return prevProps.data === nextProps.data
  })
}

// ==================================================================
// LAZY LOADING UTILITIES
// ==================================================================

/**
 * Creates a lazy-loaded component with a loading fallback
 */
export function createLazyComponent<T extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback: React.ReactNode = null
) {
  return {
    component: importFn,
    fallback,
  }
}

/**
 * Hook for lazy loading modules with intersection observer
 */
export function useLazyLoad(
  threshold: number = 0.1,
  rootMargin: string = '50px'
) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  return [elementRef, isVisible] as const
}

// ==================================================================
// THROTTLE/DEBOUNCE UTILITIES
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

// ==================================================================
// DATA CACHING UTILITIES
// ==================================================================

/**
 * Simple in-memory cache for API responses
 */
export class DataCache<T = any> {
  private cache = new Map<string, { data: T; timestamp: number }>()
  private ttl: number

  constructor(ttl: number = 60000) {
    this.ttl = ttl // Default TTL: 1 minute
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > this.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  size(): number {
    return this.cache.size
  }
}

// ==================================================================
// PERFORMANCE MONITORING
// ==================================================================

/**
 * Simple performance marker for measuring render times
 */
export class PerformanceMonitor {
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
    this.marks.set(name, duration)

    return duration
  }

  getMark(name: string): number | undefined {
    return this.marks.get(name)
  }

  log(name: string): void {
    const duration = this.marks.get(name)
    if (duration !== undefined) {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    }
  }

  clear(): void {
    this.marks.clear()
  }
}

// ==================================================================
// BATCH UPDATE UTILITIES
// ==================================================================

/**
 * Batches state updates to prevent unnecessary re-renders
 */
export function createBatchUpdater<T>(
  setState: (updater: T | ((prev: T) => T)) => void,
  delay: number = 0
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let pendingUpdates: Array<(prev: T) => T> = []

  return function batchUpdate(updater: (prev: T) => T) {
    pendingUpdates.push(updater)

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      setState((prev) => {
        let result = prev
        for (const update of pendingUpdates) {
          result = update(result)
        }
        return result
      })
      pendingUpdates = []
      timeoutId = null
    }, delay)
  }
}

// ==================================================================
// VIRTUAL LIST UTILITIES
// ==================================================================

/**
 * Calculates the range of visible items in a virtual list
 */
export function getVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  buffer: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const end = Math.min(totalItems, start + visibleCount + buffer * 2)

  return { start, end }
}

/**
 * Calculates the total height of a virtual list
 */
export function getTotalHeight(itemHeight: number, totalItems: number): number {
  return itemHeight * totalItems
}

/**
 * Calculates the offset for positioning items in a virtual list
 */
export function getOffset(index: number, itemHeight: number): number {
  return index * itemHeight
}
