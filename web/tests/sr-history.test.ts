import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateReviewStreaks,
  summarizeHistory,
} from "../src/scripts/sr-history.ts";
import type { ReviewEvent } from "../src/scripts/sr-types.ts";

const TODAY = "2026-07-13";

function event(
  reviewDate: string,
  overrides: Partial<ReviewEvent> = {}
): ReviewEvent {
  return {
    reviewedAt: `${reviewDate}T12:00:00.000Z`,
    reviewDate,
    problemKey: "algorithms:two-sum",
    domain: "algorithms",
    group: "Arrays & Hashing",
    rating: 2,
    interval: 3,
    ...overrides,
  };
}

test("multiple reviews on one day count as one streak day", () => {
  assert.deepEqual(
    calculateReviewStreaks([event(TODAY), event(TODAY)], TODAY),
    { current: 1, longest: 1 }
  );
});

test("yesterday keeps the current streak active", () => {
  assert.deepEqual(
    calculateReviewStreaks(
      [event("2026-07-10"), event("2026-07-11"), event("2026-07-12")],
      TODAY
    ),
    { current: 3, longest: 3 }
  );
});

test("a gap preserves the longest streak but resets the current run", () => {
  assert.deepEqual(
    calculateReviewStreaks(
      [
        event("2026-07-01"),
        event("2026-07-02"),
        event("2026-07-03"),
        event("2026-07-12"),
      ],
      TODAY
    ),
    { current: 1, longest: 3 }
  );
});

test("summarizes recent activity, ratings, and domains", () => {
  const stats = summarizeHistory(
    [
      event("2026-06-01"),
      event("2026-07-08", { rating: 0 }),
      event("2026-07-12", { domain: "ml", rating: 1 }),
      event("2026-07-13", { domain: "ml", rating: 3 }),
    ],
    TODAY
  );

  assert.equal(stats.reviewsLast7Days, 3);
  assert.equal(stats.reviewsLast30Days, 3);
  assert.equal(stats.activeDaysLast30Days, 3);
  assert.deepEqual(stats.ratingCounts, { 0: 1, 1: 1, 2: 1, 3: 1 });
  assert.deepEqual(stats.domainCounts, { algorithms: 2, ml: 2, sql: 0 });
});
