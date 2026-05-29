---
title: Time Complexity Interview Questions & Cheat Sheet
description: A comprehensive guide to time complexity analysis for DSA interviews, covering common questions, patterns, and quick reference tables.
category: Complexity
---

# Time Complexity Interview Questions & Cheat Sheet

A comprehensive guide to time complexity analysis for DSA interviews, covering common questions, patterns, and quick reference tables.

---

## Table of Contents
1. [Quick Reference Tables](#quick-reference-tables)
2. [Common Interview Questions](#common-interview-questions)
3. [Pattern Recognition Guide](#pattern-recognition-guide)
4. [Tricky Cases & Gotchas](#tricky-cases--gotchas)
5. [Interview Strategies](#interview-strategies)

---

## Quick Reference Tables

### Data Structure Operations

| Data Structure | Access | Search | Insert | Delete | Space |
|----------------|--------|--------|--------|--------|-------|
| **Array** | O(1) | O(n) | O(n) | O(n) | O(n) |
| **Dynamic Array** | O(1) | O(n) | O(1)* | O(n) | O(n) |
| **Linked List** | O(n) | O(n) | O(1) | O(1) | O(n) |
| **Stack** | O(n) | O(n) | O(1) | O(1) | O(n) |
| **Queue** | O(n) | O(n) | O(1) | O(1) | O(n) |
| **Hash Table** | N/A | O(1)* | O(1)* | O(1)* | O(n) |
| **Binary Search Tree** | O(log n)* | O(log n)* | O(log n)* | O(log n)* | O(n) |
| **AVL Tree** | O(log n) | O(log n) | O(log n) | O(log n) | O(n) |
| **Binary Heap** | N/A | O(n) | O(log n) | O(log n) | O(n) |
| **Trie** | O(k) | O(k) | O(k) | O(k) | O(n*k) |

*Average case (worst case can differ)
k = key/word length

### Sorting Algorithms

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| **Bubble Sort** | O(n) | O(n²) | O(n²) | O(1) | Yes |
| **Selection Sort** | O(n²) | O(n²) | O(n²) | O(1) | No |
| **Insertion Sort** | O(n) | O(n²) | O(n²) | O(1) | Yes |
| **Merge Sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| **Quick Sort** | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| **Heap Sort** | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| **Counting Sort** | O(n+k) | O(n+k) | O(n+k) | O(k) | Yes |
| **Radix Sort** | O(d(n+k)) | O(d(n+k)) | O(d(n+k)) | O(n+k) | Yes |
| **Bucket Sort** | O(n+k) | O(n+k) | O(n²) | O(n) | Yes |

k = range of values, d = number of digits

### Graph Algorithms

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| **BFS** | O(V + E) | O(V) | Shortest path (unweighted) |
| **DFS** | O(V + E) | O(V) | Stack-based traversal |
| **Dijkstra** | O((V + E) log V) | O(V) | Shortest path (weighted, non-negative) |
| **Bellman-Ford** | O(V * E) | O(V) | Shortest path (handles negative weights) |
| **Floyd-Warshall** | O(V³) | O(V²) | All-pairs shortest path |
| **Prim's MST** | O(E log V) | O(V) | Minimum spanning tree |
| **Kruskal's MST** | O(E log E) | O(V) | Minimum spanning tree |
| **Topological Sort** | O(V + E) | O(V) | DAG ordering |
| **Union-Find** | O(α(n))* | O(n) | Disjoint sets |

V = vertices, E = edges, α = inverse Ackermann function (effectively constant)

---

## Common Interview Questions

### Question 1: "What's the time complexity of this code?"

```python
def example(arr):
    for i in range(len(arr)):          # O(n)
        for j in range(i + 1, len(arr)):  # O(n)
            print(arr[i], arr[j])
```

**Answer**: O(n²)
- Outer loop: n iterations
- Inner loop: (n-1) + (n-2) + ... + 1 = n(n-1)/2 iterations
- Total: O(n²)

**Follow-up**: "How would you optimize this?"
- Depends on the goal (e.g., if finding pairs, hash map might reduce to O(n))

---

### Question 2: "Binary search time complexity?"

**Answer**: O(log n)

**Why?**
- Each iteration cuts search space in half
- After k iterations: n/2^k elements remain
- When n/2^k = 1, we've found the element
- Solving: k = log₂(n)

**Follow-ups**:
- "What about space complexity?"
  - Iterative: O(1)
  - Recursive: O(log n) due to call stack
- "When does it become O(n)?"
  - Unbalanced/unsorted data, or degenerate BST

---

### Question 3: "Explain O(n log n)"

**Answer**: Common in efficient sorting (merge sort, heap sort)

**Intuition**:
- Divide problem into log n levels (divide-and-conquer)
- At each level, do O(n) work
- Total: O(n) * O(log n) = O(n log n)

**Example**: Merge sort
```
Level 0: [8,3,5,4,7,2,1,6]           - O(n) merge work
         /                \
Level 1: [8,3,5,4]    [7,2,1,6]      - O(n) merge work
         /    \        /    \
Level 2: [8,3] [5,4]  [7,2] [1,6]    - O(n) merge work
         ...
         (log n levels total)
```

---

### Question 4: "What's the difference between O(2n) and O(n)?"

**Answer**: They're the same: O(n)

**Why?**
- Big-O ignores constants
- Focus: growth rate, not exact operations
- O(2n) = O(n), O(n/2) = O(n), O(100n) = O(n)

**When constants matter**:
- Real-world performance optimization
- Comparing algorithms with same Big-O
- Cache efficiency, memory access patterns

---

### Question 5: "Two nested loops always O(n²)?"

**Answer**: Not always! Depends on iteration counts.

**Examples**:

```python
# O(n²) - both loops depend on n
for i in range(n):
    for j in range(n):
        print(i, j)

# O(n) - inner loop is constant
for i in range(n):
    for j in range(10):  # Always 10 iterations
        print(i, j)

# O(n log n) - inner loop decreases exponentially
for i in range(n):
    j = i
    while j > 0:
        print(j)
        j //= 2  # Halves each time
```

---

### Question 6: "Recursive Fibonacci time complexity?"

```python
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)
```

**Answer**: O(2^n)

**Why?**
- Each call spawns 2 more calls (except base case)
- Forms binary tree of depth n
- Total calls: ~2^n

**Recurrence relation**: T(n) = T(n-1) + T(n-2) + O(1) ≈ O(2^n)

**Optimization**:
- Memoization: O(n) time, O(n) space
- Iteration: O(n) time, O(1) space

---

### Question 7: "Hash table lookup is O(1), always?"

**Answer**: Average O(1), worst O(n)

**Why worst case O(n)?**
- Hash collisions → all n keys map to same bucket
- Linked list traversal in bucket
- Rare with good hash function, but possible

**Follow-up**: "How to ensure O(1)?"
- Use good hash function (uniform distribution)
- Maintain low load factor (resize when needed)
- Perfect hashing (theory)

---

### Question 8: "What's space complexity of recursion?"

**Answer**: O(max recursion depth)

**Examples**:

```python
# O(n) space - linear recursion depth
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)  # Max depth: n

# O(log n) space - binary tree depth
def binary_search(arr, target, left, right):
    if left > right:
        return -1
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search(arr, target, mid+1, right)
    else:
        return binary_search(arr, target, left, mid-1)

# O(n) space - tree with n nodes (worst case)
def tree_height(node):
    if not node:
        return 0
    return 1 + max(tree_height(node.left), tree_height(node.right))
```

---

### Question 9: "Analyzing this code?"

```python
def mystery(n):
    count = 0
    i = n
    while i > 0:
        i //= 2
        count += 1
    return count
```

**Answer**: O(log n)

**Analysis**:
- Loop divides i by 2 each iteration
- Stops when i reaches 0
- Iterations: log₂(n)

**Pattern**: Division/multiplication by constant → logarithmic

---

### Question 10: "Master Theorem application?"

**Given**: T(n) = 2T(n/2) + O(n)

**Answer**: O(n log n)

**Master Theorem**:
- T(n) = aT(n/b) + f(n)
- Here: a=2, b=2, f(n)=O(n)
- n^(log_b(a)) = n^(log_2(2)) = n^1 = n
- Since f(n) = Θ(n^(log_b(a))), case 2 applies
- **Result**: T(n) = Θ(n log n)

**Common recurrences**:
- T(n) = T(n/2) + O(1) → O(log n) (binary search)
- T(n) = 2T(n/2) + O(n) → O(n log n) (merge sort)
- T(n) = T(n-1) + O(1) → O(n) (linear recursion)

---

## Pattern Recognition Guide

### Logarithmic O(log n)
**Patterns**:
- Dividing problem size by constant each step
- Binary search, tree height
- Powers of 2: 1, 2, 4, 8, 16...

**Code signals**:
```python
while i > 0:
    i //= 2  # or i *= 2, or i = i >> 1

# Binary search
mid = (left + right) // 2
```

---

### Linear O(n)
**Patterns**:
- Single pass through data
- Constant work per element

**Code signals**:
```python
for item in collection:
    # O(1) operation

for i in range(n):
    if condition:  # O(1) check
        result.append(i)
```

---

### Linearithmic O(n log n)
**Patterns**:
- Divide-and-conquer with O(n) merge
- Efficient sorting algorithms

**Code signals**:
```python
# Merge sort structure
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])    # T(n/2)
    right = merge_sort(arr[mid:])   # T(n/2)
    return merge(left, right)        # O(n)
```

---

### Quadratic O(n²)
**Patterns**:
- Nested loops over same data
- Comparing all pairs

**Code signals**:
```python
for i in range(n):
    for j in range(n):  # Both loops n times
        # O(1) operation

# Or
for i in range(n):
    for j in range(i, n):  # Triangle: n(n+1)/2 = O(n²)
        # O(1) operation
```

---

### Exponential O(2^n)
**Patterns**:
- Recursive branching (each call spawns 2+ calls)
- Generating all subsets/permutations

**Code signals**:
```python
def recursive(n):
    if n <= 0:
        return
    recursive(n-1)  # Branch 1
    recursive(n-1)  # Branch 2
```

---

## Tricky Cases & Gotchas

### 1. Amortized Analysis

**Question**: "Dynamic array append is O(1) or O(n)?"

**Answer**: O(1) amortized, O(n) worst case

**Explanation**:
- Most appends: O(1) (add to end)
- Resize (when full): O(n) (copy all elements)
- Resize happens rarely (e.g., every doubling)
- Over n operations: total O(n), average O(1)

---

### 2. String Concatenation in Loops

```python
# O(n²) - string immutable, creates new string each time
result = ""
for i in range(n):
    result += str(i)  # O(len(result)) each iteration

# O(n) - list append O(1), join O(n) once
result = []
for i in range(n):
    result.append(str(i))
final = "".join(result)
```

---

### 3. Slice Operations

```python
# O(k) where k = slice size
arr[i:j]  # Creates new array of size j-i

# Common mistake: O(n²) due to slicing in loop
for i in range(n):
    process(arr[i:])  # O(n-i) each iteration → O(n²) total
```

---

### 4. Set/Dict Operations

```python
# O(1) average, O(n) worst
x in my_set
my_dict[key]

# O(n) - iterating
for item in my_set:
    pass

# O(n) - set operations
set1.union(set2)
set1.intersection(set2)
```

---

### 5. Sorting Already Sorted Data

| Algorithm | Random | Already Sorted |
|-----------|--------|----------------|
| Quick Sort | O(n log n) | O(n²)* |
| Merge Sort | O(n log n) | O(n log n) |
| Insertion Sort | O(n²) | O(n) |
| Tim Sort (Python) | O(n log n) | O(n) |

*Without randomized pivot selection

---

### 6. Tree Traversal Space

```python
# Recursive: O(h) space where h = tree height
def inorder(node):
    if not node:
        return
    inorder(node.left)
    print(node.val)
    inorder(node.right)

# Best case: h = log n (balanced tree)
# Worst case: h = n (skewed tree)
```

---

## Interview Strategies

### Step 1: Clarify the Problem
- Input size/constraints
- Expected output
- Edge cases

### Step 2: Analyze Brute Force
- What's the naive O(n²) or O(n³) solution?
- Establishes baseline complexity

### Step 3: Identify Bottlenecks
- What operation is repeated?
- Can we cache results?
- Can we use better data structure?

### Step 4: Optimize
Common optimizations:
- **O(n²) → O(n log n)**: Sorting
- **O(n²) → O(n)**: Hash map/set
- **O(n) → O(log n)**: Binary search (if sorted)
- **O(2^n) → O(n)**: Dynamic programming

### Step 5: Trade-offs
- Time vs space
- Average vs worst case
- Simplicity vs performance

### Step 6: Communicate Clearly
- State assumptions
- Walk through examples
- Explain why, not just what

---

## Quick Interview Checklist

**Before coding**:
- [ ] What's the brute force approach?
- [ ] What's its time/space complexity?
- [ ] Can I sort the data? (often helps)
- [ ] Can I use hash map/set? (O(1) lookup)
- [ ] Is this a known pattern? (two pointers, sliding window, etc.)

**After coding**:
- [ ] What's the time complexity? (worst & average)
- [ ] What's the space complexity?
- [ ] Are there edge cases? (empty input, single element, duplicates)
- [ ] Can I optimize further?

---

## Common Mistakes to Avoid

1. **Ignoring hidden complexity**
   - `arr.sort()` is O(n log n), not O(1)
   - `list.remove(x)` is O(n), not O(1)
   - String operations are often O(n)

2. **Confusing average vs worst case**
   - Hash table: O(1) average, O(n) worst
   - Quick sort: O(n log n) average, O(n²) worst

3. **Forgetting space complexity**
   - Recursion uses O(depth) space
   - Hash maps use O(n) space

4. **Overcounting constants**
   - O(2n) = O(n), not O(2n)
   - O(n + 100) = O(n), not O(n + 100)

5. **Not considering input characteristics**
   - Already sorted → insertion sort is O(n)
   - Small range → counting sort is O(n)

---

## Practice Problems by Complexity

### O(1) - Constant
- Array access by index
- Hash table insert/lookup (average)
- Math formulas (sum of 1..n = n(n+1)/2)

### O(log n) - Logarithmic
- Binary search
- Balanced BST operations
- Finding power of number

### O(n) - Linear
- Single array scan
- Hash table building
- Two pointers technique

### O(n log n) - Linearithmic
- Merge sort / Quick sort
- Sorting then processing
- Heap-based algorithms

### O(n²) - Quadratic
- Bubble/Selection/Insertion sort
- Checking all pairs
- Naive string matching

### O(2^n) - Exponential
- Recursive Fibonacci
- Generating all subsets
- Backtracking without pruning

### O(n!) - Factorial
- Generating all permutations
- Traveling salesman (brute force)
- N-queens without optimization

---

## Resources for Further Study

1. **Books**:
   - "Introduction to Algorithms" (CLRS)
   - "The Algorithm Design Manual" (Skiena)

2. **Online**:
   - [Big-O Cheat Sheet](https://www.bigocheatsheet.com/)
   - LeetCode Discuss - complexity analysis posts
   - GeeksforGeeks - time complexity articles

3. **Practice**:
   - LeetCode (tag: time-complexity)
   - HackerRank (algorithm challenges)
   - Codeforces (competitive programming)

---

**Last Updated**: January 2026
**Maintained by**: Hanyu Wu
