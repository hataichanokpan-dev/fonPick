/**
 * TabbedMovers Component
 *
 * Unified component merging Active Stocks + Top Rankings with tab switching.
 * Reduces vertical space by combining related data.
 *
 * Features:
 * - 4 tabs: Active, Gainers, Losers, Volume
 * - Tab content switches with smooth animation
 * - Active tab: Top stocks by value with concentration metrics
 * - Gainers/Losers tabs: Top gainers/losers with change %
 * - Volume tab: Top volume leaders
 * - Uses existing data from /api/market-intelligence?includeP2=true
 * - Optional: SwipeableCard for mobile swipe gestures
 * - Optional: GlassCard for glassmorphism effect
 *
 * Data source:
 * - Active stocks: data.activeStocks from market intelligence API
 * - Rankings: Derived from activeStocks data
 *
 * TDD:
 * - RED: Tests written first (TabbedMovers.test.tsx)
 * - GREEN: Component implemented to pass tests
 * - REFACTOR: Clean up while keeping tests passing
 */

"use client";

import Link from "next/link";
import { Card } from "@/components/shared";
import { Badge } from "@/components/shared/Badge";
import { SwipeableCard } from "@/components/shared/modern/SwipeableCard";
import { GlassCard } from "@/components/shared/modern/GlassCard";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Award,
  AlertCircle,
} from "lucide-react";
import {
  formatTradingValue,
  formatPercentage,
  formatVolume,
  safeToFixed,
} from "@/lib/utils";
import { useState, useMemo } from "react";
import type {
  StockConcentration,
  CrossRankedStock,
  AccumulationPattern,
} from "@/types/market-intelligence";
import { useActiveStocks } from "@/hooks/useMarketIntelligence";
import { useTranslations } from "next-intl";

// ==================================================================
// TYPES
// ==================================================================

export type TabType = "active" | "gainers" | "losers" | "volume";

export interface TabbedMoversProps {
  /** Additional CSS classes */
  className?: string;
  /** Number of stocks to show per tab */
  topCount?: number;
  /** Use modern GlassCard instead of regular Card */
  useModernCard?: boolean;
  /** Enable swipeable cards for stock items (mobile) */
  enableSwipeableCards?: boolean;
  /** Callback when stock is swiped right (buy action) */
  onSwipeRight?: (symbol: string) => void;
  /** Callback when stock is swiped left (sell/delete action) */
  onSwipeLeft?: (symbol: string) => void;
}

interface GainerLoserStock {
  symbol: string;
  name?: string;
  changePct: number;
  value?: number;
}

interface VolumeStock {
  symbol: string;
  name?: string;
  volume: number;
  value?: number;
}

// ==================================================================
// CONSTANTS
// ==================================================================

const COLORS = {
  up: "#2ED8A7",
  down: "#F45B69",
  warn: "#F7C948",
  neutral: "#AEB7B3",
};

const DEFAULT_TOP_COUNT = 10;

/**
 * Create tabs array with translations
 */
function createTabs(
  t: (key: string) => string,
): { key: TabType; label: string; icon: React.ReactNode }[] {
  return [
    {
      key: "active",
      label: t("tabs.active"),
      icon: <Activity className="w-4 h-4" />,
    },
    {
      key: "volume",
      label: t("tabs.volume"),
      icon: <Activity className="w-4 h-4" />,
    },
  ];
}

// ==================================================================
// UTILITY FUNCTIONS
// ==================================================================

/**
 * Get badge color based on accumulation pattern
 */
function getAccumulationBadgeColor(
  pattern?: AccumulationPattern,
): "buy" | "sell" | "neutral" | "watch" {
  if (!pattern || pattern === "Neutral") return "neutral";

  if (pattern === "Strong Accumulation" || pattern === "Accumulation") {
    return "buy";
  }

  if (pattern === "Strong Distribution" || pattern === "Distribution") {
    return "sell";
  }

  return "neutral";
}

