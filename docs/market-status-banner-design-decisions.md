# MarketStatusBanner Design Decisions

## Overview

This document answers the key design questions posed during the MarketStatusBanner redesign process and explains the rationale behind each decision.

## Key Design Decisions

### 1. Height Strategy

**Question:** What should be the mobile and desktop height?

**Decision:**
- **Mobile**: 40px (h-10)
- **Desktop**: 48px (sm:h-12)

**Rationale:**
- 40px on mobile provides enough space for content while conserving vertical space
- 48px on desktop matches the original design and provides comfortable spacing
- The 8px difference follows the 4px spacing scale used throughout the design system
- Responsive height using Tailwind's `h-10 sm:h-12` provides smooth transitions

**Implementation:**
```tsx
className="h-10 sm:h-12"
```

---

### 2. Layout Pattern

**Question:** How should the banner be structured?

**Decision:**
Three-section horizontal flex layout:
```
[Regime Badge + Confidence] | [SET Index + Change] | [Market Status + Data Freshness]
```

**Rationale:**
- **Left section (Regime)**: Most important information, deserves prominence
- **Center section (SET Index)**: Primary data users care about, gets center stage
- **Right section (Status)**: Supporting information, less critical

**Benefits:**
- Clear visual hierarchy
- Regime is always visible (leftmost, less likely to be truncated)
- SET Index is centered and prominent
- Status information is easily accessible but not distracting

**Implementation:**
```tsx
<div className="flex items-center justify-between gap-2 sm:gap-4 h-full">
  {/* Left: Regime Badge with Confidence */}
  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
    <RegimeBadge regime={regime} confidence={confidence} />
  </div>

  {/* Center: SET Index */}
  <div className="flex items-center justify-center flex-1 min-w-0">
    <SetIndexDisplay value={setIndex} change={setChange} changePercent={setChangePercent} />
  </div>

  {/* Right: Market Status & Data Freshness */}
  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
    <MarketStatusIndicator isOpen={isMarketOpen} />
    <DataFreshnessDisplay timestamp={lastUpdate} />
  </div>
</div>
```

---

### 3. Sticky Behavior

**Question:** Should the banner always be sticky or conditional?

**Decision:**
Always sticky with `sticky top-0` and `z-50`.

**Rationale:**
- Market status is critical information users need constant access to
- Sticky positioning ensures visibility while scrolling
- Backdrop blur maintains readability over content
- z-50 ensures it stays above page content but below modals

**No Hide-on-Scroll:**
- Avoids complexity and potential jank
- Consistent user experience
- Market status is always relevant (not like navigation that can hide)

**Implementation:**
```tsx
<motion.div
  className="sticky top-0 z-50 w-full backdrop-blur-md border-b h-10 sm:h-12"
  style={{
    backgroundColor: colors.bg,
    borderColor: colors.border,
  }}
>
```

---

### 4. Visual Hierarchy

**Question:** How should different elements be prioritized visually?

**Decision:**

**Priority 1: Regime Badge (Highest)**
- Large, prominent badges
- Icon for visual recognition
- Color-coded confidence level
- Positioned on the left (first thing users see)

**Priority 2: SET Index (High)**
- Large, bold font (text-sm sm:text-base)
- Tabular numbers for alignment
- Centered for emphasis
- Color-coded change values

**Priority 3: Market Status (Medium)**
- Pulsing dot indicator
- Text label
- Positioned on the right

**Priority 4: Data Freshness (Low)**
- Small icon and text
- Subtle styling
- Only shown when timestamp available

**Rationale:**
- Regime is the most important investment decision factor
- SET index is the primary market data users want
- Status and freshness are supporting information

**Implementation:**
```tsx
// Regime Badge - Most prominent
<Badge color={confidenceColor} size="sm" className="flex items-center gap-1">
  {icon}
  <span className="font-semibold">{regime}</span>
</Badge>

// SET Index - Large and bold
<span className="text-sm font-bold text-text sm:text-base tabular-nums">
  {formatSetIndex(value)}
</span>

// Market Status - Clear but not distracting
<div className="flex items-center gap-1.5">
  <motion.div className="w-2 h-2 rounded-full" />
  <span className="text-[10px] font-medium text-text-2 xs:text-xs">
    {isOpen ? 'Market Open' : 'Market Closed'}
  </span>
</div>

// Data Freshness - Subtle
<span className="text-[10px] text-text-3 xs:text-xs tabular-nums">
  {formatTimestamp(timestamp)}
</span>
```

