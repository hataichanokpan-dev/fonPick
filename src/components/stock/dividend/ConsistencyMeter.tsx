/**
 * Dividend Consistency Meter Component
 *
 * แสดง consistency score ของการจ่ายปันผล
 *
 * Features:
 * - Star rating (1-5 stars)
 * - Years of consecutive payments
 * - Growth streak
 * - Average growth rate
 */

"use client";

import { useLocale } from "next-intl";
import { Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DividendConsistency } from "@/types/dividend";

// ============================================================================
// TYPES
// ============================================================================

export interface ConsistencyMeterProps {
  /** Consistency analysis data */
  consistency: DividendConsistency;
  /** CSS classes เพิ่มเติม */
  className?: string;
}

// ============================================================================
// CONSISTENCY RATING CONFIG
// ============================================================================

const RATING_CONFIG = {
  dividend_king: {
    label: "Dividend King",
    thaiLabel: "หุ้นปันผลระดับกษัตริย์",
    color: "text-amber-400",
    description: "50+ ปีของการเพิ่มปันผล",
  },
  dividend_aristocrat: {
    label: "Dividend Aristocrat",
    thaiLabel: "หุ้นปันผลระดับสูง",
    color: "text-purple-400",
    description: "25+ ปีของการเพิ่มปันผล",
  },
  dividend_champion: {
    label: "Dividend Champion",
    thaiLabel: "หุ้นปันผลระดับแชมป์",
    color: "text-blue-400",
    description: "15-24 ปีของการเพิ่มปันผล",
  },
  consistent: {
    label: "Consistent",
    thaiLabel: "จ่ายสม่ำเสมอ",
    color: "text-green-400",
    description: "10+ ปีของการจ่ายปันผลสม่ำเสมอ",
  },
  growing: {
    label: "Growing",
    thaiLabel: "ปันผลเติบโต",
    color: "text-teal-400",
    description: "5+ ปีของการเพิ่มปันผล",
  },
  stable: {
    label: "Stable",
    thaiLabel: "มั่นคง่ำ",
    color: "text-blue-400",
    description: "3+ ปีของการจ่ายปันผล",
  },
  irregular: {
    label: "Irregular",
    thaiLabel: "ไม่สม่ำเสมอ",
    color: "text-gray-400",
    description: "จ่ายปันผลไม่สม่ำเสมอ",
  },
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ConsistencyMeter({
  consistency,
  className,
}: ConsistencyMeterProps) {
  const locale = useLocale() as "en" | "th";

  const config = RATING_CONFIG[consistency.rating];

  return (
    <div className={cn("bg-surface-2 rounded-lg p-4 border border-border-subtle/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-wide text-text-tertiary">
          {locale === "th" ? "ความสม่ำเสมอ" : "Consistency"}
        </p>
        {consistency.score >= 80 && (
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        )}
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-1.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-5 h-5",
              i < consistency.score / 20
                ? "fill-amber-400 text-amber-400"
                : "text-surface-3"
            )}
          />
        ))}
      </div>

      {/* Rating Label */}
      <div className={cn("text-sm font-semibold mb-1", config.color)}>
        {locale === "th" ? config.thaiLabel : config.label}
      </div>

      {/* Description */}
      <p className="text-xs text-text-2 mb-3">{config.description}</p>

      {/* Metrics */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-text-2">
            {locale === "th" ? "จ่ายต่อเนื่อง" : "Years Paid"}:
          </span>
          <span className="font-semibold text-text-primary tabular-nums">
            {consistency.yearsPaid} {locale === "th" ? "ปี" : "years"}
          </span>
        </div>

        {consistency.growthStreak > 0 && (
          <div className="flex justify-between">
            <span className="text-text-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-up-primary" />
              {locale === "th" ? "เพิ่มต่อเนื่อง" : "Growth Streak"}:
            </span>
            <span className="font-semibold text-up-primary tabular-nums">
              {consistency.growthStreak} {locale === "th" ? "ปี" : "years"}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-text-2">
            {locale === "th" ? "อัตราโตเฉลี่ย" : "Avg Growth"}:
          </span>
          <span className="font-semibold text-text-primary tabular-nums">
            {consistency.averageGrowth > 0 ? "+" : ""}
            {consistency.averageGrowth.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Default export
 */
export default ConsistencyMeter;
