---
title: TypeScript Standard Library for DSA
slug: typescript-standard-library
description: The Array, String, Map, Set, Math, and BigInt APIs you use in DSA problems, what each one returns and mutates, and what to write when TypeScript has no built-in.
category: Languages
order: 5
status: stable
tags:
  - typescript
  - dsa
  - standard-library
  - reference
---

# TypeScript Standard Library for DSA

Use this note when you already know which TypeScript tool you need and want its exact behavior: what it returns, whether it mutates, and how it differs from Python.

> **Choose your reference**
>
> - Choosing a tool → [TypeScript DSA Quick Reference](../typescript-dsa-toolkit/)
> - Looking up syntax and APIs → **TypeScript Standard Library for DSA** (this note)
> - Checking operation costs → [TypeScript Big O Cheatsheet](../typescript-big-o-cheatsheet/)

**Baseline:** TypeScript with `lib: ES2022`, run with Bun 1.3. This matches the repo's `tsconfig.json`. Methods added after ES2022 are marked **ES2023+**. Bun runs them, but the repo's type check rejects them, so use the ES2022 spelling in practice files.

Each section follows the same shape: what the tool is for, the calls, the Python equivalent, then a short **Check yourself** block. Try the questions before opening the answers.

---

## Arrays

Arrays are your `list`: a stack, a buffer, a grid row, a DP table.

### Creating arrays

```ts
const empty: number[] = [];
const zeros = Array<number>(5).fill(0);                 // [0, 0, 0, 0, 0]
const range = Array.from({ length: 5 }, (_, i) => i);   // [0, 1, 2, 3, 4]
const grid = Array.from({ length: 3 }, () => Array<number>(4).fill(0)); // 3 x 4, rows independent
const chars = Array.from("abc");                        // ["a", "b", "c"]
```

`Array.from({ length: n }, fn)` is the TypeScript form of a list comprehension. Use it any time each slot needs its **own** new array or object.

### Methods that mutate the array

These change the array in place. Read the "Returns" column carefully, because several return something other than the array.

| Method | Returns | Python |
|---|---|---|
| `arr.push(x)` | new **length** | `arr.append(x)` |
| `arr.pop()` | removed item, or `undefined` if empty | `arr.pop()` (raises if empty) |
| `arr.unshift(x)` | new **length** | `arr.insert(0, x)` |
| `arr.shift()` | removed first item, or `undefined` | `arr.pop(0)` |
| `arr.splice(i, k)` | array of the `k` removed items | `del arr[i:i+k]` |
| `arr.splice(i, 0, x)` | `[]` | `arr.insert(i, x)` |
| `arr.sort(cmp)` | the **same** array, now sorted | `arr.sort(key=...)` |
| `arr.reverse()` | the **same** array, now reversed | `arr.reverse()` |
| `arr.fill(v, start?, end?)` | the same array | `arr[a:b] = [v] * (b - a)` |
| `arr.length = 0` | (assignment) clears the array | `arr.clear()` |

### Methods that return a new value

These leave the original alone.

| Method | Returns | Python |
|---|---|---|
| `arr.slice(a, b)` | copy of `[a, b)` | `arr[a:b]` |
| `arr.slice()` or `[...arr]` | shallow copy | `arr[:]` |
| `arr.concat(other)` / `[...a, ...b]` | new joined array | `a + b` |
| `arr.map(fn)` | new array | `[fn(x) for x in arr]` |
| `arr.filter(fn)` | new array | `[x for x in arr if fn(x)]` |
| `arr.reduce(fn, init)` | one accumulated value | `functools.reduce` |
| `arr.join(sep)` | string | `sep.join(arr)` |
| `arr.flat()` | one level flattened | `list(chain(*arr))` |
| `arr.at(-1)` | last item, or `undefined` | `arr[-1]` |

**ES2023+:** `toSorted`, `toReversed`, `toSpliced`, and `with(i, x)` are non-mutating versions of `sort`, `reverse`, `splice`, and `arr[i] = x`. Under ES2022, copy first: `[...arr].sort(cmp)`.

### Searching

```ts
const nums = [4, 8, 15, 16, 23, 42];

nums.includes(15);                 // true, like `15 in nums`
nums.indexOf(16);                  // 3, or -1 if missing (Python raises)
nums.find((x) => x > 10);          // 15, or undefined
nums.findIndex((x) => x > 10);     // 2, or -1
nums.some((x) => x % 2 === 1);     // true, like any(...)
nums.every((x) => x > 0);          // true, like all(...)
```

