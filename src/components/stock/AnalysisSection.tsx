/**
 * AnalysisSection Component
 *
 * Reusable collapsible wrapper for analysis sections
 *
 * Features:
 * - Collapsible header with title
 * - Loading state with spinner
 * - Error state with message
 * - Children content display
 * - Default expanded/collapsed state
 * - ARIA attributes for accessibility
 * - Responsive layout
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AnalysisSectionProps {
  /** Section title */
  title: string
  /** Whether the section is in loading state */
  isLoading?: boolean
  /** Error message to display */
  error?: string | null
  /** Whether the section should be collapsed by default */
  defaultCollapsed?: boolean
  /** Additional CSS classes */
  className?: string
  /** Section content */
  children: React.ReactNode
}

/**
 * AnalysisSection - Collapsible wrapper component
 *
 * @example
 * ```tsx
 * <AnalysisSection title="Fundamental Analysis">
 *   <div>Your content here</div>
 * </AnalysisSection>
 *
 * <AnalysisSection title="Loading Data" isLoading>
 *   <div>This won't be shown</div>
 * </AnalysisSection>
 *
 * <AnalysisSection title="Error Section" error="Failed to load">
 *   <div>This won't be shown</div>
 * </AnalysisSection>
 * ```
 */
export function AnalysisSection({
  title,
  isLoading = false,
  error = null,
  defaultCollapsed = false,
  className,
  children,
}: AnalysisSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  // ==================================================================
  // RENDER
  // ==================================================================

  return (
    <motion.div
      data-testid="analysis-section"
      className={cn(
        'w-full rounded-lg bg-surface border border-border/50 p-4',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <button
        data-testid="analysis-section-header"
        type="button"
        className="flex items-center justify-between w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        aria-label={`Toggle ${title}`}
      >
        <h3
          data-testid="analysis-section-title"
          className="text-lg font-semibold text-text-primary"
        >
          {title}
        </h3>

        {/* Chevron icon that rotates */}
        <motion.div
          data-testid="analysis-section-chevron"
          animate={{ rotate: isCollapsed ? -90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-2"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            data-testid="analysis-section-loading"
            key="loading"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 flex items-center justify-center py-8"
          >
            <Loader2
              data-testid="analysis-section-spinner"
              className="w-8 h-8 animate-spin text-blue-500"
            />
          </motion.div>
        ) : error ? (
          <motion.div
            data-testid="analysis-section-error"
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 flex items-center gap-2 py-4 text-red-500"
          >
            <AlertCircle data-testid="analysis-section-error-icon" className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        ) : !isCollapsed ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * Default export for convenience
 */
export default AnalysisSection
