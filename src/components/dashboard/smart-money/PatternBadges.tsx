/**
 * PatternBadges Component
 *
 * Displays detected pattern badges from trend analysis.
 * Shows accumulation, distribution, divergence, FOMO, panic patterns.
 */

"use client";

import { memo } from "react";
import { Badge } from "@/components/shared/Badge";
import type { DetectedPattern } from "@/types/smart-money";

// ============================================================================
// TYPES
// ============================================================================

export interface PatternBadgesProps {
  patterns: DetectedPattern[];
}

// ============================================================================
// PATTERN CONFIG
// ============================================================================

const PATTERN_CONFIG: Record<
  DetectedPattern["type"],
  { color: "buy" | "sell" | "neutral" | "watch"; icon: string }
> = {
  Accumulation: { color: "buy", icon: "📈" },
  Distribution: { color: "sell", icon: "📉" },
  Divergence: { color: "watch", icon: "⚠️" },
  Reversal: { color: "watch", icon: "🔄" },
  FOMO: { color: "sell", icon: "😱" },
  Panic: { color: "sell", icon: "😨" },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PatternBadges = memo(function PatternBadges({ patterns }: PatternBadgesProps) {
  if (patterns.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-text-secondary">
        รูปแบบที่ตรวจพบ
      </h4>
      <div className="flex flex-wrap gap-2">
        {patterns.map((pattern, index) => {
          const config = PATTERN_CONFIG[pattern.type];

          return (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-surface-2 rounded-lg border border-border-subtle"
            >
              <span className="text-base">{config.icon}</span>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-text-primary">
                  {pattern.type}
                </span>
                <span className="text-[10px] text-text-muted">
                  {pattern.description}
                </span>
              </div>
              <Badge size="sm" color={config.color} className="ml-auto">
                {pattern.strength}%
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default PatternBadges;
