/**
 * Badge Component
 * Status badges with color variants
 * Based on: docs/design_rules.md
 */

import { cn } from '@/lib/utils'
import type { BadgeProps } from '@/types'

export function Badge({
  children,
  color = 'neutral',
  size = 'md',
  className,
}: BadgeProps) {
  // Color variants from design_rules.md
  const getColorStyles = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      up: { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80' }, // up-soft / up-primary
      down: { bg: 'rgba(255, 107, 107, 0.15)', text: '#ff6b6b' }, // down-soft / down-primary
      neutral: { bg: '#1f2937', text: '#a0a0a0' }, // surface-2 / text-secondary
      'up-strong': { bg: '#4ade80', text: '#0a0e17' }, // up-primary / bg-primary
      'down-strong': { bg: '#ff6b6b', text: '#ffffff' }, // down-primary / text-primary
      buy: { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80' }, // up-soft / up-primary
      sell: { bg: 'rgba(255, 107, 107, 0.25)', text: '#ff6b6b' }, // down-soft / down-primary (increased opacity for mobile contrast)
      watch: { bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' }, // insight/20
      avoid: { bg: 'rgba(255, 107, 107, 0.2)', text: '#ff6b6b' }, // down-primary/20
      insight: { bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' }, // insight/20
      warning: { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316' }, // warning/20
    }
    return colorMap[color] || colorMap.neutral
  }

  // Size variants from design_rules.md
  const sizes = {
    sm: 'px-2 py-1 text-xs',      // 8px 4px, 12px
    md: 'px-3 py-1.5 text-sm',    // 12px 6px, 14px
    lg: 'px-4 py-2 text-base',    // 16px 8px, 16px
  }

  const styles = getColorStyles(color)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-150',
        sizes[size],
        className
      )}
      style={{ backgroundColor: styles.bg, color: styles.text }}
    >
      {children}
    </span>
  )
}
