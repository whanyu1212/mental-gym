# B.1 Smallest Sub-List to be Sorted (9 marks)
# You are given a list 𝐿 of 𝑛 items that is not sorted (that’s it, at least there is one pair of items that are
# not in their correct positions). Your job is to determine the (0-based) bounds of the smallest sub-list
# of 𝐿 to be sorted in order for the entire list 𝐿 to be fully sorted (in non-decreasing order). In fact,
# this is another potential definition of a ‘nearly sorted’ list, i.e., if the size of the smallest sub-list of 𝐿
# to be sorted is small.
# For example if the items are integers and 𝐿 = [2, 7, 8, 2, 5, 10, 15], then you should return (1, 4) as
# the answer as index 0 (2) and indices 5..6 (10 and 15) are already in their correct position but integers
# in indices 1..4 are still in the wrong order.
# For this question, the items can be of any data type, not necessarily integers, and for general
# solution, we can only determine the sorted order by comparing the items.
# Propose an algorithm (and the associated data structure(s)) that is/are needed to solve this problem and analyze its time complexity in terms of 𝑛. To score up to 6 marks, your algorithm should
# be correct and runs in 𝑂(𝑛 log 𝑛). To score full (9) marks in this section, your algorithm should be
# correct and runs in 𝑂(𝑛). If you leave the boxed space blank, you will get automatic 1 mark. There
# is no other partial marks.


def find_unsorted_subarray(arr: list) -> tuple:
    """The goal is find the smallest unsorted subarray in
    a nearly sorted array.

    Traverse from the beginning to find the first index where the order breaks.
    Traverse from the end to find the last index where the order breaks.
    Expand the subarray to include all elements that are out of order, i.e., less than the
    maximum of the left subarray or greater than the minimum of the right subarray

    Args:
        arr (list): input arr (list of items)

    Returns:
        tuple: (left bound, right bound)
    """
    n = len(arr)

    # initialize 2 pointers to traverse from both ends
    l, r = 0, n - 1

    # find the first index where the order breaks
    while l < n - 1 and arr[l] <= arr[l + 1]:
        l += 1
    # [2, 7, 8, 2, 5, 10, 15]
    #  the while loop breaks at index 2 (8) as 8 > 2

    # if the array is already sorted
    if l == n - 1:
        return 0, 0

    # find the last index where the order breaks
    # we traverse from the end to beginnig
    while r > 0 and arr[r] >= arr[r - 1]:
        r -= 1

    # This breaks at index 3 (2) as 8 > 2

    # Find min and max of the subarray arr[l:r+1]

    min_subarray = min(arr[l : r + 1])  # 2
    max_subarray = max(arr[l : r + 1])  # 8

    # expand the subarray to include all elements that are out of order

    # expand the left subarray
    while l >= 0 and arr[l] > min_subarray:
        l -= 1

    # expand the right subarray
    while r < n and arr[r] < max_subarray:
        r += 1

    return l + 1, r - 1
