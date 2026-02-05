'use client'

/**
 * Layer 1: Universe Filters Component
 *
 * Displays basic eligibility filters:
 * - Market Cap > 5B THB
 * - Volume > 5M THB/day
 */

import { UNIVERSE_THRESHOLDS } from "./constants";
import { ScoreIndicator } from "./ScoreIndicator";
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
          <ScoreIndicator
            status={scoreData.filters.marketCap.passes ? 'pass' : 'fail'}
            label={t.marketCap}
            thaiLabel={t.marketCapThai}
            value={`> ${formatLargeNumber(UNIVERSE_THRESHOLDS.MARKET_CAP_MIN)} | ${scoreData.filters.marketCap.currentDisplay}`}
            locale={locale}
            compact
          />

          {/* Volume */}
          <ScoreIndicator
            status={scoreData.filters.volume.passes ? 'pass' : 'fail'}
            label={t.volume}
            thaiLabel={t.volumeThai}
            value={`> ${formatLargeNumber(UNIVERSE_THRESHOLDS.VOLUME_DAILY_MIN)} | ${scoreData.filters.volume.currentDisplay}`}
            locale={locale}
            compact
          />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Market Cap Filter */}
        <ScoreIndicator
          status={scoreData.filters.marketCap.passes ? 'pass' : 'fail'}
          label={t.marketCap}
          thaiLabel={t.marketCapThai}
          value={`${locale === 'th' ? 'ปัจจุบัน' : 'Current'}: ${scoreData.filters.marketCap.currentDisplay} | ${locale === 'th' ? 'เกณฑ์ขั้นต่ำ' : 'Minimum'}: > ${scoreData.filters.marketCap.thresholdDisplay}`}
          locale={locale}
        />

        {/* Volume Filter */}
        <ScoreIndicator
          status={scoreData.filters.volume.passes ? 'pass' : 'fail'}
          label={t.volume}
          thaiLabel={t.volumeThai}
          value={`${locale === 'th' ? 'ปัจจุบัน' : 'Current'}: ${scoreData.filters.volume.currentDisplay} | ${locale === 'th' ? 'เกณฑ์ขั้นต่ำ' : 'Minimum'}: > ${scoreData.filters.volume.thresholdDisplay}`}
          locale={locale}
        />
      </div>
    </div>
  );
}
