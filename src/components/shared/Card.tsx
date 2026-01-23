/**
 * Card Component
 * A base card container with multiple variants - Dark Theme
 */

import { cn } from '@/lib/utils'
import type { CardProps } from '@/types'

export function Card({ children, className, variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-base-surface border border-base-border rounded-lg shadow-sm',
    outlined: 'bg-transparent border border-base-border rounded-lg',
    elevated: 'bg-base-surface border border-base-border rounded-lg shadow-md',
  }

  return (
    <div className={cn(variants[variant], 'p-4', className)}>
      {children}
    </div>
  )
}
