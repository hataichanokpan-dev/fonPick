'use client'

/**
 * Layer 1: Universe Filters Component
 *
 * Displays basic eligibility filters:
 * - Market Cap > 5B THB
 * - Volume > 5M THB/day
 */

import { UNIVERSE_THRESHOLDS } from "./constants";
import type { UniverseScoreData } from "./types";
import { formatLargeNumber } from "./utils/formatters";

interface Layer1UniverseProps {
  marketCap: number;
  volume: number;
  locale?: "en" | "th";
  compact?: boolean;
  className?: string;
}

/**
 * Calculate universe score
 */
export function calculateUniverseScore(
  marketCap: number,
  volume: number,
): UniverseScoreData {
  const marketCapPass = marketCap >= UNIVERSE_THRESHOLDS.MARKET_CAP_MIN;
  const volumePass = volume >= UNIVERSE_THRESHOLDS.VOLUME_DAILY_MIN;

  const score = (marketCapPass ? 1 : 0) + (volumePass ? 1 : 0);

  return {
    totalScore: score as UniverseScoreData["totalScore"],
    maxScore: 2,
    filters: {
      marketCap: {
        value: marketCap,
        passes: marketCapPass,
        threshold: UNIVERSE_THRESHOLDS.MARKET_CAP_MIN,
        currentDisplay: formatLargeNumber(marketCap),
        thresholdDisplay: formatLargeNumber(UNIVERSE_THRESHOLDS.MARKET_CAP_MIN),
      },
      volume: {
        value: volume,
        passes: volumePass,
        threshold: UNIVERSE_THRESHOLDS.VOLUME_DAILY_MIN,
        currentDisplay: formatLargeNumber(volume),
        thresholdDisplay: formatLargeNumber(
          UNIVERSE_THRESHOLDS.VOLUME_DAILY_MIN,
        ),
      },
    },
    allPassed: marketCapPass && volumePass,
  };
}

/**
 * Labels
 */
const LABELS = {
  en: {
    title: "UNIVERSE",
    description: "Basic eligibility filters",
    marketCap: "Market Cap",
    marketCapThai: "มูลค่าตลาด",
    volume: "Volume",
    volumeThai: "ปริมาณซื้อขาย",
    threshold: "Threshold",
    current: "Current",
    passed: "PASSED",
    failed: "FAILED",
    allPassed: "All filters passed",
    someFailed: "Some filters failed",
  },
  th: {
    title: "กรองพื้นฐาน",
    description: "เกณฑ์การคัดเลือกพื้นฐาน",
    marketCap: "Market Cap",
    marketCapThai: "มูลค่าตลาด",
    volume: "Volume",
    volumeThai: "ปริมาณซื้อขาย",
    threshold: "เกณฑ์",
    current: "ปัจจุบัน",
    passed: "ผ่าน",
    failed: "ไม่ผ่าน",
    allPassed: "ผ่านทุกเกณฑ์",
    someFailed: "ไม่ผ่านบางเกณฑ์",
  },
} as const;

export function Layer1Universe({
  marketCap,
  volume,
  locale = "th" as "en" | "th",
  compact = false,
  className = "",
}: Layer1UniverseProps) {
  const scoreData = calculateUniverseScore(marketCap, volume);
  const t = LABELS[locale];

  if (compact) {
    return (
      <div className={`layer1-universe-compact ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-semibold text-text-primary">
              {t.title}
            </span>
            <span className="text-sm text-text-secondary ml-2">
              {scoreData.totalScore}/{scoreData.maxScore}
            </span>
          </div>
          <span
            className={`text-xs font-medium ${scoreData.allPassed ? "text-up-primary" : "text-warn"}`}
          >
            {scoreData.allPassed ? `✓ ${t.passed}` : `⚠ ${t.someFailed}`}
          </span>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          {/* Market Cap */}
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${scoreData.filters.marketCap.passes ? "text-up-primary" : "text-risk"}`}
              >
                {scoreData.filters.marketCap.passes ? "✓" : "✗"}
              </span>
              <span className="text-sm text-text-secondary">
                {t.marketCapThai} &gt;{" "}
                {formatLargeNumber(UNIVERSE_THRESHOLDS.MARKET_CAP_MIN)}
              </span>
            </div>
            <span
              className={`text-sm font-semibold tabular-nums ${scoreData.filters.marketCap.passes ? "text-up-primary" : "text-risk"}`}
            >
              {scoreData.filters.marketCap.currentDisplay}
            </span>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${scoreData.filters.volume.passes ? "text-up-primary" : "text-risk"}`}
              >
                {scoreData.filters.volume.passes ? "✓" : "✗"}
              </span>
              <span className="text-sm text-text-secondary">
                {t.volumeThai} &gt;{" "}
                {formatLargeNumber(UNIVERSE_THRESHOLDS.VOLUME_DAILY_MIN)}
              </span>
            </div>
            <span
              className={`text-sm font-semibold tabular-nums ${scoreData.filters.volume.passes ? "text-up-primary" : "text-risk"}`}
            >
              {scoreData.filters.volume.currentDisplay}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className={`layer1-universe ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          {t.title}
        </h3>
        <p className="text-sm text-text-3">{t.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
              scoreData.allPassed
                ? "bg-up-soft text-up-primary"
                : "bg-warn/20 text-warn"
            }`}
          >
            {scoreData.allPassed ? `✓ ${t.allPassed}` : `⚠ ${t.someFailed}`}
          </span>
          <span className="text-sm text-text-3">
            {scoreData.totalScore} / {scoreData.maxScore}
          </span>
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Market Cap Filter */}
        <FilterCard
          name={t.marketCap}
          thaiName={t.marketCapThai}
          current={scoreData.filters.marketCap.currentDisplay}
          threshold={scoreData.filters.marketCap.thresholdDisplay}
          passed={scoreData.filters.marketCap.passes}
          locale={locale}
        />

        {/* Volume Filter */}
        <FilterCard
          name={t.volume}
          thaiName={t.volumeThai}
          current={scoreData.filters.volume.currentDisplay}
          threshold={scoreData.filters.volume.thresholdDisplay}
          passed={scoreData.filters.volume.passes}
          locale={locale}
        />
      </div>
    </div>
  );
}

/**
 * Individual filter card
 */
interface FilterCardProps {
  name: string;
  thaiName: string;
  current: string | undefined;
  threshold: string | undefined;
  passed: boolean;
  locale: "en" | "th";
}

function FilterCard({
  name,
  thaiName,
  current,
  threshold,
  passed,
  locale,
}: FilterCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-all duration-200 ${
        passed
          ? "border-up-primary/30 bg-up-soft/10"
          : "border-risk/30 bg-risk/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
              passed ? "bg-up-primary text-white" : "bg-risk text-white"
            }`}
          >
            {passed ? "✓" : "✗"}
          </span>
          <div>
            <div className="text-sm font-medium text-text-primary">
              {thaiName}
            </div>
            <div className="text-xs text-text-3">{name}</div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-3">
            {locale === "th" ? "ปัจจุบัน" : "Current"}
          </span>
          <span
            className={`text-sm font-semibold tabular-nums ${passed ? "text-up-primary" : "text-risk"}`}
          >
            {current}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-3">
            {locale === "th" ? "เกณฑ์ขั้นต่ำ" : "Minimum"}
          </span>
          <span className="text-sm font-medium tabular-nums text-text-2">
            {">"} {threshold}
          </span>
        </div>
      </div>

      {/* Status bar */}
      <div className="mt-3 h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${passed ? "bg-up-primary" : "bg-risk"}`}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
