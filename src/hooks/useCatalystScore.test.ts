/**
 * useCatalystScore Hook Tests
 *
 * Test suite for the useCatalystScore hook following TDD principles.
 *
 * Issues to fix:
 * 1. API Error: When result.success = false, the hook should set error state
 * 2. Invalid React child: Ensure data is always valid or null when passed to components
 */

import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCatalystScore } from './useCatalystScore'
import type { ParsedCatalystData } from '@/types/catalyst'

// ============================================================================
// MOCKS
// ============================================================================

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// ============================================================================
// TEST DATA
// ============================================================================

const mockSuccessResponse = {
  success: true,
  data: {
    theme: 'Test investment theme',
    catalysts: ['Event 1', 'Event 2'],
    whatToWatch: ['Metric 1', 'Metric 2'],
    aiScore: 7,
  } as ParsedCatalystData,
}

const mockErrorResponse = {
  success: false,
  error: 'Failed to fetch catalyst analysis',
  message: 'Network timeout',
  meta: {
    symbol: 'TEST',
    fetchedAt: Date.now(),
  },
}

const mockInvalidResponse = {
  success: false,
  error: 'Invalid data',
}

// ============================================================================
// SETUP
// ============================================================================

beforeEach(() => {
  mockFetch.mockClear()
})

// ============================================================================
// TEST SUITES
// ============================================================================

describe('useCatalystScore', () => {
  describe('Issue 1: API Error handling', () => {
    it('should set error state when API returns success: false with error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorResponse,
      })

      const { result } = renderHook(() => useCatalystScore('TEST', true))

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have error state set
      expect(result.current.error).not.toBeNull()
      expect(result.current.error).toContain('timeout')
    })

    it('should set error state when API returns success: false without message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockInvalidResponse,
      })

      const { result } = renderHook(() => useCatalystScore('TEST', true))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have error state set even without message
      expect(result.current.error).not.toBeNull()
      expect(result.current.error).toContain('Invalid data')
    })

    it('should set error state when API returns success: false with empty object', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      })

      const { result } = renderHook(() => useCatalystScore('TEST', true))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have error state set
      expect(result.current.error).not.toBeNull()
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useCatalystScore('TEST', true))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.aiScore).toBeNull()
      expect(result.current.data).toBeNull()
    })

    it('should set aiScore and data to null on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorResponse,
      })

      const { result } = renderHook(() => useCatalystScore('TEST', true))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // When API fails, aiScore and data should be null (not 0 or undefined object)
      expect(result.current.aiScore).toBeNull()
      expect(result.current.data).toBeNull()
      expect(result.current.error).not.toBeNull()
    })
  })

  describe('Issue 2: Data validation for React rendering', () => {
    it('should return valid data structure on successful fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      })

      const { result } = renderHook(() => useCatalystScore('TEST', true))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Data should be valid ParsedCatalystData
      expect(result.current.data).toEqual(mockSuccessResponse.data)
      expect(result.current.aiScore).toBe(7)
      expect(result.current.error).toBeNull()
    })

    it('should return null data when API response has no data field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, aiScore: 5 }), // Missing data field
      })

      const { result } = renderHook(() => useCatalystScore('TEST', true))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // aiScore should fallback to aiScore from response
      expect(result.current.aiScore).toBe(5)
      // data should be null (not undefined or invalid object)
      expect(result.current.data).toBeNull()
    })

    it('should handle null data from API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: null, aiScore: null }),
      })

      const { result } = renderHook(() => useCatalystScore('TEST', true))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // When data is null and aiScore is null, both should be null
      expect(result.current.aiScore).toBeNull()
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should provide safe-to-render values even after error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorResponse,
      })

      const { result } = renderHook(() => useCatalystScore('TEST', true))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // These values should be safe for React rendering
      // null won't cause "Objects are not valid as a React child" error
      expect(result.current.data).toBeNull()
      expect(result.current.aiScore).toBeNull()

      // Rendering should be safe
      const { aiScore, data } = result.current
      expect(() => {
        // These should not throw "Objects are not valid as a React child" error
        String(aiScore) // null becomes "null" string
        String(data) // null becomes "null" string
      }).not.toThrow()
    })
  })

  describe('autoFetch parameter', () => {
    it('should not fetch on mount when autoFetch is false', async () => {
      renderHook(() => useCatalystScore('TEST', false))

      // Wait a bit to ensure no fetch was triggered
      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled()
      })
    })

    it('should fetch on mount when autoFetch is true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      })

      renderHook(() => useCatalystScore('TEST', true))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('refetch function', () => {
    it('should refetch data when refetch is called', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuccessResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...mockSuccessResponse,
            data: { ...mockSuccessResponse.data, aiScore: 9 },
          }),
        })

      const { result } = renderHook(() => useCatalystScore('TEST', true))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.aiScore).toBe(7)

      // Refetch
      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.aiScore).toBe(9)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should handle error on refetch', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuccessResponse,
        })
        .mockRejectedValueOnce(new Error('Refetch failed'))

      const { result } = renderHook(() => useCatalystScore('TEST', true))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.error).toBeNull()

      // Refetch that fails
      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Refetch failed')
      expect(result.current.data).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle empty symbol', async () => {
      renderHook(() => useCatalystScore('', true))

      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled()
      })
    })

    it('should reset state on refetch after error', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuccessResponse,
        })

      const { result } = renderHook(() => useCatalystScore('TEST', true))

      // First fetch fails
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.error).toBe('First error')

      // Refetch succeeds
      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.aiScore).toBe(7)
      expect(result.current.data).not.toBeNull()
    })
  })
})
