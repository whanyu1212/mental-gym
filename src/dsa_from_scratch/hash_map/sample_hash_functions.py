# Desirable traits of a good hash function
# - Fast to compute, i.e., in O(1),
# - Uses as minimum slots/Hash Table size M as possible,
# - Scatter the keys into different base addresses as uniformly as possible ∈ [0..M-1],
# - Experience as minimum collisions as possible.


# Hashing string into integer
def hash_function(text: str, table_size: int) -> int:
    """
    Calculates the hash value of a string.

    Args:
      text: The input string (assumed to contain only uppercase letters).
      table_size: The size of the hash table.

    Returns:
      The hash value of the string.
    """
    hash_value = 0
    for char in text:
        hash_value = (
            hash_value * 26 + (ord(char) - ord("A") + 1)  # the +1 is to avoid 0
        ) % table_size  # Fix: added parentheses
    return hash_value


# Example usage

if __name__ == "__main__":
    text = "KY"
    table_size = 1000
    hash_value = hash_function(text, table_size)
    print(f"The hash value of '{text}' is {hash_value}")
