---
title: TypeScript DSA Quick Reference
description: A task-to-tool lookup for TypeScript built-ins, syntax, and Python-to-TS translations while solving LeetCode.
category: Languages
order: 4
status: stable
tags:
  - typescript
  - dsa
  - cheatsheet
  - quick-reference
---

# TypeScript DSA Quick Reference

Use this note when you already know the algorithm and need the TypeScript spelling. Pattern notes still own the invariant.

> **Choose your reference**
>
> - Choosing a TS tool → **TypeScript DSA Quick Reference** (this note)
> - Choosing a Python tool → [Python DSA Quick Reference](../python-dsa-toolkit/)
> - Checking Python operation costs → [Python Big O Cheatsheet](../python-big-o-cheatsheet/)

Run a solution from the repo root with the Bun project (`bun install`, then `bun src/leetcode/<pattern>/<name>.ts`). Do not hang algorithm files off `web/`.

---

## Quick-Pick Table

| When you need... | Reach for... | Remember |
|---|---|---|
| Fast membership or deduplication | `Set<T>` | `has` / `add` / `delete`, not `in` |
| Key → value lookup | `Map<K, V>` | Prefer this over `{[k: string]: V}` when keys are numbers |
| Frequency counts | `Map<T, number>` | There is no `Counter` |
| Missing numeric defaults | `map.get(x) ?? 0` | `Map.get` returns `undefined`, not a default |
| Stack, DFS, monotonic stack | `T[]` | `push` / `pop` at the end |
| Queue or BFS | `T[]` with an index, or a deque | `shift()` is O(n); see [Queue](#queue-and-bfs) |
| Repeated minimum or Top-K | sorted array, or a handwritten heap | No `heapq` in the language |
| Infinity sentinel | `Infinity` / `-Infinity` | Same role as `math.inf` |
| Character code | `s.charCodeAt(i)` | There is no `ord` / `chr` pair you will use daily |
| Adjacent pairs | `for` with `i` and `i + 1` | No `itertools.pairwise` |
| Memoized recursion | `Map` keyed by a string/tuple, or a typed cache | No `@lru_cache` |

---

## Python → TypeScript Cheat Sheet

| Python | TypeScript |
|---|---|
| `def f(nums: list[int], k: int) -> bool:` | `function f(nums: number[], k: number): boolean` |
| `None` | `null` or `undefined` — they are not the same |
| `True` / `False` | `true` / `false` |
| `and` / `or` / `not` | `&&` / `\|\|` / `!` |
| `x // y` | `Math.floor(x / y)` (or `Math.trunc` toward zero) |
| `float("inf")` | `Infinity` |
| `len(xs)` | `xs.length` |
| `for i, x in enumerate(xs):` | `for (let i = 0; i < xs.length; i++)` or `xs.entries()` |
| `for x in xs:` | `for (const x of xs)` |
| `x in some_set` | `someSet.has(x)` |
| `d[k]` missing → `KeyError` | `map.get(k)` → `undefined`; `obj[k]` → `undefined` |
| `list.append` / `list.pop()` | `arr.push` / `arr.pop()` |
| `set.add` / `set.remove` | `set.add` / `set.delete` |
| `dict.get(k, 0)` | `map.get(k) ?? 0` |
| `"".join(parts)` | `parts.join("")` |
| `s[i]` | `s[i]` or `s.charAt(i)` — both are the one character, not a byte |
| `if __name__ == "__main__":` | `if (import.meta.main) { ... }` under Bun |

`==` vs `===`: always use `===`. `==` coerces types (`0 == ""` is `true`).

---

## Types You Will Actually Write

```ts
function containsNearbyDuplicate(nums: number[], k: number): boolean {
  const window = new Set<number>();
  let left = 0;
  // ...
  return false;
}
```

| Annotation | Meaning |
|---|---|
| `number` | Integers and floats. There is no `int`. |
| `string` | Immutable, like Python `str`. |
| `boolean` | `true` / `false` |
| `T[]` or `Array<T>` | Dynamic array. Same role as `list`. |
| `Set<T>` | Hash set |
| `Map<K, V>` | Hash map |
| `T \| null` | A value that may be missing. Common on trees and lists. |

`const` means the *binding* cannot be reassigned. The array or set it points at is still mutable.

```ts
const nums = [1, 2, 3];
nums.push(4);      // ok
// nums = [];      // error

let left = 0;
left += 1;         // needs let
```

Use `const` by default. Switch to `let` for pointers, running sums, and answers that change.

---

## Arrays

```ts
const nums: number[] = [];
nums.push(x);            // append, O(1) amortized
const last = nums.pop(); // remove last, O(1); may be undefined
nums[i];                 // O(1); out of range is undefined, not an exception
nums.length;
nums.at(-1);             // last element, or undefined

const copy = nums.slice();           // shallow copy
const mid = nums.slice(left, right); // [left, right)
const reversed = nums.slice().reverse();

nums.sort((a, b) => a - b);          // MUTATES. Numeric compare is required.
const sorted = [...nums].sort((a, b) => a - b);
```

Default `sort()` is lexicographic: `[10, 2, 1].sort()` becomes `[1, 10, 2]`. Always pass `(a, b) => a - b` for numbers, `(a, b) => b - a` for descending.

Keep the original index through a sort:

```ts
const byValue = nums
  .map((value, index) => [value, index] as const)
  .sort((a, b) => a[0] - b[0]);
```

Build a string from pieces with `parts.join("")`. Repeated `s += ch` is usually fine at LeetCode sizes; `join` is the honest linear form.

### 2D initialization

```ts
const rows = 3;
const cols = 4;

// CORRECT: each row is a new array
const grid = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

// WRONG: every row is the same array
const broken = Array(rows).fill(Array(cols).fill(0));
broken[0][0] = 1; // every row[0] becomes 1
```

This is the TypeScript version of `[[]] * n`.

---

## Set and Map

```ts
const seen = new Set<number>();
seen.add(x);
seen.has(x);      // not `x in seen`
seen.delete(x);   // returns boolean; does not throw if missing
seen.size;

const count = new Map<number, number>();
count.set(x, (count.get(x) ?? 0) + 1);
count.get(x);     // number | undefined
count.has(x);
count.delete(x);
```

Iterate:

```ts
for (const value of seen) { ... }
for (const [key, value] of count) { ... }
```

A plain object `{ [key: string]: number }` works for string keys, but number keys are coerced to strings. Use `Map` whenever the key is an integer, a pair, or anything you do not want stringified.

There is no tuple-key. Encode compound state:

```ts
const visited = new Set<string>();
visited.add(`${row},${col}`);
```

---

## Strings

```ts
s.length;
s[i];                         // one character, or undefined
s.charCodeAt(i);              // like ord(s[i])
String.fromCharCode(97);      // like chr(97) → "a"
s.slice(left, right);         // [left, right)
s.split("");                  // characters as an array
s.includes(sub);
s.startsWith(prefix);
s.endsWith(suffix);
s.toLowerCase();
s.trim();
```

`s[i]` is already a string of length 1. There is no separate `char` type.

Lowercase frequency array:

```ts
const freq = Array<number>(26).fill(0);
for (let i = 0; i < s.length; i++) {
  freq[s.charCodeAt(i) - 97] += 1;
}
```

---

## Numbers and Math

```ts
Math.max(a, b);
Math.min(...nums);        // fine for typical n; huge spreads can blow the call
Math.abs(x);
Math.floor(x / y);        // Python `//` for non-negative x
Math.trunc(x / y);        // toward zero — what LeetCode usually wants for division
Math.ceil(x);
Math.sqrt(x);
Math.log2(x);
Infinity;
-Infinity;
Number.MAX_SAFE_INTEGER;  // 2^53 - 1
```

`number` is IEEE-754. Integer work on LeetCode is safe below `2^53`. For 32-bit wrap problems, use `n | 0` only when the prompt asks for it.

Bitwise operators exist and match C: `& | ^ ~ << >> >>>`.

---

## Loops and Control

```ts
for (let i = 0; i < nums.length; i++) {
  const value = nums[i];
}

for (const value of nums) { ... }

for (const [i, value] of nums.entries()) { ... }

let left = 0;
while (left < right) {
  left += 1;
}
```

Early exit is `return`, not a special iterator protocol. `break` / `continue` work as in Python.

Swap without a temp:

```ts
[nums[i], nums[j]] = [nums[j], nums[i]];
```

---

## Queue and BFS

`Array.shift()` removes from the front and is **O(n)**. For a real queue:

```ts
// Index-pointer queue — good enough when you only dequeue
const queue: number[] = [start];
let head = 0;
while (head < queue.length) {
  const node = queue[head++];
  queue.push(next);
}
```

Or install nothing and accept O(n) `shift` on tiny BFS layers. For sliding-window maximum, write a deque of indices as a plain array and only `push` / `pop` / drop from the front with an index — same idea as the monotonic deque in [Sliding Window](../sliding_window/).

---

## Heap / Top-K

TypeScript has no `heapq`. For interview code, pick the smallest tool that works:

- Sort the whole array when n is small or you need full order: `nums.sort((a, b) => a - b)`.
- Keep `k` items in a sorted array and `splice` if k is tiny.
- Hand-write a binary heap only when the problem is the heap.

Do not reach for a library in the LeetCode editor unless the problem is a design question and you already know the site allows it.

---

## Recursion, Trees, and Lists

LeetCode injects these types. You do not import them.

```ts
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
```

Null-check before you read `.val` or `.next`. Optional chaining helps on one-off reads: `node?.left?.val`.

Memoize with a `Map` (arguments must be a primitive or an encoded string):

```ts
const memo = new Map<string, number>();

function solve(i: number, remaining: number): number {
  const key = `${i},${remaining}`;
  const cached = memo.get(key);
  if (cached !== undefined) return cached;
  const ans = /* ... */;
  memo.set(key, ans);
  return ans;
}
```

Engine stack limits are higher than Python's default 1000, but a linked-list DFS on 10^5 nodes can still overflow. Prefer an explicit stack for that shape.

---

## Running a File (Bun)

```ts
function solve(nums: number[]): number {
  return nums.length;
}

if (import.meta.main) {
  console.log(solve([1, 2, 3]));
}
```

```bash
bun src/leetcode/sliding_window/contains_duplicate_2.ts
bun run typecheck
```

`import.meta.main` is true only when that file is the entry point, the same idea as `if __name__ == "__main__"`.

---

## Gotchas

| Avoid | Prefer | Why |
|---|---|---|
| `==` | `===` | Coercion (`0 == ""`) |
| `x in set` | `set.has(x)` | `in` checks object keys, not set membership |
| `map[k]` on a `Map` | `map.get(k)` | `Map` is not a plain object |
| `nums.sort()` on numbers | `nums.sort((a, b) => a - b)` | Default sort is lexicographic |
| Sorting in place when you still need the original | `[...nums].sort(...)` | `sort` mutates |
| `arr.shift()` in a hot BFS | index-pointer queue | `shift` is O(n) |
| `Array(n).fill([])` | `Array.from({length: n}, () => [])` | Same aliasing bug as `[[]] * n` |
| Assuming `nums[i]` throws | Check `i` or treat `undefined` | Out-of-range is silent |
| Object keys for integers | `Map<number, V>` | Keys become strings |
| `Math.floor` for LeetCode integer division | `Math.trunc` when negatives exist | Python `//` floors; JS `/` is float |

For the sliding-window set recipe this note exists to support, see [Contains Duplicate II](../../algorithms/219-contains-duplicate-ii/) and [Sliding Window](../sliding_window/).

---

## Pattern Routing

The helper is not the algorithm.

| Problem signal | TypeScript helper | Pattern to learn |
|---|---|---|
| Unweighted shortest path | index-pointer queue | BFS |
| Nearby duplicate / last `k` values | `Set` | [Sliding Window](../sliding_window/) |
| Sliding-window maximum | deque of indices | [Sliding Window](../sliding_window/) |
| Pair search in sorted input | two indices | [Two Pointers](../two_pointers/) |
| Frequency or complement lookup | `Map` / `Set` | [Arrays & Hashing](../arrays_and_hashing/) |
| Best contiguous sum | two running numbers | [Kadane](../kadane_algorithm/) |
| Count subarrays that hit a target | prefix + `Map` | [Prefix Sum](../prefix_sum_pattern/) |

---

## See Also

- [Python DSA Quick Reference](../python-dsa-toolkit/) — the same job in Python
- [Python Standard Library for DSA](../python_builtins_for_leetcode/) — fuller Python APIs when you are comparing the two
- [Sliding Window](../sliding_window/)
- [Two Pointers](../two_pointers/)
- [Arrays & Hashing](../arrays_and_hashing/)
