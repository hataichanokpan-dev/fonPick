/**
 * Catalyst Job Queue
 *
 * In-memory job queue for managing long-running catalyst analysis operations.
 * Uses globalThis pattern to persist across Next.js dev mode hot reloads.
 *
 * Following memory leak prevention rules:
 * - Automatic cleanup of old jobs (1 hour TTL)
 * - Cleanup runs every 30 minutes
 * - No array accumulation
 */

import type {
  CatalystJob,
  CatalystJobOptions,
} from '@/types/job'
import { fetchAndParseCatalyst } from '@/lib/api/catalyst-api'
import { getCurrentStep } from '@/lib/api/catalyst-api'

// ============================================================================
// CONFIGURATION
// ============================================================================

const JOB_TTL = 60 * 60 * 1000 // 1 hour
const CLEANUP_INTERVAL = 30 * 60 * 1000 // 30 minutes

// ============================================================================
// GLOBAL SINGLETON (Next.js compatible)
// ============================================================================

/**
 * Use globalThis to persist singleton across Next.js dev mode hot reloads.
 * This ensures the job queue and its state survive module reloads.
 */
declare global {
  var catalystJobQueue: CatalystJobQueueClass | undefined
}

// ============================================================================
// JOB QUEUE CLASS
// ============================================================================

class CatalystJobQueueClass {
  private jobs: Map<string, CatalystJob>
  private cleanupTimer: NodeJS.Timeout | null = null
  private cleanupStarted: boolean = false

  constructor() {
    this.jobs = new Map()
    this.startCleanup()
  }

  // ========================================================================
  // JOB MANAGEMENT
  // ========================================================================

  /**
   * Create a new job and start processing
   * @param symbol - Stock symbol to analyze
   * @param options - Optional progress callback
   * @returns Job ID
   */
  createJob(symbol: string, options?: CatalystJobOptions): string {
    const jobId = crypto.randomUUID()
    const now = Date.now()

    const job: CatalystJob = {
      id: jobId,
      symbol: symbol.toUpperCase(),
      state: 'queued',
      progress: 0,
      currentStep: 'Queued...',
      result: null,
      error: null,
      createdAt: now,
      startedAt: null,
      completedAt: null,
    }

    this.jobs.set(jobId, job)
    console.log(`[JobQueue] Created job ${jobId} for ${symbol}`)

    // Start processing in background (non-blocking)
    this.processJob(jobId, options).catch((err) => {
      console.error(`[JobQueue] Job ${jobId} failed:`, err)
    })

    return jobId
  }

  /**
   * Get job by ID
   * @param id - Job ID
   * @returns Job object or undefined if not found
   */
  getJob(id: string): CatalystJob | undefined {
    const job = this.jobs.get(id)
    if (!job) {
      console.log(`[JobQueue] Job ${id} not found. Current jobs: ${this.jobs.size}`)
    }
    return job
  }

  /**
   * Update job progress
   * @param id - Job ID
   * @param progress - Progress percentage (0-100)
   * @param step - Current step description
   */
  updateProgress(id: string, progress: number, step: string): void {
    const job = this.jobs.get(id)
    if (job) {
      job.progress = Math.min(100, Math.max(0, progress))
      job.currentStep = step
    }
  }

  /**
   * Mark job as completed
   * @param id - Job ID
   * @param result - Parsed catalyst data
   */
  completeJob(id: string, result: CatalystJob['result']): void {
    const job = this.jobs.get(id)
    if (job) {
      job.state = 'completed'
      job.result = result
      job.progress = 100
      job.currentStep = 'Complete'
      job.completedAt = Date.now()
      console.log(`[JobQueue] Job ${id} completed successfully`)
    }
  }

  /**
   * Mark job as failed
   * @param id - Job ID
   * @param error - Error message
   */
  failJob(id: string, error: string): void {
    const job = this.jobs.get(id)
    if (job) {
      job.state = 'failed'
      job.error = error
      job.completedAt = Date.now()
      console.log(`[JobQueue] Job ${id} failed: ${error}`)
    }
  }

