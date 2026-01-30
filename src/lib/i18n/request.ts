/**
 * i18n Request Utilities
 *
 * Server-side locale detection from request headers
 * Loads all message files and merges them with proper namespace structure
 *
 * Namespace Strategy:
 * - common.json: Contains multiple top-level namespaces (nav, common, market, time, etc.)
 *   These are spread directly to allow useTranslations('nav'), useTranslations('time'), etc.
 *
 * - dashboard.json: Wrapped under 'dashboard' namespace
 *   Allows useTranslations('dashboard') to access dashboard-specific translations
 *
 * - stock.json: Wrapped under 'stock' namespace
 *   Allows useTranslations('stock') to access stock-specific translations
 *
 * - guide.json: Wrapped under 'guide' namespace
 *   Allows useTranslations('guide') to access guide-specific translations
 *
 * Example:
 *   useTranslations('nav') -> messages.nav.* (from common.json)
 *   useTranslations('dashboard') -> messages.dashboard.* (from dashboard.json)
 *   useTranslations('stock') -> messages.stock.* (from stock.json)
 *   useTranslations('guide') -> messages.guide.* (from guide.json)
 */

import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  // Load all message files and merge them
  const [common, dashboard, stock, guide] = await Promise.all([
    import(`@/locales/${locale}/common.json`),
    import(`@/locales/${locale}/dashboard.json`),
    import(`@/locales/${locale}/stock.json`),
    import(`@/locales/${locale}/guide.json`)
  ])

  // Merge messages with namespace structure
  // - common.json contains multiple namespaces (nav, common, market, stock, time) - spread directly
  // - dashboard.json content should be under 'dashboard' namespace for useTranslations('dashboard')
  // - stock.json content should be under 'stock' namespace for useTranslations('stock')
  // - guide.json content should be under 'guide' namespace for useTranslations('guide')
  return {
    locale,
    messages: {
      ...common.default,    // nav, common, market, stock, time (for useTranslations('nav'))
      dashboard: dashboard.default,  // wrapped for useTranslations('dashboard')
      stock: stock.default,  // wrapped for useTranslations('stock')
      guide: guide.default,  // wrapped for useTranslations('guide')
    },
  }
})
