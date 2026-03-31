/**
 * Swing Trading Components Index
 *
 * Export ทุก components สำหรับ Swing Trading UI
 *
 * Components:
 * - SwingVerdictCard: แสดงสรุปผลการวิเคราะห์
 * - EntryPlanCard: แสดงแผนการเข้าซื้อ
 * - ExitPlanCard: แสดงแผนการออก
 * - PositionSizingCard: แสดงขนาดพอร์ตที่เหมาะสม
 * - HistoricalTrendChart: แสดงกราฟเทรนด์ย้อนหลัง
 * - ConfirmationPanel: แสดงการยืนยันสัญญาณ
 * - UrgencyBadge: แสดงความเร่งด่วน
 * - BacktestSummary: แสดงสรุปผล Backtest
 * - QuickActionsBottomSheet: แสดง Quick Actions
 */

// ==============================================================================
// EXISTING COMPONENTS
// ==============================================================================

export { SwingVerdictCard } from './SwingVerdictCard'
export { EntryPlanCard } from './EntryPlanCard'
export { ExitPlanCard } from './ExitPlanCard'
export { PositionSizingCard } from './PositionSizingCard'
export { HistoricalTrendChart } from './HistoricalTrendChart'

// ==============================================================================
// NEW COMPONENTS
// ==============================================================================

export { ConfirmationPanel } from './ConfirmationPanel'
export { UrgencyBadge, calculateUrgency } from './UrgencyBadge'
export type { UrgencyLevel } from './UrgencyBadge'

export { BacktestSummary } from './BacktestSummary'

export { QuickActionsBottomSheet, useQuickActions } from './QuickActionsBottomSheet'
export type { QuickAction } from './QuickActionsBottomSheet'

// ==============================================================================
// RE-EXPORT TYPES FOR CONVENIENCE
// ==============================================================================

export type {
  SwingVerdict,
  HistoricalTrendAnalysis,
  EntryPlan,
  ExitPlan,
  PositionSizing,
  SwingHorizon,
  SwingVerdictType,
  ConfirmationAnalysis,
} from '@/types/swing-trading'

export type {
  BacktestStatistics,
} from '@/types/risk-management'
