/**
 * PatternBadges Component
 *
 * Displays detected pattern badges from trend analysis.
 * Shows accumulation, distribution, divergence, FOMO, panic patterns.
 *
 * Now uses PatternCard for actionable investor insights.
 */

"use client";

import { memo } from "react";
import { PatternCard } from "./patterns/PatternCard";
import type { DetectedPattern } from "@/types/smart-money";

// ============================================================================
// TYPES
// ============================================================================

export interface PatternBadgesProps {
  patterns: DetectedPattern[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PatternBadges = memo(function PatternBadges({
  patterns,
}: PatternBadgesProps) {
  if (patterns.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-text-secondary">
        รูปแบบที่ตรวจพบ
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {patterns.map((pattern, index) => (
          <PatternCard key={index} pattern={pattern} />
        ))}
      </div>
    </div>
  );
});

export default PatternBadges;
