/**
 * SmartMoneyTrendModal Component
 *
 * Full-screen modal displaying detailed smart money trend analysis.
 * Features:
 * - Time period selector (5D, 10D, 1M, 3M, 6M, 1Y)
 * - Stacked area chart for all investors
 * - Summary cards (Net Flow, Signal, Confidence)
 * - Mini sparklines for each investor type
 * - Data table view
 * - Pattern detection badges
 *
 * Phase 2: Frontend Core
 */

"use client";

import { useEffect, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { TrendChartContainer } from "./TrendChartContainer";
import { TrendMetricsGrid } from "./TrendMetricsGrid";
import { TrendPeriodSelector } from "./TrendPeriodSelector";
import { PatternBadges } from "./PatternBadges";
import { InvestorBreakdownCard } from "./InvestorBreakdownCard";
import { TrendDataTable } from "./InvestorBreakdownCards";
import { useSmartMoneyTrend } from "@/hooks/useSmartMoneyTrend";
import { useTranslations } from "next-intl";
import type { TrendPeriod } from "@/types/smart-money";

// ============================================================================
// TYPES
// ============================================================================

export interface SmartMoneyTrendModalProps {
  /** Is modal open */
  isOpen: boolean;

  /** Close modal handler */
  onClose: () => void;

  /** Initial period */
  initialPeriod?: TrendPeriod;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SmartMoneyTrendModal({
  isOpen,
  onClose,
  initialPeriod = 30,
}: SmartMoneyTrendModalProps) {
  const t = useTranslations("dashboard.smartMoney.trend");
  const [period, setPeriod] = useState<TrendPeriod>(initialPeriod);

  // Fetch trend data
  
  const { data, isLoading, error } = useSmartMoneyTrend({
    period,
    enabled: isOpen,
  });
  

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle period change
  const handlePeriodChange = async (newPeriod: TrendPeriod) => {
    setPeriod(newPeriod);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="absolute inset-2 md:inset-4 lg:inset-8 bg-surface rounded-2xl border border-border-subtle overflow-hidden flex flex-col animate-slide-down">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border-subtle bg-surface-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-3 transition-colors"
              aria-label={t("close")}
            >
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </button>
            <h2 className="text-base md:text-lg font-semibold text-text-primary">
              {
                "Smart Money Trend Analysis"
              }
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-3 transition-colors"
            aria-label={t("close")}
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
          {isLoading ? (
            <LoadingSkeleton t={t} />
          ) : error ? (
            <ErrorState t={t} onRetry={() => setPeriod(period)} />
          ) : data ? (
            <>
              {/* Period Selector */}
              <div className="mb-6">
                <TrendPeriodSelector
                  period={period}
                  onPeriodChange={handlePeriodChange}
                />
              </div>

              {/* Main Chart */}
              <div className="mb-6">
                <TrendChartContainer data={data} period={period} />
              </div>

              {/* Summary Metrics */}
              <div className="mb-6">
                <TrendMetricsGrid data={data} />
              </div>

              {/* Pattern Detection */}
              {data.patterns && data.patterns.length > 0 && (
                <div className="mb-6">
                  <PatternBadges patterns={data.patterns} />
                </div>
              )}

              {/* Investor Breakdown with Sparklines */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-text-secondary mb-3">
                  รายละเอียดตามประเภท
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InvestorBreakdownCard
                    investor={data.investors.foreign}
                    isPrimary={data.summary.primaryDriver === "foreign"}
                  />
                  <InvestorBreakdownCard
                    investor={data.investors.institution}
                    isPrimary={data.summary.primaryDriver === "institution"}
                  />
                  <InvestorBreakdownCard
                    investor={data.investors.retail}
                    isPrimary={data.summary.primaryDriver === "retail"}
                  />
                  <InvestorBreakdownCard
                    investor={data.investors.prop}
                    isPrimary={data.summary.primaryDriver === "prop"}
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-text-secondary mb-3">
                  ข้อมูลรายวัน
                </h4>
                <TrendDataTable combined={data.combined} maxRows={15} />
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        {data && (
          <footer className="px-4 md:px-6 py-3 border-t border-border-subtle bg-surface-2">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>
                {t("dataRange")}: {data.period.start} - {data.period.end}
              </span>
              <span>{t("totalDays")}: {data.period.days}</span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SKELETON LOADING
// ============================================================================

interface LoadingSkeletonProps {
  t: (key: string) => string;
}

function LoadingSkeleton({ t: _t }: LoadingSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Period Selector Skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-9 w-16 bg-surface-2 rounded-lg"
          />
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="h-64 md:h-80 bg-surface-2 rounded-xl" />

      {/* Metrics Skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-surface-2 rounded-xl" />
        ))}
      </div>

      {/* Patterns Skeleton */}
      <div className="flex gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-8 w-32 bg-surface-2 rounded-full" />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ERROR STATE
// ============================================================================

interface ErrorStateProps {
  t: (key: string) => string;
  onRetry: () => void;
}

function ErrorState({ t, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4">
        <X className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {t("error.title")}
      </h3>
      <p className="text-text-muted text-sm mb-4">{t("error.message")}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        {t("error.retry")}
      </button>
    </div>
  );
}

export default SmartMoneyTrendModal;
