import type { HighlightSpec, TeachingStep } from "../types";

/**
 * Step generators for the two-pointer animations (LeetCode 26, 80, 88, 344,
 * 1768). Each one *runs* the algorithm from src/leetcode/two_pointers and
 * records a frame per pointer move, so the pictures can never drift from the
 * code they teach. web/tests/two-pointer-traces.test.ts checks every frame
 * against an independent simulation and the final result against the problem.
 *
 * Frames carry the full array/string state plus pointer indices; the visual
 * components only render what a frame says.
 */

export type ArrayFrame = TeachingStep & {
	/** Cell values after this step. */
	cells: (number | string)[];
	/** Pointer name -> index; an index of -1 means "not on the board". */
	pointers: Record<string, number>;
	/** Indices whose value is final. */
	settled: number[];
	/** Indices whose value is stale and no longer part of the answer. */
	stale?: number[];
};

const cell = (i: number) => `cell:${i}`;
const ptr = (name: string) => `pointer:${name}`;

/**
 * The teaching fields every frame must provide. Spelled out rather than
 * derived with Omit<>: TeachingStep has an index signature, and Omit over an
 * index-signature type silently drops required keys such as `exp`.
 */
type TeachingFields = {
	id: string;
	exp: string;
	reason: string;
	invariant: string;
	action: TeachingStep["action"];
	highlights?: HighlightSpec[];
	[key: string]: unknown;
};

type ArrayFields = TeachingFields & {
	cells: (number | string)[];
	pointers: Record<string, number>;
	settled: number[];
	stale?: number[];
};

function frame(partial: ArrayFields): ArrayFrame {
	return { ...partial, highlights: partial.highlights ?? [] };
}

// ---------------------------------------------------------------------------
// 344. Reverse String — mirror and swap
// ---------------------------------------------------------------------------

export function reverseStringSteps(input: string[]): ArrayFrame[] {
	const s = [...input];
	const n = s.length;
	const settledOutside = (left: number, right: number) =>
		Array.from({ length: n }, (_, i) => i).filter((i) => i < left || i > right);
	const steps: ArrayFrame[] = [];
	let left = 0;
	let right = n - 1;

	steps.push(
		frame({
			id: "start",
			cells: [...s],
			pointers: { left, right },
			settled: [],
			exp: `Put left on the first character and right on the last. Everything is still unresolved.`,
			reason: "Reversing means the first and last characters trade places, then the second and second-to-last, and so on inward.",
			invariant: "Positions outside [left, right] are already in their final reversed place.",
			action: "compare",
			highlights: [
				{ target: ptr("left"), kind: "focus" },
				{ target: ptr("right"), kind: "focus" },
			],
		}),
	);

	while (left < right) {
		const a = s[left];
		const b = s[right];
		[s[left], s[right]] = [s[right], s[left]];
		steps.push(
			frame({
				id: `swap-${left}-${right}`,
				cells: [...s],
				pointers: { left, right },
				settled: [...settledOutside(left, right), left, right],
				exp: `Swap s[${left}] = "${a}" with s[${right}] = "${b}".`,
				reason: "These two positions are mirror images, so after the swap both hold their final character.",
				invariant: "Positions outside [left, right] are already in their final reversed place.",
				action: "swap",
				highlights: [
					{ target: cell(left), kind: "write" },
					{ target: cell(right), kind: "write" },
				],
			}),
		);
		left += 1;
		right -= 1;
		steps.push(
			frame({
				id: `move-${left}-${right}`,
				cells: [...s],
				pointers: { left, right },
				settled: settledOutside(left, right),
				exp:
					left < right
						? `Move both pointers inward: left = ${left}, right = ${right}.`
						: left === right
							? `The pointers meet at index ${left}. A single middle character is its own mirror, so it is already in place.`
							: `The pointers have crossed. Every position has been swapped exactly once.`,
				reason: "The outer pair is settled forever, so neither pointer ever needs to go back.",
				invariant: "Positions outside [left, right] are already in their final reversed place.",
				action: left < right ? "shrink" : "confirm",
				highlights:
					left < right
						? [
								{ target: ptr("left"), kind: "focus" },
								{ target: ptr("right"), kind: "focus" },
							]
						: Array.from({ length: n }, (_, i) => ({ target: cell(i), kind: "confirmed" as const })),
			}),
		);
	}

	if (n <= 1) {
		steps.push(
			frame({
				id: "done",
				cells: [...s],
				pointers: { left, right },
				settled: [],
				exp: "left is not less than right, so the loop never runs. With at most one character there is nothing to swap.",
				reason: "A single character is its own mirror.",
				invariant: "Positions outside [left, right] are already in their final reversed place.",
				action: "confirm",
				highlights: Array.from({ length: n }, (_, i) => ({ target: cell(i), kind: "confirmed" as const })),
			}),
		);
	}
	steps[steps.length - 1].settled = Array.from({ length: n }, (_, i) => i);
	return steps;
}

