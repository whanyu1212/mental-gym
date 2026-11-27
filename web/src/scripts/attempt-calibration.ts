import type { AttemptEvent } from "./attempt-types";
import type { ReviewQuality } from "./sr-types";

export interface RatingSuggestion {
  quality: ReviewQuality;
  reason: string;
}

/** Map an attempt's outcome, support used, and confidence to a suggested SR quality rating. */
export function suggestRecallRating(
  attempt: Pick<AttemptEvent, "outcome" | "supportUsed" | "confidence">
): RatingSuggestion {
  if (attempt.outcome === "stuck" || attempt.supportUsed === "solution") {
    return { quality: 0, reason: "stuck or opened solution" };
  }
  if (attempt.outcome === "partial" || attempt.supportUsed === "guide") {
    return { quality: 1, reason: "partial solve or used guide" };
  }
  if (
    attempt.outcome === "solved" &&
    attempt.supportUsed === "none" &&
    attempt.confidence >= 3
  ) {
    return { quality: 3, reason: "unaided solve with high confidence" };
  }
  return {
    quality: 2,
    reason: "solved with light support or moderate confidence",
  };
}

/** Return the most recent attempt by `attemptedAt` timestamp, or undefined if empty. */
export function pickLatestAttempt(
  attempts: AttemptEvent[]
): AttemptEvent | undefined {
  let latest: AttemptEvent | undefined;
  for (const attempt of attempts) {
    if (!latest || attempt.attemptedAt.localeCompare(latest.attemptedAt) > 0) {
      latest = attempt;
    }
  }
  return latest;
}
