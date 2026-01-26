/**
 * AccessibleSignal Component
 *
 * A color-blind friendly signal badge component for financial data visualization.
 * Uses both color AND texture patterns for accessibility.
 *
 * Features:
 * - Icon display (TrendingUp, TrendingDown, Minus)
 * - SVG pattern overlay for color-blind accessibility
 * - Optional flash animation on state change
 * - Multiple sizes (sm, md, lg)
 * - Full ARIA labels for screen readers
 * - Tabular numbers for alignment
 *
 * Based on: docs/design_rules.md
 */

'use client'

import { motion, Variants } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AccessibleSignalProps } from '@/types'

/**
 * AccessibleSignal - Color-blind friendly signal indicator
 *
 * @example
 * ```tsx
 * <AccessibleSignal type="up" label="Change" value="+2.5%" />
 * <AccessibleSignal type="down" label="Volume" value="-1.2M" size="lg" />
 * <AccessibleSignal type="neutral" label="Price" value="125.50" animated />
 * ```
 */
export function AccessibleSignal({
  type,
  label,
  value,
  showIcon = true,
  showPattern = true,
  size = 'md',
  className,
  animated = false,
}: AccessibleSignalProps) {
  // Size configurations
  const sizes = {
    sm: {
      container: 'px-2 py-1 gap-1.5',
      icon: 'w-3 h-3',
      text: 'text-xs',
      patternSize: 4,
    },
    md: {
      container: 'px-3 py-1.5 gap-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
      patternSize: 6,
    },
    lg: {
      container: 'px-4 py-2 gap-2.5',
      icon: 'w-5 h-5',
      text: 'text-base',
      patternSize: 8,
    },
  }

  // Type configurations with colors and icons
  const getTypeConfig = (signalType: 'up' | 'down' | 'neutral') => {
    const configs = {
      up: {
        bg: 'bg-up-soft',
        textColor: 'text-up-primary',
        borderColor: 'border-up-primary/30',
        icon: TrendingUp,
        ariaLabel: 'up',
        patternId: 'diagonal-stripe-up',
      },
      down: {
        bg: 'bg-down-soft',
        textColor: 'text-down-primary',
        borderColor: 'border-down-primary/30',
        icon: TrendingDown,
        ariaLabel: 'down',
        patternId: 'diagonal-stripe-down',
      },
      neutral: {
        bg: 'bg-surface-2',
        textColor: 'text-neutral',
        borderColor: 'border-neutral/30',
        icon: Minus,
        ariaLabel: 'neutral',
        patternId: 'dot-pattern',
      },
    }
    return configs[signalType]
  }

  const config = getTypeConfig(type)
  const sizeConfig = sizes[size]
  const IconComponent = config.icon

  // Animation variants
  const animationVariants: Variants = {
    initial: { scale: 0.9, opacity: 0.8 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 17,
      }
    },
  }

  // Generate ARIA label
  const generateAriaLabel = () => {
    const parts = [config.ariaLabel]
    if (label) parts.push(label)
    if (value !== undefined) parts.push(String(value))
    return parts.join(': ')
  }

  const content = (
    <span className="relative inline-flex">
      {/* Icon */}
      {showIcon && <IconComponent className={cn(sizeConfig.icon, config.textColor)} />}

      {/* Label and/or Value */}
      {(label || value !== undefined) && (
        <span className={cn('inline-flex items-center gap-1', sizeConfig.text, config.textColor)}>
          {/* Tabular numbers for value alignment */}
          <span className="font-tabular">
            {label && <span className="font-medium">{label}</span>}
            {label && value !== undefined && <span className="mx-0.5">·</span>}
            {value !== undefined && <span className="font-semibold">{value}</span>}
          </span>
        </span>
      )}

      {/* Pattern Overlay for color-blind accessibility */}
      {showPattern && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
          aria-hidden="true"
        >
          <defs>
            {/* Diagonal stripe pattern for UP */}
            <pattern
              id={config.patternId}
              width={sizeConfig.patternSize * 2}
              height={sizeConfig.patternSize * 2}
              patternUnits="userSpaceOnUse"
              patternTransform={type === 'down' ? 'rotate(-45)' : 'rotate(45)'}
            >
              {type === 'neutral' ? (
                // Dot pattern for neutral
                <circle
                  cx={sizeConfig.patternSize / 2}
                  cy={sizeConfig.patternSize / 2}
                  r={sizeConfig.patternSize / 6}
                  fill="currentColor"
                  className="text-neutral/20"
                />
              ) : (
                // Diagonal stripes for up/down
                <line
                  x1="0"
                  y1="0"
                  x2={sizeConfig.patternSize}
                  y2="0"
                  stroke="currentColor"
                  strokeWidth="1"
                  className={type === 'up' ? 'text-up-primary/20' : 'text-down-primary/20'}
                />
              )}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${config.patternId})`} />
        </svg>
      )}
    </span>
  )

  const wrapperClass = cn(
    'relative inline-flex items-center rounded-md border font-medium transition-all duration-200',
    config.bg,
    config.borderColor,
    'border',
    sizeConfig.container,
    className
  )

  // Render with or without animation
  if (animated) {
    return (
      <motion.span
        role="status"
        aria-label={generateAriaLabel()}
        className={wrapperClass}
        variants={animationVariants}
        initial="initial"
        animate="animate"
      >
        {content}
      </motion.span>
    )
  }

  return (
    <span
      role="status"
      aria-label={generateAriaLabel()}
      className={wrapperClass}
    >
      {content}
    </span>
  )
}

/**
 * Default export for convenience
 */
export default AccessibleSignal
