def binary_search(arr, target):
    """
    Standard binary search implementation.

    Returns index of target if found, else -1.
    Time: O(log n)
    Space: O(1)
    """
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
