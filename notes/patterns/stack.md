---
title: Stack
slug: stack
description: A problem-first guide to stack patterns, from matching and expression evaluation to auxiliary state and monotonic stacks.
category: Patterns
order: 5
status: stable
tags:
  - dsa
  - stack
  - monotonic-stack
---

# Stack

A stack is the right tool when **the most recent unresolved thing is the only one that can be resolved next**. Every stack solution rests on that sentence. If you can name the "unresolved thing" and explain why only the newest one matters, the code almost writes itself.

The operations are trivial: `append` to push, `pop` to remove the top, `[-1]` to peek, all $O(1)$ on a Python list. The skill is recognising when last-in-first-out order is forced by the problem.

This note is a study path. Work one family at a time: learn its recognition signal, state what the stack holds, then solve the anchor problem.

---

## How To Use This Note

For each family:

1. Read the recognition signal before seeing the code.
2. Say what one stack entry represents, not just "the stack".
3. State the invariant the stack keeps after every step.
4. Trace the example by hand, writing the stack after each token.
5. Solve the anchor problem from scratch.

If you get stuck, ask: "what is still waiting to be resolved, and why must the newest one go first?"

---

## Pattern Map

| If the problem says... | Reach for... | What one entry holds | Start with |
|---|---|---|---|
| Brackets, tags, or undo that must close in reverse order | Matching | An opener still waiting for its closer | Valid Parentheses (LeetCode 20) |
| Evaluate postfix, or operands wait for an operator | Operand stack | A fully evaluated sub-expression | [Evaluate Reverse Polish Notation](../../algorithms/150-evaluate-reverse-polish-notation) |
| Support `getMin` / `getMax` in $O(1)$ alongside push and pop | Auxiliary state stack | The answer for the stack as it stood at that depth | [Min Stack](../../algorithms/155-min-stack) |
| Next greater / smaller element, or "how far until" | Monotonic stack | An index still waiting for its answer | Daily Temperatures (LeetCode 739) |
| Max or min of every fixed window | Monotonic deque | A candidate that could still be a window's max | [Sliding Window Maximum](../../algorithms/239-sliding-window-maximum) |
| Build every valid sequence one choice at a time | Stack as a backtracking path | One choice on the current path | [Generate Parentheses](../../algorithms/22-generate-parentheses) |

Problems 20 and 739 are not in this repo yet; they are the standard first problems for their families.

### Suggested Study Route

| Step | Problem | New idea to own |
|---|---|---|
| 1 | Valid Parentheses (20) | A closer must match the newest opener |
| 2 | [Evaluate Reverse Polish Notation](../../algorithms/150-evaluate-reverse-polish-notation) | An operator consumes the two newest results |
| 3 | [Min Stack](../../algorithms/155-min-stack) | Store the answer alongside each entry so pop restores it |
| 4 | Daily Temperatures (739) | Pop everything the new value resolves |
| 5 | [Sliding Window Maximum](../../algorithms/239-sliding-window-maximum) | Add expiry from the front: stack becomes deque |
| 6 | [Generate Parentheses](../../algorithms/22-generate-parentheses) | The call stack and an explicit path stack move together |

---

## The Question Behind Every Push And Pop

Before every `append` or `pop`, answer:

1. **What does one entry mean?** "An unmatched `(`", "an evaluated operand", "an index with no greater element yet".
2. **Why is the top the only entry that can be resolved now?** This is what makes a stack correct rather than a queue or a set.
3. **What does the stack guarantee after this step?** Sorted order, matched prefixes, or an up-to-date running minimum.

If the answer to question 2 is "any entry could be resolved", you probably need a hash map or a heap, not a stack.

---

## 1. Matching

### Recognize It

- "every opener must be closed by the same type, in the correct order"
- nested structure: brackets, HTML tags, function calls, undo history

### The Invariant

```text
The stack holds exactly the openers seen so far that are not yet closed,
oldest at the bottom, newest on top.
```

A closer can only legally close the **newest** unclosed opener. Closing an older one would leave a newer opener crossing it, like `( [ ) ]`.

```python
def is_valid(s: str) -> bool:
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []

    for char in s:
        if char in pairs:
            if not stack or stack.pop() != pairs[char]:
                return False
        else:
            stack.append(char)

    return not stack
```

**Two separate failure modes:** a closer with nothing (or the wrong thing) on top fails immediately; openers still on the stack at the end fail at the final `return not stack`. Forgetting the second check accepts `"(("`.

### Check Yourself

- Why is a counter enough for one bracket type but not for three?
- What does the stack contain after reading `"({["`? After `"({[]"`?

