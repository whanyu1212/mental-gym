---
title: Rust DSA Quick Reference
slug: rust-dsa-toolkit
description: A task-to-tool lookup for Rust standard-library types, idioms, and Python-to-Rust translations while solving DSA problems.
category: Languages
order: 7
status: stable
tags:
  - rust
  - dsa
  - cheatsheet
  - quick-reference
---

# Rust DSA Quick Reference

Use this note when you know the algorithm and need the Rust spelling. It gives one compact idiom per need. The pattern notes still own the invariant.

> **Choose your reference**
>
> - Choosing a tool → **Rust DSA Quick Reference** (this note)
> - Looking up syntax and APIs → [Rust Standard Library for DSA](../rust-standard-library/)
> - Checking operation costs → [Rust Big O Cheatsheet](../rust-big-o-cheatsheet/)

Baseline: Rust 1.93, edition 2021, `std` only. LeetCode does not let you add crates, so everything here is in the standard library.

---

## Quick-Pick Table

| When you need... | Reach for... | Remember |
|---|---|---|
| Fast membership or deduplication | `HashSet<T>` | `insert` returns `false` if the value was already there |
| Key → value lookup | `HashMap<K, V>` | `get` returns `Option<&V>`, never a default |
| Frequency counts | `HashMap<T, i32>` + `entry` | There is no `Counter`; `*map.entry(x).or_insert(0) += 1` |
| Counts of `'a'..='z'` | `[i32; 26]` | Index with `(b - b'a') as usize` |
| Stack, DFS, monotonic stack | `Vec<T>` | `push` / `pop` / `last` at the end |
| Queue or BFS | `VecDeque<T>` | `push_back` / `pop_front` |
| Repeated maximum | `BinaryHeap<T>` | It is a **max**-heap |
| Repeated minimum or Dijkstra | `BinaryHeap<Reverse<T>>` | `std::cmp::Reverse` flips the order |
| Lower / upper bound | `partition_point` | `binary_search` returns *some* match, not the first |
| Sorted map with floor/ceiling queries | `BTreeMap` / `BTreeSet` | `range(x..).next()` is the ceiling |
| k-th smallest without a full sort | `select_nth_unstable(k)` | Linear time, reorders the slice |
| Adjacent pairs | `windows(2)` | Each window is a slice `&[T]` |
| Memoized recursion | `HashMap<(usize, i32), i64>` or a `Vec` table | Tuples are valid keys; closures can't recurse |
| Infinity sentinel | `i32::MAX`, `i64::MAX`, `f64::INFINITY` | Adding to `MAX` overflows |
| Tuple-shaped keys, grid state | `(usize, usize)` | Tuples hash and compare by value |

---

## Python → Rust Cheat Sheet

| Python | Rust |
|---|---|
| `def f(nums: list[int], k: int) -> bool:` | `fn f(nums: Vec<i32>, k: i32) -> bool` |
| `None` | `None`, inside an `Option<T>` |
| `len(xs)` | `xs.len()` (a `usize`, never negative) |
| `for i in range(n):` | `for i in 0..n` |
| `for i in range(n - 1, -1, -1):` | `for i in (0..n).rev()` |
| `for i, x in enumerate(xs):` | `for (i, &x) in xs.iter().enumerate()` |
| `x in xs` (list) | `xs.contains(&x)` |
| `x in seen` (set) | `seen.contains(&x)` |
| `d.get(k, 0)` | `d.get(&k).copied().unwrap_or(0)` |
| `d[k] += 1` | `*d.entry(k).or_insert(0) += 1` |
| `xs.append(x)` / `xs.pop()` | `xs.push(x)` / `xs.pop()` (returns `Option<T>`) |
| `xs[-1]` | `xs[xs.len() - 1]`, or `xs.last()` for an `Option<&T>` |
| `sorted(xs)` | `let mut ys = xs.clone(); ys.sort();` |
| `"".join(parts)` | `parts.concat()` or `parts.join("")` |
| `x // y` | `x / y` rounds toward zero; `x.div_euclid(y)` floors when `y > 0` |
| `x % y` | `x % y` takes the sign of `x`; `x.rem_euclid(y)` matches Python when `y > 0` |
| `float("inf")` | `i64::MAX` or `f64::INFINITY` |
| `ord(c) - ord("a")` | `(c as u8 - b'a') as usize` |
| `a, b = b, a` | `std::mem::swap(&mut a, &mut b)`, or `xs.swap(i, j)` in a vector |
| `if __name__ == "__main__":` | `fn main() { ... }` |

