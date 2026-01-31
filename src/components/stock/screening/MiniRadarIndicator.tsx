'use client'

/**
 * Mini Radar Indicator Component
 *
 * CSS-based visualization of layer scores.
 * Uses simple div bars instead of heavy charting library.
 */

import { getScoreColorClasses } from './constants'

export interface MiniRadarData {
  name: string
  thaiName: string
  score: number
  maxScore: number
  color: string
}

interface MiniRadarIndicatorProps {
  layers: MiniRadarData[]
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  className?: string
}

const SIZE_CONFIG = {
  sm: {
    barHeight: 4,
    barWidth: 24,
    gap: 2,
  },
  md: {
    barHeight: 6,
    barWidth: 32,
    gap: 3,
  },
  lg: {
    barHeight: 8,
    barWidth: 40,
    gap: 4,
  },
} as const

export function MiniRadarIndicator({
  layers,
  size = 'md',
  showLabels = false,
  className = '',
}: MiniRadarIndicatorProps) {
  const config = SIZE_CONFIG[size]

  return (
    <div className={`mini-radar-indicator ${className}`}>
      <div className="flex items-end justify-center gap-2" style={{ height: `${layers.length * (config.barHeight + config.gap) + 20}px` }}>
        {/* Layer bars arranged horizontally */}
        {layers.map((layer, index) => {
          const colors = getScoreColorClasses(layer.score)
          const percentage = (layer.score / layer.maxScore) * 100
          const barWidth = Math.max(config.barWidth, (percentage / 100) * config.barWidth * 2)

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              {/* Score */}
              <span className={`text-xs font-bold tabular-nums ${colors.text}`}>
                {layer.score}
              </span>

              {/* Bar */}
              <div
                className={`rounded-full transition-all duration-500 ${colors.progress}`}
                style={{
                  width: `${barWidth}px`,
                  height: `${config.barHeight * 2}px`,
                }}
              />

              {/* Label (if enabled) */}
              {showLabels && (
                <span className="text-xs text-text-3 max-w-[60px] text-center truncate">
                  {layer.thaiName}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * LayerScoreBars - Horizontal bar chart variant
 */
interface LayerScoreBarsProps {
  layers: MiniRadarData[]
  compact?: boolean
  className?: string
}

export function LayerScoreBars({
  layers,
  compact = false,
  className = '',
}: LayerScoreBarsProps) {
  return (
    <div className={`layer-score-bars ${className}`}>
      <div className="space-y-2">
        {layers.map((layer, index) => {
          const colors = getScoreColorClasses(layer.score)
          const percentage = (layer.score / layer.maxScore) * 100

          return (
            <div key={index} className="flex items-center gap-2">
              {/* Layer name */}
              <span className={`text-xs font-medium text-text-secondary w-20 shrink-0 ${compact ? 'hidden' : ''}`}>
                {layer.thaiName}
              </span>

              {/* Number */}
              <span className={`text-xs font-bold tabular-nums w-8 text-right ${colors.text}`}>
                {layer.score}
              </span>

              {/* Bar */}
              <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors.progress}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Max */}
              <span className="text-xs text-text-3 w-8">
                /{layer.maxScore}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * RadialScoreDisplay - Circular score display
 */
interface RadialScoreDisplayProps {
  score: number
  maxScore: number
  label?: string
  size?: number
  className?: string
}

export function RadialScoreDisplay({
  score,
  maxScore,
  label,
  size = 80,
  className = '',
}: RadialScoreDisplayProps) {
  const colors = getScoreColorClasses(score)
  const percentage = (score / maxScore) * 100
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={`radial-score-display ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className="stroke-surface-3"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className={colors.progress.replace('bg-', 'stroke-')}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold tabular-nums ${colors.text}`}>
            {score}
          </span>
          {label && (
            <span className="text-xs text-text-3 mt-0.5">{label}</span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * LayerScoreGrid - Grid display for layer scores
 */
interface LayerScoreGridProps {
  universe: { score: number; passed: boolean }
  quality: { score: number }
  valueGrowth: { score: number }
  technical: { score: number }
  locale?: 'en' | 'th'
  className?: string
}

const LAYER_NAMES = {
  en: {
    1: 'Universe',
    2: 'Quality',
    3: 'Value+Growth',
    4: 'Technical',
  },
  th: {
    1: 'กรองพื้นฐาน',
    2: 'คุณภาพ',
    3: 'มูลค่า+เติบโต',
    4: 'เทคนิค',
  },
} as const

export function LayerScoreGrid({
  universe,
  quality,
  valueGrowth,
  technical,
  locale = 'th',
  className = '',
}: LayerScoreGridProps) {
  const t = LAYER_NAMES[locale]
  const layerData = [
    { num: 1, name: t[1], score: universe.score, maxScore: 2, passed: universe.passed },
    { num: 2, name: t[2], score: quality.score, maxScore: 10 },
    { num: 3, name: t[3], score: valueGrowth.score, maxScore: 10 },
    { num: 4, name: t[4], score: technical.score, maxScore: 10 },
  ]

  return (
    <div className={`layer-score-grid ${className}`}>
      <div className="grid grid-cols-2 gap-2">
        {layerData.map((layer) => {
          const colors = getScoreColorClasses(layer.score)
          const percentage = (layer.score / layer.maxScore) * 100

          return (
            <div
              key={layer.num}
              className={`p-2 rounded-lg border transition-all ${
                percentage >= 70
                  ? 'border-up-primary/30 bg-up-soft/10'
                  : percentage >= 50
                    ? 'border-insight/30 bg-insight/10'
                    : 'border-risk/30 bg-risk/10'
              }`}
            >
              {/* Layer number and name */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${colors.bg} ${colors.text}`}>
                  {layer.num}
                </span>
                <span className="text-xs text-text-secondary truncate">{layer.name}</span>
              </div>

              {/* Mini bar */}
              <div className="h-1 bg-surface-3 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full ${colors.progress}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Score */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold tabular-nums ${colors.text}`}>
                  {layer.score}
                </span>
                <span className="text-xs text-text-3">/{layer.maxScore}</span>
              </div>

              {/* Pass/fail indicator for universe */}
              {layer.num === 1 && 'passed' in layer && (
                <div className="mt-1">
                  <span className={`text-xs ${layer.passed ? 'text-up-primary' : 'text-risk'}`}>
                    {layer.passed ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
