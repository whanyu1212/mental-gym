import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

import {
	boatsSteps,
	fourSumSteps,
	generateParenthesisSteps,
	rotateArraySteps,
} from "../src/lib/teaching/traces/harderTraces.ts";

const projectRoot = new URL("../..", import.meta.url);

/** Run the repo's own Python solution on each case and return its results. */
function python(dir: string, module: string, expr: string): unknown {
	const out = execFileSync(
		"python3",
		["-c", `import json,sys; sys.path.insert(0, ${JSON.stringify(dir)}); from ${module} import Solution; print(json.dumps(${expr}))`],
		{ cwd: new URL(".", projectRoot).pathname, encoding: "utf8" },
	);
	return JSON.parse(out);
}

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
		for (const { target } of step.highlights ?? []) assert.ok(targets.has(target), `step ${index} highlights unknown ${target}`);
	}
}

const cells = (n: number) => Array.from({ length: n }, (_, i) => `cell:${i}`);
const sortedQuads = (qs: number[][]) => qs.map((q) => [...q].sort((a, b) => a - b)).sort((a, b) => a.join().localeCompare(b.join()));

// ---------------------------------------------------------------- 189 -----

test("189 rotate array: final frame matches the Python solution, every frame is a permutation", () => {
	const cases: [number[], number][] = [
		[[1, 2, 3, 4, 5, 6, 7], 3],
		[[-1, -100, 3, 99], 2],
		[[1, 2], 3],
		[[1, 2, 3], 0],
		[[1], 5],
	];
	const rand = rng(189);
	for (let t = 0; t < 40; t++) {
		const n = 1 + Math.floor(rand() * 8);
		cases.push([Array.from({ length: n }, (_, v) => v + 1), Math.floor(rand() * 12)]);
	}
	const expected = python(
		"src/leetcode/two_pointers",
		"rotate_array",
		`[(lambda a, k: (Solution().rotate(a, k), a)[1])(list(a), k) for a, k in ${JSON.stringify(cases)}]`,
	) as number[][];
	cases.forEach(([nums, k], index) => {
		const steps = rotateArraySteps(nums, k);
		assert.deepEqual(steps.at(-1)!.cells, expected[index], JSON.stringify([nums, k]));
		const targets = new Set([...cells(nums.length), "pointer:left", "pointer:right"]);
		assertTeachingFields(steps, targets);
		for (const step of steps) {
			assert.deepEqual([...step.cells].sort((a, b) => Number(a) - Number(b)), [...nums].sort((a, b) => a - b), `${step.id}: not a permutation`);
			if (step.block) {
				const [lo, hi] = step.block;
				const { left, right } = step.pointers;
				assert.ok(lo <= left && right <= hi, `${step.id}: pointers left the block`);
			}
		}
		// The three reversals happen in the documented order.
		const phases = [...new Set(steps.map((s) => s.phase))];
		assert.deepEqual(phases, ["start", "reverse-all", "reverse-front", "reverse-back", "done"]);
	});
});

// ---------------------------------------------------------------- 881 -----

test("881 boats: boat count matches the Python solution, and every boat is legal", () => {
	const cases: [number[], number][] = [
		[[1, 2], 3],
		[[3, 2, 2, 1], 3],
		[[3, 5, 3, 4], 5],
		[[5], 5],
		[[1, 1, 1, 1], 2],
	];
	const rand = rng(881);
	for (let t = 0; t < 40; t++) {
		const limit = 3 + Math.floor(rand() * 6);
		cases.push([Array.from({ length: 1 + Math.floor(rand() * 8) }, () => 1 + Math.floor(rand() * limit)), limit]);
	}
	const expected = python(
		"src/leetcode/two_pointers",
		"boats_to_save_people",
		`[Solution().numRescueBoats(list(p), l) for p, l in ${JSON.stringify(cases)}]`,
	) as number[];
	cases.forEach(([people, limit], index) => {
		const steps = boatsSteps(people, limit);
		const last = steps.at(-1)!;
		assert.equal(last.answer, expected[index], JSON.stringify([people, limit]));
		assert.equal(last.boats.length, expected[index]);
		const targets = new Set([...cells(people.length), "pointer:left", "pointer:right", ...last.boats.map((_, b) => `boat:${b}`)]);
		assertTeachingFields(steps, targets);
		for (const boat of last.boats) {
			assert.ok(boat.length >= 1 && boat.length <= 2, `boat ${JSON.stringify(boat)} has wrong size`);
			assert.ok(boat.reduce((a, b) => a + b, 0) <= limit, `boat ${JSON.stringify(boat)} is over ${limit}`);
		}
		assert.deepEqual(last.boats.flat().sort((a, b) => a - b), [...people].sort((a, b) => a - b), "everyone boards exactly once");
		for (const step of steps) {
			const { left, right } = step.pointers;
			const outside = step.cells.map((_, i) => i).filter((i) => i < left || i > right);
			assert.deepEqual(step.settled, outside, `${step.id}: settled must be exactly the people outside [left, right]`);
			// A solo boat for the last remaining person tested no pairing, so its
			// explanation must not claim the lightest person failed to fit.
			if (step.id?.startsWith("boat") && step.exp.includes("only") && step.exp.includes("left")) {
				assert.doesNotMatch(String(step.reason), /lightest person cannot join/, `${step.id}: solo boat given a failed-pairing reason`);
			}
		}
	});
});

