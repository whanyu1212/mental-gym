import assert from "node:assert/strict";
import test from "node:test";

import {
  deduplicateImportedAttempts,
  deduplicateImportedEvents,
  deduplicateImportedHighlights,
  normalizeExport,
  parseExport,
  serializeExport,
  withoutAttemptIds,
  withoutEventIds,
} from "../src/scripts/sr-export.ts";
import type { AttemptEvent } from "../src/scripts/attempt-types.ts";
import type { Highlight } from "../src/scripts/highlight-types.ts";
import type { ReviewEvent, ReviewRecord } from "../src/scripts/sr-types.ts";

const record: ReviewRecord = {
  problemKey: "algorithms:two-sum",
  domain: "algorithms",
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "Easy",
  group: "Arrays & Hashing",
  easeFactor: 2.5,
  interval: 3,
  repetitions: 2,
  dueDate: "2026-07-16",
  lastReviewDate: "2026-07-13",
  lastRating: 2,
};

const event: ReviewEvent = {
  id: 1,
  reviewedAt: "2026-07-13T12:00:00.000Z",
  reviewDate: "2026-07-13",
  problemKey: record.problemKey,
  domain: record.domain,
  group: record.group,
  rating: 2,
  interval: 3,
};

const highlight: Highlight = {
  id: "11111111-2222-3333-4444-555555555555",
  noteId: "time-complexity",
  startOffset: 120,
  endOffset: 168,
  textSnippet: "constant factors are dropped in Big-O notation",
  color: "yellow",
  createdAt: "2026-07-13T12:00:00.000Z",
};

const attempt: AttemptEvent = {
  id: 1,
  attemptedAt: "2026-07-13T12:00:00.000Z",
  attemptDate: "2026-07-13",
  problemKey: record.problemKey,
  domain: record.domain,
  slug: record.slug,
  title: record.title,
  difficulty: record.difficulty,
  group: record.group,
  durationSeconds: 642,
  outcome: "partial",
  supportUsed: "signal",
  confidence: 2,
  difficultyArea: "reasoning",
  patternGuess: "hashmap complement lookup",
};

test("version 1 imports with empty history", () => {
  assert.deepEqual(
    normalizeExport({
      version: 1,
      exportedAt: "2026-07-13T12:00:00.000Z",
      records: [record],
    }),
    { records: [record], events: [], highlights: [], attempts: [] }
  );
});

test("version 2 imports with no highlights", () => {
  assert.deepEqual(
    normalizeExport({
      version: 2,
      exportedAt: "2026-07-13T12:00:00.000Z",
      records: [record],
      events: [event],
    }),
    { records: [record], events: [event], highlights: [], attempts: [] }
  );
});

test("version 3 imports with no attempts", () => {
  assert.deepEqual(
    normalizeExport({
      version: 3,
      exportedAt: "2026-07-13T12:00:00.000Z",
      records: [record],
      events: [event],
      highlights: [highlight],
    }),
    { records: [record], events: [event], highlights: [highlight], attempts: [] }
  );
});

test("version 4 round trip preserves records, events, highlights, and attempts", () => {
  const json = serializeExport(
    [record],
    [event],
    [highlight],
    [attempt],
    "2026-07-13T12:00:00.000Z"
  );
  assert.deepEqual(parseExport(json), {
    records: [record],
    events: [event],
    highlights: [highlight],
    attempts: [attempt],
  });
});

test("highlights with an attached note survive a round trip", () => {
  const annotated: Highlight = { ...highlight, note: "revisit before mocks" };
  const json = serializeExport(
    [record],
    [event],
    [annotated],
    [],
    "2026-07-13T12:00:00.000Z"
  );
  assert.deepEqual(parseExport(json).highlights, [annotated]);
});

test("imported attempts discard browser-local auto-increment ids", () => {
  assert.deepEqual(withoutAttemptIds([attempt]), [
    {
      attemptedAt: attempt.attemptedAt,
      attemptDate: attempt.attemptDate,
      problemKey: attempt.problemKey,
      domain: attempt.domain,
      slug: attempt.slug,
      title: attempt.title,
      difficulty: attempt.difficulty,
      group: attempt.group,
      durationSeconds: attempt.durationSeconds,
      outcome: attempt.outcome,
      supportUsed: attempt.supportUsed,
      confidence: attempt.confidence,
      difficultyArea: attempt.difficultyArea,
      patternGuess: attempt.patternGuess,
    },
  ]);
});

test("imported events discard browser-local auto-increment ids", () => {
  assert.deepEqual(withoutEventIds([event]), [
    {
      reviewedAt: event.reviewedAt,
      reviewDate: event.reviewDate,
      problemKey: event.problemKey,
      domain: event.domain,
      group: event.group,
      rating: event.rating,
      interval: event.interval,
    },
  ]);
});

test("re-importing the same event does not duplicate history", () => {
  assert.deepEqual(deduplicateImportedEvents([event], [event]), []);
});

test("duplicate events within one backup are imported once", () => {
  assert.deepEqual(
    deduplicateImportedEvents([], [event, { ...event, id: 2 }]),
    withoutEventIds([event])
  );
});

test("distinct events are preserved when imported", () => {
  const later = {
    ...event,
    id: 2,
    reviewedAt: "2026-07-14T12:00:00.000Z",
    reviewDate: "2026-07-14",
  };
  assert.deepEqual(
    deduplicateImportedEvents([event], [event, later]),
    withoutEventIds([later])
  );
});

test("re-importing the same highlight does not duplicate it", () => {
  assert.deepEqual(deduplicateImportedHighlights([highlight], [highlight]), []);
});

test("distinct highlights are preserved when imported", () => {
  const other: Highlight = { ...highlight, id: "other-id", color: "green" };
  assert.deepEqual(
    deduplicateImportedHighlights([highlight], [highlight, other]),
    [other]
  );
});

test("re-importing the same attempt does not duplicate history", () => {
  assert.deepEqual(deduplicateImportedAttempts([attempt], [attempt]), []);
});

test("distinct attempts are preserved when imported", () => {
  const later = {
    ...attempt,
    id: 2,
    attemptedAt: "2026-07-14T12:00:00.000Z",
    attemptDate: "2026-07-14",
  };
  assert.deepEqual(
    deduplicateImportedAttempts([attempt], [attempt, later]),
    withoutAttemptIds([later])
  );
});

test("invalid versions and malformed events are rejected", () => {
  assert.throws(
    () => normalizeExport({ version: 4, records: [] }),
    /Unsupported/
  );
  assert.throws(
    () =>
      normalizeExport({
        version: 2,
        records: [record],
        events: [{ reviewDate: "2026-07-13" }],
      }),
    /invalid review events/
  );
  assert.throws(
    () =>
      normalizeExport({
        version: 3,
        records: [record],
        events: [event],
        highlights: [{ id: "x", noteId: "n" }],
      }),
    /invalid highlights/
  );
  assert.throws(
    () =>
      normalizeExport({
        version: 4,
        records: [record],
        events: [event],
        highlights: [highlight],
        attempts: [{ ...attempt, confidence: 5 }],
      }),
    /invalid attempt events/
  );
  assert.throws(
    () =>
      normalizeExport({
        version: 4,
        records: [record],
        events: [event],
        highlights: [highlight],
        attempts: [{ ...attempt, durationSeconds: -1 }],
      }),
    /invalid attempt events/
  );
});
