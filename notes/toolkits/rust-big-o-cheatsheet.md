---
title: Rust Big O Cheatsheet
slug: rust-big-o-cheatsheet
description: The time and space cost of common Rust standard-library operations on Vec, String, HashMap, BTreeMap, VecDeque, and BinaryHeap, with amortized and expected costs labeled.
category: Languages
order: 9
status: stable
tags:
  - rust
  - complexity
  - reference
---

# Rust Big O Cheatsheet

Use this note to check what a Rust operation costs. It is the performance reference, not an API guide.

> **Choose your reference**
>
> - Choosing a tool → [Rust DSA Quick Reference](../rust-dsa-toolkit/)
> - Looking up syntax and APIs → [Rust Standard Library for DSA](../rust-standard-library/)
> - Checking operation costs → **Rust Big O Cheatsheet** (this note)

Baseline: Rust 1.93, edition 2021. The collection costs come from the table in the [`std::collections` docs](https://doc.rust-lang.org/std/collections/index.html#performance) and from each method's own documentation. When a figure describes the current implementation rather than a documented guarantee, the note says so.

## How to Read the Labels

| Label | Meaning | Example |
|---|---|---|
| worst | Holds on every single call | `v[i]` is $O(1)$ |
| amortized | Averages out over a sequence of calls; an individual call can be slower | `v.push(x)` sometimes reallocates and copies the whole buffer, which is $O(n)$ |
| expected | Average over hash randomness; a pathological input could be slower | `map.get(&k)` |

Rust's collections never shrink on their own, so removals are not amortized. They cost what they cost, every time.

---

## Vec and Slices

A `Vec<T>` is a growable array on the heap: a pointer, a length and a capacity. A slice `&v[a..b]` is just a pointer and a length into that same buffer.

| Operation | Cost | Label | Notes |
|---|---|---|---|
| `v[i]`, `v.get(i)`, `v[i] = x` | $O(1)$ | worst | |
| `v.len()`, `v.is_empty()`, `v.last()` | $O(1)$ | worst | Length is stored |
| `v.push(x)` | $O(1)$ | amortized | A single push can be $O(n)$ when it reallocates |
| `v.pop()` | $O(1)$ | worst | |
| `v.insert(i, x)` | $O(n - i)$ | amortized | Shifts the tail right |
| `v.remove(i)` | $O(n - i)$ | worst | Shifts the tail left |
| `v.insert(0, x)` / `v.remove(0)` | $O(n)$ | | Use a `VecDeque` for a queue |
| `v.swap_remove(i)` | $O(1)$ | worst | Doesn't keep the order |
| `v.swap(i, j)` | $O(1)$ | worst | |
| `v.contains(&x)`, `iter().position(..)` | $O(n)$ | worst | Linear scan |
| `v.extend(iter)`, `v.append(&mut w)` | $O(m)$ | amortized | `m` = number of added elements |
| `v.retain(..)`, `v.dedup()`, `v.reverse()`, `v.fill(x)` | $O(n)$ | worst | |
| `v.drain(a..b)` | $O(n - a)$ | worst | Yields `b - a` items, then shifts the tail |
| `v.truncate(k)`, `v.clear()` | $O(1)$ for plain numbers | | $O(\text{dropped})$ when elements own memory, e.g. `Vec<String>` |
| `vec![x; n]`, `Vec::with_capacity(n)` then `n` pushes | $O(n)$ | | |
| `&v[a..b]`, `v.split_at(i)` | $O(1)$ | worst | A view, no copy |
| `v[a..b].to_vec()` | $O(b - a)$ | worst | This one copies |
| `v.clone()` | $O(n)$ | worst | Deep copy of every element |
| `v.windows(k)`, `v.chunks(k)`, `v.iter()` | $O(1)$ to create | | Walking all windows is $O(n)$; summing each window is $O(nk)$ |
| `v.rotate_left(k)` | $O(n)$ | worst | |
| `v.concat()` on `Vec<Vec<T>>` | $O(\text{total})$ | worst | |

### Check yourself

1. What does this loop cost in total?

   ```rust
   let mut v = Vec::new();
   for x in 0..n {
       v.insert(0, x);
   }
   ```

2. Rewrite it so the total cost is $O(n)$ and `v` ends in the same order.
3. What does `for w in nums.windows(k) { total = total.max(w.iter().sum::<i32>()); }` cost? What would make it $O(n)$?

<details>
<summary>Answer</summary>

1. $O(n^2)$. Each `insert(0, x)` shifts everything already in the vector.
2. Push to the end, then reverse once: `for x in 0..n { v.push(x); } v.reverse();` That's $O(n)$ amortized for the pushes, plus $O(n)$ for the reverse.
3. $O(nk)$, since each of the $n - k + 1$ windows is summed from scratch. Keep a running sum instead: add the element that enters the window and subtract the one that leaves. See [Sliding Window](../sliding_window/).

</details>

---

## Strings

A `String` is a `Vec<u8>` that is guaranteed to hold valid UTF-8, so most of its costs match `Vec`. The difference is that "the i-th character" isn't at a fixed offset.

| Operation | Cost | Label | Notes |
|---|---|---|---|
| `s.len()` | $O(1)$ | worst | Byte count |
| `s.as_bytes()`, `s.as_bytes()[i]` | $O(1)$ | worst | Right for ASCII input |
| `&s[a..b]` | $O(1)$ | worst | Byte range, no copy; panics if not on a character boundary |
| `s.chars().count()` | $O(n)$ | worst | Decodes the whole string |
| `s.chars().nth(i)` | $O(i)$ | worst | Walks from the start every call |
| `s.chars().collect::<Vec<char>>()` | $O(n)$ | worst | Then indexing is $O(1)$ |
| `s.push(c)`, `s.push_str(t)`, `s += t` | $O(1)$ / $O(\lvert t \rvert)$ | amortized | Appends in place |
| `s + &t` | $O(\lvert t \rvert)$ | amortized | Reuses `s`'s buffer; `s` is moved |
| `format!("{s}{t}")` | $O(\lvert s \rvert + \lvert t \rvert)$ | worst | Always allocates a new `String` |
| `s.insert(0, c)`, `s.remove(0)` | $O(n)$ | worst | Shifts every byte |
| `s.contains(p)`, `s.find(p)` | $O(n + m)$ | worst | Two-Way search for string patterns |
| `s.replace(a, b)`, `s.to_lowercase()`, `s.trim().to_string()` | $O(n)$ | worst | New `String` |
| `s.clone()`, `s.to_string()` | $O(n)$ | worst | |
| `s == t` | $O(n)$ | worst | Byte comparison |
| `"123".parse::<i32>()` | $O(n)$ | worst | |

Appending to one growing `String` is linear overall, so Rust doesn't need Python's `"".join` workaround. The trap is rebuilding the string instead of appending to it.

### Check yourself

1. What does this cost, and how do you fix it?

   ```rust
   for i in 0..s.len() {
       if s.chars().nth(i) == Some('a') { count += 1; }
   }
   ```

2. Which is linear overall: `acc.push_str(piece)` in a loop, or `acc = format!("{acc}{piece}")` in a loop?

<details>
<summary>Answer</summary>

1. $O(n^2)$, because `nth(i)` walks from the start each time. Iterate once instead: `let count = s.chars().filter(|&c| c == 'a').count();` For ASCII you can also index `s.as_bytes()[i]` in $O(1)$.
2. `push_str` is linear overall because it appends in place (amortized). `format!` copies the whole accumulator every time, which makes the loop $O(n^2)$.

</details>

---

## HashMap, HashSet, BTreeMap, BTreeSet

The default hasher is SipHash-1-3 with a random key, which makes it hard for crafted input to cause collisions. The trade-off is that hashing is slower than a trivial hash. A set costs the same as the matching map.

| Operation | `HashMap` / `HashSet` | `BTreeMap` / `BTreeSet` |
|---|---|---|
| `get`, `contains_key`, `contains` | $O(1)$ expected | $O(\log n)$ worst |
| `insert` | $O(1)$ expected, amortized | $O(\log n)$ worst |
| `remove` | $O(1)$ expected | $O(\log n)$ worst |
| `entry(k)` | $O(1)$ expected | $O(\log n)$ worst |
| `len` | $O(1)$ | $O(1)$ |
| smallest / largest key (`first`, `last`, `pop_first`) | not supported: $O(n)$ scan | $O(\log n)$ |
| `range(a..b)` | not supported | $O(\log n)$ to find the start, then each item in turn |
| full iteration | $O(\text{capacity})$ | $O(n)$, in sorted order |
| `retain` | $O(\text{capacity})$ | $O(n)$ |
| `clone` | $O(\text{capacity})$ | $O(n)$ |

Hash-set algebra:

| Operation | Cost (expected) |
|---|---|
| `a.intersection(&b)` | $O(\min(\lvert a \rvert, \lvert b \rvert))$: iterates the smaller set |
| `a.union(&b)` | $O(\lvert a \rvert + \lvert b \rvert)$ |
| `a.difference(&b)` | $O(\lvert a \rvert)$ |
| `a.is_subset(&b)` | $O(\lvert a \rvert)$, and returns early if `a` is larger |

Three things the $O(1)$ hides:

- **Hashing the key costs its length.** A `HashMap<String, _>` or `HashMap<Vec<i32>, _>` lookup is $O(k)$ for a key of length `k`.
- **Iteration visits empty buckets.** In the current implementation, iterating a `HashMap` takes $O(\text{capacity})$, and capacity never shrinks after removals unless you call `shrink_to_fit`.
- **Expected isn't guaranteed.** Heavy collisions can degrade a hash lookup to $O(n)$. The random key makes that very unlikely.

### Check yourself

1. You check `x` against a `Vec` of `n` values, `q` times. What does that cost, and what does it cost if you build a `HashSet` first?
2. You need "the largest key below `x`" after each of many inserts. Why is `BTreeSet` the right tool, and what does each query cost?
3. What does looking up a 1,000-character `String` key in a `HashMap` cost?

<details>
<summary>Answer</summary>

1. $O(qn)$ with `contains` on the `Vec`. Building the set is $O(n)$, then each lookup is $O(1)$ expected, so $O(n + q)$ in total.
2. A `HashSet` has no order, so finding the largest key below `x` means scanning everything, at $O(n)$ per query. `set.range(..x).next_back()` answers it in $O(\log n)$.
3. About 1,000 steps to hash the key, plus up to that many to compare it with a match. "$O(1)$" means independent of the number of entries, not of the key's size.

</details>

---

## VecDeque and BinaryHeap

| Operation | `VecDeque` | Label |
|---|---|---|
| `push_back`, `push_front` | $O(1)$ | amortized |
| `pop_back`, `pop_front` | $O(1)$ | worst |
| `dq[i]`, `dq.get(i)` | $O(1)$ | worst |
| `insert(i, x)` | $O(\min(i, n - i))$ | amortized |
| `remove(i)` | $O(\min(i, n - i))$ | worst |
| `rotate_left(k)` | $O(\min(k, n - k))$ | worst |
| `contains(&x)` | $O(n)$ | worst |

Unlike Python's `deque`, where indexing the middle is $O(n)$, `VecDeque` is a ring buffer, so any index is $O(1)$.

| Operation | `BinaryHeap` | Label |
|---|---|---|
| `peek()` | $O(1)$ | worst |
| `pop()` | $O(\log n)$ | worst |
| `push(x)` | $O(1)$ expected over random input; $O(\log n)$ amortized when pushes arrive in ascending order | see the `push` docs |
| `BinaryHeap::from(vec)` | $O(n)$ | worst (bottom-up heapify) |
| `into_sorted_vec()` | $O(n \log n)$ | worst |
| `into_vec()` | $O(1)$ | worst; arbitrary order |
| `iter()`, and any "is `x` in the heap?" check | $O(n)$ | worst |

A single `push` can still cost $O(n)$ when the buffer has to grow. The figures above already average that in.

### Check yourself

1. You have all `n` values up front and need the heap once. Should you `push` them one at a time or call `BinaryHeap::from(vec)`?
2. What does the "keep a size-`k` heap" top-k loop cost over `n` values?
3. Your BFS uses `v.remove(0)` on a `Vec` to dequeue. What does it cost overall, and what's the fix?

<details>
<summary>Answer</summary>

1. `BinaryHeap::from(vec)`, which is $O(n)$. Pushing one at a time is $O(n)$ expected on random data but $O(n \log n)$ in the worst case.
2. $O(n \log k)$ time and $O(k)$ space. Each push and pop works on a heap of at most $k + 1$ items.
3. $O(V^2)$ for $V$ dequeued nodes, since each `remove(0)` shifts the rest. Use a `VecDeque` with `pop_front()`, which is $O(1)$.

</details>

---

## Sorting and Searching

| Method | Time | Extra space | Stable? |
|---|---|---|---|
| `v.sort()`, `sort_by`, `sort_by_key` | $O(n \log n)$ worst | $O(n)$ buffer | yes |
| `v.sort_unstable()` and its `_by` / `_by_key` versions | $O(n \log n)$ worst | none (in place) | no |
| `v.sort_by_cached_key(f)` | $O(n \log n)$, with `f` called only $n$ times | $O(n)$ | yes |
| `v.select_nth_unstable(k)` | $O(n)$ worst | none | no |
| `v.binary_search(&x)`, `v.partition_point(p)` | $O(\log n)$ | none | |
| `BinaryHeap::from(v).into_sorted_vec()` | $O(n \log n)$ | none | no |

`sort_by_key` calls the key function on every comparison, which is $O(n \log n)$ calls. When the key is expensive, like `s.to_lowercase()`, use `sort_by_cached_key`.

The current sort implementations run in linear time on input that is already sorted or reverse-sorted. That's an implementation detail, so don't count on it in an analysis.

---

## Cloning and Moving

| Operation | Cost |
|---|---|
| Moving a value (`let b = a;`, passing ownership to a function) | $O(1)$: copies the pointer, length and capacity |
| Borrowing (`&v`, `&mut v`, `&v[a..b]`) | $O(1)$ |
| `v.clone()` for `Vec<i32>` | $O(n)$ |
| `grid.clone()` for `Vec<Vec<i32>>` | $O(\text{total cells})$ |
| `s.clone()` for `String` | $O(\text{len})$ |
| `rc.clone()` for `Rc<T>` | $O(1)$: increments a count |
| `.iter().copied()`, `.cloned()` on integers | $O(1)$ per element |

Passing a `Vec` to a function by value moves it. It doesn't copy the elements. The copy happens only when you write `.clone()`. A `clone()` inside a loop over `n` items is the usual hidden $O(n^2)$.

### Check yourself

1. In a DFS over a tree with `n` nodes, you call `path.clone()` at every node. The path can be `n` long. What's the worst-case cost?
2. Does `let b = a;` copy the elements of `a: Vec<i32>`?

<details>
<summary>Answer</summary>

1. $O(n^2)$, since you copy up to `n` elements at each of `n` nodes. Push before recursing and pop after instead, and clone only when you record an answer.
2. No. It moves the vector: an $O(1)$ copy of the pointer, length and capacity. You can't use `a` afterwards.

</details>

---

## Quick Decision Guide

| Need to... | Use | Cost |
|---|---|---|
| Check membership | `HashSet` | $O(1)$ expected |
| Count occurrences | `HashMap` + `entry` | $O(n)$ to build, $O(1)$ expected to query |
| Count lowercase letters | `[i32; 26]` | $O(1)$ per update, no hashing |
| Stack (LIFO) | `Vec` with `push` / `pop` | $O(1)$ |
| Queue (FIFO) | `VecDeque` | $O(1)$ at both ends |
| Repeated min or max | `BinaryHeap` (+ `Reverse`) | $O(\log n)$ pop, $O(1)$ peek |
| k-th smallest, once | `select_nth_unstable` | $O(n)$ |
| Ordered keys, floor or ceiling | `BTreeMap` / `BTreeSet` | $O(\log n)$ |
| Lower or upper bound in a sorted `Vec` | `partition_point` | $O(\log n)$ |
| Character access in ASCII | `s.as_bytes()[i]` | $O(1)$ |

## See Also

- [Rust DSA Quick Reference](../rust-dsa-toolkit/): which tool to reach for
- [Rust Standard Library for DSA](../rust-standard-library/): method signatures and return types
- [Python Big O Cheatsheet](../python-big-o-cheatsheet/): the same costs in Python
- [TypeScript Big O Cheatsheet](../typescript-big-o-cheatsheet/): the same costs in TypeScript
