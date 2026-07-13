---
title: Time Complexity
description: A systematic guide to analysing and recognising time complexity — data structure operations, sorting, graph algorithms, recurrence patterns, and interview strategy.
category: Complexity
order: 2
status: stable
tags:
  - complexity
  - big-o
  - algorithms
---

# Time Complexity

Time complexity measures how the number of operations an algorithm performs grows as a function of input size $n$. It is distinct from *runtime* — two machines running the same algorithm will have different runtimes, but the same time complexity.

The goal is not to count every instruction, but to characterise the **dominant growth pattern** so you can reason about scalability and make informed algorithm choices.

## Data Structure Operations

Knowing these cold is the foundation of algorithm analysis. Every time you reach for a data structure inside an algorithm, its operation costs compound into the total.

### Core Structures

| Structure | Access | Search | Insert | Delete | Space |
|-----------|--------|--------|--------|--------|-------|
| Array (static) | $O(1)$ | $O(n)$ | $O(n)$ | $O(n)$ | $O(n)$ |
| Dynamic array | $O(1)$ | $O(n)$ | $O(1)$† | $O(n)$ | $O(n)$ |
| Singly linked list | $O(n)$ | $O(n)$ | $O(1)$‡ | $O(1)$‡ | $O(n)$ |
| Hash table | — | $O(1)$* | $O(1)$* | $O(1)$* | $O(n)$ |
| Binary search tree | $O(\log n)$* | $O(\log n)$* | $O(\log n)$* | $O(\log n)$* | $O(n)$ |
| AVL / Red-Black tree | $O(\log n)$ | $O(\log n)$ | $O(\log n)$ | $O(\log n)$ | $O(n)$ |
| Binary heap | — | $O(n)$ | $O(\log n)$ | $O(\log n)$ | $O(n)$ |
| Trie | $O(k)$ | $O(k)$ | $O(k)$ | $O(k)$ | $O(n \cdot k)$ |

† Amortized. ‡ Given a pointer to the node. * Average case — worst case is $O(n)$ due to hash collisions or an unbalanced BST.

$k$ = key length.

> **Why does a linked list have $O(1)$ insert but an array $O(n)$?** Inserting into a linked list requires only pointer rewiring — constant work. Inserting into an array requires shifting every element after the insertion point to make room — linear work. But linked list *access* is $O(n)$ because you must walk the chain from the head; arrays reach any index directly.

### Python-Specific: List, Dict, Set, Deque

These are the structures you reach for daily. Their costs are not always obvious.

**List**

| Operation | Average | Worst | Note |
|-----------|---------|-------|------|
| `arr[i]` | $O(1)$ | $O(1)$ | |
| `arr.append(x)` | $O(1)$† | $O(n)$ | †amortized |
| `arr.pop()` | $O(1)$ | $O(1)$ | from end |
| `arr.pop(0)` | $O(n)$ | $O(n)$ | shifts everything left |
| `arr.insert(i, x)` | $O(n)$ | $O(n)$ | shifts suffix right |
| `x in arr` | $O(n)$ | $O(n)$ | linear scan |
| `arr.sort()` / `sorted()` | $O(n \log n)$ | $O(n \log n)$ | Timsort |
| `arr[a:b]` | $O(b - a)$ | $O(n)$ | **copies** the slice |
| `len(arr)` | $O(1)$ | $O(1)$ | stored attribute |
| `min()` / `max()` | $O(n)$ | $O(n)$ | full scan |

**Dict / Set**

| Operation | Average | Worst |
|-----------|---------|-------|
| `d[k]`, `d[k] = v`, `k in d` | $O(1)$ | $O(n)$ |
| `del d[k]` | $O(1)$ | $O(n)$ |
| Iteration | $O(n)$ | $O(n)$ |
| `set1 \| set2` (union) | $O(n + m)$ | $O(n + m)$ |
| `set1 & set2` (intersection) | $O(\min(n, m))$ | $O(n \cdot m)$ |

**Deque** (`collections.deque`)

| Operation | Time |
|-----------|------|
| `append` / `appendleft` | $O(1)$ |
| `pop` / `popleft` | $O(1)$ |
| `deque[i]` | $O(n)$ — **not** $O(1)$ |

Use `deque` when you need fast operations at both ends (sliding window, BFS). Use `list` when you need random access by index.

### String Operations

Strings in Python are immutable — every modification creates a new object.

