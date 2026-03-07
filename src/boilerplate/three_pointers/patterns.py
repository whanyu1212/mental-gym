"""
Three-Pointer Algorithm Patterns.

This module documents common three-pointer patterns used in array
manipulation and partitioning problems.
"""


def dutch_national_flag(nums, pivot_value):
    """
    Classic three-pointer pattern: partition array around a pivot value.

    Partitions nums into [< pivot | = pivot | > pivot]

    Pattern:
    - left: boundary for values < pivot
    - mid: current element being examined
    - right: boundary for values > pivot

    Time: O(n), Space: O(1)

    Example:
        nums = [2, 0, 2, 1, 1, 0], pivot_value = 1
        Result: [0, 0, 1, 1, 2, 2]
    """
    left, mid, right = 0, 0, len(nums) - 1

    while mid <= right:
        if nums[mid] < pivot_value:
            nums[left], nums[mid] = nums[mid], nums[left]
            left += 1
            mid += 1
        elif nums[mid] == pivot_value:
            mid += 1
        else:
            nums[mid], nums[right] = nums[right], nums[mid]
            right -= 1


def sort_colors_three_values(nums):
    """
    Variation 1: Sort array with exactly three distinct values (0, 1, 2).

    Partitions nums into [0s | 1s | 2s]

    Pattern:
    - left: next position for 0
    - mid: current element
    - right: next position for 2

    Time: O(n), Space: O(1)

    Example:
        nums = [2, 0, 2, 1, 1, 0]
        Result: [0, 0, 1, 1, 2, 2]
    """
    left, mid, right = 0, 0, len(nums) - 1

    while mid <= right:
        if nums[mid] == 0:
            nums[left], nums[mid] = nums[mid], nums[left]
            left += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[right] = nums[right], nums[mid]
            right -= 1


def partition_negatives_zeros_positives(nums):
    """
    Variation 2: Partition array into [negatives | zeros | positives].

    Pattern:
    - left: boundary for negatives
    - mid: current element
    - right: boundary for positives

    Time: O(n), Space: O(1)

    Example:
        nums = [3, -1, 0, 2, -5, 0, 1]
        Result: [-1, -5, 0, 0, 3, 2, 1]
    """
    left, mid, right = 0, 0, len(nums) - 1

    while mid <= right:
        if nums[mid] < 0:
            nums[left], nums[mid] = nums[mid], nums[left]
            left += 1
            mid += 1
        elif nums[mid] == 0:
            mid += 1
        else:
            nums[mid], nums[right] = nums[right], nums[mid]
            right -= 1


def partition_even_odd_with_zeros(nums):
    """
    Variation 3: Partition into [even | zeros | odd].

    Pattern:
    - left: boundary for even numbers
    - mid: current element
    - right: boundary for odd numbers

    Time: O(n), Space: O(1)

    Example:
        nums = [3, 0, 2, 0, 1, 4]
        Result: [2, 4, 0, 0, 3, 1]
    """
    left, mid, right = 0, 0, len(nums) - 1

    while mid <= right:
        if nums[mid] % 2 == 0 and nums[mid] != 0:
            nums[left], nums[mid] = nums[mid], nums[left]
            left += 1
            mid += 1
        elif nums[mid] == 0:
            mid += 1
        else:
            nums[mid], nums[right] = nums[right], nums[mid]
            right -= 1


