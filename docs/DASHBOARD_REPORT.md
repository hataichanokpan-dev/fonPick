# รายงานประเมินหน้า Dashboard จากมุมมองนักลงทุน

**วันที่:** 25 มกราคม 2026
**หน้าเว็บ:** http://localhost:3000/

---

## สรุปภาพรวม

| ตัวชี้วัด | ค่า |
|-----------|-----|
| คะแนนความตอบโจทย์รวม | **64%** |
| จำนวนคำถามนักลงทุน | 4 ข้อ |
| ครอบคลุมไปแล้ว | 2.6 / 4 ข้อ |
| สถานะ | มีพื้นฐานดี แต่ยังขาดข้อมูลสำคัญบางส่วน |

---

## โครงสร้างปัจจุบัน

```
┌─────────────────────────────────────────────────────────────┐
│ MarketStatusBanner (sticky) + DataFreshness                 │
│ ดัชนี SET | การเปลี่ยนแปลง | สถานะตลาด (เปิด/ปิด)              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ P0: MARKET OVERVIEW                                          │
├──────────────────────────┬──────────────────────────────────┤
│ MarketRegimeCard (40%)   │ SmartMoneyCard (35%)             │
│ ├─ Risk-On/Off Regime    │ ├─ Foreign/Inst/Retail/Prop      │
│ ├─ Confidence Level      │ ├─ Score Gauge (0-100)           │
│ └─ Focus/Caution         │ └─ Combined Signal               │
├──────────────────────────┴──────────────────────────────────┤
│ DailyFocusList (25%)                                          │
│ └─ Cross-ranked stocks (หุ้นที่โดนพูดถึงหลายด้าน)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ P1: SECTOR ANALYSIS                                          │
├─────────────────────────────────────────────────────────────┤
│ SectorStrengthCard                                            │
│ ├─ Top 5 Leaders (สีเขียว)                                  │
│ ├─ Bottom 5 Laggards (สีแดง)                               │
│ ├─ Rotation Pattern Badge                                    │
│ └─ Buy/Avoid Signals                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ P2: MARKET MOVERS                                            │
├─────────────────────────────────────────────────────────────┤
│ TabbedMovers                                                  │
│ ├─ Active (Top value)                                        │
│ ├─ Gainers (Top % ขึ้น)                                     │
│ ├─ Losers (Top % ลง)                                        │
│ └─ Volume (Top volume)                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## วิเคราะห์ทีละคำถาม

---

## 1. วันนี้ตลาดเป็นยังไง?

**คะแนนความตอบโจทย์: 60%**

### มีอะไรให้เห็นอยู่แล้ว ✅

| Component | แสดงอะไร | คุณภาพ |
|-----------|-----------|--------|
| **MarketStatusBanner** | ดัชนี SET, การเปลี่ยนแปลง (จุด/%) | ⭐⭐⭐⭐⭐ |
| **MarketStatusBanner** | สถานะเปิด/ปิดตลาด (จุดกระพริบ) | ⭐⭐⭐⭐⭐ |
| **MarketRegimeCard** | Risk-On/Neutral/Off classification | ⭐⭐⭐⭐⭐ |
| **MarketRegimeCard** | Confidence level (High/Med/Low) | ⭐⭐⭐⭐ |
| **SmartMoneyCard** | สรุปการไหลของนักลงทุน | ⭐⭐⭐⭐ |

**สิ่งที่ดี:**
- รู้ได้ทันทีว่าตลาดอยู่ในสถานะ Risk-On หรือ Risk-Off
- เห็นดัชนี SET แบบ Real-time
- เห็นความมั่นใจของสัญญาณ

### ขาดอะไรไป ❌

| ข้อมูลที่ขาด | Impact ต่อนักลงทุน | ความสำคัญ |
|---------------|---------------------|-----------|
| **Market Internals** | รู้ไหมว่าการขึ้น/ลงของตลาดเป็นแบบกว้างหรือแคบ? | 🔴 สูงมาก |
| ├─ Advance/Decline ratio | หุ้นขึ้นเทียบกับลง = ความแข็งแกร่งของ trend | |
| ├─ New Highs / New Lows | สัญญาณความแข็งแกร่งระยะยาว | |
| ├─ % หุ้นเหนือ/ใต้ MA 50/200 | ตลาด overbought/oversold? | |
| **ตำแหน่งดัชนีใน 52-week range** | ตลาดอยู่ระดับบน/กลาง/ล่างของช่วง 1 ปี | 🟡 สูง |
| **ปริมาณการซื้อขาย vs เฉลี่ย 20 วัน** | ปริมาณเงินหมุนเยอะหรือน้อยกว่าปกติ | 🟡 สูง |
| **ระยะห่างจาก MA 50/200 วัน** | ดัชนีอยู่เหนือหรือใต้เส้น MA สำคัญ | 🟡 สูง |

**ตัวอย่าง:**
> ตลาดวันนี้ SET +15 จุด (+1%) แต่ Advance/Decline = 200/400
> → แปลว่าตลาด "บาง" มีเพียงบางหุ้นที่ลากตลาดขึ้น
> → นักลงทุนควรระมัดระวัง ไม่ใช่ momentum ที่แข็งแกร่ง

---

## 2. วิเคราะห์จากนักลงทุนประเภทต่างๆ ตอนนี้น่าลงทุนไหม?

**คะแนนความตอบโจทย์: 70%**

### มีอะไรให้เห็นอยู่แล้ว ✅

| Component | แสดงอะไร | คุณภาพ |
|-----------|-----------|--------|
| **SmartMoneyCard** | Foreign, Institution, Retail, Prop flows | ⭐⭐⭐⭐⭐ |
| **SmartMoneyCard** | Score gauge 0-100 แต่ละประเภท | ⭐⭐⭐⭐⭐ |
| **SmartMoneyCard** | Combined signal (Strong Buy/Sell/Neutral) | ⭐⭐⭐⭐ |
| **SmartMoneyCard** | Risk signal (Risk-On/Risk-Off) | ⭐⭐⭐⭐ |
| **SmartMoneyCard** | Primary driver identification | ⭐⭐⭐⭐⭐ |

**สิ่งที่ดี:**
- เห็นชัดว่า Smart Money (Foreign + Institution) ทำอะไรอยู่
- รู้ว่าใครเป็น Primary Driver ของตลาดวันนี้
- มีสัญญาณรวมที่อ่านง่าย (Strong Buy/Sell/Neutral)

### ขาดอะไรไป ❌

| ข้อมูลที่ขาด | Impact ต่อนักลงทุน | ความสำคัญ |
|---------------|---------------------|-----------|
| **เทรนด์ 5 วันของแต่ละนักลงทุน** | รู้ไหมว่าการซื้อขายต่อเนื่องหรือเป็น one-off? | 🔴 สูงมาก |
| **การเปรียบเทียบพฤติกรรมระหว่างกลุ่ม** | Foreign ซื้อ แต่ Retail ขาย = Divergence? | 🟡 สูง |
| **Relative Strength ระหว่างประเภท** | ใครเป็นกลุ่มที่ Bullish ที่สุด? | 🟡 ปานกลาง |
| **Time-of-Day Analysis** | การไหลเข้า/ออกในช่วงเช้า vs บ่าย | 🟢 ต่ำ |

**ตัวอย่าง:**
> Foreign ซื้อ +2,000M วันนี้
>
> กรณี A: 5 วันก่อนหน้านี้ Foreign ซื้อรวม +8,000M
> → แปลว่า Smart Money กำลัง buy consistently
> → สัญญาณ Strong Buy
>
> กรณี B: 5 วันก่อนหน้านี้ Foreign ขายรวม -5,000M
> → แปลว่าวันนี้แค่ dead cat bounce
> → ไม่ควรตามซื้อ

---

## 3. Sector ไหนแบกหรือช่วยพยุงตลาดอยู่ Sector ไหนน่า Focus?

**คะแนนความตอบโจทย์: 65%**

### มีอะไรให้เห็นอยู่แล้ว ✅

| Component | แสดงอะไร | คุณภาพ |
|-----------|-----------|--------|
| **SectorStrengthCard** | Top 5 sector leaders | ⭐⭐⭐⭐⭐ |
| **SectorStrengthCard** | Bottom 5 sector laggards | ⭐⭐⭐⭐⭐ |
| **SectorStrengthCard** | Buy/Avoid signals | ⭐⭐⭐⭐ |
| **SectorStrengthCard** | Rotation pattern badge | ⭐⭐⭐⭐ |
| **SectorStrengthCard** | Concentration metric (HHI) | ⭐⭐⭐ |

**สิ่งที่ดี:**
- เห็นชัดว่า sector ไหนนำ/ท้ายตลาด
- มีสัญญาณ Buy/Avoid ที่ใช้งานได้
- เห็นรูปแบบการหมุนเวียน sector

### ขาดอะไรไป ❌

| ข้อมูลที่ขาด | Impact ต่อนักลงทุน | ความสำคัญ |
|---------------|---------------------|-----------|
| **Sector Contribution ต่อดัชนี SET** | รู้ไหมว่า sector ไหน "ลาก" หรือ "พยุง" ตลาด? | 🔴 สูงมาก |
| **Sector-specific Smart Money Flow** | Foreign/Inst กำลังไหลเข้า sector ไหน? | 🔴 สูงมาก |
| **Sector Momentum Ranking (1W, 1M)** | Sector ไหนมี momentum ต่อเนื่อง? | 🟡 สูง |
| **Sector vs SET Relative Strength** | Sector แข็งกว่า/อ่อนกว่าตลาด? | 🟡 ปานกลาง |
| **Valuation per Sector (P/E, P/BV)** | Sector ไหนราคาแพง/ถูกเมื่อเทียบประวัติ? | 🟡 ปานกลาง |

**ตัวอย่าง:**
> SET วันนี้ +15 จุด
>
> กรณี A: Banking +8pts, Energy +5pts, ICT +3pts
> → แปลว่า Financials กำลังพยุงตลาด
> → ถ้าตลาดกลับตัว Financials จะเป็นจุดเสี่ยง
>
> กรณี B: ICT +10pts,其余 sectors flat
> → แปลว่าตลาดขึ้นเพราะหุ้นใหญ่ ICT (ADVANCE, INTUCH)
> → แปลว่า market breadth แคบ ระวัง

---

## 4. Sector ไหนน่าลงทุน แล้วเทียบจาก Top trade ตัวไหนน่าจับตา?

**คะแนนความตอบโจทย์: 60%**

### มีอะไรให้เห็นอยู่แล้ว ✅

| Component | แสดงอะไร | คุณภาพ |
|-----------|-----------|--------|
| **DailyFocusList** | Cross-ranked stocks (หุ้นที่อยู่ในหลาย ranking) | ⭐⭐⭐⭐⭐ |
| **TabbedMovers - Active** | Top stocks by trading value | ⭐⭐⭐⭐⭐ |
| **TabbedMovers - Gainers** | Top stocks by % gain | ⭐⭐⭐⭐⭐ |
| **TabbedMovers - Losers** | Top stocks by % loss | ⭐⭐⭐⭐⭐ |
| **TabbedMovers - Volume** | Top stocks by volume | ⭐⭐⭐⭐ |

**สิ่งที่ดี:**
- เห็นหุ้นที่โดนพูดถึงหลายด้าน (cross-ranked)
- มีข้อมูล Active, Gainers, Losers, Volume ครบ

### ขาดอะไรไป ❌

| ข้อมูลที่ขาด | Impact ต่อนักลงทุน | ความสำคัญ |
|---------------|---------------------|-----------|
| **Top Picks per Sector** | หุ้น Top 3 ในแต่ละ sector ที่น่าสนใจ | 🔴 สูงมาก |
| **Stock-level Smart Money Flow** | Foreign/Inst กำลังซื้อหุ้นไหนอยู่? | 🔴 สูงมาก |
| **Multi-factor Stock Scoring** | เรียงลำดับหุ้นด้วยคะแนนรวม | 🟡 สูง |
| **Stock × Sector Linkage** | หุ้นแต่ละตัวอยู่ sector ไหน | 🟡 ปานกลาง |
| **Technical Entry Points** | จุดซื้อขายเทคนิค (Support/Resistance) | 🟢 ต่ำ |
| **Risk-Adjusted Picks** | หุ้นที่ potential สูงแต่ downside จำกัด | 🟡 ปานกลาง |

**ตัวอย่าง:**
> Sector ENERGY น่าลงทุน (จาก SectorStrengthCard)
>
> คำถามต่อ: หุ้น ENERGY ไหนดี?
>
> ข้อมูลที่ต้องการ:
> - Top 3 หุ้นใน ENERGY (เช่น PTT, TOP, PTTEP)
> - Foreign กำลังซื้อตัวไหนอยู่?
> - เทคนิค: ตัวไหนอยู่เหนือ/ใต้ MA สำคัญ?

---

## แนวทางการปรับปรุง

### P0 - ต้องทำ (Critical Gaps)

#### 1. MarketInternalsCard (Component ใหม่)
```
จุดประสงค์: ตอบคำถาม "ตลาดแข็งแกร่งแค่ไหน" ด้วยข้อมูลความกว้าง

