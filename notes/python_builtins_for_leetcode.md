# Python Built-in Functions & Operators for LeetCode

A comprehensive reference of Python built-ins commonly used in competitive programming and LeetCode problems.

---

## String Operations

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
- `zip(*iterables)` - Combine iterables pairwise (returns iterator)
- `enumerate(iterable, start=0)` - Pairs of (index, element)
- `reversed(sequence)` - Reverse iterator
- `sorted(iterable, key=None, reverse=False)` - Return sorted list

### Construction
- `list(iterable)` - Create list from iterable
- `tuple(iterable)` - Create tuple from iterable
- `set(iterable)` - Create set from iterable
- `dict(iterable)` / `dict(**kwargs)` - Create dictionary
- `range(stop)` / `range(start, stop, step)` - Integer sequence

---

## Math & Numeric Operations

### Arithmetic Operators
```python
+, -, *, /              # Basic arithmetic
//                      # Integer division (floor division)
%                       # Modulo
**                      # Exponentiation
divmod(a, b)            # Returns (a // b, a % b)
```

### Math Functions
- `abs(x)` - Absolute value
- `pow(base, exp, mod=None)` - Power with optional modulo
- `round(x, ndigits=None)` - Round to n decimal places
- `int(x)` / `float(x)` - Type conversion

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

## Collections & Data Structures

### Dictionary Methods
- `dict.get(key, default=None)` - Get value with default
- `dict.setdefault(key, default=None)` - Get value, set if missing
- `dict.keys()` / `dict.values()` / `dict.items()` - View objects
- `dict.pop(key, default)` - Remove and return value
- `dict.update(other)` - Update with another dict
- `dict.clear()` - Remove all items
- `dict.copy()` - Shallow copy

### Set Operations
```python
s1 & s2                 # Intersection
s1 | s2                 # Union
s1 - s2                 # Difference
s1 ^ s2                 # Symmetric difference
s1.add(x)               # Add element
s1.remove(x)            # Remove element (raises KeyError if missing)
s1.discard(x)           # Remove element (no error if missing)
s1.issubset(s2)         # Check subset
s1.issuperset(s2)       # Check superset
```

---

## Standard Library - collections module

```python
from collections import Counter, defaultdict, deque, OrderedDict

# Counter - count hashable objects
counter = Counter([1, 2, 2, 3, 3, 3])
counter.most_common(n)              # n most common elements
counter[key]                        # Count of key (0 if missing)

# defaultdict - dict with default factory
dd = defaultdict(int)               # Default value 0
dd = defaultdict(list)              # Default value []
dd = defaultdict(set)               # Default value set()

# deque - double-ended queue
dq = deque([1, 2, 3])
dq.append(x)                        # Add to right (O(1))
dq.appendleft(x)                    # Add to left (O(1))
dq.pop()                            # Remove from right (O(1))
dq.popleft()                        # Remove from left (O(1))
dq.rotate(n)                        # Rotate n steps right

# OrderedDict - remembers insertion order (dict is ordered in Python 3.7+)
```

---

## Standard Library - heapq module

```python
from heapq import heappush, heappop, heapify, nlargest, nsmallest

heap = []
heappush(heap, item)                # Add item (min-heap)
smallest = heappop(heap)            # Remove and return smallest
heapify(list)                       # Convert list to heap in-place
nlargest(n, iterable, key=None)     # n largest elements
nsmallest(n, iterable, key=None)    # n smallest elements

# For max-heap, negate values:
heappush(heap, -value)
max_val = -heappop(heap)
```

---

## Standard Library - itertools module

```python
from itertools import (
    accumulate, chain, combinations, combinations_with_replacement,
    permutations, product, groupby, islice, count, cycle, repeat
)

# Infinite iterators
count(start=0, step=1)              # Infinite counter
cycle(iterable)                     # Repeat iterable infinitely
repeat(obj, times=None)             # Repeat object

# Combinatorics
permutations(iterable, r=None)      # All permutations
combinations(iterable, r)           # All r-length combinations
combinations_with_replacement(iterable, r)  # Combinations with replacement
product(*iterables, repeat=1)       # Cartesian product

# Utilities
accumulate(iterable, func=operator.add)  # Running totals (prefix sums)
chain(*iterables)                   # Flatten iterables
groupby(iterable, key=None)         # Group consecutive elements
islice(iterable, start, stop, step) # Slice iterator
```

---

## Standard Library - bisect module

```python
from bisect import bisect_left, bisect_right, insort

# Binary search in sorted list
bisect_left(arr, x)                 # Leftmost insertion point
bisect_right(arr, x)                # Rightmost insertion point
insort(arr, x)                      # Insert x in sorted order

# Usage for searching
i = bisect_left(arr, x)
if i != len(arr) and arr[i] == x:
    # x found at index i
```

---

## Standard Library - functools module

```python
from functools import lru_cache, reduce, cmp_to_key

# Memoization
@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

# Reduce
reduce(func, iterable, initializer=None)  # Apply func cumulatively
# Example: reduce(lambda x, y: x * y, [1, 2, 3, 4]) -> 24

# Custom sorting
sorted(items, key=cmp_to_key(compare_func))
```

---

## Standard Library - math module

```python
from math import ceil, floor, gcd, lcm, sqrt, log, log2, log10, inf, factorial

ceil(x)                             # Ceiling
floor(x)                            # Floor
gcd(a, b)                           # Greatest common divisor
lcm(a, b)                           # Least common multiple (Python 3.9+)
sqrt(x)                             # Square root
log(x, base=e)                      # Logarithm
log2(x) / log10(x)                  # Binary/decimal logarithm
inf                                 # Infinity
factorial(n)                        # n!
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

## Common Patterns

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