def partition_by_condition(nums, condition_low, condition_high):
    """
    Variation 4: Generic three-way partition based on conditions.

    Partitions nums into [low | mid | high] based on two conditions:
    - condition_low(x): elements satisfying this go to left section
    - condition_high(x): elements satisfying this go to right section
    - Elements satisfying neither go to middle section

    Pattern:
    - left: boundary for low condition
    - mid: current element
    - right: boundary for high condition

    Time: O(n), Space: O(1)

    Example:
        nums = [5, 2, 8, 1, 9, 3, 7]
        condition_low = lambda x: x < 4  # [1, 2, 3]
        condition_high = lambda x: x > 6  # [7, 8, 9]
        Result: [1, 2, 3, 5, 7, 8, 9]
    """
    left, mid, right = 0, 0, len(nums) - 1

    while mid <= right:
        if condition_low(nums[mid]):
            nums[left], nums[mid] = nums[mid], nums[left]
            left += 1
            mid += 1
        elif condition_high(nums[mid]):
            nums[mid], nums[right] = nums[right], nums[mid]
            right -= 1
        else:
            mid += 1


def move_zeros_to_middle(nums):
    """
    Variation 5: Move all zeros to middle while maintaining relative order
    of non-zeros.

    Partitions nums into [non-zeros | zeros | non-zeros]
    (But this specific variation is tricky for maintaining order)

    This is a specialized case showing limitations - maintaining relative
    order with three-pointer is harder.

    Time: O(n), Space: O(1)

    Example:
        nums = [1, 0, 3, 0, 2, 0, 4]
        Result: [1, 3, 2, 4, 0, 0, 0] (order not preserved perfectly)
    """
    pass


def partition_around_pivot_index(nums, pivot_idx):
    """
    Variation 6: Partition array around element at specific index.

    Partitions nums into [< pivot | = pivot | > pivot]
    where pivot = nums[pivot_idx]

    Pattern:
    - left: boundary for values < pivot
    - mid: current element
    - right: boundary for values > pivot

    Time: O(n), Space: O(1)

    Example:
        nums = [3, 8, 2, 5, 1, 4, 7], pivot_idx = 3
        pivot_value = 5
        Result: [3, 2, 1, 4, 5, 8, 7]
    """
    pivot_value = nums[pivot_idx]
    left, mid, right = 0, 0, len(nums) - 1

    while mid <= right:
        if nums[mid] < pivot_value:
            nums[left], nums[mid] = nums[mid], nums[left]
            left += 1
            mid += 1
        elif nums[mid] == pivot_value:
            mid += 1
        else:
            nums[mid], nums[right] = nums[right], nums[mid]
            right -= 1


def three_pointer_template(nums, classify_element):
    """
    Generic template for three-pointer partitioning.

    Args:
        nums: array to partition
        classify_element: function that returns 0, 1, or 2 for each element
            - 0: element goes to left section
            - 1: element stays in middle section
            - 2: element goes to right section

    Pattern:
    - left: boundary for class 0
    - mid: current element
    - right: boundary for class 2

    Time: O(n), Space: O(1)

    Example:
        nums = [5, 2, 8, 1, 9, 3, 7]
        classify = lambda x: 0 if x < 4 else (2 if x > 6 else 1)
        Result: [1, 2, 3, 5, 7, 8, 9]
    """
    left, mid, right = 0, 0, len(nums) - 1

    while mid <= right:
        classification = classify_element(nums[mid])

        if classification == 0:
            nums[left], nums[mid] = nums[mid], nums[left]
            left += 1
            mid += 1
        elif classification == 1:
            mid += 1
        else:
            nums[mid], nums[right] = nums[right], nums[mid]
            right -= 1


"""
Key Insights:

1. When to advance mid:
   - After swapping with left (element from left is already processed)
   - When current element is in correct middle section

2. When NOT to advance mid:
   - After swapping with right (haven't examined swapped element yet)

3. Invariants to maintain:
   - nums[0...left-1] = left section (processed)
   - nums[left...mid-1] = middle section (processed)
   - nums[mid...right] = unprocessed
   - nums[right+1...end] = right section (processed)

4. Loop condition:
   - while mid <= right (not mid < right)
   - Stop when mid crosses right (all elements processed)

5. Common use cases:
   - Sorting with limited distinct values
   - Partitioning around pivot (quicksort)
   - Segregating elements by property
   - Dutch National Flag problem variants
"""
