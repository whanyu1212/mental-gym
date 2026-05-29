---
title: Asymptotic Analysis
description: How algorithm complexity is measured and reasoned about — Big O, Omega, Theta, recurrences, the Master Theorem, and space analysis.
category: Complexity
---

# Asymptotic Analysis

## What is Asymptotic Analysis?

Asymptotic analysis describes how an algorithm's resource usage (time or space) scales as the input size $n$ grows toward infinity. The key insight is that we care about the **shape** of the growth curve, not the exact number of operations on any particular machine.

**Why "asymptotic"?** The word comes from the Greek *asymptotos* — not falling together. In mathematics, an asymptote is a line a curve approaches but never reaches. We are asking: as $n \to \infty$, what curve does the runtime *approach*?

This framing lets us ignore hardware, language, and constant factors — all of which shift the curve up or down but don't change its fundamental shape.

## The Formal Notations

### Big O — Upper Bound

"The algorithm does *at most* this much work."

$$f(n) = O(g(n)) \iff \exists\; c > 0,\; n_0 \in \mathbb{N} \;:\; f(n) \leq c \cdot g(n) \quad \forall\; n \geq n_0$$

In plain terms: beyond some threshold $n_0$, $f$ never exceeds $g$ by more than a constant factor $c$. Big O is the notation you'll use in almost every interview and analysis.

**Example:** Linear search is $O(n)$ because in the worst case you inspect every element.

### Big Omega — Lower Bound

"The algorithm does *at least* this much work."

$$f(n) = \Omega(g(n)) \iff \exists\; c > 0,\; n_0 \in \mathbb{N} \;:\; f(n) \geq c \cdot g(n) \quad \forall\; n \geq n_0$$

This is used to prove that no algorithm can solve a problem faster than a certain rate. The classic result: any comparison-based sorting algorithm is $\Omega(n \log n)$ because you need at least $\log_2(n!)$ comparisons to distinguish all $n!$ possible orderings.

### Big Theta — Tight Bound

"The algorithm is *exactly* this order of growth, up to constants."

$$f(n) = \Theta(g(n)) \iff \exists\; c_1, c_2 > 0,\; n_0 \;:\; c_1 \cdot g(n) \leq f(n) \leq c_2 \cdot g(n) \quad \forall\; n \geq n_0$$

$\Theta$ means $O$ and $\Omega$ simultaneously — the function is sandwiched. Merge sort is $\Theta(n \log n)$: it is always exactly that, best and worst case alike.

### Little-o and Little-omega

Less common but useful for precise comparisons:

$$f(n) = o(g(n)) \iff \lim_{n \to \infty} \frac{f(n)}{g(n)} = 0$$

$$f(n) = \omega(g(n)) \iff \lim_{n \to \infty} \frac{f(n)}{g(n)} = \infty$$

Big O says $f$ grows *at most as fast* as $g$. Little-o says $f$ grows *strictly slower* than $g$ — the ratio goes to zero. For example, $n = o(n^2)$ but $n \neq o(n)$.

### Intuitive Summary

| Notation | Meaning | Analogy |
|----------|---------|---------|
| $f = O(g)$ | $f$ grows at most as fast as $g$ | $f \leq g$ (up to constant) |
| $f = \Omega(g)$ | $f$ grows at least as fast as $g$ | $f \geq g$ (up to constant) |
| $f = \Theta(g)$ | $f$ grows at the same rate as $g$ | $f = g$ (up to constants) |
| $f = o(g)$ | $f$ grows strictly slower than $g$ | $f < g$ (asymptotically) |
| $f = \omega(g)$ | $f$ grows strictly faster than $g$ | $f > g$ (asymptotically) |

## Rules for Calculating Big O

### 1. Drop Constants

$$O(2n) \to O(n) \qquad O(500) \to O(1) \qquad O\!\left(\frac{n}{2}\right) \to O(n)$$

A constant factor shifts the curve vertically but doesn't change its shape.

### 2. Drop Lower-Order Terms

$$O(n^2 + n) \to O(n^2) \qquad O(n + \log n) \to O(n) \qquad O(n^3 + n^2 + n) \to O(n^3)$$

