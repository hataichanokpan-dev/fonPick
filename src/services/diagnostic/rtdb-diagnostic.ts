/**
 * RTDB Diagnostic Service
 *
 * TDD Implementation to diagnose RTDB data fetch issues
 *
 * This service helps identify why RTDB returns null:
 * 1. Check Firebase configuration
 * 2. Check RTDB connection
 * 3. Check if data exists at expected paths
 * 4. Report detailed diagnostic information
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getDatabase, ref, get, DatabaseReference, DataSnapshot } from 'firebase/database'
import { firebaseConfig } from '@/lib/firebase/config'
import { RTDB_PATHS, getTodayDate, getDateDaysAgo } from '@/lib/rtdb/paths'

// ============================================================================
// DIAGNOSTIC RESULT TYPES
// ============================================================================

export interface DiagnosticResult {
  category: 'config' | 'connection' | 'data' | 'error'
  status: 'pass' | 'fail' | 'warn'
  message: string
  details?: string
  path?: string
}

export interface RTDBDiagnosticReport {
  timestamp: number
  results: DiagnosticResult[]
  summary: {
    config: boolean
    connection: boolean
    data: boolean
  }
  recommendations: string[]
}

// ============================================================================
// DIAGNOSTIC FUNCTIONS
// ============================================================================

/**
 * Check 1: Verify Firebase configuration
 */
function checkFirebaseConfig(): DiagnosticResult {
  const requiredVars = ['apiKey', 'databaseURL', 'projectId'] as const
  const missingVars = requiredVars.filter((key) => !firebaseConfig[key])

  if (missingVars.length > 0) {
    return {
      category: 'config',
      status: 'fail',
      message: 'Firebase configuration incomplete',
      details: `Missing environment variables: ${missingVars.join(', ')}`,
    }
  }

  return {
    category: 'config',
    status: 'pass',
    message: 'Firebase configuration is valid',
    details: `Project: ${firebaseConfig.projectId}, Database: ${firebaseConfig.databaseURL}`,
  }
}

/**
 * Check 2: Verify RTDB connection by trying to connect
 */
async function checkRTDBConnection(): Promise<DiagnosticResult> {
  try {
    // Initialize Firebase app
    let app: FirebaseApp
    const existingApps = getApps()
    if (existingApps.length > 0) {
      app = existingApps[0]
    } else {
      app = initializeApp(firebaseConfig)
    }

    // Get database instance
    const db = getDatabase(app)

    // Try to read root node (this tests connection without assuming data structure)
    const dbRef: DatabaseReference = ref(db, '/')
    await get(dbRef)

    return {
      category: 'connection',
      status: 'pass',
      message: 'RTDB connection successful',
      details: `Connected to ${firebaseConfig.databaseURL}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      category: 'connection',
      status: 'fail',
      message: 'RTDB connection failed',
      details: errorMessage,
    }
  }
}

/**
 * Check 3: Verify data exists at expected paths
 */
async function checkDataAtPath(
  path: string,
  pathName: string
): Promise<DiagnosticResult> {
  try {
    // Initialize Firebase app
    let app: FirebaseApp
    const existingApps = getApps()
    if (existingApps.length > 0) {
      app = existingApps[0]
    } else {
      app = initializeApp(firebaseConfig)
    }

    const db = getDatabase(app)
    const dbRef: DatabaseReference = ref(db, path)
    const snapshot: DataSnapshot = await get(dbRef)

    if (snapshot.exists()) {
      const data = snapshot.val()
      const dataType = Array.isArray(data) ? 'array' : typeof data
      const dataSize = JSON.stringify(data).length

      return {
        category: 'data',
        status: 'pass',
        message: `Data found at ${pathName}`,
        details: `Type: ${dataType}, Size: ${dataSize} bytes`,
        path,
      }
    }

    return {
      category: 'data',
      status: 'fail',
      message: `No data found at ${pathName}`,
      details: `Path ${path} does not exist or is null`,
      path,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      category: 'error',
      status: 'fail',
      message: `Error checking ${pathName}`,
      details: errorMessage,
      path,
    }
  }
}

/**
 * Check 4: List root level nodes to understand actual RTDB structure
 */
async function checkRTDBRootStructure(): Promise<DiagnosticResult> {
  try {
    let app: FirebaseApp
    const existingApps = getApps()
    if (existingApps.length > 0) {
      app = existingApps[0]
    } else {
      app = initializeApp(firebaseConfig)
    }

    const db = getDatabase(app)
    const dbRef: DatabaseReference = ref(db, '/')
    const snapshot: DataSnapshot = await get(dbRef)

    if (!snapshot.exists()) {
      return {
        category: 'data',
        status: 'fail',
        message: 'RTDB is completely empty',
        details: 'Root node does not exist - database may not be initialized',
      }
    }

    const data = snapshot.val()
    const rootKeys = Object.keys(data)

    return {
      category: 'data',
      status: 'pass',
      message: 'RTDB root structure found',
      details: `Root nodes: ${rootKeys.join(', ')}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      category: 'error',
      status: 'fail',
      message: 'Error checking RTDB root structure',
      details: errorMessage,
    }
  }
}

