# AccessibleSignal Component

A color-blind friendly signal badge component for financial data visualization in the fonPick application.

## Features

- **Color-blind accessibility**: Uses both color AND texture patterns for distinguishing signal types
- **Icon indicators**: Visual icons (TrendingUp, TrendingDown, Minus) for quick recognition
- **Multiple sizes**: sm, md, lg variants for different use cases
- **Optional animations**: Spring animation on mount/state change
- **Full accessibility**: ARIA labels and screen reader support
- **Tabular numbers**: Proper alignment for numerical values

## Visual Design

### Signal Types

| Type | Background | Text Color | Icon | Pattern |
|------|-----------|------------|------|----------|
| **Up** | Green tint | Green | Triangle pointing up | Diagonal stripes (45deg) |
| **Down** | Red tint | Red | Triangle pointing down | Diagonal stripes (-45deg) |
| **Neutral** | Gray | Gray | Horizontal line | Dot pattern |

### Color Palette

Uses existing design tokens from `tailwind.config.ts`:

- `up-primary`: `#4ade80` (Green)
- `up-soft`: `rgba(74, 222, 128, 0.15)` (Light green background)
- `down-primary`: `#ff6b6b` (Red)
- `down-soft`: `rgba(255, 107, 107, 0.15)` (Light red background)
- `neutral`: `#9ca3af` (Gray)

## Installation

The component is already available via the shared components export:

```tsx
import { AccessibleSignal } from '@/components/shared'
// or
import { AccessibleSignal } from '@/components/shared/modern/AccessibleSignal'
```

## Usage

### Basic Usage

```tsx
import { AccessibleSignal } from '@/components/shared'

export function StockCard() {
  return (
    <AccessibleSignal type="up" label="Change" value="+2.5%" />
  )
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'up' \| 'down' \| 'neutral'` | (required) | Signal type |
| `label` | `string` | `undefined` | Optional label text |
| `value` | `string \| number` | `undefined` | Optional value to display |
| `showIcon` | `boolean` | `true` | Show icon indicator |
| `showPattern` | `boolean` | `true` | Show pattern overlay for accessibility |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `className` | `string` | `undefined` | Additional CSS classes |
| `animated` | `boolean` | `false` | Enable animation on mount/state change |

### Size Variants

```tsx
// Small (12px text)
<AccessibleSignal type="up" value="+2.5%" size="sm" />

// Medium (14px text) - default
<AccessibleSignal type="up" value="+2.5%" size="md" />

// Large (16px text)
<AccessibleSignal type="up" value="+2.5%" size="lg" />
```

### Animated Signals

```tsx
<AccessibleSignal
  type="up"
  label="Change"
  value="+2.5%"
  animated
/>
```

### Icon Only (Minimal Mode)

```tsx
<AccessibleSignal
  type="up"
  showIcon
  showPattern={false}
  size="sm"
/>
```

### Value Only (Compact Display)

```tsx
<AccessibleSignal
  type="up"
  value="2.5%"
  showIcon={false}
/>
```

### Stock Price Display

```tsx
<div className="flex items-center justify-between">
  <div>
    <div className="font-semibold">AAPL</div>
    <div className="text-sm text-text-secondary">Apple Inc.</div>
  </div>
  <div className="text-right">
    <div className="font-mono">$178.50</div>
    <AccessibleSignal type="up" value="+2.5%" size="sm" />
  </div>
</div>
```

## Accessibility

### ARIA Labels

The component automatically generates ARIA labels in the format:
```
"{direction}: {label}: {value}"
```

For example:
- `type="up"` with `label="Change"` and `value="+2.5%"` → `"up: Change: +2.5%"`

### Pattern Overlay

The SVG pattern overlay ensures accessibility for users with color vision deficiencies:
- **Up**: Diagonal stripes at 45 degrees
- **Down**: Diagonal stripes at -45 degrees
- **Neutral**: Dot pattern

### Screen Reader Support

```tsx
// Screen reader will announce: "up: Change: 2.5 percent"
<AccessibleSignal type="up" label="Change" value="+2.5%" />
```

## Technical Implementation

### Dependencies

- `framer-motion`: For animations
- `lucide-react`: For icons (TrendingUp, TrendingDown, Minus)
- `@/lib/utils`: For `cn` utility function

### File Structure

```
src/components/shared/modern/
├── AccessibleSignal.tsx          # Main component
├── AccessibleSignal.example.tsx  # Usage examples
└── README.md                     # This file
```

### Type Definition

```typescript
export interface AccessibleSignalProps {
  type: 'up' | 'down' | 'neutral'
  label?: string
  value?: string | number
  showIcon?: boolean
  showPattern?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animated?: boolean
}
```

## Design Guidelines

### When to Use

- **Stock price changes**: Show daily/weekly/monthly price movements
- **Market metrics**: Display index changes, volume changes
- **Portfolio performance**: Show gain/loss indicators
- **Data comparisons**: Compare values with directional indicators

### Best Practices

1. **Use patterns for accessibility**: Always keep `showPattern={true}` for production use
2. **Provide context**: Use `label` prop to explain what the value represents
3. **Choose appropriate size**: Use `sm` for compact displays, `md` for cards, `lg` for emphasis
4. **Animate sparingly**: Use `animated` prop only for real-time updates
5. **Maintain contrast**: The component uses existing color tokens with proper contrast ratios

### Do's and Don'ts

**Do:**
- Use `up` for gains, increases, positive changes
- Use `down` for losses, decreases, negative changes
- Use `neutral` for no change, flat movement
- Provide meaningful labels for screen readers

**Don't:**
- Don't use `up` for negative values (even if price went up)
- Don't override colors without updating patterns
- Don't use for non-directional data (use Badge instead)
- Don't disable patterns without accessibility review

## Examples

See `AccessibleSignal.example.tsx` for comprehensive usage examples including:
- Basic usage with all signal types
- Different sizes
- Animated signals
- Icon only mode
- Value only mode
- Stock price display
- Market metrics display
- Custom styling
- Color-blind friendly examples

## Browser Support

- Modern browsers with SVG support
- Requires JavaScript for animations (Framer Motion)
- Degrades gracefully without JS (static display)

## Future Enhancements

Potential improvements for consideration:
- Add pulse animation for live data updates
- Support for custom icon components
- Additional pattern variants
- Dark mode specific pattern adjustments
- Tooltip integration for detailed information