---

### 5. Regime Badge Design

**Question:** How should the regime badge look?

**Decision:**
Two-badge system with icons:
1. **Regime Badge**: Icon + regime name
2. **Confidence Badge**: Confidence level only

**Rationale:**
- Icons provide instant visual recognition
- Separate badges make each piece of information clear
- Color-coding confidence level adds meaning without words
- Size="sm" keeps it compact but readable

**Icons:**
- **Risk-On**: TrendingUp (green arrow up)
- **Risk-Off**: TrendingDown (red arrow down)
- **Neutral**: Minus (gray flat line)

**Confidence Colors:**
- **High**: buy (green) - Strong signal
- **Medium**: watch (yellow) - Moderate signal
- **Low**: sell (red) - Weak signal

**Implementation:**
```tsx
function RegimeBadge({ regime, confidence }: RegimeBadgeProps) {
  const icon = getRegimeIcon(regime)
  const confidenceColor = getConfidenceColor(confidence)

  return (
    <div className="flex items-center gap-2">
      {/* Regime Badge with Icon */}
      <Badge color={confidenceColor} size="sm" className="flex items-center gap-1">
        {icon}
        <span className="font-semibold">{regime}</span>
      </Badge>

      {/* Confidence Badge */}
      <Badge color={confidenceColor} size="sm" className="text-xs">
        {confidence}
      </Badge>
    </div>
  )
}
```

---

### 6. DataFreshness Integration

**Question:** Should DataFreshness be integrated into the banner or separate?

**Decision:**
Integrated into the banner, but subtle.

**Rationale:**
- Data freshness is important context for market data
- Integrating it keeps all related information together
- Subtle styling prevents it from distracting from main content
- Positioned on the right with status (less critical than regime or SET index)

**Design:**
- Small icon (Activity, 12px)
- Small text (10px on mobile, 12px on desktop)
- Muted color (text-text-3)
- Only shown when timestamp is available
- Condensed format ("2m", "1h", "Just now")

**Implementation:**
```tsx
function DataFreshnessDisplay({ timestamp }: DataFreshnessDisplayProps) {
  if (!timestamp) return null

  return (
    <div className="flex items-center gap-1.5">
      <Activity className="w-3 h-3 text-text-3" />
      <span className="text-[10px] text-text-3 xs:text-xs tabular-nums">
        {formatTimestamp(timestamp)}
      </span>
    </div>
  )
}
```

---

### 7. Market Status Icons

**Question:** What icons should be used for market status?

**Decision:**
Pulsing dot + text label.

**Rationale:**
- Pulsing dot provides visual feedback that market is live
- Green dot = open, gray dot = closed
- Text label provides clarity
- Animation draws attention without being distracting

**Alternative Considered:**
- Eye icon (open/closed) - Less intuitive
- Clock icon - Doesn't convey "open" vs "closed"
- Door/gate icon - Too abstract

**Implementation:**
```tsx
function MarketStatusIndicator({ isOpen }: MarketStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: isOpen ? '#2ED8A7' : '#AEB7B3',
        }}
        animate={isOpen ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
        transition={isOpen ? { duration: 2, repeat: Infinity } : {}}
      />
      <span className="text-[10px] font-medium text-text-2 xs:text-xs">
        {isOpen ? 'Market Open' : 'Market Closed'}
      </span>
    </div>
  )
}
```

---

### 8. Background vs Transparent

**Question:** Should the banner have a background or be transparent?

**Decision:**
Semi-transparent background with regime-based color.

**Rationale:**
- Background ensures readability over page content
- Regime-based color provides visual feedback
- Low opacity (0.08) keeps it subtle
- Backdrop blur enhances readability further
- Border bottom defines the edge clearly

