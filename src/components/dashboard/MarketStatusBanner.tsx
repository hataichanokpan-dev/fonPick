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
 */

"use client";

import { Activity } from "lucide-react";
import { useMemo } from "react";
import { AnimatedPrice } from "@/components/shared/modern/AnimatedPrice";
import { useMarketIntelligenceContext } from "@/contexts/MarketIntelligenceContext";

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
// UTILITY FUNCTIONS
// ==================================================================

function formatTimestamp(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) return "N/A";

  const now = Date.now();
  const diff = now - timestamp;

  // Less than 1 minute
  if (diff < 60 * 1000) {
    return "Just now";
  }

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}m`;
  }

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h`;
  }

  // Days
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  return `${days}d`;
}

// ==================================================================
// SUB-COMPONENTS
// ==================================================================

interface MarketStatusIndicatorProps {
  isOpen: boolean;
}

function MarketStatusIndicator({ isOpen }: MarketStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-2 h-2 rounded-full ${isOpen ? 'animate-pulse-green' : ''}`}
        style={{
          backgroundColor: isOpen ? "#2ED8A7" : "#AEB7B3",
        }}
      />
    </div>
  );
}

interface SetIndexDisplayProps {
  value: number;
  change: number;
  changePercent: number;
}

function SetIndexDisplay({
  value,
  change,
  changePercent,
}: SetIndexDisplayProps) {
  return (
    <div className="flex items-baseline gap-2 sm:gap-3">
      {/* Main SET Index Label */}
      <span className="text-sm font-semibold text-text-secondary xs:text-base">
        SET
      </span>

      {/* Main SET Index Value with AnimatedPrice */}
      <AnimatedPrice
        value={value}
        previousValue={value - change}
        prefix=""
        suffix=""
        size="lg"
        showChange={false}
        showIcon={false}
        decimals={2}
        className="text-lg font-bold tabular-nums sm:text-xl"
      />

      {/* Change percent with AnimatedPrice */}
      <AnimatedPrice
        value={changePercent}
        previousValue={0}
        prefix="("
        suffix=")"
        size="sm"
        showChange={true}
        showIcon={true}
        decimals={2}
      />
    </div>
  );
}

interface DataFreshnessDisplayProps {
  timestamp?: number;
}

function DataFreshnessDisplay({ timestamp }: DataFreshnessDisplayProps) {
  if (!timestamp) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Activity className="w-3.5 h-3.5 text-text-muted" />
      <span className="text-[10px] text-text-muted xs:text-xs tabular-nums font-medium">
        {formatTimestamp(timestamp)}
      </span>
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
  isMarketOpen = true,
  lastUpdate: propsLastUpdate,
}: MarketStatusBannerProps) {
  // Try to use Context if props not provided (fallback for memory optimization)
  // Note: MarketIntelligenceContext doesn't include marketOverview,
  // so we rely on props being passed from parent component
  const contextData = useMarketIntelligenceContext();

  // Use props if provided, otherwise use defaults
  // In a full implementation, consider adding marketOverview to Context
  const setIndex = propsSetIndex ?? 0;
  const setChange = propsSetChange ?? 0;
  const setChangePercent = propsSetChangePercent ?? 0;
  const lastUpdate = propsLastUpdate ?? contextData.data?.timestamp;

  const colors = useMemo(() => COLORS["Neutral"], []);

  return (
    <div
      role="banner"
      aria-label={`SET Index: ${setIndex.toFixed(2)}`}
      className="sticky top-0 z-50 w-full backdrop-blur-lg border-b h-14 sm:h-16 rounded-lg mb-3 shadow-sm animate-fade-in-up"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="h-full px-4 py-2 sm:px-5 sm:py-2.5">
        <div className="flex items-center justify-between gap-3 sm:gap-4 h-full">
          {/* Left: SET Index Display */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <SetIndexDisplay
              value={setIndex}
              change={setChange}
              changePercent={setChangePercent}
            />
          </div>

          {/* Right: Market Status & Data Freshness */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            <MarketStatusIndicator isOpen={isMarketOpen} />
            <DataFreshnessDisplay timestamp={lastUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketStatusBanner;
