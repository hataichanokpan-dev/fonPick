/**
 * Mobile Bottom Navigation
 * fonPick - Thai Stock Market Application
 *
 * 56px height bottom navigation for mobile devices.
 * Based on: docs/design_rules.md
 *
 * - Fixed positioning at bottom
 * - Safe area insets for mobile home indicator
 * - Active state indication
 * - Hidden on desktop (lg breakpoint and above)
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Bottom navigation config
 */
const bottomNavItems = [
  { href: '/', label: 'Market', icon: 'home' },
  { href: '/search', label: 'Search', icon: 'search' },
  { href: '/guide', label: 'คู่มือ', icon: 'guide' },
] as const

type IconName = typeof bottomNavItems[number]['icon']

/**
 * Icon component for navigation items
 */
function NavIcon({ name, className }: { name: IconName; className?: string }) {
  const icons = {
    home: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    ),
    search: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    ),
    guide: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332-.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    ),
  }

  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

/**
 * Mobile Bottom Navigation Component
 * 56px height bottom navigation bar for mobile
 */
export function MobileBottomNav() {
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
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-surface border-t border-border-subtle"
      aria-label="Mobile navigation"
    >
      {/* Navigation items - 56px height + safe area */}
      <div className="h-14 pb-safe-bottom">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-around h-full">
            {bottomNavItems.map((item) => {
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex flex-col items-center justify-center gap-0.5
                    min-w-[64px] transition-all duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-up-primary rounded
                    ${active
                      ? 'text-up-primary'
                      : 'text-text-tertiary hover:text-text-secondary'
                    }
                  `}
                  aria-current={active ? 'page' : undefined}
                  aria-label={item.label}
                >
                  <NavIcon
                    name={item.icon}
                    className="w-6 h-6"
                  />
                  <span className="text-[10px] font-medium">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
