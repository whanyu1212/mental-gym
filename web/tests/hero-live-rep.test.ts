import assert from "node:assert/strict";
import test from "node:test";

import { getGuide } from "../src/data/algorithmGuides.ts";
import { mlProblems } from "../src/data/mlProblems.ts";
import { problems } from "../src/data/problems.ts";
import { buildHeroReps, HERO_REP_SEEDS, serializeHeroReps } from "../src/lib/hero-reps.ts";

test("resolves curated hero reps from real catalogs", () => {
	const reps = buildHeroReps({ problems, getGuide, mlProblems }, "/mental-gym/");

	assert.equal(reps.length, HERO_REP_SEEDS.length);
	for (const rep of reps) {
		assert.ok(rep.title.length > 0);
		assert.ok(rep.prompt.length > 0);
		assert.ok(rep.pattern.length > 0);
		assert.ok(rep.topTrap.length > 0);
		assert.match(rep.href, /^\/mental-gym\/(algorithms|machine-learning)\/[^/]+\/$/);
	}
	assert.equal(reps[0]?.href, "/mental-gym/algorithms/128-longest-consecutive-sequence/");
	assert.equal(reps[2]?.href, "/mental-gym/machine-learning/logistic-regression-from-scratch/");
});

test("builds root-relative links when basePrefix is empty", () => {
	const reps = buildHeroReps({ problems, getGuide, mlProblems });
	assert.equal(reps[0]?.href, "/algorithms/128-longest-consecutive-sequence/");
});

test("escapes closing script tags during serialization", () => {
	const reps = buildHeroReps({ problems, getGuide, mlProblems });
	const modified = [{ ...reps[0]!, prompt: "</script><script>alert(1)</script>" }];
	const serialized = serializeHeroReps(modified);

	assert.ok(!serialized.includes("</script>"));
	assert.deepEqual(JSON.parse(serialized), modified);
});

test("throws when a curated slug is missing", () => {
	assert.throws(
		() => buildHeroReps({ problems: [], getGuide, mlProblems }),
		/Hero rep missing algorithm problem: 128-longest-consecutive-sequence/,
	);
});
