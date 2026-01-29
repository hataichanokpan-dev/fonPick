/**
 * Fetch Wrapper with Timeout and Retry Logic
 *
 * Provides a robust fetch implementation with:
 * - Configurable timeout
 * - Automatic retry with exponential backoff
 * - Detailed error handling
 * - Custom error types
 */

import { ApiError, ApiErrorType } from '@/types/stock-api'

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 2, // 2 retries (3 total attempts)
  retryDelay: 1000, // 1 second initial delay
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Exponential backoff delay calculator
 */
function getRetryDelay(attemptNumber: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attemptNumber)
}

/**
 * Determine if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.retryable
  }

  // Network errors are retryable
  if (error instanceof TypeError) {
    return true
  }

  return false
}

/**
 * Create timeout promise
 */
function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(
        new ApiError(
          ApiErrorType.TIMEOUT,
          408,
          `Request timeout after ${timeoutMs}ms`,
          true
        )
      )
    }, timeoutMs)
  })
}

/**
 * Enhanced fetch with timeout and retry
 *
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param config - Configuration for timeout and retries
 * @returns Promise resolving to the Response
 * @throws ApiError with appropriate type and details
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  config: Partial<typeof DEFAULT_CONFIG> = {}
): Promise<Response> {
  const timeout = config.timeout ?? DEFAULT_CONFIG.timeout
  const maxRetries = config.retries ?? DEFAULT_CONFIG.retries
  const retryDelay = config.retryDelay ?? DEFAULT_CONFIG.retryDelay

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(url, options),
        createTimeoutPromise(timeout),
      ])

      // Handle HTTP errors
      if (!response.ok) {
        const error = createHttpError(response.status, response.statusText)

        // Don't retry non-retryable errors
        if (!error.retryable || attempt === maxRetries) {
          throw error
        }

        lastError = error
        const delay = getRetryDelay(attempt, retryDelay)
        await sleep(delay)
        continue
      }

      return response
    } catch (error) {
      // Re-throw if it's the last attempt or not retryable
      if (attempt === maxRetries || !isRetryableError(error)) {
        if (error instanceof ApiError) {
          throw error
        }

        // Wrap unknown errors
        if (error instanceof TypeError) {
          throw new ApiError(
            ApiErrorType.NETWORK_ERROR,
            0,
            error.message,
            true
          )
        }

        throw new ApiError(
          ApiErrorType.UNKNOWN,
          0,
          error instanceof Error ? error.message : 'Unknown error',
          false
        )
      }

      // Store error and retry
      lastError = error instanceof Error ? error : new Error(String(error))
      const delay = getRetryDelay(attempt, retryDelay)
      await sleep(delay)
    }
  }

  // Should not reach here, but handle the case
  throw lastError ?? new ApiError(ApiErrorType.UNKNOWN, 0, 'Max retries exceeded', false)
}

/**
 * Create appropriate ApiError based on HTTP status code
 */
function createHttpError(status: number, statusText: string): ApiError {
  switch (status) {
    case 400:
      return new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        status,
        `Bad Request: ${statusText}`,
        false
      )

    case 401:
      return new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        status,
        `Unauthorized: ${statusText}`,
        false
      )

    case 403:
      return new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        status,
        `Forbidden: ${statusText}`,
        false
      )

    case 404:
      return new ApiError(
        ApiErrorType.NOT_FOUND,
        status,
        `Resource not found: ${statusText}`,
        false
      )

    case 408:
      return new ApiError(
        ApiErrorType.TIMEOUT,
        status,
        `Request timeout: ${statusText}`,
        true
      )

    case 429:
      return new ApiError(
        ApiErrorType.RATE_LIMIT,
        status,
        `Rate limit exceeded: ${statusText}`,
        true
      )

    case 500:
    case 502:
    case 503:
    case 504:
      return new ApiError(
        ApiErrorType.SERVER_ERROR,
        status,
        `Server error (${status}): ${statusText}`,
        true
      )

    default:
      return new ApiError(
        ApiErrorType.UNKNOWN,
        status,
        `HTTP ${status}: ${statusText}`,
        false
      )
  }
}

/**
 * Fetch JSON response with validation
 *
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param config - Configuration for timeout and retries
 * @returns Promise resolving to the parsed JSON response
 * @throws ApiError with appropriate type and details
 */
export async function fetchJson<T = unknown>(
  url: string,
  options: RequestInit = {},
  config: Partial<typeof DEFAULT_CONFIG> = {}
): Promise<T> {
  const response = await fetchWithRetry(url, options, config)

  try {
    return (await response.json()) as T
  } catch (error) {
    throw new ApiError(
      ApiErrorType.VALIDATION_ERROR,
      response.status,
      'Failed to parse JSON response',
      false
    )
  }
}
