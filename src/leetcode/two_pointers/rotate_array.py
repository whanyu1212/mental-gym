from typing import List


class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        """
        Rotate the array to the right by ``k`` steps in-place.

        Do not return anything, modify ``nums`` in-place instead.
        """
        # =====================================================================
        # INTUITION & ALGEBRAIC FOUNDATION:
        # =====================================================================
        #
        # 1. Block Representation:
        #    Let n = len(nums), and normalize k = k % n
        #    (rotating n times is an identity).
        #    Split the array into two blocks:
        #      - X = nums[0 : n - k]    (the first n - k elements)
        #      - Y = nums[n - k : n]    (the last k elements)
        #
        #    Original array:  Array = X Y
        #    Target array:    Target = Y X   (suffix Y moves to the front)
        #
        # 2. Properties of the Reversal Operator R(·):
        #    - Involution (Self-inverse):
        #        (A^R)^R = A
        #    - Anti-distributivity over concatenation (Shoes & Socks):
        #        (A B)^R = B^R A^R
        #
        # 3. The 3-Step Reversal Algorithm:
        #    - Step 1: Reverse the entire array (X Y)^R
        #              (X Y)^R = Y^R X^R
        #              Now the blocks are in the correct relative positions
        #              (Y's elements are at the front, X's at the back),
        #              but the elements inside each block are inverted.
        #
        #    - Step 2: Reverse the first k elements (Y^R)^R
        #              (Y^R)^R X^R = Y X^R
        #              The prefix Y is now in its original, correct order.
        #
        #    - Step 3: Reverse the remaining n - k elements (X^R)^R
        #              Y (X^R)^R = Y X
        #              The suffix X is restored, yielding the rotated array.
        #
        # Complexity:
        #    - Time:  O(n) - each element is reversed/swapped at most twice.
        #    - Space: O(1) - purely in-place modifications with two pointers.
        #
        # Trace Example: nums = [1, 2, 3, 4, 5, 6, 7], k = 3
        #    n = 7, k = 3  =>  X = [1, 2, 3, 4], Y = [5, 6, 7]
        #    Step 1: reverse(0, 6) -> [7, 6, 5, 4, 3, 2, 1]  (Y^R X^R)
        #    Step 2: reverse(0, 2) -> [5, 6, 7, 4, 3, 2, 1]  (Y   X^R)
        #    Step 3: reverse(3, 6) -> [5, 6, 7, 1, 2, 3, 4]  (Y   X  )
        # =====================================================================

        k %= len(nums)

        def reverse_helper(left: int, right: int, nums: List[int]) -> None:
            while left < right:
                nums[left], nums[right] = nums[right], nums[left]
                left, right = left + 1, right - 1

        reverse_helper(0, len(nums) - 1, nums)
        reverse_helper(0, k - 1, nums)
        reverse_helper(k, len(nums) - 1, nums)


if __name__ == "__main__":
    nums = [1, 2, 3, 4, 5, 6, 7]
    k = 3
    Solution().rotate(nums, k)
    print(f"Result: {nums}")
    # Expected: [5, 6, 7, 1, 2, 3, 4]
