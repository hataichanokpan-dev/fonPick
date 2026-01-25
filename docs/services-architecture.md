# fonPick Services Architecture

## Overview

fonPick is a Next.js 16 application with Firebase Realtime Database backend, providing comprehensive market analysis for the Thai stock market (SET). The architecture follows a modular, service-oriented design with clear separation of concerns.

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend Framework | Next.js | 16.0 (App Router) |
| UI Library | React | 19.0 |
| Database | Firebase Realtime Database | 11.0 |
| Styling | Tailwind CSS | 3.4 |
| Validation | Zod | 3.23 |
| Data Visualization | Recharts | 2.12 |
| Finance Data | yahoo-finance2 | 3.12 |
| Icons | lucide-react | 0.344 |
| Testing | Vitest | 2.1 |

---

## Architecture Diagram

```
fonPick Application
============================================================

┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Home     │  │  Search    │  │   Stock    │            │
│  │   Page     │  │   Page     │  │  Details   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ /analysis  │  │ /insights  │  │ /health    │            │
│  ├────────────┤  ├────────────┤  ├────────────┤            │
│  │ /breadth   │  │ /sector    │  │ /export    │            │
│  ├────────────┤  ├────────────┤  ├────────────┤            │
│  │ /smart-mny │  │ /correlate │  │            │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer (Business Logic)             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           Integration Service (Combined Analysis)       │ │
│  │  - Orchestrates all services                           │ │
│  │  - Combines results into complete picture              │ │
│  └───────────────────────────────────────────────────────┘ │
│                            │                                │
│         ┌──────────────────┼──────────────────┐            │
│         ▼                  ▼                  ▼            │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐      │
│  │  Market    │    │  Sector    │    │  Smart     │      │
│  │  Breadth   │    │ Rotation   │    │  Money     │      │
│  │  Service   │    │  Service   │    │  Service   │      │
│  └────────────┘    └────────────┘    └────────────┘      │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            ▼                                │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐      │
│  │Correlation │    │ Insights   │    │  Export    │      │
│  │  Service   │    │ Generator  │    │  Service   │      │
│  └────────────┘    └────────────┘    └────────────┘      │
│                            │                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Support Services                          │ │
│  │  - Health Check  - Validation  - Monitoring            │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │            RTDB Client (lib/rtdb/client.ts)            │ │
│  │  - rtdbGet()         - fetchWithFallback()             │ │
│  │  - Error handling  - Data freshness checks             │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Firebase Realtime Database                      │
│  /marketOverview/{date}    /industrySector/{date}           │
│  /investorType/{date}      /topRankings/{date}              │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
fonPick/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── analysis/             # Combined analysis endpoint
│   │   │   ├── insights/             # Actionable insights endpoint
│   │   │   ├── market-breadth/       # Market breadth endpoint
│   │   │   ├── sector-rotation/      # Sector rotation endpoint
│   │   │   ├── smart-money/          # Smart money endpoint
│   │   │   ├── correlations/         # Correlations endpoint
│   │   │   ├── health/               # Health check endpoint
│   │   │   └── export/               # Export endpoint
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── search/                   # Search page
│   │   └── stock/[symbol]/           # Stock details page
│   │
│   ├── components/                   # React Components
│   │   ├── home/                     # Home page components
│   │   ├── stock/                    # Stock page components
│   │   ├── shared/                   # Shared components
│   │   └── analysis/                 # Analysis components
│   │
│   ├── services/                     # Business Logic Services
│   │   ├── market-regime/            # Market regime detection
│   │   ├── verdict/                  # Verdict engine
│   │   ├── market-breadth/           # Market breadth analysis
│   │   ├── sector-rotation/          # Sector rotation analysis
│   │   ├── smart-money/              # Smart money analysis
│   │   ├── correlations/             # Correlation analysis
│   │   ├── insights/                 # Insights generation
│   │   ├── integration/              # Service integration
│   │   ├── validation/               # Schema validation
│   │   ├── testing/                  # Test utilities
│   │   ├── monitoring/               # Performance monitoring
│   │   ├── health-check.ts           # Health check service
│   │   └── export/                   # Export utilities
│   │
│   ├── lib/                          # Library Code
│   │   ├── api-cache.ts              # API caching utilities
│   │   ├── design/                   # Design system
│   │   ├── firebase/                 # Firebase configuration
│   │   ├── performance.ts            # Performance tracking
│   │   ├── rtdb/                     # RTDB client and helpers
│   │   ├── services/                 # Legacy service stubs
│   │   └── yahoo-finance/            # Yahoo Finance integration
│   │
│   └── types/                        # TypeScript Type Definitions
│       ├── market.ts                 # Market types
│       ├── stock.ts                  # Stock types
│       ├── verdict.ts                # Verdict types
│       ├── market-breadth.ts         # Breadth types
│       ├── sector-rotation.ts        # Sector types
│       ├── smart-money.ts            # Smart money types
│       ├── insights.ts               # Insights types
│       ├── correlation.ts            # Correlation types
│       └── rtdb.ts                   # RTDB data types
│
├── docs/                             # Documentation
├── public/                           # Static assets
└── tests/                            # Test files
```

