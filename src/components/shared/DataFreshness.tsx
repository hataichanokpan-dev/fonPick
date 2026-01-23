/**
 * DataFreshness Component
 * Shows "Data as of [date]" for daily-updated data - Dark Theme
 */

import { Clock } from 'lucide-react'

interface DataFreshnessProps {
  timestamp?: number
  date?: string
  className?: string
}

export function DataFreshness({
  timestamp,
  date,
  className = '',
}: DataFreshnessProps) {
  let displayDate = 'Unknown'

  if (timestamp) {
    displayDate = new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } else if (date) {
    displayDate = new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div
      className={`flex items-center gap-1.5 text-xs ${className}`}
      style={{ color: '#6B7280' }}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>Data as of {displayDate}</span>
    </div>
  )
}
