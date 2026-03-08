# Arrays & Hashing

## Key Concepts

- **Hash map for O(1) lookups** — trade space for time
- **Prefix sums** — precompute cumulative sums for range queries
- **Counting / frequency maps** — use `collections.Counter`

## Patterns

### Two Sum (Hash Map)

::: code-group
<<< @/../src/leetcode/arrays_hashing/two_sum.py [Python]
<<< @/../src/leetcode/arrays_hashing/TwoSum.jl [Julia]
:::

**Time**: O(n) | **Space**: O(n)

### Prefix Sum

<<< @/../src/patterns/arrays/prefix_sum.py

**Time**: O(n) build, O(1) query | **Space**: O(n)

### Kadane's Algorithm (Max Subarray)

<<< @/../src/patterns/arrays/kadane.py

**Time**: O(n) | **Space**: O(1)

## Common Tricks

| Trick | When to use |
|-------|-------------|
| Sort first | Simplifies duplicate detection, two sum variants |
| Negate index as visited marker | In-place O(1) space visited tracking |
| `collections.defaultdict(int)` | Cleaner frequency maps |
| `enumerate()` | Always prefer over `range(len(...))` |

## Related Problems

- [LeetCode 1 — Two Sum](/problems/leetcode)
- [LeetCode 238 — Product of Array Except Self](/problems/leetcode)
- [LeetCode 53 — Maximum Subarray](/problems/leetcode)
