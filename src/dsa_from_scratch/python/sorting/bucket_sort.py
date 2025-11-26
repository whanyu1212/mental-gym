## Bucket Sort
## Instead of comparison based sorting, we can use a divide and conquer approach to sort the elements.
# It involves setting up a series of ordered buckets, each corresponding to a range of data,
# and then distributing the data evenly among these buckets; each bucket is then sorted individually;
# finally, all the data are merged in the order of the buckets.

from colorama import Fore, Style, init


def bucket_sort(nums: list[float]) -> None:
    """Apply bucket sort on the input list of numbers.
    The nums is modified in-place and thus the return value is None.

    Args:
        nums (list[float]): List of numbers to be sorted.
    """
    # Initialize k = n/2 buckets, expected to allocate 2 elements per bucket
    # The number of buckets can be adjusted based on the input data distribution
    k = len(nums) // 2
    print(Fore.YELLOW + f"Number of buckets: {k}\n" + Style.RESET_ALL)

    buckets = [[] for _ in range(k)]
    # 1. Distribute array elements into various buckets
    for num in nums:
        # Input data range is [0, 1), use num * k to map to index range [0, k-1]
        i = int(num * k)
        # Add num to bucket i
        buckets[i].append(num)

    print(Fore.YELLOW + f"Buckets after distribution: {buckets}\n\n" + Style.RESET_ALL)
    # 2. Sort each bucket
    for bucket in buckets:
        # Use built-in sorting function, can also replace with other sorting algorithms
        bucket.sort()  # Timsort, O(nlogn)
        print(Fore.YELLOW + f"Sorted bucket: {bucket}\n" + Style.RESET_ALL)
    # 3. Traverse buckets to merge results
    i = 0
    # for bucket in buckets:
    #     for num in bucket:
    #         nums[i] = num
    #         i += 1

    # Flatten the buckets into a single list seems to be cleaner than loops
    flattened = [num for bucket in buckets for num in bucket]
    nums[:] = flattened


# Example Usage
if __name__ == "__main__":
    nums = [0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434]
    print(Fore.BLUE + "Original array: " + Style.RESET_ALL, nums)
    bucket_sort(nums)
    print(Fore.BLUE + "Sorted array: " + Style.RESET_ALL, nums)