`findLast` and `findLastIndex` are **ES2023+**. Under ES2022, loop backward from `arr.length - 1`.

### Sorting

```ts
const nums = [10, 2, 33, 1];
nums.sort((a, b) => a - b);   // ascending: [1, 2, 10, 33]
nums.sort((a, b) => b - a);   // descending: [33, 10, 2, 1]

const words = ["pear", "fig", "apple"];
words.sort();                           // strings: default order is fine
words.sort((a, b) => a.length - b.length || a.localeCompare(b)); // by length, then alphabetical

const people: [string, number][] = [["ana", 31], ["bo", 25], ["cy", 31]];
people.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])); // age desc, name asc
```

The comparator returns a **number**: negative means `a` comes first, positive means `b` comes first, and `0` keeps their order. `||` chains tie-breakers because `0` is falsy. Sort is stable (guaranteed since ES2019), so equal items keep their input order.

### Check yourself: Arrays

1. What does `[10, 9, 1].sort()` return?
2. What is `x` after `const x = [1, 2, 3].push(4);`?
3. Spot the bug: `const buckets: number[][] = Array(3).fill([]); buckets[0].push(7);`

<details>
<summary>Answers</summary>

1. `[1, 10, 9]`. Without a comparator the items are compared as strings, and `"10" < "9"`. Pass `(a, b) => a - b`.
2. `4`. `push` returns the new length, not the array.
3. `fill([])` puts the **same** empty array in all three slots, so after the push every bucket shows `[7]`. Use `Array.from({ length: 3 }, () => [])`.

</details>

---

## Strings

Strings are immutable, as in Python. Every "change" builds a new string.

```ts
const s = "Hello, World";

s.length;                 // 12
s[0];                     // "H"
s.at(-1);                 // "d"
s.slice(0, 5);            // "Hello"    like s[0:5]
s.slice(-5);              // "World"    like s[-5:]
s.indexOf("o");           // 4, or -1
s.includes("World");      // true       like "World" in s
s.startsWith("He");       // true
s.split(", ");            // ["Hello", "World"]
s.toLowerCase();          // "hello, world"
s.replaceAll("l", "L");   // "HeLLo, WorLd"  (replace() changes only the first match)
"  pad ".trim();          // "pad"
"ab".repeat(3);           // "ababab"   like "ab" * 3
"7".padStart(3, "0");     // "007"      like "7".zfill(3)
```

### Characters and codes

There is no `char` type. A "character" is a one-letter string.

| Python | TypeScript |
|---|---|
| `ord(c)` | `c.charCodeAt(0)` |
| `chr(97)` | `String.fromCharCode(97)` |
| `ord(c) - ord('a')` | `c.charCodeAt(0) - 97` |
| `c.isdigit()` | `c >= "0" && c <= "9"` |
| `c.isalpha()` | `/[a-z]/i.test(c)` |
| `c.isalnum()` | `/[a-z0-9]/i.test(c)` |

```ts
// Count lowercase letters, like the Python [0] * 26 pattern
function letterCounts(word: string): number[] {
  const count = Array<number>(26).fill(0);
  for (let i = 0; i < word.length; i++) {
    count[word.charCodeAt(i) - 97] += 1;
  }
  return count;
}

// Anagram key: sort the letters
const key = (word: string) => [...word].sort().join("");
key("listen") === key("silent"); // true
```

### Building strings

Collect pieces in an array and `join` once. `s += piece` in a loop usually works fine because engines optimize it, but `join` is the form whose cost you can state.

```ts
const parts: string[] = [];
for (const word of ["a", "b", "c"]) parts.push(word.toUpperCase());
parts.join("-"); // "A-B-C"
```

### Check yourself: Strings

1. What does `"banana".replace("a", "o")` return?
2. Write one expression that turns `"hello"` into `"olleh"`.
3. What is `"abc"[5]`, and what would Python do instead?

<details>
<summary>Answers</summary>

1. `"bonana"`. `replace` with a string pattern changes only the first match. Use `replaceAll` for all of them.
2. `[..."hello"].reverse().join("")`. Strings have no `reverse`, so go through an array.
3. `undefined`. Python raises `IndexError`. TypeScript's type for `s[i]` is `string`, so the compiler won't warn you either.

</details>

---

## Map and Set

`Map` is your `dict` and `Set` is your `set`. Both keep insertion order when you iterate, like Python.

### Map

