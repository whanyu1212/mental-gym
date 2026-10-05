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
      text: The input string, containing only uppercase letters A-Z.
      table_size: The size of the hash table.

    Returns:
      The hash value of the string, in 0..table_size-1.

    Raises:
      ValueError: if the text contains anything other than A-Z, or the
        table size is not positive.
    """
    if table_size <= 0:
        raise ValueError("table_size must be positive")
    hash_value = 0
    for char in text:
        if not "A" <= char <= "Z":
            raise ValueError(f"only A-Z is supported, got {char!r}")
        # A=1 .. Z=26; the +1 keeps "A" from acting like a 0 digit, so
        # "A" and "AA" hash differently.
        hash_value = (hash_value * 26 + (ord(char) - ord("A") + 1)) % table_size
    return hash_value


# Example usage

if __name__ == "__main__":
    text = "KY"
    table_size = 1000
    hash_value = hash_function(text, table_size)
    print(f"The hash value of '{text}' is {hash_value}")

    assert hash_value == 11 * 26 + 25  # K = 11, Y = 25
    assert hash_function("A", 1000) != hash_function("AA", 1000)
    try:
        hash_function("ky", 1000)
    except ValueError:
        pass
    else:
        raise AssertionError("lowercase input should raise ValueError")
