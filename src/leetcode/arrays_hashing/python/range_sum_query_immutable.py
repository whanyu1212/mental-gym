from typing import List

# 303. Range Sum Query - Immutable
#
# Given an integer array nums, handle multiple queries of the following type:
# - sumRange(left, right): return the sum of nums[left..right], inclusive.
#
# Prefix sum idea: pad with a leading 0 so prefix[i] = sum of the first i
# elements. Then sum(left..right) = prefix[right + 1] - prefix[left], with no
# special case for left == 0. Build is O(n); each query is O(1).


class NumArray:
    def __init__(self, nums: List[int]):
        self.prefix = [0]
        for n in nums:
            self.prefix.append(self.prefix[-1] + n)

    def sumRange(self, left: int, right: int) -> int:
        return self.prefix[right + 1] - self.prefix[left]


if __name__ == "__main__":
    num_array = NumArray([-2, 0, 3, -5, 2, -1])

    assert num_array.sumRange(0, 2) == 1
    assert num_array.sumRange(2, 5) == -1
    assert num_array.sumRange(0, 5) == -3
    assert num_array.sumRange(3, 3) == -5

    print("All Range Sum Query - Immutable tests passed.")
