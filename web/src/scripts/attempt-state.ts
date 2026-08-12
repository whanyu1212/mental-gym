import type {
  AttemptConfidence,
  AttemptDifficultyArea,
  AttemptEvent,
  AttemptOutcome,
  AttemptSupport,
} from "./attempt-types";
import type { ReviewDomain } from "./sr-types";

export interface AttemptSession {
  startedAt: Date;
  signalRequested: boolean;
}

export interface CompleteAttemptInput {
  domain: ReviewDomain;
  slug: string;
  title: string;
  difficulty: string;
  group: string;
  outcome: AttemptOutcome;
  supportUsed: AttemptSupport;
  confidence: AttemptConfidence;
  difficultyArea: AttemptDifficultyArea;
  patternGuess?: string;
  reflection?: string;
}

export function startAttempt(startedAt = new Date()): AttemptSession {
  return { startedAt, signalRequested: false };
}

export function requestRecognitionSignal(session: AttemptSession): AttemptSession {
  return { ...session, signalRequested: true };
}

export function elapsedSeconds(session: AttemptSession, finishedAt = new Date()): number {
  return Math.max(0, Math.round((finishedAt.getTime() - session.startedAt.getTime()) / 1000));
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function completeAttempt(
  session: AttemptSession,
  input: CompleteAttemptInput,
  finishedAt = new Date()
): AttemptEvent {
  const supportUsed = session.signalRequested && input.supportUsed === "none"
    ? "signal"
    : input.supportUsed;

  const attemptDate = [
    finishedAt.getFullYear(),
    String(finishedAt.getMonth() + 1).padStart(2, "0"),
    String(finishedAt.getDate()).padStart(2, "0"),
  ].join("-");

  return {
    attemptedAt: finishedAt.toISOString(),
    attemptDate,
    problemKey: `${input.domain}:${input.slug}`,
    domain: input.domain,
    slug: input.slug,
    title: input.title,
    difficulty: input.difficulty,
    group: input.group,
    durationSeconds: elapsedSeconds(session, finishedAt),
    outcome: input.outcome,
    supportUsed,
    confidence: input.confidence,
    difficultyArea: input.difficultyArea,
    patternGuess: optionalText(input.patternGuess),
    reflection: optionalText(input.reflection),
  };
}
