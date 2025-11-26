# Implementation of basic properties of a heap data structure such as the parent-child relationship

# Assuming the heap is stored in an array and it follows the 0-based indexing


class Heap:
    """
    A class to illustrate the basic properties of a binary heap, such as the parent-child relationship.

    This class is not a full implementation of a heap data structure. It only demonstrates how to calculate
    the indices of parent and child nodes in a heap stored in an array.

    Attributes:
        heap (list): The list representation of the heap, with a placeholder at index 0 for 1-based indexing.
    """

    def __init__(self):
        """Initialize an empty heap for illustration purposes."""
        self.heap = [0]  # Placeholder for 1-based indexing

    def left(self, i: int) -> int:
        """Get index of left child node given
        the index of the parent node.

        Args:
            i (int): index of the parent node

        Returns:
            int: index of the left child node
        """
        return 2 * i

    def right(self, i: int) -> int:
        """Get the index of the right child node given
        the index of the parent node.

        Args:
            i (int): index of the parent node

        Returns:
            int: index of the right child node
        """
        return 2 * i + 1

    def parent(self, i: int) -> int:
        """Get the index of the parent node given
        the index of the child node.

        Args:
            i (int): index of the child node

        Returns:
            int: index of the parent node
        """
        return i // 2  # floor division

    def peek(self) -> int:
        """Access the root node of the heap.

        Raises:
            IndexError: If the heap is empty or
            only index 0 is present in the heap.

        Returns:
            int: The root node of the heap
        """
        if len(self.heap) <= 1:
            raise IndexError("Heap is empty")
        return self.heap[1]


# Example usage
if __name__ == "__main__":
    heap = (
        Heap()
    )  # Initialize an empty heap, we can still access the parent-child relationship
    print(heap.left(1))  # 2
    print(heap.right(1))  # 3
    print(heap.parent(3))  # 1
    print(heap.peek())  # IndexError: Heap is empty
