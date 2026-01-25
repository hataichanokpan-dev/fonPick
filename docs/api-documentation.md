# fonPick API Documentation

## Overview

fonPick provides a comprehensive REST API for market analysis, combining multiple analysis services into actionable investment insights. All endpoints are built with Next.js 16 App Router and Firebase Realtime Database.

**Base URL**: `https://your-domain.com/api`

**Content Type**: `application/json`

---

## Quick Start

```bash
# Get complete market analysis
curl https://your-domain.com/api/analysis

# Get health status
curl https://your-domain.com/api/health

# Get actionable insights
curl https://your-domain.com/api/insights
```

---

## Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    date: string      // Analysis date (YYYY-MM-DD)
    timestamp: number // Unix timestamp
  }
}
```

---

## API Endpoints

### 1. Health Check

Check system health and data availability.

**Endpoint**: `GET /api/health`

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `quick` | boolean | false | Set to 'true' for quick health check (data availability only) |
| `format` | string | 'full' | Response format: 'full', 'summary', or 'json' |

**Response** (Full format):

```json
{
  "status": "healthy",
  "timestamp": 1737758400000,
  "dataSources": {
    "marketOverview": {
      "name": "Market Overview",
      "status": "healthy",
      "lastDataTimestamp": 1737758400000,
      "dataAge": 300000,
      "isFresh": true
    },
    "industrySector": { ... },
    "investorType": { ... },
    "topRankings": { ... }
  },
  "services": {
    "breadthAnalysis": { ... },
    "sectorRotation": { ... },
    "smartMoney": { ... },
    "insights": { ... }
  },
  "metrics": {
    "totalDataSources": 4,
    "healthyDataSources": 4,
    "healthPercentage": 100,
    "averageDataAge": 300000
  },
  "warnings": [],
  "recommendations": []
}
```

**Example**:

```bash
# Full health check
GET /api/health

# Quick health check
GET /api/health?quick=true

# Summary format
GET /api/health?format=summary
```

---

### 2. Combined Analysis

Complete market analysis combining all services. This is the main entry point for comprehensive market analysis.

**Endpoint**: `GET /api/analysis`

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | string | today | Date in YYYY-MM-DD format |
| `type` | string | 'full' | Analysis type: 'full', 'snapshot', or 'sector' |
| `historicalDays` | number | 5 | Number of historical days to include |
| `includeRankings` | boolean | true | Include rankings cross-analysis |

**Response Types**:

#### Full Analysis (`type=full`)

```json
{
  "success": true,
  "type": "full",
  "data": {
    "breadth": { "status": "Bullish", "volatility": "Moderate", ... },
    "sectorRotation": { "pattern": "Rotation", "leadership": {...}, ... },
    "smartMoney": { "combinedSignal": "Bullish", "riskSignal": "Risk-On", ... },
    "correlation": { ... },
    "rankingsImpact": { ... },
    "insights": {
      "trading": { "action": "Buy", "sectors": ["Financial", "Energy"], ... },
      "answers": { ... },
      "warnings": [...]
    },
    "meta": { "date": "2025-01-24", "timestamp": 1737758400000, ... }
  },
  "meta": {
    "date": "2025-01-24",
    "timestamp": 1737758400000,
    "performanceMs": 250
  }
}
```

#### Snapshot (`type=snapshot`)

Quick market snapshot with essential data only:

```json
{
  "success": true,
  "type": "snapshot",
  "data": {
    "verdict": "Buy",
    "confidence": 75,
    "breadthStatus": "Bullish",
    "volatility": "Moderate",
    "topSectors": ["Financial", "Energy", "Technology"],
    "smartMoneySignal": "Bullish",
    "riskSignal": "Risk-On",
    "timestamp": 1737758400000
  }
}
```

#### Sector Focus (`type=sector`)

Sector-focused analysis:

```json
{
  "success": true,
  "type": "sector",
  "data": {
    "pattern": "Defensive Rotation",
    "regime": "Bearish",
    "focusSectors": ["Financial", "Energy"],
    "avoidSectors": ["Technology", "Consumer"],
    "entrySignals": [...],
    "exitSignals": [...],
    "timestamp": 1737758400000
  }
}
```

**Examples**:

```bash
# Full analysis for today
GET /api/analysis