At large $n$, the dominant term overwhelms everything else. At $n = 10^6$, the $n^2$ term is $10^{12}$ while the $n$ term is only $10^6$ — a factor of a million smaller.

### 3. Different Variables Stay Separate

$$O(n + m) \text{ stays } O(n + m) \qquad O(n \cdot m) \text{ stays } O(n \cdot m)$$

You can only simplify if you know the relationship between the variables. If $m = O(n)$ then $O(n + m) = O(n)$, but if $m$ is independent you must keep both.

### 4. Nested Loops Multiply

```python
for i in range(n):      # O(n)
    for j in range(n):  # O(n)
        print(i, j)     # O(1)
# Total: O(n²)
```

Each iteration of the outer loop triggers a full pass of the inner loop. Be careful though — not all nested loops are $O(n^2)$:

```python
for i in range(n):          # O(n)
    for j in range(i):      # O(i), not O(n)
        print(i, j)
# Total: 0 + 1 + 2 + ... + (n-1) = n(n-1)/2 = O(n²)
```

```python
for i in range(n):          # O(n)
    j = i
    while j > 0:
        j = j // 2          # halving: O(log i)
# Total: O(n log n)
```

### 5. Sequential Steps Add, Then Simplify

```python
for i in range(n):    # O(n)
    print(i)
for j in range(n):    # O(n)
    print(j * j)
# Total: O(n) + O(n) = O(2n) = O(n)
```

After adding, drop constants and lower-order terms as usual.

### 6. Conditionals: Take the Worst Branch

```python
if len(arr) < 100:
    bubble_sort(arr)    # O(n²)
else:
    merge_sort(arr)     # O(n log n)
# Worst case: O(n²)
```

For Big O we always assume the worst-case branch will be taken.

## Common Complexity Classes

| Notation | Name | Typical source | Example |
|----------|------|----------------|---------|
| $O(1)$ | Constant | Direct access | Array index, hash lookup |
| $O(\log n)$ | Logarithmic | Halving the search space | Binary search, balanced BST ops |
| $O(\sqrt{n})$ | Square root | Factorisation trials | Trial division primality test |
| $O(n)$ | Linear | Single pass | Linear search, array sum |
| $O(n \log n)$ | Linearithmic | Divide and sort | Merge sort, heap sort, FFT |
| $O(n^2)$ | Quadratic | Double nested loops | Bubble sort, naive string match |
| $O(n^3)$ | Cubic | Triple nested loops | Naive matrix multiply, Floyd-Warshall |
| $O(2^n)$ | Exponential | All subsets | Power set, recursive Fibonacci |
| $O(n!)$ | Factorial | All permutations | Brute-force TSP, permutation generation |

### Growth Rate Comparison

For $n = 1000$:

| Complexity | Operations | Feasible? |
|------------|------------|-----------|
| $O(1)$ | 1 | ✅ Instant |
| $O(\log n)$ | ~10 | ✅ Instant |
| $O(\sqrt{n})$ | ~32 | ✅ Instant |
| $O(n)$ | 1,000 | ✅ Instant |
| $O(n \log n)$ | ~10,000 | ✅ Fast |
| $O(n^2)$ | 1,000,000 | ✅ ~1 second |
| $O(n^3)$ | $10^9$ | ⚠️ ~15 minutes |
| $O(2^n)$ | $2^{1000}$ | ❌ Heat death of universe |
| $O(n!)$ | $1000!$ | ❌ Incomprehensible |

**Interview constraint heuristic:** Given a time limit of ~$10^8$ operations per second:

| $n$ | Max viable complexity |
|-----|-----------------------|
| $n \leq 20$ | $O(2^n)$ or $O(n!)$ |
| $n \leq 500$ | $O(n^3)$ |
| $n \leq 5{,}000$ | $O(n^2)$ |
| $n \leq 10^6$ | $O(n \log n)$ |
| $n \leq 10^8$ | $O(n)$ |
| $n > 10^8$ | $O(\log n)$ or $O(1)$ |

## Analysing Recursive Algorithms

Recursion requires more care. You write a **recurrence relation** and then solve it.

### Setting Up a Recurrence

For a recursive function, identify:
1. The cost of work done at the current level (non-recursive part)
2. How many recursive calls are made
3. What size each subproblem is

