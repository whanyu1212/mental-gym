import heapq
from typing import List


class Solution:
    def sortColors(self, nums: List[int]) -> None:
        """Do not return anything, modify nums in-place instead."""
        heapq.heapify(nums)

        nums[:] = [heapq.heappop(nums) for _ in range(len(nums))]

    def sortColorsThreePointer(self, nums: List[int]) -> None:
        """
        Dutch National Flag algorithm: three-pointer solution.
        O(n) time, O(1) space, single pass.

        Partition array into [0s | 1s | 2s] using three pointers:
        - left: boundary for 0s (next position for a 0)
        - mid: current element being examined
        - right: boundary for 2s (next position for a 2)

        Invariants:
        - nums[0...left-1] = all 0s
        - nums[left...mid-1] = all 1s
        - nums[mid...right] = unprocessed
        - nums[right+1...end] = all 2s
        """
        left, mid, right = 0, 0, len(nums) - 1

        while mid <= right:
            if nums[mid] == 0:
                nums[left], nums[mid] = nums[mid], nums[left]
                left += 1
                mid += 1
            elif nums[mid] == 1:
                mid += 1
            else:
                nums[mid], nums[right] = nums[right], nums[mid]
                right -= 1
