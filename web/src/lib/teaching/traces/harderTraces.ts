import type { HighlightSpec, TeachingStep } from "../types";
import type { ArrayFrame } from "./twoPointerTraces";

/**
 * Step generators for the second animation batch: 189 Rotate Array,
 * 881 Boats to Save People, 18 4Sum and 22 Generate Parentheses. As in
 * twoPointerTraces.ts, each one runs the algorithm from src/leetcode and records
 * a frame per meaningful move; web/tests/harder-traces.test.ts checks every
 * frame against the repo's Python solution and per-frame invariants.
 */

const cell = (i: number) => `cell:${i}`;
const ptr = (name: string) => `pointer:${name}`;
const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from) }, (_, t) => from + t);

type Fields = {
	id: string;
	exp: string;
	reason: string;
	invariant: string;
	action: TeachingStep["action"];
	highlights?: HighlightSpec[];
	[key: string]: unknown;
};

// ---------------------------------------------------------------------------
// 189. Rotate Array — three reversals
// ---------------------------------------------------------------------------

export type RotateFrame = ArrayFrame & {
	/** Which of the three reversals this frame belongs to, 0 before any. */
	phase: string;
	/** [start, end] of the block being reversed, inclusive, or null. */
	block: [number, number] | null;
};

export function rotateArraySteps(input: number[], kIn: number): RotateFrame[] {
	const nums = [...input];
	const n = nums.length;
	const k = kIn % n;
	const target = [...input.slice(n - k), ...input.slice(0, n - k)];
	const steps: RotateFrame[] = [];
	const invariant = "Rotating right by k = reverse everything, then reverse the first k, then reverse the rest.";

	const push = (fields: Fields & { block: [number, number] | null; phase: string; left: number; right: number }) => {
		const { block, left, right, ...rest } = fields;
		const settled = range(0, n).filter((i) => nums[i] === target[i] && fields.phase === "done");
		steps.push({
			...rest,
			block,
			cells: [...nums],
			pointers: { left, right },
			settled,
			highlights: fields.highlights ?? [],
		} as RotateFrame);
	};

	push({
		id: "start",
		phase: "start",
		block: null,
		left: -1,
		right: -1,
		exp: `Rotate right by k = ${kIn}${kIn !== k ? `; since the array has ${n} elements, that is the same as k = ${kIn} % ${n} = ${k}` : ""}. The last ${k} values must move to the front, in order.`,
		reason: "Moving values one step at a time would cost O(n·k). Three in-place reversals do it in O(n) with O(1) extra space.",
		invariant,
		action: "derive",
		highlights: [
			...range(n - k, n).map((i) => ({ target: cell(i), kind: "region-add" as const })),
			...range(0, n - k).map((i) => ({ target: cell(i), kind: "region-subtract" as const })),
		],
	});

	const reverse = (from: number, to: number, phase: string, why: string) => {
		let left = from;
		let right = to;
		push({
			id: `${phase}-begin`,
			phase,
			block: from <= to ? [from, to] : null,
			left: from <= to ? left : -1,
			right: from <= to ? right : -1,
			exp: from < to ? `${why} Reverse nums[${from}..${to}].` : `${why} The block nums[${from}..${to}] has at most one value, so there is nothing to swap.`,
			reason: "A reversal is the Reverse String pattern: swap the ends, move both pointers inward.",
			invariant,
			action: "compare",
			highlights: range(from, to + 1).map((i) => ({ target: cell(i), kind: "focus" as const })),
		});
		while (left < right) {
			[nums[left], nums[right]] = [nums[right], nums[left]];
			push({
				id: `${phase}-swap-${left}`,
				phase,
				block: [from, to],
				left,
				right,
				exp: `Swap nums[${left}] and nums[${right}].`,
				reason: "The outer pair of the block is now in its reversed place.",
				invariant,
				action: "swap",
				highlights: [
					{ target: cell(left), kind: "write" },
					{ target: cell(right), kind: "write" },
				],
			});
			left += 1;
			right -= 1;
		}
	};

	reverse(0, n - 1, "reverse-all", "Step 1 of 3.");
	reverse(0, k - 1, "reverse-front", `Step 2 of 3. The first ${k} values are the old tail, but backwards.`);
	reverse(k, n - 1, "reverse-back", `Step 3 of 3. The remaining ${n - k} values are the old head, but backwards.`);

	push({
		id: "done",
		phase: "done",
		block: null,
		left: -1,
		right: -1,
		exp: `Done: [${nums.join(", ")}]. Each value moved exactly ${k} places to the right, wrapping around.`,
		reason: "Reversing the whole array puts the tail block first but backwards; the two block reversals undo the backwards part.",
		invariant,
		action: "confirm",
		highlights: range(0, n).map((i) => ({ target: cell(i), kind: "confirmed" as const })),
	});
	return steps;
}

