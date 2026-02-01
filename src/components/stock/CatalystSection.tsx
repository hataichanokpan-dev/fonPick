/**
 * CatalystSection Component
 *
 * Displays upcoming events and technical signals for stock analysis
 *
 * Sections:
 * - Upcoming Events (เหตุการณ์ที่กำลังจะเกิดขึ้น):
 *   Earnings announcements, Dividend ex-dates, Corporate actions, Analyst meetings
 *
 * - Technical Signals (สัญญาณเทคนิค):
 *   Moving average alignment, RSI status, MACD signal, Support/Resistance levels
 *
 * Features:
 * - Timeline visualization of events
 * - Color-coded by importance (high/medium/low)
 * - Event cards with details
 * - Countdown for upcoming events
 * - Collapsible sections
 * - Empty state when no events
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Calendar, TrendingUp, Activity, AlertCircle } from 'lucide-react'
import { cn, safeToFixed } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import type { StockStatisticsData } from '@/types/stock-api'

export interface CatalystEvent {
  id: string
  type: 'earnings' | 'dividend' | 'corporate' | 'analyst'
  title: string
  date: string
  importance: 'high' | 'medium' | 'low'
  description?: string
}

export interface TechnicalSignals {
  movingAverageAlignment: 'bullish' | 'bearish' | 'neutral'
  rsiStatus: 'overbought' | 'oversold' | 'neutral'
  macdSignal: 'buy' | 'sell' | 'neutral'
  supportLevel?: number
  resistanceLevel?: number
}

export interface CatalystSectionProps {
  /** Stock statistics data */
  data: StockStatisticsData
  /** List of upcoming events */
  events?: CatalystEvent[]
  /** Technical signals data */
  technicalSignals?: TechnicalSignals
  /** Additional CSS classes */
  className?: string
}

/**
 * Get event type icon
 */
function getEventIcon(type: CatalystEvent['type']) {
  switch (type) {
    case 'earnings':
      return <Calendar className="w-4 h-4" />
    case 'dividend':
      return <TrendingUp className="w-4 h-4" />
    case 'corporate':
      return <AlertCircle className="w-4 h-4" />
    case 'analyst':
      return <Activity className="w-4 h-4" />
    default:
      return <Calendar className="w-4 h-4" />
  }
}

/**
 * Get importance border color
 */
function getImportanceColor(importance: CatalystEvent['importance']): string {
  switch (importance) {
    case 'high':
      return 'border-red-500'
    case 'medium':
      return 'border-yellow-500'
    case 'low':
      return 'border-green-500'
    default:
      return 'border-border'
  }
}

/**
 * Get importance background color
 */
function getImportanceBgColor(importance: CatalystEvent['importance']): string {
  switch (importance) {
    case 'high':
      return 'bg-red-500/10'
    case 'medium':
      return 'bg-yellow-500/10'
    case 'low':
      return 'bg-green-500/10'
    default:
      return 'bg-surface-2'
  }
}

/**
 * Get signal color class
 */
function getSignalColor(signal: string): string {
  switch (signal.toLowerCase()) {
    case 'bullish':
    case 'buy':
    case 'overbought':
      return 'text-green-500'
    case 'bearish':
    case 'sell':
    case 'oversold':
      return 'text-red-500'
    case 'neutral':
      return 'text-gray-500'
    default:
      return 'text-text-primary'
  }
}

/**
 * CatalystSection Component
 *
 * @example
 * ```tsx
 * <CatalystSection data={stockStatisticsData} />
 *
 * <CatalystSection
 *   data={stockStatisticsData}
 *   events={catalystEvents}
 *   technicalSignals={signals}
 * />
 * ```
 */
