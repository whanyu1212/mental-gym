import assert from "node:assert/strict";
import test from "node:test";

import type { ReviewRecord } from "../src/scripts/sr-types.ts";
import { isEstablished, summarizeProgress } from "../src/scripts/sr-stats.ts";

const TODAY = "2026-07-13";

function record(
  overrides: Partial<ReviewRecord> & Pick<ReviewRecord, "problemKey" | "slug" | "title">
): ReviewRecord {
  return {
    domain: "algorithms",
    difficulty: "Medium",
    group: "Arrays & Hashing",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 1,
    dueDate: TODAY,
    lastReviewDate: TODAY,
    lastRating: 2,
    ...overrides,
  };
}

test("established requires three recalls and a seven-day interval", () => {
  assert.equal(
    isEstablished(
      record({
        problemKey: "algorithms:established",
        slug: "established",
        title: "Established",
        repetitions: 3,
        interval: 7,
      })
    ),
    true
  );

  assert.equal(
    isEstablished(
      record({
        problemKey: "algorithms:short",
        slug: "short",
        title: "Short interval",
        repetitions: 3,
        interval: 6,
      })
    ),
    false
  );
});

test("summarizes current review states", () => {
  const stats = summarizeProgress(
    [
      record({
        problemKey: "algorithms:learning",
        slug: "learning",
        title: "Learning",
      }),
      record({
        problemKey: "algorithms:established",
        slug: "established",
        title: "Established",
        repetitions: 4,
        interval: 12,
        dueDate: "2026-07-20",
      }),
      record({
        problemKey: "ml:overdue",
        slug: "overdue",
        title: "Overdue",
        domain: "ml",
        group: "Classic ML",
        dueDate: "2026-07-12",
      }),
      record({
        problemKey: "algorithms:new",
        slug: "new",
        title: "Not reviewed",
        lastReviewDate: null,
        lastRating: null,
      }),
    ],
    TODAY
  );

  assert.deepEqual(
    {
      reviewed: stats.reviewed,
      learning: stats.learning,
      established: stats.established,
      due: stats.due,
      overdue: stats.overdue,
    },
    {
      reviewed: 3,
      learning: 2,
      established: 1,
      due: 1,
      overdue: 1,
    }
  );
  assert.deepEqual(
    stats.dueRecords.map(({ title }) => title),
    ["Overdue", "Learning"]
  );
});

test("groups reviewed records by domain and topic", () => {
  const stats = summarizeProgress(
    [
      record({
        problemKey: "algorithms:two-sum",
        slug: "two-sum",
        title: "Two Sum",
      }),
      record({
        problemKey: "ml:logistic",
        slug: "logistic",
        title: "Logistic Regression",
        domain: "ml",
        group: "Classic ML",
        repetitions: 3,
        interval: 7,
        dueDate: "2026-07-20",
      }),
    ],
    TODAY
  );

  assert.deepEqual(
    stats.domains.map(({ name, reviewed, established }) => ({
      name,
      reviewed,
      established,
    })),
    [
      { name: "Algorithms", reviewed: 1, established: 0 },
      { name: "Machine Learning", reviewed: 1, established: 1 },
    ]
  );
  assert.deepEqual(
    stats.topics.map(({ name }) => name),
    ["Arrays & Hashing", "Classic ML"]
  );
});
