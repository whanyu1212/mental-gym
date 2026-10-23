from typing import List


class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        """
        Remove duplicates from sorted nums in place.

        Return k, the number of unique values. After the function
        finishes, nums[:k] should contain the unique values in sorted
        order.
        """
        # There is no first unique value when nums is empty.
        if not nums:
            return 0

        # slow points to the last unique value written so far.
        # fast scans the next value in the sorted input.
        #
        # Example trace for nums = [1, 1, 2, 2, 3]:
        #
        # fast  nums[fast]  action                 slow  unique prefix
        #   1       1       duplicate; skip          0    [1]
        #   2       2       new; write at index 1    1    [1, 2]
        #   3       2       duplicate; skip          1    [1, 2]
        #   4       3       new; write at index 2    2    [1, 2, 3]
        #
        # Invariant: nums[:slow + 1] contains the unique values found so far.
        slow = 0

        for fast in range(1, len(nums)):
            if nums[fast] != nums[slow]:
                # Sorted order means a value differs from nums[slow] only when
                # it is the next unique value. Extend the unique prefix first,
                # then copy the value into its new position.
                slow += 1
                nums[slow] = nums[fast]

        # slow is an index, so the number of unique values is slow + 1.
        return slow + 1
