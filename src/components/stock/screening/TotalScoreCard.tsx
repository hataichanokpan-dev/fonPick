'use client'

/**
 * Total Score Card Component
 *
 * Displays total screening score (27 max) with investment decision.
 * Shows layer breakdown and confidence level.
 */

import { DECISION_THRESHOLDS, getScoreColorClasses } from "./constants";
import { DecisionBadge } from "./DecisionBadge";
import { LayerScoreBadge } from "./ScoreBadge";
import { toDisplayScore } from "./utils/display-transformer";
import type { TotalScoreCardProps, InvestmentDecision } from "./types";
import { Award } from "lucide-react";

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    totalScore: "TOTAL SCORE",
    layerBreakdown: "Layer Breakdown",
    universe: "Universe",
    quality: "Quality",
    valueGrowth: "Value + Growth",
    technical: "Technical + Catalyst",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
    rationale: "Key Reasons",
    passed: "Passed",
    failed: "Failed",
    of: "of",
  },
  th: {
    totalScore: "คะแนนรวม",
    layerBreakdown: "สรุปแต่ละชั้น",
    universe: "กรองพื้นฐาน",
    quality: "คุณภาพ",
    valueGrowth: "มูลค่าและการเติบโต",
    technical: "เทคนิคและเหตุการณ์",
    excellent: "ยอดเยี่ยม",
    good: "ดี",
    fair: "ปานกลาง",
    poor: "อ่อน",
    rationale: "เหตุผลสำคัญ",
    passed: "ผ่าน",
    failed: "ไม่ผ่าน",
    of: "จาก",
  },
} as const;

/**
 * Determine investment decision from total score
 */
export function determineDecision(totalScore: number): InvestmentDecision {
  if (totalScore >= DECISION_THRESHOLDS.BUY) return "BUY";
  if (totalScore >= DECISION_THRESHOLDS.HOLD) return "HOLD";
  return "PASS";
}

/**
 * Determine confidence level from score distribution
 */
export function determineConfidence(
  totalScore: number,
  layers: {
    universe: { score: number; passed: boolean };
    quality: { score: number };
    valueGrowth: { score: number };
    technical: { score: number };
  },
): { level: "High" | "Medium" | "Low"; percent: number } {
  let maxScore = 27;
  const basePercent = (totalScore / maxScore) * 100;

  // Adjust confidence based on layer balance
  const scores = [
    layers.quality.score,
    layers.valueGrowth.score,
    layers.technical.score,
  ];
  const minScore = Math.min(...scores);
  maxScore = Math.max(...scores);
  const spread = maxScore - minScore;

  // High spread (unbalanced) reduces confidence
  let confidencePercent = basePercent;
  if (spread > 5) {
    confidencePercent -= 10;
  } else if (spread > 3) {
    confidencePercent -= 5;
  }

  // Ensure universe passed for high confidence
  if (!layers.universe.passed) {
    confidencePercent -= 15;
  }

  confidencePercent = Math.max(0, Math.min(100, confidencePercent));

  let level: "High" | "Medium" | "Low" = "Low";
  if (confidencePercent >= 70) level = "High";
  else if (confidencePercent >= 50) level = "Medium";

  return { level, percent: Math.round(confidencePercent) };
}

