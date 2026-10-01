---
title: Space Complexity
slug: space-complexity
description: A systematic guide to space complexity — auxiliary vs total space, sources of memory usage, the call stack, data structure costs, and the time-space trade-off.
category: Complexity
order: 3
status: stable
tags:
  - complexity
  - space-complexity
  - memory
---

# Space Complexity

Space complexity measures how much **memory** an algorithm needs as a function of input size $n$. It is just as important as time complexity — an algorithm that runs in $O(n \log n)$ time but uses $O(n^2)$ space may be impractical on large inputs even if it's fast enough.

## Auxiliary Space vs Total Space

This distinction matters in interviews — always clarify which one is being asked for.

- **Total space** = memory used by the input + memory used by the algorithm itself
- **Auxiliary space** = memory used *beyond* the input — extra variables, data structures, call stack

When we say an algorithm is "in-place" or has $O(1)$ space complexity, we almost always mean $O(1)$ *auxiliary* space. The input itself must live somewhere.

**Example:** Merge sort sorts an array of size $n$ in $O(n)$ auxiliary space (the temporary merge buffer). Total space is $O(n)$ for the input plus $O(n)$ for the buffer — also $O(n)$. But in-place heap sort uses $O(1)$ auxiliary space; total space is $O(n)$ for the input alone.

## Sources of Memory Usage

Understanding *where* space is consumed prevents surprises.

### 1. Fixed overhead — $O(1)$

Scalar variables, loop counters, pointers: constant size regardless of input.

```python
def sum_array(arr):
    total = 0           # O(1) — one integer
    for x in arr:       # loop variable: O(1)
        total += x
    return total        # total space: O(1) auxiliary
```
```julia
function sum_array(arr)
    total = 0           # O(1) — one integer
    for x in arr        # loop variable: O(1)
        total += x
    end
    return total        # total space: O(1) auxiliary
end
```
```ts
function sumArray(arr: number[]): number {
  let total = 0;           // O(1) — one number
  for (const x of arr) {   // loop variable: O(1)
    total += x;
  }
  return total;            // total space: O(1) auxiliary
}
```
```rust
fn sum_array(arr: &[i64]) -> i64 {
    let mut total = 0;  // O(1) — one integer
    for &x in arr {     // loop variable: O(1)
        total += x;
    }
    total               // total space: O(1) auxiliary
}
```

### 2. Allocated collections — $O(n)$

Any data structure that grows with input: lists, dicts, sets, strings built from input.

```python
def copy_and_double(arr):
    return [x * 2 for x in arr]   # O(n) — new list of same length
```
```julia
function copy_and_double(arr)
    return [x * 2 for x in arr]   # O(n) — new array of same length
end
```
```ts
function copyAndDouble(arr: number[]): number[] {
  return arr.map((x) => x * 2);   // O(n) — new array of same length
}
```
```rust
fn copy_and_double(arr: &[i64]) -> Vec<i64> {
    arr.iter().map(|x| x * 2).collect()   // O(n) — new Vec of same length
}
```

### 3. The call stack — $O(\text{depth})$

Every function call pushes a **stack frame** onto the call stack. A stack frame stores local variables, the return address, and the function arguments. Recursive algorithms accumulate frames until they hit the base case.

```python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)    # n frames on the stack simultaneously
# Space: O(n)
```
```julia
# Named fact so it doesn't clash with Base.factorial.
function fact(n)
    if n == 0
        return 1
    end
    return n * fact(n - 1)    # n frames on the stack simultaneously
end
# Space: O(n)
```
```ts
function factorial(n: number): number {
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);   // n frames on the stack simultaneously
}
// Space: O(n)
```
```rust
fn factorial(n: u64) -> u64 {
    if n == 0 {
        return 1;
    }
    n * factorial(n - 1)    // n frames on the stack simultaneously
}
// Space: O(n)
```

The key insight: **maximum stack depth** determines call stack space — not the total number of calls ever made, but how many are *alive at the same time*.

### 4. Output — context-dependent

Sometimes the output is considered part of the space cost, sometimes not. In interviews: if the problem asks you to return a new array, the output space is often excluded from the auxiliary space analysis (since you *must* produce it). Clarify if unsure.

## The Call Stack in Depth

The call stack is the most commonly forgotten source of space in recursive algorithms. For when stack depth should push you toward a loop instead, see [Recursion vs Iteration](../recursion-and-iteration/).

### Linear recursion — $O(n)$

