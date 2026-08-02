---
title: Kadane's Algorithm
description: A one-pass dynamic-programming pattern for maximum or minimum contiguous subarray problems, with a roadmap to its core variants.
category: Patterns
order: 4
status: stable
tags:
  - dsa
  - arrays
  - dynamic-programming
  - kadane
  - subarray
---

# Kadane's Algorithm

Kadane's algorithm solves the **maximum-sum contiguous subarray** problem in one pass.

Its real value is larger than one problem: it teaches a compact dynamic-programming habit that appears throughout the DSA roadmap:

> Define the best answer that must end **here**, then preserve the best answer seen **anywhere**.

Use Kadane when a prompt asks for the largest or smallest value over a **contiguous** region and each new element either extends the previous candidate or starts a new one.

## Recognition Signals

Reach for Kadane when you see phrases such as:

- “maximum sum contiguous subarray”
- “largest sum of a non-empty subarray”
- “best value ending at index `i`”
- “find the minimum-sum contiguous segment”
- “one pass” or `O(n)` is needed instead of checking every range

It is for **subarrays**, not subsequences: you cannot skip elements between the chosen values.

## From Brute Force to the Key Decision

A brute-force solution considers every start and end index:

```python
best = nums[0]

for start in range(len(nums)):
    running = 0
    for end in range(start, len(nums)):
        running += nums[end]
        best = max(best, running)
```

There are `O(n²)` contiguous ranges. Kadane avoids reconsidering all of them by asking one narrower question at each index:

> What is the maximum sum of a non-empty subarray that **must end at this element**?

Suppose the current value is `x`. Any subarray ending here has only two useful shapes:

1. Start fresh: `[x]`
2. Extend the best subarray that ended at the previous index: `[... previous, x]`

That gives the recurrence:

```text
current = max(x, current + x)
best = max(best, current)
```

## Core Invariant

After processing index `i`:

```text
current = maximum sum of every non-empty subarray ending exactly at i
best    = maximum sum of every non-empty subarray ending at or before i
```

`current` is deliberately local: it only describes candidates that end **here**.

`best` is global: it remembers a winning range even if later values weaken `current`.

## Why a Negative Prefix Is Discarded

If `current` is negative, adding it to the next number makes every future candidate worse.

For example, if `current = -4` and the next number is `7`:

```text
extend: -4 + 7 = 3
restart:      7 = 7
```

Starting over wins. That is why this equivalent form is often easier to read:

```python
current = max(current, 0) + x
```

It means:

> Keep the previous sum only when it helps; otherwise reset to zero before adding `x`.

This is exactly equivalent to `max(x, current + x)`:

```text
max(current + x, x)
= max(current + x, 0 + x)
= max(current, 0) + x
```

## Canonical Implementation

```python
def max_subarray_sum(nums: list[int]) -> int:
    best = nums[0]
    current = 0

    for x in nums:
        current = max(current + x, x)
        best = max(best, current)

    return best
```

- **Time:** `O(n)`
- **Extra space:** `O(1)`

Initialize `best = nums[0]`, not `0`, because the answer must be non-empty.

## Worked Trace

For:

```text
nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
```

| `x` | Best sum ending here (`current`) | Best anywhere (`best`) | Decision |
|---:|---:|---:|---|
| -2 | -2 | -2 | Start at `-2` |
| 1 | 1 | 1 | Restart; `-2` hurts |
| -3 | -2 | 1 | Extend `[1]` |
| 4 | 4 | 4 | Restart; previous sum hurts |
| -1 | 3 | 4 | Extend `[4]` |
| 2 | 5 | 5 | Extend `[4, -1]` |
| 1 | 6 | 6 | Extend `[4, -1, 2]` |
| -5 | 1 | 6 | Keep a still-positive prefix |
| 4 | 5 | 6 | Extend, but the earlier best remains |

The answer is `6`, from `[4, -1, 2, 1]`.

Practice the complete walkthrough in [Maximum Subarray](/algorithms/53-maximum-subarray/).

## Common Mistakes

### Returning `0` for all-negative input

For:

```text
[-3, -2, -5]
```

the correct answer is `-2`, not `0`. Selecting nothing is not a valid non-empty subarray.

Use:

```python
best = nums[0]
```

so the largest negative value can win.

### Writing `max(0, x)`

This is **not** Kadane:

```python
current = max(0, x)  # wrong
```

It ignores the previous `current` value, so it finds only the best single element.

Use either equivalent Kadane form:

```python
current = max(current + x, x)
# or
current = max(current, 0) + x
```

### Resetting because `current < best`

`current` and `best` answer different questions. A running sum can be smaller than the global best and still be useful for future values. Reset only when the running prefix is harmful, not merely because it is not currently winning.

### Forgetting contiguity

Kadane chooses one connected range. It cannot collect every positive value while skipping negative values in between.

## Returning the Actual Range

To return indices rather than only the sum, record where the current candidate started and save that range whenever it becomes the global best:

```python
def max_subarray_range(nums: list[int]) -> tuple[int, int]:
    best = nums[0]
    current = 0
    candidate_start = 0
    best_start = 0
    best_end = 0

    for index, x in enumerate(nums):
        if current < 0:
            current = 0
            candidate_start = index

        current += x

        if current > best:
            best = current
            best_start = candidate_start
            best_end = index

    return best_start, best_end
```

## Variants Roadmap

Kadane is a foundation for several later patterns:

| Variant | What changes | Why it matters |
|---|---|---|
| [Maximum Sum Circular Subarray](/algorithms/918-maximum-sum-circular-subarray/) | Track both maximum and minimum subarrays; a wrapped maximum is `total - minimumGap` | Introduces complement reasoning without manual index wrapping |
| Maximum Product Subarray | Track both a running maximum and minimum product | A negative can turn a small negative product into the largest positive product |
| Maximum Sum Rectangle | Compress pairs of matrix rows into a 1D array, then run Kadane | Shows how a 1D pattern becomes a 2D algorithm |
| Stock-price differences | Apply Kadane to consecutive daily price changes | Connects array transformations to stock-profit questions |
| Divide-and-conquer Maximum Subarray | Combine left best, right best, best prefix, best suffix, and total | A different view of the same subarray information |
| Minimum Subarray Sum | Flip `max` to `min` | Used directly in the circular-subarray complement trick |

## Practice Path

1. [Maximum Subarray](/algorithms/53-maximum-subarray/) — learn the extend-or-restart state.
2. [Maximum Sum Circular Subarray](/algorithms/918-maximum-sum-circular-subarray/) — combine maximum and minimum Kadane passes.
3. Maximum Product Subarray — learn why one state is no longer enough.
4. Maximum Sum Rectangle — reuse Kadane after reducing a matrix to one dimension.

The transferable lesson is not only the formula. It is the state definition:

> `current` is the best valid answer that must end here.

When you can write that sentence for a new problem, its dynamic-programming recurrence often becomes much easier to derive.
