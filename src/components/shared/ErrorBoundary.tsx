/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Logs errors and displays a fallback UI
 *
 * Theme: Green-tinted dark with teal up / soft red down
 */

'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-lg p-6" style={{
            backgroundColor: 'rgba(244, 91, 105, 0.1)',
            border: '1px solid #F45B69'
          }}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#F45B69' }} />
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-2" style={{ color: '#FCA5A5' }}>
                  Something went wrong
                </h3>
                <p className="text-sm mb-4" style={{ color: '#FECACA' }}>
                  An unexpected error occurred. Please try again.
                </p>

                {/* Show error details in development */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-4">
                    <summary className="text-xs cursor-pointer mb-2" style={{ color: '#FECACA' }}>
                      Error Details
                    </summary>
                    <pre className="text-xs p-2 rounded overflow-auto max-h-32" style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      color: '#FCA5A5'
                    }}>
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={this.handleReset}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      color: '#FCA5A5',
                      backgroundColor: 'rgba(244, 91, 105, 0.2)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(244, 91, 105, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(244, 91, 105, 0.2)'}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                  <button
                    onClick={this.handleReload}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors"
                    style={{
                      color: '#B8C1BD',
                      borderColor: '#222826',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#151A18'
                      e.currentTarget.style.color = '#E6EDEA'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#B8C1BD'
                    }}
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Simple error boundary with minimal UI for inline errors
 */
interface InlineErrorBoundaryProps {
  children: React.ReactNode
  message?: string
}

export function InlineErrorBoundary({
  children,
  message = 'Content failed to load'
}: InlineErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 rounded-lg text-center" style={{
          backgroundColor: 'rgba(244, 91, 105, 0.05)',
          border: '1px solid rgba(244, 91, 105, 0.2)'
        }}>
          <AlertTriangle className="w-5 h-5 mx-auto mb-2" style={{ color: '#F45B69' }} />
          <p className="text-sm" style={{ color: '#FECACA' }}>{message}</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Hook-based error boundary using React's useErrorBoundary (if available)
 * Note: This requires React 19's experimental features or a library like react-error-boundary
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error
  }
}
