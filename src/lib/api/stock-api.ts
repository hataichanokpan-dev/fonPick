/**
 * Stock API Service
 *
 * Service for fetching Thai stock market data from internal proxy APIs.
 * Uses Next.js proxy APIs with caching and rate limiting.
 *
 * Proxy APIs:
 * - GET /api/stocks/{symbol}/overview
 * - GET /api/stocks/{symbol}/statistics
 */

import type {
  ApiResponse,
  StockOverviewData,
  StockStatisticsData,
} from '@/types/stock-proxy-api'

/**
 * Base URL for internal proxy APIs
 * Uses relative path since we're calling our own API routes
 */
const BASE_URL = '/api/stocks'

/**
 * Sanitize stock symbol
 * Remove special characters and convert to uppercase
 */
function sanitizeSymbol(symbol: string): string {
  return symbol.toUpperCase().trim()
}

/**
 * Validate symbol format
 * Returns true if valid, false otherwise
 */
function validateSymbol(symbol: string): boolean {
  const sanitized = sanitizeSymbol(symbol)

  if (!sanitized) {
    return false
  }

  if (sanitized.length > 10) {
    return false
  }

  // Allow alphanumeric and common symbols
  return /^[A-Z0-9.-]+$/.test(sanitized)
}

/**
 * Fetch stock overview data from proxy API
 *
 * @param symbol - Stock symbol (e.g., 'PTT', 'AOT', 'KBANK')
 * @param options - Fetch options
 * @returns Promise resolving to stock overview data
 *
 * @example
 * ```typescript
 * const overview = await fetchStockOverview('PTT')
 * if (overview.data) {
 *   console.log(overview.data.price)
 * }
 * ```
 */
export async function fetchStockOverview(
  symbol: string,
  options?: { bypassCache?: boolean }
): Promise<ApiResponse<StockOverviewData>> {
  // Validate and sanitize input
  if (!validateSymbol(symbol)) {
    return {
      success: false,
      error: 'Invalid stock symbol format',
    }
  }

  const sanitizedSymbol = sanitizeSymbol(symbol)
  const queryParams = options?.bypassCache ? '?nocache=true' : ''
  const url = `${BASE_URL}/${sanitizedSymbol}/overview${queryParams}`

  try {
    const response = await fetch(url, {
      // Add timeout
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API returned ${response.status}`,
      }
    }

    const data = (await response.json()) as ApiResponse<StockOverviewData>
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch stock statistics data from proxy API
 *
 * @param symbol - Stock symbol (e.g., 'PTT', 'AOT', 'KBANK')
 * @param options - Fetch options
 * @returns Promise resolving to stock statistics data
 *
 * @example
 * ```typescript
 * const statistics = await fetchStockStatistics('PTT')
 * if (statistics.data) {
 *   console.log(statistics.data.peRatio)
 * }
 * ```
 */
export async function fetchStockStatistics(
  symbol: string,
  options?: { bypassCache?: boolean }
): Promise<ApiResponse<StockStatisticsData>> {
  // Validate and sanitize input
  if (!validateSymbol(symbol)) {
    return {
      success: false,
      error: 'Invalid stock symbol format',
    }
  }

  const sanitizedSymbol = sanitizeSymbol(symbol)
  const queryParams = options?.bypassCache ? '?nocache=true' : ''
  const url = `${BASE_URL}/${sanitizedSymbol}/statistics${queryParams}`

  try {
    const response = await fetch(url, {
      // Add timeout
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API returned ${response.status}`,
      }
    }

    const data = (await response.json()) as ApiResponse<StockStatisticsData>
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch both overview and statistics in parallel
 *
 * @param symbol - Stock symbol
 * @param options - Fetch options
 * @returns Promise resolving to both overview and statistics
 *
 * @example
 * ```typescript
 * const result = await fetchStockData('PTT')
 * if (result.overview.data) {
 *   console.log(result.overview.data.price)
 * }
 * ```
 */
export async function fetchStockData(
  symbol: string,
  options?: { bypassCache?: boolean }
): Promise<{
  overview: ApiResponse<StockOverviewData>
  statistics: ApiResponse<StockStatisticsData>
}> {
  // Fetch in parallel for better performance
  const [overview, statistics] = await Promise.all([
    fetchStockOverview(symbol, options),
    fetchStockStatistics(symbol, options),
  ])

  return { overview, statistics }
}
