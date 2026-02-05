/**
 * Metric Selector Component
 *
 * Tabs/buttons สำหรับเลือก metric (PE, PBV, ROE)
 *
 * Features:
 * - Bilingual labels (Thai/English)
 * - Active indicator
 * - Smooth transitions
 * - Accessible (keyboard navigation, ARIA)
 */

"use client";

import { cn } from "@/lib/utils";
import type { MetricType } from "@/types/valuation";
import { METRIC_CONFIGS } from "@/types/valuation";

// ============================================================================
// TYPES
// ============================================================================

export interface MetricSelectorProps {
  /** Metric ที่เลือกอยู่ */
  selected: MetricType;
  /** Callback เมื่อเลือก metric */
  onSelect: (metric: MetricType) => void;
  /** CSS classes เพิ่มเติม */
  className?: string;
}

// ============================================================================
// METRIC TAB COMPONENT
// ============================================================================

interface MetricTabProps {
  metric: MetricType;
  isSelected: boolean;
  onSelect: (metric: MetricType) => void;
}

function MetricTab({ metric, isSelected, onSelect }: MetricTabProps) {
  const config = METRIC_CONFIGS[metric];

  return (
    <button
      type="button"
      onClick={() => onSelect(metric)}
      className={cn(
        "relative flex flex-col items-center gap-1",
        // Touch-friendly sizing: minimum 44px height
        "min-h-[44px] min-w-[72px] px-3 py-2.5 sm:min-w-[80px] sm:px-4 sm:py-3",
        // Responsive typography
        "text-sm sm:text-base",
        "font-medium",
        // Rounded corners
        "rounded-lg",
        // Smooth transitions
        "transition-all duration-200",
        // Focus states for accessibility
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2",
        // Active vs inactive states
        isSelected
          ? "bg-accent-blue/10 text-accent-blue shadow-sm"
          : "bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary active:scale-[0.98]"
      )}
      aria-pressed={isSelected}
      aria-label={`Select ${config.english} metric`}
    >
      {/* Thai Label - larger on mobile for readability */}
      <span className="font-semibold text-base sm:text-lg leading-tight">
        {config.thai}
      </span>

      {/* English Label - scales appropriately */}
      <span className="text-[10px] sm:text-[11px] uppercase tracking-wide opacity-70">
        {config.english}
      </span>

      {/* Active Indicator - subtle bottom border */}
      {isSelected && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-accent-blue sm:w-8" />
      )}
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MetricSelector({
  selected,
  onSelect,
  className,
}: MetricSelectorProps) {
  const metrics: MetricType[] = ["PE", "PBV", "ROE"];

  return (
    <div
      className={cn(
        "flex gap-2 sm:gap-3",
        // Horizontal scroll on mobile with hidden scrollbar
        "overflow-x-auto no-scrollbar",
        // Snap scrolling for better mobile experience
        "snap-x snap-mandatory",
        // Padding for scroll indication
        "-mx-1 px-1 sm:mx-0 sm:px-0",
        className
      )}
      role="tablist"
      aria-label="Valuation metrics"
    >
      {metrics.map((metric) => (
        <div key={metric} className="snap-start shrink-0">
          <MetricTab
            metric={metric}
            isSelected={selected === metric}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Default export
 */
export default MetricSelector;
