---
title: TypeScript Big O Cheatsheet
slug: typescript-big-o-cheatsheet
description: The time cost of common TypeScript Array, String, Map, and Set operations, which costs the language guarantees and which depend on the engine, and the hidden O(n) calls that turn loops quadratic.
category: Languages
order: 6
status: stable
tags:
  - typescript
  - complexity
  - reference
---

# TypeScript Big O Cheatsheet

Use this note to check what a TypeScript operation costs. It is the performance reference, not an API guide.

> **Choose your reference**
>
> - Choosing a tool → [TypeScript DSA Quick Reference](../typescript-dsa-toolkit/)
> - Looking up syntax and APIs → [TypeScript Standard Library for DSA](../typescript-standard-library/)
> - Checking operation costs → **TypeScript Big O Cheatsheet** (this note)

## Read This First: Who Guarantees the Cost?

TypeScript compiles away. At runtime your code is JavaScript, so the costs come from two places:

- **The ECMAScript spec** guarantees very little about speed. It requires `Map` and `Set` lookups to be sublinear on average, and it requires `sort` to be stable. That's about all.
- **The engine** decides the rest. LeetCode runs TypeScript on Node (V8). This repo's practice files run on Bun (JavaScriptCore). The two sometimes differ, and the [`shift()` row below](#arrays) shows how much.

The costs below are what every mainstream engine delivers for ordinary arrays and hash tables. Labels:

- **amortized**: usually O(1), with an occasional O(n) resize that averages out
- **expected**: average case for hashing; heavy collisions could be worse
- `n` is the collection size, and `k` is the number of items touched or copied

---

## Arrays

| Operation | Cost | Notes |
|---|---|---|
| `arr[i]`, `arr[i] = x`, `arr.at(i)` | O(1) | |
| `arr.length` | O(1) | Stored, not counted |
| `arr.push(x)` | O(1) amortized | |
| `arr.pop()` | O(1) | |
| `arr.shift()` / `arr.unshift(x)` | **O(n)** | Moves every other element. See the warning below. |
| `arr.splice(i, k, ...items)` | O(n) | Shifts everything after `i` |
| `arr.slice(a, b)` | O(b − a) | Copies |
| `[...arr]`, `arr.concat(b)` | O(n) / O(n + m) | Copies |
| `arr.includes(x)`, `indexOf`, `find`, `some` | O(n) | Linear scan. Stops early on a hit. |
| `arr.map`, `filter`, `reduce`, `forEach` | O(n) | Plus the cost of your callback |
| `arr.reverse()`, `arr.fill(v)` | O(n) | |
| `arr.sort(cmp)` | O(n log n) | V8 uses TimSort and JavaScriptCore uses merge sort. Both are stable. |
| `arr.join(sep)` | O(total length) | |
| `Math.max(...arr)` | O(n) | **Throws** a `RangeError` for large arrays |
| `Array(n).fill(0)`, `Array.from({ length: n })` | O(n) | |

> **`shift()` depends on the engine.** On Bun, draining a 400,000-item array with `shift()` took 13 ms. On Node 22, the same loop took **13 seconds**, because each `shift` copies the rest of the array. LeetCode uses Node, so write BFS with a head index (`queue[head++]`).

> **`Math.max(...arr)` has a size limit.** Spreading passes every element as a function argument. On Node 22 it threw `RangeError: Maximum call stack size exceeded` at 130,000 elements, and LeetCode inputs often reach 10^5. Use a loop or `arr.reduce((m, x) => Math.max(m, x), -Infinity)` when the size isn't small.

---

## Strings

Strings are immutable, so every operation that "changes" one returns a new string.

| Operation | Cost | Notes |
|---|---|---|
| `s.length`, `s[i]`, `s.charCodeAt(i)` | O(1) | |
| `s.slice(a, b)` | O(b − a) | Treat as a copy. Engines may share memory, but don't count on it. |
| `s + t` | O(n + m) | Treat as a copy |
| `s += piece` in a loop | usually O(total) | Engines build a lazy "rope", which is why it's fast in practice. It isn't guaranteed. |
| `parts.join("")` | O(total length) | The form whose cost you can guarantee |
| `s.includes(t)`, `indexOf`, `replaceAll` | O(n · m) worst | Usually close to O(n) in practice |
| `s.split(sep)` | O(n) | |
| `[...s].sort().join("")` | O(n log n) | Anagram keys |
| `s === t` | O(n) | Compares character by character (O(1) if the lengths differ) |

---

## Map and Set

| Operation | Cost | Notes |
|---|---|---|
| `map.get`, `set`, `has`, `delete` | O(1) expected | The spec only requires "sublinear on average" |
| `set.add`, `has`, `delete` | O(1) expected | |
| `map.size`, `set.size` | O(1) | |
| `new Set(arr)`, `new Map(pairs)` | O(n) | |
| `[...map.keys()]`, `[...set]` | O(n) | Copies |
| iterating with `for...of` | O(n) | Insertion order |
| building a key `` `${r},${c}` `` | O(key length) | Allocates a string on every call |
| `JSON.stringify(state)` as a key | O(size of state) | Slow for big states. Prefer a small string or an integer key. |

