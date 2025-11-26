from typing import List


class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:

        # convert it to an unordered set with unique elements
        nums_set = set(nums)
        counter = 0

        for num in nums_set:
            if num - 1 not in nums_set:
                length = 1

                while (num + length) in nums_set:
                    length += 1
                # check if we need to refresh the longest counter after tabulating the consecutive length
                counter = max(counter, length)

        return counter


if __name__ == "__main__":
    solver = Solution()
    assert solver.longestConsecutive([2, 20, 4, 10, 3, 4, 5]) == 4
    assert solver.longestConsecutive([0, 3, 2, 5, 4, 6, 1, 1]) == 7
