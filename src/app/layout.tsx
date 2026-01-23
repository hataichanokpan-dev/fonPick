/**
 * Root Layout
 * Main layout wrapper with providers and global styles
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'fonPick - Fast Stock Decisions',
  description: 'Make faster stock selection decisions with AI-powered analysis for the Thai stock market',
  keywords: ['stocks', 'SET', 'Thai stock market', 'investment', 'analysis'],
  authors: [{ name: 'fonPick' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0F172A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={inter.variable}>
      <body style={{ backgroundColor: '#0F172A' }} className="min-h-screen antialiased">
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-50 safe-top" style={{ backgroundColor: '#111827', borderBottom: '1px solid #273449' }}>
            <nav className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #16A34A, #15803d)' }}>
                    <span className="font-bold text-lg" style={{ color: '#ffffff' }}>f</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: '#E5E7EB' }}>
                    fonPick
                  </span>
                </Link>

                {/* Navigation */}
                <div className="flex items-center gap-4">
                  <Link
                    href="/"
                    className="text-sm font-medium transition-colors hover:text-flow-buy"
                    style={{ color: '#9CA3AF' }}
                  >
                    Market
                  </Link>
                  <Link
                    href="/search"
                    className="text-sm font-medium transition-colors hover:text-flow-buy"
                    style={{ color: '#9CA3AF' }}
                  >
                    Search
                  </Link>
                </div>
              </div>
            </nav>
          </header>

          {/* Main content */}
          <main className="flex-1 container mx-auto px-4 py-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-auto" style={{ backgroundColor: '#111827', borderTop: '1px solid #273449' }}>
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm" style={{ color: '#6B7280' }}>
                  © 2025 fonPick. Fast Stock Decisions.
                </div>
                <div className="flex items-center gap-4 text-sm" style={{ color: '#6B7280' }}>
                  <span>Data from SET</span>
                  <span>•</span>
                  <span>Delay: 15 minutes</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

function Link({
  href,
  children,
  className,
  style,
}: {
  href: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  )
}