// ----------------------------------------------------------------- 18 -----

test("18 4Sum: quadruplets match the Python solution, each found once", () => {
	const cases: [number[], number][] = [
		[[1, 0, -1, 0, -2, 2], 0],
		[[2, 2, 2, 2, 2], 8],
		[[1, 2, 3], 6],
		[[0, 0, 0, 0], 1],
		// Repeated inner values: without the post-match skips this records
		// [-1, -1, 1, 1] twice. Random inputs rarely hit this, so pin it.
		[[-1, -1, 1, 1, 1, 1], 0],
		[[-1, -1, -1, 1, 1, 1, 1, 1], 0],
	];
	const rand = rng(18);
	for (let t = 0; t < 40; t++) {
		cases.push([Array.from({ length: 4 + Math.floor(rand() * 5) }, () => Math.floor(rand() * 7) - 3), Math.floor(rand() * 7) - 3]);
	}
	const expected = python(
		"src/leetcode/two_pointers",
		"four_sum",
		`[Solution().fourSum(list(a), t) for a, t in ${JSON.stringify(cases)}]`,
	) as number[][][];
	cases.forEach(([nums, target], index) => {
		const steps = fourSumSteps(nums, target);
		const last = steps.at(-1)!;
		assert.deepEqual(sortedQuads(last.found), sortedQuads(expected[index]), JSON.stringify([nums, target]));
		assert.equal(new Set(last.found.map((q) => q.join())).size, last.found.length, "no duplicate quadruplets");
		const targets = new Set([...cells(nums.length), "pointer:i", "pointer:j", "pointer:left", "pointer:right"]);
		assertTeachingFields(steps, targets);
		for (const step of steps) {
			const { i, j, left } = step.pointers;
			if (i >= 0 && j >= 0 && left >= 0) assert.ok(i < j && j < left, `${step.id}: anchors must precede the pair`);
			if (step.sum !== null) {
				// Whenever a sum is shown, the four visible pointers are the values
				// that produced it. Covers comparison frames as well as matches.
				const { right } = step.pointers;
				const at = (index: number) => Number(step.cells[index]);
				assert.equal(at(i) + at(j) + at(left) + at(right), step.sum, `${step.id}: shown sum disagrees with the pointers`);
				if (step.id?.startsWith("found")) assert.equal(step.sum, target);
			}
			if (step.pointers.left >= 0 && step.pointers.right >= 0) {
				assert.ok(step.pointers.left < step.pointers.right, `${step.id}: pair pointers shown crossed`);
			}
		}
	});
});

// ----------------------------------------------------------------- 22 -----

test("22 generate parentheses: results match the Python solution; the tree only holds valid prefixes", () => {
	for (const n of [1, 2, 3, 4]) {
		const steps = generateParenthesisSteps(n);
		const expected = python("src/leetcode/stack", "generate_parenthesis", `Solution().generateParenthesis(${n})`) as string[];
		const last = steps.at(-1)!;
		assert.deepEqual([...last.results].sort(), [...expected].sort());
		// Results appear in the same DFS order as the Python solution produces them.
		assert.deepEqual(last.results, expected);

		const { nodes } = steps[0];
		assertTeachingFields(steps, new Set(nodes.map((nd) => `node:${nd.id}`)));
		for (const node of nodes) {
			assert.ok(node.closed <= node.opened && node.opened <= n, `invalid prefix ${node.prefix}`);
			if (node.parent !== null) assert.equal(nodes[node.parent].prefix, node.prefix.slice(0, -1));
		}
		// Every leaf is a complete answer: the guards leave no dead ends.
		const parents = new Set(nodes.map((nd) => nd.parent));
		for (const node of nodes) if (!parents.has(node.id)) assert.ok(node.complete, `dead end at ${node.prefix}`);

		for (const step of steps) {
			if (step.current < 0) continue;
			// The path stack is the chain of parents from the root to the current node.
			const chain: number[] = [];
			for (let at: number | null = step.current; at !== null; at = nodes[at].parent) chain.unshift(at);
			assert.deepEqual(step.path, chain, `${step.id}: path stack`);
		}
	}
});
