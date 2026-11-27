import assert from "node:assert/strict";
import test from "node:test";

import {
  pickLatestAttempt,
  suggestRecallRating,
} from "../src/scripts/attempt-calibration.ts";
import type { AttemptEvent } from "../src/scripts/attempt-types.ts";

function makeAttempt(overrides: Partial<AttemptEvent> = {}): AttemptEvent {
  return {
    attemptedAt: "2026-11-27T10:00:00.000Z",
    attemptDate: "2026-11-27",
    problemKey: "algorithms:1-two-sum",
    domain: "algorithms",
    slug: "1-two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    group: "Arrays & Hashing",
    durationSeconds: 180,
    outcome: "solved",
    supportUsed: "none",
    confidence: 3,
    difficultyArea: "none",
    ...overrides,
  };
}

test("suggestRecallRating maps stuck/solution to Again, partial/guide to Hard, confident unaided to Easy, else Good", () => {
  assert.equal(
    suggestRecallRating({ outcome: "stuck", supportUsed: "none", confidence: 1 }).quality,
    0
  );
  assert.equal(
    suggestRecallRating({ outcome: "solved", supportUsed: "solution", confidence: 4 }).quality,
    0
  );
  assert.equal(
    suggestRecallRating({ outcome: "partial", supportUsed: "none", confidence: 2 }).quality,
    1
  );
  assert.equal(
    suggestRecallRating({ outcome: "solved", supportUsed: "guide", confidence: 3 }).quality,
    1
  );
  assert.equal(
    suggestRecallRating({ outcome: "solved", supportUsed: "signal", confidence: 4 }).quality,
    2
  );
  assert.equal(
    suggestRecallRating({ outcome: "solved", supportUsed: "none", confidence: 2 }).quality,
    2
  );
  assert.equal(
    suggestRecallRating({ outcome: "solved", supportUsed: "none", confidence: 3 }).quality,
    3
  );
});

test("pickLatestAttempt returns undefined for empty list and picks latest attemptedAt", () => {
  assert.equal(pickLatestAttempt([]), undefined);

  const older = makeAttempt({ id: 1, attemptedAt: "2026-11-20T09:00:00.000Z", outcome: "stuck" });
  const newest = makeAttempt({ id: 2, attemptedAt: "2026-11-27T11:30:00.000Z", outcome: "solved" });
  const middle = makeAttempt({ id: 3, attemptedAt: "2026-11-25T15:00:00.000Z", outcome: "partial" });

  assert.equal(pickLatestAttempt([older, newest, middle]), newest);
});
