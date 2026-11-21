---
title: Time Complexity Interview Questions & Playbook
slug: time_complexity_interview_questions
description: Graded time complexity interview drills with hidden answers, plus a step-by-step playbook for analysing and optimising solutions in interviews.
category: Complexity
order: 4
status: stable
tags:
  - complexity
  - interview-prep
  - big-o
---

# Time Complexity Interview Questions & Playbook

Use this note to **test yourself** on common time complexity interview questions and rehearse how to talk through complexity under time pressure.

Need a refresher first? See [Asymptotic Analysis](../asymptotic-analysis/) for the core derivations and [Time Complexity](../time-complexity/) for pattern recognition, constraint heuristics, and data structure / sorting / graph tables.

---

## Warm-Up Drills

### Q1. Triangular nested loop

What is the time complexity of this function? How would you optimize it if the goal were finding two elements that sum to a target?

```python
def example(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            print(arr[i], arr[j])
```
```julia
function example(arr)
    for i in 1:length(arr)
        for j in i+1:length(arr)
            println(arr[i], " ", arr[j])
        end
    end
end
```
```ts
function example(arr: number[]): void {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      console.log(arr[i], arr[j]);
    }
  }
}
```
```rust
fn example(arr: &[i32]) {
    for i in 0..arr.len() {
        for j in i + 1..arr.len() {
            println!("{} {}", arr[i], arr[j]);
        }
    }
}
```

<details>
<summary>Show answer</summary>

**Time:** $\Theta(n^2)$. The inner loop runs $(n - 1) + (n - 2) + \cdots + 1 = \frac{n(n - 1)}{2}$ times.

**Optimization:** If you must print all pairs, $\Omega(n^2)$ is unavoidable. If you are searching for a pair with a target sum (Two Sum), store seen values in a hash map to drop time to $O(n)$ at the cost of $O(n)$ space.

</details>

### Q2. Halving loop

What is the time complexity of `mystery(n)`?

```python
def mystery(n):
    count = 0
    i = n
    while i > 0:
        i //= 2
        count += 1
    return count
```
```julia
function mystery(n)
    count = 0
    i = n
    while i > 0
        i ÷= 2
        count += 1
    end
    return count
end
```
```ts
function mystery(n: number): number {
  let count = 0;
  let i = n;
  while (i > 0) {
    i = Math.floor(i / 2);
    count += 1;
  }
  return count;
}
```
```rust
fn mystery(n: u64) -> u32 {
    let mut count = 0;
    let mut i = n;
    while i > 0 {
        i /= 2;
        count += 1;
    }
    count
}
```

<details>
<summary>Show answer</summary>

**Time:** $\Theta(\log n)$. Each iteration halves `i`, so the loop runs $\lfloor \log_2 n \rfloor + 1$ times (once per binary digit of $n$).

</details>

### Q3. Are two nested loops always $O(n^2)$?

Give the tight time complexity for each of these three snippets:

```python
# A
for i in range(n):
    for j in range(10):
        print(i, j)

# B
for i in range(n):
    j = i
    while j > 0:
        j //= 2

# C
for i in range(n):
    for j in range(m):
        print(i, j)
```
```julia
# A
for i in 1:n
    for j in 1:10
        println(i, " ", j)
    end
end

# B
for i in 1:n
    j = i
    while j > 0
        j ÷= 2
    end
end

# C
for i in 1:n
    for j in 1:m
        println(i, " ", j)
    end
end
```
```ts
// A
for (let i = 0; i < n; i++) {
  for (let j = 0; j < 10; j++) {
    console.log(i, j);
  }
}

// B
for (let i = 0; i < n; i++) {
  let j = i;
  while (j > 0) {
    j = Math.floor(j / 2);
  }
}

// C
for (let i = 0; i < n; i++) {
  for (let j = 0; j < m; j++) {
    console.log(i, j);
  }
}
```
```rust
// A
for i in 0..n {
    for j in 0..10 {
        println!("{i} {j}");
    }
}

// B
for i in 0..n {
    let mut j = i;
    while j > 0 {
        j /= 2;
    }
}

// C
for i in 0..n {
    for j in 0..m {
        println!("{i} {j}");
    }
}
```