```python
def sum_to(n):
    if n == 0:
        return 0
    return n + sum_to(n - 1)
```
```julia
function sum_to(n)
    if n == 0
        return 0
    end
    return n + sum_to(n - 1)
end
```
```ts
function sumTo(n: number): number {
  if (n === 0) {
    return 0;
  }
  return n + sumTo(n - 1);
}
```
```rust
fn sum_to(n: u64) -> u64 {
    if n == 0 {
        return 0;
    }
    n + sum_to(n - 1)
}
```

At the deepest point, there are $n + 1$ frames simultaneously on the stack. Space: $O(n)$.

### Binary recursion — $O(\log n)$

```python
def binary_search(arr, lo, hi, target):
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search(arr, mid + 1, hi, target)
    else:
        return binary_search(arr, lo, mid - 1, target)
```
```julia
# Call with lo = 1, hi = length(arr) (Julia is 1-based).
function binary_search(arr, lo, hi, target)
    if lo > hi
        return nothing
    end
    mid = (lo + hi) ÷ 2
    if arr[mid] == target
        return mid
    elseif arr[mid] < target
        return binary_search(arr, mid + 1, hi, target)
    else
        return binary_search(arr, lo, mid - 1, target)
    end
end
```
```ts
function binarySearch(arr: number[], lo: number, hi: number, target: number): number {
  if (lo > hi) {
    return -1;
  }
  const mid = Math.floor((lo + hi) / 2);
  if (arr[mid] === target) {
    return mid;
  } else if (arr[mid] < target) {
    return binarySearch(arr, mid + 1, hi, target);
  } else {
    return binarySearch(arr, lo, mid - 1, target);
  }
}
```
```rust
use std::cmp::Ordering;

// Searches arr[lo..hi] with hi exclusive, so there is no `mid - 1` to
// underflow when mid is 0 (usize can't go negative).
// Call with lo = 0, hi = arr.len().
fn binary_search(arr: &[i32], lo: usize, hi: usize, target: i32) -> Option<usize> {
    if lo >= hi {
        return None;
    }
    let mid = lo + (hi - lo) / 2;
    match arr[mid].cmp(&target) {
        Ordering::Equal => Some(mid),
        Ordering::Less => binary_search(arr, mid + 1, hi, target),
        Ordering::Greater => binary_search(arr, lo, mid, target),
    }
}
```

Only *one* branch is taken at each level — the call depth is $\log_2 n$. Space: $O(\log n)$.

### Two-branch recursion — $O(n)$ depth, $O(2^n)$ total calls

```python
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
```
```julia
function fib(n)
    if n <= 1
        return n
    end
    return fib(n - 1) + fib(n - 2)
end
```
```ts
function fib(n: number): number {
  if (n <= 1) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}
```
```rust
fn fib(n: u64) -> u64 {
    if n <= 1 {
        return n;
    }
    fib(n - 1) + fib(n - 2)
}
```

The total number of calls is $O(2^n)$, but the **maximum stack depth** at any one moment is $O(n)$ (the leftmost branch `fib(n-1) → fib(n-2) → ...`). Space: $O(n)$.

### Tree recursion — $O(h)$

```python
def max_depth(node):
    if not node:
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))
```
```julia
function max_depth(node)
    if node === nothing
        return 0
    end
    return 1 + max(max_depth(node.left), max_depth(node.right))
end
```
```ts
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function maxDepth(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}
```
```rust
struct TreeNode {
    val: i32,
    left: Option<Box<TreeNode>>,
    right: Option<Box<TreeNode>>,
}

fn max_depth(node: Option<&TreeNode>) -> usize {
    match node {
        None => 0,
        Some(node) => 1 + max_depth(node.left.as_deref()).max(max_depth(node.right.as_deref())),
    }
}
```

At any moment only one path from root to leaf is on the stack. Maximum depth: $h$ (tree height). For a balanced tree: $O(\log n)$. For a skewed tree (effectively a linked list): $O(n)$.

### Tail recursion

A function is **tail-recursive** when the recursive call is the very last operation — there is no pending work after it returns:

```python
# Not tail-recursive: must multiply after call returns
def factorial(n):
    if n == 0: return 1
    return n * factorial(n - 1)   # pending: multiply by n

# Tail-recursive: accumulator carries the state
def factorial_tail(n, acc=1):
    if n == 0: return acc
    return factorial_tail(n - 1, n * acc)   # nothing pending
```
```julia
# Not tail-recursive: must multiply after call returns
function fact(n)
    n == 0 && return 1
    return n * fact(n - 1)   # pending: multiply by n
end

# Tail-recursive: accumulator carries the state
function fact_tail(n, acc=1)
    n == 0 && return acc
    return fact_tail(n - 1, n * acc)   # nothing pending
end
```
```ts
// Not tail-recursive: must multiply after call returns
function factorial(n: number): number {
  if (n === 0) return 1;
  return n * factorial(n - 1);   // pending: multiply by n
}

// Tail-recursive: accumulator carries the state
function factorialTail(n: number, acc = 1): number {
  if (n === 0) return acc;
  return factorialTail(n - 1, n * acc);   // nothing pending
}
```
```rust
// Not tail-recursive: must multiply after call returns
fn factorial(n: u64) -> u64 {
    if n == 0 { return 1; }
    n * factorial(n - 1)   // pending: multiply by n
}

// Tail-recursive: accumulator carries the state (call with acc = 1)
fn factorial_tail(n: u64, acc: u64) -> u64 {
    if n == 0 { return acc; }
    factorial_tail(n - 1, n * acc)   // nothing pending
}
```

Tail-recursive functions can be mechanically transformed into loops by the compiler or interpreter, reducing space from $O(n)$ to $O(1)$. Python does **not** perform this optimisation (Guido van Rossum explicitly chose not to, to preserve tracebacks), and neither does Julia. TypeScript depends on the engine: the JavaScript spec asks for proper tail calls, but only Safari's engine implements them, not V8 (Chrome, Node). Rust may turn a tail call into a jump in an optimised build, but doesn't guarantee it. Scheme, Haskell, and Scala's `@tailrec` are where you can rely on it.

## Space Costs of Common Algorithms

### Sorting

| Algorithm | Auxiliary space | Note |
|-----------|----------------|------|
| Bubble sort | $O(1)$ | In-place swaps |
| Insertion sort | $O(1)$ | In-place |
| Selection sort | $O(1)$ | In-place |
| Heap sort | $O(1)$ | In-place (heapify) |
| Quick sort | $O(\log n)$ avg, $O(n)$ worst | Call stack depth |
| Merge sort | $O(n)$ | Temporary merge buffer |
| Counting sort | $O(k)$ | $k$ = value range |
| Radix sort | $O(n + k)$ | |
| Timsort (Python) | $O(n)$ | Merge buffer |

### Graph Traversals

| Algorithm | Space |
|-----------|-------|
| BFS | $O(w)$ where $w$ = max frontier width; $O(V)$ worst |
| DFS (recursive) | $O(h)$ where $h$ = max depth; $O(V)$ worst |
| DFS (iterative, explicit stack) | $O(V)$ worst |
| Dijkstra | $O(V)$ for the priority queue |

For BFS on a balanced binary tree, the maximum queue size is the widest level — $O(n/2) = O(n)$. For a path graph (linear), it's $O(1)$.

For DFS, the recursion stack depth equals the longest path explored — $O(V)$ in the worst case (a graph that is a single long path).

### Data Structures

| Structure | Space |
|-----------|-------|
| Array / list of $n$ items | $O(n)$ |
| Hash table with $n$ entries | $O(n)$ |
| Binary tree with $n$ nodes | $O(n)$ |
| Graph: adjacency list | $O(V + E)$ |
| Graph: adjacency matrix | $O(V^2)$ |
| Trie over $n$ strings of avg length $k$ | $O(n \cdot k)$ |
| Heap of $n$ elements | $O(n)$ |

## The Time-Space Trade-off

Many algorithmic improvements trade more memory for less time. This is one of the most fundamental patterns in computer science.

### Memoisation

Naïve recursive Fibonacci: $O(2^n)$ time, $O(n)$ space (call stack).
Memoised: $O(n)$ time, $O(n)$ space (cache + call stack).

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1: return n
    return fib(n - 1) + fib(n - 2)
```
```julia
# A fresh memo per top-level call: Julia evaluates default arguments on
# every call. (The Memoize.jl package offers an @memoize macro.)
function fib(n, memo = Dict{Int, Int}())
    n <= 1 && return n
    haskey(memo, n) && return memo[n]
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
end
```
```ts
const memo = new Map<number, number>();

function fib(n: number): number {
  if (n <= 1) return n;
  const cached = memo.get(n);
  if (cached !== undefined) return cached;
  const result = fib(n - 1) + fib(n - 2);
  memo.set(n, result);
  return result;
}
```
```rust
use std::collections::HashMap;