// ---------------------------------------------------------------------------
// 26. Remove Duplicates from Sorted Array — read/write compaction, keep 1
// 80. Remove Duplicates from Sorted Array II — keep at most 2
// ---------------------------------------------------------------------------

/**
 * Both problems use the "write keeps the answer prefix" shape. `keep` is how
 * many copies of each value survive. The repo's 26 solution compares against
 * nums[slow] with slow = write - 1; the 80 solution compares against
 * nums[write - 2]. Both are this rule with keep = 1 and keep = 2.
 */
export function compactionSteps(input: number[], keep: 1 | 2): ArrayFrame[] {
	const nums = [...input];
	const steps: ArrayFrame[] = [];
	const prefix = (write: number) => Array.from({ length: write }, (_, i) => i);
	const look = (write: number) => write - keep;
	const keepText = keep === 1 ? "one copy" : "two copies";
	const invariant = `nums[:write] is the correct answer for everything read so far: sorted, at most ${keepText} of each value.`;
	let write = 0;

	steps.push(
		frame({
			id: "start",
			cells: [...nums],
			pointers: { read: 0, write },
			settled: [],
			exp: `read scans every value. write is the next slot of the answer. Nothing has been kept yet.`,
			reason: "Sorted input puts every copy of a value next to each other, so one scan can decide each copy.",
			invariant,
			action: "compare",
			highlights: [
				{ target: ptr("read"), kind: "focus" },
				{ target: ptr("write"), kind: "focus" },
			],
		}),
	);

	for (let read = 0; read < nums.length; read++) {
		const value = nums[read];
		const free = write < keep;
		const keepIt = free || nums[look(write)] !== value;
		const compareNote = free
			? `write = ${write} < ${keep}, so the first ${keep === 1 ? "value is" : "two values are"} always kept.`
			: `Compare with nums[write - ${keep}] = nums[${look(write)}] = ${nums[look(write)]}.`;

		if (keepIt) {
			nums[write] = value;
			const wrote = write;
			write += 1;
			steps.push(
				frame({
					id: `keep-${read}`,
					cells: [...nums],
					// write always marks the next free slot, matching the invariant.
					pointers: { read, write, look: free ? -1 : look(wrote) },
					settled: prefix(write),
					stale: [],
					exp: `read = ${read} sees ${value}. ${compareNote} ${free ? "" : `${value} is different, so this copy is allowed. `}Copy it to nums[${wrote}] and advance write to ${write}.`,
					reason: free
						? keep === 1
							? "Nothing is kept yet, so this value cannot be a repeat."
							: `Only ${wrote} value${wrote === 1 ? " is" : "s are"} kept so far, fewer than ${keep}, so no value can have too many copies yet.`
						: keep === 1
							? `The answer is sorted, so its last kept value, nums[${look(wrote)}], is the only place ${value} could already be. It is not, so this is the first copy.`
							: `The answer is sorted, so any earlier copies of ${value} sit at its end. nums[${look(wrote)}] is not ${value}, so at most ${keep - 1} ${keep - 1 === 1 ? "copy is" : "copies are"} kept and this one is allowed.`,
					invariant,
					action: "write",
					highlights: [
						{ target: cell(read), kind: "compare" },
						{ target: cell(wrote), kind: "write" },
						...(free ? [] : [{ target: cell(look(wrote)), kind: "focus" as const }]),
					],
				}),
			);
		} else {
			steps.push(
				frame({
					id: `skip-${read}`,
					cells: [...nums],
					pointers: { read, write, look: look(write) },
					settled: prefix(write),
					exp: `read = ${read} sees ${value}. ${compareNote} They are equal, so the answer already has ${keepText} of ${value}. Skip it; write stays at ${write}.`,
					reason: `nums[${look(write)}] through nums[${write - 1}] ${keep === 1 ? "is" : "are all"} ${value} (sorted order), so keeping this one would make ${keep + 1} copies.`,
					invariant,
					action: "discard",
					highlights: [
						{ target: cell(read), kind: "discard" },
						{ target: cell(look(write)), kind: "compare" },
					],
				}),
			);
		}
	}

	const k = write;
	steps.push(
		frame({
			id: "done",
			cells: [...nums],
			pointers: { read: -1, write: k },
			settled: prefix(k),
			stale: Array.from({ length: nums.length - k }, (_, i) => k + i),
			exp: `read has scanned everything. Return k = ${k}; the answer is nums[:${k}] = [${nums.slice(0, k).join(", ")}].`,
			reason: `Values from index ${k} on are leftovers. The problem only checks the first k slots.`,
			invariant,
			action: "confirm",
			k,
			highlights: prefix(k).map((i) => ({ target: cell(i), kind: "confirmed" as const })),
		}),
	);
	return steps;
}

