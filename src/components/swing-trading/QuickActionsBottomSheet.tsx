/**
 * Quick Actions Bottom Sheet Component
 *
 * แสดง Quick Actions สำหรับ Swing Trading:
 * - Add to Watchlist (เพิ่มใน Watchlist)
 * - Set Alert (ตั้งค่าเเจ้งเตือน)
 * - Calculate Position (คำนวณขนาดพอร์ต)
 * - Share Analysis (แชร์การวิเคราะห์)
 *
 * ใช้ CSS animations สำหรับ slide up/down effects
 * Mobile-first responsive design
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, Bell, Calculator, Share2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export type QuickAction = 'watchlist' | 'alert' | 'position' | 'share'

interface QuickActionsBottomSheetProps {
  /** สถานะเปิด/ปิด */
  isOpen: boolean
  /** ฟังก์ชันปิด */
  onClose: () => void
  /** Symbol หุ้น */
  symbol: string
  /** ภาษา */
  locale: 'en' | 'th'
  /** Callback เมื่อกด action */
  onAction?: (action: QuickAction) => void
}

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'Quick Actions',
    actions: {
      watchlist: 'Add to Watchlist',
      alert: 'Set Alert',
      position: 'Calculate Position',
      share: 'Share Analysis',
    },
    tooltips: {
      watchlist: 'Add this stock to your watchlist',
      alert: 'Set price alerts for entry/exit',
      position: 'Calculate optimal position size',
      share: 'Share this analysis',
    },
  },
  th: {
    title: 'ดำเนินการด่วน',
    actions: {
      watchlist: 'เพิ่มใน Watchlist',
      alert: 'ตั้งค่าแจ้งเตือน',
      position: 'คำนวณขนาดพอร์ต',
      share: 'แชร์การวิเคราะห์',
    },
    tooltips: {
      watchlist: 'เพิ่มหุ้นนี้ในรายการเฝ้าสังเกต',
      alert: 'ตั้งค่าแจ้งเตือนราคาเข้า/ออก',
      position: 'คำนวณขนาดพอร์ตที่เหมาะสม',
      share: 'แชร์ผลการวิเคราะห์',
    },
  },
} as const

// ============================================================================
// ACTION CONFIG
// ============================================================================

interface ActionConfig {
  icon: typeof Star | typeof Bell | typeof Calculator | typeof Share2
  label: string
  tooltip: string
  bgColor: string
  textColor: string
}

const ACTION_CONFIG: Record<QuickAction, ActionConfig> = {
  watchlist: {
    icon: Star,
    label: 'watchlist',
    tooltip: 'watchlist',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-500',
  },
  alert: {
    icon: Bell,
    label: 'alert',
    tooltip: 'alert',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-accent-blue',
  },
  position: {
    icon: Calculator,
    label: 'position',
    tooltip: 'position',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
  },
  share: {
    icon: Share2,
    label: 'share',
    tooltip: 'share',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-accent-purple',
  },
}

// ============================================================================
// ACTION BUTTON COMPONENT
// ============================================================================

interface ActionButtonProps {
  action: QuickAction
  onPress: (action: QuickAction) => void
  locale: 'en' | 'th'
}

function ActionButton({ action, onPress, locale }: ActionButtonProps) {
  const t = LABELS[locale]
  const config = ACTION_CONFIG[action]
  const Icon = config.icon

  return (
    <button
      onClick={() => onPress(action)}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200',
        'active:scale-95',
        config.bgColor,
        'hover:bg-opacity-20'
      )}
      aria-label={t.actions[action]}
    >
      <Icon className={cn('w-6 h-6', config.textColor)} />
      <span className="text-xs text-text-secondary text-center">
        {t.actions[action]}
      </span>
    </button>
  )
}

// ============================================================================
// BACKDROP COMPONENT
// ============================================================================

interface BackdropProps {
  isVisible: boolean
  onPress: () => void
}

function Backdrop({ isVisible, onPress }: BackdropProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={onPress}
      aria-hidden="true"
    />
  )
}

// ============================================================================
// COMPONENT
// ============================================================================

export function QuickActionsBottomSheet({
  isOpen,
  onClose,
  symbol,
  locale,
  onAction,
}: QuickActionsBottomSheetProps) {
  const t = LABELS[locale]
  const sheetRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // จัดการ animations
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // ปิดเมื่อกด ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // จัดการการกด action
  const handleAction = (action: QuickAction) => {
    onAction?.(action)
    onClose()
  }

  // ถ้าไม่ได้เปิดและไม่ได้ animate ให้ไม่ render
  if (!isOpen && !isAnimating) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <Backdrop isVisible={isOpen} onPress={onClose} />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-surface border border-border',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          // Safe area สำหรับ mobile
          'pb-safe-bottom'
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-surface-3 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {t.title}
            </h3>
            <p className="text-sm text-text-secondary">{symbol}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-surface-2 text-text-3 hover:bg-surface-3 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-3 px-6 pb-6">
          <ActionButton action="watchlist" onPress={handleAction} locale={locale} />
          <ActionButton action="alert" onPress={handleAction} locale={locale} />
          <ActionButton action="position" onPress={handleAction} locale={locale} />
          <ActionButton action="share" onPress={handleAction} locale={locale} />
        </div>
      </div>
    </>
  )
}

// ============================================================================
// HOOK: useQuickActions
// ============================================================================

/**
 * Hook สำหรับใช้งาน Quick Actions Bottom Sheet
 */
export function useQuickActions(symbol: string, locale: 'en' | 'th' = 'en') {
  const [isOpen, setIsOpen] = useState(false)
  const [lastAction, setLastAction] = useState<QuickAction | null>(null)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((prev) => !prev)

  const handleAction = (action: QuickAction) => {
    setLastAction(action)
    // สามารถเพิ่ม logic เพิ่มเติมที่นี่
    // เช่น tracking, logging, etc.
  }

  return {
    isOpen,
    open,
    close,
    toggle,
    lastAction,
    handleAction,
  }
}
