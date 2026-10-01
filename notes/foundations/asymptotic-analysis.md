---
title: Asymptotic Analysis
slug: asymptotic-analysis
description: How algorithm complexity is measured and reasoned about — Big O, Omega, Theta, recurrences, the Master Theorem, and space analysis.
category: Complexity
order: 1
status: stable
tags:
  - complexity
  - asymptotic-analysis
  - big-o
---

# Asymptotic Analysis

## What is Asymptotic Analysis?

Asymptotic analysis describes how an algorithm's resource usage (time or space) scales as the input size $n$ grows toward infinity. The key insight is that we care about the **shape** of the growth curve, not the exact number of operations on any particular machine.

**Why "asymptotic"?** The word comes from the Greek *asymptotos* — not falling together. In mathematics, an asymptote is a line a curve approaches but never reaches. We are asking: as $n \to \infty$, what curve does the runtime *approach*?

This framing lets us ignore hardware, language, and constant factors — all of which shift the curve up or down but don't change its fundamental shape.

## The Formal Notations

### Big O — Upper Bound

"The algorithm does *at most* this much work."

$$
f(n) = O(g(n)) \iff \exists\; c > 0,\; n_0 \in \mathbb{N} \;:\; f(n) \leq c \cdot g(n) \quad \forall\; n \geq n_0
$$

In plain terms: beyond some threshold $n_0$, $f$ never exceeds $g$ by more than a constant factor $c$. Big O is the notation you'll use in almost every interview and analysis.

**Example:** Linear search is $O(n)$ because in the worst case you inspect every element.

### Big Omega — Lower Bound

"The algorithm does *at least* this much work."

$$
f(n) = \Omega(g(n)) \iff \exists\; c > 0,\; n_0 \in \mathbb{N} \;:\; f(n) \geq c \cdot g(n) \quad \forall\; n \geq n_0
$$

This is used to prove that no algorithm can solve a problem faster than a certain rate. The classic result: any comparison-based sorting algorithm is $\Omega(n \log n)$ because you need at least $\log_2(n!)$ comparisons to distinguish all $n!$ possible orderings.

### Big Theta — Tight Bound

"The algorithm is *exactly* this order of growth, up to constants."

$$
f(n) = \Theta(g(n)) \iff \exists\; c_1, c_2 > 0,\; n_0 \;:\; c_1 \cdot g(n) \leq f(n) \leq c_2 \cdot g(n) \quad \forall\; n \geq n_0
$$

$\Theta$ means $O$ and $\Omega$ simultaneously — the function is sandwiched. Merge sort is $\Theta(n \log n)$: it is always exactly that, best and worst case alike.

### Little-o and Little-omega

Less common but useful for precise comparisons:

$$
f(n) = o(g(n)) \iff \lim_{n \to \infty} \frac{f(n)}{g(n)} = 0
$$

$$
f(n) = \omega(g(n)) \iff \lim_{n \to \infty} \frac{f(n)}{g(n)} = \infty
$$

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

$$
O(2n) \to O(n) \qquad O(500) \to O(1) \qquad O\!\left(\frac{n}{2}\right) \to O(n)
$$

A constant factor shifts the curve vertically but doesn't change its shape.

### 2. Drop Lower-Order Terms

$$
O(n^2 + n) \to O(n^2) \qquad O(n + \log n) \to O(n) \qquad O(n^3 + n^2 + n) \to O(n^3)
$$

At large $n$, the dominant term overwhelms everything else. At $n = 10^6$, the $n^2$ term is $10^{12}$ while the $n$ term is only $10^6$ — a factor of a million smaller.

### 3. Different Variables Stay Separate

$$
O(n + m) \text{ stays } O(n + m) \qquad O(n \cdot m) \text{ stays } O(n \cdot m)
$$

You can only simplify if you know the relationship between the variables. If $m = O(n)$ then $O(n + m) = O(n)$, but if $m$ is independent you must keep both.

### 4. Nested Loops Multiply

```python
for i in range(n):      # O(n)
    for j in range(n):  # O(n)
        print(i, j)     # O(1)
# Total: O(n²)
```
```julia
for i in 1:n            # O(n)
    for j in 1:n        # O(n)
        println(i, " ", j)  # O(1)
    end
end
# Total: O(n²)
```
```ts
for (let i = 0; i < n; i++) {     // O(n)
  for (let j = 0; j < n; j++) {   // O(n)
    console.log(i, j);            // O(1)
  }
}
// Total: O(n²)
```
```rust
for i in 0..n {         // O(n)
    for j in 0..n {     // O(n)
        println!("{i} {j}");  // O(1)
    }
}
// Total: O(n²)
```

Each iteration of the outer loop triggers a full pass of the inner loop. Be careful though — not all nested loops are $O(n^2)$:

```python
for i in range(n):          # O(n)
    for j in range(i):      # O(i), not O(n)
        print(i, j)
# Total: 0 + 1 + 2 + ... + (n-1) = n(n-1)/2 = O(n²)
```
```julia
for i in 1:n                # O(n)
    for j in 1:i-1          # O(i), not O(n)
        println(i, " ", j)
    end
end
# Total: 0 + 1 + 2 + ... + (n-1) = n(n-1)/2 = O(n²)
```
```ts
for (let i = 0; i < n; i++) {     // O(n)
  for (let j = 0; j < i; j++) {   // O(i), not O(n)
    console.log(i, j);
  }
}
// Total: 0 + 1 + 2 + ... + (n-1) = n(n-1)/2 = O(n²)
```
```rust
for i in 0..n {             // O(n)
    for j in 0..i {         // O(i), not O(n)
        println!("{i} {j}");
    }
}
// Total: 0 + 1 + 2 + ... + (n-1) = n(n-1)/2 = O(n²)
```

#### Derivation

The inner loop runs $i$ times for each $i$, so the total is $\sum_{i=0}^{n-1} i$. Pair the first and last terms: $(0 + (n-1)) + (1 + (n-2)) + \cdots$. Each pair sums to $n-1$ and there are $n/2$ pairs, so the total is $\frac{n(n-1)}{2} = \frac{1}{2}n^2 - \frac{1}{2}n$. Drop the constant $\frac{1}{2}$ and the lower-order term to get $O(n^2)$.

```python
for i in range(n):          # O(n)
    j = i
    while j > 0:
        j = j // 2          # halving: O(log i)
# Total: O(n log n)
```
```julia
for i in 1:n                # O(n)
    j = i
    while j > 0
        j = j ÷ 2           # halving: O(log i)
    end
end
# Total: O(n log n)
```
```ts
for (let i = 0; i < n; i++) {     // O(n)
  let j = i;
  while (j > 0) {
    j = Math.floor(j / 2);        // halving: O(log i)
  }
}
// Total: O(n log n)
```
```rust
for i in 0..n {             // O(n)
    let mut j = i;
    while j > 0 {
        j /= 2;             // halving: O(log i)
    }
}
// Total: O(n log n)
```

#### Derivation

For a fixed $i \geq 1$, the while loop runs $\lfloor \log_2 i \rfloor + 1$ times (see Worked Example 3). For $i = 0$ it runs 0 times. Summing over the outer loop:

$$
\begin{aligned}
\sum_{i=1}^{n-1} \left(\lfloor \log_2 i \rfloor + 1\right)
  &\leq \sum_{i=1}^{n-1} \log_2 i + n \\
  &= \log_2\big((n-1)!\big) + n \\
  &\leq n \log_2 n + n = O(n \log n)
\end{aligned}
$$

The step $\log_2((n-1)!) \leq n\log_2 n$ holds because $(n-1)!$ is a product of fewer than $n$ factors, each less than $n$. For the lower bound, look only at the top half $i \geq n/2$. Each of those roughly $n/2$ terms is at least $\log_2(n/2)$, so the total is at least $\frac{n}{2}\log_2\frac{n}{2} = \Omega(n \log n)$. The bound is therefore tight: $\Theta(n \log n)$.

### 5. Sequential Steps Add, Then Simplify

```python
for i in range(n):    # O(n)
    print(i)
for j in range(n):    # O(n)
    print(j * j)
# Total: O(n) + O(n) = O(2n) = O(n)
```
```julia
for i in 1:n          # O(n)
    println(i)
end
for j in 1:n          # O(n)
    println(j * j)
end
# Total: O(n) + O(n) = O(2n) = O(n)
```
```ts
for (let i = 0; i < n; i++) {   // O(n)
  console.log(i);
}
for (let j = 0; j < n; j++) {   // O(n)
  console.log(j * j);
}
// Total: O(n) + O(n) = O(2n) = O(n)
```
```rust
for i in 0..n {       // O(n)
    println!("{i}");
}
for j in 0..n {       // O(n)
    println!("{}", j * j);
}
// Total: O(n) + O(n) = O(2n) = O(n)
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
```julia
if length(arr) < 100
    bubble_sort!(arr)   # O(n²)
else
    merge_sort(arr)     # O(n log n)
end
# Worst case: O(n²)
```
```ts
if (arr.length < 100) {
  bubbleSort(arr);      // O(n²)
} else {
  mergeSort(arr);       // O(n log n)
}
// Worst case: O(n²)
```
```rust
if arr.len() < 100 {
    bubble_sort(&mut arr);  // O(n²)
} else {
    merge_sort(&arr);       // O(n log n)
}
// Worst case: O(n²)
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
```julia
# Call with lo = 1, hi = length(arr) (Julia is 1-based).
function binary_search(arr, target, lo, hi)
    if lo > hi
        return nothing
    end
    mid = (lo + hi) ÷ 2
    if arr[mid] == target
        return mid
    elseif arr[mid] < target
        return binary_search(arr, target, mid + 1, hi)
    else
        return binary_search(arr, target, lo, mid - 1)
    end
end
```
```ts
function binarySearch(arr: number[], target: number, lo: number, hi: number): number {
  if (lo > hi) {
    return -1;
  }
  const mid = Math.floor((lo + hi) / 2);
  if (arr[mid] === target) {
    return mid;
  } else if (arr[mid] < target) {
    return binarySearch(arr, target, mid + 1, hi);
  } else {
    return binarySearch(arr, target, lo, mid - 1);
  }
}
```
```rust
// Searches arr[lo..hi] with hi exclusive (call with 0, arr.len()), so there
// is no `mid - 1` to underflow. Same recurrence: one call on half the range.
fn binary_search(arr: &[i32], target: i32, lo: usize, hi: usize) -> Option<usize> {
    if lo >= hi {
        return None;
    }
    let mid = lo + (hi - lo) / 2;
    if arr[mid] == target {
        Some(mid)
    } else if arr[mid] < target {
        binary_search(arr, target, mid + 1, hi)
    } else {
        binary_search(arr, target, lo, mid)
    }
}
```

