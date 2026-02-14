# Historical Trend Calculation Plan
# แผนการคำนวณและวิเคราะห์ Historical Trend

**วันที่**: 2026-02-14
**สถานะ**: P0 Critical Feature
**ผู้รับผิดชอบ**: Backend Developer + Data Analyst

---

## Executive Summary

เอกสารฉบับนี้ระบุวิธีการคำนวณและรูปแบบการวิเคราะห์ **Historical Trend** สำหรับการลงทุน 30-90 วัน ซึ่งเป็นคุณสมบัติที่ขาดหายไปและมีความสำคัญอย่างยิ่งสำหรับ Swing Trading

**ความสำคัญ**: การวิเคราะห์ trend ในช่วงเวลาหนึ่งๆ ไม่เพียงพอ ต้องรู้ **duration**, **strength**, และ **phase** ของ trend

---

## 1. Moving Averages (MA) Calculation

### 1.1 Simple Moving Average (SMA)

**สูตร:**
```
SMA(n) = (P1 + P2 + P3 + ... + Pn) / n
```

**ที่มา:**
- `P1, P2, ... Pn` = ราคาปิด n วันย้อนหลัง
- `n` = จำนวนวันของ MA

**วิธีคำนวณ:**
```typescript
function calculateSMA(prices: number[], period: number): number[] {
  const result: number[] = []

  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += prices[i - j]
    }
    result.push(sum / period)
  }

  return result
}
```

**ตัวอย่าง Thai Market:**
```
หุ้น KBANK ราคา 5 วันล่าสุด: 152, 150, 148, 151, 153

MA5 = (152 + 150 + 148 + 151 + 153) / 5 = 150.8
```

### 1.2 Exponential Moving Average (EMA)

**สูตร:**
```
Multiplier = 2 / (Period + 1)
EMA = (Close - EMA(previous)) × Multiplier + EMA(previous)
```

**วิธีคำนวณ:**
```typescript
function calculateEMA(prices: number[], period: number): number[] {
  const result: number[] = []
  const multiplier = 2 / (period + 1)

  // เริ่มต้นด้วย SMA สำหรับ EMA แรก
  let ema = calculateSMA(prices, period)[0]
  result.push(ema)

  // คำนวณ EMA ถัดไป
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema
    result.push(ema)
  }

  return result
}
```

### 1.3 MA Periods สำหรับ Swing Trading (30-90 วัน)

| MA Type | Period | การใช้งาน |
|---------|--------|------------|
| **MA20** | 20 วัน (~1 เดือน) | Short-term trend support |
| **MA50** | 50 วัน (~2.5 เดือน) | Intermediate trend confirmation |
| **MA200** | 200 วัน (~10 เดือน) | Long-term trend major support/resistance |

**Thai Market Context:**
- SET Index ใช้ MA200 เป็น major support/resistance หลัก
- กรณีศึกษา: SET Index พุ่งทะลุ MA200 มักเกิด Strong Rally

---

## 2. Trend Duration Measurement

### 2.1 Trend Duration คืออะไร?

**Trend Duration** = จำนวนวันที่ trend ดำเนินอยู่ติดต่อกันโดยไม่เปลี่ยนทิศทาง

### 2.2 วิธีวัด Trend Duration

**Algorithm:**

