# Sliding Window

## When to Use
- Contiguous subarray / substring problems
- "Longest / shortest subarray with property X"
- Fixed-size window averages / sums

## Patterns

### Fixed Size Window

<<< @/../src/patterns/sliding_window/sliding_window_fixed.py

### Variable Size Window (expand/shrink)

<<< @/../src/patterns/sliding_window/sliding_window_variable.py

### Longest Substring Without Repeating Characters

<<< @/../src/leetcode/sliding_window/longest_substring.py

## Decision Guide

```
Need subarray sum == target?   → Prefix sum + hash map
Need longest with constraint?  → Variable sliding window
Need fixed-k window stats?     → Fixed sliding window
```

## Related Problems

- [LeetCode 121 — Best Time to Buy/Sell Stock](/problems/leetcode)
- [LeetCode 3 — Longest Substring Without Repeating](/problems/leetcode)
- [LeetCode 76 — Minimum Window Substring](/problems/leetcode)
