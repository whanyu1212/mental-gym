# Python Big O Cheatsheet

Quick reference for time complexity of common Python operations.

## List Operations

| Operation | Average Case | Worst Case | Notes |
|-----------|--------------|------------|-------|
| `list[i]` | O(1) | O(1) | Index access |
| `list[i] = x` | O(1) | O(1) | Index assignment |
| `list.append(x)` | O(1) | O(1) | Amortized |
| `list.pop()` | O(1) | O(1) | Remove from end |
| `list.pop(i)` | O(n) | O(n) | Remove from middle shifts elements |
| `list.insert(i, x)` | O(n) | O(n) | Shifts elements right |
| `list.remove(x)` | O(n) | O(n) | Search + shift |
| `list.index(x)` | O(n) | O(n) | Linear search |
| `x in list` | O(n) | O(n) | Linear search |
| `list.count(x)` | O(n) | O(n) | Full scan |
| `list.reverse()` | O(n) | O(n) | In-place |
| `list.sort()` | O(n log n) | O(n log n) | Timsort |
| `sorted(list)` | O(n log n) | O(n log n) | Creates new list |
| `list.copy()` | O(n) | O(n) | Shallow copy |
| `list[a:b]` | O(b-a) | O(b-a) | Slice creates copy |
| `list.extend(other)` | O(k) | O(k) | k = len(other) |
| `list + other` | O(n+k) | O(n+k) | Creates new list |
| `list * k` | O(n*k) | O(n*k) | Creates new list |
| `len(list)` | O(1) | O(1) | Stored attribute |
| `min(list)` / `max(list)` | O(n) | O(n) | Full scan |

### List Gotchas

```python
# BAD: O(n) each time - shifts all elements
for item in items:
    my_list.insert(0, item)  # O(n²) total!

# GOOD: O(1) each time
for item in items:
    my_list.append(item)  # O(n) total
my_list.reverse()  # O(n)

# BAD: O(n) membership check
if x in my_list:  # Linear search
    ...

# GOOD: O(1) membership check
my_set = set(my_list)  # O(n) once
if x in my_set:  # O(1) lookup
    ...
```

## Dictionary Operations

| Operation | Average Case | Worst Case | Notes |
|-----------|--------------|------------|-------|
| `dict[key]` | O(1) | O(n) | Get item |
| `dict[key] = value` | O(1) | O(n) | Set item |
| `key in dict` | O(1) | O(n) | Membership |
| `dict.get(key)` | O(1) | O(n) | Get with default |
| `dict.pop(key)` | O(1) | O(n) | Remove item |
| `dict.keys()` | O(1) | O(1) | Returns view |
| `dict.values()` | O(1) | O(1) | Returns view |
| `dict.items()` | O(1) | O(1) | Returns view |
| `len(dict)` | O(1) | O(1) | Stored attribute |
| `dict.copy()` | O(n) | O(n) | Shallow copy |
| `dict.update(other)` | O(k) | O(k*n) | k = len(other) |

**Note:** Worst case O(n) happens with hash collisions (rare with good hash functions).

### Dictionary Iteration

```python
for key in dict:           # O(n) - iterates keys
for key in dict.keys():    # O(n) - same as above
for val in dict.values():  # O(n) - iterates values
for k, v in dict.items():  # O(n) - iterates pairs
```

## Set Operations

| Operation | Average Case | Worst Case | Notes |
|-----------|--------------|------------|-------|
| `x in set` | O(1) | O(n) | Membership |
| `set.add(x)` | O(1) | O(n) | Add element |
| `set.remove(x)` | O(1) | O(n) | Remove (raises if missing) |
| `set.discard(x)` | O(1) | O(n) | Remove (no error if missing) |
| `set.pop()` | O(1) | O(1) | Remove arbitrary element |
| `set.copy()` | O(n) | O(n) | Shallow copy |
| `len(set)` | O(1) | O(1) | Stored attribute |
| `set1 \| set2` | O(n+m) | O(n+m) | Union |
| `set1 & set2` | O(min(n,m)) | O(n*m) | Intersection |
| `set1 - set2` | O(n) | O(n) | Difference |
| `set1 ^ set2` | O(n+m) | O(n+m) | Symmetric difference |
| `set1 <= set2` | O(n) | O(n) | Subset check |

### Set Use Cases

```python
# Finding duplicates - O(n)
def has_duplicates(arr):
    return len(arr) != len(set(arr))

# Finding common elements - O(n + m)
common = set(list1) & set(list2)

# Removing duplicates while preserving order - O(n)
def unique_ordered(arr):
    seen = set()
    result = []
    for x in arr:
        if x not in seen:
            seen.add(x)
            result.append(x)
    return result
```

