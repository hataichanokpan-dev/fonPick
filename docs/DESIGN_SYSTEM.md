# fonPick Design System

**Thai Stock Market Web Application - Design System Documentation**

Version: 1.0.0
Last Updated: 2026-01-23

---

## Table of Contents

1. [Overview](#overview)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Component Guidelines](#component-guidelines)
6. [Responsive Breakpoints](#responsive-breakpoints)
7. [Accessibility](#accessibility)
8. [Implementation Examples](#implementation-examples)

---

## Overview

The fonPick design system is a dark-themed, financial data visualization system optimized for Thai stock market data. It emphasizes readability, contrast, and clear visual hierarchy for presenting complex financial information.

### Design Principles

1. **Data-First**: Colors and typography optimized for numerical data readability
2. **High Contrast**: WCAG AA compliant color ratios for accessibility
3. **Clear Hierarchy**: Visual distinction between primary, secondary, and muted content
4. **Semantic Colors**: Meaningful color coding for financial concepts (buy/sell, up/down)
5. **Thai Language Support**: Optimized typography for Thai script readability

---

## Color Palette

### Base Colors (Background & Surface)

```yaml
base:
  background: "#0F172A"    # Main application background
  surface: "#111827"       # Card and component backgrounds
  surface_alt: "#1F2937"   # Alternate surface (hover states)
  border: "#273449"        # Border and divider colors
```

**Usage:**
- `base-background`: Use for page background and main containers
- `base-surface`: Use for cards, panels, and component backgrounds
- `base-surface-alt`: Use for hover states and alternate surfaces
- `base-border`: Use for borders, dividers, and separators

### Text Colors

```yaml
text:
  primary: "#E5E7EB"       # Primary text and headings
  secondary: "#9CA3AF"     # Secondary text and labels
  muted: "#6B7280"         # Muted text and placeholders
  inverse: "#020617"       # Text on colored backgrounds
```

**Usage:**
- `text-primary`: Use for main content, headings, and important data
- `text-secondary`: Use for labels, metadata, and supporting text
- `text-muted`: Use for placeholders, disabled states, and timestamps
- `text-inverse`: Use for text on colored backgrounds (badges, buttons)

### Signal Colors (Price Movement)

```yaml
signal:
  up_strong: "#22C55E"     # Strong positive movement
  up_soft: "#86EFAC"       # Soft positive/accent
  down_soft: "#FECACA"     # Soft negative/accent
  down_strong: "#EF4444"   # Strong negative movement
  neutral: "#94A3B8"       # Neutral/no change
```

**Usage:**
- `signal-up-strong`: Primary positive indicators, buy signals, upward trends
- `signal-up-soft`: Positive highlights, backgrounds, subtle accents
- `signal-down-soft`: Negative highlights, backgrounds, subtle accents
- `signal-down-strong`: Primary negative indicators, sell signals, downward trends
- `signal-neutral`: No change, neutral states, inactive elements

### Flow Colors (Buy/Sell Indicators)

```yaml
flow:
  buy: "#16A34A"           # Buy action/indicator
  sell: "#DC2626"          # Sell action/indicator
  neutral_bg: "#1F2937"    # Neutral background
  opacity: 0.7             # Default opacity for flow indicators
```

**Usage:**
- `flow-buy`: Buy buttons, buy indicators, positive actions
- `flow-sell`: Sell buttons, sell indicators, negative actions
- `flow-neutral-bg`: Neutral background states
- `flow-opacity`: Use with buy/sell colors for backgrounds

### Highlight Colors

```yaml
highlight:
  insight: "#F59E0B"       # Insights and recommendations
  warning: "#FB7185"       # Warnings and cautions
  info: "#60A5FA"          # Informational content
```

**Usage:**
- `highlight-insight`: Investment insights, analyst recommendations, featured content
- `highlight-warning`: Risk warnings, important notices, alerts
- `highlight-info`: Help text, tooltips, informational badges

### Color Combinations

#### DO's - Recommended Combinations

```tsx
// Positive price change
<div className="text-signal-up-strong">+2.5%</div>
<div className="bg-up-bg text-signal-up-soft px-2 py-1 rounded">▲ +2.5%</div>

// Negative price change
<div className="text-signal-down-strong">-1.2%</div>
<div className="bg-down-bg text-signal-down-soft px-2 py-1 rounded">▼ -1.2%</div>

// Buy/Sell buttons
<button className="bg-flow-buy text-text-inverse">Buy</button>
<button className="bg-flow-sell text-text-inverse">Sell</button>

// Info cards
<div className="bg-base-surface border border-base-border rounded-card">
  <h3 className="text-text-primary">Heading</h3>
  <p className="text-text-secondary">Description</p>
</div>
```

#### DON'Ts - Avoid These

```tsx
// ❌ Don't use text-primary on colored backgrounds
<div className="bg-flow-buy text-text-primary">Wrong</div>

// ❌ Don't mix signal colors with flow colors
<div className="text-signal-up-strong border-flow-sell">Confusing</div>

// ❌ Don't use bright colors for large backgrounds
<div className="bg-signal-up-strong p-8">Too intense</div>
```

---

## Typography

### Font Family

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

**Usage:**
- **Inter**: Primary font for UI elements, body text, and headings
- **JetBrains Mono**: Monospace font for numbers, prices, and tabular data

### Font Size Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| xxs | 10px | 12px | Tiny labels, indicators |
| xs | 12px | 16px | Captions, fine print |
| sm | 14px | 20px | Secondary text, labels |
| base | 16px | 24px | Body text, default |
| lg | 18px | 28px | Emphasized text |
| xl | 20px | 28px | Subheadings |
| 2xl | 24px | 32px | Section headings |
| 3xl | 30px | 36px | Page headings |
| 4xl | 36px | 40px | Hero headings |
| 5xl | 48px | 48px | Display text |
| 6xl | 60px | 60px | Large display |

### Font Weight

```yaml
normal: 400    # Body text
medium: 500    # Emphasized text, labels
semibold: 600  # Headings, important text
bold: 700      # Strong emphasis
```

### Typography Guidelines

#### Headings

```tsx
<h1 className="text-3xl font-semibold text-text-primary">
  SET Index Performance
</h1>

<h2 className="text-2xl font-semibold text-text-primary">
  Top Movers
</h2>

<h3 className="text-xl font-medium text-text-primary">
  Stock Details
</h3>
```

#### Body Text

```tsx
<p className="text-base text-text-primary">
  Primary body text for main content.
</p>

<p className="text-sm text-text-secondary">
  Secondary text for descriptions and metadata.
</p>

<p className="text-xs text-text-muted">
  Muted text for timestamps and placeholders.
</p>
```

#### Numerical Data

```tsx
<span className="font-mono text-lg font-medium tabular-nums text-text-primary">
  1,245.50
</span>

<span className="font-mono text-sm tabular-nums text-signal-up-strong">
  +12.50 (+1.02%)
</span>
```

---

## Spacing

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing, between icon and text |
| sm | 8px | Small gaps, compact layouts |
| md | 16px | Default spacing, padding |
| lg | 24px | Section spacing, comfortable padding |
| xl | 32px | Large spacing between sections |
| 2xl | 48px | Page-level spacing |
| 3xl | 64px | Extra large spacing |

### Stock-Specific Spacing

| Token | Value | Usage |
|-------|-------|-------|
| stock-card | 16rem | Fixed card width |
| chart-height | 20rem | Standard chart height |
| sidebar | 18rem | Navigation sidebar width |

### Spacing Guidelines

#### Component Padding

```tsx
// Compact components
<button className="px-3 py-1.5">Compact</button>

// Default components
<button className="px-4 py-2">Default</button>

// Spacious components
<button className="px-6 py-3">Spacious</button>
```

#### Layout Spacing

```tsx
// Stack with consistent spacing
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Section spacing
<section className="space-y-6">
  <h2>Section Title</h2>
  <p>Section content</p>
</section>
```

---

## Component Guidelines

### Buttons

#### Primary Button (Buy/Confirm)

```tsx
<button className="btn btn-primary">
  Buy Stock
</button>
```

**Classes:**
- Base: `inline-flex items-center justify-center gap-2 px-4 py-2 rounded-button font-medium text-sm transition-all duration-200`
- Primary variant: `bg-flow-buy text-text-inverse hover:bg-opacity-90 hover:shadow-glow-up active:scale-95`

#### Secondary Button (Cancel/Back)

```tsx
<button className="btn btn-secondary">
  Cancel
</button>
```

**Classes:**
- Secondary variant: `bg-base-surface-alt text-text-primary border border-base-border hover:bg-base-border active:scale-95`

#### Ghost Button (Tertiary)

```tsx
<button className="btn btn-ghost">
  Learn More
</button>
```

**Classes:**
- Ghost variant: `bg-transparent text-text-secondary hover:bg-base-surface-alt hover:text-text-primary active:scale-95`

#### Button States

```tsx
// Disabled
<button className="btn btn-primary" disabled>
  Disabled
</button>

// Loading
<button className="btn btn-primary" disabled>
  <LoaderIcon className="animate-spin" />
  Processing...
</button>
```

### Cards

#### Stock Card

```tsx
<div className="stock-card stock-card-up">
  <h3 className="text-lg font-semibold text-text-primary">AAPL</h3>
  <p className="price price-up">178.50</p>
  <span className="change-positive">+2.5%</span>
</div>
```

**Classes:**
- Base: `card p-4 hover:border-signal-up-strong`
- Up variant: `border-l-4 border-l-signal-up-strong`
- Down variant: `border-l-4 border-l-signal-down-strong`

#### Info Card

```tsx
<div className="card p-6">
  <h4 className="text-base font-semibold text-text-primary mb-2">
    Market Summary
  </h4>
  <p className="text-sm text-text-secondary">
    The market is currently in risk-on mode.
  </p>
</div>
```

### Badges

#### Buy/Sell Badges

```tsx
<span className="badge badge-buy">BUY</span>
<span className="badge badge-sell">SELL</span>
<span className="badge badge-neutral">HOLD</span>
```

#### Insight/Warning Badges

```tsx
<span className="badge badge-insight">Insight</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-info">Info</span>
```

### Price Displays

#### Price with Change

```tsx
<div className="space-y-1">
  <p className="price text-2xl font-semibold text-text-primary">
    1,245.50
  </p>
  <p className="text-sm text-signal-up-strong">
    ▲ +12.50 (+1.02%)
  </p>
</div>
```

#### Change Indicators

```tsx
<span className="change-positive">
  <TrendingUpIcon size={16} />
  +2.5%
</span>

<span className="change-negative">
  <TrendingDownIcon size={16} />
  -1.2%
</span>
```

### Inputs

```tsx
<input
  type="text"
  className="input"
  placeholder="Search stocks..."
/>

<input
  type="number"
  className="input input-error"
  placeholder="Enter quantity"
/>
```

**Classes:**
- Base: `w-full px-3 py-2 bg-base-surface border border-base-border rounded-input text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-highlight-info focus:border-transparent`

### Tables

```tsx
<div className="table-container">
  <table className="table">
    <thead className="table-header">
      <tr>
        <th className="table-header-cell">Symbol</th>
        <th className="table-header-cell">Price</th>
        <th className="table-header-cell">Change</th>
      </tr>
    </thead>
    <tbody>
      <tr className="table-row">
        <td className="table-cell font-medium">AAPL</td>
        <td className="table-cell price">178.50</td>
        <td className="table-cell text-signal-up-strong">+2.5%</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Tabs

```tsx
<div className="tabs">
  <button className="tab tab-active">Overview</button>
  <button className="tab">Analysis</button>
  <button className="tab">News</button>
</div>
```

---

## Responsive Breakpoints

### Breakpoint Scale

| Name | Min Width | Usage |
|------|-----------|-------|
| sm | 640px | Small tablets, large phones |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

### Responsive Guidelines

```tsx
// Mobile-first approach
<div className="p-4 md:p-6 lg:p-8">
  Content
</div>

// Hidden on mobile
<div className="hidden md:block">
  Desktop-only content
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>

// Responsive typography
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

---

## Accessibility

### Color Contrast

All color combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

### Focus States

All interactive elements have visible focus states:

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-highlight-info focus:ring-offset-2 focus:ring-offset-base-background">
  Accessible Button
</button>
```

### Screen Readers

Use semantic HTML and ARIA labels:

```tsx
<button aria-label="Add to watchlist">
  <StarIcon />
</button>

<div role="status" aria-live="polite">
  Loading...
</div>
```

### Reduced Motion

Respect user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Keyboard Navigation

All interactive elements are keyboard accessible:
- Use semantic HTML (`<button>`, `<a>`, `<input>`)
- Ensure logical tab order
- Provide visible focus indicators

---

## Implementation Examples

### Stock Card Component

```tsx
interface StockCardProps {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export function StockCard({ symbol, name, price, change, changePercent }: StockCardProps) {
  const isPositive = change >= 0

  return (
    <div className={`stock-card ${isPositive ? 'stock-card-up' : 'stock-card-down'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{symbol}</h3>
          <p className="text-xs text-text-secondary">{name}</p>
        </div>
        <span className={`badge ${isPositive ? 'badge-buy' : 'badge-sell'}`}>
          {isPositive ? 'BUY' : 'SELL'}
        </span>
      </div>

      <div className="space-y-1">
        <p className="price text-2xl font-semibold text-text-primary">
          {formatThaiNumber(price)}
        </p>
        <p className={`text-sm ${isPositive ? 'text-signal-up-strong' : 'text-signal-down-strong'}`}>
          {isPositive ? '▲' : '▼'} {formatThaiNumber(Math.abs(change))} ({formatThaiPercentage(changePercent)})
        </p>
      </div>
    </div>
  )
}
```

### Market Regime Banner

```tsx
interface MarketRegimeBannerProps {
  regime: 'RISK_ON' | 'RISK_OFF'
  description: string
}

export function MarketRegimeBanner({ regime, description }: MarketRegimeBannerProps) {
  const isRiskOn = regime === 'RISK_ON'
  const colors = getRegimeColor(regime)

  return (
    <div className={`${colors.bg} ${colors.border} border-l-4 p-4 rounded-card`}>
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isRiskOn ? 'bg-flow-buy' : 'bg-flow-sell'} animate-pulse`} />
        <div>
          <h4 className={`text-sm font-semibold ${colors.text}`}>
            Market is {regime === 'RISK_ON' ? 'Risk-On' : 'Risk-Off'}
          </h4>
          <p className="text-xs text-text-secondary mt-1">{description}</p>
        </div>
      </div>
    </div>
  )
}
```

### Price Chart Container

```tsx
interface PriceChartProps {
  symbol: string
  data: ChartData[]
}

export function PriceChart({ symbol, data }: PriceChartProps) {
  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{symbol}</h2>
          <p className="text-sm text-text-secondary">Price Chart</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost text-xs">1D</button>
          <button className="btn btn-ghost text-xs">1W</button>
          <button className="btn btn-ghost text-xs bg-base-surface-alt">1M</button>
          <button className="btn btn-ghost text-xs">3M</button>
          <button className="btn btn-ghost text-xs">1Y</button>
        </div>
      </div>

      <div style={{ height: '20rem' }}>
        {/* Chart component here */}
      </div>
    </div>
  )
}
```

### Watchlist Button

```tsx
interface WatchlistButtonProps {
  isWatched: boolean
  onToggle: () => void
}

export function WatchlistButton({ isWatched, onToggle }: WatchlistButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        btn gap-2
        ${isWatched
          ? 'bg-highlight-insight/20 text-highlight-insight border border-highlight-insight/30'
          : 'btn-ghost'
        }
      `}
      aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <StarIcon className={isWatched ? 'fill-current' : ''} size={16} />
      {isWatched ? 'Watching' : 'Watch'}
    </button>
  )
}
```

---

## Design Tokens (CSS Variables)

### CSS Custom Properties

```css
/* Base Colors */
--base-background: #0F172A;
--base-surface: #111827;
--base-surface-alt: #1F2937;
--base-border: #273449;

/* Text Colors */
--text-primary: #E5E7EB;
--text-secondary: #9CA3AF;
--text-muted: #6B7280;
--text-inverse: #020617;

/* Signal Colors */
--signal-up-strong: #22C55E;
--signal-up-soft: #86EFAC;
--signal-down-soft: #FECACA;
--signal-down-strong: #EF4444;
--signal-neutral: #94A3B8;

/* Flow Colors */
--flow-buy: #16A34A;
--flow-sell: #DC2626;
--flow-neutral-bg: #1F2937;
--flow-opacity: 0.7;

/* Highlight Colors */
--highlight-insight: #F59E0B;
--highlight-warning: #FB7185;
--highlight-info: #60A5FA;

/* Spacing */
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
--space-2xl: 3rem;

/* Border Radius */
--radius-sm: 0.375rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-2xl: 1.5rem;

/* Transitions */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Z-Index */
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

### Using CSS Variables

```tsx
// In styled components or inline styles
<div style={{ backgroundColor: 'var(--base-surface)' }}>
  Content
</div>

// With CSS-in-JS
const styledCard = {
  backgroundColor: 'var(--base-surface)',
  border: `1px solid var(--base-border)`,
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-md)',
}
```

---

## Best Practices

### DO

1. **Use semantic colors**: Always use color classes that match their meaning (buy/sell, up/down)
2. **Maintain contrast**: Ensure all text meets WCAG AA standards
3. **Be consistent**: Use the same spacing, colors, and typography throughout
4. **Think mobile-first**: Design for small screens, enhance for larger ones
5. **Test with real data**: Use actual Thai stock symbols and prices
6. **Consider Thai language**: Test typography with Thai text

### DON'T

1. **Don't hardcode colors**: Always use design token classes or variables
2. **Don't mix signal colors**: Avoid using up and down colors together confusingly
3. **Don't use bright backgrounds**: Reserve bright colors for accents, not large areas
4. **Don't ignore accessibility**: Always include focus states and ARIA labels
5. **Don't skip hover states**: Provide feedback for all interactive elements
6. **Don't use text-primary on colored backgrounds**: Use text-inverse instead

---

## Changelog

### Version 1.0.0 (2026-01-23)
- Initial design system release
- Complete color palette specification
- Typography scale and guidelines
- Component style definitions
- Responsive breakpoint system
- Accessibility guidelines
- Implementation examples

---

## Support

For questions or issues related to the design system:
1. Check this documentation first
2. Review the implementation examples
3. Consult the design tokens in `src/lib/design/index.ts`
4. Refer to the Tailwind config in `tailwind.config.ts`

---

**Note**: This design system is specifically optimized for the Thai stock market application. While it can be adapted for other use cases, prioritize financial data readability and clarity when making modifications.
