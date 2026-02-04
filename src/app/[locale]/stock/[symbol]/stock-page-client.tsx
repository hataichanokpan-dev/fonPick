"use client";

/**
 * Stock Page Client Component - Screening System
 *
 * New implementation with Practical Screening Sheet framework.
 * Features:
 * - 4-layer investment analysis (Universe, Quality, Value+Growth, Technical+Catalyst)
 * - Total score display (27 max)
 * - Investment decision (BUY/HOLD/PASS)
 * - Entry plan with buy/stop/target
 * - Bilingual support (Thai/English) via next-intl
 */

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useStockScreening } from "@/hooks/useStockScreening";
import { useCatalystScore } from "@/hooks/useCatalystScore";
import { useSupportResistanceLevels } from "@/hooks/useSupportResistanceLevels";
import { useEPSHistory } from "@/hooks/useYearlyOperations";
import {
  StockPageSkeleton,
  StockPageErrorBoundary,
  WatchlistButton,
  PriceHistoryCard,
} from "@/components/stock";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  TotalScoreCard,
  LayerCard,
  Layer1Universe,
  Layer2Quality,
  Layer3ValueGrowth,
  Layer4Technical,
  EntryPlanCard,
  calculateEntryPlan,
} from "@/components/stock/screening";
import { calculateScreeningScore, type ScreeningInputData } from "@/components/stock/screening/utils/score-calculator";
import { AIInsightsCard } from "@/components/stock/screening/AIInsightsCard";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  EyeClosed,
  EyeIcon,
} from "lucide-react";
import { safeToFixed } from "@/lib/utils";

export interface StockPageClientProps {
  symbol: string;
  children?: React.ReactNode;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color classes and icon based on price change
 */
function getPriceChangeColor(change: number) {
  if (change > 0) {
    return {
      text: "text-up-primary",
      bg: "bg-up-soft",
      icon: <TrendingUp className="w-4 h-4" />,
    };
  }
  if (change < 0) {
    return {
      text: "text-down-primary",
      bg: "bg-down-soft",
      icon: <TrendingDown className="w-4 h-4" />,
    };
  }
  return {
    text: "text-flat",
    bg: "bg-surface-2",
    icon: <Minus className="w-4 h-4" />,
  };
}

/**
 * Format large numbers with suffixes (K, M, B)
 * Safe version - handles null/undefined/NaN
 */
function formatLargeNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || Number.isNaN(num)) return "N/A";
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

/**
 * Parse market cap string to number
 * Handles formats like "1.23B", "456.78M", "123.45K"
 */
