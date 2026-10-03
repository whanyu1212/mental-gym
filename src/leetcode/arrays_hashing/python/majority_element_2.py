from typing import List


class Solution:
    def majorityElement(self, nums: List[int]) -> List[int]:
        """Hash map approach: O(n) time, O(n) space."""
        d = {}
        for num in nums:
            d[num] = d.get(num, 0) + 1

        threshold = len(nums) // 3
        res = []
        for num, count in d.items():
            if count > threshold:
                res.append(num)
        return res


class SolutionBoyerMoore:
    def majorityElement(self, nums: List[int]) -> List[int]:
        """
        Boyer-Moore Voting (generalized): O(n) time, O(1) space.

        At most 2 elements can appear more than n/3 times.
        Phase 1: find up to 2 candidates by cancelling groups of 3
                  distinct elements.
        Phase 2: verify candidates actually exceed n/3.
        """
        c1, c2, count1, count2 = None, None, 0, 0

        for num in nums:
            if num == c1:
                count1 += 1
            elif num == c2:
                count2 += 1
            elif count1 == 0:
                c1, count1 = num, 1
            elif count2 == 0:
                c2, count2 = num, 1
            else:
                count1 -= 1
                count2 -= 1

        threshold = len(nums) // 3
        return [c for c in (c1, c2) if nums.count(c) > threshold]


if __name__ == "__main__":
    sol_hash = Solution()
    sol_bm = SolutionBoyerMoore()

    cases = [
        ([3, 2, 3], [3]),
        ([1], [1]),
        ([1, 2], [1, 2]),
        ([2, 2, 1, 3], [2]),
        ([1, 1, 1, 2, 2, 2, 3], [1, 2]),
        ([1, 2, 3], []),
    ]

    for nums, expected in cases:
        r1 = sorted(sol_hash.majorityElement(nums))
        r2 = sorted(sol_bm.majorityElement(nums))
        assert r1 == sorted(expected), f"Hash failed: {nums} -> {r1}"
        assert r2 == sorted(expected), f"BoyerMoore failed: {nums} -> {r2}"

    print("All test cases passed!")
