/**
 * Root Layout
 * Main layout wrapper with providers and global styles
 * Based on: docs/design_rules.md
 *
 * Theme: Professional dark with green up / soft red down
 * Header: 48px height (compact)
 */

import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ErrorBoundary } from '@/components/shared'
import { Providers } from './providers'
import { Header, MobileBottomNav, Footer, ServiceWorkerRegister } from '@/components/layout'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
  weight: ['600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'fonPick - Fast Stock Decisions',
  description: 'Make faster stock selection decisions with AI-powered analysis for the Thai stock market',
  keywords: ['stocks', 'SET', 'Thai stock market', 'investment', 'analysis'],
  authors: [{ name: 'fonPick' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'fonPick',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0e17',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-screen antialiased bg-bg-primary text-text-primary">
        <Providers>
          <ErrorBoundary>
            <ServiceWorkerRegister />
            <div className="flex flex-col min-h-screen">
              {/* Header - Compact 48px height */}
              <Header />

              {/* Main content - 16px padding */}
              <main className="flex-1 container mx-auto px-4 py-4 pb-safe-bottom lg:pb-4">
                {children}
              </main>

              {/* Footer - Compact */}
              <Footer />

              {/* Mobile Bottom Navigation - 56px height */}
              <MobileBottomNav />
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
