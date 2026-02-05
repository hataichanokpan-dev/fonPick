/**
 * useDividendAnalysis Hook
 *
 * Hook สำหรับดึงข้อมูลการวิเคราะห์ปันผล
 * ใช้ React Query สำหรับ caching และ automatic retry
 *
 * Features:
 * - ดึงข้อมูลประวัติการจ่ายปันผล
 * - คำนวณ consistency score
 * - สร้าง forecast สำหรับปันผลในอนาคต
 * - Auto cache 24 ชั่วโมง (ข้อมูลปันผลไม่เปลี่ยนบ่อย)
 * - Automatic retry 2 ครั้ง
 * - สร้าง mock data สำหรับ development
 */

import { useQuery } from '@tanstack/react-query';
import type { DividendAnalysisData } from '@/types/dividend';
import { generateMockDividendAnalysis } from '@/lib/utils/dividend-calculator';

// ============================================================================
// TYPES
// ============================================================================

export interface UseDividendAnalysisParams {
  /** สัญลักษณ์หุ้น (เช่น 'PTT', 'AOT', 'KBANK') */
  symbol: string;
  /** ใช้ mock data สำหรับ development (default: false) */
  useMock?: boolean;
}

export interface UseDividendAnalysisResult {
  /** ข้อมูลการวิเคราะห์ปันผล */
  data: DividendAnalysisData | undefined;
  /** กำลังโหลด */
  isLoading: boolean;
  /** โหลดเสร็จแล้วและมีข้อมูล */
  isSuccess: boolean;
  /** เกิด error */
  isError: boolean;
  /** ข้อความ error (ถ้ามี) */
  error: Error | null;
  /** โหลดข้อมูลใหม่ */
  refetch: () => void;
}

// ============================================================================
// API FUNCTION (TODO: Replace with actual API call)
// ============================================================================

/**
 * Fetch dividend analysis from API
 * TODO: Implement actual API call when backend is ready
 *
 * For now, this function generates mock data
 */
async function fetchDividendAnalysis(
  symbol: string
): Promise<DividendAnalysisData> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/stocks/${symbol}/dividends`);
  // const result = await response.json();
  // if (!result.success || !result.data) {
  //   throw new Error(result.error || 'Failed to fetch dividend data');
  // }
  // return result.data;

  // Generate mock data for now
  return generateMockDividendAnalysis(symbol);
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook สำหรับดึงข้อมูลการวิเคราะห์ปันผล
 *
 * @param params - Parameters สำหรับการดึงข้อมูล
 * @returns Query result
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDividendAnalysis({
 *   symbol: 'PTT'
 * })
 * ```
 */
export function useDividendAnalysis({
  symbol,
  useMock = false,
}: UseDividendAnalysisParams): UseDividendAnalysisResult {
  // สร้าง query key สำหรับ caching
  const queryKey = ['dividendAnalysis', symbol] as const;

  // Query function
  const queryFn = async (): Promise<DividendAnalysisData> => {
    // If useMock is true, generate mock data directly
    if (useMock) {
      return generateMockDividendAnalysis(symbol);
    }

    // Otherwise, fetch from API
    return fetchDividendAnalysis(symbol);
  };

  // ใช้ React Query
  const query = useQuery({
    queryKey,
    queryFn,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - dividend data rarely changes
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days - keep in cache longer
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2, // Retry 2 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    enabled: !!symbol && symbol.length > 0,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

/**
 * Default export
 */
export default useDividendAnalysis;
