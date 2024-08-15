# Given an array of N items and L = 0, Selection Sort will:
#
# 1. Find the position X of the smallest item in the range of [L...N−1],
# 2. Swap X-th item with the L-th item,
# 3. Increase the lower-bound L by 1 and repeat Step 1 until L = N-2.

# The following implementation is taken from Prof Steven Halim's Course in NUS

# Print statements are added for better understanding of the algorithm


def selectionSort(A: list) -> list:  # O(N^2) for ALL cases...
    N = len(A)
    for L in range(N - 1):
        print(f"Iteration: {L}")
        smallest = L + A[L:].index(
            min(A[L:])
        )  # BEWARE... this is O(N) not O(1)... we cannot find the smallest index of the minimum element of (N-L) items in O(1)
        print(f"Index of smallest element from index {L} onwards: {smallest}")
        A[smallest], A[L] = A[L], A[smallest]  # Python can swap variables like this
        print(f"Array: {A} after swapping\n")
    return A


if __name__ == "__main__":
    A = [29, 10, 14, 37, 13]
    print(f"Original Array: {A}\n")
    print(f"Sorted Array: {selectionSort(A)}")
