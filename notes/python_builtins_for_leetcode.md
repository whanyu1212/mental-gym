---
title: Python Built-in Functions & Operators for LeetCode
description: A comprehensive reference of Python built-in functions, data structures, and libraries commonly used in LeetCode problems.
category: Languages
order: 2
status: stable
tags:
  - python
  - leetcode
  - reference
---

# Python Built-in Functions & Operators for LeetCode

A comprehensive reference of Python built-ins commonly used in competitive programming and LeetCode problems.

---

## String Operations

### String Constants
```python
import string
string.ascii_lowercase  # 'abcdefghijklmnopqrstuvwxyz'
string.ascii_uppercase  # 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
string.digits           # '0123456789'
string.hexdigits        # '0123456789abcdefABCDEF'
```

### String Methods
- `s.split(sep)` - Split string by separator (default: whitespace)
- `s.join(iterable)` - Join iterable elements with separator `s`
- `s.strip()` / `s.lstrip()` / `s.rstrip()` - Remove whitespace
- `s.replace(old, new)` - Replace substring
- `s.find(sub)` - Return index of first occurrence (-1 if not found)
- `s.startswith(prefix)` / `s.endswith(suffix)` - Check prefix/suffix
- `s.isalpha()` / `s.isdigit()` / `s.isalnum()` - Character type checks
- `s.lower()` / `s.upper()` - Case conversion
- `s.count(sub)` - Count occurrences of substring

### Character-ASCII Conversion
- `ord(char)` - Get ASCII/Unicode code point of a character (e.g., `ord('a')` -> 97)
- `chr(code)` - Get character from ASCII/Unicode code point (e.g., `chr(97)` -> 'a')
- Common pattern: `ord(char) - ord('a')` maps 'a'-'z' to 0-25

**Character Counting Pattern for Lowercase Strings:**
```python
# Count frequency of each character 'a'-'z'
count = [0] * 26
for char in string:
    count[ord(char) - ord('a')] += 1
```

### String Formatting
```python
f"{value}"                    # f-strings (Python 3.6+)
"{:.2f}".format(3.14159)     # Format to 2 decimal places
```

---

## Sequence Operations

### List Methods
- `list.append(x)` - Add element to end (O(1))
- `list.pop()` / `list.pop(i)` - Remove and return last/i-th element
- `list.insert(i, x)` - Insert at index i (O(n))
- `list.remove(x)` - Remove first occurrence of x (O(n))
- `list.extend(iterable)` - Extend list (O(k) for k elements)
- `list.reverse()` - Reverse in-place
- `list.sort(key=None, reverse=False)` - Sort in-place
- `list.clear()` - Remove all elements
- `list.copy()` - Shallow copy
- `list.count(x)` - Count occurrences
- `list.index(x)` - Return index of first occurrence

### List Slicing
```python
lst[start:end]          # Elements from start to end-1
lst[start:]             # From start to end
lst[:end]               # From beginning to end-1
lst[:]                  # Shallow copy
lst[::step]             # Every step-th element
lst[::-1]               # Reverse (creates new list)
lst[start:end:step]     # General form
```

### List Initialization Pitfall (2D Arrays / Buckets)
Crucial for initializing hash table buckets (separate chaining) or graph adjacency lists.

```python
n = 5

# CORRECT: Creates n distinct empty lists
buckets = [[] for _ in range(n)]
buckets[0].append(1)
# Result: [[1], [], [], [], []] -> Independent lists

# WRONG: Creates n references to the SAME list object
buckets = [[]] * n
buckets[0].append(1)
# Result: [[1], [1], [1], [1], [1]] -> All point to the same list!
```

**Reason:** The `*` operator copies the *reference* of the mutable list `[]`, whereas the list comprehension executes the expression `[]` `n` times, creating `n` new lists.

---

## Built-in Functions for Iterables

### Aggregation
- `sum(iterable, start=0)` - Sum of elements
- `min(iterable)` / `max(iterable)` - Minimum/maximum element
- `min(iterable, key=func)` / `max(iterable, key=func)` - Min/max by custom key
- `len(iterable)` - Number of elements
- `all(iterable)` - True if all elements are truthy
- `any(iterable)` - True if any element is truthy

