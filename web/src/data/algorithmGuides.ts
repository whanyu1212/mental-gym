// Hand-authored teaching guides for algorithm problems.
//
// Keyed by the SAME slug as web/src/data/problems.ts (which is auto-generated).
// scripts/validate_algorithm_guides.py enforces that every problem slug has a
// guide here and that each guide carries all required fields + 3 test kinds.
//
// Teaching content lives HERE, never in problems.ts — keep the generated file
// purely the LeetCode statement + reference solutions.

/** A single worked example used to pressure-test understanding. */
export interface TestCase {
	/**
	 * canonical — the textbook example that shows the happy path.
	 * boundary  — an edge of the input space (empty, single element, max size, all-equal…).
	 * trap      — an input crafted to break a naive/intuitive-but-wrong approach.
	 */
	kind: "canonical" | "boundary" | "trap";
	/** Input shown to the reader, formatted however reads clearest (e.g. "nums = [3,3], target = 6"). */
	input: string;
	/** Expected output for that input (e.g. "[0,1]"). */
	expected: string;
	/** Why this case matters — especially what it catches for `trap`/`boundary`. */
	note: string;
}

/** Uniform complexity annotation so every problem reports it the same way. */
export interface Complexity {
	/** Big-O time, e.g. "O(n)". */
	time: string;
	/** Big-O auxiliary space, e.g. "O(n)" or "O(1)". */
	space: string;
	/** Optional clarification (e.g. "O(1) ignoring the output array"). */
	note?: string;
}

export interface AlgorithmGuide {
	/** Must equal the object's key — the validator double-checks this. */
	slug: string;
	/** The named technique, e.g. "Prefix sum + hashmap". HOW we categorize the problem. */
	pattern: string;
	/** Cues in the prompt that should trigger this pattern. HOW to recognize it. */
	recognitionSignals: string[];
	/** Plain-language restatement of the problem, stripped of LeetCode phrasing. */
	dissection: string;
	/** WHY the approach works — the core idea, in prose. */
	intuition: string;
	/** The loop/structural invariant that stays true each step. */
	invariant: string;
	/**
	 * The slow-but-correct first rung of the ladder: the naive idea in prose plus
	 * its (worse) Big-O, so the optimal complexity below reads as an improvement
	 * rather than appearing from nowhere. Omit when the problem has no
	 * meaningfully simpler approach (design/construction problems).
	 */
	bruteForce?: {
		/** The naive approach in plain language. */
		approach: string;
		/** Its time/space cost — the contrast that motivates optimizing. */
		complexity: Complexity;
	};
	/**
	 * How the input bounds point at the target complexity — the "read the
	 * constraints backward" habit (e.g. "n ≤ 10⁵ rules out O(n²), so we need
	 * O(n log n) or better"). Omit when the prompt states no useful bound.
	 */
	constraintReasoning?: string;
	/** Ordered steps to build the solution. */
	approachSteps: string[];
	/** Uniform time/space annotation (the OPTIMAL rung). */
	complexity: Complexity;
	/** The traps — common mistakes, off-by-ones, wrong assumptions. */
	pitfalls: string[];
	/** Must include >=3 cases covering all three kinds. WHAT to test for. */
	testCases: TestCase[];
	/** Interview follow-up questions worth rehearsing. */
	followUps: string[];
	/** `note.id` slugs of related notes (filenames in ../notes), for cross-linking. */
	relatedNotes: string[];
}

export type AlgorithmGuides = Record<string, AlgorithmGuide>;

