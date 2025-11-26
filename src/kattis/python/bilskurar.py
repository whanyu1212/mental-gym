import sys


def merge_and_count_inversion(
    nums: list[int], tmp: list[int], left: int, mid: int, right: int
) -> int:
    """A simple variation from the merge sort algorithm.
    The only difference is that we count the number of inversions
    during the merge stage.

    Args:
        nums (list[int]): input list of integers (index of the respective garage for each house in the list)
        tmp (list[int]): temporary list to store the sorted elements
        left (int): left boundary of the sort interval
        mid (int): middle index of the sort interval
        right (int): right boundary of the sort interval

    Returns:
        int: number of inversions
    """

    i, j, k = left, mid + 1, left
    inversions = 0

    while i <= mid and j <= right:
        if nums[i] <= nums[j]:
            tmp[k] = nums[i]
            i += 1
        else:
            tmp[k] = nums[j]
            j += 1
            # Assume both subarrays are sorted in ascending order
            # If nums[i] > nums[j], then nums[i] > nums[j], nums[i + 1], ..., nums[mid] as well
            inversions += mid - i + 1
        k += 1

    while i <= mid:
        tmp[k] = nums[i]
        i += 1
        k += 1

    while j <= right:
        tmp[k] = nums[j]
        j += 1
        k += 1

    # Copy the elements from the tmporary numsay tmp back
    # to the original numsay nums at the corresponding interval
    for x in range(left, right + 1):
        nums[x] = tmp[x]

    return inversions


def sort_and_count_inversion(
    nums: list[int], tmp: list[int], left: int, right: int
) -> int:
    """A recursive function to count the number of inversions in a numsay.

    Args:
        nums (list[int]): a list of index of the respective garage for each house in the list
        tmp (list[int]): temporary list to store the sorted elements
        left (int): left boundary of the sort interval
        right (int): right boundary of the sort interval

    Returns:
        int: number of inversions
    """
    if left >= right:
        return 0

    mid = left + (right - left) // 2
    inversions = 0

    inversions += sort_and_count_inversion(nums, tmp, left, mid)
    inversions += sort_and_count_inversion(nums, tmp, mid + 1, right)
    inversions += merge_and_count_inversion(nums, tmp, left, mid, right)

    return inversions


def count_intersections_efficient(house: list[int], garage: list[int]) -> int:
    """Count the number of intersections on the paths from the houses to the garages
    using a variation of the merge sort algorithm.

    Args:
        house (list[int]): list of integers representing the houses
        garage (list[int]): list of integers representing the garages

    Returns:
        int: number of intersections/inversions
    """

    # the garage and its index
    garage_position = {v: i for i, v in enumerate(garage)}

    # the index of the respective garage for each house in the list
    house_garage_index = [garage_position[h] for h in house]

    tmp = [0] * len(house_garage_index)

    return sort_and_count_inversion(
        house_garage_index, tmp, 0, len(house_garage_index) - 1
    )


if __name__ == "__main__":
    inputs = sys.stdin.readlines()
    house = [int(i) for i in inputs[1].strip().split()]
    garage = [int(i) for i in inputs[2].strip().split()]
    print(count_intersections_efficient(house, garage))
