import heapq
from collections import defaultdict
from typing import List


class Solution:
    def sortArray(self, nums: List[int]) -> List[int]:
        # Approach 1: Hash Map (Dictionary) Implementation
        # return self.counting_sort_with_hashmap(nums)

        # Approach 2: Array (List) Implementation
        return self.counting_sort_with_array(nums)

        # Approach 3: Heap Sort (The "Cheat" method)
        # Pros: Very concise, O(N log N) time, works on any comparable data type.
        # Cons: Slower than counting sort for small integer ranges;
        # requires extra space for the heap.
        # return self.heap_sort(nums)

    def counting_sort_with_hashmap(self, nums: List[int]) -> List[int]:
        counter_dict = defaultdict(int)
        for num in nums:
            counter_dict[num] += 1

        min_val = min(nums)
        max_val = max(nums)

        # In-place modification to save space, though we reconstruct the list
        nums.clear()

        # Iterating through the range ensures sorted order
        for i in range(min_val, max_val + 1):
            # Check if key exists to avoid processing non-existent numbers
            # (Though in a dense range, most will exist)
            if i in counter_dict:
                count = counter_dict[i]
                for _ in range(count):
                    nums.append(i)

        return nums

    def counting_sort_with_array(self, nums: List[int]) -> List[int]:
        if not nums:
            return nums

        min_val = min(nums)
        max_val = max(nums)

        # Create a fixed-size array covering the entire range of values
        # We need (max - min + 1) slots
        range_size = max_val - min_val + 1
        count_arr = [0] * range_size

        # Count frequencies
        # Use (num - min_val) to shift negative numbers to 0-based index
        for num in nums:
            count_arr[num - min_val] += 1

        # Reconstruct the sorted array
        # We overwrite 'nums' using a write pointer for efficiency
        write_index = 0
        for i in range(range_size):
            count = count_arr[i]
            while count > 0:
                # Recover the original value by adding min_val back
                nums[write_index] = i + min_val
                write_index += 1
                count -= 1

        return nums

    def heap_sort(self, nums: List[int]) -> List[int]:
        # Convert the list into a min-heap in-place (O(N))
        heapq.heapify(nums)

        res = []
        # Repeatedly pop the smallest element (O(N log N))
        while nums:
            res.append(heapq.heappop(nums))

        return res


if __name__ == "__main__":
    solution = Solution()
    arr = [5, 2, 3, 1]
    sorted_arr = solution.sortArray(arr)
    print(f"Sorted array: {sorted_arr}")  # Output: [1, 2, 3, 5]
