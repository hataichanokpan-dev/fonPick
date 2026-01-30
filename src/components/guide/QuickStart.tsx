/**
 * Quick Start Section
 *
 * 4 key questions that FonPick answers
 */

'use client'

import { Card } from '@/components/shared/Card'
import { TrendingUp, DollarSign, Building2, Activity } from 'lucide-react'
import { useTranslations } from 'next-intl'

// ============================================================================
// ICONS
// ============================================================================

const QUICK_START_ICONS = [
  <TrendingUp className="w-6 h-6" />,
  <DollarSign className="w-6 h-6" />,
  <Building2 className="w-6 h-6" />,
  <Activity className="w-6 h-6" />,
]

// ============================================================================
// QUICK START COMPONENT
// ============================================================================

export function QuickStart() {
  const t = useTranslations('guide.quickStart')

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-100">
        {t('title')}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => {
          const itemKey = `items.${index}` as const
          return (
            <Card key={index} variant="outlined" className="p-5 hover:bg-gray-800/50 transition-colors">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  {QUICK_START_ICONS[index]}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-gray-200">
                    {t(`${itemKey}.question`)}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t(`${itemKey}.answer`)}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
