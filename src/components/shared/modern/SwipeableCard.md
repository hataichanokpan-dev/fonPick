# SwipeableCard Component

A swipeable card component with gesture support using Framer Motion for the finPick project.

## Features

- **Horizontal swipe gestures** using Framer Motion `drag="x"`
- **Left swipe action** (delete/sell) - reveals red background with optional icon
- **Right swipe action** (add/buy) - reveals green background with optional icon
- **Visual feedback** during swipe (background colors revealed progressively)
- **Threshold-based actions** - swipe past configurable threshold to trigger
- **Spring animations** - smooth snap back or complete action animations
- **Haptic feedback** - optional vibration on mobile devices
- **Disabled state** - disable dragging when needed
- **Subtle rotation effect** - card tilts slightly during drag
- **Full accessibility** - ARIA labels and keyboard support

## Installation

The component uses existing dependencies in the project:

```bash
# Already installed
npm install framer-motion lucide-react clsx
```

## Usage

### Basic Example

```tsx
import { SwipeableCard } from '@/components/shared'

function MyComponent() {
  return (
    <SwipeableCard
      onSwipeLeft={() => console.log('Deleted')}
      onSwipeRight={() => console.log('Saved')}
      leftAction={{ label: 'Delete' }}
      rightAction={{ label: 'Save' }}
    >
      <div className="p-4">
        <h3>Swipe me!</h3>
      </div>
    </SwipeableCard>
  )
}
```

### Custom Icons and Colors

```tsx
import { Trash, Star } from 'lucide-react'

<SwipeableCard
  onSwipeLeft={handleDelete}
  onSwipeRight={handleSave}
  leftAction={{
    icon: <Trash className="w-5 h-5" />,
    label: 'Remove',
    color: '#ef4444'
  }}
  rightAction={{
    icon: <Star className="w-5 h-5" />,
    label: 'Favorite',
    color: '#f59e0b'
  }}
>
  {/* content */}
</SwipeableCard>
```

### Stock Trading Interface

```tsx
import { TrendingUp, TrendingDown } from 'lucide-react'

<SwipeableCard
  onSwipeLeft={() => sellStock(symbol)}
  onSwipeRight={() => buyStock(symbol)}
  leftAction={{
    icon: <TrendingDown className="w-5 h-5" />,
    label: 'Sell'
  }}
  rightAction={{
    icon: <TrendingUp className="w-5 h-5" />,
    label: 'Buy'
  }}
  threshold={80}
>
  <div className="p-4">
    <span className="font-bold">{symbol}</span>
    <span>${price}</span>
  </div>
</SwipeableCard>
```

### Disabled State

```tsx
<SwipeableCard
  disabled
  leftAction={{ label: 'Cannot delete' }}
  rightAction={{ label: 'Cannot save' }}
>
  {/* content */}
</SwipeableCard>
```

### With Haptic Feedback

```tsx
<SwipeableCard
  onSwipeLeft={handleAction}
  hapticFeedback={true}
  leftAction={{ label: 'Dismiss' }}
>
  {/* content */}
</SwipeableCard>
```

### One-Sided Swipe

```tsx
// Right swipe only
<SwipeableCard
  onSwipeRight={handleSave}
  rightAction={{ label: 'Save' }}
>
  {/* content */}
</SwipeableCard>

// Left swipe only
<SwipeableCard
  onSwipeLeft={handleDelete}
  leftAction={{ label: 'Delete' }}
>
  {/* content */}
</SwipeableCard>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Card content (required) |
| `onSwipeLeft` | `() => void` | - | Callback when left swipe threshold is reached |
| `onSwipeRight` | `() => void` | - | Callback when right swipe threshold is reached |
| `leftAction` | `ActionConfig` | - | Left swipe action configuration |
| `rightAction` | `ActionConfig` | - | Right swipe action configuration |
| `threshold` | `number` | `100` | Swipe distance in pixels to trigger action |
| `className` | `string` | - | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable swipe functionality |
| `hapticFeedback` | `boolean` | `false` | Enable vibration on mobile |

### ActionConfig

```typescript
interface ActionConfig {
  icon?: React.ReactNode  // Custom icon (default: Trash for left, Star for right)
  label: string          // Action label text (required)
  color?: string         // Background color (default: 'bg-down-primary' or 'bg-up-primary')
}
```

## Visual Design

### Colors

The component uses the finPick design system colors:

- **Default left action**: `bg-down-primary` (`#ff6b6b` - red)
- **Default right action**: `bg-up-primary` (`#4ade80` - green)
- **Card background**: `bg-surface` (`#111827`)
- **Card border**: `border-border-subtle` (`#1f2937`)

