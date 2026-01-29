/**
 * LayerScores Component
 *
 * Displays 4-layer scoring system with circular progress indicators:
 * 1. Quality (คุณภาพ) - PEG, NPM, ROE, ROIC/WACC, D/E, FCF Yield, OCF/NI
 * 2. Value (มูลค่า) - PE Band, PB vs ROE, Dividend, EPS growth
 * 3. Growth (การเติบโต) - Revenue growth, EPS growth, Expansion
 * 4. Technical/Catalyst (จังหวะ/เหตุการณ์) - MA, RSI, MACD, Support/Resistance, Events
 *
 * Also supports backwards compatibility with 3-layer system (Quality, Value, Timing)
 */

'use client'

import { motion } from 'framer-motion'
import type { LayerScore } from '@/types/stock-api'

interface LayerScoresProps {
  layerScore: LayerScore
}

// Layer configuration with labels and tooltips
interface LayerConfig {
  id: string
  thaiLabel: string
  englishLabel: string
  tooltip: string[]
  getValue: (score: LayerScore) => number | undefined
}

const LAYERS: LayerConfig[] = [
  {
    id: 'quality',
    thaiLabel: 'คุณภาพ',
    englishLabel: 'Quality',
    tooltip: ['PEG', 'NPM', 'ROE', 'ROIC/WACC', 'D/E', 'FCF Yield', 'OCF/NI'],
    getValue: (s) => s.quality,
  },
  {
    id: 'value',
    thaiLabel: 'มูลค่า',
    englishLabel: 'Value',
    tooltip: ['PE Band', 'PB vs ROE', 'Dividend', 'EPS growth'],
    getValue: (s) => s.valuation,
  },
  {
    id: 'growth',
    thaiLabel: 'การเติบโต',
    englishLabel: 'Growth',
    tooltip: ['Revenue growth', 'EPS growth', 'Expansion'],
    getValue: (s) => s.growth ?? s.technical ?? s.catalyst,
  },
  {
    id: 'technical',
    thaiLabel: 'จังหวะ',
    englishLabel: 'Technical',
    tooltip: ['MA', 'RSI', 'MACD', 'Support/Resistance', 'Events'],
    getValue: (s) => s.technical ?? s.catalyst ?? s.growth,
  },
]

// Determine if this is a 3-layer system (has timing but no growth/technical)
function isThreeLayerSystem(score: LayerScore): boolean {
  return score.timing !== undefined && score.growth === undefined && score.technical === undefined
}

// Get color class based on score
function getColorClass(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-lime-500'
  if (score >= 40) return 'text-yellow-500'
  return 'text-red-500'
}

// Get background color class based on score
function getBgColorClass(score: number): string {
  if (score >= 80) return 'bg-green-500/10'
  if (score >= 60) return 'bg-lime-500/10'
  if (score >= 40) return 'bg-yellow-500/10'
  return 'bg-red-500/10'
}

// Clamp score between 0 and 100
function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score))
}

// Calculate stroke dashoffset for circular progress
function calculateStrokeOffset(score: number, radius: number = 40): number {
  const circumference = 2 * Math.PI * radius
  const clampedScore = clampScore(score)
  return circumference - (clampedScore / 100) * circumference
}

export function LayerScores({ layerScore }: LayerScoresProps) {
  const isThreeLayer = isThreeLayerSystem(layerScore)

  // For 3-layer system, replace the 4th layer with timing
  const displayLayers = isThreeLayer
    ? LAYERS.map((layer, index) =>
        index === 3
          ? { ...layer, id: 'timing', englishLabel: 'Timing', getValue: (s: LayerScore) => s.timing }
          : layer
      )
    : LAYERS

  // Filter layers that have values
  const visibleLayers = displayLayers.filter((layer) => layer.getValue(layerScore) !== undefined)

  return (
    <div data-testid="layer-scores" className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-200">
          {isThreeLayer ? 'Three-Lens Analysis' : 'Four-Layer Scoring System'}
        </h3>
        <p className="text-sm text-gray-400">
          {isThreeLayer
            ? 'Quality, Value, and Timing assessment'
            : 'Quality, Value, Growth, and Technical analysis'}
        </p>
      </div>

      {/* Layer Scores Grid */}
      <div
        className={`grid grid-cols-1 gap-4 ${
          visibleLayers.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {visibleLayers.map((layer) => {
          const score = layer.getValue(layerScore) ?? 0
          const clampedScore = clampScore(score)
          const colorClass = getColorClass(clampedScore)
          const bgColorClass = getBgColorClass(clampedScore)
          const strokeOffset = calculateStrokeOffset(clampedScore)
          const circumference = 2 * Math.PI * 40

          return (
            <LayerCard
              key={layer.id}
              id={layer.id}
              thaiLabel={layer.thaiLabel}
              englishLabel={layer.englishLabel}
              score={clampedScore}
              tooltip={layer.tooltip}
              colorClass={colorClass}
              bgColorClass={bgColorClass}
              strokeOffset={strokeOffset}
              circumference={circumference}
            />
          )
        })}
      </div>
    </div>
  )
}

interface LayerCardProps {
  id: string
  thaiLabel: string
  englishLabel: string
  score: number
  tooltip: string[]
  colorClass: string
  bgColorClass: string
  strokeOffset: number
  circumference: number
}

function LayerCard({
  id,
  thaiLabel,
  englishLabel,
  score,
  tooltip,
  colorClass,
  bgColorClass,
  strokeOffset,
  circumference,
}: LayerCardProps) {
  return (
    <motion.div
      data-testid={`layer-${id}`}
      className={`relative rounded-xl border-2 p-4 ${bgColorClass} transition-all hover:scale-105`}
      aria-label={`${englishLabel} score: ${score}`}
      tabIndex={0}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="mb-3 text-center">
        <h4 className="text-sm font-semibold text-gray-200">{thaiLabel}</h4>
        <p className="text-xs text-gray-400">{englishLabel}</p>
      </div>

      {/* Circular Progress */}
      <div className="relative flex items-center justify-center">
        <svg width="120" height="120" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="40"
            fill="none"
            stroke="#374151"
            strokeWidth="8"
            className="opacity-30"
          />
          {/* Progress circle */}
          <motion.circle
            data-testid={`layer-${id}-progress`}
            cx="60"
            cy="60"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-500`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeOffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              strokeDasharray: circumference,
            }}
            role="img"
            aria-label={`${englishLabel} progress: ${score}%`}
          />
        </svg>

        {/* Score in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            data-testid={`layer-${id}-score`}
            className={`text-3xl font-bold ${colorClass}`}
          >
            {Math.round(score)}
          </span>
        </div>
      </div>

      {/* Tooltip */}
      <div
        data-testid={`layer-${id}-tooltip`}
        className="mt-3 text-xs text-gray-400 opacity-0 hover:opacity-100 transition-opacity"
      >
        <div className="border-t border-gray-700 pt-2">
          <p className="font-semibold text-gray-300 mb-1">Metrics:</p>
          <ul className="space-y-0.5">
            {tooltip.map((item, index) => (
              <li key={index} className="flex items-center gap-1">
                <span className="text-gray-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
