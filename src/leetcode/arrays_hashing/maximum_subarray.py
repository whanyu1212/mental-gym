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


if __name__ == "__main__":
    solution = Solution()

    assert solution.maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6
    assert solution.maxSubArray([-3, -2, -5]) == -2
    assert solution.maxSubArray([5]) == 5

    print("All Maximum Subarray tests passed.")