Integer types matter. `i32` is the LeetCode default, `i64` holds sums and products that can pass about 2.1 billion, and `usize` is the only type you can index with. Convert explicitly with `as`.

### Check yourself

1. Translate `count[x] = count.get(x, 0) + 1` into Rust.
2. What do `-7 / 2` and `-7 % 3` evaluate to in Rust? What do they give in Python?
3. `nums` is a `Vec<i32>` and `i` is an `i32`. Why doesn't `nums[i]` compile?

<details>
<summary>Answer</summary>

1. `*count.entry(x).or_insert(0) += 1;`
2. Rust gives `-3` and `-1`: division rounds toward zero and `%` takes the sign of the left operand. Python gives `-4` and `2`. Use `(-7i32).div_euclid(2)` and `(-7i32).rem_euclid(3)` to get Python's answers.
3. Rust only indexes with `usize`. Write `nums[i as usize]`, or keep `i` as a `usize` from the start.

</details>

---

## Counting, Membership, and Grouping

Use a `HashSet` when only presence matters and a `HashMap` when you need a value per key.

```rust
use std::collections::{HashMap, HashSet};

let nums = vec![3, 1, 3, 2, 1, 3];

// Presence
let seen: HashSet<i32> = nums.iter().copied().collect();

// Frequency
let mut freq: HashMap<i32, i32> = HashMap::new();
for &x in &nums {
    *freq.entry(x).or_insert(0) += 1;
}

// Grouping (Python's defaultdict(list))
let words = vec!["eat", "tea", "tan"];
let mut groups: HashMap<String, Vec<&str>> = HashMap::new();
for &w in &words {
    let mut key: Vec<char> = w.chars().collect();
    key.sort_unstable();
    groups.entry(key.into_iter().collect()).or_default().push(w);
}
```

`HashSet::insert` reports whether the value is new, so you don't need a separate `contains` call to detect a duplicate:

```rust
fn contains_duplicate(nums: Vec<i32>) -> bool {
    let mut seen = HashSet::new();
    for x in nums {
        if !seen.insert(x) {
            return true; // insert returned false: x was already there
        }
    }
    false
}
```

For lowercase letters, a fixed array beats a map:

```rust
let mut counts = [0i32; 26];
for b in "banana".bytes() {
    counts[(b - b'a') as usize] += 1;
}
```

---

## Stack, Queue, and Traversal State

A `Vec` is your stack. A `VecDeque` is your queue.

```rust
use std::collections::VecDeque;

// Stack / iterative DFS
let mut stack = vec![0usize];
while let Some(node) = stack.pop() {
    // push neighbours with stack.push(next)
}

// Queue / BFS
let mut queue = VecDeque::from([0usize]);
while let Some(node) = queue.pop_front() {
    // enqueue neighbours with queue.push_back(next)
}
```

A monotonic stack pops while the top breaks the invariant:

```rust
// Next greater element: for each index, the first value to its right that is bigger.
fn next_greater(nums: &[i32]) -> Vec<i32> {
    let mut ans = vec![-1; nums.len()];
    let mut stack: Vec<usize> = Vec::new(); // indices whose answer is still unknown
    for (i, &x) in nums.iter().enumerate() {
        while let Some(&top) = stack.last() {
            if nums[top] >= x {
                break;
            }
            ans[top] = x;
            stack.pop();
        }
        stack.push(i);
    }
    ans
}
```

Grid neighbours need care because `usize` can't go below zero. Do the arithmetic in `i32`, then convert once the bounds check passes:

```rust
const DIRS: [(i32, i32); 4] = [(0, 1), (1, 0), (0, -1), (-1, 0)];

fn neighbours(r: usize, c: usize, rows: usize, cols: usize) -> Vec<(usize, usize)> {
    let mut out = Vec::new();
    for (dr, dc) in DIRS {
        let (nr, nc) = (r as i32 + dr, c as i32 + dc);
        if nr < 0 || nc < 0 || nr >= rows as i32 || nc >= cols as i32 {
            continue;
        }
        out.push((nr as usize, nc as usize));
    }
    out
}
```

### Check yourself

1. You need an unweighted shortest path. Which type holds the frontier, and which two methods do you call?
2. Write the one line that counts `x` in a `HashMap<i32, i32>` named `freq`.
3. What does `HashSet::insert` return the second time you insert the same value?

<details>
<summary>Answer</summary>

1. `VecDeque`, with `push_back` to enqueue and `pop_front` to dequeue.
2. `*freq.entry(x).or_insert(0) += 1;`
3. `false`. That return value is the duplicate check.

</details>

---

## Heaps and Top-K

`BinaryHeap` is a max-heap. Wrap values in `Reverse` to get a min-heap.

```rust
use std::cmp::Reverse;
use std::collections::BinaryHeap;

let mut max_heap = BinaryHeap::from(vec![3, 1, 4]);
assert_eq!(max_heap.pop(), Some(4));

let mut min_heap = BinaryHeap::new();
min_heap.push(Reverse(3));
min_heap.push(Reverse(1));
if let Some(Reverse(smallest)) = min_heap.pop() {
    assert_eq!(smallest, 1);
}
```

To keep the `k` largest values, hold a min-heap of size `k`. Its top is the k-th largest:

```rust
fn kth_largest(nums: &[i32], k: usize) -> i32 {
    let mut heap = BinaryHeap::new();
    for &x in nums {
        heap.push(Reverse(x));
        if heap.len() > k {
            heap.pop(); // drop the smallest of the k + 1
        }
    }
    heap.peek().unwrap().0
}
```

Tuples compare field by field, so `Reverse((dist, node))` orders by distance first. That's all Dijkstra needs:

```rust
fn dijkstra(adj: &Vec<Vec<(usize, i64)>>, src: usize) -> Vec<i64> {
    let mut dist = vec![i64::MAX; adj.len()];
    let mut heap = BinaryHeap::new();
    dist[src] = 0;
    heap.push(Reverse((0i64, src)));
    while let Some(Reverse((d, u))) = heap.pop() {
        if d > dist[u] {
            continue; // stale entry
        }
        for &(v, w) in &adj[u] {
            let nd = d + w;
            if nd < dist[v] {
                dist[v] = nd;
                heap.push(Reverse((nd, v)));
            }
        }
    }
    dist
}
```

For a one-off k-th element, `nums.select_nth_unstable(k)` runs in linear time and skips the heap.

---

## Binary Search and Sorting

`partition_point` takes a predicate that is `true` for a prefix and `false` after it, and returns where the prefix ends. That gives you Python's `bisect_left` and `bisect_right`:

```rust
let nums = vec![1, 2, 2, 2, 5];
let left = nums.partition_point(|&x| x < 2);   // bisect_left  → 1
let right = nums.partition_point(|&x| x <= 2); // bisect_right → 4
let count = right - left;                      // 3 copies of 2
let found = nums.binary_search(&2).is_ok();    // true, but the Ok index could be 1, 2 or 3
```

Sorting in place:

```rust
let mut v = vec![5, 2, 9, 1];
v.sort_unstable();                      // ascending; fastest when ties don't matter
v.sort_unstable_by(|a, b| b.cmp(a));    // descending

// Sort (value, index) pairs: second field ascending, then first field descending
let mut pairs = vec![(1, 2), (3, 1), (2, 2)];
pairs.sort_by(|a, b| a.1.cmp(&b.1).then(b.0.cmp(&a.0)));
assert_eq!(pairs, vec![(3, 1), (2, 2), (1, 2)]);

// Keep original indices: sort the indices, not the values
let nums = vec![30, 10, 20];
let mut order: Vec<usize> = (0..nums.len()).collect();
order.sort_by_key(|&i| nums[i]);
assert_eq!(order, vec![1, 2, 0]);
```