One recursive call on a problem of size $n/2$, constant work at each level:

$$
T(n) = T\!\left(\frac{n}{2}\right) + O(1)
$$

Solving by repeated substitution. Write the constant work as $c$ and unroll:

$$
\begin{aligned}
T(n) &= T\!\left(\tfrac{n}{2}\right) + c \\
     &= T\!\left(\tfrac{n}{4}\right) + c + c \\
     &= T\!\left(\tfrac{n}{8}\right) + 3c \\
     &\;\;\vdots \\
     &= T\!\left(\tfrac{n}{2^k}\right) + kc
\end{aligned}
$$

The recursion bottoms out when the subproblem has size 1, which means $n / 2^k = 1$, or $k = \log_2 n$. Substituting:

$$
T(n) = T(1) + c\log_2 n = O(\log n)
$$

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
```julia
# merge_sorted, not merge: Base.merge already exists (for dictionaries)
function merge_sort(arr)
    if length(arr) <= 1
        return arr
    end
    mid = length(arr) ÷ 2
    left = merge_sort(arr[1:mid])       # T(n/2)
    right = merge_sort(arr[mid+1:end])  # T(n/2)
    return merge_sorted(left, right)    # O(n)
end
```
```ts
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) {
    return arr;
  }
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));  // T(n/2)
  const right = mergeSort(arr.slice(mid));    // T(n/2)
  return merge(left, right);                  // O(n)
}
```
```rust
fn merge_sort(arr: &[i32]) -> Vec<i32> {
    if arr.len() <= 1 {
        return arr.to_vec();
    }
    let mid = arr.len() / 2;
    let left = merge_sort(&arr[..mid]);   // T(n/2)
    let right = merge_sort(&arr[mid..]);  // T(n/2)
    merge(&left, &right)                  // O(n)
}
```

Two recursive calls on $n/2$, linear merge step:

$$
T(n) = 2T\!\left(\frac{n}{2}\right) + O(n)
$$

### The Master Theorem

The Master Theorem solves recurrences of the form:

$$
T(n) = aT\!\left(\frac{n}{b}\right) + f(n)
$$

where $a \geq 1$ (number of subproblems), $b > 1$ (factor by which input shrinks), and $f(n)$ is the cost of work outside the recursive calls.

Define the **critical exponent** $c^* = \log_b a$.

| Case | Condition | Solution |
|------|-----------|----------|
| **Case 1** | $f(n) = O(n^{c^* - \varepsilon})$ for some $\varepsilon > 0$ | $T(n) = \Theta(n^{c^*})$ |
| **Case 2** | $f(n) = \Theta(n^{c^*} \log^k n)$ | $T(n) = \Theta(n^{c^*} \log^{k+1} n)$ |
| **Case 3** | $f(n) = \Omega(n^{c^* + \varepsilon})$ for some $\varepsilon > 0$ | $T(n) = \Theta(f(n))$ |

**Intuition:** Compare the cost of the recursive work ($n^{c^*}$) to the cost of the non-recursive work ($f(n)$). Whichever dominates determines the total cost. If they're equal (Case 2), you pick up an extra $\log$ factor.

**Applying it to merge sort:** $a = 2$, $b = 2$, $f(n) = n$.

$$
c^* = \log_2 2 = 1 \quad \Rightarrow \quad n^{c^*} = n
$$

$f(n) = n = \Theta(n^1 \log^0 n)$ — this is Case 2 with $k = 0$.

$$
T(n) = \Theta(n \log n) \checkmark
$$

**More examples:**

| Recurrence | Case | Result |
|---|---|---|
| $T(n) = 2T(n/2) + n$ | 2 | $\Theta(n \log n)$ |
| $T(n) = 4T(n/2) + n$ | 1 | $\Theta(n^2)$ |
| $T(n) = T(n/2) + n$ | 3 | $\Theta(n)$ |
| $T(n) = 9T(n/3) + n^2$ | 2 | $\Theta(n^2 \log n)$ |
| $T(n) = 2T(n/2) + n^2$ | 3 | $\Theta(n^2)$ |

#### Derivation for each row

For each recurrence, identify $a$, $b$, and $f(n)$; compute $c^* = \log_b a$, then compare $f(n)$ with $n^{c^*}$:

1. **$T(n) = 2T(n/2) + n$**

   $a = 2$, $b = 2$, $f(n) = n$. So $c^* = \log_2 2 = 1$ and $n^{c^*} = n$.

   $f(n) = n = \Theta(n^1 \log^0 n)$ matches **Case 2** with $k = 0$. Thus $T(n) = \Theta(n \log n)$.

2. **$T(n) = 4T(n/2) + n$**

   $a = 4$, $b = 2$, $f(n) = n$. So $c^* = \log_2 4 = 2$ and $n^{c^*} = n^2$.

   $f(n) = n = O(n^{2 - \varepsilon})$ with $\varepsilon = 1$: recursive work dominates. **Case 1** gives $T(n) = \Theta(n^2)$.