---

## 2. Operand Stack: Evaluate Reverse Polish Notation

### Recognize It

Postfix notation puts operators **after** their operands: `3 4 +` means `3 + 4`. Operands wait until an operator arrives, and the operator always applies to the two most recent results.

### Anchor Problem

[Evaluate Reverse Polish Notation](../../algorithms/150-evaluate-reverse-polish-notation)

```text
tokens:  2   1   +   3   *
stack:  [2] [2,1] [3] [3,3] [9]
```

```python
def eval_rpn(tokens: list[str]) -> int:
    stack = []

    for token in tokens:
        if token in {"+", "-", "*", "/"}:
            right = stack.pop()
            left = stack.pop()
            if token == "+":
                stack.append(left + right)
            elif token == "-":
                stack.append(left - right)
            elif token == "*":
                stack.append(left * right)
            else:
                stack.append(int(left / right))
        else:
            stack.append(int(token))

    return stack.pop()
```

### The Two Traps

- **Operand order.** The first `pop` is the **right** operand. `["3", "4", "-"]` is `3 - 4 = -1`, not `1`.
- **Division truncates toward zero.** Python's `//` floors, so `-7 // 2` is `-4`, but the problem wants `-3`. `int(left / right)` truncates toward zero.

### Check Yourself

- What does each stack entry represent after an operator is applied?
- Why can a valid postfix expression never need to look below the top two entries?

---

## 3. Auxiliary State Stack: Min Stack

### Recognize It

The problem wants a normal stack **plus** an aggregate (minimum, maximum) available in $O(1)$ after any push or pop.

### Anchor Problem

[Min Stack](../../algorithms/155-min-stack)

The minimum cannot be recomputed after a pop without scanning. The fix is to store, **for every depth**, the minimum of the stack at that depth. Popping then restores the previous minimum for free.

```python
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        current_min = min(val, self.min_stack[-1]) if self.min_stack else val
        self.min_stack.append(current_min)

    def pop(self) -> None:
        self.stack.pop()
        self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]
```

### The Invariant

```text
len(min_stack) == len(stack), and min_stack[i] == min(stack[:i + 1]).
```

A stack only ever removes its newest entry, so the minimum of what remains is exactly the minimum recorded one level down.

### Check Yourself

- Push `2, 1, 1`, then pop once. Why must the minimum still be `1`?
- Why would a single `current_min` variable fail after a pop?

---

## 4. Monotonic Stack: Next Greater Element

### Recognize It

- "next greater", "next smaller", "previous greater"
- "how many days until a warmer temperature"
- "the nearest bar that is taller"

### The Invariant

```text
The stack holds indices still waiting for their answer, and their values
never increase from bottom to top.
```

When a new value arrives, every waiting index with a **smaller** value has just found its next greater element. Those are exactly the entries on top, because the values never increase going up, so pop them all. Equal values stay: an equal value is not greater.

```python
def next_greater(nums: list[int]) -> list[int]:
    answer = [-1] * len(nums)
    stack = []  # indices waiting for a greater value

    for i, value in enumerate(nums):
        while stack and nums[stack[-1]] < value:
            answer[stack.pop()] = value
        stack.append(i)

    return answer
```

For Daily Temperatures, store the distance instead: `answer[j] = i - j`.

### Why It Is Linear

The inner `while` looks nested, but each index is pushed once and popped at most once. Total work is $O(n)$, not $O(n^2)$. This amortised argument is the whole point of the pattern.

### Choosing The Comparison

| Goal | Pop while | Stack values, bottom to top |
|---|---|---|
| Next greater | `nums[top] < value` | never increase (equal values stay) |
| Next greater or equal | `nums[top] <= value` | strictly decrease |
| Next smaller | `nums[top] > value` | never decrease (equal values stay) |

Getting `<` versus `<=` wrong is the most common bug. Decide what should happen to equal values **before** coding.

### Check Yourself

- For `[2, 1, 2, 4, 3]`, write the stack after each index.
- Why are the indices left on the stack at the end exactly the ones with no next greater element?

---

## 5. Monotonic Deque: Sliding Window Maximum

### Recognize It

The monotonic stack from section 4, plus a **window**: old entries expire from the other end. A stack can only remove from the top, so it becomes a deque.

### Anchor Problem

[Sliding Window Maximum](../../algorithms/239-sliding-window-maximum)

