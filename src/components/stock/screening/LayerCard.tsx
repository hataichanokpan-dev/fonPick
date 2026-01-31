'use client'

/**
 * Layer Card Component
 *
 * Generic collapsible card container for screening layers.
 * Features expand/collapse animation and color-coded borders.
 */

import { useState } from 'react'
import { getLayerColorClasses } from './constants'
import type { LayerCardProps } from './types'
import { ChevronDown } from 'lucide-react'

export function LayerCard({
  layer,
  title,
  thaiTitle,
  description,
  thaiDescription,
  score,
  maxScore,
  color,
  expanded: controlledExpanded,
  onToggle,
  children,
  className = '',
}: LayerCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(true)

  // Use controlled or internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalExpanded(!internalExpanded)
    }
  }

  const layerColors = getLayerColorClasses(color)
  const percentage = Math.round((score / maxScore) * 100)

  return (
    <div className={`layer-card ${className}`}>
      <div className="rounded-xl border overflow-hidden bg-surface border-border transition-all duration-200 hover:border-border-strong">
        {/* Header */}
        <button
          onClick={handleToggle}
          className="w-full px-4 py-3 flex items-center justify-between bg-surface-2/50 hover:bg-surface-2 transition-colors"
          aria-expanded={isExpanded}
        >
          {/* Left: Layer info */}
          <div className="flex items-center gap-3 flex-1">
            {/* Layer number badge */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${layerColors.bg} ${layerColors.text}`}
            >
              {layer}
            </div>

            {/* Title and description */}
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {title}
                </span>
                {thaiTitle && (
                  <span className="text-sm text-text-secondary">
                    {thaiTitle}
                  </span>
                )}
              </div>
              {(description || thaiDescription) && (
                <div className="text-xs text-text-3 mt-0.5">
                  {thaiDescription || description}
                </div>
              )}
            </div>
          </div>

          {/* Right: Score and toggle */}
          <div className="flex items-center gap-3">
            {/* Score badge */}
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold tabular-nums ${layerColors.text}`}>
                {score}
              </span>
              <span className="text-sm text-text-3">
                /{maxScore}
              </span>
            </div>

            {/* Toggle icon */}
            <span className={`shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-5 h-5 text-text-3" />
            </span>
          </div>
        </button>

        {/* Progress bar in header */}
        <div className="h-1 bg-surface-3">
          <div
            className={`h-full transition-all duration-500 ${layerColors.progress}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Content */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
          style={{
            display: 'grid',
          }}
        >
          <div className="min-h-0">
            <div className="p-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * CompactLayerCard - More compact version for mobile
 */
interface CompactLayerCardProps {
  layer: number
  title: string
  thaiTitle?: string
  score: number
  maxScore: number
  color: 'quality' | 'value' | 'technical' | 'universe'
  expanded?: boolean
  onToggle?: () => void
  children: React.ReactNode
  className?: string
}

export function CompactLayerCard({
  layer,
  title,
  thaiTitle,
  score,
  maxScore,
  color,
  expanded: controlledExpanded,
  onToggle,
  children,
  className = '',
}: CompactLayerCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false)

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalExpanded(!internalExpanded)
    }
  }

  const layerColors = getLayerColorClasses(color)
  const percentage = Math.round((score / maxScore) * 100)

  return (
    <div className={`compact-layer-card ${className}`}>
      <div className="rounded-lg border border-border overflow-hidden bg-surface">
        {/* Header */}
        <button
          onClick={handleToggle}
          className="w-full px-3 py-2 flex items-center justify-between bg-surface-2/30"
          aria-expanded={isExpanded}
        >
          {/* Left */}
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${layerColors.bg} ${layerColors.text}`}>
              {layer}
            </span>
            <span className="text-sm font-medium text-text-primary">
              {thaiTitle || title}
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold tabular-nums ${layerColors.text}`}>
              {score}/{maxScore}
            </span>
            <span className={`shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-text-3" />
            </span>
          </div>
        </button>

        {/* Progress bar */}
        <div className="h-0.5 bg-surface-3">
          <div
            className={`h-full transition-all duration-300 ${layerColors.progress}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Content */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
          style={{ display: 'grid' }}
        >
          <div className="min-h-0">
            <div className="p-3">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * LayerHeaderOnly - Just the header, no expand/collapse
 */
interface LayerHeaderOnlyProps {
  layer: number
  title: string
  thaiTitle?: string
  score: number
  maxScore: number
  color: 'quality' | 'value' | 'technical' | 'universe'
  className?: string
}

export function LayerHeaderOnly({
  layer,
  title,
  thaiTitle,
  score,
  maxScore,
  color,
  className = '',
}: LayerHeaderOnlyProps) {
  const layerColors = getLayerColorClasses(color)
  const percentage = Math.round((score / maxScore) * 100)

  return (
    <div className={`layer-header-only ${className}`}>
      <div className="rounded-lg border border-border bg-surface p-3">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${layerColors.bg} ${layerColors.text}`}>
              {layer}
            </span>
            <span className="text-sm font-medium text-text-primary">
              {thaiTitle || title}
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Mini progress bar */}
            <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${layerColors.progress}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className={`text-sm font-bold tabular-nums ${layerColors.text}`}>
              {score}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