/**
 * Format accumulation pattern text
 */
function formatAccumulationTag(
  pattern?: AccumulationPattern,
  days?: number,
  t?: (key: string) => string,
): string | null {
  if (!pattern) return null;

  let patternShort: string;

  if (t) {
    // Use translation if t function is provided
    const key = pattern.toLowerCase().replace(/ /g, "");
    patternShort = t(`accumulationShort.${key}`);
  } else {
    // Fallback to hardcoded values
    patternShort = pattern
      .replace("Strong Accumulation", "Str Acc")
      .replace("Strong Distribution", "Str Dist")
      .replace("Accumulation", "Acc")
      .replace("Distribution", "Dist");
  }

  return days ? `${days}d ${patternShort}` : patternShort;
}

/**
 * Extract gainers from active stocks data
 */
function extractGainers(
  stocks: StockConcentration[],
  limit: number,
): GainerLoserStock[] {
  return stocks
    .filter((s) => s.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, limit)
    .map((s) => ({
      symbol: s.symbol,
      name: s.name,
      changePct: s.changePercent,
      value: s.value,
    }));
}

/**
 * Extract losers from active stocks data
 */
function extractLosers(
  stocks: StockConcentration[],
  limit: number,
): GainerLoserStock[] {
  return stocks
    .filter((s) => s.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent) // Most negative first
    .slice(0, limit)
    .map((s) => ({
      symbol: s.symbol,
      name: s.name,
      changePct: s.changePercent,
      value: s.value,
    }));
}

/**
 * Extract volume leaders from active stocks data
 */
function extractVolumeLeaders(
  stocks: StockConcentration[],
  limit: number,
): VolumeStock[] {
  return stocks
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit)
    .map((s) => ({
      symbol: s.symbol,
      name: s.name,
      volume: s.volume,
      value: s.value,
    }));
}

// ==================================================================
// TAB CONTENT COMPONENTS
// ==================================================================

interface ConcentrationBarProps {
  metrics: {
    top5StockConcentration: number;
    hhi: number;
    interpretation: string;
  };
  t: (key: string) => string;
}