ข้อมูลที่ต้องแสดง:
- Advance/Decline ratio (เช่น 200/400)
- New Highs / New Lows (เช่น 15/5)
- % หุ้นเหนือ MA 50 / MA 200
- Volume vs Average 20-day (เช่น 120% of avg)
- ตำแหน่งดัชนีใน 52-week range (เช่น 65%)

Visual: Mini gauge, progress bars, sparklines

ตำแหน่ง: P0 (ถัดจาก MarketRegimeCard)
```

#### 2. Sector Impact Analysis (เพิ่มเข้าไปใน SectorStrengthCard)
```
จุดประสงค์: แสดง sector ไหนกำลัง "ลาก" หรือ "พยุง" ตลาด

ข้อมูลที่ต้องแสดง:
- Sector contribution to SET change (weighted)
- ตัวอย่าง: "Technology +15pts", "Banking -8pts"

Visual: Horizontal bar chart แสดง contribution ทั้งบวกและลบ

ตำแหน่ง: ด้านบนของ SectorStrengthCard
```

#### 3. Smart Money Trend (เพิ่มเข้าไปใน SmartMoneyCard)
```
จุดประสงค์: แสดงเทรนด์ 5 วันของแต่ละนักลงทุน

ข้อมูลที่ต้องแสดง:
- 5-day net flow history per investor type
- Mini sparkline แสดงแนวโน้ม
- 5-day sum badge (เช่น "+8,000M")