| Operation | Cost | Note |
|-----------|------|------|
| `s[i]` | $O(1)$ | |
| `len(s)` | $O(1)$ | |
| `s[a:b]` | $O(b - a)$ | creates a new string |
| `s + t` | $O(n + m)$ | creates a new string |
| `sub in s` | $O(n \cdot m)$ | naive; Python uses optimised search |
| `''.join(parts)` | $O(n)$ | $n$ = total characters |
| `s.split()` | $O(n)$ | |

**The concatenation trap:**

```python
# O(n²) — each += allocates and copies a longer string
result = ""
for part in parts:
    result += part

# O(n) — one allocation, one copy per part
result = "".join(parts)
```

This matters: for $n$ parts each of length $L$, the naive approach costs $L + 2L + 3L + \cdots + nL = \frac{n(n+1)}{2} L = O(n^2 L)$.

## Sorting Algorithms

Understanding the trade-offs between sorting algorithms is a direct indicator of algorithmic maturity.

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Bubble sort | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Yes |
| Selection sort | $O(n^2)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | No |
| Insertion sort | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Yes |
| Merge sort | $O(n \log n)$ | $O(n \log n)$ | $O(n \log n)$ | $O(n)$ | Yes |
| Quick sort | $O(n \log n)$ | $O(n \log n)$ | $O(n^2)$ | $O(\log n)$ | No |
| Heap sort | $O(n \log n)$ | $O(n \log n)$ | $O(n \log n)$ | $O(1)$ | No |
| Counting sort | $O(n + k)$ | $O(n + k)$ | $O(n + k)$ | $O(k)$ | Yes |
| Radix sort | $O(d(n + k))$ | $O(d(n + k))$ | $O(d(n + k))$ | $O(n + k)$ | Yes |
| Timsort (Python) | $O(n)$ | $O(n \log n)$ | $O(n \log n)$ | $O(n)$ | Yes |

$k$ = range of values, $d$ = number of digits.

**Key observations:**

- **Merge sort** is the only comparison sort that is both $O(n \log n)$ worst-case *and* stable. The cost is $O(n)$ auxiliary space.
- **Quick sort** is $O(n^2)$ worst case on already-sorted input with a naive pivot (always pick first). Randomised pivot makes this vanishingly unlikely in practice.
- **Insertion sort** is $O(n)$ on nearly-sorted data — this is why Timsort uses it for short runs (< 64 elements).
- **Counting/Radix sort** can beat $O(n \log n)$ by exploiting the structure of integer keys, but requires bounded key ranges.
- A **stable** sort preserves the relative order of equal elements. This matters when sorting by multiple keys in sequence.

## Graph Algorithms

| Algorithm | Time | Space | Use case |
|-----------|------|-------|----------|
| BFS | $O(V + E)$ | $O(V)$ | Shortest path (unweighted), level-order |
| DFS | $O(V + E)$ | $O(V)$ | Connectivity, cycle detection, topological sort |
| Dijkstra (binary heap) | $O((V + E) \log V)$ | $O(V)$ | Shortest path, non-negative weights |
| Bellman-Ford | $O(V \cdot E)$ | $O(V)$ | Shortest path, handles negative weights |
| Floyd-Warshall | $O(V^3)$ | $O(V^2)$ | All-pairs shortest path |
| Prim's (binary heap) | $O(E \log V)$ | $O(V)$ | Minimum spanning tree |
| Kruskal's | $O(E \log E)$ | $O(V)$ | Minimum spanning tree |
| Topological sort | $O(V + E)$ | $O(V)$ | DAG ordering, dependency resolution |
| Union-Find (path compression) | $O(\alpha(n))$* | $O(n)$ | Disjoint sets, cycle detection |

$V$ = vertices, $E$ = edges, $\alpha$ = inverse Ackermann function (effectively constant — $\alpha(n) \leq 4$ for all practical $n$).

**Adjacency representation matters:**

| Representation | Space | Edge lookup | Iterate neighbours |
|----------------|-------|-------------|-------------------|
| Adjacency matrix | $O(V^2)$ | $O(1)$ | $O(V)$ |
| Adjacency list | $O(V + E)$ | $O(\deg(v))$ | $O(\deg(v))$ |

For sparse graphs ($E \ll V^2$), adjacency lists dominate. Adjacency matrices are only practical for dense graphs or when constant-time edge queries are critical.

