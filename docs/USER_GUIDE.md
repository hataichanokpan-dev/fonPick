# คู่มือการใช้งาน FonPick Dashboard

## ภาพรวม

FonPick Dashboard เป็นเครื่องมือวิเคราะห์ตลาดหุ้นไทยแบบ Real-time
ออกแบบมาเพื่อตอบคำถามสำคัญ 4 ข้อของนักลงทุน:

1. **วันนี้ตลาดเป็นยังไง?**
2. **นักลงทุนประเภทต่างๆ วิเคราะห์ยังไง น่าลงทุนไหม?**
3. **Sector ไหนแบก/พยุงตลาด น่า Focus?**
4. **Sector ไหนน่าลงทุน Top trade ตัวไหนน่าจับตา?**

---

## โครงสร้างหน้าแรก (Homepage Layout)

หน้าแรกแบ่งเป็น 3 ส่วนหลักตามลำดับความสำคัญ:

```
┌─────────────────────────────────────────────────────────────┐
│ MarketStatusBanner (sticky) + DataFreshness                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ P0: MARKET OVERVIEW                                          │
│ MarketRegimeCard | SmartMoneyCard | DailyFocusList           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ P1: SECTOR ANALYSIS                                          │
│ SectorStrengthCard                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ P2: MARKET MOVERS                                            │
│ TabbedMovers                                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Market Status Banner (ด้านบนสุด)

แสดงสถานะตลาดแบบ Real-time อยู่ด้านบนสุดของหน้า (sticky)

### อ่านค่าอย่างไร:

| ส่วนประกอบ | แปลว่าอะไร |
|-------------|--------------|
| **ตัวเลขดัชนี SET** | ระดับดัชนี SET ปัจจุบัน (เช่น 1,350.25) |
| **ตัวเลขติดกัน (+5.25 / +0.39%)** | การเปลี่ยนแปลง = จุด / เปอร์เซ็นต์ |
| **สีเขียว** | ตลาดขึ้น |
| **สีแดง** | ตลาดลง |
| **จุดกระพริบ (●)** | ตลาดเปิดอยู่ |
| **จุดไม่กระพริบ** | ตลาดปิดแล้ว |
| **Data Freshness** | เวลาที่ข้อมูลอัปเดตล่าสุด |

**ตัวอย่าง:**
```
SET 1,350.25  +5.25  +0.39%  ●  2m ago
```
→ ตลาดขึ้น 5.25 จุด (+0.39%) | ตลาดเปิดอยู่ | ข้อมูลอัปเดต 2 นาทีก่อน

---

## 2. P0: Market Overview (ส่วนที่สำคัญที่สุด)

เป็นส่วน P0 (Priority 0) คือข้อมูลที่สำคัญที่สุดสำหรับการตัดสินใจลงทุน

### 2.1 MarketRegimeCard (ซ้าย - 40%)

**ตอบคำถาม:** ตอนนี้ Risk-On หรือ Risk-Off?

#### อ่านค่าอย่างไร:

| Regime | สี | แปลว่าอะไร | ควรทำอะไร |
|--------|-----|--------------|-------------|
| **Risk-On** | เขียว/น้ำเงิน | ตลาดมั่นใจ นักลงทุนกล้ารับความเสี่ยง | Focus หุ้นเสี่ยง (Growth, Tech) |
| **Neutral** | เทา | ตลาดไม่แน่นอน รอดูต่อ | รอสัญญาณชัดเจน |
| **Risk-Off** | แดง/ส้ม | ตลาดกลัว นักลงทุนหนีความเสี่ยง | Focus หุ้นป้องกัน (Food, Health) |

#### Key Elements:

| Element | แปลว่าอะไร |
|---------|--------------|
| **Confidence Bar** | ความมั่นใจของสัญญาณ (High/Med/Low) |
| **Focus / Caution** | สิ่งที่ควร Focus หรือระวัง |
| **Reasons** | เหตุผลประกอบการจัดประเภท Regime |

**ตัวอย่าง:**
```
RISK-ON
Confidence: ████████░░ 80%
Focus: Cyclical sectors, Growth stocks
Reasons: Foreign buying strong, Defensive sectors lagging
```
→ ตลาดอยู่ในสถานะ Risk-On ความมั่นใจสูง แนะนำ Focus หุ้นวัฏจักร

---

### 2.2 SmartMoneyCard (กลาง - 35%)

**ตอบคำถาม:** Smart Money ทำอะไรอยู่?

#### อ่านค่าอย่างไร:

**Score Gauge (0-100):**
- สีเขียว = Strong Buy (คะแนนสูง)
- สีแดง = Strong Sell (คะแนนต่ำ)
- สีเทา = Neutral (อยู่กลาง)

**Combined Signal:**
| Signal | แปลว่า |
|--------|---------|
| Strong Buy | Smart Money ซื้อหนักมาก |
| Buy | Smart Money ซื้อ |
| Neutral | Smart Money ไม่แน่นอน |
| Sell | Smart Money ขาย |
| Strong Sell | Smart Money ขายหนัก |

#### Investor Types:

| ประเภท | ความสำคัญ | ความหมาย |
|--------|------------|-----------|
| **Foreign (ต่างชาติ)** | ★★★ สำคัญมาก | Smart Money หลัก - มีเงินมากที่สุด |
| **Institution (สถาบัน)** | ★★★ สำคัญมาก | Smart Money หลัก - กองทุน/บมจ. |
| **Retail (รายย่อย)** | ★★ ใช้เป็น Context | คนทั่วไป - ใช้ดู sentiment |
| **Prop (โบรกเกอร์)** | ★★ ใช้เป็น Context | โบรกเกอร์ผู้จัดการ - ใช้ดู sentiment |

**Primary Driver:** แสดงว่าใครเป็นผู้นำตลาดวันนี้ (เช่น "Foreign +65%")

**ตัวอย่าง:**
```
Combined Signal: STRONG BUY
Primary Driver: Foreign

