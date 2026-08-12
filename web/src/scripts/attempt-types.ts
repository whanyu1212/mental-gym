import type { ReviewDomain } from "./sr-types";

export type AttemptOutcome = "solved" | "partial" | "stuck";
export type AttemptSupport = "none" | "signal" | "guide" | "solution";
export type AttemptConfidence = 1 | 2 | 3 | 4;
export type AttemptDifficultyArea =
  | "pattern"
  | "reasoning"
  | "implementation"
  | "complexity"
  | "edge-cases"
  | "none";

/** A completed, self-reported practice attempt. IDs are browser-local. */
export interface AttemptEvent {
  id?: number;
  attemptedAt: string;
  attemptDate: string;
  problemKey: string;
  domain: ReviewDomain;
  slug: string;
  title: string;
  difficulty: string;
  group: string;
  durationSeconds: number;
  outcome: AttemptOutcome;
  supportUsed: AttemptSupport;
  confidence: AttemptConfidence;
  difficultyArea: AttemptDifficultyArea;
  patternGuess?: string;
  reflection?: string;
}
