# The following is an implementation of a direct addressing table in Python:
# It follows the implementation from Prof Steven Halim's Visualgo.net

from typing import Union


class DirectAddressingTable:
    def __init__(self, size: int):
        """Initialize a direct addressing table with a given size.
        In direct addressing table, we are using the index as the key
        and the value will be a boolean value to indicate the presence of the key.

        Args:
            size (int): the size of the direct addressing table (preferably not too large)
        """
        self.table = [False] * size

    def insert(self, key: int) -> None:
        """Insert a key into the direct addressing table.
        Turn the value to True to indicate the presence of the key.

        Args:
            key (int): the key to be inserted
        """
        self.table[key] = True

    def delete(self, key: int) -> None:
        """Delete a key from the direct addressing table
        by setting the value to False.

        Args:
            key (int): the key to be deleted
        """
        self.table[key] = False

    def search(self, key: int) -> Union[int, None]:
        """Search for a key in the direct addressing table.

        Args:
            key (int): the key to be searched

        Returns:
            Union[int, None]: the value (1) if the key is found,
            None otherwise
        """
        return self.table[key]
