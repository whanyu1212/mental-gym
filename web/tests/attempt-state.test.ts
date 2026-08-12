import assert from "node:assert/strict";
import test from "node:test";

import {
  completeAttempt,
  elapsedSeconds,
  requestRecognitionSignal,
  startAttempt,
} from "../src/scripts/attempt-state.ts";

const startedAt = new Date("2026-08-12T08:00:00.000Z");
const finishedAt = new Date("2026-08-12T08:12:42.000Z");

test("attempt sessions measure non-negative elapsed time", () => {
  const session = startAttempt(startedAt);
  assert.equal(elapsedSeconds(session, finishedAt), 762);
  assert.equal(elapsedSeconds(session, new Date("2026-08-12T07:59:00.000Z")), 0);
});

test("a recognition signal is recorded even if the form keeps its default", () => {
  const session = requestRecognitionSignal(startAttempt(startedAt));
  const event = completeAttempt(
    session,
    {
      domain: "algorithms",
      slug: "1-two-sum",
      title: "Two Sum",
      difficulty: "Easy",
      group: "Arrays & Hashing",
      outcome: "partial",
      supportUsed: "none",
      confidence: 2,
      difficultyArea: "pattern",
      patternGuess: "  hashmap complement lookup  ",
      reflection: "   ",
    },
    finishedAt
  );

  assert.deepEqual(event, {
    attemptedAt: finishedAt.toISOString(),
    attemptDate: "2026-08-12",
    problemKey: "algorithms:1-two-sum",
    domain: "algorithms",
    slug: "1-two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    group: "Arrays & Hashing",
    durationSeconds: 762,
    outcome: "partial",
    supportUsed: "signal",
    confidence: 2,
    difficultyArea: "pattern",
    patternGuess: "hashmap complement lookup",
    reflection: undefined,
  });
});
