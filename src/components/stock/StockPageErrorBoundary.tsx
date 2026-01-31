'use client'

/**
 * StockPageErrorBoundary Component
 *
 * Error boundary component for the stock detail page.
 * Displays user-friendly error messages with retry functionality.
 *
 * Features:
 * - Different messages for different error types
 * - Retry button for retryable errors
 * - Back to home navigation
 * - Error details display
 * - Accessibility support (role="alert", aria-live)
 *
 * @example
 * ```tsx
 * function StockPage({ symbol }: { symbol: string }) {
 *   const { data, isLoading, error, refetch } = useStockData(symbol)
 *
 *   if (isLoading) return <StockPageSkeleton />
 *   if (error) return <StockPageErrorBoundary error={error} symbol={symbol} onRetry={refetch} />
 *
 *   return <StockContent data={data} />
 * }
 * ```
 */

import { ApiError, ApiErrorType } from '@/types/stock-api'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface StockPageErrorBoundaryProps {
  error: Error | ApiError
  symbol: string
  onRetry?: () => void
}

/**
 * Get error configuration based on error type
 */
function getErrorConfig(error: Error | ApiError) {
  if (!(error instanceof ApiError)) {
    return {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred',
      suggestion: 'Please try again later',
      showRetry: false,
    }
  }

  switch (error.type) {
    case ApiErrorType.NOT_FOUND:
      return {
        title: 'Stock Not Found',
        message: `Could not find stock data for symbol`,
        suggestion: 'Please check the symbol and try again',
        showRetry: false,
      }

    case ApiErrorType.TIMEOUT:
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete',
        suggestion: 'Please check your connection and retry',
        showRetry: true,
      }

    case ApiErrorType.RATE_LIMIT:
      return {
        title: 'Rate Limit Exceeded',
        message: 'Too many requests. Please wait a moment',
        suggestion: 'Try again in a few seconds',
        showRetry: true,
      }

    case ApiErrorType.SERVER_ERROR:
      return {
        title: 'Server Error',
        message: 'The server encountered an error',
        suggestion: 'Please try again later',
        showRetry: true,
      }

    case ApiErrorType.NETWORK_ERROR:
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server',
        suggestion: 'Please check your internet connection',
        showRetry: true,
      }

    case ApiErrorType.VALIDATION_ERROR:
      return {
        title: 'Invalid Symbol',
        message: 'The stock symbol format is invalid',
        suggestion: 'Please check the symbol and try again',
        showRetry: false,
      }

    default:
      return {
        title: 'Unknown Error',
        message: error.message || 'An unknown error occurred',
        suggestion: 'Please try again later',
        showRetry: false,
      }
  }
}

/**
 * Stock page error boundary component
 */
export function StockPageErrorBoundary({
  error,
  symbol,
  onRetry,
}: StockPageErrorBoundaryProps) {
  const errorConfig = getErrorConfig(error)
  const isApiError = error instanceof ApiError
  const retryable = isApiError ? error.retryable : false
  const showRetryButton = onRetry && (errorConfig.showRetry || retryable)
  const statusCode = isApiError ? error.statusCode : null

  return (
    <div
      data-testid="stock-page-error-boundary"
      className="rounded-lg p-6 bg-error/10 border border-error/30"
      role="alert"
      aria-live="polite"
      aria-describedby="error-message error-details"
    >
      {/* Error Icon */}
      <div className="flex items-start gap-3">
        <div
          data-testid="error-icon"
          className="flex-shrink-0 w-10 h-10 rounded-full bg-error/20 flex items-center justify-center"
        >
          <AlertCircle className="w-6 h-6 text-error" />
        </div>

        <div className="flex-1 space-y-2">
          {/* Error Title */}
          <h2
            data-testid="error-title"
            className="text-lg font-semibold text-error"
          >
            {errorConfig.title}
          </h2>

          {/* Error Message */}
          <p
            data-testid="error-message"
            className="text-sm text-text-2"
          >
            {errorConfig.message}
            {symbol && <span className="font-medium"> &quot;{symbol}&quot;</span>}
          </p>

          {/* Error Details */}
          {(error.message || statusCode) && (
            <div
              data-testid="error-details"
              className="text-xs text-text-3 space-y-1"
            >
              {error.message && error.message !== errorConfig.message && (
                <p>{error.message}</p>
              )}
              {statusCode && (
                <p data-testid="error-status-code">Error code: {statusCode}</p>
              )}
            </div>
          )}

          {/* Suggestion */}
          {errorConfig.suggestion && (
            <p
              data-testid="error-suggestion"
              className="text-sm text-text-2"
            >
              {errorConfig.suggestion}
            </p>
          )}

          {/* Retryable Indicator */}
          {retryable && (
            <div
              data-testid="retryable-indicator"
              className="text-xs text-info"
            >
              This error can be retried
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {/* Retry Button */}
            {showRetryButton && (
              <button
                data-testid="retry-button"
                onClick={onRetry}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2',
                  'rounded-lg bg-primary text-white',
                  'hover:bg-primary/90 active:opacity-70',
                  'transition-colors duration-200',
                  'text-sm font-medium'
                )}
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            )}

            {/* Back to Home Button */}
            <Link
              data-testid="back-to-home-button"
              href="/"
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2',
                'rounded-lg bg-surface border border-border',
                'hover:bg-surface/80 active:opacity-70',
                'transition-colors duration-200',
                'text-sm font-medium text-text-2'
              )}
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
