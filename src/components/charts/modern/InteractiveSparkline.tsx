/**
 * InteractiveSparkline Component
 *
 * An interactive sparkline chart with gradient fill and tooltips for financial data visualization.
 *
 * Features:
 * - Gradient fill under the line chart
 * - Interactive tooltip on hover with custom styling
 * - Smooth path animation on mount (1s duration)
 * - Responsive sizing - works on mobile and desktop
 * - Multiple color variants - up, down, neutral, blue, purple
 * - Configurable height
 * - Value formatter customization
 * - Dashed cursor/crosshair on hover
 *
 * Based on: docs/design_rules.md
 */

'use client'

import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

// ==================================================================
// TYPES
// ==================================================================

export type SparklineColor = 'up' | 'down' | 'neutral' | 'blue' | 'purple'

export interface SparklineDataPoint {
  value: number
  timestamp?: number
}

export interface InteractiveSparklineProps {
  /** Array of data points with value and optional timestamp */
  data: Array<{ value: number; timestamp?: number }>
  /** Color variant for the chart */
  color?: SparklineColor
  /** Height of the chart in pixels (default: 60) */
  height?: number
  /** Show tooltip on hover (default: true) */
  showTooltip?: boolean
  /** Additional CSS classes */
  className?: string
  /** Custom value formatter function (default: (v) => v.toFixed(2)) */
  valueFormatter?: (value: number) => string
  /** ARIA label for accessibility */
  ariaLabel?: string
}

// ==================================================================
// COLOR CONFIGURATIONS
// ==================================================================

const colorConfigs = {
  up: {
    stroke: '#4ade80',
    gradientStart: 'rgba(74, 222, 128, 0.5)',
    gradientEnd: 'rgba(74, 222, 128, 0)',
  },
  down: {
    stroke: '#ff6b6b',
    gradientStart: 'rgba(255, 107, 107, 0.5)',
    gradientEnd: 'rgba(255, 107, 107, 0)',
  },
  neutral: {
    stroke: '#9ca3af',
    gradientStart: 'rgba(156, 163, 175, 0.5)',
    gradientEnd: 'rgba(156, 163, 175, 0)',
  },
  blue: {
    stroke: '#3b82f6',
    gradientStart: 'rgba(59, 130, 246, 0.5)',
    gradientEnd: 'rgba(59, 130, 246, 0)',
  },
  purple: {
    stroke: '#8b5cf6',
    gradientStart: 'rgba(139, 92, 246, 0.5)',
    gradientEnd: 'rgba(139, 92, 246, 0)',
  },
} as const satisfies Record<SparklineColor, {
  stroke: string
  gradientStart: string
  gradientEnd: string
}>

// ==================================================================
// RESPONSIVE HEIGHTS
// ==================================================================

const getResponsiveHeight = (baseHeight: number): number => {
  if (typeof window === 'undefined') return baseHeight

  const width = window.innerWidth
  if (width < 768) {
    // Mobile: use smaller height
    return Math.max(baseHeight * 0.8, 40)
  } else if (width < 1024) {
    // Tablet: use base height
    return baseHeight
  } else {
    // Desktop: use larger height
    return baseHeight * 1.2
  }
}

// ==================================================================
// CUSTOM TOOLTIP COMPONENT
// ==================================================================

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name?: string }>
  color: SparklineColor
  valueFormatter: (value: number) => string
}

const CustomTooltip = ({ active, payload, color, valueFormatter }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null

  const config = colorConfigs[color]
  const value = payload[0].value as number

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="pointer-events-none"
      style={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
      }}
    >
      <p
        className="text-sm font-semibold tabular-nums"
        style={{ color: config.stroke }}
      >
        {valueFormatter(value)}
      </p>
    </motion.div>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

/**
 * InteractiveSparkline - An interactive sparkline chart component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <InteractiveSparkline
 *   data={[
 *     { value: 100, timestamp: 1234567890 },
 *     { value: 102, timestamp: 1234567891 },
 *     { value: 98, timestamp: 1234567892 },
 *   ]}
 *   color="up"
 * />
 *
 * // With custom formatter
 * <InteractiveSparkline
 *   data={data}
 *   color="blue"
 *   valueFormatter={(v) => `${v.toFixed(2)}%`}
 *   height={80}
 * />
 * ```
 */
export function InteractiveSparkline({
  data,
  color = 'neutral',
  height = 60,
  showTooltip = true,
  className,
  valueFormatter = (value: number) => value.toFixed(2),
  ariaLabel,
}: InteractiveSparklineProps) {
  // Get color configuration
  const config = colorConfigs[color]

  // Convert data for Recharts (add index as x-axis)
  const chartData = useMemo(() => {
    return data.map((d, i) => ({ index: i, value: d.value }))
  }, [data])

  // Generate unique gradient ID
  const gradientId = useMemo(() => {
    return `sparkline-gradient-${color}-${Math.random().toString(36).substring(2, 11)}`
  }, [color])

  // Responsive height
  const responsiveHeight = useMemo(() => getResponsiveHeight(height), [height])

  // Generate ARIA label
  const generateAriaLabel = () => {
    if (ariaLabel) return ariaLabel

    const firstValue = data[0]?.value ?? 0
    const lastValue = data[data.length - 1]?.value ?? 0
    const change = lastValue - firstValue
    const changePercent = firstValue !== 0 ? ((change / firstValue) * 100).toFixed(2) : '0.00'

    return `Sparkline chart showing ${data.length} data points. ` +
      `Starting at ${valueFormatter(firstValue)}, ending at ${valueFormatter(lastValue)}. ` +
      `Change: ${change >= 0 ? '+' : ''}${valueFormatter(change)} (${change >= 0 ? '+' : ''}${changePercent}%)`
  }

  return (
    <div
      role="img"
      aria-label={generateAriaLabel()}
      className={cn('w-full', className)}
      style={{ height: `${responsiveHeight}px` }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={config.gradientStart}
              />
              <stop
                offset="100%"
                stopColor={config.gradientEnd}
              />
            </linearGradient>
          </defs>

          {showTooltip && (
            <Tooltip
              content={<CustomTooltip color={color} valueFormatter={valueFormatter} />}
              cursor={{
                stroke: config.stroke,
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
              position={{ y: 0 }}
              allowEscapeViewBox={{ x: true, y: true }}
              animationDuration={150}
            />
          )}

          <Area
            type="monotone"
            dataKey="value"
            stroke={config.stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Fallback text for screen readers */}
      <span className="sr-only">
        {generateAriaLabel()}
      </span>
    </div>
  )
}

/**
 * Default export for convenience
 */
export default InteractiveSparkline
