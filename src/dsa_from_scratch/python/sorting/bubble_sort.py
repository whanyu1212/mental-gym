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


def bubble_sort(
    a: list[int],
) -> list[int]:
    # O(N^2) worst case (reverse sorted input), O(N) best case (sorted input)
    n = len(a)
    while n > 1:  # at most n-1 passes
        swapped = False  # initialize a boolean to check if any swap is done in the pass
        for i in range(n - 1):  # loop through the entire array
            if a[i] > a[i + 1]:
                # Python can swap variables like this, read up on tuple packing and unpacking
                a[i], a[i + 1] = a[i + 1], a[i]
                swapped = True
        if not swapped:  # optimization
            break  # The array is already sorted
        n -= 1  # we fix the last element of the array each pass
    return a


if __name__ == "__main__":
    a = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    print(f"Original Array: {a}\n")
    print(f"Sorted Array: {bubble_sort(a)}")
    # Output: [1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]