export function CatalystSection({
  data: _data,
  events = [],
  technicalSignals,
  className,
}: CatalystSectionProps) {
  const [eventsCollapsed, setEventsCollapsed] = useState(false)
  const [signalsCollapsed, setSignalsCollapsed] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const hasEvents = events && events.length > 0
  const hasSignals = technicalSignals !== undefined

  // ==================================================================
  // RENDER
  // ==================================================================

  return (
    <div data-testid="catalyst-section" className={cn('space-y-4', className)}>
      {/* Upcoming Events Section */}
      {hasEvents && (
        <div
          data-testid="upcoming-events-section"
          className="w-full rounded-lg bg-surface border border-border/50 overflow-hidden fade-in-slide-up"
        >
          {/* Header */}
          <button
            data-testid="upcoming-events-header"
            type="button"
            className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setEventsCollapsed(!eventsCollapsed)}
            aria-expanded={!eventsCollapsed}
            aria-label="Toggle Upcoming Events section"
          >
            <div>
              <h3
                data-testid="upcoming-events-thai-label"
                className="text-lg font-semibold text-text-primary"
              >
                เหตุการณ์ที่กำลังจะเกิดขึ้น
              </h3>
              <p
                data-testid="upcoming-events-english-label"
                className="text-sm text-text-2"
              >
                Upcoming Events
              </p>
            </div>

            <motion.div
              animate={{ rotate: eventsCollapsed ? -90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-text-2"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </button>

          {/* Content */}
          <AnimatePresence>
            {!eventsCollapsed && (
              <motion.div
                data-testid="upcoming-events-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/50"
              >
                <div className="p-4 space-y-4">
                  {/* Timeline View */}
                  <div data-testid="catalyst-timeline" className="space-y-3">
                    {events.map((event, index) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        index={index}
                        isSelected={selectedEvent === event.id}
                        onClick={() =>
                          setSelectedEvent(selectedEvent === event.id ? null : event.id)
                        }
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Technical Signals Section */}
      {hasSignals && (
        <div
          data-testid="technical-signals-section"
          className="w-full rounded-lg bg-surface border border-border/50 overflow-hidden fade-in-slide-up delay-100"
        >
          {/* Header */}
          <button
            data-testid="technical-signals-header"
            type="button"
            className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setSignalsCollapsed(!signalsCollapsed)}
            aria-expanded={!signalsCollapsed}
            aria-label="Toggle Technical Signals section"
          >
            <div>
              <h3
                data-testid="technical-signals-thai-label"
                className="text-lg font-semibold text-text-primary"
              >
                สัญญาณเทคนิค
              </h3>
              <p
                data-testid="technical-signals-english-label"
                className="text-sm text-text-2"
              >
                Technical Signals
              </p>
            </div>

            <motion.div
              animate={{ rotate: signalsCollapsed ? -90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-text-2"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </button>

          {/* Content */}
          <AnimatePresence>
            {!signalsCollapsed && (
              <motion.div
                data-testid="technical-signals-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/50"
              >
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Moving Average Alignment */}
                    <SignalCard
                      label="Moving Average"
                      thaiLabel="เส้นค่าเฉลี่ยเคลื่อนที่"
                      value={technicalSignals.movingAverageAlignment}
                      testId="signal-moving-average"
                    />

                    {/* RSI Status */}
                    <SignalCard
                      label="RSI Status"
                      thaiLabel="ดัชนีกำลัง相对"
                      value={technicalSignals.rsiStatus}
                      testId="signal-rsi"
                    />

                    {/* MACD Signal */}
                    <SignalCard
                      label="MACD Signal"
                      thaiLabel="สัญญาณ MACD"
                      value={technicalSignals.macdSignal}
                      testId="signal-macd"
                    />

                    {/* Support Level */}
                    {technicalSignals.supportLevel && (
                      <div className="p-3 rounded-lg bg-surface-2 border border-border/30">
                        <div className="text-xs text-text-2 mb-1">Support Level</div>
                        <div
                          data-testid="signal-support"
                          className="text-lg font-semibold font-mono tabular-nums text-green-500"
                        >
                          {safeToFixed(technicalSignals.supportLevel)}
                        </div>
                      </div>
                    )}

                    {/* Resistance Level */}
                    {technicalSignals.resistanceLevel && (
                      <div className="p-3 rounded-lg bg-surface-2 border border-border/30">
                        <div className="text-xs text-text-2 mb-1">Resistance Level</div>
                        <div
                          data-testid="signal-resistance"
                          className="text-lg font-semibold font-mono tabular-nums text-red-500"
                        >
                          {safeToFixed(technicalSignals.resistanceLevel)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!hasEvents && !hasSignals && (
        <div
          data-testid="no-catalyst-data"
          className="w-full rounded-lg bg-surface border border-border/50 p-8 text-center fade-in"
        >
          <p className="text-text-2">No catalyst or signal data available</p>
        </div>
      )}
    </div>
  )
}

interface EventCardProps {
  event: CatalystEvent
  index: number
  isSelected: boolean
  onClick: () => void
}

function EventCard({ event, index, isSelected, onClick }: EventCardProps) {
  const eventDate = new Date(event.date)
  const timeUntilEvent = formatDistanceToNow(eventDate, { addSuffix: true })

  return (
    <motion.div
      data-testid={`timeline-item-${event.id}`}
      className={cn(
        'p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:bg-surface-2 fade-in-slide-up',
        getImportanceColor(event.importance),
        getImportanceBgColor(event.importance),
        `event-type-${event.type}`
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${event.title}`}
      aria-expanded={isSelected}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon */}
          <div
            data-testid={`event-${event.id}-icon`}
            className="mt-1 text-text-2 flex-shrink-0"
          >
            {getEventIcon(event.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4
              data-testid={`event-${event.id}-title`}
              className="font-semibold text-text-primary text-sm mb-1"
            >
              {event.title}
            </h4>
            <div
              data-testid={`event-${event.id}-date`}
              className="text-xs text-text-2 mb-1"
            >
              {format(eventDate, 'MMM dd, yyyy')}
            </div>
            <div
              data-testid={`event-${event.id}-countdown`}
              className="text-xs text-info font-medium"
            >
              {timeUntilEvent}
            </div>
          </div>
        </div>

        {/* Importance Badge */}
        <div
          className={cn(
            'text-xs font-semibold px-2 py-1 rounded',
            event.importance === 'high' && 'bg-red-500/20 text-red-500',
            event.importance === 'medium' && 'bg-yellow-500/20 text-yellow-500',
            event.importance === 'low' && 'bg-green-500/20 text-green-500'
          )}
        >
          {event.importance.toUpperCase()}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isSelected && event.description && (
          <motion.div
            data-testid={`event-${event.id}-details`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t border-border/30"
          >
            <p
              data-testid={`event-${event.id}-description`}
              className="text-sm text-text-2"
            >
              {event.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface SignalCardProps {
  label: string
  thaiLabel: string
  value: string
  testId: string
}

function SignalCard({ label, thaiLabel, value, testId }: SignalCardProps) {
  return (
    <div className="p-3 rounded-lg bg-surface-2 border border-border/30">
      <div className="text-xs text-text-2 mb-1">{thaiLabel}</div>
      <div
        data-testid={testId}
        className={cn(
          'text-lg font-semibold font-mono tabular-nums capitalize',
          getSignalColor(value)
        )}
      >
        {value}
      </div>
      <div className="text-xs text-text-2 mt-1">{label}</div>
    </div>
  )
}

/**
 * Default export for convenience
 */
export default CatalystSection
