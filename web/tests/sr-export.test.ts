import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeExport,
  parseExport,
  serializeExport,
  withoutEventIds,
} from "../src/scripts/sr-export.ts";
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

test("version 1 imports with empty history", () => {
  assert.deepEqual(
    normalizeExport({
      version: 1,
      exportedAt: "2026-07-13T12:00:00.000Z",
      records: [record],
    }),
    { records: [record], events: [] }
  );
});

test("version 2 round trip preserves records and events", () => {
  const json = serializeExport(
    [record],
    [event],
    "2026-07-13T12:00:00.000Z"
  );
  assert.deepEqual(parseExport(json), {
    records: [record],
    events: [event],
  });
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

test("invalid versions and malformed events are rejected", () => {
  assert.throws(
    () => normalizeExport({ version: 3, records: [] }),
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
});
