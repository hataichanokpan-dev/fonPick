# คู่มือการคำนวณ FonPick Dashboard

**เอกสารนี้อธิบายวิธีการคำนวณทั้งหมดของ FonPick Dashboard**
**เพื่อให้ผู้ใช้เข้าใจว่าตัวเลขแต่ละตัวมาจากไหนและหมายความว่าอย่างไร**

---

## สารบัญ

1. [ปรัชญาการลงทุน](#1-ปรัชญาการลงทุน)
2. [Market Regime Detection](#2-market-regime-detection)
3. [Smart Money Score](#3-smart-money-score)
4. [Sector Rotation Analysis](#4-sector-rotation-analysis)
5. [Daily Focus](#5-daily-focus)
6. [Market Movers](#6-market-movers)
7. [ตัวอย่างการคำนวณ](#7-ตัวอย่างการคำนวณ)
8. [คำถามที่พบบ่อย](#8-คำถามที่พบบ่อย)

---

## 1. ปรัชญาการลงทุน

FonPick Dashboard สร้างมาจากปรัชญา **"Follow Smart Money"** (ตามเงินฉลาด) โดยมีหลักการดังนี้:

### 1.1 ลำดับการตัดสินใจ (Decision Hierarchy)

```
Step 1: Market Regime (สำคัญที่สุด - P0)
  ├─ Risk-On?  → Focus หุ้นเสี่ยง (Tech, Finance)
  ├─ Risk-Off? → Focus หุ้นป้องกัน (Food, Health)
  └─ Neutral?  → Focus หุ้นคุณภาพ

Step 2: Smart Money Confirmation (P0)
  ├─ Foreign + Institution ซื้อ? → Confirm Risk-On
  ├─ Foreign + Institution ขาย? → Confirm Risk-Off
  └─ Prop ลดแรงขาย? → Bullish (เฉพาะตลาดไทย)

Step 3: Sector Selection (P1)
  ├─ Entry signal → Accumulate
  ├─ Exit signal → Reduce
  └─ Hold signal → Maintain

Step 4: Stock Selection (P2)
  └─ Cross-ranked stocks → True strength
```

### 1.2 Investor Types ที่ติดตาม

| Investor | ความสำคัญ | เหตุผล |
|----------|------------|---------|
| **Foreign** | สูงสุด | มีเงินมากที่สุด เห็นภาพกว้าง |
| **Institution** | สูง | มีข้อมูลดีกว่า วิเคราะห์ลึก |
| **Retail** | ต่ำ-ปานกลาง | Contrarian indicator (ใช้ดู sentiment) |
| **Prop** | ต่ำ-ปานกลาง | Amplifier ในตลาดไทย |

---

## 2. Market Regime Detection

**ตอบคำถาม:** "ตอนนี้ตลาดอยู่ในสถานะ Risk-On หรือ Risk-Off?"

### 2.1 ระบบคะแนนสองทาง (Dual Scoring)

FonPick ใช้ระบบคะแนนแบบเปรียบเทียบ:
- **Risk-On Score** (0-10) = คะแนนความแข็งแกร่งของตลาด
- **Risk-Off Score** (0-10) = คะแนนความอ่อนแอของตลาด

แล้วนำสองคะแนนมาเปรียบเทียบกันเพื่อตัดสิน Regime

### 2.2 Risk-On Score Calculation

คะแนน Risk-On คำนวณจาก 5 กฎ (max 10 คะแนน):

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RISK-ON SCORE (0-10 points)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Rule 1: SET Index Direction (max 2 points)                          │
│   • SET > +0.5%  →  +2 points (แข็งแกร่ง)                        │
│   • SET > 0%     →  +1 point  (เล็กน้อย)                          │
│   • SET ≤ 0%     →  0 points                                        │
│                                                                     │
│ Rule 2: Foreign Flow (max 2 points)                                 │
│   • Foreign > +100M  →  +2 points (ซื้อหนัก)                       │
│   • Foreign > 0M     →  +1 point  (ซื้อเล็กน้อย)                  │
│   • Foreign ≤ 0M     →  0 points                                    │
│                                                                     │
│ Rule 3: Institution Flow (max 2 points)                             │
│   • Institution > +100M  →  +2 points (ซื้อหนัก)                  │
│   • Institution > 0M     →  +1 point  (ซื้อเล็กน้อย)             │
│   • Institution ≤ 0M     →  0 points                                │
│                                                                     │
│ Rule 4: Sector Behavior (max 2 points)                              │
│   • Cyclical > Defensive และ SET > 0  →  +2 points                 │
│   • Sector ส่วนใหญ่ > 0                →  +1 point                  │
│   • Otherwise                          →  0 points                  │
│                                                                     │
│ Rule 5: Liquidity (max 2 points)                                    │
│   • Volume Ratio > 1.2  →  +2 points (volume สูงกว่าปกติ 20%)   │
│   • Volume Ratio > 1.0  →  +1 point  (volume สูงกว่า average)     │
│   • Otherwise            →  0 points                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Source Code:** `src/services/market-regime/rules.ts:27-68`

### 2.3 Risk-Off Score Calculation

คะแนน Risk-Off ใช้ logic ตรงข้าม:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RISK-OFF SCORE (0-10 points)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Rule 1: SET Index Direction (inverse)                               │
│   • SET < -0.5%  →  +2 points (ลงหนัก)                            │
│   • SET < 0%     →  +1 point  (ลงเล็กน้อย)                       │
│   • SET ≥ 0%     →  0 points                                        │
│                                                                     │
│ Rule 2: Foreign Flow (inverse)                                      │
│   • Foreign < -100M  →  +2 points (ขายหนัก)                       │
│   • Foreign < 0M     →  +1 point  (ขายเล็กน้อย)                  │
│   • Foreign ≥ 0M     →  0 points                                    │
│                                                                     │
│ Rule 3: Institution Flow (inverse)                                  │
│   • Institution < -100M  →  +2 points (ขายหนัก)                  │
│   • Institution < 0M     →  +1 point  (ขายเล็กน้อย)             │
│   • Institution ≥ 0M     →  0 points                                │
│                                                                     │
│ Rule 4: Sector Behavior (defensive outperforming)                   │
│   • Defensive > Cyclical และ SET < 0  →  +2 points                 │
│   • Defensive > Cyclical                →  +1 point                 │
│   • Otherwise                            →  0 points                │
│                                                                     │
│ Rule 5: Liquidity (low volume = risk-off)                           │
│   • Volume Ratio < 0.8  →  +2 points (volume ต่ำกว่าปกติ 20%)   │
│   • Volume Ratio < 1.0  →  +1 point  (volume ต่ำกว่า average)     │
│   • Otherwise            →  0 points                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Source Code:** `src/services/market-regime/rules.ts:76-118`

### 2.4 Regime Determination

หลังจากคำนวณคะแนนทั้งสองแล้ว ใช้สูตรนี้ตัดสิน:

```typescript
Score Difference = Risk-On Score - Risk-Off Score

if (Score Difference ≥ +2) {
    Regime = "Risk-On"
    Confidence = (Risk-On Score ≥ 7) ? "High" : "Medium"
}
else if (Score Difference ≤ -2) {
    Regime = "Risk-Off"
    Confidence = (Risk-Off Score ≥ 7) ? "High" : "Medium"
}
else {
    Regime = "Neutral"
    Confidence = (Total Score ≥ 10) ? "Medium" : "Low"
}
```

**Source Code:** `src/services/market-regime/rules.ts:126-146`

### 2.5 Thresholds สำคัญ

| Parameter | Strong | Moderate | Neutral |
|-----------|--------|----------|---------|
| SET Change | ±0.5% | 0% | - |
| Flow (Million THB) | ±100M | 0M | - |
| Volume Ratio | 1.2 / 0.8 | 1.0 | - |

**Source Code:** `src/services/market-regime/rules.ts:13-20`

---

## 3. Smart Money Score

**ตอบคำถาม:** "Smart Money ทำอะไรอยู่?"

### 3.1 Investor Weights

แต่ละประเภท investor มีน้ำหนักต่างกัน:

| Investor | Base Score | Multiplier | Effective Weight |
|----------|------------|------------|------------------|
| **Foreign** | 0-50 | ×1.2 | 60 points |
| **Institution** | 0-50 | ×1.0 | 50 points |
| **Retail** | 0-50 | ×0.25 | 12.5 points |
| **Prop** | 0-50 | ×0.25 | 12.5 points |

**Smart Money** (Foreign + Institution) = 80% weight
**Context Investors** (Retail + Prop) = 20% weight

**Source Code:** `src/services/smart-money/scorer.ts:213-241`

### 3.2 Individual Score Calculation (0-50 points)

แต่ละ investor ได้คะแนนจากการคำนวณนี้:

```typescript
Individual Score = 25 + Signal_Adjustment + Trend_Adjustment + 5Day_Adjustment

// Base Score
สเกิร์ต้น = 25 points (midpoint)

// Signal Adjustment
├─ Strong Buy:  +20  →  max 45
├─ Buy:         +10  →  max 35
├─ Neutral:      0   →  25
├─ Sell:        -10  →  min 15
└─ Strong Sell: -20  →  min 5

// Trend Adjustment
├─ Accelerating Buy:  +5
├─ Accelerating Sell: -5
└─ Other:              0

// 5-Day Trend Adjustment
├─ 5-day trend > +200M:  +3
├─ 5-day trend < -200M:  -3
└─ Other:                  0
```

**Signal Strength Thresholds:**
- Strong Buy: ≥ +500M
- Buy: ≥ +100M
- Sell: ≤ -100M
- Strong Sell: ≤ -500M

**Source Code:** `src/services/smart-money/scorer.ts:248-285`

### 3.3 Combined Smart Money Score (0-100)

```typescript
// Step 1: Calculate smart money total
Foreign Score     = Individual_Score(Foreign) × 1.2
Institution Score = Individual_Score(Institution) × 1.0
Smart Money Total = min(100, Foreign Score + Institution Score)

// Step 2: Calculate context total
Retail Score = Individual_Score(Retail) × 0.25 (ถ้ามีข้อมูล)
Prop Score   = Individual_Score(Prop) × 0.25 (ถ้ามีข้อมูล)
Context Total = Retail Score + Prop Score

// Step 3: Final score
Total Score = min(100,
    Smart Money Total × 0.8 + Context Total × 0.2
)
```

**Source Code:** `src/services/smart-money/scorer.ts:213-241`

### 3.4 Combined Signal & Risk Signal

| Total Net Flow | Combined Signal | Risk Signal |
|----------------|----------------|-------------|
| ≥ +600M | Strong Buy | Risk-On |
| ≥ +100M | Buy | Risk-On (Mild) |
| -100M ~ +100M | Neutral | Neutral |
| ≤ -100M | Sell | Risk-Off (Mild) |
| ≤ -600M | Strong Sell | Risk-Off |

### 3.5 ข้อมูลย้อนหลัง (Historical Data)

**ใช่! รองรับข้อมูลย้อนหลังแล้ว**

API: `/api/smart-money?includeHistorical=true`

```typescript
// ดึงข้อมูล 5 วันย้อนหลัง
Historical Flows = [Day-1, Day-2, Day-3, Day-4, Day-5]

// Trend Detection
Trend = classify based on current vs average:
  • Accelerating Buy/Sell: change > 100M from average
  • Stable Buy/Sell: change 20-100M from average
  • Decreasing Buy/Sell: change < 20M from average

// 5-Day Cumulative
Cumulative 5-Day = sum(Net Flow วันนี้ + 5 วันย้อนหลัง)
Average 5-Day = Cumulative / 6

// Trend Strength (Linear Regression)
Trend Strength = calculate slope of historical flows
```

**Confidence Boost จากข้อมูลย้อนหลัง:**
- Accelerating trend: +15 confidence
- Stable trend: +10 confidence
- Large flow (>1000M): +10 confidence

**Source Code:** `src/services/smart-money/scorer.ts:77-112, 364-391`

### 3.6 Primary Driver Detection

ระบบจะระบุว่า investor ประเภทไหนเป็น driver หลัก:

```typescript
Driver = Investor ที่มีคะแนนสูงสุด

Confidence = (Driver_Score / Max_Possible_Score) × 100
```

---

## 4. Sector Rotation Analysis

**ตอบคำถาม:** "Sector ไหนน่า Focus?"

### 4.1 Sector Classification

**Cyclical Sectors (สูงความเสี่ยง):**
- BANKING, FIN, ICT, ENERGY, CONS, COMM

**Defensive Sectors (ต่ำความเสี่ยง):**
- FOOD, HELTH, UTIL, PROP, PF

**Source Code:** `src/types/sector-rotation.ts:293-343`

### 4.2 Momentum Classification

Sector performance วัดเทียบกับตลาด (SET Index):

```typescript
vsMarket = Sector Change% - SET Change%

Momentum Classification:
├─ vsMarket ≥ +1.5%  →  "Strong Outperform"
├─ vsMarket ≥ +0.5%  →  "Outperform"
├─ vsMarket ≥ -0.5%  →  "In-line"
├─ vsMarket ≥ -1.5%  →  "Underperform"
└─ vsMarket < -1.5%  →  "Significant Lag"
```

**Source Code:** `src/services/sector-rotation/detector.ts:50-64`

### 4.3 Entry Signal (Buy)

Entry signal เกิดขึ้นเมื่อ sector กำลัง outperform:

```typescript
if (momentum === "Outperform" || momentum === "Strong Outperform") {
    if (hasHistoricalData) {
        improvement = todayChange - historicalChange

        if (improvement > 0.5%) {
            signal = "Entry"              // Strong buy
            confidence = 60 + |vsMarket| × 10  (max 85)
        } else {
            signal = "Accumulate"         // Mild buy
            confidence = 50 + |vsMarket| × 8   (max 75)
        }
    } else {
        signal = "Accumulate"
        confidence = 50 + |vsMarket| × 8   (max 70)
    }
}
```

**Source Code:** `src/services/sector-rotation/detector.ts:90-105`

### 4.4 Exit Signal (Sell)

Exit signal เกิดขึ้นเมื่อ sector กำลัง underperform:

```typescript
if (momentum === "Underperform" || momentum === "Significant Lag") {
    if (hasHistoricalData) {
        deterioration = historicalChange - todayChange

        if (deterioration > 0.5%) {
            signal = "Exit"               // Strong sell
            confidence = 60 + |vsMarket| × 10
        } else {
            signal = "Distribute"         // Mild sell
            confidence = 50 + |vsMarket| × 8
        }
    } else {
        signal = "Distribute"
        confidence = 50 + |vsMarket| × 8
    }
}
```

**Source Code:** `src/services/sector-rotation/detector.ts:108-123`

### 4.5 ข้อมูลย้อนหลังสำหรับ Sector

**ใช่! รองรับข้อมูลย้อนหลัง**

```typescript
historicalChange = Sector change จากวันก่อนหน้า

// Use cases:
improvement     = today - historical > 0.5%  → Entry signal
deterioration   = historical - today > 0.5%  → Exit signal
```

ข้อมูลย้อนหลังช่วย:
- แยกแยะระหว่าง "Entry" กับ "Accumulate"
- เพิ่ม confidence (สูงสุด 85 เมื่อมี historical vs 70 ไม่มี)

### 4.6 Rotation Pattern Detection

```typescript
Pattern Detection:

if (outperforming sectors ≥ 60%) {
    return "Broad-Based Advance"
}

if (Cyclical Avg - Defensive Avg > 1%) {
    return "Risk-On Rotation"
}

if (Defensive Avg - Cyclical Avg > 1%) {
    return "Risk-Off Rotation"
}

return "Mixed/No Clear Pattern"
```

**Source Code:** `src/services/sector-rotation/detector.ts:244-293`

### 4.7 Percentile-Based Selection

Leaders และ Laggards ถูกเลือกโดยใช้ percentile:

```typescript
// Top 30% = leaders (min 3, max 6 sectors)
leaders = top 30% sectors by changePercent

// Bottom 30% = laggards (min 3, max 6 sectors)
laggards = bottom 30% sectors by changePercent
```

วิธีนี้รับประกันว่าจะมี leaders และ laggards เสมอ ไม่ว่าตลาดจะผันผวนน้อยแค่ไหน

**Source Code:** `src/services/sector-rotation/detector.ts:187-211`

---

## 5. Daily Focus

**ตอบคำถาม:** "หุ้นไหนโดนพูดถึงหลายด้าน?"

### 5.1 Cross-Ranking Detection

Daily Focus เลือกหุ้นจาก **Cross-Ranking** - หุ้นที่ปรากฏในหลาย ranking:

```typescript
CrossRankedStock {
  symbol: string
  rankings: {
    value?: number    // Top value ranking (1-10)
    volume?: number   // Top volume ranking (1-10)
    gainer?: number   // Top gainers ranking (1-10)
    loser?: number    // Top losers ranking (1-10)
  }
  rankingCount: number    // จำนวน ranking ที่ปรากฏ
  strengthScore: number   // 0-100
}
```

### 5.2 Selection Criteria

1. **Minimum 2 rankings** - ต้องปรากฏในอย่างน้อย 2 หมวด
2. **Badge Color:**
   - 🟢 **Green (Buy)**: strengthScore ≥ 70
   - 🟡 **Yellow (Watch)**: strengthScore 50-69
   - ⚪ **Gray (Neutral)**: strengthScore < 50

**Source Code:** `src/components/dashboard/DailyFocusList.tsx:22-46`

### 5.3 Strength Score Formula

```typescript
// แต่ละ ranking ได้คะแนนตามลำดับ
Rank 1 = 100 points
Rank 2 = 90 points
Rank 3 = 80 points
...
Rank 10 = 10 points

// Strength Score = Average ของทุก ranking
strengthScore = Average(100 - (rank - 1) × 10)

Example: PTT ปรากฏใน 3 rankings
  • Top Value: Rank 1 → 100 points
  • Top Volume: Rank 3 → 80 points
  • Top Gainers: Rank 5 → 60 points
  • Average = (100 + 80 + 60) / 3 = 80 → 🟢 Green badge
```

### 5.4 ประโยชน์ของ Cross-Ranking

หุ้นที่ปรากฏในหลาย ranking แสดงว่า:
- **High Interest** - โดนพูดถึงหลายด้าน
- **True Strength** - ไม่ใช่การ pump ด้านเดียว
- **Market Leader** - นำตลาดในหลายมิติ

---

## 6. Market Movers

**ตอบคำถาม:** "ตลาดบอบบางหรือแข็งแกร่ง?"

### 6.1 4 Tabs

| Tab | ข้อมูล | ประโยชน์ |
|-----|---------|----------|
| **Active** | Top by Value | หุ้นที่เงินหนุนหนักสุด |
| **Gainers** | Top +Change | หุ้นที่ราคาพุ่ง |
| **Losers** | Top -Change | หุ้นที่ราคาถล่ม |
| **Volume** | Top Volume | หุ้นที่มีการซื้อขายเยอะ |

**Source Code:** `src/components/dashboard/TabbedMovers.tsx`

### 6.2 Concentration Metrics

#### Top 5 Concentration

```typescript
Top5 Concentration = (Top5 stocks value / Total market value) × 100

Interpretation:
  • > 50% → "Highly Concentrated"
  • 30-50% → "Moderately Concentrated"
  • < 30% → "Broadly Distributed"
```

#### HHI Score (Herfindahl-Hirschman Index)

```typescript
HHI = Σ(marketShare²) × 10000

Interpretation:
  • > 2000 → "Highly Concentrated"
  • 1500-2000 → "Moderately Concentrated"
  • < 1500 → "Broadly Distributed"
```

**Source Code:** `src/components/dashboard/TabbedMovers.tsx:124-252`

### 6.3 Accumulation Patterns

```typescript
Pattern Detection:
  • "Strong Accumulation" - เงินไหลเข้าหนักมาก
  • "Accumulation" - เงินไหลเข้า
  • "Neutral" - ปกติ
  • "Distribution" - เงินไหลออก
  • "Strong Distribution" - เงินไหลออกหนักมาก
```

### 6.4 ประโยชน์ของ Market Movers

1. **Concentration Alert**
   - สูง = ตลาดบอบบาง (few stocks drive market)
   - ต่ำ = ตลาดแข็งแกร่ง (broad participation)

2. **Cross-Rank Detection**
   - หุ้นที่ปรากฏหลาย tab = True Strength

3. **Pattern Recognition**
   - Accumulation vs Distribution
   - Risk assessment

---

## 7. ตัวอย่างการคำนวณ

### Example 1: Market Regime Calculation

**Input Data:**
- SET Index: +0.8%
- Foreign Net: +350M
- Institution Net: +200M
- Cyclical Sectors Avg: +1.2%
- Defensive Sectors Avg: +0.3%
- Volume Ratio: 1.3

**Risk-On Score:**
```
Rule 1 (SET):     +0.8% > +0.5%  →  2 points
Rule 2 (Foreign): +350M > +100M  →  2 points
Rule 3 (Inst):    +200M > +100M  →  2 points
Rule 4 (Sector):  Cyclical > Defensive AND SET > 0  →  2 points
Rule 5 (Volume):  1.3 > 1.2      →  2 points
───────────────────────────────────────────────────
Total Risk-On Score: 10/10
```

**Risk-Off Score:**
```
All conditions inverse, none met → 0/10
```

**Result:**
```
Score Diff = 10 - 0 = 10 (>> 2)
Regime = "Risk-On"
Confidence = "High" (because Risk-On ≥ 7)
```

### Example 2: Smart Money Score Calculation

**Input Data:**
- Foreign Net: +600M (Strong Buy), 5-day trend: +1,500M
- Institution Net: +400M (Strong Buy), 5-day trend: +800M
- Retail Net: -200M (Sell), 5-day trend: -800M
- Prop Net: -50M (Neutral), 5-day trend: -100M

**Individual Scores:**
```
Foreign: 25 + 20 (Strong Buy) + 5 (Accelerating Buy) + 3 (5-day > 200M) = 53
         × 1.2 = 63.6 → capped at 50

Institution: 25 + 20 (Strong Buy) + 0 + 3 = 48
            × 1.0 = 48

Retail: 25 - 10 (Sell) + 0 - 3 (5-day < -200M) = 12
        × 0.25 = 3

Prop: 25 + 0 (Neutral) + 0 + 0 = 25
     × 0.25 = 6.25
```

**Combined Score:**
```
Smart Money Total = 50 + 48 = 98
Context Total = 3 + 6.25 = 9.25

Total Score = 98 × 0.8 + 9.25 × 0.2
            = 78.4 + 1.85
            = 80.25/100

Result: "Strong Buy", Risk-On
```

### Example 3: Sector Entry Signal

**Input Data:**
- ICT Sector Change: +2.5%
- SET Index Change: +0.8%
- ICT Historical Change (yesterday): +1.5%

**Calculation:**
```
vsMarket = 2.5% - 0.8% = +1.7%
Momentum = "Strong Outperform" (because ≥ +1.5%)

improvement = 2.5% - 1.5% = +1.0% (> 0.5%)

Signal = "Entry"
Confidence = 60 + |1.7| × 10 = 60 + 17 = 77%
```

---

## 8. คำถามที่พบบาย (FAQ)

### Q1: ทำไม Foreign investor ถึงมีน้ำหนักมากที่สุด?

**A:** Foreign investors ถือครอง market cap ประมาณ 35-40% ของตลาด SET และมีเงินทุนมากที่สุด พวกเขามักมีข้อมูลและมุมมองที่กว้างกว่านักลงทุนในประเทศ

### Q2: ข้อมูลย้อนหลังมีประโยชน์อย่างไร?

**A:** ข้อมูลย้อนหลังช่วย:
- แยกแยะสัญญาณ "Entry" จาก "Accumulate"
- ตรวจสอบว่า momentum กำลังเพิ่มขึ้นหรือลดลง
- เพิ่มความมั่นใจ (confidence) ในสัญญาณ

### Q3: Daily Focus ต่างจาก Top Gainers อย่างไร?

**A:** Daily Focus เลือกหุ้นที่ปรากฏใน **หลาย rankings** (cross-ranked) ซึ่งแสดงถึงความแข็งแกร่งแท้จริง ส่วน Top Gainers ดูเฉพาะราคาที่เพิ่มขึ้นเท่านั้น

### Q4: Concentration สูงแปลว่าอย่างไร?

**A:**
- **Concentration สูง (>50%)**: ตลาดบอบบาง ขับเคลื่อนโดยหุ้นไม่กี่ตัว เสี่ยงต่อการดิ่งถ้าหุ้นเหล่านั้นปรับตัวลง
- **Concentration ต่ำ (<30%)**: ตลาดแข็งแกร่ง มีการมีส่วนร่วมกว้างขวาง ลดความเสี่ยง

### Q5: Risk-On ควรซื้ออะไร?

**A:** เมื่อ Market Regime = Risk-On:
- Focus บน **Cyclical sectors**: FIN, TECH, ENERGY
- ดู **Entry signals** ใน Sector Analysis
- เลือกหุ้นจาก **Daily Focus** (cross-ranked)
- ระวัง: อย่าไล่ตามราคาเกินไป

### Q6: Risk-Off ควรทำอย่างไร?

**A:** เมื่อ Market Regime = Risk-Off:
- Focus บน **Defensive sectors**: FOOD, HEALTH, UTIL
- ดู **Exit signals** เพื่อลด exposure
- เก็บสดมากขึ้น (cash preservation)
- รอจังหวะที่ดีกว่า

---

## แหล่งอ้างอิง (Source Code References)

| Feature | Path |
|---------|------|
| Market Regime Rules | `src/services/market-regime/rules.ts` |
| Smart Money Scorer | `src/services/smart-money/scorer.ts` |
| Sector Rotation Detector | `src/services/sector-rotation/detector.ts` |
| Daily Focus Component | `src/components/dashboard/DailyFocusList.tsx` |
| Market Movers Component | `src/components/dashboard/TabbedMovers.tsx` |
| Type Definitions | `src/types/market-intelligence.ts` |
| RTDB Types | `src/types/rtdb.ts` |

---

**เอกสารนี้อัปเดตล่าสุด:** 26 มกราคม 2026
**เวอร์ชัน:** 1.0
