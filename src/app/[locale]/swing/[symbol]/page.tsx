/**
 * Swing Trading Verdict Page
 *
 * Displays swing trading analysis for a stock with 30-90 day horizon
 * Target return: 20%++
 *
 * Route: /[locale]/swing/[symbol]?horizon=60
 */

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SwingVerdictClient } from './swing-verdict-client'
import type { SwingHorizon } from '@/types/swing-trading'

interface SwingPageProps {
  params: Promise<{
    symbol: string
    locale: string
  }>
  searchParams: Promise<{
    horizon?: string
  }>
}

/**
 * Server Component - Fetches swing trading verdict
 */
export default async function SwingPage({
  params,
  searchParams,
}: SwingPageProps) {
  const { symbol: symbolParam, locale } = await params
  const { horizon: horizonParam } = await searchParams

  const t = await getTranslations('swing.page')
  const symbol = decodeURIComponent(symbolParam).toUpperCase()
  const horizon: SwingHorizon = (horizonParam === '30' || horizonParam === '90' ? Number(horizonParam) : 60) as SwingHorizon

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back Button */}
      <Link
        href={`/${locale}`}
        className="inline-flex items-center text-xs transition-all duration-200 hover:text-text active:opacity-70"
        style={{ color: '#B8C1BD' }}
      >
        <ArrowLeft className="w-3 h-3 mr-1" />
        {t('backToMarket')}
      </Link>

      {/* Page Header */}
      <div className="rounded-lg p-4 bg-surface border border-border">
        <h1 className="text-xl font-bold text-text-primary">
          {t('title', { symbol })}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('subtitle', { horizon })}
        </p>
      </div>

      {/* Client Component - Fetches verdict and historical trend */}
      <SwingVerdictClient
        symbol={symbol}
        horizon={horizon}
        locale={locale as 'en' | 'th'}
      />
    </div>
  )
}

/**
 * Generate metadata for page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>
}) {
  const { symbol } = await params

  return {
    title: `Swing Trading: ${symbol} - fonPick`,
    description: `Swing trading analysis for ${symbol} with entry/exit plans and position sizing`,
  }
}