**Example — binary search:**

```python
def binary_search(arr, target, lo, hi):
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search(arr, target, mid + 1, hi)
    else:
        return binary_search(arr, target, lo, mid - 1)
```

One recursive call on a problem of size $n/2$, constant work at each level:

$$T(n) = T\!\left(\frac{n}{2}\right) + O(1)$$

Solving by repeated substitution:

$$T(n) = T\!\left(\frac{n}{4}\right) + O(1) + O(1) = \cdots = O(1) \cdot \log_2 n = O(\log n)$$

**Example — merge sort:**

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])    # T(n/2)
    right = merge_sort(arr[mid:])   # T(n/2)
    return merge(left, right)       # O(n)
```

Two recursive calls on $n/2$, linear merge step:

$$T(n) = 2T\!\left(\frac{n}{2}\right) + O(n)$$

### The Master Theorem

The Master Theorem solves recurrences of the form:

$$T(n) = aT\!\left(\frac{n}{b}\right) + f(n)$$

where $a \geq 1$ (number of subproblems), $b > 1$ (factor by which input shrinks), and $f(n)$ is the cost of work outside the recursive calls.

Define the **critical exponent** $c^* = \log_b a$.

| Case | Condition | Solution |
|------|-----------|----------|
| **Case 1** | $f(n) = O(n^{c^* - \varepsilon})$ for some $\varepsilon > 0$ | $T(n) = \Theta(n^{c^*})$ |
| **Case 2** | $f(n) = \Theta(n^{c^*} \log^k n)$ | $T(n) = \Theta(n^{c^*} \log^{k+1} n)$ |
| **Case 3** | $f(n) = \Omega(n^{c^* + \varepsilon})$ for some $\varepsilon > 0$ | $T(n) = \Theta(f(n))$ |

**Intuition:** Compare the cost of the recursive work ($n^{c^*}$) to the cost of the non-recursive work ($f(n)$). Whichever dominates determines the total cost. If they're equal (Case 2), you pick up an extra $\log$ factor.

**Applying it to merge sort:** $a = 2$, $b = 2$, $f(n) = n$.

$$c^* = \log_2 2 = 1 \quad \Rightarrow \quad n^{c^*} = n$$

$f(n) = n = \Theta(n^1 \log^0 n)$ — this is Case 2 with $k = 0$.

$$T(n) = \Theta(n \log n) \checkmark$$

**More examples:**

| Recurrence | $a$ | $b$ | $c^*$ | $f(n)$ | Case | Result |
|---|---|---|---|---|---|---|
| $T(n) = 2T(n/2) + n$ | 2 | 2 | 1 | $n$ | 2 | $\Theta(n \log n)$ |
| $T(n) = 4T(n/2) + n$ | 4 | 2 | 2 | $n$ | 1 | $\Theta(n^2)$ |
| $T(n) = T(n/2) + n$ | 1 | 2 | 0 | $n$ | 3 | $\Theta(n)$ |
| $T(n) = 9T(n/3) + n^2$ | 9 | 3 | 2 | $n^2$ | 2 | $\Theta(n^2 \log n)$ |
| $T(n) = 2T(n/2) + n^2$ | 2 | 2 | 1 | $n^2$ | 3 | $\Theta(n^2)$ |

> The Master Theorem does **not** apply when subproblems have unequal sizes (e.g., $T(n) = T(n/3) + T(2n/3) + n$) — use the recursion tree method instead.

## Space Complexity

Space complexity measures auxiliary memory — how much extra memory the algorithm allocates beyond the input itself.

### Sources of Space Usage

| Source | Notes |
|--------|-------|
| Variables and primitives | $O(1)$ each |
| Arrays / hash maps | $O(n)$ where $n$ is the number of elements |
| Call stack (recursion) | $O(\text{depth})$ — one frame per recursive call |
| Output / return values | Sometimes counted, sometimes excluded — clarify in interviews |

### Examples

```python
def sum_array(arr):           # O(1) space — no extra allocation
    total = 0
    for x in arr:
        total += x
    return total

def copy_array(arr):          # O(n) space — allocates a new array
    return arr[:]

def merge_sort(arr):          # O(n) space — temp arrays during merge
    ...                       # O(log n) call stack depth

