/**
 * DataBadge Component
 * Shows data freshness indicator with timestamp
 */

import { Clock } from 'lucide-react'
import { formatTimestamp } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DataBadgeProps {
  timestamp: number
  className?: string
}

export function DataBadge({ timestamp, className }: DataBadgeProps) {
  const timeAgo = formatTimestamp(timestamp)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-gray-500',
        className
      )}
    >
      <Clock className="w-3 h-3" />
      <span>{timeAgo}</span>
    </div>
  )
}
