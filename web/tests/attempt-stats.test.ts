import assert from "node:assert/strict";
import test from "node:test";

import type { AttemptEvent } from "../src/scripts/attempt-types.ts";
import { summarizeAttempts } from "../src/scripts/attempt-stats.ts";

const TODAY = "2026-08-12";

function attempt(overrides: Partial<AttemptEvent> = {}): AttemptEvent {
  return {
    attemptedAt: "2026-08-12T09:00:00.000Z",
    attemptDate: TODAY,
    problemKey: "algorithms:1-two-sum",
    domain: "algorithms",
    slug: "1-two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    group: "Arrays & Hashing",
    durationSeconds: 600,
    outcome: "solved",
    supportUsed: "none",
    confidence: 3,
    difficultyArea: "none",
    ...overrides,
  };
}

test("attempt statistics summarize recency, self-reported support, and focus areas", () => {
  const stats = summarizeAttempts(
    [
      attempt(),
      attempt({
        attemptedAt: "2026-08-10T10:00:00.000Z",
        attemptDate: "2026-08-10",
        problemKey: "algorithms:15-3sum",
        slug: "15-3sum",
        title: "3Sum",
        difficulty: "Medium",
        group: "Two Pointers",
        durationSeconds: 1200,
        outcome: "partial",
        supportUsed: "signal",
        difficultyArea: "pattern",
      }),
      attempt({
        attemptedAt: "2026-07-20T10:00:00.000Z",
        attemptDate: "2026-07-20",
        problemKey: "algorithms:42-trapping-rain-water",
        slug: "42-trapping-rain-water",
        title: "Trapping Rain Water",
        group: "Two Pointers",
        durationSeconds: 900,
        outcome: "stuck",
        supportUsed: "solution",
        difficultyArea: "reasoning",
      }),
      attempt({
        attemptedAt: "2026-08-13T10:00:00.000Z",
        attemptDate: "2026-08-13",
        problemKey: "algorithms:future",
        slug: "future",
      }),
    ],
    TODAY
  );

  assert.deepEqual(
    {
      attemptsLast7Days: stats.attemptsLast7Days,
      attemptsLast30Days: stats.attemptsLast30Days,
      uniqueProblemsAttempted: stats.uniqueProblemsAttempted,
      unaidedSolveRate: stats.unaidedSolveRate,
      averageDurationSeconds: stats.averageDurationSeconds,
      outcomes: stats.outcomeCounts,
      support: stats.supportCounts,
      areas: stats.difficultyAreaCounts,
    },
    {
      attemptsLast7Days: 2,
      attemptsLast30Days: 3,
      uniqueProblemsAttempted: 3,
      unaidedSolveRate: 1 / 3,
      averageDurationSeconds: 900,
      outcomes: { solved: 1, partial: 1, stuck: 1 },
      support: { none: 1, signal: 1, guide: 0, solution: 1 },
      areas: {
        pattern: 1,
        reasoning: 1,
        implementation: 0,
        complexity: 0,
        "edge-cases": 0,
        none: 1,
      },
    }
  );
  assert.deepEqual(stats.groups, [
    { name: "Two Pointers", attempts: 2, unaidedSolves: 0 },
    { name: "Arrays & Hashing", attempts: 1, unaidedSolves: 1 },
  ]);
  assert.deepEqual(stats.recentAttempts.map((event) => event.title), ["Two Sum", "3Sum", "Trapping Rain Water"]);
});
