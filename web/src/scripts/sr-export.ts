import type { Highlight, HighlightColor } from "./highlight-types";
import type {
  AttemptConfidence,
  AttemptDifficultyArea,
  AttemptEvent,
  AttemptOutcome,
  AttemptSupport,
} from "./attempt-types";
import type {
  NormalizedSRExport,
  ReviewEvent,
  ReviewRecord,
  SRExport,
  SRExportV4,
} from "./sr-types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReviewRecord(value: unknown): value is ReviewRecord {
  return (
    isObject(value) &&
    typeof value.problemKey === "string" &&
    (value.domain === "algorithms" || value.domain === "ml" || value.domain === "sql") &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.difficulty === "string" &&
    typeof value.group === "string" &&
    typeof value.easeFactor === "number" &&
    typeof value.interval === "number" &&
    typeof value.repetitions === "number" &&
    typeof value.dueDate === "string" &&
    (value.lastReviewDate === null || typeof value.lastReviewDate === "string") &&
    (value.lastRating === null ||
      value.lastRating === 0 ||
      value.lastRating === 1 ||
      value.lastRating === 2 ||
      value.lastRating === 3)
  );
}

function isReviewEvent(value: unknown): value is ReviewEvent {
  return (
    isObject(value) &&
    (value.id === undefined || typeof value.id === "number") &&
    typeof value.reviewedAt === "string" &&
    typeof value.reviewDate === "string" &&
    typeof value.problemKey === "string" &&
    (value.domain === "algorithms" || value.domain === "ml" || value.domain === "sql") &&
    typeof value.group === "string" &&
    (value.rating === 0 ||
      value.rating === 1 ||
      value.rating === 2 ||
      value.rating === 3) &&
    typeof value.interval === "number"
  );
}

const ATTEMPT_OUTCOME_VALUES: AttemptOutcome[] = ["solved", "partial", "stuck"];
const ATTEMPT_SUPPORT_VALUES: AttemptSupport[] = [
  "none",
  "signal",
  "guide",
  "solution",
];
const ATTEMPT_CONFIDENCE_VALUES: AttemptConfidence[] = [1, 2, 3, 4];
const ATTEMPT_DIFFICULTY_AREA_VALUES: AttemptDifficultyArea[] = [
  "pattern",
  "reasoning",
  "implementation",
  "complexity",
  "edge-cases",
  "none",
];

function isISODate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isAttemptEvent(value: unknown): value is AttemptEvent {
  return (
    isObject(value) &&
    (value.id === undefined || typeof value.id === "number") &&
    isTimestamp(value.attemptedAt) &&
    isISODate(value.attemptDate) &&
    typeof value.problemKey === "string" &&
    (value.domain === "algorithms" || value.domain === "ml" || value.domain === "sql") &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.difficulty === "string" &&
    typeof value.group === "string" &&
    typeof value.durationSeconds === "number" &&
    Number.isInteger(value.durationSeconds) &&
    value.durationSeconds >= 0 &&
    ATTEMPT_OUTCOME_VALUES.includes(value.outcome as AttemptOutcome) &&
    ATTEMPT_SUPPORT_VALUES.includes(value.supportUsed as AttemptSupport) &&
    ATTEMPT_CONFIDENCE_VALUES.includes(value.confidence as AttemptConfidence) &&
    ATTEMPT_DIFFICULTY_AREA_VALUES.includes(
      value.difficultyArea as AttemptDifficultyArea
    ) &&
    (value.patternGuess === undefined || typeof value.patternGuess === "string") &&
    (value.reflection === undefined || typeof value.reflection === "string")
  );
}

const HIGHLIGHT_COLOR_VALUES: HighlightColor[] = [
  "yellow",
  "green",
  "blue",
  "pink",
];

function isHighlight(value: unknown): value is Highlight {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.noteId === "string" &&
    typeof value.startOffset === "number" &&
    typeof value.endOffset === "number" &&
    value.startOffset >= 0 &&
    value.endOffset > value.startOffset &&
    typeof value.textSnippet === "string" &&
    HIGHLIGHT_COLOR_VALUES.includes(value.color as HighlightColor) &&
    (value.note === undefined || typeof value.note === "string") &&
    typeof value.createdAt === "string"
  );
}