## Pattern Recognition

Given unfamiliar code, you can often read off the complexity directly from the structure. These are the canonical patterns.

### $O(1)$ — Direct access or formula

No loops, no recursion, no input-dependent work:

```python
arr[i]
d[key]
(n * (n + 1)) // 2   # closed-form formula
```

### $O(\log n)$ — Halving or doubling

The search space is cut (or grown) by a constant factor each step:

```python
# Halving
i = n
while i > 0:
    i //= 2          # log₂n iterations

# Binary search
lo, hi = 0, len(arr) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    ...
```

Any time you see `i //= 2`, `i *= 2`, or `mid = (lo + hi) // 2`, think $O(\log n)$.

### $O(n)$ — Single pass

One loop, constant work per iteration:

```python
total = 0
for x in arr:
    total += x
```

Also: building a hash map from a list, linear scan, two-pointer technique.

### $O(n \log n)$ — Sort, or divide-and-conquer with linear merge

Either an explicit sort, or a recursive structure that does $O(n)$ work at each of $\log n$ levels:

```python
arr.sort()           # O(n log n)

def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    L = merge_sort(arr[:mid])    # T(n/2)
    R = merge_sort(arr[mid:])    # T(n/2)
    return merge(L, R)           # O(n)
# Recurrence: T(n) = 2T(n/2) + O(n) → O(n log n)
```

### $O(n^2)$ — Nested loops over the same data

```python
for i in range(n):
    for j in range(n):    # both range over n
        ...

for i in range(n):
    for j in range(i, n): # triangle: n(n+1)/2 = O(n²)
        ...
```

Watch for hidden quadratic patterns:

```python
# O(n²) — remove is O(n) called n times
for x in to_remove:
    arr.remove(x)

# O(n²) — in is O(n) called n times
for x in arr:
    if x in another_arr:   # use a set instead
        ...
```

### $O(2^n)$ — Branching recursion or subsets

Two (or more) recursive calls of the same size:

```python
def f(n):
    if n == 0:
        return
    f(n - 1)    # branch 1
    f(n - 1)    # branch 2
```

The call tree has $2^n$ leaves. Generating all subsets of an $n$-element set is intrinsically $O(2^n)$ — there are $2^n$ subsets to produce.

## Tricky Cases and Gotchas

### 1. Apparent $O(n^2)$ that is really $O(n \log n)$

```python
for i in range(n):
    j = i
    while j > 0:
        j //= 2        # O(log i) for each i
```

Total iterations: $\sum_{i=1}^{n} \log i = \log(n!) \approx n \log n$ by Stirling's approximation. Not $O(n^2)$.

### 2. Slicing inside a loop

```python
for i in range(n):
    process(arr[i:])    # slice is O(n - i) — copies data
```

Total work: $(n) + (n-1) + \cdots + 1 = \frac{n(n+1)}{2} = O(n^2)$. Pass indices instead of slices when possible.

### 3. The same complexity, different constants

Insertion sort and merge sort are both $O(n \log n)$... wait, no — insertion sort is $O(n^2)$. But insertion sort on a nearly-sorted array of 20 elements will *beat* merge sort in practice because merge sort's constant factor (recursive calls, extra allocation) is much higher. Big O hides constants, and constants matter for small $n$.

This is why Timsort detects already-sorted "runs" and uses insertion sort on them. Knowing when asymptotic analysis is the wrong lens is part of the skill.

### 4. Hash table worst case

```python
d = {}
for x in adversarial_input:
    d[x] = True    # average O(1), worst O(n)
```

In Python, `dict` and `set` use a randomised hash seed (since Python 3.3) which makes adversarial inputs hard to construct. But for non-string keys or custom `__hash__` implementations, be aware the worst case exists.

### 5. Sorting an already-sorted list

| Algorithm | On sorted input |
|-----------|----------------|
| Insertion sort | $O(n)$ — best case |
| Quick sort (naive pivot) | $O(n^2)$ — worst case |
| Merge sort | $O(n \log n)$ — no change |
| Timsort (Python) | $O(n)$ — detects runs |

If you know your input is likely sorted or nearly sorted, this affects your algorithm choice.

## Interview Heuristics

**Reading constraints to guess required complexity:**

If the problem gives $n \leq 10^5$ and a 1-second time limit, the solution is almost certainly $O(n \log n)$ or $O(n)$. If $n \leq 20$, $O(2^n)$ or $O(n!)$ might be acceptable.

