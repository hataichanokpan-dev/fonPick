/**
 * i18n (Internationalization) Module
 *
 * Bilingual formatting utilities for Thai and English locales.
 *
 * @example
 * ```typescript
 * import { NumberFormatter, formatterEn, formatterTh } from '@/lib/i18n'
 *
 * // Create custom instance
 * const formatter = new NumberFormatter('en')
 * formatter.formatCurrency(1500000) // "THB 1.50M"
 *
 * // Use default instances
 * formatterEn.formatCurrency(1500000) // "THB 1.50M"
 * formatterTh.formatCurrency(1500000) // "฿1.50M"
 * ```
 */

// NumberFormatter - bilingual number formatting
export {
  NumberFormatter,
  formatterEn,
  formatterTh,
  type Locale,
  type NumberSuffix,
} from './number-formatter'
