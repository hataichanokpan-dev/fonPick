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
        "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
        "min-w-[80px] flex flex-col items-center gap-1",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
        isSelected
          ? "bg-accent-blue/10 text-accent-blue"
          : "bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary"
      )}
      aria-pressed={isSelected}
      aria-label={`Select ${config.english} metric`}
    >
      {/* Thai Label */}
      <span className="text-base font-semibold">{config.thai}</span>

      {/* English Label */}
      <span className="text-[10px] uppercase tracking-wide opacity-70">
        {config.english}
      </span>

      {/* Active Indicator */}
      {isSelected && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent-blue" />
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
      className={cn("flex gap-2 overflow-x-auto no-scrollbar", className)}
      role="tablist"
      aria-label="Valuation metrics"
    >
      {metrics.map((metric) => (
        <MetricTab
          key={metric}
          metric={metric}
          isSelected={selected === metric}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

/**
 * Default export
 */
export default MetricSelector;
