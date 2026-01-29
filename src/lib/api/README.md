# Stock API Module - Phase 1 Implementation

## Overview

This module provides a robust API layer for fetching Thai stock market data from the external API at `https://my-fon-stock-api.vercel.app`.

## Implementation Details

### Files Created

```
src/
├── types/
│   └── stock-api.ts              # API response types and error types
├── lib/
│   └── api/
│       ├── stock-api.test.ts     # Stock API tests (TDD - written first)
│       ├── stock-api.ts          # Stock API service implementation
│       ├── fetch-wrapper.test.ts # Fetch wrapper tests (TDD)
│       ├── fetch-wrapper.ts      # Fetch wrapper with retry logic
│       └── index.ts              # Module exports
└── utils/
    ├── validation.test.ts        # Validation tests (TDD)
    └── validation.ts             # Zod validation schemas
```

## Features

### 1. Fetch Wrapper (`fetch-wrapper.ts`)

- **Timeout handling**: 10 second default timeout
- **Automatic retry**: 2 retries with exponential backoff
- **Error classification**: Custom error types for different failure modes
- **Type safety**: Full TypeScript support

### 2. Stock API Service (`stock-api.ts`)

- **Overview endpoint**: `fetchStockOverview(symbol)`
- **Statistics endpoint**: `fetchStockStatistics(symbol)`
- **Parallel fetching**: `fetchStockData(symbol)` for both endpoints
- **Next.js caching**: 5-minute revalidation
- **Input validation**: Symbol sanitization and validation

### 3. Validation Schemas (`validation.ts`)

- **Zod schemas**: Runtime validation for all API responses
- **Type inference**: Auto-generated TypeScript types
- **Safe validation**: Fallback functions for graceful error handling

## Error Handling

### Error Types

| Type | Status Code | Retryable | Description |
|------|-------------|-----------|-------------|
| NOT_FOUND | 404 | No | Resource not found |
| TIMEOUT | 408 | Yes | Request timeout |
| RATE_LIMIT | 429 | Yes | Too many requests |
| SERVER_ERROR | 500-504 | Yes | Server errors |
| NETWORK_ERROR | - | Yes | Network failure |
| VALIDATION_ERROR | 400/0 | No | Invalid data |

### Retry Logic

- **Retryable errors**: 500, 502, 503, 504, 429, timeouts, network errors
- **Non-retryable errors**: 400, 404, validation errors
- **Exponential backoff**: 1s, 2s, 4s...

## Usage Examples

### Basic Usage

```typescript
import { fetchStockOverview, fetchStockStatistics } from '@/lib/api'

// Fetch stock overview
const overview = await fetchStockOverview('PTT')
console.log(overview.data.price.current)
console.log(overview.data.decisionBadge.label)

// Fetch stock statistics
const statistics = await fetchStockStatistics('PTT')
console.log(statistics.data.valuation.pe)
console.log(statistics.data.analyst.rating)
```

### Parallel Fetching

```typescript
import { fetchStockData } from '@/lib/api'

const [overview, statistics] = await fetchStockData('PTT')
```

### Error Handling

```typescript
import { fetchStockOverview, ApiError, ApiErrorType } from '@/lib/api'

try {
  const overview = await fetchStockOverview('INVALID')
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ApiErrorType.NOT_FOUND:
        console.log('Stock not found')
        break
      case ApiErrorType.TIMEOUT:
        console.log('Request timed out')
        break
      case ApiErrorType.SERVER_ERROR:
        console.log('Server error, please try again')
        break
    }
  }
}
```

## Testing

All tests follow TDD methodology (written first, then implementation).

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- stock-api.test.ts

# Run with coverage
npm run test:coverage
```

### Test Coverage

- Success responses
- Error handling (404, 500, timeout, network errors)
- Retry logic
- Data validation
- Input validation

## API Endpoints

### Overview API

```
GET /api/th/stocks/{symbol}/overview
```

Returns:
```typescript
{
  success: boolean
  data: {
    symbol: string
    name: string
    sector: string
    market: string
    price: {
      current: number
      change: number
      changePercent: number
      dayHigh: number
      dayLow: number
      previousClose: number
    }
    volume: {
      current: number
      average: number
      ratio: number
    }
    marketCap: string
    peRatio: number
    pbvRatio: number
    dividendYield: number
    beta: number
    decisionBadge: {
      label: string
      score: number
      type: 'bullish' | 'bearish' | 'neutral'
    }
    layerScore: {
      quality: number
      valuation: number
      timing: number
    }
    lastUpdate: string
  }
  cached: boolean
}
```

### Statistics API

```
GET /api/th/stocks/{symbol}/statistics
```

Returns comprehensive financial, valuation, performance, trading, and analyst statistics.

## Configuration

### Default Configuration

```typescript
{
  timeout: 10000,      // 10 seconds
  retries: 2,          // 2 retries (3 total attempts)
  revalidate: 300,     // 5 minutes for Next.js cache
}
```

### Custom Configuration

```typescript
import { fetchWithRetry } from '@/lib/api'

const response = await fetchWithRetry(
  'https://api.example.com/data',
  {},
  { timeout: 5000, retries: 1 }
)
```

## Type Safety

All functions are fully typed with TypeScript:

```typescript
import type {
  StockOverviewResponse,
  StockStatisticsResponse,
  ApiError,
  ApiErrorType,
} from '@/types/stock-api'
```

## Next Steps (Phase 2+)

1. Create React Query hooks for data fetching
2. Implement stock detail page components
3. Add loading and error states
4. Create data visualization components
5. Add historical data support

## Success Criteria

- [x] All API tests passing
- [x] TypeScript compilation with no errors
- [x] Can successfully fetch real stock data from external API
- [x] Proper error handling for all failure modes (404, 500, timeout)
- [x] Zod validation catches API contract violations
- [x] Comprehensive test coverage
- [x] Full type safety
- [x] Detailed documentation
