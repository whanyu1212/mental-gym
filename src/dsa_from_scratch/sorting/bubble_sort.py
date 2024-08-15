# Given an array of N elements, Bubble Sort will:
#
# 1. Compare a pair of adjacent items (a, b),
# 2. Swap that pair if the items are out of order (in this case, when a > b),
# 3. Repeat Step 1 and 2 until we reach the end of array
#    (the last pair is the (N-2)-th and (N-1)-th items as we use 0-based indexing),
# 4. By now, the largest item will be at the last position.
# 5. We then reduce N by 1 and repeat Step 1 until we have N = 1.

# The following implementation is taken from Prof Steven Halim's Course in NUS
# Print statements are added for better understanding of the algorithm


def bubbleSort(
    A: list[int],
) -> list[int]:
    # O(N^2) worst case (reverse sorted input), O(N) best case (sorted input)
    N = len(A)
    while N > 1:  # at most n-1 passes
        print(f"Passes left: {N}")
        swapped = False
        for i in range(N - 1):
            print(f"Comparing {A[i]} and {A[i + 1]}")
            if A[i] > A[i + 1]:
                A[i], A[i + 1] = A[i + 1], A[i]  # Python can swap variables like this
                swapped = True
            print(f"Array: {A} after swapping\n")
        if not swapped:  # optimization
            break  # The array is already sorted
        N -= 1
    return A


if __name__ == "__main__":
    A = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    print(f"Original Array: {A}\n")
    print(f"Sorted Array: {bubbleSort(A)}")
    # Output: [1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]
