import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

import {
	compactionSteps,
	mergeAlternatelySteps,
	mergeSortedArraySteps,
	reverseStringSteps,
} from "../src/lib/teaching/traces/twoPointerTraces.ts";

const projectRoot = new URL("../..", import.meta.url);

/** Run the repo's own Python solution so the animation's result is checked
 * against the code it claims to teach, not against a copy of that code. */
function python(module: string, dir: string, expr: string): unknown {
	const out = execFileSync("python3", ["-c", `import json,sys; sys.path.insert(0, ${JSON.stringify(dir)}); from ${module} import Solution; print(json.dumps(${expr}))`], {
		cwd: new URL(".", projectRoot).pathname,
		encoding: "utf8",
	});
	return JSON.parse(out);
}

const TWO_POINTERS = "src/leetcode/two_pointers";

function rng(seed: number) {
	return () => {
		seed = (seed * 1103515245 + 12345) & 0x7fffffff;
		return seed / 0x7fffffff;
	};
}

function assertTeachingFields(steps: { exp: string; invariant?: unknown; highlights?: { target: string }[] }[], targets: Set<string>) {
	assert.ok(steps.length >= 2, "an animation needs at least a start and an end frame");
	for (const [index, step] of steps.entries()) {
		assert.ok(step.exp.trim().length > 0, `step ${index} has no explanation`);
		assert.ok(step.invariant, `step ${index} has no invariant`);
		for (const { target } of step.highlights ?? []) {
			assert.ok(targets.has(target), `step ${index} highlights unknown target ${target}`);
		}
	}
}

const arrayTargets = (n: number, pointers: string[]) =>
	new Set([...Array.from({ length: n }, (_, i) => `cell:${i}`), ...pointers.map((p) => `pointer:${p}`)]);

// ---------------------------------------------------------------- 344 -----

test("344 reverse string: final frame is the reversed input, matching the Python solution", () => {
	for (const s of [["h", "e", "l", "l", "o"], ["H", "a", "n", "n", "a", "h"], ["a"], ["a", "b"]]) {
		const steps = reverseStringSteps(s);
		const expected = python("reverse_string", TWO_POINTERS, `(lambda s: (Solution().reverseString(s), s)[1])(${JSON.stringify(s)})`);
		assert.deepEqual(steps.at(-1)!.cells, expected);
		assert.deepEqual(steps.at(-1)!.cells, [...s].reverse());
		assertTeachingFields(steps, arrayTargets(s.length, ["left", "right"]));
	}
});

test("344 reverse string: every frame keeps the settled region correct", () => {
	const s = ["h", "e", "l", "l", "o"];
	const reversed = [...s].reverse();
	for (const step of reverseStringSteps(s)) {
		for (const i of step.settled) assert.equal(step.cells[i], reversed[i], `${step.id}: cell ${i} marked settled but wrong`);
		assert.deepEqual([...step.cells].sort(), [...s].sort(), `${step.id}: swaps must be a permutation`);
	}
});

// ------------------------------------------------------------- 26 / 80 ----

for (const keep of [1, 2] as const) {
	const [module, label] = keep === 1 ? ["remove_duplicate", "26"] : ["remove_duplicates_ii", "80"];

	test(`${label} remove duplicates: k and prefix match the Python solution on random sorted input`, () => {
		const rand = rng(keep * 97);
		const cases: number[][] = [[1, 1, 2], [0, 0, 1, 1, 1, 2, 2, 3, 3, 4], [1, 1, 1, 2, 2, 3], [7], [1, 1, 1, 1]];
		for (let t = 0; t < 40; t++) {
			cases.push(Array.from({ length: 1 + Math.floor(rand() * 9) }, () => Math.floor(rand() * 4)).sort((a, b) => a - b));
		}
		const expected = python(
			module,
			TWO_POINTERS,
			`[(lambda a: (lambda k: [k, a[:k]])(Solution().removeDuplicates(a)))(list(c)) for c in ${JSON.stringify(cases)}]`,
		) as [number, number[]][];
		cases.forEach((nums, index) => {
			const steps = compactionSteps(nums, keep);
			const last = steps.at(-1)!;
			const [k, prefix] = expected[index];
			assert.equal(last.k, k, `k for ${JSON.stringify(nums)}`);
			assert.deepEqual(last.cells.slice(0, k), prefix, `prefix for ${JSON.stringify(nums)}`);
			assertTeachingFields(steps, arrayTargets(nums.length, ["read", "write", "look"]));
		});
	});

	test(`${label} remove duplicates: every frame's settled prefix is a valid compaction of what was read`, () => {
		const nums = keep === 1 ? [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] : [0, 0, 1, 1, 1, 1, 2, 3, 3];
		for (const step of compactionSteps(nums, keep)) {
			const prefix = step.settled.map((i) => step.cells[i] as number);
			assert.deepEqual(prefix, [...prefix].sort((a, b) => a - b), `${step.id}: prefix not sorted`);
			const counts = new Map<number, number>();
			for (const v of prefix) counts.set(v, (counts.get(v) ?? 0) + 1);
			for (const [v, c] of counts) assert.ok(c <= keep, `${step.id}: ${c} copies of ${v}`);
		}
	});
}

