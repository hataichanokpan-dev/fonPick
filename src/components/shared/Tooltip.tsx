/**
 * Tooltip Component
 *
 * Displays additional information on hover or click
 * Used throughout guide page for technical term explanations
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  content: string | React.ReactNode
  children?: React.ReactNode
  side?: TooltipSide
  className?: string
}

// ============================================================================
// POSITIONING UTILITIES
// ============================================================================

const sideClasses: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowClasses: Record<TooltipSide, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800',
}

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <span
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      {children || (
        <Info className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help transition-colors" />
      )}

      <AnimatePresence>
        {isVisible && (
          <>
            {/* Tooltip Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute z-50 px-3 py-2 max-w-xs',
                'bg-gray-800 text-gray-200 text-sm',
                'rounded-lg shadow-lg border border-gray-700',
                'pointer-events-none',
                sideClasses[side]
              )}
            >
              {typeof content === 'string' ? (
                <p className="whitespace-normal">{content}</p>
              ) : (
                content
              )}
            </motion.div>

            {/* Arrow */}
            <div
              className={cn(
                'absolute z-50 w-0 h-0',
                'border-4',
                arrowClasses[side]
              )}
            />
          </>
        )}
      </AnimatePresence>
    </span>
  )
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default Tooltip

// ============================================================================
// CONVENIENCE COMPONENT FOR INLINE USE
// ============================================================================

interface InlineTooltipProps {
  term: string
  explanation: string
}

export function InlineTooltip({ term, explanation }: InlineTooltipProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <span>{term}</span>
      <Tooltip content={explanation} side="top" />
    </span>
  )
}
