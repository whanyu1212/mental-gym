# Asymptotic Analysis

## What is Asymptotic Analysis?

Asymptotic analysis describes how an algorithm's resource usage (time or space) grows as input size approaches infinity. It focuses on the **growth rate**, not exact measurements.

**Why "asymptotic"?** The term comes from mathematics—we're looking at how the function *approaches* (asymptotically tends toward) a certain behavior as n → ∞.

## Why Do We Need It?

1. **Machine-independent** - Doesn't depend on CPU speed or language
2. **Focuses on scalability** - Small inputs run fast regardless; we care about large inputs
3. **Simplifies comparison** - Easy to compare algorithms without implementation details

## The Big Three Notations

### Big O (O) - Upper Bound (Worst Case)

"The algorithm will never be slower than this."

```
f(n) = O(g(n)) means f(n) ≤ c·g(n) for some constant c, when n is large enough
```

**Example:** Linear search is O(n)
- Best case: find it first try → O(1)
- Worst case: check every element → O(n)
- We say O(n) because that's the upper bound

### Big Omega (Ω) - Lower Bound (Best Case)

"The algorithm will never be faster than this."

```
f(n) = Ω(g(n)) means f(n) ≥ c·g(n) for some constant c, when n is large enough
```

**Example:** Any comparison-based sort is Ω(n log n)
- You can't sort faster than n log n using comparisons
- This is a proven lower bound

### Big Theta (Θ) - Tight Bound (Average Case)

"The algorithm is exactly this fast."

```
f(n) = Θ(g(n)) means c₁·g(n) ≤ f(n) ≤ c₂·g(n) for some constants c₁, c₂
```

**Example:** Merge sort is Θ(n log n)
- Always n log n, regardless of input
- Both upper and lower bound are n log n

## In Practice: We Usually Mean Big O

When someone asks "what's the time complexity?", they typically mean:
- **Big O** (worst case) for time complexity
- **Big O** (worst case) for space complexity

This is because we want to guarantee performance under any input.

## Rules for Calculating Big O

### 1. Drop Constants

```
O(2n) → O(n)
O(500) → O(1)
O(n/2) → O(n)
```

Constants don't affect growth rate.

### 2. Drop Lower-Order Terms

```
O(n² + n) → O(n²)
O(n + log n) → O(n)
O(n³ + n² + n) → O(n³)
```

The highest-order term dominates as n grows.

### 3. Different Variables Stay Separate

```
O(n + m) stays as O(n + m)
O(n · m) stays as O(n · m)
```

If inputs are independent, keep them separate.

### 4. Nested Loops Multiply

```python
for i in range(n):      # O(n)
    for j in range(n):  # O(n)
        print(i, j)     # O(1)
# Total: O(n) × O(n) × O(1) = O(n²)
```

### 5. Sequential Steps Add

```python
for i in range(n):    # O(n)
    print(i)

for j in range(m):    # O(m)
    print(j)
# Total: O(n) + O(m) = O(n + m)
```

### 6. Conditional: Take the Worst Branch

```python
if condition:
    do_something_on()    # O(n)
else:
    do_something_on²()   # O(n²)
# Total: O(n²) - assume worst case
```

## Common Complexity Classes

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Array access, hash lookup |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Linear search, single loop |
| O(n log n) | Linearithmic | Merge sort, efficient sorts |
| O(n²) | Quadratic | Nested loops, bubble sort |
| O(n³) | Cubic | Triple nested loops |
| O(2ⁿ) | Exponential | Subsets, recursive fibonacci |
| O(n!) | Factorial | Permutations |

## Growth Rate Comparison

For n = 1,000:

| Complexity | Operations | Feasible? |
|------------|------------|-----------|
| O(1) | 1 | ✅ Instant |
| O(log n) | 10 | ✅ Instant |
| O(n) | 1,000 | ✅ Instant |
| O(n log n) | 10,000 | ✅ Fast |
| O(n²) | 1,000,000 | ✅ ~1 second |
| O(n³) | 1,000,000,000 | ⚠️ ~15 minutes |
| O(2ⁿ) | 2^1000 | ❌ Heat death of universe |
| O(n!) | 1000! | ❌ Incomprehensible |

## Amortized Analysis

Some operations are expensive occasionally but cheap on average.

**Example: Python list.append()**

- Usually O(1) - just add to end
- Sometimes O(n) - when array needs to resize (copy all elements)
- But resizing doubles capacity, so it happens rarely
- **Amortized O(1)** - averaged over many operations

## Worked Examples

### Example 1: What's the complexity?

```python
def example(arr):
    n = len(arr)
    for i in range(n):           # O(n)
        for j in range(100):     # O(100) = O(1) - constant!
            print(arr[i])
```
**Answer:** O(n) × O(1) = **O(n)**

The inner loop is constant (always 100), not dependent on n.

### Example 2: What's the complexity?

```python
def example(arr):
    n = len(arr)
    for i in range(n):           # O(n)
        for j in range(i):       # O(i) on average = O(n/2) = O(n)
            print(arr[j])
```
**Answer:** O(n²)

Inner loop runs 0 + 1 + 2 + ... + (n-1) = n(n-1)/2 = **O(n²)**

### Example 3: What's the complexity?

```python
def example(n):
    i = n
    while i > 0:
        print(i)
        i = i // 2    # Halving each time
```
**Answer:** O(log n)

Halving means we go through log₂(n) iterations.

### Example 4: Recursion

```python
def example(n):
    if n <= 0:
        return
    print(n)
    example(n - 1)    # One recursive call
```
**Answer:** O(n) time, O(n) space (call stack)

### Example 5: Recursion with branching

```python
def example(n):
    if n <= 0:
        return
    example(n - 1)    # Two recursive calls
    example(n - 1)
```
**Answer:** O(2ⁿ) time, O(n) space

Each call spawns 2 more → exponential growth.

## Common Mistakes

1. **Confusing O(1) with "fast"**
   - O(1) just means constant, could be 1 billion operations

2. **Ignoring hidden loops**
   - `"abc" in long_string` is O(n×m), not O(1)
   - `list.copy()` is O(n), not O(1)

3. **Forgetting recursion stack space**
   - Recursive calls use O(depth) space

4. **Assuming hash operations are always O(1)**
   - Worst case (many collisions) is O(n)
   - We say O(1) *average case*

5. **Not considering input characteristics**
   - Quicksort is O(n²) worst case on sorted input
   - But O(n log n) average case

## Key Takeaways

1. Big O describes **worst-case growth rate**
2. Drop constants and lower-order terms
3. Nested loops multiply, sequential code adds
4. Logarithmic complexity comes from halving/doubling
5. Always consider both time AND space complexity
6. Know your language's built-in operation costs