```python
from collections import deque


def max_sliding_window(nums: list[int], k: int) -> list[int]:
    candidates = deque()  # indices, values decreasing front to back
    result = []

    for i, value in enumerate(nums):
        # A smaller value behind a newer, larger one can never be a maximum.
        while candidates and nums[candidates[-1]] <= value:
            candidates.pop()
        candidates.append(i)

        # The front has left the window.
        if candidates[0] <= i - k:
            candidates.popleft()

        if i >= k - 1:
            result.append(nums[candidates[0]])

    return result
```

### The Invariant

```text
The deque holds, in index order, every window element that could still be
the maximum of some current or future window. Their values are decreasing,
so the front is the current maximum.
```

An element is dropped from the back when a newer, larger value arrives: it leaves the window no later than that value and is smaller, so it can never win. That is the same domination argument as section 4.

**This repo's solution uses a heap instead.** `src/leetcode/stack/max_sliding_window.py` pushes `(-value, index)` and lazily pops the top while it is outside the window. That is $O(n \log n)$ time; the deque above is $O(n)$ with $O(k)$ extra space. Knowing both, and why the deque can discard what the heap has to keep, is worth more than either alone.

### Check Yourself

- Why is the comparison `<=` here rather than `<`?
- Why can the front of the deque expire, but never an element in the middle?

---

## 6. Stack As A Backtracking Path: Generate Parentheses

### Recognize It

"Generate every valid ..." where each output is built one choice at a time, and the constraint depends only on the choices so far.

### Anchor Problem

[Generate Parentheses](../../algorithms/22-generate-parentheses)

Here the stack is the **current path**. Push a choice, recurse, then pop to undo it. The call stack and the path stack grow and shrink together.

```python
def generate_parenthesis(n: int) -> list[str]:
    path = []
    result = []

    def backtrack(opened: int, closed: int) -> None:
        if opened == closed == n:
            result.append("".join(path))
            return
        if opened < n:
            path.append("(")
            backtrack(opened + 1, closed)
            path.pop()
        if closed < opened:
            path.append(")")
            backtrack(opened, closed + 1)
            path.pop()

    backtrack(0, 0)
    return result
```

### The Invariant

```text
path is always a valid prefix: 0 <= closed <= opened <= n.
```

The two `if` guards enforce it, so the search never builds an invalid prefix and never needs to check a finished string.

### Check Yourself

- Why is `closed < opened` the only condition for adding `)`?
- How many strings are produced for `n = 3`? For `n = 4`? (They are Catalan numbers.)

---

## Grouped Under Stack, Solved Another Way

The site's Stack group also contains two problems that do not use a stack at all. Reach for the right tool instead:

| Problem | What it really is | Where to study it |
|---|---|---|
| [Merge Two Sorted Lists](../../algorithms/21-merge-two-sorted-lists) | Two-input traversal on linked lists | [Two Pointers](../two_pointers/), section 5 |
| [Permutation in String](../../algorithms/567-permutation-in-string) | Fixed-size sliding window with counts | [Sliding Window](../sliding_window/) |

---

## Debugging Checklist

| Symptom | Question to ask |
|---|---|
| Accepts `"(("` | Did I check that the stack is empty at the end? |
| Crash on `")"` | Do I check the stack is non-empty before `pop`? |
| RPN subtraction or division is wrong | Is the first `pop` the right operand? Am I truncating toward zero? |
| Min Stack wrong after pop | Does every push record its own minimum? |
| Monotonic stack is $O(n^2)$ | Is each index pushed exactly once and popped at most once? |
| Wrong answer with duplicates | Should equal values pop (`<=`) or stay (`<`)? |
| Deque returns an expired maximum | Do I evict the front when its index leaves the window? |

---

## Complexity Reference

| Family | Time | Extra space | Main reason |
|---|---|---|---|
| Matching | $O(n)$ | $O(n)$ | Each character is pushed and popped at most once |
| RPN evaluation | $O(n)$ | $O(n)$ | Each token is pushed once and popped at most once |
| Min Stack | $O(1)$ per operation | $O(n)$ | One extra entry stored per element |
| Monotonic stack | $O(n)$ | $O(n)$ | Amortised: one push and at most one pop per index |
| Monotonic deque | $O(n)$ | $O(k)$ | Same amortised argument; at most $k$ candidates |
| Generate Parentheses | $O\left(\frac{4^n}{\sqrt{n}}\right)$ | $O(n)$ path | Proportional to the Catalan number of outputs |

---

## Final Recall

Before coding any stack problem, answer:

1. What does one entry mean?
2. Why is the newest entry the only one that can be resolved next?
3. What order does the stack keep, and when do I pop to restore it?
4. What is left on the stack at the end, and what does it mean?
5. Could each element be pushed and popped more than once? If not, the solution is linear.
