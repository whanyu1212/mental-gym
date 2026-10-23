from typing import List


class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        """
        Check whether nums has two equal values within index distance k.

        Args:
            nums: The list of integers to search.
            k: The maximum allowed distance between the indices of a
                matching pair, inclusive.

        Returns:
            True if there exist indices i and j such that nums[i] ==
            nums[j] and abs(i - j) <= k, otherwise False.
        """
        # window holds at most the last k+1 values (indices L..R inclusive).
        # Membership in window is exactly "have I seen this value within the
        # last k positions", so a hit on nums[R] in window is a valid answer.
        window = set()
        L = 0  # left bound of the window
        for R in range(len(nums)):
            if R - L > k:
                # The window grew to k+2 elements, so the value at the OLD
                # left bound (L) just fell out of range and must leave first.
                # Removing before advancing L is what keeps the set in sync
                # with the window: nums[L] is still what's leaving, not
                # nums[L+1]. Do the increment first and you evict the wrong
                # element, and the truly-stale value lingers in the set
                # forever, causing false positives against duplicates that
                # are actually farther apart than k.
                window.remove(nums[L])
                L += 1  # left bound catches up to the shrunk window

            if nums[R] in window:
                return True

            window.add(nums[R])

        return False


if __name__ == "__main__":
    solution = Solution()

    # Expected: True (nums[0] == nums[3] == 1, |0 - 3| = 3 <= k)
    print(solution.containsNearbyDuplicate([1, 2, 3, 1], 3))

    # Expected: True (nums[2] == nums[3] == 1, |2 - 3| = 1 <= k)
    print(solution.containsNearbyDuplicate([1, 0, 1, 1], 1))

    # Expected: False (only matching pair is farther apart than k)
    print(solution.containsNearbyDuplicate([1, 2, 3, 1, 2, 3], 2))

    # Expected: False (no duplicates at all)
    print(solution.containsNearbyDuplicate([1, 2, 3, 4], 2))

    # Expected: False (k = 0 means indices must be identical, impossible for i != j)
    print(solution.containsNearbyDuplicate([1, 1], 0))

    # Expected: False (empty input)
    print(solution.containsNearbyDuplicate([], 1))
