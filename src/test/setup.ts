/**
 * Vitest Setup
 * Global test configuration and utilities
 */

import { vi, expect } from 'vitest'

// Mock console.time/console.timeEnd for performance testing
global.console.time = vi.fn((label: string) => label)
global.console.timeEnd = vi.fn((label: string) => label)

// Add custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    }
    return {
      message: () =>
        `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass: false,
    }
  },
})

// Type declarations
declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
}

interface CustomMatchers<R = any> {
  toBeWithinRange(floor: number, ceiling: number): R
}