export const guides = {
	"1-two-sum": {
		slug: "1-two-sum",
		pattern: "Hashmap complement lookup",
		recognitionSignals: [
			"find two elements that satisfy a target relationship",
			"return indices, not values",
			"brute-force pair scan is O(n²) and the prompt hints at beating it",
		],
		dissection:
			"Walk the array once. For each value, the partner you need is target − value. If you have already seen that partner, you have your answer; otherwise remember the current value so a later element can find it.",
		intuition:
			"A hashmap turns 'has the partner appeared?' from an O(n) scan into an O(1) lookup. You store value → index as you go, so the first time a complement matches you can return both indices immediately.",
		invariant:
			"At the start of iteration i, the map holds every value before index i mapped to its index, and none of those pairs summed to target.",
		bruteForce: {
			approach:
				"Check every pair with two nested loops: for each i, scan every j > i and test nums[i] + nums[j] == target. Correct, but you re-scan the tail for every element.",
			complexity: { time: "O(n²)", space: "O(1)", note: "n(n−1)/2 pair checks, no extra storage." },
		},
		constraintReasoning:
			"With n ≤ 10⁴, the O(n²) pair scan (~10⁸ ops) would still squeak under a typical time limit — so brute force isn't 'wrong', it's just leaving free performance on the table. Trading O(n) space for a hashmap drops it to one pass, which is the answer interviewers want.",
		approachSteps: [
			"Create an empty map seen: value → index.",
			"For each (i, value), compute complement = target − value.",
			"If complement is in seen, return [seen[complement], i].",
			"Otherwise store seen[value] = i and continue.",
		],
		complexity: { time: "O(n)", space: "O(n)", note: "One pass; the map holds at most n entries." },
		pitfalls: [
			"Storing the value as the key but needing the index back — map value→index, not index→value.",
			"Using the same element twice: check the complement BEFORE inserting the current value.",
			"Returning values instead of indices.",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", note: "Partner found later in the array." },
			{ kind: "boundary", input: "nums = [3,3], target = 6", expected: "[0,1]", note: "Two equal values — the check-before-insert order is what makes this work." },
			{ kind: "trap", input: "nums = [3,2,4], target = 6", expected: "[1,2]", note: "3+3 is tempting but reuses one element; the real pair is 2+4." },
		],
		followUps: [
			"What if the array is sorted? (two-pointer, O(1) extra space — see #167)",
			"What if multiple valid pairs exist and you must return all of them?",
		],
		relatedNotes: ["arrays_and_hashing", "python-big-o-cheatsheet"],
	},

	"217-contains-duplicate": {
		slug: "217-contains-duplicate",
		pattern: "Set membership / dedup by size",
		recognitionSignals: [
			"'are there any duplicates' — a yes/no existence question",
			"order does not matter",
			"only presence, not position or count, is asked",
		],
		dissection:
			"Decide whether any value repeats. You do not need where or how many — just whether the count of distinct values is smaller than the array length.",
		intuition:
			"A set discards duplicates by construction, so if building a set shrinks the length at all, a duplicate existed. len(nums) != len(set(nums)) answers the question in one expression.",
		invariant:
			"A set of seen values contains exactly the distinct elements encountered so far; its size equals the count of unique values.",
		bruteForce: {
			approach:
				"Compare every pair with two nested loops, returning True the moment nums[i] == nums[j] for some i < j. No extra memory, but quadratic time.",
			complexity: { time: "O(n²)", space: "O(1)", note: "Up to n(n−1)/2 comparisons." },
		},
		constraintReasoning:
			"Here n can reach 10⁵, so the O(n²) pair scan (~10¹⁰ ops) would blow the time limit outright — unlike two-sum's smaller bound, the constraint genuinely forbids brute force. Spending O(n) space on a set to buy O(n) time is the required trade, not a luxury.",
		approachSteps: [
			"Build a set from nums.",
			"Compare its length to len(nums).",
			"They differ iff at least one duplicate exists.",
		],
		complexity: { time: "O(n)", space: "O(n)", note: "Set construction is linear; early-exit streaming is also possible." },
		pitfalls: [
			"Sorting first (O(n log n)) when a set gives O(n).",
			"Assuming the input is non-empty — an empty array has no duplicates.",
			"For a streaming/early-exit variant, forgetting to return True the moment a repeat is seen.",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [1,2,3,1]", expected: "true", note: "1 repeats." },
			{ kind: "boundary", input: "nums = [1,2,3,4]", expected: "false", note: "All distinct — set size equals length." },
			{ kind: "trap", input: "nums = []", expected: "false", note: "Empty input must not be reported as having duplicates." },
		],
		followUps: [
			"Solve with O(1) extra space (sort in place, then scan adjacent pairs).",
			"Contains Duplicate II/III: duplicates within an index or value window.",
		],
		relatedNotes: ["arrays_and_hashing", "python_builtins_for_leetcode"],
	},

	"347-top-k-frequent-elements": {
		slug: "347-top-k-frequent-elements",
		pattern: "Frequency map + sort (bucket sort as the optimal follow-up)",
		recognitionSignals: [
			"'k most frequent' — ranking by count",
			"answer size is bounded by k, not n",
			"counts are the sort key, not the values themselves",
		],
		dissection:
			"Count how often each value appears, then return the k values with the highest counts. The shown solution pairs each count with its value, sorts descending, and takes the first k.",
		intuition:
			"Once you have a frequency map, the problem is just 'top k by count.' Sorting count→value pairs is the most direct expression; bucket sort by frequency removes the log factor since counts are bounded by n.",
		invariant:
			"After counting, the map holds value → exact frequency; after sorting, pairs are ordered by non-increasing count.",
		bruteForce: {
			approach:
				"Count frequencies, then build the answer by repeatedly scanning the whole count map for the current maximum, emitting it, and removing it — k times.",
			complexity: { time: "O(n·k)", space: "O(n)", note: "Each of k extractions linearly scans up to n distinct counts." },
		},
		constraintReasoning:
			"k is bounded by the number of distinct values (≤ n), so O(n·k) degrades toward O(n²) when k is large — fine for tiny k, dangerous otherwise. Sorting the pairs is an unconditional O(n log n); bucket-sorting by frequency (counts live in 0..n) reaches O(n) because the key range is bounded.",
		approachSteps: [
			"Build counter: value → frequency.",
			"Materialize [count, value] pairs.",
			"Sort pairs in descending order.",
			"Take values from the first k pairs.",
		],
		complexity: {
			time: "O(n log n)",
			space: "O(n)",
			note: "The shown sort-based solution is O(n log n); bucket sort achieves O(n).",
		},
		pitfalls: [
			"Sorting the values instead of by frequency.",
			"Breaking ties incorrectly when several values share the boundary frequency — any valid set of k is accepted, but you must still stop at exactly k.",
			"Assuming k ≤ number of distinct values without reading constraints.",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [1,1,1,2,2,3], k = 2", expected: "[1,2]", note: "Counts 3,2,1 → top two are 1 and 2." },
			{ kind: "boundary", input: "nums = [1], k = 1", expected: "[1]", note: "Single element, k equals the distinct count." },
			{ kind: "trap", input: "nums = [3,0,1,0], k = 1", expected: "[0]", note: "0 has the highest count (2); a naive 'first seen' or value-sort would miss it." },
		],
		followUps: [
			"Achieve O(n) with bucket sort indexed by frequency.",
			"Use a size-k heap to get O(n log k) when k ≪ n.",
		],
		relatedNotes: ["arrays_and_hashing", "python-big-o-cheatsheet"],
	},

	"128-longest-consecutive-sequence": {
		slug: "128-longest-consecutive-sequence",
		pattern: "Hashset + sequence-start detection",
		recognitionSignals: [
			"'longest consecutive run' but order in the array is irrelevant",
			"O(n) demanded, so sorting (O(n log n)) is disqualified",
			"membership tests dominate the work",
		],
		dissection:
			"Find the length of the longest run of consecutive integers, treating the array as an unordered bag. Put everything in a set, then only start counting from values that begin a run (no predecessor present).",
		intuition:
			"If num−1 is also in the set, num is in the middle of some run and counting from it would be wasted work. By only expanding from run-starts, each element is visited at most twice total, giving O(n).",
		invariant:
			"A walk is launched only from a value with no predecessor in the set; that walk extends as long as successive +1 values are present.",
		bruteForce: {
			approach:
				"Sort the array, then sweep once counting consecutive runs (skipping duplicates). Simple and correct, but the sort dominates.",
			complexity: { time: "O(n log n)", space: "O(1)", note: "Or O(n) if the sort isn't in place; the log factor is the cost." },
		},
		constraintReasoning:
			"The problem explicitly demands O(n), which is a direct signal that sorting (O(n log n)) is disqualified — the intended solution must avoid comparison-based ordering. That points straight at a hashset, where membership is O(1) and the run-start trick keeps total work linear.",
		approachSteps: [
			"Insert all numbers into a set (dedups automatically).",
			"For each value, skip it unless value−1 is absent (i.e. it starts a run).",
			"From a run-start, increment length while value+length is in the set.",
			"Track the maximum run length seen.",
		],
		complexity: { time: "O(n)", space: "O(n)", note: "Each element is the inner-loop target at most once across all runs." },
		pitfalls: [
			"Not deduping — duplicates would otherwise inflate or re-walk runs (the set handles this).",
			"Walking from every element instead of only run-starts, degrading to O(n²).",
			"Off-by-one in the while condition (value+length vs value+length−1).",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [2,20,4,10,3,4,5]", expected: "4", note: "Run 2,3,4,5 has length 4 despite a duplicate 4." },
			{ kind: "boundary", input: "nums = []", expected: "0", note: "No elements → length 0." },
			{ kind: "trap", input: "nums = [0,3,2,5,4,6,1,1]", expected: "7", note: "Duplicate 1 and scrambled order; the run 0..6 is length 7." },
		],
		followUps: [
			"Reconstruct the actual sequence, not just its length.",
			"Why is this O(n) and not O(n²)? Justify with the run-start argument.",
		],
		relatedNotes: ["arrays_and_hashing", "time-complexity"],
	},

	"242-valid-anagram": {
		slug: "242-valid-anagram",
		pattern: "Frequency-count comparison",
		recognitionSignals: [
			"'anagram' / 'rearrangement' of characters",
			"same multiset of characters, order irrelevant",
			"comparison of two strings' contents",
		],
		dissection:
			"Two strings are anagrams iff each character occurs the same number of times in both. Count characters in each and compare the two count maps.",
		intuition:
			"Anagram ≡ identical character multisets. A dict of counts captures the multiset exactly, and dict equality compares them in one step — no sorting needed.",
		invariant:
			"After scanning a string, its count map holds the exact frequency of every character seen so far.",
		bruteForce: {
			approach:
				"Sort both strings and compare them character-by-character — anagrams produce identical sorted strings.",
			complexity: { time: "O(n log n)", space: "O(n)", note: "Dominated by the two sorts." },
		},
		constraintReasoning:
			"String lengths reach ~5·10⁴, so even the O(n log n) sort comfortably passes — brute force isn't a TLE risk here. Counting characters is the improvement because it's strictly O(n) and sidesteps sorting entirely; the win is elegance and the O(1)-alphabet space claim, not survival.",
		approachSteps: [
			"If lengths differ, return False immediately (cheap reject).",
			"Build a frequency dict for s and another for t.",
			"Return whether the two dicts are equal.",
		],
		complexity: { time: "O(n)", space: "O(1)", note: "Space is O(1) for a fixed alphabet (26 letters); O(k) for k distinct chars in general." },
		pitfalls: [
			"Skipping the length check, then mis-handling differing lengths.",
			"Comparing sorted strings (O(n log n)) when counts give O(n).",
			"Unicode: 'fixed 26-letter array' breaks if inputs aren't lowercase a–z.",
		],
		testCases: [
			{ kind: "canonical", input: 's = "anagram", t = "nagaram"', expected: "true", note: "Same letters, same counts." },
			{ kind: "boundary", input: 's = "", t = ""', expected: "true", note: "Two empty strings are trivially anagrams." },
			{ kind: "trap", input: 's = "rat", t = "car"', expected: "false", note: "Same length, overlapping letters, but counts differ." },
		],
		followUps: [
			"Unicode inputs — can you still claim O(1) space?",
			"Group many strings by anagram class (see #49).",
		],
		relatedNotes: ["arrays_and_hashing", "python_builtins_for_leetcode"],
	},

	"49-group-anagrams": {
		slug: "49-group-anagrams",
		pattern: "Canonical key bucketing",
		recognitionSignals: [
			"'group' items that are equivalent under some transformation",
			"anagrams share an invariant (their letter counts)",
			"output is a partition into equivalence classes",
		],
		dissection:
			"Cluster strings that are anagrams of each other. Give each string a canonical key that is identical for anagrams — a 26-length letter-count tuple — and bucket strings under that key.",
		intuition:
			"If two strings have the same canonical key, they belong together. A count tuple is an O(word) key (vs O(word log word) for a sorted-string key), and a defaultdict(list) collects buckets without existence checks.",
		invariant:
			"Each map key is a unique letter-count signature; its bucket holds exactly the strings whose letters match that signature.",
		bruteForce: {
			approach:
				"Use the sorted string as each group's key: sort every word's letters and bucket by that sorted string. Correct, but each key costs a sort.",
			complexity: { time: "O(n·k log k)", space: "O(n·k)", note: "n words of length up to k; the per-word sort adds the log k factor." },
		},
		constraintReasoning:
			"With up to ~10⁴ words of length ≤ 100, both keying schemes pass — this isn't a TLE story. The count-tuple key is the upgrade because it builds each key in O(k) instead of O(k log k), dropping the log factor that the sorted-string key carries for free.",
		approachSteps: [
			"Create result = defaultdict(list).",
			"For each string, build a 26-slot count array via ord(c) − ord('a').",
			"Use tuple(count) as the dict key and append the string to that bucket.",
			"Return the list of buckets.",
		],
		complexity: { time: "O(n·k)", space: "O(n·k)", note: "n strings of length up to k; count-key avoids the log factor a sorted key would add." },
		pitfalls: [
			"Using a list as a dict key (unhashable) — convert to a tuple.",
			"Sorted-string keys work but cost O(k log k) per string.",
			"Forgetting that the empty string is its own valid group.",
		],
		testCases: [
			{ kind: "canonical", input: 'strs = ["eat","tea","tan","ate","nat","bat"]', expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]', note: "Three anagram classes (order of groups is free)." },
			{ kind: "boundary", input: 'strs = [""]', expected: '[[""]]', note: "Single empty string → one group." },
			{ kind: "trap", input: 'strs = ["a"]', expected: '[["a"]]', note: "Single char must not be split or dropped." },
		],
		followUps: [
			"Compare count-tuple keys vs sorted-string keys — when does each win?",
			"Stream a huge list: can you bound memory?",
		],
		relatedNotes: ["arrays_and_hashing", "python_builtins_for_leetcode"],
	},

	"238-product-of-array-except-self": {
		slug: "238-product-of-array-except-self",
		pattern: "Prefix × suffix products",
		recognitionSignals: [
			"'product/sum of all except self'",
			"division is forbidden (or zeros make it unsafe)",
			"each output depends on everything to the left and right",
		],
		dissection:
			"For each index, output the product of every other element. Compute running products from the left, then multiply in running products from the right — no division.",
		intuition:
			"answer[i] = (product of everything left of i) × (product of everything right of i). Two passes — left-to-right filling prefixes, right-to-left folding in suffixes — give O(n) time and O(1) extra space (the output array doesn't count).",
		invariant:
			"After pass 1, result[i] holds the product of all elements strictly left of i. After pass 2, it also includes all elements strictly right of i.",
		bruteForce: {
			approach:
				"For each index i, loop over the whole array multiplying every element except nums[i]. The obvious double loop, no division.",
			complexity: { time: "O(n²)", space: "O(1)", note: "n inner products of length n−1." },
		},
		constraintReasoning:
			"The prompt bans division and asks for O(n) — two constraints that together rule out both the O(n²) double loop and the tempting 'divide the total product by nums[i]' shortcut (which also dies on zeros). That pincer is the signal to precompute prefix and suffix products in two linear passes.",
		approachSteps: [
			"Initialize result = [1]·n.",
			"Left pass: result[i] = prefix; prefix *= nums[i].",
			"Right pass: result[i] *= postfix; postfix *= nums[i].",
			"Return result.",
		],
		complexity: { time: "O(n)", space: "O(1)", note: "Excludes the output array; no division used." },
		pitfalls: [
			"Initializing result to 0 — it must be 1 (multiplicative identity).",
			"Using division — breaks on any zero and is often disallowed.",
			"Mishandling zeros: one zero ⇒ only its index is nonzero; two+ zeros ⇒ all zero.",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [1,2,4,6]", expected: "[48,24,12,8]", note: "Standard prefix×suffix." },
			{ kind: "boundary", input: "nums = [5,2]", expected: "[2,5]", note: "Two elements — each is just the other." },
			{ kind: "trap", input: "nums = [1,0,3,4]", expected: "[0,12,0,0]", note: "A single zero: only the zero's own index gets the product of the rest." },
		],
		followUps: [
			"Handle two or more zeros — verify the all-zero result.",
			"If division were allowed, what edge case still bites you?",
		],
		relatedNotes: ["arrays_and_hashing", "prefix_sum_pattern"],
	},

	"271-encode-and-decode-strings": {
		slug: "271-encode-and-decode-strings",
		pattern: "Length-prefixed serialization",
		recognitionSignals: [
			"serialize a list of strings into one string and back",
			"any delimiter could legally appear inside the payload",
			"must be unambiguous regardless of contents",
		],
		dissection:
			"Join a list of strings into a single string so it can be split back exactly. Prefix each string with its length and a sentinel (len + '#' + s); on decode, read the length, then take exactly that many characters.",
		intuition:
			"A bare delimiter fails because the delimiter can occur inside a string. Encoding the *length* makes decoding deterministic: you never scan for a separator inside the payload — you read the count and jump.",
		invariant:
			"During decode, the cursor always sits at the first digit of a length header; after reading 'len#', the next len characters are exactly one original string.",
		approachSteps: [
			"Encode: for each s, append str(len(s)) + '#' + s.",
			"Decode: read digits until '#' to get the length.",
			"Slice the next 'length' characters as one string.",
			"Advance the cursor and repeat until the end.",
		],
		complexity: { time: "O(total chars)", space: "O(total chars)", note: "Both encode and decode are linear in the combined string length." },
		pitfalls: [
			"Using a plain delimiter (e.g. ',') that can appear in the data — ambiguous.",
			"Reading the length as a single character instead of all digits (breaks for len ≥ 10).",
			"Off-by-one around the '#': the payload starts after it.",
		],
		testCases: [
			{ kind: "canonical", input: 'encode(["neet","code"])', expected: '"4#neet4#code"', note: "Length headers make boundaries explicit." },
			{ kind: "boundary", input: 'encode([""])', expected: '"0#"', note: "Empty string encodes as a zero-length header." },
			{ kind: "trap", input: 'roundtrip(["co#de","x"])', expected: '["co#de","x"]', note: "'#' inside the payload must NOT be treated as a delimiter — length-prefix handles it." },
		],
		followUps: [
			"Multi-digit lengths — confirm decode reads the full number.",
			"How would you serialize a nested structure (lists of lists)?",
		],
		relatedNotes: ["arrays_and_hashing"],
	},

	"1929-concatenation-of-array": {
		slug: "1929-concatenation-of-array",
		pattern: "Index-offset array construction",
		recognitionSignals: [
			"build ans of length 2n where ans[i] == ans[i+n] == nums[i]",
			"deliberately simple — tests clean index arithmetic",
			"no algorithmic trick required",
		],
		dissection:
			"Produce nums concatenated with itself. Preallocate a 2n array and write each value into both position i and position i+n in one pass.",
		intuition:
			"You can either append twice or, more explicitly, place nums[i] at index i and i+n. Preallocating avoids repeated resizing and makes the offset relationship obvious.",
		invariant:
			"After processing index i, slots i and i+n both equal nums[i].",
		approachSteps: [
			"Allocate ans of length 2·len(nums).",
			"For each i, set ans[i] = nums[i] and ans[i + n] = nums[i].",
			"Return ans.",
		],
		complexity: { time: "O(n)", space: "O(n)", note: "Output is size 2n; single pass." },
		pitfalls: [
			"Off-by-one in the second index (i + n, not i + n − 1).",
			"Mutating nums in place instead of building a new array.",
			"Overcomplicating what is essentially nums + nums.",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [1,2,1]", expected: "[1,2,1,1,2,1]", note: "Each value mirrored n positions later." },
			{ kind: "boundary", input: "nums = [7]", expected: "[7,7]", note: "Single element doubles." },
			{ kind: "trap", input: "nums = [1,2,3]", expected: "[1,2,3,1,2,3]", note: "A reversed-second-half approach (nums + nums[::-1]) would give [1,2,3,3,2,1] — the second half must preserve order, not reverse it." },
		],
		followUps: ["Do it as a one-liner (nums + nums) and discuss readability vs explicitness."],
		relatedNotes: ["arrays_and_hashing"],
	},

	"169-majority-element": {
		slug: "169-majority-element",
		pattern: "Frequency tracking (Boyer-Moore as the O(1)-space follow-up)",
		recognitionSignals: [
			"an element appears more than ⌊n/2⌋ times — guaranteed to exist",
			"return the single dominant value",
			"hint toward O(1) extra space",
		],
		dissection:
			"Find the value that occupies more than half the array. The shown solution counts occurrences and tracks the running max-count value; Boyer-Moore voting does it in O(1) space.",
		intuition:
			"A strict majority (> n/2) survives any pairwise cancellation of distinct values — that's the basis of Boyer-Moore. The shown count-and-track version is simpler: keep the value whose running count is highest.",
		invariant:
			"res always holds the value with the highest count seen so far; max_count is that count.",
		bruteForce: {
			approach:
				"Count every value in a hashmap, then return the key whose count exceeds n/2. Dead simple, but it stores a count for every distinct value.",
			complexity: { time: "O(n)", space: "O(n)", note: "Linear time already — the cost is the O(n) map." },
		},
		constraintReasoning:
			"Time is already optimal at O(n); the interesting bound is the follow-up's O(1)-space demand. The 'strict majority survives pairwise cancellation' guarantee is what lets Boyer-Moore voting drop the map entirely — the constraint pushes you from a counting solution to a single-candidate one.",
		approachSteps: [
			"Maintain count_dict and (res, max_count).",
			"For each num, increment its count.",
			"If its count exceeds max_count, update res and max_count.",
			"Return res.",
		],
		complexity: { time: "O(n)", space: "O(n)", note: "Boyer-Moore voting reduces space to O(1)." },
		pitfalls: [
			"Assuming the input could have no majority — the problem guarantees one exists.",
			"With Boyer-Moore, forgetting the cancellation logic (count hits 0 ⇒ adopt new candidate).",
			"Returning the count instead of the element.",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [2,2,1,1,1,2,2]", expected: "2", note: "2 appears 4 of 7 times." },
			{ kind: "boundary", input: "nums = [3]", expected: "3", note: "Single element is trivially the majority." },
			{ kind: "trap", input: "nums = [1,2,1,2,1]", expected: "1", note: "Near-even split; 1 has 3 of 5 — Boyer-Moore must not be fooled by interleaving." },
		],
		followUps: [
			"Implement Boyer-Moore voting for O(1) space.",
			"Generalize to elements appearing > n/3 times (see #229).",
		],
		relatedNotes: ["arrays_and_hashing"],
	},

	"229-majority-element-ii": {
		slug: "229-majority-element-ii",
		pattern: "Boyer-Moore voting, generalized to ⌊n/3⌋",
		recognitionSignals: [
			"elements appearing more than ⌊n/3⌋ times",
			"there can be at most two such elements",
			"O(1)-space follow-up after the obvious hashmap count",
		],
		dissection:
			"Return all values occurring more than n/3 times. At most two can qualify. The hashmap solution counts then filters; Boyer-Moore tracks two candidates and verifies them.",
		intuition:
			"Since more than n/3 means at most two winners, generalized Boyer-Moore keeps two (candidate, count) slots, cancelling in groups of three distinct values. A final verification pass is mandatory — the voting only proposes candidates.",
		invariant:
			"At any point the two slots hold the current best two candidates; a value matching neither either claims an empty slot or decrements both counts.",
		bruteForce: {
			approach:
				"Count all values in a hashmap, then filter for those with count > n/3. Obvious and correct, but uses O(n) auxiliary space.",
			complexity: { time: "O(n)", space: "O(n)", note: "Linear time; the map is the space cost the follow-up wants gone." },
		},
		constraintReasoning:
			"The '> n/3' threshold caps the answer at two values (three disjoint values each exceeding n/3 would total > n) — that algebraic bound is exactly what makes two candidate slots sufficient for O(1) space. The constraint on the *count* dictates the number of slots.",
		approachSteps: [
			"Phase 1: track (c1,count1),(c2,count2); match → increment, empty slot → adopt, else decrement both.",
			"Phase 2: recount c1 and c2 over the array.",
			"Return those whose true count exceeds ⌊n/3⌋.",
		],
		complexity: { time: "O(n)", space: "O(1)", note: "Two candidate slots; the hashmap variant is O(n) space." },
		pitfalls: [
			"Skipping the verification pass — candidates aren't guaranteed to qualify.",
			"Using `elif` ordering wrong so a value increments a count AND adopts a slot.",
			"Returning duplicates when c1 == c2 (guard the slots).",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [1,1,1,2,2,2,3]", expected: "[1,2]", note: "Both 1 and 2 exceed 7/3 ≈ 2." },
			{ kind: "boundary", input: "nums = [1,2]", expected: "[1,2]", note: "Tiny array: both exceed 2/3 ≈ 0." },
			{ kind: "trap", input: "nums = [1,2,3]", expected: "[]", note: "No value exceeds 3/3 = 1 — verification pass must reject all candidates." },
		],
		followUps: [
			"Why is the cap exactly two candidates for n/3? Generalize to n/k.",
			"Prove the verification pass is necessary with a counterexample.",
		],
		relatedNotes: ["arrays_and_hashing"],
	},

	"14-longest-common-prefix": {
		slug: "14-longest-common-prefix",
		pattern: "Vertical (column-wise) scanning",
		recognitionSignals: [
			"common prefix shared by ALL strings",
			"answer length is bounded by the shortest string",
			"character-by-character agreement across the set",
		],
		dissection:
			"Find the longest prefix common to every string. Scan column by column: at each character position, if all strings agree, keep that character; the first disagreement ends the prefix.",
		intuition:
			"zip(*strs) gives you each column as a tuple of characters. If set(column) has size 1, every string shares that character; the moment it has more than one distinct char, the common prefix is complete. zip also stops automatically at the shortest string.",
		invariant:
			"output holds a prefix that every string shares; each accepted column added exactly one universally-agreed character.",
		approachSteps: [
			"Iterate columns via zip(*strs).",
			"For each column tuple, compute set(tuple).",
			"If the set has one element, append it to output; else break.",
			"Return output.",
		],
		complexity: { time: "O(S)", space: "O(1)", note: "S = total characters; zip stops at the shortest string, output excluded from space." },
		pitfalls: [
			"Empty input list — zip yields nothing, output stays '' (verify this is desired).",
			"An empty string in the list forces an immediate empty prefix (shortest = 0).",
			"Indexing past the shortest string if you scan by index instead of zip.",
		],
		testCases: [
			{ kind: "canonical", input: 'strs = ["flower","flow","flight"]', expected: '"fl"', note: "Columns f,l agree; third column o/o/i disagrees." },
			{ kind: "boundary", input: "strs = []", expected: '""', note: "Empty list — zip yields nothing, output stays '' (the pitfall case)." },
			{ kind: "trap", input: 'strs = ["dog","racecar","car"]', expected: '""', note: "First column already disagrees → empty prefix, not a crash." },
		],
		followUps: [
			"Binary-search the prefix length for O(S log m).",
			"Divide and conquer across the string list.",
		],
		relatedNotes: ["arrays_and_hashing", "python_builtins_for_leetcode"],
	},

	"36-valid-sudoku": {
		slug: "36-valid-sudoku",
		pattern: "Set-per-constraint validation",
		recognitionSignals: [
			"validate a grid against row/column/box rules",
			"checking existing entries, NOT solving",
			"the 3×3 box index is the (r//3, c//3) trick",
		],
		dissection:
			"Decide whether the filled cells violate Sudoku rules. Keep a set of seen digits per row, per column, and per 3×3 box; a digit is invalid if it already appears in any of its three constraints.",
		intuition:
			"Each filled digit must be unique within three groups simultaneously. Three dictionaries of sets — keyed by row, column, and (r//3, c//3) box — let you check and record membership in O(1) per cell, one pass over the grid.",
		invariant:
			"After visiting a cell, each set contains exactly the digits placed so far in that row / column / box, all of which were unique on insertion.",
		approachSteps: [
			"Create rowset, colset, squareset as defaultdict(set).",
			"For each cell, skip '.'.",
			"If the digit is already in rowset[r], colset[c], or squareset[(r//3, c//3)], return False.",
			"Otherwise add it to all three sets; return True at the end.",
		],
		complexity: { time: "O(1)", space: "O(1)", note: "Fixed 9×9 grid — constant work and storage (or O(n²) framed by board side n)." },
		pitfalls: [
			"Trying to SOLVE the board instead of validating it.",
			"Wrong box key — it's (r//3, c//3), not (r%3, c%3).",
			"Counting '.' as a digit, or adding before checking.",
		],
		testCases: [
			{ kind: "canonical", input: 'board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]', expected: "true", note: "Standard LeetCode valid board — no row/column/box repeats." },
			{ kind: "boundary", input: 'board = [[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."]]', expected: "true", note: "No filled cells ⇒ no violations possible." },
			{ kind: "trap", input: 'board = [["5",".",".",".",".",".",".",".","."],[".",".","5",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."]]', expected: "false", note: "Two 5s in the top-left 3×3 box at (0,0) and (1,2) — different row and column, so only the box set catches it." },
		],
		followUps: [
			"Validate in a single set with composite keys like ('r',i,d).",
			"Extend toward an actual solver (backtracking).",
		],
		relatedNotes: ["arrays_and_hashing"],
	},

	"75-sort-colors": {
		slug: "75-sort-colors",
		pattern: "Dutch National Flag (three-pointer partition)",
		recognitionSignals: [
			"only three distinct values (0,1,2)",
			"sort in place, ideally one pass, O(1) space",
			"partition into three contiguous regions",
		],
		dissection:
			"Sort an array of 0s, 1s, and 2s in place. The optimal approach uses three pointers to partition the array into [0s | 1s | unprocessed | 2s], shrinking the unknown region to nothing.",
		intuition:
			"With only three values you don't need comparison sorting. low/mid/high pointers maintain three sorted regions; mid scans forward, swapping 0s to the front and 2s to the back, so one pass fully sorts. (A heap sort also works but is O(n log n) and not single-pass.)",
		invariant:
			"nums[0..low-1] are all 0, nums[low..mid-1] are all 1, nums[mid..high] are unprocessed, nums[high+1..] are all 2.",
		bruteForce: {
			approach:
				"Counting sort in two passes: tally how many 0s, 1s, 2s there are, then overwrite the array with that many of each. Correct and O(n), but it reads the data twice.",
			complexity: { time: "O(n)", space: "O(1)", note: "Two passes over the array; constant extra storage." },
		},
		constraintReasoning:
			"Time is already O(n) — comparison sorting (O(n log n)) is overkill once you notice only three distinct values. The follow-up's 'single pass' demand is what forces the Dutch-flag three-pointer partition over the simpler two-pass count, since one pass leaves no room to tally first.",
		approachSteps: [
			"Set low = mid = 0, high = n−1.",
			"While mid ≤ high: if nums[mid]==0 swap with low, advance both; if ==1 advance mid; if ==2 swap with high and decrement high (do NOT advance mid).",
			"Stop when mid passes high.",
		],
		complexity: { time: "O(n)", space: "O(1)", note: "Single in-place pass; the shown heapify variant is O(n log n)." },
		pitfalls: [
			"Advancing mid after a swap-with-high — the swapped-in value is unprocessed and must be re-examined.",
			"A two-pass counting sort works but isn't the single-pass answer interviewers want.",
			"Forgetting the array is modified in place (no return value).",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [2,0,2,1,1,0]", expected: "[0,0,1,1,2,2]", note: "Mixed values partition cleanly." },
			{ kind: "boundary", input: "nums = [0]", expected: "[0]", note: "Single element — already sorted." },
			{ kind: "trap", input: "nums = [2,0,1]", expected: "[0,1,2]", note: "After swapping the leading 2 to the back, mid must NOT advance or the 0 swapped in is skipped." },
		],
		followUps: [
			"Why must mid stay put after a high-swap but advance after a low-swap?",
			"Generalize to k colors (counting sort).",
		],
		relatedNotes: ["arrays_and_hashing", "two_pointers"],
	},

	"560-subarray-sum-equals-k": {
		slug: "560-subarray-sum-equals-k",
		pattern: "Prefix sum + hashmap of counts",
		recognitionSignals: [
			"count/with contiguous subarrays summing to k",
			"negative numbers allowed (so sliding window fails)",
			"O(n) expected despite O(n²) subarray pairs",
		],
		dissection:
			"Count contiguous subarrays whose sum equals k. A subarray (i, j] sums to k iff prefix[j] − prefix[i] = k, i.e. prefix[i] = prefix[j] − k. Track how many times each prefix sum has occurred.",
		intuition:
			"Running prefix sums turn 'subarray sum = k' into 'have I seen prefix_sum − k before?'. A hashmap of prefix-sum → frequency answers that in O(1), and seeding {0:1} accounts for subarrays starting at index 0. Negatives are fine because we never assume monotonic growth (which is why sliding window can't be used).",
		invariant:
			"prefix_count holds, for every prefix sum encountered before the current index, how many times it occurred; count accumulates valid subarrays ending at or before the current index.",
		bruteForce: {
			approach:
				"Try every (i, j) subarray and sum it — either re-adding from scratch (O(n³)) or carrying a running sum for each start (O(n²)). Correct, but it re-derives sums the prefix trick caches.",
			complexity: { time: "O(n²)", space: "O(1)", note: "n starts × up to n ends, running sum per start." },
		},
		constraintReasoning:
			"n reaches ~2·10⁴, so O(n²) (~4·10⁸) is borderline-to-TLE — the prompt wants O(n). The presence of negative numbers also rules out a sliding window (sums aren't monotonic), which leaves prefix-sum-frequency as the only linear option.",
		approachSteps: [
			"Initialize prefix_count = {0: 1}, prefix_sum = 0, count = 0.",
			"For each num: prefix_sum += num.",
			"count += prefix_count.get(prefix_sum − k, 0).",
			"Increment prefix_count[prefix_sum]; return count.",
		],
		complexity: { time: "O(n)", space: "O(n)", note: "One pass; map holds up to n distinct prefix sums." },
		pitfalls: [
			"Forgetting the {0:1} seed — misses subarrays that start at index 0.",
			"Reaching for a sliding window — it's invalid with negative numbers.",
			"Updating the map BEFORE querying it (would count length-0 subarrays).",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [1,1,1], k = 2", expected: "2", note: "[1,1] at indices 0–1 and 1–2." },
			{ kind: "boundary", input: "nums = [1], k = 0", expected: "0", note: "No subarray sums to 0." },
			{ kind: "trap", input: "nums = [1,-1,1,-1], k = 0", expected: "4", note: "Negatives create multiple zero-sum subarrays; a window approach would undercount." },
		],
		followUps: [
			"Why does the {0:1} initialization matter — show the subarray it captures.",
			"Adapt to count subarrays with a given XOR (see #1310).",
		],
		relatedNotes: ["prefix_sum_pattern", "arrays_and_hashing"],
	},

	"1310-xor-queries-of-a-subarray": {
		slug: "1310-xor-queries-of-a-subarray",
		pattern: "Prefix XOR (self-inverse prefix sums)",
		recognitionSignals: [
			"many range queries over a static array",
			"the operation is XOR (associative AND self-inverse)",
			"per-query O(1) after preprocessing",
		],
		dissection:
			"Answer many 'XOR of arr[l..r]' queries. Build a prefix-XOR array where prefix[i] = arr[0]^…^arr[i−1]; then XOR(l..r) = prefix[r+1] ^ prefix[l].",
		intuition:
			"XOR is its own inverse (a^a = 0), so the shared prefix cancels: prefix[r+1] ^ prefix[l] leaves exactly arr[l]^…^arr[r]. One linear preprocessing pass makes every query O(1) — the same trick as prefix sums, with XOR as the group operation.",
		invariant:
			"prefix[i] equals the XOR of the first i elements; prefix[0] = 0 is the XOR identity.",
		bruteForce: {
			approach:
				"Answer each query independently by XOR-ing arr[l..r] in a loop. No preprocessing, but every query re-walks its whole range.",
			complexity: { time: "O(n·q)", space: "O(1)", note: "q queries, each up to O(n) work." },
		},
		constraintReasoning:
			"Both n and q reach ~3·10⁴, so O(n·q) (~10⁹) risks TLE — the 'many queries on a static array' shape is the canonical signal to preprocess once and answer in O(1). XOR being self-inverse (a^a=0) is what makes the prefix cancellation work.",
		approachSteps: [
			"Allocate prefix of length n+1 with prefix[0] = 0.",
			"For i in 0..n−1: prefix[i+1] = prefix[i] ^ arr[i].",
			"For each [l, r]: answer = prefix[r+1] ^ prefix[l].",
		],
		complexity: { time: "O(n + q)", space: "O(n)", note: "n-element preprocessing, O(1) per query, q queries." },
		pitfalls: [
			"Index alignment: range [l,r] maps to prefix[r+1] ^ prefix[l], not prefix[r] ^ prefix[l].",
			"Forgetting prefix[0] = 0 (the XOR identity) — breaks queries with l = 0.",
			"Recomputing each query in O(r−l) instead of using the prefix array.",
		],
		testCases: [
			{ kind: "canonical", input: "arr = [1,3,4,8], queries = [[0,1],[1,2],[0,3],[3,3]]", expected: "[2,7,14,8]", note: "Each query resolves via prefix XOR." },
			{ kind: "boundary", input: "arr = [4,8], queries = [[0,0],[1,1]]", expected: "[4,8]", note: "Single-element ranges return the element itself." },
			{ kind: "trap", input: "arr = [0,0,0], queries = [[0,2]]", expected: "[0]", note: "All-zero range; confirms the identity/cancellation logic." },
		],
		followUps: [
			"Why does the +1 offset appear in prefix[r+1] ^ prefix[l]?",
			"Which other operations support this prefix trick (sum, product) and which don't (max)?",
		],
		relatedNotes: ["prefix_sum_pattern", "arrays_and_hashing"],
	},

	"304-range-sum-query-2d-immutable": {
		slug: "304-range-sum-query-2d-immutable",
		pattern: "2D prefix sum (summed-area table)",
		recognitionSignals: [
			"repeated rectangle-sum queries on a static matrix",
			"sumRegion must be O(1)",
			"inclusion–exclusion over a 2D grid",
		],
		dissection:
			"Precompute a prefix matrix P where P[i][j] is the sum of the rectangle from (0,0) to (i,j). Any sub-rectangle sum is then four lookups via inclusion–exclusion.",
		intuition:
			"P[i][j] = M[i][j] + P[i−1][j] + P[i][j−1] − P[i−1][j−1] (the overlap is subtracted once). A region sum becomes P[r2][c2] − P[r1−1][c2] − P[r2][c1−1] + P[r1−1][c1−1] — constant time regardless of rectangle size.",
		invariant:
			"P[i][j] always equals the total of all cells in the rectangle with corners (0,0) and (i,j).",
		bruteForce: {
			approach:
				"For each sumRegion call, loop over every cell inside the rectangle and add them up. No setup cost, but each query is proportional to the rectangle's area.",
			complexity: { time: "O(m·n) per query", space: "O(1)", note: "Worst case sums the entire grid every call." },
		},
		constraintReasoning:
			"sumRegion can be called up to ~10⁴ times, so per-query O(m·n) compounds badly — the 'repeated queries, immutable matrix' signature demands O(1) lookups. Paying O(m·n) once to build a summed-area table is the trade, and inclusion–exclusion turns any rectangle into four reads.",
		approachSteps: [
			"Build P with the inclusion–exclusion recurrence, guarding i=0 / j=0 edges.",
			"For sumRegion, fetch full = P[r2][c2].",
			"Subtract the strip above (P[r1−1][c2]) and the strip left (P[r2][c1−1]).",
			"Add back the doubly-removed corner (P[r1−1][c1−1]).",
		],
		complexity: { time: "O(1)", space: "O(m·n)", note: "Construction is O(m·n) once; each query is O(1)." },
		pitfalls: [
			"Boundary terms when row1 or col1 is 0 — treat out-of-range prefixes as 0.",
			"Sign errors in inclusion–exclusion (the corner is ADDED back).",
			"Recomputing the prefix matrix per query instead of once in the constructor.",
		],
		testCases: [
			{ kind: "canonical", input: "sumRegion(2,1,4,3) on the 5×5 sample", expected: "8", note: "Interior rectangle via four prefix lookups." },
			{ kind: "boundary", input: "sumRegion(0,0,0,0)", expected: "matrix[0][0]", note: "Top-left single cell — no boundary prefixes exist." },
			{ kind: "trap", input: "sumRegion(1,1,2,2) on the sample", expected: "11", note: "Correct answer is 11; an off-by-one in the boundary terms (e.g. P[r1][c2] instead of P[r1−1][c2]) would give a wrong sum." },
		],
		followUps: [
			"What changes if the matrix becomes mutable (update + query)? (2D BIT / Fenwick).",
			"Derive the inclusion–exclusion formula from a picture.",
		],
		relatedNotes: ["prefix_sum_pattern", "arrays_and_hashing"],
	},

	"705-design-hashset": {
		slug: "705-design-hashset",
		pattern: "Separate chaining (buckets of lists)",
		recognitionSignals: [
			"implement a hash set from scratch",
			"O(1) average add / remove / contains",
			"collisions must be handled explicitly",
		],
		dissection:
			"Build a set supporting add, remove, contains without a language built-in. Hash each key to a bucket index (key % key_space); each bucket is a list, and membership is a linear scan within that bucket.",
		intuition:
			"Separate chaining absorbs collisions: keys sharing an index live in the same bucket list. With a large key_space, buckets stay short, so operations are O(1) on average. The classic bug is initializing buckets with [[]]*n (shared reference) instead of a comprehension.",
		invariant:
			"Each bucket contains at most one copy of any key; a key is present iff it appears in the bucket at index key % key_space.",
		approachSteps: [
			"Initialize hash_table = [[] for _ in range(key_space)] (NOT [[]]*key_space).",
			"add: hash to a bucket; append only if not already present.",
			"remove: hash to a bucket; remove if present.",
			"contains: hash to a bucket; return membership.",
		],
		complexity: { time: "O(1)", space: "O(n + key_space)", note: "Average O(1) per op assuming a good hash and load factor; worst case O(n) if all collide." },
		pitfalls: [
			"[[]]*n creates n references to ONE list — every 'bucket' is the same list.",
			"Adding duplicates because you skipped the membership check.",
			"Removing a missing key without guarding (raises ValueError on list.remove).",
		],
		testCases: [
			{ kind: "canonical", input: "add(1), add(2), contains(1)", expected: "true", note: "Basic insert + lookup." },
			{ kind: "boundary", input: "contains(3) on an empty set", expected: "false", note: "Lookup of an absent key returns false, not an error." },
			{ kind: "trap", input: "add(2), add(2), remove(2), contains(2)", expected: "false", note: "Duplicate add must not create two entries; one remove must fully delete." },
		],
		followUps: [
			"Resize/rehash when the load factor grows — how and when?",
			"Trade-offs: separate chaining vs open addressing.",
		],
		relatedNotes: ["arrays_and_hashing"],
	},

	"706-design-hashmap": {
		slug: "706-design-hashmap",
		pattern: "Separate chaining with key→value pairs",
		recognitionSignals: [
			"implement a key-value map from scratch",
			"get on a missing key returns −1",
			"put must update an existing key, not duplicate it",
		],
		dissection:
			"Like Design HashSet, but each bucket stores (key, value) pairs. put updates in place if the key exists else appends; get scans the bucket and returns the value or −1; remove deletes the matching pair.",
		intuition:
			"The only difference from a hash set is that buckets hold pairs and put must search-then-update. Without the in-place update, repeated puts on the same key would shadow or duplicate it — the iterate-and-replace step is the crux.",
		invariant:
			"Each bucket holds at most one pair per key; get(key) returns that pair's value, or −1 when no pair matches.",
		approachSteps: [
			"Initialize buckets = [[] for _ in range(key_space)].",
			"put: scan the bucket; if key found, replace the pair; else append (key, value).",
			"get: scan the bucket; return the value if found, else −1.",
			"remove: scan and delete the matching pair.",
		],
		complexity: { time: "O(1)", space: "O(n + key_space)", note: "Average O(1) per op; degrades to O(bucket length) under heavy collision." },
		pitfalls: [
			"put appending a second pair for an existing key instead of updating it.",
			"get returning None/0 instead of the specified −1 for missing keys.",
			"[[]]*n shared-reference bug (same as the hash set).",
		],
		testCases: [
			{ kind: "canonical", input: "put(1,1), put(2,2), get(1)", expected: "1", note: "Insert then retrieve." },
			{ kind: "boundary", input: "get(3) with key 3 absent", expected: "-1", note: "Missing key returns the sentinel −1." },
			{ kind: "trap", input: "put(2,2), put(2,1), get(2)", expected: "1", note: "Second put must UPDATE, not add a duplicate — get returns the new value." },
		],
		followUps: [
			"Add load-factor-based resizing.",
			"How would you support arbitrary (non-integer) keys?",
		],
		relatedNotes: ["arrays_and_hashing"],
	},

	"912-sort-an-array": {
		slug: "912-sort-an-array",
		pattern: "Counting sort (linear, bounded integer range)",
		recognitionSignals: [
			"sort integers within a known, bounded value range",
			"built-in sort is 'too easy' — they want an algorithm",
			"values are integers, not arbitrary comparables",
		],
		dissection:
			"Sort an integer array. The shown solution uses counting sort: tally each value's frequency into an array indexed by (value − min), then rebuild the array in order.",
		intuition:
			"When values lie in a bounded range, you can skip comparisons entirely: count occurrences, then emit values in index order. Shifting by min_val handles negatives. This is O(n + range), beating O(n log n) when the range is small relative to n.",
		invariant:
			"count_arr[i] holds the number of times (i + min_val) appears; emitting values in increasing i yields sorted output.",
		bruteForce: {
			approach:
				"Any comparison sort — merge sort, heap sort, or the language built-in. Works for any comparable input, but every element is compared against others.",
			complexity: { time: "O(n log n)", space: "O(n)", note: "The comparison-sort lower bound; merge sort needs O(n) scratch." },
		},
		constraintReasoning:
			"Comparison sorting is bounded below by O(n log n) — you only beat it by exploiting structure. Here the values are integers in a bounded range, which unlocks counting sort's O(n + k): when the range k is O(n) you win, but if the range is astronomically large the comparison sort is actually the safer choice.",
		approachSteps: [
			"Find min_val and max_val; size = max−min+1.",
			"Tally count_arr[num − min_val] for each num.",
			"Walk count_arr; write each value (i + min_val) count_arr[i] times via a write pointer.",
			"Return the rebuilt array.",
		],
		complexity: { time: "O(n + k)", space: "O(k)", note: "k = value range; counting sort wins when k = O(n), loses when the range is huge." },
		pitfalls: [
			"Forgetting the min_val shift — negative values would index out of bounds.",
			"Applying counting sort when the range is enormous (e.g. full int range) — use merge/heap sort instead.",
			"Empty input: guard before calling min()/max().",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [5,2,3,1]", expected: "[1,2,3,5]", note: "Small dense range — counting sort shines." },
			{ kind: "boundary", input: "nums = [1]", expected: "[1]", note: "Single element returns unchanged." },
			{ kind: "trap", input: "nums = [-1,2,-3,4]", expected: "[-3,-1,2,4]", note: "Negatives require the (num − min_val) shift or indices go negative." },
		],
		followUps: [
			"When is the value range too large for counting sort? Switch to merge or heap sort.",
			"Implement an O(n log n) merge sort for the unbounded-range case.",
		],
		relatedNotes: ["arrays_and_hashing", "time-complexity"],
	},
	"167-two-sum-ii-input-array-is-sorted": {
		slug: "167-two-sum-ii-input-array-is-sorted",
		pattern: "Converging two pointers on a sorted array",
		recognitionSignals: [
			"the array is already sorted",
			"find a pair that hits a target sum",
			"the prompt asks for O(1) extra space, ruling out the hashmap from #1",
		],
		dissection:
			"Because the array is sorted, the sum of the leftmost and rightmost elements brackets the whole range of possible pair sums. If that sum is too big, the only way to shrink it is to pull the right pointer in; if it is too small, advance the left pointer. Each comparison eliminates one element from consideration forever.",
		intuition:
			"Sorting gives the sum a monotonic 'steering wheel': moving left rightward only ever increases the sum, moving right leftward only ever decreases it. So you never have to backtrack — one linear sweep converges on the answer (or proves none exists).",
		invariant:
			"At every step, the answer pair (if it exists) lies within the window [L, R]. We only discard an endpoint once its sum direction proves it cannot be part of any valid pair.",
		bruteForce: {
			approach:
				"Ignore the sorted order and check every pair with nested loops (or reuse the #1 hashmap). Correct, but either O(n²) time or O(n) extra space.",
			complexity: { time: "O(n²)", space: "O(1)", note: "Nested-loop pair scan; the hashmap variant trades to O(n) space." },
		},
		constraintReasoning:
			"The input being already sorted is the gift: it makes pair sums monotonic, so two converging pointers find the answer in one O(n) sweep with O(1) space. The prompt's explicit O(1)-space ask is the signal to exploit the sort rather than fall back on the hashmap from #1.",
		approachSteps: [
			"Set L = 0, R = len(numbers) − 1.",
			"While L < R, compute total = numbers[L] + numbers[R].",
			"If total == target, return the 1-indexed pair [L + 1, R + 1].",
			"If total < target, increment L (need a bigger number).",
			"If total > target, decrement R (need a smaller number).",
		],
		complexity: {
			time: "O(n)",
			space: "O(1)",
			note: "Pointers move inward at most n times total; no extra storage.",
		},
		pitfalls: [
			"Returning 0-indexed positions — this problem uses 1-indexing, so add 1 to each.",
			"Reaching for a hashmap out of habit; that costs O(n) space the sorted input lets you avoid.",
			"Moving the wrong pointer: too-small sum means advance L, too-big means retreat R.",
		],
		testCases: [
			{ kind: "canonical", input: "numbers = [2,7,11,15], target = 9", expected: "[1,2]", note: "Pair is at the two ends — pointers meet immediately." },
			{ kind: "boundary", input: "numbers = [2,3,4], target = 6", expected: "[1,3]", note: "Smallest and largest form the pair; window spans the whole array." },
			{ kind: "trap", input: "numbers = [-1,0], target = -1", expected: "[1,2]", note: "Negatives still obey the monotonic-sum logic; signs are not special." },
		],
		followUps: [
			"What if the array is NOT sorted? (hashmap complement lookup — see #1)",
			"How would you return all pairs summing to target, not just one?",
		],
		relatedNotes: ["two_pointers", "arrays_and_hashing", "space-complexity"],
	},
	"11-container-with-most-water": {
		slug: "11-container-with-most-water",
		pattern: "Converging two pointers, greedy width-vs-height trade",
		recognitionSignals: [
			"maximize an area or quantity defined by a pair of indices",
			"value depends on both the distance between indices and a min/max of their values",
			"brute force is O(n²) over all pairs and the prompt wants better",
		],
		dissection:
			"Area = width × min(height[L], height[R]). Start at maximum width (the two ends). The limiting factor is the shorter wall — water spills over it regardless of how tall the other wall is. So the only move that could possibly help is to abandon the shorter wall and hope for a taller one inward.",
		intuition:
			"You begin with the widest possible container, so every inward step sacrifices width. The gamble only pays off if you trade away the wall that was capping you — the shorter one. Moving the taller wall can never help: width drops AND the height stays capped by the (still shorter) other wall.",
		invariant:
			"The maximum-area container using any pair still inside [L, R] has not yet been excluded. Discarding the shorter wall is safe because no wider pairing with it remains that could beat the area we just recorded.",
		bruteForce: {
			approach:
				"Try every pair of lines (i, j) and compute width × min(height[i], height[j]), keeping the max. Exhaustive and obviously correct.",
			complexity: { time: "O(n²)", space: "O(1)", note: "All n(n−1)/2 pairs evaluated." },
		},
		constraintReasoning:
			"n reaches ~10⁵, so O(n²) (~10¹⁰) is a hard TLE — the prompt wants O(n). The greedy 'always abandon the shorter wall' move lets two pointers cover the answer in one pass; the exchange argument proves no skipped pair could have beaten what you recorded.",
		approachSteps: [
			"Set L = 0, R = len(height) − 1, max_area = 0.",
			"While L < R, compute current_area = (R − L) × min(height[L], height[R]).",
			"Update max_area = max(max_area, current_area).",
			"Move the pointer at the shorter wall inward (if height[L] < height[R], L += 1, else R -= 1).",
		],
		complexity: {
			time: "O(n)",
			space: "O(1)",
			note: "Each pointer moves inward at most n steps; constant extra space.",
		},
		pitfalls: [
			"Moving the taller wall — it can never increase the area, so it wastes the move.",
			"Multiplying the heights instead of taking min() — water is bounded by the shorter wall.",
			"Off-by-one on width: it is (R − L), the index gap, not (R − L + 1).",
		],
		testCases: [
			{ kind: "canonical", input: "height = [1,8,6,2,5,4,8,3,7]", expected: "49", note: "Best pair is index 1 and 8 (heights 8 and 7, width 7)." },
			{ kind: "boundary", input: "height = [1,1]", expected: "1", note: "Only one container possible: width 1, height 1." },
			{ kind: "trap", input: "height = [1,8,100,1]", expected: "8", note: "The huge 100 wall is wasted — it is capped by the shorter partner; widest viable pair wins." },
		],
		followUps: [
			"How does this differ from Trapping Rain Water (#42), which sums water across ALL bars?",
			"Can you prove moving the taller wall is never optimal? (exchange argument)",
		],
		relatedNotes: ["two_pointers", "space-complexity"],
	},
	"15-3sum": {
		slug: "15-3sum",
		pattern: "Sort + fixed anchor + converging two pointers",
		recognitionSignals: [
			"find triplets (or k-tuples) that sum to a target",
			"the result must contain no duplicate combinations",
			"order of output does not matter, so sorting is free to use",
		],
		dissection:
			"Sort first. Fix each value a as the smallest of the triplet; the remaining problem 'find b + c = −a in the suffix' is exactly Two Sum II on a sorted slice. Sorting also makes duplicates adjacent, so skipping repeats becomes a cheap neighbor comparison.",
		intuition:
			"Sorting turns an O(n³) triple loop into n runs of an O(n) two-pointer sweep. The sorted order does double duty: it powers the two-pointer convergence AND it lets you dodge duplicate triplets by skipping equal neighbors instead of using a set.",
		invariant:
			"For the current anchor a at index i, every triplet with a smaller first element has already been fully enumerated, and no duplicate of a has been used as an anchor before.",
		bruteForce: {
			approach:
				"Three nested loops over all index triples (i<j<k), testing whether nums[i]+nums[j]+nums[k]==0, with a set to dedup the triplets. Correct but cubic.",
			complexity: { time: "O(n³)", space: "O(n)", note: "n³/6 triples; the dedup set holds found triplets." },
		},
		constraintReasoning:
			"n reaches ~3000, so O(n³) (~2.7·10¹⁰) is far too slow — but O(n²) (~10⁷) passes comfortably. Sorting (O(n log n), cheaper than the main loop) is the enabler: it powers the two-pointer sweep AND turns duplicate-skipping into a neighbor check, replacing the set.",
		approachSteps: [
			"Sort nums ascending.",
			"For each (i, a): if a > 0, break (no positive anchor can sum to 0); if i > 0 and a == nums[i−1], skip this duplicate anchor.",
			"Set left = i + 1, r = len(nums) − 1.",
			"While left < r: let s = a + nums[left] + nums[r]. If s > 0 decrement r; if s < 0 increment left.",
			"If s == 0, record [a, nums[left], nums[r]], advance both pointers, then skip left past any duplicates (while nums[left] == nums[left−1]).",
		],
		complexity: {
			time: "O(n²)",
			space: "O(1) or O(n)",
			note: "Outer loop × inner two-pointer sweep = O(n²); sort is O(n log n). Extra space depends on the sort implementation.",
		},
		pitfalls: [
			"Forgetting to skip duplicate anchors (i > 0 and a == nums[i−1]) — yields repeated triplets.",
			"Forgetting to skip duplicate left values after recording a hit — same triplet emitted twice.",
			"Not breaking when a > 0: once the smallest of three sorted numbers is positive, no sum of zero is possible.",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [-1,0,1,2,-1,-4]", expected: "[[-1,-1,2],[-1,0,1]]", note: "Two distinct triplets; the duplicate -1 must not double-count." },
			{ kind: "boundary", input: "nums = [0,0,0]", expected: "[[0,0,0]]", note: "All zeros — exactly one triplet despite three identical values." },
			{ kind: "trap", input: "nums = [-2,0,0,2,2]", expected: "[[-2,0,2]]", note: "Repeated 0s and 2s tempt multiple outputs; the dedup skips collapse them to one." },
		],
		followUps: [
			"Generalize to 4Sum or kSum — what is the recursion and its complexity?",
			"3Sum Closest: return the triplet sum nearest target instead of exactly target.",
		],
		relatedNotes: ["two_pointers", "arrays_and_hashing", "time-complexity"],
	},
	"42-trapping-rain-water": {
		slug: "42-trapping-rain-water",
		pattern: "Converging two pointers tracking running side maxima",
		recognitionSignals: [
			"water/volume trapped between bars of varying height",
			"each position's contribution depends on the max to its left AND right",
			"a naive solution recomputes side maxima repeatedly (O(n²)) or stores them (O(n) space)",
		],
		dissection:
			"Water above column i equals min(max_left, max_right) − height[i]. The shown solution walks two pointers inward; whichever side currently has the SHORTER wall is the side whose water level is already fully determined, because the opposite side guarantees a wall at least as tall. So you can safely settle that column and step inward.",
		intuition:
			"You don't need both global maxima at once — you only need to know which side is the binding constraint. The shorter wall is the bottleneck, so the water on that side is capped by its own running max. That insight removes the O(n) prefix/suffix arrays entirely, giving O(1) space.",
		invariant:
			"max_left is the tallest bar in [0, L] and max_right the tallest in [R, n−1]. Whenever height[L] < height[R], every column at L is bounded by max_left (a taller wall is guaranteed on the right), so its trapped water is final.",
		bruteForce: {
			approach:
				"For each column, scan left for its tallest bar and scan right for its tallest bar, then add min(maxL, maxR) − height[i]. The prefix/suffix-array variant caches those scans into O(n) space.",
			complexity: { time: "O(n²)", space: "O(1)", note: "Two O(n) scans per column; the prefix/suffix version is O(n) time, O(n) space." },
		},
		constraintReasoning:
			"n reaches ~2·10⁴, so the O(n²) rescan risks TLE — the prefix/suffix arrays fix the time at O(n) but cost O(n) space. The two-pointer insight (only the shorter side's water is ever 'locked in') removes those arrays entirely, landing at O(n) time and O(1) space.",
		approachSteps: [
			"Guard: if n <= 2, return 0 (need a wall on both sides).",
			"Set l = 0, r = n − 1, max_left = max_right = 0, total = 0.",
			"While l < r: if height[l] < height[r], process the left side, else the right.",
			"Left side: if height[l] >= max_left, raise max_left; else add max_left − height[l] to total. Then l += 1.",
			"Right side mirrors it with max_right and r -= 1.",
		],
		complexity: {
			time: "O(n)",
			space: "O(1)",
			note: "Single inward pass, two running maxima — no prefix/suffix arrays (the O(n)-space approach is also shown in the file for contrast).",
		},
		pitfalls: [
			"Comparing height[l] to height[r] but then updating the WRONG side's max — the bottleneck side is the one you process.",
			"Forgetting the n <= 2 guard; fewer than 3 bars can trap nothing.",
			"Adding negative water: only add when the current bar is below its running max (the >= branch raises the wall instead).",
		],
		testCases: [
			{ kind: "canonical", input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", expected: "6", note: "Classic skyline; the textbook answer." },
			{ kind: "boundary", input: "height = [1]", expected: "0", note: "Single bar — the n <= 2 guard returns 0 immediately; no walls on both sides." },
			{ kind: "trap", input: "height = [3,2,1]", expected: "0", note: "Monotonic slope traps nothing — no right wall ever rises above the left." },
		],
		followUps: [
			"Compare the three approaches in the file: brute force O(n²), prefix/suffix O(n) space, two-pointer O(1) space.",
			"Trapping Rain Water II (2D grid) — why does the heap/BFS approach replace two pointers?",
		],
		relatedNotes: ["two_pointers", "prefix_sum_pattern", "space-complexity"],
	},
	"125-valid-palindrome": {
		slug: "125-valid-palindrome",
		pattern: "Converging two pointers with in-place filtering",
		recognitionSignals: [
			"check a palindrome while ignoring non-alphanumeric characters and case",
			"the prompt nudges toward O(1) extra space (no building a cleaned copy)",
			"comparison is symmetric from both ends",
		],
		dissection:
			"Walk one pointer from each end toward the middle. Skip any character that is not alphanumeric, then compare the two surviving characters case-insensitively. A mismatch fails immediately; surviving until the pointers cross proves a palindrome. No cleaned string is ever materialized.",
		intuition:
			"The naive route builds a filtered lowercase copy and reverses it — clean but O(n) space. The two-pointer version filters lazily, skipping junk in place, so you spend O(1) extra space. The file even keeps the naive version commented out to mark exactly that space trade-off.",
		invariant:
			"Everything outside the window [L, R] has already been confirmed to mirror correctly. Each step either skips a non-alphanumeric character or verifies one matched alphanumeric pair.",
		bruteForce: {
			approach:
				"Build a cleaned, lowercased copy keeping only alphanumerics, then compare it to its reverse (cleaned == cleaned[::-1]). Clean and obvious, but it allocates a whole second string.",
			complexity: { time: "O(n)", space: "O(n)", note: "The filtered copy and its reverse are both O(n)." },
		},
		constraintReasoning:
			"Time is O(n) either way — this isn't a TLE story, it's a *space* one. The prompt nudges toward O(1) extra space, which rules out materializing a cleaned copy. Two pointers that skip junk in place achieve the same check while allocating nothing.",
		approachSteps: [
			"Set l = 0, r = len(s) − 1.",
			"While l < r: advance l past any non-alphanumeric char (l < r and not s[l].isalnum()).",
			"Retreat r past any non-alphanumeric char (l < r and not s[r].isalnum()).",
			"If s[l].lower() != s[r].lower(), return False.",
			"Otherwise step inward: l += 1, r -= 1. If the loop completes, return True.",
		],
		complexity: {
			time: "O(n)",
			space: "O(1)",
			note: "Each character is visited at most once; no cleaned copy is allocated.",
		},
		pitfalls: [
			"Forgetting the inner l < r guard while skipping — an all-punctuation string can run a pointer past the other.",
			"Comparing without .lower() — 'A' and 'a' should match.",
			"Building a filtered string anyway; that works but forfeits the O(1)-space win this problem rewards.",
		],
		testCases: [
			{ kind: "canonical", input: 's = "A man, a plan, a canal: Panama"', expected: "true", note: "Punctuation and spaces are skipped; the letters mirror." },
			{ kind: "boundary", input: 's = " "', expected: "true", note: "After filtering, the string is empty — vacuously a palindrome." },
			{ kind: "trap", input: 's = "0P"', expected: "false", note: "'0' and 'P' are both alphanumeric but differ — case folding does NOT make digits and letters equal." },
		],
		followUps: [
			"Valid Palindrome II: allow deleting at most one character — how does the two-pointer logic branch?",
			"Why does the in-place filter beat the build-and-reverse approach on space but not time?",
		],
		relatedNotes: ["two_pointers", "space-complexity", "python_builtins_for_leetcode"],
	},
	"344-reverse-string": {
		slug: "344-reverse-string",
		pattern: "Two pointers with in-place swap",
		recognitionSignals: [
			"reverse an array in place with O(1) extra memory",
			"input is a mutable list and output should modify it directly",
			"symmetric swap from both ends toward the center",
		],
		dissection:
			"Place one pointer at each end of the array. Swap the elements at the two pointers, then move both inward. Repeat until the pointers meet or cross — at that point the entire array has been reversed.",
		intuition:
			"Reversing is just mirroring: element at index i trades places with element at index n−1−i. Two pointers make this a single pass with O(1) extra space because swaps happen in place — no second array is needed.",
		invariant:
			"After each swap, the elements outside the window [l, r] are in their final reversed positions. The elements inside the window have not yet been touched.",
		bruteForce: {
			approach:
				"Allocate a new array, copy elements from the original in reverse order, then copy back. Correct but uses O(n) extra space.",
			complexity: { time: "O(n)", space: "O(n)", note: "A second array of the same size is allocated." },
		},
		constraintReasoning:
			"The prompt explicitly requires O(1) extra memory, which rules out the copy-to-new-array approach. In-place swapping with two pointers is the canonical O(1)-space reversal.",
		approachSteps: [
			"Set l = 0, r = len(s) − 1.",
			"While l < r: swap s[l] and s[r].",
			"Move both pointers inward: l += 1, r -= 1.",
			"When l >= r, all pairs have been swapped — the array is reversed.",
		],
		complexity: {
			time: "O(n)",
			space: "O(1)",
			note: "Each element is swapped exactly once. Only two index variables are used.",
		},
		pitfalls: [
			"Using l <= r instead of l < r — when l == r (the middle element), swapping it with itself is harmless but wasteful.",
			"Forgetting to move both pointers inward — an infinite loop.",
			"Returning a new array instead of modifying in place — the problem requires in-place mutation.",
		],
		testCases: [
			{ kind: "canonical", input: 's = ["h","e","l","l","o"]', expected: '["o","l","l","e","h"]', note: "Standard odd-length reversal; the middle 'l' stays in place." },
			{ kind: "boundary", input: 's = ["a","b"]', expected: '["b","a"]', note: "Even-length array — one swap completes the reversal." },
			{ kind: "trap", input: 's = ["a"]', expected: '["a"]', note: "Single element — the loop body never executes, and the array is unchanged." },
		],
		followUps: [
			"Reverse only a subrange of the array (e.g., reverse s[i..j]) — how does the pointer initialization change?",
			"Reverse the words in a sentence in place (e.g., 'the sky is blue' → 'blue is sky the') — how does this combine two reversals?",
			"Rotate an array by k positions in O(1) space — how does reversal help (reverse three subranges)?",
		],
		relatedNotes: ["two_pointers", "space-complexity"],
	},
	"680-valid-palindrome-ii": {
		slug: "680-valid-palindrome-ii",
		pattern: "Two pointers with greedy single deletion",
		recognitionSignals: [
			"check a palindrome but allow deleting at most one character",
			"standard palindrome check with a skip/deletion tolerance",
			"on first mismatch, two branches need checking — skip left or skip right",
		],
		dissection:
			"Walk from both ends. When characters match, move inward. On the first mismatch, you have exactly two choices: skip the left character or skip the right character. If either resulting substring is a palindrome, the original string qualifies.",
		intuition:
			"A standard palindrome check fails on the first mismatch. Here, you get one 'skip' — but only at the point of mismatch. Trying the skip anywhere else wouldn't help because all prior pairs already matched. So the decision is greedy: at the first mismatch, branch into two sub-checks (skip left vs skip right) and return true if either succeeds.",
		invariant:
			"Before the first mismatch, every outer pair has been confirmed. After the mismatch, the sub-check verifies that the remaining window (with one character skipped) is a plain palindrome — no further deletions allowed.",
		bruteForce: {
			approach:
				"Try deleting each of the n characters one at a time, and check if the resulting string is a palindrome. Correct, but you run a full palindrome check (O(n)) for each of n deletion positions.",
			complexity: { time: "O(n²)", space: "O(n)", note: "n deletion attempts × O(n) palindrome check each, plus O(n) string copy per attempt." },
		},
		constraintReasoning:
			"With n ≤ 10⁵, the O(n²) brute force (~10¹⁰ ops) is far too slow. The key insight is that the deletion can only matter at the first mismatch — all prior pairs already matched. So we only branch once, making the entire check O(n).",
		approachSteps: [
			"Set l = 0, r = len(s) − 1.",
			"While l < r: if s[l] == s[r], move both inward (l += 1, r -= 1).",
			"On the first mismatch (s[l] != s[r]): check if s[l+1 .. r] is a palindrome (skip left) OR s[l .. r−1] is a palindrome (skip right).",
			"Return true if either sub-check passes; if both fail, return false.",
			"If the loop completes without any mismatch, the string is already a palindrome — return true.",
		],
		complexity: {
			time: "O(n)",
			space: "O(1) with index-based helper, O(n) with slicing",
			note: "Each pointer moves at most n times. On mismatch, two O(n) sub-checks. Total is still O(n) because each character is visited at most a constant number of times.",
		},
		pitfalls: [
			"Only checking one branch (e.g., only skip left) — the other branch might be the one that works.",
			"Trying to handle multiple mismatches with multiple deletions — you only get ONE deletion.",
			"Trying all n deletion positions instead of branching at the first mismatch — that's the O(n²) brute force.",
			"With slicing: s[l+1:r+1] skips left, s[l:r] skips right — the +1 on the right bound is easy to get wrong.",
		],
		testCases: [
			{ kind: "canonical", input: 's = "abca"', expected: "true", note: "Delete 'b' → 'aca' or delete 'c' → 'aba' — both are palindromes." },
			{ kind: "boundary", input: 's = "a"', expected: "true", note: "Single character is trivially a palindrome with zero deletions." },
			{ kind: "trap", input: 's = "abc"', expected: "false", note: "No single deletion can make 'abc' a palindrome. Both branches fail: skip left → 'bc' (no), skip right → 'ab' (no)." },
		],
		followUps: [
			"Valid Palindrome III: at most k deletions — how does the approach change (hint: dynamic programming)?",
			"Why is greedy correct here? Could skipping at a later mismatch be better than the first?",
			"What if the problem allowed at most one insertion instead of one deletion?",
		],
		relatedNotes: ["two_pointers", "space-complexity"],
	},
	"3-longest-substring-without-repeating-characters": {
		slug: "3-longest-substring-without-repeating-characters",
		pattern: "Variable-size sliding window with a seen-set",
		recognitionSignals: [
			"longest/length of a substring (contiguous) under a constraint",
			"the constraint is 'no repeated characters' inside the window",
			"a brute-force check of every substring is O(n²) or worse",
		],
		dissection:
			"Grow the window by advancing the right edge one character at a time. The moment the new character duplicates one already inside, shrink from the left until the duplicate is gone. The window always holds a set of distinct characters, and its largest width over the scan is the answer.",
		intuition:
			"Each character enters the window exactly once and leaves at most once, so the two edges sweep forward without backtracking — that's what makes it O(n) instead of O(n²). The set answers 'is this character already in the window?' in O(1), which is the engine of the whole approach.",
		invariant:
			"At the end of each iteration, the window s[left..r] contains only distinct characters, and result holds the length of the longest distinct-character window seen so far.",
		bruteForce: {
			approach:
				"Enumerate every substring (every start × end) and check each for duplicate characters with a set, tracking the longest valid one.",
			complexity: { time: "O(n²)", space: "O(min(n, charset))", note: "O(n²) substrings; the distinctness check is O(1) amortized with a set per window." },
		},
		constraintReasoning:
			"With n up to ~5·10⁴, O(n²) (~2.5·10⁹) is too slow — the 'longest contiguous run under a constraint' shape is the textbook sliding-window signal. Because each character enters and leaves the window at most once, the two edges sweep linearly, collapsing O(n²) to O(n).",
		approachSteps: [
			"Create an empty char_set, left = 0, result = 0.",
			"For each right index r: while s[r] is already in char_set, remove s[left] and increment left.",
			"Add s[r] to char_set (now the window is duplicate-free again).",
			"Update result = max(result, r − left + 1).",
		],
		complexity: {
			time: "O(n)",
			space: "O(min(n, charset))",
			note: "Each character is added and removed at most once; the set holds at most one window's worth of distinct chars.",
		},
		pitfalls: [
			"Computing the width as (r − left) instead of (r − left + 1) — off by one.",
			"Removing only the duplicate character instead of sliding left forward past it; you must evict from the left edge in order.",
			"Resetting the whole window on a duplicate — that throws away valid progress and breaks O(n).",
		],
		testCases: [
			{ kind: "canonical", input: 's = "abcabcbb"', expected: "3", note: "'abc' is the longest distinct run before a repeat forces a shrink." },
			{ kind: "boundary", input: 's = ""', expected: "0", note: "Empty string — the loop never runs, result stays 0." },
			{ kind: "trap", input: 's = "abba"', expected: "2", note: "When the second 'a' arrives, left must jump PAST the first 'a' (index 0→2), not just remove one 'b'." },
		],
		followUps: [
			"Longest Substring with At Most K Distinct Characters — how does the shrink condition change?",
			"Could you swap the set for a last-seen-index map to jump left in one step instead of looping?",
		],
		relatedNotes: ["sliding_window", "arrays_and_hashing", "python_builtins_for_leetcode", "time-complexity"],
	},
	"121-best-time-to-buy-and-sell-stock": {
		slug: "121-best-time-to-buy-and-sell-stock",
		pattern: "Single-pass min-tracking (a 'window' that only ever advances its buy point)",
		recognitionSignals: [
			"maximize profit/difference where you must buy before you sell",
			"only one transaction is allowed",
			"a nested compare-every-pair loop is O(n²) and clearly improvable",
		],
		dissection:
			"Keep a left pointer at the cheapest buy price seen so far and a right pointer scanning forward. If the current price beats the buy price, record the profit; if it undercuts the buy price, you have found a better day to buy, so jump left up to right. The best profit over the whole scan is the answer.",
		intuition:
			"Unlike a contracting window, left never slides one step at a time — it teleports to a new low whenever the price drops below the current buy. So you are really tracking 'the lowest price so far' and asking, at each day, 'what if I sold today?'. One pass, no backtracking.",
		invariant:
			"prices[left] is the minimum price in prices[0..r], and max_profit is the best (sell − buy) achievable with the buy occurring at or after that minimum and the sell at or before index r.",
		bruteForce: {
			approach:
				"Try every buy day i and every later sell day j > i, tracking the maximum prices[j] − prices[i]. Exhaustive over all valid transactions.",
			complexity: { time: "O(n²)", space: "O(1)", note: "All ordered pairs (i < j) evaluated." },
		},
		constraintReasoning:
			"n reaches ~10⁵, so O(n²) (~10¹⁰) is a clear TLE — you need one pass. The key realization is that you only ever care about the lowest price seen *before* today, so tracking a running minimum collapses the inner loop and gives O(n).",
		approachSteps: [
			"Set left = 0, r = 1, max_profit = 0.",
			"While r < len(prices): if prices[left] < prices[r], update max_profit = max(max_profit, prices[r] − prices[left]).",
			"Else (prices[r] <= prices[left]) set left = r — a cheaper buy day.",
			"Increment r and continue. Return max_profit.",
		],
		complexity: {
			time: "O(n)",
			space: "O(1)",
			note: "One forward scan; only two indices and a running max are stored.",
		},
		pitfalls: [
			"Allowing the sell before the buy — left must always stay <= r, which the 'jump left to r' rule preserves.",
			"Returning a negative profit on a falling market; initialize max_profit to 0 (no transaction is allowed).",
			"Mistaking this for a max-minus-min over the whole array — the min must occur BEFORE the max.",
		],
		testCases: [
			{ kind: "canonical", input: "prices = [7,1,5,3,6,4]", expected: "5", note: "Buy at 1 (day 1), sell at 6 (day 4)." },
			{ kind: "boundary", input: "prices = [5]", expected: "0", note: "One day — no sell day exists, so profit is 0." },
			{ kind: "trap", input: "prices = [7,6,4,3,1]", expected: "0", note: "Strictly falling — every potential sell is below its buy, so the answer is 0, not a negative number." },
		],
		followUps: [
			"Best Time to Buy and Sell Stock II: unlimited transactions — what greedy rule applies?",
			"With a transaction fee or a cooldown, why does this become a DP problem?",
		],
		relatedNotes: ["sliding_window", "arrays_and_hashing", "space-complexity", "time-complexity"],
	},
	"424-longest-repeating-character-replacement": {
		slug: "424-longest-repeating-character-replacement",
		pattern: "Variable-size sliding window with a frequency map and most-frequent count",
		recognitionSignals: [
			"longest substring achievable after at most k changes/replacements",
			"the window is valid when (its length − count of its most frequent char) <= k",
			"you are counting characters inside a contiguous range",
		],
		dissection:
			"Inside any window, the cheapest way to make all characters equal is to keep the most frequent one and replace the rest. That costs (window_length − max_frequency) replacements. While that cost stays within k the window is valid; when it exceeds k, slide the left edge in by one to restore the budget.",
		intuition:
			"The window only ever needs to grow to beat its record, so once max_f reflects a large window we never need to lower it — a stale max_f can only make the validity test stricter, never wrongly accept a window. That's why the code never decrements max_f when shrinking, and the answer stays correct.",
		invariant:
			"char_count holds the frequency of every character in the current window s[left..r], and res is the longest window for which (length − most-frequent-count) never exceeded k.",
		bruteForce: {
			approach:
				"For every (start, end) substring, count its characters and test whether (length − most-frequent-count) <= k, keeping the longest valid one.",
			complexity: { time: "O(n²·26)", space: "O(26)", note: "O(n²) substrings, each re-counting up to 26 letters." },
		},
		constraintReasoning:
			"n reaches ~10⁵, so the O(n²) substring scan is hopeless — the 'longest window under a budget' shape calls for a sliding window. The subtlety: a stale max-frequency is safe (it can only make the validity test stricter), which is what keeps the single pass correct without recomputing the max on every shrink.",
		approachSteps: [
			"Init char_count = {}, left = 0, max_f = 0, res = 0.",
			"For each r: increment char_count[s[r]] and update max_f = max(max_f, char_count[s[r]]).",
			"If (r − left + 1) − max_f > k, the window costs too many replacements: decrement char_count[s[left]] and increment left.",
			"Update res = max(res, r − left + 1).",
		],
		complexity: {
			time: "O(n)",
			space: "O(charset)",
			note: "Single pass; the frequency map holds at most 26 entries for uppercase letters.",
		},
		pitfalls: [
			"Decrementing max_f when shrinking — unnecessary and slows it down; a stale max_f never inflates the answer.",
			"Using an if instead of while for the shrink: since the window grows by one each step and shrinks by at most one, a single if suffices here — but understand why.",
			"Forgetting that the replacement cost is (length − max_f), not (length − k).",
		],
		testCases: [
			{ kind: "canonical", input: 's = "AABABBA", k = 1', expected: "4", note: "Window 'AABA'→'ABBA' reaches length 4 with one replacement." },
			{ kind: "boundary", input: 's = "AAAA", k = 2', expected: "4", note: "Already all equal — zero replacements needed, whole string qualifies." },
			{ kind: "trap", input: 's = "ABBB", k = 1', expected: "4", note: "Keep the three B's and replace the one A — cost 1 <= k, so the full length wins; do not stop early at the A." },
		],
		followUps: [
			"Why is a single 'if' enough to shrink here, whereas other windows need a 'while'?",
			"Max Consecutive Ones III is the same template on a binary array — can you map k flips to k replacements?",
		],
		relatedNotes: ["sliding_window", "arrays_and_hashing", "time-complexity", "python_builtins_for_leetcode"],
	},
	"219-contains-duplicate-ii": {
		slug: "219-contains-duplicate-ii",
		pattern: "Fixed-size sliding window carrying a membership set",
		recognitionSignals: [
			"a duplicate only counts when the two indices are within distance k",
			"the question is existence (true/false), not counting or locating",
			"'nearby', 'within k positions', or an explicit abs(i - j) <= k bound",
		],
		dissection:
			"Slide a window that holds at most the last k+1 values. Before looking at index R, drop anything that has fallen more than k positions behind it. Then the question 'is nums[R] a nearby duplicate?' reduces to 'is nums[R] already in the window?' — a single set lookup.",
		intuition:
			"The distance constraint is the whole problem. Rather than comparing index pairs, you let the window enforce distance structurally: if a value is in the set at all, it is by construction within k positions. That converts a two-dimensional condition (equal values AND close indices) into a one-dimensional membership test, because the window has already filtered out everything too far away.",
		invariant:
			"Just before testing index R, the set contains exactly the values at indices max(0, R−k) .. R−1 — every element still close enough to form a valid pair with R, and nothing else.",
		bruteForce: {
			approach:
				"For each index i, scan forward up to k positions and compare nums[i] against each nums[j]. Correct, and fine for tiny k, but the inner scan repeats work for every element.",
			complexity: { time: "O(n·k)", space: "O(1)", note: "Degrades to O(n²) when k is on the order of n." },
		},
		constraintReasoning:
			"Both n and k reach 10⁵, so the O(n·k) pair scan approaches 10¹⁰ operations — a certain TLE. Since k can be as large as n, you cannot lean on 'k is small'. Trading O(k) space for O(1) membership lookups gives O(n) time, and the set never exceeds k+1 entries.",
		approachSteps: [
			"Create an empty set `window` and a left bound L = 0.",
			"Iterate R over the array indices.",
			"If R − L > k, the window has overgrown: remove nums[L] from the set FIRST, then increment L.",
			"If nums[R] is already in the set, a valid nearby duplicate exists — return True.",
			"Otherwise add nums[R] to the set and continue. Return False if the scan completes.",
		],
		complexity: {
			time: "O(n)",
			space: "O(min(n, k))",
			note: "Each index is added and removed at most once; the set holds at most k+1 values.",
		},
		pitfalls: [
			"Incrementing L before removing nums[L] — you then evict the WRONG element and the stale value lingers in the set forever, reporting duplicates that are actually farther apart than k. Remove first, then advance.",
			"Using `>=` instead of `>` in the R − L > k test, which shrinks the window one element too early and misses pairs at exactly distance k.",
			"Forgetting that k = 0 must always yield False: distinct indices can never satisfy abs(i − j) <= 0.",
			"Reaching for a value → index hashmap and comparing R − lastIndex. That also works, but only if you overwrite the stored index on every sighting; keeping the first occurrence silently breaks on three-or-more repeats.",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [1,2,3,1], k = 3", expected: "true", note: "The two 1s sit exactly k apart — the boundary case that must count." },
			{ kind: "boundary", input: "nums = [1,1], k = 0", expected: "false", note: "k = 0 demands identical indices, which distinct i and j can never satisfy." },
			{ kind: "trap", input: "nums = [1,2,3,1,2,3], k = 2", expected: "false", note: "Duplicates exist but every matching pair is 3 apart. Catches any solution that checks equality while ignoring distance — and catches the evict-after-increment bug, which leaves a stale 1 in the set and wrongly returns true." },
		],
		followUps: [
			"Contains Duplicate III adds a value tolerance (abs(nums[i] − nums[j]) <= t). Why does a plain set stop working, and what ordered structure or bucketing replaces it?",
			"How would you return the actual index pair instead of a boolean, and what changes in the set?",
			"If the array streamed in and could not be stored, would this still work? (It would — note that the window only ever looks backward.)",
		],
		relatedNotes: ["sliding_window", "arrays_and_hashing", "space-complexity", "time-complexity"],
	},
	"1343-number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold": {
		slug: "1343-number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold",
		pattern: "Fixed-size sliding window carrying a running sum",
		recognitionSignals: [
			"every sub-array under consideration has the SAME given length k",
			"the test is an aggregate over the window (average, sum, or count)",
			"you are counting how many windows qualify, not finding a best one",
		],
		dissection:
			"Every window has the same width k, so the window never grows or shrinks — it marches. Keep a running sum: add the element entering on the right, subtract the one falling off the left, and once the window is full, test whether its sum clears the bar.",
		intuition:
			"Recomputing each window's sum from scratch re-adds the k−1 elements the previous window already counted. Since consecutive windows overlap in all but two positions, one addition and one subtraction carry you from one sum to the next — the overlap is the savings. Because k is fixed, comparing averages is the same as comparing sums against threshold × k, so you can stay in integer arithmetic entirely.",
		invariant:
			"After processing index R, window_sum equals the sum of arr[max(0, R−k+1) .. R] — and once R >= k−1 that is exactly a full k-length window ending at R.",
		bruteForce: {
			approach:
				"For each of the n−k+1 starting positions, loop over all k elements to total the window and compare its average against the threshold. Straightforward, but every window is summed from scratch.",
			complexity: { time: "O(n·k)", space: "O(1)", note: "Each of ~n windows costs O(k) to re-sum." },
		},
		constraintReasoning:
			"n reaches 10⁵ and k can be as large as n, so the re-summing approach tops out near 10¹⁰ operations and will TLE. The overlap between neighbouring windows is the lever: reusing the previous sum makes each step O(1), giving O(n) overall with no extra space.",
		approachSteps: [
			"Precompute target = threshold × k so you compare sums, never averages.",
			"Initialize window_sum = 0 and count = 0.",
			"For each index R: add arr[R] to window_sum.",
			"If R >= k, subtract arr[R − k] — the element that just fell out of a k-wide window ending at R.",
			"If R >= k − 1 and window_sum >= target, increment count.",
			"Return count.",
		],
		complexity: {
			time: "O(n)",
			space: "O(1)",
			note: "One pass; only a running sum and a counter are stored.",
		},
		pitfalls: [
			"Dividing by k and comparing floats. Multiplying the threshold by k instead keeps everything in integers and sidesteps precision entirely.",
			"Counting before the window is full — guard with R >= k − 1, otherwise the partial prefix sums masquerade as valid windows.",
			"Evicting with the wrong offset. The element leaving is arr[R − k], not arr[R − k + 1]; the latter drops an element that is still inside the window.",
			"Using `>` when the problem says 'greater than or equal to' — a window whose average lands exactly on the threshold must count.",
		],
		testCases: [
			{ kind: "canonical", input: "arr = [2,2,2,2,5,5,5,8], k = 3, threshold = 4", expected: "3", note: "Windows summing to at least 12: [2,5,5], [5,5,5], [5,5,8]." },
			{ kind: "boundary", input: "arr = [1,1,1,1,1], k = 5, threshold = 5", expected: "0", note: "k equals the array length, so exactly one window exists and it falls short — verifies the loop still evaluates the single full window." },
			{ kind: "trap", input: "arr = [11,13,17,23,29,31,7,5,2,3], k = 3, threshold = 5", expected: "6", note: "The threshold is low enough that most windows qualify, so an off-by-one in the fill guard (R >= k−1) or the eviction index changes the count without crashing — a silent miscount rather than an error." },
		],
		followUps: [
			"Maximum Average Subarray I asks for the best window instead of a count — what single line changes?",
			"If k were variable ('any sub-array with average >= threshold'), why does this fixed-window trick collapse, and what would you reach for instead?",
			"Contains Duplicate II uses the same fixed-window skeleton but carries a set rather than a sum. What determines which accumulator a window needs?",
			"The saved solution never stores the left edge — it evicts arr[R − k] instead. Rewrite it with an explicit `left` variable and `right − left + 1` as the width: both guards survive the translation, so what does each one become, and why is that same rewrite mandatory the moment the window stops being fixed-size?",
		],
		relatedNotes: ["sliding_window", "arrays_and_hashing", "time-complexity", "space-complexity"],
	},
	"150-evaluate-reverse-polish-notation": {
		slug: "150-evaluate-reverse-polish-notation",
		pattern: "Stack-based postfix expression evaluation",
		recognitionSignals: [
			"tokens are in Reverse Polish / postfix notation",
			"operators apply to the most recently seen operands",
			"you need a LIFO structure to hold pending operands",
		],
		dissection:
			"Scan tokens left to right. Push every number onto a stack. When an operator appears, pop the top two values — the second pop is the left operand, the first pop is the right — apply the operation, and push the result back. After the scan the stack holds exactly the final value.",
		intuition:
			"Postfix notation is the stack's native language: an operator always acts on the two most-recent results, which are exactly what sits on top of the stack. No parentheses or precedence rules are needed — the ordering already encodes them.",
		invariant:
			"After processing each token, the stack contains the evaluated results of every complete sub-expression seen so far, in order, with the most recent on top.",
		approachSteps: [
			"Create an empty stack.",
			"For each token: if it is one of + − * /, pop operand2 then operand1.",
			"Apply the operator (operand1 op operand2) and push the result.",
			"For division, truncate toward zero with int(operand1 / operand2).",
			"For a number token, push int(token). At the end, pop and return the single remaining value.",
		],
		complexity: {
			time: "O(n)",
			space: "O(n)",
			note: "Each token is pushed/popped once; the stack holds at most O(n) operands.",
		},
		pitfalls: [
			"Reversing operand order: the FIRST pop is the right operand. For − and /, operand1 − operand2 (not the reverse).",
			"Integer division must truncate toward zero — int(a / b), not Python's a // b which floors toward negative infinity.",
			"Treating negative-number tokens like '-3' as operators; only the bare symbols +−*/ are operators.",
		],
		testCases: [
			{ kind: "canonical", input: 'tokens = ["2","1","+","3","*"]', expected: "9", note: "((2 + 1) * 3) = 9 — the README example." },
			{ kind: "boundary", input: 'tokens = ["5"]', expected: "5", note: "A single operand evaluates to itself; no operator ever runs." },
			{ kind: "trap", input: 'tokens = ["6","-13","/"]', expected: "0", note: "6 / -13 = -0.46…; truncating toward zero gives 0, whereas floor division would give -1." },
		],
		followUps: [
			"Convert infix to postfix (the shunting-yard algorithm) — why is the stack central there too?",
			"Basic Calculator (#224): how do parentheses and precedence reintroduce a second stack?",
		],
		relatedNotes: ["python_builtins_for_leetcode", "time-complexity"],
	},
	"155-min-stack": {
		slug: "155-min-stack",
		pattern: "Auxiliary stack mirroring the running minimum",
		recognitionSignals: [
			"a stack that must also report its minimum element",
			"every operation — push, pop, top, getMin — must be O(1)",
			"a naive getMin would scan the whole stack (O(n))",
		],
		dissection:
			"Keep two stacks in lockstep. The main stack behaves normally. The min-stack pushes, alongside each value, the minimum of that value and the previous min-stack top. So min_stack[-1] is always the minimum of everything currently in the main stack, and a pop removes from both.",
		intuition:
			"Instead of recomputing the minimum on demand, you cache it at every level. Because each min-stack entry remembers 'the smallest value at or below this point', popping the top instantly reveals the new minimum — no rescanning. You trade O(n) extra space for O(1) on every operation.",
		invariant:
			"len(min_stack) == len(stack) at all times, and min_stack[-1] equals min(stack) for the current contents (or is undefined only when both are empty).",
		bruteForce: {
			approach:
				"Keep a single normal stack and, when getMin is called, scan the whole stack for the smallest value. push/pop/top stay O(1) but getMin walks everything.",
			complexity: { time: "O(n) per getMin", space: "O(1) extra", note: "No auxiliary structure, but each minimum query is a full scan." },
		},
		constraintReasoning:
			"The spec demands every operation be O(1), which forbids the on-demand scan. The fix is to *cache* the minimum at each level: the parallel min-stack trades O(n) extra space for O(1) on every call — a deliberate space-for-time swap the constraint forces.",
		approachSteps: [
			"Initialize self.stack = [] and self.minStack = [].",
			"push(val): append val to stack; append min(val, minStack[-1] if minStack else val) to minStack.",
			"pop(): pop from both stack and minStack to keep them aligned.",
			"top(): return stack[-1]. getMin(): return minStack[-1].",
		],
		complexity: {
			time: "O(1)",
			space: "O(n)",
			note: "Every operation is constant time; the parallel min-stack doubles storage to O(n).",
		},
		pitfalls: [
			"Forgetting to pop the min-stack in pop() — the two stacks desynchronize and getMin lies.",
			"On the first push, minStack is empty: guard with (minStack[-1] if minStack else val).",
			"Storing only when a new minimum appears (a valid space optimization) but then not handling equal-minimum pops correctly.",
		],
		testCases: [
			{ kind: "canonical", input: "push(-2), push(0), push(-3), getMin()", expected: "-3", note: "Min-stack top tracks the smallest, -3." },
			{ kind: "boundary", input: "push(5), getMin(), pop(), push(5)", expected: "5 then 5", note: "Single element: getMin equals top; re-pushing the same value still reports it." },
			{ kind: "trap", input: "push(-2),push(0),push(-3),pop(),getMin()", expected: "-2", note: "After popping -3, the min must revert to -2 — only possible because each level cached its own min." },
		],
		followUps: [
			"Can you do it with ONE stack by storing (value, min-so-far) tuples? Or by encoding deltas?",
			"Design a Max Stack — what changes, and what new ambiguity (popMax) appears?",
		],
		relatedNotes: ["python_builtins_for_leetcode", "space-complexity", "time-complexity"],
	},
	"22-generate-parentheses": {
		slug: "22-generate-parentheses",
		pattern: "Backtracking with a stack as the path buffer",
		recognitionSignals: [
			"generate ALL valid combinations/permutations, not just count them",
			"each choice is constrained by what has been chosen so far",
			"the result set grows combinatorially — you must prune invalid branches early",
		],
		dissection:
			"Build the string one bracket at a time using a recursion that tracks how many '(' and ')' have been placed. You may add '(' while openN < n, and add ')' only while closedN < openN (otherwise the string becomes invalid). When both counts reach n, the buffer is a complete valid string — record it.",
		intuition:
			"The two counters encode all the validity you need: never open more than n, and never close more than you have opened. By enforcing those rules at the moment of choice, every leaf of the recursion is guaranteed valid — there's no generate-then-filter waste. The stack is just the current partial string you push to and pop from as you explore.",
		invariant:
			"At every recursive call, the buffer is a valid prefix of some well-formed parenthesis string: 0 <= closedN <= openN <= n.",
		bruteForce: {
			approach:
				"Generate every possible string of 2n brackets (2^(2n) of them), then filter for the well-formed ones with a validity check. Correct, but it builds mountains of garbage to throw away.",
			complexity: { time: "O(2^(2n) · n)", space: "O(n)", note: "All 2^(2n) strings generated, each validated in O(n)." },
		},
		constraintReasoning:
			"n is tiny (≤ 8), so even exponential work is technically feasible — but generating-then-filtering wastes almost everything. Pruning at the moment of choice (never open > n, never close > open) means every leaf is valid, dropping the count to the nth Catalan number, O(4ⁿ/√n). Small-n problems are exactly where backtracking shines.",
		approachSteps: [
			"Maintain stack (the current characters) and res (completed strings).",
			"backtrack(openN, closedN): if openN == closedN == n, join the stack and append to res, then return.",
			"If openN < n: push '(', recurse with openN + 1, then pop (undo).",
			"If closedN < openN: push ')', recurse with closedN + 1, then pop (undo).",
			"Start with backtrack(0, 0); return res.",
		],
		complexity: {
			time: "O(4^n / √n)",
			space: "O(n)",
			note: "The count of valid strings is the nth Catalan number; recursion depth and buffer are O(n) (excluding the output).",
		},
		pitfalls: [
			"Allowing ')' when closedN >= openN — produces invalid strings like '())'.",
			"Forgetting to pop after recursing (the stack.pop() that undoes the choice) — branches leak state into each other.",
			"Stopping at openN == n instead of openN == closedN == n; you must also place all the closers.",
		],
		testCases: [
			{ kind: "canonical", input: "n = 3", expected: '["((()))","(()())","(())()","()(())","()()()"]', note: "5 = Catalan(3); every string is balanced." },
			{ kind: "boundary", input: "n = 1", expected: '["()"]', note: "Exactly one way to balance a single pair." },
			{ kind: "trap", input: "n = 0", expected: '[""]', note: "Zero pairs yields one result — the empty string — not an empty list." },
		],
		followUps: [
			"Why is the number of results the Catalan number? Can you derive the recurrence?",
			"How would you adapt this to generate valid combinations for k different bracket types?",
		],
		relatedNotes: ["time-complexity", "space-complexity"],
	},
	"21-merge-two-sorted-lists": {
		slug: "21-merge-two-sorted-lists",
		pattern: "Dummy-head linked-list merge with two pointers",
		recognitionSignals: [
			"merge two already-sorted linked lists into one sorted list",
			"you must splice existing nodes, not copy values",
			"handling the head node specially is awkward — a sentinel simplifies it",
		],
		dissection:
			"Create a dummy node whose .next will point at the true head. Walk both lists with a current pointer; at each step attach the smaller front node to current.next and advance that list. When one list runs out, the other (already sorted) tail is attached implicitly via the last link. Return dummy.next.",
		intuition:
			"The dummy head removes every 'is this the first node?' special case — current always has somewhere to hang the next node. Because both inputs are sorted, comparing only their fronts is enough to pick the global next-smallest, so one linear pass merges them.",
		invariant:
			"The chain from dummy.next up to current is a sorted, fully merged prefix of all nodes consumed so far, and current.next is free to receive the next-smallest remaining node.",
		approachSteps: [
			"Create dummy = ListNode(); current = dummy.",
			"While both list1 and list2 are non-null: if list1.val < list2.val, link list1 and advance list1; else link list2 and advance list2.",
			"Advance current to the node just linked.",
			"After the loop, link the remaining non-null list (the leftover sorted tail).",
			"Return dummy.next.",
		],
		complexity: {
			time: "O(n + m)",
			space: "O(1)",
			note: "Each node is visited once; only pointers are rewired — no new nodes allocated.",
		},
		pitfalls: [
			"Returning dummy instead of dummy.next — dummy is a placeholder, not real data.",
			"Forgetting to attach the leftover tail after one list empties; the shown loop relies on the final link still pointing into the non-empty list.",
			"Using <= vs < changes stability but not correctness; be deliberate if the problem cares about node identity.",
		],
		testCases: [
			{ kind: "canonical", input: "list1 = [1,2,4], list2 = [1,3,4]", expected: "[1,1,2,3,4,4]", note: "Interleaves; equal fronts (the two 1s) both flow through." },
			{ kind: "boundary", input: "list1 = [], list2 = []", expected: "[]", note: "Both empty — loop never runs, dummy.next is null." },
			{ kind: "trap", input: "list1 = [], list2 = [0]", expected: "[0]", note: "One empty list: the leftover-tail attach is what carries [0] through." },
		],
		followUps: [
			"Merge k Sorted Lists (#23): why does a heap or divide-and-conquer beat repeated pairwise merges?",
			"Could you merge recursively instead? What is the call-stack space cost?",
		],
		relatedNotes: ["time-complexity", "space-complexity"],
	},
	"567-permutation-in-string": {
		slug: "567-permutation-in-string",
		pattern: "Fixed-size sliding window with frequency-map comparison",
		recognitionSignals: [
			"does s2 contain a permutation (anagram) of s1 as a contiguous substring",
			"a permutation has the SAME character counts — order is irrelevant",
			"the window length is fixed at len(s1)",
		],
		dissection:
			"A permutation of s1 is any window of length len(s1) whose character frequencies match s1's exactly. Slide a window of that fixed width across s2: add the entering character, and once the window reaches the target width, compare frequency maps; if they match, a permutation exists. Otherwise drop the leftmost character and slide on.",
		intuition:
			"Anagrams are equal as multisets, so the question reduces to 'does any fixed-width window have the same letter counts as s1?'. Keeping a rolling frequency map means each slide is a couple of map updates rather than recounting the window from scratch.",
		invariant:
			"window_counts holds the exact character frequencies of the current window of s2, whose width is at most len(s1); once the width equals len(s1) it is compared against s1_counts.",
		bruteForce: {
			approach:
				"Slide a width-len(s1) window across s2 and, at each position, recount that window's characters from scratch to compare against s1's counts. (The truly naive version generates all k! permutations of s1 and substring-searches each.)",
			complexity: { time: "O(n·k)", space: "O(k)", note: "n window positions × O(k) to recount each; the permutation variant is a hopeless O(k!·n)." },
		},
		constraintReasoning:
			"With s2 up to ~10⁴, O(n·k) is borderline and the permutation explosion is out of the question. The fix is to make each slide O(1): add the entering char and drop the leaving char from a rolling count instead of recounting, which turns the whole scan into O(n).",
		approachSteps: [
			"If len(s1) > len(s2), return False early.",
			"Build s1_counts from s1; init window_counts = {}, L = 0.",
			"For each R: add s2[R] to window_counts.",
			"When R − L + 1 == len(s1): if window_counts == s1_counts return True; else decrement s2[L] (deleting the key if it hits 0) and advance L.",
			"If the scan finishes with no match, return False.",
		],
		complexity: {
			time: "O(n)",
			space: "O(1)",
			note: "n = len(s2). Dict equality compares at most 26 keys, a constant; window-count map is bounded by the alphabet.",
		},
		pitfalls: [
			"Comparing maps but forgetting to DELETE a key when its count drops to 0 — a lingering 'x: 0' makes window_counts != s1_counts even when frequencies actually match.",
			"Skipping the len(s1) > len(s2) early return; the window can never reach full width otherwise.",
			"Re-counting the whole window each step instead of incrementally adding/removing — turns O(n) into O(n·k).",
		],
		testCases: [
			{ kind: "canonical", input: 's1 = "ab", s2 = "eidbaooo"', expected: "true", note: "'ba' is a permutation of 'ab' sitting inside s2." },
			{ kind: "boundary", input: 's1 = "a", s2 = "a"', expected: "true", note: "Window of width 1 matches immediately." },
			{ kind: "trap", input: 's1 = "ab", s2 = "eidboaoo"', expected: "false", note: "'a' and 'b' both appear but never adjacent in one width-2 window — substring, not subsequence." },
		],
		followUps: [
			"Find All Anagrams in a String (#438) collects every start index — same window, different output.",
			"Could you replace the dict comparison with a single 'matches' counter for true O(1)-per-step updates?",
		],
		relatedNotes: ["sliding_window", "arrays_and_hashing", "python_builtins_for_leetcode", "time-complexity"],
	},
	"239-sliding-window-maximum": {
		slug: "239-sliding-window-maximum",
		pattern: "Sliding window maximum via a heap with lazy eviction",
		recognitionSignals: [
			"report the maximum of every fixed-size window as it slides",
			"recomputing each window's max from scratch is O(n·k)",
			"you need fast access to the current largest while supporting eviction",
		],
		dissection:
			"Push each element as a (−value, index) pair into a heap so the smallest tuple is the largest value (Python's heapq is a min-heap). The heap top is the window max — but it may be stale (its index already slid out of view). Before reading the max, lazily pop any top whose index is <= i − k. Record −heap[0][0] for each window.",
		intuition:
			"You don't need to remove out-of-window elements eagerly. As long as the CURRENT maximum's index is still inside the window, stale smaller entries buried in the heap don't affect the answer. You only evict from the top, and only when the top itself has expired — that lazy deletion keeps the bookkeeping cheap.",
		invariant:
			"After the eviction loop for window ending at i, heap[0] is the largest element whose index lies within [i − k + 1, i]; stale entries may remain deeper in the heap but never at the top.",
		bruteForce: {
			approach:
				"For each of the n − k + 1 windows, scan all k elements to find the maximum. No bookkeeping, but every window is recomputed independently.",
			complexity: { time: "O(n·k)", space: "O(1)", note: "(n−k+1) windows × O(k) scan each." },
		},
		constraintReasoning:
			"n reaches ~10⁵ and k can be large, so O(n·k) approaches 10¹⁰ — too slow. The shown heap with lazy eviction gets to O(n log n); a monotonic deque (kept in decreasing order so the front is always the window max) reaches the true optimum O(n) with O(k) space. This is a three-rung ladder, and the heap is the accessible middle.",
		approachSteps: [
			"Handle bases: if n·k == 0 return []; if k == 1 return nums.",
			"Push the first k elements as (−nums[i], i); record −heap[0][0] as the first window max.",
			"For i from k to n − 1: push (−nums[i], i).",
			"While heap[0][1] <= i − k, heappop (evict the expired top).",
			"Append −heap[0][0] to the result.",
		],
		complexity: {
			time: "O(n log n)",
			space: "O(n)",
			note: "Heap pushes are O(log n) and the heap can grow to O(n) before stale entries are evicted; the classic monotonic-deque solution achieves O(n)/O(k).",
		},
		pitfalls: [
			"Negating on push but forgetting to negate back when reading the max (−heap[0][0]).",
			"Eviction condition off-by-one: an index is out of window when index <= i − k (the window is [i−k+1, i]).",
			"The heap grows to O(n) because stale entries are only evicted from the top — a monotonic deque bounds space to O(k).",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [1,3,-1,-3,5,3,6,7], k = 3", expected: "[3,3,5,5,6,7]", note: "The README walkthrough; max tracks each window." },
			{ kind: "boundary", input: "nums = [1], k = 1", expected: "[1]", note: "k == 1 short-circuits — every element is its own window max." },
			{ kind: "trap", input: "nums = [7,2,4], k = 2", expected: "[7,4]", note: "After the window passes index 0, the stale 7 at the heap top must be evicted before reading max for [2,4]." },
		],
		followUps: [
			"Implement the monotonic-deque version for true O(n) — how does it keep candidates in decreasing order?",
			"When is the heap approach actually preferable despite the extra log factor?",
		],
		relatedNotes: ["sliding_window", "python_builtins_for_leetcode", "time-complexity", "space-complexity"],
	},
	"53-maximum-subarray": {
		slug: "53-maximum-subarray",
		pattern: "Kadane's algorithm — extend a helpful prefix or restart",
		recognitionSignals: [
			"maximize the sum of one non-empty contiguous subarray",
			"the answer is a sum, not the elements or their indices",
			"a quadratic scan of every start/end pair becomes too expensive as n grows",
		],
		dissection:
			"Scan left to right while tracking two values: current, the best sum of a subarray that must end at this index, and globalMax, the best sum seen anywhere. For each number, either extend current or start a new subarray at this number — choose whichever is larger.",
		intuition:
			"A negative running sum is baggage: adding it to any future number only makes that future candidate worse. So retain a prefix only while it helps. This local extend-or-restart decision is enough because every possible subarray has one final index, and current represents the best candidate for that exact ending point.",
		invariant:
			"After processing index i, curSum is the maximum sum of every non-empty subarray ending exactly at i, and maxSum is the maximum sum of every non-empty subarray ending at or before i.",
		bruteForce: {
			approach:
				"Try every start index and extend an end index to its right, accumulating the sum for every contiguous subarray and recording the largest.",
			complexity: {
				time: "O(n²)",
				space: "O(1)",
				note: "There are O(n²) start/end ranges even when each range sum is updated incrementally.",
			},
		},
		constraintReasoning:
			"With n up to 10⁵, O(n²) can mean about 10¹⁰ candidate ranges, which is not viable. The key improvement is to summarize every prior range relevant to the next element in one number: the best sum ending immediately before it.",
		approachSteps: [
			"Initialize maxSum = nums[0] so an all-negative input still returns its largest element rather than 0.",
			"Initialize curSum = 0; it represents the running candidate that may be extended.",
			"For each n, set curSum = max(curSum + n, n): either extend the previous candidate or restart at n.",
			"Update maxSum = max(maxSum, curSum).",
			"After the scan, return maxSum.",
		],
		complexity: {
			time: "O(n)",
			space: "O(1)",
			note: "One constant-time decision per element; only two running sums are stored.",
		},
		pitfalls: [
			"Resetting curSum to 0 and returning 0 for an all-negative array; the subarray must be non-empty, so initialize maxSum from nums[0].",
			"Tracking only curSum: it can fall after the true best range has already occurred, so keep a separate global maximum.",
			"Using max(0, n), which ignores the previous current sum and finds only the largest single element. The equivalent rewrite is max(curSum, 0) + n.",
			"Confusing a subarray (contiguous) with a subsequence (elements may be skipped).",
		],
		testCases: [
			{
				kind: "canonical",
				input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
				expected: "6",
				note: "The winning range [4,-1,2,1] shows that a small negative can be worth keeping inside a larger positive run.",
			},
			{
				kind: "boundary",
				input: "nums = [5]",
				expected: "5",
				note: "A one-element input must return that element; no empty subarray is allowed.",
			},
			{
				kind: "trap",
				input: "nums = [-3,-2,-5]",
				expected: "-2",
				note: "Breaks implementations that reset negative sums to 0 and accidentally allow an empty answer.",
			},
		],
		followUps: [
			"Return the start and end indices too: what extra state records the current restart point and the best range?",
			"Maximum Sum Circular Subarray (#918): why is a wrapped answer equal to total minus a minimum-sum middle gap?",
			"Can you divide and conquer the array while tracking prefix, suffix, and total sums?",
		],
		relatedNotes: ["kadane_algorithm", "arrays_and_hashing", "python-big-o-cheatsheet", "time-complexity"],
	},
	"918-maximum-sum-circular-subarray": {
		slug: "918-maximum-sum-circular-subarray",
		pattern: "Dual Kadane — maximum arc versus total minus minimum gap",
		recognitionSignals: [
			"the array is circular: the final element connects back to the first",
			"maximize a non-empty contiguous subarray that may wrap across that seam",
			"the wrapped choice is a suffix plus a prefix, leaving one contiguous middle gap",
		],
		dissection:
			"Compute the usual maximum subarray sum and the minimum subarray sum while accumulating the total. The answer either does not wrap, in which case it is globalMax, or it wraps, in which case it is the whole array minus the minimum-sum contiguous gap: total - globalMin.",
		intuition:
			"Do not try to manually wrap indices. A wrapped arc keeps a suffix and a prefix; its complement is exactly one ordinary, non-wrapping middle block. The whole-array total is fixed, so the largest kept arc comes from removing the smallest block. A mirrored Kadane pass finds that block in the same scan.",
		invariant:
			"After processing index i, curMax and curMin are respectively the largest and smallest non-empty subarray sums ending at i; globalMax and globalMin are the best such values anywhere through i; total is the sum of nums[0..i].",
		bruteForce: {
			approach:
				"Choose every starting position and extend a circular subarray up to n elements, adding one number at a time and recording the best non-empty sum.",
			complexity: {
				time: "O(n²)",
				space: "O(1)",
				note: "There are n starts and up to n legal lengths; an element may not be selected twice.",
			},
		},
		constraintReasoning:
			"n reaches roughly 3 × 10⁴, so enumerating all circular arcs can require about 9 × 10⁸ checks. The two Kadane recurrences make one constant-time max decision and one constant-time min decision per element, reducing the scan to O(n).",
		approachSteps: [
			"Initialize globalMax and globalMin from nums[0], and curMax = curMin = total = 0.",
			"For each n, update curMax = max(curMax + n, n) and globalMax = max(globalMax, curMax). This is the best non-wrapping candidate.",
			"In the same iteration, update curMin = min(curMin + n, n) and globalMin = min(globalMin, curMin). This identifies the worst contiguous gap to remove.",
			"Accumulate total += n, then compute the wrapped candidate as total - globalMin.",
			"If globalMax <= 0, return globalMax because removing the entire array would produce an invalid empty subarray; otherwise return max(globalMax, total - globalMin).",
		],
		complexity: {
			time: "O(n)",
			space: "O(1)",
			note: "A single scan maintains five scalar values; no duplicate array or modulo index arithmetic is required.",
		},
		pitfalls: [
			"Using only total - globalMin: the winning subarray may not wrap, so always compare it with globalMax.",
			"For all-negative inputs, globalMin is the whole array and total - globalMin is 0, which represents an invalid empty subarray. Return globalMax instead.",
			"Flipping only the global comparison but not the recurrence: the min pass needs min(curMin + n, n), equivalently min(curMin, 0) + n.",
			"Duplicating the array and allowing a candidate longer than n, which illegally reuses elements.",
		],
		testCases: [
			{
				kind: "canonical",
				input: "nums = [5,-3,5]",
				expected: "10",
				note: "Skip the minimum gap [-3], then the last 5 wraps to the first 5.",
			},
			{
				kind: "boundary",
				input: "nums = [5]",
				expected: "5",
				note: "A single element is both the only linear subarray and the only valid circular arc.",
			},
			{
				kind: "trap",
				input: "nums = [-3,-2,-3]",
				expected: "-2",
				note: "The complement formula would produce 0 by removing the whole array; the non-empty guard must return the least-negative element.",
			},
		],
		followUps: [
			"Return the actual circular indices: how would you store start/end indices for both the max and min Kadane passes?",
			"Why is every wrapped arc the complement of exactly one non-wrapping contiguous gap?",
			"Compare this O(n)/O(1) approach with the doubled-array + monotonic-deque formulation.",
		],
		relatedNotes: ["kadane_algorithm", "arrays_and_hashing", "python-big-o-cheatsheet", "time-complexity"],
	},
	"1768-merge-strings-alternately": {
		slug: "1768-merge-strings-alternately",
		pattern: "Paired streaming merge with a tail append",
		recognitionSignals: [
			"take one item from each of two ordered sequences in turn",
			"the inputs may have unequal lengths, so one sequence can outlive the other",
			"the output preserves order within each input rather than globally sorting values",
		],
		dissection:
			"Build one result by alternating the next unused character from word1 and word2. Once either word is exhausted, append the untouched suffix of the other word exactly as it appears.",
		intuition:
			"The alternating portion has a simple paired structure: each loop consumes one character from both words. That structure ends at the shorter word, leaving a contiguous tail in the longer word; slicing and appending that tail avoids extra special cases.",
		invariant:
			"After each paired iteration, result contains the correct alternating merge of word1[:i] and word2[:j], with i == j and no character from either consumed prefix missing or reordered.",
		bruteForce: {
			approach:
				"Repeatedly concatenate single characters onto an immutable string. It expresses the right order, but each concatenation may copy the accumulated prefix again.",
			complexity: { time: "O((m+n)²)", space: "O(m+n)", note: "Repeated string copies can make append-heavy concatenation quadratic." },
		},
		constraintReasoning:
			"The strings can each be large enough that repeatedly rebuilding the output is needless work. Collecting characters in a list and joining once keeps every input character to one append and one final copy.",
		approachSteps: [
			"Initialize i = j = 0 and an empty list result.",
			"While both words still have a character, append word1[i], then word2[j], and advance both indices.",
			"Append word1[i:] and word2[j:]; exactly one is non-empty, except when both words end together.",
			"Join result into the final string.",
		],
		complexity: { time: "O(m+n)", space: "O(m+n)", note: "The output list stores every character once." },
		pitfalls: [
			"Stopping after the paired loop and forgetting the remaining suffix of the longer word.",
			"Appending only one tail with an if/else when appending both slices is simpler and harmless.",
			"Repeated string concatenation inside the loop instead of buffering characters and joining once.",
		],
		testCases: [
			{ kind: "canonical", input: 'word1 = "abc", word2 = "pqr"', expected: '"apbqcr"', note: "Equal-length inputs alternate through their final characters." },
			{ kind: "boundary", input: 'word1 = "", word2 = "abc"', expected: '"abc"', note: "An empty word leaves the other word unchanged." },
			{ kind: "trap", input: 'word1 = "ab", word2 = "pqrs"', expected: '"apbqrs"', note: "After two paired steps, the tail rs must remain in order." },
		],
		followUps: [
			"Generalize from two inputs to k iterators: what data structure controls whose turn it is?",
			"How would the approach change if alternation started with the longer word rather than always word1?",
		],
		relatedNotes: ["two_pointers", "python-dsa-toolkit"],
	},
	"18-4sum": {
		slug: "18-4sum",
		pattern: "Sort, fix two values, then solve a two-sum with opposite pointers",
		recognitionSignals: [
			"find unique groups of four values that sum to a target",
			"the output contains value combinations rather than original indices",
			"sorting makes duplicate removal and sum-directed pointer motion possible",
		],
		dissection:
			"Return every unique quadruplet whose values add to target. Sort first, choose the first two positions with nested loops, then use left and right pointers to find the remaining pair in the suffix.",
		intuition:
			"Sorting turns the remaining two-sum into a monotone search: if the four-value sum is too small, only moving left rightward can increase it; if it is too large, only moving right leftward can decrease it. Skipping repeated values at every level gives each value combination one canonical construction.",
		invariant:
			"For fixed i and j, left and right delimit all unexamined pairs in the sorted suffix nums[j+1:], and every emitted quadruplet is sorted, sums to target, and has not been emitted before.",
		bruteForce: {
			approach:
				"Enumerate every i < j < k < l quadruple, test its sum, and store normalized matches in a set to remove duplicates.",
			complexity: { time: "O(n⁴)", space: "O(number of answers)", note: "Four nested choices are too expensive before duplicate handling is even considered." },
		},
		constraintReasoning:
			"With n up to roughly 200, n⁴ can reach billions of candidate tuples. Sorting once and reducing the last two choices to a linear pointer sweep makes the dominant work O(n³), which is practical for the stated scale.",
		approachSteps: [
			"Sort nums so equal values are adjacent and pointer moves have a predictable effect on the sum.",
			"For each first index i, skip it when it repeats the previous first value.",
			"For each second index j after i, skip it when it repeats the previous second value for this same i.",
			"Set left = j + 1 and right = n − 1. Move left for a sum below target and right for a sum above target.",
			"On an exact sum, record the quadruplet, move both pointers, then skip equal left and right values before continuing.",
		],
		complexity: { time: "O(n³)", space: "O(1)", note: "Ignoring the returned quadruplets; sorting may use implementation-dependent auxiliary space." },
		pitfalls: [
			"Skipping nums[j] whenever it equals nums[j-1] instead of only when j > i + 1; a valid quadruplet may use the same value in both fixed positions.",
			"After finding a match, moving only one pointer or failing to skip pair duplicates, which emits repeated quadruplets.",
			"Using an overflow-prone integer type in languages where four values can exceed 32-bit range.",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [1,0,-1,0,-2,2], target = 0", expected: "[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]", note: "Several solutions share values; sorting gives every answer a canonical order." },
			{ kind: "boundary", input: "nums = [1,2,3], target = 6", expected: "[]", note: "Fewer than four elements cannot form a quadruplet." },
			{ kind: "trap", input: "nums = [2,2,2,2,2], target = 8", expected: "[[2,2,2,2]]", note: "All equal values produce one valid combination, not several duplicates." },
		],
		followUps: [
			"Generalize to k-sum: where is the recursion base case and where do two pointers take over?",
			"Add lower/upper-bound pruning after sorting. What sums can the smallest or largest remaining values make?",
		],
		relatedNotes: ["two_pointers", "time-complexity"],
	},
	"26-remove-duplicates-from-sorted-array": {
		slug: "26-remove-duplicates-from-sorted-array",
		pattern: "Read/write two pointers over a sorted sequence",
		recognitionSignals: [
			"modify a sorted array in place and return the meaningful prefix length",
			"duplicates appear in adjacent runs because the input is sorted",
			"one pointer scans while another marks the next output position",
		],
		dissection:
			"Keep exactly one copy of each distinct value at the front of nums. A fast pointer inspects every value; a slow pointer marks the last unique value written. When fast discovers a new value, extend the unique prefix and copy it there.",
		intuition:
			"In sorted order, a number is new precisely when it differs from the last unique value. That makes the array itself a valid output buffer: no separate set is needed, and the prefix before slow always contains the final answer so far.",
		invariant:
			"Before each fast iteration, nums[:slow+1] contains every distinct value from nums[:fast] exactly once in sorted order, and slow points at that prefix's final element.",
		bruteForce: {
			approach:
				"Scan the array and delete each duplicate in place as it appears. Each deletion shifts the remaining suffix left.",
			complexity: { time: "O(n²)", space: "O(1)", note: "A long duplicate run repeatedly shifts O(n) remaining elements." },
		},
		constraintReasoning:
			"n can reach tens of thousands, so repeated middle deletions turn one linear scan into quadratic shifting. A read/write sweep inspects each entry once and writes only when the distinct prefix grows.",
		approachSteps: [
			"Return 0 for an empty input; otherwise set slow = 0 for the first unique value.",
			"Advance fast from index 1 through the array.",
			"If nums[fast] differs from nums[slow], increment slow and write nums[fast] at nums[slow].",
			"Return slow + 1 because slow is an index, while the task asks for a count.",
		],
		complexity: { time: "O(n)", space: "O(1)", note: "The input array doubles as the output buffer." },
		pitfalls: [
			"Returning slow instead of slow + 1, which confuses the last written index with the number of unique values.",
			"Comparing fast to nums[fast-1] after overwriting positions; compare to nums[slow], the last unique value kept.",
			"Assuming there is a first value without handling nums = [].",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [1,1,2]", expected: "k = 2; nums[:2] = [1,2]", note: "The second 1 is skipped and 2 is copied into the next output slot." },
			{ kind: "boundary", input: "nums = []", expected: "k = 0", note: "There is no first unique value to seed the prefix." },
			{ kind: "trap", input: "nums = [1,1,1,1]", expected: "k = 1; nums[:1] = [1]", note: "A whole duplicate run must not advance the write pointer." },
		],
		followUps: [
			"Keep at most two copies of each value: how do you decide whether the current read value is allowed? See #80.",
			"Remove a chosen value rather than duplicates. What does the write-pointer invariant become?",
		],
		relatedNotes: ["two_pointers", "python-dsa-toolkit"],
	},
	"80-remove-duplicates-from-sorted-array-ii": {
		slug: "80-remove-duplicates-from-sorted-array-ii",
		pattern: "Read/write two pointers, keep at most two copies",
		recognitionSignals: [
			"sorted array, modify in place, return the compacted prefix length",
			"each value may appear at most twice, not once",
			"O(1) extra space — the input is also the output buffer",
		],
		dissection:
			"Keep at most two copies of each value at the front of nums. A read pointer scans every candidate; a write pointer marks the next keep-slot. Write the candidate only when it would not become a third copy of the prefix already accepted.",
		intuition:
			"This is the same read/write compaction as #26, with the keep rule relaxed from 1 to 2. l is the next keep-slot; nums[:l] is already a legal answer. When a value is rejected, l stays put — that slot is now a hole, not a swap partner. The next keeper is copied into the waiting l. Sorted order makes the third-copy test a single comparison against the value two accepted slots behind: nums[r] != nums[l - 2].",
		invariant:
			"After each read, nums[:l] is the correct compaction of nums[:r+1] — sorted, at most two of each value. Values from l onward may be holes or unread input and do not matter.",
		bruteForce: {
			approach:
				"Count each equal-value run, then delete extras beyond the second copy by shifting the remaining suffix left.",
			complexity: {
				time: "O(n²)",
				space: "O(1)",
				note: "A long run of extras repeatedly shifts O(n) remaining elements.",
			},
		},
		constraintReasoning:
			"n reaches 3·10⁴, so deleting extras with suffix shifts is quadratic and risks TLE. A single read/write pass inspects each entry once and writes only when the compacted prefix grows.",
		approachSteps: [
			"Set l = 0 as the next keep-slot.",
			"Scan every index r.",
			"If l < 2, the first two values are always legal — write nums[r] at l and increment l. The l < 2 check must come first so Python never evaluates nums[l - 2] as nums[-2].",
			"Otherwise write iff nums[r] != nums[l - 2]: that comparison asks whether the candidate would be a third copy of the already-accepted prefix.",
			"Return l. Unlike #26, l is already a length (the next open index), not the last-written index.",
		],
		complexity: { time: "O(n)", space: "O(1)", note: "One pass; the input array doubles as the output buffer." },
		pitfalls: [
			"Evaluating nums[l - 2] before guarding with l < 2. In Python that silently reads nums[-2] from the tail instead of raising IndexError.",
			"Comparing against nums[r - 2] instead of nums[l - 2]. r still sits in the dirty suffix; only l indexes the compacted prefix.",
			"Returning l + 1. In #26, slow is a last-written index so you add 1. Here l is already the compacted length.",
			"Treating a stalled l as a swap. Rejecting a value parks l on a hole; the next keeper overwrites that hole. The old nums[l] is already either kept earlier or a discarded extra.",
		],
		testCases: [
			{
				kind: "canonical",
				input: "nums = [1,1,1,2,2,3]",
				expected: "k = 5; nums[:5] = [1,1,2,2,3]",
				note: "The third 1 is skipped; l stays on that hole and the next keeper (2) is copied there.",
			},
			{
				kind: "boundary",
				input: "nums = [1,1]",
				expected: "k = 2; nums[:2] = [1,1]",
				note: "Both values are kept by the l < 2 base case; the l - 2 comparison never runs.",
			},
			{
				kind: "trap",
				input: "nums = [1,1,1,1]",
				expected: "k = 2; nums[:2] = [1,1]",
				note: "After two writes, every later 1 equals nums[l - 2], so l never moves again.",
			},
		],
		followUps: [
			"Generalize to at most k copies: what do you compare against, and what is the base-case guard?",
			"How does this keep rule differ from #26 (keep 1) and from removing a chosen value (#27)?",
		],
		relatedNotes: ["two_pointers", "python-dsa-toolkit"],
	},
	"88-merge-sorted-array": {
		slug: "88-merge-sorted-array",
		pattern: "Backward merge with two read pointers and one write pointer",
		recognitionSignals: [
			"merge two sorted arrays into the spare capacity of the first one",
			"writing from the front could overwrite unread nums1 values",
			"the largest remaining value belongs safely at the final open position",
		],
		dissection:
			"nums1 has m meaningful sorted values followed by n empty slots. Compare the largest unused values in nums1 and nums2, write the larger into nums1's last open slot, and move backward until nums2 is exhausted.",
		intuition:
			"The empty capacity is at nums1's right edge, so fill it from right to left. That direction protects nums1's smaller unread values: every write goes into a slot that is either empty or has already been consumed as a source.",
		invariant:
			"At every step, nums1[k+1:] contains the largest values from the original inputs in their final sorted order; nums1[:i+1] and nums2[:j+1] are the only unread values.",
		bruteForce: {
			approach:
				"Copy nums2 into nums1's spare slots, then sort all m+n values.",
			complexity: { time: "O((m+n) log(m+n))", space: "O(1)", note: "It works but ignores that both inputs are already sorted." },
		},
		constraintReasoning:
			"Both inputs arrive sorted, so a comparison merge can use one linear pass rather than paying for a fresh sort. The in-place requirement also rules out constructing a separate merged array as the primary answer.",
		approachSteps: [
			"Set i = m − 1, j = n − 1, and k = m + n − 1.",
			"While i and j are both valid, copy the larger of nums1[i] and nums2[j] into nums1[k], then decrement its read pointer and k.",
			"If nums2 still has entries, copy its remaining prefix into nums1; those values have no earlier nums1 value left to compare.",
			"Do not copy a remaining nums1 prefix: it is already in its correct positions.",
		],
		complexity: { time: "O(m+n)", space: "O(1)", note: "Three indices and no auxiliary merged array." },
		pitfalls: [
			"Merging left to right and overwriting a nums1 value that has not been compared yet.",
			"Forgetting the nums2 cleanup loop when nums1 is exhausted first.",
			"Adding an unnecessary nums1 cleanup loop, which can overwrite already-correct values.",
		],
		testCases: [
			{ kind: "canonical", input: "nums1 = [1,2,3,0,0,0], m = 3; nums2 = [2,5,6], n = 3", expected: "nums1 = [1,2,2,3,5,6]", note: "Each largest remaining value is placed at the far right." },
			{ kind: "boundary", input: "nums1 = [0], m = 0; nums2 = [1], n = 1", expected: "nums1 = [1]", note: "All output comes from nums2, so its cleanup loop does the work." },
			{ kind: "trap", input: "nums1 = [4,5,6,0,0,0], m = 3; nums2 = [1,2,3], n = 3", expected: "nums1 = [1,2,3,4,5,6]", note: "Once nums1 is consumed from the right, nums2's remaining prefix still must be copied." },
		],
		followUps: [
			"Merge when nums1 has no spare capacity: what additional storage is unavoidable?",
			"How do stable merge requirements change the tie decision when equal values appear?",
		],
		relatedNotes: ["two_pointers", "python-dsa-toolkit"],
	},
	"189-rotate-array": {
		slug: "189-rotate-array",
		pattern: "Three-step sequence reversal (Algebraic Monoid Anti-automorphism)",
		recognitionSignals: [
			"rotate array right by k steps in-place with O(1) extra space",
			"cyclic shift of blocks: XY -> YX",
			"in-place requirement forbids auxiliary buffer copy",
		],
		dissection:
			"Rotating the array right by k positions moves the suffix of length k (Y) to the front and the prefix of length n-k (X) to the back. Reversing the entire array places the two blocks into their target relative positions (Y^R X^R), and subsequent local reversals of the first k elements and the remaining n-k elements restore the internal ordering to produce YX.",
		intuition:
			"Sequence reversal acts like the matrix transpose: (XY)^R = Y^R X^R. Flipping the whole container swaps the two segments, but inverts each segment's contents. Applying two targeted sub-reversals cancels the local inversions via the involution property ((A^R)^R = A), achieving in-place rotation in O(n) time and O(1) space.",
		invariant:
			"After full reversal, the suffix block occupies index range [0, k-1] (inverted) and the prefix block occupies [k, n-1] (inverted). Each sub-reversal restores a block to its forward orientation.",
		bruteForce: {
			approach:
				"Rotate by 1 step k times, shifting all n elements to the right on each step.",
			complexity: { time: "O(n * k)", space: "O(1)", note: "Shifting the entire array k times is too slow for large inputs." },
		},
		constraintReasoning:
			"Allocating a helper array makes rotation trivial in O(n) time and O(n) space, but the follow-up strictly demands O(1) auxiliary space. The three-reversal trick provides the optimal balance of O(n) time and O(1) memory without cyclic jump book-keeping.",
		approachSteps: [
			"Normalize k = k % n to handle rotations where k >= n.",
			"Reverse the entire array from index 0 to n - 1.",
			"Reverse the first k elements from index 0 to k - 1.",
			"Reverse the remaining n - k elements from index k to n - 1.",
		],
		complexity: { time: "O(n)", space: "O(1)", note: "Each element is visited and swapped at most twice." },
		pitfalls: [
			"Forgetting to normalize k with k %= len(nums), which causes IndexError when k > n.",
			"Reversing ranges with wrong endpoints (e.g. index k instead of k - 1 for the first block).",
			"Assuming k is strictly less than array length.",
		],
		testCases: [
			{ kind: "canonical", input: "nums = [1,2,3,4,5,6,7], k = 3", expected: "[5,6,7,1,2,3,4]", note: "Suffix [5,6,7] shifts to front, prefix [1,2,3,4] shifts to back." },
			{ kind: "boundary", input: "nums = [1,2], k = 3", expected: "[2,1]", note: "k > n: k % 2 = 1, so effective rotation is 1 step." },
			{ kind: "trap", input: "nums = [1,2,3], k = 0", expected: "[1,2,3]", note: "k = 0 is an identity no-op rotation." },
		],
		followUps: [
			"How does the cyclic replacement (juggling algorithm) achieve the same in O(1) space using gcd(n, k)?",
			"How do you rotate left by k steps instead of right using reversal?",
		],
		relatedNotes: ["two_pointers", "python-dsa-toolkit"],
	},
	"881-boats-to-save-people": {
		slug: "881-boats-to-save-people",
		pattern: "Greedy + Two Pointers (Extreme-ends pairing)",
		recognitionSignals: [
			"minimize number of containers/boats with fixed capacity and max 2 items",
			"pairing elements subject to a sum constraint",
			"sorting allows pairing the heaviest with the lightest available",
		],
		dissection:
			"Each boat carries at most 2 people and has a weight limit. The heaviest person currently waiting must get on a boat; to minimize boats, pair them with the lightest person if their sum fits within the limit. Otherwise, the heaviest person must ride alone.",
		intuition:
			"The heaviest person is the hardest constraint to satisfy. If they cannot share a boat with the lightest person available, they cannot share with anyone, so they must ride solo. If they can share with the lightest person, doing so is always optimal because it preserves lighter spots for heavier remaining people.",
		invariant:
			"At each iteration, people with indices > right have been assigned to boats, and people with indices < left have been paired. The person at `right` is always assigned to the current boat.",
		bruteForce: {
			approach:
				"Try all pairwise combinations of people and count minimum valid boat configurations.",
			complexity: { time: "Exponential / O(2^n)", space: "O(n)", note: "Combinatorial search is infeasible for n up to 50,000." },
		},
		constraintReasoning:
			"With n up to 50,000, an O(n log n) sorting step followed by a linear O(n) two-pointer sweep easily runs within limits while providing guaranteed optimal pairing.",
		approachSteps: [
			"Sort people array in ascending order.",
			"Initialize `left = 0` (lightest) and `right = len(people) - 1` (heaviest).",
			"While left <= right, check if people[left] + people[right] <= limit.",
			"If sum <= limit, advance `left += 1` to pair the lightest person.",
			"Always decrement `right -= 1` because the heaviest person takes this boat.",
			"Increment the boat count and repeat until all people are accommodated.",
		],
		complexity: { time: "O(n log n)", space: "O(1)", note: "Sorting dominates the time complexity; auxiliary space is O(1) (or O(n) for sort)." },
		pitfalls: [
			"Forgetting that a boat can hold AT MOST 2 people (not arbitrarily many within the weight limit).",
			"Using `<` instead of `<=` in the while condition, stranding the final middle person.",
			"Trying to pair the two lightest people together instead of the heaviest with the lightest.",
		],
		testCases: [
			{ kind: "canonical", input: "people = [3,2,2,1], limit = 3", expected: "3", note: "Pairs: (1,2), (2), (3) = 3 boats." },
			{ kind: "boundary", input: "people = [1,2], limit = 3", expected: "1", note: "1 + 2 = 3 <= 3 fits in a single boat." },
			{ kind: "trap", input: "people = [3,5,3,4], limit = 5", expected: "4", note: "None can be paired because smallest sum 3+3=6 > 5; all 4 ride solo." },
		],
		followUps: [
			"What if boats could hold up to 3 people or unlimited people? (Reduces to Bin Packing NP-hard problem).",
			"Can this be solved in O(n + limit) time using counting sort if limit is small?",
		],
		relatedNotes: ["two_pointers", "python-dsa-toolkit"],
	},
} satisfies AlgorithmGuides;

export function getGuide(slug: string): AlgorithmGuide | undefined {
	return (guides as AlgorithmGuides)[slug];
}
