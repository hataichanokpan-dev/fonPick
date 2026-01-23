/**
 * ErrorFallback Component
 * Error display with optional retry action - Dark Theme
 *
 * Client Component - handles interactivity
 */

'use client'

import { AlertCircle } from 'lucide-react'

interface ErrorFallbackProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorFallback({
  title = 'Something went wrong',
  message = 'Unable to load data. Please try again later.',
  onRetry,
}: ErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      // Default behavior: reload the page
      window.location.reload()
    }
  }

  return (
    <div className="rounded-lg p-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444' }}>
      <div className="flex items-start">
        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium" style={{ color: '#FCA5A5' }}>{title}</h3>
          <p className="mt-1 text-sm" style={{ color: '#FECACA' }}>{message}</p>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                color: '#FCA5A5',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
