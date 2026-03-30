---
title: Two Pointer Technique
description: A systematic guide to the Two Pointer technique — opposite direction, same direction (sliding window, fast/slow), and multi-pointer variations.
category: Patterns
---

# Two Pointer Technique

The Two Pointer technique is one of the most fundamental and effective optimization strategies in algorithmic problem-solving. It typically reduces $O(n^2)$ brute-force solutions involving nested loops to $O(n)$ linear time solutions by processing the data with two indices (pointers) simultaneously.

---

## 1. Opposite Direction (Converging)

This is the classic "Two Sum" style pattern. Pointers start at opposite ends of a sorted array and move towards each other until they meet.

### The Pattern
```text
[ L ->                  <- R ]
  0  1  2  3  4  5  6  7  8  9
```

### Logical Framework
1. **Prerequisite:** Usually requires a **sorted** array.
2. **Initial State:** `left = 0`, `right = len(arr) - 1`.
3. **Condition:** While `left < right`.
4. **Movement:**
   - If `sum > target`: `right -= 1` (to decrease the sum).
   - If `sum < target`: `left += 1` (to increase the sum).

### Classic Example: Two Sum II (Sorted)
**Problem:** Find two numbers that add up to a specific target in a sorted array.

```python
def two_sum_ii(nums, target):
    l, r = 0, len(nums) - 1
    while l < r:
        curr = nums[l] + nums[r]
        if curr == target:
            return [l + 1, r + 1] # 1-indexed
        elif curr < target:
            l += 1
        else:
            r -= 1
    return []
```

**Other Applications:**
- **Valid Palindrome:** Compare `s[l]` and `s[r]`.
- **Container With Most Water:** Move the pointer pointing to the shorter line.
- **Reverse Array / String:** Swap `arr[l]` and `arr[r]`.

---

## 2. Same Direction (Sliding Window / Fast-Slow)

Pointers start at the same end and move in the same direction at different speeds or intervals.

### Variation A: Sliding Window
The "distance" between pointers represents a range or "window".

```text
[ slow ... fast ] ->
  0  1  2  3  4  5  6
```

**Logic:**
- `fast` pointer expands the window (explores new elements).
- `slow` pointer contracts the window (maintains the problem's invariant).

**Example: Longest Substring Without Repeating Characters**
```python
def length_of_longest_substring(s):
    char_map = {}
    l = 0
    res = 0
    for r in range(len(s)):
        if s[r] in char_map:
            l = max(l, char_map[s[r]] + 1)
        char_map[s[r]] = r
        res = max(res, r - l + 1)
    return res
```

---

### Variation B: Fast and Slow (Tortoise and Hare)
Commonly used in linked lists to detect cycles or find midpoints.

```text
[ S, F ] ->
[ S ] -> [ F ] ->
[   ] -> [ S ] -> [   ] -> [ F ]
```

**Logic:**
- `slow` moves 1 step at a time.
- `fast` moves 2 steps at a time.

**Example: Linked List Cycle Detection**
```python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
```

**Other Applications:**
- **Middle of Linked List:** When `fast` hits the end, `slow` is at the middle.
- **Happy Number:** Treating the number sequence as a potentially cyclic list.

---

## 3. The "Two Arrays" Variation

Pointers track indices in two different arrays to merge or compare them.

### Classic Example: Merge Sorted Arrays
```python
def merge(arr1, arr2):
    i = j = 0
    res = []
    while i < len(arr1) and j < len(arr2):
        if arr1[i] < arr2[j]:
            res.append(arr1[i])
            i += 1
        else:
            res.append(arr2[j])
            j += 1
    res.extend(arr1[i:])
    res.extend(arr2[j:])
    return res
```

**Other Applications:**
- **Intersection of Two Arrays.**
- **Is Subsequence:** Check if `s` is a subsequence of `t`.

---

## 4. Advanced: 3-Pointers and Beyond

Sometimes a problem requires more than two pointers to manage multiple boundaries.

### Example: Dutch National Flag (Sort Colors)
Sort an array of 0s, 1s, and 2s in-place.
- `low`: boundary for 0s.
- `mid`: current element being processed.
- `high`: boundary for 2s.

```python
def sort_colors(nums):
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[high], nums[mid] = nums[mid], nums[high]
            high -= 1
```

---

## Complexity Comparison

| Pattern | Time Complexity | Space Complexity | Why? |
|---------|-----------------|------------------|------|
| **Brute Force (Nested)** | $O(n^2)$ | $O(1)$ | Every pair is checked. |
| **Opposite Direction** | $O(n)$ | $O(1)$ | Each element visited at most once. |
| **Sliding Window** | $O(n)$ | $O(k)$ | `fast` and `slow` cross the array once. Space depends on window state (e.g., hash map). |
| **Fast-Slow** | $O(n)$ | $O(1)$ | Pointers move linearly. |

---

## When to use Two Pointers?

✅ **YES, if:**
- You are dealing with a **linear data structure** (array, string, linked list).
- The data is **sorted** (for opposite direction).
- You need to find a **subsequence, subarray, or pair**.
- You are trying to reduce $O(n^2)$ to $O(n)$.

❌ **NO, if:**
- The data is unsorted and sorting it would take $O(n \log n)$ which is slower than your target.
- The problem requires exploring all possible combinations that are non-linear.
- You are dealing with a non-linear structure like a Tree or Graph (use BFS/DFS).

---

## Review Questions

**Q1.** Why does the "Opposite Direction" pattern usually require a sorted array?
> **Answer.** Sorting allows us to make a logical decision about which pointer to move. If `sum < target`, we *know* that moving the `right` pointer inward will only decrease the sum further, so we *must* move the `left` pointer to increase it. Without sorting, we have no such guarantee.

**Q2.** How do you detect the start of a cycle in a linked list using two pointers?
> **Answer.** Use Floyd's Cycle-Finding Algorithm. Once `slow` and `fast` meet, reset `slow` to the `head` and keep `fast` at the meeting point. Move both at a speed of 1. The point where they meet again is the start of the cycle.

**Q3.** What is the difference between "Two Pointers" and "Sliding Window"?
> **Answer.** Sliding Window is a subset of the Same Direction two-pointer technique where the focus is on the *range* between the pointers. Two Pointers is a broader category that includes converging pointers (opposite direction) and indices in different arrays.

**Q4.** Can Two Pointers be used on a string?
> **Answer.** Yes, strings are essentially arrays of characters. Common examples include reversing a string, checking for palindromes, and finding the longest substring.