```typescript
function measureTrendDuration(
  prices: number[],
  maFast: number[],
  maSlow: number[]
): {
  duration: number
  direction: 'up' | 'down' | 'sideways'
  phase: 'early' | 'mature' | 'exhausted'
} {
  let duration = 0
  let direction: 'up' | 'down' | 'sideways' = 'sideways'

  // ตรวจสอบทิศทาง trend จากความสัมพันธ์ MA
  for (let i = 1; i < maFast.length; i++) {
    if (maFast[i] > maSlow[i] && maFast[i-1] <= maSlow[i-1]) {
      // Golden Cross → Uptrend เริ่ม
      direction = 'up'
      duration = 0
    } else if (maFast[i] < maSlow[i] && maFast[i-1] >= maSlow[i-1]) {
      // Death Cross → Downtrend เริ่ม
      direction = 'down'
      duration = 0
    }

    // นับระยะเวลา trend
    if (direction === 'up' && maFast[i] > maSlow[i]) {
      duration++
    } else if (direction === 'down' && maFast[i] < maSlow[i]) {
      duration++
    }
  }

  // กำหนด Trend Phase
  let phase: 'early' | 'mature' | 'exhausted'
  if (duration < 20) {
    phase = 'early'      // Trend เริ่มเกิด
  } else if (duration < 60) {
    phase = 'mature'     // Trend แข็งแกร่ง
  } else {
    phase = 'exhausted'  // Trend เริ่มอ่อนแรง
  }

  return { duration, direction, phase }
}
```

### 2.3 Trend Phase Classification

| Phase | Duration | Characteristics | Swing Strategy |
|-------|----------|-----------------|----------------|
| **Early** | 1-20 วัน | Trend เริ่มเกิด, volume เริ่มเพิ่ม | Entry aggressive |
| **Mature** | 21-60 วัน | Trend ชัดเจน, volume มั่นคง | Hold position |
| **Exhausted** | 61+ วัน | Momentum ลดลง, divergence เริ่มเกิด | รับกำไรบางส่วน |

**Thai Market Example:**
```
ADVANC จากปี 2023:
- MA50 ตัดขึ้น MA200 (Golden Cross) วันที่ 15 มี.ค.
- ณ วันที่ 15 เม.ย. → Duration = 30 วัน → Mature Phase
- ณ วันที่ 15 มิ.ย. → Duration = 90 วัน → Exhausted Phase
```

---

## 3. Momentum Indicators

### 3.1 RSI (Relative Strength Index)

**สูตร:**
```
RSI = 100 - (100 / (1 + RS))

เมื่อ:
RS = Average Gain / Average Loss
Average Gain = (Total Gains / n)
Average Loss = (Total Losses / n)
```

**วิธีคำนวณ:**
```typescript
function calculateRSI(prices: number[], period: number = 14): number[] {
  const result: number[] = []

  for (let i = period; i < prices.length; i++) {
    let gains = 0
    let losses = 0

    for (let j = i - period + 1; j <= i; j++) {
      const change = prices[j] - prices[j - 1]
      if (change > 0) gains += change
      else losses += Math.abs(change)
    }

    const avgGain = gains / period
    const avgLoss = losses / period

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    const rsi = 100 - (100 / (1 + rs))

    result.push(rsi)
  }

  return result
}
```

**RSI Levels:**
- **> 70**: Overbought (ราคาแพงเกินไป)
- **< 30**: Oversold (ราคาถูกเกินไป)
- **50**: Neutral

**Thai Market Tip:**
- SET มักมี RSI > 70 ก่อน correction เล็กๆ
- หุ้น Big Cap อย่าง KBANK, SCB มักสวิงช้า ใช้ period 14 ได้
- หุ้น Small Cap สวิงเร็ว ควรใช้ period 7-9

### 3.2 MACD (Moving Average Convergence Divergence)

**สูตร:**
```
MACD Line = EMA(12) - EMA(26)
Signal Line = EMA(9) ของ MACD Line
Histogram = MACD Line - Signal Line
```

**วิธีคำนวณ:**
```typescript
function calculateMACD(prices: number[]): {
  macd: number[]
  signal: number[]
  histogram: number[]
} {
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)

  // MACD Line
  const macd: number[] = []
  const startIndex = 26 - 12  // เริ่มที่ index เดียวกัน

  for (let i = 0; i < ema26.length; i++) {
    macd.push(ema12[startIndex + i] - ema26[i])
  }

  // Signal Line (EMA9 of MACD)
  const signal = calculateEMA(macd, 9)

  // Histogram
  const histogram: number[] = []
  for (let i = 0; i < signal.length; i++) {
    histogram.push(macd[i + (macd.length - signal.length)] - signal[i])
  }

  return { macd, signal, histogram }
}
```

