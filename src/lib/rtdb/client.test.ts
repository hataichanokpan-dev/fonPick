/**
 * Tests for RTDB Client Wrapper
 *
 * TDD Approach:
 * 1. RED - Write failing tests first
 * 2. GREEN - Implement minimal code to pass
 * 3. REFACTOR - Improve while keeping tests green
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { rtdbGet, fetchWithFallback, isDataFresh, formatTimestamp, getDataAge, RTDBError } from './client'

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'mock-app' })),
}))

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({ name: 'mock-db' })),
  ref: vi.fn((db, path) => ({ path })),
  get: vi.fn(),
}))

// Import mocked modules
import { get } from 'firebase/database'

describe('rtdbGet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return data when snapshot exists', async () => {
    const mockData = { setIndex: 1000, setIndexChg: 10 }
    const mockSnapshot = {
      exists: () => true,
      val: () => mockData,
    }

    vi.mocked(get).mockResolvedValue(mockSnapshot as never)

    const result = await rtdbGet('/test/path')

    expect(result).toEqual(mockData)
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('should return null when snapshot does not exist', async () => {
    const mockSnapshot = {
      exists: () => false,
      val: () => null,
    }

    vi.mocked(get).mockResolvedValue(mockSnapshot as never)

    const result = await rtdbGet('/test/path')

    expect(result).toBeNull()
  })

  it('should handle permission denied errors gracefully', async () => {
    const error = new Error('Permission denied')
    error.message = 'Permission denied'

    vi.mocked(get).mockRejectedValue(error as never)

    const result = await rtdbGet('/test/path')

    expect(result).toBeNull()
  })

  it('should handle unauthorized errors gracefully', async () => {
    const error = new Error('Unauthorized')
    error.message = 'Unauthorized access'

    vi.mocked(get).mockRejectedValue(error as never)

    const result = await rtdbGet('/test/path')

    expect(result).toBeNull()
  })

  it('should throw RTDBError for other errors', async () => {
    const error = new Error('Network error')

    vi.mocked(get).mockRejectedValue(error as never)

    await expect(rtdbGet('/test/path')).rejects.toThrow(RTDBError)
  })

  it('should include path in RTDBError', async () => {
    const error = new Error('Database connection failed')

    vi.mocked(get).mockRejectedValue(error as never)

    try {
      await rtdbGet('/test/path')
      expect.fail('Should have thrown RTDBError')
    } catch (e) {
      expect(e).toBeInstanceOf(RTDBError)
      expect((e as RTDBError).path).toBe('/test/path')
    }
  })
})

describe('fetchWithFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return data from primary path when available', async () => {
    const primaryData = { setIndex: 1000, setIndexChg: 10 }
    const mockSnapshot = {
      exists: () => true,
      val: () => primaryData,
    }

    vi.mocked(get).mockResolvedValue(mockSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toEqual(primaryData)
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('should return null when primary path returns null', async () => {
    const mockSnapshot = {
      exists: () => false,
      val: () => null,
    }

    vi.mocked(get).mockResolvedValue(mockSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toBeNull()
  })

  it('should return null when primary path returns empty object', async () => {
    const mockSnapshot = {
      exists: () => true,
      val: () => ({}), // Empty object
    }

    vi.mocked(get).mockResolvedValue(mockSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    // Empty object is falsy in terms of data content
    expect(result).toBeNull()
  })

  it('should return null when primary path returns empty array', async () => {
    const mockSnapshot = {
      exists: () => true,
      val: () => [], // Empty array
    }

    vi.mocked(get).mockResolvedValue(mockSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    // Empty array is falsy in terms of data content
    expect(result).toBeNull()
  })

  it('should try fallback path when primary returns null', async () => {
    // Primary call returns null
    const primarySnapshot = {
      exists: () => false,
      val: () => null,
    }

    // Fallback call returns data
    const fallbackData = { setIndex: 990, setIndexChg: 5 }
    const fallbackSnapshot = {
      exists: () => true,
      val: () => fallbackData,
    }

    vi.mocked(get)
      .mockResolvedValueOnce(primarySnapshot as never)
      .mockResolvedValueOnce(fallbackSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toEqual(fallbackData)
    expect(get).toHaveBeenCalledTimes(2)
  })

  it('should try fallback path when primary returns empty object', async () => {
    // Primary call returns empty object
    const primarySnapshot = {
      exists: () => true,
      val: () => ({}),
    }

    // Fallback call returns data
    const fallbackData = { setIndex: 990, setIndexChg: 5 }
    const fallbackSnapshot = {
      exists: () => true,
      val: () => fallbackData,
    }

    vi.mocked(get)
      .mockResolvedValueOnce(primarySnapshot as never)
      .mockResolvedValueOnce(fallbackSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toEqual(fallbackData)
  })

  it('should return null when both primary and fallback fail', async () => {
    const nullSnapshot = {
      exists: () => false,
      val: () => null,
    }

    vi.mocked(get).mockResolvedValue(nullSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toBeNull()
    expect(get).toHaveBeenCalledTimes(2)
  })

  it('should return null when fallback path is not provided and primary fails', async () => {
    const nullSnapshot = {
      exists: () => false,
      val: () => null,
    }

    vi.mocked(get).mockResolvedValue(nullSnapshot as never)

    const result = await fetchWithFallback('/primary/path')

    expect(result).toBeNull()
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('should handle errors from primary path and try fallback', async () => {
    // Primary call throws error
    const error = new Error('Network error on primary')
    vi.mocked(get).mockRejectedValueOnce(error as never)

    // Fallback call succeeds
    const fallbackData = { setIndex: 990, setIndexChg: 5 }
    const fallbackSnapshot = {
      exists: () => true,
      val: () => fallbackData,
    }
    vi.mocked(get).mockResolvedValueOnce(fallbackSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toEqual(fallbackData)
  })

  it('should return null when both primary and fallback throw errors', async () => {
    const error = new Error('Network error')
    vi.mocked(get).mockRejectedValue(error as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toBeNull()
  })

  it('should accept non-empty object as valid data', async () => {
    const data = { setIndex: 1000 }
    const mockSnapshot = {
      exists: () => true,
      val: () => data,
    }

    vi.mocked(get).mockResolvedValue(mockSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toEqual(data)
  })

  it('should accept non-empty array as valid data', async () => {
    const data = [{ symbol: 'ADVANC', price: 100 }]
    const mockSnapshot = {
      exists: () => true,
      val: () => data,
    }

    vi.mocked(get).mockResolvedValue(mockSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toEqual(data)
  })

  it('should accept primitive values as valid data', async () => {
    const mockSnapshot = {
      exists: () => true,
      val: () => 1234,
    }

    vi.mocked(get).mockResolvedValue(mockSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toBe(1234)
  })

  it('should accept zero as valid data', async () => {
    const mockSnapshot = {
      exists: () => true,
      val: () => 0,
    }

    vi.mocked(get).mockResolvedValue(mockSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toBe(0)
  })

  it('should accept false as valid data', async () => {
    const mockSnapshot = {
      exists: () => true,
      val: () => false,
    }

    vi.mocked(get).mockResolvedValue(mockSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toBe(false)
  })

  it('should accept empty string as valid data', async () => {
    const mockSnapshot = {
      exists: () => true,
      val: () => '',
    }

    vi.mocked(get).mockResolvedValue(mockSnapshot as never)

    const result = await fetchWithFallback('/primary/path', '/fallback/path')

    expect(result).toBe('')
  })
})

describe('isDataFresh', () => {
  it('should return true for fresh data', () => {
    const now = Date.now()
    const result = isDataFresh(now, 60000) // 1 minute max age

    expect(result).toBe(true)
  })

  it('should return false for stale data', () => {
    const oldTimestamp = Date.now() - 120000 // 2 minutes ago
    const result = isDataFresh(oldTimestamp, 60000) // 1 minute max age

    expect(result).toBe(false)
  })

  it('should use default max age of 1 hour', () => {
    const recentTimestamp = Date.now() - 30000 // 30 seconds ago
    const result = isDataFresh(recentTimestamp)

    expect(result).toBe(true)
  })

  it('should return false for data older than 1 hour with default max age', () => {
    const oldTimestamp = Date.now() - 3600001 // 1 hour + 1ms ago
    const result = isDataFresh(oldTimestamp)

    expect(result).toBe(false)
  })
})

describe('formatTimestamp', () => {
  it('should format timestamp correctly', () => {
    const timestamp = new Date('2025-01-25T14:30:00Z').getTime()
    const result = formatTimestamp(timestamp)

    // Format depends on locale, but should contain key parts
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('should handle epoch timestamp', () => {
    const timestamp = 0
    const result = formatTimestamp(timestamp)

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
})

describe('getDataAge', () => {
  it('should return minutes ago for recent data', () => {
    const timestamp = Date.now() - 30 * 60000 // 30 minutes ago
    const result = getDataAge(timestamp)

    expect(result).toBe('30m ago')
  })

  it('should return hours ago for data older than 1 hour', () => {
    const timestamp = Date.now() - 2 * 3600000 // 2 hours ago
    const result = getDataAge(timestamp)

    expect(result).toBe('2h ago')
  })

  it('should return days ago for data older than 24 hours', () => {
    const timestamp = Date.now() - 3 * 86400000 // 3 days ago
    const result = getDataAge(timestamp)

    expect(result).toBe('3d ago')
  })

  it('should return 0m ago for current timestamp', () => {
    const timestamp = Date.now()
    const result = getDataAge(timestamp)

    expect(result).toBe('0m ago')
  })
})

describe('RTDBError', () => {
  it('should create error with message and code', () => {
    const error = new RTDBError('Test error', 'TEST_CODE')

    expect(error.message).toBe('Test error')
    expect(error.code).toBe('TEST_CODE')
    expect(error.name).toBe('RTDBError')
  })

  it('should include optional path', () => {
    const error = new RTDBError('Test error', 'TEST_CODE', '/test/path')

    expect(error.path).toBe('/test/path')
  })

  it('should be instanceof Error', () => {
    const error = new RTDBError('Test error', 'TEST_CODE')

    expect(error instanceof Error).toBe(true)
  })
})
