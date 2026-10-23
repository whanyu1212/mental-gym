from typing import List


class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:

        result = []

        # Sort the numbers first so we could apply 2 pointers technique
        nums.sort()

        # We are looking for a triple of numbers a,b,c to
        # add up to 0.

        # Terminal conditions:
        # 1. If sorted and the current a value is > 0, there is no way it adds 2 more
        # number and still = 0.
        # The triplets can never start with the current number

        for i, a in enumerate(nums):
            if a > 0:
                break

            # Duplicate happens, we skip it
            if i > 0 and a == nums[i - 1]:
                continue

            # Suppose we have a already, we just have to find b and c using 2 pointers,
            # similar to two sum ii

            left = i + 1
            r = len(nums) - 1

            while left < r:
                threesum = a + nums[left] + nums[r]
                if threesum > 0:
                    r -= 1
                elif threesum < 0:
                    left += 1
                else:
                    result.append([a, nums[left], nums[r]])
                    # now we need to move on to other possibilities within left and r
                    left += 1
                    r -= 1
                    while left < r and nums[left] == nums[left - 1]:
                        left += 1
        return result


if __name__ == "__main__":
    sol = Solution()
