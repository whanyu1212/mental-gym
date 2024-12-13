# 1. Opposite Direction

# Scenario:  This pattern is often used in sorted arrays or lists where you need to find pairs that meet a specific condition (e.g., sum, difference, etc.).

# Logic:

# Initialize two pointers, one at the beginning (left) and one at the end (right) of the array.
# Move the pointers inward based on the problem's condition. For example, if the sum of the elements at the pointers is too large, decrement right; if it's too small, increment left.


def two_pointer_opposite(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        if condition(arr[left], arr[right], target):  # Replace with your condition
            # Found a pair, do something
            left += 1
            right -= 1
        elif some_check(
            arr[left], arr[right], target
        ):  # Adjust pointers based on check
            left += 1
        else:
            right -= 1


# 2. Same Direction

# Scenario: Useful for problems involving removing duplicates, finding subarrays with specific properties, or sliding window problems.

# Logic:

# Initialize two pointers, both starting at the beginning of the array.
# Move the pointers in the same direction, with one pointer usually moving faster than the other.


def two_pointer_same_direction(arr):
    slow, fast = 0, 0
    while fast < len(arr):
        if condition(arr[slow], arr[fast]):  # Replace with your condition
            # Do something with arr[slow]
            slow += 1
        fast += 1
    # Do something with the remaining elements from slow to the end


# 3. Facing Direction

# Scenario:  Commonly used for palindrome checks or similar problems where you need to compare elements from both ends of a sequence.

# Logic:

# Initialize two pointers, one at the beginning (left) and one at the end (right).
# Move the pointers towards each other until they meet or cross.

def two_pointer_facing(arr):
  left, right = 0, len(arr) - 1
  while left < right:
    if condition(arr[left], arr[right]):  # Replace with your condition
      # Do something
    left += 1
    right -= 1