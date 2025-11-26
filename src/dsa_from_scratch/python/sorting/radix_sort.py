# Radix sort shares the core idea with counting sort, which also sorts by counting the frequency of elements.
# Building on this, radix sort utilizes the progressive relationship between the digits of numbers,
# sorting each digit in turn to achieve the final sorted order.

from colorama import Fore, Style, init

init(autoreset=True)


def digit(num: int, exp: int) -> int:
    """Get the k-th digit of element num, where exp = 10^(k-1)"""
    # Passing exp instead of k can avoid repeated expensive exponentiation here
    return (num // exp) % 10


def counting_sort_digit(nums: list[int], exp: int):
    """Counting sort (based on nums k-th digit)"""
    # Decimal digit range is 0~9, therefore need a bucket array of length 10
    counter = [0] * 10
    n = len(nums)
    # Count the occurrence of digits 0~9
    for i in range(n):
        d = digit(nums[i], exp)  # Get the k-th digit of nums[i], noted as d
        counter[d] += 1  # Count the occurrence of digit d
    # Calculate prefix sum, converting "occurrence count" into "array index"
    for i in range(1, 10):
        counter[i] += counter[i - 1]
    # Traverse in reverse, based on bucket statistics, place each element into res
    res = [0] * n
    for i in range(n - 1, -1, -1):
        d = digit(nums[i], exp)
        j = counter[d] - 1  # Get the index j for d in the array
        res[j] = nums[i]  # Place the current element at index j
        counter[d] -= 1  # Decrease the count of d by 1
    # Use result to overwrite the original array nums
    for i in range(n):
        nums[i] = res[i]


def radix_sort(nums: list[int]):
    """Radix sort"""
    # Get the maximum element of the array, used to determine the maximum number of digits
    m = max(nums)
    # Traverse from the lowest to the highest digit
    exp = 1
    while exp <= m:
        # Perform counting sort on the k-th digit of array elements
        # k = 1 -> exp = 1
        # k = 2 -> exp = 10
        # i.e., exp = 10^(k-1)
        counting_sort_digit(nums, exp)
        exp *= 10


# Example Usage
if __name__ == "__main__":
    nums = [170, 45, 75, 90, 802, 24, 2, 66]
    print(Fore.BLUE + "Original array: " + Style.RESET_ALL, nums)
    radix_sort(nums)
    print(Fore.BLUE + "Sorted array: " + Style.RESET_ALL, nums)
