# Check if array contains a pair of duplicate values,
# where the two duplicates are no farther than k positions from
# eachother (i.e. arr[i] == arr[j] and abs(i - j) + 1 <= k).
from typing import List


def closeDuplicates(nums: List[int], k: int) -> bool:
    """Check if array contains a pair of duplicate values,
    where the two duplicates are no farther than k positions from
    eachother (i.e. arr[i] == arr[j] and abs(i - j) + 1 <= k).

    Args:
        nums (list): a list of integers
        k (int): window size

    Returns:
        bool: True if there are duplicates within k positions, False otherwise
    """
    window = set()  # Cur window of size <= k
    L = 0  # initialize left pointer

    for R in range(len(nums)):
        if R - L > k:  # whether its R-L or R-L+1 depends on the question
            window.remove(nums[L])
            print("Window size exceeded, removing", nums[L])
            L += 1
            print(f"Current L: {L}")
        if nums[R] in window:
            print("Found duplicate", nums[R])
            return True
        window.add(nums[R])
        print("Adding", nums[R], "to window")

    return False


def numOfSubarrays(arr: List[int], k: int, threshold: int) -> int:
    """Count the number of subarrays with window size k that
    has sum >= threshold

    Args:
        arr (List[int]): input list of integers
        k (int): window size
        threshold (int): an integer threshold

    Returns:
        int: counts of such sub arrays
    """
    res = 0  # Keep tracking of the counts
    curr_sum = sum(arr[:k])  # Initialize the current sum with the first k elements
    for L in range(len(arr) - k + 1):
        if L > 0:
            # Add rightmost element and subtract the leftmost element
            curr_sum += arr[L + k - 1] - arr[L - 1]
        if curr_sum // k >= threshold:
            res += 1
    return res


if __name__ == "__main__":
    nums = [1, 2, 3, 1]
    k = 3
    print(closeDuplicates(nums, k))

    arr = [2, 2, 2, 2, 5, 5, 5, 8]
    k = 3
    threshold = 4

    print(numOfSubarrays(arr, k, threshold))