Visual: Small sparkline + trend badge

ตำแหน่ง: เพิ่ม row ในแต่ละ InvestorRow
```

---

### P1 - ควรทำ (High Value)

#### 4. TopPicksBySector (Component ใหม่)
```
จุดประสงค์: ตอบคำถาม "ใน sector ที่น่าสนใจ มีหุ้นไหนดี?"

ข้อมูลที่ต้องแสดง:
- Top 3 stocks per leading sector
- Composite score (momentum + value + flow)
- Smart money flow per stock

Visual: Compact rows per sector

ตำแหน่ง: P1 (ด้านล่าง SectorStrengthCard)
```

#### 5. MarketContextCard (Component ใหม่)
```
จุดประสงค์: แสดง context ของตลาด (intermarket + technical)

ข้อมูลที่ต้องแสดง:
- 52-week range position (เช่น 65%)
- Distance from MA 50/200
- Thai baht vs USD
- Regional markets snapshot (Dow, S&P, Nikkei)

Visual: Small metrics with mini sparklines

ตำแหน่ง: P0 (ด้านล่าง P0 row)
```

---

### P2 - Nice to Have (Future Enhancement)

#### 6. Sector Flow Matrix (Component ใหม่)
```
จุดประสงค์: แสดง smart money flow แยกตาม sector

