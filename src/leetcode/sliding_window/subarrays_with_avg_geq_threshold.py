from typing import List


class Solution:
    def numOfSubarrays(self, arr: List[int], k: int, threshold: int) -> int:
        """
        Count sub-arrays of size k whose average is >= threshold.

        Args:
            arr: The list of integers to search.
            k: The fixed sub-array length.
            threshold: The minimum average a window must reach to count.

        Returns:
            The number of length-k windows whose average is >= threshold.
        """
        target = threshold * k  # compare sums directly, no float division
        window_sum = 0
        count = 0

        # Single unified loop: every index is treated the same way, instead
        # of special-casing the first window before the loop starts.
        for right in range(len(arr)):
            # Always add the incoming element first. This runs on every
            # iteration, including the first k-1 ones where the window
            # hasn't "filled up" yet.
            window_sum += arr[right]

            # Once the window would grow past size k, evict the element
            # that's k positions behind `right` -- that's the one that no
            # longer belongs in a size-k window ending at `right`.
            if right >= k:
                window_sum -= arr[right - k]

            # Only check the sum once the window has actually reached size
            # k for the first time (right == k - 1) or later. Before that,
            # window_sum is a partial sum, not a valid k-length window.
            if right >= k - 1 and window_sum >= target:
                count += 1

        return count


if __name__ == "__main__":
    solution = Solution()

    # Expected: 3 ([2,5,5,7,8] windows: [2,5,5]->4, [5,5,7]->5.67, [5,7,8]->6.67, ...)
    print(solution.numOfSubarrays([2, 2, 2, 2, 5, 5, 5, 8], 3, 4))

    # Expected: 6
    print(solution.numOfSubarrays([11, 13, 17, 23, 29, 31, 7, 5, 2, 3], 3, 5))

    # Expected: 5 (k=1, threshold=0 -> every single-element window passes)
    print(solution.numOfSubarrays([1, 1, 1, 1, 1], 1, 0))

    # Expected: 0 (no window reaches the threshold)
    print(solution.numOfSubarrays([1, 1, 1, 1, 1], 5, 5))
