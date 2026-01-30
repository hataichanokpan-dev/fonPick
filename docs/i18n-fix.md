# i18n Dashboard Namespace Fix

## Problem

The application was throwing this error:
```
Error: MISSING_MESSAGE: Could not resolve `dashboard` in messages for locale `en`.
    at MarketStatusBanner (src\components\dashboard\MarketStatusBanner.tsx:184:28)
```

## Root Cause

The `request.ts` file was incorrectly merging i18n messages:

```typescript
// BUGGY CODE - This was the problem
return {
  locale,
  messages: {
    ...common.default,
    ...dashboard.default,
    ...stock.default,
  },
}
```

This spread all keys to the root level, resulting in:
```typescript
messages = {
  nav: {...},
  marketStatus: {...},
  home: {...},
  // etc - all flattened
}
```

When `MarketStatusBanner` called `useTranslations('dashboard')`, next-intl looked for `messages.dashboard.*`, but it didn't exist because the dashboard.json content was spread to root level.

## Solution

The fix preserves namespace structure for dashboard and stock, while spreading common namespaces:

```typescript
// FIXED CODE
return {
  locale,
  messages: {
    ...common.default,        // nav, market, time, etc. at root level
    dashboard: dashboard.default,  // wrapped for useTranslations('dashboard')
    stock: stock.default,      // wrapped for useTranslations('stock')
  },
}
```

This creates the correct structure:
```typescript
messages = {
  nav: {...},              // useTranslations('nav') works
  market: {...},           // useTranslations('market') works
  time: {...},             // useTranslations('time') works
  dashboard: {             // useTranslations('dashboard') works!
    marketStatus: {...},
    home: {...},
    // etc
  },
  stock: {                 // useTranslations('stock') works!
    price: 'Price',
    // etc
  }
}
```

## Why This Works

The locale files have different structures:

1. **common.json** - Contains multiple namespaces as top-level keys:
   ```json
   {
     "nav": {...},
     "common": {...},
     "market": {...},
     "time": {...}
   }
   ```
   These are spread directly so `useTranslations('nav')`, `useTranslations('time')` work.

2. **dashboard.json** - Contains dashboard-specific content:
   ```json
   {
     "marketStatus": {...},
     "home": {...},
     "section": {...}
   }
   ```
   This is wrapped so `useTranslations('dashboard')` can access it.

3. **stock.json** - Contains stock-specific content:
   ```json
   {
     "price": "Price",
     "volume": "Volume"
   }
   ```
   This is wrapped so `useTranslations('stock')` can access it.

## Files Modified

1. **src/lib/i18n/request.ts** - Fixed message merging strategy
2. **src/lib/i18n/__tests__/request.test.ts** - Added comprehensive tests

## Tests

Created test suite that validates:
- Namespace structure is correct
- All required keys exist for both locales
- Dashboard namespace is accessible
- Common namespaces (nav, time, etc.) remain accessible

Run tests:
```bash
npm test -- src/lib/i18n/__tests__/request.test.ts
```

## Verification

To verify the fix works:

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to the dashboard page

3. Check browser console for MISSING_MESSAGE errors (should be none)

4. Verify all text displays correctly in both English and Thai

## Future Considerations

If adding new namespaces:
- If the namespace should be in common.json, add it as a top-level key
- If creating a new file, wrap it in the messages object like dashboard and stock

Example for new "settings" namespace:
```typescript
const [common, dashboard, stock, settings] = await Promise.all([...])

return {
  locale,
  messages: {
    ...common.default,
    dashboard: dashboard.default,
    stock: stock.default,
    settings: settings.default,  // new namespace
  },
}
```
