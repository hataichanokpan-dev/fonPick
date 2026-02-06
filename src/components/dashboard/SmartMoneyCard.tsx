/**
 * SmartMoneyCard Component
 *
 * Displays smart money / institutional activity including:
 * - Foreign flow with trend indicator
 * - Institution flow with trend indicator
 * - Retail flow (context, 60% opacity)
 * - Prop flow (context, 60% opacity)
 * - Combined signal badge (Strong Buy/Sell)
 * - Risk signal badge (Risk-On/Risk-Off)
 * - Visual score gauge (0-100)
 *
 * Answers Q3: "Risk on because Foreign Investor is strong buy or Prop reduce sell vol?"
 * Data source: /api/market-intelligence
 *
 * Theme: Green-tinted dark with teal up / soft red down
 * Design: Compact 12px padding, large prominent numbers
 */

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/shared";
import { Badge } from "@/components/shared/Badge";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Building2,
  Users,
  Briefcase,
  Gauge,
  LineChart,
} from "lucide-react";
import { formatTradingValue, safeToFixed } from "@/lib/utils";
import { useSmartMoney } from "@/hooks/useMarketIntelligence";
import { useTranslations } from "next-intl";
import { SmartMoneyTrendModal } from "./smart-money/SmartMoneyTrendModal";

// ==================================================================
// TYPES
// ==================================================================

// Use the actual SmartMoneyAnalysis type from the API
// which has investors nested structure

export interface SmartMoneyCardProps {
  /** Additional CSS classes */
  className?: string;
}

// ==================================================================
// CONSTANTS
// ==================================================================

const COLORS = {
  up: "#2ED8A7",
  down: "#F45B69",
  warn: "#F7C948",
  neutral: "#94A3B8",
};

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function ScoreGauge({ score, size = 56 }: ScoreGaugeProps) {
  // Calculate gauge arc based on score (0-100)
  const percentage = Math.max(0, Math.min(100, score));

  // Determine color based on score
  const getGaugeColor = (): { bg: string; fill: string } => {
    if (score >= 60) return { bg: "rgba(46, 216, 167, 0.25)", fill: COLORS.up };
    if (score >= 40)
      return { bg: "rgba(148, 163, 184, 0.2)", fill: COLORS.neutral };
    return { bg: "rgba(244, 91, 105, 0.25)", fill: COLORS.down };
  };

  const colors = getGaugeColor();
  const circumference = 2 * Math.PI * ((size - 8) / 2);
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          fill="none"
          stroke={colors.bg}
          strokeWidth="5"
        />
        {/* Foreground arc - CSS animation replaces Framer Motion */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          fill="none"
          stroke={colors.fill}
          strokeWidth="5"
          strokeLinecap="round"
          className="animate-stroke"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: dashOffset,
            '--stroke-offset-start': circumference,
            '--stroke-offset-end': dashOffset,
          } as React.CSSProperties}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold tabular-nums" style={{ color: colors.fill }}>
          {safeToFixed(score, 1)}
        </span>
      </div>
    </div>
  );
}

interface InvestorRowProps {
  label: string;
  icon: React.ReactNode;
  data: {
    todayNet?: number;
    trend?: string;
    strength?: string;
  };
  /** Translated strength label for display */
  translatedStrength?: string;
  /** Translation function for fallback strength */
  t?: (key: string) => string;
  opacity?: number;
}

