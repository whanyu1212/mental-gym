# The sliding window version of the 2-sum problem.
from typing import List


class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        # Initialize the left and right pointers
        L, R = 0, len(numbers) - 1
        while L < R:
            # Calculate the sum of the two numbers
            total = numbers[L] + numbers[R]
            if total == target:
                # Assuming we are following the 1-indexed convention
                return [L + 1, R + 1]
            elif total < target:
                L += 1
            else:
                R -= 1
        return [-1, -1]


# Example usage
if __name__ == "__main__":
    s = Solution()
    numbers = [2, 7, 11, 15]
    target = 9
    print(s.twoSum(numbers, target))  # Output is [1, 2]
