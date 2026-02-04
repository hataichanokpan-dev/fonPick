/**
 * Catalyst API Service
 *
 * Handles integration with the n8n Catalyst2Score webhook API
 */

import type { CatalystAPIResponse, ParsedCatalystData } from "@/types/catalyst";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CATALYST_API_URL =
  process.env.CATALYST_API_URL ||
  "https://n8n-dasimoa.duckdns.org/webhook/Catalyst2Score";
const CATALYST_API_TIMEOUT = parseInt(
  process.env.CATALYST_API_TIMEOUT || "150000",
  10,
); // 2.5 minutes default

// ============================================================================
// THAI MONTH NAMES
// ============================================================================

/**
 * Get Thai month name for a given date
 * @param date - Date object (defaults to current date)
 * @returns Thai month name
 */
function getThaiMonthName(date: Date = new Date()): string {
  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  return months[date.getMonth()];
}

/**
 * Get Thai year (Buddhist era)
 * @param date - Date object (defaults to current date)
 * @returns Thai year (e.g., 2026)
 */
function getThaiYear(date: Date = new Date()): number {
  return date.getFullYear();
}

// ============================================================================
// CHAT INPUT GENERATION
// ============================================================================

/**
 * Generate chatInput for the Catalyst API
 * Format: "{SYMBOL} ตอนนี้เดือน{MONTH} {YEAR}"
 * @param symbol - Stock symbol (e.g., "KBANK")
 * @returns Chat input string for the API
 * @throws CatalystAPIError if symbol format is invalid
 */
export function generateChatInput(symbol: string): string {
  // Validate symbol format: 1-10 alphanumeric characters
  if (!symbol || !/^[A-Za-z0-9]{1,10}$/.test(symbol)) {
    throw new CatalystAPIError("Invalid symbol format", 400, symbol);
  }

  const uppercaseSymbol = symbol.toUpperCase().trim();
  const month = getThaiMonthName();
  const year = getThaiYear();
  return `${uppercaseSymbol} ตอนนี้เดือน${month} ${year}`;
}

// ============================================================================
// API FETCH
// ============================================================================

/**
 * Custom error class for Catalyst API failures
 */
export class CatalystAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public symbol?: string,
  ) {
    super(message);
    this.name = "CatalystAPIError";
  }
}

/**
 * Fetch catalyst analysis from the n8n webhook API
 * @param symbol - Stock symbol
 * @returns API response with Answer and Score
 * @throws CatalystAPIError if fetch fails
 */
export async function fetchCatalystAnalysis(
  symbol: string,
): Promise<CatalystAPIResponse> {
  const chatInput = generateChatInput(symbol);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CATALYST_API_TIMEOUT);

  try {
    const response = await fetch(CATALYST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ chatInput }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new CatalystAPIError(
        `Catalyst API returned ${response.status}`,
        response.status,
        symbol,
      );
    }

    // API returns an array, take the first element
    const responseData = await response.json();
    if (!Array.isArray(responseData) || responseData.length === 0) {
      throw new CatalystAPIError(
        "Invalid response structure from Catalyst API: expected non-empty array",
        502,
        symbol,
      );
    }

    const data = responseData[0] as CatalystAPIResponse;

    // Validate response structure with content checks
    if (
      typeof data.Answer !== "string" ||
      data.Answer.length === 0 ||
      typeof data.Score !== "number" ||
      isNaN(data.Score) ||
      data.Score < 0 ||
      data.Score > 10
    ) {
      throw new CatalystAPIError(
        "Invalid response structure from Catalyst API",
        502,
        symbol,
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof CatalystAPIError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new CatalystAPIError(
        "Catalyst API request timeout (took longer than 2.5 minutes)",
        504,
        symbol,
      );
    }

    throw new CatalystAPIError(
      error instanceof Error
        ? error.message
        : "Failed to fetch from Catalyst API",
      500,
      symbol,
    );
  }
}

// ============================================================================
// PARSING
// ============================================================================

/**
 * Parse the Answer field from the Catalyst API response
 *
 * Expected format:
 * "{SYMBOL}: {Theme} | Catalysts: {Event1}, {Event2} | What to watch: {Item1}, {Item2}"
 *
 * @param answer - The Answer string from the API response
 * @param score - The Score from the API response
 * @returns Parsed catalyst data with theme, catalysts, and whatToWatch arrays
 */
export function parseCatalystAnswer(
  answer: string,
  score: number,
): ParsedCatalystData {
  // Remove the symbol prefix if present (e.g., "KBANK: ")
  let cleanAnswer = answer.replace(/^[A-Z]+:\s*/, "");

  // Extract theme (everything before "Catalysts:")
  const themeMatch = cleanAnswer.match(/^(.+?)\s*\|\s*Catalysts:/i);
  const theme = themeMatch
    ? themeMatch[1].trim()
    : cleanAnswer.split("|")[0]?.trim() || "";

  // Extract catalysts (between "Catalysts:" and "What to watch:")
  const catalystsMatch = cleanAnswer.match(
    /Catalysts:\s*(.+?)\s*\|\s*What to watch:/i,
  );
  const catalystsRaw = catalystsMatch?.[1] || "";
  const catalysts = catalystsRaw
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  // Extract what to watch (after "What to watch:")
  const watchMatch = cleanAnswer.match(/What to watch:\s*(.+)/i);
  const watchRaw = watchMatch?.[1] || "";
  const whatToWatch = watchRaw
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  return {
    theme,
    catalysts,
    whatToWatch,
    aiScore: score,
  };
}

/**
 * Fetch and parse catalyst data in one call
 * @param symbol - Stock symbol
 * @returns Parsed catalyst data
 */
export async function fetchAndParseCatalyst(
  symbol: string,
): Promise<ParsedCatalystData> {
  const response = await fetchCatalystAnalysis(symbol);
  return parseCatalystAnswer(response.Answer, response.Score);
}

// ============================================================================
// ETA CALCULATION
// ============================================================================

/**
 * Calculate ETA based on elapsed time
 * Assumes average API response time of 90 seconds (1.5 minutes)
 * @param startTime - Timestamp when fetch started
 * @returns Estimated seconds remaining
 */
export function calculateETA(startTime: number): number {
  const AVERAGE_API_TIME = 90; // seconds (1.5 minutes average)
  const elapsed = (Date.now() - startTime) / 1000; // seconds
  const remaining = Math.max(0, AVERAGE_API_TIME - elapsed);
  return Math.ceil(remaining);
}

/**
 * Calculate progress percentage based on elapsed time
 * @param startTime - Timestamp when fetch started
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(startTime: number): number {
  const AVERAGE_API_TIME = 90; // seconds
  const elapsed = (Date.now() - startTime) / 1000; // seconds
  const progress = Math.min(100, (elapsed / AVERAGE_API_TIME) * 100);
  return Math.floor(progress);
}

/**
 * Get current step description based on progress
 * @param progress - Progress percentage (0-100)
 * @returns Current step description
 */
export function getCurrentStep(progress: number): string {
  if (progress < 20) {
    return "Connecting to AI service...";
  } else if (progress < 40) {
    return "Fetching stock data...";
  } else if (progress < 60) {
    return "Analyzing catalysts...";
  } else if (progress < 80) {
    return "Generating investment thesis...";
  } else {
    return "Finalizing insights...";
  }
}
