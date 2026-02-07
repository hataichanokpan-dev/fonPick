/**
 * Background Job System Types
 *
 * Types for the catalyst job queue system that handles long-running API operations.
 */

import type { ParsedCatalystData } from './catalyst'

// ============================================================================
// JOB STATE TYPES
// ============================================================================

/**
 * Job state represents the current status of a background job
 */
export type JobState = 'queued' | 'processing' | 'completed' | 'failed'

/**
 * Catalyst job represents a long-running catalyst analysis job
 */
export interface CatalystJob {
  /** Unique job identifier (UUID) */
  id: string
  /** Stock symbol being analyzed */
  symbol: string
  /** Current job state */
  state: JobState
  /** Progress percentage (0-100) */
  progress: number
  /** Current step description for UI display */
  currentStep: string
  /** Parsed catalyst data (available when job is completed) */
  result: ParsedCatalystData | null
  /** Error message (available when job failed) */
  error: string | null
  /** Job creation timestamp */
  createdAt: number
  /** Job start timestamp (null if not started) */
  startedAt: number | null
  /** Job completion timestamp (null if not completed) */
  completedAt: number | null
}

// ============================================================================
// JOB OPTIONS
// ============================================================================

/**
 * Options for job processing
 */
export interface CatalystJobOptions {
  /** Optional callback for progress updates during processing */
  onProgress?: (progress: number, step: string) => void
}

// ============================================================================
// JOB RESPONSE TYPES
// ============================================================================

/**
 * Response format for POST /api/stocks/{symbol}/catalyst/job
 */
export interface CreateJobResponse {
  success: true
  data: {
    jobId: string
    symbol: string
    status: JobState
  }
}

/**
 * Response format for GET /api/jobs/{id}
 */
export interface JobStatusResponse {
  success: boolean
  data?: {
    jobId: string
    symbol: string
    status: JobState
    progress: number
    currentStep: string
    result?: ParsedCatalystData | null
    error?: string | null
  }
  error?: string
}

// ============================================================================
// JOB QUEUE CONFIGURATION
// ============================================================================

/**
 * Job queue configuration constants
 */
export const JOB_CONFIG = {
  /** Job time-to-live in milliseconds (1 hour) */
  JOB_TTL: 60 * 60 * 1000,
  /** Cleanup interval in milliseconds (30 minutes) */
  CLEANUP_INTERVAL: 30 * 60 * 1000,
  /** Default polling interval in milliseconds (2 seconds) */
  DEFAULT_POLL_INTERVAL: 2000,
  /** Maximum polling attempts (90 * 2s = 3 minutes) */
  MAX_POLL_ATTEMPTS: 90,
} as const
