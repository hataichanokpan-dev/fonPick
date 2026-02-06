/**
 * TrendPeriodSelector Component
 *
 * Time period selector for trend analysis.
 * Options: 5D, 10D, 1M, 3M, 6M, 1Y
 */

"use client";

import { TrendingUp } from "lucide-react";
import type { TrendPeriod } from "@/types/smart-money";

// ============================================================================
// TYPES
// ============================================================================

export interface TrendPeriodSelectorProps {
  /** Current selected period */
  period: TrendPeriod;

  /** Period change handler */
  onPeriodChange: (period: TrendPeriod) => void;
}

// ============================================================================
// PERIOD OPTIONS
// ============================================================================

const PERIOD_OPTIONS: Array<{ value: TrendPeriod; label: string }> = [
  { value: 5, label: "5D" },
  { value: 10, label: "10D" },
  { value: 30, label: "1M" },
  { value: 60, label: "3M" },
  { value: 90, label: "6M" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TrendPeriodSelector({
  period,
  onPeriodChange,
}: TrendPeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <TrendingUp className="w-4 h-4 text-text-muted flex-shrink-0" />
      <div className="flex gap-1.5">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onPeriodChange(option.value)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              flex-shrink-0 min-w-[60px] text-center
              ${
                period === option.value
                  ? "bg-[#2ED8A7]/20 text-[#2ED8A7] border border-[#2ED8A7]/30"
                  : "bg-transparent text-text-secondary border border-border-subtle hover:bg-surface-2"
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TrendPeriodSelector;
