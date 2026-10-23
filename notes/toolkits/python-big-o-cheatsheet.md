---
title: Python Big O Cheatsheet
slug: python-big-o-cheatsheet
description: A quick reference for the time complexity of common Python operations across Lists, Dictionaries, Sets, Strings, Deques, and Heaps.
category: Languages
order: 3
status: stable
tags:
  - python
  - complexity
  - reference
---

# Python Big O Cheatsheet

Use this note to check the time and space cost of Python operations. It is the performance reference—not an API guide or algorithm-pattern tutorial.

> **Choose your reference**
>
> - Choosing a tool → [Python DSA Quick Reference](../python-dsa-toolkit/)
> - Looking up syntax and APIs → [Python Standard Library for DSA](../python_builtins_for_leetcode/)
> - Checking operation costs → **Python Big O Cheatsheet** (this note)

## List Operations

Lists in Python are implemented as dynamic arrays. This means they excel at random access and appending to the end, but struggle with operations that require shifting elements (like inserting at the beginning).

| Operation | Average Case | Worst Case | Notes |
|-----------|--------------|------------|-------|
| `list[i]` | $O(1)$ | $O(1)$ | Index access |
| `list[i] = x` | $O(1)$ | $O(1)$ | Index assignment |
| `list.append(x)` | $O(1)$ | $O(1)$ | Amortized (resizes under the hood) |
| `list.pop()` | $O(1)$ | $O(1)$ | Remove from end |
| `list.pop(i)` | $O(n)$ | $O(n)$ | Removing from middle shifts elements |
| `list.insert(i, x)` | $O(n)$ | $O(n)$ | Inserting at middle/start shifts elements right |
| `list.remove(x)` | $O(n)$ | $O(n)$ | Linear search + shift elements |
| `list.index(x)` | $O(n)$ | $O(n)$ | Linear search |
| `x in list` | $O(n)$ | $O(n)$ | Linear search |
| `list.count(x)` | $O(n)$ | $O(n)$ | Full linear scan |
| `list.reverse()` | $O(n)$ | $O(n)$ | In-place reverse |
| `list.sort()` | $O(n \log n)$ | $O(n \log n)$ | Timsort (in-place) |
| `sorted(list)` | $O(n \log n)$ | $O(n \log n)$ | Timsort (creates new list) |
| `list.copy()` | $O(n)$ | $O(n)$ | Shallow copy |
| `list[a:b]` | $O(b-a)$ | $O(b-a)$ | Slicing creates a new list copy |
| `list.extend(other)` | $O(k)$ | $O(k)$ | `k` = len(other) |
| `list + other` | $O(n+k)$ | $O(n+k)$ | Creates new list |
| `list * k` | $O(n \cdot k)$ | $O(n \cdot k)$ | Creates new list |
| `len(list)` | $O(1)$ | $O(1)$ | Python stores the length internally |
| `min(list)` / `max(list)` | $O(n)$ | $O(n)$ | Full linear scan |

### List Gotchas

```python
# BAD: $O(n)$ each time - shifts all elements
for item in items:
    my_list.insert(0, item)  # $O(n^2)$ total!

# GOOD: $O(1)$ each time
for item in items:
    my_list.append(item)  # $O(n)$ total
my_list.reverse()  # $O(n)$

# BAD: $O(n)$ membership check
if x in my_list:  # Linear search
    ...

# GOOD: $O(1)$ membership check
my_set = set(my_list)  # $O(n)$ once to build
if x in my_set:  # $O(1)$ lookup
    ...
```

### Check yourself

1. What does this cost for `q` queries against a list of `n` numbers, and how do you fix it?

   ```python
   hits = [x for x in queries if x in nums]
   ```

2. What does `result = result + [x]` inside a loop over `n` items cost in total?
3. What do `lst[::-1]` and `lst.reverse()` each cost in time and extra space?

<details>
<summary>Answer</summary>

1. O(q · n), because each `in` scans the list. Build `num_set = set(nums)` once, which is O(n), and then each check is O(1) on average, for O(n + q) in total.
2. O(n²). `+` builds a new list each time. `result.append(x)` makes it O(n) in total.
3. Both take O(n) time. The slice builds a new list, so it uses O(n) extra space. `reverse()` works in place with O(1) extra space.

</details>

## Dictionary Operations

Dictionaries are implemented as Hash Tables. They provide incredible $O(1)$ average lookup and insertion speeds.

| Operation | Average Case | Worst Case | Notes |
|-----------|--------------|------------|-------|
| `dict[key]` | $O(1)$ | $O(n)$ | Get item |
| `dict[key] = value` | $O(1)$ | $O(n)$ | Set item |
| `key in dict` | $O(1)$ | $O(n)$ | Membership (checks keys only) |
| `dict.get(key)` | $O(1)$ | $O(n)$ | Get with default |
| `dict.pop(key)` | $O(1)$ | $O(n)$ | Remove item |
| `dict.keys()` | $O(1)$ | $O(1)$ | Returns view |
| `dict.values()` | $O(1)$ | $O(1)$ | Returns view |
| `dict.items()` | $O(1)$ | $O(1)$ | Returns view |
| `len(dict)` | $O(1)$ | $O(1)$ | Stored attribute |
| `dict.copy()` | $O(n)$ | $O(n)$ | Shallow copy |
| `dict.update(other)` | $O(k)$ | $O(k \cdot n)$ | `k` = len(other) |

