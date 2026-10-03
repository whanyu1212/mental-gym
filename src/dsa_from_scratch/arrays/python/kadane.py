# Brute Force: O(n^2)
# def bruteForce(nums):
#     maxSum = nums[0]

#     for i in range(len(nums)):
#         curSum = 0
#         for j in range(i, len(nums)):
#             curSum += nums[j]
#             maxSum = max(maxSum, curSum)
#     return maxSum


def kadanes(nums: list[int]) -> int:
    """
    Finds the maximum sum of any contiguous subarray using Kadane's
    algorithm.

    The key idea is to track the best sum of a subarray ending at the
    current index (``curSum``). If that running sum ever drops below 0,
    it can only drag down future sums, so we reset it to 0 (i.e. start a
    new subarray at the current element) instead of carrying it forward.

    Args:
        nums: A list of integers (may include negative numbers).

    Returns:
        The maximum sum achievable by any contiguous subarray of nums.
    """
    maxSum = nums[0]  # best sum found so far (handles all-negative arrays)
    curSum = 0  # best sum of a subarray ending at the previous index
    for n in nums:
        # Choose whether to extend the current subarray or start a new one
        # at n. This is equivalent to: max(n, curSum + n).
        # A negative curSum is discarded because it can only reduce future sums.
        curSum = max(curSum, 0) + n
        # Update the global best whenever the current subarray beats it.
        maxSum = max(maxSum, curSum)

    return maxSum


def kadanes_subarray(nums: list[int]) -> list[int]:
    """
    Find the contiguous subarray with the maximum sum using Kadane's
    algorithm.

    Tracks the bounds of the current candidate subarray as well as the bounds
    of the best subarray found. A negative running sum is discarded because it
    cannot improve a subarray that continues from the next element.

    Args:
        nums: A non-empty list of integers.

    Returns:
        The first contiguous subarray with the maximum possible sum.
    """
    maxSum = nums[0]
    curSum = 0
    candidateStart = 0
    bestStart = 0
    bestEnd = 0

    for index, n in enumerate(nums):
        # A negative prefix cannot help future sums, so start fresh here.
        if curSum < 0:
            curSum = 0
            candidateStart = index

        curSum += n

        # Save the bounds only for a strictly better sum, retaining the first
        # maximum subarray if multiple subarrays have the same sum.
        if curSum > maxSum:
            maxSum = curSum
            bestStart = candidateStart
            bestEnd = index

    return nums[bestStart : bestEnd + 1]