### Transformation
- `map(func, iterable)` - Apply function to each element (returns iterator)
- `filter(func, iterable)` - Filter elements (returns iterator)
- `zip(*iterables)` - Combine iterables element-wise (returns iterator)
- `enumerate(iterable, start=0)` - Pairs of (index, element)
- `reversed(sequence)` - Reverse iterator
- `sorted(iterable, key=None, reverse=False)` - Return sorted list

#### `zip()` Deep Dive
*(See previous notes for detailed examples)*

### Construction
- `list(iterable)` - Create list from iterable
- `tuple(iterable)` - Create tuple from iterable
- `set(iterable)` - Create set from iterable
- `dict(iterable)` / `dict(**kwargs)` - Create dictionary
- `range(stop)` / `range(start, stop, step)` - Integer sequence

---

## Math & Numbers

### Arithmetic Operators
```python
+, -, *, /              # Basic arithmetic
//                      # Integer division (floor division)
%                       # Modulo
**                      # Exponentiation
divmod(a, b)            # Returns (a // b, a % b)
```

### Standard Math Functions (`import math`)
```python
from math import ceil, floor, gcd, lcm, sqrt, log, log2, log10, inf, factorial, pow, pi

# Constants
inf, -inf                           # Infinity
pi                                  # 3.14159...

# Functions
ceil(x) / floor(x)                  # Rounding
gcd(a, b)                           # Greatest common divisor
lcm(a, b)                           # Least common multiple (Python 3.9+)
sqrt(x)                             # Square root
log(x, base=e)                      # Logarithm
log2(x) / log10(x)                  # Binary/decimal logarithm
factorial(n)                        # n!
abs(x)                              # Absolute value (built-in)
round(x, n)                         # Round to n places (built-in)
```

### Bitwise Operators
```python
&                       # AND
|                       # OR
^                       # XOR
~                       # NOT
<<                      # Left shift
>>                      # Right shift
bin(x)                  # Convert to binary string
hex(x)                  # Convert to hexadecimal string
```

---

## Advanced Data Structures & Algorithms

### `collections` Module
```python
from collections import Counter, defaultdict, deque, OrderedDict

# Counter - count hashable objects
counter = Counter([1, 2, 2, 3, 3, 3])
counter.most_common(n)              # n most common elements

# defaultdict - dict with default factory
dd = defaultdict(int)               # Default value 0
dd = defaultdict(list)              # Default value []

# deque - double-ended queue (O(1) append/pop on both ends)
dq = deque([1, 2, 3])
dq.append(x) / dq.appendleft(x)
dq.pop() / dq.popleft()
dq.rotate(n)                        # Rotate n steps right
```

### `heapq` Module (Min-Heap)
```python
from heapq import heappush, heappop, heapify, nlargest, nsmallest

heap = []                           # Use standard list
heappush(heap, item)                # Add item (min-heap)
smallest = heappop(heap)            # Remove and return smallest
heapify(list)                       # Convert list to heap in-place (O(n))

# Max-Heap Workaround: Negate values before pushing
heappush(heap, -value)
max_val = -heappop(heap)
```

### `bisect` Module (Binary Search)
```python
from bisect import bisect_left, bisect_right, insort

# Assume 'arr' is sorted
bisect_left(arr, x)                 # First index >= x (Lower Bound)
bisect_right(arr, x)                # First index > x (Upper Bound)
insort(arr, x)                      # Insert x keeping order

# Check existence
idx = bisect_left(arr, x)
if idx != len(arr) and arr[idx] == x:
    print("Found")
```

### `itertools` Module
```python
from itertools import accumulate, chain, combinations, permutations, product, groupby

accumulate(iterable)                # Prefix sums
chain(*iterables)                   # Flatten/combine
permutations(iter, r)               # Order matters
combinations(iter, r)               # Order doesn't matter
product(iter, repeat=n)             # Cartesian product
```

### `functools` Module
```python
from functools import lru_cache, reduce, cmp_to_key

@lru_cache(None)                    # Memoization for recursion
def fib(n): ...

sorted(items, key=cmp_to_key(func)) # Custom comparator
```

---

## Common Patterns

### Grid Traversal (Direction Arrays)
Crucial for BFS/DFS on 2D grids (matrices).

```python
rows, cols = len(grid), len(grid[0])
# Directions: Right, Down, Left, Up
directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]

for r in range(rows):
    for c in range(cols):
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                # Process neighbor (nr, nc)
                pass
```

