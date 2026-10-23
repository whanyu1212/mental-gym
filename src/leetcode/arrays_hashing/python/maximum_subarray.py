from typing import List


class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        """
        Return the largest sum of a contiguous subarray.

        Args:
            nums: A non-empty list of integers.

        Returns:
            The maximum sum among all contiguous subarrays.
        """
        # Start from the first value so all-negative inputs return their
        # largest element instead of incorrectly returning 0.
        #
        # setting it to 0 might run into an edge case
        # where all the numbers in the array are neegative
        maxSum = nums[0]

        curSum = 0

        for n in nums:
            # Discard a negative running sum; it can only reduce a future sum.
            # Equivalently: choose between extending the current subarray
            # (curSum + n) or starting a new one at n: max(curSum + n, n).
            curSum = max(curSum, 0) + n

            # Keep the best contiguous-subarray sum seen anywhere so far.
            maxSum = max(curSum, maxSum)

        return maxSum


def max_subarray_elements(nums: List[int]) -> List[int]:
    """
    Follow-up: return the subarray itself, not just its sum.

    Tracks where the current candidate starts. A negative running sum is
    discarded, so the candidate restarts at the current index. The
    bounds are saved only on a strictly better sum, so the first maximum
    subarray wins ties.
    """
    maxSum = nums[0]
    curSum = 0
    candidateStart = 0
    bestStart = 0
    bestEnd = 0

    for index, n in enumerate(nums):
        if curSum < 0:
            curSum = 0
            candidateStart = index

        curSum += n

        if curSum > maxSum:
            maxSum = curSum
            bestStart = candidateStart
            bestEnd = index

    return nums[bestStart : bestEnd + 1]


if __name__ == "__main__":
    solution = Solution()

    assert solution.maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6
    assert solution.maxSubArray([-3, -2, -5]) == -2
    assert solution.maxSubArray([5]) == 5

    assert max_subarray_elements([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == [4, -1, 2, 1]
    assert max_subarray_elements([-3, -2, -5]) == [-2]
    assert max_subarray_elements([5]) == [5]

    print("All Maximum Subarray tests passed.")
