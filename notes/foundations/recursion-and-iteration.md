---
title: Recursion vs Iteration
slug: recursion-and-iteration
description: When to reach for recursion and when to reach for a loop — the mental model, a decision guide, problems that suit one or both, and how to convert recursion into an explicit stack.
category: Complexity
order: 6
status: stable
tags:
  - recursion
  - iteration
  - call-stack
  - fundamentals
---

# Recursion vs Iteration

Any recursive algorithm can be rewritten as a loop with an explicit stack, and any loop can be written as recursion. So neither one is ever strictly *required*. The useful question is which one is **natural, safe, and efficient** for the problem in front of you.

> **Rule of thumb:** use recursion when the problem is shaped like a **tree**. Use iteration when it is shaped like a **line**, or when the depth could be large enough to overflow the stack.

To practise, see [Recursion and Iteration Drills](../recursion-and-iteration-drills/).

---

## The mental model

Every correct recursive function has three parts. Write them down before you write any code:

1. **Base case:** the smallest input, answered directly without recursing.
2. **Recursive case:** solve the problem using the answer to a smaller copy of itself.
3. **Progress:** each call's input is strictly closer to the base case.

```python
def sum_to(n):
    if n == 0:              # 1. base case
        return 0
    return n + sum_to(n - 1)  # 2. recursive case, 3. n shrinks by 1
```

If any one of these is missing, the function either returns a wrong answer or never stops.

### What the call stack is doing

Each call pushes a **frame** holding its arguments, local variables, and where to return to. Frames pile up until a base case is reached, then unwind in reverse order. Code *before* the recursive call runs on the way down, and code *after* it runs on the way back up.

```python
def countdown(n):
    if n == 0:
        return
    print("down", n)   # runs on the way down: 3, 2, 1
    countdown(n - 1)
    print("up", n)     # runs on the way up:   1, 2, 3
```

That "work on the way back up" is the one thing recursion gives you for free. A loop has no way back up unless you build one with a stack.

