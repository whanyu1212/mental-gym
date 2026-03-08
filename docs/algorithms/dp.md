# Dynamic Programming

## Framework
1. **Define subproblem** — what does `dp[i]` represent?
2. **Recurrence** — how does `dp[i]` relate to smaller subproblems?
3. **Base cases** — what are the smallest valid inputs?
4. **Order** — bottom-up (iterative) or top-down (memoization)?

## Patterns

### 0/1 Knapsack

<<< @/../src/dsa_from_scratch/python/dynamic_programming/01_knapsack.py

### 1D DP — Fibonacci / Climbing Stairs
```python
def climb_stairs(n: int) -> int:
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b
```

### 1D DP — House Robber
```python
def rob(nums: list[int]) -> int:
    prev2 = prev1 = 0
    for n in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + n)
    return prev1
```

### 2D DP — Longest Common Subsequence
```python
def lcs(s: str, t: str) -> int:
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s[i-1] == t[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]
```
**Time**: O(mn) | **Space**: O(mn) → optimizable to O(n)

## Memoization Template
```python
from functools import lru_cache

def solve(n):
    @lru_cache(maxsize=None)
    def dp(i):
        if i <= 1:
            return i
        return dp(i - 1) + dp(i - 2)
    return dp(n)
```

## Common DP Problems by Category
| Category | Example Problems |
|---|---|
| Linear | Climbing Stairs, House Robber, Jump Game |
| Interval | Palindromic Substrings, Burst Balloons |
| Knapsack | Coin Change, Partition Equal Subset Sum |
| Grid | Unique Paths, Minimum Path Sum |
| String | LCS, Edit Distance, Word Break |

## Related Problems

- [LeetCode 70 — Climbing Stairs](/problems/leetcode)
- [LeetCode 198 — House Robber](/problems/leetcode)
- [LeetCode 1143 — Longest Common Subsequence](/problems/leetcode)
- [LeetCode 322 — Coin Change](/problems/leetcode)
