'use client'

/**
 * Catalyst Loading Component
 *
 * Displays a loading state with progress bar, ETA, and step checklist
 * for the slow Catalyst API (takes ~2 minutes)
 */

import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import type { CatalystLoadingProps } from '@/types/catalyst'

export function CatalystLoading({
  eta,
  progress = 0,
  currentStep = 'Connecting to AI service...',
}: CatalystLoadingProps) {
  // Format ETA into human-readable string
  function formatETA(seconds: number): string {
    if (seconds < 60) {
      return `~${seconds} วินาที`
    }
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `~${minutes} นาที ${secs} วินาที` : `~${minutes} นาที`
  }

  // Determine which steps are completed based on progress
  const steps = [
    { name: 'เชื่อมต่อกับ AI service', completed: progress > 10 },
    { name: 'ดึงข้อมูลหุ้น', completed: progress > 30 },
    { name: 'วิเคราะห์เหตุการณ์สำคัญ', completed: progress > 50 },
    { name: 'สร้าง investment thesis', completed: progress > 70 },
    { name: 'สรุปข้อมูล', completed: progress > 90 },
  ]

  return (
    <div className="catalyst-loading">
      {/* Progress bar */}
      <div className="w-full bg-surface-3 rounded-full h-2 mb-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-accent-purple to-insight h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* Status text */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-accent-purple" />
          <span className="text-sm text-text-primary font-medium">
            {currentStep}
          </span>
        </div>
        {eta !== undefined && (
          <span className="text-xs text-text-3">
            {formatETA(eta)}
          </span>
        )}
      </div>

      {/* Step checklist */}
      <div className="space-y-1.5">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {step.completed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-teal shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-text-3 shrink-0" />
            )}
            <span
              className={
                step.completed
                  ? 'text-text-2 line-through'
                  : 'text-text-3'
              }
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
