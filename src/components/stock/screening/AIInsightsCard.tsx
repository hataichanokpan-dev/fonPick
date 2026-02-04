"use client";

/**
 * AI Insights Card Component
 *
 * Displays AI-powered catalyst analysis from the n8n webhook API.
 * Features:
 * - Opt-in button for initial fetch (API takes ~2 minutes)
 * - Loading state with progress bar and ETA
 * - Tab navigation: [Catalysts] [Watch List] [Theme]
 * - Error handling with retry
 */

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { CatalystLoading } from "./CatalystLoading";
import type {
  AIInsightsCardProps,
  CatalystLoadingStatus,
  CatalystTab,
  ParsedCatalystData,
} from "@/types/catalyst";
import {
  calculateETA,
  calculateProgress,
  getCurrentStep,
} from "@/lib/api/catalyst-api";

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  th: {
    title: "AI INSIGHTS",
    titleThai: "ข้อมูลเชิงลึกจาก AI",
    analyzeButton: "วิเคราะห์เหตุการณ์สำคัญ",
    analyzeButtonSub: "รับการวิเคราะห์ Catalyst ด้วย AI",
    warning: "ใช้เวลาประมาณ 2 นาที",
    retryButton: "ลองใหม่",
    errorTitle: "เกิดข้อผิดพลาด",
    errorMsg: "ไม่สามารถดึงข้อมูล AI ได้",
    score: "คะแนน AI",
    tabCatalysts: "เหตุการณ์สำคัญ",
    tabWatch: "เฝ้าดู",
    tabTheme: "ธีมการลงทุน",
    noData: "ไม่มีข้อมูล",
  },
  en: {
    title: "AI INSIGHTS",
    titleThai: "AI-Powered Insights",
    analyzeButton: "Analyze Catalysts",
    analyzeButtonSub: "Get AI-powered catalyst analysis",
    warning: "Takes ~2 minutes",
    retryButton: "Retry",
    errorTitle: "Error",
    errorMsg: "Failed to fetch AI data",
    score: "AI Score",
    tabCatalysts: "Catalysts",
    tabWatch: "Watch List",
    tabTheme: "Investment Theme",
    noData: "No data available",
  },
} as const;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Initial state - Opt-in button
 */
function InitialState({
  symbol,
  locale,
  onStart,
}: {
  symbol: string;
  locale: "en" | "th";
  onStart: () => void;
}) {
  const t = LABELS[locale];

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-purple/20 to-insight/20 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-accent-purple" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        {t.analyzeButton}
      </h3>
      <p className="text-sm text-text-3 mb-6">
        {t.analyzeButtonSub} {symbol}
      </p>
      <button
        onClick={onStart}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-accent-purple to-insight text-white font-medium hover:opacity-90 transition-opacity"
      >
        <Sparkles className="w-4 h-4" />
        {t.analyzeButton}
        <ChevronRight className="w-4 h-4" />
      </button>
      <p className="text-xs text-text-3 mt-4 flex items-center justify-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {t.warning}
      </p>
    </div>
  );
}

/**
 * Error state with retry button
 */
function ErrorState({
  locale,
  onRetry,
  errorMessage,
}: {
  locale: "en" | "th";
  onRetry: () => void;
  errorMessage?: string;
}) {
  const t = LABELS[locale];

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-risk/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-risk" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        {t.errorTitle}
      </h3>
      <p className="text-sm text-text-3 mb-6">{errorMessage || t.errorMsg}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-surface-2 border border-border text-text-primary font-medium hover:bg-surface-3 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        {t.retryButton}
      </button>
    </div>
  );
}

/**
 * Tab content for Theme
 */
