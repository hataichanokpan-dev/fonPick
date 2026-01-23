/**
 * MarketRegimeSummary Component
 * Displays market regime (Risk-On/Neutral/Risk-Off) with confidence and reasons - Dark Theme
 */

import { Card, Badge } from '@/components/shared'
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { RegimeResult } from '@/types'

interface MarketRegimeSummaryProps {
  regime: RegimeResult
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
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
        return <ShieldCheck className="w-5 h-5" style={{ color: '#16A34A' }} />
      case 'Risk-Off':
        return <ShieldAlert className="w-5 h-5" style={{ color: '#EF4444' }} />
      case 'Neutral':
        return <Shield className="w-5 h-5" style={{ color: '#9CA3AF' }} />
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
            style={{
              backgroundColor: i < level ? '#9CA3AF' : '#374151',
            }}
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
            <h3 className="text-lg font-semibold" style={{ color: '#E5E7EB' }}>
              Market Regime
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge color={getRegimeColor(regime.regime)} size="lg">
                {regime.regime}
              </Badge>
              <span className="text-sm" style={{ color: '#9CA3AF' }}>
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
            <span style={{ color: '#6B7280' }} className="mt-0.5">•</span>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>{reason}</p>
          </div>
        ))}
      </div>

      {/* Focus and Caution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4" style={{ borderTop: '1px solid #273449' }}>
        {regime.focus && (
          <div className="flex items-start gap-2">
            <span className="mt-0.5" style={{ color: '#16A34A' }}>▸</span>
            <div>
              <span className="text-xs font-medium uppercase" style={{ color: '#6B7280' }}>
                Focus
              </span>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>{regime.focus}</p>
            </div>
          </div>
        )}

        {regime.caution && (
          <div className="flex items-start gap-2">
            <span className="mt-0.5" style={{ color: '#EF4444' }}>▸</span>
            <div>
              <span className="text-xs font-medium uppercase" style={{ color: '#6B7280' }}>
                Caution
              </span>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>{regime.caution}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
