# Merge sort is a sorting algorithm based on the divide-and-conquer strategy

# 1. **Divide phase**: Recursively split the array from the midpoint,
# transforming the sorting problem of a long array into that of shorter arrays.

# 2. **Merge phase**: Stop dividing when the length of the sub-array is 1,
# start merging, and continuously combine two shorter ordered arrays into
# one longer ordered array until the process is complete.


# The following implementation is taken from hell-algo's website


def merge(nums: list[int], left: int, mid: int, right: int) -> None:
    # Create a temporary array to store the merged result
    # based on the interval [left, right]
    tmp = [0] * (right - left + 1)

    i, j, k = left, mid + 1, 0
    # While both subarrays still have elements,
    # compare and copy the smaller element into the temporary array
    while i <= mid and j <= right:
        if nums[i] <= nums[j]:
            tmp[k] = nums[i]
            i += 1  # Move the i pointer if the element in the left subarray is smaller
        else:
            tmp[k] = nums[j]
            j += 1  # Otherwise, move the j pointer
        k += 1  # kth position is filled, so increment k by 1

    # After the above loop, either the left or right subarray is empty
    # Copy the remaining elements from the non-empty subarray into the temporary array
    while i <= mid:
        tmp[k] = nums[i]
        i += 1
        k += 1
    while j <= right:
        tmp[k] = nums[j]
        j += 1
        k += 1
    # Copy the elements from the temporary array tmp back to the original array nums at the corresponding interval
    nums[left : left + len(tmp)] = tmp  # or nums[left:right+1] = tmp


def merge_sort(nums: list[int], left: int, right: int):
    """Merge sort"""
    # Termination condition
    if left >= right:
        return  # Terminate recursion when subarray length is 1
    # Partition stage
    mid = left + (right - left) // 2  # Calculate midpoint
    merge_sort(nums, left, mid)  # Recursively process the left subarray
    merge_sort(nums, mid + 1, right)  # Recursively process the right subarray
    # Merge stage
    merge(nums, left, mid, right)


# Example usage
if __name__ == "__main__":
    nums = [38, 27, 43, 3, 9, 82, 10]
    merge_sort(nums, 0, len(nums) - 1)
    print(nums)  # Output: [3, 9, 10, 27, 38, 43, 82]