---

## Service Layer Architecture

### Core Analysis Services

#### 1. Market Breadth Service (`src/services/market-breadth/`)

**Purpose**: Analyze market breadth using advance/decline ratios and volatility metrics.

**Files**:
- `analyzer.ts` - Main analysis logic
- `calculator.ts` - Metrics calculation

**Key Functions**:
```typescript
analyzeMarketBreadth(input: {
  current: RTDBMarketOverview
  historical?: RTDBMarketOverview[]
}): MarketBreadthAnalysis
```

**Output**:
- `status`: Bullish/Bearish/Neutral
- `volatility`: Aggressive/Moderate/Calm
- `metrics`: AD ratio, advances, declines, new highs/lows
- `trend`: Up/Down/Sideways
- `confidence`: 0-100 score

---

#### 2. Sector Rotation Service (`src/services/sector-rotation/`)

**Purpose**: Detect sector rotation patterns and identify leading/lagging sectors.

**Files**:
- `analyzer.ts` - Main analysis logic
- `detector.ts` - Rotation pattern detection
- `mapper.ts` - Sector mapping utilities

**Key Functions**:
```typescript
analyzeSectorRotation(input: {
  sectors: RTDBIndustrySector
  rankings?: RTDBTopRankings
  historical?: RTDBIndustrySector[]
}): SectorRotationAnalysis
```

**Output**:
- `leadership`: Leaders, laggards, market driver
- `pattern`: Rotation pattern type
- `regimeContext`: Current market regime
- `focusSectors`: Sectors to focus on
- `avoidSectors`: Sectors to avoid
- `entrySignals`/`exitSignals`: Trading signals

---

#### 3. Smart Money Service (`src/services/smart-money/`)

**Purpose**: Track foreign and institutional investor flows for risk-on/off detection.

**Files**:
- `signal.ts` - Signal generation logic
- `scorer.ts` - Smart money scoring

**Key Functions**:
```typescript
analyzeSmartMoney(input: {
  current: RTDBInvestorType
  historical?: RTDBInvestorType[]
  options?: { includePropTrading: boolean }
}): SmartMoneyAnalysis
```

**Output**:
- `combinedSignal`: Bullish/Bearish/Neutral
- `riskSignal`: Risk-On/Risk-Off
- `score`: -10 to +10 score
- `investors`: Foreign, institution, retail, prop analysis
- `primaryDriver`: Which investor type is driving

---

#### 4. Correlations Service (`src/services/correlations/`)

**Purpose**: Analyze relationship between top rankings and sector performance.

**Files**:
- `analyzer.ts` - Correlation analysis logic

**Key Functions**:
```typescript
analyzeRankingsSectorCorrelation(input: {
  rankings: RTDBTopRankings
  sectors: RTDBIndustrySector
}): RankingsVsSectorAnalysis

analyzeRankingsImpact(input: {
  rankings: RTDBTopRankings
  sectors: RTDBIndustrySector
}): RankingsImpactAnalysis
```

**Output**:
- Rankings vs sector correlation
- Rankings concentration analysis
- Anomaly detection
- Impact assessment

---

#### 5. Insights Service (`src/services/insights/`)

