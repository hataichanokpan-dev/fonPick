/**
 * Quality Screen Dialog Component
 *
 * Dialog แสดงเกณฑ์การคัดเลือกหุ้น (Quality Screen) ตาม Sub-sector
 * อ้างอิงจากเอกสาร Thai Stock Screening Criteria
 *
 * Design improvements based on @ui-ux-designer and @investor feedback:
 * - Quick Summary Bar สำหรับดูข้อมูลสรุปทันที
 * - Visual Hierarchy ชัดเจน (MUST PASS > RED FLAGS > BONUS)
 * - Color coding แยกประเภทข้อมูล
 * - MUST PASS always expanded (2-column grid)
 * - BONUS POINTS chip style, collapsible
 * - RED FLAGS ด้านล่างสุด
 */

'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { X, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import type { QualityScreenCriteria } from '@/types/quality-screen'
import { cn } from '@/lib/utils'

interface QualityScreenDialogProps {
  subSector: string
  locale?: 'en' | 'th'
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Hook สำหรับดึงข้อมูล Quality Screen Criteria
 */
function useQualityScreenCriteria(subSector: string) {
  const [data, setData] = useState<QualityScreenCriteria | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCriteria() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/quality-screen/criteria?subSector=${encodeURIComponent(subSector)}`)
        const result = await response.json()

        if (result.success && result.criteria) {
          setData(result.criteria)
        } else {
          setError(result.error || 'Failed to load quality screen criteria')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    if (subSector) {
      fetchCriteria()
    }
  }, [subSector])

  return { data, isLoading, error }
}

/**
 * Quick Summary Bar - แสดงสรุปด้านบน
 */
function QuickSummaryBar({
  data,
  isThai
}: {
  data: QualityScreenCriteria
  isThai: boolean
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap p-4 bg-surface-2/50 border-y border-border/50">
      {/* P/E Range */}
      {data.peRange && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border/50">
          <span className="text-xs text-text-2 font-medium">P/E</span>
          <span className="text-sm font-semibold text-text-primary">{data.peRange}</span>
        </div>
      )}

      {/* ROE Range */}
      {data.roeRange && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border/50">
          <span className="text-xs text-text-2 font-medium">ROE</span>
          <span className="text-sm font-semibold text-text-primary">{data.roeRange}</span>
        </div>
      )}

      <div className="w-px h-6 bg-border/50" />

      {/* Must Pass Count - Primary */}
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-accent-teal" />
        <span className="text-xs text-text-2">
          {isThai ? 'ผ่าน' : 'Must Pass'}:{' '}
          <span className="text-accent-teal font-semibold">{data.mustPass.length}</span>
        </span>
      </div>

      {/* Bonus Points Count - Secondary */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-2">
          {isThai ? 'โบนัส' : 'Bonus'}:{' '}
          <span className="text-accent-blue font-semibold">{data.bonusPoints.length}</span>
        </span>
      </div>

      {/* Red Flags Count - Warning */}
      {data.redFlags.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-2">
            {isThai ? 'เตือน' : 'Flags'}:{' '}
            <span className="text-down-primary font-semibold">{data.redFlags.length}</span>
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * MUST PASS Section - Collapsible, prominent styling
 */
function MustPassSection({
  data,
  isThai,
  expanded,
  onToggle
}: {
  data: QualityScreenCriteria
  isThai: boolean
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-accent-teal/30 bg-accent-teal/5">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-teal/10 to-transparent pointer-events-none" />

      {/* Header */}
      <button
        onClick={onToggle}
        className="relative w-full flex items-center gap-3 p-4 border-b border-accent-teal/20 hover:bg-accent-teal/10 transition-colors"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-teal/20">
          <CheckCircle2 className="w-5 h-5 text-accent-teal" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-base font-semibold text-text-primary flex items-center gap-2">
            {isThai ? 'เกณฑ์ที่ต้องผ่าน' : 'MUST PASS'}
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-teal text-bg-primary font-semibold">
              {data.mustPass.length}
            </span>
          </h4>
          <p className="text-xs text-text-2 mt-0.5">
            {isThai ? 'หุ้นต้องผ่านทุกเกณฑ์นี้' : 'Stock must pass ALL criteria'}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-text-2" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-2" />
        )}
      </button>

      {/* Grid content - Collapsible */}
      {expanded && (
        <div className="relative p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.mustPass.map((criterion, idx) => (
          <div
            key={idx}
            className="group relative p-4 rounded-lg bg-surface border border-border/50 hover:border-accent-teal/50 transition-all hover:shadow-lg hover:shadow-accent-teal/5"
          >
            {/* Check icon indicator */}
            <div className="absolute top-4 right-4">
              <div className="w-5 h-5 rounded-full bg-accent-teal/10 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-accent-teal" />
              </div>
            </div>

            {/* Content */}
            <div className="pr-8">
              <p className="text-sm font-medium text-text-primary mb-2">
                {isThai ? criterion.nameTh : criterion.name}
              </p>
              <div className="inline-flex items-center px-2 py-1 rounded-md bg-accent-teal/10 border border-accent-teal/20">
                <span className="text-xs font-semibold text-accent-teal tabular-nums">
                  {criterion.benchmark}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

/**
 * BONUS POINTS Section - Collapsible, chip style
 */
function BonusPointsSection({
  data,
  isThai,
  expanded,
  onToggle
}: {
  data: QualityScreenCriteria
  isThai: boolean
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-accent-blue/5 transition-colors"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-blue/10">
          <Sparkles className="w-5 h-5 text-accent-blue" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-base font-semibold text-text-primary flex items-center gap-2">
            {isThai ? 'คะแนนโบนัส' : 'BONUS POINTS'}
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-blue/20 text-accent-blue font-semibold">
              {data.bonusPoints.length}
            </span>
          </h4>
          <p className="text-xs text-text-2 mt-0.5">
            {isThai ? 'ความได้เปรียบเพิ่มเติม' : 'Additional competitive advantages'}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-text-2" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-2" />
        )}
      </button>

      {/* Chips grid - Collapsible */}
      {expanded && (
        <div className="p-4 pt-0">
          <div className="flex flex-wrap gap-2">
            {data.bonusPoints.map((point, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border/50 hover:border-accent-blue/30 hover:bg-accent-blue/5 transition-all"
              >
                <span className="text-accent-blue text-sm">+</span>
                <span className="text-sm text-text-primary">
                  {isThai ? point.nameTh : point.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * RED FLAGS Section - Warning visual weight, always at bottom
 */
function RedFlagsSection({
  data,
  isThai,
  expanded,
  onToggle
}: {
  data: QualityScreenCriteria
  isThai: boolean
  expanded: boolean
  onToggle: () => void
}) {
  if (data.redFlags.length === 0) {
    return (
      <div className="rounded-xl border border-accent-teal/20 bg-accent-teal/5 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-accent-teal" />
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {isThai ? 'ไม่มีสัญญาณเตือน' : 'No Red Flags'}
            </p>
            <p className="text-xs text-text-2 mt-0.5">
              {isThai ? 'กลุ่มนี้มีความเสี่ยงดีจากเกณฑ์' : 'This group has good risk profile'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-down-primary/30 bg-gradient-to-br from-down-primary/10 to-down-primary/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-down-primary/10 transition-colors"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-down-primary/20">
          <AlertTriangle className="w-5 h-5 text-down-primary" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-base font-semibold text-text-primary flex items-center gap-2">
            {isThai ? 'สัญญาณเตือน' : 'RED FLAGS'}
            <span className="text-xs px-2 py-0.5 rounded-full bg-down-primary/20 text-down-primary font-semibold">
              {data.redFlags.length}
            </span>
          </h4>
          <p className="text-xs text-text-2 mt-0.5">
            {isThai ? 'สัญญาณเตือนควรระวัง' : 'Warning signs to avoid'}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-text-2" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-2" />
        )}
      </button>

      {/* List - Collapsible */}
      {expanded && (
        <div className="p-4 pt-0 space-y-2">
          {data.redFlags.map((flag, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-down-primary/10 border border-down-primary/20"
            >
              <XCircle className="w-4 h-4 text-down-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  {isThai ? flag.nameTh : flag.name}
                </p>
                {flag.description && (
                  <p className="text-xs text-text-2 mt-1">
                    {isThai ? flag.descriptionTh : flag.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Component หลัก
 */
export function QualityScreenDialog({ subSector, locale, open, onOpenChange }: QualityScreenDialogProps) {
  const { data, isLoading, error } = useQualityScreenCriteria(subSector)
  const [expandedSection, setExpandedSection] = useState<Record<string, boolean>>({
    mustPass: false, // Collapsible
    bonusPoints: false,
    redFlags: true, // Expand by default if has flags
  })
  const localeRaw = useLocale()
  const isThai = locale === 'th' || localeRaw === 'th'

  // Reset expanded sections when dialog opens
  useEffect(() => {
    if (open) {
      setExpandedSection({
        mustPass: true,
        bonusPoints: false,
        redFlags: data?.redFlags.length ? true : false,
      })
    }
  }, [open, data?.redFlags.length])

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Close dialog on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-50 animate-fade-in backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Dialog */}
      <div
        className={cn(
          'fixed left-0 right-0 top-0 bottom-0 z-50 flex items-center justify-center p-4',
          'transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none hidden'
        )}
      >
        <div
          className={cn(
            'bg-surface rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col',
            'animate-slide-up'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-accent-teal/10 via-accent-teal/5 to-accent-blue/10 p-4 md:p-6 border-b border-border flex items-start justify-between shrink-0">
            <div className="flex-1">
              <p className="text-xs text-text-2 font-medium uppercase tracking-wide mb-1">
                {isThai ? 'เกณฑ์การคัดเลือกหุ้น' : 'Quality Screen Criteria'}
              </p>
              {data && (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-accent-teal">
                    {isThai ? data.subSectorTh : data.subSector}
                  </h3>
                  <p className="text-sm text-text-2 mt-0.5">
                    {isThai ? data.sectorTh : data.sector}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="shrink-0 p-2 rounded-lg hover:bg-surface-2 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-text-2" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading state */}
            {isLoading && (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
                <p className="text-text-2 text-sm mt-4">
                  {isThai ? 'กำลังโหลดข้อมูล...' : 'Loading...'}
                </p>
              </div>
            )}

            {/* Error state */}
            {error && !data && (
              <div className="p-8 text-center">
                <p className="text-text-2 text-sm">
                  {error || (isThai ? 'ไม่พบข้อมูลเกณฑ์การคัดเลือก' : 'Quality screen criteria not found')}
                </p>
              </div>
            )}

            {/* Content */}
            {data && (
              <div className="p-4 md:p-6 space-y-4">
                {/* Quick Summary Bar */}
                <QuickSummaryBar data={data} isThai={isThai} />

                {/* Sections */}
                {/* MUST PASS - Collapsible, highest priority */}
                <MustPassSection
                  data={data}
                  isThai={isThai}
                  expanded={expandedSection.mustPass}
                  onToggle={() => toggleSection('mustPass')}
                />

                {/* BONUS POINTS - Collapsible, secondary priority */}
                <BonusPointsSection
                  data={data}
                  isThai={isThai}
                  expanded={expandedSection.bonusPoints}
                  onToggle={() => toggleSection('bonusPoints')}
                />

                {/* RED FLAGS - Always at bottom, warning priority */}
                <RedFlagsSection
                  data={data}
                  isThai={isThai}
                  expanded={expandedSection.redFlags}
                  onToggle={() => toggleSection('redFlags')}
                />

                {/* Examples */}
                {data.examples && data.examples.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-text-2 mb-3">
                      {isThai ? 'ตัวอย่างหุ้นในกลุ่ม' : 'Examples'}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.examples.map((example, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 rounded-md bg-surface-2 border border-border/50 text-accent-teal font-medium"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
