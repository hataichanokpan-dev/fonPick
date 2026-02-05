/**
 * useValuationMetrics Hook
 *
 * Hook สำหรับดึงข้อมูลมูลค่าการประเมินย้อนหลังของหุ้น
 * ใช้ React Query สำหรับ caching และ automatic retry
 *
 * Features:
 * - ดึงข้อมูล P/E, P/BV, ROE ย้อนหลังตามจำนวนปีที่กำหนด
 * - คำนวณ statistical bands (-2SD, -1SD, Mean, +1SD, +2SD)
 * - Auto cache 1 ชั่วโมง (ข้อมูล valuation ไม่เปลี่ยนบ่อย)
 * - Automatic retry 2 ครั้ง
 * - สร้าง mock data สำหรับ development (ถ้าไม่มี API)
 */

import { useQuery } from '@tanstack/react-query';
import type {
  ValuationMetricsData,
  MetricType,
  TimeRange,
} from '@/types/valuation';
import { TIME_RANGE_YEARS } from '@/types/valuation';
import {
  calculateValuationBand,
  generateMockValuationData,
} from '@/lib/utils/valuation-band-calculator';

// ============================================================================
// TYPES
// ============================================================================

export interface UseValuationMetricsParams {
  /** สัญลักษณ์หุ้น (เช่น 'PTT', 'AOT', 'KBANK') */
  symbol: string;
  /** ช่วงเวลา (default: '5Y') */
  timeRange?: TimeRange;
  /** ใช้ mock data สำหรับ development (default: false) */
  useMock?: boolean;
}

export interface UseValuationMetricsResult {
  /** ข้อมูลมูลค่าการประเมิน */
  data: ValuationMetricsData | undefined;
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
 * Fetch valuation metrics from API
 *
 * @param symbol Stock symbol
 * @param years Number of years
 * @returns Valuation metrics data
 * @throws Error if API call fails
 */
async function fetchValuationMetrics(
  symbol: string,
  years: number
): Promise<ValuationMetricsData> {
  const url = `/api/stocks/${symbol}/valuation?years=${years}`;

  const response = await fetch(url, {
    // Next.js caching options
    next: { revalidate: 3600 }, // 1 hour
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Failed to fetch valuation metrics: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'API returned unsuccessful response');
  }

  return result.data;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook สำหรับดึงข้อมูลมูลค่าการประเมินย้อนหลัง
 *
 * @param params - Parameters สำหรับการดึงข้อมูล
 * @returns Query result พร้อมข้อมูล valuation metrics และ bands
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useValuationMetrics({
 *   symbol: 'PTT',
 *   timeRange: '5Y'
 * })
 * ```
 */
export function useValuationMetrics({
  symbol,
  timeRange = '5Y',
  useMock = false,
}: UseValuationMetricsParams): UseValuationMetricsResult {
  // Convert time range to years
  const years = TIME_RANGE_YEARS[timeRange];

  // สร้าง query key สำหรับ caching
  const queryKey = ['valuationMetrics', symbol, timeRange] as const;

  // Query function
  const queryFn = async (): Promise<ValuationMetricsData> => {
    // If useMock is true, generate mock data directly
    if (useMock) {
      const mockData = generateMockValuationData(years);
      const currentPE = mockData.pe[mockData.pe.length - 1]?.value ?? 15;
      const currentPBV = mockData.pbv[mockData.pbv.length - 1]?.value ?? 1.5;
      const currentROE = mockData.roe[mockData.roe.length - 1]?.value ?? 12;

      const peBand = calculateValuationBand(mockData.pe, 'PE', currentPE);
      const pbvBand = calculateValuationBand(mockData.pbv, 'PBV', currentPBV);
      const roeBand = calculateValuationBand(mockData.roe, 'ROE', currentROE);

      return {
        symbol,
        metrics: mockData,
        bands: {
          pe: peBand,
          pbv: pbvBand,
          roe: roeBand,
        },
        asOfDate: new Date().toISOString(),
        updatedAt: Date.now(),
      };
    }

    // Fetch from API
    return fetchValuationMetrics(symbol, years);
  };

  // ใช้ React Query
  const query = useQuery({
    queryKey,
    queryFn,
    staleTime: 60 * 60 * 1000, // 1 hour - valuation data doesn't change often
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache longer
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
export default useValuationMetrics;

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook สำหรับดึงข้อมูล metric เดียว (PE, PBV, หรือ ROE)
 * Wraps useValuationMetrics สำหรับใช้งานง่ายขึ้น
 *
 * @example
 * ```tsx
 * const { data: peBand, isLoading } = useValuationBand({
 *   symbol: 'PTT',
 *   metric: 'PE'
 * })
 * ```
 */
export function useValuationBand(params: {
  symbol: string;
  metric: MetricType;
  timeRange?: TimeRange;
}) {
  const { data, ...rest } = useValuationMetrics({
    symbol: params.symbol,
    timeRange: params.timeRange,
  });

  const band = data?.bands[params.metric.toLowerCase() as Lowercase<MetricType>];

  return {
    data: band,
    ...rest,
  };
}

/**
 * Hook สำหรับดึงข้อมูล series ของ metric เดียว
 * สำหรับใช้ในกราฟ
 *
 * @example
 * ```tsx
 * const { data: peSeries, isLoading } = useValuationSeries({
 *   symbol: 'PTT',
 *   metric: 'PE'
 * })
 * ```
 */
export function useValuationSeries(params: {
  symbol: string;
  metric: MetricType;
  timeRange?: TimeRange;
}) {
  const { data, ...rest } = useValuationMetrics({
    symbol: params.symbol,
    timeRange: params.timeRange,
  });

  const series = data?.metrics[params.metric.toLowerCase() as Lowercase<MetricType>];
  const band = data?.bands[params.metric.toLowerCase() as Lowercase<MetricType>];

  return {
    data: series,
    band,
    ...rest,
  };
}
