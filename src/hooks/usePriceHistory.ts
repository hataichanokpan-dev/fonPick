/**
 * usePriceHistory Hook
 *
 * Hook สำหรับดึงข้อมูลราคาย้อนหลังของหุ้น
 * ใช้ React Query สำหรับ caching และ automatic retry
 *
 * Features:
 * - ดึงข้อมูลราคาย้อนหลังตามจำนวนปีที่กำหนด
 * - รองรับ interval: 1d (daily), 1wk (weekly), 1mo (monthly)
 * - Auto cache 15 นาที (ข้อมูล historical ไม่เปลี่ยนบ่อย)
 * - Automatic retry 2 ครั้ง
 */

import { useQuery } from '@tanstack/react-query'
import { fetchPriceHistory } from '@/lib/api/stock-api'
import type { PriceHistoryPoint, PriceHistoryParams } from '@/types/stock-proxy-api'

// ============================================================================
// TYPES
// ============================================================================

export interface UsePriceHistoryParams {
  /** สัญลักษณ์หุ้น (เช่น 'PTT', 'AOT', 'KBANK') */
  symbol: string
  /** จำนวนปีย้อนหลัง (default: 3) */
  years?: number
  /** ช่วงเวลาข้อมูล (default: '1d') */
  interval?: '1d' | '1wk' | '1mo'
  /** ข้าม cache (default: false) */
  bypassCache?: boolean
}

export interface UsePriceHistoryResult {
  /** ข้อมูลราคาย้อนหลัง */
  data: PriceHistoryPoint[] | undefined
  /** กำลังโหลด */
  isLoading: boolean
  /** โหลดเสร็จแล้วและมีข้อมูล */
  isSuccess: boolean
  /** เกิด error */
  isError: boolean
  /** ข้อความ error (ถ้ามี) */
  error: Error | null
  /** โหลดข้อมูลใหม่ */
  refetch: () => void
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * คำนวณวันเริ่มต้นเป็น YYYY-MM-DD format
 *
 * @param years - จำนวนปีย้อนหลัง
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * calculateStartDate(3) // "2023-02-01" (3 ปีก่อนหน้านี้)
 */
export function calculateStartDate(years: number): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() - years)
  return date.toISOString().split('T')[0] // Convert to YYYY-MM-DD
}

/**
 * คำนวณวันสิ้นสุดเป็น YYYY-MM-DD format
 * ค่า default คือวันนี้
 *
 * @returns Date string in YYYY-MM-DD format
 */
export function calculateEndDate(): string {
  return new Date().toISOString().split('T')[0] // Convert to YYYY-MM-DD
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook สำหรับดึงข้อมูลราคาย้อนหลัง
 *
 * @param params - Parameters สำหรับการดึงข้อมูล
 * @returns Query result
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = usePriceHistory({
 *   symbol: 'PTT',
 *   years: 3,
 *   interval: '1d'
 * })
 * ```
 */
export function usePriceHistory({
  symbol,
  years = 3,
  interval = '1d',
  bypassCache = false,
}: UsePriceHistoryParams): UsePriceHistoryResult {
  // สร้าง query key สำหรับ caching
  const queryKey = ['priceHistory', symbol, years, interval] as const

  // Query function
  const queryFn = async (): Promise<PriceHistoryPoint[]> => {
    const params: PriceHistoryParams = {
      period1: calculateStartDate(years),
      period2: calculateEndDate(),
      interval,
    }

    const response = await fetchPriceHistory(symbol, params, {
      bypassCache,
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch price history')
    }

    return response.data
  }

  // ใช้ React Query
  const query = useQuery({
    queryKey,
    queryFn,
    staleTime: 15 * 60 * 1000, // 15 minutes - historical data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2, // Retry 2 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}

/**
 * Default export
 */
export default usePriceHistory
