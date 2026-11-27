import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceSession,
  createReviewSession,
  DEFAULT_DAILY_CAP,
  formatIntervalPreview,
  shouldOfferOverdueSpread,
} from "../src/scripts/review-session.ts";
import { createNewRecord } from "../src/scripts/sr-scheduler.ts";
import type { ReviewRecord } from "../src/scripts/sr-types.ts";

const TODAY = "2026-11-27";
const NOW = new Date(2026, 10, 27, 10, 0, 0);

function makeReviewed(
  slug: string,
  overrides: Partial<ReviewRecord> = {}
): ReviewRecord {
  return {
    ...createNewRecord(
      "algorithms",
      slug,
      `Problem ${slug}`,
      "Medium",
      "Arrays & Hashing"
    ),
    lastReviewDate: "2026-11-20",
    dueDate: TODAY,
    interval: 3,
    repetitions: 2,
    ...overrides,
  };
}

test("createReviewSession applies default cap, fragile-first ordering, and backlog/overdue counts", () => {
  const records: ReviewRecord[] = [
    makeReviewed("future", { dueDate: "2026-11-29", interval: 1 }),
    makeReviewed("unreviewed", { lastReviewDate: null, dueDate: "2026-11-20", interval: 0 }),
    ...Array.from({ length: 8 }, (_, i) =>
      makeReviewed(`p-${i}`, {
        dueDate: i < 5 ? "2026-11-24" : TODAY,
        interval: 8 - i,
      })
    ),
  ];

  const state = createReviewSession(records, { today: TODAY });
  assert.equal(state.queue.length, DEFAULT_DAILY_CAP);
  assert.equal(state.initialBatchSize, DEFAULT_DAILY_CAP);
  assert.equal(state.backlogCount, 2);
  assert.equal(state.overdueCount, 5);
  // Shortest intervals appear first: p-7 (1d), p-6 (2d), ...
  assert.equal(state.queue[0].slug, "p-7");
  assert.equal(state.queue[1].slug, "p-6");

  const custom = createReviewSession(records, { today: TODAY, cap: 3 });
  assert.equal(custom.queue.length, 3);
  assert.equal(custom.backlogCount, 5);
});

test("advanceSession advances on Good/Hard/Easy and re-queues Again at most once", () => {
  const first = makeReviewed("first", { interval: 1 });
  const second = makeReviewed("second", { interval: 2 });
  let state = createReviewSession([first, second], { today: TODAY });

  // Rate first as Again -> re-queued after second, completedCount stays 0
  state = advanceSession(state, { ...first, lapses: 1, repetitions: 0, interval: 0 }, 0);
  assert.deepEqual(
    state.queue.map((r) => r.slug),
    ["second", "first"]
  );
  assert.equal(state.completedCount, 0);
  assert.equal(state.againCount, 1);

  // Rate second as Good -> removed from queue, completedCount becomes 1
  state = advanceSession(state, { ...second, interval: 6, repetitions: 3 }, 2);
  assert.deepEqual(
    state.queue.map((r) => r.slug),
    ["first"]
  );
  assert.equal(state.completedCount, 1);

  // Rate first as Again a second time -> finishes without infinite loop and marks dismissed
  state = advanceSession(state, { ...first, lapses: 2, repetitions: 0, interval: 0 }, 0);
  assert.deepEqual(state.queue, []);
  assert.deepEqual(state.dismissedKeys, [first.problemKey]);
  assert.equal(state.completedCount, 2);
  assert.equal(state.againCount, 2);

  // Subsequent extra batch excluding dismissedKeys does not re-serve twice-missed card
  const backlogCard = makeReviewed("backlog", { interval: 4 });
  const nextBatch = createReviewSession(
    [{ ...first, dueDate: TODAY, interval: 0, lapses: 2 }, backlogCard],
    { today: TODAY, cap: 5, excludeKeys: state.dismissedKeys }
  );
  assert.deepEqual(
    nextBatch.queue.map((r) => r.slug),
    ["backlog"]
  );
  assert.equal(nextBatch.backlogCount, 0);
});

test("shouldOfferOverdueSpread triggers strictly above threshold", () => {
  assert.equal(shouldOfferOverdueSpread(15), false);
  assert.equal(shouldOfferOverdueSpread(16), true);
  assert.equal(shouldOfferOverdueSpread(4, 3), true);
});

test("formatIntervalPreview returns Today, 1d, and Nd previews", () => {
  const fresh = createNewRecord(
    "algorithms",
    "1-two-sum",
    "Two Sum",
    "Easy",
    "Arrays & Hashing"
  );
  assert.equal(formatIntervalPreview(fresh, 0, NOW), "Today");
  assert.equal(formatIntervalPreview(fresh, 1, NOW), "1d");
  assert.equal(formatIntervalPreview(fresh, 2, NOW), "1d");
  assert.equal(formatIntervalPreview(fresh, 3, NOW), "4d");

  const rep1 = makeReviewed("rep1", { repetitions: 1, interval: 1 });
  assert.equal(formatIntervalPreview(rep1, 2, NOW), "3d");
});
