"""
Manual array operations.

For insert/remove, len(nums) is capacity; size is the live prefix
length. Unused slots contain None. Both operations return the new
logical size. The other helpers operate on ordinary lists of live
values.
"""

import random


def initialize_array(length: int) -> list[int | float | str | None]:
    """
    Initialize storage of capacity `length` with None values.

    None marks unused slots for the fixed-capacity examples; callers track logical
    size separately. Zero remains available as a live value.

    Args:
        length (int): Length of the array to be initialized

    Returns:
        list[int | float | str | None]: Storage filled with None
    """
    print(f"Initializing an array of length {length} with None values")
    if length < 0:
        raise ValueError("length must be nonnegative")
    return [None] * length


def random_access(nums: list[int]) -> int:
    """
    Randomly access an element in the array `nums`

    Args:
        nums (list[int]): input list of integers

    Returns:
        int: Randomly accessed element from the array
    """
    random_index = random.randint(0, len(nums) - 1)
    print(f"Randomly accessing element at index {random_index} in the array")
    random_num = nums[random_index]
    print(f"Randomly accessed element: {random_num}")
    return random_num


def insert(nums: list[int | None], num: int, index: int, size: int) -> int:
    """
    Insert into a fixed-capacity buffer; return size + 1.

    Requires 0 <= size <= capacity and 0 <= index <= size.
    A full buffer raises OverflowError rather than discarding a live value.
    Shifting costs O(size - index) time and O(1) extra space.
    """
    if not 0 <= size <= len(nums):
        raise ValueError("size must be between zero and capacity")
    if not 0 <= index <= size:
        raise IndexError("insertion index out of range")
    if size == len(nums):
        raise OverflowError("array is full")
    for i in range(size, index, -1):
        nums[i] = nums[i - 1]
    nums[index] = num
    return size + 1


def remove(nums: list[int | None], index: int, size: int) -> int:
    """Remove a live element, clear its vacated slot, and return size - 1.

    Requires 0 <= size <= capacity and 0 <= index < size.
    Shifting costs O(size - index) time and O(1) extra space.
    """
    if not 0 <= size <= len(nums):
        raise ValueError("size must be between zero and capacity")
    if not 0 <= index < size:
        raise IndexError("removal index out of range")
    for i in range(index, size - 1):
        nums[i] = nums[i + 1]
    nums[size - 1] = None
    return size - 1


def traverse(nums: list[int]) -> None:
    """
    Traverse the array `nums` and print the sum of all elements.

    Args:
        nums (list[int]): input list of integers
    """
    count = 0
    # Traverse array by index
    print("Traversing array by index")
    for i in range(len(nums)):
        count += nums[i]
    print(f"Sum of array elements: {count}")


def find(nums: list[int], target: int) -> int:
    """
    Find the index of the element `target` in the array `nums`

    Args:
        nums (list[int]): input list of integers
        target (int): element to be found in the array

    Returns:
        int: index of the element `target` in the array `nums` or -1 if not found
    """
    for i in range(len(nums)):
        if nums[i] == target:
            print(f"Element {target} found at index {i} in the array")
            return i
    print(f"Element {target} not found in the array")
    return -1


def extend(nums: list[int], enlarge: int) -> list[int]:
    """
    Extend the array `nums` by `enlarge` elements.

    Args:
        nums (list[int]): original list of integers
        enlarge (int): number of elements to be added to the array

    Returns:
        list[int]: new array after expansion
    """
    if enlarge < 0:
        raise ValueError("enlarge must be nonnegative")
    res = [0] * (len(nums) + enlarge)
    # Copy all elements from the original array to the new array
    for i in range(len(nums)):
        res[i] = nums[i]
    # Return the new array after expansion
    print(f"Extending array by {enlarge} elements")
    print(f"Updated array: {res}")
    return res
