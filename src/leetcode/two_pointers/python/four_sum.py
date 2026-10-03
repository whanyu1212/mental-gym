from typing import List


class Solution:
    def fourSum(self, nums: List[int], target: int) -> List[List[int]]:
        result = []
        # Sorting makes pointer movements predictable and puts duplicates together.
        nums.sort()
        n = len(nums)

        # Fix the first value, leaving three later positions for j, left, and right.
        for i in range(n - 3):
            # The same first value would produce the same set of quadruplets.
            if i > 0 and nums[i] == nums[i - 1]:
                continue

            # Fix the second value, leaving a pair for the two-pointer search.
            for j in range(i + 1, n - 2):
                # Skip only repeats at this j level; nums[j] may equal nums[i].
                if j > i + 1 and nums[j] == nums[j - 1]:
                    continue

                left, right = j + 1, n - 1

                while left < right:
                    four_sum = nums[i] + nums[j] + nums[left] + nums[right]

                    if four_sum < target:
                        # A larger left value is the only way to increase this sum.
                        left += 1
                    elif four_sum > target:
                        # A smaller right value is the only way to decrease this sum.
                        right -= 1
                    else:
                        result.append([nums[i], nums[j], nums[left], nums[right]])

                        # Move past this pair before skipping equal values to keep
                        # every quadruplet unique.
                        left += 1
                        right -= 1

                        while left < right and nums[left] == nums[left - 1]:
                            left += 1
                        while left < right and nums[right] == nums[right + 1]:
                            right -= 1

        return result