Foreign:    ████████████████████ 92
Institution:██████████████░░░░░░ 68
Retail:     █████░░░░░░░░░░░░░░░░ 32
Prop:       ████░░░░░░░░░░░░░░░░░ 18
```
→ Smart Money ซื้อหนัก โดย Foreign เป็นผู้นำ

---

### 2.3 DailyFocusList (ขวา - 25%)

**ตอบคำถาม:** หุ้นไหนโดนพูดถึงหลายด้าน?

#### อ่านค่าอย่างไร:

**Badge Format:** `ชื่อหุ้น (จำนวน Ranking)`

| ตัวอย่าง | แปลว่า |
|----------|---------|
| `PTT (3)` | PTT อยู่ใน 3 ranking (เช่น Active, Gainers, Volume) |
| `ADVANCE (2)` | ADVANCE อยู่ใน 2 ranking |
| `KBANK (1)` | KBANK อยู่ใน 1 ranking |

**สี Badge:**
- สีเขียว = หุ้นแข็งแกร่ง (Buy signal)
- สีเหลือง = หุ้นน่าสนใจ (Watch)
- สีเทา = หุ้นเฉยๆ (Neutral)

**ความหมาย:**
- ยิ่งเลขในวงเล็บสูง = ยิ่งโดนพูดถึงเยอะ
- Cross-ranked stocks = หุ้นที่มี High Conviction

**ตัวอย่าง:**
```
PTT (3)  ADVANCE (2)  KBANK (2)  TRUE (1)  SCB (1)
```
→ PTT เป็นหุ้นที่โดนพูดถึงหลายด้านที่สุดวันนี้

---

## 3. P1: Sector Analysis

### 3.1 SectorStrengthCard

**ตอบคำถาม:** Sector ไหนน่า Focus?

#### อ่านค่าอย่างไร:

**Leaders (บน - สีเขียว):**
- Top 5 sectors ที่ปรับตัวดีที่สุด
- เรียงลำดับจากซ้ายไปขวา = จากแข็งที่สุดไปอ่อนที่สุด

**Laggards (ล่าง - สีแดง):**
- Bottom 5 sectors ที่ปรับตัวแย่ที่สุด
- เรียงลำดับจากซ้ายไปขวา = จากอ่อนที่สุดไปแข็งที่สุด

**Rotation Pattern Badge:**
| Pattern | แปลว่า |
|---------|---------|
| Broad-Based Advance | ตลาดขึ้นทั่วหน้า - Trend แข็ง |
| Broad-Based Decline | ตลาดลงทั่วหน้า - Bearish |
| Risk-On Rotation | หมุนเข้า sector เสี่ยง (Tech, Finance) |
| Risk-Off Rotation | หมุนเข้า sector ป้องกัน (Food, Health) |
| Mixed Rotation | ไม่มี pattern ชัดเจน |

**Concentration Metric (HHI):**
- สูง = ตลาดถูกบังคับโดย sector ไม่กี่ตัว
- ต่ำ = ตลาดกระจายดีหลาย sector

**Actionable Signals:**
- **BUY** = Sector น่าลงทุน
- **AVOID** = Sector ควรหลีกเลี่ยง

**ตัวอย่าง:**
```
Leaders:
ICT +2.5% [BUY]  BANKING +1.8% [BUY]  ENERGY +1.2%