Visual: Heatmap (Sector × InvestorType)
```

#### 7. Stock Scoring Table (Component ใหม่)
```
จุดประสงค์: Multi-factor stock screening

ข้อมูล: Composite score calculation
Visual: Sortable table with scores
```

---

## โครงสร้างที่แนะนำ (หลังปรับปรุง P0)

```
┌─────────────────────────────────────────────────────────────┐
│ MarketStatusBanner (sticky) + DataFreshness                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CompactMetricStrip                                           │
│ 52W Range | Total Cap | Volatility | Breadth                 │  ← NEW
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ P0: MARKET OVERVIEW                                          │
├─────────────────────────────┬───────────────────────────────┤
│ MarketRegimeCard            │ MarketInternalsCard (NEW)      │  ← NEW
│ ├─ Risk-On/Off Regime       │ ├─ A/D Ratio                   │
│ ├─ Confidence Level         │ ├─ New Highs/Lows              │
│ └─ Focus/Caution            │ ├─ % Above MA 50/200           │
├─────────────────────────────┴───────────────────────────────┤
│ SmartMoneyCard (ENHANCED)                                   │  ← ENHANCED
│ ├─ Foreign/Inst/Retail/Prop                                  │
│ ├─ Score Gauge                                              │
│ ├─ Combined Signal                                           │
│ └─ 5-Day Trend Sparkline (NEW)                               │
├─────────────────────────────────────────────────────────────┤
│ DailyFocusList                                                │
│ └─ Cross-ranked stocks                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ P1: SECTOR ANALYSIS                                          │
├─────────────────────────────────────────────────────────────┤
│ SectorStrengthCard (ENHANCED)                                │  ← ENHANCED
│ ├─ Market Contribution Section (NEW)                          │
│ │  └─ Sector impact on SET (e.g., ICT +8pts)                 │
│ ├─ Top/Bottom 5 sectors                                      │
│ ├─ Rotation Pattern                                          │
│ └─ Buy/Avoid Signals                                         │
├─────────────────────────────────────────────────────────────┤
│ TopPicksBySector (NEW)                                       │  ← NEW
│ ├─ ENERGY: PTT, TOP, PTTEP                                   │
│ ├─ BANKING: KBANK, SCB, BBL                                  │
│ └─ ICT: ADVANCE, INTUCH, TRUE                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ P2: MARKET MOVERS                                            │
├─────────────────────────────────────────────────────────────┤
│ TabbedMovers (existing, no changes needed)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary Matrix

