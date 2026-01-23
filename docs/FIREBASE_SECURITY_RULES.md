# Firebase Security Rules Setup

This document explains how to configure Firebase Realtime Database security rules for the fonPick application.

## Problem

The application was experiencing "Permission denied" errors when trying to fetch top rankings data:

```
Error fetching top rankings: Error [RTDBError]: Failed to fetch from RTDB: Permission denied
path: '/settrade/rankings/byDate/2026-01-23'
```

## Solution

Two parts are needed:

### 1. Code Changes (Already Applied)

The `rtdbGet` function in `src/lib/rtdb/client.ts` has been updated to handle permission denied errors gracefully:

```typescript
// Permission denied errors now return null instead of throwing
if (
  errorMessage.includes('Permission denied') ||
  errorMessage.includes('Unauthorized') ||
  errorMessage.includes('401') ||
  errorMessage.includes('403')
) {
  console.warn(`RTDB permission denied for path: ${path}`)
  return null
}
```

This allows the application to continue functioning even if optional data sources (like rankings) are unavailable due to permission issues.

### 2. Deploy Firebase Security Rules

#### Option A: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Realtime Database** > **Rules**
4. Copy the contents of `database.rules.json` and paste it into the rules editor
5. Click **Publish**

#### Option B: Using Firebase CLI

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Deploy the rules:
   ```bash
   firebase deploy --only database:rules
   ```

## Security Rules Structure

The `database.rules.json` file defines the following access rules:

- **Public read access** (`.read: true`) for all settrade data endpoints:
  - `/settrade/marketOverview`
  - `/settrade/investorType`
  - `/settrade/industrySector`
  - `/settrade/rankings`
  - `/settrade/nvdr`
  - `/settrade/stocks`
  - `/settrade/setIndex`
  - `/settrade/meta`

- **No write access** (`.write: false`) from client - all writes must be done server-side

- **Data validation** for rankings arrays:
  - `topGainers`, `topLosers`, `topVolume`, `topValue` must be arrays or null
  - `meta` object must have `capturedAt` (string), `schemaVersion` (number), `source` (string)

## Verification

After deploying the rules, verify the fix by:

1. Check the browser console for permission errors - they should no longer appear
2. The top rankings section should load (or show empty state if data is not yet available)
3. Other RTDB data (market overview, investor type, sector data) should load normally

## Future Considerations

If you need to add authentication in the future, you can modify the rules to:

```json
{
  "rules": {
    "settrade": {
      ".read": "auth != null",  // Require authentication
      ...
    }
  }
}
```

Or for more granular control:

```json
{
  "rules": {
    "settrade": {
      "marketOverview": {
        ".read": "true",  // Public access
        ".write": "auth.token.admin === true"  // Admin only
      },
      ...
    }
  }
}
```

## Related Files

- `database.rules.json` - Security rules definition
- `src/lib/rtdb/client.ts` - RTDB client with error handling
- `src/lib/rtdb/paths.ts` - RTDB path constants
- `src/lib/rtdb/top-rankings.ts` - Rankings data fetcher
