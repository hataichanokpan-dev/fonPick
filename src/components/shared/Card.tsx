/**
 * Card Component
 * A base card container with multiple variants
 */

import { cn } from '@/lib/utils'
import type { CardProps } from '@/types'

export function Card({ children, className, variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
    outlined: 'bg-transparent border border-gray-300 rounded-lg',
    elevated: 'bg-white border border-gray-200 rounded-lg shadow-md',
  }

  return (
    <div className={cn(variants[variant], 'p-4', className)}>
      {children}
    </div>
  )
}
