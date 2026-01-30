/**
 * Feature Accordion Section
 *
 * Detailed explanations for each dashboard feature
 * Uses accordion for expandable content
 */

'use client'

import { Accordion, AccordionItem } from '@/components/shared/Accordion'
import { Tooltip } from '@/components/shared/Tooltip'
import { BarChart3, DollarSign, TrendingUp, Star, Zap } from 'lucide-react'

// ============================================================================
// FEATURE DATA
// ============================================================================

const features: AccordionItem[] = [
  {
    id: 'market-regime',
    title: 'Market Regime - อารมณ์ตลาด',
    icon: <BarChart3 className="w-5 h-5 text-green-400" />,
    content: (
      <div className="space-y-4">
        {/* ทำไมต้องดู */}
        <div>
          <h4 className="font-semibold text-green-400 mb-2">ทำไมต้องดู?</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>รู้ว่าตอนนี้ควรลงทุนหรือรอ</li>
            <li>ช่วยเลือกประเภทหุ้นที่เหมาะสม</li>
            <li>เป็นพื้นฐานสำคัญที่สุดก่อนตัดสินใจ</li>
          </ul>
        </div>

        {/* อ่านยังไง */}
        <div>
          <h4 className="font-semibold text-blue-400 mb-2">อ่านยังไง?</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span>
                <strong className="text-green-400">Risk-On</strong> = ตลาดกำลังดี → ลงหุ้นเสี่ยงได้
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              <span>
                <strong className="text-gray-400">Neutral</strong> = รอดูต่อ → ระวังนิดหน่อย
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span>
                <strong className="text-red-400">Risk-Off</strong> = ตลาดกำลังไม่ดี → หุ้นป้องกันดีกว่า
              </span>
            </div>
          </div>
        </div>

        {/* ควรทำอะไร */}
        <div>
          <h4 className="font-semibold text-yellow-400 mb-2">ควรทำอะไร?</h4>
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-1 text-sm">
            <p><span className="text-green-400">Risk-On</span> → Focus Technology, Banking</p>
            <p><span className="text-gray-400">Neutral</span> → รอสัญญาณชัดเจน</p>
            <p><span className="text-red-400">Risk-Off</span> → Focus Food, Hospital</p>
          </div>
        </div>

        {/* หลักการคำนวณ */}
        <div>
          <h4 className="font-semibold text-purple-400 mb-2">หลักการคำนวณ (แบบง่ายๆ)</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
            <li>ดูดัชนี SET ขึ้น-ลง</li>
            <li>ดูเงินไหลของ Foreign + Institution</li>
            <li>ดู Sector ไหนขึ้น-ลง</li>
            <li>รวมกันเป็นคะแนน 0-10</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'smart-money',
    title: 'Smart Money - เงินฉลาด',
    icon: <DollarSign className="w-5 h-5 text-blue-400" />,
    content: (
      <div className="space-y-4">
        {/* ทำไมต้องดู */}
        <div>
          <h4 className="font-semibold text-green-400 mb-2">ทำไมต้องดู?</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>ตามเงินฉลาด = โอกาสชนะสูง</li>
            <li>
              Foreign + Institution คือผู้นำตลาด{' '}
              <Tooltip content="นักลงทุนที่มีเงินและข้อมูลมากที่สุด" />
            </li>
          </ul>
        </div>

        {/* อ่านยังไง */}
        <div>
          <h4 className="font-semibold text-blue-400 mb-2">อ่านยังไง?</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Score 0-100:</strong> สูง = ซื้อหนัก, ต่ำ = ขายหนัก</p>
            <p><strong>Driver:</strong> ใครเป็นคนนำ? (Foreign คือตัวชี้วัด)</p>
            <p><strong>Signal:</strong> Strong Buy → Buy → Neutral → Sell → Strong Sell</p>
          </div>
        </div>

        {/* ควรทำอะไร */}
        <div>
          <h4 className="font-semibold text-yellow-400 mb-2">ควรทำอะไร?</h4>
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-1 text-sm">
            <p><span className="text-green-400">Foreign/Inst ซื้อ</span> → โอกาสดี</p>
            <p><span className="text-red-400">Foreign/Inst ขาย</span> → ระวัง Downside</p>
            <p><span className="text-gray-400">Retail</span> → ใช้ดู Sentiment คนรายย่อยกำลังทำอะไร</p>
          </div>
        </div>

        {/* หลักการคำนวณ */}
        <div>
          <h4 className="font-semibold text-purple-400 mb-2">หลักการคำนวณ</h4>
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-1 text-sm font-mono">
            <p>Foreign × 1.2 (สำคัญที่สุด)</p>
            <p>Institution × 1.0</p>
            <p>Retail/Prop × 0.25 (เอาไปเป็น context)</p>
            <p className="pt-2 border-t border-gray-700">= Smart Money Score</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'sector-analysis',
    title: 'Sector Analysis - กลุ่มหุ้น',
    icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
    content: (
      <div className="space-y-4">
        {/* ทำไมต้องดู */}
        <div>
          <h4 className="font-semibold text-green-400 mb-2">ทำไมต้องดู?</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>รู้กลุ่มหุ้นไหนแบกตลาด</li>
            <li>รู้กลุ่มหุ้นไหนกำลังถูกขาย</li>
            <li>ช่วยกระจายความเสี่ยง</li>
          </ul>
        </div>

        {/* อ่านยังไง */}
        <div>
          <h4 className="font-semibold text-blue-400 mb-2">อ่านยังไง?</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Leaders (บน):</strong> 5 sectors ที่ทำได้ดีที่สุด</p>
            <p><strong>Laggards (ล่าง):</strong> 5 sectors ที่ทำได้แย่ที่สุด</p>
            <p><span className="text-green-400 font-semibold">BUY</span> Badge = น่าลงทุน</p>
            <p><span className="text-red-400 font-semibold">AVOID</span> Badge = ควรหลีกเลี่ยง</p>
          </div>
        </div>

        {/* ควรทำอะไร */}
        <div>
          <h4 className="font-semibold text-yellow-400 mb-2">ควรทำอะไร?</h4>
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-1 text-sm">
            <p>✓ Focus sectors ที่มี <span className="text-green-400">BUY signal</span></p>
            <p>✗ หลีกเลี่ยง sectors ที่มี <span className="text-red-400">AVOID signal</span></p>
          </div>
        </div>

        {/* Sector ประเภท */}
        <div>
          <h4 className="font-semibold text-purple-400 mb-2">Sector ประเภทไหนบ้าง?</h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <p className="font-semibold text-orange-400 mb-1">Cyclical (เสี่ยง)</p>
              <p className="text-gray-300">Tech, Finance, Energy</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="font-semibold text-green-400 mb-1">Defensive (ปลอดภัย)</p>
              <p className="text-gray-300">Food, Hospital, Utility</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'daily-focus',
    title: 'Daily Focus - หุ้นน่าสนใจ',
    icon: <Star className="w-5 h-5 text-yellow-400" />,
    content: (
      <div className="space-y-4">
        {/* ทำไมต้องดู */}
        <div>
          <h4 className="font-semibold text-green-400 mb-2">ทำไมต้องดู?</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>หุ้นที่โดนพูดถึงหลายด้าน = หุ้นแข็ง</li>
            <li>
              Cross-ranked{' '}
              <Tooltip content="ปรากฏในหลาย rankings เช่น Active, Gainers, Volume" />
              {' '}
              = High conviction
            </li>
          </ul>
        </div>

        {/* อ่านยังไง */}
        <div>
          <h4 className="font-semibold text-blue-400 mb-2">อ่านยังไง?</h4>
          <div className="space-y-2 text-sm">
            <p><strong>ชื่อหุ้น (เลข):</strong> อยู่กี่ rankings</p>
            <p><strong>เลขยิ่งสูง:</strong> ยิ่งโดนพูดถึงเยอะ</p>
            <div className="flex gap-3 mt-2">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">🟢 แข็งมาก</span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">🟡 น่าจับตา</span>
            </div>
          </div>
        </div>

        {/* ควรทำอะไร */}
        <div>
          <h4 className="font-semibold text-yellow-400 mb-2">ควรทำอะไร?</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
            <li>ดูหุ้นที่มีเลขสูงๆ</li>
            <li>ไปหาข้อมูลเพิ่มเติมจาก Market Movers</li>
          </ul>
        </div>

        {/* ตัวอย่าง */}
        <div>
          <h4 className="font-semibold text-purple-400 mb-2">ตัวอย่าง</h4>
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-1 text-sm font-mono">
            <p>PTT (3) = อยู่ใน 3 rankings</p>
            <p>ADVANCE (2) = อยู่ใน 2 rankings</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'market-movers',
    title: 'Market Movers - หุ้นเคลื่อนไหว',
    icon: <Zap className="w-5 h-5 text-orange-400" />,
    content: (
      <div className="space-y-4">
        {/* ทำไมต้องดู */}
        <div>
          <h4 className="font-semibold text-green-400 mb-2">ทำไมต้องดู?</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>รู้หุ้นไหนโดนพูดถึง</li>
            <li>รู้ว่าเงินจับกลุ่มหรือกระจาย</li>
          </ul>
        </div>

        {/* 4 Tabs */}
        <div>
          <h4 className="font-semibold text-blue-400 mb-2">4 Tabs ให้เลือก</h4>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="font-semibold text-blue-400">Active</p>
              <p className="text-gray-300">หุ้นที่เงินหมุนเยอะที่สุด</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="font-semibold text-green-400">Gainers</p>
              <p className="text-gray-300">หุ้นที่ราคาบูท</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="font-semibold text-red-400">Losers</p>
              <p className="text-gray-300">หุ้นที่ราคาถล่ม</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="font-semibold text-purple-400">Volume</p>
              <p className="text-gray-300">หุ้นที่ซื้อขายบ่อยที่สุด</p>
            </div>
          </div>
        </div>

        {/* Concentration */}
        <div>
          <h4 className="font-semibold text-yellow-400 mb-2">Concentration</h4>
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-1 text-sm">
            <p><span className="text-orange-400">สูง (&gt;50%)</span> = ตลาดบอบบาง</p>
            <p><span className="text-green-400">ต่ำ (&lt;30%)</span> = ตลาดแข็งแกร่ง</p>
          </div>
        </div>
      </div>
    ),
  },
]

// ============================================================================
// FEATURE ACCORDION COMPONENT
// ============================================================================

export function FeatureAccordion() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-100">
        อธิบายแต่ละ Feature แบบละเอียด
      </h2>

      <Accordion items={features} allowMultiple={true} />
    </section>
  )
}
