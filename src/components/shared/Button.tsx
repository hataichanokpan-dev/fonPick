/**
 * Button Component
 * Button with multiple variants and sizes
 */

import { cn } from '@/lib/utils'
import type { ButtonProps } from '@/types'

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-flow-buy text-text-inverse hover:shadow-glow-up focus:ring-flow-buy',
    secondary: 'bg-base-surface-alt text-text-primary border border-base-border hover:bg-base-border focus:ring-base-border',
    outline: 'border border-base-border text-text-primary hover:bg-base-surface-alt focus:ring-base-border',
    ghost: 'text-text-secondary hover:bg-base-surface-alt hover:text-text-primary focus:ring-base-border',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
