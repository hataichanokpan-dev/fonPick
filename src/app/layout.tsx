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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white border-b border-gray-200 safe-top">
            <nav className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">f</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    fonPick
                  </span>
                </Link>

                {/* Navigation */}
                <div className="flex items-center gap-4">
                  <Link
                    href="/"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Market
                  </Link>
                  <Link
                    href="/search"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
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
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  © 2025 fonPick. Fast Stock Decisions.
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
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
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
