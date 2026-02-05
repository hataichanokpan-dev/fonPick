/**
 * Dividend Analysis Card Component
 *
 * Card หลักสำหรับแสดงการวิเคราะห์ปันผล
 *
 * Features:
 * - Consistency meter with star rating
 * - Current DPS, Yield, Payout Ratio
 * - Dividend timeline chart with forecast
 * - Growth metrics
 * - Bilingual support (Thai/English)
 * - Loading and error states
 * - Responsive design
 */

"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useDividendAnalysis } from "@/hooks/useDividendAnalysis";
import { DividendTimelineChart } from "./DividendTimelineChart";
import ConsistencyMeter from "./ConsistencyMeter";
import { cn } from "@/lib/utils";
import { DIVIDEND_STATUS_CONFIG } from "@/types/dividend";

// ============================================================================
// TYPES
// ============================================================================

export interface DividendAnalysisCardProps {
  /** สัญลักษณ์หุ้น */
  symbol: string;
  /** ราคาหุ้นปัจจุบัน (สำหรับคำนวณ yield) */
  currentPrice?: number;
  /** CSS classes เพิ่มเติม */
  className?: string;
}

// ============================================================================
// SKELETON LOADER
// ============================================================================

interface DividendSkeletonProps {
  className?: string;
}

function DividendSkeleton({ className }: DividendSkeletonProps) {
  return (
    <div className={cn("rounded-xl bg-surface border border-border p-4 md:p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-surface-2 rounded animate-pulse" />
          <div className="h-4 w-32 bg-surface-2 rounded animate-pulse" />
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-surface-2 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Chart */}
      <div className="h-48 bg-surface-2 rounded-lg animate-pulse mb-4" />

      {/* Bottom Metrics */}
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 flex-1 bg-surface-2 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ERROR STATE
// ============================================================================

interface DividendErrorProps {
  error: Error | null;
  onRetry: () => void;
  className?: string;
}

function DividendError({ error, onRetry, className }: DividendErrorProps) {
  const locale = useLocale() as "en" | "th";

  const t = {
    en: {
      title: "Dividend Analysis",
      error: "Failed to load dividend data",
      retry: "Retry",
    },
    th: {
      title: "การวิเคราะห์ปันผล",
      error: "โหลดข้อมูลปันผลไม่สำเร็จ",
      retry: "ลองใหม่",
    },
  }[locale];

  return (
    <div className={cn("rounded-xl bg-surface border border-border p-4 md:p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">{t.title}</h3>
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-text-2 mb-2">{t.error}</p>
        <p className="text-xs text-text-3 mb-4">{error?.message}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-accent-teal text-white text-sm font-medium hover:bg-accent-teal/80 transition-colors"
        >
          {t.retry}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DividendAnalysisCard({
  symbol,
  currentPrice = 100, // Default fallback price
  className,
}: DividendAnalysisCardProps) {
  const locale = useLocale() as "en" | "th";

  // Fetch data
  const { data, isLoading, isError, error, refetch } = useDividendAnalysis({
    symbol,
  });

  // Translations
  const t = {
    en: {
      title: "Dividend Analysis",
      subtitle: "Historical dividends with consistency score and forecasts",
      currentDPS: "Current DPS",
      yield: "Yield",
      payout: "Payout Ratio",
      attractive: "Attractive",
      normal: "Normal",
      low: "Low",
      forecast: "Forecast",
      payoutLabel: "Payout",
      coverageLabel: "Coverage",
      growthLabel: "Growth",
      cagrLabel: "CAGR",
    },
    th: {
      title: "การจ่ายเงินปันผล",
      subtitle: "ประวัติการจ่ายปันผลพร้อมคะแนนความสม่ำเสมอและการคาดการณ์",
      currentDPS: "DPS ปัจจุบัน",
      yield: "อัตราผลตอบ",
      payout: "Payout Ratio",
      attractive: "น่าสนใจ",
      normal: "ปกติ",
      low: "ต่ำ",
      forecast: "คาดการณ์",
      payoutLabel: "จ่าย",
      coverageLabel: "ครอบคลุม",
      growthLabel: "การเติบโต",
      cagrLabel: "CAGR",
    },
  }[locale];

  // Handle retry
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return <DividendSkeleton className={className} />;
  }

  // Error state
  if (isError || !data) {
    return (
      <DividendError
        error={error}
        onRetry={handleRetry}
        className={className}
      />
    );
  }

  // Get dividend status
  const yieldStatus = data.current.yield >= 4 ? "attractive" : data.current.yield >= 2 ? "normal" : "low";
  const statusConfig = (DIVIDEND_STATUS_CONFIG as Record<string, typeof DIVIDEND_STATUS_CONFIG[keyof typeof DIVIDEND_STATUS_CONFIG]>)[
    yieldStatus
  ] || DIVIDEND_STATUS_CONFIG.normal;
  const StatusIcon =
    yieldStatus === "attractive"
      ? TrendingUp
      : yieldStatus === "normal"
        ? TrendingUp
        : TrendingDown;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div
      className={cn(
        "rounded-xl bg-surface border border-border p-4 md:p-6 fade-in-slide-up",
        className
      )}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary leading-tight">
          {t.title}
        </h3>
        <p className="text-sm text-text-secondary">{t.subtitle}</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Consistency Meter */}
        <ConsistencyMeter consistency={data.consistency} />

        {/* Current DPS */}
        <div className="bg-surface-2 rounded-lg p-4 border border-border-subtle/50">
          <p className="text-[10px] uppercase tracking-wide text-text-tertiary mb-2">
            {t.currentDPS}
          </p>
          <p className="text-xl font-semibold tabular-nums text-text-primary">
            ฿{data.current.dps.toFixed(2)}
          </p>
          <p
            className={cn(
              "text-xs font-medium flex items-center gap-1",
              data.current.dpsChange >= 0 ? "text-up-primary" : "text-down-primary"
            )}
          >
            {data.current.dpsChange >= 0 ? "+" : ""}
            {data.current.dpsChange.toFixed(1)}%
          </p>
        </div>

        {/* Dividend Yield */}
        <div
          className={cn(
            "rounded-lg p-4 border",
            statusConfig.bg,
            statusConfig.border
          )}
        >
          <p className="text-[10px] uppercase tracking-wide text-text-tertiary mb-2">
            {t.yield}
          </p>
          <p className={cn("text-xl font-semibold tabular-nums", statusConfig.text)}>
            {data.current.yield.toFixed(1)}%
          </p>
          <p className={cn("text-xs font-medium flex items-center gap-1", statusConfig.text)}>
            <StatusIcon className="w-3 h-3" />
            {yieldStatus === "attractive"
              ? t.attractive
              : yieldStatus === "normal"
                ? t.normal
                : t.low}
          </p>
        </div>
      </div>

      {/* Dividend Timeline Chart */}
      <div className="mb-4">
        <DividendTimelineChart
          history={data.history}
          forecasts={data.forecasts}
          currentPrice={currentPrice}
        />
      </div>

      {/* Bottom Metrics Strip */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-border-subtle/50">
        {/* Payout Ratio */}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-2 rounded-lg">
          <span className="text-xs text-text-tertiary">{t.payoutLabel}:</span>
          <span className="text-sm font-semibold text-text-primary tabular-nums">
            {data.current.payoutRatio.toFixed(0)}%
          </span>
        </div>

        {/* FCF Coverage */}
        {data.metrics.fcfCoverage > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-2 rounded-lg">
            <span className="text-xs text-text-tertiary">{t.coverageLabel}:</span>
            <span className="text-sm font-semibold text-up-primary tabular-nums">
              {data.metrics.fcfCoverage.toFixed(1)}x
            </span>
          </div>
        )}

        {/* Growth (5Y CAGR) */}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-2 rounded-lg">
          <span className="text-xs text-text-tertiary">
            {t.growthLabel} ({t.cagrLabel}):
          </span>
          <span className="text-sm font-semibold text-up-primary tabular-nums">
            {data.metrics.fiveYearCAGR > 0 ? "+" : ""}
            {data.metrics.fiveYearCAGR.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Default export
 */
export default DividendAnalysisCard;
