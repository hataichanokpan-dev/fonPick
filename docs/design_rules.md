# fonPick Design Rules & Component Templates

> **Design Philosophy**: Professional, minimal, data-first stock market interface for Thai investors
>
> **Concept Reference**: `simple_web2.png` (desktop) + `simple_mobile.png` (mobile)

---

## 1. Color System

### Core Neutrals

```css
/* Background Hierarchy */
--bg-primary:    #0a0e17  /* Deep near-black - main background */
--bg-surface:    #111827  /* Card background */
--bg-surface-2:  #1f2937  /* Elevated surface, hover states */
--bg-surface-3:  #374151  /* Active states */

/* Border System */
--border-subtle: #1f2937  /* Subtle borders */
--border-default: #374151 /* Component borders */
--border-strong: #4b5563  /* Focus states */
```

### Typography Colors

```css
--text-primary:   #ffffff  /* Main content, hero numbers */
--text-secondary: #a0a0a0  /* Supporting text */
--text-tertiary:  #6b7280  /* Labels, metadata */
--text-disabled:  #4b5563  /* Disabled states */
```

### Signal Colors (Market Data)

```css
/* Desktop & Web */
--up-primary:     #4ade80   /* Green - gains, positive */
--up-soft:        rgba(74, 222, 128, 0.15)  /* Background tint */
--down-primary:   #ff6b6b   /* Red - losses, negative */
--down-soft:      rgba(255, 107, 107, 0.15) /* Background tint */
--neutral:        #9ca3af   /* Flat, no change */

/* Mobile (Material Design shades) */
--up-mobile:      #4CAF50   /* Green 500 */
--down-mobile:    #F44336   /* Red 500 */
```

### Accent Colors

```css
--accent-blue:    #3b82f6   /* Charts, links, primary actions */
--accent-blue-dark: #1e40af /* Chart fill */
--insight:        #f59e0b   /* Gold - AI insights */
--warning:        #f97316   /* Orange - warnings */
```

---

## 2. Typography

### Font Family

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
```

**Critical for financial numbers:**
```css
/* ALL numbers must use tabular figures */
font-variant-numeric: tabular-nums;
font-feature-settings: 'tnum' 1, 'zero' 1;
```

### Typography Scale

| Usage | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| **Hero Numbers** | 32px | 700 | 1.1 | -0.02em |
| **Section Titles** | 24px | 700 | 1.3 | -0.01em |
| **Card Titles** | 18px | 600 | 1.4 | normal |
| **Data Values** | 16px | 600 | 1.25 | normal |
| **Body Text** | 14px | 400 | 1.6 | normal |
| **Labels** | 12px | 500 | 1.5 | 0.05em |
| **Captions** | 11px | 400 | 1.4 | normal |

### Number Display Classes

```typescript
// Hero metric (SET Index, main price)
.number-hero {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1, 'zero' 1;
}

