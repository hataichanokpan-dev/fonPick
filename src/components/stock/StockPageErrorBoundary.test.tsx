/**
 * StockPageErrorBoundary Component Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Component renders correctly
 * - Error display for all error types
 * - Retry functionality
 * - Back to home functionality
 * - Different messages for different error types
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StockPageErrorBoundary } from './StockPageErrorBoundary'
import { ApiError, ApiErrorType } from '@/types/stock-api'

describe('StockPageErrorBoundary Component', () => {
  const mockOnRetry = vi.fn()
  const mockSymbol = 'PTT'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render error boundary component', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorBoundary = screen.getByTestId('stock-page-error-boundary')
      expect(errorBoundary).toBeInTheDocument()
    })

    it('should display error title', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const title = screen.getByTestId('error-title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent(/error/i)
    })
  })

  describe('Error Display - NOT_FOUND', () => {
    it('should display NOT_FOUND error message', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent(/not found/i)
    })

    it('should show specific message for NOT_FOUND with symbol', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveTextContent(mockSymbol)
    })

    it('should show appropriate icon for NOT_FOUND', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorIcon = screen.getByTestId('error-icon')
      expect(errorIcon).toBeInTheDocument()
    })
  })

  describe('Error Display - TIMEOUT', () => {
    it('should display TIMEOUT error message', () => {
      const error = new ApiError(ApiErrorType.TIMEOUT, 408, 'Request timeout', true)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent(/timeout/i)
    })

    it('should show retryable indicator for TIMEOUT', () => {
      const error = new ApiError(ApiErrorType.TIMEOUT, 408, 'Request timeout', true)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const retryableIndicator = screen.queryByTestId('retryable-indicator')
      expect(retryableIndicator).toBeInTheDocument()
    })
  })

  describe('Error Display - RATE_LIMIT', () => {
    it('should display RATE_LIMIT error message', () => {
      const error = new ApiError(
        ApiErrorType.RATE_LIMIT,
        429,
        'Rate limit exceeded',
        true
      )

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent(/rate limit/i)
    })

    it('should show suggestion to wait for RATE_LIMIT', () => {
      const error = new ApiError(
        ApiErrorType.RATE_LIMIT,
        429,
        'Rate limit exceeded',
        true
      )

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const suggestion = screen.queryByTestId('error-suggestion')
      expect(suggestion).toBeInTheDocument()
      expect(suggestion).toHaveTextContent(/wait/i)
    })
  })

  describe('Error Display - SERVER_ERROR', () => {
    it('should display SERVER_ERROR error message', () => {
      const error = new ApiError(ApiErrorType.SERVER_ERROR, 500, 'Server error', true)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent(/server error/i)
    })

    it('should show retryable indicator for SERVER_ERROR', () => {
      const error = new ApiError(ApiErrorType.SERVER_ERROR, 500, 'Server error', true)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const retryableIndicator = screen.queryByTestId('retryable-indicator')
      expect(retryableIndicator).toBeInTheDocument()
    })
  })

  describe('Error Display - NETWORK_ERROR', () => {
    it('should display NETWORK_ERROR error message', () => {
      const error = new ApiError(ApiErrorType.NETWORK_ERROR, 0, 'Network error', true)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent(/network/i)
    })

    it('should show connection error message for NETWORK_ERROR', () => {
      const error = new ApiError(ApiErrorType.NETWORK_ERROR, 0, 'Failed to fetch', true)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveTextContent(/connection/i)
    })
  })

  describe('Error Display - VALIDATION_ERROR', () => {
    it('should display VALIDATION_ERROR error message', () => {
      const error = new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        400,
        'Invalid stock symbol',
        false
      )

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent(/invalid/i)
    })

    it('should show symbol validation message for empty symbol', () => {
      const error = new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        400,
        'Stock symbol cannot be empty',
        false
      )

      render(<StockPageErrorBoundary error={error} symbol="" />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveTextContent(/symbol/i)
    })
  })

  describe('Error Display - UNKNOWN', () => {
    it('should display UNKNOWN error message', () => {
      const error = new ApiError(ApiErrorType.UNKNOWN, 0, 'Unknown error', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent(/unknown/i)
    })

    it('should show generic error message for UNKNOWN', () => {
      const error = new ApiError(ApiErrorType.UNKNOWN, 0, 'Something went wrong', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveTextContent(/something went wrong/i)
    })
  })

  describe('Error Details', () => {
    it('should display error message details', () => {
      const customMessage = 'Custom error message for testing'
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, customMessage, false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorDetails = screen.queryByTestId('error-details')
      expect(errorDetails).toBeInTheDocument()
      expect(errorDetails).toHaveTextContent(customMessage)
    })

    it('should display status code if available', () => {
      const error = new ApiError(ApiErrorType.SERVER_ERROR, 503, 'Service unavailable', true)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const statusCode = screen.queryByTestId('error-status-code')
      expect(statusCode).toBeInTheDocument()
      expect(statusCode).toHaveTextContent('503')
    })

    it('should not display status code for NETWORK_ERROR', () => {
      const error = new ApiError(ApiErrorType.NETWORK_ERROR, 0, 'Network error', true)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const statusCode = screen.queryByTestId('error-status-code')
      expect(statusCode).not.toBeInTheDocument()
    })
  })

  describe('Retry Functionality', () => {
    it('should display retry button', () => {
      const error = new ApiError(ApiErrorType.TIMEOUT, 408, 'Request timeout', true)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} onRetry={mockOnRetry} />)

      const retryButton = screen.getByTestId('retry-button')
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).toHaveTextContent(/retry/i)
    })

    it('should call onRetry when retry button is clicked', () => {
      const error = new ApiError(ApiErrorType.TIMEOUT, 408, 'Request timeout', true)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} onRetry={mockOnRetry} />)

      const retryButton = screen.getByTestId('retry-button')
      fireEvent.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    it('should not display retry button if onRetry is not provided', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const retryButton = screen.queryByTestId('retry-button')
      expect(retryButton).not.toBeInTheDocument()
    })

    it('should not display retry button for non-retryable errors', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} onRetry={mockOnRetry} />)

      const retryButton = screen.queryByTestId('retry-button')
      expect(retryButton).not.toBeInTheDocument()
    })
  })

  describe('Back to Home Functionality', () => {
    it('should display back to home button', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const backButton = screen.getByTestId('back-to-home-button')
      expect(backButton).toBeInTheDocument()
      expect(backButton).toHaveTextContent(/back to home/i)
    })

    it('should have correct link to home', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const backButton = screen.getByTestId('back-to-home-button')
      expect(backButton).toHaveAttribute('href', '/')
    })
  })

  describe('Visual Styling', () => {
    it('should have error container styling', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      const { container } = render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorContainer = container.querySelector('.rounded-lg')
      expect(errorContainer).toBeInTheDocument()
    })

    it('should have error icon styling', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorIcon = screen.getByTestId('error-icon')
      expect(errorIcon).toHaveClass('text-error')
    })
  })

  describe('Accessibility', () => {
    it('should have role="alert" for error announcement', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorBoundary = screen.getByTestId('stock-page-error-boundary')
      expect(errorBoundary).toHaveAttribute('role', 'alert')
    })

    it('should have aria-live for live updates', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorBoundary = screen.getByTestId('stock-page-error-boundary')
      expect(errorBoundary).toHaveAttribute('aria-live', 'polite')
    })

    it('should have aria-describedby for error details', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorBoundary = screen.getByTestId('stock-page-error-boundary')
      expect(errorBoundary).toHaveAttribute('aria-describedby')
    })
  })

  describe('Edge Cases', () => {
    it('should handle error with empty message', () => {
      const error = new ApiError(ApiErrorType.UNKNOWN, 0, '', false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should handle error with very long message', () => {
      const longMessage = 'This is a very long error message that spans multiple lines and contains a lot of information about what went wrong. '.repeat(5)
      const error = new ApiError(ApiErrorType.UNKNOWN, 0, longMessage, false)

      render(<StockPageErrorBoundary error={error} symbol={mockSymbol} />)

      const errorDetails = screen.queryByTestId('error-details')
      expect(errorDetails).toBeInTheDocument()
      expect(errorDetails).toHaveTextContent(longMessage)
    })

    it('should handle special characters in symbol', () => {
      const error = new ApiError(ApiErrorType.NOT_FOUND, 404, 'Stock not found', false)

      render(<StockPageErrorBoundary error={error} symbol="P-T-T" />)

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveTextContent('P-T-T')
    })
  })
})
