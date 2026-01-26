/**
 * Hero Section
 *
 * Main hero section for the guide page
 * Explains what FonPick helps with
 */

import { BookOpen } from 'lucide-react'

// ============================================================================
// HERO SECTION COMPONENT
// ============================================================================

export function HeroSection() {
  return (
    <section className="text-center space-y-6 py-8">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
        วิธีใช้งาน FonPick
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-gray-400 max-w-2xl mx-auto">
        เข้าใจตลาดหุ้นไทยง่ายๆ ใน 5 นาที
      </p>

      {/* Description */}
      <p className="text-gray-500 max-w-2xl mx-auto">
        คู่มือนี้ออกแบบมาสำหรับผู้เริ่มต้น อธิบายแบบเข้าใจง่าย
        ไม่ต้องมีพื้นฐานการลงทุนมากก็สามารถเข้าใจได้
      </p>
    </section>
  )
}
