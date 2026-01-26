/**
 * InteractiveSparkline Component Examples
 *
 * This file demonstrates various usage patterns for the InteractiveSparkline component.
 */

import { InteractiveSparkline } from './InteractiveSparkline'

// ==================================================================
// EXAMPLE 1: Basic Usage with Up Trend
// ==================================================================

export function BasicUpTrendExample() {
  const data = [
    { value: 100, timestamp: 1234567890 },
    { value: 102, timestamp: 1234567891 },
    { value: 105, timestamp: 1234567892 },
    { value: 103, timestamp: 1234567893 },
    { value: 108, timestamp: 1234567894 },
    { value: 112, timestamp: 1234567895 },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 text-text-primary">Up Trend</h3>
      <InteractiveSparkline data={data} color="up" />
    </div>
  )
}

// ==================================================================
// EXAMPLE 2: Down Trend
// ==================================================================

export function DownTrendExample() {
  const data = [
    { value: 120, timestamp: 1234567890 },
    { value: 118, timestamp: 1234567891 },
    { value: 115, timestamp: 1234567892 },
    { value: 110, timestamp: 1234567893 },
    { value: 108, timestamp: 1234567894 },
    { value: 105, timestamp: 1234567895 },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 text-text-primary">Down Trend</h3>
      <InteractiveSparkline data={data} color="down" />
    </div>
  )
}

// ==================================================================
// EXAMPLE 3: Neutral/Sideways Movement
// ==================================================================

export function NeutralTrendExample() {
  const data = [
    { value: 100, timestamp: 1234567890 },
    { value: 102, timestamp: 1234567891 },
    { value: 99, timestamp: 1234567892 },
    { value: 101, timestamp: 1234567893 },
    { value: 100, timestamp: 1234567894 },
    { value: 102, timestamp: 1234567895 },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 text-text-primary">Neutral</h3>
      <InteractiveSparkline data={data} color="neutral" />
    </div>
  )
}

// ==================================================================
// EXAMPLE 4: Blue Color Variant with Custom Height
// ==================================================================

export function BlueCustomHeightExample() {
  const data = [
    { value: 1000, timestamp: 1234567890 },
    { value: 1050, timestamp: 1234567891 },
    { value: 1025, timestamp: 1234567892 },
    { value: 1080, timestamp: 1234567893 },
    { value: 1100, timestamp: 1234567894 },
    { value: 1075, timestamp: 1234567895 },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 text-text-primary">Blue (Custom Height: 80px)</h3>
      <InteractiveSparkline data={data} color="blue" height={80} />
    </div>
  )
}

// ==================================================================
// EXAMPLE 5: Purple Color Variant
// ==================================================================

export function PurpleExample() {
  const data = [
    { value: 50, timestamp: 1234567890 },
    { value: 55, timestamp: 1234567891 },
    { value: 53, timestamp: 1234567892 },
    { value: 58, timestamp: 1234567893 },
    { value: 62, timestamp: 1234567894 },
    { value: 60, timestamp: 1234567895 },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 text-text-primary">Purple</h3>
      <InteractiveSparkline data={data} color="purple" />
    </div>
  )
}

// ==================================================================
// EXAMPLE 6: Custom Value Formatter (Percentages)
// ==================================================================

export function PercentageFormatterExample() {
  const data = [
    { value: 0.5, timestamp: 1234567890 },
    { value: 1.2, timestamp: 1234567891 },
    { value: 0.8, timestamp: 1234567892 },
    { value: 1.5, timestamp: 1234567893 },
    { value: 2.0, timestamp: 1234567894 },
    { value: 1.8, timestamp: 1234567895 },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 text-text-primary">Percentage Formatter</h3>
      <InteractiveSparkline
        data={data}
        color="blue"
        valueFormatter={(value) => `${value.toFixed(2)}%`}
      />
    </div>
  )
}

// ==================================================================
// EXAMPLE 7: Custom Value Formatter (Currency)
// ==================================================================

export function CurrencyFormatterExample() {
  const data = [
    { value: 1250.5, timestamp: 1234567890 },
    { value: 1280.25, timestamp: 1234567891 },
    { value: 1275.0, timestamp: 1234567892 },
    { value: 1300.75, timestamp: 1234567893 },
    { value: 1325.5, timestamp: 1234567894 },
    { value: 1310.0, timestamp: 1234567895 },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 text-text-primary">Currency Formatter</h3>
      <InteractiveSparkline
        data={data}
        color="up"
        valueFormatter={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      />
    </div>
  )
}

// ==================================================================
// EXAMPLE 8: Without Tooltip
// ==================================================================

export function NoTooltipExample() {
  const data = [
    { value: 100, timestamp: 1234567890 },
    { value: 105, timestamp: 1234567891 },
    { value: 110, timestamp: 1234567892 },
    { value: 108, timestamp: 1234567893 },
    { value: 115, timestamp: 1234567894 },
    { value: 120, timestamp: 1234567895 },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 text-text-primary">Without Tooltip</h3>
      <InteractiveSparkline data={data} color="up" showTooltip={false} />
    </div>
  )
}

// ==================================================================
// EXAMPLE 9: Stock Price Sparkline (Realistic Data)
// ==================================================================

export function StockPriceExample() {
  // Simulated intraday stock prices
  const data = [
    { value: 152.50, timestamp: 1640000000000 },
    { value: 153.25, timestamp: 1640000300000 },
    { value: 152.75, timestamp: 1640000600000 },
    { value: 154.00, timestamp: 1640000900000 },
    { value: 155.50, timestamp: 1640001200000 },
    { value: 154.75, timestamp: 1640001500000 },
    { value: 156.25, timestamp: 1640001800000 },
    { value: 157.00, timestamp: 1640002100000 },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 text-text-primary">Stock Price</h3>
      <InteractiveSparkline
        data={data}
        color="up"
        valueFormatter={(value) => `$${value.toFixed(2)}`}
        ariaLabel="Stock price chart showing upward trend from $152.50 to $157.00"
      />
    </div>
  )
}

// ==================================================================
// EXAMPLE 10: Compact Grid of Multiple Sparklines
// ==================================================================

export function SparklineGridExample() {
  const stocks = [
    { symbol: 'AAPL', data: [150, 152, 151, 154, 156, 155], color: 'up' as const },
    { symbol: 'GOOGL', data: [2800, 2790, 2785, 2795, 2780, 2775], color: 'down' as const },
    { symbol: 'MSFT', data: [300, 302, 305, 304, 308, 310], color: 'up' as const },
    { symbol: 'TSLA', data: [850, 855, 852, 858, 860, 855], color: 'neutral' as const },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-text-primary">Stock Sparklines</h3>
      <div className="grid grid-cols-2 gap-4">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="p-3 bg-surface rounded-lg">
            <div className="text-sm font-medium text-text-secondary mb-2">{stock.symbol}</div>
            <InteractiveSparkline
              data={stock.data.map((value, index) => ({ value, timestamp: Date.now() + index * 1000 }))}
              color={stock.color}
              height={48}
              ariaLabel={`${stock.symbol} price sparkline`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================================================================
// COMPREHENSIVE SHOWCASE
// ==================================================================

export function InteractiveSparklineShowcase() {
  return (
    <div className="space-y-8">
      <BasicUpTrendExample />
      <DownTrendExample />
      <NeutralTrendExample />
      <BlueCustomHeightExample />
      <PurpleExample />
      <PercentageFormatterExample />
      <CurrencyFormatterExample />
      <NoTooltipExample />
      <StockPriceExample />
      <SparklineGridExample />
    </div>
  )
}