<details>
<summary>Show answer</summary>

- **A:** $\Theta(n)$ — the inner loop is a constant 10 iterations.
- **B:** $\Theta(n \log n)$ — the inner loop halves `j`, running $\Theta(\log i)$ times for each $i$.
- **C:** $\Theta(n \cdot m)$ — `n` and `m` are independent input sizes; do not collapse to $O(n^2)$ unless $m = \Theta(n)$.

</details>

### Q4. Why is $O(2n)$ the same as $O(n)$, and when do constants still matter?

<details>
<summary>Show answer</summary>

Big O captures how work **scales** with $n$, ignoring constant multipliers ($2n \leq c \cdot n$ for $c = 2$). Constants still matter in production when comparing two algorithms in the **same** complexity class, or when $n$ is small enough that lower overhead and cache locality beat a better asymptotic curve (e.g. insertion sort vs. merge sort on small subarrays).

</details>

---

## Recursion & Data Structure Drills

### Q5. Binary search — time, space, and failure mode

Explain why binary search is $O(\log n)$, compare iterative vs. recursive space, and state when a binary-search-like lookup degrades to $O(n)$.

<details>
<summary>Show answer</summary>

- **Time:** Each comparison discards half the search space. After $k$ steps, $n / 2^k$ items remain; stopping at $1$ gives $k = \log_2 n \implies O(\log n)$.
- **Space:** Iterative is $O(1)$; recursive is $O(\log n)$ due to the call stack.
- **When it degrades to $O(n)$:** On an unbalanced (skewed) binary search tree, or when binary search is followed by a linear scan across duplicates (see [Asymptotic Analysis Example 6](../asymptotic-analysis/#example-6--binary-search--linear-duplicate-scan)).

</details>

### Q6. Explain $O(n \log n)$ in merge sort without citing the Master Theorem

<details>
<summary>Show answer</summary>

Picture the recursion tree: splitting the array in half at each step creates $\log_2 n$ levels. At every level, the subarrays partition all $n$ elements, so merging across the entire level touches every element once — $O(n)$ work per level. Multiplying $O(n)$ work per level by $O(\log n)$ levels gives $O(n \log n)$.

</details>

### Q7. Recursive Fibonacci — naive vs. optimized

```python
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
```
```julia
function fib(n)
    n <= 1 && return n
    return fib(n - 1) + fib(n - 2)
end
```
```ts
function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
```
```rust
fn fib(n: u64) -> u64 {
    if n <= 1 { return n; }
    fib(n - 1) + fib(n - 2)
}
```

State the time and space complexity of: (1) naive recursion, (2) memoisation, and (3) iterative DP.

<details>
<summary>Show answer</summary>

1. **Naive recursion:** $O(2^n)$ loose upper bound (tight: $\Theta(\phi^n)$, $\phi \approx 1.618$) time; $O(n)$ call-stack space.
2. **Memoisation:** $O(n)$ time (each of $0 \dots n$ computed once); $O(n)$ space (cache + call stack).
3. **Iterative (two variables):** $O(n)$ time; $O(1)$ space.

</details>

### Q8. Is hash table lookup *always* $O(1)$?

<details>
<summary>Show answer</summary>

No: **$O(1)$ average, $O(n)$ worst case**. If all $n$ keys hash to the same bucket, lookup degrades to scanning all $n$ colliding entries. Good hash functions, randomised hash seeds, and resizing to keep the load factor low make the worst case negligible in practice.

</details>

---

## Tricky & Optimization Drills

### Q9. Dynamic array append: $O(1)$ or $O(n)$?

<details>
<summary>Show answer</summary>

**$O(1)$ amortized, $O(n)$ worst-case single call.** Most appends write into spare capacity in $O(1)$. When full, resizing doubles capacity and copies $n$ elements ($O(n)$), but doubling means copies across $n$ appends sum to $1 + 2 + 4 + \cdots < 2n$, so $n$ appends take $O(n)$ total time.

</details>

### Q10. Spot the hidden $O(n^2)$ in string building

Why can building a string with `+=` inside a loop be $O(n^2)$, and how do you fix it in your language?

<details>
<summary>Show answer</summary>

In languages with immutable strings (Python, Julia, JS spec), concatenating allocates a new string and copies the entire prefix so far: $1 + 2 + \cdots + n = O(n^2)$.

- **Python:** collect parts in a list and call `"".join(parts)` — $O(n)$.
- **Julia:** write to an `IOBuffer` or call `join(parts)` — $O(n)$.
- **TypeScript:** collect parts in an array and call `parts.join("")` — $O(n)$ portably.
- **Rust:** `String` is mutable, so `result.push_str(part)` is already amortized $O(n)$; avoid `result = format!("{result}{part}")`, which copies every iteration.

</details>

### Q11. Spot the hidden $O(n^2)$ in slicing

```python
for i in range(n):
    process(arr[i:])
```
```julia
for i in 1:n
    process(arr[i:end])
end
```
```ts
for (let i = 0; i < n; i++) {
  process(arr.slice(i));
}
```
```rust
for i in 0..n {
    process(arr[i..].to_vec());
}
```

Assuming `process` itself does $O(1)$ work, what is the total time complexity and how do you make it $O(n)$?

<details>
<summary>Show answer</summary>

**$O(n^2)$.** Each slice copies $n - i$ elements, summing to $\frac{n(n + 1)}{2}$. Fix by passing the start index `i` alongside `arr`, or using a zero-copy view (`@view arr[i:end]` in Julia, `&arr[i..]` in Rust).

</details>

### Q12. Master Theorem — when does it apply and when doesn't it?

Solve $T(n) = 2T(n/2) + n$, and explain why the Master Theorem does **not** apply to $T(n) = T(n - 1) + O(1)$ or $T(n) = T(n/3) + T(2n/3) + n$.

<details>
<summary>Show answer</summary>

- **$T(n) = 2T(n/2) + n$:** $a = 2, b = 2 \implies c^* = \log_2 2 = 1$, so $n^{c^*} = n = f(n)$ (Case 2, $k = 0$) $\implies \Theta(n \log n)$.
- **$T(n) = T(n - 1) + O(1)$:** Subproblem shrinks by subtraction, not division by $b > 1$. Unroll directly $\implies \Theta(n)$.
- **$T(n) = T(n/3) + T(2n/3) + n$:** Subproblems have unequal sizes. Use a recursion tree (each full level sums to $n$; shortest path has depth $\log_3 n$, longest has $\log_{3/2} n \implies \Theta(n \log n)$).

</details>

---

## Interview Playbook

Use this six-step sequence when solving any algorithm question aloud:

1. **Clarify constraints first:** Ask for $n$ bounds, value ranges, and whether input is sorted — they immediately narrow down the required complexity class.
2. **State the brute force + its complexity:** Establish a clear baseline (e.g. "$O(n^2)$ checking all pairs") before optimising.
3. **Name the bottleneck:** Point to the repeated work (e.g. "linear search inside the outer loop").
4. **Apply the matching move:** Hash map ($O(n^2) \to O(n)$), sort + two pointers ($O(n^2) \to O(n \log n)$), binary search ($O(n) \to O(\log n)$), or DP ($O(2^n) \to O(n)$).
5. **Call out trade-offs:** Explicitly state what space you spent to buy that speedup, and note any worst-case caveats (hash collisions, skewed trees).
6. **Verify after coding:** Re-scan every loop, recursive call, and library call (`sort`, `in`, slicing, string concat) so hidden costs don't slip past you.

### Quick Interview Checklist

**Before coding:**
- [ ] Identified input size(s) — are there two independent variables ($n$ and $m$, $V$ and $E$)?
- [ ] Stated brute-force time & space complexity.
- [ ] Checked whether sorting, a hash map/set, a heap, or a standard pattern (two pointers, sliding window, prefix sums) removes the bottleneck.

**After coding:**
- [ ] Stated both **time** and **space** complexity (worst and average if they differ).
- [ ] Counted recursion stack depth and any hidden library copies (`slice`, `remove`, `in`).
- [ ] Checked edge cases (empty input, single element, all duplicates, already sorted).
