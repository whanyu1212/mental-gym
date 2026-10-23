from typing import List


class Solution:
    def maxArea(self, height: List[int]) -> int:

        left, right = 0, len(height) - 1

        max_area = 0

        while left < right:
            current_area = (right - left) * min(height[left], height[right])
            max_area = max(current_area, max_area)

            if height[left] < height[right]:
                left += 1
            else:
                right -= 1

        return max_area


if __name__ == "__main__":
    sol = Solution()
    print(sol.maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]))
