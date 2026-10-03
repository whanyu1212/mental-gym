from typing import List


class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:

        # Note that you cannot initialize 0
        result = [1] * len(nums)
        prefix, postfix = 1, 1

        for i in range(len(nums)):
            result[i] = prefix
            prefix *= nums[i]

        for i in range(len(nums) - 1, -1, -1):
            result[i] *= postfix
            postfix *= nums[i]

        return result


if __name__ == "__main__":
    sol = Solution()
    assert sol.productExceptSelf([1, 2, 4, 6]) == [48, 24, 12, 8]
    assert sol.productExceptSelf([-1, 2, -3, 4]) == [
        -24,
        12,
        -8,
        6,
    ]  # Test with negative numbers
    assert sol.productExceptSelf([1, 0, 3, 4]) == [0, 12, 0, 0]  # Test with one zero
    assert sol.productExceptSelf([0, 0, 1, 2]) == [
        0,
        0,
        0,
        0,
    ]  # Test with multiple zeros
    assert sol.productExceptSelf([1, 1, 1, 1]) == [1, 1, 1, 1]  # Test with all ones
    assert sol.productExceptSelf([5, 2]) == [2, 5]  # Test with two elements
    assert sol.productExceptSelf([10, 3, 5, 6, 2]) == [
        180,
        600,
        360,
        300,
        900,
    ]  # Longer list
    print("All test cases passed!")
