# Binary Search

## When to Use
- Sorted array search
- "Find minimum/maximum satisfying condition" (binary search on answer)
- Search in rotated array

## Template

### Standard Binary Search
```python
def binary_search(nums: list[int], target: int) -> int:
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = l + (r - l) // 2  # avoids overflow
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1
```
**Time**: O(log n) | **Space**: O(1)

### Left Boundary (first occurrence / leftmost valid)
```python
def left_bound(nums, target):
    l, r = 0, len(nums)  # r is exclusive
    while l < r:
        mid = (l + r) // 2
        if nums[mid] < target:
            l = mid + 1
        else:
            r = mid
    return l
```

### Binary Search on Answer
```python
# "Find minimum speed such that condition holds"
def solve(piles, h):
    def feasible(speed):
        return sum(-(-p // speed) for p in piles) <= h  # ceiling division

    l, r = 1, max(piles)
    while l < r:
        mid = (l + r) // 2
        if feasible(mid):
            r = mid
        else:
            l = mid + 1
    return l
```

## Invariants to Remember
- `l <= r` → finds exact match, returns -1 if missing
- `l < r` → finds boundary; `l == r` at exit is the answer
- Always use `mid = l + (r - l) // 2` to avoid integer overflow

## Related Problems
- LeetCode 704 — Binary Search
- LeetCode 875 — Koko Eating Bananas
- LeetCode 33 — Search in Rotated Sorted Array
- LeetCode 153 — Find Minimum in Rotated Sorted Array
