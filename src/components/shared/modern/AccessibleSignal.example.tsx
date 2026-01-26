/**
 * AccessibleSignal Usage Examples
 *
 * This file demonstrates how to use the AccessibleSignal component
 * in various scenarios throughout the fonPick application.
 */

'use client'

import { AccessibleSignal } from './AccessibleSignal'

/**
 * Example 1: Basic usage with all signal types
 */
export function BasicSignalExample() {
  return (
    <div className="flex gap-4">
      <AccessibleSignal type="up" label="Change" value="+2.5%" />
      <AccessibleSignal type="down" label="Change" value="-1.2%" />
      <AccessibleSignal type="neutral" label="Price" value="125.50" />
    </div>
  )
}

/**
 * Example 2: Different sizes
 */
export function SizeExample() {
  return (
    <div className="flex items-center gap-4">
      <AccessibleSignal type="up" value="+5.2%" size="sm" />
      <AccessibleSignal type="up" value="+5.2%" size="md" />
      <AccessibleSignal type="up" value="+5.2%" size="lg" />
    </div>
  )
}

/**
 * Example 3: With animations
 */
export function AnimatedExample() {
  return (
    <div className="flex gap-4">
      <AccessibleSignal type="up" label="Gain" value="124.50" animated />
      <AccessibleSignal type="down" label="Loss" value="98.20" animated />
    </div>
  )
}

/**
 * Example 4: Icon only (minimal mode)
 */
export function IconOnlyExample() {
  return (
    <div className="flex gap-4">
      <AccessibleSignal type="up" showIcon showPattern={false} size="sm" />
      <AccessibleSignal type="down" showIcon showPattern={false} size="sm" />
      <AccessibleSignal type="neutral" showIcon showPattern={false} size="sm" />
    </div>
  )
}

/**
 * Example 5: Value only (compact display)
 */
export function ValueOnlyExample() {
  return (
    <div className="flex gap-4">
      <AccessibleSignal type="up" value="2.5%" showIcon={false} />
      <AccessibleSignal type="down" value="-1.2%" showIcon={false} />
      <AccessibleSignal type="neutral" value="0.0%" showIcon={false} />
    </div>
  )
}

/**
 * Example 6: Stock price display with signals
 */
export function StockPriceExample() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg bg-surface">
        <div>
          <div className="font-semibold text-lg">AAPL</div>
          <div className="text-sm text-text-secondary">Apple Inc.</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xl">$178.50</div>
          <AccessibleSignal type="up" value="+2.5%" size="sm" />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-surface">
        <div>
          <div className="font-semibold text-lg">TSLA</div>
          <div className="text-sm text-text-secondary">Tesla Inc.</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xl">$242.30</div>
          <AccessibleSignal type="down" value="-1.8%" size="sm" />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-surface">
        <div>
          <div className="font-semibold text-lg">MSFT</div>
          <div className="text-sm text-text-secondary">Microsoft Corp.</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xl">$378.90</div>
          <AccessibleSignal type="neutral" value="0.0%" size="sm" />
        </div>
      </div>
    </div>
  )
}

/**
 * Example 7: Market metrics display
 */
export function MarketMetricsExample() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 rounded-lg bg-surface">
        <div className="text-sm text-text-secondary mb-2">SET Index</div>
        <div className="font-mono text-xl mb-1">1,345.20</div>
        <AccessibleSignal type="up" value="+0.8%" animated />
      </div>

      <div className="p-4 rounded-lg bg-surface">
        <div className="text-sm text-text-secondary mb-2">Volume</div>
        <div className="font-mono text-xl mb-1">85.2B</div>
        <AccessibleSignal type="down" value="-12%" animated />
      </div>

      <div className="p-4 rounded-lg bg-surface">
        <div className="text-sm text-text-secondary mb-2">Turnover</div>
        <div className="font-mono text-xl mb-1">2.1B</div>
        <AccessibleSignal type="neutral" value="+0%" />
      </div>
    </div>
  )
}

/**
 * Example 8: Custom styling with className
 */
export function CustomStyledExample() {
  return (
    <div className="flex gap-4">
      <AccessibleSignal
        type="up"
        label="Custom"
        value="+5%"
        className="shadow-lg hover:shadow-xl transition-shadow"
      />
      <AccessibleSignal
        type="down"
        label="Styled"
        value="-3%"
        className="border-2"
      />
    </div>
  )
}

/**
 * Example 9: Color-blind friendly with patterns
 * The patterns help distinguish signals when color alone isn't sufficient
 */
export function ColorBlindFriendlyExample() {
  return (
    <div className="space-y-4">
      <div className="text-sm text-text-secondary">
        These signals use both color AND texture patterns for accessibility
      </div>
      <div className="flex gap-4">
        <AccessibleSignal
          type="up"
          label="Buy"
          value="Strong"
          showPattern
          showIcon
        />
        <AccessibleSignal
          type="down"
          label="Sell"
          value="Weak"
          showPattern
          showIcon
        />
        <AccessibleSignal
          type="neutral"
          label="Hold"
          value="Flat"
          showPattern
          showIcon
        />
      </div>
    </div>
  )
}
