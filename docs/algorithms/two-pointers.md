# Two Pointers

## When to Use
- Sorted array / string problems
- Finding pairs, triplets with a target sum
- Removing duplicates in-place
- Palindrome checks

## Patterns

### Opposite Ends (Converging)
```python
def two_sum_sorted(nums: list[int], target: int) -> list[int]:
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s == target:
            return [l, r]
        elif s < target:
            l += 1
        else:
            r -= 1
    return []
```
**Time**: O(n) | **Space**: O(1)

### Same Direction (Fast/Slow)
```python
def remove_duplicates(nums: list[int]) -> int:
    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    return slow + 1
```
**Time**: O(n) | **Space**: O(1)

### Three Sum
```python
def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    result = []
    for i, n in enumerate(nums):
        if i > 0 and nums[i] == nums[i - 1]:
            continue  # skip duplicates
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = n + nums[l] + nums[r]
            if s == 0:
                result.append([n, nums[l], nums[r]])
                l += 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
            elif s < 0:
                l += 1
            else:
                r -= 1
    return result
```
**Time**: O(n²) | **Space**: O(1) (excluding output)

## Related Problems
- LeetCode 167 — Two Sum II
- LeetCode 15 — 3Sum
- LeetCode 11 — Container With Most Water
- LeetCode 42 — Trapping Rain Water
