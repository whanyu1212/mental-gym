from typing import List


class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        # prefix_count maps prefix_sum → number of times it has appeared
        prefix_count = {0: 1}
        prefix_sum = 0
        count = 0

        for num in nums:
            prefix_sum += num
            # If (prefix_sum - k) was seen before, those subarrays sum to k
            count += prefix_count.get(prefix_sum - k, 0)
            prefix_count[prefix_sum] = prefix_count.get(prefix_sum, 0) + 1

        return count


if __name__ == "__main__":
    sol = Solution()
    assert sol.subarraySum([1, 1, 1], 2) == 2  # [1,1] at idx 0-1 and 1-2
    assert sol.subarraySum([1, 2, 3], 3) == 2  # [3] and [1,2]
    assert sol.subarraySum([1], 0) == 0
    assert sol.subarraySum([0, 0, 0], 0) == 6  # all subarrays
    assert sol.subarraySum([-1, -1, 1], 0) == 1  # [-1,-1,1] sums to -1+... wait
    assert sol.subarraySum([1, -1, 1, -1], 0) == 4
    print("All test cases passed!")
