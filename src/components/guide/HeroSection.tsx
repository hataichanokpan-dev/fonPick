/**
 * Hero Section
 *
 * Main hero section for the guide page
 * Explains what FonPick helps with
 */

'use client'

import { BookOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'

// ============================================================================
// HERO SECTION COMPONENT
// ============================================================================

export function HeroSection() {
  const t = useTranslations('guide.hero')

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
        {t('title')}
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-gray-400 max-w-2xl mx-auto">
        {t('subtitle')}
      </p>

      {/* Description */}
      <p className="text-gray-500 max-w-2xl mx-auto">
        {t('description')}
      </p>
    </section>
  )
}
