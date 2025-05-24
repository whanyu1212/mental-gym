import heapq
from typing import List


class Solution:
    """
    You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position.

    Return the max sliding window.



    Example 1:

    Input: nums = [1,3,-1,-3,5,3,6,7], k = 3
    Output: [3,3,5,5,6,7]
    Explanation:
    Window position                Max
    ---------------               -----
    [1  3  -1] -3  5  3  6  7       3
    1 [3  -1  -3] 5  3  6  7       3
    1  3 [-1  -3  5] 3  6  7       5
    1  3  -1 [-3  5  3] 6  7       5
    1  3  -1  -3 [5  3  6] 7       6
    1  3  -1  -3  5 [3  6  7]      7
    Example 2:

    Input: nums = [1], k = 1
    Output: [1]


    Constraints:

    1 <= nums.length <= 105
    -104 <= nums[i] <= 104
    1 <= k <= nums.length
    """

    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:

        # Base cases when either n or k is 0 or k is 1
        n = len(nums)

        if n * k == 0:
            return []
        if k == 1:
            return nums

        heap = []
        result = []

        # Initialize heap with first k elements (first window)
        for i in range(k):
            # use negative values to simulate max heap
            heapq.heappush(heap, (-nums[i], i))

        result.append(-heap[0][0])  # Get initial maximum

        for i in range(k, n):
            print(f"i: {i}")
            heapq.heappush(heap, (-nums[i], i))
            print(f"Current window: {i-k+1} to {i}")
            print(f"Index of the current smallest: {heap[0][1]}")

            # if the current smallest is less or equal to just before the window start, pop it
            while heap[0][1] <= i - k:
                heapq.heappop(heap)

            result.append(-heap[0][0])

        return result


if __name__ == "__main__":
    solution = Solution()
    print(solution.maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3))  # [3,3,5,5,6,7]
