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
        "flex bg-surface-2 rounded-lg p-1",
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
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
            selected === range
              ? "bg-surface-3 text-text-primary shadow-sm"
              : "text-text-tertiary hover:text-text-secondary hover:bg-surface-3/50"
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
