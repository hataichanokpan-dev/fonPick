# Phase 1: Frontend Foundation - Documentation

## Overview

This document covers the frontend foundation prepared for Phase 1 of the fonPick implementation plan. It includes the module component stubs, existing component patterns documentation, and design tokens review.

---

## 1. Module Components Created

### Location
`src/components/modules/`

### Components Created

1. **VolatilityModule.tsx**
   - Displays market volatility indicators (VIX-like index)
   - Shows high/low volatility stocks
   - Volatility regime classification
   - Historical trend visualization

2. **SectorRotationModule.tsx**
   - Sector performance rankings
   - Money flow by sector
   - Rotation signals (entering/leaving)
   - Top/bottom sector highlights

3. **SmartMoneyModule.tsx**
   - NVDR flows (non-voting depository receipts)
   - Foreign investor buy/sell activity
   - Top stocks by smart money interest
   - Smart money sentiment indicator

4. **InsightsModule.tsx**
   - AI-generated market insights
   - Market summary and key takeaways
   - Notable stock movements
   - Trading signals and opportunities

5. **RankingsImpactModule.tsx**
   - Cross-analysis of ranking categories
   - Stocks appearing in 2+ categories
   - High-impact stocks
   - Confluence indicators

6. **CorrelationModule.tsx**
   - SET Index correlation heatmap
   - High correlation stock pairs
   - Sector correlation matrix
   - Diversification opportunities

---

## 2. Existing Component Patterns

### Component Structure Pattern

All components follow this consistent structure:

```tsx
/**
 * Component documentation
 * Theme: Green-tinted dark with teal up / soft red down
 */

import { Card } from '@/components/shared'

interface ComponentProps {
  // Props with JSDoc comments
  className?: string
}

export function Component({ props }: ComponentProps) {
  return (
    <Card className={className}>
      {/* Component content */}
    </Card>
  )
}
```

### Data Fetching Pattern (from RTDB)

```tsx
// From: src/lib/rtdb/client.ts
export async function rtdbGet<T>(path: string): Promise<T | null> {
  try {
    const db = getDatabaseInstance()
    const dbRef: DatabaseReference = ref(db, path)
    const snapshot: DataSnapshot = await get(dbRef)
    return snapshot.exists() ? (snapshot.val() as T) : null
  } catch (error) {
    // Handle permission denied gracefully - return null
    if (error instanceof Error && errorMessage.includes('Permission denied')) {
      return null
    }
    throw new RTDBError(...)
  }
}
```

### Styling with Tailwind

**Key patterns identified:**

1. **Color tokens used:**
   - `bg-bg`, `bg-surface`, `bg-surface-1`, `bg-surface-2`
   - `text-text`, `text-text-2`, `text-text-3`, `text-muted`
   - `border-border`, `border-border-1`
   - Signal colors: `up`, `down`, `flat` (with variants: soft, deep, bg)

2. **Responsive patterns:**
   ```tsx
   className="flex flex-col sm:flex-row"
   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
   ```

3. **State-based styling:**
   ```tsx
   // From SetSnapshot.tsx - inline styles for dynamic colors
   const getMainBadgeStyle = () => {
     if (data.changePercent > 1.5) return { bg: '#2ED8A7', text: '#0B0F0E' }
     if (data.changePercent > 0) return { bg: '#6FE3C1', text: '#064e3b' }
     if (data.changePercent < -1.5) return { bg: '#F45B69', text: '#FFFFFF' }
     if (data.changePercent < 0) return { bg: '#F7A1AA', text: '#881337' }
     return { bg: '#AEB7B3', text: '#0B0F0E' }
   }
   ```

4. **Typography scale:**
   ```tsx
   // From TopRankings.tsx
   text-xs      // 0.75rem (12px) - labels, timestamps
   text-sm      // 0.875rem (14px) - secondary info
   text-base    // 1rem (16px) - default
   text-lg      // 1.125rem (18px) - section headers
   text-2xl     // 1.5rem (24px) - numbers
   text-3xl     // 1.875rem (30px) - main numbers
   ```

5. **Card padding pattern:**
   ```tsx
   // Default Card has p-4 (16px)
   <Card variant="default" className="p-3"> // Compact variant (12px)
   ```

### Component Variants Pattern

```tsx
// Card variants
type CardVariant = 'default' | 'outlined' | 'elevated'

const variants = {
  default: 'bg-surface border border-border rounded-lg shadow-sm',
  outlined: 'bg-transparent border border-border rounded-lg',
  elevated: 'bg-surface-1 border border-border rounded-lg shadow-soft',
}
```

### Utility Functions Pattern

```tsx
// From: src/lib/utils/format.ts
export function formatNumber(value: number, decimals: number = 2): string
export function formatPercent(value: number, decimals: number = 2): string
export function formatMarketCap(value: number): string
export function formatVolume(value: number): string
export function formatTradingValue(value: number): string
export function getValueColor(value: number): 'up' | 'down' | 'neutral'
export function getValueArrow(value: number): string
```

---

## 3. Design Tokens Review

### Current Typography Scale (from `src/lib/design/index.ts`)

| Token | Value | Usage |
|-------|-------|-------|
| xxs | 0.625rem (10px) | Very small labels |
| xs | 0.75rem (12px) | Labels, timestamps |
| sm | 0.875rem (14px) | Secondary text |
| base | 1rem (16px) | Default text |
| lg | 1.125rem (18px) | Section headers |
| xl | 1.25rem (20px) | Medium numbers |
| 2xl | 1.5rem (24px) | Big numbers |
| 3xl | 1.875rem (30px) | Large numbers |
| 4xl | 2.25rem (36px) | Display |
| 5xl | 3rem (48px) | Hero |
| 6xl | 3.75rem (60px) | Hero display |