function ThemeTab({ theme, locale }: { theme: string; locale: "en" | "th" }) {
  const t = LABELS[locale];

  if (!theme) {
    return (
      <div className="text-center py-6 text-text-3 text-sm">{t.noData}</div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-surface-2 border border-border">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4 text-purple-600" />
        </div>
        <p className="text-sm text-text-primary leading-relaxed">{theme}</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AIInsightsCard({
  symbol,
  locale = "th",
  initialData,
}: AIInsightsCardProps) {
  const t = LABELS[locale];

  // Track if initialData prop was provided (undefined = not provided, null = provided but empty)
  const hasInitialDataProp = initialData !== undefined;

  // State
  const [status, setStatus] = useState<CatalystLoadingStatus>(
    hasInitialDataProp && initialData ? "success" : "loading",
  );
  const [data, setData] = useState<ParsedCatalystData | null>(
    initialData || null,
  );
  const [activeTab, setActiveTab] = useState<CatalystTab>("catalysts");
  const [startTime, setStartTime] = useState<number | null>(
    hasInitialDataProp && initialData ? null : Date.now(),
  );
  const [progress, setProgress] = useState(
    hasInitialDataProp && initialData ? 100 : 0,
  );
  const [error, setError] = useState<string | null>(null);

  // ETA and step calculation (derived from progress)
  const eta = startTime ? calculateETA(startTime) : undefined;
  const currentStep = getCurrentStep(progress);

  // Fetch function
  const fetchCatalyst = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setStartTime(Date.now());

    try {
      const response = await fetch(`/api/stocks/${symbol}/catalyst`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch");
      }

      setData(result.data);
      setStatus("success");
      setActiveTab("theme");
    } catch (err) {
      console.error("[AIInsightsCard] Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    } finally {
      setStartTime(null);
    }
  }, [symbol]);

  // Auto-fetch ONLY if initialData prop was NOT provided
  // If initialData is provided (even if null), parent is responsible for fetching
  useEffect(() => {
    if (!hasInitialDataProp && !data) {
      fetchCatalyst();
    }
  }, [hasInitialDataProp]);

  // Sync state with initialData when it changes (parent controls fetching)
  useEffect(() => {
    if (hasInitialDataProp) {
      if (initialData) {
        setData(initialData);
        setStatus("success");
        setProgress(100);
        setStartTime(null);
        setError(null);
      }
      // If initialData is explicitly null, parent is still fetching - stay in loading
    }
  }, [initialData, hasInitialDataProp]);

  // Auto-update progress during loading
  useEffect(() => {
    if (status === "loading" && startTime) {
      const interval = setInterval(() => {
        setProgress(calculateProgress(startTime));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, startTime]);

  // Render based on status
  const renderContent = () => {
    switch (status) {
      case "idle":
        return (
          <InitialState
            symbol={symbol}
            locale={locale}
            onStart={fetchCatalyst}
          />
        );

      case "loading":
        return (
          <CatalystLoading
            progress={progress}
            eta={eta}
            currentStep={currentStep}
          />
        );

      case "error":
        return (
          <ErrorState
            locale={locale}
            onRetry={fetchCatalyst}
            errorMessage={error || undefined}
          />
        );

      case "success":
        if (!data) return null;

        return (
          <div className="ai-insights-content">
            {/* AI Score Badge */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <div>
                <span className="text-sm text-text-3">{t.score}</span>
                <div className="text-2xl font-bold text-text-primary mt-0.5">
                  {data.aiScore}/10
                </div>
              </div>
              <button
                onClick={fetchCatalyst}
                className="p-2 rounded-lg hover:bg-surface-3 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-text-3" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-4 p-1 bg-surface-2 rounded-lg">
              <TabButton
                active={activeTab === "theme"}
                onClick={() => setActiveTab("theme")}
              >
                {t.tabTheme}
              </TabButton>
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              <ThemeTab theme={data.theme} locale={locale} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 bg-surface-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-purple" />
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              {t.title}
            </h3>
            <p className="text-xs text-text-3">{t.titleThai}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">{renderContent()}</div>
    </div>
  );
}

// ============================================================================
// TAB BUTTON COMPONENT
// ============================================================================

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
        active
          ? "bg-surface text-text-primary shadow-sm"
          : "text-text-3 hover:text-text-primary hover:bg-surface-3"
      }`}
    >
      {children}
    </button>
  );
}