**Purpose**: Generate actionable insights from all analysis results.

**Files**:
- `generator.ts` - Insights generation logic
- `qna-engine.ts` - Question answering engine

**Key Functions**:
```typescript
generateActionableInsights(input: InsightInputs): ActionableInsights
```

**Output**:
- `trading`: Trading recommendation (Buy/Sell/Hold)
- `answers`: All 6 investment question answers
- `themes`: Key investment themes
- `warnings`: Risk warnings
- `sectorFocus`: Sector-specific recommendations

---

### Integration Service

#### Combined Analysis Service (`src/services/integration/`)

**Purpose**: Orchestrate all services and provide complete market analysis.

**Key Functions**:
```typescript
getCompleteMarketAnalysis(options?: {
  date?: string
  historicalDays?: number
  includeRankings?: boolean
  measurePerformance?: boolean
}): Promise<CompleteMarketAnalysis>

getQuickMarketSnapshot(date?: string): Promise<QuickSnapshot>

getSectorFocus(date?: string): Promise<SectorFocusData>
```

**Output**:
- `breadth`: Market breadth analysis
- `sectorRotation`: Sector rotation analysis
- `smartMoney`: Smart money analysis
- `correlation`: Rankings vs sector correlation
- `rankingsImpact`: Rankings impact analysis
- `insights`: Combined actionable insights
- `meta`: Analysis metadata

---

### Support Services

#### Health Check Service (`src/services/health-check.ts`)

**Purpose**: Monitor system health and data availability.

**Key Functions**:
```typescript
performHealthCheck(options?: {
  maxDataAge?: number
  timeout?: number
  includeResponseTimes?: boolean
  date?: string
}): Promise<HealthCheckResult>

quickHealthCheck(date?: string): Promise<QuickHealthResult>

checkDataFreshness(maxAge?: number): Promise<FreshnessResult>
```

**Output**:
- Data source health (freshness, availability)
- Service health (response times)
- System metrics
- Warnings and recommendations

---

#### Export Service (`src/services/export/`)

**Purpose**: Export insights and analysis data in various formats.

**Key Functions**:
```typescript
exportInsights(data: ActionableInsights, options: {
  format: ExportFormat
  filename: string
}): ExportResult

exportCompleteAnalysis(data: CompleteMarketAnalysis, options: {
  format: ExportFormat
  filename: string
}): ExportResult
```

**Supported Formats**:
- JSON
- CSV
- Markdown
- Plain text

---

#### Validation Service (`src/services/validation/`)

**Purpose**: Validate data schemas and signals.

**Files**:
- `schema-validator.ts` - Schema validation using Zod
- `signal-validator.ts` - Signal validation

---

#### Monitoring Service (`src/services/monitoring/`)

**Purpose**: Track performance metrics and operation timings.

**Files**:
- `performance.ts` - Performance tracking utilities

---

## Data Flow

### 1. Analysis Request Flow

```
Client Request
      │
      ▼
┌─────────────┐
│ API Route   │ - Validates parameters
└─────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  Combined Analysis Service          │
│  - Orchestrates all services        │
│  - Fetches data from RTDB           │
└─────────────────────────────────────┘
      │
      ├──► Market Breadth ──────┐
      ├──► Sector Rotation ─────┤
      ├──► Smart Money ─────────┤
      ├──► Correlations ────────┤
      └──► Insights ────────────┤
                               │
                               ▼
                    ┌──────────────────┐
                    │  Combine Results │
                    └──────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  Return Response │
                    └──────────────────┘
```

### 2. Data Fetching Flow

```
Service Request
      │
      ▼
┌─────────────────────────────────────┐
│  RTDB Client (lib/rtdb/client.ts)   │
└─────────────────────────────────────┘
      │
      ├──► rtdbGet(path)
      │    │
      │    ├──► Fetch from RTDB
      │    ├──► Handle errors
      │    └──► Return data or null
      │
      └──► fetchWithFallback(primary, fallback)
           │
           ├──► Try primary path
           ├──► Fall back to previous data
           └──► Return best available data
```

---

## Firebase Realtime Database Structure