def fib(n):                   # O(n) time, O(n) space (call stack)
    if n <= 1: return n
    return fib(n-1) + fib(n-2)

def fib_iterative(n):         # O(n) time, O(1) space
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

### Tail Recursion

A tail-recursive function makes its recursive call as the very last operation. Some languages (not Python, but Julia and most functional languages) optimise this into a loop, reducing stack space from $O(n)$ to $O(1)$.

```python
# Not tail-recursive: must return to multiply after recursive call
def factorial(n):
    if n == 0: return 1
    return n * factorial(n - 1)   # multiplication happens *after*

# Tail-recursive (accumulator pattern)
def factorial_tail(n, acc=1):
    if n == 0: return acc
    return factorial_tail(n - 1, acc * n)   # no pending work
```

## Amortized Analysis

Amortized analysis assigns a cost to each operation such that the *average* cost per operation over a sequence is bounded, even if individual operations are occasionally expensive.

### Aggregate Method

Sum the total cost of $n$ operations, then divide by $n$.

**Python list append:** A resize doubles capacity. Starting with capacity 1, resizes happen at sizes 1, 2, 4, 8, …, $n$. Total copy work: $1 + 2 + 4 + \cdots + n \leq 2n$. Over $n$ appends, average cost is $2n / n = O(1)$ per append — **amortized $O(1)$**.

### Accounting Method

Assign each operation a "charge". Cheap operations are overcharged; the surplus credit pays for expensive operations later.

**Stack with multi-pop:** Each element is pushed once (charge 2: 1 for the push, 1 saved as credit) and popped at most once (paid for by its credit). Any sequence of $n$ push/pop/multi-pop operations costs $O(n)$ total — amortized $O(1)$ each.

### Potential Method

Define a potential function $\Phi$ over the data structure's state. Amortized cost = actual cost + $\Delta\Phi$.

This is the most general method, used to analyse splay trees, Fibonacci heaps, and similar structures. Beyond typical interview scope but worth knowing exists.

## Python Built-in Complexities

Knowing these prevents hidden $O(n)$ surprises inside what looks like $O(1)$ code.

### List

| Operation | Average | Worst | Notes |
|-----------|---------|-------|-------|
| `arr[i]` | $O(1)$ | $O(1)$ | |
| `arr.append(x)` | $O(1)$† | $O(n)$ | †amortized |
| `arr.pop()` | $O(1)$ | $O(1)$ | from end |
| `arr.pop(0)` | $O(n)$ | $O(n)$ | shifts everything |
| `arr.insert(i, x)` | $O(n)$ | $O(n)$ | shifts suffix |
| `x in arr` | $O(n)$ | $O(n)$ | linear scan |
| `arr.sort()` | $O(n \log n)$ | $O(n \log n)$ | Timsort |
| `arr[a:b]` | $O(b-a)$ | $O(n)$ | copies the slice |
| `arr + arr2` | $O(n+m)$ | $O(n+m)$ | |

### Dict / Set

| Operation | Average | Worst | Notes |
|-----------|---------|-------|-------|
| `d[k]`, `d[k] = v` | $O(1)$ | $O(n)$ | worst = all keys hash-collide |
| `k in d` | $O(1)$ | $O(n)$ | |
| `del d[k]` | $O(1)$ | $O(n)$ | |
| Iteration | $O(n)$ | $O(n)$ | |

### String

| Operation | Cost | Notes |
|-----------|------|-------|
| `s[i]` | $O(1)$ | |
| `s + t` | $O(n+m)$ | creates a new string |
| `sub in s` | $O(n \cdot m)$ | naive; Python uses optimised algo |
| `s.split()` | $O(n)$ | |
| `"".join(parts)` | $O(n)$ | prefer over `+=` in a loop |

> **String concatenation trap:** `s += part` inside a loop is $O(n^2)$ total because each `+=` creates a new string. Always collect parts in a list and call `"".join()` at the end.

## Worked Examples

### Example 1 — Constant inner loop

```python
def example(arr):
    for i in range(len(arr)):       # O(n)
        for j in range(100):        # O(1) — fixed, not n
            print(arr[i], j)
```

**Time:** $O(n)$ — the inner loop is constant regardless of input size.

