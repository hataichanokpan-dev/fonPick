/**
 * Stock API Service
 *
 * Service for fetching Thai stock market data from external API.
 * Uses Next.js fetch with caching for optimal performance.
 *
 * API Base URL: https://my-fon-stock-api.vercel.app
 *
 * Endpoints:
 * - GET /api/th/stocks/{symbol}/overview
 * - GET /api/th/stocks/{symbol}/statistics
 */

import { ApiError, ApiErrorType } from '@/types/stock-api'
import {
  validateStockOverviewResponse,
  validateStockStatisticsResponse,
} from '@/utils/validation'
import { fetchJson } from './fetch-wrapper'
import type {
  StockOverviewResponse,
  StockStatisticsResponse,
} from '@/types/stock-api'

/**
 * Base URL for the stock API
 * Can be overridden with NEXT_PUBLIC_STOCK_API_BASE_URL environment variable
 */
const BASE_URL = process.env.NEXT_PUBLIC_STOCK_API_BASE_URL || 'https://my-fon-stock-api.vercel.app'

/**
 * Sanitize stock symbol
 * Remove special characters and convert to uppercase
 */
function sanitizeSymbol(symbol: string): string {
  return symbol.toUpperCase().trim()
}

/**
 * Validate symbol format
 * Throws error if symbol is invalid
 */
function validateSymbol(symbol: string): void {
  const sanitized = sanitizeSymbol(symbol)

  if (!sanitized) {
    throw new ApiError(
      ApiErrorType.VALIDATION_ERROR,
      400,
      'Stock symbol cannot be empty',
      false
    )
  }

  if (sanitized.length > 10) {
    throw new ApiError(
      ApiErrorType.VALIDATION_ERROR,
      400,
      'Stock symbol must be at most 10 characters',
      false
    )
  }

  // Allow alphanumeric and common symbols
  if (!/^[A-Z0-9.-]+$/.test(sanitized)) {
    throw new ApiError(
      ApiErrorType.VALIDATION_ERROR,
      400,
      'Stock symbol contains invalid characters',
      false
    )
  }
}

/**
 * Fetch stock overview data
 *
 * @param symbol - Stock symbol (e.g., 'PTT', 'AOT', 'KBANK')
 * @returns Promise resolving to stock overview data
 * @throws ApiError with appropriate type and details
 *
 * @example
 * ```typescript
 * const overview = await fetchStockOverview('PTT')
 * console.log(overview.data.price.current)
 * console.log(overview.data.decisionBadge.label)
 * ```
 */
export async function fetchStockOverview(
  symbol: string
): Promise<StockOverviewResponse> {
  // Validate and sanitize input
  validateSymbol(symbol)
  const sanitizedSymbol = sanitizeSymbol(symbol)

  const url = `${BASE_URL}/api/th/stocks/${sanitizedSymbol}/overview`

  try {
    // Use Next.js fetch with caching (5 minute revalidation)
    const response = await fetchJson<unknown>(url, {
      next: { revalidate: 300 },
    })

    // Validate response structure
    const validated = validateStockOverviewResponse(response)

    return validated
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error
    }

    // Wrap validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        0,
        `Invalid API response structure for ${sanitizedSymbol} overview`,
        false
      )
    }

    // Wrap unknown errors
    throw new ApiError(
      ApiErrorType.UNKNOWN,
      0,
      error instanceof Error ? error.message : 'Unknown error fetching stock overview',
      false
    )
  }
}

/**
 * Fetch stock statistics data
 *
 * @param symbol - Stock symbol (e.g., 'PTT', 'AOT', 'KBANK')
 * @returns Promise resolving to stock statistics data
 * @throws ApiError with appropriate type and details
 *
 * @example
 * ```typescript
 * const statistics = await fetchStockStatistics('PTT')
 * console.log(statistics.data.financial.eps)
 * console.log(statistics.data.valuation.pe)
 * console.log(statistics.data.analyst.rating)
 * ```
 */
export async function fetchStockStatistics(
  symbol: string
): Promise<StockStatisticsResponse> {
  // Validate and sanitize input
  validateSymbol(symbol)
  const sanitizedSymbol = sanitizeSymbol(symbol)

  const url = `${BASE_URL}/api/th/stocks/${sanitizedSymbol}/statistics`

  try {
    // Use Next.js fetch with caching (5 minute revalidation)
    const response = await fetchJson<unknown>(url, {
      next: { revalidate: 300 },
    })

    // Validate response structure
    const validated = validateStockStatisticsResponse(response)

    return validated
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error
    }

    // Wrap validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        0,
        `Invalid API response structure for ${sanitizedSymbol} statistics`,
        false
      )
    }

    // Wrap unknown errors
    throw new ApiError(
      ApiErrorType.UNKNOWN,
      0,
      error instanceof Error ? error.message : 'Unknown error fetching stock statistics',
      false
    )
  }
}

/**
 * Fetch both overview and statistics in parallel
 *
 * @param symbol - Stock symbol
 * @returns Promise resolving to both overview and statistics
 * @throws ApiError if either request fails
 *
 * @example
 * ```typescript
 * const [overview, statistics] = await fetchStockData('PTT')
 * console.log(overview.data.price.current)
 * console.log(statistics.data.valuation.pe)
 * ```
 */
export async function fetchStockData(
  symbol: string
): Promise<[StockOverviewResponse, StockStatisticsResponse]> {
  // Validate symbol once
  validateSymbol(symbol)

  // Fetch in parallel for better performance
  const [overview, statistics] = await Promise.all([
    fetchStockOverview(symbol),
    fetchStockStatistics(symbol),
  ])

  return [overview, statistics]
}
