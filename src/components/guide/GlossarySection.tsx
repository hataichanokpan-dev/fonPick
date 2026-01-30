/**
 * Glossary Section
 *
 * Definitions of technical terms used in FonPick
 */

'use client'

// ============================================================================
// GLOSSARY DATA
// ============================================================================

const glossaryTerms = [
  {
    term: 'Risk-On',
    definition: 'อารมณ์ตลาดที่ดี นักลงทุนกล้ารับความเสี่ยง เศรษฐกิจในมูลดี',
    example: 'Foreign ซื้อหนัก, Sector เสี่ยงขึ้น',
    color: 'green',
  },
  {
    term: 'Risk-Off',
    definition: 'อารมณ์ตลาดที่ไม่ดี นักลงทุนหนีความเสี่ยง เศรษฐกิจไม่แน่นอน',
    example: 'Foreign ขายหนัก, Sector ป้องกันขึ้น',
    color: 'red',
  },
  {
    term: 'Smart Money',
    definition: 'นักลงทุนระดับสถาบันที่มีเงินและข้อมูลมาก (Foreign, Institution)',
    example: 'กองทุนรวม, บมจ., นักลงทุนต่างชาติ',
    color: 'blue',
  },
  {
    term: 'Sector',
    definition: 'กลุ่มหุ้นประเภทเดียวกัน แบ่งตามอุตสาหกรรม',
    example: 'Technology (ICT), Banking (BANKING), Energy (ENERGY)',
    color: 'purple',
  },
  {
    term: 'Flow',
    definition: 'เงินไหลเข้า-ออก (Buy/Sell net) วัดเป็นล้านบาท',
    example: '+350M = ซื้อสุทธิ 350 ล้านบาท',
    color: 'yellow',
  },
  {
    term: 'Cross-ranked',
    definition: 'หุ้นที่ปรากฏในหลาย rankings (Active, Gainers, Volume)',
    example: 'PTT (3) = อยู่ใน 3 rankings แสดงถึงความแข็งแกร่ง',
    color: 'orange',
  },
  {
    term: 'HHI',
    definition: 'Herfindahl-Hirschman Index - คะแนนความเข้มข้นของตลาด',
    example: 'สูง = เงินจับกลุ่ม (concentrated), ต่ำ = เงินกระจาย (diverse)',
    color: 'gray',
  },
  {
    term: 'Cyclical Sector',
    definition: 'กลุ่มหุ้นที่ไวต่อเศรษฐกิจ ขึ้นเยอะเมื่อเศรษฐกิจดี',
    example: 'Technology, Banking, Energy',
    color: 'orange',
  },
  {
    term: 'Defensive Sector',
    definition: 'กลุ่มหุ้นที่ทนทานต่อทุกสถานการณ์ ขึ้นเมื่อตลาดไม่ดี',
    example: 'Food, Hospital, Utility',
    color: 'green',
  },
  {
    term: 'Confidence Level',
    definition: 'ระดับความมั่นใจของสัญญาณ (High/Medium/Low)',
    example: 'High = สัญญาณชัดเจน, Low = ยังไม่แน่ใจ',
    color: 'blue',
  },
]

// ============================================================================
// GLOSSARY COMPONENT
// ============================================================================

export function GlossarySection() {
  const colorClasses: Record<string, string> = {
    green: 'border-green-500/30 bg-green-500/5',
    red: 'border-red-500/30 bg-red-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
    yellow: 'border-yellow-500/30 bg-yellow-500/5',
    orange: 'border-orange-500/30 bg-orange-500/5',
    gray: 'border-gray-500/30 bg-gray-500/5',
  }

  return (
    <section className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-100">
          คำศัพท์ (Glossary)
        </h2>
        <p className="text-gray-400 text-sm">
          คำศัพท์ที่ใช้ใน FonPick อธิบายแบบเข้าใจง่าย
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {glossaryTerms.map((item) => (
          <div
            key={item.term}
            className={`p-4 rounded-lg border ${colorClasses[item.color]}`}
          >
            <div className="space-y-2">
              {/* Term */}
              <h3 className="font-semibold text-gray-200">
                {item.term}
              </h3>

              {/* Definition */}
              <p className="text-sm text-gray-300">
                {item.definition}
              </p>

              {/* Example */}
              <div className="text-xs text-gray-500 bg-gray-900/50 rounded px-2 py-1">
                <span className="text-gray-400">ตัวอย่าง:</span> {item.example}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reference */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-blue-400 mb-2">💡 เคล็ดลับ</h3>
        <p className="text-sm text-gray-300">
          เมื่อเห็นคำศัพท์ที่ไม่เข้าใจ คุณสามารถคลิกที่ไอคอน{' '}
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-700 text-gray-400">
            ?
          </span>{' '}
          เพื่อดูคำอธิบายได้ทันที
        </p>
      </div>
    </section>
  )
}
