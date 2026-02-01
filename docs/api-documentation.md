# fonPick API Documentation

Complete reference for fonPick REST API endpoints.

---

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Endpoints](#endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

---

## 🔗 Base URL

```
Production: https://fonpick.vercel.app/api
Development: http://localhost:3000/api
```

---

## 🔐 Authentication

Currently, all endpoints are **public** and do not require authentication.

Future versions will include API key authentication for premium features.

---

## 📦 Response Format

All API responses follow this standard format:

```typescript
interface ApiResponse<T> {
  success: boolean          // Request success status
  data?: T                  // Response payload (on success)
  error?: string            // Error message (on failure)
  meta?: {
    timestamp: string       // ISO 8601 timestamp
    cached: boolean         // Whether response was cached
    version: string         // API version
    processingTime?: number // Processing time in ms
  }
}
```

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "cached": true,
    "version": "0.1.0",
    "processingTime": 150
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Market data unavailable for the specified date",
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "version": "0.1.0"
  }
}
```

---

## 🛠 Endpoints

### 1. Complete Analysis

Get a complete market analysis combining all services.

```http
GET /api/analysis
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Date in YYYY-MM-DD format (default: today) |
| `type` | string | No | `full` or `snapshot` (default: `full`) |

#### Response

```typescript
interface AnalysisResponse {
  marketBreadth: MarketBreadthResult
  sectorRotation: SectorRotationResult
  smartMoney: SmartMoneyResult
  correlations: CorrelationResult
  insights: InsightsResult
  timestamp: string
}
```

#### Example

```bash
curl "https://fonpick.vercel.app/api/analysis?date=2025-01-15"
```

---

### 2. Actionable Insights

Get trading recommendations and market insights.

```http
GET /api/insights
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Date in YYYY-MM-DD format |

#### Response

```typescript
interface InsightsResponse {
  summary: {
    overallSentiment: 'bullish' | 'bearish' | 'neutral'
    confidence: number  // 0-100
    primaryFocus: string
  }
  questions: {
    howAboutMarket: string
    whatSectorHeavy: string
    riskOnOff: string
    whatToTrade: string
    rankingsImpact: string
    compareRankings: string
  }
  recommendations: TradingRecommendation[]
  conflicts: ConflictAlert[]
  timestamp: string
}
```

#### Example

```bash
curl "https://fonpick.vercel.app/api/insights"
```

---

### 3. Market Breadth

Get market breadth analysis data.

```http
GET /api/market-breadth
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Date in YYYY-MM-DD format |

#### Response

```typescript
interface MarketBreadthResponse {
  advanceDeclineRatio: number
  advances: number
  declines: number
  unchanged: number
  volatility: 'low' | 'medium' | 'high'
  trend: 'bullish' | 'bearish' | 'neutral'
  strength: number  // 0-100
}
```

#### Example

```bash
curl "https://fonpick.vercel.app/api/market-breadth"
```

---

### 4. Sector Rotation

Get sector rotation analysis.

```http
GET /api/sector-rotation
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Date in YYYY-MM-DD format |

#### Response

```typescript
interface SectorRotationResponse {
  leadingSectors: Sector[]
  laggingSectors: Sector[]
  rotationPattern: 'rotating' | 'concentrated' | 'divergent'
  entrySignals: SectorSignal[]
  exitSignals: SectorSignal[]
  timestamp: string
}

interface Sector {
  name: string
  change: number
  volume: number
  strength: number
}
```

#### Example

```bash
curl "https://fonpick.vercel.app/api/sector-rotation"
```

---

### 5. Smart Money

Get smart money flow analysis.

```http
GET /api/smart-money
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Date in YYYY-MM-DD format |

#### Response

```typescript
interface SmartMoneyResponse {
  foreignFlow: {
    buy: number
    sell: number
    net: number
  }
  institutionalFlow: {
    buy: number
    sell: number
    net: number
  }
  riskSignal: 'risk-on' | 'risk-off' | 'neutral'
  primaryDriver: string
  trend: 'bullish' | 'bearish' | 'neutral'
  timestamp: string
}
```

#### Example

```bash
curl "https://fonpick.vercel.app/api/smart-money"
```

---

### 6. Correlations

Get rankings vs sector correlation analysis.

