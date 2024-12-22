# Two Pointer Technique

The two-pointer technique is a powerful strategy used to solve a variety of problems efficiently, often improving time complexity compared to brute-force approaches. It involves using two pointers to traverse an array or list, manipulating their positions based on specific conditions.

## 1. Opposite Direction

**Scenario:** This pattern is often used in sorted arrays or lists where you need to find pairs that meet a specific condition (e.g., sum, difference, etc.).

**Logic:**

1. Initialize two pointers, one at the beginning (`left`) and one at the end (`right`) of the array.
2. Move the pointers inward based on the problem's condition. For example:
   - If the sum of the elements at the pointers is too large, decrement `right`.
   - If the sum is too small, increment `left`.

**Code Example (Python):**

```python
def two_pointer_opposite(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        if condition(arr[left], arr[right], target):  # Replace with your condition
            # Found a pair, do something
            left += 1
            right -= 1
        elif some_check(arr[left], arr[right], target):  # Adjust pointers based on check
            left += 1
        else:
            right -= 1
```

## 2. Same Direction

**Scenario:** Useful for problems involving removing duplicates, finding subarrays with specific properties, or sliding window problems.

**Logic:**

1. Initialize two pointers, both starting at the beginning of the array (`slow` and `fast`).
2. Move the pointers in the same direction, with one pointer (`fast`) usually moving faster than the other (`slow`).

**Code Example (Python):**

```python
def two_pointer_same_direction(arr):
    slow, fast = 0, 0
    while fast < len(arr):
        if condition(arr[slow], arr[fast]):  # Replace with your condition
            # Do something with arr[slow]
            slow += 1
        fast += 1
    # Do something with the remaining elements from slow to the end
```

## 3. Facing Direction

**Scenario:** Commonly used for palindrome checks or similar problems where you need to compare elements from both ends of a sequence.

**Logic:**

1. Initialize two pointers, one at the beginning (`left`) and one at the end (`right`).
2. Move the pointers towards each other until they meet or cross.

**Code Example (Python):**

```python
def two_pointer_facing(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        if condition(arr[left], arr[right]):  # Replace with your condition
            # Do something
        left += 1
        right -= 1
```

Remember to adapt the `condition` and logic based on the specific problem you are solving.
