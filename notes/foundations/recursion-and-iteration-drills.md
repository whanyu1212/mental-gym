---
title: Recursion and Iteration Drills
slug: recursion-and-iteration-drills
description: A leveled practice set for recursion and iteration — tracing questions, linear and branching recursion, linked lists, trees, intro backtracking, and loop-invariant drills.
category: Complexity
order: 7
status: stable
tags:
  - recursion
  - iteration
  - interview-prep
  - practice
---

# Recursion and Iteration Drills

A practice set that goes from easiest to hardest. Each level builds a skill the next one depends on. For the concepts behind these, read [Recursion vs Iteration](../recursion-and-iteration/) first.

**For every problem, write it both ways where you can.** Converting between recursion and iteration builds understanding faster than anything else.

## How to work each problem

1. Before coding, write down the **base case**, the **recursive case**, and **how the input gets smaller**.
2. State the **maximum stack depth** in terms of $n$ or the tree height $h$.
3. Solve it, then **convert it**: recursive to iterative, or the other way.
4. Move to the next level once you can solve its problems without hints in about 10–15 minutes each.

**Short on time?** The minimum set is Q1–Q3, then #7, #9, #14, #17, #22, #23, and #27. That covers every core idea.

---

## Level 0: Trace before you write

If you can't predict what recursive code does, writing it will feel like guessing. Work these out on paper *before* running them.

**Q1. What does `f(3)` print?**

```python
def f(n):
    if n == 0:
        return
    print("before", n)
    f(n - 1)
    print("after", n)
```

**Q2. What does `g(4)` return, and how many times is `g` called in total?**

```python
def g(n):
    if n <= 1:
        return n
    return g(n - 1) + g(n - 2)
```

**Q3. What goes wrong when you call `h(5)`?**

```python
def h(n):
    if n == 0:
        return 0
    return n + h(n - 2)
```

**Q4. A recursive inorder traversal visits a balanced BST and a completely skewed BST, each with $n$ nodes. What is the stack space for each, and which one would make you switch to an iterative version in Python?**

<details>
<summary>Answers</summary>

1. `before 3`, `before 2`, `before 1`, `after 1`, `after 2`, `after 3`. The "after" lines run as the stack unwinds, so they come out in reverse order.
2. It returns `3`. `g` is called **9** times in total: `g(4)` calls `g(3)` and `g(2)`, and `g(2)` is computed twice. Repeated work like this is why memoization exists.
3. `5 → 3 → 1 → -1 → -3 → …` skips over `0`, so the base case is never reached. Python raises `RecursionError` after about 1000 frames. Fix it with `if n <= 0`.
4. Balanced: $O(\log n)$. Skewed: $O(n)$. The skewed tree is effectively a linked list, so a large one will overflow Python's stack. That is the one to convert to an explicit stack.

</details>

---

## Level 1: Linear recursion on numbers and strings

Each of these makes one recursive call per step. Write the recursive version first, then the loop.

