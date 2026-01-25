/**
 * Market Intelligence Dashboard Page
 *
 * Real-time market regime detection and smart money flow analysis
 * P0: Market Regime + Smart Money
 * P1: Sector Strength & Rotation
 * P2: Active Stocks Concentration
 */

import { Metadata } from 'next'
import { ResponsiveGrid } from '@/components/layout'
import {
  MarketRegimeCard,
  SmartMoneyCard,
  SectorStrengthCard,
  SectorRotationCard,
  ActiveStocksCard,
} from '@/components/dashboard'

export const metadata: Metadata = {
  title: 'Market Intelligence - fonPick',
  description: 'Real-time market regime detection and smart money flow analysis for Thai stock market investors',
}

/**
 * Priority Section Label Component
 * Displays priority badge (P0/P1/P2) with section title
 */
function PrioritySectionLabel({
  priority,
  label,
}: {
  priority: 'P0' | 'P1' | 'P2'
  label: string
}) {
  const colors = {
    P0: 'text-up-primary bg-up-soft/20 border-up-primary/30',
    P1: 'text-accent-blue bg-accent-blue/20 border-accent-blue/30',
    P2: 'text-warn bg-warn/20 border-warn/30',
  }

  return (
    <div
      className={`flex items-center gap-2 mb-3 px-2 py-1 rounded border text-xs font-semibold uppercase tracking-wider ${colors[priority]}`}
    >
      <span>{priority}</span>
      <span className="text-text-secondary">{label}</span>
    </div>
  )
}

/**
 * Market Intelligence Dashboard Page
 */
export default function MarketIntelligencePage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          {/* Title & Description */}
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
              Market Intelligence
            </h1>
            <p className="text-sm text-text-secondary max-w-2xl">
              Real-time analysis of market regime, smart money flows, sector
              rotation, and active stocks concentration
            </p>
          </div>

          {/* Actions (desktop only for now) */}
          <div className="hidden md:block">
            <div className="px-3 py-2 text-xs font-medium rounded border border-border-subtle text-text-secondary">
              Auto-refresh: 2m
            </div>
          </div>
        </div>
      </div>

      {/* P0: Market Overview */}
      <section aria-labelledby="p0-heading">
        <h2 id="p0-heading" className="sr-only">
          P0: Market Overview - Market Regime and Smart Money Analysis
        </h2>
        <PrioritySectionLabel priority="P0" label="Market Overview" />
        <ResponsiveGrid preset="default" gap="compact">
          <MarketRegimeCard />
          <SmartMoneyCard />
        </ResponsiveGrid>
      </section>

      {/* P1: Sector Analysis */}
      <section aria-labelledby="p1-heading">
        <h2 id="p1-heading" className="sr-only">
          P1: Sector Analysis - Sector Strength and Rotation
        </h2>
        <PrioritySectionLabel priority="P1" label="Sector Analysis" />
        <ResponsiveGrid preset="default" gap="compact">
          <SectorStrengthCard />
          <SectorRotationCard />
        </ResponsiveGrid>
      </section>

      {/* P2: Active Stocks */}
      <section aria-labelledby="p2-heading">
        <h2 id="p2-heading" className="sr-only">
          P2: Active Stocks - Concentration Analysis
        </h2>
        <PrioritySectionLabel priority="P2" label="Active Stocks Concentration" />
        <div className="w-full">
          <ActiveStocksCard />
        </div>
      </section>
    </div>
  )
}