**Note:** Worst-case $O(n)$ happens when there are heavy hash collisions, causing elements to degrade into a linked list or linear probing chain. This is extremely rare in practice with Python's built-in hashing.

### Dictionary Iteration

```python
for key in dict:           # $O(n)$ - iterates keys
for key in dict.keys():    # $O(n)$ - same as above
for val in dict.values():  # $O(n)$ - iterates values
for k, v in dict.items():  # $O(n)$ - iterates pairs
```

## Set Operations

Sets are implemented under the hood exactly like dictionaries, but without the values. They are your go-to data structure for deduplication and rapid membership checking.

| Operation | Average Case | Worst Case | Notes |
|-----------|--------------|------------|-------|
| `x in set` | $O(1)$ | $O(n)$ | Membership |
| `set.add(x)` | $O(1)$ | $O(n)$ | Add element |
| `set.remove(x)` | $O(1)$ | $O(n)$ | Remove (raises `KeyError` if missing) |
| `set.discard(x)` | $O(1)$ | $O(n)$ | Remove (no error if missing) |
| `set.pop()` | $O(1)$ | $O(1)$ | Remove arbitrary element |
| `set.copy()` | $O(n)$ | $O(n)$ | Shallow copy |
| `len(set)` | $O(1)$ | $O(1)$ | Stored attribute |
| `set1 \| set2` | $O(n+m)$ | $O(n+m)$ | Union (`n = len(set1)`, `m = len(set2)`) |
| `set1 & set2` | $O(\min(n,m))$ | $O(n \cdot m)$ | Intersection |
| `set1 - set2` | $O(n)$ | $O(n)$ | Difference |
| `set1 ^ set2` | $O(n+m)$ | $O(n+m)$ | Symmetric difference |
| `set1 <= set2` | $O(n)$ | $O(n)$ | Subset check |

### Set Use Cases

```python
# Finding duplicates - $O(n)$
def has_duplicates(arr):
    return len(arr) != len(set(arr))

# Finding common elements - $O(n + m)$
common = set(list1) & set(list2)

# Removing duplicates while preserving order - $O(n)$
def unique_ordered(arr):
    seen = set()
    result = []
    for x in arr:
        if x not in seen:
            seen.add(x)
            result.append(x)
    return result
```

### Check yourself

1. What do time and space cost for `has_duplicates` above?
2. Why can a `dict` lookup be O(n) in the worst case?
3. You need to remove arbitrary items from a set that may not contain them. Which method avoids an exception?

<details>
<summary>Answer</summary>

1. O(n) average time to build the set, and O(n) extra space for it.
2. If many keys hash to the same slot, a lookup has to probe past all of them. Python's hashing makes that rare in practice.
3. `set.discard(x)`. `set.remove(x)` raises `KeyError` when `x` is missing.

</details>

## String Operations

Strings in Python are immutable sequences of characters. Modifying a string always results in allocating a brand new string.

| Operation | Time | Notes |
|-----------|------|-------|
| `s[i]` | $O(1)$ | Index access |
| `s[a:b]` | $O(b-a)$ | Slice creates new string |
| `len(s)` | $O(1)$ | Stored attribute |
| `s + t` | $O(n+m)$ | Creates new string |
| `s * k` | $O(n \cdot k)$ | Creates new string |
| `x in s` | $O(n \cdot m)$ | Substring search |
| `s.find(x)` | $O(n \cdot m)$ | Substring search |
| `s.split()` | $O(n)$ | Creates list of strings |
| `s.join(list)` | $O(n)$ | $n$ = total chars in list |
| `s.replace(a, b)` | $O(n)$ | Creates new string |
| `s.lower()` / `s.upper()` | $O(n)$ | Creates new string |
| `s.strip()` | $O(n)$ | Creates new string |
| `s.startswith(x)` | $O(k)$ | $k$ = len(x) |

### String Gotchas

```python
# BAD: $O(n^2)$ - creates new string each iteration
result = ""
for char in chars:
    result += char  # Each += requires copying the previous string

# GOOD: $O(n)$ - single allocation
result = ''.join(chars)

# BAD: $O(n \cdot m)$ for each check
for word in words:
    if word in long_string:  # $O(n \cdot m)$ each time
        ...

# GOOD: Use set for multiple lookups
word_set = set(words)  # $O(\text{total chars in words})$
# Then do single pass of long_string
```

### Check yourself

1. What does this cost for a string of length `n`?

   ```python
   while s:
       s = s[1:]
   ```

