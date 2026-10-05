# The following is an implementation of a direct addressing table in Python:
# It follows the implementation from Prof Steven Halim's Visualgo.net


# Limitations of DAT:
# The keys must be (or can be easily mapped to) non-negative Integer values.

# The range of keys must be small.
# The memory usage will be (insanely) large if we have (insanely) large range.

# The keys must be dense, i.e., not many gaps in the key values.
# DAT will contain too many empty (and wasted) cells otherwise.


class DirectAddressingTable:
    def __init__(self, size: int):
        """
        Initialize a direct addressing table with a given size.

        In direct addressing table, we are using the index as the key and
        the value will be a boolean value to indicate the presence of
        the key.

        Args:
            size (int): the size of the direct addressing table
                (preferably not too large)
        """
        self.table = [False] * size

    def _check_key(self, key: int) -> None:
        """
        Reject keys outside 0..size-1.

        Python lists accept negative indexes (table[-1] is the last
        slot), so without this check insert(-1) would silently mark key
        size-1.
        """
        if not 0 <= key < len(self.table):
            raise IndexError(f"key {key} out of range 0..{len(self.table) - 1}")

    def insert(self, key: int) -> None:
        """
        Insert a key into the direct addressing table.

        Turn the value to True to indicate the presence of the key.

        Args:
            key (int): the key to be inserted, in 0..size-1

        Raises:
            IndexError: if the key is out of range
        """
        self._check_key(key)
        self.table[key] = True

    def delete(self, key: int) -> None:
        """
        Delete a key from the direct addressing table by setting the
        value to False.

        Args:
            key (int): the key to be deleted, in 0..size-1

        Raises:
            IndexError: if the key is out of range
        """
        self._check_key(key)
        self.table[key] = False

    def search(self, key: int) -> bool:
        """
        Search for a key in the direct addressing table.

        Args:
            key (int): the key to be searched

        Returns:
            bool: True if the key is present. Out-of-range keys are
            never present, so they return False instead of raising.
        """
        return 0 <= key < len(self.table) and self.table[key]

    def __repr__(self) -> str:
        """
        String representation of the direct addressing table.

        Returns:
            str: the string representation of the direct addressing table
        """
        return str(self.table)


# Example usage

if __name__ == "__main__":
    dat = DirectAddressingTable(10)
    dat.insert(1)
    dat.insert(3)
    dat.insert(5)
    dat.insert(7)
    print(dat)  # [False, True, False, True, False, True, False, True, False, False]
    dat.delete(5)
    print(dat.search(3))  # True
    print(dat.search(5))  # False

    assert dat.search(-1) is False  # negative keys do not wrap around
    assert dat.search(10) is False  # out of range is simply absent
    for bad_key in (-1, 10):
        try:
            dat.insert(bad_key)
        except IndexError:
            pass
        else:
            raise AssertionError(f"insert({bad_key}) should raise IndexError")
    assert dat.table[9] is False  # insert(-1) did not touch the last slot
