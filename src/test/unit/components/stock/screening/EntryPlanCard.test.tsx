/**
 * TDD Test: EntryPlanCard Component (Redesigned)
 *
 * Tests for the redesigned EntryPlanCard component with:
 * - PriceRangeVisualizer component
 * - Glass sub-cards for price levels
 * - Visual price range with zones
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EntryPlanCard, calculateEntryPlan } from '@/components/stock/screening/EntryPlanCard'
import type { EntryPlanCardProps } from '@/components/stock/screening/types'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowDownRight: () => <div data-testid="arrow-icon">ArrowDownRight</div>,
  Target: () => <div data-testid="target-icon">Target</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Wallet: () => <div data-testid="wallet-icon">Wallet</div>,
}))

describe('EntryPlanCard - Redesigned', () => {
  const defaultProps: EntryPlanCardProps = {
    entryPlan: {
      buyAt: {
        price: 34.00,
        discountFromCurrent: 0.042,
        rationale: 'Buy near support level with margin of safety',
      },
      stopLoss: {
        price: 30.00,
        percentageFromBuy: 0.118,
        rationale: 'Stop below support level',
      },
      target: {
        price: 42.00,
        percentageFromBuy: 0.235,
        rationale: 'Based on fair value estimate',
      },
      positionSize: {
        percentage: 0.08,
        rationale: 'Based on entry discount and risk profile',
      },
      riskReward: {
        ratio: '1:2.0',
        calculation: 'Risk 4.00 / Reward 8.00',
      },
      timeHorizon: '3-6 เดือน',
    },
    currentPrice: 35.50,
    locale: 'en',
  }

  describe('Rendering', () => {
    it('should render the title', () => {
      render(<EntryPlanCard {...defaultProps} />)
      expect(screen.getByText('ENTRY PLAN')).toBeInTheDocument()
    })

    it('should render Thai title for locale th', () => {
      render(<EntryPlanCard {...defaultProps} locale="th" />)
      expect(screen.getByText('แผนการเข้าซื้อ')).toBeInTheDocument()
    })

    it('should render all three price level cards', () => {
      render(<EntryPlanCard {...defaultProps} />)

      // Buy at - price is formatted with currency symbol and appears multiple times
      expect(screen.getAllByText((content) => content.includes('34.00')).length).toBeGreaterThan(0)

      // Stop loss
      expect(screen.getAllByText((content) => content.includes('30.00')).length).toBeGreaterThan(0)

      // Target
      expect(screen.getAllByText((content) => content.includes('42.00')).length).toBeGreaterThan(0)
    })
  })

  describe('Glass Sub-Cards', () => {
    it('should render price level cards with proper styling', () => {
      const { container } = render(<EntryPlanCard {...defaultProps} />)
      const cards = container.querySelectorAll('.glass, .glass-premium, .rounded-lg')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should render buy at card with glass effect', () => {
      const { container } = render(<EntryPlanCard {...defaultProps} />)
      const buyCard = container.querySelector('[class*="up"]')
      expect(buyCard).toBeInTheDocument()
    })

    it('should render stop loss card with risk color', () => {
      const { container } = render(<EntryPlanCard {...defaultProps} />)
      const stopCard = container.querySelector('[class*="risk"], [class*="down"]')
      expect(stopCard).toBeInTheDocument()
    })
  })

  describe('Price Range Visualizer', () => {
    it('should render PriceRangeVisualizer component', () => {
      const { container } = render(<EntryPlanCard {...defaultProps} />)
      // Visualizer is now h-16 instead of h-12
      const visualizer = container.querySelector('[class*="h-16"]')
      expect(visualizer).toBeInTheDocument()
    })

    it('should show visual representation of all price levels', () => {
      const { container } = render(<EntryPlanCard {...defaultProps} />)

      // Current price marker - prices are formatted with currency symbol
      expect(screen.getAllByText((content) => content.includes('35.50')).length).toBeGreaterThan(0)

      // Buy price marker
      expect(screen.getAllByText((content) => content.includes('34.00')).length).toBeGreaterThan(0)

      // Stop loss marker
      expect(screen.getAllByText((content) => content.includes('30.00')).length).toBeGreaterThan(0)

      // Target marker
      expect(screen.getAllByText((content) => content.includes('42.00')).length).toBeGreaterThan(0)
    })

    it('should display price zones with correct colors', () => {
      const { container } = render(<EntryPlanCard {...defaultProps} />)

      // Buy zone should be green
      const buyZone = container.querySelector('[class*="up-primary"], [class*="up"]')
      expect(buyZone).toBeInTheDocument()

      // Stop zone should be red
      const stopZone = container.querySelector('[class*="risk"], [class*="down"]')
      expect(stopZone).toBeInTheDocument()

      // Target zone should be teal/accent
      const targetZone = container.querySelector('[class*="accent-teal"], [class*="teal"]')
      expect(targetZone).toBeInTheDocument()
    })
  })

  describe('Price Level Calculations', () => {
    it('should calculate buy discount correctly', () => {
      render(<EntryPlanCard {...defaultProps} />)
      // Buy at 34.00 from 35.50 = 4.2% discount
      const discountText = screen.getByText((content) => content.includes('4.2%') || content.includes('4.2'))
      expect(discountText).toBeInTheDocument()
    })

    it('should calculate stop loss percentage from buy', () => {
      render(<EntryPlanCard {...defaultProps} />)
      // Stop at 30.00 from 34.00 = 11.8%
      const stopText = screen.getByText((content) => content.includes('11.8%') || content.includes('11.8'))
      expect(stopText).toBeInTheDocument()
    })

    it('should calculate target percentage from buy', () => {
      render(<EntryPlanCard {...defaultProps} />)
      // Target at 42.00 from 34.00 = 23.5%
      const targetText = screen.getByText((content) => content.includes('23.5%') || content.includes('23.5'))
      expect(targetText).toBeInTheDocument()
    })
  })

  describe('Position Size and Risk/Reward', () => {
    it('should render position size card', () => {
      render(<EntryPlanCard {...defaultProps} />)
      expect(screen.getByText('POSITION SIZE')).toBeInTheDocument()
      // Position size is displayed as "8" with separate "%of portfolio" text
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    it('should render risk/reward card', () => {
      render(<EntryPlanCard {...defaultProps} />)
      expect(screen.getByText('RISK / REWARD')).toBeInTheDocument()
      expect(screen.getByText('1:2.0')).toBeInTheDocument()
    })

    it('should show portfolio percentage for position size', () => {
      render(<EntryPlanCard {...defaultProps} locale="en" />)
      expect(screen.getByText((content) => content.includes('of portfolio'))).toBeInTheDocument()
    })

    it('should show Thai portfolio percentage', () => {
      render(<EntryPlanCard {...defaultProps} locale="th" />)
      expect(screen.getByText((content) => content.includes('ของพอร์ต'))).toBeInTheDocument()
    })
  })

  describe('Time Horizon', () => {
    it('should render time horizon when provided', () => {
      render(<EntryPlanCard {...defaultProps} />)
      expect(screen.getByText('3-6 เดือน')).toBeInTheDocument()
    })

    it('should render time horizon label', () => {
      render(<EntryPlanCard {...defaultProps} locale="en" />)
      // The label and value might be in separate spans
      expect(screen.getByText((content) => content.includes('Time'))).toBeInTheDocument()
    })

    it('should render Thai time horizon label', () => {
      render(<EntryPlanCard {...defaultProps} locale="th" />)
      expect(screen.getByText((content) => content.includes('ระยะเวลา'))).toBeInTheDocument()
    })
  })

  describe('Internationalization', () => {
    it('should display English labels for locale en', () => {
      render(<EntryPlanCard {...defaultProps} locale="en" />)
      expect(screen.getByText('BUY AT')).toBeInTheDocument()
      expect(screen.getByText('STOP LOSS')).toBeInTheDocument()
      expect(screen.getByText('TARGET')).toBeInTheDocument()
    })

    it('should display Thai labels for locale th', () => {
      render(<EntryPlanCard {...defaultProps} locale="th" />)
      expect(screen.getByText('ซื้อที่')).toBeInTheDocument()
      expect(screen.getByText('ตัดขาดทอน')).toBeInTheDocument()
      expect(screen.getByText('เป้าหมาย')).toBeInTheDocument()
    })
  })

  describe('Rationale Display', () => {
    it('should display buy rationale', () => {
      render(<EntryPlanCard {...defaultProps} />)
      expect(screen.getByText('Buy near support level with margin of safety')).toBeInTheDocument()
    })

    it('should display stop loss rationale', () => {
      render(<EntryPlanCard {...defaultProps} />)
      expect(screen.getByText('Stop below support level')).toBeInTheDocument()
    })

    it('should display target rationale', () => {
      render(<EntryPlanCard {...defaultProps} />)
      expect(screen.getByText('Based on fair value estimate')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const { container } = render(<EntryPlanCard {...defaultProps} />)
      const heading = container.querySelector('h3')
      expect(heading).toBeInTheDocument()
    })

    it('should use tabular nums for price values', () => {
      const { container } = render(<EntryPlanCard {...defaultProps} />)
      const tabularElements = container.querySelectorAll('.tabular-nums')
      expect(tabularElements.length).toBeGreaterThan(0)
    })
  })
})

describe('calculateEntryPlan', () => {
  describe('Calculation Logic', () => {
    it('should calculate buy at price with margin', () => {
      const result = calculateEntryPlan(35.50, 32.00, 42.00, 'BUY')
      expect(result.buyAt.price).toBeLessThan(35.50)
      expect(result.buyAt.price).toBeGreaterThan(32.00)
    })

    it('should calculate stop loss below buy price', () => {
      const result = calculateEntryPlan(35.50, 32.00, 42.00, 'BUY')
      expect(result.stopLoss.price).toBeLessThan(result.buyAt.price)
    })

    it('should calculate target above buy price', () => {
      const result = calculateEntryPlan(35.50, 32.00, 42.00, 'BUY')
      expect(result.target.price).toBeGreaterThan(result.buyAt.price)
    })

    it('should calculate risk/reward ratio correctly', () => {
      const result = calculateEntryPlan(35.50, 32.00, 42.00, 'BUY')
      const [risk, reward] = result.riskReward.ratio.split(':').map(Number)
      expect(reward).toBeGreaterThan(risk)
    })

    it('should calculate position size based on decision', () => {
      const buyResult = calculateEntryPlan(35.50, 32.00, 42.00, 'BUY')
      const holdResult = calculateEntryPlan(35.50, 32.00, 42.00, 'HOLD')
      const passResult = calculateEntryPlan(35.50, 32.00, 42.00, 'PASS')

      expect(buyResult.positionSize.percentage).toBeGreaterThan(0)
      expect(holdResult.positionSize.percentage).toBeGreaterThan(0)
      expect(passResult.positionSize.percentage).toBe(0)
    })

    it('should increase position size for higher discount', () => {
      const lowDiscount = calculateEntryPlan(35.50, 34.00, 42.00, 'BUY')
      const highDiscount = calculateEntryPlan(35.50, 30.00, 42.00, 'BUY')

      expect(highDiscount.positionSize.percentage).toBeGreaterThanOrEqual(
        lowDiscount.positionSize.percentage
      )
    })
  })

  describe('Edge Cases', () => {
    it('should throw error for invalid prices (zero or negative)', () => {
      expect(() => calculateEntryPlan(0, 32.00, 42.00, 'BUY')).toThrow()
      expect(() => calculateEntryPlan(35.50, 0, 42.00, 'BUY')).toThrow()
      expect(() => calculateEntryPlan(35.50, 32.00, 0, 'BUY')).toThrow()
    })

    it('should handle very small current price', () => {
      const result = calculateEntryPlan(1.00, 0.90, 1.20, 'BUY')
      expect(result.buyAt.price).toBeGreaterThan(0)
      expect(result.stopLoss.price).toBeGreaterThan(0)
    })

    it('should handle very large prices', () => {
      const result = calculateEntryPlan(1000.00, 900.00, 1200.00, 'BUY')
      expect(result.buyAt.price).toBeLessThan(1000.00)
      expect(result.target.price).toBeGreaterThan(1000.00)
    })

    it('should set zero position size for PASS decision', () => {
      const result = calculateEntryPlan(35.50, 32.00, 42.00, 'PASS')
      expect(result.positionSize.percentage).toBe(0)
      expect(result.positionSize.rationale).toBe('Not recommended')
    })
  })

  describe('Validation', () => {
    it('should include rationale for each price level', () => {
      const result = calculateEntryPlan(35.50, 32.00, 42.00, 'BUY')
      expect(result.buyAt.rationale).toBeTruthy()
      expect(result.stopLoss.rationale).toBeTruthy()
      expect(result.target.rationale).toBeTruthy()
    })

    it('should include calculation detail in risk/reward', () => {
      const result = calculateEntryPlan(35.50, 32.00, 42.00, 'BUY')
      expect(result.riskReward.calculation).toContain('Risk')
      expect(result.riskReward.calculation).toContain('Reward')
    })

    it('should include time horizon', () => {
      const result = calculateEntryPlan(35.50, 32.00, 42.00, 'BUY')
      expect(result.timeHorizon).toBeTruthy()
    })
  })
})
