# We will dissect this Quick Sort algorithm by first discussing its most important sub-routine: The O(N) partition (classic version).

# To partition A[i..j], we first choose A[i] as the pivot p.

# The remaining items (i.e., A[i+1..j]) are divided into 3 regions:

# 1. S1 = A[i+1..m] where items are ≤ p,
# 2. S2 = A[m+1..k-1] where items are ≥ p, and
# 3. Unknown = A[k..j], where items are yet to be assigned to either S1 or S2.

# This implementation is taken from neetcode's YouTube video on Quick Sort.
# print statements are added for better understanding of the algorithm


def quickSort(arr: list[int], s: int, e: int) -> list[int]:
    if e - s + 1 <= 1:
        return arr

    pivot = arr[e]
    left = s  # pointer for left side

    print(f"Sorting between indices {s} and {e}. Pivot: {pivot}")

    # Partition: elements smaller than pivot on left side
    for i in range(s, e):
        if arr[i] < pivot:
            print(f"Swapping {arr[i]} and {arr[left]}")
            tmp = arr[left]
            arr[left] = arr[i]
            arr[i] = tmp
            left += 1
            print(f"Array: {arr} after swapping")

    # Move pivot in-between left & right sides
    arr[e] = arr[left]
    arr[left] = pivot

    print(f"array: {arr} after moving pivot {pivot} to index {left}\n")

    # Quick sort left side
    quickSort(arr, s, left - 1)

    # Quick sort right side
    quickSort(arr, left + 1, e)

    return arr


if __name__ == "__main__":
    A = [29, 10, 14, 37, 13]
    print(f"Original Array: {A}\n")
    print(f"Sorted Array: {quickSort(A, 0, len(A) - 1)}")