// ---------------------------------------------------------------------------
// 881. Boats to Save People — sort, then pair heaviest with lightest
// ---------------------------------------------------------------------------

export type BoatsFrame = ArrayFrame & {
	boats: number[][];
	limit: number;
};

export function boatsSteps(input: number[], limit: number): BoatsFrame[] {
	const people = [...input].sort((a, b) => a - b);
	const n = people.length;
	const steps: BoatsFrame[] = [];
	const boats: number[][] = [];
	const boarded = new Set<number>();
	const invariant = "Everyone outside [left, right] is on a boat, and every boat so far is necessary.";
	let left = 0;
	let right = n - 1;

	// `at` overrides where the badges are drawn, so a boat frame can show the
	// pair it describes rather than where the pointers move to afterwards.
	const push = (fields: Fields & { at?: { left: number; right: number } }) =>
		steps.push({
			...fields,
			cells: [...people],
			pointers: fields.at ?? { left, right },
			settled: [...boarded].sort((a, b) => a - b),
			boats: boats.map((b) => [...b]),
			limit,
			highlights: fields.highlights ?? [],
		} as BoatsFrame);

	push({
		id: "start",
		exp: `Sort the weights: [${people.join(", ")}]. left points at the lightest person, right at the heaviest. Each boat holds at most 2 people and ${limit} weight.`,
		reason: "Sorting lets us ask one question per boat: can the heaviest person left share with the lightest?",
		invariant,
		action: "compare",
		highlights: [
			{ target: ptr("left"), kind: "focus" },
			{ target: ptr("right"), kind: "focus" },
		],
	});

	while (left <= right) {
		const heavy = right;
		const remaining = limit - people[heavy];
		const pair = left < heavy && remaining >= people[left];
		const light = left;
		boats.push(pair ? [people[heavy], people[light]] : [people[heavy]]);
		boarded.add(heavy);
		right -= 1;
		if (pair) {
			boarded.add(light);
			left += 1;
		}
		push({
			id: `boat-${boats.length}`,
			// The pair this boat was decided from: right on the heaviest, left on
			// the lightest candidate. The next frame shows where they moved to.
			at: { left: light, right: heavy },
			exp: pair
				? `Boat ${boats.length}: ${people[heavy]} + ${people[light]} = ${people[heavy] + people[light]} <= ${limit}, so the heaviest and lightest share it.`
				: light === heavy
					? `Boat ${boats.length}: only ${people[heavy]} is left, so they go alone.`
					: `Boat ${boats.length}: ${people[heavy]} + ${people[light]} = ${people[heavy] + people[light]} > ${limit}. Even the lightest person does not fit, so ${people[heavy]} goes alone.`,
			reason: pair
				? "Pairing the heaviest with the lightest never hurts: anyone else who could join the heaviest is at least as heavy, so is no better a partner."
				: light === heavy
					? "left and right point at the same person, so there is nobody to pair with. Every person needs a seat, so this boat is required."
					: "If the lightest person cannot join, nobody can, so the heaviest person needs a boat of their own either way.",
			invariant,
			action: pair ? "write" : light === heavy ? "confirm" : "discard",
			highlights: [
				{ target: cell(heavy), kind: "write" },
				...(pair ? [{ target: cell(light), kind: "write" as const }] : light !== heavy ? [{ target: cell(light), kind: "compare" as const }] : []),
				{ target: `boat:${boats.length - 1}`, kind: "focus" },
			],
		});
	}

	push({
		id: "done",
		exp: `Everyone is on a boat. Minimum boats = ${boats.length}.`,
		reason: "Every boat carried the heaviest remaining person, and paired them whenever any pairing was possible.",
		invariant,
		action: "confirm",
		answer: boats.length,
		highlights: boats.map((_, b) => ({ target: `boat:${b}`, kind: "confirmed" as const })),
	});
	return steps;
}

