# Insertion sort is similar to how most people arrange a hand of poker cards.
# 1. Start with one card in your hand,
# 2. Pick the next card and insert it into its proper sorted order,
# 3. Repeat previous step for all cards.

# The following implementation is taken from Prof Steven Halim's Course in NUS
# Print statements are added for better understanding of the algorithm


def insertionSort(
    A: list[int],
) -> list[int]:
    # O(N^2) worst case (reverse sorted input), O(N) best case (sorted input)
    N = len(A)
    for i in range(1, N):  # O(N)
        X = A[i]  # X is the item to be inserted
        j = i - 1
        print(f"Inserting {X} into its proper sorted order")
        print(f"Comparing {X} at index {i} with {A[j]} at index {j}\n")
        while j >= 0 and A[j] > X:  # can be fast or slow
            A[j + 1] = A[j]  # make a place for X
            print(f"Array: {A} after shifting {A[j]} at index {j} to {j+1}\n")
            j -= 1
        A[j + 1] = X  # index j+1 is the insertion point
        print(f"Array: {A} after inserting {X} at index {j+1}\n")
        print(f"Array after iteration {i}: {A}\n")
        print("\n")
    return A


if __name__ == "__main__":
    A = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    print(f"Original Array: {A}\n")
    print(f"Sorted Array: {insertionSort(A)}")
    # Output: [1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]
