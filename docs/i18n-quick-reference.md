# i18n Quick Reference Guide

## Problem Solved
Fixed `MISSING_MESSAGE: Could not resolve 'dashboard'` error in MarketStatusBanner component.

## The Fix
Changed `src/lib/i18n/request.ts` to wrap dashboard and stock namespaces while spreading common namespaces.

```typescript
// CORRECT
messages: {
  ...common.default,        // nav, market, time at root
  dashboard: dashboard.default,  // Wrapped namespace
  stock: stock.default,      // Wrapped namespace
}
```

## How to Use

### In Components

```typescript
// For navigation items (from common.json)
const t = useTranslations('nav')
t('market')  // -> "Market"

// For dashboard content (from dashboard.json)
const t = useTranslations('dashboard')
t('marketStatus.title')  // -> "SET Index"

// For stock content (from stock.json)
const t = useTranslations('stock')
t('info.price')  // -> "Price"
```

### Adding New Translations

#### Option 1: Add to common.json
Add as top-level key if it's a general UI term:

```json
{
  "nav": {...},
  "myNewNamespace": {
    "key": "value"
  }
}
```

Then use: `useTranslations('myNewNamespace')`

#### Option 2: Create new file
1. Create `src/locales/en/myfile.json` and `src/locales/th/myfile.json`
2. Update `request.ts`:

```typescript
const [common, dashboard, stock, myfile] = await Promise.all([
  import(`@/locales/${locale}/common.json`),
  import(`@/locales/${locale}/dashboard.json`),
  import(`@/locales/${locale}/stock.json`),
  import(`@/locales/${locale}/myfile.json`),  // New
])

return {
  locale,
  messages: {
    ...common.default,
    dashboard: dashboard.default,
    stock: stock.default,
    myfile: myfile.default,  // Wrap new namespace
  },
}
```

Then use: `useTranslations('myfile')`

## File Structure

```
src/locales/
├── en/
│   ├── common.json      # nav, market, time, etc.
│   ├── dashboard.json   # dashboard-specific
│   └── stock.json       # stock-specific
└── th/
    ├── common.json      # Thai translations
    ├── dashboard.json
    └── stock.json
```

## Testing

Run i18n tests:
```bash
npm test -- src/lib/i18n --run
```

Expected: 99 tests passing

## Troubleshooting

### Error: "Could not resolve 'X' in messages"
- Check if namespace is wrapped correctly in `request.ts`
- Verify the key exists in the locale JSON file
- Clear Next.js cache: `rm -rf .next`

### Translations not showing
- Restart dev server: `npm run dev`
- Check browser console for errors
- Verify locale files are valid JSON

### Missing translations in one locale
- Ensure both `en/` and `th/` have the same keys
- Run integration tests to verify consistency

## Related Files

- `src/lib/i18n/request.ts` - Main i18n configuration
- `src/lib/i18n/routing.ts` - Locale routing configuration
- `src/components/dashboard/MarketStatusBanner.tsx` - Uses dashboard namespace
- `src/components/layout/Header.tsx` - Uses nav namespace
- `docs/i18n-fix.md` - Detailed fix documentation
- `docs/TDD-i18n-fix-summary.md` - TDD process summary
