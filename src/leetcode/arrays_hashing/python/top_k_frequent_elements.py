from typing import List


class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        counter = {}
        for num in nums:
            counter[num] = counter.get(num, 0) + 1

        arr = []
        for num, cnt in counter.items():
            arr.append([cnt, num])

        arr.sort(reverse=True)

        result = []
        # can do [::-1] to reverse the list also
        for _, num in arr:
            if len(result) < k:
                result.append(num)
            else:
                break

        return result


if __name__ == "__main__":
    s = Solution()
    print(s.topKFrequent([1, 1, 1, 2, 2, 3], 2))  # Output: [1, 2]
    print(s.topKFrequent([1], 1))  # Output: [1]
    print(s.topKFrequent([1, 2], 2))  # Output: [1, 2]
    print(s.topKFrequent([3, 0, 1, 0], 1))  # Output: [0]
