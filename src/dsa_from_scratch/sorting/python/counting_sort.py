# Counting sort achieves sorting by counting the number of elements, typically applied to
# arrays of integers.


def counting_sort_naive(nums: list[int]) -> None:
    """
    Apply naive counting sort on the input list of numbers.

    Args:
        nums (list[int]): List of integers to be sorted.
    """
    # 1. Count the maximum element m in the array
    m = 0
    for num in nums:
        m = max(m, num)
    print(f"Maximum element in the array: {m}\n")
    # 2. Count the occurrence of each digit
    # counter[num] represents the occurrence of num
    counter = [0] * (m + 1)

    for num in nums:
        counter[num] += 1
    print(f"Counter array: {counter}\n")
    # 3. Traverse counter, filling each element back into the original array nums
    i = 0
    for num in range(m + 1):  # loop through index 0 to 8
        for _ in range(counter[num]):
            # There will be no execution if it is range(0)
            nums[i] = num
            print(f"Placing {num} at index {i}")
            print(f"Updated array: {nums}\n")
            i += 1


def counting_sort(nums: list[int]) -> None:
    """
    Complete implementation of counting sort that can handle objects and
    is a stable sort.

    Args:
        nums (list[int]): _description_
    """
    # 1. Count the maximum element m in the array
    m = max(nums)
    print(f"Maximum element in the array: {m}\n\n")

    # 2. Count the occurrence of each digit
    # counter[num] represents the occurrence of num
    counter = [0] * (m + 1)
    for num in nums:
        counter[num] += 1
    # 3. Calculate the prefix sum of counter, converting "occurrence count" to "tail
    # index"
    # counter[num]-1 is the last index where num appears in res
    # same idea as cumulative sum
    for i in range(m):
        counter[i + 1] += counter[i]
    print(f"Prefix sum: {counter}\n")
    # 4. Traverse nums in reverse order, placing each element into the result array res
    # Initialize the array res to record results
    n = len(nums)
    res = [0] * n
    for i in range(n - 1, -1, -1):  # reverse order
        print(f"nums[{i}]: {nums[i]}")
        num = nums[i]
        print(f"Total occurrences before {num}: {counter[num] - 1}")
        res[counter[num] - 1] = num  # Place num at the corresponding index
        print(f"Placing {num} at index {counter[num] - 1}")
        counter[num] -= (
            1  # Decrement the prefix sum by 1, getting the next index to place num
        )
        print(f"Updated prefix sum: {counter}\n")
    # Use result array res to overwrite the original array nums
    for i in range(n):
        nums[i] = res[i]


# Example Usage
if __name__ == "__main__":
    nums = [4, 2, 2, 8, 3, 3, 1]
    counting_sort_naive(nums)
    counting_sort(nums)
