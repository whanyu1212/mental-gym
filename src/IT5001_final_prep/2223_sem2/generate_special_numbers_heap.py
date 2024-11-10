import heapq


def generate_special_integers(n: int) -> list:
    """Generate a list of n special integers
    that has the form 2^i, 3^j, 5^k, where i, j, k
    are non-negative integers.

    Args:
        n (int): the number of integers in the list

    Returns:
        list: a list of n special integers
    """
    special_integers = []
    heap = []  # always maintain the smallest special integer at the top
    seen = set()  # keep track of the special integers that have been generated

    # Initialize the heap with the first special integer
    heapq.heappush(heap, 1)
    seen.add(1)

    for _ in range(1, n):
        smallest = heapq.heappop(heap)
        special_integers.append(smallest)

        # Generate the next special integers
        for factor in [2, 3, 5]:
            next_special = smallest * factor
            if next_special not in seen:
                heapq.heappush(heap, next_special)
                seen.add(next_special)

    return special_integers
