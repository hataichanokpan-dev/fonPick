/**
 * Stock API Service
 *
 * Service for fetching Thai stock market data from internal proxy APIs.
 * Uses Next.js proxy APIs with caching and rate limiting.
 *
 * Proxy APIs:
 * - GET /api/stocks/{symbol}/overview
 * - GET /api/stocks/{symbol}/statistics
 * - GET /api/stocks/{symbol}/price
 * - GET /api/stocks/{symbol}/price/history
 * - GET /api/stocks/{symbol}/data/yearly
 * - GET /api/stocks/{symbol}/operations/quarterly
 */

import type {
  ApiResponse,
  StockOverviewData,
  StockStatisticsData,
  StockPriceData,
  PriceHistoryPoint,
  PriceHistoryParams,
  YearlyMetrics,
  QuarterlyMetrics,
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

// ============================================================================
// NEW PRICE API FUNCTIONS
// ============================================================================

/**
 * Fetch stock price data from proxy API
 *
 * @param symbol - Stock symbol (e.g., 'PTT', 'AOT', 'KBANK')
 * @param options - Fetch options
 * @returns Promise resolving to stock price data
 *
 * @example
 * ```typescript
 * const price = await fetchStockPrice('PTT')
 * if (price.data) {
 *   console.log(price.data.regularMarketPrice)
 * }
 * ```
 */
export async function fetchStockPrice(
  symbol: string,
  options?: { bypassCache?: boolean }
): Promise<ApiResponse<StockPriceData>> {
  if (!validateSymbol(symbol)) {
    return {
      success: false,
      error: 'Invalid stock symbol format',
    }
  }

  const sanitizedSymbol = sanitizeSymbol(symbol)
  const queryParams = options?.bypassCache ? '?nocache=true' : ''
  const url = `${BASE_URL}/${sanitizedSymbol}/price${queryParams}`

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API returned ${response.status}`,
      }
    }

    const data = (await response.json()) as ApiResponse<StockPriceData>
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch stock price history from proxy API
 *
 * @param symbol - Stock symbol (e.g., 'PTT', 'AOT', 'KBANK')
 * @param params - Query parameters for date range and interval
 * @param options - Fetch options
 * @returns Promise resolving to price history data
 *
 * @example
 * ```typescript
 * const history = await fetchPriceHistory('PTT', {
 *   period1: '2024-01-01',
 *   period2: '2024-12-31',
 *   interval: '1d'
 * })
 * if (history.data) {
 *   console.log(history.data[0].close)
 * }
 * ```
 */
export async function fetchPriceHistory(
  symbol: string,
  params: PriceHistoryParams,
  options?: { bypassCache?: boolean }
): Promise<ApiResponse<PriceHistoryPoint[]>> {
  if (!validateSymbol(symbol)) {
    return {
      success: false,
      error: 'Invalid stock symbol format',
    }
  }

  const sanitizedSymbol = sanitizeSymbol(symbol)
  const queryParams = new URLSearchParams()

  if (params.period1) queryParams.append('period1', String(params.period1))
  if (params.period2) queryParams.append('period2', String(params.period2))
  if (params.interval) queryParams.append('interval', params.interval)
  if (options?.bypassCache) queryParams.append('nocache', 'true')

  const queryString = queryParams.toString()
  const url = `${BASE_URL}/${sanitizedSymbol}/price/history${queryString ? `?${queryString}` : ''}`

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API returned ${response.status}`,
      }
    }

    const data = (await response.json()) as ApiResponse<PriceHistoryPoint[]>
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch yearly financial data from proxy API
 *
 * @param symbol - Stock symbol (e.g., 'PTT', 'AOT', 'KBANK')
 * @param options - Fetch options
 * @returns Promise resolving to yearly financial data
 *
 * @example
 * ```typescript
 * const yearlyData = await fetchYearlyData('PTT')
 * if (yearlyData.data) {
 *   console.log(yearlyData.data['2023'].roe)
 * }
 * ```
 */
export async function fetchYearlyData(
  symbol: string,
  options?: { bypassCache?: boolean }
): Promise<ApiResponse<Record<string, YearlyMetrics>>> {
  if (!validateSymbol(symbol)) {
    return {
      success: false,
      error: 'Invalid stock symbol format',
    }
  }

  const sanitizedSymbol = sanitizeSymbol(symbol)
  const queryParams = options?.bypassCache ? '?nocache=true' : ''
  const url = `${BASE_URL}/${sanitizedSymbol}/data/yearly${queryParams}`

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API returned ${response.status}`,
      }
    }

    const data = (await response.json()) as ApiResponse<Record<string, YearlyMetrics>>
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch quarterly operations data from proxy API
 *
 * @param symbol - Stock symbol (e.g., 'PTT', 'AOT', 'KBANK')
 * @param options - Fetch options
 * @returns Promise resolving to quarterly operations data
 *
 * @example
 * ```typescript
 * const quarterlyData = await fetchQuarterlyOperations('PTT')
 * if (quarterlyData.data) {
 *   console.log(quarterlyData.data['2023-Q4'].roe)
 * }
 * ```
 */
export async function fetchQuarterlyOperations(
  symbol: string,
  options?: { bypassCache?: boolean }
): Promise<ApiResponse<Record<string, QuarterlyMetrics>>> {
  if (!validateSymbol(symbol)) {
    return {
      success: false,
      error: 'Invalid stock symbol format',
    }
  }

  const sanitizedSymbol = sanitizeSymbol(symbol)
  const queryParams = options?.bypassCache ? '?nocache=true' : ''
  const url = `${BASE_URL}/${sanitizedSymbol}/operations/quarterly${queryParams}`

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API returned ${response.status}`,
      }
    }

    const data = (await response.json()) as ApiResponse<Record<string, QuarterlyMetrics>>
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
