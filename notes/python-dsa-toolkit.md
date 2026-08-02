---
title: Python DSA Quick Reference
description: A fast task-to-tool lookup for choosing Python types and standard-library helpers while solving DSA problems.
category: Languages
order: 1
status: stable
tags:
  - python
  - dsa
  - cheatsheet
  - quick-reference
---

# Python DSA Quick Reference

Use this note when you recognize the task and need to choose the Python tool. It intentionally gives one compact idiom per need rather than teaching the full API or algorithm.

> **Choose your reference**
>
> - Choosing a tool → **Python DSA Quick Reference** (this note)
> - Looking up syntax and APIs → [Python Standard Library for DSA](../python_builtins_for_leetcode/)
> - Checking operation costs → [Python Big O Cheatsheet](../python-big-o-cheatsheet/)

## Quick-Pick Table

| When you need... | Reach for... | Remember |
|---|---|---|
| Fast membership or deduplication | `set` | Values must be hashable |
| Frequency counts | `Counter` | Best when counts are the result |
| Missing numeric/list defaults | `defaultdict(int/list)` | Accessing a missing key inserts it |
| Stack, DFS, monotonic stack | `list` | `append()` and `pop()` at the end |
| Queue or BFS | `deque` | Use `popleft()`, not `list.pop(0)` |
| Repeated minimum or Top-K | `heapq` | Min-heap; negate numeric values for max-heap |
| Lower/upper bound | `bisect_left/right` | Search is O(log n); list insertion is O(n) |
| Preserve original indices | `enumerate` | Carry `(index, value)` through sorting |
| Sort by multiple fields | `key=lambda ...` | Return a tuple of sort keys |
| Adjacent pairs | `itertools.pairwise` | Python 3.10+; avoids a slice |
| Combinations or permutations | `itertools` | Use only when generated output is acceptable |
| Prefix sums | `itertools.accumulate` | Add a leading zero for range queries |
| Memoized recursion | `@lru_cache(None)` | Every argument must be hashable |
| Infinity sentinel | `math.inf` | Useful in DP and shortest paths |
| Grid traversal | direction tuples | Store coordinates as hashable tuples |

## Counting, Membership, and Grouping

```python
from collections import Counter, defaultdict

seen = set(nums)
freq = Counter(nums)

groups = defaultdict(list)
for item in items:
    groups[key(item)].append(item)

count = defaultdict(int)
count[x] += 1
```

Choose by intent:

- `set` when only presence matters.
- `Counter` when counts are the output or you need `most_common()`.
- `defaultdict` when building groups, adjacency lists, or mutable buckets.
- Plain `dict.get()` when you want reads to avoid inserting missing keys.

```python
count = {}
count[x] = count.get(x, 0) + 1
```

## Stack, Queue, and Traversal State

```python
from collections import deque

# Stack / iterative DFS
stack = [start]
node = stack.pop()
stack.append(next_node)

# Queue / BFS
queue = deque([start])
node = queue.popleft()
queue.append(next_node)

# Hashable grid state
visited = {(row, col)}
directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
```

The data structure does not provide the traversal invariant. For full BFS, DFS, monotonic-stack, and graph reasoning, use the corresponding pattern note.

## Heaps and Top-K

```python
import heapq

heap = []
heapq.heappush(heap, value)
smallest = heapq.heappop(heap)
smallest = heap[0]  # peek; guard against an empty heap

# Portable max-heap idiom for numeric priorities
heapq.heappush(heap, -value)
largest = -heapq.heappop(heap)
```

Keep the `k` largest values seen so far:

```python
heap = []

for value in nums:
    if len(heap) < k:
        heapq.heappush(heap, value)
    else:
        heapq.heappushpop(heap, value)
```

Use a heap for repeated priority access, streaming Top-K, and Dijkstra's priority queue. Use `sorted()` when you need the entire result in order.

## Binary Search in Sorted Data

