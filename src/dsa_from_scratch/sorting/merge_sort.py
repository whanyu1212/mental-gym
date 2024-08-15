# Given an array of N items, Merge Sort will:

# 1. Merge each pair of individual element (which is by default, sorted) into sorted arrays of 2 elements,
# 2. Merge each pair of sorted arrays of 2 elements into sorted arrays of 4 elements,
# 3. Repeat the process...,
# 4. Final step: Merge 2 sorted arrays of N/2 elements (for simplicity of this discussion, we assume that N is even) to obtain a fully sorted array of N elements.

# The following implementation is taken from Prof Steven Halim's Course in NUS
# Print statements are added for better understanding of the algorithm


def mergeSort(A: list[int]) -> list[int]:  # O(N log N) worst case for ALL cases :)
    N = len(A)
    if N == 1:  # base case, it is trivial to sort a single element list
        return A  # just do nothing, return the list as it is

    mid = (
        N // 2
    )  # PS: The one in VisuAlgo has right sublist 1 bigger than the left sublist when N is odd
    left = A[:mid]  # from start to before mid, if N is odd, left is one less than right
    print(f"Left: {left}")
    right = A[mid:]  # from mid to end
    print(f"Right: {right}")
    print("\n")
    print(f"Sorting left sublist: {left}")
    left_sorted = mergeSort(left)  # recursively sort the left sublist
    assert (
        left_sorted == left
    )  # left is directly modified to its sorted version, so we do not need to assign the result into variable left
    print(f"Sorting right sublist: {right}")
    mergeSort(right)  # recursively sort the right sublist

    i, j, k = 0, 0, 0
    while i < len(left) and j < len(right):  # both left and right not empty
        print(f"Comparing {left[i]} with {right[j]}")
        if left[i] <= right[j]:
            A[k] = left[i]  # take from left
            print(f"Array: {A} after taking {left[i]} from left\n")
            i += 1
        else:
            A[k] = right[j]  # take from right
            print(f"Array: {A} after taking {right[j]} from right\n")
            j += 1
        k += 1

    while i < len(left):  # has leftover from left (right is empty)
        A[k] = left[i]
        print(f"Array: {A} after taking {left[i]} from left\n")
        k += 1
        i += 1
    while j < len(right):  # has leftover from right (left is empty)
        A[k] = right[j]
        print(f"Array: {A} after taking {right[j]} from right\n")
        k += 1
        j += 1

    return A


if __name__ == "__main__":
    A = [29, 10, 14, 37, 13]
    print(f"Original Array: {A}\n")
    print(f"Sorted Array: {mergeSort(A)}")
    # Output: [10, 13, 14, 29, 37]
