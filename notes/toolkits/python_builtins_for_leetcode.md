---
title: Python Standard Library for DSA
slug: python_builtins_for_leetcode
description: A module-oriented reference for Python core types, built-in functions, and standard-library APIs commonly used in DSA problems.
category: Languages
order: 2
status: stable
tags:
  - python
  - dsa
  - standard-library
  - reference
---

# Python Standard Library for DSA

Use this note when you already know which Python tool you need and want its syntax, methods, return behavior, or important gotchas.

> **Choose your reference**
>
> - Choosing a tool → [Python DSA Quick Reference](../python-dsa-toolkit/)
> - Looking up syntax and APIs → **Python Standard Library for DSA** (this note)
> - Checking operation costs → [Python Big O Cheatsheet](../python-big-o-cheatsheet/)

This reference is organized by Python type and standard-library module. Algorithm templates and pattern recognition live in the quick reference and dedicated Pattern notes.

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

### Check yourself

1. Predict: `"a,b,,c".split(",")` and `" a  b ".split()`
2. `"banana".find("x")` returns `-1`. What does `"banana".index("x")` do?
3. Predict: `chr(ord("a") + 25)`

<details>
<summary>Answer</summary>

1. `["a", "b", "", "c"]` and `["a", "b"]`. With an explicit separator you get an empty string between the two commas. With no argument, `split` treats any run of whitespace as one separator and ignores leading and trailing space.
2. It raises `ValueError`. Use `find` when "not found" is a normal outcome.
3. `"z"`

</details>

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

### Check yourself

1. `lst = [1, 2, 3, 4, 5]`. Predict `lst[1:4]` and `lst[::-2]`.
2. Spot the bug: `ordered = nums.sort()`
3. Predict: `lst = [1, 2, 3, 2]; lst.remove(2); print(lst)`

<details>
<summary>Answer</summary>

1. `[2, 3, 4]` and `[5, 3, 1]`
2. `list.sort()` sorts in place and returns `None`, so `ordered` is `None`. Use `ordered = sorted(nums)` to keep `nums` unchanged, or call `nums.sort()` on its own line.
3. `[1, 3, 2]`. `remove` deletes only the first match.

</details>

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

### Check yourself

1. Predict: `max(["pear", "fig", "banana"], key=len)`
2. Predict: `list(zip([1, 2, 3], "ab"))`
3. What are `any([])` and `all([])`?

<details>
<summary>Answer</summary>

1. `"banana"`
2. `[(1, "a"), (2, "b")]`. `zip` stops at the shortest input.
3. `False` and `True`. No element is truthy, and no element is falsy.

</details>

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

### Check yourself

1. Predict: `-7 // 2`, `-7 % 3`, `divmod(17, 5)`
2. Predict: `5 & 3`, `5 ^ 3`, `1 << 4`
3. `bin(10)` returns `"0b1010"`. How do you get just `"1010"`?

<details>
<summary>Answer</summary>

1. `-4`, `2`, `(3, 2)`. `//` rounds toward negative infinity, and `%` takes the sign of the divisor.
2. `1`, `6`, `16`
3. `bin(10)[2:]`, or `format(10, "b")`.

</details>

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

### Check yourself

1. Predict: `Counter("banana").most_common(1)`
2. Predict: `dq = deque([1, 2, 3]); dq.rotate(1); print(dq)`
3. `arr = [1, 3, 3, 5]`. After `insort(arr, 3)`, what is `bisect_right(arr, 3)`?
4. You need the 3 largest values of a list. Which one call does it?

<details>
<summary>Answer</summary>

1. `[("a", 3)]`
2. `deque([3, 1, 2])`. `rotate(1)` moves the last item to the front.
3. `4`. `arr` is now `[1, 3, 3, 3, 5]`, and the first index past the 3s is 4.
4. `heapq.nlargest(3, nums)`

</details>

---

## Core Python Idioms

These are language features rather than algorithm patterns.

### Recursion & Scoping

Use `nonlocal` to rebind a variable from an enclosing function:

```python
def max_depth(root):
    maximum = 0

    def dfs(node, depth):
        nonlocal maximum
        if node is None:
            return
        maximum = max(maximum, depth)
        dfs(node.left, depth + 1)
        dfs(node.right, depth + 1)

    dfs(root, 1)
    return maximum
```

### Multiple Assignment

```python
a, b = b, a                         # Swap
x, y, z = [1, 2, 3]                # Unpack
*rest, last = [1, 2, 3, 4]         # rest = [1, 2, 3], last = 4
```

### Comprehensions and Generators

```python
[x**2 for x in range(10) if x % 2 == 0]
{x: x**2 for x in range(5)}
{x % 3 for x in range(10)}
sum(x**2 for x in range(1_000_000))
```

For task-to-tool choices and compact DSA idioms, use [Python DSA Quick Reference](../python-dsa-toolkit/).

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

## See Also

- [Python DSA Quick Reference](../python-dsa-toolkit/) — task-to-tool decisions and minimal idioms
- [Python Big O Cheatsheet](../python-big-o-cheatsheet/) — operation costs and performance trade-offs
- [TypeScript Standard Library for DSA](../typescript-standard-library/) — the same reference for TypeScript
- [Rust Standard Library for DSA](../rust-standard-library/) — the same reference for Rust
- [Two Pointers](../two_pointers/) — pointer invariants and movement rules
- [Arrays & Hashing](../arrays_and_hashing/) — lookup, counting, and grouping patterns

---