```ts
const count = new Map<string, number>();

count.set("a", 1);                        // returns the map, so calls can chain
count.set("b", 2).set("c", 3);
count.get("a");                           // 1
count.get("zzz");                         // undefined, not an error
count.get("zzz") ?? 0;                    // 0, like dict.get(k, 0)
count.has("b");                           // true, like "b" in d
count.delete("b");                        // true if it was there, false otherwise
count.size;                               // 2, a property, not a method

for (const [key, value] of count) { /* entries in insertion order */ }
[...count.keys()];                        // ["a", "c"]
[...count.values()];                      // [1, 3]
[...count.entries()].sort((x, y) => y[1] - x[1]); // sort by value, descending
new Map([["x", 1], ["y", 2]]);            // build from pairs, like dict(pairs)
```

### Set

```ts
const seen = new Set<number>([3, 1, 3, 2]); // {3, 1, 2}
seen.add(5);                                // returns the set
seen.has(1);                                // true
seen.delete(9);                             // false, no error
seen.size;                                  // 4
[...seen];                                  // [3, 1, 2, 5]
```

Set algebra (`union`, `intersection`, `difference`) is **ES2025**. Under ES2022, write it with `filter`:

```ts
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
const both = [...a].filter((x) => b.has(x));   // intersection: [2, 3]
const onlyA = [...a].filter((x) => !b.has(x)); // difference: [1]
const either = new Set([...a, ...b]);          // union: {1, 2, 3, 4}
```

### Keys are compared by identity

Numbers and strings compare by value. Arrays and objects compare by **reference**, so two arrays with the same contents are different keys. Encode compound keys as strings:

```ts
const visited = new Set<string>();
visited.add(`${2},${3}`);
visited.has(`${2},${3}`);     // true

const wrong = new Set<number[]>();
wrong.add([2, 3]);
wrong.has([2, 3]);            // false: a different array object
```

Use `Map` rather than a plain object `{}` for counting. Object keys are always strings, `obj.length` doesn't exist, and a key like `"constructor"` can collide with inherited properties.

### Check yourself: Map and Set

1. What is `new Set([[1, 2], [1, 2]]).size`?
2. Write one line that increments `count` for key `ch`, starting from 0.
3. `count.get("x")` returned `undefined`. Does that prove `"x"` is missing?

<details>
<summary>Answers</summary>

1. `2`. The two arrays are separate objects, so the set treats them as different values.
2. `count.set(ch, (count.get(ch) ?? 0) + 1);`
3. No. The key could exist with the value `undefined` stored in it. `count.has("x")` answers the question directly. For counters this almost never matters, but it does for maps that store optional values.

</details>

---

## Numbers, Math, and BigInt

`number` is a 64-bit float that also serves as the integer type. Integers are exact up to `2^53 - 1`.

### Math

```ts
Math.max(3, 7);           // 7
Math.max(...[3, 7, 1]);   // 7 (for very large arrays, loop instead)
Math.min();               // Infinity, which is the empty-array case to watch
Math.abs(-4);             // 4
Math.floor(7 / 2);        // 3
Math.ceil(7 / 2);         // 4
Math.trunc(-7 / 2);       // -3  (toward zero)
Math.floor(-7 / 2);       // -4  (Python's -7 // 2)
Math.round(2.5);          // 3
Math.sqrt(16);            // 4
Math.hypot(3, 4);         // 5
Math.log2(8);             // 3
2 ** 10;                  // 1024, like 2 ** 10 in Python
Math.sign(-9);            // -1
```

### Integer division and modulo

This is the most common place where a Python-to-TypeScript translation goes wrong.

| Expression | Python | TypeScript |
|---|---|---|
| `-7 // 2` | `-4` | `Math.floor(-7 / 2)` → `-4` |
| truncate toward zero | `int(-7 / 2)` → `-3` | `Math.trunc(-7 / 2)` → `-3` |
| `-7 % 3` | `2` (sign of divisor) | `-7 % 3` → `-1` (sign of dividend) |
| always-positive mod | `a % m` | `((a % m) + m) % m` |

### Parsing and formatting

```ts
Number("42");             // 42
Number("42px");           // NaN, because the whole string must be numeric
parseInt("42px", 10);     // 42, stops at the first non-digit
parseInt("1011", 2);      // 11, from binary
(11).toString(2);         // "1011", like bin(11)[2:]
(3.14159).toFixed(2);     // "3.14", a string
Number.isInteger(5.0);    // true
Number.isNaN(NaN);        // true, and NaN === NaN is false
Number.MAX_SAFE_INTEGER;  // 9007199254740991
```

### BigInt

Use `bigint` when values can pass `2^53`, for example large factorials, products of big numbers, or 64-bit hashes.