Rotation Pattern: Risk-On Rotation
Concentration: Medium (HHI: 0.15)
```
→ Sector ICT, Banking, Energy น่าลงทุน ตลาดอยู่ใน Risk-On Rotation

---

## 4. P2: Market Movers

### 4.1 TabbedMovers

**ตอบคำถาม:** หุ้นไหนเคลื่อนไหวมากที่สุด?

มี 4 Tabs ให้เลือก:

| Tab | แสดงอะไร | ใช้ทำอะไร |
|-----|-----------|------------|
| **Active** | Top 10 หุ้นโดยมูลค่าการซื้อขาย | ดูหุ้นที่เงินหมุนเยอะ |
| **Gainers** | Top 10 หุ้นที่ขึ้นเยอะที่สุด (%) | ดูหุ้นที่กำลังบูม |
| **Losers** | Top 10 หุ้นที่ลงเยอะที่สุด (%) | ดูหุ้นที่กำลังทุม |
| **Volume** | Top 10 หุ้นโดยปริมาณหุ้น | ดูหุ้นที่ซื้อขายบ่อยสุด |

#### อ่านค่าอย่างไร (Active Tab):

| คอลัมน์ | แปลว่า |
|----------|---------|
| **Symbol** | ชื่อหุ้น (เช่น PTT) |
| **Value** | มูลค่าการซื้อขาย (ล้านบาท) |
| **Change** | การเปลี่ยนแปลง (%) |
| **Badge** | ถ้ามี = อยู่ในหลาย ranking |

**Concentration Metrics:**
- Top 5 Share = % ของปริมาณเงินที่จับกลุ่มในหุ้น top 5
- HHI Score = คะแนนความเข้มข้น (ใกล้ 1 = เข้มข้น)

**Accumulation Pattern:**
- หุ้นที่อยู่ใน multiple tabs = มีการสะสม (accumulation)

**ตัวอย่าง (Active Tab):**
```
1. PTT      3,500M   +2.5%  (3)
2. ADVANCE  2,800M   +3.1%  (2)
3. KBANK    2,100M   +1.8%  (2)
4. SCB      1,800M   +0.9%
5. INTUCH   1,500M   +2.2%  (2)

