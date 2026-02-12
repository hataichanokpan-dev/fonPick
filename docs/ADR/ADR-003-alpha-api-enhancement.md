# ADR-003: Alpha API Enhancement with Quality Metadata

**Status:** Accepted
**Date:** 2025-01-XX
**Context:** fonPick Stock Screening System
**Related:** ADR-001 (Initial Architecture), ADR-002 (Data Quality Framework)

---

## Context

The Alpha API provides target price valuations (intrinsic value, forecasts, DCF) that are critical for calculating entry plans. However, the current implementation has several issues:

1. **No Data Quality Visibility**: Users cannot tell if a value is from the API, calculated, or estimated
2. **Missing Data Handling**: When API returns partial data, there's no systematic fallback mechanism
3. **No Derived Value Tracking**: When we calculate missing values (e.g., AvgForecast from DCF), this isn't tracked
4. **Tight Coupling**: Components directly access nullable properties without quality metadata

Example scenario:
```typescript
// Current: No indication of data quality
const target = valuationTargets.avgForecast  // Is this from API? Estimated? Missing?

// Desired: Clear quality metadata
const target = valuationV2.avgForecast
// target.value = 42.5
// target.source = 'api' | 'calculated' | 'estimated' | 'missing'
// target.confidence = 1.0 | 0.8 | 0.5 | 0
```

---

## Decision

Implement a **V2 API response format** with comprehensive quality metadata:

### 1. Schema Evolution

**V1 Schema (Legacy - Deprecated):**
```typescript
interface ValuationTargets {
  intrinsicValue: number
  lowForecast: number
  avgForecast: number
  highForecast: number
  dcfValue: number
  relativeValue?: number
}
```

**V2 Schema (Enhanced):**
```typescript
interface QualityValue<T> {
  value: T | null
  source: 'api' | 'calculated' | 'estimated' | 'missing'
  confidence?: number  // 0-1
  reliability?: 'high' | 'medium' | 'low'
}

interface ValuationTargetsV2 {
  intrinsicValue: QualityValue<number>
  lowForecast: QualityValue<number>
  avgForecast: QualityValue<number>  // PRIMARY TARGET
  highForecast: QualityValue<number>
  dcfValue: QualityValue<number>
  relativeValue?: QualityValue<number>

  // Derived values (calculated when source data is missing)
  derivedValues?: {
    intrinsicValueEst?: number
    avgForecastEst?: number
  }

  // Overall quality assessment
  quality: {
    level: 'complete' | 'partial' | 'limited' | 'insufficient'
    score: number  // 0-100
    missingFields: string[]
  }
}
```

### 2. API Response Format

The `/api/stocks/[symbol]/alpha` route now returns **both v1 and v2**:

```typescript
interface EnhancedAlphaAPIResponse {
  success: boolean

  // V1 format (backward compatibility)
  data?: {
    IntrinsicValue: number
    LowForecast: number
    AvgForecast: number
    HighForecast: number
    DCFValue: number
    RelativeValue: number
  }

  // V2 format (new)
  v2?: ValuationTargetsV2

  cached?: boolean
  currentPrice?: number
}
```

### 3. Fallback Calculation Strategy

When API returns partial data, the transformer calculates derived values:

| Missing Field | Fallback Calculation | Confidence |
|--------------|---------------------|-------------|
| `intrinsicValue` | `DCFValue × 1.1` (IV typically 10% above DCF) | 0.5 (low) |
| `avgForecast` | `DCFValue × 0.93` (analysts typically 7% below DCF) | 0.5 (low) |
| `avgForecast` (no DCF) | `IntrinsicValue × 0.9` | 0.5 (low) |
| Both IV & Avg | `currentPrice × 1.08` (8% premium) | 0.3 (very low) |

### 4. Quality Assessment Scoring

Each field has a weight based on importance:

| Field | Weight | Priority |
|-------|--------|----------|
| `avgForecast` | 25 pts | REQUIRED (primary target) |
| `dcfValue` | 15 pts | HIGH (fundamental anchor) |
| `intrinsicValue` | 15 pts | HIGH (fundamental anchor) |
| `highForecast` | 5 pts | MEDIUM (bullish upside) |
| `lowForecast` | 3 pts | LOW (risk awareness) |
| `relativeValue` | 2 pts | LOWEST (context) |

**Quality Levels:**
- **Complete** (90-100%): All required fields present
- **Partial** (70-89%): Missing some optional fields
- **Limited** (50-69%): Missing some required fields, using estimates
- **Insufficient** (< 50%): Cannot generate reliable entry plan

---

## Implementation

### Phase 1: Core Infrastructure ✅
1. ✅ Created `ValuationTargetsV2` type in `src/lib/entry-plan/valuation/transformer.ts`
2. ✅ Implemented `transformToValuationTargetsV2()` function
3. ✅ Added helper functions: `getValuationValue()`, `hasSufficientValuation()`, `getPrimaryTarget()`

