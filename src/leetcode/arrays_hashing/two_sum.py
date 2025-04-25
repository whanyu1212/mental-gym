from typing import List


class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        difference_seen = {}
        # Since we need to keep track of the index of the elements
        # we can't use a set to store the elements
        # and we need to use enumerate to keep track of the index of the
        # element in the list

        for i, element in nums:
            difference = target - element
            if difference in difference_seen:
                return [difference_seen[difference], i]
            # the key will be the element value and the value will be the index
            # because comparison with key is faster than comparison with value
            difference_seen[element] = i
        return []


# Example usage
if __name__ == "__main__":
    solution = Solution()
    print(solution.twoSum([2, 7, 11, 15], 9))  # Output: [0, 1]
    print(solution.twoSum([3, 2, 4], 6))  # Output: [1, 2]
    print(solution.twoSum([3, 3], 6))  # Output: [0, 1]
    print(solution.twoSum([1, 2, 3, 4, 5], 9))  # Output: [3, 4]
