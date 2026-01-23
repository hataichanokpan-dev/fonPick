/**
 * Badge Component
 * Status badges with color variants - Dark Theme
 */

import { cn } from '@/lib/utils'
import type { BadgeProps } from '@/types'

export function Badge({
  children,
  color = 'neutral',
  size = 'md',
  className,
}: BadgeProps) {
  // Using inline styles for colors to match the spec exactly
  const getColorStyles = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      up: { bg: '#86EFAC', text: '#065F46' }, // up_soft
      down: { bg: '#FECACA', text: '#991B1F' }, // down_soft
      neutral: { bg: '#94A3B8', text: '#0F172A' }, // neutral
      'up-strong': { bg: '#22C55E', text: '#FFFFFF' }, // up_strong
      'down-strong': { bg: '#EF4444', text: '#FFFFFF' }, // down_strong
      buy: { bg: '#16A34A', text: '#DCFCE7' }, // buy
      sell: { bg: '#DC2626', text: '#FEE2E2' }, // sell
      watch: { bg: '#94A3B8', text: '#0F172A' }, // watch
      avoid: { bg: '#EF4444', text: '#FFFFFF' }, // avoid
    }
    return colorMap[color] || colorMap.neutral
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  const styles = getColorStyles(color)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizes[size],
        className
      )}
      style={{ backgroundColor: styles.bg, color: styles.text }}
    >
      {children}
    </span>
  )
}
