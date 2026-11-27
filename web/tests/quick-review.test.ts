import assert from "node:assert/strict";
import test from "node:test";

import { getGuide } from "../src/data/algorithmGuides.ts";
import { problems } from "../src/data/problems.ts";
import { buildQuickReviewItem } from "../src/lib/quick-review.ts";

test("buildQuickReviewItem projects guide trigger, invariant, top trap, and trap test case", () => {
  const twoSum = problems.find((p) => p.slug === "1-two-sum");
  assert.ok(twoSum, "expected 1-two-sum in problems catalog");
  const item = buildQuickReviewItem(twoSum, getGuide(twoSum.slug));

  assert.equal(item.problemKey, "algorithms:1-two-sum");
  assert.equal(item.id, "1");
  assert.equal(item.title, "Two Sum");
  assert.ok(item.pattern.length > 0);
  assert.ok(item.trigger.length > 0);
  assert.ok(item.invariant.length > 0);
  assert.ok(item.timeComplexity.length > 0);
  assert.ok(item.spaceComplexity.length > 0);
  assert.ok(item.topTrap.length > 0);
  assert.equal(item.trapCase?.kind, "trap");
});

test("buildQuickReviewItem falls back gracefully when a guide is missing", () => {
  const problem = problems[0];
  const item = buildQuickReviewItem(problem, undefined);

  assert.equal(item.problemKey, `algorithms:${problem.slug}`);
  assert.equal(item.pattern, problem.group);
  assert.equal(item.trigger, "");
  assert.equal(item.invariant, "");
  assert.equal(item.topTrap, "");
  assert.equal(item.trapCase, null);
});

test("every guided algorithm problem yields non-empty core quick-review fields", () => {
  for (const problem of problems) {
    const guide = getGuide(problem.slug);
    assert.ok(guide, `expected guide for ${problem.slug}`);
    const item = buildQuickReviewItem(problem, guide);
    assert.ok(item.pattern.length > 0, `empty pattern for ${problem.slug}`);
    assert.ok(item.trigger.length > 0, `empty trigger for ${problem.slug}`);
    assert.ok(item.invariant.length > 0, `empty invariant for ${problem.slug}`);
    assert.ok(item.topTrap.length > 0, `empty topTrap for ${problem.slug}`);
  }
});
