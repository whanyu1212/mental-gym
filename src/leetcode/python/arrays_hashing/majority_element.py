from collections import defaultdict


class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        count_dict = defaultdict(int)
        res = max_count = 0

        for num in nums:
            count_dict[num] += 1
            if max_count < count_dict[num]:
                res = num
                max_count = count_dict[num]

        return res
