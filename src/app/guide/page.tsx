/**
 * Guide Page
 *
 * User guide for FonPick Dashboard
 * Explains how to use the dashboard and calculation principles
 * Designed for non-investors
 */

import { HeroSection } from '@/components/guide/HeroSection'
import { QuickStart } from '@/components/guide/QuickStart'
import { FeatureAccordion } from '@/components/guide/FeatureAccordion'
import { DecisionFlow } from '@/components/guide/DecisionFlow'
import { FAQSection } from '@/components/guide/FAQSection'
import { GlossarySection } from '@/components/guide/GlossarySection'

// ============================================================================
// METADATA
// ============================================================================

export const metadata = {
  title: 'คู่มือการใช้งาน FonPick',
  description: 'เรียนรู้วิธีใช้งาน FonPick Dashboard และการวิเคราะห์ตลาดหุ้นไทย',
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#0a0e17]">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Quick Start */}
        <QuickStart />

        {/* Feature Explanations */}
        <FeatureAccordion />

        {/* Decision Flow */}
        <DecisionFlow />

        {/* FAQ */}
        <FAQSection />

        {/* Glossary */}
        <GlossarySection />

        
      </div>
    </main>
  )
}
