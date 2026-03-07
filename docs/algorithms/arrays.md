# Arrays & Hashing

## Key Concepts

- **Hash map for O(1) lookups** — trade space for time
- **Prefix sums** — precompute cumulative sums for range queries
- **Counting / frequency maps** — use `collections.Counter`

## Patterns

### Two Sum (Hash Map)
```python
def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return []
```
**Time**: O(n) | **Space**: O(n)

### Prefix Sum
```python
def build_prefix(nums: list[int]) -> list[int]:
    prefix = [0] * (len(nums) + 1)
    for i, n in enumerate(nums):
        prefix[i + 1] = prefix[i] + n
    return prefix

# Range sum [l, r] (0-indexed, inclusive)
def range_sum(prefix, l, r):
    return prefix[r + 1] - prefix[l]
```
**Time**: O(n) build, O(1) query | **Space**: O(n)

### Kadane's Algorithm (Max Subarray)
```python
def max_subarray(nums: list[int]) -> int:
    max_sum = cur = nums[0]
    for n in nums[1:]:
        cur = max(n, cur + n)
        max_sum = max(max_sum, cur)
    return max_sum
```
**Time**: O(n) | **Space**: O(1)

## Common Tricks

| Trick | When to use |
|-------|-------------|
| Sort first | Simplifies duplicate detection, two sum variants |
| Negate index as visited marker | In-place O(1) space visited tracking |
| `collections.defaultdict(int)` | Cleaner frequency maps |
| `enumerate()` | Always prefer over `range(len(...))` |

## Related Problems
- LeetCode 1 — Two Sum
- LeetCode 238 — Product of Array Except Self
- LeetCode 53 — Maximum Subarray
