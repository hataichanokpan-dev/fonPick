/**
 * MarketStatusBanner Component
 *
 * Sticky top banner showing live SET index and market status.
 * Simple, clean design matching the concept images.
 *
 * Features:
 * - SET index display with change percentage
 * - Market status indicator (open/closed with pulse animation)
 * - Data age display (e.g., "2m ago")
 * - Sticky positioning with backdrop blur
 * - Animated price display with flash effect
 * - i18n support for Thai/English
 */

"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AnimatedPrice } from "@/components/shared/modern/AnimatedPrice";
import { useMarketIntelligenceContext } from "@/contexts/MarketIntelligenceContext";
import { safeToFixed } from "@/lib/utils";

// ==================================================================
// TYPES
// ==================================================================

export interface MarketStatusBannerProps {
  /** SET index value (optional - will fetch from Context if not provided) */
  setIndex?: number;
  /** SET index change (optional - will fetch from Context if not provided) */
  setChange?: number;
  /** SET index percentage change (optional - will fetch from Context if not provided) */
  setChangePercent?: number;
  /** Whether market is currently open */
  isMarketOpen?: boolean;
  /** Last update timestamp */
  lastUpdate?: number;
}

// ==================================================================
// CONSTANTS
// ==================================================================

const COLORS = {
  Neutral: {
    bg: "rgba(17, 24, 39, 0.85)",
    border: "rgba(148, 163, 184, 0.2)",
    text: "#94A3B8",
  },
} as const;

// ==================================================================
// SUB-COMPONENTS
// ==================================================================

interface SetIndexDisplayProps {
  value: number;
  change: number;
  changePercent: number;
  label: string;
}

function SetIndexDisplay({ value, change, label }: SetIndexDisplayProps) {
  return (
    <div className="flex items-baseline gap-2 sm:gap-3">
      {/* Main SET Index Label */}
      <span className="text-sm font-semibold text-text-secondary xs:text-base">
        {label}
      </span>

      {/* Main SET Index Value with AnimatedPrice */}
      <AnimatedPrice
        value={value}
        previousValue={value - change}
        prefix=""
        suffix=""
        size="sm"
        showChange={true}
        showIcon={true}
        decimals={2}
        className="text-lg font-bold tabular-nums sm:text-xl"
      />

      {/* Change percent with AnimatedPrice 
        value={changePercent}
        previousValue={0}
        prefix="("
        suffix=")"
        size="sm"
        showChange={true}
        showIcon={true}
        decimals={2}
      />*/}
    </div>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function MarketStatusBanner({
  setIndex: propsSetIndex,
  setChange: propsSetChange,
  setChangePercent: propsSetChangePercent,
}: MarketStatusBannerProps) {
  const t = useTranslations("dashboard");

  // Get data from Context (now includes marketOverview)
  const contextData = useMarketIntelligenceContext();
  // Use props if provided, otherwise use Context data
  // Safe: Handle NaN from API responses
  const setIndex = Number.isNaN(
    propsSetIndex ?? contextData.data?.marketOverview?.setIndex ?? 0
  )
    ? 0
    : (propsSetIndex ?? contextData.data?.marketOverview?.setIndex ?? 0);
  const setChange = Number.isNaN(
    propsSetChange ?? contextData.data?.marketOverview?.setChange ?? 0
  )
    ? 0
    : (propsSetChange ?? contextData.data?.marketOverview?.setChange ?? 0);
  const setChangePercent = Number.isNaN(
    propsSetChangePercent ??
      contextData.data?.marketOverview?.setChangePercent ??
      0
  )
    ? 0
    : (propsSetChangePercent ??
        contextData.data?.marketOverview?.setChangePercent ??
        0);

  const colors = useMemo(() => COLORS["Neutral"], []);

  return (
    <div
      role="banner"
      aria-label={`${t("marketStatus.title")}: ${safeToFixed(setIndex)}`}
      className="sticky top-0 z-50 w-full backdrop-blur-lg
      border-b h-14 sm:h-16 rounded-lg mb-3
      shadow-sm animate-fade-in-up"
      style={{
        backgroundColor: setChangePercent > 0 ? "#4ade8026" : "#ff6b6b26",
        borderBottomColor: setChangePercent > 0 ? "#00a33c26" : "#ff000026",
        borderColor: colors.border,
      }}
    >
      <div className="h-full px-4 py-2 sm:px-5 sm:py-2.5">
        <div
          className="flex items-center justify-between 
        gap-3 sm:gap-4 h-full"
        >
          {/* Left: SET Index Display */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <SetIndexDisplay
              value={setIndex}
              change={setChange}
              changePercent={setChangePercent}
              label={t("marketStatus.title")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketStatusBanner;