---

### Example 2 — Triangular sum

```python
def example(arr):
    for i in range(len(arr)):
        for j in range(i):          # runs 0, 1, 2, ..., n-1 times
            print(arr[j])
```

**Time:** $\displaystyle\sum_{i=0}^{n-1} i = \frac{n(n-1)}{2} = O(n^2)$

---

### Example 3 — Logarithmic while loop

```python
def example(n):
    i = n
    while i > 0:
        i = i // 2
```

**Time:** $O(\log n)$ — $i$ halves each iteration, so the loop runs $\lfloor \log_2 n \rfloor + 1$ times.

---

### Example 4 — Two independent passes

```python
def example(arr):
    for x in arr:           # O(n)
        print(x)
    arr.sort()              # O(n log n)
    for x in arr:           # O(n)
        print(x)
```

**Time:** $O(n) + O(n \log n) + O(n) = O(n \log n)$ — dominated by the sort.

---

### Example 5 — Binary search + linear work

```python
def example(arr, target):
    # Binary search: O(log n)
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            # Then scan outward linearly: O(n)
            left = mid
            while left > 0 and arr[left - 1] == target:
                left -= 1
            return left
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```

**Time:** $O(\log n)$ to find the element, then up to $O(n)$ to scan — **total $O(n)$**. The logarithmic search is swallowed by the linear scan.

---

### Example 6 — Recursive tree (two branches)

```python
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
```

Each call makes two more at sizes $n-1$ and $n-2$. The call tree has depth $n$ and at each level the number of nodes roughly doubles — $O(2^n)$ calls total. Space is $O(n)$ (maximum call stack depth).

Recurrence: $T(n) = T(n-1) + T(n-2) + O(1)$, which solves to $\Theta(\phi^n)$ where $\phi = \frac{1+\sqrt{5}}{2} \approx 1.618$ (the golden ratio). We bound this as $O(2^n)$.

---

### Example 7 — Memoised recursion

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
```

Each unique $n$ is computed exactly once and cached. There are $n$ unique subproblems, each $O(1)$ to compute given its children — **$O(n)$ time, $O(n)$ space**.

---

### Example 8 — Nested recursion

```python
def f(n, m):
    if n == 0 or m == 0:
        return 1
    return f(n - 1, m) + f(n, m - 1)
```

This computes a value on a 2D grid of size $n \times m$. Without memoisation: $O\!\binom{n+m}{n}$ — exponential. With memoisation: $O(n \cdot m)$ time and space, since there are $n \times m$ unique subproblems.

## Common Mistakes

1. **Treating $O(1)$ as "fast"** — it means *constant*, not *small*. A hash table with a terrible hash function might do $O(1)$ work per lookup but that "constant" could be enormous.

2. **Missing hidden $O(n)$ operations** — `x in list` is $O(n)$; `list.copy()` is $O(n)$; string concatenation in a loop is $O(n^2)$. Always check the cost of standard library calls.

3. **Forgetting call stack space** — a recursive function with depth $d$ uses $O(d)$ stack space, regardless of what else it allocates. A depth-$n$ recursion on large $n$ can cause a stack overflow.

4. **Assuming hash operations are always $O(1)$** — average case yes, but worst case (all keys collide to the same bucket) is $O(n)$. Python's hash function is good, but adversarial inputs can degrade performance. Use `O(1)` average in analysis, but know the caveat.

5. **Applying rules across different variables** — $O(n + m)$ cannot be simplified to $O(n)$ unless you know $m = O(n)$. Graphs, matrices, and multi-input problems frequently have two independent size parameters.

6. **Ignoring the base case in recursion** — the base case must actually terminate and take $O(1)$ time, or the recurrence is wrong. A base case that itself does $O(n)$ work changes everything.

7. **Over-applying the Master Theorem** — it only applies to recurrences of the form $T(n) = aT(n/b) + f(n)$ with equal-size subproblems and exact division. It does not apply to $T(n) = T(n-1) + O(1)$ (use substitution) or $T(n) = T(n/3) + T(2n/3) + n$ (use recursion tree).

## Review Questions

These range from recall to application to deeper reasoning. Try to answer before revealing.

---

**Q1.** What is the difference between $O(n)$ and $\Theta(n)$? Give an algorithm that is $O(n)$ but not $\Theta(n)$.

> **Answer.** $O(n)$ is an upper bound — the algorithm runs in *at most* linear time. $\Theta(n)$ is a tight bound — it runs in *exactly* linear time (both upper and lower bounds are $n$). Linear search is $O(n)$ but not $\Theta(n)$: in the best case (target is first element) it terminates in $O(1)$, so the lower bound is $\Omega(1)$, not $\Omega(n)$.

---

**Q2.** What is the time and space complexity of this function?

```python
def mystery(n):
    if n <= 0:
        return 0
    return n + mystery(n - 1)
