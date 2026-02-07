/**
 * Quality Screen Card Component
 *
 * แสดงเกณฑ์การคัดเลือกหุ้น (Quality Screen) ตาม Sub-sector
 * อ้างอิงจากเอกสาร Thai Stock Screening Criteria
 */

'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { QualityScreenCriteria } from '@/types/quality-screen'
import { cn } from '@/lib/utils'

interface QualityScreenCardProps {
  subSector: string
  locale?: 'en' | 'th'
  className?: string
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
export function QualityScreenCard({ subSector, locale, className }: QualityScreenCardProps) {
  const { data, isLoading, error } = useQualityScreenCriteria(subSector)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  // const t = useTranslations('stock.qualityScreen') // TODO: Add translations
  const localeRaw = useLocale()
  const isThai = locale === 'th' || localeRaw === 'th'

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('rounded-xl bg-surface border border-border p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-surface-2 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-surface-2 rounded" />
            <div className="h-4 bg-surface-2 rounded w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className={cn('rounded-xl bg-surface border border-border p-6', className)}>
        <p className="text-text-2 text-sm">
          {error || isThai ? 'ไม่พบข้อมูลเกณฑ์การคัดเลือก' : 'Quality screen criteria not found'}
        </p>
      </div>
    )
  }

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  return (
    <div className={cn('rounded-xl bg-surface border border-border overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-teal/10 to-accent-blue/10 p-4 md:p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {isThai ? data.subSectorTh : data.subSector}
            </h3>
            <p className="text-sm text-text-2 mt-1">
              {isThai ? data.sectorTh : data.sector}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-4">
        {/* MUST PASS */}
        <div>
          <button
            onClick={() => toggleSection('mustPass')}
            className="w-full flex items-center justify-between text-left"
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
            <div className="mt-3 space-y-2">
              {data.mustPass.map((criterion, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-surface-2 border border-border"
                >
                  <CheckCircle2 className="w-4 h-4 text-accent-teal mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {isThai ? criterion.nameTh : criterion.name}
                    </p>
                    <p className="text-xs text-text-2 mt-0.5">{criterion.benchmark}</p>
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
            className="w-full flex items-center justify-between text-left"
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
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.bonusPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-lg bg-surface-2 border border-border"
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
              className="w-full flex items-center justify-between text-left"
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
              <div className="mt-3 space-y-2">
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

        {/* Examples */}
        {data.examples && data.examples.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-text-2 mb-2">
              {isThai ? 'ตัวอย่างหุ้นในกลุ่ม' : 'Examples'}:
            </p>
            <div className="flex flex-wrap gap-2">
              {data.examples.map((example, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-md bg-surface-2 text-accent-teal font-medium"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
