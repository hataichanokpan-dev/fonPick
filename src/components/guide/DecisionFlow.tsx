/**
 * Decision Flow Section
 *
 * Step-by-step guide on how to use FonPick for investment decisions
 */

import { ArrowDown } from 'lucide-react'

// ============================================================================
// DECISION FLOW DATA
// ============================================================================

const steps = [
  {
    step: 1,
    title: 'เช็ค Market Regime',
    description: 'ดูอารมณ์ตลาดก่อนเป็นอันดับแรก',
    decisions: [
      { condition: 'Risk-On', action: 'ไว้ใจลงทุน', color: 'green' },
      { condition: 'Neutral', action: 'รอดูต่อ', color: 'gray' },
      { condition: 'Risk-Off', action: 'ระวังลงทุน', color: 'red' },
    ],
  },
  {
    step: 2,
    title: 'เช็ค Smart Money',
    description: 'ยืนยันสัญญาณจากนักลงทุนใหญ่',
    decisions: [
      { condition: 'Foreign/Inst ซื้อ', action: 'ยืนยัน Signal', color: 'green' },
      { condition: 'Foreign/Inst ขาย', action: 'ระวัง Downside', color: 'red' },
    ],
  },
  {
    step: 3,
    title: 'เลือก Sector',
    description: 'เลือกกลุ่มหุ้นที่น่าสนใจ',
    decisions: [
      { condition: 'BUY signal', action: 'Focus sectors ที่มี BUY signal', color: 'green' },
      { condition: 'AVOID signal', action: 'หลีกเลี่ยง sectors ที่มี AVOID signal', color: 'red' },
    ],
  },
  {
    step: 4,
    title: 'เลือก Stock',
    description: 'เลือกหุ้นเดี่ยวที่น่าสนใจ',
    decisions: [
      { condition: 'Daily Focus', action: 'ดูหุ้นที่โดนพูดถึงหลายด้าน', color: 'blue' },
      { condition: 'Market Movers', action: 'ดู flow ของ Foreign/Inst', color: 'blue' },
    ],
  },
]

// ============================================================================
// DECISION FLOW COMPONENT
// ============================================================================

export function DecisionFlow() {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-100">
          ขั้นตอนการตัดสินใจ
        </h2>
        <p className="text-gray-400">
          ทำตามลำดับนี้เพื่อการตัดสินใจที่มีประสิทธิภาพ
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.step} className="relative">
            {/* Step Card */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start gap-4">
                {/* Step Number */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {step.description}
                    </p>
                  </div>

                  {/* Decisions */}
                  <div className="grid md:grid-cols-2 gap-2">
                    {step.decisions.map((decision, idx) => (
                      <div
                        key={idx}
                        className={`bg-gray-800/50 rounded-lg p-3 border-l-4 ${
                          decision.color === 'green'
                            ? 'border-green-500'
                            : decision.color === 'red'
                            ? 'border-red-500'
                            : decision.color === 'blue'
                            ? 'border-blue-500'
                            : 'border-gray-500'
                        }`}
                      >
                        <p className="text-sm text-gray-300">
                          <span className="font-semibold">{decision.condition}:</span>{' '}
                          {decision.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow (except last step) */}
            {index < steps.length - 1 && (
              <div className="flex justify-center my-2">
                <ArrowDown className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