### Compact & Professional Updates Needed

For "Compact & Professional" design, the following updates should be considered:

**Current Card Padding:**
- Default: `p-4` (16px)
- Compact: `p-3` (12px)

**Recommended for Mobile:**
- Mobile: `p-2` (8px) or `p-2.5` (10px)
- Desktop: `p-3` (12px)

**Typography Updates for Compact Design:**
- Big Numbers: `text-xl` to `text-2xl` (20-24px) - current `text-3xl` (30px) is large
- Medium: `text-base` to `text-lg` (16-18px)
- Labels: `text-xs` to `text-sm` (12-14px)

### Color Tokens (Green-Tinted Dark Theme)

**Signal Colors:**
```typescript
up: {
  DEFAULT: '#2ED8A7',    // teal
  soft: '#6FE3C1',       // lighter teal
  deep: '#149F7A',       // darker teal
  text: '#A9F3DF',
  bg: 'rgba(46, 216, 167, 0.1)',
}

down: {
  DEFAULT: '#F45B69',    // soft red
  soft: '#F7A1AA',       // lighter red
  deep: '#DC3D4B',       // darker red
  text: '#FFC2C8',
  bg: 'rgba(244, 91, 105, 0.1)',
}
```

**Typography Colors:**
```typescript
text: {
  DEFAULT: '#E6EDEA',    // Primary
  1: '#D3DBD7',          // Secondary
  2: '#B8C1BD',          // Muted
  3: '#9AA5A0',          // More muted
  muted: '#7C8782',
  disabled: '#55605C',
}
```

### Spacing Tokens

```typescript
xs: '0.25rem'  // 4px
sm: '0.5rem'   // 8px
md: '1rem'     // 16px
lg: '1.5rem'   // 24px
xl: '2rem'     // 32px
2xl: '3rem'    // 48px
3xl: '4rem'    // 64px
```

### Border Radius

```typescript
sm: '0.375rem'   // 6px
md: '0.5rem'     // 8px
lg: '0.75rem'    // 12px - card default
xl: '1rem'       // 16px
xl2: '14px'
2xl: '1.5rem'    // 24px
full: '9999px'
```

---

## 4. Recommended Design Token Updates

### For Compact & Professional Design

```typescript
// Add to src/lib/design/index.ts or tailwind.config.ts

export const compactDesign = {
  // Compact card padding
  cardPadding: {
    mobile: '0.5rem',   // 8px
    desktop: '0.75rem', // 12px
  },

  // Compact typography scale
  typography: {
    bigNumber: '1.25rem to 1.5rem',  // 20-24px (vs current 30px)
    medium: '1rem to 1.125rem',      // 16-18px
    label: '0.75rem to 0.875rem',    // 12-14px
    tiny: '0.625rem',                // 10px
  },

  // Compact spacing
  gap: {
    xs: '0.25rem',  // 4px - between related items
    sm: '0.5rem',   // 8px - between card sections
    md: '0.75rem',  // 12px - between cards
    lg: '1rem',     // 16px - between sections
  },
}
```

---

## 5. Component File Structure

```
src/components/
├── home/                    # Existing home page components
│   ├── MarketContextCard.tsx
│   ├── SetSnapshot.tsx
│   ├── TopRankings.tsx
│   └── ...
├── shared/                  # Reusable UI components
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── DataBadge.tsx
│   ├── DataFreshness.tsx
│   ├── ErrorFallback.tsx
│   ├── LoadingSkeleton.tsx
│   └── SearchBar.tsx
└── modules/                 # NEW: Feature modules (Phase 5)
    ├── VolatilityModule.tsx
    ├── SectorRotationModule.tsx
    ├── SmartMoneyModule.tsx
    ├── InsightsModule.tsx
    ├── RankingsImpactModule.tsx
    ├── CorrelationModule.tsx
    └── index.ts
```

---

## 6. Type Safety Patterns

All components use TypeScript with:

1. **Explicit prop interfaces** with JSDoc comments
2. **Optional props** marked with `?`
3. **Union types** for fixed values (e.g., `'up' | 'down' | 'neutral'`)
4. **Array types** for lists
5. **Exported types** for reuse

Example:
```tsx
export interface VolatilityModuleProps {
  vixValue?: number
  regime?: 'calm' | 'moderate' | 'elevated' | 'extreme'
  highVolatilityStocks?: Array<{
    symbol: string
    name: string
    volatility: number
  }>
  timestamp?: number
  className?: string
}
```

---

## 7. Next Steps (Phase 2-4)

When ready to implement:

1. **Phase 2:** Backend agent creates types and services
2. **Phase 3:** Integrate services with components
3. **Phase 4:** Implement UI/rendering logic
4. **Phase 5:** Testing and refinement

### Component Implementation Checklist

For each module component:
- [ ] Fetch data from Firebase/service
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Handle empty data state
- [ ] Render main visualization
- [ ] Add responsive breakpoints
- [ ] Add hover interactions
- [ ] Test on mobile/tablet/desktop
- [ ] Verify color contrast
- [ ] Test with real data

---

## Summary

Phase 1 frontend foundation is complete:

- **6 module component stubs** created in `src/components/modules/`
- **Component patterns documented** (data fetching, styling, structure)
- **Design tokens reviewed** with recommendations for compact design
- **Type safety patterns** established
- **Ready for Phase 2** when backend services are available
