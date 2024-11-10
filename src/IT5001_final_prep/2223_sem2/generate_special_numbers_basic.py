# Solving this problem with basic iterations
def generate_special_integers(n: int) -> list:
    """Generate a list of n special integers
    that has the form 2^i, 3^j, 5^k, where i, j, k
    are non-negative integers.

    Args:
        n (int): the number of integers in the list

    Returns:
        list: a list of n special integers
    """
    special_integers = [1]
    i = j = k = 0
    for _ in range(1, n):
        next_2 = special_integers[i] * 2
        next_3 = special_integers[j] * 3
        next_5 = special_integers[k] * 5

        smallest = min(next_2, next_3, next_5)
        special_integers.append(smallest)

        if smallest == next_2:
            i += 1
        if smallest == next_3:
            j += 1
        if smallest == next_5:
            k += 1

    return special_integers


# Example usage:
if __name__ == "__main__":
    n = 25
    special_integers = generate_special_integers(n)
    print(special_integers[-5:])  # [40, 45, 48, 50, 54]
