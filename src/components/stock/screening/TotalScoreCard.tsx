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
import { ScoreWithGrade } from "./GradeBadge";
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

  return (
    <div className={`total-score-card ${className}`}>
      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        {/* Header with gradient background based on score */}
        <div
          className={`p-6 bg-gradient-to-br ${
            totalScore >= 18
              ? "from-up-primary/20 to-up-soft"
              : totalScore >= 14
                ? "from-insight/20 to-insight/10"
                : "from-risk/20 to-risk/10"
          }`}
        >
          {/* Top row: Score, Percentage, Grade and Decision */}
          <div className="flex items-start justify-between gap-4">
            {/* Score + Percentage + Grade */}
            <div className="flex-1">
              <ScoreWithGrade
                score={totalScore}
                maxScore={maxScore}
                locale={locale}
              />
            </div>

            {/* Decision badge */}
            <div className="flex flex-col items-center justify-center">
              <DecisionBadge
                decision={decision}
                confidence={confidence}
                size="lg"
              />
              {summary && (
                <p className="text-sm text-text-secondary mt-3 text-center line-clamp-2 max-w-[200px]">
                  {summary}
                </p>
              )}
            </div>
          </div>

          {/* Confidence bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-text-3 mb-1">
              <span>{locale === "th" ? "ความมั่นใจ" : "Confidence"}</span>
              <span>{confidencePercent}%</span>
            </div>
            <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 rounded-full transition-all duration-1000"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Layer breakdown */}
        <div className="p-4 bg-surface-2/30">
          <div className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3">
            {t.layerBreakdown}
          </div>
          <div className="space-y-2">
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
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-insight" />
              <span className="text-xs font-semibold text-text-3 uppercase tracking-wider">
                {t.rationale}
              </span>
            </div>
            <ul className="space-y-1.5">
              {rationale.slice(0, 3).map((reason, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <span className="text-insight mt-0.5">•</span>
                  <span>{reason}</span>
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