  // ========================================================================
  // JOB PROCESSING
  // ========================================================================

  /**
   * Process job in background
   * @param id - Job ID
   * @param options - Optional progress callback
   */
  private async processJob(
    id: string,
    options?: CatalystJobOptions,
  ): Promise<void> {
    const job = this.jobs.get(id)
    if (!job) {
      console.error(`[JobQueue] Job ${id} disappeared before processing`)
      return
    }

    try {
      // Update: Processing started
      job.state = 'processing'
      job.startedAt = Date.now()
      job.progress = 0
      job.currentStep = 'Connecting to AI service...'

      const startTime = Date.now()

      // Define progress callback
      const onProgress = (progress: number) => {
        const step = getCurrentStep(progress)
        job.progress = progress
        job.currentStep = step
        options?.onProgress?.(progress, step)
      }

      // Fetch with progress updates
      // Simulate progress based on elapsed time
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const estimatedProgress = Math.min(90, (elapsed / 90000) * 100) // 90s = ~100%
        onProgress(estimatedProgress)
      }, 1000)

      const result = await fetchAndParseCatalyst(job.symbol, {
        onProgress: (progress, _step) => {
          clearInterval(progressInterval)
          onProgress(progress)
        },
      })

      clearInterval(progressInterval)

      // Complete job
      this.completeJob(id, result)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred'
      this.failJob(id, message)
    }
  }

  // ========================================================================
  // CLEANUP
  // ========================================================================

  /**
   * Remove jobs older than TTL (1 hour)
   */
  cleanup(): void {
    const now = Date.now()
    const cutoff = now - JOB_TTL
    let removed = 0

    for (const [id, job] of this.jobs.entries()) {
      if (job.createdAt < cutoff) {
        this.jobs.delete(id)
        removed++
      }
    }

    if (removed > 0) {
      console.log(`[JobQueue] Cleaned up ${removed} old jobs`)
    }
  }

  /**
   * Start automatic cleanup timer
   * Runs every 30 minutes
   */
  startCleanup(): void {
    if (this.cleanupStarted || this.cleanupTimer) {
      return // Already started
    }

    this.cleanupStarted = true
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, CLEANUP_INTERVAL)

    console.log('[JobQueue] Automatic cleanup started')
  }

  /**
   * Stop cleanup timer
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
      this.cleanupStarted = false
      console.log('[JobQueue] Automatic cleanup stopped')
    }
  }

  // ========================================================================
  // METRICS (for monitoring)
  // ========================================================================

  /**
   * Get job queue metrics
   */
  getMetrics(): {
    totalJobs: number
    queuedJobs: number
    processingJobs: number
    completedJobs: number
    failedJobs: number
    oldestJobAge: number | null
  } {
    const jobsArray = Array.from(this.jobs.values())

    return {
      totalJobs: jobsArray.length,
      queuedJobs: jobsArray.filter((j) => j.state === 'queued').length,
      processingJobs: jobsArray.filter((j) => j.state === 'processing').length,
      completedJobs: jobsArray.filter((j) => j.state === 'completed').length,
      failedJobs: jobsArray.filter((j) => j.state === 'failed').length,
      oldestJobAge: jobsArray.length > 0
        ? Date.now() - Math.min(...jobsArray.map((j) => j.createdAt))
        : null,
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE (Next.js compatible)
// ============================================================================

/**
 * Get or create the singleton job queue instance.
 * Uses globalThis to persist across Next.js dev mode hot reloads.
 */
function getJobQueueInstance(): CatalystJobQueueClass {
  if (!global.catalystJobQueue) {
    global.catalystJobQueue = new CatalystJobQueueClass()
    console.log('[JobQueue] New singleton instance created')
  }
  return global.catalystJobQueue
}

/**
 * Singleton instance of the job queue
 */
export const CatalystJobQueue = getJobQueueInstance()

// Re-export class for testing
export { CatalystJobQueueClass }
