/**
 * Valuation Metrics Card Component
 *
 * Card หลักสำหรับแสดงมูลค่าการประเมินย้อนหลังพร้อม statistical bands
 *
 * Features:
 * - Metric tabs (PE, PBV, ROE)
 * - Time range selector (1Y, 3Y, 5Y, ALL)
 * - Line chart พร้อม area bands
 * - Statistical bands (-2SD, -1SD, Mean, +1SD, +2SD)
 * - Bilingual support (Thai/English)
 * - Loading and error states
 * - Responsive design
 */

"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { useValuationMetrics } from "@/hooks/useValuationMetrics";
import { MetricBandChart } from "./MetricBandChart";
import { MetricSelector } from "./MetricSelector";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { cn } from "@/lib/utils";
import type { MetricType, TimeRange } from "@/types/valuation";

// ============================================================================
// TYPES
// ============================================================================

export interface ValuationMetricsCardProps {
  /** สัญลักษณ์หุ้น */
  symbol: string;
  /** CSS classes เพิ่มเติม */
  className?: string;
}

// ============================================================================
// SKELETON LOADER
// ============================================================================

interface ValuationSkeletonProps {
  className?: string;
}

function ValuationSkeleton({ className }: ValuationSkeletonProps) {
  return (
    <div className={cn("rounded-xl bg-surface border border-border p-4 md:p-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-surface-2 rounded animate-pulse" />
          <div className="h-4 w-32 bg-surface-2 rounded animate-pulse" />
        </div>
        <div className="h-8 w-40 bg-surface-2 rounded-lg animate-pulse" />
      </div>

      {/* Metric Tabs */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 w-20 bg-surface-2 rounded-lg animate-pulse"
          />
        ))}
      </div>

      {/* Chart */}
      <div className="h-64 bg-surface-2 rounded-lg animate-pulse" />
    </div>
  );
}

// ============================================================================
// ERROR STATE
// ============================================================================

interface ValuationErrorProps {
  error: Error | null;
  onRetry: () => void;
  className?: string;
}

function ValuationError({ error, onRetry, className }: ValuationErrorProps) {
  const locale = useLocale() as "en" | "th";

  const t = {
    en: {
      title: "Valuation History",
      error: "Failed to load valuation data",
      retry: "Retry",
    },
    th: {
      title: "มูลค่าการประเมินย้อนหลัง",
      error: "โหลดข้อมูลมูลค่าการประเมินไม่สำเร็จ",
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
          className="px-4 py-2 rounded-lg bg-accent-blue text-white text-sm font-medium hover:bg-accent-blue/80 transition-colors"
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

export function ValuationMetricsCard({
  symbol,
  className,
}: ValuationMetricsCardProps) {
  const locale = useLocale() as "en" | "th";

  // State
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("PE");
  const [timeRange, setTimeRange] = useState<TimeRange>("5Y");

  // Fetch data
  const { data, isLoading, isError, error, refetch } = useValuationMetrics({
    symbol,
    timeRange,
  });

  // Translations
  const t = {
    en: {
      title: "Valuation History",
      subtitle: "Historical valuation metrics with statistical bands",
    },
    th: {
      title: "มูลค่าการประเมินย้อนหลัง",
      subtitle: "ตัวชี้วัดมูลค่าการประเมินย้อนหลังพร้อมช่วงความเชื่อมั่น",
    },
  }[locale];

  // Handle metric change
  const handleMetricChange = useCallback((metric: MetricType) => {
    setSelectedMetric(metric);
  }, []);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
  }, []);

  // Get current series and band
  const currentSeries = data?.metrics[selectedMetric.toLowerCase() as keyof typeof data.metrics];
  const currentBand = data?.bands[selectedMetric.toLowerCase() as keyof typeof data.bands];

  // Loading state
  if (isLoading) {
    return <ValuationSkeleton className={className} />;
  }

  // Error state
  if (isError || !data) {
    return (
      <ValuationError
        error={error}
        onRetry={refetch}
        className={className}
      />
    );
  }

  // No data state
  if (!currentSeries || !currentBand) {
    return (
      <div className={cn("rounded-xl bg-surface border border-border p-4 md:p-6", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">{t.title}</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-text-2">
            {locale === "th" ? "ไม่มีข้อมูล" : "No data available"}
          </p>
        </div>
      </div>
    );
  }

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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary leading-tight">
            {t.title}
          </h3>
          <p className="text-sm text-text-secondary">{t.subtitle}</p>
        </div>

        {/* Time Range Selector */}
        <TimeRangeSelector
          selected={timeRange}
          onSelect={handleTimeRangeChange}
        />
      </div>

      {/* Metric Type Tabs */}
      <MetricSelector
        selected={selectedMetric}
        onSelect={handleMetricChange}
      />

      {/* Chart Area */}
      <div className="mt-6">
        <MetricBandChart
          series={currentSeries}
          band={currentBand}
          metric={selectedMetric}
        />
      </div>

      {/* Current Value Badge */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-2">
            {locale === "th" ? "ค่าปัจจุบัน" : "Current Value"}:
          </span>
          <span className="text-sm font-semibold tabular-nums text-text-primary">
            {selectedMetric === "PE" || selectedMetric === "PBV"
              ? currentBand.currentValue.toFixed(2)
              : currentBand.currentValue.toFixed(1)}
            {selectedMetric === "ROE" ? "%" : "x"}
          </span>
        </div>

        {/* Valuation Status Badge */}
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border",
            {
              "bg-up-soft text-up-primary border-up-primary/30":
                currentBand.interpretation === "undervalued" ||
                currentBand.interpretation === "deep_undervalued",
              "bg-surface-2 text-text-secondary border-border-subtle/50":
                currentBand.interpretation === "fair_value",
              "bg-down-soft text-down-primary border-down-primary/30":
                currentBand.interpretation === "overvalued" ||
                currentBand.interpretation === "sell_zone",
            }
          )}
        >
          {currentBand.interpretation === "deep_undervalued" &&
            (locale === "th" ? "ถูกมาก" : "Deep Undervalued")}
          {currentBand.interpretation === "undervalued" &&
            (locale === "th" ? "ถูก" : "Undervalued")}
          {currentBand.interpretation === "fair_value" &&
            (locale === "th" ? "ปกติ" : "Fair Value")}
          {currentBand.interpretation === "overvalued" &&
            (locale === "th" ? "แพง" : "Overvalued")}
          {currentBand.interpretation === "sell_zone" &&
            (locale === "th" ? "แพงมาก" : "Sell Zone")}
        </div>
      </div>
    </div>
  );
}

/**
 * Default export
 */
export default ValuationMetricsCard;
