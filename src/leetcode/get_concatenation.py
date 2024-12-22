from typing import List


class Solution:
    def getConcatenation(self, nums: List[int]) -> List[int]:
        nums_extended = [0] * len(nums) * 2

        for i in range(len(nums)):
            nums_extended[i] = nums[i]
            nums_extended[i + len(nums)] = nums[i]

        return nums_extended


# Example usage
if __name__ == "__main__":
    solution = Solution()
    print(solution.getConcatenation([1, 2, 1]))  # [1, 2, 1, 1, 2, 1]
