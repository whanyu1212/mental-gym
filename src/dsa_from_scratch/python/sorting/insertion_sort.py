# Insertion sort is similar to how most people arrange a hand of poker cards.
# 1. Start with one card in your hand,
# 2. Pick the next card and insert it into its proper sorted order,
# 3. Repeat previous step for all cards.

# The following implementation is taken from Prof Steven Halim's Course in NUS
# Print statements are added for better understanding of the algorithm


def insertion_sort(nums: list[int]):
    """Insertion sort"""
    # Outer loop: sorted range is [0, i-1]
    for i in range(1, len(nums)):
        base = nums[i]
        j = i - 1
        # Inner loop: insert base into the correct position within the sorted range [0, i-1]
        while j >= 0 and nums[j] > base:
            nums[j + 1] = nums[j]  # Move nums[j] to the right by one position
            j -= 1
        nums[j + 1] = base  # Assign base to the correct position


if __name__ == "__main__":
    A = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    print(f"Original Array: {A}\n")
    print(f"Sorted Array: {insertion_sort(A)}")
    # Output: [1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]
