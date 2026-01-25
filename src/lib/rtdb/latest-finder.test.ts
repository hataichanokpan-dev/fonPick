/**
 * Tests for Latest Date Finder
 *
 * TDD Approach:
 * 1. RED - Write failing tests for weekend fallback logic
 * 2. GREEN - Implement findLatestDateWithData to pass tests
 * 3. REFACTOR - Improve while keeping tests passing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the rtdbGet function
vi.mock('./client', () => ({
  rtdbGet: vi.fn(),
}))

import { findLatestDateWithData } from './latest-finder'
import { rtdbGet } from './client'

describe('findLatestDateWithData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return today when today has data', async () => {
    // Mock: today has market overview data
    vi.mocked(rtdbGet).mockResolvedValueOnce({ setIndex: 1300 } as never)

    const result = await findLatestDateWithData(3)

    expect(result).toBe('2026-01-25') // Today in mock (actual date when test runs)
  })

  it('should return yesterday when today has no data but yesterday does', async () => {
    // Mock: today returns null, yesterday returns data
    vi.mocked(rtdbGet)
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce({ setIndex: 1290 } as never)

    const result = await findLatestDateWithData(3)

    expect(result).toBe('2026-01-24') // Yesterday
  })

  it('should return 2 days ago when today and yesterday have no data', async () => {
    // Mock: today null, yesterday null, 2 days ago has data
    vi.mocked(rtdbGet)
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce({ setIndex: 1280 } as never)

    const result = await findLatestDateWithData(5)

    expect(result).toBe('2026-01-23') // 2 days ago
  })

  it('should return null when no data in lookback period', async () => {
    // Mock: all null
    vi.mocked(rtdbGet).mockResolvedValue(null as never)

    const result = await findLatestDateWithData(7)

    expect(result).toBeNull()
  })

  it('should respect maxDaysBack parameter', async () => {
    // Mock: data exists at day 5, but maxDaysBack is 3
    vi.mocked(rtdbGet)
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce({ setIndex: 1280 } as never) // Day 3

    const result = await findLatestDateWithData(3)

    expect(result).toBeNull() // Day 3 is beyond maxDaysBack=3
  })
})