// Call it as fib(n, &mut HashMap::new()).
fn fib(n: u64, memo: &mut HashMap<u64, u64>) -> u64 {
    if n <= 1 {
        return n;
    }
    if let Some(&cached) = memo.get(&n) {
        return cached;
    }
    let result = fib(n - 1, memo) + fib(n - 2, memo);
    memo.insert(n, result);
    result
}
```

We spend $O(n)$ extra space to avoid recomputing $O(2^n)$ overlapping subproblems.

### Lookup tables (hash maps)

```python
# O(n) time per query — linear search each time
def find(arr, target):
    return target in arr

# O(n) space once, O(1) per query — build a set
lookup = set(arr)
def find_fast(target):
    return target in lookup
```
```julia
# O(n) time per query — linear search each time
find(arr, target) = target in arr

# O(n) space once, O(1) per query — build a set
lookup = Set(arr)
find_fast(target) = target in lookup
```
```ts
// O(n) time per query — linear search each time
function find(arr: number[], target: number): boolean {
  return arr.includes(target);
}

// O(n) space once, O(1) per query — build a set
const lookup = new Set(arr);
function findFast(target: number): boolean {
  return lookup.has(target);
}
```
```rust
use std::collections::HashSet;

// O(n) time per query — linear search each time
fn find(arr: &[i32], target: i32) -> bool {
    arr.contains(&target)
}

// O(n) space once, O(1) per query — build a set
let lookup: HashSet<i32> = arr.iter().copied().collect();
let find_fast = |target: i32| lookup.contains(&target);
```

Spend $O(n)$ space to reduce each query from $O(n)$ to $O(1)$.

### Prefix sums

```python
# O(n) per range sum query
def range_sum_naive(arr, l, r):
    return sum(arr[l:r+1])

# O(n) space, O(1) per query
prefix = [0] * (len(arr) + 1)
for i, x in enumerate(arr):
    prefix[i + 1] = prefix[i] + x

def range_sum(l, r):
    return prefix[r + 1] - prefix[l]
```
```julia
# O(n) per range sum query (l and r are 1-based and inclusive)
range_sum_naive(arr, l, r) = sum(arr[l:r])

# O(n) space, O(1) per query
prefix = zeros(Int, length(arr) + 1)
for (i, x) in enumerate(arr)
    prefix[i + 1] = prefix[i] + x
end

range_sum(l, r) = prefix[r + 1] - prefix[l]
```
```ts
// O(n) per range sum query
function rangeSumNaive(arr: number[], l: number, r: number): number {
  let total = 0;
  for (let i = l; i <= r; i++) {
    total += arr[i];
  }
  return total;
}

// O(n) space, O(1) per query
const prefix = new Array<number>(arr.length + 1).fill(0);
arr.forEach((x, i) => {
  prefix[i + 1] = prefix[i] + x;
});

function rangeSum(l: number, r: number): number {
  return prefix[r + 1] - prefix[l];
}
```
```rust
// O(n) per range sum query (the slice borrows, so no copy, but still O(n) time)
fn range_sum_naive(arr: &[i64], l: usize, r: usize) -> i64 {
    arr[l..=r].iter().sum()
}

// O(n) space, O(1) per query
let mut prefix = vec![0; arr.len() + 1];
for (i, &x) in arr.iter().enumerate() {
    prefix[i + 1] = prefix[i] + x;
}

let range_sum = |l: usize, r: usize| prefix[r + 1] - prefix[l];
```

### Two pointers vs auxiliary space

Many problems that seem to need an extra array can be solved in-place with two pointers:

```python
# O(n) space — build reversed list
def is_palindrome(s):
    return s == s[::-1]

# O(1) space — two pointers, no allocation
def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return False
        l += 1; r -= 1
    return True
```
```julia
# O(n) space — build reversed string
is_palindrome(s) = s == reverse(s)

# O(1) space — two pointers, no allocation
# (compares bytes, so this assumes ASCII text)
function is_palindrome_two_pointers(s)
    l, r = 1, ncodeunits(s)
    while l < r
        if codeunit(s, l) != codeunit(s, r)
            return false
        end
        l += 1; r -= 1
    end
    return true
end
```
```ts
// O(n) space — build reversed string
function isPalindrome(s: string): boolean {
  return s === [...s].reverse().join("");
}

// O(1) space — two pointers, no allocation
function isPalindromeTwoPointers(s: string): boolean {
  let l = 0;
  let r = s.length - 1;
  while (l < r) {
    if (s[l] !== s[r]) {
      return false;
    }
    l += 1; r -= 1;
  }
  return true;
}
```
```rust
// O(n) space — build reversed string
fn is_palindrome(s: &str) -> bool {
    let reversed: String = s.chars().rev().collect();
    s == reversed
}

