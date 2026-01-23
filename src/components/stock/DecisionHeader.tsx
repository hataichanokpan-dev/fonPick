/**
 * DecisionHeader Component
 * Displays verdict badge (Buy/Watch/Avoid) with confidence level
 */

import { Card, Badge } from '@/components/shared'
import { CheckCircle2, Eye, XCircle } from 'lucide-react'
import type { Verdict } from '@/types'

interface DecisionHeaderProps {
  verdict: Verdict
  confidence: 'High' | 'Medium' | 'Low'
  symbol: string
}

export function DecisionHeader({ verdict, confidence, symbol }: DecisionHeaderProps) {
  const getVerdictConfig = (verdict: Verdict) => {
    switch (verdict) {
      case 'Buy':
        return {
          color: 'buy' as const,
          icon: <CheckCircle2 className="w-6 h-6" />,
          label: 'BUY',
        }
      case 'Watch':
        return {
          color: 'watch' as const,
          icon: <Eye className="w-6 h-6" />,
          label: 'WATCH',
        }
      case 'Avoid':
        return {
          color: 'avoid' as const,
          icon: <XCircle className="w-6 h-6" />,
          label: 'AVOID',
        }
    }
  }

  const config = getVerdictConfig(verdict)
  const confidencePercent = confidence === 'High' ? 85 : confidence === 'Medium' ? 60 : 35

  return (
    <Card variant="elevated">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full',
              verdict === 'Buy' && 'bg-buy-light text-buy-DEFAULT',
              verdict === 'Watch' && 'bg-watch-light text-watch-DEFAULT',
              verdict === 'Avoid' && 'bg-avoid-light text-avoid-DEFAULT'
            )}
          >
            {config.icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold" style={{ color: '#E5E7EB' }}>{symbol}</h1>
              <Badge color={config.color} size="lg" className="font-bold">
                {config.label}
              </Badge>
            </div>
            <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
              Confidence:{' '}
              <span className="font-semibold">{confidence} ({confidencePercent}%)</span>
            </p>
          </div>
        </div>

        {/* Confidence meter */}
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: '#9CA3AF' }}>Confidence Level</span>
          <div className="w-32 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1F2937' }}>
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                verdict === 'Buy' && 'bg-flow-buy',
                verdict === 'Watch' && 'bg-highlight-insight',
                verdict === 'Avoid' && 'bg-flow-sell'
              )}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
