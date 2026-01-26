# ShimmerSkeleton Component

A loading skeleton with shimmer wave effect for placeholder content in the fonPick application.

## Features

- **Animated shimmer wave effect**: Uses Framer Motion for smooth pulse animation
- **Realistic content shapes**: Multiple variants for different UI patterns
- **Multiple variants**: text, circle, card, custom
- **Multiple lines support**: Configurable line count for text variant
- **Avatar support**: Optional avatar for card variant
- **Custom dimensions**: Full control over width/height for custom variant
- **Staggered animation delays**: Natural wave effect across elements
- **Full accessibility**: ARIA labels and screen reader support
- **Reduced motion support**: Respects user's motion preferences

## Visual Design

### Animation Effect

The shimmer effect uses a pulse animation that smoothly transitions opacity:
- **Start opacity**: 0.5 (50%)
- **End opacity**: 1.0 (100%)
- **Duration**: 1 second per cycle
- **Repeat**: Infinite with reverse (smooth back and forth)
- **Staggered delays**: 0.08s - 0.1s between elements for wave effect

### Color Palette

Uses existing design tokens from `tailwind.config.ts`:

- `bg-surface-2`: `#1f2937` (Base skeleton background)
- `bg-surface`: `#111827` (Card background for card variant)
- `border-border`: `#1f2937` (Card border)

## Installation

The component is already available via the shared components export:

```tsx
import { ShimmerSkeleton } from '@/components/shared'
// or
import { ShimmerSkeleton } from '@/components/shared/modern/ShimmerSkeleton'
```

## Usage

### Basic Text Variant

```tsx
import { ShimmerSkeleton } from '@/components/shared'

export function LoadingText() {
  return <ShimmerSkeleton variant="text" lines={3} />
}
```

### Circle Variant (Avatars, Icons)

```tsx
export function LoadingAvatar() {
  return <ShimmerSkeleton variant="circle" width={40} />
}
```

### Card Variant (Complex Layouts)

```tsx
export function LoadingCard() {
  return (
    <ShimmerSkeleton
      variant="card"
      lines={4}
      showAvatar
    />
  )
}
```

### Custom Variant (Any Size)

```tsx
export function LoadingBanner() {
  return (
    <ShimmerSkeleton
      variant="custom"
      width="100%"
      height={200}
    />
  )
}
```

### Convenience Wrappers

```tsx
import { TextSkeleton, CircleSkeleton, CardSkeleton } from '@/components/shared'

// Text skeleton
<TextSkeleton lines={2} />

// Circle skeleton
<CircleSkeleton width={48} />

// Card skeleton
<CardSkeleton lines={3} showAvatar />
```

## Props

### ShimmerSkeletonProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'circle' \| 'card' \| 'custom'` | `'text'` | Visual variant type |
| `width` | `string \| number` | `undefined` | Width for circle/custom variants |
| `height` | `string \| number` | `undefined` | Height for custom variant |
| `lines` | `number` | `3` | Number of lines for text/card variant |
| `className` | `string` | `undefined` | Additional CSS classes |
| `showAvatar` | `boolean` | `false` | Show avatar for card variant |
| `ariaLabel` | `string` | `undefined` | ARIA label for accessibility |
| `testId` | `string` | `undefined` | Test ID for testing |

## Variant Details

### Text Variant

Displays multiple skeleton lines simulating paragraphs:
- Last line is 70% width (natural line break effect)
- Each line has staggered animation delay (0.1s)
- Fixed height of 16px (h-4)

**Use cases:**
- Article content loading
- Description text
- List item descriptions

### Circle Variant

Displays circular skeleton element:
- Width and height are equal (always circular)
- Uses rounded-full class
- Single element with pulse animation

**Use cases:**
- User avatars
- Stock icons
- Badge placeholders
- Profile pictures

### Card Variant

Displays complex card layout:
- Optional avatar (40px circle)
- Header section with two lines (60% and 35% width)
- Multiple content lines (last line 80% width)
- Staggered animation delays starting from header
- Wrapped in card with border and padding

**Use cases:**
- Stock cards
- User profile cards
- Dashboard widgets
- Notification items

### Custom Variant

Fully customizable dimensions:
- Custom width and height
- Single element with pulse animation
- No default styling beyond base classes
- Full control via className prop