| คำถามนักลงทุน | ปัจจุบัน | หลัง P0 | หลัง P1 | หลัง P2 |
|----------------|----------|---------|---------|----------|
| **Q1: วันนี้ตลาดเป็นยังไง?** | 60% | **90%** | 95% | 100% |
| **Q2: นักลงทุนประเภทต่างๆ วิเคราะห์ยังไง น่าลงทุนไหม?** | 70% | **85%** | 90% | 95% |
| **Q3: Sector ไหนแบก/พยุง น่า Focus?** | 65% | 70% | **95%** | 100% |
| **Q4: Sector ไหนน่าลงทุน Top trade ตัวไหนน่าจับตา?** | 60% | 60% | **90%** | 100% |
| **Overall** | **64%** | **76%** | **93%** | **98%** |

---

## ลำดับการนำไปใช้งาน (Implementation Order)

### Phase 1 (P0) - ขาดอย่างมากสำหรับการตัดสินใจลงทุน
1. MarketInternalsCard component
2. SmartMoney trend enhancement (5-day sparklines)
3. Sector impact enhancement to SectorStrengthCard

### Phase 2 (P1) - เพิ่มคุณค่าสูง
4. TopPicksBySector component
5. MarketContextCard component
6. Smart money flow by sector (if data available)

### Phase 3 (P2) - ฟีเจอร์ขั้นสูง
7. Stock scoring system
8. Sector flow matrix
9. Technical entry points

---

## สรุป

หน้า Dashboard ปัจจุบันมี **พื้นฐานที่ดี** แต่ยัง **ขาดข้อมูลสำคัญบางส่วน** ที่จะทำให้นักลงทุนตัดสินใจได้อย่างมั่นใจ:

1. **Market Internals** - ต้องรู้ว่าการเคลื่อนไหวของตลาดเป็นแบบกว้างหรือแคบ
2. **Sector Impact** - ต้องรู้ว่า sector ไหนกำลัง "ลาก" หรือ "พยุง" ตลาด
3. **Smart Money Trend** - ต้องรู้ว่าการไหลของ Smart Money เป็น trend หรือเพียง one-off

หลังจาก implement P0 เสร็จ หน้า Dashboard จะตอบโจทย์นักลงทุนได้ถึง **76%** และหลังจาก P1 จะถึง **93%**

---

**เอกสารนี้สร้างโดย:** Investor Agent
**วันที่:** 25 มกราคม 2026
