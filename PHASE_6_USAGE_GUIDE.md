# Phase 6 Components - Usage Guide

## Quick Reference

### ShareSheet Component

```tsx
import { ShareSheet } from '@/components/stock'

<ShareSheet
  symbol="PTT"
  name="PTT Public Company Limited"
  currentPrice={34.75}
  change={0.5}
  changePercent={1.46}
  onShare={(event) => {
    console.log('Shared:', event.method)
  }}
/>
```

**Props:**
- `symbol`: Stock symbol (required)
- `name`: Stock name (required)
- `currentPrice`: Current price (required)
- `change`: Price change (required)
- `changePercent`: Price change percent (required)
- `onShare`: Callback when share occurs (optional)
- `className`: Custom classes (optional)

**Features:**
- Auto-detects Web Share API support
- Falls back to custom sheet on desktop
- Social media buttons (Facebook, Twitter, Line)
- Copy link functionality
- Toast notifications

### WatchlistButton Component

```tsx
import { WatchlistButton } from '@/components/stock'

// Basic usage
<WatchlistButton symbol="PTT" />

// With count display
<WatchlistButton symbol="PTT" showCount />

// With onChange callback (for Firebase sync)
<WatchlistButton
  symbol="PTT"
  onChange={(state) => {
    console.log('Watchlist:', state.isOnWatchlist)
  }}
/>

// Controlled mode
<WatchlistButton
  symbol="PTT"
  isOnWatchlist={true}
  onChange={handleChange}
/>
```

**Props:**
- `symbol`: Stock symbol (required)
- `showCount`: Display watchlist count (optional, default: false)
- `isOnWatchlist`: Controlled state (optional)
- `onChange`: Callback on toggle (optional)
- `className`: Custom classes (optional)

**Features:**
- localStorage persistence
- Animation feedback
- Toast notifications
- Keyboard accessible
- Controlled/uncontrolled modes

### StockDataFreshness Component

```tsx
import { StockDataFreshness } from '@/components/stock'

// Basic usage
<StockDataFreshness lastUpdate="2026-01-29T12:00:00.000Z" />

// With refresh button
<StockDataFreshness
  lastUpdate="2026-01-29T12:00:00.000Z"
  onRefresh={async () => {
    await refetch()
  }}
/>

// With auto-refresh
<StockDataFreshness
  lastUpdate="2026-01-29T12:00:00.000Z"
  onRefresh={refetch}
  autoRefreshInterval={5 * 60 * 1000} // 5 minutes
/>

// Compact mode (mobile)
<StockDataFreshness
  lastUpdate="2026-01-29T12:00:00.000Z"
  compact
/>

// With loading state
<StockDataFreshness
  lastUpdate="2026-01-29T12:00:00.000Z"
  onRefresh={refetch}
  isRefreshing={isLoading}
/>
```

**Props:**
- `lastUpdate`: ISO timestamp (optional)
- `onRefresh`: Refresh callback (optional)
- `isRefreshing`: Loading state (optional, default: false)
- `autoRefreshInterval`: Auto-refresh in ms (optional)
- `compact`: Compact mode for mobile (optional, default: false)
- `className`: Custom classes (optional)

**Features:**
- Thai timezone display
- Relative time ("2m ago")
- Stale data warning (>5 min)
- Live indicator (<1 min)
- Auto-refresh support
- Manual refresh button

### useAnalytics Hook

```tsx
import { useAnalytics } from '@/hooks/useAnalytics'

function MyComponent() {
  const { trackEvent, trackPageView } = useAnalytics()

  const handleShare = (method: string) => {
    trackEvent('stock_share', {
      symbol: 'PTT',
      method: 'web-share-api',
    })
  }

  useEffect(() => {
    trackPageView('/stock/PTT')
  }, [])

  return <button onClick={() => handleShare('web-share-api')}>Share</button>
}
```

**Returns:**
- `trackEvent(name, properties)`: Track custom events
- `trackPageView(path)`: Track page views

**Features:**
- Console logging in development
- Ready for analytics provider integration
- Type-safe properties

## Integration Example