| # | Problem | What it teaches |
|---|---|---|
| 1 | Sum of `1..n` | The simplest base case and recursive step |
| 2 | Factorial | The same pattern with multiplication |
| 3 | Count the digits of an integer | Shrinking the input with `// 10` instead of `- 1` |
| 4 | [Reverse String](../../algorithms/344-reverse-string) | Recursing on two indices |
| 5 | Check whether a string is a palindrome | Two-index recursion with an early exit |
| 6 | Sum and max of a list | Recursing on an index vs slicing: why is `lst[1:]` on every call $O(n^2)$ overall? |
| 7 | [Pow(x, n)](https://leetcode.com/problems/powx-n/) in $O(n)$, then in $O(\log n)$ | Halving the problem instead of shrinking it by 1 |
| 8 | GCD with Euclid's algorithm | Tail recursion, which turns into a loop almost mechanically |

**Checkpoint:** in #7, why does the $O(\log n)$ version only need about $\log_2 n$ stack frames?

<details>
<summary>Checkpoint answer</summary>

Each call recurses on `n // 2` exactly once (compute `half = power(x, n // 2)` once and square it). You can halve $n \ge 1$ exactly $\lfloor \log_2 n \rfloor + 1$ times before it reaches 0. Counting the base-case call at `n == 0` as a frame too, the peak depth is $\lfloor \log_2 n \rfloor + 2$. For example, `power(x, 1)` has frames for `n = 1` and `n = 0`. Either way it is $O(\log n)$. If you write `power(x, n // 2) * power(x, n // 2)` instead, the depth is the same but the total work goes back to $O(n)$.

</details>

---

## Level 2: Branching recursion and memoization

| # | Problem | What it teaches |
|---|---|---|
| 9 | [Fibonacci Number](https://leetcode.com/problems/fibonacci-number/): naive, then memoized, then bottom-up with two variables | The full path from recursion to memoization to iteration |
| 10 | [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) | Recognizing Fibonacci in disguise |
| 11 | [N-th Tribonacci Number](https://leetcode.com/problems/n-th-tribonacci-number/) | Generalizing the rolling-variable trick |
| 12 | Print every binary string of length `n` | Your first tree of choices, which leads into backtracking |

**Checkpoint:** draw the call tree for naive `fib(5)` and circle the repeated subproblems.

<details>
<summary>Checkpoint answer</summary>

There are **15** calls in total. `fib(4)` is computed once, `fib(3)` twice, `fib(2)` three times, `fib(1)` five times, and `fib(0)` three times. Memoization reduces this to one computation per distinct `n`, so $O(n)$ time. The maximum stack depth is $O(n)$ either way.

</details>

---

## Level 3: Recursion on linked lists

| # | Problem | What it teaches |
|---|---|---|
| 13 | Print a linked list forward, then **backward** | Doing the work after the recursive call, on the way back up |
| 14 | [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/), both ways | The classic comparison: $O(n)$ stack vs $O(1)$ space |
| 15 | [Merge Two Sorted Lists](../../algorithms/21-merge-two-sorted-lists) | Returning a node from each call and rewiring pointers |
| 16 | [Swap Nodes in Pairs](https://leetcode.com/problems/swap-nodes-in-pairs/) | Recursing two steps at a time |

---

## Level 4: Recursion on trees (the most important level)

| # | Problem | What it teaches |
|---|---|---|
| 17 | [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/): recursive, then BFS | Combining child results vs going level by level |
| 18 | [Same Tree](https://leetcode.com/problems/same-tree/) | Recursing on two structures at once |
| 19 | [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/) | Changing the structure in place |
| 20 | [Path Sum](https://leetcode.com/problems/path-sum/) | Passing state *down* through parameters |
| 21 | [Search in a Binary Search Tree](https://leetcode.com/problems/search-in-a-binary-search-tree/) | One-branch recursion, which becomes a simple loop |
| 22 | [Inorder](https://leetcode.com/problems/binary-tree-inorder-traversal/), [Preorder](https://leetcode.com/problems/binary-tree-preorder-traversal/), [Postorder](https://leetcode.com/problems/binary-tree-postorder-traversal/): recursive, **then with an explicit stack** | Simulating the call stack yourself |

**Checkpoint:** in #17 the answer flows *up* from the children. In #20 information flows *down* to them. Which direction does each of #17–#21 use?

<details>
<summary>Checkpoint answer</summary>

- **#17 Maximum Depth:** up. Each node returns `1 + max(left, right)`.
- **#18 Same Tree:** up. Each pair returns whether its subtrees match.
- **#19 Invert Binary Tree:** up. Each call returns its inverted subtree (a preorder swap also works).
- **#20 Path Sum:** down. The remaining target is passed to the children, and a boolean comes back.
- **#21 Search in a BST:** down. Only one path is followed, which is why it turns into a `while` loop so easily.

If you get stuck on the explicit-stack versions in #22, see [Converting recursion to iteration](../recursion-and-iteration/#converting-recursion-to-iteration).

</details>

---

## Level 5: Intro to backtracking

| # | Problem | What it teaches |
|---|---|---|
| 23 | [Subsets](https://leetcode.com/problems/subsets/) | Include-or-exclude decisions |
| 24 | [Permutations](https://leetcode.com/problems/permutations/) | Choose, recurse, un-choose |
| 25 | [Generate Parentheses](../../algorithms/22-generate-parentheses) | Pruning branches that can't lead to a valid answer |
| 26 | [Flood Fill](https://leetcode.com/problems/flood-fill/): recursive DFS, then iterative BFS | Grid recursion, and when the depth becomes risky |

---

## Iteration drills (don't skip these)

Iteration has its own fundamentals: **loop invariants** and **termination**.

| # | Problem | What it teaches |
|---|---|---|
| 27 | [Binary Search](https://leetcode.com/problems/binary-search/) | Boundaries: `lo <= hi` vs `lo < hi`, and `mid ± 1` |
| 28 | [Power of Two](https://leetcode.com/problems/power-of-two/) with a loop, then with a bit trick | Loops that shrink by division |
| 29 | Reverse an integer digit by digit | Building up a result as the loop runs |
| 30 | Convert any recursive solution above to iterative | Recursion to explicit stack is a skill of its own |

For every loop, finish this sentence: *"At the top of each iteration, it is always true that ___."*

<details>
<summary>Example invariant for #27</summary>

With `lo, hi = 0, len(nums) - 1` and `while lo <= hi`: *"If the target is in the array, its index is in `[lo, hi]`."* Each step either returns or shrinks the range while keeping that true, and the loop stops when the range is empty. That is why `lo = mid + 1` and `hi = mid - 1` are correct: `mid` has already been checked.

</details>
