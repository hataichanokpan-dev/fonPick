/**
 * Quick Start Section
 *
 * 4 key questions that FonPick answers
 */

import { Card } from '@/components/shared/Card'
import { TrendingUp, DollarSign, Building2, Activity } from 'lucide-react'

// ============================================================================
// DATA
// ============================================================================

const quickStartItems = [
  {
    icon: <TrendingUp className="w-6 h-6" />,
    question: 'วันนี้ตลาดเป็นยังไง?',
    answer: 'Market Regime บอกอารมณ์ตลาด - Risk-On (กล้าลงทุน) หรือ Risk-Off (ระวัง)',
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    question: 'นักลงทุนใหญ่ทำอะไร?',
    answer: 'Smart Money ติดตามเงินฉลาด - Foreign และ Institution กำลังซื้อหรือขาย',
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    question: 'ควร Focus กลุ่มหุ้นไหน?',
    answer: 'Sector Analysis บอก sector ไหนกำลังน่าสนใจ และ sector ไหนควรหลีกเลี่ยง',
  },
  {
    icon: <Activity className="w-6 h-6" />,
    question: 'หุ้นไหนน่าสนใจ?',
    answer: 'Daily Focus แสดงหุ้นที่โดนพูดถึงหลายด้าน - High conviction picks',
  },
]

// ============================================================================
// QUICK START COMPONENT
// ============================================================================

export function QuickStart() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-100">
        ช่วยอะไรคุณได้บ้าง?
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {quickStartItems.map((item, index) => (
          <Card key={index} variant="outlined" className="p-5 hover:bg-gray-800/50 transition-colors">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                {item.icon}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-gray-200">
                  {item.question}
                </h3>
                <p className="text-sm text-gray-400">
                  {item.answer}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