```tsx
'use client'

import { StockPageClient } from '@/app/stock/[symbol]/stock-page-client'
import { useStockData } from '@/hooks/useStockData'
import { useAnalytics } from '@/hooks/useAnalytics'
import { ShareSheet, WatchlistButton, StockDataFreshness } from '@/components/stock'

export function MyStockPage({ symbol }: { symbol: string }) {
  const { data, isLoading, error, refetch } = useStockData(symbol)
  const { trackEvent } = useAnalytics()

  if (isLoading) return <Skeleton />
  if (error) return <Error />

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-start justify-between gap-4">
        <StockHero data={data.overview} />
        <div className="flex items-center gap-2">
          <WatchlistButton
            symbol={symbol}
            onChange={(state) => trackEvent('watchlist_toggle', {
              symbol,
              action: state.isOnWatchlist ? 'add' : 'remove',
            })}
          />
          <ShareSheet
            symbol={data.overview.data.symbol}
            name={data.overview.data.name}
            currentPrice={data.overview.data.price.current}
            change={data.overview.data.price.change}
            changePercent={data.overview.data.price.changePercent}
            onShare={(event) => trackEvent('stock_share', {
              symbol,
              method: event.method,
            })}
          />
        </div>
      </div>

      {/* Data freshness */}
      <StockDataFreshness
        lastUpdate={data.overview.data.lastUpdate}
        onRefresh={refetch}
        autoRefreshInterval={5 * 60 * 1000}
      />

      {/* Rest of content */}
      <DecisionBadge badge={data.overview.data.decisionBadge} />
      <LayerScores layerScore={data.overview.data.layerScore} />
      {/* ... */}
    </div>
  )
}
```

## Styling Customization

All components use Tailwind CSS and accept a `className` prop for customization:

```tsx
// Custom button styling
<ShareSheet
  {...props}
  className="bg-blue-500 hover:bg-blue-600"
/>

// Custom text size
<StockDataFreshness
  {...props}
  className="text-lg"
/>

// Custom watchlist button
<WatchlistButton
  {...props}
  className="border-2 border-yellow-500"
/>
```

## Testing Examples

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ShareSheet } from '@/components/stock'

describe('My Component Tests', () => {
  it('should handle share', async () => {
    const handleShare = vi.fn()

    render(<ShareSheet {...props} onShare={handleShare} />)

    const button = screen.getByTestId('share-button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(handleShare).toHaveBeenCalled()
    })
  })
})
```

## Common Patterns

### 1. Loading States

```tsx
const [isSharing, setIsSharing] = useState(false)

const handleShare = async () => {
  setIsSharing(true)
  try {
    await shareContent()
  } finally {
    setIsSharing(false)
  }
}

<ShareSheet {...props} isSharing={isSharing} />
```

### 2. Error Handling

```tsx
const [error, setError] = useState<string>()

const handleRefresh = async () => {
  try {
    await refetch()
    setError(undefined)
  } catch (err) {
    setError('Failed to refresh')
  }
}

<StockDataFreshness
  {...props}
  onRefresh={handleRefresh}
/>
```

### 3. Conditional Features

```tsx
// Only show refresh button if user has permission
{hasPermission && (
  <StockDataFreshness
    {...props}
    onRefresh={hasPermission ? refetch : undefined}
  />
)}

// Show count only on large screens
<WatchlistButton
  symbol={symbol}
  showCount={isLargeScreen}
/>
```

## Performance Tips

1. **Memoize callbacks**
```tsx
const handleShare = useCallback((event) => {
  trackEvent('share', event)
}, [trackEvent])
```

2. **Use React Query for data**
```tsx
const { data, refetch } = useStockData(symbol)
```

3. **Lazy load heavy components**
```tsx
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
})
```

## Accessibility Checklist

All components include:
- [x] ARIA labels
- [x] Keyboard navigation
- [x] Focus management
- [x] Screen reader support
- [x] Semantic HTML
- [x] Color contrast (WCAG AA)

## Browser Support

- **Web Share API:** Chrome 89+, Android, Safari 15+
- **Fallback:** All modern browsers
- **localStorage:** IE11+
- **Framer Motion:** All modern browsers (with reduced motion support)

## Troubleshooting

### ShareSheet not working on desktop
- Expected: Falls back to custom sheet
- Check: Web Share API is not supported on desktop

### Watchlist not persisting
- Check: localStorage is enabled
- Check: No browser extensions blocking storage

### Data freshness not updating
- Check: lastUpdate prop is being updated
- Check: onRefresh callback is provided

## Further Reading

- [TDD Guide](../.claude/rules/testing.md)
- [Performance Guide](../.claude/rules/performance.md)
- [Coding Style](../.claude/rules/coding-style.md)
- [Component Tests](./src/components/stock/*.test.tsx)
