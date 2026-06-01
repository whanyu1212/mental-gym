from typing import List


class Solution:
    def xorQueries(self, arr: List[int], queries: List[List[int]]) -> List[int]:
        # Build prefix XOR array: prefix[i] = arr[0] ^ arr[1] ^ ... ^ arr[i-1]
        # prefix[0] = 0 (identity element for XOR)
        n = len(arr)
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] ^ arr[i]

        # XOR of arr[lo..hi] = prefix[hi+1] ^ prefix[lo]
        # Because XOR is self-inverse: a^a = 0, so common prefix cancels out
        return [prefix[hi + 1] ^ prefix[lo] for lo, hi in queries]


if __name__ == "__main__":
    sol = Solution()
    assert sol.xorQueries([1, 3, 4, 8], [[0, 1], [1, 2], [0, 3], [3, 3]]) == [
        2,
        7,
        14,
        8,
    ]
    assert sol.xorQueries([4, 8], [[0, 0], [1, 1]]) == [4, 8]
    assert sol.xorQueries([0, 0, 0], [[0, 2]]) == [0]
    print("All test cases passed!")