## String Operations

| Operation | Time | Notes |
|-----------|------|-------|
| `s[i]` | O(1) | Index access |
| `s[a:b]` | O(b-a) | Slice creates new string |
| `len(s)` | O(1) | Stored attribute |
| `s + t` | O(n+m) | Creates new string |
| `s * k` | O(n*k) | Creates new string |
| `x in s` | O(n*m) | Substring search |
| `s.find(x)` | O(n*m) | Substring search |
| `s.split()` | O(n) | Creates list of strings |
| `s.join(list)` | O(n) | n = total chars |
| `s.replace(a, b)` | O(n) | Creates new string |
| `s.lower()` / `s.upper()` | O(n) | Creates new string |
| `s.strip()` | O(n) | Creates new string |
| `s.startswith(x)` | O(k) | k = len(x) |

### String Gotchas

```python
# BAD: O(n²) - creates new string each iteration
result = ""
for char in chars:
    result += char  # Each += is O(current length)

# GOOD: O(n) - single allocation
result = ''.join(chars)

# BAD: O(n*m) for each check
for word in words:
    if word in long_string:  # O(n*m) each time
        ...

# GOOD: Use set for multiple lookups
word_set = set(words)  # O(total chars in words)
# Then do single pass of long_string
```

## Deque Operations (collections.deque)

| Operation | Time | Notes |
|-----------|------|-------|
| `deque.append(x)` | O(1) | Add to right |
| `deque.appendleft(x)` | O(1) | Add to left |
| `deque.pop()` | O(1) | Remove from right |
| `deque.popleft()` | O(1) | Remove from left |
| `deque[i]` | O(n) | Index access (not O(1)!) |
| `len(deque)` | O(1) | Stored attribute |
| `deque.rotate(k)` | O(k) | Rotate elements |

**When to use deque vs list:**
- Need fast append/pop from both ends → `deque`
- Need fast random access by index → `list`

## Heap Operations (heapq)

| Operation | Time | Notes |
|-----------|------|-------|
| `heapq.heappush(h, x)` | O(log n) | Add element |
| `heapq.heappop(h)` | O(log n) | Remove smallest |
| `heapq.heapify(list)` | O(n) | Convert list to heap |
| `heapq.heappushpop(h, x)` | O(log n) | Push then pop |
| `heapq.nlargest(k, iter)` | O(n log k) | Get k largest |
| `heapq.nsmallest(k, iter)` | O(n log k) | Get k smallest |
| `h[0]` | O(1) | Peek at smallest |

```python
import heapq

# Min heap (default)
heap = []
heapq.heappush(heap, 3)
heapq.heappush(heap, 1)
heapq.heappush(heap, 2)
smallest = heapq.heappop(heap)  # Returns 1

# Max heap (negate values)
max_heap = []
heapq.heappush(max_heap, -3)
heapq.heappush(max_heap, -1)
largest = -heapq.heappop(max_heap)  # Returns 3
```

## Sorting Comparison

| Method | Time | Space | Stable? | Notes |
|--------|------|-------|---------|-------|
| `list.sort()` | O(n log n) | O(n) | Yes | In-place (modifies list) |
| `sorted(iter)` | O(n log n) | O(n) | Yes | Returns new list |
| `heapq.nsmallest(k, iter)` | O(n log k) | O(k) | No | Best when k << n |

## Common Patterns Summary

### O(1) - Constant
```python
arr[i]              # Array access
dict[key]           # Hash lookup
set.add(x)          # Set add
len(collection)     # Length check
```

### O(n) - Linear
```python
x in list           # List membership
list.copy()         # Copying
max(list)           # Finding max/min
''.join(list)       # String building
for x in collection # Iteration
```

### O(n log n) - Linearithmic
```python
sorted(list)        # Sorting
list.sort()         # In-place sort
```

### O(n²) - Quadratic (Usually avoid!)
```python
# Nested loops over same collection
for i in arr:
    for j in arr:
        ...

# Repeated string concatenation
s = ""
for x in arr:
    s += str(x)  # Use ''.join() instead
```

## Quick Decision Guide

| Need to... | Use | Time |
|------------|-----|------|
| Check membership | `set` | O(1) |
| Count occurrences | `collections.Counter` | O(n) to build, O(1) to query |
| Get k smallest/largest | `heapq.nsmallest/nlargest` | O(n log k) |
| Queue (FIFO) | `collections.deque` | O(1) for both ends |
| Stack (LIFO) | `list` with append/pop | O(1) |
| Sorted container | `sortedcontainers.SortedList` | O(log n) insert |
| Default values | `collections.defaultdict` | O(1) |
| Preserve insertion order | `dict` (Python 3.7+) | O(1) |
