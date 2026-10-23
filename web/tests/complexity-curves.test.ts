import assert from "node:assert/strict";
import test from "node:test";
import { CHART_INPUTS, CHART_MAX, COMPLEXITY_CURVES, chartInputTicks, chartValue, factorial, formatGrowthValue } from "../src/lib/complexity-curves.ts";

test("axis labels keep equal log spacing and the full input range at every width", () => {
	for (const width of [240, 320, 375, 599, 600, 768, 1280]) {
		const ticks = chartInputTicks(width);
		assert.equal(ticks[0], CHART_INPUTS[0]);
		assert.equal(ticks.at(-1), CHART_INPUTS.at(-1));
		assert.equal(ticks.length, width < 600 ? 4 : 10);
		const ratio = ticks[1] / ticks[0];
		assert.ok(ticks.slice(1).every((value, index) => value / ticks[index] === ratio));
	}
});

test("factorial uses the input value rather than its sample index", () => {
	assert.equal(factorial(4), 24);
	assert.equal(factorial(8), 40320);
	assert.equal(factorial(16), 20922789888000);
	assert.equal(COMPLEXITY_CURVES.find((curve) => curve.id === "factorial")!.growth(4), 24);
});

test("all nine teaching classes have distinct identities and correct sample values", () => {
	assert.equal(COMPLEXITY_CURVES.length, 9);
	assert.equal(new Set(COMPLEXITY_CURVES.map((curve) => curve.id)).size, 9);
	assert.deepEqual(COMPLEXITY_CURVES.map((curve) => curve.growth(4)), [1, 2, 2, 4, 8, 16, 64, 16, 24]);
});

test("logarithmic plots start above zero and omit values outside their display range", () => {
	assert.ok(CHART_INPUTS.every((n, index) => n >= 2 && (index === 0 || n > CHART_INPUTS[index - 1])));
	assert.equal(chartValue(0), null);
	assert.equal(chartValue(Infinity), null);
	assert.equal(chartValue(CHART_MAX + 1), null);
	assert.equal(chartValue(CHART_MAX), CHART_MAX);
	for (const curve of COMPLEXITY_CURVES) {
		const points = CHART_INPUTS.map((n) => chartValue(curve.growth(n)));
		assert.ok(points.some((value) => value !== null), curve.id);
		assert.ok(points.every((value) => value === null || (value > 0 && value <= CHART_MAX)), curve.id);
	}
});

test("large finite values are described as outside the display range, not infinite", () => {
	assert.equal(formatGrowthValue(24), "24");
	assert.equal(formatGrowthValue(factorial(16)), "> 1 billion");
	assert.equal(formatGrowthValue(Infinity), "> 1 billion");
});
