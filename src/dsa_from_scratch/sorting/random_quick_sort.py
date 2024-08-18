import random
from colorama import Fore, Style, init

init(autoreset=True)

# The following code is a simple implementation of the Quick Sort algorithm adapted from https://www.hello-algo.com/en/chapter_sorting/quick_sort/
# The code is modified to include print statements for better understanding of the algorithm


def randomized_partition(nums: list[int], left: int, right: int) -> int:
    """Randomized partitioning for optimizing Quick Sort

    Args:
        nums (list[int]): input list of integers
        left (int): left boundary of the subarray, usually 0
        right (int): right boundary of the subarray, usually len(nums) - 1

    Returns:
        int: index of the pivot
    """
    rand_index = random.randint(left, right)
    nums[left], nums[rand_index] = nums[rand_index], nums[left]

    # Use nums[left] as the pivot, as per the original function
    i, j = left, right
    while i < j:
        while i < j and nums[j] >= nums[left]:
            j -= 1  # Search from right to left for the first element smaller than the pivot
        while i < j and nums[i] <= nums[left]:
            i += 1  # Search from left to right for the first element greater than the pivot
        # Swap elements
        nums[i], nums[j] = nums[j], nums[i]

    # Swap the pivot to the boundary between the two subarrays
    nums[i], nums[left] = nums[left], nums[i]
    print(
        f"{Fore.BLUE}Array: {nums[left:right+1]} after partitioning, pivot: {nums[i]}{Style.RESET_ALL}\n"
    )
    return i  # Return the index of the pivot


def randomized_quick_sort(nums: list[int], left: int, right: int):
    """Apply randomized quick sort to the input list of integers

    Args:
        nums (list[int]): input list of integers
        left (int): left boundary of the subarray
        right (int): right boundary of the subarray
    """
    print(f"{Fore.GREEN}Sorting {nums[left:right+1]}{Style.RESET_ALL}")
    if left < right:
        pivot_index = randomized_partition(nums, left, right)
        randomized_quick_sort(nums, left, pivot_index - 1)
        randomized_quick_sort(nums, pivot_index + 1, right)


# Example Usage
if __name__ == "__main__":
    A = [29, 10, 14, 37, 13]
    print(f"Original Array: {A}\n\n")
    randomized_quick_sort(A, 0, len(A) - 1)
    print(f"Sorted Array: {A}")
