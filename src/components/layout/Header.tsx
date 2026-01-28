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
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Navigation link config
 */
const navLinks = [
  { href: '/', label: 'Market' },
  { href: '/search', label: 'Search' },
  { href: '/guide', label: 'คู่มือ' },
] as const

/**
 * Header Component
 * 48px height compact header with logo and navigation
 */
export function Header() {
  const pathname = usePathname()

  /**
   * Check if a link is active
   */
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 bg-bg-surface border-b border-border-subtle">
      {/* Safe area inset for mobile notch */}
      <div className="h-safe-top" />

      {/* Main header - 48px height */}
      <div className="h-12">
        <nav className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-up-primary rounded"
              aria-label="fonPick home"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
                <img src="/logo.svg" alt="fonPick logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold text-text-primary">
                fonPick
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    text-xs font-medium transition-colors rounded px-2 py-1
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-up-primary
                    ${isActive(link.href)
                      ? 'text-up-primary bg-up-soft/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                    }
                  `}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile menu button (placeholder for future menu) */}
            <button
              disabled
              className="sm:hidden p-2 -mr-2 text-text-disabled opacity-50 cursor-not-allowed"
              aria-label="Menu coming soon"
              type="button"
            >
              {/* Hamburger icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
