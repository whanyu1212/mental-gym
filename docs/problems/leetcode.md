# LeetCode Problems

> Solutions live in `src/leetcode/python/` and `src/leetcode/julia/`

## Arrays & Hashing

| # | Problem | Difficulty | Notes |
|---|---------|-----------|-------|
| 1 | Two Sum | Easy | Hash map, O(n) |
| 49 | Group Anagrams | Medium | Sorted key or char count tuple |
| 238 | Product of Array Except Self | Medium | Prefix + suffix products, no division |
| 53 | Maximum Subarray | Medium | Kadane's algorithm |
| 128 | Longest Consecutive Sequence | Medium | Hash set, O(n) |

## Two Pointers

| # | Problem | Difficulty | Notes |
|---|---------|-----------|-------|
| 167 | Two Sum II | Medium | Converging pointers on sorted array |
| 15 | 3Sum | Medium | Sort + two pointers, skip duplicates |
| 11 | Container With Most Water | Medium | Greedy converging pointers |
| 42 | Trapping Rain Water | Hard | Two pointers or monotonic stack |

## Sliding Window

| # | Problem | Difficulty | Notes |
|---|---------|-----------|-------|
| 121 | Best Time to Buy and Sell Stock | Easy | Track min price so far |
| 3 | Longest Substring Without Repeating Chars | Medium | Hash map + variable window |
| 76 | Minimum Window Substring | Hard | Two maps + shrink when valid |

## Stack

| # | Problem | Difficulty | Notes |
|---|---------|-----------|-------|
| 20 | Valid Parentheses | Easy | Stack + pairs dict |
| 155 | Min Stack | Medium | Parallel min stack |
| 739 | Daily Temperatures | Medium | Monotonic decreasing stack |
| 84 | Largest Rectangle in Histogram | Hard | Monotonic increasing stack |

## Linked List

| # | Problem | Difficulty | Notes |
|---|---------|-----------|-------|
| 206 | Reverse Linked List | Easy | Iterative prev/curr |
| 21 | Merge Two Sorted Lists | Easy | Dummy head |
| 141 | Linked List Cycle | Easy | Floyd's fast/slow |
| 19 | Remove Nth Node From End | Medium | Two pointers, n gap |
| 143 | Reorder List | Medium | Find mid + reverse + merge |

## Trees

| # | Problem | Difficulty | Notes |
|---|---------|-----------|-------|
| 104 | Maximum Depth of Binary Tree | Easy | Recursive DFS |
| 226 | Invert Binary Tree | Easy | Swap children recursively |
| 102 | Binary Tree Level Order Traversal | Medium | BFS with deque |
| 236 | Lowest Common Ancestor | Medium | Recursive case split |

## Graphs

| # | Problem | Difficulty | Notes |
|---|---------|-----------|-------|
| 200 | Number of Islands | Medium | DFS/BFS flood fill |
| 207 | Course Schedule | Medium | Cycle detection (DFS coloring) |
| 210 | Course Schedule II | Medium | Topological sort (Kahn's) |