// ---------------------------------------------------------------------------
// 18. 4Sum — two anchors, then a sorted pair search
// ---------------------------------------------------------------------------

export type FourSumFrame = ArrayFrame & {
	target: number;
	sum: number | null;
	found: number[][];
};

export function fourSumSteps(input: number[], target: number): FourSumFrame[] {
	const nums = [...input].sort((a, b) => a - b);
	const n = nums.length;
	const steps: FourSumFrame[] = [];
	const found: number[][] = [];
	const invariant = "For fixed anchors i and j, every unexamined pair lies inside [left, right]; each quadruplet is recorded once.";

	const push = (fields: Fields & { i: number; j: number; left: number; right: number; sum: number | null }) => {
		const { i, j, sum, ...rest } = fields;
		// Once the pair pointers meet or cross, the search for these anchors is
		// over; drawing them would put L and R on cells that are no longer a pair.
		const open = fields.left >= 0 && fields.left < fields.right;
		const left = open ? fields.left : -1;
		const right = open ? fields.right : -1;
		steps.push({
			...rest,
			cells: [...nums],
			pointers: { i, j, left, right },
			settled: [],
			target,
			sum,
			found: found.map((q) => [...q]),
			highlights: fields.highlights ?? [],
		} as FourSumFrame);
	};

	push({
		id: "start",
		i: -1,
		j: -1,
		left: -1,
		right: -1,
		sum: null,
		exp: `Sort nums: [${nums.join(", ")}]. Fix two anchors i < j, then search the rest for a pair that completes the sum ${target}.`,
		reason: "Sorting makes the inner search a Two Sum II: move left to grow the sum, right to shrink it.",
		invariant,
		action: "derive",
	});

	for (let i = 0; i < n - 3; i++) {
		if (i > 0 && nums[i] === nums[i - 1]) {
			push({
				id: `skip-i-${i}`,
				i,
				j: -1,
				left: -1,
				right: -1,
				sum: null,
				exp: `nums[${i}] = ${nums[i]} equals the previous anchor, so skip it.`,
				reason: "The same first value would find exactly the same quadruplets again.",
				invariant,
				action: "discard",
				highlights: [{ target: cell(i), kind: "discard" }],
			});
			continue;
		}
		for (let j = i + 1; j < n - 2; j++) {
			if (j > i + 1 && nums[j] === nums[j - 1]) {
				push({
					id: `skip-j-${i}-${j}`,
					i,
					j,
					left: -1,
					right: -1,
					sum: null,
					exp: `nums[${j}] = ${nums[j]} equals the previous second anchor, so skip it.`,
					reason: "Duplicates are skipped at every anchor level, not just the first.",
					invariant,
					action: "discard",
					highlights: [{ target: cell(j), kind: "discard" }],
				});
				continue;
			}
			let left = j + 1;
			let right = n - 1;
			const need = target - nums[i] - nums[j];
			push({
				id: `anchor-${i}-${j}`,
				i,
				j,
				left,
				right,
				sum: null,
				exp: `Anchors ${nums[i]} (i = ${i}) and ${nums[j]} (j = ${j}). The pair must sum to ${target} - ${nums[i]} - ${nums[j]} = ${need}.`,
				reason: "With both anchors fixed, what remains is a sorted two-pointer pair search.",
				invariant,
				action: "compare",
				highlights: [
					{ target: cell(i), kind: "focus" },
					{ target: cell(j), kind: "focus" },
				],
			});
			while (left < right) {
				const sum = nums[i] + nums[j] + nums[left] + nums[right];
				const l0 = left;
				const r0 = right;
				if (sum < target) {
					// Record the comparison with the pointers where it happened;
					// the next frame (compare, match or anchor change) shows the move.
					push({
						id: `move-left-${i}-${j}-${l0}-${r0}`,
						i,
						j,
						left: l0,
						right: r0,
						sum,
						exp: `${nums[i]} + ${nums[j]} + ${nums[l0]} + ${nums[r0]} = ${sum} < ${target}. Move left right to grow the sum.`,
						reason: `Even the largest partner, nums[${r0}], is too small with nums[${l0}], so nums[${l0}] cannot be in any answer here.`,
						invariant,
						action: "shrink",
						highlights: [
							{ target: cell(l0), kind: "discard" },
							{ target: cell(r0), kind: "compare" },
						],
					});
					left += 1;
				} else if (sum > target) {
					push({
						id: `move-right-${i}-${j}-${l0}-${r0}`,
						i,
						j,
						left: l0,
						right: r0,
						sum,
						exp: `${nums[i]} + ${nums[j]} + ${nums[l0]} + ${nums[r0]} = ${sum} > ${target}. Move right left to shrink the sum.`,
						reason: `Even the smallest partner, nums[${l0}], is too large with nums[${r0}], so nums[${r0}] cannot be in any answer here.`,
						invariant,
						action: "shrink",
						highlights: [
							{ target: cell(l0), kind: "compare" },
							{ target: cell(r0), kind: "discard" },
						],
					});
					right -= 1;
				} else {
					found.push([nums[i], nums[j], nums[left], nums[right]]);
					// Show the match with the pointers still on it; the move past
					// repeats is its own frame so the badges never sit on crossed cells.
					push({
						id: `found-${i}-${j}-${l0}-${r0}`,
						i,
						j,
						left,
						right,
						sum,
						exp: `${nums[i]} + ${nums[j]} + ${nums[l0]} + ${nums[r0]} = ${target}. Record [${found.at(-1)!.join(", ")}].`,
						reason: "All four values are fixed by the pointers, and this exact combination has not been recorded before.",
						invariant,
						action: "confirm",
						highlights: [i, j, l0, r0].map((t) => ({ target: cell(t), kind: "match" as const })),
					});
					left += 1;
					right -= 1;
					while (left < right && nums[left] === nums[left - 1]) left += 1;
					while (left < right && nums[right] === nums[right + 1]) right -= 1;
					const skipped = left - l0 - 1 + (r0 - right - 1);
					push({
						id: `skip-${i}-${j}-${l0}-${r0}`,
						i,
						j,
						left,
						right,
						sum: null,
						exp:
							left < right
								? `Move both pointers inward${skipped > 0 ? `, skipping ${skipped} repeated value${skipped === 1 ? "" : "s"}` : ""}: left = ${left}, right = ${right}.`
								: `Move both pointers inward. They ${left === right ? "meet" : "cross"}, so no pair is left and the search for anchors ${nums[i]}, ${nums[j]} is finished.`,
						reason: "Keeping either matched value would only find the same quadruplet again, so both ends move past every copy of it.",
						invariant,
						action: "shrink",
						highlights: [],
					});
				}
			}
		}
	}

	push({
		id: "done",
		i: -1,
		j: -1,
		left: -1,
		right: -1,
		sum: null,
		exp: found.length
			? `All anchor pairs checked. Unique quadruplets: ${found.map((q) => `[${q.join(", ")}]`).join(", ")}.`
			: `All anchor pairs checked. No quadruplet sums to ${target}.`,
		reason: "Two anchor loops times one linear pair search is O(n³) after an O(n log n) sort.",
		invariant,
		action: "confirm",
	});
	return steps;
}