// O(1) space — two pointers over the bytes (assumes ASCII text).
// s.chars().eq(s.chars().rev()) is also O(1) space and handles Unicode.
fn is_palindrome_two_pointers(s: &str) -> bool {
    let bytes = s.as_bytes();
    if bytes.is_empty() {
        return true;
    }
    let (mut l, mut r) = (0, bytes.len() - 1);
    while l < r {
        if bytes[l] != bytes[r] {
            return false;
        }
        l += 1;
        r -= 1;
    }
    true
}
```

## Language-Specific Memory Patterns

Each language's memory model has some non-obvious behaviours. Switch tabs to compare how the same idea plays out.

### Generators vs lists

```python
# O(n) space — materialises all values immediately
squares_list = [x**2 for x in range(n)]

# O(1) space — produces one value at a time
squares_gen = (x**2 for x in range(n))
```
```julia
# O(n) space — materialises all values immediately
squares_list = [x^2 for x in 0:n-1]

# O(1) space — produces one value at a time
squares_gen = (x^2 for x in 0:n-1)
```
```ts
// O(n) space — materialises all values immediately
const squaresList = Array.from({ length: n }, (_, x) => x ** 2);

// O(1) space — produces one value at a time
function* squares(n: number) {
  for (let x = 0; x < n; x++) {
    yield x ** 2;
  }
}
const squaresGen = squares(n);
```
```rust
// O(n) space — materialises all values immediately
let squares_vec: Vec<u64> = (0..n).map(|x| x * x).collect();