```

> **Answer.** Time: $O(n)$ — one call per integer from $n$ down to $0$. Space: $O(n)$ — the call stack holds $n$ frames simultaneously. This computes $\frac{n(n+1)}{2}$ but via recursion rather than the closed form, so it wastes space.

---

**Q3.** Rank these from fastest to slowest growth: $n \log n$, $2^n$, $n^{0.5}$, $n!$, $n^2$, $\log n$.

> **Answer.** $\log n < n^{0.5} < n \log n < n^2 < 2^n < n!$

---

**Q4.** What does the Master Theorem give for $T(n) = 3T(n/3) + n$?

> **Answer.** $a = 3$, $b = 3$, so $c^* = \log_3 3 = 1$. $f(n) = n = \Theta(n^1)$ — Case 2 with $k = 0$. Therefore $T(n) = \Theta(n \log n)$.

---

**Q5.** Why is `"".join(parts)` preferred over `result += part` in a Python loop?

> **Answer.** Strings in Python are immutable. Each `+=` allocates a brand new string of length equal to the combined length, then copies both. Over $n$ iterations concatenating strings of total length $L$, this costs $O(L^2)$ in the worst case. `"".join(parts)` computes the final length first, allocates once, and copies each part exactly once — $O(L)$ total.

---

**Q6.** A function processes an $n \times n$ matrix with a triple nested loop where each loop runs from $0$ to $n$. What is its time complexity? What if the innermost loop runs from $0$ to a constant $k$?

> **Answer.** Three loops each $0$ to $n$: $O(n^3)$. If the innermost runs to constant $k$: $O(k \cdot n^2) = O(n^2)$ — the constant is dropped.

---

**Q7.** Is it possible for an $O(n^2)$ algorithm to be faster in practice than an $O(n \log n)$ algorithm? Explain.

> **Answer.** Yes — for small $n$. Big O describes asymptotic behaviour; it hides constant factors. An $O(n^2)$ algorithm with a very small constant (like insertion sort) can beat an $O(n \log n)$ algorithm with high overhead (like merge sort) when $n$ is small. This is why Timsort switches to insertion sort for runs shorter than ~64 elements.

---

**Q8.** What is the amortized cost of a single `append` to a Python list, and how do you derive it?

> **Answer.** Amortized $O(1)$. Starting with capacity 1, the list doubles when full. Resize events happen at sizes $1, 2, 4, \ldots, n$, copying $1 + 2 + 4 + \cdots + n \leq 2n$ elements total. Over $n$ appends, the total work is $O(n) + 2n \cdot O(1) = O(n)$, so the average (amortized) cost per append is $O(n)/n = O(1)$.

---

**Q9.** Solve the recurrence $T(n) = T(n - 1) + n$ with $T(0) = 0$.

> **Answer.** Expanding: $T(n) = n + (n-1) + (n-2) + \cdots + 1 = \frac{n(n+1)}{2} = \Theta(n^2)$. This is the cost of bubble sort — on each pass you do $O(n)$ work, and you make $n$ passes.

---

**Q10.** You have an algorithm that uses $O(\log n)$ space. Can it have $O(n)$ time complexity? Give an example.

> **Answer.** Yes. Binary search uses $O(\log n)$ stack space (recursive version) or $O(1)$ space (iterative), yet makes $O(\log n)$ comparisons — $O(\log n)$ time. But consider an algorithm that does a linear scan while maintaining a recursion stack of depth $\log n$: $O(n)$ time, $O(\log n)$ space. Time and space complexity are independent — one does not determine the other.