function ConcentrationBar({ metrics, t }: ConcentrationBarProps) {
  const getInterpretationColor = () => {
    switch (metrics.interpretation) {
      case "Highly Concentrated":
        return COLORS.down;
      case "Moderately Concentrated":
        return COLORS.warn;
      default:
        return COLORS.up;
    }
  };

  const interpretationColor = getInterpretationColor();

  const getInterpretationBadge = () => {
    switch (metrics.interpretation) {
      case "Highly Concentrated":
        return t("concentrationLevels.high");
      case "Moderately Concentrated":
        return t("concentrationLevels.moderate");
      default:
        return t("concentrationLevels.low");
    }
  };

  return (
    <div className="p-3 rounded-lg bg-surface-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart3
            className="w-4 h-4"
            style={{ color: interpretationColor }}
          />
          <span className="text-[10px] uppercase tracking-wide text-text-muted">
            {t("marketConcentration")}
          </span>
        </div>
        <Badge
          size="sm"
          color={
            metrics.interpretation === "Highly Concentrated"
              ? "sell"
              : metrics.interpretation === "Moderately Concentrated"
                ? "watch"
                : "buy"
          }
        >
          {getInterpretationBadge()}
        </Badge>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-text-muted uppercase">
              {t("top5Concentration")}
            </span>
            <span className="text-xs font-medium text-text">
              {safeToFixed(metrics.top5StockConcentration, 1)}%
            </span>
          </div>
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full rounded-full animate-width-grow"
              style={
                {
                  width: `${Math.min(100, metrics.top5StockConcentration)}%`,
                  "--bar-width": `${Math.min(100, metrics.top5StockConcentration)}%`,
                  backgroundColor: interpretationColor,
                } as React.CSSProperties
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[9px] text-text-muted uppercase">
            {t("hhiScore")}
          </span>
          <span className="text-xs font-medium text-text">
            {safeToFixed(metrics.hhi, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface ActiveStockRowProps {
  stock: StockConcentration;
  rank: number;
  enableSwipeable?: boolean;
  onSwipeRight?: (symbol: string) => void;
  onSwipeLeft?: (symbol: string) => void;
  t: (key: string) => string;
}

function ActiveStockRow({
  stock,
  rank,
  enableSwipeable,
  onSwipeRight,
  onSwipeLeft,
  t,
}: ActiveStockRowProps) {
  const isPositive = stock.changePercent >= 0;
  const valueColor = isPositive ? COLORS.up : COLORS.down;

  const rankingBadges = [];

  if (stock.rankings?.value) {
    rankingBadges.push(
      <Badge key="value" size="sm" color="neutral">
        #{stock.rankings.value} {t("rankingBadges.value")}
      </Badge>,
    );
  }
  if (stock.rankings?.volume) {
    rankingBadges.push(
      <Badge key="volume" size="sm" color="neutral">
        #{stock.rankings.volume} {t("rankingBadges.volume")}
      </Badge>,
    );
  }
  if (stock.rankings?.gainer) {
    rankingBadges.push(
      <Badge key="gainer" size="sm" color="buy">
        #{stock.rankings.gainer} {t("rankingBadges.up")}
      </Badge>,
    );
  }
  if (stock.rankings?.loser) {
    rankingBadges.push(
      <Badge key="loser" size="sm" color="sell">
        #{stock.rankings.loser} {t("rankingBadges.down")}
      </Badge>,
    );
  }

  const accumulationTag = formatAccumulationTag(
    stock.accumulationPattern,
    stock.accumulationDays,
    t,
  );

  const stockContent = (
    <Link href={`/stock/${stock.symbol}`} className="block">
      <div className="flex items-center gap-2 p-2 rounded hover:bg-surface-2 transition-colors">
        <span className="text-xs font-semibold w-6 text-text-muted">
          {rank}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text">{stock.symbol}</span>
            {stock.marketCapGroup && (
              <span className="text-[9px] px-1 rounded text-text-muted bg-surface-2">
                {stock.marketCapGroup}
              </span>
            )}
            {accumulationTag && (
              <Badge
                size="sm"
                color={getAccumulationBadgeColor(stock.accumulationPattern)}
              >
                {accumulationTag}
              </Badge>
            )}
          </div>
          {stock.name && (
            <span className="text-[10px] text-text-muted truncate block">
              {stock.name}
            </span>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm font-bold tabular-nums text-text">
            {formatTradingValue(stock.value)}
          </div>
          <div className="text-xs tabular-nums" style={{ color: valueColor }}>
            {formatPercentage(stock.changePercent)}
          </div>
        </div>

        {rankingBadges.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end">
            {rankingBadges}
          </div>
        )}
      </div>
    </Link>
  );

  // Wrap with SwipeableCard if enabled
  if (enableSwipeable) {
    return (
      <SwipeableCard
        key={stock.symbol}
        onSwipeRight={() => onSwipeRight?.(stock.symbol)}
        onSwipeLeft={() => onSwipeLeft?.(stock.symbol)}
        leftAction={{ label: t("swipeActions.remove") }}
        rightAction={{ label: t("swipeActions.addToWatchlist") }}
        className="mb-1"
      >
        {stockContent}
      </SwipeableCard>
    );
  }

  return <div className="animate-fade-in-up">{stockContent}</div>;
}

interface GainerLoserRowProps {
  stock: GainerLoserStock;
  rank: number;
  type: "gainer" | "loser";
  enableSwipeable?: boolean;
  onSwipeRight?: (symbol: string) => void;
  onSwipeLeft?: (symbol: string) => void;
  t: (key: string) => string;
}

function GainerLoserRow({
  stock,
  rank,
  type,
  enableSwipeable,
  onSwipeRight,
  onSwipeLeft,
  t,
}: GainerLoserRowProps) {
  const isGainer = type === "gainer";
  const valueColor = isGainer ? COLORS.up : COLORS.down;

  const stockContent = (
    <Link href={`/stock/${stock.symbol}`} className="block">
      <div className="flex items-center gap-2 p-2 rounded hover:bg-surface-2 transition-colors">
        <span className="text-xs font-semibold w-6 text-text-muted">
          {rank}
        </span>

        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-text">{stock.symbol}</span>
          {stock.name && (
            <span className="text-[10px] text-text-muted truncate block ml-2">
              {stock.name}
            </span>
          )}
        </div>

        {stock.value && (
          <div className="text-right">
            <div className="text-sm font-bold tabular-nums text-text">
              {formatTradingValue(stock.value)}
            </div>
          </div>
        )}

        <div
          className="text-xs font-medium tabular-nums"
          style={{ color: valueColor }}
        >
          {formatPercentage(stock.changePct)}
        </div>
      </div>
    </Link>
  );

  if (enableSwipeable) {
    return (
      <SwipeableCard
        key={stock.symbol}
        onSwipeRight={() => onSwipeRight?.(stock.symbol)}
        onSwipeLeft={() => onSwipeLeft?.(stock.symbol)}
        leftAction={{ label: t("swipeActions.remove") }}
        rightAction={{ label: t("swipeActions.addToWatchlist") }}
        className="mb-1"
      >
        {stockContent}
      </SwipeableCard>
    );
  }

  return <div className="animate-fade-in-up">{stockContent}</div>;
}

interface VolumeRowProps {
  stock: VolumeStock;
  rank: number;
  enableSwipeable?: boolean;
  onSwipeRight?: (symbol: string) => void;
  onSwipeLeft?: (symbol: string) => void;
  t: (key: string) => string;
}

function VolumeRow({
  stock,
  rank,
  enableSwipeable,
  onSwipeRight,
  onSwipeLeft,
  t,
}: VolumeRowProps) {
  const stockContent = (
    <Link href={`/stock/${stock.symbol}`} className="block">
      <div className="flex items-center gap-2 p-2 rounded hover:bg-surface-2 transition-colors">
        <span className="text-xs font-semibold w-6 text-text-muted">
          {rank}
        </span>

        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-text">{stock.symbol}</span>
          {stock.name && (
            <span className="text-[10px] text-text-muted truncate block ml-2">
              {stock.name}
            </span>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm font-bold tabular-nums text-text">
            {formatVolume(stock.volume)}
          </div>
          {stock.value && (
            <div className="text-xs tabular-nums text-text-muted">
              {formatTradingValue(stock.value)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  if (enableSwipeable) {
    return (
      <SwipeableCard
        key={stock.symbol}
        onSwipeRight={() => onSwipeRight?.(stock.symbol)}
        onSwipeLeft={() => onSwipeLeft?.(stock.symbol)}
        leftAction={{ label: t("swipeActions.remove") }}
        rightAction={{ label: t("swipeActions.addToWatchlist") }}
        className="mb-1"
      >
        {stockContent}
      </SwipeableCard>
    );
  }

  return <div className="animate-fade-in-up">{stockContent}</div>;
}

interface CrossRankedBadgeProps {
  stock: CrossRankedStock;
}

function CrossRankedBadge({ stock }: CrossRankedBadgeProps) {
  return (
    <Link href={`/stock/${stock.symbol}`}>
      <Badge
        size="sm"
        color={
          stock.strengthScore > 5
            ? "buy"
            : stock.strengthScore > 3
              ? "watch"
              : "neutral"
        }
        className="flex items-center gap-1"
      >
        <Award className="w-3 h-3" />
        {stock.symbol}
        <span className="text-[9px]">({stock.rankingCount})</span>
      </Badge>
    </Link>
  );
}

// Loading Skeleton
interface TabbedMoversSkeletonProps {
  t: (key: string) => string;
}

function TabbedMoversSkeleton({ t }: TabbedMoversSkeletonProps) {
  return (
    <Card padding="sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-2">{t("title")}</h3>
      </div>
      <div className="animate-pulse space-y-2">
        <div className="flex gap-2 mb-4">
          <div className="h-8 bg-surface-2 rounded flex-1" />
          <div className="h-8 bg-surface-2 rounded flex-1" />
          <div className="h-8 bg-surface-2 rounded flex-1" />
          <div className="h-8 bg-surface-2 rounded flex-1" />
        </div>
        <div className="h-20 bg-surface-2 rounded" />
        <div className="h-12 bg-surface-2 rounded" />
        <div className="h-12 bg-surface-2 rounded" />
      </div>
    </Card>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function TabbedMovers({
  className,
  topCount = DEFAULT_TOP_COUNT,
  useModernCard = false,
  enableSwipeableCards = false,
  onSwipeRight,
  onSwipeLeft,
}: TabbedMoversProps) {
  const t = useTranslations("dashboard.tabbedMovers");
  const tabs = useMemo(() => createTabs(t), [t]);
  const [activeTab, setActiveTab] = useState<TabType>("active");

  // Use consolidated market intelligence hook
  const { data: activeStocksData, isLoading, error } = useActiveStocks();

  // Calculate effective top count (handle edge cases) - MUST be before conditional returns
  const effectiveCount = activeStocksData
    ? Math.max(0, Math.min(topCount, activeStocksData.topByValue.length))
    : topCount;

  // Prepare tab data with useMemo to prevent recalculation on every render
  // MUST be before conditional returns to satisfy Rules of Hooks
  const gainers = useMemo(
    () =>
      activeStocksData
        ? extractGainers(activeStocksData.topByValue, effectiveCount)
        : [],
    [activeStocksData, effectiveCount],
  );
  const losers = useMemo(
    () =>
      activeStocksData
        ? extractLosers(activeStocksData.topByValue, effectiveCount)
        : [],
    [activeStocksData, effectiveCount],
  );
  const volumeLeaders = useMemo(
    () =>
      activeStocksData
        ? extractVolumeLeaders(activeStocksData.topByVolume, effectiveCount)
        : [],
    [activeStocksData, effectiveCount],
  );

  // Handle loading state (AFTER all hooks)
  if (isLoading) {
    return <TabbedMoversSkeleton t={t} />;
  }

  // Handle error state (AFTER all hooks)
  if (error || !activeStocksData) {
    const CardComponent = useModernCard ? GlassCard : Card;

    return (
      <CardComponent
        padding="sm"
        className={className}
        variant={useModernCard ? "elevated" : undefined}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-2">{t("title")}</h3>
          </div>
        </div>
        <p className="text-text-muted text-xs">{t("error")}</p>
      </CardComponent>
    );
  }

  const CardComponent = useModernCard ? GlassCard : Card;

  return (
    <CardComponent
      padding="sm"
      className={className}
      variant={useModernCard ? "elevated" : undefined}
    >
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-2">{t("title")}</h3>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 border-b border-border-subtle">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-1.5 px-1 py-2 text-xs
              font-medium transition-all
              border-b-2 -mb-px
              ${
                activeTab === tab.key
                  ? "border-accent-blue text-accent-blue"
                  : "border-transparent text-text-muted hover:text-text-2"
              }
            `}
            aria-selected={activeTab === tab.key}
            role="tab"
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content - Conditional rendering for memory efficiency */}
      {activeTab === "active" && (
        <div key="active" className="fade-in">
          {/* Concentration Metrics */}
          <ConcentrationBar metrics={activeStocksData.metrics} t={t} />

          {/* Cross-Ranked Stocks Section */}
          {activeStocksData.crossRanked.length > 0 && (
            <div className="mt-3 p-2 rounded-lg bg-surface-2">
              <div className="flex items-center gap-1 mb-2">
                <Award className="w-3 h-3 text-warn" />
                <span className="text-[10px] uppercase tracking-wide text-text-muted">
                  {t("crossRanked")} ({activeStocksData.crossRanked.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeStocksData.crossRanked.slice(0, 8).map((stock) => (
                  <CrossRankedBadge key={stock.symbol} stock={stock} />
                ))}
              </div>
            </div>
          )}

          {/* Top Stocks by Value */}
          <div className="mt-3">
            <div className="flex items-center gap-1 mb-2">
              <TrendingUp className="w-3 h-3 text-up" />
              <span className="text-[10px] uppercase tracking-wide text-text-muted">
                {t("topByValue", { count: effectiveCount })}
              </span>
            </div>
            <div className="space-y-1">
              {activeStocksData.topByValue
                .slice(0, effectiveCount)
                .map((stock, index) => (
                  <ActiveStockRow
                    key={stock.symbol}
                    stock={stock}
                    rank={index + 1}
                    enableSwipeable={enableSwipeableCards}
                    onSwipeRight={onSwipeRight}
                    onSwipeLeft={onSwipeLeft}
                    t={t}
                  />
                ))}
            </div>
          </div>

          {/* Key Observations */}
          {activeStocksData.observations &&
            activeStocksData.observations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3 h-3 text-warn flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-text-muted leading-relaxed">
                    {activeStocksData.observations[0]}
                  </p>
                </div>
              </div>
            )}
        </div>
      )}

      {activeTab === "gainers" && (
        <div key="gainers" className="fade-in">
          <div className="flex items-center gap-1 mb-2">
            <TrendingUp className="w-3 h-3 text-up" />
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              {t("topGainers", { count: effectiveCount })}
            </span>
          </div>
          <div className="space-y-1">
            {gainers.length > 0 ? (
              gainers.map((stock, index) => (
                <GainerLoserRow
                  key={stock.symbol}
                  stock={stock}
                  rank={index + 1}
                  type="gainer"
                  enableSwipeable={enableSwipeableCards}
                  onSwipeRight={onSwipeRight}
                  onSwipeLeft={onSwipeLeft}
                  t={t}
                />
              ))
            ) : (
              <p className="text-xs text-text-muted">{t("noGainers")}</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "losers" && (
        <div key="losers" className="fade-in">
          <div className="flex items-center gap-1 mb-2">
            <TrendingDown className="w-3 h-3 text-down" />
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              {t("topLosers", { count: effectiveCount })}
            </span>
          </div>
          <div className="space-y-1">
            {losers.length > 0 ? (
              losers.map((stock, index) => (
                <GainerLoserRow
                  key={stock.symbol}
                  stock={stock}
                  rank={index + 1}
                  type="loser"
                  enableSwipeable={enableSwipeableCards}
                  onSwipeRight={onSwipeRight}
                  onSwipeLeft={onSwipeLeft}
                  t={t}
                />
              ))
            ) : (
              <p className="text-xs text-text-muted">{t("noLosers")}</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "volume" && (
        <div key="volume" className="fade-in">
          <div className="flex items-center gap-1 mb-2">
            <Activity className="w-3 h-3 text-accent-blue" />
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              {t("topVolume", { count: effectiveCount })}
            </span>
          </div>
          <div className="space-y-1">
            {volumeLeaders.map((stock, index) => (
              <VolumeRow
                key={stock.symbol}
                stock={stock}
                rank={index + 1}
                enableSwipeable={enableSwipeableCards}
                onSwipeRight={onSwipeRight}
                onSwipeLeft={onSwipeLeft}
                t={t}
              />
            ))}
          </div>
        </div>
      )}
    </CardComponent>
  );
}

export default TabbedMovers;