export function TotalScoreCard({
  totalScore,
  maxScore = 27,
  decision,
  confidence = "Medium",
  confidencePercent = 50,
  layers,
  summary,
  rationale = [],
  locale = "th",
  className = "",
}: TotalScoreCardProps) {
  const t = LABELS[locale];

  const display = toDisplayScore(totalScore, maxScore, locale)
  const colors = getScoreColorClasses(totalScore)

  return (
    <div className={`total-score-card ${className}`}>
      <div className={`rounded-xl overflow-hidden border-2 ${display.color.border}`}>
        {/* Header with gradient background based on score */}
        <div
          className={`p-4 sm:p-6 ${
            totalScore >= 18
              ? "bg-gradient-to-br from-up-primary/20 to-up-soft"
              : totalScore >= 14
                ? "bg-gradient-to-br from-insight/20 to-insight/10"
                : "bg-gradient-to-br from-risk/20 to-risk/10"
          }`}
        >
          {/* Main Score Display - Centered on mobile, horizontal on desktop */}
          <div className="flex flex-col items-center mb-4">
            {/* Score, Percentage, and Grade in one compact row */}
            <div className="grid grid-cols-3  gap-4 items-center mb-2">
              {/* Large Score */}
              <div className="text-center">
                <div className={`text-4xl sm:text-5xl font-bold tabular-nums ${display.color.text}`}>
                  {totalScore}
                </div>
                <div className="text-xs text-text-3">/{maxScore}</div>
              </div>

              {/* Divider */}
              <div className={`hidden sm:block w-px h-12 ${display.color.border.replace('border-', 'bg-').replace('/20', '').replace('/10', '').replace(' dark:', ' dark:')}`} />

              {/* Percentage with label */}
              <div className="text-center">
                <div className={`text-3xl sm:text-4xl font-bold tabular-nums ${display.color.text}`}>
                  {display.percentage}%
                </div>
                <div className="text-xs text-text-3">{display.label}</div>
              </div>

              {/* Grade Badge */}
              <div className={`${display.color.bg} ${display.color.border} border-2 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5`}>
                <div className={`text-3xl sm:text-4xl font-bold ${display.color.text} text-center`}>
                  {display.letterGrade}
                </div>
              </div>
            </div>
          </div>

          {/* Decision Badge & Summary - Full width card style on mobile */}
          <div className={`${display.color.bg} rounded-lg p-3 sm:p-4 border ${display.color.border}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              {/* Decision Badge */}
              <DecisionBadge
                decision={decision}
                confidence={confidence}
                size="md"
              />

              {/* Summary text */}
              {summary && (
                <p className="text-sm text-text-secondary text-center sm:text-left line-clamp-2">
                  {summary}
                </p>
              )}
            </div>
          </div>

          {/* Confidence bar - Compact */}
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between text-xs text-text-3 mb-1.5">
              <span className="font-medium">{locale === "th" ? "ระดับความมั่นใจ" : "Confidence Level"}</span>
              <span className={`font-semibold ${display.color.text}`}>{confidencePercent}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-surface-3">
              <div
                className={`h-full ${colors.progress} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Layer breakdown */}
        <div className="p-3 sm:p-4 bg-surface dark:bg-surface-2/50">
          <div className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-2 sm:mb-3">
            {t.layerBreakdown}
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            {/* Universe */}
            <LayerScoreBadge
              layer={1}
              score={layers.universe.score}
              maxScore={2}
              title={t.universe}
              passed={layers.universe.passed}
            />

            {/* Quality */}
            <LayerScoreBadge
              layer={2}
              score={layers.quality.score}
              maxScore={10}
              title={t.quality}
            />

            {/* Value + Growth */}
            <LayerScoreBadge
              layer={3}
              score={layers.valueGrowth.score}
              maxScore={10}
              title={t.valueGrowth}
            />

            {/* Technical + Catalyst */}
            <LayerScoreBadge
              layer={4}
              score={layers.technical.score}
              maxScore={10}
              title={t.technical}
            />
          </div>
        </div>

        {/* Rationale (if provided) */}
        {rationale.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-border/50 bg-surface dark:bg-surface-2/30">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-insight" />
              <span className="text-xs font-semibold text-text-3 uppercase tracking-wider">
                {t.rationale}
              </span>
            </div>
            <ul className="space-y-1">
              {rationale.slice(0, 3).map((reason, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <span className="text-insight mt-0.5 flex-shrink-0">•</span>
                  <span className="leading-snug">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * CompactTotalScore - Mobile version
 */
interface CompactTotalScoreProps {
  totalScore: number;
  maxScore?: number;
  decision: InvestmentDecision;
  confidence?: "High" | "Medium" | "Low";
  className?: string;
}

export function CompactTotalScore({
  totalScore,
  maxScore = 27,
  decision,
  confidence = "Medium",
  className = "",
}: CompactTotalScoreProps) {
  const colors = getScoreColorClasses(totalScore);
  const display = toDisplayScore(totalScore, maxScore, 'th');

  return (
    <div className={`compact-total-score ${className}`}>
      <div className="rounded-lg bg-surface border border-border p-3">
        <div className="flex items-center gap-3">
          {/* Score + Grade */}
          <div className="flex items-center gap-2">
            {/* Score */}
            <div className={`text-2xl font-bold tabular-nums ${colors.text}`}>
              {totalScore}
            </div>
            {/* Grade badge */}
            <div className={`${display.color.bg} ${display.color.border} rounded-lg px-2 py-1`}>
              <span className={`text-lg font-bold ${display.color.text}`}>
                {display.letterGrade}
              </span>
            </div>
          </div>

          {/* Decision */}
          <div className="flex-1">
            <DecisionBadge decision={decision} size="sm" />
            {confidence && (
              <div className="text-xs text-text-3 mt-1">
                {confidence === "High"
                  ? "ความมั่นใจสูง"
                  : confidence === "Medium"
                    ? "ความมั่นใจปานกลาง"
                    : "ความมั่นใจต่ำ"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
