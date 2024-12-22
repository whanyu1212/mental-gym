from typing import List


class Solution:
    def trap(self, height: List[int]) -> int:
        # initialize the left and right pointers
        # You only need to move 1 of the pointers at a time
        L, R = 0, len(height) - 1
        L_max, R_max = height[L], height[R]
        result = 0
        while L < R:
            if L_max < R_max:
                L += 1
                L_max = max(L_max, height[L])
                result += L_max - height[L]
            else:
                R -= 1
                R_max = max(R_max, height[R])
                result += R_max - height[R]
        return result


# Example usage
if __name__ == "__main__":
    s = Solution()
    height = [0, 2, 0, 3, 1, 0, 1, 3, 2, 1]
    print(s.trap(height))  # Output is 9
