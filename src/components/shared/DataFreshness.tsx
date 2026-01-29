/**
 * DataFreshness Component
 * Shows "Data as of [date]" for daily-updated data - Dark Theme
 *
 * Uses Thai timezone (UTC+7) to ensure consistent date display
 * across server and client, preventing hydration errors.
 */

'use client'

import { Clock } from 'lucide-react'
import { useMemo } from 'react'
import { formatThaiDate } from '@/lib/utils/date'

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
  const displayDate = useMemo(() => {
    if (timestamp) {
      return formatThaiDate(new Date(timestamp))
    } else if (date) {
      return formatThaiDate(date)
    }
    return 'Unknown'
  }, [timestamp, date])

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