Plain objects used as maps have similar expected costs, but `Object.keys(obj).length` is **O(n)**, unlike `map.size`.

---

## Substitutes You Write Yourself

TypeScript has no heap, deque, or binary-search helper, so the cost depends on what you write ([code in the standard-library note](../typescript-standard-library/#not-built-in-what-to-write-instead)).

| Structure | Operation | Cost |
|---|---|---|
| Binary heap (`MinHeap`) | `push`, `pop` | O(log n) |
| | `peek`, `size` | O(1) |
| | build by pushing n items | O(n log n) |
| Index queue (`queue[head++]`) | enqueue, dequeue | O(1) amortized |
| `lowerBound` on a sorted array | search | O(log n) |
| Sorted array plus `splice` to insert | insert | O(n) (the search is O(log n), the shift is O(n)) |
| `Map<string, V>` memo | lookup | O(key length) to build the key, then O(1) expected |

---

## Hidden O(n) Inside a Loop

Most accidental O(n²) solutions in TypeScript come from one of these hidden costs inside a loop:

| Looks cheap | Actually costs | Linear alternative |
|---|---|---|
| `queue.shift()` | O(n) on V8 | head index |
| `arr = [...arr, x]` | O(n) copy | `arr.push(x)` |
| `arr.includes(x)` | O(n) scan | a `Set` built once |
| `arr.slice(1)` in recursion | O(n) copy per call | pass an index |
| `arr.indexOf(x)` to find a position | O(n) scan | a `Map` from value to index |
| `arr.splice(0, 1)` | O(n) shift | head index |
| `Object.keys(obj).length` | O(n) | `Map` and `.size` |
| `Math.min(...window)` each step | O(k) per step | monotonic deque |

---

## Check Yourself

Work out each cost before opening the answer.

**1.** What does this loop cost?

```ts
function unique(nums: number[]): number[] {
  const out: number[] = [];
  for (const x of nums) {
    if (!out.includes(x)) out.push(x);
  }
  return out;
}
```

<details>
<summary>Answer</summary>

O(n²) in the worst case. `out.includes(x)` scans up to n items on each of n iterations. Keep a `Set` alongside `out` (`if (!seen.has(x)) { seen.add(x); out.push(x); }`) to bring it to O(n) expected.

</details>

**2.** A BFS visits 10^5 nodes and uses `queue.shift()`. It passes locally under Bun but times out on LeetCode. Why?

<details>
<summary>Answer</summary>

Bun's engine optimizes `shift()` to near O(1), but Node's V8 copies the remaining array on each call, so the BFS becomes O(n²) there. Use `const node = queue[head++]`.

</details>

**3.** What does this cost, and what's the fix?

```ts
function sumAll(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums[0] + sumAll(nums.slice(1));
}
```

<details>
<summary>Answer</summary>

O(n²) time and O(n²) total allocation. Each call copies the rest of the array with `slice(1)`, and there are n calls. It also recurses n deep, which can overflow the stack for large n. Pass an index instead (`sumFrom(nums, i + 1)`), or just use a loop.

</details>

**4.** You group 10^5 words into anagrams, and each word has at most 100 letters. What does it cost to build every key with `[...word].sort().join("")`?

<details>
<summary>Answer</summary>

O(n · L log L), with n = 10^5 strings and L ≤ 100. Each key sorts its own letters. A 26-slot count per string, joined into a key, brings that down to O(n · L).

</details>

---

## Quick Decision Guide

| Need to... | Use | Cost |
|---|---|---|
| Check membership many times | `Set` | O(1) expected |
| Count occurrences | `Map<T, number>` | O(n) to build, O(1) expected per query |
| Queue (FIFO) | array + head index | O(1) |
| Stack (LIFO) | `push` / `pop` | O(1) amortized |
| Repeated min or max | handwritten `MinHeap` | O(log n) per push/pop |
| k smallest of n | heap capped at k | O(n log k) |
| Full sorted order | `arr.sort((a, b) => a - b)` | O(n log n) |
| Search sorted data | `lowerBound` | O(log n) |
| Max of a large array | loop or `reduce` | O(n), no size limit |

## See Also

- [TypeScript DSA Quick Reference](../typescript-dsa-toolkit/) — choosing the tool
- [TypeScript Standard Library for DSA](../typescript-standard-library/) — APIs and the heap/queue/bisect substitutes
- [Python Big O Cheatsheet](../python-big-o-cheatsheet/) — the same costs in Python
- [Rust Big O Cheatsheet](../rust-big-o-cheatsheet/) — the same costs in Rust
- [Time Complexity](../time-complexity/) — how to analyze a loop in general
