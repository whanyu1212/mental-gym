from typing import List


class Solution:
    def maxSubarraySumCircular(self, nums: List[int]) -> int:
        """
        Return the largest sum of a circular contiguous subarray.

        The end of the array connects to its start, so a valid subarray
        can wrap around the seam — it is any connected arc of the ring.

        Args:
            nums: A non-empty list of integers.

        Returns:
            The maximum sum among all circular contiguous subarrays.
        """

        # Intuition: on a circle, the best arc is one of two shapes.
        #
        #   (1) Non-wrapping: it lies entirely inside the array, so plain
        #       Kadane handles it — that's `globalMax`.
        #
        #   (2) Wrapping: it crosses the seam (suffix + prefix). We never
        #       compute this directly; instead we exploit the complement:
        #       a wrapped arc is exactly "the whole array minus one
        #       contiguous middle block" (the gap it leaves behind is also
        #       one connected arc). Since `total` is fixed, maximizing the
        #       kept arc == minimizing the skipped block. That's what
        #       `total - globalMin` computes.

        # State we need: best/worst subarray (current + global), and total.
        # `curMax`/`curMin` seed at 0 so the first element either starts a
        # fresh subarray or (for the min pass) is taken on its own terms.
        globalMax, globalMin = nums[0], nums[0]
        total = 0
        curMax, curMin = 0, 0

        # Single left-to-right pass, no index wrapping needed.
        for n in nums:
            # Kadane's recurrence, maximized and minimized:
            # either EXTEND the best subarray ending at the previous index
            # (cur + n), or START A NEW one at n. Equivalent forms:
            #   max(curMax + n, n)  ==  max(curMax, 0) + n
            #   min(curMin + n, n)  ==  min(curMin, 0) + n
            # (Watch out: max(0, n) would drop `cur` entirely and only
            # track the best single element — never a subarray.)
            curMax = max(curMax + n, n)
            curMin = min(curMin + n, n)
            total += n
            globalMax = max(globalMax, curMax)  # best NON-wrapping arc
            globalMin = min(globalMin, curMin)  # worst middle block to skip

        # Guard: globalMax > 0  <=>  at least one positive element.
        # If everything is <= 0, the minimum subarray is the whole array,
        # so total - globalMin == 0 — an EMPTY pick, which is invalid.
        # Otherwise, answer = better of (best straight run) vs
        # (whole ring minus its most negative chunk).
        return max(globalMax, total - globalMin) if globalMax > 0 else globalMax


if __name__ == "__main__":
    solution = Solution()

    assert solution.maxSubarraySumCircular([1, -2, 3, -2]) == 3
    assert solution.maxSubarraySumCircular([5, -3, 5]) == 10
    assert solution.maxSubarraySumCircular([-3, -2, -3]) == -2
    assert solution.maxSubarraySumCircular([1, 2, 3]) == 6
    assert solution.maxSubarraySumCircular([5]) == 5

    print("All Maximum Sum Circular Subarray tests passed.")
