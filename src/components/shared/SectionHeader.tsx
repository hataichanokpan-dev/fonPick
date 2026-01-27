/**
 * SectionHeader Component
 *
 * Professional section header with integrated priority indicator.
 * Replaces CompactSectionLabel for a more polished, modern look.
 *
 * Design Philosophy:
 * - Priority is shown through subtle visual cues (color + icon), not technical badges
 * - Clean typography with clear hierarchy
 * - Optional decorative elements for visual interest
 *
 * Features:
 * - Priority-based color theming (P0=teal/emerald, P1=blue, P2=amber)
 * - Optional icon for visual context
 * - Subtle gradient background for depth
 * - Responsive typography
 * - Clean, professional appearance
 */

'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import {
  TrendingUp,
  BarChart3,
  Activity,
  type LucideIcon,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export type Priority = 'P0' | 'P1' | 'P2'

export interface SectionHeaderProps {
  /** Priority level affects color theme */
  priority?: Priority
  /** Section title text */
  title: string
  /** Optional subtitle or description */
  subtitle?: string
  /** Optional icon component */
  icon?: LucideIcon
  /** Optional additional CSS classes */
  className?: string
  /** Whether to show decorative elements (default: true) */
  showDecorations?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PRIORITY_CONFIG = {
  P0: {
    // Primary/Most Important - Emerald/Teal theme
    icon: TrendingUp,
    gradient: 'from-emerald-500/10 to-teal-500/5',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
  },
  P1: {
    // Secondary - Blue theme
    icon: BarChart3,
    gradient: 'from-blue-500/10 to-indigo-500/5',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
  },
  P2: {
    // Tertiary - Amber theme
    icon: Activity,
    gradient: 'from-amber-500/10 to-orange-500/5',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
  },
} as const

// Animation variants
const ANIMATION_VARIANTS = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
} as const

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SectionHeader - Professional section header with integrated priority indicator
 *
 * @example
 * ```tsx
 * <SectionHeader priority="P0" title="Market Overview" />
 * <SectionHeader
 *   priority="P1"
 *   title="Sector Analysis"
 *   subtitle="Top performing sectors this week"
 *   icon={BarChart3}
 * />
 * ```
 */
export function SectionHeader({
  priority = 'P0',
  title,
  subtitle,
  icon: IconProp,
  className,
  showDecorations = true,
}: SectionHeaderProps): ReactNode {
  const config = PRIORITY_CONFIG[priority]
  const DefaultIcon = config.icon
  const Icon = IconProp || DefaultIcon

  return (
    <motion.div
      className={clsx(
        // Layout
        'relative',
        'overflow-hidden',
        // Spacing
        'py-3',
        'px-4',
        'sm:py-4',
        'sm:px-5',
        // Border radius
        'rounded-lg',
        // Background gradient
        `bg-gradient-to-r ${config.gradient}`,
        // Border
        `border ${config.border}`,
        className,
      )}
      initial={ANIMATION_VARIANTS.initial}
      animate={ANIMATION_VARIANTS.animate}
      transition={ANIMATION_VARIANTS.transition}
    >
      {/* Decorative accent line (left side) */}
      {showDecorations && (
        <div
          className={clsx(
            'absolute',
            'left-0',
            'top-0',
            'bottom-0',
            'w-1',
            config.text,
            'opacity-60',
          )}
        />
      )}

      {/* Content */}
      <div className="relative flex items-center gap-3">
        {/* Icon with background */}
        <div
          className={clsx(
            'flex',
            'items-center',
            'justify-center',
            'w-8',
            'h-8',
            'rounded-md',
            config.iconBg,
          )}
        >
          <Icon className={clsx('w-4 h-4', config.text)} />
        </div>

        {/* Title and subtitle */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h2
            className={clsx(
              // Typography
              'text-lg',
              'font-bold',
              'tracking-tight',
              // Colors
              'text-text-primary',
              // Text overflow
              'truncate',
            )}
          >
            {title}
          </h2>

          {/* Subtitle (optional) */}
          {subtitle && (
            <p
              className={clsx(
                // Typography
                'text-xs',
                'font-medium',
                // Colors
                'text-text-muted',
                // Text overflow
                'truncate',
                'mt-0.5',
              )}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Decorative priority indicator (subtle) */}
        {showDecorations && (
          <div
            className={clsx(
              'flex',
              'items-center',
              'gap-1.5',
              'px-2',
              'py-1',
              'rounded-full',
              config.border,
              'bg-surface/50',
            )}
          >
            <div
              className={clsx('w-1.5 h-1.5 rounded-full', config.text)}
            />
            <span
              className={clsx(
                'text-[10px]',
                'font-semibold',
                'uppercase',
                'tracking-wider',
                config.text,
              )}
            >
              {priority}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default SectionHeader
