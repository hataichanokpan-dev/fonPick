/**
 * Header Component
 * fonPick - Thai Stock Market Application
 *
 * Compact 48px header with logo and desktop navigation.
 * Based on: docs/design_rules.md
 *
 * - Sticky positioning with z-50
 * - Safe area insets for mobile
 * - Logo with gradient background
 * - Desktop navigation links
 * - Language switcher
 */

'use client'

import Link from 'next/link'
import { usePathname } from '@/lib/i18n/routing'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'

/**
 * Header Component
 * 48px height compact header with logo and navigation
 */
export function Header() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('nav')

  /**
   * Check if a link is active
   */
  const isActive = (href: string) => {
    // Remove locale prefix from pathname for comparison
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    if (href === '/') {
      return pathWithoutLocale === '/'
    }
    return pathWithoutLocale.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 bg-bg-surface border-b border-border-subtle">
      {/* Safe area inset for mobile notch */}
      <div className="h-safe-top" />

      {/* Main header - 48px height */}
      <div className="h-12">
        <nav className="container mx-auto px-2 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-up-primary rounded"
              aria-label="fonPick home"
            >
              <div className="w-16 h-6 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
                <img src="/fonpick.png" alt="fonPick logo" className="w-full h-full object-contain" />
              </div>
             
            </Link>

            {/* Navigation - 3 buttons: Market, Search, Guide + Language Switcher */}
            <div className="flex items-center gap-2">
              {['market', 'search', 'guide'].map((key) => (
                <Link
                  key={key}
                  href={key === 'market' ? '/' : `/${key}`}
                  className={`xs:hidden
                    text-xs font-medium transition-colors rounded px-2 py-1
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-up-primary
                    ${isActive(key === 'market' ? '/' : `/${key}`)
                      ? 'text-up-primary bg-up-soft/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                    }
                  `}
                  aria-current={isActive(key === 'market' ? '/' : `/${key}`) ? 'page' : undefined}
                >
                  {t(key as any)}
                </Link>
              ))}

              {/* Language Switcher */}
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
