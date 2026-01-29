/**
 * useAnalytics Hook
 *
 * Simple analytics hook for tracking user events.
 * Can be extended with actual analytics providers (Google Analytics, Mixpanel, etc.)
 *
 * Features:
 * - Track custom events
 * - Track page views
 * - Track user interactions
 * - Console logging in development
 * - Easy integration with analytics providers
 */

import { useCallback, useMemo } from 'react'

interface AnalyticsEvent {
  name: string
  properties?: Record<string, string | number | boolean | undefined>
}

interface AnalyticsContext {
  trackEvent: (name: string, properties?: Record<string, string | number | boolean | undefined>) => void
  trackPageView: (path: string) => void
}

/**
 * Simple analytics hook for tracking events
 */
export function useAnalytics(): AnalyticsContext {
  const isDevelopment = useMemo(
    () => process.env.NODE_ENV === 'development',
    []
  )

  const trackEvent = useCallback(
    (name: string, properties?: Record<string, string | number | boolean | undefined>) => {
      const event: AnalyticsEvent = {
        name,
        properties,
      }

      // Log in development
      if (isDevelopment) {
        console.log('[Analytics] Event:', event)
      }

      // TODO: Integrate with actual analytics provider
      // Example: gtag('event', name, properties)
      // Example: mixpanel.track(name, properties)
    },
    [isDevelopment]
  )

  const trackPageView = useCallback((path: string) => {
    // Log in development
    if (isDevelopment) {
      console.log('[Analytics] Page View:', path)
    }

    // TODO: Integrate with actual analytics provider
    // Example: gtag('event', 'page_view', { page_path: path })
    // Example: mixpanel.track('Page View', { path })
  }, [isDevelopment])

  return {
    trackEvent,
    trackPageView,
  }
}
