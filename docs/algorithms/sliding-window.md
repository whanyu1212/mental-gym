# Sliding Window

## When to Use
- Contiguous subarray / substring problems
- "Longest / shortest subarray with property X"
- Fixed-size window averages / sums

## Patterns

### Fixed Size Window
```python
def max_avg_subarray(nums: list[int], k: int) -> float:
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum / k
```
**Time**: O(n) | **Space**: O(1)

### Variable Size Window (expand/shrink)
```python
def longest_subarray_with_k_zeros(nums: list[int], k: int) -> int:
    l = zeros = 0
    result = 0
    for r in range(len(nums)):
        if nums[r] == 0:
            zeros += 1
        while zeros > k:
            if nums[l] == 0:
                zeros -= 1
            l += 1
        result = max(result, r - l + 1)
    return result
```
**Time**: O(n) | **Space**: O(1)

### Sliding Window with Hash Map (unique chars)
```python
def length_of_longest_substring(s: str) -> int:
    seen = {}
    l = result = 0
    for r, c in enumerate(s):
        if c in seen and seen[c] >= l:
            l = seen[c] + 1
        seen[c] = r
        result = max(result, r - l + 1)
    return result
```
**Time**: O(n) | **Space**: O(1) (bounded by charset)

## Decision Guide

```
Need subarray sum == target?   → Prefix sum + hash map
Need longest with constraint?  → Variable sliding window
Need fixed-k window stats?     → Fixed sliding window
```

## Related Problems
- LeetCode 121 — Best Time to Buy/Sell Stock
- LeetCode 3 — Longest Substring Without Repeating
- LeetCode 76 — Minimum Window Substring