# Full analysis for specific date
GET /api/analysis?date=2025-01-15

# Quick snapshot
GET /api/analysis?type=snapshot

# Sector focus
GET /api/analysis?type=sector

# Without rankings data
GET /api/analysis?includeRankings=false
```

---

### 3. Market Breadth

Market breadth analysis including A/D ratio, volatility, and breadth status. Answers Question #1: "How about market now?"

**Endpoint**: `GET /api/market-breadth`

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | string | today | Date in YYYY-MM-DD format |
| `includeHistorical` | boolean | true | Include historical data for trend analysis |

**Response**:

```json
{
  "adRatio": 1.33,
  "advances": 400,
  "declines": 300,
  "newHighs": 15,
  "newLows": 5,
  "status": "Bullish",
  "volatility": "Moderate",
  "trend": "Up",
  "confidence": 75,
  "observations": [
    "Strong breadth with 1.33 A/D ratio",
    "New highs outnumbering new lows 3:1"
  ],
  "timestamp": 1737758400000
}
```

**Example**:

```bash
GET /api/market-breadth
GET /api/market-breadth?date=2025-01-15
```

---

### 4. Sector Rotation

Sector rotation analysis including leadership, rotation patterns, and regime context. Answers Question #2: "What sector is heavy market up or down?"

**Endpoint**: `GET /api/sector-rotation`

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | string | today | Date in YYYY-MM-DD format |
| `includeRankings` | boolean | true | Include rankings cross-analysis |

**Response**:

```json
{
  "leaders": [
    {
      "sector": "Financial",
      "name": "Financial",
      "change": 2.5,
      "signal": "Strong Buy",
      "rank": 1,
      "value": 150000
    }
  ],
  "laggards": [
    {
      "sector": "Technology",
      "name": "Technology",
      "change": -1.2,
      "signal": "Sell",
      "rank": 10,
      "value": 80000
    }
  ],
  "pattern": "Defensive Rotation",
  "marketDriver": {
    "sector": "Financial",
    "name": "Financial",
    "change": 2.5,
    "signal": "Strong Buy",
    "rank": 1
  },
  "concentration": 0.35,
  "observations": [
    "Financial sector leading with 2.5% gain",
    "Rotation from Technology to Defensive sectors"
  ],
  "timestamp": 1737758400000
}
```

**Example**:

```bash
GET /api/sector-rotation
GET /api/sector-rotation?includeRankings=false
```

---

### 5. Smart Money

Smart money analysis tracking foreign and institutional investor flows. Answers Question #3: "Risk on because Foreign Investor is strong buy or Prop reduce sell vol?"

**Endpoint**: `GET /api/smart-money`

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | string | today | Date in YYYY-MM-DD format |
| `includeHistorical` | boolean | true | Include historical data for trend analysis |
| `includePropTrading` | boolean | true | Include prop trading analysis |

**Response**:

```json
{
  "foreign": {
    "todayNet": 50000000,
    "trend": "Accumulating",
    "trend5Day": "Strong Accumulation",
    "avg5Day": 30000000,
    "vsAverage": "+66.7%",
    "strength": "Strong"
  },
  "institution": {
    "todayNet": 20000000,
    "trend": "Accumulating",
    "trend5Day": "Accumulation",
    "avg5Day": 15000000,
    "vsAverage": "+33.3%",
    "strength": "Moderate"
  },
  "combinedSignal": "Bullish",
  "riskSignal": "Risk-On",
  "score": 7.5,
  "confidence": 80,
  "primaryDriver": "Foreign Investor Accumulation",
  "observations": [
    "Foreign investors accumulated 50M THB",
    "Institutional investors accumulated 20M THB",
    "Strong buying pressure from smart money"
  ],
  "timestamp": 1737758400000
}
```

**Example**:

```bash
GET /api/smart-money
GET /api/smart-money?includePropTrading=false
```

---

### 6. Correlations

Correlation analysis between Top Rankings and Sector performance. Answers Questions #5 and #6: Rankings impact and Rankings vs Sector comparison.

**Endpoint**: `GET /api/correlations`

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | 'vs-sector' | Analysis type: 'impact' or 'vs-sector' |
| `date` | string | today | Date in YYYY-MM-DD format |

#### Rankings Impact (`type=impact`)

Answers Question #5: "Top rankings heavy sector market impact?"

```json
{
  "impact": "High",
  "distribution": [
    {
      "sector": "Financial",
      "name": "Financial",
      "count": 5,
      "percentage": 50,
      "change": 2.5
    }
  ],
  "concentration": 0.45,
  "concentrationLevel": "High",
  "top3Percent": 70,
  "dominantSectors": ["Financial", "Energy"],
  "breadthStatus": "Concentrated",
  "observations": [
    "Top 3 sectors represent 70% of rankings",
    "Financial sector dominates with 5 stocks"
  ],
  "timestamp": 1737758400000
}
```

#### Rankings vs Sector (`type=vs-sector`)

Answers Question #6: "Compare rankings vs sector performance?"

```json
{
  "overallCorrelation": "Positive",
  "correlationScore": 0.75,
  "sectors": [
    {
      "sector": "Financial",
      "name": "Financial",
      "sectorChange": 2.5,
      "rankingsCount": 5,
      "expectedCount": 3,
      "correlation": "High Positive",
      "correlationScore": 0.9,
      "isAnomaly": false
    }
  ],
  "anomalies": [
    {
      "sector": "Technology",
      "name": "Technology",
      "type": "Underperforming",
      "explanation": "Technology sector down 1.5% but has 2 stocks in rankings"
    }
  ],
  "sectorCount": 10,
  "aligned": true,
  "insights": [
    "Rankings broadly aligned with sector performance",
    "Financial sector showing strong alignment"
  ],
  "timestamp": 1737758400000
}
```

**Examples**:

```bash
# Rankings vs sector comparison
GET /api/correlations