```http
GET /api/correlations
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Date in YYYY-MM-DD format |

#### Response

```typescript
interface CorrelationsResponse {
  alignment: number  // 0-100
  anomalies: Anomaly[]
  concentration: {
    topSector: string
    impact: number
    explanation: string
  }
  marketDrivers: string[]
  timestamp: string
}
```

#### Example

```bash
curl "https://fonpick.vercel.app/api/correlations"
```

---

### 7. Health Check

Check system health and data availability.

```http
GET /api/health
```

#### Response

```typescript
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: {
    firebase: 'up' | 'down'
    yahooFinance: 'up' | 'down'
    cache: 'up' | 'down'
  }
  dataAvailability: {
    marketOverview: boolean
    industrySector: boolean
    investorType: boolean
    topRankings: boolean
  }
  lastUpdate: string
  version: string
}
```

#### Example

```bash
curl "https://fonpick.vercel.app/api/health"
```

---

### 8. Export Data

Export data in various formats.

```http
GET /api/export
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | `json`, `csv`, `markdown`, `txt` (default: `json`) |
| `type` | string | No | `analysis`, `insights`, `all` (default: `all`) |
| `date` | string | No | Date in YYYY-MM-DD format |

#### Response

Returns the exported data in the specified format.

#### Example

```bash
# Export as JSON
curl "https://fonpick.vercel.app/api/export?format=json&type=analysis"

# Export as CSV
curl "https://fonpick.vercel.app/api/export?format=csv"

# Export as Markdown
curl "https://fonpick.vercel.app/api/export?format=markdown&type=insights"
```

---

## ❌ Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request (invalid parameters) |
| `404` | Not Found (invalid endpoint) |
| `500` | Internal Server Error |
| `503` | Service Unavailable (data source down) |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "version": "0.1.0"
  }
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid date format` | Date parameter not in YYYY-MM-DD | Use correct date format |
| `Market data unavailable` | No data for specified date | Try a different date |
| `Service temporarily unavailable` | External API is down | Try again later |
| `Rate limit exceeded` | Too many requests | Wait before retrying |

---

## ⏱️ Rate Limiting

### Current Limits

| Type | Limit |
|------|-------|
| Public API | 60 requests/minute/IP |
| Health Check | No limit |
| Cached responses | No limit |

### Rate Limit Headers

All responses include rate limit headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705305600
```

---

## 📝 Examples

### JavaScript/TypeScript

```typescript
async function getMarketInsights() {
  const response = await fetch('https://fonpick.vercel.app/api/insights')
  const data = await response.json()

  if (data.success) {
    console.log('Market sentiment:', data.data.summary.overallSentiment)
    console.log('Confidence:', data.data.summary.confidence)
  } else {
    console.error('Error:', data.error)
  }
}
```

### Python

```python
import requests

def get_market_breadth():
    response = requests.get('https://fonpick.vercel.app/api/market-breadth')
    data = response.json()

    if data['success']:
        print(f"A/D Ratio: {data['data']['advanceDeclineRatio']}")
        print(f"Volatility: {data['data']['volatility']}")
    else:
        print(f"Error: {data['error']}")

get_market_breadth()
```

### cURL

```bash
# Get complete analysis
curl https://fonpick.vercel.app/api/analysis

# Get specific date
curl "https://fonpick.vercel.app/api/analysis?date=2025-01-15"

# Export as markdown
curl "https://fonpick.vercel.app/api/export?format=markdown" -o insights.md

# Check health status
curl https://fonpick.vercel.app/api/health
```

---

## 🔄 Caching

### Cache Durations

| Endpoint | Cache Duration |
|----------|----------------|
| `/api/analysis` | 60 seconds |
| `/api/insights` | 60 seconds |
| `/api/market-breadth` | 60 seconds |
| `/api/sector-rotation` | 60 seconds |
| `/api/smart-money` | 60 seconds |
| `/api/correlations` | 60 seconds |
| `/api/health` | No cache |
| `/api/export` | 300 seconds |

### Cache Headers

```http
Cache-Control: public, s-maxage=60, stale-while-revalidate=120
```

---

## 📈 Versioning

The API is currently at version **0.1.0**.

Future versions will be URL-versioned (e.g., `/api/v1/...`).

---

## 🆘 Support

For issues and questions:

- [GitHub Issues](https://github.com/your-org/fonPick/issues)
- [Documentation](../README.md)

---

<div align="center">

**Last Updated: 2025-01-15**

[Back to README](../README.md)

</div>
