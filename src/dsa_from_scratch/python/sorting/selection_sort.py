# Given an array of N items and L = 0, Selection Sort will:
#
# 1. Find the position X of the smallest item in the range of [L...N−1],
# 2. Swap X-th item with the L-th item,
# 3. Increase the lower-bound L by 1 and repeat Step 1 until L = N-2.

# The following implementation is taken from Prof Steven Halim's Course in NUS

# Print statements are added for better understanding of the algorithm


def selection_sort(a: list) -> list:  # O(N^2) for ALL cases...
    n = len(a)
    for l in range(n - 1):
        # Select the smallest element in the interval [i,n−1] and swap it with the element at index i
        smallest = l + a[l:].index(
            min(a[l:])
        )  # BEWARE... this is O(N) not O(1)... we cannot find the smallest index of the minimum element of (N-L) items in O(1)
        a[smallest], a[l] = a[l], a[smallest]  # Python can swap variables like this
    return a


if __name__ == "__main__":
    a = [29, 10, 14, 37, 13]
    print(f"Original Array: {a}\n")
    print(f"Sorted Array: {selection_sort(a)}")
