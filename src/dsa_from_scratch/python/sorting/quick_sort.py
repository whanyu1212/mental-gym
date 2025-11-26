# Quick sort is a sorting algorithm based on the divide and conquer strategy,
# known for its efficiency and wide application.

# The core operation of quick sort is "pivot partitioning,"
# aiming to: select an element from the array as the "pivot,"
# move all elements smaller than the pivot to its left, and
# move elements greater than the pivot to its right.

# The following implementation is taken from hell-algo's website


def partition(nums: list[int], left: int, right: int) -> int:
    """Partition"""
    pivot = nums[left]  # Use nums[left] as the pivot by default
    i, j = left, right  # i and j are the left and right pointers

    while i < j:  # While the left and right pointers do not meet
        # Find the first element smaller than the pivot from the right
        while i < j and nums[j] >= pivot:
            j -= 1  # Search from right to left for the first element smaller than the pivot

        while i < j and nums[i] <= pivot:
            i += 1  # Search from left to right for the first element greater than the pivot

        # Swap elements if pointers have not met
        # ensures that elements are only swapped if the pointers have not crossed
        if i < j:
            nums[i], nums[j] = nums[j], nums[i]

    # Swap the pivot to the boundary between the two subarrays
    nums[left], nums[i] = nums[i], nums[left]
    return i  # Return the index of the pivot


def quick_sort(nums: list[int], left: int, right: int):
    """Quick sort"""
    # Terminate recursion when subarray length is 1
    if left >= right:
        return
    # Partition
    pivot = partition(nums, left, right)
    # Recursively process the left subarray and right subarray
    quick_sort(nums, left, pivot - 1)
    quick_sort(nums, pivot + 1, right)


if __name__ == "__main__":
    A = [29, 10, 14, 37, 13]
    print(f"Original Array: {A}\n")
    quick_sort(A, 0, len(A) - 1)
    print(f"Sorted Array: {A}")