3. **$T(n) = T(n/2) + n$**

   $a = 1$, $b = 2$, $f(n) = n$. So $c^* = \log_2 1 = 0$ and $n^{c^*} = 1$.

   $f(n) = n = \Omega(n^{0 + \varepsilon})$ with $\varepsilon = 1$. For **Case 3**, also check regularity ($a f(n/b) \leq k f(n)$ for some $k < 1$): $1 \cdot \frac{n}{2} = \frac{1}{2}n$ ✓. Thus $T(n) = \Theta(n)$.

   Sanity check: unrolling gives $n + \frac{n}{2} + \frac{n}{4} + \cdots \leq 2n$.

4. **$T(n) = 9T(n/3) + n^2$**

   $a = 9$, $b = 3$, $f(n) = n^2$. So $c^* = \log_3 9 = 2$ and $n^{c^*} = n^2$.

   $f(n) = n^2 = \Theta(n^2 \log^0 n)$ matches **Case 2** with $k = 0$. Thus $T(n) = \Theta(n^2 \log n)$.

5. **$T(n) = 2T(n/2) + n^2$**

   $a = 2$, $b = 2$, $f(n) = n^2$. So $c^* = \log_2 2 = 1$ and $n^{c^*} = n$.

   $f(n) = n^2 = \Omega(n^{1 + \varepsilon})$ with $\varepsilon = 1$. Regularity holds: $2 \cdot \left(\frac{n}{2}\right)^2 = \frac{1}{2}n^2$ ✓. **Case 3** gives $T(n) = \Theta(n^2)$.

#### Recursion-tree view: why Case 2 picks up a log

For merge sort, level $j$ of the tree has $2^j$ subproblems of size $n/2^j$. Each level therefore does $2^j \cdot \frac{n}{2^j} = n$ work. There are $\log_2 n + 1$ levels, so the total is $n(\log_2 n + 1) = \Theta(n \log n)$. In Case 1 the per-level cost grows geometrically toward the leaves, so the leaves dominate. In Case 3 it shrinks geometrically, so the root dominates.

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

def fib(n):                   # O(2^n) time, O(n) space (call stack)
    if n <= 1: return n
    return fib(n-1) + fib(n-2)

def fib_iterative(n):         # O(n) time, O(1) space
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```
```julia
function sum_array(arr)       # O(1) space — no extra allocation
    total = 0
    for x in arr
        total += x
    end
    return total
end

copy_array(arr) = copy(arr)   # O(n) space — allocates a new array

function merge_sort(arr)      # O(n) space — temp arrays during merge
    # ...                     # O(log n) call stack depth
end

function fib(n)               # O(2^n) time, O(n) space (call stack)
    n <= 1 && return n
    return fib(n-1) + fib(n-2)
end

function fib_iterative(n)     # O(n) time, O(1) space
    a, b = 0, 1
    for _ in 1:n
        a, b = b, a + b
    end
    return a
end
```
```ts
function sumArray(arr: number[]): number {   // O(1) space — no extra allocation
  let total = 0;
  for (const x of arr) {
    total += x;
  }
  return total;
}

function copyArray(arr: number[]): number[] {   // O(n) space — allocates a new array
  return arr.slice();
}

function mergeSort(arr: number[]) {   // O(n) space — temp arrays during merge
  // ...                              // O(log n) call stack depth
}

