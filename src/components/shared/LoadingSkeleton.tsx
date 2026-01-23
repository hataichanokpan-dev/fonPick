/**
 * LoadingSkeleton Component
 * Loading state placeholders
 */

import { cn } from '@/lib/utils'

export function LoadingSkeleton({
  className,
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
}) {
  const variants = {
    default: 'rounded-lg',
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        variants[variant],
        className
      )}
      aria-hidden="true"
    />
  )
}

/**
 * Card skeleton loader
 */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <LoadingSkeleton className="h-5 w-3/4" variant="text" />
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          className={cn('w-full', i === lines - 1 ? 'w-2/3' : '')}
          variant="text"
        />
      ))}
    </div>
  )
}

/**
 * Text skeleton loader
 */
export function TextSkeleton({ width = '100%' }: { width?: string }) {
  return <LoadingSkeleton className={cn('h-4', width)} variant="text" />
}