```ts
const big = 2n ** 64n;            // 18446744073709551616n
const fromNumber = BigInt(123);   // 123n
const back = Number(10n);         // 10
7n / 2n;                          // 3n, BigInt division truncates
// 1n + 1;                        // TypeError: you can't mix bigint and number
```

### Bitwise operators

`& | ^ ~ << >>` turn their operands into **32-bit signed** integers. `>>>` is the unsigned right shift.

```ts
5 & 3;          // 1
5 | 3;          // 7
5 ^ 3;          // 6
1 << 30;        // 1073741824
1 << 31;        // -2147483648, which overflowed into the sign bit
-1 >>> 0;       // 4294967295, reinterpreted as unsigned 32-bit
Math.clz32(1);  // 31, the number of leading zero bits in 32-bit form

function popcount(n: number): number {
  let bits = 0;
  while (n !== 0) {
    n &= n - 1;   // clear the lowest set bit
    bits += 1;
  }
  return bits;
}
```

### Check yourself: Numbers

1. What is `-7 % 3` in TypeScript?
2. `2 ** 53 + 1 === 2 ** 53`. True or false?
3. What does `Math.max(...[])` return, and why does it matter in a "max of subarray" solution?

<details>
<summary>Answers</summary>

1. `-1`. TypeScript's `%` keeps the sign of the left operand, while Python's keeps the sign of the right. Use `((a % m) + m) % m` for Python behavior.
2. True. Past `2^53` the gaps between floats are wider than 1, so `2^53 + 1` rounds back down to `2^53`. Switch to `bigint`.
3. `-Infinity`. Spreading an empty array silently produces `-Infinity` instead of an error, so a missing empty-input check shows up as a strange answer rather than a crash.

</details>

---

## Iteration Helpers

TypeScript has no `enumerate`, `zip`, or `range`, but each one is a single line.

| Python | TypeScript |
|---|---|
| `for i in range(n)` | `for (let i = 0; i < n; i++)` |
| `for i in range(n - 1, -1, -1)` | `for (let i = n - 1; i >= 0; i--)` |
| `for x in xs` | `for (const x of xs)` |
| `for i, x in enumerate(xs)` | `for (const [i, x] of xs.entries())` |
| `for a, b in zip(xs, ys)` | `xs.forEach((a, i) => { const b = ys[i]; })` |
| `list(range(5))` | `Array.from({ length: 5 }, (_, i) => i)` |
| `sum(xs)` | `xs.reduce((acc, x) => acc + x, 0)` |
| `a, b = b, a` | `[a, b] = [b, a]` |
| `first, *rest = xs` | `const [first, ...rest] = xs` |

Prefix sums, using the same leading-zero trick as Python's `[0] + list(accumulate(nums))`:

```ts
function prefixSums(nums: number[]): number[] {
  const prefix = [0];
  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x);
  return prefix;
}

const prefix = prefixSums([3, 1, 4, 1, 5]);   // [0, 3, 4, 8, 9, 14]
const sumOf1to3 = prefix[4] - prefix[1];       // 1 + 4 + 1 = 6
```

`for...in` loops over an object's **keys as strings**. On an array it yields `"0"`, `"1"`, and so on. For arrays you almost always want `for...of`.

### Check yourself: Iteration

1. What does `for (const i in ["a", "b"]) console.log(typeof i)` print?
2. Why does `reduce((acc, x) => acc + x)` without the `0` crash on `[]`?
3. Write `range(2, 10, 3)` as an array expression.

<details>
<summary>Answers</summary>

1. `string` twice. `for...in` gives the keys `"0"` and `"1"` as strings. `for...of` gives the values.
2. With no initial value, `reduce` uses the first element as the starting accumulator. An empty array has no first element, so it throws a `TypeError` ("reduce of empty array with no initial value").
3. `Array.from({ length: 3 }, (_, i) => 2 + 3 * i)` gives `[2, 5, 8]`.

</details>

---

## Not Built In: What to Write Instead

Python's `collections`, `heapq`, `bisect`, and `functools` have no standard TypeScript equivalent. Each substitute below is short enough to type in an interview.

| Python | TypeScript substitute |
|---|---|
| `Counter(xs)` | `Map<T, number>` filled in a loop |
| `defaultdict(list)` | `map.get(k) ?? map.set(k, []).get(k)!`, or the helper below |
| `deque` for BFS | array plus a head index |
| `heapq` | the `MinHeap` class below |
| `bisect_left` | the `lowerBound` function below |
| `@lru_cache` | `Map<string, V>` keyed by the arguments |
| `itertools.combinations` | recursion with backtracking |