# Rankings impact analysis
GET /api/correlations?type=impact
```

---

### 7. Insights

Actionable insights combining all market analyses. Answers all 6 investment questions with trading recommendations.

**Endpoint**: `GET /api/insights`

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | string | today | Date in YYYY-MM-DD format |
| `format` | string | 'module' | Response format: 'module' or 'full' |

#### Module Format (`format=module`)

Frontend module-friendly format:

```json
{
  "answers": [
    {
      "id": "q1_volatility",
      "title": "Market Volatility",
      "summary": "Moderate volatility. Breadth is Bullish with 1.33 A/D ratio.",
      "explanation": "...",
      "evidence": ["Strong breadth with 1.33 A/D ratio"],
      "confidence": 75,
      "recommendation": "Normal trading conditions"
    },
    {
      "id": "q2_sector",
      "title": "Sector Leadership",
      "summary": "Financial leading. Defensive Rotation detected.",
      "explanation": "...",
      "evidence": [...],
      "confidence": 70,
      "recommendation": "Focus on Financial, Energy"
    },
    {
      "id": "q3_risk",
      "title": "Risk-On/Off",
      "summary": "Risk-On mode. Foreign Investor Accumulation driver.",
      "explanation": "...",
      "evidence": [...],
      "confidence": 80,
      "recommendation": "Increase equity exposure"
    },
    {
      "id": "q4_focus",
      "title": "Trading Focus",
      "summary": "Focus on Financial, Energy.",
      "explanation": "...",
      "evidence": [...],
      "confidence": 75,
      "recommendation": "Buy"
    },
    {
      "id": "q5_rankings",
      "title": "Rankings Impact",
      "summary": "Sector concentration driving market moves.",
      "explanation": "...",
      "confidence": 65
    },
    {
      "id": "q6_correlation",
      "title": "Rankings vs Sector",
      "summary": "Rankings broadly aligned with sector performance.",
      "explanation": "...",
      "confidence": 60
    }
  ],
  "verdict": {
    "verdict": "Buy",
    "confidence": 75,
    "rationale": "Strong breadth, positive sector rotation, and smart money accumulation."
  },
  "trading": {
    "action": "Buy",
    "sectors": ["Financial", "Energy"],
    "rationale": "Multiple indicators confirm bullish setup."
  },
  "sectorFocus": [
    {
      "sector": "Financial",
      "action": "Buy",
      "confidence": 85,
      "reasons": ["Leading sector", "Strong smart money flow"]
    }
  ],
  "warnings": [
    "Technology sector showing weakness",
    "Monitor foreign investor flows for reversal"
  ],
  "timestamp": 1737758400000
}
```

#### Full Format (`format=full`)

Complete actionable insights object:

```json
{
  "trading": {
    "action": "Buy",
    "sectors": ["Financial", "Energy"],
    "rationale": "...",
    " conviction": "High"
  },
  "answers": {
    "verdict": { ... },
    "volatility": { ... },
    "sector": { ... },
    "risk": { ... },
    "focus": { ... },
    "rankings": { ... },
    "correlation": { ... }
  },
  "themes": [...],
  "warnings": [...],
  "timestamp": 1737758400000
}
```

**Examples**:

```bash
# Module format (default)
GET /api/insights

