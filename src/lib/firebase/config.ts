/**
 * Firebase Configuration
 *
 * Environment variables must be set in .env.local
 */

const firebaseConfigSchema = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const

/**
 * Validate Firebase configuration
 * Logs warning if environment variables are missing (non-blocking)
 */
function validateFirebaseConfig(config: typeof firebaseConfigSchema): void {
  const requiredVars: Array<keyof typeof firebaseConfigSchema> = [
    'apiKey',
    'databaseURL',
    'projectId',
  ]

  const missingVars = requiredVars.filter((key) => !config[key])

  if (missingVars.length > 0) {
    console.warn(
      `[Firebase] Warning: Missing environment variables: ${missingVars.join(', ')}. RTDB features will be disabled.`
    )
  }
}

// Validate on import (non-blocking - only warns)
validateFirebaseConfig(firebaseConfigSchema)

/**
 * Firebase configuration object
 * Exported for use in Firebase initialization
 */
export const firebaseConfig = firebaseConfigSchema

/**
 * Firebase environment variables type
 * Use for type checking environment variables
 */
export type FirebaseEnvVars = typeof firebaseConfigSchema