**Use cases:**
- Banner placeholders
- Chart placeholders
- Image placeholders
- Any custom shape

## Real-World Examples

### Stock Card Loading State

```tsx
export function StockCardLoading() {
  return (
    <div className="rounded-lg p-4 bg-surface border border-border">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CircleSkeleton width={48} />
          <div className="space-y-2">
            <TextSkeleton lines={1} />
            <TextSkeleton lines={1} />
          </div>
        </div>
        <div className="text-right space-y-2">
          <TextSkeleton lines={1} />
          <ShimmerSkeleton variant="custom" width={80} height={24} />
        </div>
      </div>
    </div>
  )
}
```

### Table Loading State

```tsx
export function TableLoading({ rows = 5, columns = 4 }) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      {/* Header */}
      <div className="grid gap-2 p-3 border-b border-border"
           style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <ShimmerSkeleton key={i} variant="text" lines={1} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid gap-2 p-3 border-t border-border"
             style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, col) => (
            <ShimmerSkeleton key={col} variant="text" lines={1} />
          ))}
        </div>
      ))}
    </div>
  )
}
```

### Dashboard Module Loading

```tsx
export function ModuleLoading({ showHeader = true }) {
  return (
    <div className="rounded-lg p-4 bg-surface border border-border space-y-3">
      {showHeader && (
        <div className="flex items-center justify-between">
          <TextSkeleton lines={1} />
          <CircleSkeleton width={24} />
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <TextSkeleton lines={1} />
            <TextSkeleton lines={1} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Accessibility

### ARIA Labels

Each skeleton automatically includes:
- `aria-label`: Descriptive label based on variant
- `aria-hidden="true"`: Hides from screen readers (loading placeholder)
- `data-testid`: For testing purposes

### Custom Labels

```tsx
<ShimmerSkeleton
  variant="text"
  lines={3}
  ariaLabel="Loading stock description"
/>
```

### Screen Reader Support

Skeleton loaders are hidden from screen readers by default (`aria-hidden="true"`) since they represent temporary loading states. When actual content loads, screen readers will announce the real content.

## Technical Implementation

### Dependencies

- `framer-motion`: For animations (already installed)
- `@/lib/utils`: For `cn` utility function

### Animation Configuration

```typescript
const shimmerAnimation = {
  initial: { opacity: 0.5 },
  animate: { opacity: 1 },
  transition: {
    repeat: Infinity,
    duration: 1,
    repeatType: 'reverse',
    ease: 'easeInOut',
  },
}
```

### Staggered Delays

Different variants use staggered delays for natural wave effect:
- Text variant: 0.1s delay per line
- Card variant: 0.05s - 0.15s base + 0.08s per line
- Circle/Custom: No delay (single element)

## Design Guidelines

### When to Use

- **Data fetching**: Show while loading API data
- **Image loading**: Placeholder for images
- **Content transitions**: Smooth transition between content states
- **Initial page load**: Reduce perceived load time

### Best Practices

1. **Match content structure**: Skeleton should match final content layout
2. **Use appropriate variant**: Choose variant that matches content type
3. **Keep animations subtle**: 1 second duration is recommended
4. **Don't overuse**: Only use for meaningful loading states
5. **Test real loads**: Verify skeleton disappears when content loads

### Do's and Don'ts

**Do:**
- Match skeleton structure to actual content
- Use consistent animation timing
- Provide proper ARIA labels
- Test with slow networks
- Combine with Suspense boundaries

**Don't:**
- Don't use for decorative elements
- Don't make animation too fast or distracting
- Don't forget to remove skeleton when content loads
- Don't use skeleton for static content
- Don't override accessibility attributes

## File Structure

```
src/components/shared/modern/
├── ShimmerSkeleton.tsx          # Main component
├── ShimmerSkeleton.example.tsx  # Usage examples
└── ShimmerSkeleton.md           # This file
```

## Browser Support

- Modern browsers with CSS Grid support
- Requires JavaScript for animations (Framer Motion)
- Degrades gracefully without JS (static display)

## Future Enhancements

Potential improvements for consideration:
- Add wave animation (gradient sweep across element)
- Support for dark mode specific colors
- Add pulse variant (scale animation)
- Support for custom animation curves
- Add progress indicator variant
- Support for skeleton transitions (AnimatePresence)