// ============================================================================
// MAIN DIAGNOSTIC FUNCTION
// ============================================================================

/**
 * Run complete RTDB diagnostic
 * Returns detailed report of what's wrong
 */
export async function diagnoseRTDB(): Promise<RTDBDiagnosticReport> {
  const results: DiagnosticResult[] = []
  const recommendations: string[] = []

  // Check 1: Firebase Config
  const configCheck = checkFirebaseConfig()
  results.push(configCheck)

  if (configCheck.status === 'fail') {
    recommendations.push(
      'Add missing Firebase environment variables to .env.local'
    )
    return {
      timestamp: Date.now(),
      results,
      summary: {
        config: false,
        connection: false,
        data: false,
      },
      recommendations,
    }
  }

  // Check 2: RTDB Connection
  const connectionCheck = await checkRTDBConnection()
  results.push(connectionCheck)

  if (connectionCheck.status === 'fail') {
    recommendations.push(
      'Check Firebase security rules - ensure read access is allowed',
      'Verify DATABASE_URL is correct and RTDB is enabled in Firebase console'
    )
    return {
      timestamp: Date.now(),
      results,
      summary: {
        config: true,
        connection: false,
        data: false,
      },
      recommendations,
    }
  }

  // Check 3: RTDB Root Structure
  const rootCheck = await checkRTDBRootStructure()
  results.push(rootCheck)

  // Check 4: Expected data paths
  const today = getTodayDate()
  const yesterday = getDateDaysAgo(1)

  const pathsToCheck = [
    { path: RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(today), name: `Market Overview (${today})` },
    { path: RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(yesterday), name: `Market Overview (${yesterday})` },
    { path: RTDB_PATHS.INVESTOR_TYPE_BY_DATE(today), name: `Investor Type (${today})` },
    { path: RTDB_PATHS.INDUSTRY_SECTOR_BY_DATE(today), name: `Industry Sector (${today})` },
    { path: RTDB_PATHS.RANKINGS_BY_DATE(today), name: `Top Rankings (${today})` },
    { path: '/settrade', name: '/settrade root' },
    { path: '/', name: 'Database root' },
  ]

  const dataChecks = await Promise.all(
    pathsToCheck.map(({ path, name }) => checkDataAtPath(path, name))
  )
  results.push(...dataChecks)

  // Analyze results and generate recommendations
  const hasSettradeNode = dataChecks.some(r => r.path === '/settrade' && r.status === 'pass')
  const hasAnyData = dataChecks.some(r => r.category === 'data' && r.status === 'pass')

  if (!hasSettradeNode) {
    recommendations.push(
      'The /settrade node does not exist in RTDB',
      'Data needs to be uploaded to /settrade/marketOverview/byDate/{YYYY-MM-DD}',
      'Check if data uploader script has been run'
    )
  } else if (!hasAnyData) {
    recommendations.push(
      'RTDB is connected but no data found for today or yesterday',
      'Check if data uploader script is working correctly',
      'Verify data is being uploaded to the correct date format (YYYY-MM-DD)'
    )
  }

  // Build summary
  const summary = {
    config: configCheck.status === 'pass',
    connection: connectionCheck.status === 'pass',
    data: hasAnyData,
  }

  return {
    timestamp: Date.now(),
    results,
    summary,
    recommendations,
  }
}

/**
 * Get human-readable summary of diagnostic report
 */
export function formatDiagnosticReport(report: RTDBDiagnosticReport): string {
  const lines: string[] = []
  lines.push('=== RTDB Diagnostic Report ===')
  lines.push(`Timestamp: ${new Date(report.timestamp).toISOString()}`)
  lines.push('')

  lines.push('Summary:')
  lines.push(`  Firebase Config: ${report.summary.config ? '✓' : '✗'}`)
  lines.push(`  RTDB Connection: ${report.summary.connection ? '✓' : '✗'}`)
  lines.push(`  Data Available: ${report.summary.data ? '✓' : '✗'}`)
  lines.push('')

  lines.push('Detailed Results:')
  for (const result of report.results) {
    const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠'
    lines.push(`  ${icon} [${result.category.toUpperCase()}] ${result.message}`)
    if (result.details) {
      lines.push(`    ${result.details}`)
    }
    if (result.path) {
      lines.push(`    Path: ${result.path}`)
    }
  }

  if (report.recommendations.length > 0) {
    lines.push('')
    lines.push('Recommendations:')
    for (const rec of report.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  return lines.join('\n')
}