// ---------------------------------------------------------------------------
// 22. Generate Parentheses — the recursion tree of valid prefixes
// ---------------------------------------------------------------------------

export type ParenNode = {
	id: number;
	parent: number | null;
	prefix: string;
	opened: number;
	closed: number;
	depth: number;
	complete: boolean;
};

export type ParenFrame = TeachingStep & {
	/** Every node the search will visit, so the tree layout is fixed. */
	nodes: ParenNode[];
	/** Nodes visited so far, in visit order. */
	visited: number[];
	/** The node the search is at. */
	current: number;
	/** Nodes on the current recursion path, root first: the path stack. */
	path: number[];
	results: string[];
};

export function generateParenthesisSteps(n: number): ParenFrame[] {
	const nodes: ParenNode[] = [];
	const order: { node: number; path: number[] }[] = [];

	const visit = (prefix: string, opened: number, closed: number, parent: number | null, path: number[]) => {
		const node: ParenNode = {
			id: nodes.length,
			parent,
			prefix,
			opened,
			closed,
			depth: prefix.length,
			complete: opened === n && closed === n,
		};
		nodes.push(node);
		const here = [...path, node.id];
		order.push({ node: node.id, path: here });
		if (node.complete) return;
		if (opened < n) visit(prefix + "(", opened + 1, closed, node.id, here);
		if (closed < opened) visit(prefix + ")", opened, closed + 1, node.id, here);
	};
	visit("", 0, 0, null, []);

	const invariant = "The path is always a valid prefix: 0 <= closed <= opened <= n.";
	const steps: ParenFrame[] = [];
	const results: string[] = [];

	order.forEach(({ node, path }, index) => {
		const cur = nodes[node];
		if (cur.complete) results.push(cur.prefix);
		const canOpen = cur.opened < n;
		const canClose = cur.closed < cur.opened;
		let exp: string;
		if (node === 0) {
			exp = `Start with an empty path. opened = 0, closed = 0, n = ${n}.`;
		} else if (cur.complete) {
			const lastVisit = index === order.length - 1;
			exp = lastVisit
				? `"${cur.prefix}" uses all ${n} pairs, so record it. Every branch has now been explored.`
				: `"${cur.prefix}" uses all ${n} pairs, so record it. Pop back up to the nearest prefix that still has an untried branch.`;
		} else {
			const last = cur.prefix.at(-1);
			const options = [canOpen && `"(" (opened ${cur.opened} < ${n})`, canClose && `")" (closed ${cur.closed} < opened ${cur.opened})`]
				.filter(Boolean)
				.join(" or ");
			exp = `Push "${last}": path = "${cur.prefix}". Next we may add ${options}.`;
		}
		steps.push({
			id: `node-${node}`,
			exp,
			reason: cur.complete
				? "A complete string can only be reached through valid prefixes, so it never needs checking."
				: !canClose
					? `closed = opened = ${cur.opened}, so ")" would close a pair that was never opened.`
					: !canOpen
						? `All ${n} "(" are used, so only ")" can follow.`
						: 'Both choices keep the prefix valid, so explore "(" first, then ")".',
			invariant,
			action: cur.complete ? "confirm" : node === 0 ? "compare" : "write",
			nodes,
			visited: order.slice(0, index + 1).map((o) => o.node),
			current: node,
			path,
			results: [...results],
			highlights: [
				{ target: `node:${node}`, kind: cur.complete ? "match" : "focus" },
				...path.slice(0, -1).map((p) => ({ target: `node:${p}`, kind: "compare" as const })),
			],
		});
	});

	steps.push({
		id: "done",
		exp: `The search has visited every valid prefix. ${results.length} strings: ${results.map((r) => `"${r}"`).join(", ")}.`,
		reason: "The guards cut every invalid branch, so the tree has no dead ends: each leaf is an answer.",
		invariant,
		action: "confirm",
		nodes,
		visited: order.map((o) => o.node),
		current: -1,
		path: [],
		results: [...results],
		highlights: nodes.filter((nd) => nd.complete).map((nd) => ({ target: `node:${nd.id}`, kind: "match" as const })),
	});
	return steps;
}