### Grouping, like `defaultdict(list)`

```ts
function groupBy<T, K>(items: T[], keyOf: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

groupBy(["eat", "tea", "tan"], (w) => [...w].sort().join(""));
// Map { "aet" => ["eat", "tea"], "ant" => ["tan"] }
```

`Map.groupBy` does this in one call, but it is **ES2024**.

### Queue for BFS, like `deque.popleft()`

```ts
const queue: number[] = [0];
let head = 0;
while (head < queue.length) {
  const node = queue[head++];   // O(1) dequeue: move the index, don't shift
  // for (const next of graph[node]) queue.push(next);
}
```

### Binary search, like `bisect_left`

```ts
// First index where sorted[i] >= target (sorted.length if none)
function lowerBound(sorted: number[], target: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

lowerBound([1, 3, 3, 5], 3);   // 1
lowerBound([1, 3, 3, 5], 4);   // 3
lowerBound([1, 3, 3, 5], 9);   // 4
```

For `bisect_right`, change `<` to `<=`.

### Heap, like `heapq`

```ts
class MinHeap<T> {
  private items: T[] = [];
  constructor(private less: (a: T, b: T) => boolean) {}

  get size(): number {
    return this.items.length;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  push(item: T): void {
    const a = this.items;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.less(a[i], a[parent])) break;
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    }
  }

  pop(): T | undefined {
    const a = this.items;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1;
        const r = l + 1;
        let best = i;
        if (l < a.length && this.less(a[l], a[best])) best = l;
        if (r < a.length && this.less(a[r], a[best])) best = r;
        if (best === i) break;
        [a[i], a[best]] = [a[best], a[i]];
        i = best;
      }
    }
    return top;
  }
}

const minHeap = new MinHeap<number>((a, b) => a < b);
const maxHeap = new MinHeap<number>((a, b) => a > b);        // flip the comparison
const byDist = new MinHeap<[number, number]>((a, b) => a[0] < b[0]); // [distance, node]
```

A max-heap only needs the comparison flipped, so you don't need Python's negation trick.

### Memoization, like `@lru_cache`

```ts
function gridPaths(rows: number, cols: number): number {
  const memo = new Map<string, number>();
  const walk = (r: number, c: number): number => {
    if (r === rows - 1 || c === cols - 1) return 1;
    const key = `${r},${c}`;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    const ways = walk(r + 1, c) + walk(r, c + 1);
    memo.set(key, ways);
    return ways;
  };
  return walk(0, 0);
}

gridPaths(3, 7); // 28
```

When the state is small integers, a 2D array (`Array.from({ length: rows }, () => Array(cols).fill(-1))`) is faster than string keys.

### Check yourself: Substitutes

1. Which comparison do you change to turn `lowerBound` into `bisect_right`?
2. You need the 3 smallest numbers from a stream. Which substitute do you use, and how large does it get?
3. Why does the BFS queue use `head++` instead of `queue.shift()`?

<details>
<summary>Answers</summary>

1. `sorted[mid] < target` becomes `sorted[mid] <= target`, so equal values are skipped and you land after them.
2. A **max**-heap (`new MinHeap((a, b) => a > b)`) capped at 3 items. When it holds more than 3, pop the largest. The heap never grows past 4 items, so each step costs O(log 3).
3. `shift()` moves every remaining element down one slot, which is O(n) per dequeue and O(n²) for the whole BFS. Moving an index is O(1).

</details>

---

## Printing and Running

```ts
console.log([1, 2, 3]);                    // [ 1, 2, 3 ]
console.log(new Map([["a", 1]]));          // Map(1) { "a": 1 }
console.log(JSON.stringify([[1, 2], [3]])); // [[1,2],[3]], compact and on one line
console.log(`answer = ${42}`);             // template string, like an f-string
```

Run a file from the repo root with `bun src/leetcode/<folder>/typescript/<name>.ts`, and type-check with `bun run typecheck`. `if (import.meta.main) { ... }` plays the role of `if __name__ == "__main__":`.

---

## See Also

- [TypeScript DSA Quick Reference](../typescript-dsa-toolkit/) — which tool to reach for, and the TypeScript gotchas
- [TypeScript Big O Cheatsheet](../typescript-big-o-cheatsheet/) — what each of these calls costs
- [Python Standard Library for DSA](../python_builtins_for_leetcode/) — the same reference for Python
- [Rust Standard Library for DSA](../rust-standard-library/) — the same reference for Rust