function parseMarketCap(marketCap: string): number {
  const str = marketCap.toUpperCase().trim();
  const multiplier = str.endsWith("B")
    ? 1_000_000_000
    : str.endsWith("M")
      ? 1_000_000
      : str.endsWith("K")
        ? 1_000
        : 1;
  const numStr = str.replace(/[BMK]$/, "").trim();
  const num = parseFloat(numStr);
  return isNaN(num) ? 0 : num * multiplier;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Stock header with price and watchlist
 */
function StockHeader({
  symbol,
  price,
  change,
  changePercent,
  marketCap,
  marketCapString,
  volume,
  peRatio,
}: {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  marketCapString?: string;
  volume: number;
  peRatio: number;
}) {
  const t = useTranslations("stock");
  const priceColor = getPriceChangeColor(change);

  const { trackEvent } = useAnalytics();
  // Track watchlist events
  const handleWatchlistChange = (state: {
    symbol: string;
    isOnWatchlist: boolean;
  }) => {
    trackEvent("watchlist_toggle", {
      symbol,
      action: state.isOnWatchlist ? "add" : "remove",
    });
  };

  return (
    <div className="rounded-xl bg-surface border border-border p-4 md:p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
            {symbol}
          </h1>
          <div className="flex items-center gap-2 text-sm text-text-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>{t("thaiStock")}</span>
          </div>
        </div>
        <WatchlistButton
          symbol={symbol}
          className="shrink-0"
          onChange={handleWatchlistChange}
        />
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-4 flex-wrap">
          <span className="text-4xl md:text-5xl font-bold font-mono tabular-nums text-text-primary">
            {safeToFixed(price)}
          </span>
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${priceColor.bg} ${priceColor.text}`}
          >
            {priceColor.icon}
            <span className="font-semibold tabular-nums">
              {change > 0 ? "+" : ""}
              {safeToFixed(change)}
            </span>
            <span className="text-xs tabular-nums">
              ({changePercent > 0 ? "+" : ""}
              {safeToFixed(changePercent)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="flex flex-col">
          <span className="text-xs text-text-2 mb-1">
            {t("info.marketCap")}
          </span>
          <span className="text-sm font-semibold tabular-nums text-text-primary">
            {marketCapString
              ? marketCapString.split("+")[0].split("-")[0]
              : formatLargeNumber(marketCap)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-2 mb-1">{t("info.volume")}</span>
          <span className="text-sm font-semibold tabular-nums text-text-primary">
            {formatLargeNumber(volume)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-2 mb-1">{t("info.pe")}</span>
          <span className="text-sm font-semibold tabular-nums text-text-primary">
            {safeToFixed(peRatio)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StockPageClient({ symbol, children }: StockPageClientProps) {
  const { data, isLoading, error, refetch } = useStockScreening(symbol);

  // Fetch AI catalyst score
  const { aiScore, data: catalystData } = useCatalystScore(symbol, true);

  // Get support/resistance levels from 3-Year Price History
  const { data: srLevels } = useSupportResistanceLevels({
    symbol,
    years: 3,
    interval: '1d'
  });

  // Get EPS history from yearly operations data
  const { epsHistory, currentEps, epsCagr5Y } = useEPSHistory(symbol, true);

  // Recalculate screening score with AI score AND support levels
  const screeningWithAI = useMemo(() => {
    if (!data?.screening) return null;

    const { statistics, overview } = data;
    if (!statistics || !overview) return data.screening;

    // Get support level from calculated data (from 3-Year Price History)
    const supportLevel = srLevels?.support ?? null;

    const screeningInput: ScreeningInputData = {
      // Layer 1: Universe
      marketCap: statistics.marketCap || 0,
      volume: statistics.averageVolume20D || overview.volume || 0,

      // Layer 2: Quality
      pegRatio: statistics.pegRatio || null,
      profitMargin: statistics.profitMargin || 0,
      returnOnEquity: statistics.returnOnEquity || 0,
      returnOnInvestedCapital: statistics.returnOnInvestedCapital || 0,
      debtToEquity: statistics.debtToEquity || 0,
      fcfYield: statistics.fcfYield || 0,
      operatingCashFlow: statistics.operatingCashFlow || 0,
      netIncome: statistics.netIncome || 0,

      // Layer 3: Value + Growth
      peRatio: statistics.peRatio || overview.peRatio || 0,
      pbRatio: statistics.pbRatio || 0,
      dividendYield: statistics.dividendYield || 0,
      pfcfRatio: statistics.pfcfRatio || 0,
      epsGrowthYoY: 0.05, // TODO: Calculate from yearly data
      epsAcceleration: 0.02, // TODO: Calculate from quarterly data

      // Layer 4: Technical + Catalyst (with support level from 3-Year History!)
      currentPrice: overview.price,
      ma50: statistics.movingAverage50D || null,
      rsi: statistics.rsi || null,
      macdPositive: null,
      supportLevel: supportLevel, // ← NOW USES CALCULATED SUPPORT FROM 3-YEAR HISTORY
      aiScore: aiScore,
    };

    return calculateScreeningScore(screeningInput);
  }, [data, aiScore, srLevels]);

  const t = useTranslations("stock");
  const localeRaw = useLocale();
  const locale: 'en' | 'th' = localeRaw === 'en' || localeRaw === 'th' ? localeRaw : 'th';

  const compact = true; // TODO: Determine based on screen size

  // Expand/collapse state for layers
  const [expandedLayers, setExpandedLayers] = useState<Record<number, boolean>>(
    {
      1: true,
      2: true,
      3: false,
      4: false,
    },
  );

  const toggleLayer = (layer: number) => {
    setExpandedLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const expandAll = () => {
    setExpandedLayers({ 1: true, 2: true, 3: true, 4: true });
  };

  const collapseAll = () => {
    setExpandedLayers({ 1: false, 2: false, 3: false, 4: false });
  };

  // Loading state
  if (isLoading) {
    return <StockPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <StockPageErrorBoundary
          error={error}
          symbol={symbol}
          onRetry={refetch}
        />
        {children}
      </div>
    );
  }

  // No data
  if (!data || !data.screening) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-surface border border-border p-8 text-center">
          <p className="text-text-2">{t("page.error")}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded-lg bg-accent-teal text-white font-medium"
          >
            {t("page.retry")}
          </button>
        </div>
        {children}
      </div>
    );
  }

  const { overview, statistics, alpha } = data;

  // Use screening with AI score (or fallback to original screening)
  const screening = screeningWithAI || data.screening;

  // Calculate entry plan with support/resistance from 3-Year History
  const entryPlan =
    screening && overview && statistics && srLevels
      ? calculateEntryPlan(
          overview.price,
          srLevels.support ?? overview.price * 0.95,  // Use calculated support from 3-Year History
          srLevels.resistance ?? alpha?.AvgForecast ?? overview.price * 1.15,  // Use calculated resistance from 3-Year History
          screening.decision,
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Header with Watchlist */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {overview && (
            <StockHeader
              symbol={symbol}
              price={overview.price}
              change={overview.price - overview.previousClose}
              changePercent={
                ((overview.price - overview.previousClose) /
                  overview.previousClose) *
                100
              }
              marketCapString={overview.marketCap}
              marketCap={parseMarketCap(overview.marketCap)}
              volume={overview.volume}
              peRatio={overview.peRatio}
            />
          )}
        </div>
      </div>

      {/* Screening Analysis */}
      {screening && (
        <div className="space-y-4">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              {t("page.screening")}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-xs px-2 py-1.5 rounded-lg 
                bg-surface-2 border border-border hover:bg-surface-3 transition-colors"
              >
                <EyeIcon className="w-4 h-4 hover:text-accent-blue" />
              </button>
              <button
                onClick={collapseAll}
                className="text-xs px-2 py-1.5 rounded-lg 
                bg-surface-2 border border-border hover:bg-surface-3 transition-colors"
              >
                <EyeClosed className="w-4 h-4 hover:text-accent-blue" />
              </button>
            </div>
          </div>

          {/* Desktop: Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left column: Total score + Universe */}
            <div className="space-y-4">
              {/* Total Score Card (Sticky) */}
              <div className="lg:sticky lg:top-4">
                <TotalScoreCard
                  totalScore={screening.totalScore}
                  maxScore={screening.maxScore}
                  decision={screening.decision}
                  confidence={screening.confidence}
                  confidencePercent={screening.confidencePercent}
                  layers={{
                    universe: {
                      score: screening.layers.universe.totalScore,
                      passed: screening.layers.universe.allPassed,
                    },
                    quality: { score: screening.layers.quality.totalScore },
                    valueGrowth: {
                      score: screening.layers.valueGrowth.totalScore,
                    },
                    technical: { score: screening.layers.technical.totalScore },
                  }}
                  summary={screening.summary}
                  rationale={screening.rationale}
                />
              </div>

              {/* Layer 1: Universe */}
              <LayerCard
                layer={1}
                title="UNIVERSE"
                thaiTitle="กรองพื้นฐาน"
                description="Basic eligibility filters"
                thaiDescription="เกณฑ์การคัดเลือกพื้นฐาน"
                score={screening.layers.universe.totalScore}
                maxScore={screening.layers.universe.maxScore}
                color="universe"
                expanded={expandedLayers[1]}
                onToggle={() => toggleLayer(1)}
              >
                {overview && statistics && (
                  <Layer1Universe
                    marketCap={statistics.marketCap}
                    volume={overview.volume}
                    compact={compact}
                  />
                )}
              </LayerCard>
            </div>

            {/* Right column: Quality, Value+Growth, Technical */}
            <div className="lg:col-span-2 space-y-4">
              {/* Layer 2: Quality */}
              <LayerCard
                layer={2}
                title="QUALITY"
                thaiTitle="คุณภาพ"
                description="Financial quality metrics"
                thaiDescription="ตัวชี้วัดคุณภาพทางการเงิน"
                score={screening.layers.quality.totalScore}
                maxScore={screening.layers.quality.maxScore}
                color="quality"
                expanded={expandedLayers[2]}
                onToggle={() => toggleLayer(2)}
              >
                {statistics && (
                  <Layer2Quality
                    data={{
                      pegRatio: statistics.pegRatio,
                      profitMargin: statistics.profitMargin,
                      returnOnEquity: statistics.returnOnEquity,
                      returnOnInvestedCapital:
                        statistics.returnOnInvestedCapital,
                      debtToEquity: statistics.debtToEquity,
                      fcfYield: statistics.fcfYield,
                      operatingCashFlow: statistics.operatingCashFlow,
                      netIncome: statistics.netIncome,
                    }}
                    compact={compact}
                  />
                )}
              </LayerCard>

              {/* Layer 3: Value + Growth */}
              <LayerCard
                layer={3}
                title="VALUE + GROWTH"
                thaiTitle="มูลค่าและการเติบโต"
                description="Valuation and growth metrics"
                thaiDescription="ตัวชี้วัดมูลค่าและการเติบโต"
                score={screening.layers.valueGrowth.totalScore}
                maxScore={screening.layers.valueGrowth.maxScore}
                color="value"
                expanded={expandedLayers[3]}
                onToggle={() => toggleLayer(3)}
              >
                {statistics && overview && (
                  <Layer3ValueGrowth
                    data={{
                      peRatio: statistics.peRatio,
                      pbRatio: statistics.pbRatio,
                      returnOnEquity: statistics.returnOnEquity,
                      dividendYield: statistics.dividendYield,
                      pfcfRatio: statistics.pfcfRatio,
                      marketCap: statistics.marketCap,
                      epsGrowthYoY: epsCagr5Y ?? 0.05, // From yearly operations data
                      epsAcceleration: 0.02, // TODO: From quarterly data
                      epsCurrent: currentEps ?? statistics.eps, // From yearly operations data
                      eps5YearsAgo: undefined, // Calculated from CAGR in component
                      epsHistory: epsHistory ?? undefined, // Real EPS history from API
                    }}
                    compact={compact}
                  />
                )}
              </LayerCard>

              {/* Layer 4: Technical + Catalyst */}
              <LayerCard
                layer={4}
                title="TECHNICAL + CATALYST"
                thaiTitle="เทคนิคและเหตุการณ์"
                description="Technical analysis and catalysts"
                thaiDescription="การวิเคราะห์เทคนิคและเหตุการณ์สำคัญ"
                score={screening.layers.technical.totalScore}
                maxScore={screening.layers.technical.maxScore}
                color="technical"
                expanded={expandedLayers[4]}
                onToggle={() => toggleLayer(4)}
              >
                {statistics && overview && (
                  <Layer4Technical
                    data={{
                      currentPrice: overview.price,
                      ma50: statistics.movingAverage50D,
                      rsi: statistics.rsi,
                      macdPositive: null, // TODO: From API
                      supportLevel: srLevels?.support ?? null, // Use calculated support from 3-Year History
                      aiScore: aiScore, // From AI API
                    }}
                    compact={compact}
                  />
                )}
              </LayerCard>

              {/* AI Insights Card */}
              <AIInsightsCard symbol={symbol} locale={locale} initialData={catalystData} />

              {/* Entry Plan */}
              {entryPlan && overview && screening.decision !== "PASS" && (
                <EntryPlanCard
                  entryPlan={entryPlan}
                  currentPrice={overview.price}
                />
              )}
            </div>
          </div>
        </div>
      )}
      <hr className="border-border" />
      {/* Price History Chart */}
      <div className="rounded-xl bg-surface border border-border p-4 md:p-6">
        <PriceHistoryCard symbol={symbol} years={3} interval="1d" />
      </div>

      <div className="mb-4"></div>
    </div>
  );
}
