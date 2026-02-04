/**
 * Catalyst API Types
 *
 * Types for the AI-powered catalyst analysis API
 */

/**
 * Raw response from the Catalyst API (n8n webhook)
 */
export interface CatalystAPIResponse {
  Answer: string
  Score: number
}
export interface CatalystAPIDetail{
  Answer: string
  Score: number
}

/**
 * Parsed catalyst data from the API response
 * The Answer field contains structured text that needs to be parsed
 */
export interface ParsedCatalystData {
  /** Investment theme - the main narrative about the stock */
  theme: string

  /** Array of catalyst events - time-sensitive events that could impact the stock */
  catalysts: string[]

  /** Key metrics/factors to monitor - ongoing concerns */
  whatToWatch: string[]

  /** AI score (0-10) - overall assessment from the AI */
  aiScore: number
}

/**
 * Loading state for the catalyst fetch operation
 */
export type CatalystLoadingStatus = 'idle' | 'loading' | 'success' | 'error'

export interface CatalystLoadingState {
  status: CatalystLoadingStatus
  /** Progress percentage (0-100) - estimated based on time elapsed */
  progress?: number
  /** Estimated time remaining in seconds */
  eta?: number
  /** Current step description - e.g., "Detecting catalysts..." */
  currentStep?: string
  /** Error message if status is 'error' */
  error?: string
}

/**
 * Tab type for AI Insights card navigation
 */
export type CatalystTab = 'catalysts' | 'watch' | 'theme'

/**
 * Props for the AIInsightsCard component
 */
export interface AIInsightsCardProps {
  symbol: string
  locale?: 'en' | 'th'
  initialData?: ParsedCatalystData | null  // Pre-fetched data to avoid duplicate fetches
}

/**
 * Props for the CatalystLoading component
 */
export interface CatalystLoadingProps {
  eta?: number
  progress?: number
  currentStep?: string
}
