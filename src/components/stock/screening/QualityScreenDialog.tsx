/**
 * Quality Screen Dialog Component
 *
 * Dialog แสดงเกณฑ์การคัดเลือกหุ้น (Quality Screen) ตาม Sub-sector
 * อ้างอิงจากเอกสาร Thai Stock Screening Criteria
 */

'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { X, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
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
 * Component หลัก
 */
export function QualityScreenDialog({ subSector, locale, open, onOpenChange }: QualityScreenDialogProps) {
  const { data, isLoading, error } = useQualityScreenCriteria(subSector)
  const [expandedSection, setExpandedSection] = useState<string | null>('mustPass')
  const localeRaw = useLocale()
  const isThai = locale === 'th' || localeRaw === 'th'

  // Reset expanded section when dialog opens
  useEffect(() => {
    if (open) {
      setExpandedSection('mustPass')
    }
  }, [open])

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
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
            'bg-surface rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden',
            'animate-slide-up'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-accent-teal/10 to-accent-blue/10 p-4 md:p-6 border-b border-border flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text-primary">
                {isThai ? 'เกณฑ์การคัดเลือกหุ้น' : 'Quality Screen Criteria'}
              </h3>
              {data && (
                <>
                  <p className="text-xl font-semibold text-accent-teal mt-1">
                    {isThai ? data.subSectorTh : data.subSector}
                  </p>
                  <p className="text-sm text-text-2 mt-0.5">
                    {isThai ? data.sectorTh : data.sector}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="shrink-0 p-1 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <X className="w-5 h-5 text-text-2" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Loading state */}
            {isLoading && (
              <div className="space-y-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-6 bg-surface-2 rounded w-1/3" />
                  <div className="h-4 bg-surface-2 rounded" />
                  <div className="h-4 bg-surface-2 rounded w-5/6" />
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !data && (
              <div className="text-center py-8">
                <p className="text-text-2 text-sm">
                  {error || (isThai ? 'ไม่พบข้อมูลเกณฑ์การคัดเลือก' : 'Quality screen criteria not found')}
                </p>
              </div>
            )}

            {/* Content */}
            {data && (
              <div className="space-y-4">
                {/* P/E and ROE badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {data.peRange && (
                    <div className="text-xs px-2 py-1 rounded-full bg-surface-2 text-text-2">
                      P/E: {data.peRange}
                    </div>
                  )}
                  {data.roeRange && (
                    <div className="text-xs px-2 py-1 rounded-full bg-surface-2 text-text-2">
                      ROE: {data.roeRange}
                    </div>
                  )}
                </div>

                {/* MUST PASS */}
                <div>
                  <button
                    onClick={() => toggleSection('mustPass')}
                    className="w-full flex items-center justify-between text-left p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent-teal" />
                      <h4 className="font-semibold text-text-primary">
                        {isThai ? 'เกณฑ์ที่ต้องผ่าน' : 'MUST PASS'}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-teal/10 text-accent-teal">
                        {data.mustPass.length}
                      </span>
                    </div>
                    {expandedSection === 'mustPass' ? (
                      <ChevronUp className="w-4 h-4 text-text-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-2" />
                    )}
                  </button>

                  {expandedSection === 'mustPass' && (
                    <div className="mt-2 space-y-2">
                      {data.mustPass.map((criterion, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-border"
                        >
                          <CheckCircle2 className="w-4 h-4 text-accent-teal mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary">
                              {isThai ? criterion.nameTh : criterion.name}
                            </p>
                            <p className="text-xs text-accent-teal mt-0.5">{criterion.benchmark}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* BONUS POINTS */}
                <div>
                  <button
                    onClick={() => toggleSection('bonusPoints')}
                    className="w-full flex items-center justify-between text-left p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-accent-blue" />
                      <h4 className="font-semibold text-text-primary">
                        {isThai ? 'คะแนนโบนัส' : 'BONUS POINTS'}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue">
                        {data.bonusPoints.length}
                      </span>
                    </div>
                    {expandedSection === 'bonusPoints' ? (
                      <ChevronUp className="w-4 h-4 text-text-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-2" />
                    )}
                  </button>

                  {expandedSection === 'bonusPoints' && (
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {data.bonusPoints.map((point, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 rounded-lg bg-surface border border-border"
                        >
                          <span className="text-accent-blue text-sm mt-0.5 shrink-0">+</span>
                          <p className="text-sm text-text-2">
                            {isThai ? point.nameTh : point.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RED FLAGS */}
                {data.redFlags.length > 0 && (
                  <div>
                    <button
                      onClick={() => toggleSection('redFlags')}
                      className="w-full flex items-center justify-between text-left p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-down-primary" />
                        <h4 className="font-semibold text-text-primary">
                          {isThai ? 'สัญญาณเตือน' : 'RED FLAGS'}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-down-soft text-down-primary">
                          {data.redFlags.length}
                        </span>
                      </div>
                      {expandedSection === 'redFlags' ? (
                        <ChevronUp className="w-4 h-4 text-text-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-2" />
                      )}
                    </button>

                    {expandedSection === 'redFlags' && (
                      <div className="mt-2 space-y-2">
                        {data.redFlags.map((flag, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-lg bg-down-soft/20 border border-down-soft/30"
                          >
                            <XCircle className="w-4 h-4 text-down-primary mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary">
                                {isThai ? flag.nameTh : flag.name}
                              </p>
                              {flag.description && (
                                <p className="text-xs text-text-2 mt-0.5">
                                  {isThai ? flag.descriptionTh : flag.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
