# Find the length of longest subarray with the same
# value in each position: O(n)
from typing import List, Union


def longestSubarray(nums: List[Union[int, str]]) -> int:
    """Find the longest subarray with the same value in each
    position. Typical sliding window problem

    Args:
        nums (List[Union[int, str]]): a list of int or str

    Returns:
        int: length
    """
    # Initialize tracking variables
    length = 0
    L = 0

    # Move the right boundary 1 step at a time and compare L with R
    for R in range(len(nums)):
        if nums[L] != nums[R]:
            L = R
        length = max(length, R - L + 1)
    return length


# Find length of the minimum size subarray where the sum is
# greater than or equal to the target.
# Assume all values in the input are positive.
# O(n)
def shortestSubarray(nums: List[int], target: int) -> int:
    """Get the shortest subarray that the sum is
    greater of equal to the target

    Args:
        nums (List[int]): input list of integers
        target (int): taret sum

    Returns:
        int: length
    """
    L, total = 0, 0
    length = float("inf")

    for R in range(len(nums)):
        total += nums[R]
        while total >= target:
            length = min(R - L + 1, length)
            total -= nums[L]
            L += 1
    return 0 if length == float("inf") else length