Top 5 Share: 45%
```
→ เงินหมุนกระจุกตัวในหุ้นใหญ่ 45% PTT เป็นหุ้นที่เงินหมุนเยอะที่สุด

---

## ขั้นตอนการตัดสินใจลงทุน

### Step 1: เช็ค Market Regime

```
┌─────────────────────────────────────────┐
│ Risk-On  → Focus หุ้น Growth/Cyclical │
│ Neutral → รอสัญญาณชัดเจน           │
│ Risk-Off → Focus หุ้น Defensive/Profit │
└─────────────────────────────────────────┘
```

**ตัวอย่าง:**
- MarketRegimeCard แสดง "Risk-On"
- → Focus หุ้น Growth (ICT, COM) และ Cyclical (BANKING, ENERGY)

---

### Step 2: เช็ค Smart Money

```
┌────────────────────────────────────────────┐
│ Foreign/Inst Buy  → ตาม Smart Money      │
│ Foreign/Inst Sell → ระวัง Downside       │
│ Retail            → ใช้เป็น Context      │
└────────────────────────────────────────────┘
```

**ตัวอย่าง:**
- SmartMoneyCard แสดง "Strong Buy"
- Foreign + Institution ซื้อหนัก
- → สัญญาณ bullish มั่นใจ

---

### Step 3: เลือก Sector

```
┌────────────────────────────────────────────┐
│ ดู SectorStrengthCard                     │
│ → เลือก sectors ที่มี BUY signals        │
│ → หลีกเลี่ยง sectors ที่มี AVOID      │
└────────────────────────────────────────────┘
```

**ตัวอย่าง:**
- Leaders: ICT [BUY], BANKING [BUY]
- Laggards: PROPERTY [AVOID], CONSTRUC [AVOID]
- → Focus ICT และ BANKING

---

### Step 4: เลือก Stock

```
┌────────────────────────────────────────────┐
│ ดู DailyFocusList + TabbedMovers          │
│ → เลือกหุ้นที่โดนพูดถึงหลายด้าน   │
│ → ดู flow ของ Foreign/Inst                │
└────────────────────────────────────────────┘
```

**ตัวอย่าง:**
- DailyFocusList: ADVANCE (3), PTT (3)
- TabbedMovers (Active): ADVANCE, PTT อยู่ top ranks
- → ADVANCE และ PTT เป็นหุ้นน่าสนใจ

---

## เกร็ดความรู้

### Market Regime คืออะไร?

การจัดประเภทตลาดเป็น 3 ระดับความเสี่ยง:

| Regime | ลักษณะ | หุ้นที่มักขึ้น |
|--------|---------|-----------------|
| **Risk-On** | นักลงทุนกล้าลงทุน | Tech, Finance, Energy |
| **Risk-Off** | นักลงทุนกลัว หนีความเสี่ยง | Food, Health, Utilities |
| **Neutral** | ไม่แน่นอน รอดูต่อ | ไม่มี pattern ชัดเจน |

**เหตุผล:**
- Risk-On → เศรษฐกิจดี นักลงทุนหวังผลตอบแทนสูง
- Risk-Off → เศรษฐกิจไม่แน่นอน นักลงทุนรักษาความปลอดภัย

---

### Smart Money คือใคร?

| กลุ่ม | คือใคร | ทำไมสำคัญ |
|-------|---------|------------|
| **Foreign Investors** | นักลงทุนต่างชาติ (Long-only, Hedge funds) | มีเงินมากที่สุด เห็นภาพกว้าง |
| **Institutions** | กองทุนรวม, บมจ., ประกันชีวิต | มีข้อมูลดีกว่า วิเคราะห์ลึก |
| **Retail** | คนทั่วไป (คุณและผม) | ใช้ดู sentiment มักโดนโกง |
| **Prop** | โบรกเกอร์ผู้จัดการ (Proprietary Trading) | ใช้ดู sentiment ระยะสั้น |

**กลยุทธ์:**
- **Follow Smart Money** → ตาม Foreign และ Institution
- **Fade Dumb Money** → ทำตรงข้าม Retail (เมื่อมั่นใจ)

---

### Defensive Sectors คืออะไร?

Sector ที่มีความเสี่ยงต่ำ ทนทานต่อทุกสถานการณ์:

| Sector | ตัวอย่างหุ้น |
|--------|-----------------|
| **FOOD** (อาหาร) | CPF, MFC |
| **HELTH** (โรงพยาบาล) | BDMS, BH |
| **UTIL** (ไฟฟ้า/ประปา) | EGCO, BGRIM |
| **PROP** (อสังหาฯ) | AP, LH (บางครั้ง) |
| **PF** (กองทุนรวม) | TDEX, TFEX |

**ตอน Risk-Off:** Sector เหล่านี้มักขึ้น เพราะนักลงทุนหนีความเสี่ยง

---

## FAQ

### Q: Data อัปเดตเมื่อไหร่?
**A:** Real-time ระหว่างเวลาตลาดเปิด (09:30-16:30 น.)
- Auto-refresh ทุก **2 นาที**
- ข้อมูลมาจาก SET + NVDR (Smart Money flow)

### Q: ทำไมบางทีข้อมูลไม่แสดง?
**A:** อาจเป็นเพราะ:
- ตลาดปิดแล้ว
- วันหยุดตลาด
- ข้อมูลกำลังอัปเดต (retry อัตโนมัติ)

### Q: ควร Focus อะไรก่อน?
**A:** ลำดับความสำคัญ:
1. **P0** (Market Regime + Smart Money) → ตัดสินใจก่อนลงทุน
2. **P1** (Sector Analysis) → เลือก sector
3. **P2** (Market Movers) → เลือก stock

### Q: Combined Signal คำนวณยังไง?
**A:** จากผลรวมของ:
- Foreign flow (weight สูง)
- Institution flow (weight สูง)
- Retail flow (weight ต่ำ - ใช้เป็น context)
- Prop flow (weight ต่ำ - ใช้เป็น context)

### Q: Cross-ranked stocks คืออะไร?
**A:** หุ้นที่ปรากฏในหลาย rankings เช่น:
- อยู่ในทั้ง Active และ Gainers
- อยู่ในทั้ง Gainers และ Volume
- ยิ่งโดนพูดถึงหลายด้าน = ยิ่งมี High Conviction

### Q: Rotation Pattern หมายถึงอะไร?
**A:** รูปแบบการหมุนเวียนเงินระหว่าง sectors:
- **Risk-On Rotation:** เงินไหลเข้า Tech, Finance (เสี่ยง)
- **Risk-Off Rotation:** เงินไหลเข้า Food, Health (ปลอดภัย)
- **Broad-Based:** ทุก sector ขึ้น/ลงด้วยกัน

### Q: HHI Score คืออะไร?
**A:** Herfindahl-Hirschman Index - วัดความเข้มข้น:
- ใกล้ 1 = เงินจับกลุ่ม (concentrated)
- ใกล้ 0 = เงินกระจาย (diverse)

### Q: ถ้าตลาด Risk-Off ควรทำอย่างไร?
**A:**
1. ลด risk exposure (ลด port เสี่ยง)
2. Focus defensive sectors (Food, Health, Utilities)
3. ถือ cash รอสัญญาณดีขึ้น
4. ขายหุ้นที่มีทางเสียอย่างเดียว

### Q: ถ้า Smart Money ซื้อแต่ตลาดลง?
**A:** อาจเป็น:
- **Accumulation phase** - Smart Money สะสม รอขึ้น
- **Bottom fishing** - Smart Money มองว่าตลาดถูกเกินไป
- **Divergence** - ระวังอาจมี downside อีก

---

## สัญลักษณ์และสี

### สี
| สี | ความหมาย |
|-----|-----------|
| 🟢 เขียว | บวก / ซื้อ / ดี |
| 🔴 แดง | ลบ / ขาย / ไม่ดี |
| ⚪ เทา | เฉยๆ / Neutral |
| 🟡 เหลือง | ระวัง / Watch |

### Priority Levels
| Priority | ความหมาย |
|----------|-----------|
| **P0** | สำคัญที่สุด - ต้องดูก่อนเสมอ |
| **P1** | สำคัญรองลงมา |
| **P2** | เสริม - ดูเพิ่มเติม |

---

## เวอร์ชันและอัปเดต

| เวอร์ชัน | วันที่ | สิ่งที่เปลี่ยนแปลง |
|-----------|---------|-------------------|
| 1.0 | 25 Jan 2026 | เวอร์ชันแรก - P0, P1, P2 ครบ |
| - | - | - |

---

## ติดต่อและข้อเสนอแนะ

หากมีข้อสงสัยหรือข้อเสนอแนะ ติดต่อ:
- GitHub Issues: [fonpick/issues](https://github.com/fonpick/fonpick/issues)
- Email: support@fonpick.com

---

**เอกสารนี้อัปเดตล่าสุด:** 25 มกราคม 2026
**เวอร์ชัน:** 1.0