// ---------------------------------------------------------------------------
// 88. Merge Sorted Array — two reads, one write, backward
// ---------------------------------------------------------------------------

export type MergeFrame = ArrayFrame & { second: number[]; secondUsed: number[] };

export function mergeSortedArraySteps(nums1In: number[], m: number, nums2: number[], n: number): MergeFrame[] {
	const nums1 = [...nums1In];
	const steps: MergeFrame[] = [];
	const suffix = (k: number) => Array.from({ length: m + n - 1 - k }, (_, t) => k + 1 + t);
	const invariant = "nums1[k+1:] holds the largest values in final sorted order. Only nums1[:i+1] and nums2[:j+1] are still unread.";
	let i = m - 1;
	let j = n - 1;
	let k = m + n - 1;

	const push = (partial: TeachingFields & { cells: number[]; settled: number[] }) =>
		steps.push({
			...frame({ ...partial, pointers: { i, j, k } }),
			second: [...nums2],
			secondUsed: Array.from({ length: n - 1 - j }, (_, t) => j + 1 + t),
		});

	push({
		id: "start",
		cells: [...nums1],
		settled: [],
		exp: `i = ${i} is the last real value of nums1, j = ${j} the last of nums2, and write pointer k = ${k} the last slot. Fill from the back.`,
		reason: "Writing from the front would overwrite nums1 values that have not been read. The back of nums1 is empty padding, so it is safe to fill first.",
		invariant,
		action: "compare",
		highlights: [
			{ target: ptr("i"), kind: "focus" },
			{ target: ptr("j"), kind: "focus" },
			{ target: ptr("k"), kind: "focus" },
		],
	});

	while (j >= 0) {
		const fromFirst = i >= 0 && nums1[i] > nums2[j];
		const value = fromFirst ? nums1[i] : nums2[j];
		const what =
			i < 0
				? `nums1 has no real values left, so take nums2[${j}] = ${nums2[j]}.`
				: fromFirst
					? `nums1[${i}] = ${nums1[i]} > nums2[${j}] = ${nums2[j]}, so ${nums1[i]} is the largest unread value.`
					: `nums2[${j}] = ${nums2[j]} >= nums1[${i}] = ${nums1[i]}, so take ${nums2[j]}.`;
		nums1[k] = value;
		const wrote = k;
		if (fromFirst) i -= 1;
		else j -= 1;
		k -= 1;
		push({
			id: `write-${wrote}`,
			cells: [...nums1],
			settled: suffix(k),
			exp: `${what} Write it to nums1[${wrote}] and move ${fromFirst ? "i" : "j"} and k left.`,
			reason: "The largest unread value belongs in the last unfilled slot.",
			invariant,
			action: "write",
			highlights: [
				{ target: cell(wrote), kind: "write" },
				// Where the value came from: nums1[i + 1] or nums2[j + 1] after the move.
				{ target: fromFirst ? cell(i + 1) : `second:${j + 1}`, kind: "compare" },
			],
		});
	}

	push({
		id: "done",
		cells: [...nums1],
		settled: Array.from({ length: m + n }, (_, t) => t),
		exp:
			i >= 0
				? `nums2 is used up. nums1[:${i + 1}] was never moved and is already in its final place, so the merge is done.`
				: `Both inputs are used up. nums1 is fully merged.`,
		reason: "Only nums2 values ever need moving once nums1's remaining prefix is smaller than everything written.",
		invariant,
		action: "confirm",
		highlights: Array.from({ length: m + n }, (_, t) => ({ target: cell(t), kind: "confirmed" as const })),
	});
	return steps;
}