```
fonPick-rtdb/
├── marketOverview/
│   └── {YYYY-MM-DD}/           # Date-partitioned market data
│       ├── index: number
│       ├── change: number
│       ├── volume: number
│       ├── advance: number
│       ├── decline: number
│       └── timestamp: number
│
├── industrySector/
│   └── {YYYY-MM-DD}/
│       ├── sectors: Sector[]
│       └── timestamp: number
│
├── investorType/
│   └── {YYYY-MM-DD}/
│       ├── foreign: InvestorData
│       ├── institution: InvestorData
│       ├── retail: InvestorData
│       ├── prop: InvestorData
│       └── timestamp: number
│
└── topRankings/
    └── {YYYY-MM-DD}/
        ├── top5Volume: RankedStock[]
        ├── top5Value: RankedStock[]
        └── timestamp: number
```

---

## API Caching Strategy

### Cache Headers

```typescript
// Standard analysis endpoints
'Cache-Control: public, s-maxage=60, stale-while-revalidate=120'

// Health check (no cache)
'Cache-Control: no-store'

// Export endpoints
'Cache-Control: public, max-age=300, stale-while-revalidate=600'
```

### Cache Implementation (`lib/api-cache.ts`)

```typescript
// Cache configurations
export const INSIGHTS_CACHE: CacheConfig = {
  maxAge: 60,
  swr: 120,
}

export const NO_CACHE: CacheConfig = {
  maxAge: 0,
  swr: 0,
}

// Helper function
export function cachedJson<T>(
  data: T,
  config: CacheConfig,
  status?: number
): NextResponse
```

---

## Error Handling Strategy

### RTDB Error Handling

```typescript
// Graceful degradation for optional data
try {
  const data = await rtdbGet(path)
  // Use data if available
} catch (error) {
  if (isPermissionDenied(error)) {
    // Silently fail for optional data
    return null
  }
  throw error
}
```

### API Error Responses

```typescript
// Consistent error format
{
  error: 'Error type',
  message: 'Detailed error message',
  timestamp: 1737758400000
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Data Not Found
- `500` - Internal Server Error

---

## Security Considerations

### Firebase Security Rules

1. **Read-only access** for public data
2. **No write access** from client
3. **Data validation** at the edge

### Environment Variables

Required environment variables (`.env.local`):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

### Best Practices

1. No hardcoded secrets
2. All user input validation
3. Rate limiting considerations
4. HTTPS only in production

---

## Performance Optimization

### Strategies Implemented

1. **Parallel Data Fetching**: All RTDB calls run in parallel
2. **Response Caching**: CDN-level caching with SWR
3. **Lazy Loading**: Components load data only when needed
4. **Code Splitting**: Service modules loaded on demand
5. **Tree Shaking**: Unused code eliminated

### Monitoring

```typescript
// Performance tracking (lib/performance.ts)
measurePerformance('operation-name', async () => {
  // Operation to measure
})
```

---

## Testing Strategy

### Test Files

- `src/services/smart-money/scorer.test.ts`
- `src/services/sector-rotation/detector.test.ts`
- `src/services/correlations/analyzer.test.ts`

### Test Commands

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run tests with coverage
```

---

## Deployment

### Build Process

```bash
npm run build         # Production build
npm start             # Start production server
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in Firebase credentials
3. Run `npm install`
4. Run `npm run dev` for development

### Production Checklist

- [ ] Environment variables configured
- [ ] Firebase security rules deployed
- [ ] CDN caching configured
- [ ] Error monitoring set up
- [ ] Performance monitoring enabled

---

## Future Enhancements

### Phase 6 Potential Features

1. WebSocket support for real-time updates
2. User authentication for personalized views
3. Advanced charting capabilities
4. Historical trend analysis
5. Backtesting framework
6. Alert system for significant signals
7. Mobile app (React Native)

---

## Appendix: Service Dependencies

```
Combined Analysis Service
├── Market Breadth Service (independent)
├── Sector Rotation Service (independent)
├── Smart Money Service (independent)
├── Correlations Service (requires: Sector + Rankings)
└── Insights Service (requires: all above)

Health Check Service (independent)
Export Service (requires: Combined Analysis)
Validation Service (utility for all services)
Monitoring Service (utility for all services)
```
