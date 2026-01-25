/**
 * Button Component
 * Button with multiple variants and sizes
 * Based on: docs/design_rules.md
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
    primary: 'bg-up-primary text-bg-primary hover:shadow-glow-up focus:ring-up-primary/50',
    secondary: 'bg-bg-surface-2 text-text-primary border border-border-subtle hover:bg-bg-surface-3 focus:ring-border-default/50',
    outline: 'bg-transparent border border-border-subtle text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary focus:ring-border-default/50',
    ghost: 'bg-transparent text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary focus:ring-border-default/50',
    danger: 'bg-down-primary text-text-primary hover:shadow-glow-down focus:ring-down-primary/50',
    insight: 'bg-insight text-bg-primary focus:ring-insight/50',
  }

  // Size variants with button heights from design_rules.md
  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-button-height-mobile sm:h-button-height-desktop',  // 44px mobile, 40px desktop
    md: 'px-4 py-2 text-base h-button-height-mobile sm:h-button-height-desktop', // 44px mobile, 40px desktop
    lg: 'px-6 py-3 text-lg h-12',                                                  // 48px
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary',
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