// Primary value (stock price, key metric)
.number-primary {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

// Secondary value (volume, P/E)
.number-secondary {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
}

// Tertiary value (percentages in lists)
.number-tertiary {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
}
```

---

## 3. Spacing System

### Base Spacing Scale

```css
--space-1:  4px   /* Micro spacing */
--space-2:  8px   /* Small gaps */
--space-3:  12px  /* Standard gap */
--space-4:  16px  /* Medium spacing */
--space-5:  20px  /* Large internal spacing */
--space-6:  24px  /* Section spacing */
--space-8:  32px  /* Component spacing */
--space-10: 40px  /* Large sections */
--space-12: 48px  /* Page margins */
```

### Component Spacing

| Element | Desktop | Mobile |
|---------|---------|--------|
| Card Padding | 16px | 16px |
| Card Gap | 24px | 16px |
| Row Height (list) | 48px | 56px |
| Button Height | 40px | 44px |
| Section Margin | 24px | 16px |
| Grid Gutter | 24px | 16px |

---

## 4. Layout System

### Desktop Grid (12-column)

```css
/* Container max-widths */
container-sm:  640px
container-md:  768px
container-lg:  1024px
container-xl:  1280px
container-2xl: 1440px

/* Column fractions */
col-3:  25%   /* Quarter width */
col-4:  33.33% /* Third width */
col-6:  50%   /* Half width */
col-8:  66.66% /* Two-thirds width */
col-9:  75%   /* Three-quarters width */
col-12: 100%  /* Full width */
```

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Header (48px height)                                │
├─────────────────────────────────────────────────────┤
│ Main Content (16px padding)                         │
│ ┌──────────────────┐ ┌─────────────────────────────┐│
│ │ Left Column      │ │ Right Column                ││
│ │ (33-40% width)   │ │ (60-67% width)              ││
│ │                  │ │                             ││
│ │ • Market Summary │ │ • Chart Panels              ││
│ │ • Top Movers     │ │ • Economic Indicators       ││
│ │ • Sector Rotation│ │ • Metrics                   ││
│ │ • Insights       │ │                             ││
│ └──────────────────┘ └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
bp-xs:  375px   /* Small phones */
bp-sm:  640px   /* Landscape phones, small tablets */
bp-md:  768px   /* Tablets */
bp-lg:  1024px  /* Desktop */
bp-xl:  1280px  /* Large desktop */
bp-2xl: 1536px  /* Extra large desktop */
```

---

## 5. Component Templates

### 5.1 Card Component

```tsx
// src/components/shared/Card.tsx

interface CardProps {
  variant?: 'default' | 'elevated' | 'flat'
  padding?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className
}: CardProps) {
  const variants = {
    default: 'bg-surface border border-border-subtle',
    elevated: 'bg-surface-2 border border-border-default',
    flat: 'bg-surface'
  }

  const paddings = {
    sm: 'p-3',      // 12px
    md: 'p-4',      // 16px
    lg: 'p-6'       // 24px
  }

  return (
    <div className={cn(
      'rounded-lg',
      variants[variant],
      paddings[padding],
      className
    )}>
      {children}
    </div>
  )
}
```

### 5.2 Badge Component

```tsx
// src/components/shared/Badge.tsx

interface BadgeProps {
  variant?: 'up' | 'down' | 'neutral' | 'insight' | 'warning'
  size?: 'sm' | 'md'
  children: React.ReactNode
}

export function Badge({ variant = 'neutral', size = 'md', children }: BadgeProps) {
  const variants = {
    up: 'bg-up-soft text-up-primary',
    down: 'bg-down-soft text-down-primary',
    neutral: 'bg-surface-2 text-text-secondary',
    insight: 'bg-orange-soft text-insight',
    warning: 'bg-red-soft text-warning'
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',      // 8px 4px, 12px
    md: 'px-3 py-1.5 text-sm'     // 12px 6px, 14px
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded font-medium',
      variants[variant],
      sizes[size]
    )}>
      {children}
    </span>
  )
}
```

### 5.3 Data Display Component

```tsx
// src/components/shared/DataDisplay.tsx

interface DataDisplayProps {
  label: string
  value: string | number
  change?: number
  changePercent?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  trend?: 'up' | 'down' | 'neutral'
}

export function DataDisplay({
  label,
  value,
  change,
  changePercent,
  size = 'md',
  trend
}: DataDisplayProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    if (!trend || !change) return 'text-text-primary'
    return trend === 'up' ? 'text-up-primary' : 'text-down-primary'
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-text-tertiary uppercase tracking-wide">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={cn(
          'font-semibold tabular-nums',
          sizes[size]
        )}>
          {value}
        </span>
        {changePercent !== undefined && (
          <span className={cn(
            'text-sm font-medium tabular-nums',
            getTrendColor(trend)
          )}>
            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  )
}
```

### 5.4 Stock List Item Component

```tsx
// src/components/shared/StockListItem.tsx

interface StockListItemProps {
  rank: number
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume?: string
  onClick?: () => void
}

export function StockListItem({
  rank,
  symbol,
  name,
  price,
  change,
  changePercent,
  volume,
  onClick
}: StockListItemProps) {
  const isUp = changePercent >= 0

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 bg-surface border border-border-subtle rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
      style={{ minHeight: '48px' }}
    >
      {/* Rank */}
      <span className="text-sm text-text-tertiary w-6">
        {rank}
      </span>

      {/* Symbol & Name */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-text-primary">
          {symbol}
        </div>
        <div className="text-sm text-text-secondary truncate">
          {name}
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        <div className="font-semibold tabular-nums text-text-primary">
          ฿{price.toFixed(2)}
        </div>
        <div className={cn(
          'text-sm font-medium tabular-nums',
          isUp ? 'text-up-primary' : 'text-down-primary'
        )}>
          {isUp ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  )
}
```

### 5.5 Mini Chart Component

```tsx
// src/components/shared/MiniChart.tsx

interface MiniChartProps {
  data: number[]
  color?: 'up' | 'down' | 'neutral'
  height?: number
}

export function MiniChart({ data, color = 'neutral', height = 60 }: MiniChartProps) {
  const getColor = () => {
    switch (color) {
      case 'up': return '#4ade80'
      case 'down': return '#ff6b6b'
      default: return '#9ca3af'
    }
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Generate SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={getColor()}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
```

---

## 6. Mobile-Specific Rules

### Touch Targets

```css
/* Minimum touch target: 44x44px (iOS), 48x48px (Android) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

### Mobile Spacing

| Element | Value |
|---------|-------|
| Card Padding | 16px |
| List Item Height | 56px |
| Button Height | 44px |
| Bottom Nav Height | 56px |
| Header Height | 48px |
| Grid Gap | 16px |

### Mobile Typography Scale

| Usage | Size | Weight |
|-------|------|--------|
| Hero Numbers | 24px | 700 |
| Section Titles | 18px | 600 |
| Data Values | 16px | 600 |
| Body Text | 14px | 400 |
| Labels | 12px | 500 |

---

## 7. Animation Rules

### Transitions

```css
/* Standard transition */
transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

/* Color-only transition */
transition: color 150ms ease, background-color 150ms ease;

/* Transform transition */
transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Animations

```css
/* Price update flash */
@keyframes priceFlash {
  0%, 100% { background-color: transparent; }
  50% { background-color: var(--up-soft); }
}

/* Shimmer loading */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 8. Accessibility Rules

### Contrast Requirements

- **Text**: WCAG AA (4.5:1 minimum)
- **Large Text**: WCAG AA (3:1 minimum)
- **Numbers/Financial Data**: WCAG AAA (7:1 target)

### Focus States

```css
/* Visible focus indicator */
.focusable:focus-visible {
  outline: 2px solid var(--accent-blue);
  outline-offset: 2px;
}
```

### Screen Reader Support

```tsx
/* Use semantic HTML */
<button aria-label="Add to watchlist">+</button>

/* Provide context for numbers */
<span aria-label="SET Index value 1,643.25, up 0.15 percent">
  1,643.25 <span className="text-up-primary">+0.15%</span>
</span>
```

---

## 9. Implementation Checklist

### Phase 1: Foundation
- [ ] Update `tailwind.config.ts` with new color tokens
- [ ] Update `src/lib/design/index.ts` with new design system
- [ ] Add `JetBrains Mono` font for numbers
- [ ] Configure `tabular-nums` globally

### Phase 2: Core Components
- [ ] Update `Card` component with new variants
- [ ] Update `Badge` component with new colors
- [ ] Create `DataDisplay` component
- [ ] Create `StockListItem` component
- [ ] Create `MiniChart` component

### Phase 3: Layout
- [ ] Update homepage layout to match concept
- [ ] Update navigation (desktop + mobile)
- [ ] Implement responsive grid system
- [ ] Add mobile bottom navigation

### Phase 4: Polish
- [ ] Add animations and transitions
- [ ] Implement loading states
- [ ] Add error states
- [ ] Accessibility audit

---

## 10. Design Token Reference (Quick Copy)

```css
/* Colors */
--bg-primary: #0a0e17
--bg-surface: #111827
--bg-surface-2: #1f2937
--border-subtle: #1f2937
--border-default: #374151
--text-primary: #ffffff
--text-secondary: #a0a0a0
--text-tertiary: #6b7280
--up-primary: #4ade80
--down-primary: #ff6b6b
--accent-blue: #3b82f6
--insight: #f59e0b

/* Spacing */
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px

/* Typography */
--font-size-hero: 32px
--font-size-h1: 24px
--font-size-h2: 18px
--font-size-body: 14px
--font-size-label: 12px

/* Border Radius */
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
```

---

**Version**: 1.0
**Last Updated**: 2025-01-24
**Concept Reference**: `simple_web2.png`, `simple_mobile.png`