# Full format
GET /api/insights?format=full
```

---

### 8. Export

Export insights and analysis data in various formats.

**Endpoint**: `GET /api/export`

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | string | today | Date in YYYY-MM-DD format |
| `format` | string | 'json' | Export format: 'json', 'csv', 'markdown', 'txt' |
| `type` | string | 'insights' | Export type: 'insights' or 'full' |
| `download` | boolean | false | Set to 'true' to trigger file download |

**Response Types**:

The response format depends on the requested format:

| Format | Content-Type | Description |
|--------|--------------|-------------|
| `json` | application/json | JSON formatted data |
| `csv` | text/csv | CSV formatted data |
| `markdown` | text/markdown | Markdown formatted report |
| `txt` | text/plain | Plain text report |

**Examples**:

```bash
# Export insights as JSON
GET /api/export

# Export full analysis as CSV
GET /api/export?format=csv&type=full

# Download markdown report
GET /api/export?format=markdown&download=true

# Export for specific date
GET /api/export?date=2025-01-15&format=markdown
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**HTTP Status Codes**:

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 404 | Data Not Found |
| 500 | Internal Server Error |

---

## Caching

API responses include cache control headers:

```
Cache-Control: public, s-maxage=60, stale-while-revalidate=120
```

This means:
- Browser can cache for 60 seconds
- CDN can serve stale content for up to 120 seconds while revalidating

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting based on:
- IP address
- API key (if authentication is added)
- Endpoint type (analysis endpoints may need stricter limits)

---

## Authentication

Currently, all endpoints are public. For production use, consider adding:
- API key authentication
- OAuth2 for user-specific data
- Role-based access control

---

## TypeScript Types

See `src/types/` for complete type definitions:

- `src/types/market-breadth.ts` - Market breadth types
- `src/types/sector-rotation.ts` - Sector rotation types
- `src/types/smart-money.ts` - Smart money types
- `src/types/insights.ts` - Insights types
- `src/types/correlation.ts` - Correlation types
- `src/types/rtdb.ts` - RTDB data types

---

## Examples

### JavaScript/TypeScript

```typescript
// Fetch complete market analysis
const response = await fetch('https://your-domain.com/api/analysis')
const data = await response.json()

console.log(data.data.insights.trading.action) // 'Buy' | 'Sell' | 'Hold'

// Fetch health status
const health = await fetch('https://your-domain.com/api/health?quick=true')
  .then(r => r.json())

if (health.status !== 'healthy') {
  console.warn('System not healthy:', health.data.missingSources)
}

// Export insights as markdown
const report = await fetch('https://your-domain.com/api/export?format=markdown&download=true')
const markdown = await report.text()
```

### cURL

```bash
# Complete analysis
curl https://your-domain.com/api/analysis

# Quick health check
curl https://your-domain.com/api/health?quick=true

# Export as CSV
curl https://your-domain.com/api/export?format=csv -o report.csv

# Historical analysis
curl "https://your-domain.com/api/analysis?date=2025-01-15"
```

---

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- 8 endpoints for market analysis
- Health monitoring
- Export functionality
- Comprehensive error handling
