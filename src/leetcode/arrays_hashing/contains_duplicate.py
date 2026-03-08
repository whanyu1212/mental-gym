from typing import List


class Solution:
    def hasDuplicate(self, nums: List[int]) -> bool:
        return len(nums) != len(set(nums))


# Example usage
if __name__ == "__main__":
    solution = Solution()
    print(solution.hasDuplicate([1, 2, 3, 1]))  # True
    print(solution.hasDuplicate([1, 2, 3, 4]))  # False
    print(solution.hasDuplicate([1, 1, 1, 3, 3, 4, 3, 2, 4, 2]))  # True
