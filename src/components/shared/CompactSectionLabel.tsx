/**
 * CompactSectionLabel Component
 *
 * Subtle inline label for section headers (16px height vs 32px for PrioritySectionLabel).
 * Reduces vertical spacing while maintaining visual hierarchy.
 *
 * Features:
 * - Inline layout with small gap
 * - Priority in 10px font with 70% opacity
 * - Separator (/) between priority and label
 * - Color coding: P0=teal, P1=blue, P2=yellow
 */

import { type ReactNode } from 'react'
import { clsx } from 'clsx'

// ============================================================================
// TYPES
// ============================================================================

export type Priority = 'P0' | 'P1' | 'P2'

export interface CompactSectionLabelProps {
  /** Priority level (P0, P1, or P2) */
  priority: Priority
  /** Section label text */
  label: string
  /** Optional additional CSS classes */
  className?: string
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get color classes for priority
 */
function getPriorityColors(priority: Priority): string {
  const colors = {
    P0: 'text-up-primary',
    P1: 'text-accent-blue',
    P2: 'text-warn',
  }
  return colors[priority]
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CompactSectionLabel - Subtle inline label for section headers
 *
 * @example
 * ```tsx
 * <CompactSectionLabel priority="P0" label="Market Overview" />
 * <CompactSectionLabel priority="P1" label="Sector Analysis" className="mt-4" />
 * ```
 */
export function CompactSectionLabel({
  priority,
  label,
  className,
}: CompactSectionLabelProps): ReactNode {
  const priorityColorClass = getPriorityColors(priority)

  return (
    <div
      className={clsx(
        // Layout: inline with small gap
        'inline-flex',
        'items-center',
        'gap-1', // Small gap (0.25rem)
        className,
      )}
    >
      {/* Priority badge */}
      <span
        className={clsx(
          // Size: 10px font (text-xs is ~12px, closest Tailwind option)
          'text-xs',
          // Color: priority-specific
          priorityColorClass,
          // Opacity: 70%
          'opacity-70',
        )}
      >
        {priority}
      </span>

      {/* Separator */}
      <span className="text-text-secondary opacity-50">/</span>

      {/* Label */}
      <span className="text-text-secondary text-sm">
        {label}
      </span>
    </div>
  )
}
