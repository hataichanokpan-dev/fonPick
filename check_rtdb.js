// Quick script to check RTDB data structure
// Run with: node check_rtdb.js

const RTDB_PATHS = {
  MARKET_OVERVIEW_LATEST: '/settrade/marketOverview/byDate/2025-01-24',
  RANKINGS_LATEST: '/settrade/topRankings/byDate/2025-01-24',
};

console.log('Expected RTDB Structure:');
console.log('================================');
console.log(`
1. Market Overview (${RTDB_PATHS.MARKET_OVERVIEW_LATEST}):
   {
     "data": {
       "setIndex": 1300.00,
       "setIndexChg": 10.00,
       "setIndexChgPct": 0.77,
       "totalValue": 60000,     // millions
       "totalVolume": 70000000, // thousands ← CRITICAL: Should be ~70M
       "advanceCount": 120,
       "declineCount": 80,
       "newHighCount": 15,
       "newLowCount": 5
     },
     "meta": { "capturedAt": "2025-01-24T...", ... }
   }

2. Top Rankings (${RTDB_PATHS.RANKINGS_LATEST}):
   {
     "data": {
       "topByValue": [
         { "symbol": "PTT", "name": "PTT", "last": 350, "chgPct": 2.5, "volMillion": 500, "valMillion": 50000 },
         { "symbol": "KBANK", "name": "KBANK", "last": 140, "chgPct": 1.2, "volMillion": 300, "valMillion": 30000 },
         ...
       ],
       "topByVolume": [...]
     },
     "meta": { ... }
   }
`);