### Recursion & Scoping
**`nonlocal`**: Required to modify a variable from the enclosing scope (outer function) inside a nested function (helper).

```python
def maxDepth(root):
    max_d = 0
    def dfs(node, depth):
        nonlocal max_d        # Declare intention to modify outer variable
        if not node: return
        max_d = max(max_d, depth)
        dfs(node.left, depth + 1)
        dfs(node.right, depth + 1)

    dfs(root, 1)
    return max_d
```

### Frequency Counter
```python
from collections import Counter
freq = Counter(nums)
```

### Two Pointers
```python
left, right = 0, len(arr) - 1
while left < right:
    # process
    left += 1
    right -= 1
```

### Sliding Window
```python
window = set()
left = 0
for right in range(len(arr)):
    while arr[right] in window:
        window.remove(arr[left])
        left += 1
    window.add(arr[right])
```

### Prefix Sum
```python
prefix = [0] * (n + 1)
for i in range(n):
    prefix[i + 1] = prefix[i] + arr[i]
# Sum of arr[i:j] = prefix[j] - prefix[i]
```

### Dictionary Default Value
```python
from collections import defaultdict
graph = defaultdict(list)           # Auto-initialize with []
count = defaultdict(int)            # Auto-initialize with 0
```

### Multiple Assignment
```python
a, b = b, a                         # Swap
x, y, z = [1, 2, 3]                 # Unpack
*rest, last = [1, 2, 3, 4]          # rest = [1, 2, 3], last = 4
```

### Comprehensions
```python
# List comprehension
[x**2 for x in range(10) if x % 2 == 0]

# Dict comprehension
{x: x**2 for x in range(5)}

# Set comprehension
{x % 3 for x in range(10)}

# Generator expression (memory efficient)
sum(x**2 for x in range(1000000))
```

---

## System & Recursion

### Recursion Limit
Python's default recursion limit is often 1000, which is too low for deep DFS problems (e.g., graphs/trees with 10^4 nodes).

```python
import sys
sys.setrecursionlimit(2000) # Increase limit
```

---

## Comparison & Logical Operators

```python
==, !=, <, <=, >, >=                # Comparison operators
is, is not                          # Identity operators
in, not in                          # Membership operators
and, or, not                        # Logical operators
```

---

## Type Checking

```python
type(obj)                           # Get type of object
isinstance(obj, class_or_tuple)     # Check instance
issubclass(class, classinfo)        # Check subclass
```

---

## Input/Output

```python
# Reading input (for Kattis/competitive programming)
line = input()                      # Read one line
lines = [input() for _ in range(n)] # Read n lines
n, m = map(int, input().split())    # Parse space-separated integers

# Printing
print(*values, sep=' ', end='\n')   # Print values
print(f"{x:.2f}")                   # Formatted output
```

---

## Performance Tips

1. **Use `in` with sets, not lists** - O(1) vs O(n) lookup
2. **Use `collections.Counter`** instead of manual dict counting
3. **Use `collections.deque`** for queue operations (not list)
4. **Use `bisect`** for binary search in sorted lists
5. **Use generators** for large sequences to save memory
6. **Use `str.join()`** instead of `+=` for string concatenation
7. **Use `tuple` as dict keys** when you need hashable sequences
8. **Cache recursive functions** with `@lru_cache`

---

## Quick Reference Card

| Task | Built-in/Method |
|------|----------------|
| Sort list in-place | `list.sort()` |
| Return sorted copy | `sorted(iterable)` |
| Reverse in-place | `list.reverse()` |
| Reverse copy | `list[::-1]` or `reversed()` |
| Count occurrences | `list.count(x)` or `Counter(list)` |
| Find index | `list.index(x)` |
| Remove duplicates | `list(set(iterable))` |
| Flatten 2D list | `sum(list2d, [])` or `chain.from_iterable()` |
| Check if all/any | `all(iterable)` / `any(iterable)` |
| Running sum | `itertools.accumulate()` |
| Pairwise iteration | `zip(lst, lst[1:])` |
| Cartesian product | `itertools.product()` |
| Binary search | `bisect.bisect_left()` |
| Min/max with key | `min(iter, key=func)` |

---
