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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Investment Rationale
      </h3>

      <div className="space-y-4">
        {/* Strengths */}
        {bullets.strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-buy-DEFAULT" />
              <h4 className="font-medium text-gray-700">Strengths</h4>
            </div>
            <ul className="space-y-1.5 pl-6">
              {bullets.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-buy-DEFAULT mt-0.5">✓</span>
                  <span className="text-sm text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {bullets.warnings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-watch-DEFAULT" />
              <h4 className="font-medium text-gray-700">What to Watch</h4>
            </div>
            <ul className="space-y-1.5 pl-6">
              {bullets.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-watch-DEFAULT mt-0.5">⚠</span>
                  <span className="text-sm text-gray-700">{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Market Fit */}
        {bullets.marketFit && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-gray-700">Market Fit</h4>
            </div>
            <div className="pl-6">
              <p className="text-sm text-gray-700">{bullets.marketFit}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
