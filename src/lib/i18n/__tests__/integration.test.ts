/**
 * i18n Integration Tests
 *
 * Integration tests to verify i18n works correctly with actual locale files
 * and that all namespaces are accessible via useTranslations
 */

import { describe, it, expect } from 'vitest'

describe('i18n Integration', () => {
  describe('Locale File Structure', () => {
    it('should validate common.json has all expected namespaces', async () => {
      const enCommon = await import('@/locales/en/common.json')
      const common = enCommon.default || enCommon

      // Should have nav namespace for Header component
      expect(common.nav).toBeDefined()
      expect(common.nav.market).toBeDefined()
      expect(common.nav.search).toBeDefined()
      expect(common.nav.guide).toBeDefined()

      // Should have time namespace for timestamp formatting
      expect(common.time).toBeDefined()
      expect(common.time.justNow).toBeDefined()
      expect(common.time.minutesAgo).toBeDefined()
      expect(common.time.hoursAgo).toBeDefined()
      expect(common.time.daysAgo).toBeDefined()
    })

    it('should validate dashboard.json structure', async () => {
      const enDashboard = await import('@/locales/en/dashboard.json')
      const dashboard = enDashboard.default || enDashboard

      // Required for MarketStatusBanner
      expect(dashboard.marketStatus).toBeDefined()
      expect(dashboard.marketStatus.title).toBe('SET Index')
      expect(dashboard.marketStatus.marketOpen).toBeDefined()
      expect(dashboard.marketStatus.marketClosed).toBeDefined()
      expect(dashboard.marketStatus.justNow).toBeDefined()

      // Should have time namespace (overrides common.time)
      expect(dashboard.time).toBeDefined()
      expect(dashboard.time.minutesAgo).toBeDefined()
      expect(dashboard.time.hoursAgo).toBeDefined()
      expect(dashboard.time.daysAgo).toBeDefined()
    })

    it('should validate Thai locale has matching structure', async () => {
      const thDashboard = await import('@/locales/th/dashboard.json')
      const dashboard = thDashboard.default || thDashboard

      // Should have same structure as English
      expect(dashboard.marketStatus).toBeDefined()
      expect(dashboard.marketStatus.title).toBeDefined()
      expect(dashboard.marketStatus.marketOpen).toBeDefined()
      expect(dashboard.marketStatus.marketClosed).toBeDefined()
      expect(dashboard.marketStatus.justNow).toBeDefined()

      expect(dashboard.time).toBeDefined()
      expect(dashboard.time.minutesAgo).toBeDefined()
      expect(dashboard.time.hoursAgo).toBeDefined()
      expect(dashboard.time.daysAgo).toBeDefined()
    })
  })

  describe('Message Merging Strategy', () => {
    it('should simulate the correct message merging from request.ts', async () => {
      // Load actual locale files
      const common = await import('@/locales/en/common.json')
      const dashboard = await import('@/locales/en/dashboard.json')
      const stock = await import('@/locales/en/stock.json')

      // Simulate the fixed merging strategy from request.ts
      const messages = {
        ...(common.default || common),      // Spread common namespaces
        dashboard: dashboard.default || dashboard,  // Wrap dashboard
        stock: stock.default || stock,      // Wrap stock
      }

      // Verify nav namespace exists (for useTranslations('nav'))
      expect(messages.nav).toBeDefined()
      expect(messages.nav.market).toBe('Market')

      // Verify dashboard namespace exists (for useTranslations('dashboard'))
      expect(messages.dashboard).toBeDefined()
      expect(messages.dashboard.marketStatus).toBeDefined()
      expect(messages.dashboard.marketStatus.title).toBe('SET Index')

      // Verify stock namespace exists (for useTranslations('stock'))
      expect(messages.stock).toBeDefined()
      expect(messages.stock.info).toBeDefined()
      expect(messages.stock.info.price).toBeDefined()

      // Verify time namespace exists (from common.json)
      expect(messages.time).toBeDefined()
      expect(messages.time.justNow).toBeDefined()
    })

    it('should handle Thai locale with same strategy', async () => {
      const common = await import('@/locales/th/common.json')
      const dashboard = await import('@/locales/th/dashboard.json')
      const stock = await import('@/locales/th/stock.json')

      const messages = {
        ...(common.default || common),
        dashboard: dashboard.default || dashboard,
        stock: stock.default || stock,
      }

      // Verify Thai translations exist
      expect(messages.nav).toBeDefined()
      expect(messages.nav.market).toBeDefined()

      expect(messages.dashboard).toBeDefined()
      expect(messages.dashboard.marketStatus).toBeDefined()
      expect(messages.dashboard.marketStatus.title).toBe('ดัชนี SET')
    })
  })

  describe('Component Translation Compatibility', () => {
    it('should verify MarketStatusBanner translations exist', async () => {
      const enDashboard = await import('@/locales/en/dashboard.json')
      const dashboard = enDashboard.default || enDashboard

      // All keys used by MarketStatusBanner component
      const requiredKeys = {
        'marketStatus.title': dashboard.marketStatus.title,
        'marketStatus.marketOpen': dashboard.marketStatus.marketOpen,
        'marketStatus.marketClosed': dashboard.marketStatus.marketClosed,
        'marketStatus.justNow': dashboard.marketStatus.justNow,
        'time.minutesAgo': dashboard.time.minutesAgo,
        'time.hoursAgo': dashboard.time.hoursAgo,
        'time.daysAgo': dashboard.time.daysAgo,
      }

      // Verify all required keys exist and are non-empty strings
      Object.entries(requiredKeys).forEach(([key, value]) => {
        expect(value, `Missing key: ${key}`).toBeDefined()
        expect(typeof value, `Key ${key} should be a string`).toBe('string')
        expect(value.length, `Key ${key} should not be empty`).toBeGreaterThan(0)
      })
    })

    it('should verify Header translations exist', async () => {
      const enCommon = await import('@/locales/en/common.json')
      const common = enCommon.default || enCommon

      // All keys used by Header component
      const navKeys = {
        'nav.market': common.nav.market,
        'nav.search': common.nav.search,
        'nav.guide': common.nav.guide,
      }

      Object.entries(navKeys).forEach(([key, value]) => {
        expect(value, `Missing key: ${key}`).toBeDefined()
        expect(typeof value, `Key ${key} should be a string`).toBe('string')
        expect(value.length, `Key ${key} should not be empty`).toBeGreaterThan(0)
      })
    })
  })

  describe('Locale Consistency', () => {
    it('should verify English and Thai have same keys', async () => {
      const enDashboard = await import('@/locales/en/dashboard.json')
      const thDashboard = await import('@/locales/th/dashboard.json')

      const enKeys = Object.keys(enDashboard.default || enDashboard).sort()
      const thKeys = Object.keys(thDashboard.default || thDashboard).sort()

      // Both locales should have the same top-level keys
      expect(enKeys).toEqual(thKeys)
    })

    it('should verify all required keys exist in both locales', async () => {
      const requiredKeys = [
        'marketStatus.title',
        'marketStatus.marketOpen',
        'marketStatus.marketClosed',
        'marketStatus.justNow',
        'time.minutesAgo',
        'time.hoursAgo',
        'time.daysAgo',
      ]

      const enDashboard = await import('@/locales/en/dashboard.json')
      const thDashboard = await import('@/locales/th/dashboard.json')

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

      // Check English
      requiredKeys.forEach(key => {
        expect(
          hasKey(enDashboard.default || enDashboard, key),
          `English missing key: ${key}`
        ).toBe(true)
      })

      // Check Thai
      requiredKeys.forEach(key => {
        expect(
          hasKey(thDashboard.default || thDashboard, key),
          `Thai missing key: ${key}`
        ).toBe(true)
      })
    })
  })
})
