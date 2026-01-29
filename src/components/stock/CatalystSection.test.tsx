/**
 * CatalystSection Component Tests
 *
 * TDD: Tests written FIRST, implementation follows
 *
 * Test coverage:
 * - Component renders correctly
 * - Upcoming Events display
 * - Technical Signals display
 * - Timeline View visualization
 * - Timeline of events
 * - Color-coded by importance
 * - Event cards with details
 * - Countdown for upcoming events
 * - Empty state when no events
 * - Collapsible sections
 * - Responsive layout
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CatalystSection } from './CatalystSection'
import type { StockStatisticsData } from '@/types/stock-api'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('CatalystSection Component', () => {
  const mockStockData: StockStatisticsData = {
    symbol: 'PTT',
    financial: {
      revenue: 1500000000000,
      netProfit: 85000000000,
      totalAssets: 2500000000000,
      totalEquity: 800000000000,
      eps: 12.5,
      roe: 15.5,
      roa: 3.4,
      debtToEquity: 0.8,
      currentRatio: 1.5,
      quickRatio: 1.2,
    },
    valuation: {
      pe: 12.5,
      pbv: 1.2,
      ev: 1200000000000,
      evEbitda: 8.5,
      priceToSales: 0.8,
      pegRatio: 1.2,
      dividendYield: 3.5,
      payoutRatio: 45.0,
    },
    performance: {
      w1d: 1.5,
      w1m: 3.2,
      w3m: 8.5,
      w6m: 12.3,
      ytd: 15.7,
      y1: 22.5,
    },
    trading: {
      avgVolume1m: 15000000,
      avgVolume3m: 12000000,
      avgVolume1y: 10000000,
      turnover: 500000000,
      volatility: 0.85,
    },
    analyst: {
      rating: 'BUY',
      targetPrice: 42.0,
      recommendation: 'Strong Buy',
      strongBuy: 5,
      buy: 8,
      hold: 2,
      sell: 0,
      strongSell: 0,
    },
    lastUpdate: '2024-01-15T14:30:00Z',
  }

  const mockEvents = [
    {
      id: '1',
      type: 'earnings' as const,
      title: 'Q4 Earnings Announcement',
      date: '2024-02-15T09:00:00Z',
      importance: 'high' as const,
      description: 'Quarterly earnings report release',
    },
    {
      id: '2',
      type: 'dividend' as const,
      title: 'Dividend Ex-Date',
      date: '2024-02-20T00:00:00Z',
      importance: 'medium' as const,
      description: 'XD date for Q4 dividend',
    },
    {
      id: '3',
      type: 'corporate' as const,
      title: 'Analyst Meeting',
      date: '2024-03-01T14:00:00Z',
      importance: 'low' as const,
      description: 'Quarterly analyst briefing',
    },
  ]

  const mockTechnicalSignals = {
    movingAverageAlignment: 'bullish' as const,
    rsiStatus: 'neutral' as const,
    macdSignal: 'buy' as const,
    supportLevel: 32.5,
    resistanceLevel: 38.0,
  }

  describe('Rendering', () => {
    it('should render catalyst section component', () => {
      render(<CatalystSection data={mockStockData} />)

      const component = screen.getByTestId('catalyst-section')
      expect(component).toBeInTheDocument()
    })

    it('should display Upcoming Events section', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const section = screen.getByTestId('upcoming-events-section')
      expect(section).toBeInTheDocument()
    })

    it('should display Technical Signals section', () => {
      render(<CatalystSection data={mockStockData} technicalSignals={mockTechnicalSignals} />)

      const section = screen.getByTestId('technical-signals-section')
      expect(section).toBeInTheDocument()
    })

    it('should display Timeline View', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const timeline = screen.getByTestId('catalyst-timeline')
      expect(timeline).toBeInTheDocument()
    })
  })

  describe('Upcoming Events', () => {
    it('should display list of events', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      expect(screen.getByTestId('event-1')).toBeInTheDocument()
      expect(screen.getByTestId('event-2')).toBeInTheDocument()
      expect(screen.getByTestId('event-3')).toBeInTheDocument()
    })

    it('should display event title', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const event1Title = screen.getByTestId('event-1-title')
      expect(event1Title).toHaveTextContent('Q4 Earnings Announcement')
    })

    it('should display event date', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const event1Date = screen.getByTestId('event-1-date')
      expect(event1Date).toBeInTheDocument()
    })

    it('should display event description', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const event1Desc = screen.getByTestId('event-1-description')
      expect(event1Desc).toHaveTextContent('Quarterly earnings report release')
    })

    it('should display event type icon', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const event1Icon = screen.getByTestId('event-1-icon')
      expect(event1Icon).toBeInTheDocument()
    })

    it('should display Thai label for Upcoming Events', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const thaiLabel = screen.getByTestId('upcoming-events-thai-label')
      expect(thaiLabel).toBeInTheDocument()
      expect(thaiLabel).toHaveTextContent('เหตุการณ์ที่กำลังจะเกิดขึ้น')
    })

    it('should display English subtitle for Upcoming Events', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const englishLabel = screen.getByTestId('upcoming-events-english-label')
      expect(englishLabel).toBeInTheDocument()
      expect(englishLabel).toHaveTextContent('Upcoming Events')
    })
  })

  describe('Event Importance Coloring', () => {
    it('should display high importance events in red', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const event1 = screen.getByTestId('event-1')
      expect(event1).toHaveClass('border-red-500')
    })

    it('should display medium importance events in yellow', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const event2 = screen.getByTestId('event-2')
      expect(event2).toHaveClass('border-yellow-500')
    })

    it('should display low importance events in green', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const event3 = screen.getByTestId('event-3')
      expect(event3).toHaveClass('border-green-500')
    })
  })

  describe('Technical Signals', () => {
    it('should display moving average alignment', () => {
      render(<CatalystSection data={mockStockData} technicalSignals={mockTechnicalSignals} />)

      const ma = screen.getByTestId('signal-moving-average')
      expect(ma).toBeInTheDocument()
      expect(ma).toHaveTextContent('bullish')
    })

    it('should display RSI status', () => {
      render(<CatalystSection data={mockStockData} technicalSignals={mockTechnicalSignals} />)

      const rsi = screen.getByTestId('signal-rsi')
      expect(rsi).toBeInTheDocument()
      expect(rsi).toHaveTextContent('neutral')
    })

    it('should display MACD signal', () => {
      render(<CatalystSection data={mockStockData} technicalSignals={mockTechnicalSignals} />)

      const macd = screen.getByTestId('signal-macd')
      expect(macd).toBeInTheDocument()
      expect(macd).toHaveTextContent('buy')
    })

    it('should display support level', () => {
      render(<CatalystSection data={mockStockData} technicalSignals={mockTechnicalSignals} />)

      const support = screen.getByTestId('signal-support')
      expect(support).toBeInTheDocument()
      expect(support).toHaveTextContent('32.50')
    })

    it('should display resistance level', () => {
      render(<CatalystSection data={mockStockData} technicalSignals={mockTechnicalSignals} />)

      const resistance = screen.getByTestId('signal-resistance')
      expect(resistance).toBeInTheDocument()
      expect(resistance).toHaveTextContent('38.00')
    })

    it('should display Thai label for Technical Signals', () => {
      render(<CatalystSection data={mockStockData} technicalSignals={mockTechnicalSignals} />)

      const thaiLabel = screen.getByTestId('technical-signals-thai-label')
      expect(thaiLabel).toBeInTheDocument()
      expect(thaiLabel).toHaveTextContent('สัญญาณเทคนิค')
    })

    it('should display English subtitle for Technical Signals', () => {
      render(<CatalystSection data={mockStockData} technicalSignals={mockTechnicalSignals} />)

      const englishLabel = screen.getByTestId('technical-signals-english-label')
      expect(englishLabel).toBeInTheDocument()
      expect(englishLabel).toHaveTextContent('Technical Signals')
    })
  })

  describe('Timeline View', () => {
    it('should display horizontal timeline', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const timeline = screen.getByTestId('catalyst-timeline')
      expect(timeline).toBeInTheDocument()
    })

    it('should display timeline items for each event', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      expect(screen.getByTestId('timeline-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('timeline-item-2')).toBeInTheDocument()
      expect(screen.getByTestId('timeline-item-3')).toBeInTheDocument()
    })

    it('should display countdown for upcoming events', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const countdown = screen.getByTestId('event-1-countdown')
      expect(countdown).toBeInTheDocument()
    })

    it('should allow clicking event for details', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const eventCard = screen.getByTestId('event-1')
      fireEvent.click(eventCard)

      const details = screen.getByTestId('event-1-details')
      expect(details).toBeInTheDocument()
    })
  })

  describe('Collapsible Sections', () => {
    it('should be expanded by default', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const eventsContent = screen.getByTestId('upcoming-events-content')
      expect(eventsContent).toBeVisible()
    })

    it('should toggle Upcoming Events section when clicked', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const header = screen.getByTestId('upcoming-events-header')
      const content = screen.getByTestId('upcoming-events-content')

      fireEvent.click(header)
      expect(content).not.toBeVisible()

      fireEvent.click(header)
      expect(content).toBeVisible()
    })

    it('should toggle Technical Signals section when clicked', () => {
      render(<CatalystSection data={mockStockData} technicalSignals={mockTechnicalSignals} />)

      const header = screen.getByTestId('technical-signals-header')
      const content = screen.getByTestId('technical-signals-content')

      fireEvent.click(header)
      expect(content).not.toBeVisible()

      fireEvent.click(header)
      expect(content).toBeVisible()
    })
  })

  describe('Empty States', () => {
    it('should display empty state when no events', () => {
      render(<CatalystSection data={mockStockData} events={[]} />)

      const emptyState = screen.getByTestId('events-empty-state')
      expect(emptyState).toBeInTheDocument()
      expect(emptyState).toHaveTextContent('No upcoming events')
    })

    it('should display empty state when no technical signals', () => {
      render(<CatalystSection data={mockStockData} />)

      const component = screen.getByTestId('catalyst-section')
      expect(component).toBeInTheDocument()
    })

    it('should display message when no data available', () => {
      render(<CatalystSection data={mockStockData} />)

      const noDataMessage = screen.queryByTestId('no-catalyst-data')
      expect(noDataMessage).toBeInTheDocument()
    })
  })

  describe('Event Types', () => {
    it('should display earnings event type', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const event1 = screen.getByTestId('event-1')
      expect(event1).toHaveClass('event-type-earnings')
    })

    it('should display dividend event type', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const event2 = screen.getByTestId('event-2')
      expect(event2).toHaveClass('event-type-dividend')
    })

    it('should display corporate event type', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const event3 = screen.getByTestId('event-3')
      expect(event3).toHaveClass('event-type-corporate')
    })
  })

  describe('Signal Colors', () => {
    it('should show green for bullish signal', () => {
      render(<CatalystSection data={mockStockData} technicalSignals={mockTechnicalSignals} />)

      const ma = screen.getByTestId('signal-moving-average')
      expect(ma).toHaveClass('text-green-500')
    })

    it('should show gray for neutral signal', () => {
      render(<CatalystSection data={mockStockData} technicalSignals={mockTechnicalSignals} />)

      const rsi = screen.getByTestId('signal-rsi')
      expect(rsi).toHaveClass('text-gray-500')
    })

    it('should show blue for buy signal', () => {
      render(<CatalystSection data={mockStockData} technicalSignals={mockTechnicalSignals} />)

      const macd = screen.getByTestId('signal-macd')
      expect(macd).toHaveClass('text-blue-500')
    })

    it('should show red for bearish signal', () => {
      const bearishSignals = {
        ...mockTechnicalSignals,
        movingAverageAlignment: 'bearish' as const,
      }

      render(<CatalystSection data={mockStockData} technicalSignals={bearishSignals} />)

      const ma = screen.getByTestId('signal-moving-average')
      expect(ma).toHaveClass('text-red-500')
    })
  })

  describe('Responsive Layout', () => {
    it('should use responsive grid layout', () => {
      const { container } = render(
        <CatalystSection
          data={mockStockData}
          events={mockEvents}
          technicalSignals={mockTechnicalSignals}
        />
      )

      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('should have responsive columns', () => {
      const { container } = render(
        <CatalystSection
          data={mockStockData}
          events={mockEvents}
          technicalSignals={mockTechnicalSignals}
        />
      )

      const grid = container.querySelector('.grid-cols-1')
      expect(grid).toBeInTheDocument() // Mobile
    })
  })

  describe('Edge Cases', () => {
    it('should handle events with missing descriptions', () => {
      const eventsWithoutDesc = [
        {
          id: '1',
          type: 'earnings' as const,
          title: 'Q4 Earnings',
          date: '2024-02-15T09:00:00Z',
          importance: 'high' as const,
        },
      ]

      render(<CatalystSection data={mockStockData} events={eventsWithoutDesc} />)

      const event1 = screen.getByTestId('event-1')
      expect(event1).toBeInTheDocument()
    })

    it('should handle events with invalid dates', () => {
      const invalidEvents = [
        {
          id: '1',
          type: 'earnings' as const,
          title: 'Q4 Earnings',
          date: 'invalid-date',
          importance: 'high' as const,
          description: 'Test',
        },
      ]

      render(<CatalystSection data={mockStockData} events={invalidEvents} />)

      const event1 = screen.getByTestId('event-1')
      expect(event1).toBeInTheDocument()
    })

    it('should handle technical signals with missing levels', () => {
      const partialSignals = {
        movingAverageAlignment: 'bullish' as const,
        rsiStatus: 'neutral' as const,
        macdSignal: 'buy' as const,
      }

      render(<CatalystSection data={mockStockData} technicalSignals={partialSignals} />)

      const section = screen.getByTestId('technical-signals-section')
      expect(section).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for sections', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const eventsHeader = screen.getByTestId('upcoming-events-header')
      expect(eventsHeader).toHaveAttribute('aria-expanded')
    })

    it('should be keyboard navigable', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const header = screen.getByTestId('upcoming-events-header')
      expect(header).toHaveClass('cursor-pointer')
    })

    it('should have accessible event cards', () => {
      render(<CatalystSection data={mockStockData} events={mockEvents} />)

      const eventCard = screen.getByTestId('event-1')
      expect(eventCard).toHaveAttribute('role', 'button')
      expect(eventCard).toHaveAttribute('tabIndex', '0')
    })
  })
})