**MACD Signals:**
- **Bullish Cross**: MACD ตัดขึ้น Signal = Buy Signal
- **Bearish Cross**: MACD ตัดลง Signal = Sell Signal
- **Divergence**: ราคาทำ High ใหม่ แต่ MACD ไม่ทำ = Reversal Signal

---

## 4. Trend Phase Detection

### 4.1 Phase Detection Algorithm

```typescript
function detectTrendPhase(
  prices: number[],
  ma20: number[],
  ma50: number[],
  ma200: number[],
  rsi: number[]
): {
  phase: 'early' | 'mature' | 'exhausted' | 'reversal'
  confidence: number
  signals: string[]
} {
  const currentPrice = prices[prices.length - 1]
  const currentMA20 = ma20[ma20.length - 1]
  const currentMA50 = ma50[ma50.length - 1]
  const currentMA200 = ma200[ma200.length - 1]
  const currentRSI = rsi[rsi.length - 1]

  const signals: string[] = []
  let phase: 'early' | 'mature' | 'exhausted' | 'reversal'
  let confidence = 0

  // Uptrend Detection
  if (currentMA20 > currentMA50 && currentMA50 > currentMA200) {
    // Uptrend

    // Early Phase: MA20 เพิ่งตัดขึ้น MA50
    const maCross = ma20[ma20.length - 2] <= ma50[ma50.length - 2]
    if (maCross) {
      phase = 'early'
      confidence = 80
      signals.push('MA20 เพิ่งตัดขึ้น MA50 (Golden Cross)')
    }

    // Mature Phase: MA อยู่ในระเบียบ
    else if (currentPrice > currentMA20 && currentMA20 > currentMA50 * 1.02) {
      phase = 'mature'
      confidence = 70
      signals.push('MA อยู่ในระเบียบ Uptrend')
    }

    // Exhausted Phase: RSI > 70 หรือ Divergence
    if (currentRSI > 70) {
      phase = 'exhausted'
      confidence = 85
      signals.push('RSI Overbought ระวัง correction')
    }

    // Reversal Detection
    const rsiDivergence = detectRSIDivergence(prices, rsi)
    if (rsiDivergence) {
      phase = 'reversal'
      confidence = 90
      signals.push('RSI Divergence พบ Reversal Signal')
    }
  }
  // Downtrend Detection (similar logic)
  else if (currentMA20 < currentMA50 && currentMA50 < currentMA200) {
    // ... Downtrend logic
  }

  return { phase, confidence, signals }
}

function detectRSIDivergence(prices: number[], rsi: number[]): boolean {
  // Regular Bullish Divergence: Price ทำ LL แต่ RSI ทำ HL
  const priceLL = prices[prices.length - 1] < prices[prices.length - 6]
  const rsiHL = rsi[rsi.length - 1] > rsi[rsi.length - 6]

  return priceLL && rsiHL
}
```

---

## 5. Data Requirements

### 5.1 Firebase RTDB Structure (ใหม่)

ต้องเพิ่ม paths ใหม่ใน RTDB:

```
/settrade/
├── priceHistory/
│   └── bySymbol/
│       └── {SYMBOL}/
│           └── byDate/
│               └── {YYYY-MM-DD}/
│                   ├── data: { open, high, low, close, volume }
│                   └── meta: { capturedAt, schemaVersion, source }
```

### 5.2 Data Storage Schema

```typescript
interface RTDBPriceHistoryEntry {
  data: {
    open: number
    high: number
    low: number
    close: number
    volume: number
  }
  meta: {
    capturedAt: string
    schemaVersion: number
    source: 'yahoo-finance' | 'set'
  }
}
```

### 5.3 API Endpoints ที่ต้องเรียก

