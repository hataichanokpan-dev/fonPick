# fonPick System Design

Comprehensive documentation of fonPick's system design and architecture decisions.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Design Goals](#design-goals)
- [System Architecture](#system-architecture)
- [Technology Choices](#technology-choices)
- [Database Design](#database-design)
- [API Design](#api-design)
- [Performance Strategy](#performance-strategy)
- [Security Design](#security-design)
- [Scalability Considerations](#scalability-considerations)

---

## 🎯 Overview

fonPick is a **market intelligence platform** for the Thai Stock Exchange (SET) that provides real-time analysis through multiple services.

### Key Requirements

| Requirement | Description |
|-------------|-------------|
| **Real-time** | Sub-second response times |
| **Reliable** | 99.9% uptime target |
| **Scalable** | Handle 1000+ concurrent users |
| **Maintainable** | Easy to update and extend |
| **Secure** | Protect user data and API keys |

---

## 🎨 Design Goals

### 1. Performance

- **Target**: < 200ms API response time (p95)
- **Strategy**: Caching, parallel processing, CDN

### 2. Reliability

- **Target**: 99.9% uptime
- **Strategy**: Graceful degradation, health monitoring

### 3. Maintainability

- **Target**: < 1 day for feature additions
- **Strategy**: Service-oriented architecture, TypeScript

### 4. Developer Experience

- **Target**: 5-minute local setup
- **Strategy**: Clear documentation, standard tools

---

## 🏗 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          Client Layer                        │
│                      (Web Browser / PWA)                     │
└─────────────────────────────────────┬───────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                          CDN Layer                          │
│                       (Vercel Edge Network)                  │
└─────────────────────────────────────┬───────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                       Application Layer                      │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Next.js   │  │   React     │  │ TypeScript  │         │
│  │ App Router  │  │  Server     │  │   Strict    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    API Routes                          │  │
│  │  /analysis  /insights  /health  /export               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Services                           │  │
│  │  MarketBreadth │ SectorRotation │ SmartMoney          │  │
│  │  Correlations  │ Insights │ Integration              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬───────────────────────┘
                                      │
                  ┌───────────────────┼───────────────────┐
                  │                   │                   │
                  ▼                   ▼                   ▼
         ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
         │  Firebase   │    │   Yahoo     │    │    Cache    │
         │    RTDB     │    │  Finance    │    │   Layer     │
         └─────────────┘    └─────────────┘    └─────────────┘
```

### Component Responsibilities

| Layer | Responsibility | Technology |
|-------|----------------|------------|
| **Client** | UI rendering, user interaction | React 19, Tailwind CSS |
| **CDN** | Static asset delivery, edge caching | Vercel Edge Network |
| **Application** | Business logic, API endpoints | Next.js 16, TypeScript |
| **Services** | Data analysis, domain logic | Custom services |
| **Data** | Persistent storage, external APIs | Firebase RTDB, Yahoo Finance |

---

## 🛠 Technology Choices

### Frontend Stack

#### Next.js 16

**Why Next.js?**

- ✅ App Router for modern routing
- ✅ Server Components for performance
- ✅ API Routes for backend
- ✅ Built-in optimization
- ✅ Excellent Vercel integration

**Why App Router?**

- ✅ Nested layouts
- ✅ Streaming support
- ✅ Simpler data fetching
- ✅ Better TypeScript support

#### React 19

**Why React 19?**

- ✅ Server Components
- ✅ Improved Suspense
- ✅ Better performance
- ✅ Latest features

#### TypeScript 5.7

**Why TypeScript?**

- ✅ Type safety
- ✅ Better IDE support
- ✅ Catch errors at compile time
- ✅ Self-documenting code

**Why Strict Mode?**

- ✅ Catch more errors
- ✅ Safer refactoring
- ✅ Better code quality

#### Tailwind CSS

**Why Tailwind?**

- ✅ Rapid development
- ✅ Small bundle size
- ✅ Consistent design
- ✅ Dark mode support

### Backend Stack

#### Firebase Realtime Database

**Why Firebase RTDB?**

- ✅ Real-time updates
- ✅ Simple to use
- ✅ Good free tier
- �_easy authentication

**Why Not Firestore?**

- ❌ More complex
- ❌ Higher cost
- ❌ Not needed for our use case

#### Yahoo Finance API

**Why Yahoo Finance?**

- ✅ Free
- ✅ Reliable
- ✅ Global coverage
- ✅ No API key needed

### Development Tools

#### Vitest

**Why Vitest?**

- ✅ Fast (ESM-based)
- ✅ Compatible with Jest
- ✅ Native TypeScript
- ✅ Watch mode

#### TanStack Query

**Why TanStack Query?**

- ✅ Automatic caching
- ✅ Background updates
- ✅ Optimistic updates
- ✅ DevTools

---

## 💾 Database Design

### Firebase RTDB Structure

```
fonPick-rtdb/
│
├── marketOverview/
│   └── {YYYY-MM-DD}/
│       ├── timestamp: number
│       ├── index: number
│       ├── volume: number
│       ├── value: number
│       ├── advances: number
│       ├── declines: number
│       └── unchanged: number
│
├── industrySector/
│   └── {YYYY-MM-DD}/
│       ├── timestamp: number
│       └── sectors: [
│           { name, change, volume, value }
│       ]
│
├── investorType/
│   └── {YYYY-MM-DD}/
│       ├── timestamp: number
│       ├── foreign: { buy, sell }
│       ├── institutional: { buy, sell }
│       └── proprietary: { buy, sell }
│
└── topRankings/
    └── {YYYY-MM-DD}/
        ├── timestamp: number
        └── rankings: [
            { symbol, name, sector, change, volume }
        ]
```

### Design Decisions

#### Date-Sharded Structure

**Why sharding by date?**

- ✅ Easy data cleanup
- ✅ Simple date queries
- ✅ Natural partitioning
- ✅ Efficient storage

#### Timestamp Indexing

```
{
  "rules": {
    "marketOverview": {
      ".indexOn": ["timestamp"]
    }
  }
}
```

**Why index on timestamp?**

- ✅ Efficient sorting
- ✅ Latest data queries
- ✅ Range queries

#### Security Rules

```json
{
  "rules": {
    ".read": true,
    ".write": false
  }
}
```

**Why public read?**

- ✅ No authentication needed
- ✅ Simpler architecture
- ✅ Better performance

**Why no public write?**

- ✅ Data security
- ✅ Prevent vandalism
- ✅ Controlled updates

---

## 🔌 API Design

### RESTful Principles

| Principle | Implementation |
|-----------|----------------|
| **Resource-based** | `/api/analysis`, `/api/insights` |
| **HTTP verbs** | GET for data retrieval |
| **Stateless** | Each request contains all context |
| **Cacheable** | Cache headers on all responses |

### Response Format

**Standard format for all endpoints:**

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: ResponseMeta
}

interface ResponseMeta {
  timestamp: string
  cached: boolean
  version: string
  processingTime?: number
}
```

**Why this format?**

- ✅ Consistent across all endpoints
- ✅ Easy to parse
- ✅ Includes metadata
- ✅ Error information

### Versioning Strategy

**Current**: No versioning (v0.1.0)

**Future**: URL-based versioning

```
/api/v1/analysis
/api/v2/analysis
```

---

## ⚡ Performance Strategy

### 1. Caching Strategy

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     Hit      ┌─────────────┐
│ Browser Cache│ ──────────► │   Return    │
└──────┬──────┘              └─────────────┘
       │ Miss
       ▼
┌─────────────┐     Hit      ┌─────────────┐
│  CDN Cache  │ ──────────► │   Return    │
└──────┬──────┘              └─────────────┘
       │ Miss
       ▼
┌─────────────┐     Hit      ┌─────────────┐
│ App Cache   │ ──────────► │   Return    │
└──────┬──────┘              └─────────────┘
       │ Miss
       ▼
┌─────────────┐
│  Process    │
└─────────────┘
```

### Cache Durations

| Data Type | CDN | App | Browser |
|-----------|-----|-----|---------|
| Analysis | 60s | 60s | 30s |
| Insights | 60s | 60s | 30s |
| Health | 0s | 0s | 0s |
| Export | 300s | 300s | 60s |

### 2. Parallel Processing

```typescript
// ✅ GOOD: Parallel
const [data1, data2, data3] = await Promise.all([
  fetch1(),
  fetch2(),
  fetch3()
])

// ❌ BAD: Sequential
const data1 = await fetch1()
const data2 = await fetch2()
const data3 = await fetch3()
```

### 3. Code Splitting

```typescript
// Dynamic imports for heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />
})
```

### 4. Memory Management

**Single Data Source Architecture:**

- ✅ No data duplication between server/client
- ✅ 50-100% memory reduction
- ✅ Simpler state management

---

## 🔒 Security Design

### 1. Environment Variables

```bash
# ✅ GOOD: Environment-based
const apiKey = process.env.FIREBASE_API_KEY

# ❌ BAD: Hardcoded
const apiKey = "AIzaSyC..."  // Never commit this!
```

### 2. Input Validation

```typescript
import { z } from 'zod'

const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

function validateDate(date: unknown) {
  return DateSchema.parse(date)
}
```

### 3. Firebase Security Rules

```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null"
  }
}
```

### 4. Rate Limiting

```
Per IP: 60 requests/minute
Per API Key: 1000 requests/hour (future)
```

### 5. CORS Configuration

```typescript
// next.config.ts
headers: [
  {
    key: 'Access-Control-Allow-Origin',
    value: 'https://fonpick.vercel.app'
  }
]
```

---

## 📈 Scalability Considerations

### Current Capacity

| Metric | Target | Current |
|--------|--------|---------|
| Concurrent Users | 1,000 | ~100 |
| API Requests/Day | 100,000 | ~5,000 |
| Response Time (p95) | < 200ms | ~150ms |
| Uptime | 99.9% | 99.5% |

### Scaling Strategy

#### Vertical Scaling (Current)

- ✅ Larger server instances
- ✅ More memory
- ✅ Faster CPU

#### Horizontal Scaling (Future)

- [ ] Load balancer
- [ ] Multiple server instances
- [ ] Distributed cache

#### Database Scaling (Future)

- [ ] Read replicas
- [ ] Data partitioning
- [ ] Caching layer (Redis)

---

## 🔄 Future Architecture

### Phase 2: WebSocket Support

```
┌─────────────────────────────────────────────┐
│              WebSocket Server                │
│  (Real-time updates for connected clients)  │
└──────────────────┬──────────────────────────┘
                   │
                   ├─► Client 1
                   ├─► Client 2
                   └─► Client N
```

### Phase 3: Microservices

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Analysis   │  │  Insights   │  │   Export    │
│  Service    │  │   Service   │  │   Service   │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                  ┌─────┴─────┐
                  │   API     │
                  │  Gateway  │
                  └───────────┘
```

---

## 📊 Monitoring & Observability

### Health Checks

```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: {
    firebase: 'up' | 'down'
    yahooFinance: 'up' | 'down'
    cache: 'up' | 'down'
  }
  lastUpdate: string
}
```

### Metrics to Track

| Metric | Tool |
|--------|------|
| Response time | Vercel Analytics |
| Error rate | Sentry |
| Uptime | UptimeRobot |
| Cache hit rate | Custom |

---

## 🧪 Testing Strategy

### Test Pyramid

```
        ┌─────────┐
        │   E2E   │  ← 10% (Critical user flows)
       ─┴────────┴─
      ┌─────────────┐
      │ Integration │  ← 30% (API endpoints)
     ─┴─────────────┴─
    ┌─────────────────┐
    │     Unit        │  ← 60% (Services, utilities)
   ─┴─────────────────┴─
```

### Coverage Targets

| Area | Target |
|------|--------|
| Services | 90%+ |
| Utilities | 95%+ |
| Components | 80%+ |
| Overall | 80%+ |

---

<div align="center">

**Last Updated: 2025-01-15**

[Back to README](../README.md) | [Services Architecture](./services-architecture.md)

</div>
