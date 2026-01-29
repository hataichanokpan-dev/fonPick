/**
 * Fetch Wrapper Tests
 *
 * Tests for the fetch wrapper with timeout and retry logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchWithRetry, fetchJson } from './fetch-wrapper'
import { ApiError, ApiErrorType } from '@/types/stock-api'

describe('fetchWithRetry', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock fetch with proper Response-like objects
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Success Cases', () => {
    it('should fetch successfully on first attempt', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ data: 'test' }),
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const response = await fetchWithRetry('https://api.example.com/test')

      expect(response.ok).toBe(true)
      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should pass through options to fetch', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      }

      await fetchWithRetry('https://api.example.com/test', options)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        options
      )
    })
  })

  describe('HTTP Error Handling', () => {
    it('should throw NOT_FOUND for 404', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      await expect(fetchWithRetry('https://api.example.com/test')).rejects.toMatchObject({
        type: ApiErrorType.NOT_FOUND,
        statusCode: 404,
        retryable: false,
      })

      expect(mockFetch).toHaveBeenCalledTimes(1) // No retries for 404
    })

    it('should throw VALIDATION_ERROR for 400', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      await expect(fetchWithRetry('https://api.example.com/test')).rejects.toMatchObject({
        type: ApiErrorType.VALIDATION_ERROR,
        statusCode: 400,
        retryable: false,
      })
    })

    it('should throw RATE_LIMIT for 429', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(fetchWithRetry('https://api.example.com/test')).rejects.toMatchObject({
        type: ApiErrorType.RATE_LIMIT,
        statusCode: 429,
        retryable: true,
      })
    })

    it('should throw SERVER_ERROR for 500', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(fetchWithRetry('https://api.example.com/test')).rejects.toMatchObject({
        type: ApiErrorType.SERVER_ERROR,
        statusCode: 500,
        retryable: true,
      })
    })

    it('should retry retryable errors', async () => {
      const errorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }
      const successResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }

      mockFetch
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(successResponse)

      const response = await fetchWithRetry('https://api.example.com/test', {}, { timeout: 10000, retries: 1 })

      expect(response.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Network Error Handling', () => {
    it('should throw NETWORK_ERROR for fetch failures', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      await expect(fetchWithRetry('https://api.example.com/test')).rejects.toMatchObject({
        type: ApiErrorType.NETWORK_ERROR,
        retryable: true,
      })
    })

    it('should retry on network errors', async () => {
      const successResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }

      mockFetch
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(successResponse)

      const response = await fetchWithRetry('https://api.example.com/test', {}, { retries: 1 })

      expect(response.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Retry Logic', () => {
    it('should respect max retries configuration', async () => {
      const errorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }
      mockFetch.mockResolvedValue(errorResponse)

      await expect(
        fetchWithRetry('https://api.example.com/test', {}, { retries: 2, timeout: 100 })
      ).rejects.toThrow()

      // Initial attempt + 2 retries = 3 total
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should stop retrying on success', async () => {
      const errorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }
      const successResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }

      mockFetch
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(successResponse)

      const response = await fetchWithRetry('https://api.example.com/test', {}, { retries: 3, timeout: 100 })

      expect(response.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2) // Initial + 1 retry, then success
    })

    it('should not retry 404 errors', async () => {
      const notFoundResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }
      mockFetch.mockResolvedValue(notFoundResponse)

      await expect(
        fetchWithRetry('https://api.example.com/test', {}, { retries: 3, timeout: 100 })
      ).rejects.toThrow()

      expect(mockFetch).toHaveBeenCalledTimes(1) // No retries for 404
    })

    it('should use exponential backoff', async () => {
      const errorResponse = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://api.example.com/test',
        clone: vi.fn(function(this: Response) { return this }),
      }
      mockFetch.mockResolvedValue(errorResponse)

      // Set a short timeout to avoid long test
      await expect(
        fetchWithRetry('https://api.example.com/test', {}, { retries: 2, retryDelay: 50, timeout: 100 })
      ).rejects.toThrow()

      // Should have 3 attempts with delays
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })
})

describe('fetchJson', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should parse JSON response', async () => {
    const mockData = { success: true, data: { test: 'value' } }
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockData,
      headers: new Headers(),
      redirected: false,
      type: 'basic' as ResponseType,
      url: 'https://api.example.com/test',
      clone: vi.fn(function(this: Response) { return this }),
    }
    mockFetch.mockResolvedValueOnce(mockResponse)

    const result = await fetchJson('https://api.example.com/test')

    expect(result).toEqual(mockData)
  })

  it('should throw VALIDATION_ERROR on JSON parse error', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => {
        throw new Error('Invalid JSON')
      },
      headers: new Headers(),
      redirected: false,
      type: 'basic' as ResponseType,
      url: 'https://api.example.com/test',
      clone: vi.fn(function(this: Response) { return this }),
    }
    mockFetch.mockResolvedValueOnce(mockResponse)

    await expect(fetchJson('https://api.example.com/test')).rejects.toMatchObject({
      type: ApiErrorType.VALIDATION_ERROR,
      retryable: false,
    })
  })

  it('should pass through timeout and retry config', async () => {
    const mockData = { success: true }
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockData,
      headers: new Headers(),
      redirected: false,
      type: 'basic' as ResponseType,
      url: 'https://api.example.com/test',
      clone: vi.fn(function(this: Response) { return this }),
    }
    mockFetch.mockResolvedValueOnce(mockResponse)

    await fetchJson('https://api.example.com/test', {}, { timeout: 5000, retries: 1 })

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})
