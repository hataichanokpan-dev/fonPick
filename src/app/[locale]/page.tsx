/**
 * Unified Homepage (Client Component - Memory Optimized)
 * Single dashboard merging market overview and market intelligence
 *
 * Investment Decision Flow:
 * 1. Regime (Risk-On/Off foundation)
 * 2. Smart Money (Confirmation from foreign/institution)
 * 3. Sectors (Where to focus)
 * 4. Stocks (Specific opportunities)
 *
 * Data fetching strategy (Memory-Optimized):
 * - No server-side fetching (eliminates duplication)
 * - Client Context handles all data fetching
 * - Single data source = 50-100% memory reduction
 */

'use client'

import {
  SectionHeader,
} from "@/components/shared";
import {
  ResponsiveGrid,
  AsymmetricWide,
  AsymmetricMedium,
} from "@/components/layout";
import {
  MarketStatusBanner,
  MarketRegimeCard,
  SmartMoneyCard,
  DailyFocusList,
  SectorStrengthCard,
  TabbedMovers,
  DataInsightCard,
} from "@/components/dashboard";
import { useTranslations } from "next-intl";

// ============================================================================
// MAIN PAGE COMPONENT (Client-side, Memory Optimized)
// ============================================================================

export default function HomePage() {
  const t = useTranslations('dashboard.section')

  // No server-side data fetching - Context handles everything
  // This eliminates the 100-200MB server-client data duplication

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 1. Sticky Status Banner with Data Freshness */}
      <div className="sticky top-0 z-10">
        {/* MarketStatusBanner fetches from Context - no server data needed */}
        <MarketStatusBanner />
      </div>

      {/* 2. P0: Market Regime + Smart Money + Daily Focus (asymmetric grid) */}
      <section aria-labelledby="p0-heading" className="mb-6">
        <SectionHeader
          priority="P0"
          title={t('p0.title')}
          subtitle={t('p0.subtitle')}
        />
        <ResponsiveGrid preset="asymmetric" gap="compact" className="mt-5">
          <AsymmetricWide>
            <MarketRegimeCard
              variant="prominent"
              useModernCard={true}
              useAccessibleSignal={true}
            />
          </AsymmetricWide>
          <AsymmetricMedium>
            <SmartMoneyCard />
          </AsymmetricMedium>
        </ResponsiveGrid>
        {/* Daily Focus - Full width with horizontal scroll */}
        <div className="mt-4">
          {/* DailyFocusList fetches crossRankedStocks from Context */}
          <DailyFocusList />
        </div>
      </section>

      {/* 3. Data Insight Card - Shows on conflict or high conviction */}
      <div className="my-4">
        <DataInsightCard />
      </div>

      {/* 4. P1: Sectors (SectorStrengthCard only) */}
      <section aria-labelledby="p1-heading" className="mb-6">
        <SectionHeader
          priority="P1"
          title={t('p1.title')}
          subtitle={t('p1.subtitle')}
        />
        <SectorStrengthCard className="mt-5"  />
      </section>

      {/* 5. P2: Market Movers (TabbedMovers) */}
      <section aria-labelledby="p2-heading" className="mb-6">
        <SectionHeader
          priority="P2"
          title={t('p2.title')}
          subtitle={t('p2.subtitle')}
        />
        <TabbedMovers
          topCount={10}
          useModernCard={true}
          enableSwipeableCards={true}
          className="mt-5"
        />
      </section>

      <section aria-labelledby="spacer-heading">
        <h2 id="spacer-heading" className="sr-only">
          Spacer Section
        </h2>
        <div className="h-4" />
      </section>
    </div>
  );
}
