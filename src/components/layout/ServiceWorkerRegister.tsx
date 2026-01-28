/**
 * Service Worker Registration
 * Registers PWA service worker for offline capability
 *
 * This component registers the service worker only:
 * - In production environment
 * - When service worker is supported
 * - When not on development server (unless explicitly enabled)
 */

'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register in production
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NEXT_PUBLIC_APP_ENV === 'production'
    ) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return null
}