function InvestorRow({ label, icon, data, translatedStrength, t, opacity = 1 }: InvestorRowProps) {
  // Handle missing data gracefully
  const todayNet = data.todayNet ?? 0;
  const strength = data.strength ?? "Neutral";

  const isPositive = todayNet > 0;
  const flowColor = isPositive
    ? COLORS.up
    : todayNet < 0
      ? COLORS.down
      : COLORS.neutral;
  const bgColor = isPositive
    ? `rgba(46, 216, 167, ${0.1 * opacity})`
    : todayNet < 0
      ? `rgba(244, 91, 105, ${0.1 * opacity})`
      : `rgba(148, 163, 184, ${0.08 * opacity})`;

  const getStrengthColor = (): "buy" | "sell" | "neutral" | "watch" => {
    switch (strength) {
      case "Strong Buy":
      case "Buy":
        return "buy";
      case "Strong Sell":
      case "Sell":
        return "sell";
      default:
        return "neutral";
    }
  };

  const getTrendIcon = () => {
    if (data.trend?.includes("Buy")) return <TrendingUp className="w-3 h-3" />;
    if (data.trend?.includes("Sell"))
      return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  // Display translated strength, fallback to original strength translated via t function
  const displayStrength = translatedStrength || (t ? t("neutral") : strength);

  return (
    <div
      className="flex items-center gap-2.5 p-2.5 rounded-md transition-all duration-200"
      style={{ backgroundColor: bgColor, opacity }}
    >
      {/* Icon */}
      <div className="flex-shrink-0" style={{ color: flowColor, opacity }}>
        {icon}
      </div>

      {/* Label */}
      <span
        className="text-xs font-semibold text-text-secondary w-16"
        style={{ opacity }}
      >
        {label}
      </span>

      {/* Flow Value */}
      <span
        className="flex-1 text-sm font-bold tabular-nums"
        style={{ color: flowColor, opacity }}
      >
        {isPositive && "+"}
        {formatTradingValue(Math.abs(todayNet))}
      </span>

      {/* Trend Icon */}
      <div style={{ color: flowColor, opacity }}>{getTrendIcon()}</div>

      {/* Signal Badge */}
      <Badge size="sm" color={getStrengthColor()}>
        {displayStrength}
      </Badge>
    </div>
  );
}

// Separator between smart money and context investors
interface InvestorSeparatorProps {
  t: (key: string) => string;
}

function InvestorSeparator({ t }: InvestorSeparatorProps) {
  return (
    <div className="flex items-center gap-2 my-2">
      <div className="flex-1 h-px bg-border-subtle" />
      <span className="text-[9px] uppercase tracking-wider text-text-muted font-semibold">
        {t("context")}
      </span>
      <div className="flex-1 h-px bg-border-subtle" />
    </div>
  );
}

// Loading Skeleton
interface SmartMoneySkeletonProps {
  t: (key: string) => string;
}

function SmartMoneySkeleton({ t }: SmartMoneySkeletonProps) {
  return (
    <Card padding="sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-2">{t("title")}</h3>
      </div>
      <div className="animate-pulse space-y-2">
        <div className="h-14 bg-surface-2 rounded" />
        <div className="h-14 bg-surface-2 rounded" />
      </div>
    </Card>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function SmartMoneyCard({ className }: SmartMoneyCardProps) {
  // State for trend modal
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);

  // Prefetch trend data on mount for faster modal opening
  useEffect(() => {
    // Prefetch default 30-day trend data in background
    fetch('/api/smart-money/trend?period=30', {
      cache: 'force-cache', // Use cache if available
    }).catch(() => {
      // Silently fail - prefetch is optional
    });
  }, []);

  // Use consolidated market intelligence hook
  const { data: smartMoneyData, isLoading, error } = useSmartMoney();
  const t = useTranslations("dashboard.smartMoney");

  // Runtime translation for strength and risk signals from API
  const translateStrength = (strength: string): string => {
    if (!strength) return t("neutral");

    const normalizedStrength = strength.trim();
    const strengthMap: Record<string, string> = {
      "Strong Buy": t("strongBuy"),
      "Buy": t("buy"),
      "Strong Sell": t("strongSell"),
      "Sell": t("sell"),
      "Neutral": t("neutral"),
    };

    // Try exact match first
    if (strengthMap[normalizedStrength]) {
      return strengthMap[normalizedStrength];
    }

    // Try case-insensitive match
    const lowerKey = normalizedStrength.toLowerCase();
    for (const [key, value] of Object.entries(strengthMap)) {
      if (key.toLowerCase() === lowerKey) {
        return value;
      }
    }

    return strength;
  };

  const translateRiskSignal = (riskSignal: string): string => {
    const riskMap: Record<string, string> = {
      "Risk-On": t("riskOn"),
      "Risk-On Mild": t("riskOnMild"),
      "Risk-Off": t("riskOff"),
      "Risk-Off Mild": t("riskOffMild"),
    };
    return riskMap[riskSignal] || riskSignal;
  };

  // Runtime translation for observations from API
  const translateObservation = (observation: string): string => {
    // Observations may come as "Text: value" or just "Text"
    // Find the colon and split there
    const colonIndex = observation.indexOf(':');

    if (colonIndex === -1) {
      // No colon, try to translate the whole text
      const observationMap: Record<string, string> = {
        "Foreign investors aggressive buying": t("foreignInvestorsAggressiveBuying"),
        "Institution buying": t("institutionBuying"),
        "Retail selling": t("retailSelling"),
        "Prop selling": t("propSelling"),
      };
      return observationMap[observation.trim()] || observation;
    }

    // Split into text and value parts
    const textPart = observation.substring(0, colonIndex).trim();
    const valuePart = observation.substring(colonIndex); // Keep ": value" as is

    const observationMap: Record<string, string> = {
      "Foreign investors aggressive buying": t("foreignInvestorsAggressiveBuying"),
      "Institution buying": t("institutionBuying"),
      "Retail selling": t("retailSelling"),
      "Prop selling": t("propSelling"),
    };

    const translatedText = observationMap[textPart] || textPart;
    return translatedText + valuePart;
  };

  // Translate primary driver - handle special case for "none"
  const translatePrimaryDriver = (driver: string | undefined): string => {
    if (!driver) return t("none");
    if (driver.toLowerCase() === "none") return t("none");
    return driver;
  };

  if (isLoading) {
    return <SmartMoneySkeleton t={t} />;
  }

  if (error || !smartMoneyData) {
    return (
      <Card padding="sm" className={className}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-2">{t("title")}</h3>
          </div>
        </div>
        <p className="text-text-muted text-xs">
          {t("unableToLoad")}
        </p>
      </Card>
    );
  }

  // Get combined signal badge color
  const getSignalColor = (): "buy" | "sell" | "neutral" | "watch" => {
    switch (smartMoneyData.combinedSignal) {
      case "Strong Buy":
      case "Buy":
        return "buy";
      case "Strong Sell":
      case "Sell":
        return "sell";
      default:
        return "neutral";
    }
  };

  // Get risk signal badge color
  const getRiskColor = (): "buy" | "sell" | "neutral" | "watch" => {
    switch (smartMoneyData.riskSignal) {
      case "Risk-On":
      case "Risk-On Mild":
        return "buy";
      case "Risk-Off":
      case "Risk-Off Mild":
        return "sell";
      default:
        return "neutral";
    }
  };

  return (
    <Card padding="sm" className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-2">{t("title")}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge size="sm" color={getSignalColor()}>
            {translateStrength(smartMoneyData.combinedSignal)}
          </Badge>
          <Badge size="sm" color={getRiskColor()}>
            {translateRiskSignal(smartMoneyData.riskSignal)}
          </Badge>
          <button
            onClick={() => setIsTrendModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-surface-3 transition-colors group"
            aria-label="View Trend"
          >
            <LineChart className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center mb-2 mt-1">
        {/* Score Gauge */}
        <div className="item-center flex flex-col items-center text-center">
          <ScoreGauge score={smartMoneyData.score} size={56} />
          <span className="text-[9px] uppercase tracking-wide text-text-muted">
            {t("score")}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-3">


        {/* Investor Flows - Access from investors property */}
        <div className="flex-1 space-y-2">
          {/* Primary (Smart Money) - 100% opacity */}
          <InvestorRow
            label={t("foreign")}
            icon={<Globe className="w-4 h-4" />}
            data={smartMoneyData.investors.foreign}
            translatedStrength={translateStrength(smartMoneyData.investors.foreign.strength ?? "Neutral")}
            t={t}
            opacity={1}
          />
          <InvestorRow
            label={t("institution")}
            icon={<Building2 className="w-4 h-4" />}
            data={smartMoneyData.investors.institution}
            translatedStrength={translateStrength(smartMoneyData.investors.institution.strength ?? "Neutral")}
            t={t}
            opacity={1}
          />

          {/* Separator */}
          <InvestorSeparator t={t} />

          {/* Secondary (Context) - 60% opacity */}
          <InvestorRow
            label={t("retail")}
            icon={<Users className="w-4 h-4" />}
            data={smartMoneyData.investors.retail}
            translatedStrength={translateStrength(smartMoneyData.investors.retail.strength ?? "Neutral")}
            t={t}
            opacity={0.6}
          />
          <InvestorRow
            label={t("prop")}
            icon={<Briefcase className="w-4 h-4" />}
            data={smartMoneyData.investors.prop}
            translatedStrength={translateStrength(smartMoneyData.investors.prop.strength ?? "Neutral")}
            t={t}
            opacity={0.6}
          />
        </div>
      </div>

      {/* Primary Driver & Observations */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-text-muted uppercase tracking-wide">
            {t("primaryDriver")}
          </span>
          <span className="text-xs font-medium text-text">
            {translatePrimaryDriver(smartMoneyData.primaryDriver)}
          </span>
        </div>

        {/* Confidence Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-text-muted uppercase tracking-wide">
              {t("confidence")}
            </span>
            <span className="text-xs text-text-muted">
              {smartMoneyData.confidence}%
            </span>
          </div>
          <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-info rounded-full animate-width-grow"
              style={{
                width: `${smartMoneyData.confidence}%`,
                '--bar-width': `${smartMoneyData.confidence}%`,
              } as React.CSSProperties}
            />
          </div>
        </div>

        {smartMoneyData.observations &&
          smartMoneyData.observations.length > 0 && (
            <p className="mt-2 text-xs text-text-muted leading-relaxed">
              {translateObservation(smartMoneyData.observations[0])}
            </p>
          )}
      </div>

      {/* Trend Modal */}
      <SmartMoneyTrendModal
        isOpen={isTrendModalOpen}
        onClose={() => setIsTrendModalOpen(false)}
        initialPeriod={10}
      />
    </Card>
  );
}

export default SmartMoneyCard;