// ---------------------------------------------------------------- 88 ------

test("88 merge sorted array: final frame matches the Python solution", () => {
	const cases: [number[], number, number[], number][] = [
		[[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3],
		[[4, 5, 6, 0, 0, 0], 3, [1, 2, 3], 3],
		[[1], 1, [], 0],
		[[0], 0, [1], 1],
		[[2, 0], 1, [1], 1],
	];
	const rand = rng(88);
	for (let t = 0; t < 40; t++) {
		const a = Array.from({ length: Math.floor(rand() * 5) }, () => Math.floor(rand() * 6)).sort((x, y) => x - y);
		const b = Array.from({ length: Math.floor(rand() * 5) }, () => Math.floor(rand() * 6)).sort((x, y) => x - y);
		cases.push([[...a, ...b.map(() => 0)], a.length, b, b.length]);
	}
	const expected = python(
		"merge_sorted_array",
		TWO_POINTERS,
		`[(lambda a, m, b, n: (Solution().merge(a, m, b, n), a)[1])(list(a), m, list(b), n) for a, m, b, n in ${JSON.stringify(cases)}]`,
	) as number[][];
	cases.forEach(([nums1, m, nums2, n], index) => {
		const steps = mergeSortedArraySteps(nums1, m, nums2, n);
		assert.deepEqual(steps.at(-1)!.cells, expected[index], JSON.stringify([nums1, m, nums2, n]));
		const targets = arrayTargets(m + n, ["i", "j", "k"]);
		nums2.forEach((_, t) => targets.add(`second:${t}`));
		assertTeachingFields(steps, targets);
		// The backward write must never overwrite an unread nums1 value.
		for (const step of steps) {
			const { i, k } = step.pointers;
			assert.ok(k >= i, `${step.id}: write pointer k=${k} passed read pointer i=${i}`);
			for (const s of step.settled) assert.equal(step.cells[s], expected[index][s], `${step.id}: settled cell ${s}`);
		}
	});
});

// -------------------------------------------------------------- 1768 ------

test("1768 merge strings alternately: result matches the Python solution", () => {
	const cases: [string, string][] = [
		["abc", "pqr"],
		["ab", "pqrs"],
		["abcd", "pq"],
		["a", "b"],
		["abc", "z"],
	];
	const expected = python(
		"merge_alternatively",
		TWO_POINTERS,
		`[Solution().mergeAlternately(a, b) for a, b in ${JSON.stringify(cases)}]`,
	) as string[];
	cases.forEach(([w1, w2], index) => {
		const steps = mergeAlternatelySteps(w1, w2);
		const last = steps.at(-1)!;
		assert.equal(last.result, expected[index]);
		const targets = new Set([
			...[...w1].map((_, t) => `w1:${t}`),
			...[...w2].map((_, t) => `w2:${t}`),
			...[...last.result].map((_, t) => `out:${t}`),
		]);
		assertTeachingFields(steps, targets);
		for (const step of steps) {
			// Every result character is attributed to exactly one word, correctly.
			const second = new Set(step.fromSecond);
			let a = 0;
			let b = 0;
			for (let t = 0; t < step.result.length; t++) {
				if (second.has(t)) assert.equal(step.result[t], w2[b++], `${step.id}: out:${t}`);
				else assert.equal(step.result[t], w1[a++], `${step.id}: out:${t}`);
			}
			assert.equal(a, step.i, `${step.id}: consumed word1 prefix`);
			assert.equal(b, step.j, `${step.id}: consumed word2 prefix`);
		}
	});
});
