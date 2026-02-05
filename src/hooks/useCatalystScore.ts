/**
 * useCatalystScore Hook
 *
 * Fetches and manages AI catalyst score from the n8n webhook API.
 * This hook can be shared between Layer4Technical and AIInsightsCard.
 */

import { useState, useEffect } from "react";
import type { ParsedCatalystData } from "@/types/catalyst";

export interface CatalystScoreState {
  aiScore: number | null;
  data: ParsedCatalystData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch AI catalyst score
 * @param symbol - Stock symbol
 * @param autoFetch - Whether to auto-fetch on mount (default: true)
 * @returns Catalyst score state and refetch function
 */
export function useCatalystScore(symbol: string, autoFetch = true) {
  const [state, setState] = useState<CatalystScoreState>({
    aiScore: null,
    data: null,
    isLoading: autoFetch,
    error: null,
  });

  const fetchCatalystScore = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/stocks/${symbol}/catalyst`);
      const result = await response.json();

      if (!result.success) {
        console.error("[useCatalystScore] API Error:", result);
      }

      setState({
        aiScore: result.data.aiScore ?? 0,
        data: result.data,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error("[useCatalystScore] Error:", err);
      setState({
        aiScore: null,
        data: null,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  useEffect(() => {
    if (autoFetch && symbol) {
      fetchCatalystScore();
    }
  }, [symbol, autoFetch]);

  return {
    ...state,
    refetch: fetchCatalystScore,
  };
}