function fib(n: number): number {     // O(2^n) time, O(n) space (call stack)
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

function fibIterative(n: number): number {   // O(n) time, O(1) space
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}
```
```rust
fn sum_array(arr: &[i64]) -> i64 {   // O(1) space — no extra allocation
    let mut total = 0;
    for &x in arr {
        total += x;
    }
    total
}

fn copy_array(arr: &[i64]) -> Vec<i64> {   // O(n) space — allocates a new Vec
    arr.to_vec()
}

fn merge_sort(arr: &[i64]) -> Vec<i64> {   // O(n) space — temp arrays during merge
    todo!()                                // O(log n) call stack depth
}

fn fib(n: u64) -> u64 {               // O(2^n) time, O(n) space (call stack)
    if n <= 1 { return n; }
    fib(n - 1) + fib(n - 2)
}

fn fib_iterative(n: u64) -> u64 {     // O(n) time, O(1) space
    let (mut a, mut b) = (0, 1);
    for _ in 0..n {
        (a, b) = (b, a + b);
    }
    a
}
```

### Tail Recursion

A tail-recursive function makes its recursive call as the very last operation. Some languages (Scheme, Haskell, Scala with `@tailrec`) optimise this into a loop, reducing stack space from $O(n)$ to $O(1)$. None of the four languages shown here guarantee it: Python and Julia never do it, V8 (Chrome, Node) doesn't for TypeScript, and Rust only might in an optimised build.

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
```julia
# (fact, not factorial: Base.factorial already exists)
# Not tail-recursive: must return to multiply after recursive call
function fact(n)
    n == 0 && return 1
    return n * fact(n - 1)   # multiplication happens *after*
end

# Tail-recursive (accumulator pattern)
function fact_tail(n, acc=1)
    n == 0 && return acc
    return fact_tail(n - 1, acc * n)   # no pending work
end
```
```ts
// Not tail-recursive: must return to multiply after recursive call
function factorial(n: number): number {
  if (n === 0) return 1;
  return n * factorial(n - 1);   // multiplication happens *after*
}

// Tail-recursive (accumulator pattern)
function factorialTail(n: number, acc = 1): number {
  if (n === 0) return acc;
  return factorialTail(n - 1, acc * n);   // no pending work
}
```
```rust
// Not tail-recursive: must return to multiply after recursive call
fn factorial(n: u64) -> u64 {
    if n == 0 { return 1; }
    n * factorial(n - 1)   // multiplication happens *after*
}

// Tail-recursive (accumulator pattern; call with acc = 1)
fn factorial_tail(n: u64, acc: u64) -> u64 {
    if n == 0 { return acc; }
    factorial_tail(n - 1, acc * n)   // no pending work
}
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
```julia
function example(arr)
    for i in 1:length(arr)          # O(n)
        for j in 1:100              # O(1) — fixed, not n
            println(arr[i], " ", j)
        end
    end
end
```
```ts
function example(arr: number[]): void {
  for (let i = 0; i < arr.length; i++) {   // O(n)
    for (let j = 0; j < 100; j++) {        // O(1) — fixed, not n
      console.log(arr[i], j);
    }
  }
}
```
```rust
fn example(arr: &[i32]) {
    for i in 0..arr.len() {         // O(n)
        for j in 0..100 {           // O(1) — fixed, not n
            println!("{} {j}", arr[i]);
        }
    }
}
```

**Time:** $O(n)$ — the inner loop is constant regardless of input size.

#### Derivation

Let $n = \texttt{len(arr)}$. The outer loop runs $n$ times, and the inner loop always runs exactly 100 times. Total `print` calls:

$$
\sum_{i=0}^{n-1} 100 = 100n
$$

By the definition of Big O, $100n \leq c \cdot n$ with $c = 100$ for every $n \geq 1$, so $T(n) = O(n)$. The inner loop also always runs, so $100n \geq 1 \cdot n$ and the bound is tight: $\Theta(n)$.

---

### Example 2 — Triangular sum

```python
def example(arr):
    for i in range(len(arr)):
        for j in range(i):          # runs 0, 1, 2, ..., n-1 times
            print(arr[j])
```
```julia
function example(arr)
    for i in 1:length(arr)
        for j in 1:i-1              # runs 0, 1, 2, ..., n-1 times
            println(arr[j])
        end
    end
end
```
```ts
function example(arr: number[]): void {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < i; j++) {   // runs 0, 1, 2, ..., n-1 times
      console.log(arr[j]);
    }
  }
}
```
```rust
fn example(arr: &[i32]) {
    for i in 0..arr.len() {
        for j in 0..i {             // runs 0, 1, 2, ..., n-1 times
            println!("{}", arr[j]);
        }
    }
}
```

**Time:** $\displaystyle\sum_{i=0}^{n-1} i = \frac{n(n-1)}{2} = O(n^2)$

#### Derivation

Count how many times the inner body runs for each value of $i$:

| $i$ | 0 | 1 | 2 | $\cdots$ | $n-1$ |
|---|---|---|---|---|---|
| inner iterations | 0 | 1 | 2 | $\cdots$ | $n-1$ |

Let $S = 0 + 1 + \cdots + (n-1)$. Write the same sum backwards and add the two versions term by term:

$$
\begin{aligned}
S  &= 0 + 1 + \cdots + (n-1) \\
S  &= (n-1) + (n-2) + \cdots + 0 \\
2S &= \underbrace{(n-1) + (n-1) + \cdots + (n-1)}_{n \text{ terms}} = n(n-1)
\end{aligned}
$$

So $S = \frac{n(n-1)}{2} = \frac{1}{2}n^2 - \frac{1}{2}n$. For the upper bound, $S \leq \frac{1}{2}n^2$. For the lower bound, $S \geq \frac{1}{4}n^2$ whenever $n \geq 2$. Together these give $\Theta(n^2)$, which is half the work of the full $n \times n$ loop but the same growth rate.

---

<section class="halving-example" aria-labelledby="example-3--logarithmic-while-loop">

<p class="example-eyebrow">Worked example 03</p>

### Example 3 — Logarithmic while loop

Each pass divides the remaining value by two. How many passes does that take?

```python
def example(n):
    i = n
    while i > 0:
        i = i // 2
```
```julia
function example(n)
    i = n
    while i > 0
        i = i ÷ 2
    end
end
```
```ts
function example(n: number): void {
  let i = n;
  while (i > 0) {
    i = Math.floor(i / 2);
  }
}
```
```rust
fn example(n: u64) {
    let mut i = n;
    while i > 0 {
        i /= 2;
    }
}
```

<div class="example-result">

**Time: $O(\log n)$**

For a positive integer $n$, the loop runs $\lfloor \log_2 n \rfloor + 1$ times. Doubling the input adds just one iteration.

</div>

<div class="example-derivation">

#### Why halving gives log n

<section class="calculation-step">

##### 1. Start with the meaning of a logarithm

$\log_2 n$ asks: *"2 to the power of what equals $n$?"*

For example, $2^4 = 16$, so $\log_2 16 = 4$. Starting from 1, four doublings reach 16:

$$
1 \to 2 \to 4 \to 8 \to 16
$$

Read that backwards: four halvings take 16 back to 1. For powers of two, **$\log_2 n$ counts the halvings needed to reach 1.** The loop takes one more step to reach 0.

</section>

<section class="calculation-step">

##### 2. Trace a concrete input

Take $n = 16$. Read down the table: each row adds one iteration.

| Iterations ($k$) | Calculation | Value of $i$ |
|---|---|---|
| 0 | $16 / 2^0$ | 16 |
| 1 | $16 / 2^1$ | 8 |
| 2 | $16 / 2^2$ | 4 |
| 3 | $16 / 2^3$ | 2 |
| 4 | $16 / 2^4$ | 1 |
| 5 | $\lfloor 16 / 2^5 \rfloor$ | 0 (stop) |

Four halvings reach 1. One final integer division reaches 0: **five iterations in total.**

</section>

<section class="calculation-step">

##### 3. Write the pattern

Each iteration introduces another factor of 2 in the denominator:

$$
\begin{aligned}
\text{After 1 pass:}\quad &n/2 \\
\text{After 2 passes:}\quad &n/(2 \cdot 2) = n/2^2 \\
\text{After } k \text{ passes:}\quad &n/2^k
\end{aligned}
$$

For a power of two, these values are exact until we reach 1. With integer division in general, $i = \lfloor n/2^k \rfloor$.

</section>

<section class="calculation-step">

##### 4. Solve for the number of passes

For a power of two, set the value equal to 1:

$$
\frac{n}{2^k} = 1
$$

Multiply both sides by $2^k$:

$$
n = 2^k
$$

Take $\log_2$ of both sides:

$$
k = \log_2 n
$$

That counts the passes to reach 1. Add the final pass to reach 0:

$$
\text{iterations} = \log_2 n + 1
$$

Check with 16: $4 + 1 = 5$ iterations, matching the trace above.

</section>

<section class="calculation-step">

##### 5. Account for rounding down

When $n$ is not a power of two, `//` rounds down. For $n = 20$:

$$
20 \to 10 \to 5 \to 2 \to 1 \to 0
$$

That's still five iterations. Since $2^4 = 16$ and $2^5 = 32$, we have $\log_2 20 \approx 4.32$. Round down, then add the last pass:

$$
\lfloor \log_2 20 \rfloor + 1 = 4 + 1 = 5
$$

For any positive integer $n$, stop at the first integer $k$ satisfying:

$$
\begin{aligned}
n/2^k &< 1 \\
2^k &> n \\
k &> \log_2 n
\end{aligned}
$$

The smallest such integer is $\lfloor \log_2 n \rfloor + 1$.

</section>

<section class="calculation-step">

##### 6. Convert the count to Big O

Each iteration does constant work. If that cost is $c$:

$$
\begin{aligned}
T(n) &= c \cdot (\lfloor \log_2 n \rfloor + 1) \\
     &= \Theta(\log n)
\end{aligned}
$$

Dropping the constant factor, rounding, and final extra step gives logarithmic growth.

The log's base only changes a constant factor. Dividing by 3 each time would give:

$$
\log_3 n = \frac{\log_2 n}{\log_2 3}
$$

</section>

</div>

<aside class="example-takeaway" aria-label="Halving intuition">

#### Why this stays fast

Doubling $n$ adds one iteration: the first halving brings $2n$ back to $n$.

| Input $n$ | Iterations |
|---|---|
| 1,000 | 10 |
| 1,000,000 | 20 |
| 1,000,000,000 | 30 |

**The binary view:** `i // 2` removes the last binary digit. For example:

$$
10100_2 \to 1010_2 \to 101_2
$$

Those values are 20, 10, and 5. The loop runs once per binary digit of $n$, which has $\lfloor \log_2 n \rfloor + 1$ digits.

</aside>

</section>

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
```julia
function example(arr)
    for x in arr            # O(n)
        println(x)
    end
    sort!(arr)              # O(n log n)
    for x in arr            # O(n)
        println(x)
    end
end
```
```ts
function example(arr: number[]): void {
  for (const x of arr) {          // O(n)
    console.log(x);
  }
  arr.sort((a, b) => a - b);      // O(n log n)
  for (const x of arr) {          // O(n)
    console.log(x);
  }
}
```
```rust
fn example(arr: &mut [i32]) {
    for x in arr.iter() {   // O(n)
        println!("{x}");
    }
    arr.sort();             // O(n log n)
    for x in arr.iter() {   // O(n)
        println!("{x}");
    }
}
```

**Time:** $O(n) + O(n \log n) + O(n) = O(n \log n)$ — dominated by the sort.

#### Derivation

The three steps run one after another, so their costs add:

$$
T(n) = c_1 n + c_2 n\log_2 n + c_3 n
$$

For $n \geq 2$ we have $\log_2 n \geq 1$, so $n \leq n\log_2 n$. Replacing each linear term with $n \log_2 n$ gives an upper bound:

$$
T(n) \leq (c_1 + c_2 + c_3)\, n \log_2 n \quad \text{for all } n \geq 2
$$

This fits the Big O definition with $c = c_1 + c_2 + c_3$ and $n_0 = 2$, so $T(n) = O(n \log n)$. The ratio $\frac{n}{n \log n} = \frac{1}{\log n} \to 0$ shows that the linear passes are $o(n \log n)$: they become negligible as $n$ grows.

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
```julia
function example(arr, target)
    # Binary search: O(log n)
    lo, hi = 1, length(arr)
    while lo <= hi
        mid = (lo + hi) ÷ 2
        if arr[mid] == target
            # Then scan outward linearly: O(n)
            left = mid
            while left > 1 && arr[left - 1] == target
                left -= 1
            end
            return left
        elseif arr[mid] < target
            lo = mid + 1
        else
            hi = mid - 1
        end
    end
    return nothing
end
```
```ts
function example(arr: number[], target: number): number {
  // Binary search: O(log n)
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) {
      // Then scan outward linearly: O(n)
      let left = mid;
      while (left > 0 && arr[left - 1] === target) {
        left -= 1;
      }
      return left;
    } else if (arr[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return -1;
}
```
```rust
fn example(arr: &[i32], target: i32) -> Option<usize> {
    // Binary search: O(log n). hi is exclusive, so it never underflows.
    let (mut lo, mut hi) = (0, arr.len());
    while lo < hi {
        let mid = lo + (hi - lo) / 2;
        if arr[mid] == target {
            // Then scan outward linearly: O(n)
            let mut left = mid;
            while left > 0 && arr[left - 1] == target {
                left -= 1;
            }
            return Some(left);
        } else if arr[mid] < target {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    None
}
```

**Time:** $O(\log n)$ to find the element, then up to $O(n)$ to scan — **total $O(n)$**. The logarithmic search is swallowed by the linear scan.

#### Derivation

- **Search phase.** Each iteration of the outer `while` halves the interval `[lo, hi]`, just as in Example 3. It therefore runs at most $\lfloor \log_2 n \rfloor + 1$ times, which is $O(\log n)$.
- **Scan phase.** The scan runs at most once, because the function returns right after it. It moves `left` from `mid` down toward 0, so it does at most `mid` $\leq n - 1$ steps.
- **Total.** $T(n) \leq c_1 \log_2 n + c_2 n = O(n)$.
- **Worst case is tight.** Suppose every element equals `target`. The first probe hits `mid` $= \lfloor (n-1)/2 \rfloor$, and the scan then walks all the way to index 0. That is about $n/2$ steps, so the worst case is $\Theta(n)$.
- **Best case.** If the target appears once, the scan does 0 steps and only the $O(\log n)$ search remains.

Replacing the scan with a second binary search for the leftmost occurrence makes the whole function $O(\log n)$ in every case.

---

### Example 6 — Recursive tree (two branches)

```python
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
```
```julia
function fib(n)
    if n <= 1
        return n
    end
    return fib(n - 1) + fib(n - 2)
end
```
```ts
function fib(n: number): number {
  if (n <= 1) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}
```
```rust
fn fib(n: u64) -> u64 {
    if n <= 1 {
        return n;
    }
    fib(n - 1) + fib(n - 2)
}
```

Each call makes two more at sizes $n-1$ and $n-2$. The call tree has depth $n$ and at each level the number of nodes roughly doubles — $O(2^n)$ calls total. Space is $O(n)$ (maximum call stack depth).

Recurrence: $T(n) = T(n-1) + T(n-2) + O(1)$, which solves to $\Theta(\phi^n)$ where $\phi = \frac{1+\sqrt{5}}{2} \approx 1.618$ (the golden ratio). We bound this as $O(2^n)$.

#### Derivation

Let $C(n)$ be the number of calls. Then $C(0) = C(1) = 1$ and $C(n) = C(n-1) + C(n-2) + 1$.

**Upper bound**

Since $C(n-2) \leq C(n-1)$:

$$
C(n) \leq 2C(n-1) + 1
$$

Unrolling this gives $C(n) \leq 2^{n+1} - 1$. So $T(n) = O(2^n)$.

**Lower bound**

Since $C(n-1) \geq C(n-2)$:

$$
C(n) \geq 2C(n-2)
$$

Each application of this step subtracts 2 from $n$, so it can be applied $\lfloor n/2 \rfloor$ times before reaching a base case. That gives $C(n) \geq 2^{\lfloor n/2 \rfloor} = \Omega(\sqrt{2}^{\,n}) \approx \Omega(1.414^n)$. The call count is therefore exponential either way.

**Exact rate**

Ignoring the $+1$ temporarily, guess a solution of the form $C(n) = x^n$:

$$
x^n = x^{n-1} + x^{n-2} \;\Rightarrow\; x^2 = x + 1 \;\Rightarrow\; x = \frac{1 \pm \sqrt{5}}{2}
$$

The larger root $\phi \approx 1.618$ dominates, which gives $\Theta(\phi^n)$. In fact $C(n) = 2F(n+1) - 1$, where $F$ is the Fibonacci sequence with $F(1) = F(2) = 1$. Check: $C(2) = 2F(3) - 1 = 2 \cdot 2 - 1 = 3$, which counts `fib(2)`, `fib(1)`, and `fib(0)` ✓.

**Space**

Only one root-to-leaf path is on the stack at a time. The longest path is $n \to n-1 \to \cdots \to 1$, which is $n$ frames, so space is $O(n)$.

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
```julia
# A fresh memo per top-level call: Julia evaluates default arguments on
# every call. (The Memoize.jl package offers an @memoize macro.)
function fib(n, memo = Dict{Int, Int}())
    n <= 1 && return n
    haskey(memo, n) && return memo[n]
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
end
```
```ts
const memo = new Map<number, number>();

function fib(n: number): number {
  if (n <= 1) return n;
  const cached = memo.get(n);
  if (cached !== undefined) return cached;
  const result = fib(n - 1) + fib(n - 2);
  memo.set(n, result);
  return result;
}
```
```rust
use std::collections::HashMap;

// Call it as fib(n, &mut HashMap::new()).
fn fib(n: u64, memo: &mut HashMap<u64, u64>) -> u64 {
    if n <= 1 {
        return n;
    }
    if let Some(&cached) = memo.get(&n) {
        return cached;
    }
    let result = fib(n - 1, memo) + fib(n - 2, memo);
    memo.insert(n, result);
    result
}
```

Each unique $n$ is computed exactly once and cached. There are $n$ unique subproblems, each $O(1)$ to compute given its children — **$O(n)$ time, $O(n)$ space**.

#### Derivation

- **Count the subproblems.** The only arguments that can ever appear are $0, 1, \ldots, n$, which is $n + 1$ distinct values.
- **Cost per subproblem.** The first call to `fib(k)` does $O(1)$ work of its own plus two recursive calls. Any later call to `fib(k)` is a cache hit costing $O(1)$.
- **Count all calls.** Each of the $n + 1$ first calls triggers at most 2 further calls, so there are at most $1 + 2(n+1)$ calls in total.
- **Time.** $O(1)$ per call times $O(n)$ calls gives $T(n) = O(n)$.
- **Space.** The cache holds $n + 1$ entries. The first descent `fib(n)` → `fib(n-1)` → $\cdots$ → `fib(1)` puts $n$ frames on the stack at once. Both are $O(n)$, so total space is $O(n)$.

Compared with Example 6, caching takes the time from $\Theta(\phi^n)$ down to $\Theta(n)$ without changing the stack depth.

---

### Example 8 — Nested recursion

```python
def f(n, m):
    if n == 0 or m == 0:
        return 1
    return f(n - 1, m) + f(n, m - 1)
```
```julia
function f(n, m)
    if n == 0 || m == 0
        return 1
    end
    return f(n - 1, m) + f(n, m - 1)
end
```
```ts
function f(n: number, m: number): number {
  if (n === 0 || m === 0) {
    return 1;
  }
  return f(n - 1, m) + f(n, m - 1);
}
```
```rust
fn f(n: u64, m: u64) -> u64 {
    if n == 0 || m == 0 {
        return 1;
    }
    f(n - 1, m) + f(n, m - 1)
}
```

This computes a value on a 2D grid of size $n \times m$. Without memoisation: $O\!\left(\binom{n+m}{n}\right)$ — exponential. With memoisation: $O(n \cdot m)$ time and space, since there are $n \times m$ unique subproblems.

#### Derivation

**What the function returns**

The base cases return 1, and the recursion follows Pascal's rule:

$$
\begin{aligned}
\binom{n+m}{n}
  &= \binom{n+m-1}{n-1} \\
  &\quad + \binom{n+m-1}{n}
\end{aligned}
$$

So:

$$
f(n, m) = \binom{n+m}{n}
$$

This counts the monotone lattice paths from $(n, m)$ to an edge of the grid.

**Without memoisation**

Every leaf of the call tree returns exactly 1, and each internal call returns the sum of its two children. The number of leaves therefore equals the return value:

$$
L = \binom{n+m}{n}
$$

Every internal node has exactly two children. A tree with $L$ leaves has $2L - 1$ nodes, so the call count is:

$$
2\binom{n+m}{n} - 1 = \Theta\!\left(\binom{n+m}{n}\right)
$$

For a square grid ($n = m$), Stirling's approximation gives:

$$
\binom{2n}{n} \sim \frac{4^n}{\sqrt{\pi n}}
$$

That is exponential. For example, $f(20, 20) = \binom{40}{20} \approx 1.4 \times 10^{11}$ leaves.

**With memoisation**

- **States.** The possible arguments are pairs $(i, j)$ with $0 \leq i \leq n$ and $0 \leq j \leq m$, which is $(n+1)(m+1)$ states.
- **Work per state.** $O(1)$ plus two cache lookups.
- **Time.** $(n+1)(m+1) \cdot O(1) = O(nm)$.
- **Space.** The cache is $O(nm)$. The deepest chain of calls, where each call decrements $n$ or $m$ by one, has at most $n + m$ frames, and $n + m$ is smaller than $nm$ for large grids. Total space is $O(nm)$.

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
```julia
function mystery(n)
    if n <= 0
        return 0
    end
    return n + mystery(n - 1)
end
```
```ts
function mystery(n: number): number {
  if (n <= 0) {
    return 0;
  }
  return n + mystery(n - 1);
}
```
```rust
fn mystery(n: i64) -> i64 {
    if n <= 0 {
        return 0;
    }
    n + mystery(n - 1)
}
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