// ---------------------------------------------------------------------------
// 1768. Merge Strings Alternately — one pointer per input, then the tail
// ---------------------------------------------------------------------------

export type AlternateFrame = TeachingStep & {
	word1: string;
	word2: string;
	i: number;
	j: number;
	result: string;
	/** Indices of result that came from word2. */
	fromSecond: number[];
};

export function mergeAlternatelySteps(word1: string, word2: string): AlternateFrame[] {
	const steps: AlternateFrame[] = [];
	const invariant = "result is the correct alternating merge of word1[:i] and word2[:j], with i == j until one word runs out.";
	let i = 0;
	let j = 0;
	let result = "";
	const fromSecond: number[] = [];

	const push = (partial: TeachingFields) =>
		steps.push({
			...partial,
			word1,
			word2,
			i,
			j,
			result,
			fromSecond: [...fromSecond],
			highlights: partial.highlights ?? [],
		});

	push({
		id: "start",
		exp: `i reads word1 and j reads word2. result starts empty.`,
		reason: "Each round takes one character from each word, so i and j always move together.",
		invariant,
		action: "compare",
		highlights: [
			{ target: "w1:0", kind: "focus" },
			{ target: "w2:0", kind: "focus" },
		],
	});

	while (i < word1.length && j < word2.length) {
		const a = word1[i];
		const b = word2[j];
		result += a;
		fromSecond.push(result.length);
		result += b;
		i += 1;
		j += 1;
		push({
			id: `pair-${i}`,
			exp: `Append word1[${i - 1}] = "${a}", then word2[${j - 1}] = "${b}". result = "${result}".`,
			reason: "Alternating order means word1's character always comes first within a round.",
			invariant,
			action: "write",
			highlights: [
				{ target: `w1:${i - 1}`, kind: "write" },
				{ target: `w2:${j - 1}`, kind: "write" },
				{ target: `out:${result.length - 2}`, kind: "write" },
				{ target: `out:${result.length - 1}`, kind: "write" },
			],
		});
	}

	const tail1 = word1.slice(i);
	const tail2 = word2.slice(j);
	const tailWord = tail1 ? "word1" : tail2 ? "word2" : "";
	const tail = tail1 || tail2;
	const start = result.length;
	if (tail2) for (let t = 0; t < tail2.length; t++) fromSecond.push(start + t);
	result += tail;
	const tailFrom = tail1 ? i : j;
	if (tail1) i = word1.length;
	if (tail2) j = word2.length;

	push({
		id: "tail",
		exp: tail
			? `${tailWord === "word1" ? "word2" : "word1"} has run out. Append the rest of ${tailWord}, "${tail}", as one block. result = "${result}".`
			: `Both words ran out together, so there is no tail. result = "${result}".`,
		reason: tail
			? "With no characters left to alternate with, the remaining ones keep their order."
			: "Equal lengths alternate all the way to the end.",
		invariant,
		action: "confirm",
		// Highlight only the tail. Marking the whole result "confirmed" would
		// paint every cell green and hide which word each character came from.
		highlights: Array.from({ length: tail.length }, (_, t) => [
			{ target: `${tailWord === "word1" ? "w1" : "w2"}:${tailFrom + t}`, kind: "write" as const },
			{ target: `out:${start + t}`, kind: "focus" as const },
		]).flat(),
	});
	return steps;
}