`f64` doesn't implement `Ord`, so `sort()` won't compile on it. Use `v.sort_by(|a, b| a.total_cmp(b))`.

### Check yourself

1. Predict the output:

   ```rust
   let mut h = BinaryHeap::from(vec![2, 7, 4]);
   h.push(9);
   println!("{:?} {:?}", h.pop(), h.peek());
   ```

2. `nums` is sorted. Write one line that finds the first index whose value is at least `t`.
3. You need the 3 smallest values out of a stream. Is that a `BinaryHeap<i32>` or a `BinaryHeap<Reverse<i32>>` capped at 3?

<details>
<summary>Answer</summary>

1. `Some(9) Some(7)`. It's a max-heap, so `pop` removes 9 and `peek` shows the new largest, 7.
2. `let i = nums.partition_point(|&x| x < t);`
3. A plain `BinaryHeap<i32>` (max-heap) capped at 3. The top is the largest of your 3 keepers, which is the one to evict when a smaller value arrives. This mirrors the k-largest case, where you keep a min-heap.

</details>

---

## Iteration Helpers

```rust
let nums = vec![1, 4, 2, 8];

for (i, &x) in nums.iter().enumerate() { /* index and value */ }

for w in nums.windows(2) {
    let (a, b) = (w[0], w[1]); // adjacent pairs, like itertools.pairwise
}

let other = vec![10, 20, 30, 40];
let dot: i32 = nums.iter().zip(&other).map(|(a, b)| a * b).sum();

// Prefix sums with a leading zero
let mut prefix = vec![0i64; nums.len() + 1];
for i in 0..nums.len() {
    prefix[i + 1] = prefix[i] + nums[i] as i64;
}
let range_sum = prefix[3] - prefix[1]; // nums[1..3] = 4 + 2
```

Iterator adapters are lazy. Nothing runs until `sum`, `collect`, `count` or a `for` loop consumes them.

---

## Memoization, DP, Trees, and Lists

A closure can't call itself, so memoized recursion is a plain function that takes the memo as `&mut`:

```rust
fn climb(n: usize, memo: &mut Vec<Option<u64>>) -> u64 {
    if n <= 1 {
        return 1;
    }
    if let Some(v) = memo[n] {
        return v;
    }
    let v = climb(n - 1, memo) + climb(n - 2, memo);
    memo[n] = Some(v);
    v
}
// climb(10, &mut vec![None; 11]) == 89
```

That same `&mut` parameter replaces Python's `nonlocal`. When the state isn't a small integer range, use `HashMap<(usize, i32), i64>`, since tuples are valid keys.

Tables:

```rust
let (rows, cols) = (3, 4);
let mut dp = vec![vec![0i64; cols]; rows]; // each row is a separate Vec; no aliasing bug
dp[0][0] = 1;
```

LeetCode's list and tree types look like this:

```rust
use std::cell::RefCell;
use std::rc::Rc;

pub struct ListNode {
    pub val: i32,
    pub next: Option<Box<ListNode>>,
}

pub struct TreeNode {
    pub val: i32,
    pub left: Option<Rc<RefCell<TreeNode>>>,
    pub right: Option<Rc<RefCell<TreeNode>>>,
}
```

Walk a tree by borrowing the `Option` so you never clone anything:

```rust
fn max_depth(node: &Option<Rc<RefCell<TreeNode>>>) -> i32 {
    match node {
        None => 0,
        Some(n) => {
            let n = n.borrow();
            1 + max_depth(&n.left).max(max_depth(&n.right))
        }
    }
}
```

Reverse a list with `Option::take`, which moves the value out and leaves `None` behind:

```rust
fn reverse_list(mut head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
    let mut prev = None;
    while let Some(mut node) = head {
        head = node.next.take();
        node.next = prev;
        prev = Some(node);
    }
    prev
}
```

Cloning an `Rc` (`node.left.clone()`) only bumps a reference count. It doesn't copy the subtree.

### Check yourself

1. Spot the bug:

   ```rust
   for r in 0..rows {
       if grid[r - 1][0] == 1 { /* ... */ }
   }
   ```

2. You wrote `let dfs = |i: usize| -> i32 { dfs(i + 1) };` and it won't compile. What's the usual fix?
3. Does `vec![vec![0; 3]; 2]` share one inner vector the way Python's `[[0] * 3] * 2` does?

<details>
<summary>Answer</summary>

1. When `r` is `0`, `r - 1` underflows a `usize`. Debug builds panic with "attempt to subtract with overflow". Release builds wrap to a huge index, which then panics on the bounds check. Start the loop at `1`, or use `r.checked_sub(1)`.
2. Make it a named `fn` and pass any shared state in as `&mut` parameters. Closures can't refer to themselves.
3. No. `vec![elem; n]` clones `elem` for each row, so the rows are independent.

</details>

---

## Rust Gotchas

| Avoid | Prefer | Why |
|---|---|---|
| `i - 1` on a `usize` that can be `0` | `i.checked_sub(1)`, or loop from `1` | Underflow panics in debug and wraps in release |
| `i32` sums of many values | `nums.iter().map(\|&x\| x as i64).sum::<i64>()` | `i32` overflow panics in debug |
| `nums[i]` where `i` may be out of range | `nums.get(i)` returns `Option<&T>` | Out-of-range indexing panics |
| `s[i]` on a `String` | `s.as_bytes()[i]` for ASCII, or `let cs: Vec<char> = s.chars().collect()` | Strings are UTF-8 and can't be indexed by position |
| Pushing into `adj[u]` while looping over `&adj[u]` | Collect the changes first, then apply them | You can't mutate what you're borrowing |
| `.clone()` in a hot loop | Borrow with `&` or iterate with `.iter()` | Cloning a `Vec` or `String` copies all of it |
| Relying on `HashMap` iteration order | Sort the keys, or use a `BTreeMap` | The order changes between runs |
| `-1 as usize` as a sentinel | `Option<usize>`, or `usize::MAX` | The cast wraps to `usize::MAX` without an error |
| `f64` in `sort()` or `max()` | `sort_by(\|a, b\| a.total_cmp(b))` | Floats aren't `Ord` |

---

## Pattern Routing

The helper is not the algorithm.

| Problem signal | Rust helper | Pattern to learn |
|---|---|---|
| Unweighted shortest path | `VecDeque` | BFS |
| Weighted shortest path, non-negative edges | `BinaryHeap<Reverse<(i64, usize)>>` | Dijkstra |
| Nearby duplicate / last `k` values | `HashSet` | [Sliding Window](../sliding_window/) |
| Sliding-window maximum | `VecDeque` of indices | [Sliding Window](../sliding_window/) |
| Next greater / smaller element | `Vec` of indices | [Stack](../stack/) |
| Pair search in sorted input | two `usize` indices | [Two Pointers](../two_pointers/) |
| Frequency or complement lookup | `HashMap` / `HashSet` | [Arrays & Hashing](../arrays_and_hashing/) |
| Best contiguous sum | two running `i64` values | [Kadane](../kadane_algorithm/) |
| Count subarrays that hit a target | prefix sums + `HashMap` | [Prefix Sum](../prefix_sum_pattern/) |
| Floor / ceiling in a changing set | `BTreeSet::range` | Ordered set |

---

## See Also

- [Rust Standard Library for DSA](../rust-standard-library/): full APIs by type
- [Rust Big O Cheatsheet](../rust-big-o-cheatsheet/): operation costs
- [Python DSA Quick Reference](../python-dsa-toolkit/): the same job in Python
- [TypeScript DSA Quick Reference](../typescript-dsa-toolkit/): the same job in TypeScript