### Animations

- **Drag rotation**: Subtle tilt (`-10deg` to `10deg`) during drag
- **Scale effect**: Slight shrink (`0.95`) at extremes
- **Spring physics**: `stiffness: 300, damping: 25` for snap back
- **Drag elasticity**: `0.1` for constrained movement

### Layout

```
┌─────────────────────────────────────┐
│ ┌───────────┐ ┌─────────────────┐   │
│ │   LEFT    │ │    CARD         │   │
│ │  ACTION   │ │   CONTENT       │   │
│ │ (hidden)  │ │                 │   │
│ └───────────┘ └─────────────────┘   │
│               ┌───────────┐          │
│               │  RIGHT    │          │
│               │  ACTION   │          │
│               │ (hidden)  │          │
│               └───────────┘          │
└─────────────────────────────────────┘
```

## Accessibility

- **ARIA labels**: Automatically generated based on configured actions
- **aria-disabled**: Set to `true` when disabled prop is `true`
- **Keyboard navigation**: Tab index managed (disabled when card is disabled)
- **Focus styles**: Inherits focus styles from parent design system

### ARIA Label Example

```tsx
// With both actions
aria-label="Swipeable card. Swipe left to delete or right to save"

// With only right action
aria-label="Swipeable card. Swipe right to save"

// Disabled
aria-disabled="true"
```

## File Structure

```
src/components/shared/modern/
├── SwipeableCard.tsx          # Main component
├── SwipeableCard.example.tsx  # Usage examples
├── SwipeableCard.test.tsx     # Test file
└── SwipeableCard.md           # This file
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { SwipeableCardProps } from '@/types'

const props: SwipeableCardProps = {
  children: <div>Content</div>,
  onSwipeLeft: () => {},
  leftAction: { label: 'Delete' },
  threshold: 100,
}
```

## Browser Support

- Modern browsers with Framer Motion support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Haptic feedback requires `navigator.vibrate` API support

## Performance Considerations

- Uses `useMotionValue` and `useTransform` for optimal performance
- Minimal re-renders during drag operations
- Spring animations are GPU-accelerated
- Haptic feedback is optional and only triggers on threshold completion

## Mobile Considerations

- **Touch-friendly**: Works naturally with touch gestures
- **Haptic feedback**: Optional vibration for better user feedback
- **Viewport safety**: Respects safe areas with `env(safe-area-inset-*)`
- **Performance**: Optimized for mobile hardware acceleration

## Examples

See `SwipeableCard.example.tsx` for comprehensive usage examples including:

1. Basic swipeable cards with default icons
2. Custom icons and colors
3. Stock trading interface
4. Disabled state
5. Haptic feedback
6. Task list with actions
7. One-sided swipe (left or right only)

## Best Practices

1. **Always provide callbacks** if you configure actions
   ```tsx
   // Good
   <SwipeableCard
     onSwipeLeft={handleDelete}
     leftAction={{ label: 'Delete' }}
   />

   // Bad - action configured but no callback
   <SwipeableCard
     leftAction={{ label: 'Delete' }}
   />
   ```

2. **Use meaningful labels** for accessibility
   ```tsx
   // Good
   leftAction={{ label: 'Remove from watchlist' }}

   // Less helpful
   leftAction={{ label: 'X' }}
   ```

3. **Provide visual context** in card content
   ```tsx
   <SwipeableCard onSwipeLeft={handleDelete} leftAction={{ label: 'Delete' }}>
     <div className="p-4">
       <p className="text-sm text-text-secondary">
         Swipe left to delete this item
       </p>
     </div>
   </SwipeableCard>
   ```

4. **Consider threshold** based on use case
   ```tsx
   // Smaller threshold for quick actions
   <SwipeableCard threshold={60}>

   // Larger threshold to prevent accidental actions
   <SwipeableCard threshold={150}>
   ```

## Related Components

- `AccessibleSignal` - For displaying up/down/neutral signals
- `CompactCard` - For non-interactive card layouts
- `Card` - Base card component with flexible structure

## License

Part of the finPick project.
