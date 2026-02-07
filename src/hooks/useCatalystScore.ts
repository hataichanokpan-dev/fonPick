/**
 * useCatalystScore Hook
 *
 * Fetches and manages AI catalyst score from the n8n webhook API.
 * Now supports background job mode to avoid Next.js 60s timeout.
 *
 * Modes:
 * - Legacy mode: Direct fetch (may timeout after 60s)
 * - Job queue mode: Background job with polling (default)
 */

import { useState, useEffect, useRef } from "react";
import type { ParsedCatalystData } from "@/types/catalyst";

// ============================================================================
// TYPES
// ============================================================================

export interface CatalystScoreState {
  aiScore: number | null;
  data: ParsedCatalystData | null;
  isLoading: boolean;
  error: string | null;
  job: {
    jobId: string | null;
    isPolling: boolean;
    pollAttempt: number;
    progress: number;
    currentStep: string;
  };
}

export interface UseCatalystScoreOptions {
  /** Use background job mode (default: true) */
  useJobQueue?: boolean;
  /** Polling interval in milliseconds (default: 2000) */
  pollInterval?: number;
  /** Max poll attempts (default: 90 = ~3 minutes at 2s intervals) */
  maxPollAttempts?: number;
}

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

const DEFAULT_OPTIONS: Required<UseCatalystScoreOptions> = {
  useJobQueue: true,
  pollInterval: 2000,
  maxPollAttempts: 90,
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to fetch AI catalyst score
 * @param symbol - Stock symbol
 * @param options - Hook options (job queue mode, polling config)
 * @returns Catalyst score state and refetch function
 */
export function useCatalystScore(
  symbol: string,
  options: UseCatalystScoreOptions = {}
) {
  const { useJobQueue, pollInterval, maxPollAttempts } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const [state, setState] = useState<CatalystScoreState>({
    aiScore: null,
    data: null,
    isLoading: false,
    error: null,
    job: {
      jobId: null,
      isPolling: false,
      pollAttempt: 0,
      progress: 0,
      currentStep: "",
    },
  });

  // Ref to track polling state for cleanup
  const pollingRef = useRef<{ timeoutId: number | null }>({
    timeoutId: null,
  });

  // Legacy mode: Direct fetch (may timeout)
  const fetchCatalystScoreLegacy = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/stocks/${symbol}/catalyst`);
      const result = await response.json();

      if (!result.success) {
        const errorMessage = result.message || result.error || "API request failed";
        console.error("[useCatalystScore] API Error:", result);

        setState({
          aiScore: null,
          data: null,
          isLoading: false,
          error: errorMessage,
          job: { jobId: null, isPolling: false, pollAttempt: 0, progress: 0, currentStep: "" },
        });
        return;
      }

      const extractedAiScore = result.data?.aiScore ?? result.aiScore ?? null;

      setState({
        aiScore: extractedAiScore,
        data: result.data ?? null,
        isLoading: false,
        error: null,
        job: { jobId: null, isPolling: false, pollAttempt: 0, progress: 100, currentStep: "Complete" },
      });
    } catch (err) {
      console.error("[useCatalystScore] Error:", err);
      setState({
        aiScore: null,
        data: null,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
        job: { jobId: null, isPolling: false, pollAttempt: 0, progress: 0, currentStep: "" },
      });
    }
  };

  // Job queue mode: Background job with polling
  const fetchCatalystScoreWithJob = async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      job: { ...prev.job, isPolling: true, pollAttempt: 0, progress: 0, currentStep: "Creating job..." },
    }));

    try {
      // Step 1: Create job
      const createResponse = await fetch(`/api/stocks/${symbol}/catalyst/job`, {
        method: "POST",
      });

      const createResult = await createResponse.json();

      if (!createResult.success) {
        throw new Error(createResult.error || "Failed to create job");
      }

      const jobId = createResult.data.jobId;

      setState((prev) => ({
        ...prev,
        job: { ...prev.job, jobId },
      }));

      // Step 2: Poll for completion
      await pollJobCompletion(jobId);
    } catch (err) {
      console.error("[useCatalystScore] Job creation error:", err);
      setState({
        aiScore: null,
        data: null,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to create job",
        job: { jobId: null, isPolling: false, pollAttempt: 0, progress: 0, currentStep: "" },
      });
    }
  };

  // Poll job status until completion
  const pollJobCompletion = async (jobId: string): Promise<void> => {
    let attempts = 0;

    const poll = async (): Promise<void> => {
      attempts++;

      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        const result = await response.json();

        // Update progress from server
        if (result.data) {
          setState((prev) => ({
            ...prev,
            job: {
              ...prev.job,
              pollAttempt: attempts,
              progress: result.data.progress ?? prev.job.progress,
              currentStep: result.data.currentStep ?? prev.job.currentStep,
            },
          }));
        }

        // Check for job failure
        if (!result.success && result.data?.status === "failed") {
          setState({
            aiScore: null,
            data: null,
            isLoading: false,
            error: result.data.error || "Job failed",
            job: { jobId: null, isPolling: false, pollAttempt: attempts, progress: 0, currentStep: "Failed" },
          });
          return;
        }

        // Check for job completion
        if (result.success && result.data.status === "completed") {
          const { result: data } = result.data;
          setState({
            aiScore: data.aiScore,
            data,
            isLoading: false,
            error: null,
            job: { jobId: null, isPolling: false, pollAttempt: attempts, progress: 100, currentStep: "Complete" },
          });
          return;
        }

        // Still processing - continue polling
        if (attempts < maxPollAttempts) {
          const timeoutId = window.setTimeout(poll, pollInterval);
          pollingRef.current.timeoutId = timeoutId;
        } else {
          // Max attempts reached
          setState({
            aiScore: null,
            data: null,
            isLoading: false,
            error: "Request timeout - job took too long",
            job: { jobId: null, isPolling: false, pollAttempt: attempts, progress: 0, currentStep: "Timeout" },
          });
        }
      } catch (err) {
        console.error("[useCatalystScore] Poll error:", err);
        setState({
          aiScore: null,
          data: null,
          isLoading: false,
          error: err instanceof Error ? err.message : "Polling failed",
          job: { jobId: null, isPolling: false, pollAttempt: attempts, progress: 0, currentStep: "" },
        });
      }
    };

    poll();
  };

  // Main fetch function (dispatches based on mode)
  const fetchCatalystScore = async () => {
    if (useJobQueue) {
      await fetchCatalystScoreWithJob();
    } else {
      await fetchCatalystScoreLegacy();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current.timeoutId) {
        clearTimeout(pollingRef.current.timeoutId);
      }
    };
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    // Only auto-fetch if we don't already have data and we're not currently polling
    if (symbol && !state.data && !state.job.isPolling) {
      fetchCatalystScore();
    }
  }, [symbol]);

  return {
    ...state,
    refetch: fetchCatalystScore,
  };
}
