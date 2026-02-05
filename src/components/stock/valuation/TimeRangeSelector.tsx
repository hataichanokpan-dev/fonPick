/**
 * Time Range Selector Component
 *
 * Buttons สำหรับเลือกช่วงเวลา (1Y, 3Y, 5Y, ALL)
 *
 * Features:
 * - Compact button group
 * - Active state styling
 * - Smooth transitions
 * - Accessible (keyboard navigation, ARIA)
 */

"use client";

import { cn } from "@/lib/utils";
import type { TimeRange } from "@/types/valuation";

// ============================================================================
// TYPES
// ============================================================================

export interface TimeRangeSelectorProps {
  /** Time range ที่เลือกอยู่ */
  selected: TimeRange;
  /** Callback เมื่อเลือก time range */
  onSelect: (range: TimeRange) => void;
  /** CSS classes เพิ่มเติม */
  className?: string;
}

// ============================================================================
// TIME RANGE OPTIONS
// ============================================================================

const TIME_RANGES: TimeRange[] = ["1Y", "3Y", "5Y", "ALL"];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TimeRangeSelector({
  selected,
  onSelect,
  className,
}: TimeRangeSelectorProps) {
  return (
    <div
      className={cn(
        "inline-flex bg-surface-2 rounded-lg p-1 sm:p-1",
        className
      )}
      role="group"
      aria-label="Time range selection"
    >
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onSelect(range)}
          className={cn(
            // Touch-friendly sizing
            "min-h-[36px] min-w-[44px] px-3 py-2 sm:px-4 sm:py-1.5 sm:min-w-0",
            // Responsive typography
            "text-xs sm:text-[11px]",
            "font-medium",
            "rounded-md",
            "transition-all duration-200",
            // Focus styles with offset for visibility
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-1",
            // Active vs inactive
            selected === range
              ? "bg-surface-3 text-text-primary shadow-sm ring-1 ring-inset ring-border-subtle"
              : "text-text-tertiary hover:text-text-secondary hover:bg-surface-3/50 active:scale-[0.96]"
          )}
          aria-pressed={selected === range}
          aria-label={`Show ${range} data`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}

/**
 * Default export
 */
export default TimeRangeSelector;
