/**
 * Badge Component
 * Status badges with color variants
 */

import { cn } from '@/lib/utils'
import type { BadgeProps } from '@/types'

export function Badge({
  children,
  color = 'neutral',
  size = 'md',
  className,
}: BadgeProps) {
  const colors = {
    up: 'bg-up-100 text-up-700',
    down: 'bg-down-100 text-down-700',
    neutral: 'bg-neutral-100 text-neutral-700',
    buy: 'bg-buy-light text-buy-dark',
    watch: 'bg-watch-light text-watch-dark',
    avoid: 'bg-avoid-light text-avoid-dark',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        colors[color],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
