/**
 * FAQ Section
 *
 * Frequently asked questions about FonPick
 */

import { Accordion, AccordionItem } from '@/components/shared/Accordion'

// ============================================================================
// FAQ DATA
// ============================================================================

const faqs: AccordionItem[] = [
  {
    id: 'update-frequency',
    title: 'Data อัปเดตเมื่อไหร่?',
    content: (
      <div className="text-gray-300 space-y-2">
        <p>End-time หลังตลาดปิด (18:30 น.)</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>ข้อมูลตลาดหุ้นไทย (SET)</li>
          <li>ข้อมูลมาจาก SET + NVDR (Smart Money flow)</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'no-data',
    title: 'ทำไมบางทีข้อมูลไม่แสดง?',
    content: (
      <div className="text-gray-300 space-y-2">
        <p>อาจเป็นเพราะ:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>ตลาดปิดแล้ว (หลัง 16:30 น.)</li>
          <li>วันหยุดตลาด</li>
          <li>ข้อมูลกำลังอัปเดต (retry อัตโนมัติ)</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'priority-order',
    title: 'ควร Focus อะไรก่อน?',
    content: (
      <div className="text-gray-300 space-y-2">
        <p>ลำดับความสำคัญ:</p>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>
            <strong className="text-blue-400">P0</strong> (Market Regime + Smart Money) → ตัดสินใจก่อนลงทุน
          </li>
          <li>
            <strong className="text-purple-400">P1</strong> (Sector Analysis) → เลือก sector
          </li>
          <li>
            <strong className="text-orange-400">P2</strong> (Market Movers) → เลือก stock
          </li>
        </ol>
      </div>
    ),
  },
  {
    id: 'smart-money-definition',
    title: 'Smart Money คืออะไร?',
    content: (
      <div className="text-gray-300 space-y-2">
        <p>Smart Money คือนักลงทุนระดับสถาบัน:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong className="text-blue-400">Foreign</strong> - นักลงทุนต่างชาติ</li>
          <li><strong className="text-blue-400">Institution</strong> - กองทุนรวม, บมจ.</li>
        </ul>
        <p className="text-sm mt-2">
          พวกเขามีเงินและข้อมูลมากกว่าคนรายย่อย ดังนั้นการตามพวกเขามักจะให้ผลดี
        </p>
      </div>
    ),
  },
  {
    id: 'risk-on-off',
    title: 'Risk-On/Off คืออะไร?',
    content: (
      <div className="text-gray-300 space-y-2">
        <p>คืออารมณ์โดยรวมของตลาด:</p>
        <div className="grid md:grid-cols-2 gap-3 mt-2">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="font-semibold text-green-400">Risk-On</p>
            <p className="text-sm">นักลงทุนกล้ารับความเสี่ยง เศรษฐกิจดี</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="font-semibold text-red-400">Risk-Off</p>
            <p className="text-sm">นักลงทุนกลัว หนีความเสี่ยง เศรษฐกิจไม่แน่นอน</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'contradiction',
    title: 'ถ้า Smart Money ซื้อแต่ตลาดลง?',
    content: (
      <div className="text-gray-300 space-y-2">
        <p>อาจเป็น:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Accumulation phase</strong> - Smart Money สะสม รอขึ้น</li>
          <li><strong>Bottom fishing</strong> - Smart Money มองว่าตลาดถูกเกินไป</li>
          <li><strong>Divergence</strong> - ระวังอาจมี downside อีก</li>
        </ul>
        <p className="text-sm mt-2 text-yellow-400">
          ในกรณีนี้ ควรรอดูสัญญาณชัดเจนก่อนตัดสินใจ
        </p>
      </div>
    ),
  },
  {
    id: 'cross-ranked',
    title: 'Cross-ranked stocks คืออะไร?',
    content: (
      <div className="text-gray-300 space-y-2">
        <p>หุ้นที่ปรากฏในหลาย rankings เช่น:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>อยู่ในทั้ง Active และ Gainers</li>
          <li>อยู่ในทั้ง Gainers และ Volume</li>
        </ul>
        <p className="text-sm mt-2">
          ยิ่งโดนพูดถึงหลายด้าน = ยิ่งมี <strong className="text-yellow-400">High Conviction</strong>
        </p>
      </div>
    ),
  },
]

// ============================================================================
// FAQ SECTION COMPONENT
// ============================================================================

export function FAQSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-100">
        คำถามที่พบบ่อย (FAQ)
      </h2>

      <Accordion items={faqs} allowMultiple={false} />
    </section>
  )
}
