/**
 * LensScores Component
 * Three lens scores visualization (Quality, Valuation, Timing)
 */

import { Card } from '@/components/shared'
import { Check, X, Minus } from 'lucide-react'
import type { LensScore } from '@/types'

interface LensScoresProps {
  lenses: LensScore[]
}

export function LensScores({ lenses }: LensScoresProps) {
  const getPassCount = () => lenses.filter((l) => l.status === 'Pass').length

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Three-Lens Analysis
        </h3>
        <div className="text-sm text-gray-600">
          {getPassCount()}/{lenses.length} Pass
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {lenses.map((lens) => (
          <LensCard key={lens.lens} lens={lens} />
        ))}
      </div>

      {/* Overall Assessment */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          {getPassCount() === lenses.length ? (
            <>
              <Check className="w-5 h-5 text-buy-DEFAULT" />
              <span className="text-sm font-medium text-gray-700">
                All lenses pass - Strong investment candidate
              </span>
            </>
          ) : getPassCount() >= 2 ? (
            <>
              <Minus className="w-5 h-5 text-watch-DEFAULT" />
              <span className="text-sm font-medium text-gray-700">
                Most lenses pass - Worth considering
              </span>
            </>
          ) : (
            <>
              <X className="w-5 h-5 text-avoid-DEFAULT" />
              <span className="text-sm font-medium text-gray-700">
                Multiple concerns - Proceed with caution
              </span>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

interface LensCardProps {
  lens: LensScore
}

function LensCard({ lens }: LensCardProps) {
  const getLabel = (lensName: string): string => {
    switch (lensName) {
      case 'quality':
        return 'Quality'
      case 'valuation':
        return 'Valuation'
      case 'timing':
        return 'Timing'
      default:
        return lensName
    }
  }

  const getIcon = (status: LensScore['status']) => {
    switch (status) {
      case 'Pass':
        return <Check className="w-4 h-4" />
      case 'Fail':
        return <X className="w-4 h-4" />
      case 'Partial':
        return <Minus className="w-4 h-4" />
    }
  }

  const getColor = (status: LensScore['status']) => {
    switch (status) {
      case 'Pass':
        return 'bg-buy-light border-buy-DEFAULT'
      case 'Fail':
        return 'bg-avoid-light border-avoid-DEFAULT'
      case 'Partial':
        return 'bg-watch-light border-watch-DEFAULT'
    }
  }

  const getTextColor = (status: LensScore['status']) => {
    switch (status) {
      case 'Pass':
        return 'text-buy-dark'
      case 'Fail':
        return 'text-avoid-dark'
      case 'Partial':
        return 'text-watch-dark'
    }
  }

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4',
        getColor(lens.status)
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{getLabel(lens.lens)}</h4>
        <div className={cn('flex items-center', getTextColor(lens.status))}>
          {getIcon(lens.status)}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold text-gray-900">
          {Math.round(lens.score)}
        </div>
        <div className="text-xs text-gray-500">Score</div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            lens.status === 'Pass' && 'bg-buy-DEFAULT',
            lens.status === 'Fail' && 'bg-avoid-DEFAULT',
            lens.status === 'Partial' && 'bg-watch-DEFAULT'
          )}
          style={{ width: `${lens.score}%` }}
        />
      </div>

      {/* Notes */}
      {lens.notes.length > 0 && (
        <ul className="space-y-1">
          {lens.notes.map((note, index) => (
            <li
              key={index}
              className="text-xs text-gray-600 flex items-start gap-1"
            >
              <span className="mt-0.5">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