```python
from bisect import bisect_left, bisect_right

left = bisect_left(nums, target)    # first index with value >= target
right = bisect_right(nums, target)  # first index with value > target

exists = left < len(nums) and nums[left] == target
occurrences = right - left
```

`bisect` handles ordinary sorted-list boundaries. Write a custom binary-search loop when the search condition is a monotone predicate rather than direct value ordering.

## Sorting and Original Indices

```python
# Keep index with each value
by_value = sorted(enumerate(nums), key=lambda pair: pair[1])

# Second field ascending, first field descending
records.sort(key=lambda item: (item[1], -item[0]))

# Build strings from pieces
result = "".join(chars)
```

Python sorting is stable. For multi-pass sorting, sort by the secondary key first and the primary key last.

## Iteration Helpers

```python
from itertools import accumulate, combinations, pairwise, product

for index, value in enumerate(nums):
    ...

for left, right in pairwise(nums):
    ...

prefix = [0] + list(accumulate(nums))
range_sum = prefix[right] - prefix[left]

for a, b in combinations(nums, 2):
    ...

for row, col in product(range(rows), range(cols)):
    ...
```

These helpers reduce indexing mistakes, but they do not improve the size of the generated search space. `combinations` and `product` can still produce quadratic or exponential work.

## Memoization and DP Storage

```python
from functools import lru_cache

@lru_cache(None)
def solve(state):
    if is_base_case(state):
        return base_value
    return combine(solve(next_state) for next_state in transitions(state))
```

Cache arguments must be hashable. Use tuples instead of lists for compound state.

```python
memo = {}
state = (row, col, mask)

dp = [0] * n
grid_dp = [[0] * cols for _ in range(rows)]
```

Prefer an iterative solution for recursion depths near Python's limit. Raising the recursion limit does not remove the risk of exhausting the C stack.

## Python Gotchas

| Avoid | Prefer | Why |
|---|---|---|
| `list.pop(0)` | `deque.popleft()` | Lists shift remaining elements |
| Repeated `x in some_list` | Build a `set` once | Average constant-time membership |
| `[[]] * n` | `[[] for _ in range(n)]` | Multiplication aliases the same inner list |
| `[[0] * cols] * rows` | `[[0] * cols for _ in range(rows)]` | Same mutable-row aliasing |
| Repeated string concatenation | Buffer pieces, then `"".join()` | Clear and consistently linear |
| Assuming `bisect` makes insertion fast | Account for the O(n) list shift | Only the search is logarithmic |
| Mutating objects used as cache keys | Use immutable tuples | Cached arguments must remain hashable |
| `zip(nums, nums[1:])` on large lists | `pairwise(nums)` | Slicing allocates another list |

For complete operation costs, see [Python Big O Cheatsheet](../python-big-o-cheatsheet/).

## Pattern Routing

The helper is not the algorithm. Use this table to jump from a Python tool to the pattern that explains correctness.

| Problem signal | Python helper | Pattern to learn |
|---|---|---|
| Unweighted shortest path | `deque` | BFS |
| Weighted shortest path, non-negative edges | `heapq` | Dijkstra |
| Sliding-window maximum/minimum | `deque` | Monotonic queue |
| Pair search in sorted input | indices and `enumerate` | [Two Pointers](../two_pointers/) |
| Frequency or complement lookup | `dict`, `set`, `Counter` | [Arrays & Hashing](../arrays_and_hashing/) |
| Connectivity under edge additions | no direct stdlib tool | Union-Find / DSU |
| Prefix lookup or autocomplete | nested `dict` | Trie |
| Merge overlapping ranges | `sort(key=...)` | Intervals |
| Repeated overlapping states | `lru_cache` | Dynamic programming |

## See Also

- [Python Standard Library for DSA](../python_builtins_for_leetcode/) — complete APIs and module behavior
- [Python Big O Cheatsheet](../python-big-o-cheatsheet/) — operation and data-structure costs
- [Two Pointers](../two_pointers/) — invariants and pointer-movement families
- [Arrays & Hashing](../arrays_and_hashing/) — lookup, counting, grouping, and canonical-key patterns
