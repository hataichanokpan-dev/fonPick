/**
 * i18n Request Configuration Tests
 *
 * TDD Tests for i18n namespace loading and configuration
 * Tests that all namespaces (common, dashboard, stock) are properly loaded
 * with correct structure for next-intl
 */

import { describe, it, expect } from 'vitest'

describe('i18n Request Configuration - Message Structure', () => {
  describe('Current Implementation Issue', () => {
    it('should demonstrate the namespace problem: flat structure prevents namespace access', () => {
      // This demonstrates the CURRENT BUGGY implementation
      const common = { default: { test: 'common' } }
      const dashboard = { default: { marketStatus: { title: 'SET Index' } } }
      const stock = { default: { test: 'stock' } }

      // Current buggy implementation - spreads everything into root
      const messagesBuggy = {
        ...common.default,
        ...dashboard.default,
        ...stock.default,
      }

      // This FAILS - no dashboard namespace exists
      expect(messagesBuggy.dashboard).toBeUndefined()

      // useTranslations('dashboard') would fail with MISSING_MESSAGE error
      // because it looks for messages.dashboard.marketStatus.title
      expect(() => {
        const value = messagesBuggy.dashboard?.marketStatus?.title
        if (!value) throw new Error('MISSING_MESSAGE: Could not resolve dashboard')
      }).toThrow()
    })

    it('should demonstrate the correct implementation: nested namespace structure', () => {
      // This demonstrates the CORRECT implementation
      const common = { default: { test: 'common' } }
      const dashboard = { default: { marketStatus: { title: 'SET Index' } } }
      const stock = { default: { test: 'stock' } }

      // Correct implementation - namespaces are preserved
      const messagesCorrect = {
        common: common.default,
        dashboard: dashboard.default,
        stock: stock.default,
      }

      // This PASSES - dashboard namespace exists
      expect(messagesCorrect.dashboard).toBeDefined()
      expect(messagesCorrect.dashboard.marketStatus).toBeDefined()
      expect(messagesCorrect.dashboard.marketStatus.title).toBe('SET Index')

      // useTranslations('dashboard') would work correctly
      expect(() => {
        const value = messagesCorrect.dashboard.marketStatus.title
        if (!value) throw new Error('MISSING_MESSAGE')
      }).not.toThrow()
    })
  })

  describe('Message Key Validation', () => {
    it('should validate all required keys exist in dashboard.json files', async () => {
      // Import actual locale files to validate structure
      const enDashboard = await import('@/locales/en/dashboard.json')
      const thDashboard = await import('@/locales/th/dashboard.json')

      // Required keys for MarketStatusBanner component
      const requiredKeys = [
        'marketStatus.title',
        'marketStatus.marketOpen',
        'marketStatus.marketClosed',
        'marketStatus.justNow',
        'time.minutesAgo',
        'time.hoursAgo',
        'time.daysAgo',
      ]

      // Helper function to check nested key existence
      const hasKey = (obj: any, keyPath: string): boolean => {
        const keys = keyPath.split('.')
        let current = obj
        for (const key of keys) {
          if (!current || !current.hasOwnProperty(key)) {
            return false
          }
          current = current[key]
        }
        return true
      }

      // Validate English locale
      for (const key of requiredKeys) {
        expect(
          hasKey(enDashboard.default || enDashboard, key),
          `English dashboard missing key: ${key}`
        ).toBe(true)
      }

      // Validate Thai locale
      for (const key of requiredKeys) {
        expect(
          hasKey(thDashboard.default || thDashboard, key),
          `Thai dashboard missing key: ${key}`
        ).toBe(true)
      }
    })

    it('should validate message file structure is not empty', async () => {
      const enDashboard = await import('@/locales/en/dashboard.json')
      const thDashboard = await import('@/locales/th/dashboard.json')

      const enData = enDashboard.default || enDashboard
      const thData = thDashboard.default || thDashboard

      // Should have top-level sections
      expect(Object.keys(enData).length).toBeGreaterThan(0)
      expect(Object.keys(thData).length).toBeGreaterThan(0)

      // Should have marketStatus section
      expect(enData.marketStatus).toBeDefined()
      expect(thData.marketStatus).toBeDefined()
    })
  })

  describe('Namespace Structure Requirements', () => {
    it('should explain next-intl namespace requirements', () => {
      // next-intl expects messages to be structured like this:
      const expectedStructure = {
        common: {
          // common translations
        },
        dashboard: {
          marketStatus: {
            title: 'SET Index',
          },
        },
        stock: {
          // stock translations
        },
      }

      // When you call useTranslations('dashboard'), it looks for:
      // messages.dashboard
      expect(expectedStructure.dashboard).toBeDefined()

      // NOT for a flat structure like:
      const wrongStructure = {
        marketStatus: {
          title: 'SET Index',
        },
      }

      // This would fail with useTranslations('dashboard')
      expect(wrongStructure.dashboard).toBeUndefined()
    })

    it('should demonstrate the fix: wrap dashboard/stock, spread common', () => {
      const common = { default: { nav: { market: 'Market' }, test: 'common' } }
      const dashboard = { default: { marketStatus: { title: 'SET Index' } } }
      const stock = { default: { price: 'Price' } }

      // THE FIX:
      // - Spread common (contains nav, market, time, etc. as top-level keys)
      // - Wrap dashboard in namespace object
      // - Wrap stock in namespace object
      const messages = {
        ...common.default,      // nav, test directly accessible
        dashboard: dashboard.default,  // wrapped for useTranslations('dashboard')
        stock: stock.default,   // wrapped for useTranslations('stock')
      }

      // Verify nav namespace exists (from common.json)
      expect(messages.nav).toBeDefined()
      expect(messages.nav.market).toBe('Market')

      // Verify dashboard namespace exists (wrapped)
      expect(messages.dashboard).toBeDefined()
      expect(messages.dashboard.marketStatus.title).toBe('SET Index')

      // Verify stock namespace exists (wrapped)
      expect(messages.stock).toBeDefined()
      expect(messages.stock.price).toBe('Price')
    })
  })
})