// O(1) space — iterators are lazy: nothing runs until something consumes them
let squares_iter = (0..n).map(|x| x * x);
```

Use generators (lazy iterators, in Rust) when you only need to iterate once and don't need random access.

### Slicing copies data

```python
# O(n) space — arr[:] creates a full copy
copy = arr[:]
half = arr[:len(arr)//2]    # O(n/2) = O(n)

# O(1) space — just two integers
left, right = 0, len(arr) - 1
```
```julia
# O(n) space — arr[:] creates a full copy
copy_of_arr = arr[:]
half = arr[1:length(arr) ÷ 2]          # O(n/2) = O(n)

# O(1) space — @view shares the original memory instead
half_view = @view arr[1:length(arr) ÷ 2]

# O(1) space — just two integers
left, right = 1, length(arr)
```
```ts
// O(n) space — slice() creates a full copy
const copy = arr.slice();
const half = arr.slice(0, Math.floor(arr.length / 2));   // O(n/2) = O(n)

// (Typed arrays such as Int32Array also have .subarray(), which is a view.)

// O(1) space — just two integers
let left = 0;
let right = arr.length - 1;
```
```rust
// O(n) space — .to_vec() creates a full copy
let copy = arr.to_vec();
let half_copy = arr[..arr.len() / 2].to_vec();   // O(n/2) = O(n)

// O(1) space — a plain slice borrows the data, no copy
let half = &arr[..arr.len() / 2];

// O(1) space — just two integers
let (left, right) = (0, arr.len() - 1);
```

Every slice operation in Python creates a **new object** with its own memory, and so do Julia's `arr[a:b]` and TypeScript's `slice()`. Julia's `@view` and Rust's `&arr[a..b]` are views onto the original data instead. Avoid copying slices inside loops.

### Reference semantics

Python variables hold references, not values, and so do Julia's and TypeScript's for arrays. This affects how you reason about space:

```python
a = [1, 2, 3]
b = a           # O(0) extra space — b is just another reference to the same list
b = a[:]        # O(n) extra space — b is a new, independent copy
```
```julia
a = [1, 2, 3]
b = a           # O(0) extra space — b is just another name for the same array
b = copy(a)     # O(n) extra space — b is a new, independent copy
```
```ts
const a = [1, 2, 3];
let b = a;      // O(0) extra space — b is just another reference to the same array
b = [...a];     // O(n) extra space — b is a new, independent copy
```
```rust
let a = vec![1, 2, 3];
let b = &a;           // O(0) extra space — b borrows a
let c = a.clone();    // O(n) extra space — c is a new, independent copy
let d = a;            // O(0) extra space — a is *moved* into d and can't be used again
```

Mutations to `b` affect `a` in the first case; not in the second. Rust makes the difference explicit: assignment moves, `&` borrows, and a copy only happens when you ask for one with `.clone()`.

### Python: `sys.getsizeof` is not the whole picture

`sys.getsizeof([1, 2, 3])` returns the size of the list *object* (the array of pointers), not the total memory including the integers themselves. For true memory profiling use `memory_profiler` or `tracemalloc`.

## Common Mistakes

1. **Forgetting the call stack.** A recursive function with depth $d$ always uses at least $O(d)$ space, even if it allocates nothing else. This is why iterative BFS with an explicit queue and recursive DFS have the same asymptotic space ($O(V)$) for graphs — both maintain a frontier of size $O(V)$ in the worst case.

2. **Ignoring slice copies.** `arr[i:]` in Python is not a view — it is a copy. Passing slices to recursive calls is a common source of hidden $O(n^2)$ space and time.

3. **Confusing in-place with zero space.** In-place means $O(1)$ *auxiliary* space. The input still occupies $O(n)$ space. Sorting "in-place" doesn't mean the algorithm uses no memory.

4. **Memoisation space.** When you add `@lru_cache` to fix an exponential-time recursion, you're trading $O(2^n)$ time for $O(n)$ space (the cache). That cache lives for the lifetime of the function unless you explicitly clear it — in a server or long-running process, uncached memoisation can be a memory leak.

5. **Output counted or not.** If you must return a list of $n$ results, you necessarily use $O(n)$ space. Whether this counts toward your space complexity depends on the problem. Be explicit: "I'm using $O(1)$ auxiliary space, excluding the output."

## Review Questions

---

**Q1.** What is the auxiliary space complexity of iterative vs recursive binary search?

> **Answer.** Iterative: $O(1)$ — only a few scalar variables (`lo`, `hi`, `mid`), no call stack growth. Recursive: $O(\log n)$ — each call reduces the range by half, so the call stack depth is $\log_2 n$.

---

**Q2.** An algorithm uses DFS on a binary tree. The tree has $n$ nodes and is perfectly balanced. What is the space complexity?

> **Answer.** $O(\log n)$ — the call stack depth equals the tree height, which is $\log_2 n$ for a balanced binary tree. For a degenerate (skewed) tree it degrades to $O(n)$.

---

**Q3.** What is the space complexity of memoised Fibonacci compared to naïve recursive Fibonacci?

> **Answer.** Naïve: $O(n)$ stack space (the leftmost branch goes $n$ deep), but total *time* is $O(2^n)$. Memoised: $O(n)$ for the cache plus $O(n)$ for the call stack — still $O(n)$ space, but time drops to $O(n)$. The space is the same order; the time is what dramatically improves.

---

**Q4.** You need to check whether any element in a list of $n$ integers appears more than once. Compare the space costs of two approaches: sorting in-place vs using a hash set.

> **Answer.** Sort in-place: $O(1)$ auxiliary space (heap sort) or $O(\log n)$ (quick sort call stack), then scan adjacent pairs — $O(n \log n)$ time. Hash set: $O(n)$ space, $O(n)$ time. Classic time-space trade-off: the hash set approach is faster but uses more memory.

---

**Q5.** Why does Python's `list.append()` occasionally use $O(n)$ space in a single call?

> **Answer.** When the underlying array is full, Python allocates a new array of double the size and copies all existing elements into it. This single resize operation temporarily holds both the old and new arrays in memory — $O(n)$ extra during the resize. Immediately after, the old array is garbage-collected. Amortized over many appends, the extra allocation cost is $O(1)$ per append.

---

**Q6.** A function builds a result list by appending $n$ elements, then sorts it, then returns it. What is the auxiliary space complexity?

> **Answer.** Building the result: $O(n)$. Python's `list.sort()` (Timsort) uses $O(n)$ auxiliary space for merging. So during the sort, there are temporarily two arrays of size $n$ in memory. Total auxiliary: $O(n)$. If the output list is excluded, auxiliary is $O(n)$ for the sort buffer.

---

**Q7.** Explain why iterative BFS and recursive DFS have the same worst-case space complexity on a graph, even though they seem structurally different.

> **Answer.** BFS maintains a queue of nodes to visit. In the worst case (a star graph — one node connected to all others), the queue holds all $V - 1$ neighbours simultaneously — $O(V)$ space. DFS maintains a call stack (or explicit stack). In the worst case (a path graph — a chain), the stack holds all $V$ nodes simultaneously — $O(V)$ space. Both are $O(V)$ worst case, reached by different graph shapes.