export function normalizeExport(data: unknown): NormalizedSRExport {
  if (!isObject(data) || !Array.isArray(data.records)) {
    throw new Error("Invalid review-data export");
  }

  if (!data.records.every(isReviewRecord)) {
    throw new Error("Export contains invalid review records");
  }

  if (data.version === 1) {
    return { records: data.records, events: [], highlights: [], attempts: [] };
  }

  if (data.version === 2 && Array.isArray(data.events)) {
    if (!data.events.every(isReviewEvent)) {
      throw new Error("Export contains invalid review events");
    }
    return { records: data.records, events: data.events, highlights: [], attempts: [] };
  }

  if (
    data.version === 3 &&
    Array.isArray(data.events) &&
    Array.isArray(data.highlights)
  ) {
    if (!data.events.every(isReviewEvent)) {
      throw new Error("Export contains invalid review events");
    }
    if (!data.highlights.every(isHighlight)) {
      throw new Error("Export contains invalid highlights");
    }
    return {
      records: data.records,
      events: data.events,
      highlights: data.highlights,
      attempts: [],
    };
  }

  if (
    data.version === 4 &&
    Array.isArray(data.events) &&
    Array.isArray(data.highlights) &&
    Array.isArray(data.attempts)
  ) {
    if (!data.events.every(isReviewEvent)) {
      throw new Error("Export contains invalid review events");
    }
    if (!data.highlights.every(isHighlight)) {
      throw new Error("Export contains invalid highlights");
    }
    if (!data.attempts.every(isAttemptEvent)) {
      throw new Error("Export contains invalid attempt events");
    }
    return {
      records: data.records,
      events: data.events,
      highlights: data.highlights,
      attempts: data.attempts,
    };
  }

  throw new Error("Unsupported review-data export version");
}

export function parseExport(json: string): NormalizedSRExport {
  return normalizeExport(JSON.parse(json));
}

export function withoutEventIds(events: ReviewEvent[]): ReviewEvent[] {
  return events.map(({ id: _id, ...event }) => event);
}

export function withoutAttemptIds(attempts: AttemptEvent[]): AttemptEvent[] {
  return attempts.map(({ id: _id, ...attempt }) => attempt);
}

export function eventKey(event: ReviewEvent): string {
  return [
    event.reviewedAt,
    event.reviewDate,
    event.problemKey,
    event.domain,
    event.group,
    event.rating,
    event.interval,
  ].join("|");
}

export function deduplicateImportedEvents(
  existing: ReviewEvent[],
  imported: ReviewEvent[]
): ReviewEvent[] {
  const known = new Set(existing.map(eventKey));
  const unique: ReviewEvent[] = [];

  for (const event of withoutEventIds(imported)) {
    const key = eventKey(event);
    if (known.has(key)) continue;
    known.add(key);
    unique.push(event);
  }

  return unique;
}

export function attemptKey(attempt: AttemptEvent): string {
  return [
    attempt.attemptedAt,
    attempt.attemptDate,
    attempt.problemKey,
    attempt.domain,
    attempt.slug,
    attempt.title,
    attempt.difficulty,
    attempt.group,
    attempt.durationSeconds,
    attempt.outcome,
    attempt.supportUsed,
    attempt.confidence,
    attempt.difficultyArea,
    attempt.patternGuess ?? "",
    attempt.reflection ?? "",
  ].join("|");
}

export function deduplicateImportedAttempts(
  existing: AttemptEvent[],
  imported: AttemptEvent[]
): AttemptEvent[] {
  const known = new Set(existing.map(attemptKey));
  const unique: AttemptEvent[] = [];

  for (const attempt of withoutAttemptIds(imported)) {
    const key = attemptKey(attempt);
    if (known.has(key)) continue;
    known.add(key);
    unique.push(attempt);
  }

  return unique;
}

export function serializeExport(
  records: ReviewRecord[],
  events: ReviewEvent[],
  highlights: Highlight[] = [],
  attempts: AttemptEvent[] = [],
  exportedAt = new Date().toISOString()
): string {
  const data: SRExportV4 = {
    version: 4,
    exportedAt,
    records,
    events,
    highlights,
    attempts,
  };
  return JSON.stringify(data satisfies SRExport, null, 2);
}

/** Imported highlights may collide by id; keep the existing one on conflict. */
export function deduplicateImportedHighlights(
  existing: Highlight[],
  imported: Highlight[]
): Highlight[] {
  const known = new Set(existing.map((highlight) => highlight.id));
  return imported.filter((highlight) => !known.has(highlight.id));
}