**Colors:**
- **Risk-On**: `rgba(46, 216, 167, 0.08)` - subtle green tint
- **Risk-Off**: `rgba(244, 91, 105, 0.08)` - subtle red tint
- **Neutral**: `rgba(174, 183, 179, 0.08)` - subtle gray tint

**Implementation:**
```tsx
<motion.div
  className="sticky top-0 z-50 w-full backdrop-blur-md border-b h-10 sm:h-12"
  style={{
    backgroundColor: colors.bg,  // Regime-based
    borderColor: colors.border,  // Regime-based
  }}
>
```

---

### 9. Typography

**Question:** What font sizes and weights should be used?

**Decision:**
Responsive typography with tabular numbers for data.

**Sizes:**
- **SET Index**: `text-sm sm:text-base` (14px mobile, 16px desktop)
- **Change values**: `text-xs` (12px)
- **Badges**: `text-xs` (12px)
- **Status text**: `text-[10px] xs:text-xs` (10px mobile, 12px desktop)
- **Freshness**: `text-[10px] xs:text-xs` (10px mobile, 12px desktop)

**Weights:**
- **SET Index**: `font-bold` (700)
- **Change values**: `font-medium` (500)
- **Badges**: `font-semibold` (600)
- **Status**: `font-medium` (500)

**Special:**
- **Tabular numbers**: `tabular-nums` for consistent alignment
- **Letter spacing**: Default, except labels use `tracking-wide` from Badge

**Rationale:**
- Larger SET index makes it the focal point
- Tabular numbers prevent jitter when values change
- Responsive sizing ensures readability on all devices
- Font weights create clear hierarchy

---

### 10. Mobile Optimization

**Question:** How should the banner behave on small screens?

**Decision:**
Progressive enhancement with mobile-first approach.

**Mobile (< 640px):**
- Height: 40px (h-10)
- Padding: 12px horizontal, 6px vertical (px-3 py-1.5)
- Gap: 8px (gap-2)
- Text sizes: Smaller (10-12px)
- Badges: Size="sm"

**Desktop (≥ 640px):**
- Height: 48px (sm:h-12)
- Padding: 16px horizontal, 8px vertical (sm:px-4 sm:py-2)
- Gap: 16px (sm:gap-4)
- Text sizes: Larger (12-16px)
- Badges: Size="sm" (same)

**Rationale:**
- Mobile-first ensures mobile is not an afterthought
- Progressive enhancement adds comfort on larger screens
- Touch targets remain adequate on mobile
- Information hierarchy preserved across all sizes

---

## Summary Table

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Height** | 40px mobile, 48px desktop | Conserves space on mobile, comfortable on desktop |
| **Layout** | 3-section: Regime \| SET \| Status | Clear hierarchy, regime most important |
| **Sticky** | Always sticky | Market status is always relevant |
| **Regime** | 2 badges with icon | Instant recognition, confidence level clear |
| **SET Index** | Centered, prominent, tabular nums | Primary data, consistent alignment |
| **Status** | Pulsing dot + text | Visual feedback, clear label |
| **Freshness** | Subtle, integrated | Important context, not distracting |
| **Background** | Semi-transparent, regime-colored | Readability + visual feedback |
| **Typography** | Responsive, tabular nums | Readable on all devices, no jitter |
| **Mobile** | Progressive enhancement | Mobile-first approach |

---

## Design Principles Applied

1. **Mobile-First**: Design for smallest screens first, enhance for larger
2. **Progressive Enhancement**: Start with basic functionality, add features for larger screens
3. **Visual Hierarchy**: Most important information most prominent
4. **Clarity Over Density**: Better to be clear than to cram information
5. **Consistent Spacing**: Follow 4px spacing scale throughout
6. **Touch-Friendly**: Adequate spacing and sizing for touch targets
7. **Accessibility**: Semantic HTML, ARIA labels, sufficient contrast
8. **Performance**: Minimal re-renders, efficient animations

---

## Future Considerations

1. **Dark Mode**: Ensure colors work well in both light and dark modes
2. **Internationalization**: Prepare for Thai language support (longer text)
3. **Animation**: Consider entrance animations for regime changes
4. **Compact Mode**: Add option for even smaller banner on mobile
5. **Customization**: Allow users to customize which sections are shown
