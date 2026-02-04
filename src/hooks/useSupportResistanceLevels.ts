/**
 * useSupportResistanceLevels Hook
 *
 * Hook สำหรับคำนวณและดึงข้อมูลแนวรับ/แนวต้านจากประวัติราคา
 * ใช้ React Query สำหรับ caching และ automatic retry
 *
 * Features:
 * - คำนวณแนวรับ/แนวต้านจากข้อมูลราคาย้อนหลัง
 * - ส่งคืนเฉพาะแนวรับ/แนวต้านที่ใกล้ที่สุด (first support/resistance)
 * - Auto cache 15 นาที
 * - รองรับ interval: 1d, 1wk, 1mo
 */

import { useQuery } from '@tanstack/react-query'
import { usePriceHistory } from './usePriceHistory'
import { calculateSupportResistance } from '@/lib/technical-indicators'
import type { FirstSupportResistance } from '@/types/technical-chart'

// ============================================================================
// TYPES
// ============================================================================

export interface UseSupportResistanceLevelsParams {
  /** สัญลักษณ์หุ้น (เช่น 'PTT', 'AOT', 'KBANK') */
  symbol: string
  /** จำนวนปีย้อนหลัง (default: 3) */
  years?: number
  /** ช่วงเวลาข้อมูล (default: '1d') */
  interval?: '1d' | '1wk' | '1mo'
}

export interface UseSupportResistanceLevelsResult {
  /** แนวรับแรกและแนวต้านแรก */
  data: FirstSupportResistance | null
  /** กำลังโหลด */
  isLoading: boolean
  /** เกิด error */
  error: Error | null
  /** ทุกแนวรับและแนวต้านที่คำนวณได้ */
  allLevels: ReturnType<typeof calculateSupportResistance> | null
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STALE_TIME = 15 * 60 * 1000 // 15 minutes

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook สำหรับคำนวณและดึงข้อมูลแนวรับ/แนวต้าน
 *
 * @param params - Parameters สำหรับการคำนวณ
 * @returns Support/resistance levels
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSupportResistanceLevels({
 *   symbol: 'PTT',
 *   years: 3,
 *   interval: '1d'
 * })
 *
 * if (data) {
 *   console.log('First support:', data.support)
 *   console.log('First resistance:', data.resistance)
 * }
 * ```
 */
export function useSupportResistanceLevels({
  symbol,
  years = 3,
  interval = '1d',
}: UseSupportResistanceLevelsParams): UseSupportResistanceLevelsResult {
  // Get price history data
  const { data: priceHistory, isLoading: historyLoading, error: historyError } = usePriceHistory({
    symbol,
    years,
    interval,
  })

  // Calculate support/resistance using React Query
  const query = useQuery({
    queryKey: ['supportResistance', symbol, years, interval],
    queryFn: () => {
      if (!priceHistory || priceHistory.length === 0) {
        throw new Error('No price history data available')
      }

      const levels = calculateSupportResistance(priceHistory)

      // Extract first (nearest) support and resistance
      const firstSupport = levels.support[0]?.price ?? null
      const firstResistance = levels.resistance[0]?.price ?? null
      const supportStrength = levels.support[0]?.strength ?? null
      const resistanceStrength = levels.resistance[0]?.strength ?? null

      return {
        data: {
          support: firstSupport,
          resistance: firstResistance,
          supportStrength,
          resistanceStrength,
        },
        allLevels: levels,
      }
    },
    enabled: !!priceHistory && priceHistory.length > 0,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  })

  return {
    data: query.data?.data ?? null,
    isLoading: historyLoading || query.isLoading,
    error: query.error ?? historyError,
    allLevels: query.data?.allLevels ?? null,
  }
}

/**
 * Default export
 */
export default useSupportResistanceLevels
