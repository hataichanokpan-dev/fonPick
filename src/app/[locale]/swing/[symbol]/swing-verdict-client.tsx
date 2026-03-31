/**
 * Swing Trading Verdict Client Component
 */

'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { SwingVerdict, HistoricalTrendAnalysis, SwingHorizon } from '@/types/swing-trading'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'

// Import swing trading components
import { SwingVerdictCard } from '@/components/swing-trading/SwingVerdictCard'
import { EntryPlanCard } from '@/components/swing-trading/EntryPlanCard'
import { ExitPlanCard } from '@/components/swing-trading/ExitPlanCard'
import { PositionSizingCard } from '@/components/swing-trading/PositionSizingCard'
import { HistoricalTrendChart } from '@/components/swing-trading/HistoricalTrendChart'

interface SwingVerdictClientProps {
  symbol: string
  horizon: SwingHorizon
  locale: 'en' | 'th'
}

interface SwingData {
  verdict: SwingVerdict | null
  historicalTrend: HistoricalTrendAnalysis | null
  isLoading: boolean
  error: string | null
}

export function SwingVerdictClient({
  symbol,
  horizon,
  locale,
}: SwingVerdictClientProps) {
  const t = useTranslations('swing.page')
  const [data, setData] = useState<SwingData>({
    verdict: null,
    historicalTrend: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const abortController = new AbortController()

    async function fetchData() {
      setData((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        // Fetch verdict
        const verdictRes = await fetch(`/api/swing/${encodeURIComponent(symbol.toLowerCase())}/verdict?horizon=${horizon}`, {
          signal: abortController.signal
        })
        if (!verdictRes.ok) {
          throw new Error(`Failed to fetch verdict: ${verdictRes.statusText}`)
        }
        const verdictData = await verdictRes.json()

        // Fetch historical trend (90 days)
        const trendRes = await fetch(`/api/stocks/${encodeURIComponent(symbol.toLowerCase())}/trend/history?days=90`, {
          signal: abortController.signal
        })
        if (!trendRes.ok) {
          throw new Error(`Failed to fetch trend: ${trendRes.statusText}`)
        }
        const trendData = await trendRes.json()

        setData({
          verdict: verdictData.success ? verdictData.data : null,
          historicalTrend: trendData.success ? trendData.data : null,
          isLoading: false,
          error: verdictData.success ? null : (verdictData.error || t('fetchError')),
        })
      } catch (error) {
        // Only set error if not aborted
        if (error instanceof Error && error.name !== 'AbortError') {
          setData({
            verdict: null,
            historicalTrend: null,
            isLoading: false,
            error: error.message,
          })
        }
      }
    }

    fetchData()

    return () => {
      abortController.abort()
    }
  }, [symbol, horizon, t])

  if (data.isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton lines={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CardSkeleton lines={3} />
          <CardSkeleton lines={3} />
        </div>
        <CardSkeleton lines={5} />
      </div>
    )
  }

  if (data.error || !data.verdict) {
    return (
      <div className="rounded-lg p-6 bg-surface border border-border text-center">
        <div className="text-risk text-sm font-medium mb-2">{t('error')}</div>
        <div className="text-text-secondary text-xs">{data.error || t('noData')}</div>
      </div>
    )
  }

  const { verdict, historicalTrend } = data

  return (
    <div className="space-y-4">
      {/* Verdict Summary */}
      <SwingVerdictCard
        verdict={verdict}
        locale={locale}
      />

      {/* Entry Plan */}
      <EntryPlanCard
        entry={verdict.entry}
        locale={locale}
      />

      {/* Exit Plan */}
      <ExitPlanCard
        exit={verdict.exit}
        locale={locale}
      />

      {/* Position Sizing */}
      <PositionSizingCard
        position={verdict.position}
        locale={locale}
      />

      {/* Historical Trend Chart */}
      {historicalTrend && (
        <HistoricalTrendChart
          data={historicalTrend}
          locale={locale}
        />
      )}

      {/* Data Quality Footer */}
      <div className="text-[10px] text-center text-text-tertiary">
        {t('dataQuality', {
          completeness: verdict.dataQuality,
          timestamp: new Date(verdict.timestamp).toLocaleString(locale),
        })}
      </div>
    </div>
  )
}
