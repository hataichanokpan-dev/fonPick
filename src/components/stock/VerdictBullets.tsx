/**
 * VerdictBullets Component
 * Displays 3-5 bullet reasons with icons (strengths, warnings, market fit)
 */

import { Card } from '@/components/shared'
import { Check, AlertTriangle, Compass } from 'lucide-react'
import type { StockVerdict } from '@/types'

interface VerdictBulletsProps {
  bullets: StockVerdict['bullets']
}

export function VerdictBullets({ bullets }: VerdictBulletsProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#E5E7EB' }}>
        Investment Rationale
      </h3>

      <div className="space-y-4">
        {/* Strengths */}
        {bullets.strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4" style={{ color: '#16A34A' }} />
              <h4 className="font-medium" style={{ color: '#E5E7EB' }}>Strengths</h4>
            </div>
            <ul className="space-y-1.5 pl-6">
              {bullets.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5" style={{ color: '#16A34A' }}>✓</span>
                  <span className="text-sm" style={{ color: '#E5E7EB' }}>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {bullets.warnings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" style={{ color: '#F59E0B' }} />
              <h4 className="font-medium" style={{ color: '#E5E7EB' }}>What to Watch</h4>
            </div>
            <ul className="space-y-1.5 pl-6">
              {bullets.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5" style={{ color: '#F59E0B' }}>⚠</span>
                  <span className="text-sm" style={{ color: '#E5E7EB' }}>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Market Fit */}
        {bullets.marketFit && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4" style={{ color: '#60A5FA' }} />
              <h4 className="font-medium" style={{ color: '#E5E7EB' }}>Market Fit</h4>
            </div>
            <div className="pl-6">
              <p className="text-sm" style={{ color: '#E5E7EB' }}>{bullets.marketFit}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
