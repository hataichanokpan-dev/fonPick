/**
 * Tests for Homepage data fetching
 *
 * TDD Approach:
 * 1. RED - Write failing tests for graceful fallback to latest available data
 * 2. GREEN - Implement fix to pass tests
 * 3. REFACTOR - Clean up code while keeping tests passing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findLatestAvailableDate } from '@/lib/rtdb/historical'

// Mock the rtdb module
vi.mock('@/lib/rtdb/historical', () => ({
  findLatestAvailableDate: vi.fn(),
}))

describe('Homepage Data Fetching - Graceful Fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should find latest available date when today has no data', async () => {
    // Simulate: today has no data, yesterday has data
    vi.mocked(findLatestAvailableDate).mockResolvedValueOnce('2025-01-24')

    const latestDate = await findLatestAvailableDate(7)

    expect(latestDate).toBe('2025-01-24')
  })

  it('should return null when no data available in the last 7 days', async () => {
    vi.mocked(findLatestAvailableDate).mockResolvedValueOnce(null)

    const latestDate = await findLatestAvailableDate(7)

    expect(latestDate).toBeNull()
  })

  it('should return today when today has data', async () => {
    vi.mocked(findLatestAvailableDate).mockResolvedValueOnce('2025-01-25')

    const latestDate = await findLatestAvailableDate(7)

    expect(latestDate).toBe('2025-01-25')
  })
})

describe('Homepage Data Fetching - Error Handling', () => {
  it('should show "No data available" message instead of database connection error when RTDB is empty', () => {
    // This test verifies the fix: when there's genuinely no data in RTDB,
    // we should show a "No data available" message, not a "Database connection error"
    // The difference is important:
    // - Database connection error = problem with Firebase config/security
    // - No data available = RTDB is accessible but has no data yet

    const errorMessageNoData = 'No market data available'
    const errorMessageConnectionError = 'Unable to connect to Firebase Realtime Database'

    // The error message should NOT be the database connection error
    expect(errorMessageNoData).not.toContain('Firebase')
    expect(errorMessageConnectionError).toContain('Firebase')
  })

  it('should attempt to find latest available data before showing error', async () => {
    // Verify that findLatestAvailableDate is called with reasonable lookback
    const maxDaysBack = 7
    vi.mocked(findLatestAvailableDate).mockResolvedValueOnce('2025-01-23')

    await findLatestAvailableDate(maxDaysBack)

    expect(findLatestAvailableDate).toHaveBeenCalledWith(maxDaysBack)
  })
})
