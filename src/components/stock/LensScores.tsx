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
        <h3 className="text-lg font-semibold" style={{ color: '#E5E7EB' }}>
          Three-Lens Analysis
        </h3>
        <div className="text-sm" style={{ color: '#9CA3AF' }}>
          {getPassCount()}/{lenses.length} Pass
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {lenses.map((lens) => (
          <LensCard key={lens.lens} lens={lens} />
        ))}
      </div>

      {/* Overall Assessment */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid #273449' }}>
        <div className="flex items-center gap-2">
          {getPassCount() === lenses.length ? (
            <>
              <Check className="w-5 h-5" style={{ color: '#16A34A' }} />
              <span className="text-sm font-medium" style={{ color: '#E5E7EB' }}>
                All lenses pass - Strong investment candidate
              </span>
            </>
          ) : getPassCount() >= 2 ? (
            <>
              <Minus className="w-5 h-5" style={{ color: '#F59E0B' }} />
              <span className="text-sm font-medium" style={{ color: '#E5E7EB' }}>
                Most lenses pass - Worth considering
              </span>
            </>
          ) : (
            <>
              <X className="w-5 h-5" style={{ color: '#DC2626' }} />
              <span className="text-sm font-medium" style={{ color: '#E5E7EB' }}>
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
        return { bg: 'rgba(22, 163, 74, 0.1)', border: '#16A34A' }
      case 'Fail':
        return { bg: 'rgba(220, 38, 38, 0.1)', border: '#DC2626' }
      case 'Partial':
        return { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B' }
    }
  }

  const getTextColor = (status: LensScore['status']) => {
    switch (status) {
      case 'Pass':
        return '#16A34A'
      case 'Fail':
        return '#DC2626'
      case 'Partial':
        return '#F59E0B'
    }
  }

  const colors = getColor(lens.status)

  return (
    <div
      className="rounded-lg border-2 p-4"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold" style={{ color: '#E5E7EB' }}>{getLabel(lens.lens)}</h4>
        <div className="flex items-center" style={{ color: getTextColor(lens.status) }}>
          {getIcon(lens.status)}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold" style={{ color: '#E5E7EB' }}>
          {Math.round(lens.score)}
        </div>
        <div className="text-xs" style={{ color: '#6B7280' }}>Score</div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: '#1F2937' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${lens.score}%`, backgroundColor: getTextColor(lens.status) }}
        />
      </div>

      {/* Notes */}
      {lens.notes.length > 0 && (
        <ul className="space-y-1">
          {lens.notes.map((note, index) => (
            <li
              key={index}
              className="text-xs flex items-start gap-1"
              style={{ color: '#9CA3AF' }}
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
