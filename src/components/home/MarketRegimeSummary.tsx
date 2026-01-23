/**
 * MarketRegimeSummary Component
 * Displays market regime (Risk-On/Neutral/Risk-Off) with confidence and reasons
 */

import { Card, Badge } from '@/components/shared'
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { RegimeResult } from '@/types'

interface MarketRegimeSummaryProps {
  regime: RegimeResult
}

export function MarketRegimeSummary({ regime }: MarketRegimeSummaryProps) {
  const getRegimeColor = (regime: string): 'buy' | 'watch' | 'avoid' => {
    switch (regime) {
      case 'Risk-On':
        return 'buy'
      case 'Risk-Off':
        return 'avoid'
      case 'Neutral':
        return 'watch'
      default:
        return 'watch'
    }
  }

  const getRegimeIcon = (regime: string) => {
    switch (regime) {
      case 'Risk-On':
        return <ShieldCheck className="w-5 h-5 text-buy-DEFAULT" />
      case 'Risk-Off':
        return <ShieldAlert className="w-5 h-5 text-avoid-DEFAULT" />
      case 'Neutral':
        return <Shield className="w-5 h-5 text-watch-DEFAULT" />
    }
  }

  const getConfidenceDots = (confidence: string) => {
    const level = confidence === 'High' ? 3 : confidence === 'Medium' ? 2 : 1
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full',
              i < level
                ? 'bg-current'
                : 'bg-gray-300'
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <Card variant="elevated">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {getRegimeIcon(regime.regime)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Market Regime
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge color={getRegimeColor(regime.regime)} size="lg">
                {regime.regime}
              </Badge>
              <span className="text-sm text-gray-600">
                Confidence: {regime.confidence}
              </span>
              {getConfidenceDots(regime.confidence)}
            </div>
          </div>
        </div>
      </div>

      {/* Reasons */}
      <div className="space-y-2 mb-4">
        {regime.reasons.map((reason, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <p className="text-sm text-gray-700">{reason}</p>
          </div>
        ))}
      </div>

      {/* Focus and Caution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-200">
        {regime.focus && (
          <div className="flex items-start gap-2">
            <span className="text-buy-DEFAULT mt-0.5">▸</span>
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Focus
              </span>
              <p className="text-sm text-gray-700">{regime.focus}</p>
            </div>
          </div>
        )}

        {regime.caution && (
          <div className="flex items-start gap-2">
            <span className="text-avoid-DEFAULT mt-0.5">▸</span>
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Caution
              </span>
              <p className="text-sm text-gray-700">{regime.caution}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