2. You build a string of `n` characters. Why is `"".join(parts)` preferred over `result += ch`?

<details>
<summary>Answer</summary>

1. O(n²). Each slice copies the rest of the string, and there are n slices. Walk an index `i` instead.
2. `join` computes the final size once and copies each character once, so it's O(n). `+=` may copy the growing string each time, which is O(n²) in the worst case. CPython sometimes optimizes `+=` in place, but that isn't guaranteed.

</details>

## Deque Operations (`collections.deque`)

Deques (Double Ended Queues) are implemented as doubly-linked lists under the hood. They are optimized for fast appends and pops from both ends.

| Operation | Time | Notes |
|-----------|------|-------|
| `deque.append(x)` | $O(1)$ | Add to right |
| `deque.appendleft(x)` | $O(1)$ | Add to left |
| `deque.pop()` | $O(1)$ | Remove from right |
| `deque.popleft()` | $O(1)$ | Remove from left |
| `deque[i]` | $O(n)$ | Index access (not $O(1)$!) |
| `len(deque)` | $O(1)$ | Stored attribute |
| `deque.rotate(k)` | $O(k)$ | Rotate elements |

**When to use `deque` vs `list`:**
- Need fast append/pop from both ends? Use `deque`.
- Need fast random access by index? Use `list`.

## Heap Operations (`heapq`)

Python's `heapq` module provides an implementation of the heap queue algorithm, also known as the priority queue algorithm, natively on lists.

| Operation | Time | Notes |
|-----------|------|-------|
| `heapq.heappush(h, x)` | $O(\log n)$ | Add element |
| `heapq.heappop(h)` | $O(\log n)$ | Remove smallest |
| `heapq.heapify(list)` | $O(n)$ | Convert list to heap |
| `heapq.heappushpop(h, x)` | $O(\log n)$ | Push then pop (slightly faster than separately) |
| `heapq.nlargest(k, iter)` | $O(n \log k)$ | Get k largest |
| `heapq.nsmallest(k, iter)` | $O(n \log k)$ | Get k smallest |
| `h[0]` | $O(1)$ | Peek at smallest |

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

### Check yourself

1. You have all `n` values up front. What does `heapify(values)` cost, compared with `n` calls to `heappush`?
2. You need the 10 largest out of 10^6 numbers. Compare `heapq.nlargest(10, nums)` with `sorted(nums)[-10:]`.
3. What does `dq[len(dq) // 2]` cost on a `deque`, and why?

<details>
<summary>Answer</summary>

1. `heapify` is O(n). Pushing one at a time is O(n log n).
2. `nlargest` is O(n log k) with k = 10, which is close to linear. `sorted` is O(n log n) and builds a full sorted copy.
3. O(n). A deque is a linked list of blocks, so reaching the middle means walking from one end. Use a `list` when you need random access.

</details>

## Sorting Comparison

| Method | Time | Space | Stable? | Notes |
|--------|------|-------|---------|-------|
| `list.sort()` | $O(n \log n)$ | $O(n)$ | Yes | In-place (modifies list) |
| `sorted(iter)` | $O(n \log n)$ | $O(n)$ | Yes | Returns new list |
| `heapq.nsmallest(k, iter)` | $O(n \log k)$ | $O(k)$ | No | Best when $k \ll n$ |

## Common Patterns Summary

### $O(1)$ - Constant
```python
arr[i]              # Array access
dict[key]           # Hash lookup
set.add(x)          # Set add
len(collection)     # Length check
```

### $O(n)$ - Linear
```python
x in list           # List membership
list.copy()         # Copying
max(list)           # Finding max/min
''.join(list)       # String building
for x in collection # Iteration
```

### $O(n \log n)$ - Linearithmic
```python
sorted(list)        # Sorting
list.sort()         # In-place sort
```

### $O(n^2)$ - Quadratic (Usually avoid!)
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
| Check membership | `set` | $O(1)$ |
| Count occurrences | `collections.Counter` | $O(n)$ to build, $O(1)$ to query |
| Get k smallest/largest | `heapq.nsmallest/nlargest` | $O(n \log k)$ |
| Queue (FIFO) | `collections.deque` | $O(1)$ for both ends |
| Stack (LIFO) | `list` with append/pop | $O(1)$ |
| Sorted container | `sortedcontainers.SortedList` | $O(\log n)$ insert (3rd party) |
| Default values | `collections.defaultdict` | $O(1)$ |
| Preserve insertion order | `dict` (Python 3.7+) | $O(1)$ |

## See Also

- [Python DSA Quick Reference](../python-dsa-toolkit/) — choosing the tool
- [Python Standard Library for DSA](../python_builtins_for_leetcode/) — syntax and APIs
- [TypeScript Big O Cheatsheet](../typescript-big-o-cheatsheet/) — the same costs in TypeScript
- [Rust Big O Cheatsheet](../rust-big-o-cheatsheet/) — the same costs in Rust
