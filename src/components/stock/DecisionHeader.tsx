/**
 * DecisionHeader Component
 * Displays verdict badge (Buy/Watch/Avoid) with confidence level
 * Theme: Green-tinted dark with teal up / soft red down
 *
 * Phase 5: Enhanced with smooth transitions
 */

'use client'

import { Card, Badge } from '@/components/shared'
import { CheckCircle2, Eye, XCircle } from 'lucide-react'
import type { Verdict } from '@/types'
import { cn } from '@/lib/utils'

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
          icon: <CheckCircle2 className="w-5 h-5" />,
          label: 'BUY',
        }
      case 'Watch':
        return {
          color: 'watch' as const,
          icon: <Eye className="w-5 h-5" />,
          label: 'WATCH',
        }
      case 'Avoid':
        return {
          color: 'avoid' as const,
          icon: <XCircle className="w-5 h-5" />,
          label: 'AVOID',
        }
    }
  }

  const config = getVerdictConfig(verdict)
  const confidencePercent = confidence === 'High' ? 85 : confidence === 'Medium' ? 60 : 35

  return (
    <Card variant="elevated">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300',
              verdict === 'Buy' && 'bg-up-bg text-up',
              verdict === 'Watch' && 'bg-warn/20 text-warn',
              verdict === 'Avoid' && 'bg-risk/20 text-risk'
            )}
          >
            {config.icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text">{symbol}</h1>
              <Badge color={config.color} size="md" className="font-bold">
                {config.label}
              </Badge>
            </div>
            <p className="text-xs mt-1 text-text-2">
              Confidence:{' '}
              <span className="font-semibold">{confidence} ({confidencePercent}%)</span>
            </p>
          </div>
        </div>

        {/* Confidence meter - Compact with smooth transition */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-2">Confidence Level</span>
          <div className="w-24 h-2 rounded-full overflow-hidden bg-surface-2">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 ease-out',
                verdict === 'Buy' && 'bg-up',
                verdict === 'Watch' && 'bg-warn',
                verdict === 'Avoid' && 'bg-risk'
              )}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