Stack space is **O(maximum depth)**, not O(total calls). [Space Complexity](../space-complexity/#the-call-stack-in-depth) works through linear, halving, branching, and tree recursion in detail.

### A loop has the same three parts

| Recursion | Iteration |
|---|---|
| Base case | Loop exit condition |
| Recursive case | Loop body |
| Progress toward the base case | Progress toward the exit condition |
| State held in parameters and frames | State held in variables you update |

For loops, the matching discipline is the **loop invariant**: a statement that is true at the start of every iteration. If you can't finish the sentence *"At the top of each iteration, it is always true that ___"*, you don't fully understand the loop yet.

---

## Choosing between them

| Factor | Favours recursion | Favours iteration |
|---|---|---|
| **Problem shape** | Breaks into smaller copies of itself: trees, nested data, divide and conquer | Steps through items in order: arrays, strings, streams |
| **Maximum depth** | Small or bounded, such as $O(\log n)$ on balanced trees or halving | Could be $O(n)$ or unbounded: long lists, skewed trees, big grids |
| **Work after the call** | Must combine children's results (postorder, merge step) | Nothing to combine, so a loop is simpler |
| **Language** | Guaranteed tail calls (Scheme, Haskell, Scala `@tailrec`) | Python (default limit about 1000 frames), Java, JavaScript, C++, Rust: no guaranteed tail-call elimination |
| **Readability** | The code reads like the problem's definition | The state to track by hand is small |
| **Performance** | Usually fine | Hot inner loops avoid call overhead |
| **Extra memory** | $O(\text{depth})$ call stack, always | Often $O(1)$ |

**Depth is usually the deciding factor.** Recursion on a balanced tree of a million nodes only goes about 20 levels deep. Recursion down a million-node linked list goes a million levels deep and crashes Python.

---

## Where recursion is the natural fit

You *could* write these iteratively, but you would be rebuilding the call stack by hand, and the code gets harder to read.

- **Backtracking:** subsets, permutations, N-Queens, Sudoku, word search. Each call makes a choice, recurses, then undoes the choice. See [Generate Parentheses](../../algorithms/22-generate-parentheses) and the backtracking section of [Stack](../stack/).
- **Divide and conquer:** merge sort, quicksort, closest pair of points. See [Sort an Array](../../algorithms/912-sort-an-array).
- **Tree problems that combine child results:** height, diameter, "is balanced", lowest common ancestor, max path sum. Each node needs its children's answers first, which is postorder, and postorder is the traversal that is most awkward to write iteratively.
- **Nested or recursive structures:** recursive descent parsers, expression evaluators, flattening nested lists or JSON, walking a directory tree.
- **Top-down dynamic programming:** when only a small part of the state space is reachable, a memoized recursive function (`@functools.cache`) is easier to write than working out a bottom-up fill order.

## Where iteration is the natural fit

- **Deep or unbounded depth:** traversing a long linked list or a skewed tree, or flood-filling a large grid.
- **BFS / level-order traversal:** BFS needs a *queue*, but recursion gives you a *stack*. Recursive BFS is unnatural.
- **Linear scans:** two pointers, sliding window, prefix sums, Kadane. See [Two Pointers](../two_pointers/), [Sliding Window](../sliding_window/), [Prefix Sum](../prefix_sum_pattern/), and [Kadane](../kadane_algorithm/).
- **Bottom-up DP with rolling variables:** Fibonacci or House Robber in $O(1)$ space.
- **Long-running processes:** event loops, servers, game loops, reading a stream.
- **Performance-critical inner loops:** numeric code and simulations.

## Where both work well

Here the choice comes down to style and constraints.

| Problem | Recursive | Iterative | Usually preferred |
|---|---|---|---|
| Factorial, sum of a list | Mirrors the definition | Simple loop | Iterative (no stack) |
| Fibonacci | Memoized recursion | Two rolling variables | Iterative ($O(1)$ space) |
| Binary search | Recurse on one half | `while lo <= hi` | Iterative |
| GCD (Euclid) | `gcd(b, a % b)` | `while b: a, b = b, a % b` | Either |
| Reverse a linked list | Short, but $O(n)$ stack | Three pointers, $O(1)$ space | Iterative |
| Merge two sorted lists | Short, but $O(n + m)$ stack | Dummy head and a tail pointer | Iterative for long lists. See [Merge Two Sorted Lists](../../algorithms/21-merge-two-sorted-lists) |
| Reverse a string in place | Recurse on two indices | Two pointers | Iterative. See [Reverse String](../../algorithms/344-reverse-string) |
| Inorder / preorder traversal | Three lines | Explicit stack | Recursive unless depth is risky |
| DFS on a graph or grid | Clean | Explicit stack | Iterative for large grids |
| Fast exponentiation | Square `pow(x, n // 2)` | Bit-by-bit loop | Either |

---

## Converting recursion to iteration

This is a skill of its own, and interviewers ask for it directly ("Can you do that without recursion?").

### Tail recursion becomes a loop directly

A call is a **tail call** when nothing is left to do after it returns. Tail-recursive functions turn into loops mechanically: the parameters become loop variables and the recursive call becomes reassignment.

```python
def gcd(a, b):          # tail-recursive
    if b == 0:
        return a
    return gcd(b, a % b)

def gcd_iter(a, b):     # same thing as a loop
    while b != 0:
        a, b = b, a % b
    return a
```

A non-tail function can often be turned into a tail-recursive one by carrying the partial result in an **accumulator**:

```python
def factorial(n, acc=1):
    if n == 0:
        return acc
    return factorial(n - 1, acc * n)   # nothing left to do after this call
```

Python still keeps every frame (it has no tail-call elimination), so the win in Python is that the loop version becomes obvious, not that the recursion becomes safe.

### Everything else: simulate the call stack

When there is work to do *after* a recursive call, use an explicit stack that stores what each frame would have remembered.

**Preorder** is easy because the work happens before the children are visited:

```python
def preorder(root):
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right:
            stack.append(node.right)   # push right first so left is popped first
        if node.left:
            stack.append(node.left)
    return out
```

**Inorder** has to remember "come back to this node after its left subtree":

```python
def inorder(root):
    out, stack, node = [], [], root
    while stack or node:
        while node:                 # walk as far left as possible
            stack.append(node)
            node = node.left
        node = stack.pop()          # the leftmost node not yet visited
        out.append(node.val)
        node = node.right
    return out
```

**Postorder** (or any "combine the children" problem) is simplest with a visited flag. It is a direct simulation of "first call, then return":

```python
def postorder(root):
    out, stack = [], [(root, False)]
    while stack:
        node, children_done = stack.pop()
        if node is None:
            continue
        if children_done:
            out.append(node.val)             # the "after the calls" work
        else:
            stack.append((node, True))       # come back after the children
            stack.append((node.right, False))
            stack.append((node.left, False))
    return out
```

The visited-flag pattern works for any recursive function: push a frame to visit later, then push its children. It is the most general conversion technique.

### Iterative DFS is not always identical to recursive DFS

Two subtle differences when converting graph DFS:

- **Visit order.** A stack pops the *last* neighbor pushed first. Push neighbors in reverse if you need the recursive order.
- **When to mark visited.** Marking on *push* avoids duplicate stack entries, but it does not reproduce recursive DFS order exactly. Marking on *pop*, together with pushing neighbors in reverse, matches recursive DFS, at the cost of possibly pushing a node more than once.

For "reach everything" problems (connected components, flood fill) neither difference matters.

---

## Common mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Base case missing or unreachable, such as stepping `n - 2` from an odd `n` toward `0` | `RecursionError` / stack overflow | Check that *every* input reaches a base case: use `n <= 0`, or add a second base case |
| Slicing on every call (`f(lst[1:])`) | $O(n^2)$ time and memory from copies | Pass an index instead |
| Ignoring the call stack in space analysis | Claiming $O(1)$ space for recursive traversal | State $O(h)$ or $O(\text{depth})$ explicitly |
| Branching recursion with overlapping subproblems | Exponential time, such as naive Fibonacci | Memoize, or go bottom-up |
| Mutable default argument as a memo or path (`def f(x, seen=set())`) | State leaks between separate top-level calls | Default to `None` and create the set inside |
| Forgetting to undo a choice in backtracking | Duplicated or corrupted results | Pair every `append` with a `pop` after the recursive call |
| Raising `sys.setrecursionlimit` very high in Python | Interpreter segfaults when the C stack runs out | Convert to iteration instead |

---

## Interview checklist

1. **Start recursive** for trees and backtracking. It is quicker to write and easier to reason about.
2. **State the maximum depth** in terms of $n$ or $h$. If it can reach about $10^4$ in Python, mention stack overflow and offer an iterative version.
3. **For DP**, write top-down (recursion + memo) first to get the recurrence right, then convert to bottom-up if space matters.
4. **Always count the call stack** in space complexity.
5. **Know the conversions:** tail recursion to a loop, and anything else to an explicit stack.