### Phase 2: API Route Enhancement ✅
1. ✅ Updated `/api/stocks/[symbol]/alpha` route
2. ✅ Returns both v1 (`data`) and v2 (`v2`) formats
3. ✅ Accepts `currentPrice` query param for fallback calculations
4. ✅ Enhanced cache key includes current price

### Phase 3: UI Components ✅
1. ✅ Created `src/components/stock/screening/data-quality.tsx` with:
   - `DataQualityBadge` - Quality level indicator
   - `ConfidencePercent` - Visual confidence score
   - `DataQualityBanner` - Warnings for incomplete data
   - `SimplePriceBar` - Price visualization
2. ✅ Updated `EntryPlanCardCompact` to:
   - Accept both v1 and v2 props
   - Show estimated/derived indicators
   - Display quality badges
3. ✅ Added `v2ToDataQualityInput()` helper for data-quality integration

### Phase 4: Documentation (In Progress)
1. ✅ This ADR document
2. ⏳ Update consumer-facing guides
3. ⏳ Component migration checklist

---

## Migration Guide

### For Component Developers

**Before (V1):**
```typescript
interface MyProps {
  valuationTargets?: ValuationTargets
}

function MyComponent({ valuationTargets }: MyProps) {
  const avg = valuationTargets?.avgForecast
  return <div>{avg || 'N/A'}</div>
}
```

**After (V2 - Recommended):**
```typescript
interface MyProps {
  valuationTargets?: ValuationTargets | ValuationTargetsV2
}

function MyComponent({ valuationTargets }: MyProps) {
  // Extract value with quality awareness
  const avgQuality = valuationTargets && 'quality' in valuationTargets
    ? (valuationTargets as ValuationTargetsV2).avgForecast
    : { value: valuationTargets?.avgForecast ?? null, source: 'api' }

  const avg = avgQuality.value ?? avgQuality.value // handle derived values
  const isEstimated = avgQuality.source === 'estimated'

  return (
    <div>
      {avg || 'N/A'}
      {isEstimated && <span className="text-amber-500">(ประมาณ)</span>}
    </div>
  )
}
```

### For API Consumers

**Fetching with V2 support:**
```typescript
// Include currentPrice for better fallback calculations
const response = await fetch(
  `/api/stocks/${symbol}/alpha?currentPrice=${currentPrice}`
)
const { data, v2 } = await response.json()

// Use v2 for new features
if (v2) {
  console.log('Quality level:', v2.quality.level)
  console.log('Avg forecast source:', v2.avgForecast.source)

  // Get primary target with fallback
  const target = v2.avgForecast.value ?? v2.derivedValues?.avgForecastEst
}

// v1 still available for backward compatibility
if (data) {
  console.log('Avg forecast (v1):', data.AvgForecast)
}
```

---

## Consequences

### Positive
1. **Better User Experience**: Users can see data quality at a glance
2. **Graceful Degradation**: System works even with partial API data
3. **Debuggable**: Clear indication of where values come from
4. **Backward Compatible**: Existing v1 consumers continue to work
5. **Type Safe**: TypeScript ensures quality metadata is handled

### Negative
1. **Complexity**: Additional layer of indirection with `QualityValue` wrapper
2. **Migration Effort**: Components need updates to use v2 format
3. **Bundle Size**: Slightly larger due to additional type definitions

### Mitigations
1. Provide helper functions (`getValuationValue()`, `getValueSourceLabel()`) to simplify access
2. Support both v1 and v2 formats during transition period
3. Clear documentation and examples for migration

---

## Alternatives Considered

### Alternative 1: Separate Quality Metadata Object
```typescript
interface ValuationWithQuality {
  values: ValuationTargets
  quality: QualityMetadata
}
```
**Rejected**: More verbose to use, requires accessing two objects for each value

### Alternative 2: Union Type for Values
```typescript
type ValuationValue = number | { value: number; quality: QualityInfo }
```
**Rejected**: Less type-safe, requires runtime type checks

### Alternative 3: No Fallback, Show Error
```typescript
if (!avgForecast) {
  throw new Error('AvgForecast required')
}
```
**Rejected**: Poor UX, system fails even when reasonable estimates are possible

---

## Future Improvements

1. **Machine Learning**: Train model to improve fallback estimates based on historical accuracy
2. **User Feedback**: Allow users to mark estimates as "accurate" or "inaccurate"
3. **Multi-Source Aggregation**: Combine data from multiple APIs (Alpha, Bloomberg, Reuters)
4. **Cache Quality Tracking**: Track how long derived values have been used without refresh

---

## References

- [Transformer Implementation](../../src/lib/entry-plan/valuation/transformer.ts)
- [Data Quality System](../../src/lib/entry-plan/data-quality.ts)
- [UI Components](../../src/components/stock/screening/data-quality.tsx)
- [API Route](../../src/app/api/stocks/[symbol]/alpha/route.ts)

---

**Decision Made By:** AI Assistant (Claude)
**Review Status:** Pending Human Review
**Next Review Date:** After 2 weeks of production use