| $n$ constraint | Expected complexity |
|----------------|---------------------|
| $n \leq 12$ | $O(n!)$ or $O(2^n \cdot n)$ |
| $n \leq 25$ | $O(2^n)$ |
| $n \leq 500$ | $O(n^3)$ |
| $n \leq 5{,}000$ | $O(n^2)$ |
| $n \leq 10^5$ | $O(n \log n)$ |
| $n \leq 10^6$ | $O(n)$ |
| $n \leq 10^9$ | $O(\log n)$ or $O(\sqrt{n})$ |

**Common optimisation moves:**

| From | To | Tool |
|------|----|------|
| $O(n^2)$ search | $O(n)$ | Hash set / dict |
| $O(n^2)$ pairs | $O(n \log n)$ | Sort + two pointers |
| $O(2^n)$ recursion | $O(n)$ or $O(n^2)$ | Memoisation / DP |
| $O(n)$ per query | $O(\log n)$ per query | Binary search on sorted data |
| $O(n)$ per query | $O(1)$ per query | Prefix sums / hash map |

## Review Questions

---

**Q1.** What is the time complexity of this function? Justify your answer.

```python
def f(arr):
    result = []
    for i in range(len(arr)):
        for j in range(i, len(arr)):
            result.append(arr[i] + arr[j])
    return result
```

> **Answer.** $O(n^2)$ time, $O(n^2)$ space. The outer loop runs $n$ times; the inner loop runs $n - i$ times for each $i$, giving $n + (n-1) + \cdots + 1 = \frac{n(n+1)}{2}$ iterations — $O(n^2)$. The result list accumulates all those pairs, so it also has $O(n^2)$ entries.

---

**Q2.** Why is `list.pop(0)` $O(n)$ while `list.pop()` is $O(1)$?

> **Answer.** Python's list is backed by a contiguous array. Removing the last element just decrements the length counter — $O(1)$. Removing the first element requires shifting every remaining element one position left to close the gap — $O(n)$. If you need fast removal from both ends, use `collections.deque`.

---

**Q3.** Two algorithms both run in $O(n \log n)$. Can you say anything about which is faster in practice?

> **Answer.** Not from Big O alone. Big O hides constant factors. One algorithm might do $100 \cdot n \log n$ operations and another $2 \cdot n \log n$ — the same asymptotic class but a 50× difference. Cache behaviour, branch prediction, and memory allocation patterns also affect real runtime. For small inputs, an $O(n^2)$ algorithm with tiny constants may beat an $O(n \log n)$ one.

---

**Q4.** What is the time complexity of building a hash map from an array of $n$ elements, and then performing $q$ lookups?

> **Answer.** Building: $O(n)$ — one insertion per element, each amortized $O(1)$. Each lookup: $O(1)$ average. Total: $O(n + q)$. This is the classic time-space trade-off: spend $O(n)$ time and space upfront to get $O(1)$ queries instead of $O(n)$ per query.

---

**Q5.** What is the complexity of the following, and how would you fix it?

```python
def contains_duplicate(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                return True
    return False
```

> **Answer.** $O(n^2)$ — checks every pair. Fix: use a set.
> ```python
> def contains_duplicate(arr):
>     return len(arr) != len(set(arr))  # O(n) time, O(n) space
> ```
> Or equivalently, iterate and add to a seen set, returning `True` on first repeat.

---

**Q6.** Quick sort has $O(n \log n)$ average case but $O(n^2)$ worst case. What input triggers the worst case, and how is it avoided?

> **Answer.** The worst case occurs when the pivot is always the minimum or maximum element — which happens with a naive "pick first element" strategy on already-sorted (or reverse-sorted) input. Each partition produces one subarray of size $n-1$ and one of size $0$, giving $T(n) = T(n-1) + O(n) \Rightarrow O(n^2)$. Solutions: **randomised pivot** (pick a random index), **median-of-three** (pick median of first, middle, last), or **introsort** (switch to heap sort when recursion depth exceeds $\log n$, which is what most standard libraries do).

---

**Q7.** An algorithm iterates over an array of size $n$ and for each element does a binary search on a sorted array of size $m$. What is the total complexity?

> **Answer.** $O(n \log m)$ — $n$ iterations, each costing $O(\log m)$.