**External APIs:**
1. **Yahoo Finance API** (สำหรับ price history)
   - Endpoint: `https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}.BK`
   - Params: `interval=1d`, `range=3mo` (90 วัน)

2. **SET Historical Data** (ถ้ามี)
   - Endpoint: `https://api.settrade.com/api/market/history/{SYMBOL}`
   - Params: `period=90`

**Internal APIs:**
- `GET /api/stock/history?symbol={SYMBOL}&days=90`

### 5.4 Data Structure ที่ต้องออกแบบ

```typescript
interface HistoricalTrendData {
  symbol: string

  // Price History (90 days minimum)
  priceHistory: PriceHistoryPoint[]

  // Moving Averages
  indicators: {
    ma20: MAData[]
    ma50: MAData[]
    ma200: MAData[]
  }

  // Momentum
  momentum: {
    rsi: number[]
    rsiCurrent: number
    macd: {
      macd: number[]
      signal: number[]
      histogram: number[]
    }
  }

  // Trend Analysis
  trend: {
    direction: 'up' | 'down' | 'sideways'
    duration: number
    phase: 'early' | 'mature' | 'exhausted' | 'reversal'
    strength: number  // 0-100
  }

  timestamp: number
}
```

---

## 6. Thai Market Specific Considerations

### 6.1 SET Trading Hours
- **Pre-market**: 09:30 - 10:00 (Volatility สูง)
- **Regular**: 10:00 - 16:30
- **Closing**: 16:25 - 16:30 (Big volume surge)

**Tip**: ใช้ราคา Close เวลา 16:30 เป็นหลัก

### 6.2 Thai Market Volatility
- SET Index โดยเฉลี่ย สวิง **±2-3% ต่อวัน**
- หุ้น Mid/Small cap สวิง **±5-10% ต่อวัน**

**Adjustment**:
- ATR Stop Loss ควรเป็น 2-3x ATR สำหรับ Thai Market

### 6.3 Seasonal Patterns
- **Q1 (Jan-Mar)**: Buying season (Bonus season)
- **Q2 (Apr-Jun)**: Earnings season, volatility สูง
- **Q3 (Jul-Sep)**: Slow season
- **Q4 (Oct-Dec)**: Year-end rally เป็นไปได้

---

## 7. Performance Optimization

### 7.1 Caching Strategy
```typescript
// Cache price history 1 ชั่วโมง
const CACHE_TTL = 60 * 60 * 1000  // 1 hour

// Incremental updates เฉพาะวันล่าสุด
const updateStrategy = {
  full: '0 2 * * *',  // 02:00 ทุกวัน
  incremental: '*/30 9-17 * * 1-5',  // ทุก 30 นาที ช่วง market hours
}
```

### 7.2 Batch Processing
```typescript
// ดึงข้อมูล หุ้นหลายตัวพร้อมกัน
async function batchFetchHistoricalData(symbols: string[]) {
  const chunks = chunkArray(symbols, 10)
  const results = []

  for (const chunk of chunks) {
    const promises = chunk.map(s => fetchHistoricalData(s))
    const chunkResults = await Promise.allSettled(promises)
    results.push(...chunkResults)
  }

  return results
}
```

---

## 8. Implementation Checklist

- [ ] Add `priceHistory` paths to RTDB
- [ ] Create `historical-trend` service
- [ ] Implement SMA/EMA calculations
- [ ] Implement RSI calculation
- [ ] Implement MACD calculation
- [ ] Implement Trend Duration measurement
- [ ] Implement Trend Phase detection
- [ ] Create API endpoints for historical data
- [ ] Add caching layer
- [ ] Write unit tests for all calculations
- [ ] Add Thai market specific adjustments
- [ ] Create documentation for frontend integration

---

**อ้างอิง:**
- Master Report: `MASTER_UPDATE/master_report.md`
- Technical Types: `src/types/technical-chart.ts`
- RTDB Paths: `src/lib/rtdb/paths.ts`
- Current Indicators: `src/lib/technical-indicators.ts`
